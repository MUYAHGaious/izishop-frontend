/**
 * Dynamic API Service
 * Intelligent API endpoint management with automatic environment detection,
 * health monitoring, and failover capabilities
 */

import EnvironmentDetector from './environment.js';
import HealthCheckService from './healthCheck.js';
import ConfigRegistry from './configRegistry.js';

class DynamicApiService {
  constructor() {
    // Core services
    this.environmentDetector = new EnvironmentDetector();
    this.healthCheck = new HealthCheckService();
    this.configRegistry = new ConfigRegistry();
    
    // State management
    this.currentEndpoint = null;
    this.availableEndpoints = [];
    this.fallbackEndpoints = [];
    this.isInitialized = false;
    this.initPromise = null;
    
    // Request management
    this.requestQueue = [];
    this.isProcessingQueue = false;
    this.maxRetries = 3;
    this.retryDelay = 1000;
    
    // Performance tracking
    this.requestCount = 0;
    this.errorCount = 0;
    this.lastRequestTime = null;
    
    // Initialize the service
    this.initPromise = this.init();
  }

  async init() {
    if (this.isInitialized) {
      return this.currentEnvironment;
    }

    console.log('🚀 Initializing Dynamic API Service...');
    
    try {
      // Step 1: Detect environment
      const environment = await this.environmentDetector.detectEnvironment();
      this.currentEnvironment = environment;
      
      // Store environment in config registry
      this.configRegistry.set('detectedEnvironment', environment, {
        ttl: 300000, // 5 minutes
        source: 'environment_detection'
      });
      
      console.log('🌍 Environment detected:', environment.type);
      
      // Step 2: Get potential endpoints for this environment
      this.availableEndpoints = environment.backends || [];
      this.fallbackEndpoints = [...this.availableEndpoints];
      
      if (this.availableEndpoints.length === 0) {
        throw new Error('No backend endpoints configured for environment');
      }
      
      console.log('🎯 Available endpoints:', this.availableEndpoints);
      
      // Step 3: Check if we have a cached active endpoint
      const cachedEndpoint = this.configRegistry.getActiveEndpoint();
      if (cachedEndpoint && this.availableEndpoints.includes(cachedEndpoint)) {
        console.log('📋 Using cached endpoint:', cachedEndpoint);
        this.currentEndpoint = cachedEndpoint;
      }
      
      // Step 4: Start health monitoring
      this.startHealthMonitoring();
      
      // Step 5: Select best endpoint (may override cached one if unhealthy)
      await this.selectBestEndpoint();
      
      // Step 6: Mark as initialized
      this.isInitialized = true;
      
      console.log('✅ Dynamic API Service initialized successfully');
      console.log('🏆 Active endpoint:', this.currentEndpoint);
      
      return environment;
      
    } catch (error) {
      console.error('❌ Failed to initialize Dynamic API Service:', error);
      
      // Fallback to basic configuration
      this.currentEndpoint = this.availableEndpoints[0] || 'https://izishop-backend.onrender.com';
      this.isInitialized = true;
      
      throw error;
    }
  }

  async selectBestEndpoint() {
    console.log('🔍 Selecting best endpoint from:', this.availableEndpoints);
    
    // Check all endpoints concurrently
    const healthPromises = this.availableEndpoints.map(url => 
      this.healthCheck.checkEndpoint(url).catch(error => ({
        url,
        healthy: false,
        error: error.message,
        responseTime: 9999
      }))
    );
    
    try {
      // Wait for all health checks (with timeout)
      const results = await Promise.allSettled(healthPromises.map(promise => 
        Promise.race([
          promise,
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Health check timeout')), 10000)
          )
        ])
      ));
      
      console.log('📊 Health check results completed');
      
      // Get healthy endpoints sorted by performance
      const healthyEndpoints = this.healthCheck.getHealthyEndpoints(this.availableEndpoints);
      
      if (healthyEndpoints.length > 0) {
        const selected = healthyEndpoints[0];
        this.currentEndpoint = selected.url;
        
        // Cache the selection
        this.configRegistry.setActiveEndpoint(this.currentEndpoint, {
          responseTime: selected.responseTime,
          healthyAlternatives: healthyEndpoints.length - 1,
          selectedReason: 'best_performance'
        });
        
        console.log('✅ Selected best endpoint:', this.currentEndpoint, `(${selected.responseTime}ms)`);
      } else {
        // No healthy endpoints - use first available as fallback
        this.currentEndpoint = this.availableEndpoints[0];
        
        this.configRegistry.setActiveEndpoint(this.currentEndpoint, {
          responseTime: null,
          selectedReason: 'fallback_only_option'
        });
        
        console.warn('⚠️ No healthy endpoints available, using fallback:', this.currentEndpoint);
      }
      
    } catch (error) {
      console.error('❌ Error during endpoint selection:', error);
      
      // Use cached endpoint or first available
      if (!this.currentEndpoint) {
        this.currentEndpoint = this.availableEndpoints[0];
      }
    }
    
    return this.currentEndpoint;
  }

  startHealthMonitoring() {
    console.log('🏥 Starting health monitoring...');
    this.healthCheck.startMonitoring(this.availableEndpoints);
    
    // Re-evaluate best endpoint periodically
    setInterval(() => {
      this.selectBestEndpoint();
    }, 60000); // Every minute
  }

  async ensureInitialized() {
    if (!this.isInitialized) {
      await this.initPromise;
    }
  }

  async request(endpoint, options = {}, requireAuth = true) {
    await this.ensureInitialized();
    
    const requestId = ++this.requestCount;
    const startTime = Date.now();
    
    console.log(`📡 API Request #${requestId}: ${endpoint}`);
    
    let lastError = null;
    let attempts = 0;
    const maxAttempts = Math.min(this.maxRetries, this.availableEndpoints.length);
    
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      attempts++;
      
      try {
        // Ensure we have a current endpoint
        if (!this.currentEndpoint) {
          await this.selectBestEndpoint();
        }
        
        // Check if circuit breaker is open for current endpoint
        if (this.healthCheck.isCircuitOpen(this.currentEndpoint)) {
          console.log(`🔒 Circuit breaker open for ${this.currentEndpoint}, trying next...`);
          this.switchToNextEndpoint();
          continue;
        }
        
        const url = `${this.currentEndpoint}${endpoint}`;
        console.log(`🌐 Attempting request to: ${url} (attempt ${attempt + 1})`);
        
        const requestOptions = {
          ...options,
          headers: {
            'Content-Type': 'application/json',
            'X-Request-ID': `req_${requestId}_${Date.now()}`,
            ...(requireAuth && this.getAccessToken() && {
              'Authorization': `Bearer ${this.getAccessToken()}`
            }),
            ...options.headers
          }
        };
        
        const response = await fetch(url, requestOptions);
        const responseTime = Date.now() - startTime;
        
        // Record performance metrics
        this.configRegistry.recordPerformanceMetric(this.currentEndpoint, 'responseTime', responseTime);
        
        console.log(`📊 Response: ${response.status} (${responseTime}ms)`);
        
        if (response.ok) {
          // Success! Update health status and return data
          this.healthCheck.updateCircuitBreaker(this.currentEndpoint, true, responseTime);
          
          console.log(`✅ Request #${requestId} successful: ${this.currentEndpoint}`);
          this.lastRequestTime = Date.now();
          
          try {
            const data = await response.json();
            return data;
          } catch (parseError) {
            console.warn('⚠️ Failed to parse JSON response:', parseError);
            return { success: true, data: null };
          }
        }
        
        // Handle specific HTTP error codes
        if (response.status >= 400 && response.status < 500) {
          // Client errors (4xx) - don't retry on other endpoints
          const errorData = await this.parseErrorResponse(response);
          const error = new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
          error.status = response.status;
          error.response = errorData;
          
          console.error(`❌ Client error (${response.status}):`, error.message);
          throw error;
        }
        
        // Server errors (5xx) - try next endpoint
        const errorData = await this.parseErrorResponse(response);
        lastError = new Error(`Server error: ${response.status} - ${errorData.message || response.statusText}`);
        lastError.status = response.status;
        lastError.response = errorData;
        
        console.warn(`⚠️ Server error on ${this.currentEndpoint}:`, lastError.message);
        
      } catch (error) {
        const responseTime = Date.now() - startTime;
        
        if (error.name === 'AbortError') {
          lastError = new Error('Request timeout');
        } else if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
          lastError = new Error('Network error - endpoint unreachable');
        } else {
          lastError = error;
        }
        
        console.warn(`❌ Request failed on ${this.currentEndpoint}:`, lastError.message);
        
        // Record failure
        this.configRegistry.recordPerformanceMetric(this.currentEndpoint, 'error', 1);
      }
      
      // Update circuit breaker for failure
      this.healthCheck.updateCircuitBreaker(this.currentEndpoint, false, Date.now() - startTime);
      
      // Try next endpoint
      this.switchToNextEndpoint();
      
      // Add delay before retry (except for last attempt)
      if (attempt < maxAttempts - 1) {
        console.log(`⏳ Retrying in ${this.retryDelay}ms...`);
        await new Promise(resolve => setTimeout(resolve, this.retryDelay));
      }
    }
    
    // All endpoints failed
    this.errorCount++;
    
    console.error(`💥 All ${attempts} attempts failed. Last error:`, lastError?.message);
    
    const error = new Error(`All API endpoints failed after ${attempts} attempts. Last error: ${lastError?.message}`);
    error.attempts = attempts;
    error.lastError = lastError;
    
    throw error;
  }

  switchToNextEndpoint() {
    const currentIndex = this.availableEndpoints.indexOf(this.currentEndpoint);
    const nextIndex = (currentIndex + 1) % this.availableEndpoints.length;
    const nextEndpoint = this.availableEndpoints[nextIndex];
    
    if (nextEndpoint !== this.currentEndpoint) {
      console.log(`🔄 Switching from ${this.currentEndpoint} to ${nextEndpoint}`);
      this.currentEndpoint = nextEndpoint;
      
      this.configRegistry.setActiveEndpoint(this.currentEndpoint, {
        switchedFrom: this.availableEndpoints[currentIndex],
        switchReason: 'failover',
        switchedAt: Date.now()
      });
    }
  }

  async parseErrorResponse(response) {
    try {
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      } else {
        const text = await response.text();
        return { message: text };
      }
    } catch (error) {
      return { message: response.statusText };
    }
  }

  // Token management
  getAccessToken() {
    return localStorage.getItem('accessToken');
  }

  setTokens(accessToken, refreshToken) {
    if (accessToken) localStorage.setItem('accessToken', accessToken);
    if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
  }

  clearTokens() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }

  // API Methods with automatic failover
  async register(userData) {
    console.log('👤 User registration request');
    return this.request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    }, false);
  }

  async login(credentials) {
    console.log('🔐 User login request');
    return this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    }, false);
  }

  async refreshToken() {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    console.log('🔄 Token refresh request');
    return this.request('/api/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refresh_token: refreshToken })
    }, false);
  }

  async getProfile() {
    console.log('👤 Get profile request');
    return this.request('/api/auth/me', {
      method: 'GET'
    }, true);
  }

  async checkEmailExists(email) {
    console.log('📧 Email availability check request');
    return this.request(`/api/auth/check-email/${encodeURIComponent(email)}`, {
      method: 'GET'
    }, false);
  }

  async checkEmailAvailability(email, options = {}) {
    return this.checkEmailExists(email);
  }

  async getProducts(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = `/products${queryString ? `?${queryString}` : ''}`;
    
    console.log('🛍️ Get products request');
    return this.request(endpoint, {
      method: 'GET'
    }, false);
  }

  async getProduct(productId) {
    console.log(`🛍️ Get product ${productId} request`);
    return this.request(`/products/${productId}`, {
      method: 'GET'
    }, false);
  }

  // Health and status methods
  getCurrentEndpoint() {
    return this.currentEndpoint;
  }

  getEnvironment() {
    return this.currentEnvironment;
  }

  getHealthStatus() {
    return this.healthCheck.getAllHealthStats();
  }

  getServiceStatus() {
    return {
      initialized: this.isInitialized,
      currentEndpoint: this.currentEndpoint,
      availableEndpoints: this.availableEndpoints,
      environment: this.currentEnvironment?.type,
      requestCount: this.requestCount,
      errorCount: this.errorCount,
      lastRequestTime: this.lastRequestTime,
      healthStats: this.healthCheck.getAllHealthStats()
    };
  }

  // Force endpoint selection (for testing/admin)
  async forceEndpoint(endpoint) {
    if (!this.availableEndpoints.includes(endpoint)) {
      throw new Error(`Endpoint ${endpoint} not in available endpoints list`);
    }
    
    console.log(`🔧 Forcing endpoint to: ${endpoint}`);
    this.currentEndpoint = endpoint;
    
    this.configRegistry.setActiveEndpoint(endpoint, {
      forced: true,
      forcedAt: Date.now()
    });
    
    return endpoint;
  }

  // Cleanup
  destroy() {
    console.log('🗑️ Destroying Dynamic API Service...');
    
    this.healthCheck.stopMonitoring();
    this.configRegistry.destroy();
    this.isInitialized = false;
    this.currentEndpoint = null;
    
    console.log('✅ Dynamic API Service destroyed');
  }
}

// Create singleton instance
const dynamicApi = new DynamicApiService();

// Export singleton for global use
export default dynamicApi;