// API service for IziShopin frontend (Mock implementation)
// This will be replaced with actual backend API calls by the backend developer

const API_BASE_URL = 'http://localhost:8000/api';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Helper method to get auth headers
  getAuthHeaders() {
    const token = localStorage.getItem('authToken');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }

  // Generic request method
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
        
        // Handle FastAPI validation errors
        if (response.status === 422 && errorData) {
          if (errorData.errors && Array.isArray(errorData.errors)) {
            // New format: structured error response
            const errorMessages = errorData.errors.map(err => `${err.field}: ${err.message}`).join(', ');
            throw new Error(`Validation error: ${errorMessages}`);
          } else if (errorData.detail) {
            if (Array.isArray(errorData.detail)) {
              // Old format: FastAPI default format
              const errorMessages = errorData.detail.map(err => `${err.loc.join('.')}: ${err.msg}`).join(', ');
              throw new Error(`Validation error: ${errorMessages}`);
            } else if (typeof errorData.detail === 'string') {
              throw new Error(errorData.detail);
            }
          }
        }
        
        throw new Error(errorData.detail || errorData.message || `HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Authentication methods
  async login(email, password) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    
    // Store the token in localStorage
    if (response.access_token) {
      localStorage.setItem('authToken', response.access_token);
    }
    
    return response;
  }

  async register(userData) {
    const response = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
    
    // Store the token in localStorage
    if (response.access_token) {
      localStorage.setItem('authToken', response.access_token);
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
    
    // Store the token in localStorage
    if (response.access_token) {
      localStorage.setItem('authToken', response.access_token);
    }
    
    return response;
  }

  async logout() {
    const response = await this.request('/auth/logout', {
      method: 'POST'
    });
    
    // Clear the token from localStorage
    localStorage.removeItem('authToken');
    
    return response;
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
    
    // Convert page to skip for backend
    const skip = (page - 1) * limit;
    params.append('skip', skip.toString());
    params.append('limit', limit.toString());
    
    if (search) {
      params.append('search', search);
    }
    if (category) {
      params.append('category', category);
    }
    if (sort) {
      params.append('sort', sort);
    }
    
    // Add additional filters
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
}

export default new ApiService();

