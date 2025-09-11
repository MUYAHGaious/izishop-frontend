/**
 * Secure Session Management Service
 * Implements session handling best practices for robust authentication
 */

class SessionService {
  constructor() {
    this.sessionId = null;
    this.sessionStartTime = null;
    this.lastActivityTime = null;
    this.sessionConfig = {
      // Session timeouts (in milliseconds)
      ABSOLUTE_TIMEOUT: 8 * 60 * 60 * 1000, // 8 hours maximum session
      IDLE_TIMEOUT: 30 * 60 * 1000, // 30 minutes idle timeout
      ACTIVITY_CHECK_INTERVAL: 60 * 1000, // Check activity every minute
      
      // Session security
      REGENERATE_ON_AUTH: true,
      REGENERATE_ON_PRIVILEGE_CHANGE: true,
      MAX_CONCURRENT_SESSIONS: 3,
      
      // Storage keys
      SESSION_ID_KEY: 'sessionId',
      SESSION_START_KEY: 'sessionStartTime',
      LAST_ACTIVITY_KEY: 'lastActivityTime',
      SESSION_DATA_KEY: 'sessionData'
    };
    
    this.activityTimer = null;
    this.sessionTimer = null;
    
    // Initialize session management
    this.initializeSession();
    this.setupActivityTracking();
  }

  /**
   * Generate cryptographically secure session ID
   * Following best practices: 64+ bits of entropy, meaningless content
   */
  generateSecureSessionId() {
    // Use crypto API for secure random generation
    if (window.crypto && window.crypto.getRandomValues) {
      const array = new Uint8Array(32); // 256 bits of entropy
      window.crypto.getRandomValues(array);
      return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    }
    
    // Fallback for older browsers (less secure)
    const timestamp = Date.now().toString(36);
    const randomStr = Math.random().toString(36).substring(2);
    const moreRandom = Math.random().toString(36).substring(2);
    return `${timestamp}-${randomStr}-${moreRandom}-${Date.now()}`;
  }

  /**
   * Initialize or restore existing session
   */
  initializeSession() {
    try {
      const existingSessionId = localStorage.getItem(this.sessionConfig.SESSION_ID_KEY);
      const sessionStartTime = localStorage.getItem(this.sessionConfig.SESSION_START_KEY);
      const lastActivityTime = localStorage.getItem(this.sessionConfig.LAST_ACTIVITY_KEY);
      
      if (existingSessionId && sessionStartTime) {
        const now = Date.now();
        const sessionAge = now - parseInt(sessionStartTime);
        const idleTime = lastActivityTime ? now - parseInt(lastActivityTime) : 0;
        
        // Check if session is still valid
        if (sessionAge < this.sessionConfig.ABSOLUTE_TIMEOUT && 
            idleTime < this.sessionConfig.IDLE_TIMEOUT) {
          
          this.sessionId = existingSessionId;
          this.sessionStartTime = parseInt(sessionStartTime);
          this.lastActivityTime = parseInt(lastActivityTime) || now;
          
          console.log('SessionService: Restored existing session');
          this.updateLastActivity();
          return true;
        } else {
          console.log('SessionService: Existing session expired, clearing');
          this.invalidateSession();
          return false;
        }
      }
      
      return false;
    } catch (error) {
      console.error('SessionService: Failed to initialize session:', error);
      this.invalidateSession();
      return false;
    }
  }

  /**
   * Create new session with secure session ID
   */
  createSession(userData = null) {
    try {
      // Generate new secure session ID
      this.sessionId = this.generateSecureSessionId();
      this.sessionStartTime = Date.now();
      this.lastActivityTime = Date.now();
      
      // Store session data securely
      localStorage.setItem(this.sessionConfig.SESSION_ID_KEY, this.sessionId);
      localStorage.setItem(this.sessionConfig.SESSION_START_KEY, this.sessionStartTime.toString());
      localStorage.setItem(this.sessionConfig.LAST_ACTIVITY_KEY, this.lastActivityTime.toString());
      
      // Store user data if provided (without sensitive information)
      if (userData) {
        const sanitizedUserData = {
          id: userData.id,
          email: userData.email,
          role: userData.role,
          firstName: userData.firstName,
          lastName: userData.lastName
          // Never store sensitive data like passwords, tokens, etc.
        };
        localStorage.setItem(this.sessionConfig.SESSION_DATA_KEY, JSON.stringify(sanitizedUserData));
      }
      
      console.log('SessionService: Created new session:', this.sessionId);
      
      // Start session monitoring
      this.startSessionMonitoring();
      
      return this.sessionId;
    } catch (error) {
      console.error('SessionService: Failed to create session:', error);
      return null;
    }
  }

  /**
   * Regenerate session ID (for post-authentication, privilege changes)
   */
  regenerateSessionId() {
    if (!this.isValidSession()) {
      console.warn('SessionService: Cannot regenerate invalid session');
      return false;
    }
    
    try {
      const oldSessionId = this.sessionId;
      const newSessionId = this.generateSecureSessionId();
      
      // Update session ID while preserving session data
      this.sessionId = newSessionId;
      localStorage.setItem(this.sessionConfig.SESSION_ID_KEY, newSessionId);
      
      console.log('SessionService: Regenerated session ID:', oldSessionId, '->', newSessionId);
      
      // Dispatch event for other components
      window.dispatchEvent(new CustomEvent('sessionRegenerated', {
        detail: { oldSessionId, newSessionId }
      }));
      
      return true;
    } catch (error) {
      console.error('SessionService: Failed to regenerate session ID:', error);
      return false;
    }
  }

  /**
   * Update last activity timestamp
   */
  updateLastActivity() {
    if (!this.sessionId) return;
    
    this.lastActivityTime = Date.now();
    localStorage.setItem(this.sessionConfig.LAST_ACTIVITY_KEY, this.lastActivityTime.toString());
  }

  /**
   * Check if current session is valid
   */
  isValidSession() {
    if (!this.sessionId || !this.sessionStartTime) {
      console.log('SessionService: No session ID or start time');
      return false;
    }
    
    const now = Date.now();
    const sessionAge = now - this.sessionStartTime;
    const idleTime = this.lastActivityTime ? now - this.lastActivityTime : 0;
    
    console.log('SessionService: Checking session validity:', {
      sessionId: this.sessionId?.substring(0, 8),
      sessionAge: Math.round(sessionAge / 1000) + 's',
      idleTime: Math.round(idleTime / 1000) + 's',
      absoluteTimeout: Math.round(this.sessionConfig.ABSOLUTE_TIMEOUT / 1000) + 's',
      idleTimeout: Math.round(this.sessionConfig.IDLE_TIMEOUT / 1000) + 's'
    });
    
    // Check absolute timeout
    if (sessionAge >= this.sessionConfig.ABSOLUTE_TIMEOUT) {
      console.log('SessionService: Session exceeded absolute timeout');
      this.invalidateSession();
      return false;
    }
    
    // Check idle timeout
    if (idleTime >= this.sessionConfig.IDLE_TIMEOUT) {
      console.log('SessionService: Session exceeded idle timeout');
      this.invalidateSession();
      return false;
    }
    
    console.log('SessionService: Session is valid');
    return true;
  }

  /**
   * Invalidate current session
   */
  invalidateSession() {
    try {
      console.log('SessionService: Invalidating session:', this.sessionId);
      
      // Clear session data
      this.sessionId = null;
      this.sessionStartTime = null;
      this.lastActivityTime = null;
      
      // Clear from storage
      localStorage.removeItem(this.sessionConfig.SESSION_ID_KEY);
      localStorage.removeItem(this.sessionConfig.SESSION_START_KEY);
      localStorage.removeItem(this.sessionConfig.LAST_ACTIVITY_KEY);
      localStorage.removeItem(this.sessionConfig.SESSION_DATA_KEY);
      
      // Stop monitoring
      this.stopSessionMonitoring();
      
      // Dispatch event for other components
      window.dispatchEvent(new CustomEvent('sessionInvalidated'));
      
    } catch (error) {
      console.error('SessionService: Failed to invalidate session:', error);
    }
  }

  /**
   * Setup activity tracking for idle timeout
   */
  setupActivityTracking() {
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    const activityHandler = () => {
      this.updateLastActivity();
    };
    
    // Add activity listeners
    events.forEach(event => {
      document.addEventListener(event, activityHandler, true);
    });
    
    // Store reference for cleanup
    this.activityHandler = activityHandler;
    this.activityEvents = events;
  }

  /**
   * Start session monitoring timers
   */
  startSessionMonitoring() {
    // Clear existing timers
    this.stopSessionMonitoring();
    
    // Set up activity check timer
    this.activityTimer = setInterval(() => {
      if (!this.isValidSession()) {
        console.log('SessionService: Session invalid during activity check');
        this.handleSessionExpiry();
      }
    }, this.sessionConfig.ACTIVITY_CHECK_INTERVAL);
    
    // Set up absolute timeout timer
    if (this.sessionStartTime) {
      const remainingTime = this.sessionConfig.ABSOLUTE_TIMEOUT - (Date.now() - this.sessionStartTime);
      if (remainingTime > 0) {
        this.sessionTimer = setTimeout(() => {
          console.log('SessionService: Absolute timeout reached');
          this.handleSessionExpiry();
        }, remainingTime);
      }
    }
  }

  /**
   * Stop session monitoring timers
   */
  stopSessionMonitoring() {
    if (this.activityTimer) {
      clearInterval(this.activityTimer);
      this.activityTimer = null;
    }
    
    if (this.sessionTimer) {
      clearTimeout(this.sessionTimer);
      this.sessionTimer = null;
    }
  }

  /**
   * Handle session expiry
   */
  handleSessionExpiry() {
    console.log('SessionService: Session expired, triggering logout');
    this.invalidateSession();
    
    // Dispatch event for auth context to handle logout
    window.dispatchEvent(new CustomEvent('sessionExpired', {
      detail: { reason: 'Session timeout' }
    }));
  }

  /**
   * Get session information
   */
  getSessionInfo() {
    if (!this.isValidSession()) {
      return null;
    }
    
    const now = Date.now();
    const sessionAge = now - this.sessionStartTime;
    const idleTime = this.lastActivityTime ? now - this.lastActivityTime : 0;
    
    return {
      sessionId: this.sessionId,
      sessionAge,
      idleTime,
      remainingAbsoluteTime: this.sessionConfig.ABSOLUTE_TIMEOUT - sessionAge,
      remainingIdleTime: this.sessionConfig.IDLE_TIMEOUT - idleTime,
      isValid: true
    };
  }

  /**
   * Get stored session data
   */
  getSessionData() {
    try {
      const sessionData = localStorage.getItem(this.sessionConfig.SESSION_DATA_KEY);
      return sessionData ? JSON.parse(sessionData) : null;
    } catch (error) {
      console.error('SessionService: Failed to get session data:', error);
      return null;
    }
  }

  /**
   * Cleanup on destruction
   */
  destroy() {
    this.stopSessionMonitoring();
    
    // Remove activity listeners
    if (this.activityHandler && this.activityEvents) {
      this.activityEvents.forEach(event => {
        document.removeEventListener(event, this.activityHandler, true);
      });
    }
  }
}

// Create singleton instance
const sessionService = new SessionService();

export default sessionService;