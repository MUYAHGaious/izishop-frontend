// Enhanced API service with JWT refresh token implementation
// Best practices for authentication and error handling

const API_BASE_URL = 'http://localhost:8000/api';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.isRefreshing = false;
    this.failedQueue = [];
    this.setupInterceptors();
  }

  // Token management
  getAccessToken() {
    return localStorage.getItem('accessToken');
  }

  getRefreshToken() {
    return localStorage.getItem('refreshToken');
  }

  setTokens(accessToken, refreshToken) {
    if (accessToken) {
      localStorage.setItem('accessToken', accessToken);
    }
    if (refreshToken) {
      localStorage.setItem('refreshToken', refreshToken);
    }
  }

  clearTokens() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
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
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: this.getAuthHeaders(),
      ...options
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        // Handle different error types
        if (response.status === 401) {
          // This will be handled by the fetch interceptor
          throw new Error('Unauthorized');
        }
        
        if (response.status === 403) {
          throw new Error('Access forbidden');
        }
        
        if (response.status === 422 && errorData) {
          if (errorData.errors && Array.isArray(errorData.errors)) {
            const errorMessages = errorData.errors.map(err => `${err.field}: ${err.message}`).join(', ');
            throw new Error(`Validation error: ${errorMessages}`);
          } else if (errorData.detail) {
            if (Array.isArray(errorData.detail)) {
              const errorMessages = errorData.detail.map(err => `${err.loc.join('.')}: ${err.msg}`).join(', ');
              throw new Error(`Validation error: ${errorMessages}`);
            } else if (typeof errorData.detail === 'string') {
              throw new Error(errorData.detail);
            }
          }
        }
        
        if (response.status === 429) {
          throw new Error('Too many requests. Please try again later.');
        }
        
        if (response.status >= 500) {
          throw new Error('Server error. Please try again later.');
        }
        
        throw new Error(errorData.detail || errorData.message || `HTTP error! status: ${response.status}`);
      }
      
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      }
      
      return await response.text();
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // Authentication methods with enhanced token handling
  async login(email, password) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    
    // Store both access and refresh tokens
    if (response.access_token) {
      this.setTokens(response.access_token, response.refresh_token);
    }
    
    return response;
  }

  async register(userData) {
    const response = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
    
    // Store both access and refresh tokens
    if (response.access_token) {
      this.setTokens(response.access_token, response.refresh_token);
    }
    
    return response;
  }

  async getCurrentUser() {
    return this.request('/auth/me');
  }

  async adminLogin(email, password, adminCode) {
    const response = await this.request('/auth/admin-login', {
      method: 'POST',
      body: JSON.stringify({ email, password, admin_code: adminCode })
    });
    
    // Store both access and refresh tokens
    if (response.access_token) {
      this.setTokens(response.access_token, response.refresh_token);
    }
    
    return response;
  }

  async logout() {
    try {
      // Call logout endpoint to invalidate tokens on server
      await this.request('/auth/logout', {
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
    return this.request('/admin/create-default-admin', {
      method: 'POST'
    });
  }

  async checkAdminStatus() {
    return this.request('/admin/admin-status');
  }

  // Admin dashboard methods
  async getDashboardOverview() {
    return this.request('/admin/dashboard/overview');
  }

  async getDashboardUsers() {
    return this.request('/admin/dashboard/users');
  }

  async getDashboardActivity() {
    return this.request('/admin/dashboard/activity');
  }

  async getSystemStats() {
    return this.request('/admin/dashboard/system-stats');
  }

  // Shop methods
  async createShop(shopData) {
    return this.request('/shops/create', {
      method: 'POST',
      body: JSON.stringify(shopData)
    });
  }

  async getMyShop() {
    return this.request('/shops/my-shop');
  }

  async getShop(shopId) {
    return this.request(`/shops/${shopId}`);
  }

  async getAllShops(page = 1, limit = 20, search = '', category = '', sort = 'relevance', filters = {}) {
    const params = new URLSearchParams();
    
    const skip = (page - 1) * limit;
    params.append('skip', skip.toString());
    params.append('limit', limit.toString());
    
    if (search) params.append('search', search);
    if (category) params.append('category', category);
    if (sort) params.append('sort', sort);
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        if (Array.isArray(value)) {
          value.forEach(v => params.append(key, v));
        } else {
          params.append(key, value.toString());
        }
      }
    });
    
    return this.request(`/shops/?${params}`);
  }

  async getFeaturedShops() {
    return this.request('/shops/featured');
  }

  async followShop(shopId) {
    return this.request(`/shops/${shopId}/follow`, {
      method: 'POST'
    });
  }

  async unfollowShop(shopId) {
    return this.request(`/shops/${shopId}/unfollow`, {
      method: 'DELETE'
    });
  }

  // Shop products and reviews
  async getShopProducts(shopId, page = 1, limit = 20) {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    return this.request(`/shops/${shopId}/products?${params}`);
  }

  async getShopReviews(shopId, page = 1, limit = 20) {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    return this.request(`/shops/${shopId}/reviews?${params}`);
  }

  async addShopReview(shopId, reviewData) {
    return this.request(`/shops/${shopId}/reviews`, {
      method: 'POST',
      body: JSON.stringify(reviewData)
    });
  }

  async updateMyShop(shopData) {
    return this.request('/shops/my-shop', {
      method: 'PUT',
      body: JSON.stringify(shopData)
    });
  }

  async deleteMyShop() {
    return this.request('/shops/my-shop', {
      method: 'DELETE'
    });
  }

  // Product methods
  async createProduct(productData) {
    return this.request('/products/', {
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
    return this.request(`/products/my-products?${params}`);
  }

  async getMyProductStats() {
    return this.request('/products/my-stats');
  }

  async getAllProducts(skip = 0, limit = 100, activeOnly = true, search = null) {
    const params = new URLSearchParams({
      skip: skip.toString(),
      limit: limit.toString(),
      active_only: activeOnly.toString()
    });
    
    if (search) {
      params.append('search', search);
    }
    
    return this.request(`/products/?${params}`);
  }

  async getProduct(productId) {
    return this.request(`/products/${productId}`);
  }

  async updateProduct(productId, productData) {
    return this.request(`/products/${productId}`, {
      method: 'PUT',
      body: JSON.stringify(productData)
    });
  }

  async deleteProduct(productId) {
    return this.request(`/products/${productId}`, {
      method: 'DELETE'
    });
  }

  async updateProductStock(productId, quantityChange) {
    return this.request(`/products/${productId}/stock`, {
      method: 'PATCH',
      body: JSON.stringify({ quantity_change: quantityChange })
    });
  }

  // Real-time validation methods with retry logic
  async checkEmailAvailability(email, options = {}) {
    const encodedEmail = encodeURIComponent(email);
    return this.request(`/auth/check-email/${encodedEmail}`, {
      method: 'GET',
      signal: options.signal
    });
  }

  async checkShopNameAvailability(shopName, options = {}) {
    const encodedName = encodeURIComponent(shopName);
    return this.request(`/shops/check-name/${encodedName}`, {
      method: 'GET',
      signal: options.signal
    });
  }

  async checkPhoneAvailability(phone, options = {}) {
    const encodedPhone = encodeURIComponent(phone);
    return this.request(`/auth/check-phone/${encodedPhone}`, {
      method: 'GET',
      signal: options.signal
    });
  }

  async checkShopPhoneAvailability(phone, options = {}) {
    const encodedPhone = encodeURIComponent(phone);
    return this.request(`/shops/check-phone/${encodedPhone}`, {
      method: 'GET',
      signal: options.signal
    });
  }

  async checkBusinessLicenseAvailability(license, options = {}) {
    const encodedLicense = encodeURIComponent(license);
    return this.request(`/shops/check-license/${encodedLicense}`, {
      method: 'GET',
      signal: options.signal
    });
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
}

export default new ApiService();