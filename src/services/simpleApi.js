// Simple Dynamic API Service
// Automatically detects environment and routes to correct backend

class SimpleApiService {
  constructor() {
    this.currentEndpoint = null;
    this.environment = null;
    this.initPromise = this.init();
    
    console.log('🚀 Simple Dynamic API Service initializing...');
  }

  async init() {
    try {
      // Detect environment
      this.environment = this.detectEnvironment();
      
      // Set endpoint based on environment
      if (this.environment === 'development') {
        this.currentEndpoint = 'http://127.0.0.1:8000';
        console.log('🔧 Development environment detected - using local backend');
      } else {
        this.currentEndpoint = 'http://localhost:8000';
        console.log('🌍 Production environment detected - using production backend');
      }
      
      console.log(`✅ API endpoint set to: ${this.currentEndpoint}`);
      return true;
      
    } catch (error) {
      console.error('❌ Failed to initialize API service:', error);
      // Fallback to production
      this.currentEndpoint = 'http://localhost:8000';
      this.environment = 'production';
      return false;
    }
  }

  detectEnvironment() {
    const hostname = window.location.hostname;
    const port = window.location.port;
    
    // Check for local development
    if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname.endsWith('.local')) {
      return 'development';
    }
    
    // Check for development ports
    if (port && ['3000', '4028', '5173', '8080', '3001', '4000', '5000'].includes(port)) {
      return 'development';
    }
    
    // Check environment variables
    if (import.meta.env?.MODE === 'development' || import.meta.env?.NODE_ENV === 'development') {
      return 'development';
    }
    
    // Default to production
    return 'production';
  }

  async ensureInitialized() {
    await this.initPromise;
  }

  getCurrentEndpoint() {
    return this.currentEndpoint;
  }

  getEnvironment() {
    return this.environment;
  }

  // Make API request with automatic endpoint
  async request(endpoint, options = {}) {
    await this.ensureInitialized();
    
    const url = `${this.currentEndpoint}${endpoint}`;
    console.log(`📡 API Request: ${url}`);
    
    // Add default headers
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };
    
    // Add auth token if available
    const token = localStorage.getItem('accessToken');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    try {
      const response = await fetch(url, {
        ...options,
        headers
      });
      
      console.log(`📊 Response: ${response.status}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      
      return await response.json();
      
    } catch (error) {
      console.error(`❌ API Request failed:`, error);
      throw error;
    }
  }

  // Authentication methods
  async register(userData) {
    return this.request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  }

  async login(credentials) {
    return this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
  }

  async checkEmailExists(email) {
    return this.request(`/api/auth/check-email/${encodeURIComponent(email)}`, {
      method: 'GET'
    });
  }

  async checkEmailAvailability(email, options = {}) {
    return this.checkEmailExists(email);
  }

  async getProducts(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = `/products${queryString ? `?${queryString}` : ''}`;
    return this.request(endpoint);
  }

  async testConnection() {
    try {
      await this.request('/health');
      return true;
    } catch (error) {
      console.warn('Health check failed:', error.message);
      return false;
    }
  }
}

// Create singleton instance
const simpleApiService = new SimpleApiService();

export default simpleApiService;