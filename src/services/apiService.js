// Enhanced API service using enterprise-level authentication
import authService from './authService';

const API_BASE_URL = 'https://izishop-backend.onrender.com/api';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.authService = authService;
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

  // Generic request method with authentication
  async request(endpoint, options = {}, requireAuth = true) {
    const url = `${this.baseURL}${endpoint}`;
    
    if (requireAuth) {
      // Use authenticated request from auth service
      return await this.authService.authenticatedRequest(url, options);
    } else {
      // Public request
      const config = {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        ...options
      };
      return await fetch(url, config);
    }
  }

  // Helper method to handle API responses
  async handleResponse(response) {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || errorData.message || `HTTP ${response.status}`);
    }
    
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    }
    
    return response;
  }

  // Authentication endpoints
  async login(credentials) {
    return await this.authService.login(credentials);
  }

  async logout() {
    return await this.authService.logout();
  }

  async refreshToken() {
    return await this.authService.refreshAccessToken();
  }

  // User management endpoints
  async checkEmailExists(email) {
    const response = await this.request(`/api/auth/check-email/${encodeURIComponent(email)}`, {
      method: 'GET'
    }, false);
    return await this.handleResponse(response);
  }

  async checkPhoneExists(phone) {
    const response = await this.request('/auth/check-phone', {
      method: 'POST',
      body: JSON.stringify({ phone })
    }, false);
    return await this.handleResponse(response);
  }

  async register(userData) {
    const response = await this.request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    }, false);
    return await this.handleResponse(response);
  }

  async adminLogin(credentials) {
    const response = await this.request('/auth/admin-login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    }, false);
    return await this.handleResponse(response);
  }

  // Shop management endpoints
  async checkShopNameExists(name) {
    const response = await this.request('/shops/check-name', {
      method: 'POST',
      body: JSON.stringify({ name })
    }, false);
    return await this.handleResponse(response);
  }

  async createShop(shopData) {
    const response = await this.request('/shops', {
      method: 'POST',
      body: JSON.stringify(shopData)
    });
    return await this.handleResponse(response);
  }

  async getMyShop() {
    const response = await this.request('/shops/me');
    return await this.handleResponse(response);
  }

  async updateMyShop(shopData) {
    const response = await this.request('/shops/me', {
      method: 'PUT',
      body: JSON.stringify(shopData)
    });
    return await this.handleResponse(response);
  }

  // Product management endpoints
  async getMyProducts(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const response = await this.request(`/products/me${queryString ? `?${queryString}` : ''}`);
    return await this.handleResponse(response);
  }

  async createProduct(productData) {
    const response = await this.request('/products', {
      method: 'POST',
      body: JSON.stringify(productData)
    });
    return await this.handleResponse(response);
  }

  async updateProduct(productId, productData) {
    const response = await this.request(`/products/${productId}`, {
      method: 'PUT',
      body: JSON.stringify(productData)
    });
    return await this.handleResponse(response);
  }

  async deleteProduct(productId) {
    const response = await this.request(`/products/${productId}`, {
      method: 'DELETE'
    });
    return await this.handleResponse(response);
  }

  async searchMyProducts(query) {
    const response = await this.request(`/products/me/search?q=${encodeURIComponent(query)}`);
    return await this.handleResponse(response);
  }

  // Order management endpoints
  async getShopOwnerOrders(filters = {}) {
    const queryParams = new URLSearchParams(filters).toString();
    const response = await this.request(`/shop-owner/orders${queryParams ? `?${queryParams}` : ''}`);
    return await this.handleResponse(response);
  }

  async getShopOwnerRecentOrders(limit = 5) {
    const response = await this.request(`/shop-owner/orders/recent?limit=${limit}`);
    return await this.handleResponse(response);
  }

  async updateOrderStatus(orderId, status) {
    const response = await this.request(`/shop-owner/orders/${orderId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    });
    return await this.handleResponse(response);
  }

  async searchMyOrders(query) {
    const response = await this.request(`/shop-owner/orders/search?q=${encodeURIComponent(query)}`);
    return await this.handleResponse(response);
  }

  // Dashboard statistics endpoints
  async getShopOwnerTodayStats() {
    const response = await this.request('/shop-owner/stats/today');
    return await this.handleResponse(response);
  }

  async getShopOwnerLowStockProducts() {
    const response = await this.request('/shop-owner/products/low-stock');
    return await this.handleResponse(response);
  }

  // Rating and review endpoints
  async getMyShopRatingStats() {
    const response = await this.request('/ratings/my-shop/stats');
    return await this.handleResponse(response);
  }

  async getShopRatings(shopId, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const response = await this.request(`/ratings/shop/${shopId}${queryString ? `?${queryString}` : ''}`);
    return await this.handleResponse(response);
  }

  // Notification endpoints
  async getUserNotifications(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const response = await this.request(`/notifications${queryString ? `?${queryString}` : ''}`);
    return await this.handleResponse(response);
  }

  async markNotificationAsRead(notificationId) {
    const response = await this.request(`/api/notifications/${notificationId}/read`, {
      method: 'PUT'
    });
    return await this.handleResponse(response);
  }

  async markAllNotificationsAsRead() {
    const response = await this.request('/api/notifications/mark-all-read', {
      method: 'PUT'
    });
    return await this.handleResponse(response);
  }

  async deleteNotification(notificationId) {
    const response = await this.request(`/api/notifications/${notificationId}`, {
      method: 'DELETE'
    });
    return await this.handleResponse(response);
  }

  // File upload endpoints
  async uploadFile(file, type = 'image') {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    const response = await this.request('/upload', {
      method: 'POST',
      body: formData,
      headers: {
        // Don't set Content-Type for FormData
      }
    });
    return await this.handleResponse(response);
  }

  // Search endpoints
  async globalSearch(query, filters = {}) {
    const params = new URLSearchParams({
      q: query,
      ...filters
    });
    const response = await this.request(`/search?${params}`);
    return await this.handleResponse(response);
  }

  // Category endpoints
  async getCategories() {
    const response = await this.request('/categories', {}, false);
    return await this.handleResponse(response);
  }

  // Location endpoints
  async getLocations() {
    const response = await this.request('/locations', {}, false);
    return await this.handleResponse(response);
  }

  // Public shop endpoints
  async getPublicShops(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const response = await this.request(`/shops${queryString ? `?${queryString}` : ''}`, {}, false);
    return await this.handleResponse(response);
  }

  async getShopDetails(shopId) {
    const response = await this.request(`/shops/${shopId}`, {}, false);
    return await this.handleResponse(response);
  }

  async getShopProducts(shopId, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const response = await this.request(`/shops/${shopId}/products${queryString ? `?${queryString}` : ''}`, {}, false);
    return await this.handleResponse(response);
  }

  // Public product endpoints
  async getPublicProducts(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const response = await this.request(`/products${queryString ? `?${queryString}` : ''}`, {}, false);
    return await this.handleResponse(response);
  }

  async getProductDetails(productId) {
    const response = await this.request(`/products/${productId}`, {}, false);
    return await this.handleResponse(response);
  }

  // Utility methods
  isAuthenticated() {
    return this.authService.isAuthenticated();
  }

  getUserInfo() {
    return this.authService.getUserInfo();
  }

  getAccessToken() {
    return this.authService.getAccessToken();
  }

  // Error handling helper
  createErrorResponse(message, status = 500) {
    const error = new Error(message);
    error.status = status;
    return error;
  }
}

// Create singleton instance
const apiService = new ApiService();

export default apiService;