/**
 * Activity Detection Service
 * Tracks user activity to intelligently manage session extensions
 * Based on how tech giants detect user engagement
 */

class ActivityDetectionService {
  constructor() {
    this.isActive = true;
    this.lastActivity = Date.now();
    this.activityListeners = [];
    this.idleThreshold = 5 * 60 * 1000; // 5 minutes
    this.warningThreshold = 25 * 60 * 1000; // 25 minutes
    this.activityTypes = {
      MOUSE_MOVE: 'mouse_move',
      KEY_PRESS: 'key_press',
      CLICK: 'click',
      SCROLL: 'scroll',
      API_CALL: 'api_call',
      NAVIGATION: 'navigation',
      WEBSOCKET: 'websocket',
      FOCUS: 'focus',
      TOUCH: 'touch'
    };
    
    this.setupActivityListeners();
    this.startActivityMonitoring();
  }

  /**
   * Set up event listeners for various activity types
   */
  setupActivityListeners() {
    // Mouse activity
    document.addEventListener('mousemove', this.throttle(() => {
      this.recordActivity(this.activityTypes.MOUSE_MOVE);
    }, 2000)); // Throttle to every 2 seconds

    document.addEventListener('click', () => {
      this.recordActivity(this.activityTypes.CLICK);
    });

    // Keyboard activity
    document.addEventListener('keydown', this.throttle(() => {
      this.recordActivity(this.activityTypes.KEY_PRESS);
    }, 1000)); // Throttle to every 1 second

    // Scroll activity
    document.addEventListener('scroll', this.throttle(() => {
      this.recordActivity(this.activityTypes.SCROLL);
    }, 2000)); // Throttle to every 2 seconds

    // Touch activity (mobile)
    document.addEventListener('touchstart', () => {
      this.recordActivity(this.activityTypes.TOUCH);
    });

    document.addEventListener('touchmove', this.throttle(() => {
      this.recordActivity(this.activityTypes.TOUCH);
    }, 2000));

    // Window focus/blur
    window.addEventListener('focus', () => {
      this.recordActivity(this.activityTypes.FOCUS);
    });

    window.addEventListener('blur', () => {
      // Don't record activity on blur, but track it silently
      // console.log('ActivityDetection: Window lost focus');
    });

    // Page visibility API
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        this.recordActivity(this.activityTypes.FOCUS);
      }
    });

    // Listen for router navigation (React Router)
    this.setupNavigationListener();
  }

  /**
   * Set up navigation listener for React Router
   */
  setupNavigationListener() {
    // Listen for popstate events (back/forward navigation)
    window.addEventListener('popstate', () => {
      this.recordActivity(this.activityTypes.NAVIGATION);
    });

    // Override pushState and replaceState to detect programmatic navigation
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    history.pushState = (...args) => {
      this.recordActivity(this.activityTypes.NAVIGATION);
      return originalPushState.apply(history, args);
    };

    history.replaceState = (...args) => {
      this.recordActivity(this.activityTypes.NAVIGATION);
      return originalReplaceState.apply(history, args);
    };
  }

  /**
   * Record user activity
   */
  recordActivity(type = 'unknown', metadata = {}) {
    const now = Date.now();
    const wasIdle = this.isIdle();

    this.lastActivity = now;
    this.isActive = true;

    // Activity logging disabled to prevent console spam
    // if (process.env.NODE_ENV === 'development') {
    //   console.log(`ActivityDetection: ${type} activity recorded`);
    // }

    // Notify listeners
    this.notifyActivityListeners({
      type,
      timestamp: now,
      wasIdle,
      metadata
    });

    // Dispatch custom event for other parts of the app
    window.dispatchEvent(new CustomEvent('userActivity', {
      detail: { type, timestamp: now, wasIdle }
    }));
  }

  /**
   * Record API call activity
   */
  recordApiActivity(endpoint, method = 'GET') {
    this.recordActivity(this.activityTypes.API_CALL, { endpoint, method });
  }

  /**
   * Record WebSocket activity
   */
  recordWebSocketActivity(event = 'message') {
    this.recordActivity(this.activityTypes.WEBSOCKET, { event });
  }

  /**
   * Check if user is currently idle
   */
  isIdle() {
    return (Date.now() - this.lastActivity) > this.idleThreshold;
  }

  /**
   * Check if user should receive a warning
   */
  shouldShowWarning() {
    return (Date.now() - this.lastActivity) > this.warningThreshold;
  }

  /**
   * Get time since last activity
   */
  getTimeSinceLastActivity() {
    return Date.now() - this.lastActivity;
  }

  /**
   * Get idle status information
   */
  getIdleStatus() {
    const timeSinceActivity = this.getTimeSinceLastActivity();
    return {
      isIdle: this.isIdle(),
      shouldShowWarning: this.shouldShowWarning(),
      timeSinceActivity,
      lastActivity: this.lastActivity,
      isActive: this.isActive
    };
  }

  /**
   * Add activity listener
   */
  addActivityListener(listener) {
    this.activityListeners.push(listener);
  }

  /**
   * Remove activity listener
   */
  removeActivityListener(listener) {
    this.activityListeners = this.activityListeners.filter(l => l !== listener);
  }

  /**
   * Notify all activity listeners
   */
  notifyActivityListeners(activityData) {
    this.activityListeners.forEach(listener => {
      try {
        listener(activityData);
      } catch (error) {
        console.error('Error in activity listener:', error);
      }
    });
  }

  /**
   * Start activity monitoring loop
   */
  startActivityMonitoring() {
    // Check activity status every 30 seconds
    this.monitoringInterval = setInterval(() => {
      const status = this.getIdleStatus();
      
      // Dispatch idle status change events
      if (status.isIdle && this.isActive) {
        this.isActive = false;
        window.dispatchEvent(new CustomEvent('userIdle', { detail: status }));
      } else if (!status.isIdle && !this.isActive) {
        this.isActive = true;
        window.dispatchEvent(new CustomEvent('userActive', { detail: status }));
      }

      // Check for warning threshold
      if (status.shouldShowWarning) {
        window.dispatchEvent(new CustomEvent('userInactive', { detail: status }));
      }
    }, 30000); // Every 30 seconds
  }

  /**
   * Stop activity monitoring
   */
  stopActivityMonitoring() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
  }

  /**
   * Throttle function to limit event frequency
   */
  throttle(func, limit) {
    let inThrottle;
    return function(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  /**
   * Reset activity state (useful for login/logout)
   */
  reset() {
    this.isActive = true;
    this.lastActivity = Date.now();
  }

  /**
   * Cleanup all listeners and intervals
   */
  destroy() {
    this.stopActivityMonitoring();
    this.activityListeners = [];
    
    // Remove event listeners
    document.removeEventListener('mousemove', this.recordActivity);
    document.removeEventListener('click', this.recordActivity);
    document.removeEventListener('keydown', this.recordActivity);
    document.removeEventListener('scroll', this.recordActivity);
    document.removeEventListener('touchstart', this.recordActivity);
    document.removeEventListener('touchmove', this.recordActivity);
    window.removeEventListener('focus', this.recordActivity);
    window.removeEventListener('blur', this.recordActivity);
    document.removeEventListener('visibilitychange', this.recordActivity);
    window.removeEventListener('popstate', this.recordActivity);
  }
}

// Create singleton instance
const activityDetectionService = new ActivityDetectionService();

export default activityDetectionService;