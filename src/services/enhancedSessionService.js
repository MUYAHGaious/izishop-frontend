/**
 * Enhanced Session Management Service
 * Implements enterprise-grade session handling like tech giants
 */

import authService from './authService';
import activityDetectionService from './activityDetectionService';

class EnhancedSessionService {
  constructor() {
    this.sessionState = 'ACTIVE'; // ACTIVE, IDLE, WARNING, EXPIRING, OFFLINE
    this.sessionListeners = [];
    this.warningShown = false;
    this.refreshInProgress = false;
    this.offlineQueue = [];
    this.sessionConfig = {
      // Token lifetimes
      accessTokenLifetime: 15 * 60 * 1000, // 15 minutes
      refreshTokenLifetime: 7 * 24 * 60 * 60 * 1000, // 7 days
      sessionTokenLifetime: 30 * 24 * 60 * 60 * 1000, // 30 days
      
      // Activity thresholds
      idleThreshold: 5 * 60 * 1000, // 5 minutes
      warningThreshold: 25 * 60 * 1000, // 25 minutes
      autoRefreshBuffer: 2 * 60 * 1000, // 2 minutes before expiry
      
      // Retry settings
      maxRetryAttempts: 3,
      retryBaseDelay: 1000,
      
      // Warning settings
      showWarningOnlyWhenNecessary: true,
      subtleNotifications: true
    };

    this.init();
  }

  /**
   * Initialize the enhanced session service
   */
  init() {
    // Listen to activity detection events
    activityDetectionService.addActivityListener(this.handleActivity.bind(this));
    
    // Listen to user idle/active events
    window.addEventListener('userActivity', this.handleUserActivity.bind(this));
    window.addEventListener('userIdle', this.handleUserIdle.bind(this));
    window.addEventListener('userActive', this.handleUserActive.bind(this));
    
    // Listen to auth service events
    window.addEventListener('tokenRefresh', this.handleTokenRefresh.bind(this));
    window.addEventListener('authError', this.handleAuthError.bind(this));
    
    // Start session monitoring
    this.startSessionMonitoring();
  }

  /**
   * Handle user activity
   */
  handleActivity(activityData) {
    // Record API activity when detected
    if (activityData.type === 'api_call') {
      activityDetectionService.recordApiActivity(
        activityData.metadata?.endpoint,
        activityData.metadata?.method
      );
    }

    // If user was idle and becomes active, extend session
    if (activityData.wasIdle && this.isAuthenticated()) {
      this.extendSessionIfNeeded();
    }

    // Update session state based on activity
    if (this.sessionState === 'IDLE' || this.sessionState === 'WARNING') {
      this.updateSessionState('ACTIVE');
    }
  }

  /**
   * Handle user activity event
   */
  handleUserActivity(event) {
    // User is active, ensure session is extended if needed
    if (this.isAuthenticated()) {
      this.extendSessionIfNeeded();
    }
  }

  /**
   * Handle user idle event
   */
  handleUserIdle(event) {
    this.updateSessionState('IDLE');
  }

  /**
   * Handle user active event (coming back from idle)
   */
  handleUserActive(event) {
    this.updateSessionState('ACTIVE');
    
    // If user becomes active, try to refresh token if needed
    if (this.isAuthenticated()) {
      this.extendSessionIfNeeded();
    }
  }

  /**
   * Handle token refresh success
   */
  handleTokenRefresh(event) {
    this.refreshInProgress = false;
    this.warningShown = false;
    this.updateSessionState('ACTIVE');
    
    // Process offline queue
    this.processOfflineQueue();
  }

  /**
   * Handle authentication errors
   */
  handleAuthError(event) {
    this.updateSessionState('EXPIRING');
    this.handleSessionExpiry();
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    return authService.isAuthenticated();
  }

  /**
   * Get current session state
   */
  getSessionState() {
    return this.sessionState;
  }

  /**
   * Update session state and notify listeners
   */
  updateSessionState(newState) {
    const oldState = this.sessionState;
    this.sessionState = newState;
    
    if (oldState !== newState) {
      this.notifySessionListeners({
        oldState,
        newState,
        timestamp: Date.now()
      });
    }
  }

  /**
   * Start session monitoring
   */
  startSessionMonitoring() {
    // Monitor session every 2 minutes (increased from 30 seconds to reduce load)
    this.monitoringInterval = setInterval(() => {
      this.checkSessionHealth();
    }, 120000);
  }

  /**
   * Check session health and take appropriate actions
   */
  async checkSessionHealth() {
    if (!this.isAuthenticated()) {
      this.updateSessionState('OFFLINE');
      return;
    }

    const accessToken = authService.getAccessToken();
    const refreshToken = authService.getRefreshToken();
    
    if (!accessToken) {
      this.updateSessionState('EXPIRING');
      return;
    }

    // Check token expiration times
    const accessExpiry = this.getTokenExpirationTime(accessToken);
    const refreshExpiry = refreshToken ? this.getTokenExpirationTime(refreshToken) : null;
    const now = Date.now();

    // Check if refresh token is expiring soon (this is when we should warn)
    if (refreshExpiry && (refreshExpiry - now) < (24 * 60 * 60 * 1000)) { // 24 hours
      if (!this.warningShown && this.sessionConfig.showWarningOnlyWhenNecessary) {
        this.showSubtleSessionWarning();
      }
    }

    // Auto-refresh access token if needed
    if (accessExpiry && (accessExpiry - now) < this.sessionConfig.autoRefreshBuffer) {
      await this.extendSessionIfNeeded();
    }
  }

  /**
   * Extend session if needed (smart refresh)
   */
  async extendSessionIfNeeded() {
    if (this.refreshInProgress) {
      return;
    }

    const accessToken = authService.getAccessToken();
    const refreshToken = authService.getRefreshToken();

    if (!accessToken || !refreshToken) {
      return;
    }

    const accessExpiry = this.getTokenExpirationTime(accessToken);
    const now = Date.now();

    // Only refresh if access token expires within buffer time
    if (accessExpiry && (accessExpiry - now) < this.sessionConfig.autoRefreshBuffer) {
      try {
        this.refreshInProgress = true;
        await this.silentTokenRefresh();
      } catch (error) {
        console.error('Silent token refresh failed:', error);
        this.handleRefreshFailure(error);
      }
    }
  }

  /**
   * Silent token refresh (background, no UI interruption)
   */
  async silentTokenRefresh() {
    try {
      await authService.refreshAccessToken();
      
      // Dispatch success event
      window.dispatchEvent(new CustomEvent('silentRefreshSuccess', {
        detail: { timestamp: Date.now() }
      }));
      
      console.log('EnhancedSession: Silent token refresh successful');
      
    } catch (error) {
      console.error('EnhancedSession: Silent token refresh failed:', error);
      throw error;
    }
  }

  /**
   * Handle refresh failure
   */
  handleRefreshFailure(error) {
    this.refreshInProgress = false;
    
    // Only show warning if refresh token is actually expired
    if (error.message.includes('expired') || error.message.includes('invalid')) {
      this.updateSessionState('EXPIRING');
      this.showGracefulLogoutWarning();
    } else {
      // Network error or temporary issue - retry later
      this.scheduleRetryRefresh();
    }
  }

  /**
   * Schedule retry for token refresh
   */
  scheduleRetryRefresh() {
    const delay = this.sessionConfig.retryBaseDelay * Math.pow(2, Math.min(this.retryAttempts || 0, 5));
    
    setTimeout(() => {
      this.extendSessionIfNeeded();
    }, delay);
  }

  /**
   * Show subtle session warning (non-intrusive)
   */
  showSubtleSessionWarning() {
    this.warningShown = true;
    
    // Dispatch event for UI to show subtle notification
    window.dispatchEvent(new CustomEvent('showSubtleSessionWarning', {
      detail: {
        type: 'session_expiring_soon',
        message: 'Your session will expire in 24 hours. Your work will be saved automatically.',
        action: 'extend',
        subtle: true
      }
    }));
  }

  /**
   * Show graceful logout warning
   */
  showGracefulLogoutWarning() {
    // Save any pending work first
    this.saveUserWork();
    
    // Show graceful logout dialog
    window.dispatchEvent(new CustomEvent('showGracefulLogout', {
      detail: {
        type: 'session_expired',
        message: 'Your session has expired. Please sign in again to continue.',
        autoSave: true,
        graceful: true
      }
    }));
  }

  /**
   * Save user work before logout
   */
  saveUserWork() {
    // Dispatch event for components to save their state
    window.dispatchEvent(new CustomEvent('saveUserWork', {
      detail: { timestamp: Date.now() }
    }));
    
    // Save form data to localStorage as backup
    this.saveFormsToLocalStorage();
  }

  /**
   * Save form data to localStorage
   */
  saveFormsToLocalStorage() {
    try {
      const forms = document.querySelectorAll('form');
      const formData = {};
      
      forms.forEach((form, index) => {
        const data = new FormData(form);
        const formObject = {};
        
        for (let [key, value] of data.entries()) {
          formObject[key] = value;
        }
        
        if (Object.keys(formObject).length > 0) {
          formData[`form_${index}`] = formObject;
        }
      });
      
      if (Object.keys(formData).length > 0) {
        localStorage.setItem('saved_form_data', JSON.stringify({
          data: formData,
          timestamp: Date.now()
        }));
      }
    } catch (error) {
      console.error('Failed to save form data:', error);
    }
  }

  /**
   * Restore saved form data
   */
  restoreSavedFormData() {
    try {
      const savedData = localStorage.getItem('saved_form_data');
      if (savedData) {
        const { data, timestamp } = JSON.parse(savedData);
        
        // Only restore if saved within last hour
        if (Date.now() - timestamp < 60 * 60 * 1000) {
          window.dispatchEvent(new CustomEvent('restoreFormData', {
            detail: { data, timestamp }
          }));
        }
        
        // Clean up
        localStorage.removeItem('saved_form_data');
      }
    } catch (error) {
      console.error('Failed to restore form data:', error);
    }
  }

  /**
   * Handle session expiry gracefully
   */
  handleSessionExpiry() {
    this.saveUserWork();
    this.updateSessionState('EXPIRING');
    
    // Give user 30 seconds to see the graceful logout message
    setTimeout(() => {
      this.performGracefulLogout();
    }, 30000);
  }

  /**
   * Perform graceful logout
   */
  async performGracefulLogout() {
    try {
      // Clear session data
      authService.clearTokens();
      
      // Clear activity detection
      activityDetectionService.reset();
      
      // Use custom event instead of forced redirect
      const returnUrl = encodeURIComponent(window.location.pathname + window.location.search);
      window.dispatchEvent(new CustomEvent('authenticationRequired', { 
        detail: { reason: 'session_expired', returnUrl } 
      }));
      
    } catch (error) {
      console.error('Error during graceful logout:', error);
      // Use custom event instead of force reload
      window.dispatchEvent(new CustomEvent('authenticationRequired', { 
        detail: { reason: 'session_error', error: error.message } 
      }));
    }
  }

  /**
   * Add session change listener
   */
  addSessionListener(listener) {
    this.sessionListeners.push(listener);
  }

  /**
   * Remove session change listener
   */
  removeSessionListener(listener) {
    this.sessionListeners = this.sessionListeners.filter(l => l !== listener);
  }

  /**
   * Notify session listeners
   */
  notifySessionListeners(sessionData) {
    this.sessionListeners.forEach(listener => {
      try {
        listener(sessionData);
      } catch (error) {
        console.error('Error in session listener:', error);
      }
    });
  }

  /**
   * Get token expiration time
   */
  getTokenExpirationTime(token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000;
    } catch (error) {
      return null;
    }
  }

  /**
   * Add operation to offline queue
   */
  addToOfflineQueue(operation) {
    this.offlineQueue.push({
      ...operation,
      timestamp: Date.now()
    });
  }

  /**
   * Process offline queue when connection is restored
   */
  async processOfflineQueue() {
    if (this.offlineQueue.length === 0) return;
    
    console.log(`Processing ${this.offlineQueue.length} offline operations`);
    
    const operations = [...this.offlineQueue];
    this.offlineQueue = [];
    
    for (const operation of operations) {
      try {
        await operation.execute();
      } catch (error) {
        console.error('Failed to execute offline operation:', error);
        // Re-queue if it's a temporary error
        if (!error.message.includes('expired')) {
          this.offlineQueue.push(operation);
        }
      }
    }
  }

  /**
   * Cleanup when service is destroyed
   */
  destroy() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }
    
    this.sessionListeners = [];
    activityDetectionService.destroy();
  }
}

// Create singleton instance
const enhancedSessionService = new EnhancedSessionService();

export default enhancedSessionService;