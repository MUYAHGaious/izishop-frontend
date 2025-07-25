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
        '/auth/check-email',
        '/auth/check-phone', 
        '/shops/check-name',
        '/auth/login',
        '/auth/register',
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
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: requireAuth ? this.getAuthHeaders() : {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      ...options
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        // Handle different error types
        if (response.status === 401 && requireAuth) {
          // This will be handled by the fetch interceptor
          throw new Error('Unauthorized');
        } else if (response.status === 401 && !requireAuth) {
          // For public endpoints, just throw a regular error without token refresh
          throw new Error('Endpoint requires authentication');
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
    }, false); // false = no authentication required
    
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
    }, false); // false = no authentication required
    
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
    try {
      return await this.request('/shops/my-shop');
    } catch (error) {
      console.warn('Failed to fetch shop data:', error);
      return { name: 'My Shop', is_active: true, created_at: new Date().toISOString() };
    }
  }

  async getMyShops() {
    try {
      const response = await this.request('/shops/my-shops');
      return Array.isArray(response) ? response : [];
    } catch (error) {
      console.warn('Failed to fetch user shops:', error);
      return [];
    }
  }

  async getShop(shopId) {
    return this.request(`/shops/${shopId}`);
  }

  async getAllShops(page = 1, limit = 20, search = '', category = '', sort = 'relevance', filters = {}) {
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
      
      return this.request(`/shops/?${params}`, {}, false); // false = no auth required
    } catch (error) {
      console.warn('API not available for shops, using mock data:', error.message);
      
      // Return mock shops data
      return {
        shops: [
          {
            id: 1,
            name: "TechHub Cameroon",
            description: "Leading electronics and gadgets shop in Douala",
            category: "electronics",
            location: "Douala, Cameroon",
            rating: 4.8,
            isVerified: true,
            isOnline: true,
            isFollowing: false,
            image_url: "/slideshow/pexels-quang-nguyen-vinh-222549-6871018.jpg",
            owner_name: "Jean Mballa",
            products_count: 156,
            followers_count: 1247
          },
          {
            id: 2,
            name: "Fashion Forward",
            description: "Trendy fashion and accessories for modern style",
            category: "fashion",
            location: "Yaoundé, Cameroon",
            rating: 4.6,
            isVerified: true,
            isOnline: true,
            isFollowing: false,
            image_url: "/slideshow/pexels-mikhail-nilov-9301901.jpg",
            owner_name: "Marie Fokou",
            products_count: 89,
            followers_count: 567
          },
          {
            id: 3,
            name: "Home & Garden Plus",
            description: "Quality home improvement and garden supplies",
            category: "home",
            location: "Bafoussam, Cameroon",
            rating: 4.4,
            isVerified: false,
            isOnline: true,
            isFollowing: false,
            image_url: "/slideshow/pexels-tima-miroshnichenko-5453848.jpg",
            owner_name: "Paul Nkomo",
            products_count: 234,
            followers_count: 892
          }
        ],
        total: 3,
        count: 3
      };
    }
  }

  async getFeaturedShops() {
    try {
      return this.request('/shops/featured', {}, false); // false = no auth required
    } catch (error) {
      console.warn('API not available for featured shops, using mock data:', error.message);
      
      // Return mock featured shops data
      return [
        {
          id: 1,
          name: "TechHub Cameroon",
          description: "Leading electronics and gadgets shop in Douala",
          category: "electronics",
          location: "Douala, Cameroon",
          rating: 4.8,
          isVerified: true,
          isOnline: true,
          isFollowing: false,
          image_url: "/slideshow/pexels-quang-nguyen-vinh-222549-6871018.jpg",
          owner_name: "Jean Mballa",
          products_count: 156,
          followers_count: 1247
        },
        {
          id: 2,
          name: "Fashion Forward",
          description: "Trendy fashion and accessories for modern style",
          category: "fashion",
          location: "Yaoundé, Cameroon",
          rating: 4.6,
          isVerified: true,
          isOnline: true,
          isFollowing: false,
          image_url: "/slideshow/pexels-mikhail-nilov-9301901.jpg",
          owner_name: "Marie Fokou",
          products_count: 89,
          followers_count: 567
        }
      ];
    }
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
    try {
      return await this.request('/products/my-stats');
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
    try {
      const encodedEmail = encodeURIComponent(email);
      return await this.request(`/auth/check-email/${encodedEmail}`, {
        method: 'GET',
        signal: options.signal
      }, false); // false = no authentication required
    } catch (error) {
      // If backend is not available, assume email is available for now
      console.warn('Email validation failed, backend may not be running:', error.message);
      return { available: true, message: 'Email validation temporarily unavailable' };
    }
  }

  async checkShopNameAvailability(shopName, options = {}) {
    try {
      const encodedName = encodeURIComponent(shopName);
      return await this.request(`/shops/check-name/${encodedName}`, {
        method: 'GET',
        signal: options.signal
      }, false); // false = no authentication required
    } catch (error) {
      // If backend is not available, assume shop name is available for now
      console.warn('Shop name validation failed, backend may not be running:', error.message);
      return { available: true, message: 'Shop name validation temporarily unavailable' };
    }
  }

  async checkPhoneAvailability(phone, options = {}) {
    try {
      const encodedPhone = encodeURIComponent(phone);
      return await this.request(`/auth/check-phone/${encodedPhone}`, {
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

  // Rating methods
  async getShopRatingStats(shopId) {
    try {
      return await this.request(`/shops/${shopId}/rating-stats`, {
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
      return await this.request('/shop-owner/rating-stats', {
        method: 'GET'
      });
    } catch (error) {
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
    return this.request(`/shops/${shopId}/ratings`, {
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
      return await this.request('/users/my-ratings', {
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
}

export default new ApiService();