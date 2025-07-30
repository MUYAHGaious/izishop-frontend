// Remember Me Service - Secure handling of persistent login credentials
// Uses localStorage for token storage and secure credential management

class RememberMeService {
  constructor() {
    this.storageKey = 'izishopin_remember_token';
    this.userInfoKey = 'izishopin_remember_user';
    this.tokenExpiry = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds
  }

  // Generate a secure remember token
  generateRememberToken() {
    const array = new Uint8Array(32);
    window.crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  // Store remember me credentials securely
  storeRememberMeCredentials(email, rememberToken) {
    try {
      if (!email || !rememberToken) {
        console.warn('Cannot store remember me credentials: missing email or token');
        return false;
      }

      const rememberData = {
        email: email.toLowerCase().trim(),
        token: rememberToken,
        timestamp: Date.now(),
        expiresAt: Date.now() + this.tokenExpiry
      };

      // Store the remember token and user info separately for security
      localStorage.setItem(this.storageKey, JSON.stringify({
        token: rememberToken,
        timestamp: Date.now(),
        expiresAt: Date.now() + this.tokenExpiry
      }));

      localStorage.setItem(this.userInfoKey, JSON.stringify({
        email: email.toLowerCase().trim(),
        timestamp: Date.now()
      }));

      console.log('Remember me credentials stored successfully');
      return true;
    } catch (error) {
      console.error('Failed to store remember me credentials:', error);
      return false;
    }
  }

  // Get remembered credentials if valid
  getRememberedCredentials() {
    try {
      const tokenData = localStorage.getItem(this.storageKey);
      const userInfo = localStorage.getItem(this.userInfoKey);

      if (!tokenData || !userInfo) {
        return null;
      }

      const parsedTokenData = JSON.parse(tokenData);
      const parsedUserInfo = JSON.parse(userInfo);

      // Check if token has expired
      if (Date.now() > parsedTokenData.expiresAt) {
        console.log('Remember me token has expired');
        this.clearRememberMeCredentials();
        return null;
      }

      // Check if token is valid (not older than 30 days)
      if (Date.now() - parsedTokenData.timestamp > this.tokenExpiry) {
        console.log('Remember me token is too old');
        this.clearRememberMeCredentials();
        return null;
      }

      return {
        email: parsedUserInfo.email,
        token: parsedTokenData.token,
        hasRememberMe: true
      };
    } catch (error) {
      console.error('Failed to get remembered credentials:', error);
      this.clearRememberMeCredentials();
      return null;
    }
  }

  // Update remember me token (extend expiry)
  updateRememberMeToken(email) {
    try {
      const existingCredentials = this.getRememberedCredentials();
      
      if (existingCredentials && existingCredentials.email === email.toLowerCase().trim()) {
        // Generate new token and extend expiry
        const newToken = this.generateRememberToken();
        return this.storeRememberMeCredentials(email, newToken);
      }
      
      return false;
    } catch (error) {
      console.error('Failed to update remember me token:', error);
      return false;
    }
  }

  // Clear remember me credentials
  clearRememberMeCredentials() {
    try {
      localStorage.removeItem(this.storageKey);
      localStorage.removeItem(this.userInfoKey);
      console.log('Remember me credentials cleared');
      return true;
    } catch (error) {
      console.error('Failed to clear remember me credentials:', error);
      return false;
    }
  }

  // Check if user has active remember me session
  hasActiveRememberMe() {
    const credentials = this.getRememberedCredentials();
    return !!credentials;
  }

  // Validate remember me token format
  isValidRememberToken(token) {
    if (!token || typeof token !== 'string') {
      return false;
    }
    
    // Check if token is 64 characters hex string
    const hexRegex = /^[a-f0-9]{64}$/i;
    return hexRegex.test(token);
  }

  // Get remember me status for a specific email
  getRememberMeStatus(email) {
    const credentials = this.getRememberedCredentials();
    
    if (!credentials) {
      return { hasRememberMe: false, email: null };
    }

    const isForEmail = credentials.email === email.toLowerCase().trim();
    
    return {
      hasRememberMe: isForEmail,
      email: isForEmail ? credentials.email : null,
      token: isForEmail ? credentials.token : null
    };
  }

  // Clean up expired tokens (call this periodically)
  cleanupExpiredTokens() {
    try {
      const credentials = this.getRememberedCredentials();
      
      if (!credentials) {
        // Already cleaned up or no credentials
        return true;
      }

      // getRememberedCredentials() already handles expiry checking
      // If we reach here, credentials are valid
      return true;
    } catch (error) {
      console.error('Failed to cleanup expired tokens:', error);
      this.clearRememberMeCredentials();
      return false;
    }
  }

  // Handle successful login with remember me
  handleSuccessfulLogin(email, rememberMe, authToken = null) {
    try {
      if (rememberMe) {
        // Store new remember me credentials
        const rememberToken = this.generateRememberToken();
        this.storeRememberMeCredentials(email, rememberToken);
        
        // Also extend any existing auth tokens if provided
        if (authToken) {
          // Could store additional auth info here if needed
          console.log('Remember me enabled with auth token');
        }
      } else {
        // Clear any existing remember me credentials for this email
        const existing = this.getRememberedCredentials();
        if (existing && existing.email === email.toLowerCase().trim()) {
          this.clearRememberMeCredentials();
        }
      }
      
      return true;
    } catch (error) {
      console.error('Failed to handle successful login:', error);
      return false;
    }
  }

  // Handle logout - clear remember me if requested
  handleLogout(clearRememberMe = false) {
    try {
      if (clearRememberMe) {
        this.clearRememberMeCredentials();
      }
      // Remember me credentials are preserved unless explicitly cleared
      return true;
    } catch (error) {
      console.error('Failed to handle logout:', error);
      return false;
    }
  }

  // Security: validate that remember me is being used securely
  validateSecureUsage() {
    try {
      // Check if we're in a secure context (HTTPS or localhost)
      const isSecure = window.location.protocol === 'https:' || 
                      window.location.hostname === 'localhost' ||
                      window.location.hostname === '127.0.0.1';

      if (!isSecure) {
        console.warn('Remember me feature should be used over HTTPS in production');
      }

      // Check if localStorage is available
      if (!window.localStorage) {
        console.error('localStorage is not available - remember me will not work');
        return false;
      }

      // Check if crypto API is available
      if (!window.crypto || !window.crypto.getRandomValues) {
        console.error('Crypto API is not available - remember me tokens cannot be generated securely');
        return false;
      }

      return true;
    } catch (error) {
      console.error('Security validation failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export default new RememberMeService();