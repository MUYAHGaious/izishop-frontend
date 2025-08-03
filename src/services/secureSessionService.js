/**
 * Secure Session Management Service
 * Implements session handling best practices with silent token refresh
 */

import authService from './authService';

class SecureSessionService {
  constructor() {
    this.isInitialized = false;
    this.refreshInProgress = false;
    this.sessionListeners = [];
    this.refreshTimer = null;
    this.heartbeatTimer = null;
    
    // Configuration following best practices
    this.config = {
      // Silent refresh - token refreshed 2 minutes before expiry
      refreshBuffer: 2 * 60 * 1000, // 2 minutes
      
      // Heartbeat to check session validity every 5 minutes
      heartbeatInterval: 5 * 60 * 1000, // 5 minutes
      
      // Maximum retry attempts for failed refresh
      maxRetryAttempts: 3,
      
      // Retry delay (exponential backoff)
      retryBaseDelay: 1000, // 1 second
      
      // Silent operation - no popups or interruptions
      silentMode: true
    };
    
    this.retryAttempts = 0;
    this.init();
  }

  /**
   * Initialize the secure session service
   */
  init() {
    try {
      if (this.isInitialized) return;
      
      // Start silent monitoring if user is authenticated
      if (this.isAuthenticated()) {
        this.startSessionMonitoring();
      }
      
      // Listen for authentication events with error handling
      try {
        window.addEventListener('userAuthenticated', this.handleUserAuthenticated.bind(this));
        window.addEventListener('userLoggedOut', this.handleUserLoggedOut.bind(this));
        
        // Handle page visibility changes
        document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
        
        // Handle browser tab/window close
        window.addEventListener('beforeunload', this.cleanup.bind(this));
      } catch (error) {
        console.error('Error setting up event listeners:', error);
      }
      
      this.isInitialized = true;
    } catch (error) {
      console.error('Error initializing secureSessionService:', error);
      this.isInitialized = false;
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    try {
      return authService && authService.isAuthenticated ? authService.isAuthenticated() : false;
    } catch (error) {
      console.error('Error checking authentication status:', error);
      return false;
    }
  }

  /**
   * Start silent session monitoring
   */
  startSessionMonitoring() {
    if (this.refreshTimer || this.heartbeatTimer) {
      this.stopSessionMonitoring();
    }

    // Schedule token refresh before expiry
    this.scheduleTokenRefresh();
    
    // Start heartbeat to validate session
    this.startHeartbeat();
  }

  /**
   * Stop session monitoring
   */
  stopSessionMonitoring() {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }
    
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  /**
   * Schedule token refresh before expiry (silent)
   */
  scheduleTokenRefresh() {
    const accessToken = authService.getAccessToken();
    if (!accessToken) return;

    const expiryTime = this.getTokenExpirationTime(accessToken);
    if (!expiryTime) return;

    const now = Date.now();
    const timeUntilRefresh = expiryTime - now - this.config.refreshBuffer;

    // Only schedule if token will expire in the future
    if (timeUntilRefresh > 0) {
      this.refreshTimer = setTimeout(() => {
        this.silentTokenRefresh();
      }, timeUntilRefresh);
    } else {
      // Token expires soon, refresh immediately
      this.silentTokenRefresh();
    }
  }

  /**
   * Silent token refresh (no UI interruption)
   */
  async silentTokenRefresh() {
    if (this.refreshInProgress) return;
    
    try {
      this.refreshInProgress = true;
      
      // Attempt to refresh token silently
      await authService.refreshAccessToken();
      
      // Reset retry attempts on success
      this.retryAttempts = 0;
      
      // Schedule next refresh
      this.scheduleTokenRefresh();
      
      // Notify listeners of successful refresh
      this.notifySessionListeners({
        type: 'silent_refresh_success',
        timestamp: Date.now()
      });
      
    } catch (error) {
      this.handleRefreshError(error);
    } finally {
      this.refreshInProgress = false;
    }
  }

  /**
   * Handle token refresh errors
   */
  handleRefreshError(error) {
    this.retryAttempts++;
    
    // If refresh token is expired or invalid, perform silent logout
    if (error.message?.includes('expired') || 
        error.message?.includes('invalid') ||
        this.retryAttempts >= this.config.maxRetryAttempts) {
      
      this.performSilentLogout('session_expired');
      return;
    }
    
    // For network errors, retry with exponential backoff
    const retryDelay = this.config.retryBaseDelay * Math.pow(2, this.retryAttempts - 1);
    
    setTimeout(() => {
      this.silentTokenRefresh();
    }, Math.min(retryDelay, 30000)); // Max 30 seconds delay
  }

  /**
   * Start heartbeat to validate session
   */
  startHeartbeat() {
    this.heartbeatTimer = setInterval(() => {
      this.validateSession();
    }, this.config.heartbeatInterval);
  }

  /**
   * Validate current session
   */
  async validateSession() {
    if (!this.isAuthenticated()) {
      this.stopSessionMonitoring();
      return;
    }

    try {
      // Make a lightweight API call to validate session
      const response = await fetch('/api/auth/validate-session', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authService.getAccessToken()}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Session invalid, attempt silent refresh
          await this.silentTokenRefresh();
        }
      }
    } catch (error) {
      // Network error - ignore for now, will be caught by next heartbeat
      console.debug('Session validation failed:', error.message);
    }
  }

  /**
   * Perform silent logout without user interruption
   */
  performSilentLogout(reason = 'session_expired') {
    try {
      // Stop monitoring
      this.stopSessionMonitoring();
      
      // Clear tokens and session data
      authService.clearTokens();
      
      // Notify listeners
      this.notifySessionListeners({
        type: 'silent_logout',
        reason,
        timestamp: Date.now()
      });
      
      // Dispatch event for components to handle
      window.dispatchEvent(new CustomEvent('silentLogout', {
        detail: { reason }
      }));
      
    } catch (error) {
      console.error('Error during silent logout:', error);
    }
  }

  /**
   * Handle user authentication event
   */
  handleUserAuthenticated() {
    this.retryAttempts = 0;
    this.startSessionMonitoring();
  }

  /**
   * Handle user logout event
   */
  handleUserLoggedOut() {
    this.stopSessionMonitoring();
    this.retryAttempts = 0;
  }

  /**
   * Handle page visibility changes
   */
  handleVisibilityChange() {
    if (!document.hidden && this.isAuthenticated()) {
      // Page became visible, validate session
      this.validateSession();
    }
  }

  /**
   * Get token expiration time
   */
  getTokenExpirationTime(token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000; // Convert to milliseconds
    } catch (error) {
      return null;
    }
  }

  /**
   * Add session listener
   */
  addSessionListener(listener) {
    this.sessionListeners.push(listener);
    
    // Return unsubscribe function
    return () => {
      this.sessionListeners = this.sessionListeners.filter(l => l !== listener);
    };
  }

  /**
   * Notify session listeners
   */
  notifySessionListeners(data) {
    this.sessionListeners.forEach(listener => {
      try {
        listener(data);
      } catch (error) {
        console.error('Error in session listener:', error);
      }
    });
  }

  /**
   * Get session status
   */
  getSessionStatus() {
    const accessToken = authService.getAccessToken();
    const refreshToken = authService.getRefreshToken();
    
    if (!accessToken || !refreshToken) {
      return { status: 'unauthenticated' };
    }
    
    const accessExpiry = this.getTokenExpirationTime(accessToken);
    const refreshExpiry = this.getTokenExpirationTime(refreshToken);
    const now = Date.now();
    
    return {
      status: 'authenticated',
      accessTokenValid: accessExpiry > now,
      refreshTokenValid: refreshExpiry > now,
      timeToAccessExpiry: Math.max(0, accessExpiry - now),
      timeToRefreshExpiry: Math.max(0, refreshExpiry - now)
    };
  }

  /**
   * Force token refresh (for manual refresh requests)
   */
  async forceRefresh() {
    return this.silentTokenRefresh();
  }

  /**
   * Cleanup when service is destroyed
   */
  cleanup() {
    this.stopSessionMonitoring();
    this.sessionListeners = [];
    
    // Remove event listeners
    window.removeEventListener('userAuthenticated', this.handleUserAuthenticated);
    window.removeEventListener('userLoggedOut', this.handleUserLoggedOut);
    document.removeEventListener('visibilitychange', this.handleVisibilityChange);
    window.removeEventListener('beforeunload', this.cleanup);
    
    this.isInitialized = false;
  }
}

// Create singleton instance
const secureSessionService = new SecureSessionService();

export default secureSessionService;