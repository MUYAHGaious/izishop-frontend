import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import authService from '../services/authService';
import enhancedSessionService from '../services/enhancedSessionService';
import activityDetectionService from '../services/activityDetectionService';
import api from '../services/api';
import { showToast } from '../components/ui/Toast';

const EnhancedAuthContext = createContext();

export const useEnhancedAuth = () => {
  const context = useContext(EnhancedAuthContext);
  if (!context) {
    throw new Error('useEnhancedAuth must be used within an EnhancedAuthProvider');
  }
  return context;
};

export const EnhancedAuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [sessionState, setSessionState] = useState('ACTIVE');
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Initialize authentication state
  useEffect(() => {
    initializeAuth();
  }, []);

  // Listen to session state changes
  useEffect(() => {
    const handleSessionChange = (sessionData) => {
      setSessionState(sessionData.newState);
    };

    enhancedSessionService.addSessionListener(handleSessionChange);

    return () => {
      enhancedSessionService.removeSessionListener(handleSessionChange);
    };
  }, []);

  // Listen to network status changes
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Process any queued operations when back online
      enhancedSessionService.processOfflineQueue();
    };

    const handleOffline = () => {
      setIsOnline(false);
      enhancedSessionService.updateSessionState('OFFLINE');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Listen to authentication events
  useEffect(() => {
    const handleTokenRefresh = () => {
      // Token was refreshed successfully
      loadCurrentUser();
    };

    const handleAuthError = () => {
      // Authentication failed, clear user data
      setUser(null);
      setIsAuthenticated(false);
    };

    const handleSilentRefresh = () => {
      // Silent refresh successful, no action needed
      console.log('Silent token refresh completed');
    };

    window.addEventListener('tokenRefresh', handleTokenRefresh);
    window.addEventListener('authError', handleAuthError);
    window.addEventListener('silentRefreshSuccess', handleSilentRefresh);

    return () => {
      window.removeEventListener('tokenRefresh', handleTokenRefresh);
      window.removeEventListener('authError', handleAuthError);
      window.removeEventListener('silentRefreshSuccess', handleSilentRefresh);
    };
  }, []);

  // Initialize authentication
  const initializeAuth = async () => {
    try {
      setLoading(true);
      
      // Check if user has valid tokens
      if (authService.isAuthenticated()) {
        await loadCurrentUser();
        setIsAuthenticated(true);
        
        // Start enhanced session management
        enhancedSessionService.init();
        
        // Restore any saved form data
        enhancedSessionService.restoreSavedFormData();
      } else {
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Failed to initialize auth:', error);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  // Load current user data
  const loadCurrentUser = async () => {
    try {
      const userData = await api.getCurrentUser();
      setUser(userData);
      return userData;
    } catch (error) {
      console.error('Failed to load user data:', error);
      // Don't logout on user data failure - token might still be valid
      throw error;
    }
  };

  // Enhanced login with activity tracking
  const login = async (credentials, options = {}) => {
    try {
      setLoading(true);
      
      // Record login activity
      activityDetectionService.recordActivity('LOGIN');
      
      const response = await api.login(credentials);
      
      if (response.access_token) {
        // Set tokens in auth service
        authService.setTokens(response.access_token, response.refresh_token);
        
        // Load user data
        const userData = await loadCurrentUser();
        setUser(userData);
        setIsAuthenticated(true);
        
        // Initialize enhanced session management
        enhancedSessionService.init();
        
        // Reset activity detection
        activityDetectionService.reset();
        
        // Show success message
        if (!options.silent) {
          showToast({
            type: 'success',
            message: `Welcome back, ${userData.first_name}!`,
            duration: 3000
          });
        }
        
        return { success: true, user: userData };
      } else {
        throw new Error('No access token received');
      }
    } catch (error) {
      console.error('Login failed:', error);
      
      // Handle specific error types
      let errorMessage = 'Login failed. Please try again.';
      if (error.response?.status === 401) {
        errorMessage = 'Invalid email or password.';
      } else if (error.response?.status === 429) {
        errorMessage = 'Too many login attempts. Please try again later.';
      } else if (!isOnline) {
        errorMessage = 'No internet connection. Please check your network.';
      }
      
      if (!options.silent) {
        showToast({
          type: 'error',
          message: errorMessage,
          duration: 5000
        });
      }
      
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Enhanced logout with graceful cleanup
  const logout = useCallback(async (options = {}) => {
    try {
      setLoading(true);
      
      // Save user work if not already saved
      if (!options.skipSave) {
        enhancedSessionService.saveUserWork();
      }
      
      // Record logout activity
      activityDetectionService.recordActivity('LOGOUT');
      
      // Call logout API if we have a valid token
      if (authService.isAuthenticated()) {
        try {
          await api.logout();
        } catch (error) {
          console.warn('Logout API call failed:', error);
          // Continue with local logout even if API fails
        }
      }
      
      // Clear authentication data
      authService.clearTokens();
      setUser(null);
      setIsAuthenticated(false);
      
      // Reset activity detection
      activityDetectionService.reset();
      
      // Show success message
      if (!options.silent) {
        showToast({
          type: 'info',
          message: 'You have been logged out successfully.',
          duration: 3000
        });
      }
      
      // Redirect if specified
      if (options.redirect !== false) {
        const returnUrl = encodeURIComponent(window.location.pathname + window.location.search);
        window.location.href = `/authentication-login-register?return=${returnUrl}`;
      }
      
    } catch (error) {
      console.error('Logout error:', error);
      
      // Force logout even if there's an error
      authService.clearTokens();
      setUser(null);
      setIsAuthenticated(false);
      
      if (!options.silent) {
        showToast({
          type: 'warning',
          message: 'Logout completed with some issues.',
          duration: 3000
        });
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Enhanced register with immediate login
  const register = async (userData, options = {}) => {
    try {
      setLoading(true);
      
      // Record registration activity
      activityDetectionService.recordActivity('REGISTER');
      
      const response = await api.register(userData);
      
      // If registration includes tokens (auto-login)
      if (response.access_token) {
        authService.setTokens(response.access_token, response.refresh_token);
        const userInfo = await loadCurrentUser();
        setUser(userInfo);
        setIsAuthenticated(true);
        
        // Initialize enhanced session management
        enhancedSessionService.init();
        
        if (!options.silent) {
          showToast({
            type: 'success',
            message: `Welcome to IziShopin, ${userInfo.first_name}!`,
            duration: 4000
          });
        }
        
        return { success: true, user: userInfo, autoLogin: true };
      } else {
        // Registration successful but requires email verification
        if (!options.silent) {
          showToast({
            type: 'success',
            message: 'Registration successful! Please check your email to verify your account.',
            duration: 5000
          });
        }
        
        return { success: true, requiresVerification: true };
      }
    } catch (error) {
      console.error('Registration failed:', error);
      
      let errorMessage = 'Registration failed. Please try again.';
      if (error.response?.status === 409) {
        errorMessage = 'An account with this email already exists.';
      } else if (error.response?.status === 422) {
        errorMessage = 'Please check your information and try again.';
      } else if (!isOnline) {
        errorMessage = 'No internet connection. Please check your network.';
      }
      
      if (!options.silent) {
        showToast({
          type: 'error',
          message: errorMessage,
          duration: 5000
        });
      }
      
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Check if user has specific role
  const hasRole = (role) => {
    return user?.role === role;
  };

  // Check if user has any of the specified roles
  const hasAnyRole = (roles) => {
    return roles.includes(user?.role);
  };

  // Get user permission level
  const getPermissionLevel = () => {
    switch (user?.role) {
      case 'ADMIN':
        return 'admin';
      case 'SHOP_OWNER':
        return 'shop_owner';
      case 'DELIVERY_AGENT':
        return 'delivery_agent';
      case 'CUSTOMER':
      default:
        return 'customer';
    }
  };

  // Extend session manually
  const extendSession = async () => {
    try {
      await enhancedSessionService.extendSessionIfNeeded();
      return { success: true };
    } catch (error) {
      console.error('Failed to extend session:', error);
      return { success: false, error: error.message };
    }
  };

  // Check if user can access a route
  const canAccess = (requiredRoles = [], requiredPermissions = []) => {
    if (!isAuthenticated) return false;
    
    // Check roles
    if (requiredRoles.length > 0 && !hasAnyRole(requiredRoles)) {
      return false;
    }
    
    // Check permissions (implement based on your permission system)
    if (requiredPermissions.length > 0) {
      // Implement permission checking logic here
    }
    
    return true;
  };

  const value = {
    // State
    user,
    loading,
    isAuthenticated,
    sessionState,
    isOnline,
    
    // Authentication methods
    login,
    logout,
    register,
    
    // Authorization methods
    hasRole,
    hasAnyRole,
    getPermissionLevel,
    canAccess,
    
    // Session management
    extendSession,
    
    // Utility methods
    loadCurrentUser,
    initializeAuth
  };

  return (
    <EnhancedAuthContext.Provider value={value}>
      {children}
    </EnhancedAuthContext.Provider>
  );
};

export default EnhancedAuthProvider;