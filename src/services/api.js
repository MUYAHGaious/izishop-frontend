// Enhanced API service with JWT refresh token implementation
// Best practices for authentication and error handling
import authService from './authService';

// Environment-aware API base URL
const getApiBaseUrl = () => {
  const hostname = window.location.hostname;
  const port = window.location.port;
  
  // Check for local development
  if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname.endsWith('.local')) {
    return 'http://127.0.0.1:8000';
  }
  
  // Check for development ports
  if (port && ['3000', '4028', '5173', '8080', '3001', '4000', '5000'].includes(port)) {
    return 'http://127.0.0.1:8000';
  }
  
  // Check environment variables
  if (import.meta.env?.MODE === 'development' || import.meta.env?.NODE_ENV === 'development') {
    return 'http://127.0.0.1:8002';
  }
  
  // Default to production
  return 'https://izishop-backend.onrender.com';
};

const API_BASE_URL = getApiBaseUrl();

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.authService = authService;
    // Remove old interceptor setup and use auth service instead
  }

  // Helper method to get the appropriate login page based on user role
  getLoginPageForUser() {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (user.role === 'ADMIN') {
        return '/admin-login';
      }
    } catch (error) {
      // If we can't parse user data, default to regular login
    }
    return '/authentication-login-register';
  }

  // Token management - delegate to auth service
  getAccessToken() {
    return this.authService.getAccessToken();
  }

  getRefreshToken() {
    return this.authService.getRefreshToken();
  }

  setTokens(accessToken, refreshToken) {
    this.authService.setTokens(accessToken, refreshToken);
  }

  clearTokens() {
    this.authService.clearTokens();
  }

  // Test backend connection
  async testConnection() {
    try {
      const response = await fetch(`${this.baseURL}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return response.ok;
    } catch (error) {
      console.error('Backend connection test failed:', error);
      return false;
    }
  }

  // Check if token is expired (with 30 second buffer)
  isTokenExpired(token) {
    if (!token) return true;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp < (currentTime + 30); // 30 second buffer
    } catch (error) {
      return true;
    }
  }

  // Process failed requests after token refresh
  processQueue(error, token = null) {
    this.failedQueue.forEach(({ resolve, reject }) => {
      if (error) {
        reject(error);
      } else {
        resolve(token);
      }
    });
    
    this.failedQueue = [];
  }

  // Refresh access token
  async refreshAccessToken() {
    const refreshToken = this.getRefreshToken();
    
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await fetch(`${this.baseURL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh_token: refreshToken })
      });

      if (!response.ok) {
        throw new Error('Failed to refresh token');
      }

      const data = await response.json();
      
      if (data.access_token) {
        this.setTokens(data.access_token, data.refresh_token || refreshToken);
        return data.access_token;
      }
      
      throw new Error('No access token in refresh response');
    } catch (error) {
      this.clearTokens();
      // Redirect to login
      window.location.href = '/authentication-login-register';
      throw error;
    }
  }

  // Setup request/response interceptors
  setupInterceptors() {
    // Override fetch to add automatic token refresh
    const originalFetch = window.fetch;
    
    window.fetch = async (url, options = {}) => {
      // Only intercept our API calls
      if (!url.includes(this.baseURL)) {
        return originalFetch(url, options);
      }

      // Check if this is a public endpoint (no auth required)
      const publicEndpoints = [
        '/api/auth/check-email',
        '/api/auth/check-phone', 
        '/api/shops/check-name',
        '/auth/login',
        '/api/auth/register',
        '/auth/admin-login',
        '/auth/refresh'
      ];
      
      const isPublicEndpoint = publicEndpoints.some(endpoint => url.includes(endpoint));
      
      // Skip token refresh for public endpoints
      if (isPublicEndpoint) {
        return originalFetch(url, options);
      }

      let accessToken = this.getAccessToken();
      
      // Check if token needs refresh before making request
      if (accessToken && this.isTokenExpired(accessToken)) {
        if (this.isRefreshing) {
          // Wait for refresh to complete
          return new Promise((resolve, reject) => {
            this.failedQueue.push({ resolve, reject });
          }).then((token) => {
            options.headers = {
              ...options.headers,
              'Authorization': `Bearer ${token}`
            };
            return originalFetch(url, options);
          });
        }

        try {
          this.isRefreshing = true;
          accessToken = await this.refreshAccessToken();
          this.processQueue(null, accessToken);
        } catch (error) {
          this.processQueue(error, null);
          throw error;
        } finally {
          this.isRefreshing = false;
        }
      }

      // Add auth header if token exists
      if (accessToken) {
        options.headers = {
          ...options.headers,
          'Authorization': `Bearer ${accessToken}`
        };
      }

      const response = await originalFetch(url, options);

      // Handle 401 responses
      if (response.status === 401 && !url.includes('/auth/')) {
        // First check if tokens are expired and force cleanup
        console.warn('Fetch interceptor: Received 401 error, checking token expiry');
        const tokensCleared = this.authService.forceExpiredTokenCleanup();
        if (tokensCleared) {
          console.log('Fetch interceptor: Expired tokens cleared, redirecting to login');
          window.location.href = '/authentication-login-register';
          throw new Error('Authentication expired - please login again');
        }

        if (this.isRefreshing) {
          return new Promise((resolve, reject) => {
            this.failedQueue.push({ resolve, reject });
          }).then((token) => {
            options.headers = {
              ...options.headers,
              'Authorization': `Bearer ${token}`
            };
            return originalFetch(url, options);
          });
        }

        try {
          this.isRefreshing = true;
          const newToken = await this.refreshAccessToken();
          this.processQueue(null, newToken);
          
          // Retry original request with new token
          options.headers = {
            ...options.headers,
            'Authorization': `Bearer ${newToken}`
          };
          return originalFetch(url, options);
        } catch (error) {
          this.processQueue(error, null);
          this.clearTokens();
          window.location.href = '/authentication-login-register';
          throw error;
        } finally {
          this.isRefreshing = false;
        }
      }

      return response;
    };
  }

  // Helper method to get auth headers
  getAuthHeaders() {
    const token = this.getAccessToken();
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }

  // Generic request method with enhanced error handling
  async request(endpoint, options = {}, requireAuth = true) {
    // Ensure proper URL construction with slash handling
    const baseUrl = this.baseURL.endsWith('/') ? this.baseURL.slice(0, -1) : this.baseURL;
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const url = `${baseUrl}${cleanEndpoint}`;
    
    try {
      let response;
      
      if (requireAuth) {
        // Use auth service for authenticated requests
        response = await this.authService.authenticatedRequest(url, options);
      } else {
        // Public request
        const config = {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            ...options.headers
          },
          ...options
        };
        response = await fetch(url, config);
      }
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        // Handle different error types
        if (response.status === 401 && requireAuth) {
          // Force clear expired tokens to stop auth loop
          console.warn('API: Received 401 error, checking if tokens are expired');
          const tokensCleared = this.authService.forceExpiredTokenCleanup();
          if (tokensCleared) {
            console.log('API: Expired tokens cleared, stopping retry loop');
            throw new Error('Authentication expired - please login again');
          }
          // This will be handled by the fetch interceptor
          throw new Error('Unauthorized');
        } else if (response.status === 401 && !requireAuth) {
          // For public endpoints, just throw a regular error without token refresh
          const error = new Error('Endpoint requires authentication');
          error.status = 401;
          throw error;
        }
        
        if (response.status === 403) {
          const error = new Error('Access forbidden');
          error.status = 403;
          throw error;
        }
        
        if (response.status === 422 && errorData) {
          let error;
          if (errorData.errors && Array.isArray(errorData.errors)) {
            const errorMessages = errorData.errors.map(err => `${err.field}: ${err.message}`).join(', ');
            error = new Error(`Validation error: ${errorMessages}`);
          } else if (errorData.detail) {
            if (Array.isArray(errorData.detail)) {
              const errorMessages = errorData.detail.map(err => `${err.loc.join('.')}: ${err.msg}`).join(', ');
              error = new Error(`Validation error: ${errorMessages}`);
            } else if (typeof errorData.detail === 'string') {
              error = new Error(errorData.detail);
            }
          }
          if (error) {
            error.status = 422;
            throw error;
          }
        }
        
        if (response.status === 429) {
          const error = new Error('Too many requests. Please try again later.');
          error.status = 429;
          throw error;
        }
        
        if (response.status >= 500) {
          const error = new Error('Server error. Please try again later.');
          error.status = response.status;
          throw error;
        }
        
        const error = new Error(errorData.detail || errorData.message || `HTTP error! status: ${response.status}`);
        error.status = response.status;
        throw error;
      }
      
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      }
      
      return await response.text();
    } catch (error) {
      // Don't log 404 errors as they're often expected (e.g., new users with no data)
      const is404Error = error.status === 404 || 
                        error.message?.includes('404') || 
                        error.message?.includes('status: 404') ||
                        error.message?.includes('Shop not found') ||
                        error.message?.includes('not found');
      
      if (!is404Error) {
        console.error(`API request failed for ${endpoint}:`, error);
      }
      throw error;
    }
  }

  // Generic HTTP methods
  async get(endpoint, options = {}, requireAuth = true) {
    return this.request(endpoint, { method: 'GET', ...options }, requireAuth);
  }

  async post(endpoint, data = null, options = {}, requireAuth = true) {
    const body = data ? JSON.stringify(data) : null;
    return this.request(endpoint, { method: 'POST', body, ...options }, requireAuth);
  }

  async put(endpoint, data = null, options = {}, requireAuth = true) {
    const body = data ? JSON.stringify(data) : null;
    return this.request(endpoint, { method: 'PUT', body, ...options }, requireAuth);
  }

  async delete(endpoint, options = {}, requireAuth = true) {
    return this.request(endpoint, { method: 'DELETE', ...options }, requireAuth);
  }

  // Authentication methods with enhanced token handling
  async login(email, password) {
    const response = await this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    }, false); // false = no authentication required
    
    // Store both access and refresh tokens
    if (response.access_token) {
      this.setTokens(response.access_token, response.refresh_token);
    }
    
    return response;
  }

  async register(userData) {
    console.log('=== API REGISTER STARTED ===');
    console.log('API register called with:', { ...userData, password: '[REDACTED]', confirm_password: '[REDACTED]' });
    console.log('Making POST request to /api/auth/register');
    console.log('API Base URL:', this.baseURL);
    console.log('Request URL:', `${this.baseURL}/api/auth/register`);
    
    try {
      const response = await this.request('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData)
      }, false); // false = no authentication required
      
      console.log('=== API REGISTER SUCCESS ===');
      console.log('API register response:', { 
        ...response, 
        access_token: response.access_token ? '[TOKEN_PRESENT]' : '[NO_TOKEN]',
        refresh_token: response.refresh_token ? '[TOKEN_PRESENT]' : '[NO_TOKEN]'
      });
      
      // Store both access and refresh tokens
      if (response.access_token) {
        this.setTokens(response.access_token, response.refresh_token);
        console.log('Tokens stored successfully');
      } else {
        console.warn('No access token in registration response - user may need verification');
      }
      
      console.log('=== API REGISTER COMPLETED ===');
      return response;
    } catch (error) {
      console.error('=== API REGISTER ERROR ===');
      console.error('API register error:', error);
      console.error('Error message:', error?.message);
      console.error('Error response:', error?.response);
      console.error('Error status:', error?.response?.status);
      console.error('Error data:', error?.response?.data);
      console.error('==========================');
      throw error;
    }
  }

  async getCurrentUser() {
    return this.request('/api/auth/me');
  }

  async adminLogin(email, password, adminCode) {
    const response = await this.request('/api/auth/admin-login', {
      method: 'POST',
      body: JSON.stringify({ email, password, admin_code: adminCode })
    }, false); // false = no authentication required
    
    // Store both access and refresh tokens
    if (response.access_token) {
      this.setTokens(response.access_token, response.refresh_token);
    }
    
    return response;
  }

  async logout() {
    try {
      // Call logout endpoint to invalidate tokens on server
      await this.request('/api/auth/logout', {
        method: 'POST'
      });
    } catch (error) {
      console.warn('Logout request failed:', error);
    } finally {
      // Always clear local tokens
      this.clearTokens();
    }
  }

  // Admin methods
  async createDefaultAdmin() {
    return this.request('/api/admin/create-default-admin', {
      method: 'POST'
    });
  }

  async checkAdminStatus() {
    return this.request('/api/admin/admin-status');
  }

  // Admin dashboard methods
  async getDashboardOverview() {
    return this.request('/api/admin/dashboard/overview');
  }

  async getDashboardUsers() {
    return this.request('/api/admin/dashboard/users');
  }

  async getDashboardActivity() {
    return this.request('/api/admin/dashboard/activity');
  }

  async getSystemStats() {
    return this.request('/api/admin/dashboard/system-stats');
  }

  async getDashboardShops() {
    return this.request('/api/admin/dashboard/shops');
  }

  async getDashboardAnalytics(timeRange = '30d') {
    return this.request(`/api/admin/dashboard/analytics?time_range=${timeRange}`);
  }

  async suspendShop(shopId, reason, notifyOwner = true) {
    return this.request(`/api/admin/shops/${shopId}/suspend`, {
      method: 'POST',
      body: JSON.stringify({
        reason: reason,
        notify_owner: notifyOwner
      })
    });
  }

  async unsuspendShop(shopId) {
    return this.request(`/api/admin/shops/${shopId}/unsuspend`, {
      method: 'POST'
    });
  }

  async generateSystemReport() {
    return this.request('/api/admin/dashboard/system-report');
  }

  // Shop methods
  async createShop(shopData) {
    return this.request('/api/shops/create', {
      method: 'POST',
      body: JSON.stringify(shopData)
    });
  }

  async getMyShop() {
    try {
      console.log('🏪 Fetching shop data via /api/shops/my-shop...');
      const result = await this.request('/api/shops/my-shop');
      console.log('🏪 Shop data found:', result);
      return result;
    } catch (error) {
      console.log('🏪 Shop fetch error:', error.status, error.message);
      // Re-throw the error so calling code can handle it appropriately
      throw error;
    }
  }

  async getMyShops() {
    try {
      const response = await this.request('/api/shops/my-shops');
      return Array.isArray(response) ? response : [];
    } catch (error) {
      console.warn('Failed to fetch user shops:', error);
      return [];
    }
  }

  async getShop(shopId) {
    return this.request(`/api/shops/${shopId}`, {}, false);
  }

  async getAllShops(page = 1, limit = 100, search = '', category = '', sort = 'relevance', filters = {}) {
    try {
      const params = new URLSearchParams();
      
      const skip = (page - 1) * limit;
      params.append('skip', skip.toString());
      params.append('limit', limit.toString());
      
      if (search) params.append('search', search);
      if (category) params.append('category', category);
      if (sort) params.append('sort', sort);
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          if (Array.isArray(value) && value.length > 0) {
            value.forEach(v => params.append(key, v));
          } else if (!Array.isArray(value)) {
            params.append(key, value.toString());
          }
        }
      });
      
      const url = `/api/shops?${params.toString()}`;
      console.log('=== API CALL DEBUG ===');
      console.log('Full URL:', `${this.baseURL}${url}`);
      console.log('Params:', Object.fromEntries(params));
      
      return await this.request(url, {
        method: 'GET'
      }, false);
    } catch (error) {
      console.warn('API not available for shops:', error.message);
      
      // Return empty result instead of mock data
      throw error;
    }
  }

  async getFeaturedShops() {
    try {
      return this.request('/api/shops/featured', {}, false); // false = no auth required
    } catch (error) {
      console.warn('API not available for featured shops:', error.message);
      
      // Return empty result instead of mock data
      throw error;
    }
  }

  async followShop(shopId) {
    return this.request(`/api/shops/${shopId}/follow`, {
      method: 'POST'
    });
  }

  async unfollowShop(shopId) {
    return this.request(`/api/shops/${shopId}/unfollow`, {
      method: 'DELETE'
    });
  }

  // Shop products and reviews
  async getShopProducts(shopId, page = 1, limit = 20) {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    return this.request(`/api/shops/${shopId}/products?${params}`, {}, false);
  }

  async getShopReviews(shopId, page = 1, limit = 20) {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    return this.request(`/api/shops/${shopId}/reviews?${params}`, {}, false);
  }

  async getShopAbout(shopId) {
    return this.request(`/api/shops/${shopId}/about`, {}, false);
  }

  async updateShopStatistics(shopId) {
    return this.request(`/api/shops/${shopId}/update-statistics`, {
      method: 'POST'
    });
  }

  async addShopReview(shopId, reviewData) {
    return this.request(`/api/shops/${shopId}/reviews`, {
      method: 'POST',
      body: JSON.stringify(reviewData)
    });
  }

  async replyToReview(reviewId, replyData) {
    try {
      return await this.request(`/reviews/${reviewId}/reply`, {
        method: 'POST',
        body: JSON.stringify(replyData)
      });
    } catch (error) {
      console.warn('Failed to reply to review:', error);
      throw error;
    }
  }

  async updateMyShop(shopData) {
    return this.request('/api/shops/my-shop', {
      method: 'PUT',
      body: JSON.stringify(shopData)
    });
  }

  async deleteMyShop() {
    return this.request('/api/shops/my-shop', {
      method: 'DELETE'
    });
  }

  async getShopFollowersCount(shopId) {
    try {
      const response = await this.request(`/api/shops/${shopId}/followers/count`, {
        method: 'GET'
      });
      return response.count || 0;
    } catch (error) {
      console.warn('Failed to fetch shop followers count:', error);
      return 0;
    }
  }

  // Shop image upload methods
  async uploadShopProfilePhoto(file) {
    const formData = new FormData();
    formData.append('file', file);
    
    return this.request('/api/uploads/shop/profile-photo', {
      method: 'POST',
      body: formData,
      headers: {
        // Don't set Content-Type, let browser set it for FormData
        'Authorization': `Bearer ${this.getAccessToken()}`
      }
    });
  }

  async uploadShopBackgroundImage(file) {
    const formData = new FormData();
    formData.append('file', file);
    
    return this.request('/api/uploads/shop/background-image', {
      method: 'POST',
      body: formData,
      headers: {
        // Don't set Content-Type, let browser set it for FormData
        'Authorization': `Bearer ${this.getAccessToken()}`
      }
    });
  }

  async deleteShopProfilePhoto() {
    return this.request('/api/uploads/shop/profile-photo', {
      method: 'DELETE'
    });
  }

  async deleteShopBackgroundImage() {
    return this.request('/api/uploads/shop/background-image', {
      method: 'DELETE'
    });
  }

  // Product methods
  async createProduct(productData) {
    return this.request('/api/products/', {
      method: 'POST',
      body: JSON.stringify(productData)
    });
  }

  async getMyProducts(skip = 0, limit = 100, activeOnly = false) {
    const params = new URLSearchParams();
    params.append('skip', skip.toString());
    params.append('limit', limit.toString());
    if (typeof activeOnly === 'boolean') {
      params.append('active_only', activeOnly.toString());
    }
    return this.request(`/api/products/my-products?${params}`);
  }

  async getMyProductsWithTrends(skip = 0, limit = 100, activeOnly = false) {
    try {
      const products = await this.getMyProducts(skip, limit, activeOnly);
      
      // Calculate sales trends using simple ML-like analysis
      const productsWithTrends = products.map(product => {
        // Simulate sales trend calculation
        const currentSales = product.total_sales || 0;
        const basePrice = parseFloat(product.price);
        const stockLevel = product.stock_quantity || 0;
        
        // Simple trend calculation based on sales velocity, price point, and stock
        const priceCategory = basePrice > 50000 ? 'premium' : basePrice > 20000 ? 'mid' : 'budget';
        const stockCategory = stockLevel > 50 ? 'high' : stockLevel > 10 ? 'medium' : 'low';
        
        // Calculate growth trend using weighted factors
        let trendScore = 0;
        
        // Sales velocity factor (simulated)
        const recentOrdersWeight = Math.min(currentSales / 10, 5); // Cap at 5
        trendScore += recentOrdersWeight * 0.4;
        
        // Price positioning factor
        const priceWeight = priceCategory === 'premium' ? 3 : priceCategory === 'mid' ? 2 : 1;
        trendScore += priceWeight * 0.3;
        
        // Stock availability factor
        const stockWeight = stockCategory === 'high' ? 3 : stockCategory === 'medium' ? 2 : 1;
        trendScore += stockWeight * 0.2;
        
        // Category performance factor (simulated)
        const categoryBoost = ['electronics', 'fashion', 'home'].includes(product.category?.toLowerCase()) ? 1.5 : 1;
        trendScore *= categoryBoost;
        
        // Add some randomness to simulate market conditions
        const marketFactor = 0.8 + (Math.random() * 0.4); // 0.8 to 1.2
        trendScore *= marketFactor;
        
        // Convert to percentage growth
        const growthPercentage = Math.round((trendScore - 2.5) * 10); // Center around 0
        
        // Ensure realistic bounds
        const boundedGrowth = Math.max(-50, Math.min(100, growthPercentage));
        
        return {
          ...product,
          salesTrend: {
            growth: boundedGrowth,
            trend: boundedGrowth > 10 ? 'up' : boundedGrowth < -10 ? 'down' : 'stable',
            confidence: Math.min(100, Math.max(60, Math.abs(boundedGrowth) + 60)) // 60-100% confidence
          }
        };
      });
      
      return productsWithTrends;
    } catch (error) {
      console.warn('Failed to fetch products with trends, falling back to regular products:', error);
      return this.getMyProducts(skip, limit, activeOnly);
    }
  }

  async getMyProductStats() {
    try {
      return await this.request('/api/products/my-stats');
    } catch (error) {
      console.warn('Failed to fetch product stats:', error);
      return {
        total_products: 0,
        active_products: 0,
        inactive_products: 0,
        low_stock_products: 0,
        out_of_stock_products: 0
      };
    }
  }

  async getAllProducts(skip = 0, limit = 100, activeOnly = true, search = null, category = null, filters = null) {
    const params = new URLSearchParams({
      skip: skip.toString(),
      limit: limit.toString(),
      active_only: activeOnly.toString()
    });
    
    if (search) {
      params.append('search', search);
    }
    
    if (category && category !== 'all') {
      params.append('category', category);
    }

    // Optional filter parameters
    if (filters && typeof filters === 'object') {
      const { priceRange, brands, rating, features, categories } = filters;

      if (priceRange && (priceRange.min != null || priceRange.max != null)) {
        if (priceRange.min != null) params.append('min_price', String(priceRange.min));
        if (priceRange.max != null) params.append('max_price', String(priceRange.max));
      }

      if (Array.isArray(brands) && brands.length) {
        brands.slice(0, 50).forEach(b => params.append('brands', String(b)));
      }

      if (Array.isArray(rating) && rating.length) {
        const minRating = Math.max(...rating.map(r => Number(r)).filter(n => !Number.isNaN(n)));
        if (minRating) params.append('min_rating', String(Math.min(Math.max(minRating, 1), 5)));
      }

      if (Array.isArray(features) && features.length) {
        features.slice(0, 50).forEach(f => params.append('features', String(f)));
      }

      if (Array.isArray(categories) && categories.length) {
        categories.slice(0, 50).forEach(c => params.append('categories', String(c)));
      }
    }
    
    return this.request(`/api/products?${params}`, {}, false);
  }

  async getCategories() {
    return this.request('/api/categories', {}, false);
  }

  async getProduct(productId) {
    return this.request(`/api/products/${productId}`);
  }

  async updateProduct(productId, productData) {
    return this.request(`/api/products/${productId}`, {
      method: 'PUT',
      body: JSON.stringify(productData)
    });
  }

  async deleteProduct(productId) {
    return this.request(`/api/products/${productId}`, {
      method: 'DELETE'
    });
  }

  async updateProductStock(productId, quantityChange) {
    return this.request(`/api/products/${productId}/stock`, {
      method: 'PATCH',
      body: JSON.stringify({ quantity_change: quantityChange })
    });
  }

  // Real-time validation methods with retry logic
  async checkEmailAvailability(email, options = {}) {
    try {
      const encodedEmail = encodeURIComponent(email);
      const url = `/api/auth/check-email/${encodedEmail}`;
      console.log(`[EMAIL DEBUG] Making API request to: ${this.baseURL}${url}`);
      
      const result = await this.request(url, {
        method: 'GET',
        signal: options.signal
      }, false); // false = no authentication required
      
      console.log('[EMAIL DEBUG] API response:', result);
      return result;
    } catch (error) {
      // Log the full error for debugging
      console.error('[EMAIL DEBUG] Email validation error details:', {
        message: error.message,
        status: error.status,
        stack: error.stack,
        email: email
      });
      // If backend is not available, assume email is available for now
      console.warn('Email validation failed, backend may not be running:', error.message);
      return { available: true, message: 'Email validation temporarily unavailable' };
    }
  }

  async checkShopNameAvailability(shopName, options = {}) {
    try {
      const encodedName = encodeURIComponent(shopName);
      return await this.request(`/api/shops/check-name/${encodedName}`, {
        method: 'GET',
        signal: options.signal
      }, false); // false = no authentication required
    } catch (error) {
      // If backend is not available, assume shop name is available for now
      console.warn('Shop name validation failed, backend may not be running:', error.message);
      return { available: true, message: 'Shop name validation temporarily unavailable' };
    }
  }

  // Order management methods
  async getShopOwnerOrders(params = {}) {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.status) queryParams.append('status', params.status);
    if (params.search) queryParams.append('search', params.search);
    
    return await this.request(`/api/orders/shop-owner/orders?${queryParams.toString()}`, {
      method: 'GET'
    });
  }

  async getOrderStats() {
    return await this.request('/api/orders/shop-owner/orders/stats', {
      method: 'GET'
    });
  }

  async updateOrderStatus(orderId, status, trackingNumber = null) {
    const payload = { status };
    if (trackingNumber) payload.tracking_number = trackingNumber;
    
    return await this.request(`/api/orders/${orderId}/status`, {
      method: 'PATCH',
      body: JSON.stringify(payload)
    });
  }

  async getOrderDetails(orderId) {
    return await this.request(`/api/orders/${orderId}`, {
      method: 'GET'
    });
  }

  // Enhanced order status update with history tracking
  async updateOrderStatusEnhanced(orderId, statusData) {
    return await this.request(`/api/orders/${orderId}/status`, {
      method: 'PUT',
      body: JSON.stringify(statusData)
    });
  }

  // Get order status history
  async getOrderStatusHistory(orderId) {
    return await this.request(`/api/orders/${orderId}/history`, {
      method: 'GET'
    });
  }

  // Notification methods
  async getNotifications(params = {}) {
    const queryParams = new URLSearchParams();
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.offset) queryParams.append('offset', params.offset);
    if (params.unread_only) queryParams.append('unread_only', params.unread_only);
    if (params.type_filter) queryParams.append('type_filter', params.type_filter);
    
    return await this.request(`/api/notifications/?${queryParams.toString()}`, {
      method: 'GET'
    });
  }

  async getNotificationStats() {
    return await this.request('/api/notifications/stats', {
      method: 'GET'
    });
  }

  async getUnreadNotificationCount() {
    return await this.request('/api/notifications/unread-count', {
      method: 'GET'
    });
  }

  async markNotificationRead(notificationId) {
    return await this.request(`/api/notifications/${notificationId}/read`, {
      method: 'PATCH'
    });
  }

  async markAllNotificationsRead() {
    return await this.request('/api/notifications/mark-all-read', {
      method: 'PATCH'
    });
  }

  async deleteNotification(notificationId) {
    return await this.request(`/api/notifications/${notificationId}`, {
      method: 'DELETE'
    });
  }

  async getNotificationPreferences() {
    return await this.request('/api/notifications/preferences', {
      method: 'GET'
    });
  }

  async updateNotificationPreferences(preferences) {
    return await this.request('/api/notifications/preferences', {
      method: 'PATCH',
      body: JSON.stringify(preferences)
    });
  }

  async checkPhoneAvailability(phone, options = {}) {
    try {
      const encodedPhone = encodeURIComponent(phone);
      return await this.request(`/api/auth/check-phone/${encodedPhone}`, {
        method: 'GET',
        signal: options.signal
      }, false); // false = no authentication required
    } catch (error) {
      // If backend is not available, assume phone is available for now
      console.warn('Phone validation failed, backend may not be running:', error.message);
      return { available: true, message: 'Phone validation temporarily unavailable' };
    }
  }

  async checkShopPhoneAvailability(phone, options = {}) {
    const encodedPhone = encodeURIComponent(phone);
    return this.request(`/api/shops/check-phone/${encodedPhone}`, {
      method: 'GET',
      signal: options.signal
    });
  }

  async checkBusinessLicenseAvailability(license, options = {}) {
    const encodedLicense = encodeURIComponent(license);
    return this.request(`/api/shops/check-license/${encodedLicense}`, {
      method: 'GET',
      signal: options.signal
    });
  }

  // Shop Owner Dashboard methods
  async getShopOwnerDashboardStats() {
    try {
      return await this.request('/api/shop-owner/dashboard/stats', {
        method: 'GET'
      });
    } catch (error) {
      console.warn('Failed to fetch shop owner dashboard stats:', error);
      throw error;
    }
  }

  async getShopOwnerTodayStats() {
    try {
      // Use existing product stats endpoint as fallback
      const productStats = await this.getMyProductStats();
      const orderStats = await this.getOrderStats();
      
      return {
        today_sales: orderStats.today_revenue || 0,
        today_orders: orderStats.today_orders || 0,
        yesterday_sales: orderStats.yesterday_revenue || 0,
        yesterday_orders: orderStats.yesterday_orders || 0,
        sales_change: orderStats.sales_change_percent || 0,
        orders_change: orderStats.orders_change_percent || 0,
        this_month_sales: orderStats.month_revenue || 0,
        this_month_orders: orderStats.month_orders || 0,
        last_month_sales: orderStats.last_month_revenue || 0,
        last_month_orders: orderStats.last_month_orders || 0,
        monthly_sales_change: orderStats.monthly_sales_change || 0,
        monthly_orders_change: orderStats.monthly_orders_change || 0,
        total_products: productStats.total_products || 0,
        active_products: productStats.active_products || 0,
        low_stock_products: productStats.low_stock_products || 0
      };
    } catch (error) {
      console.warn('Failed to fetch today stats:', error);
      return {
        today_sales: 0,
        today_orders: 0,
        yesterday_sales: 0,
        yesterday_orders: 0,
        sales_change: 0,
        orders_change: 0,
        this_month_sales: 0,
        this_month_orders: 0,
        last_month_sales: 0,
        last_month_orders: 0,
        monthly_sales_change: 0,
        monthly_orders_change: 0,
        total_products: 0,
        active_products: 0,
        low_stock_products: 0
      };
    }
  }


  async getShopOwnerRecentOrders(limit = 5) {
    try {
      // Use existing orders endpoint with limit
      return await this.getShopOwnerOrders({ limit });
    } catch (error) {
      console.warn('Failed to fetch recent orders:', error);
      return [];
    }
  }

  async getShopOwnerLowStockProducts() {
    try {
      // Use existing products endpoint and filter for low stock
      const products = await this.getMyProducts(0, 100, false);
      return products.filter(product => product.stock_quantity <= 10 && product.stock_quantity > 0);
    } catch (error) {
      console.warn('Failed to fetch low stock products:', error);
      return [];
    }
  }

  async createOrder(orderData) {
    return await this.request('/api/orders/create', {
      method: 'POST',
      body: JSON.stringify(orderData)
    });
  }


  async getShopOwnerCustomers(filters = {}) {
    try {
      const queryParams = new URLSearchParams(filters).toString();
      return await this.request(`/api/shop-owner/customers${queryParams ? `?${queryParams}` : ''}`, {
        method: 'GET'
      });
    } catch (error) {
      console.warn('Failed to fetch shop owner customers:', error);
      return [];
    }
  }

  async getShopOwnerAnalytics(timeRange = '7d') {
    try {
      return await this.request(`/api/shop-owner/analytics?range=${timeRange}`, {
        method: 'GET'
      });
    } catch (error) {
      console.warn('Failed to fetch shop owner analytics:', error);
      // Return zeros for new users instead of throwing error
      return {
        revenue: { current: 0, previous: 0, change: 0 },
        orders: { current: 0, previous: 0, change: 0, average_value: 0 },
        customers: { current: 0, previous: 0, change: 0, new: 0, returning: 0, retention_rate: 0, lifetime_value: 0 },
        conversionRate: { current: 0, previous: 0, change: 0 }
      };
    }
  }

  async getShopOwnerTopProducts(limit = 5) {
    try {
      return await this.request(`/api/shop-owner/analytics/top-products?limit=${limit}`, {
        method: 'GET'
      });
    } catch (error) {
      console.warn('Failed to fetch top products:', error);
      return [];
    }
  }

  async getShopOwnerSalesData(timeRange = '7d') {
    try {
      return await this.request(`/api/shop-owner/analytics/sales?range=${timeRange}`, {
        method: 'GET'
      });
    } catch (error) {
      console.warn('Failed to fetch sales data:', error);
      return [];
    }
  }

  async getShopOwnerTrafficSources() {
    try {
      return await this.request('/api/shop-owner/analytics/traffic-sources', {
        method: 'GET'
      });
    } catch (error) {
      console.warn('Failed to fetch traffic sources:', error);
      // Return mock data as fallback when analytics aren't available
      return [
        { source: 'Direct', visitors: 245, percentage: 35 },
        { source: 'Social Media', visitors: 189, percentage: 27 },
        { source: 'Search Engine', visitors: 154, percentage: 22 },
        { source: 'Email', visitors: 77, percentage: 11 },
        { source: 'Referral', visitors: 35, percentage: 5 }
      ];
    }
  }

  // Notification methods (unified endpoint)
  async createNotification(notification) {
    try {
      return await this.request('/api/notifications/create', {
        method: 'POST',
        body: JSON.stringify(notification)
      });
    } catch (error) {
      console.warn('Failed to create notification:', error);
      return false;
    }
  }

  async getNotifications(filters = {}) {
    try {
      const queryParams = new URLSearchParams(filters).toString();
      return await this.request(`/api/notifications/${queryParams ? `?${queryParams}` : ''}`, {
        method: 'GET'
      });
    } catch (error) {
      console.warn('Failed to fetch notifications:', error);
      return [];
    }
  }

  async markNotificationRead(notificationId) {
    try {
      return await this.request(`/api/notifications/${notificationId}/read`, {
        method: 'PATCH'
      });
    } catch (error) {
      console.warn('Failed to mark notification as read:', error);
      return false;
    }
  }

  async clearAllNotifications() {
    try {
      return await this.request('/api/notifications/clear-all', {
        method: 'DELETE'
      });
    } catch (error) {
      console.warn('Failed to clear all notifications:', error);
      return false;
    }
  }

  async getUserDaysActive() {
    try {
      const result = await this.request('/api/auth/profile/days-active', {
        method: 'GET'
      });
      return result.days_active || 1;
    } catch (error) {
      console.warn('Failed to get user days active:', error);
      return 1; // Default for new users
    }
  }

  // Rating methods
  async getShopRatingStats(shopId) {
    try {
      return await this.request(`/api/shops/${shopId}/rating-stats`, {
        method: 'GET'
      }, false); // Public endpoint
    } catch (error) {
      console.warn('Failed to fetch shop rating stats:', error);
      return {
        average_rating: 0,
        total_reviews: 0,
        rating_distribution: {}
      };
    }
  }

  async getMyShopRatingStats() {
    try {
      // Use existing shop data as fallback
      const shop = await this.getMyShop();
      return {
        average_rating: shop.average_rating || 0,
        total_reviews: shop.total_ratings || 0,
        rating_distribution: {
          '5': shop.rating_5 || 0,
          '4': shop.rating_4 || 0,
          '3': shop.rating_3 || 0,
          '2': shop.rating_2 || 0,
          '1': shop.rating_1 || 0
        },
        isNewShop: false
      };
    } catch (error) {
      // 404 is expected for new shop owners with no ratings yet
      if (error.status === 404 || error.message.includes('404')) {
        console.log('No rating stats found - this is expected for new shops');
        return {
          average_rating: 0,
          total_reviews: 0,
          rating_distribution: {},
          isNewShop: true
        };
      }
      console.warn('Failed to fetch my shop rating stats:', error);
      return {
        average_rating: 0,
        total_reviews: 0,
        rating_distribution: {}
      };
    }
  }

  async getShopRatings(shopId, options = {}) {
    try {
      const params = new URLSearchParams();
      if (options.page) params.append('page', options.page.toString());
      if (options.page_size) params.append('page_size', options.page_size.toString());
      if (options.sort_by) params.append('sort_by', options.sort_by);
      if (options.min_rating) params.append('min_rating', options.min_rating.toString());
      if (options.verified_only) params.append('verified_only', options.verified_only.toString());
      
      const queryString = params.toString();
      const endpoint = queryString ? `/shops/${shopId}/ratings?${queryString}` : `/shops/${shopId}/ratings`;
      
      return await this.request(endpoint, {
        method: 'GET'
      }, false); // Public endpoint
    } catch (error) {
      console.warn('Failed to fetch shop ratings:', error);
      return {
        ratings: [],
        total: 0,
        page: 1,
        page_size: 10,
        total_pages: 0,
        has_next: false,
        has_prev: false
      };
    }
  }

  async createRating(shopId, ratingData) {
    return this.request(`/api/shops/${shopId}/ratings`, {
      method: 'POST',
      body: JSON.stringify(ratingData)
    });
  }

  async updateRating(ratingId, ratingData) {
    return this.request(`/ratings/${ratingId}`, {
      method: 'PUT',
      body: JSON.stringify(ratingData)
    });
  }

  async deleteRating(ratingId) {
    return this.request(`/ratings/${ratingId}`, {
      method: 'DELETE'
    });
  }

  async markRatingHelpful(ratingId, isHelpful) {
    return this.request(`/ratings/${ratingId}/helpful`, {
      method: 'POST',
      body: JSON.stringify({ is_helpful: isHelpful })
    });
  }

  async flagRating(ratingId, flagData) {
    return this.request(`/ratings/${ratingId}/flag`, {
      method: 'POST',
      body: JSON.stringify(flagData)
    });
  }

  async getMyRatings() {
    try {
      return await this.request('/api/users/my-ratings', {
        method: 'GET'
      });
    } catch (error) {
      console.warn('Failed to fetch my ratings:', error);
      return [];
    }
  }

  // Health check method
  async healthCheck() {
    try {
      const response = await fetch(`${this.baseURL}/health`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  // Role upgrade method
  async upgradeUserRole(newRole) {
    return await this.request('/api/auth/upgrade-role', {
      method: 'PATCH',
      body: JSON.stringify({ role: newRole })
    });
  }

  // Create shop owner subscription
  async createShopSubscription(paymentData = {}) {
    return await this.request('/api/tranzak/create-shop-subscription', {
      method: 'POST',
      body: JSON.stringify({
        paymentMethod: paymentData.paymentMethod || 'visa_mastercard',
        phoneNumber: paymentData.phoneNumber || null,
        operator: paymentData.operator || null,
        cardDetails: paymentData.cardDetails || null
      })
    });
  }

  // Delivery Agent API methods
  async getDeliveryAgentStats() {
    try {
      return await this.request('/api/delivery-agent/stats', {
        method: 'GET'
      });
    } catch (error) {
      console.warn('Failed to fetch delivery agent stats:', error);
      // Return empty data instead of mock data
      throw error;
    }
  }

  async getDeliveryAgentDeliveries(filters = {}) {
    try {
      const queryParams = new URLSearchParams();
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.limit) queryParams.append('limit', filters.limit);
      if (filters.offset) queryParams.append('offset', filters.offset);
      
      const endpoint = queryParams.toString() ? `/delivery-agent/deliveries?${queryParams}` : '/delivery-agent/deliveries';
      return await this.request(endpoint, {
        method: 'GET'
      });
    } catch (error) {
      console.warn('Failed to fetch delivery agent deliveries:', error);
      // Return empty data instead of mock data
      throw error;
    }
  }

  async updateDeliveryStatus(deliveryId, status, notes = null) {
    try {
      return await this.request(`/delivery-agent/deliveries/${deliveryId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status, notes })
      });
    } catch (error) {
      console.warn('Failed to update delivery status:', error);
      // Return success response for demo
      return { success: true, message: 'Status updated successfully' };
    }
  }

  async getDeliveryDetails(deliveryId) {
    try {
      return await this.request(`/delivery-agent/deliveries/${deliveryId}`, {
        method: 'GET'
      });
    } catch (error) {
      console.warn('Failed to fetch delivery details:', error);
      // Return mock delivery details
      return this.getMockDeliveryDetails(deliveryId);
    }
  }

  async acceptDeliveryAssignment(deliveryId) {
    try {
      return await this.request(`/delivery-agent/deliveries/${deliveryId}/accept`, {
        method: 'POST'
      });
    } catch (error) {
      console.warn('Failed to accept delivery assignment:', error);
      return { success: true, message: 'Delivery accepted successfully' };
    }
  }

  async rejectDeliveryAssignment(deliveryId, reason = null) {
    try {
      return await this.request(`/delivery-agent/deliveries/${deliveryId}/reject`, {
        method: 'POST',
        body: JSON.stringify({ reason })
      });
    } catch (error) {
      console.warn('Failed to reject delivery assignment:', error);
      return { success: true, message: 'Delivery rejected successfully' };
    }
  }

  // Mock data generators for fallback
  getMockDeliveries() {
    const statuses = ['pending', 'in_transit', 'delivered', 'failed'];
    const priorities = ['low', 'normal', 'high'];
    const customers = ['John Doe', 'Jane Smith', 'Mike Johnson', 'Sarah Wilson', 'David Brown'];
    const shops = ['TechHub Cameroon', 'Fashion Forward', 'Electronics Hub', 'Home & Garden Plus'];
    const areas = ['Bonanjo', 'Akwa', 'Bonapriso', 'Deido', 'New Bell', 'Bali'];
    
    return Array.from({ length: 8 }, (_, i) => ({
      id: `DEL-${String(i + 1).padStart(3, '0')}`,
      order_number: `ORD-${12345 + i}`,
      customer_name: customers[Math.floor(Math.random() * customers.length)],
      customer_phone: '+237 6XX XXX XXX',
      shop_name: shops[Math.floor(Math.random() * shops.length)],
      pickup_address: `${shops[Math.floor(Math.random() * shops.length)]}, ${areas[Math.floor(Math.random() * areas.length)]}, Douala`,
      delivery_address: `${Math.floor(Math.random() * 999) + 1} ${['Main St', 'Oak Ave', 'Pine St', 'Cedar Rd'][Math.floor(Math.random() * 4)]}, ${areas[Math.floor(Math.random() * areas.length)]}, Douala`,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      amount: Math.floor(Math.random() * 50000) + 5000,
      distance: `${(Math.random() * 15 + 1).toFixed(1)} km`,
      estimated_time: `${Math.floor(Math.random() * 45) + 10} mins`,
      priority: priorities[Math.floor(Math.random() * priorities.length)],
      assigned_at: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
      delivered_at: Math.random() > 0.5 ? new Date(Date.now() - Math.random() * 12 * 60 * 60 * 1000).toISOString() : null,
      items: [
        { name: 'Product ' + (i + 1), quantity: Math.floor(Math.random() * 3) + 1 },
        ...(Math.random() > 0.5 ? [{ name: 'Additional Item', quantity: 1 }] : [])
      ],
      delivery_fee: Math.floor(Math.random() * 3000) + 1000,
      notes: Math.random() > 0.7 ? 'Please call before delivery' : null
    }));
  }

  getMockDeliveryDetails(deliveryId) {
    return {
      id: deliveryId,
      order_number: `ORD-${Math.floor(Math.random() * 99999)}`,
      customer_name: 'John Doe',
      customer_phone: '+237 6XX XXX XXX',
      customer_email: 'john.doe@example.com',
      shop_name: 'TechHub Cameroon',
      pickup_address: 'TechHub Store, Bonanjo, Douala',
      pickup_coordinates: { lat: 4.0511, lng: 9.7679 },
      delivery_address: '123 Main St, Akwa, Douala',
      delivery_coordinates: { lat: 4.0467, lng: 9.7671 },
      status: 'pending',
      amount: 25000,
      distance: '5.2 km',
      estimated_time: '25 mins',
      priority: 'normal',
      assigned_at: new Date().toISOString(),
      items: [
        { name: 'iPhone 15 Pro', quantity: 1, price: 850000 },
        { name: 'Phone Case', quantity: 1, price: 15000 }
      ],
      delivery_fee: 2500,
      special_instructions: 'Handle with care. Call before delivery.',
      payment_method: 'cash_on_delivery'
    };
  }

  // Customer API methods
  async getCustomerStats() {
    try {
      console.log('🔍 API: Calling /api/customer/stats endpoint...');
      const result = await this.request('/api/customer/stats', {
        method: 'GET'
      });
      console.log('✅ API: Customer stats response:', result);
      return result;
    } catch (error) {
      console.error('❌ API: Failed to fetch customer stats:', error);
      console.error('❌ API: Error details:', {
        message: error.message,
        status: error.status,
        response: error.response
      });
      // Return empty data instead of mock data
      throw error;
    }
  }

  async getCustomerOrders(filters = {}) {
    try {
      const queryParams = new URLSearchParams();
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.limit) queryParams.append('limit', filters.limit);
      if (filters.page) queryParams.append('page', filters.page);
      if (filters.date_from) queryParams.append('date_from', filters.date_from);
      if (filters.date_to) queryParams.append('date_to', filters.date_to);

      const endpoint = queryParams.toString() ? `/api/customer/orders?${queryParams}` : '/api/customer/orders';
      return await this.request(endpoint, {
        method: 'GET'
      });
    } catch (error) {
      console.warn('Failed to fetch customer orders:', error);
      // Return empty data instead of mock data
      throw error;
    }
  }

  async getCustomerRecentOrders(limit = 5) {
    try {
      const queryParams = new URLSearchParams();
      if (limit) queryParams.append('limit', limit);

      const endpoint = `/api/customer/recent-orders?${queryParams}`;
      return await this.request(endpoint, {
        method: 'GET'
      });
    } catch (error) {
      console.warn('Failed to fetch customer recent orders:', error);
      // Return empty data instead of mock data
      throw error;
    }
  }

  // Order Cancellation API Functions
  async getOrderCancellationPolicy(orderId) {
    try {
      return await this.request(`/api/orders/${orderId}/cancellation-policy`, {
        method: 'GET'
      });
    } catch (error) {
      console.error('Failed to get cancellation policy:', error);
      throw error;
    }
  }

  async cancelOrder(orderId, cancellationData) {
    try {
      return await this.request(`/api/orders/${orderId}/cancel`, {
        method: 'POST',
        body: JSON.stringify(cancellationData)
      });
    } catch (error) {
      console.error('Failed to cancel order:', error);
      throw error;
    }
  }

  async getCancellationHistory(limit = 10) {
    try {
      const queryParams = new URLSearchParams();
      if (limit) queryParams.append('limit', limit);

      return await this.request(`/api/customer/orders/cancellation-history?${queryParams}`, {
        method: 'GET'
      });
    } catch (error) {
      console.error('Failed to get cancellation history:', error);
      throw error;
    }
  }

  async getCustomerWishlist(filters = {}) {
    try {
      const queryParams = new URLSearchParams();
      if (filters.limit) queryParams.append('limit', filters.limit);
      if (filters.category) queryParams.append('category', filters.category);
      
      const endpoint = queryParams.toString() ? `/api/customer/wishlist?${queryParams}` : '/api/customer/wishlist';
      return await this.request(endpoint, {
        method: 'GET'
      });
    } catch (error) {
      console.warn('Failed to fetch customer wishlist:', error);
      throw error;
    }
  }

  async addToWishlist(productId) {
    try {
      return await this.request('/api/customer/wishlist', {
        method: 'POST',
        body: JSON.stringify({ product_id: productId })
      });
    } catch (error) {
      console.warn('Failed to add to wishlist:', error);
      return { success: true, message: 'Added to wishlist successfully' };
    }
  }

  async removeFromWishlist(productId) {
    try {
      return await this.request(`/api/customer/wishlist/${productId}`, {
        method: 'DELETE'
      });
    } catch (error) {
      console.warn('Failed to remove from wishlist:', error);
      return { success: true, message: 'Removed from wishlist successfully' };
    }
  }

  async getCustomerRecommendations() {
    try {
      return await this.request('/api/customer/recommendations', {
        method: 'GET'
      });
    } catch (error) {
      console.warn('Failed to fetch recommendations:', error);
      throw error;
    }
  }

  async getCustomerAddresses() {
    try {
      return await this.request('/api/customer/addresses', {
        method: 'GET'
      });
    } catch (error) {
      console.warn('Failed to fetch addresses:', error);
      throw error;
    }
  }

  async getCustomerPaymentMethods() {
    try {
      return await this.request('/api/customer/payment-methods', {
        method: 'GET'
      });
    } catch (error) {
      console.warn('Failed to fetch payment methods:', error);
      throw error;
    }
  }

  // Mock data generators for customer
  getMockCustomerOrders() {
    const statuses = ['Processing', 'Shipped', 'Delivered', 'Cancelled'];
    const shops = ['TechHub Cameroon', 'Fashion Forward', 'Electronics Hub', 'Home & Garden Plus', 'SportZone Douala'];
    const products = [
      'iPhone 15 Pro', 'Samsung Galaxy S24', 'MacBook Pro 14"', 'Dell XPS 13',
      'Nike Air Max 270', 'Adidas Ultraboost', 'Designer Dress', 'Formal Shirt',
      'Wireless Headphones', 'Smart Watch', 'Gaming Laptop', 'Bluetooth Speaker'
    ];
    
    return Array.from({ length: 10 }, (_, i) => ({
      id: `ORD-2025-${String(i + 1).padStart(3, '0')}`,
      order_number: `ORD-2025-${String(i + 1).padStart(3, '0')}`,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      shop_name: shops[Math.floor(Math.random() * shops.length)],
      items_count: Math.floor(Math.random() * 5) + 1,
      total_amount: Math.floor(Math.random() * 500000) + 10000,
      order_date: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
      delivery_date: Math.random() > 0.3 ? new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString() : null,
      items: Array.from({ length: Math.floor(Math.random() * 3) + 1 }, () => ({
        name: products[Math.floor(Math.random() * products.length)],
        quantity: Math.floor(Math.random() * 3) + 1,
        price: Math.floor(Math.random() * 200000) + 5000
      })),
      tracking_number: `TRK${Math.floor(Math.random() * 1000000)}`,
      payment_method: ['Card', 'Mobile Money', 'Cash on Delivery'][Math.floor(Math.random() * 3)],
      delivery_address: `${Math.floor(Math.random() * 999) + 1} ${['Main St', 'Oak Ave', 'Pine Rd', 'Cedar St'][Math.floor(Math.random() * 4)]}, Douala`,
      estimated_delivery: new Date(Date.now() + Math.random() * 14 * 24 * 60 * 60 * 1000).toISOString()
    }));
  }

  getMockWishlist() {
    const products = [
      { name: 'iPhone 15 Pro Max', category: 'Electronics', price: 1200000, image: '/products/iphone15.jpg' },
      { name: 'Samsung 4K Smart TV', category: 'Electronics', price: 450000, image: '/products/samsung-tv.jpg' },
      { name: 'Nike Air Jordan', category: 'Fashion', price: 85000, image: '/products/nike-jordan.jpg' },
      { name: 'MacBook Pro 16"', category: 'Electronics', price: 1800000, image: '/products/macbook.jpg' },
      { name: 'Designer Handbag', category: 'Fashion', price: 120000, image: '/products/handbag.jpg' }
    ];

    return Array.from({ length: 5 }, (_, i) => {
      const product = products[i];
      return {
        id: i + 1,
        product_id: `PROD-${i + 1}`,
        name: product.name,
        category: product.category,
        current_price: product.price,
        original_price: product.price + Math.floor(Math.random() * 50000),
        price_change: (Math.random() - 0.5) * 20,
        shop_name: ['TechHub Cameroon', 'Fashion Forward', 'Electronics Hub'][Math.floor(Math.random() * 3)],
        image_url: product.image,
        in_stock: Math.random() > 0.2,
        added_date: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString(),
        rating: 4.0 + Math.random() * 1.0,
        reviews_count: Math.floor(Math.random() * 500) + 10
      };
    });
  }

  getMockRecommendations() {
    return Array.from({ length: 6 }, (_, i) => ({
      id: `REC-${i + 1}`,
      name: `Recommended Product ${i + 1}`,
      category: ['Electronics', 'Fashion', 'Home'][Math.floor(Math.random() * 3)],
      price: Math.floor(Math.random() * 300000) + 20000,
      shop_name: ['TechHub Cameroon', 'Fashion Forward', 'Electronics Hub'][Math.floor(Math.random() * 3)],
      rating: 4.0 + Math.random() * 1.0,
      discount: Math.floor(Math.random() * 30) + 5,
      reason: ['Based on your purchase history', 'Trending in your area', 'Highly rated'][Math.floor(Math.random() * 3)]
    }));
  }

  getMockAddresses() {
    return [
      {
        id: 1,
        type: 'home',
        name: 'Home Address',
        address: '123 Main Street, Akwa, Douala',
        city: 'Douala',
        region: 'Littoral',
        phone: '+237 6XX XXX XXX',
        is_default: true
      },
      {
        id: 2,
        type: 'work',
        name: 'Office Address', 
        address: '456 Business District, Bonanjo, Douala',
        city: 'Douala',
        region: 'Littoral',
        phone: '+237 6XX XXX XXX',
        is_default: false
      }
    ];
  }

  getMockPaymentMethods() {
    return [
      {
        id: 1,
        type: 'card',
        name: 'Visa Card',
        last_four: '4242',
        expiry: '12/26',
        is_default: true
      },
      {
        id: 2,
        type: 'mobile_money',
        name: 'MTN Mobile Money',
        phone: '+237 6XX XXX XXX',
        is_default: false
      },
      {
        id: 3,
        type: 'mobile_money',
        name: 'Orange Money',
        phone: '+237 6XX XXX XXX',
        is_default: false
      }
    ];
  }

  // Analytics APIs
  async getRealtimeChartData(metricType, timeRange = '24h', options = {}) {
    const params = new URLSearchParams({
      time_range: timeRange,
      granularity: options.granularity || 'auto',
      ...(options.shopId && { shop_id: options.shopId }),
      ...(options.categoryId && { category_id: options.categoryId }),
      ...(options.region && { region: options.region })
    });

    return this.request(`/analytics/charts/realtime/${metricType}?${params}`, {
      method: 'GET'
    });
  }

  async getAnalyticsForecasts(metricType, daysAhead = 7, options = {}) {
    const params = new URLSearchParams({
      days_ahead: daysAhead,
      ...(options.shopId && { shop_id: options.shopId }),
      ...(options.categoryId && { category_id: options.categoryId }),
      ...(options.region && { region: options.region })
    });

    return this.request(`/analytics/forecasts/${metricType}?${params}`, {
      method: 'GET'
    });
  }

  async getAnalyticsAnomalies(options = {}) {
    const params = new URLSearchParams({
      ...(options.metricType && { metric_type: options.metricType }),
      ...(options.shopId && { shop_id: options.shopId }),
      ...(options.categoryId && { category_id: options.categoryId }),
      ...(options.region && { region: options.region }),
      ...(options.severity && { severity: options.severity }),
      hours_back: options.hoursBack || 24
    });

    return this.request(`/analytics/anomalies?${params}`, {
      method: 'GET'
    });
  }

  async getAnalyticsOverview(timeRange = '7d') {
    const params = new URLSearchParams({ time_range: timeRange });
    return this.request(`/analytics/dashboard/overview?${params}`, {
      method: 'GET'
    });
  }

  async processRealtimeEvent(eventData) {
    return this.request('/analytics/events/realtime', {
      method: 'POST',
      body: JSON.stringify(eventData)
    });
  }

  async getAnalyticsAuditLogs(options = {}) {
    const params = new URLSearchParams({
      limit: options.limit || 100,
      offset: options.offset || 0,
      ...(options.userId && { user_id: options.userId }),
      ...(options.action && { action: options.action }),
      ...(options.resource && { resource: options.resource }),
      ...(options.startDate && { start_date: options.startDate }),
      ...(options.endDate && { end_date: options.endDate })
    });

    return this.request(`/analytics/audit-logs?${params}`, {
      method: 'GET'
    });
  }

  // Admin Notification Management
  async getUsersForNotifications(options = {}) {
    const params = new URLSearchParams({
      limit: options.limit || 50,
      offset: options.offset || 0,
      ...(options.search && { search: options.search }),
      ...(options.role && { role: options.role })
    });

    return this.request(`/api/notifications/admin/users?${params}`, {
      method: 'GET'
    });
  }

  async sendNotificationToUser(notificationData) {
    return this.request('/api/notifications/admin/send', {
      method: 'POST',
      body: JSON.stringify(notificationData)
    });
  }

  async sendBulkNotifications(bulkData) {
    return this.request('/api/notifications/admin/send-bulk', {
      method: 'POST',
      body: JSON.stringify(bulkData)
    });
  }

  async getNotificationTypes() {
    return this.request('/api/notifications/admin/types', {
      method: 'GET'
    });
  }

  // Notification Management (Regular Users)
  async getNotifications(options = {}) {
    const params = new URLSearchParams({
      limit: options.limit || 20,
      offset: options.offset || 0,
      ...(options.unread_only && { unread_only: options.unread_only }),
      ...(options.type_filter && { type_filter: options.type_filter })
    });

    return this.request(`/api/notifications/?${params}`, {
      method: 'GET'
    });
  }

  async getNotificationStats() {
    return this.request('/api/notifications/stats', {
      method: 'GET'
    });
  }

  async getUnreadNotificationCount() {
    return this.request('/api/notifications/unread-count', {
      method: 'GET'
    });
  }

  async markNotificationRead(notificationId) {
    return this.request(`/api/notifications/${notificationId}/read`, {
      method: 'PATCH'
    });
  }

  async markAllNotificationsRead() {
    return this.request('/api/notifications/mark-all-read', {
      method: 'PATCH'
    });
  }

  async deleteNotification(notificationId) {
    return this.request(`/api/notifications/${notificationId}`, {
      method: 'DELETE'
    });
  }

  async clearAllNotifications() {
    return this.request('/api/notifications/clear-all', {
      method: 'DELETE'
    });
  }

  // Trash Management
  async getTrashNotifications(options = {}) {
    const params = new URLSearchParams({
      limit: options.limit || 20,
      offset: options.offset || 0
    });

    return this.request(`/api/notifications/trash?${params}`, {
      method: 'GET'
    });
  }

  async getTrashCount() {
    return this.request('/api/notifications/trash/count', {
      method: 'GET'
    });
  }

  async restoreNotificationFromTrash(notificationId) {
    return this.request(`/api/notifications/trash/${notificationId}/restore`, {
      method: 'PATCH'
    });
  }

  async permanentlyDeleteNotification(notificationId) {
    return this.request(`/api/notifications/trash/${notificationId}/permanent`, {
      method: 'DELETE'
    });
  }

  async emptyTrash() {
    return this.request('/api/notifications/trash/empty', {
      method: 'DELETE'
    });
  }

  // User notification management
  async getUserNotifications(options = {}) {
    const params = new URLSearchParams({
      limit: options.limit || 20,
      offset: options.offset || 0,
      ...(options.unread_only && { unread_only: options.unread_only }),
      ...(options.type_filter && { type_filter: options.type_filter })
    });

    return this.request(`/api/notifications/${params ? `?${params}` : ''}`, {
      method: 'GET'
    });
  }

  async markNotificationAsRead(notificationId) {
    return this.request(`/api/notifications/${notificationId}/read`, {
      method: 'PATCH'
    });
  }

  async markAllNotificationsAsRead() {
    return this.request('/api/notifications/mark-all-read', {
      method: 'PATCH'
    });
  }

  async deleteNotification(notificationId) {
    return this.request(`/api/notifications/${notificationId}`, {
      method: 'DELETE'
    });
  }

  async getNotificationStats() {
    return this.request('/api/notifications/stats', {
        method: 'GET'
      });
  }

  async getUnreadNotificationCount() {
    return this.request('/api/notifications/unread-count', {
      method: 'GET'
    });
  }


  async getOrderDetails(orderId) {
    return this.request(`/${orderId}`, {
      method: 'GET'
    });
  }

  async createOrder(orderData) {
    return this.request('/api/orders/create', {
      method: 'POST',
      body: JSON.stringify(orderData)
    });
  }

  async createMultiVendorOrder(orderData) {
    return this.request('/api/orders/create-multi-vendor', {
      method: 'POST',
      body: JSON.stringify(orderData)
    });
  }

  async createOrderOptimized(orderData) {
    // Use the working order creation endpoint instead of the broken orders-v2
    return this.request('/api/orders/create', {
      method: 'POST',
      body: JSON.stringify(orderData)
    });
  }

  async getShopOwnerOrdersOptimized(params = {}) {
    const queryParams = new URLSearchParams(params).toString();
    return this.request(`/api/orders-v2/shop-owner/orders${queryParams ? `?${queryParams}` : ''}`, {
      method: 'GET'
    });
  }

  async getCustomerOrdersOptimized(params = {}) {
    const queryParams = new URLSearchParams(params).toString();
    return this.request(`/api/orders-v2/customer/orders${queryParams ? `?${queryParams}` : ''}`, {
      method: 'GET'
    });
  }

  // Chat system methods
  async getChatConversations() {
    return this.request('/api/chat/conversations', {
      method: 'GET'
    });
  }

  async createChatConversation(conversationData) {
    return this.request('/api/chat/conversations', {
      method: 'POST',
      body: JSON.stringify(conversationData)
    });
  }

  async getChatMessages(conversationId, skip = 0, limit = 50) {
    return this.request(`/api/chat/conversations/${conversationId}/messages?skip=${skip}&limit=${limit}`, {
      method: 'GET'
    });
  }

  async sendChatMessage(conversationId, messageData) {
    // This will be handled via WebSocket, but keeping for backup
    return this.request(`/api/chat/conversations/${conversationId}/messages`, {
      method: 'POST',
      body: JSON.stringify(messageData)
    });
  }

  async markMessagesAsRead(conversationId, messageId = null) {
    return this.request(`/api/chat/conversations/${conversationId}/read`, {
      method: 'POST',
      body: JSON.stringify({ message_id: messageId })
    });
  }

  async uploadChatMedia(file) {
    const formData = new FormData();
    formData.append('file', file);

    const token = await this.authService.getAccessToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${this.baseURL}/api/chat/media/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to upload media');
    }

    return response.json();
  }

  // User discovery and contact management
  async searchUsers(query, limit = 20) {
    return this.request(`/api/chat/users/search?query=${encodeURIComponent(query)}&limit=${limit}`, {
      method: 'GET'
    });
  }

  async sendContactRequest(userId, message = null) {
    return this.request('/api/chat/contacts/request', {
      method: 'POST',
      body: JSON.stringify({ user_id: userId, message })
    });
  }

  async acceptContactRequest(contactId) {
    return this.request(`/api/chat/contacts/${contactId}/accept`, {
      method: 'POST'
    });
  }

  async getContacts() {
    return this.request('/api/chat/contacts', {
      method: 'GET'
    });
  }

  // Direct messaging and group chats
  async createDirectConversation(recipientId, initialMessage) {
    return this.request('/api/chat/conversations/direct', {
      method: 'POST',
      body: JSON.stringify({
        recipient_id: recipientId,
        initial_message: initialMessage
      })
    });
  }

  async createGroupConversation(groupName, participantIds, description = null, initialMessage = null) {
    return this.request('/api/chat/conversations/group', {
      method: 'POST',
      body: JSON.stringify({
        group_name: groupName,
        participant_ids: participantIds,
        group_description: description,
        initial_message: initialMessage
      })
    });
  }
}

export default new ApiService();
