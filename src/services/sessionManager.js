// Session Activity Manager
// Handles activity-based session extension and timeout management

class SessionManager {
  constructor() {
    this.lastActivity = Date.now();
    this.sessionTimeout = 30 * 60 * 1000; // 30 minutes default
    this.warningTimeout = 5 * 60 * 1000; // 5 minutes warning
    this.checkInterval = 60 * 1000; // Check every minute
    this.activityTimer = null;
    this.warningShown = false;
    this.callbacks = {
      onActivity: [],
      onWarning: [],
      onTimeout: []
    };
    
    this.init();
  }

  init() {
    // Activity tracking events
    const activityEvents = [
      'mousedown', 'mousemove', 'keypress', 'scroll', 
      'touchstart', 'click', 'keydown'
    ];
    
    // Throttled activity handler to prevent excessive updates
    let activityThrottle = null;
    const handleActivity = () => {
      if (activityThrottle) return;
      
      activityThrottle = setTimeout(() => {
        this.updateActivity();
        activityThrottle = null;
      }, 1000); // Max once per second
    };
    
    // Add event listeners
    activityEvents.forEach(event => {
      document.addEventListener(event, handleActivity, true);
    });
    
    // Start monitoring
    this.startMonitoring();
    
    // Page visibility change handling
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        this.updateActivity();
      }
    });
    
    // Cleanup on page unload
    window.addEventListener('beforeunload', () => {
      this.cleanup();
    });
  }

  updateActivity() {
    const now = Date.now();
    const previousActivity = this.lastActivity;
    this.lastActivity = now;
    
    // Reset warning if activity detected
    if (this.warningShown) {
      this.warningShown = false;
      this.dismissWarning();
    }
    
    // Trigger activity callbacks
    this.callbacks.onActivity.forEach(callback => {
      try {
        callback(now, previousActivity);
      } catch (error) {
        console.error('Session activity callback error:', error);
      }
    });
    
    // Store in localStorage for cross-tab sync
    localStorage.setItem('lastActivity', now.toString());
  }

  startMonitoring() {
    if (this.activityTimer) {
      clearInterval(this.activityTimer);
    }
    
    this.activityTimer = setInterval(() => {
      this.checkSession();
    }, this.checkInterval);
  }

  checkSession() {
    const now = Date.now();
    const timeSinceActivity = now - this.lastActivity;
    
    // Check cross-tab activity
    const storedActivity = localStorage.getItem('lastActivity');
    if (storedActivity) {
      const storedTime = parseInt(storedActivity);
      if (storedTime > this.lastActivity) {
        this.lastActivity = storedTime;
        if (this.warningShown) {
          this.warningShown = false;
          this.dismissWarning();
        }
      }
    }
    
    const updatedTimeSinceActivity = now - this.lastActivity;
    
    // Check for warning threshold
    if (updatedTimeSinceActivity >= (this.sessionTimeout - this.warningTimeout) && !this.warningShown) {
      this.warningShown = true;
      this.showSessionWarning();
    }
    
    // Check for timeout
    if (updatedTimeSinceActivity >= this.sessionTimeout) {
      this.handleSessionTimeout();
    }
  }

  showSessionWarning() {
    const remainingTime = Math.ceil((this.sessionTimeout - (Date.now() - this.lastActivity)) / 1000 / 60);
    
    this.callbacks.onWarning.forEach(callback => {
      try {
        callback(remainingTime);
      } catch (error) {
        console.error('Session warning callback error:', error);
      }
    });
    
    // Show browser notification if permitted
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Session Expiring', {
        body: `Your session will expire in ${remainingTime} minutes due to inactivity.`,
        icon: '/favicon.ico',
        tag: 'session-warning'
      });
    }
  }

  dismissWarning() {
    // Dismiss any active notifications
    if ('Notification' in window) {
      // Close notification with specific tag
      // Note: This is limited by browser security, but we can try
    }
  }

  handleSessionTimeout() {
    console.log('Session timeout due to inactivity');
    
    this.callbacks.onTimeout.forEach(callback => {
      try {
        callback();
      } catch (error) {
        console.error('Session timeout callback error:', error);
      }
    });
    
    this.cleanup();
  }

  extendSession(additionalTime = null) {
    const extension = additionalTime || this.sessionTimeout;
    this.lastActivity = Date.now();
    this.warningShown = false;
    
    // Store updated activity
    localStorage.setItem('lastActivity', this.lastActivity.toString());
    
    console.log(`Session extended by ${Math.ceil(extension / 1000 / 60)} minutes`);
    
    // Trigger activity callbacks
    this.callbacks.onActivity.forEach(callback => {
      try {
        callback(this.lastActivity, Date.now() - extension);
      } catch (error) {
        console.error('Session extension callback error:', error);
      }
    });
  }

  setSessionTimeout(minutes) {
    this.sessionTimeout = minutes * 60 * 1000;
    console.log(`Session timeout set to ${minutes} minutes`);
  }

  setWarningTimeout(minutes) {
    this.warningTimeout = minutes * 60 * 1000;
    console.log(`Session warning set to ${minutes} minutes before expiry`);
  }

  getRemainingTime() {
    const timeSinceActivity = Date.now() - this.lastActivity;
    const remaining = this.sessionTimeout - timeSinceActivity;
    return Math.max(0, remaining);
  }

  isActive() {
    return this.getRemainingTime() > 0;
  }

  // Callback management
  onActivity(callback) {
    this.callbacks.onActivity.push(callback);
    return () => {
      const index = this.callbacks.onActivity.indexOf(callback);
      if (index > -1) {
        this.callbacks.onActivity.splice(index, 1);
      }
    };
  }

  onWarning(callback) {
    this.callbacks.onWarning.push(callback);
    return () => {
      const index = this.callbacks.onWarning.indexOf(callback);
      if (index > -1) {
        this.callbacks.onWarning.splice(index, 1);
      }
    };
  }

  onTimeout(callback) {
    this.callbacks.onTimeout.push(callback);
    return () => {
      const index = this.callbacks.onTimeout.indexOf(callback);
      if (index > -1) {
        this.callbacks.onTimeout.splice(index, 1);
      }
    };
  }

  cleanup() {
    if (this.activityTimer) {
      clearInterval(this.activityTimer);
      this.activityTimer = null;
    }
    
    // Clear callbacks
    this.callbacks = {
      onActivity: [],
      onWarning: [],
      onTimeout: []
    };
  }
}

// Create singleton instance
const sessionManager = new SessionManager();

export default sessionManager;