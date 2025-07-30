// Enterprise-level authentication service
// Implements secure token management with automatic refresh and rotation

const API_BASE_URL = 'http://localhost:8000/api';

class AuthService {
  constructor() {
    this.accessToken = null;
    this.refreshToken = null;
    this.isRefreshing = false;
    this.pendingRequests = [];
    this.refreshTimer = null;
    this.retryAttempts = 0;
    this.maxRetryAttempts = 3;
    this.tokenCheckInterval = null;
    
    // Initialize from storage
    this.loadTokensFromStorage();
    
    // Start background token monitoring
    this.startTokenMonitoring();
    
    // Listen for storage changes (multi-tab sync)
    window.addEventListener('storage', this.handleStorageChange.bind(this));
    
    // Listen for page visibility changes
    document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
  }

  // Load tokens from secure storage
  loadTokensFromStorage() {
    try {
      this.accessToken = localStorage.getItem('accessToken');
      this.refreshToken = localStorage.getItem('refreshToken');
      console.log('AuthService: Loaded tokens from storage - access:', !!this.accessToken, 'refresh:', !!this.refreshToken);
    } catch (error) {
      console.warn('Failed to load tokens from storage:', error);
      this.clearTokens();
    }
  }

  // Save tokens to storage with encryption (simplified for demo)
  saveTokensToStorage() {
    try {
      if (this.accessToken) {
        localStorage.setItem('accessToken', this.accessToken);
      }
      if (this.refreshToken) {
        localStorage.setItem('refreshToken', this.refreshToken);
      }
      
      // Store token timestamp for monitoring
      localStorage.setItem('tokenTimestamp', Date.now().toString());
    } catch (error) {
      console.error('Failed to save tokens to storage:', error);
    }
  }

  // Clear all authentication data
  clearTokens() {
    this.accessToken = null;
    this.refreshToken = null;
    
    // Clear storage
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    localStorage.removeItem('tokenTimestamp');
    
    // Stop monitoring
    this.stopTokenMonitoring();
    
    // Clear pending requests
    this.pendingRequests = [];
    this.isRefreshing = false;
    this.retryAttempts = 0;
  }

  // Get current access token
  getAccessToken() {
    return this.accessToken;
  }

  // Get current refresh token
  getRefreshToken() {
    return this.refreshToken;
  }

  // Set tokens (used by API service)
  setTokens(accessToken, refreshToken) {
    console.log('AuthService: Setting tokens - access:', !!accessToken, 'refresh:', !!refreshToken);
    this.accessToken = accessToken;
    if (refreshToken) {
      this.refreshToken = refreshToken;
    }
    this.saveTokensToStorage();
    this.scheduleTokenRefresh();
    console.log('AuthService: Tokens set and saved, isAuthenticated():', this.isAuthenticated());
  }

  // Check if user is authenticated
  isAuthenticated() {
    if (!this.accessToken) {
      return false;
    }
    
    // Check if access token is expired (with small buffer)
    if (this.isTokenExpired(this.accessToken, 30)) {
      console.log('AuthService: Access token expired, checking refresh token');
      
      // If we have a refresh token, check if it's still valid
      if (this.refreshToken) {
        if (this.isTokenExpired(this.refreshToken, 0)) {
          console.log('AuthService: Refresh token also expired, user not authenticated');
          return false;
        }
        
        // Refresh token is still valid, trigger refresh
        console.log('AuthService: Refresh token valid, will attempt refresh');
        this.checkAndRefreshTokens().catch(error => {
          console.error('AuthService: Failed to refresh token during auth check:', error);
        });
        
        // Return true for now, refresh will happen in background
        return true;
      } else {
        // No refresh token available and access token is expired
        console.log('AuthService: Access token expired and no refresh token available');
        return false;
      }
    }
    
    return true;
  }

  // Decode JWT token payload
  decodeToken(token) {
    if (!token) return null;
    
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.warn('Failed to decode token:', error);
      return null;
    }
  }

  // Check if token is expired (with buffer)
  isTokenExpired(token, bufferSeconds = 60) {
    const payload = this.decodeToken(token);
    if (!payload || !payload.exp) return true;
    
    const currentTime = Math.floor(Date.now() / 1000);
    return payload.exp <= (currentTime + bufferSeconds);
  }

  // Get token expiration time
  getTokenExpirationTime(token) {
    const payload = this.decodeToken(token);
    return payload?.exp ? payload.exp * 1000 : null;
  }

  // Start background token monitoring
  startTokenMonitoring() {
    // Check tokens every 30 seconds
    this.tokenCheckInterval = setInterval(() => {
      this.checkAndRefreshTokens();
    }, 30000);
  }

  // Stop token monitoring
  stopTokenMonitoring() {
    if (this.tokenCheckInterval) {
      clearInterval(this.tokenCheckInterval);
      this.tokenCheckInterval = null;
    }
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }
  }

  // Handle storage changes (multi-tab synchronization)
  handleStorageChange(event) {
    if (['accessToken', 'refreshToken'].includes(event.key)) {
      if (!event.newValue) {
        // Tokens were cleared in another tab
        this.clearTokens();
        this.handleLogout();
      } else {
        // Tokens were updated in another tab
        this.loadTokensFromStorage();
      }
    }
  }

  // Handle page visibility changes
  handleVisibilityChange() {
    if (!document.hidden && this.isAuthenticated()) {
      // Page became visible, check tokens immediately
      this.checkAndRefreshTokens();
    }
  }

  // Proactive token refresh check
  async checkAndRefreshTokens() {
    if (!this.isAuthenticated()) return;

    try {
      // Check if access token needs refresh (5 minutes before expiry)
      if (this.isTokenExpired(this.accessToken, 300)) {
        // Only attempt refresh if we have a refresh token
        if (this.refreshToken) {
          await this.refreshAccessToken();
        } else {
          console.log('AuthService: Access token needs refresh but no refresh token available');
        }
      }
    } catch (error) {
      console.warn('Background token refresh failed:', error);
    }
  }

  // Schedule next token refresh
  scheduleTokenRefresh() {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
    }

    if (!this.accessToken) return;

    const expirationTime = this.getTokenExpirationTime(this.accessToken);
    if (!expirationTime) return;

    // Schedule refresh 5 minutes before expiry
    const refreshTime = expirationTime - Date.now() - (5 * 60 * 1000);
    
    if (refreshTime > 0) {
      this.refreshTimer = setTimeout(() => {
        this.checkAndRefreshTokens();
      }, refreshTime);
    }
  }

  // Refresh access token with retry logic
  async refreshAccessToken() {
    if (!this.refreshToken) {
      throw new Error('No refresh token available');
    }

    if (this.isRefreshing) {
      // Return promise that resolves when current refresh completes
      return new Promise((resolve, reject) => {
        this.pendingRequests.push({ resolve, reject });
      });
    }

    try {
      this.isRefreshing = true;
      
      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          refresh_token: this.refreshToken 
        })
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          // Refresh token is invalid or expired
          throw new Error('Refresh token expired');
        }
        throw new Error(`Token refresh failed: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.access_token) {
        throw new Error('No access token in refresh response');
      }

      // Update tokens
      this.accessToken = data.access_token;
      if (data.refresh_token) {
        this.refreshToken = data.refresh_token; // Token rotation
      }
      
      // Save to storage
      this.saveTokensToStorage();
      
      // Schedule next refresh
      this.scheduleTokenRefresh();
      
      // Reset retry attempts
      this.retryAttempts = 0;
      
      // Resolve pending requests
      this.resolvePendingRequests(null, this.accessToken);
      
      // Dispatch token refresh event
      this.dispatchTokenRefreshEvent();
      
      return this.accessToken;
      
    } catch (error) {
      this.retryAttempts++;
      
      // If max retries reached or critical error, logout
      if (this.retryAttempts >= this.maxRetryAttempts || 
          error.message.includes('expired') || 
          error.message.includes('invalid')) {
        
        this.handleAuthenticationFailure(error);
        this.rejectPendingRequests(error);
      } else {
        // Retry with exponential backoff
        const retryDelay = Math.pow(2, this.retryAttempts) * 1000;
        setTimeout(() => {
          this.refreshAccessToken();
        }, retryDelay);
        
        this.rejectPendingRequests(error);
      }
      
      throw error;
    } finally {
      this.isRefreshing = false;
    }
  }

  // Resolve pending requests after successful token refresh
  resolvePendingRequests(error, token) {
    this.pendingRequests.forEach(({ resolve, reject }) => {
      if (error) {
        reject(error);
      } else {
        resolve(token);
      }
    });
    this.pendingRequests = [];
  }

  // Reject pending requests on failure
  rejectPendingRequests(error) {
    this.pendingRequests.forEach(({ reject }) => {
      reject(error);
    });
    this.pendingRequests = [];
  }

  // Handle authentication failure
  handleAuthenticationFailure(error) {
    console.warn('Authentication failure:', error.message);
    
    // Clear tokens
    this.clearTokens();
    
    // Dispatch logout event
    this.dispatchLogoutEvent();
    
    // Show user-friendly message
    this.showSessionExpiredMessage();
    
    // Redirect to login after delay
    setTimeout(() => {
      this.redirectToLogin();
    }, 2000);
  }

  // Handle logout
  handleLogout() {
    this.clearTokens();
    this.dispatchLogoutEvent();
    this.redirectToLogin();
  }

  // Dispatch custom events
  dispatchTokenRefreshEvent() {
    window.dispatchEvent(new CustomEvent('tokenRefresh', {
      detail: { accessToken: this.accessToken }
    }));
  }

  dispatchLogoutEvent() {
    window.dispatchEvent(new CustomEvent('authLogout'));
  }

  // Show session expired message
  showSessionExpiredMessage() {
    // Create toast notification
    const event = new CustomEvent('showToast', {
      detail: {
        type: 'warning',
        message: 'Your session has expired. Please log in again.',
        duration: 5000
      }
    });
    window.dispatchEvent(event);
  }

  // Redirect to login
  redirectToLogin() {
    const currentPath = window.location.pathname;
    if (!currentPath.includes('/authentication')) {
      // Store current path for redirect after login
      localStorage.setItem('redirectPath', currentPath);
      window.location.href = '/authentication-login-register';
    }
  }

  // Login with credentials
  async login(credentials) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Login failed');
      }

      const data = await response.json();
      
      // Store tokens
      this.accessToken = data.access_token;
      this.refreshToken = data.refresh_token;
      this.saveTokensToStorage();
      
      // Store user data
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
      }
      
      // Start monitoring
      this.startTokenMonitoring();
      this.scheduleTokenRefresh();
      
      return data;
      
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }

  // Logout
  async logout() {
    try {
      // Notify backend
      if (this.refreshToken) {
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.accessToken}`
          },
          body: JSON.stringify({ 
            refresh_token: this.refreshToken 
          })
        }).catch(() => {
          // Ignore logout API errors
        });
      }
    } finally {
      this.handleLogout();
    }
  }

  // Get auth headers for API requests
  getAuthHeaders() {
    return {
      'Content-Type': 'application/json',
      ...(this.accessToken && { 'Authorization': `Bearer ${this.accessToken}` })
    };
  }

  // Enhanced request method with automatic token handling
  async authenticatedRequest(url, options = {}) {
    // Ensure we have a valid token
    if (this.isAuthenticated() && this.isTokenExpired(this.accessToken, 60)) {
      try {
        await this.refreshAccessToken();
      } catch (error) {
        throw new Error('Authentication required');
      }
    }

    // Add auth headers
    const config = {
      ...options,
      headers: {
        ...this.getAuthHeaders(),
        ...options.headers
      }
    };

    try {
      const response = await fetch(url, config);
      
      // Handle 401 responses
      if (response.status === 401 && !url.includes('/auth/')) {
        try {
          await this.refreshAccessToken();
          
          // Retry with new token
          config.headers = {
            ...this.getAuthHeaders(),
            ...options.headers
          };
          return await fetch(url, config);
        } catch (refreshError) {
          throw new Error('Authentication required');
        }
      }
      
      return response;
    } catch (error) {
      console.error('Authenticated request failed:', error);
      throw error;
    }
  }

  // Get user info from token
  getUserInfo() {
    const payload = this.decodeToken(this.accessToken);
    return payload ? {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
      exp: payload.exp
    } : null;
  }

  // Cleanup on page unload
  destroy() {
    this.stopTokenMonitoring();
    window.removeEventListener('storage', this.handleStorageChange.bind(this));
    document.removeEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
  }
}

// Create singleton instance
const authService = new AuthService();

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  authService.destroy();
});

export default authService;