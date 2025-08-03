import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import authService from '../services/authService';
import rememberMeService from '../services/rememberMeService';
import { migrateTokenStorage, cleanupLegacyTokens } from '../utils/tokenMigration';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [currentRole, setCurrentRole] = useState(null);
  const [sessionStartTime, setSessionStartTime] = useState(null);
  const [returnUrl, setReturnUrl] = useState(null);
  const [cartState, setCartState] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [authCheckComplete, setAuthCheckComplete] = useState(false);
  const [providerError, setProviderError] = useState(null);

  // Initialize auth state on mount
  useEffect(() => {
    const safeInitializeAuth = async () => {
      try {
        await initializeAuth();
      } catch (error) {
        console.error('AuthProvider initialization failed:', error);
        setProviderError(error.message);
        setLoading(false);
        setIsInitializing(false);
      }
    };

    safeInitializeAuth();
    
    // Listen for auth service events
    const handleTokenRefresh = () => {
      console.log('Token refreshed successfully');
    };

    const handleAuthLogout = () => {
      console.log('Auth service triggered logout');
      forceLogout('Session expired');
    };

    // Add event listeners for auth service
    window.addEventListener('tokenRefresh', handleTokenRefresh);
    window.addEventListener('authLogout', handleAuthLogout);

    return () => {
      window.removeEventListener('tokenRefresh', handleTokenRefresh);
      window.removeEventListener('authLogout', handleAuthLogout);
    };
  }, []);

  const initializeAuth = async () => {
    try {
      setLoading(true);
      console.log('AuthContext: Starting initialization...');
      
      // Small delay to ensure localStorage is stable after page load
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // First check localStorage directly for faster initial load
      const storedUser = localStorage.getItem('user');
      const accessToken = localStorage.getItem('accessToken');
      
      console.log('AuthContext: Storage check - accessToken:', !!accessToken, 'storedUser:', !!storedUser);
      
      // CRITICAL: Check if authService confirms authentication
      const isAuthServiceAuthenticated = authService.isAuthenticated();
      console.log('AuthContext: AuthService authentication status:', isAuthServiceAuthenticated);
      
      if (!accessToken || !storedUser || !isAuthServiceAuthenticated) {
        console.log('AuthContext: No valid authentication found, checking backup...');
        
        // Try to recover from backup - ONLY if tokens are actually available
        try {
          const authBackup = localStorage.getItem('authBackup');
          if (authBackup) {
            const backup = JSON.parse(authBackup);
            const backupAge = Date.now() - backup.timestamp;
            
            // CRITICAL: Only use backup if we have valid tokens in storage AND authService confirms
            const hasValidTokens = localStorage.getItem('accessToken') && localStorage.getItem('refreshToken');
            const authServiceAuthenticated = authService.isAuthenticated();
            
            if (backupAge < 5 * 60 * 1000 && backup.user && hasValidTokens && authServiceAuthenticated) {
              console.log('AuthContext: Recovering from backup authentication state with valid tokens');
              setUser(backup.user);
              setCurrentRole(backup.user.role);
              localStorage.setItem('currentRole', backup.user.role);
              
              // Also create session since we have valid tokens
              const sessionId = generateSecureSessionId();
              setSessionId(sessionId);
              localStorage.setItem('sessionId', sessionId);
              setSessionStartTime(Date.now().toString());
              
              setLoading(false);
              setIsInitializing(false);
              setAuthCheckComplete(true);
              return;
            } else {
              console.log('AuthContext: Backup invalid - no tokens or authService disagrees, clearing');
              localStorage.removeItem('authBackup');
            }
          }
        } catch (error) {
          console.error('AuthContext: Failed to recover from backup:', error);
          localStorage.removeItem('authBackup');
        }
        
        console.log('AuthContext: No valid backup found, user not authenticated');
        
        // Clear any invalid backup data
        localStorage.removeItem('authBackup');
        localStorage.removeItem('user');
        localStorage.removeItem('sessionId');
        localStorage.removeItem('currentRole');
        
        setLoading(false);
        setIsInitializing(false);
        setAuthCheckComplete(true);
        return;
      }

      if (!storedUser) {
        console.log('AuthContext: No user data found, clearing tokens');
        await authService.logout();
        setLoading(false);
        setIsInitializing(false);
        return;
      }

      try {
        // Parse user data first
        const currentUser = JSON.parse(storedUser);
        console.log('AuthContext: Parsed user data:', currentUser.email, 'role:', currentUser.role);
        
        // Set user immediately for faster UI response
        setUser(currentUser);
        
        // Create backup authentication state for reload persistence - ONLY if authService confirms
        const isAuthServiceValid = authService.isAuthenticated();
        if (isAuthServiceValid) {
          localStorage.setItem('authBackup', JSON.stringify({
            user: currentUser,
            timestamp: Date.now(),
            accessToken: !!accessToken
          }));
        } else {
          console.warn('AuthContext: AuthService does not confirm authentication, skipping backup creation');
        }
        
        // Set session data - preserve existing session if valid
        const storedSessionId = localStorage.getItem('sessionId');
        const storedRole = localStorage.getItem('currentRole');
        
        // Only create new session if none exists
        if (storedSessionId) {
          setSessionId(storedSessionId);
          console.log('AuthContext: Using existing session ID:', storedSessionId);
        } else {
          const newSessionId = Date.now().toString();
          setSessionId(newSessionId);
          localStorage.setItem('sessionId', newSessionId);
          console.log('AuthContext: Created new session ID:', newSessionId);
        }
        
        // Use stored role if available, otherwise use user role
        const roleToUse = storedRole || currentUser.role;
        setCurrentRole(roleToUse);
        localStorage.setItem('currentRole', roleToUse);
        console.log('AuthContext: Set current role:', roleToUse);
        
        setSessionStartTime(Date.now().toString());
        
        // Ensure authService has loaded tokens from storage
        authService.loadTokensFromStorage();
        
        // Add a small delay to ensure tokens are properly loaded
        await new Promise(resolve => setTimeout(resolve, 50));
        
        // Now check if auth service agrees this is authenticated
        if (authService.isAuthenticated()) {
          console.log('AuthContext: Auth service confirms authentication');
          
          // Check if token needs refresh
          if (authService.isTokenExpired(accessToken, 60)) {
            console.log('AuthContext: Token needs refresh, attempting refresh');
            try {
              await authService.refreshAccessToken();
              console.log('AuthContext: Token refreshed successfully');
              // Reload user data in case it changed
              const updatedUser = JSON.parse(localStorage.getItem('user') || '{}');
              if (updatedUser.id) {
                setUser(updatedUser);
              }
            } catch (refreshError) {
              console.warn('AuthContext: Token refresh failed:', refreshError);
              await authService.logout();
              setUser(null);
              setSessionId(null);
              setCurrentRole(null);
              return; // Exit early
            }
          }
          
          // Start background token monitoring
          console.log('AuthContext: Starting token monitoring');
          authService.startTokenMonitoring();
        } else {
          console.log('AuthContext: Auth service says not authenticated');
          
          // Double-check: if we have tokens and user data, but authService says not authenticated,
          // it might be a timing issue. Try refreshing the authService state.
          const recheckAccessToken = localStorage.getItem('accessToken');
          const recheckRefreshToken = localStorage.getItem('refreshToken');
          
          if (recheckAccessToken && recheckRefreshToken && currentUser.id) {
            console.log('AuthContext: Tokens exist but authService disagrees, forcing reload');
            authService.setTokens(recheckAccessToken, recheckRefreshToken);
            
            // Wait a bit and check again
            await new Promise(resolve => setTimeout(resolve, 100));
            
            if (authService.isAuthenticated()) {
              console.log('AuthContext: Auth service now confirms authentication after reload');
              authService.startTokenMonitoring();
            } else {
              console.log('AuthContext: Auth service still disagrees, clearing state');
              await authService.logout();
              setUser(null);
              setSessionId(null);
              setCurrentRole(null);
            }
          } else {
            console.log('AuthContext: No valid tokens found, clearing state');
            await authService.logout();
            setUser(null);
            setSessionId(null);
            setCurrentRole(null);
          }
        }
        
      } catch (parseError) {
        console.error('AuthContext: Failed to parse stored user data:', parseError);
        // Clear corrupted data
        await authService.logout();
        setUser(null);
        setSessionId(null);
        setCurrentRole(null);
      }
      
    } catch (error) {
      console.error('AuthContext: Initialization error:', error);
      // Clear any invalid state but don't logout if it might be a network issue
      setUser(null);
      setSessionId(null);
      setCurrentRole(null);
      
      // If there was an error, ensure we clear any stale localStorage data
      const hasAccessToken = localStorage.getItem('accessToken');
      const hasUser = localStorage.getItem('user');
      
      if (!hasAccessToken || !hasUser) {
        console.log('AuthContext: Clearing tokens due to initialization error');
        await authService.logout();
      }
    } finally {
      setLoading(false);
      setIsInitializing(false);
      setAuthCheckComplete(true);
      console.log('AuthContext: Initialization complete - loading:', false, 'isInitializing:', false);
      console.log('AuthContext: Final state - user:', !!user, 'hasToken:', !!localStorage.getItem('accessToken'));
    }
  };

  const login = async (credentials, requestedRole = null) => {
    try {
      console.log('=== AUTH CONTEXT LOGIN ===');
      console.log('Login called with email:', credentials.email);
      setError(null);
      setLoading(true);
      
      // Force logout any existing session before new login
      if (sessionId) {
        await forceLogout('New login initiated');
      }
      
      console.log('Calling auth service login...');
      const response = await authService.login({
        email: credentials.email,
        password: credentials.password
      });
      console.log('Auth service login response received:', response);
      const newUser = response.user;
      
      // Tokens are automatically managed by auth service
      // Store user data
      localStorage.setItem('user', JSON.stringify(newUser));
      
      // Validate role assignment
      if (requestedRole && newUser.role !== requestedRole) {
        throw new Error(`Access denied. This account is not authorized for ${requestedRole} access.`);
      }
      
      // Create secure session
      const newSessionId = generateSecureSessionId();
      const sessionTime = Date.now().toString();
      
      // Store session data
      localStorage.setItem('sessionId', newSessionId);
      localStorage.setItem('currentRole', newUser.role);
      localStorage.setItem('sessionStartTime', sessionTime);
      
      setUser(newUser);
      setSessionId(newSessionId);
      setCurrentRole(newUser.role);
      setSessionStartTime(sessionTime);
      
      // Log security event
      console.log(`Secure login successful for role: ${newUser.role}, Session: ${newSessionId.substring(0, 8)}...`);
      
      return response;
    } catch (error) {
      console.error('=== AUTH CONTEXT LOGIN ERROR ===');
      console.error('Error in AuthContext login:', error);
      console.error('Error message:', error?.message);
      console.error('===============================');
      setError(error.message);
      await clearAuthData();
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setError(null);
      setLoading(true);
      
      const response = await api.register(userData);
      console.log('Registration API response:', response);
      console.log('User role from response:', response.user?.role);
      console.log('Access token present:', !!response.access_token);
      console.log('Refresh token present:', !!response.refresh_token);
      
      if (response.user) {
        // Store user data
        localStorage.setItem('user', JSON.stringify(response.user));
        
        // If tokens are provided, auto-login the user
        if (response.access_token) {
          // Update auth service tokens
          authService.accessToken = response.access_token;
          authService.refreshToken = response.refresh_token;
          authService.saveTokensToStorage();
          
          // Create secure session (same as login)
          const newSessionId = generateSecureSessionId();
          const sessionTime = Date.now().toString();
          
          // Store session data
          localStorage.setItem('sessionId', newSessionId);
          localStorage.setItem('currentRole', response.user.role);
          localStorage.setItem('sessionStartTime', sessionTime);
          
          setUser(response.user);
          setSessionId(newSessionId);
          setCurrentRole(response.user.role);
          setSessionStartTime(sessionTime);
          
          // Start background token monitoring
          authService.startTokenMonitoring();
          
          console.log('Registration successful, user auto-logged in:', response.user);
        } else {
          // No tokens - user needs email verification or manual approval
          console.log('Registration successful, but no tokens provided. User may need verification.');
          
          // Still set user data for display purposes
          setUser(response.user);
          setSessionId(null); // No session since not fully authenticated
          setCurrentRole(response.user.role);
          setSessionStartTime(null);
        }
      }
      
      return response;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async (clearRememberMe = false) => {
    try {
      setError(null);
      // Use auth service logout which handles API call and token cleanup
      await authService.logout();
      
      // Handle remember me during logout
      rememberMeService.handleLogout(clearRememberMe);
      
      await clearAuthData();
      console.log('User logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      // Force logout even if API call fails
      await clearAuthData();
      // Still handle remember me even if logout API fails
      rememberMeService.handleLogout(clearRememberMe);
    }
  };

  const forceLogout = async (reason = 'Security logout') => {
    console.warn(`Force logout triggered: ${reason}`);
    try {
      // Use auth service for secure logout
      await authService.logout();
    } catch (error) {
      console.error('Error during forced logout:', error);
    } finally {
      // For security logouts, always clear remember me
      rememberMeService.handleLogout(true);
      await clearAuthData();
    }
  };

  const clearAuthData = async () => {
    // Clear auth service tokens first
    authService.clearTokens();
    
    // Clear all authentication data (including legacy keys)
    localStorage.removeItem('authToken'); // Legacy key
    localStorage.removeItem('sessionId');
    localStorage.removeItem('currentRole');
    localStorage.removeItem('sessionStartTime');
    localStorage.removeItem('adminSession');
    localStorage.removeItem('user');
    
    setUser(null);
    setSessionId(null);
    setCurrentRole(null);
    setSessionStartTime(null);
  };

  const generateSecureSessionId = () => {
    // Generate a cryptographically secure session ID
    const array = new Uint8Array(32);
    window.crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  };

  const updateProfile = async (userData) => {
    try {
      setError(null);
      // TODO: Implement updateProfile API method
      const response = await api.updateProfile(userData);
      setUser(response.user);
      return response;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  const isAuthenticated = () => {
    // During initialization, be more permissive to avoid logout loops
    if (isInitializing || loading) {
      const accessToken = localStorage.getItem('accessToken') || localStorage.getItem('authToken');
      const storedUser = localStorage.getItem('user');
      const authServiceAuth = authService.isAuthenticated();
      console.log('AuthContext: isAuthenticated during init - token:', !!accessToken, 'user:', !!storedUser, 'authService:', authServiceAuth);
      return !!(accessToken && storedUser && authServiceAuth);
    }
    
    // After initialization, require ALL conditions: user state, tokens, and authService confirmation
    const hasStateUser = !!user;
    const accessToken = localStorage.getItem('accessToken') || localStorage.getItem('authToken');
    const storedUser = localStorage.getItem('user');
    const hasStorageAuth = !!(accessToken && storedUser);
    const authServiceAuth = authService.isAuthenticated();
    
    // All conditions must be true for authenticated state
    const result = hasStateUser && hasStorageAuth && authServiceAuth;
    console.log('AuthContext: isAuthenticated - stateUser:', hasStateUser, 'storageAuth:', hasStorageAuth, 'authService:', authServiceAuth, 'result:', result);
    return result;
  };

  const hasRole = (role) => {
    // During initialization or loading, check localStorage as fallback
    if (isInitializing || loading || !user) {
      const hasToken = localStorage.getItem('accessToken');
      const hasStoredUser = localStorage.getItem('user');
      const storedRole = localStorage.getItem('currentRole');
      const authServiceAuth = authService.isAuthenticated();
      
      if (hasToken && hasStoredUser && authServiceAuth) {
        try {
          const storedUserData = JSON.parse(hasStoredUser);
          const normalized = (r) => (r || '').toString().toUpperCase();
          
          // Check both user role and stored role, prioritizing user role
          const userRoleMatches = normalized(storedUserData.role) === normalized(role);
          const storedRoleMatches = storedRole ? normalized(storedRole) === normalized(role) : true;
          
          console.log('hasRole during init:', {
            requestedRole: role,
            storedUserRole: storedUserData.role,
            storedRole: storedRole,
            authServiceAuth,
            userRoleMatches,
            storedRoleMatches,
            result: userRoleMatches && storedRoleMatches && authServiceAuth
          });
          
          return userRoleMatches && storedRoleMatches && authServiceAuth;
        } catch (error) {
          console.error('hasRole: Error parsing stored user data:', error);
          return false;
        }
      }
      return false;
    }
    
    // After init, require authentication, role match, and valid session
    if (!isAuthenticated()) {
      console.log('hasRole: User not authenticated');
      return false;
    }
    
    // Accept both 'SHOP_OWNER' and 'shop_owner' as equivalent
    const normalized = (r) => (r || '').toString().toUpperCase();
    const roleMatches = user && normalized(user.role) === normalized(role);
    const currentRoleMatches = normalized(currentRole) === normalized(role);
    
    console.log('hasRole after init:', {
      requestedRole: role,
      userRole: user?.role,
      currentRole,
      sessionId: !!sessionId,
      roleMatches,
      currentRoleMatches,
      result: roleMatches && currentRoleMatches
    });
    
    return roleMatches && currentRoleMatches;
  };

  const validateSession = () => {
    console.log('AuthContext: Validating session...');
    console.log('AuthContext: isAuthenticated():', isAuthenticated());
    console.log('AuthContext: user:', user);
    console.log('AuthContext: currentRole:', currentRole);
    console.log('AuthContext: sessionId:', sessionId);
    console.log('AuthContext: isInitializing:', isInitializing);
    console.log('AuthContext: loading:', loading);
    
    // Always allow validation to pass if we're still initializing or loading
    if (isInitializing || loading) {
      console.log('AuthContext: Session validation skipped - still initializing or loading');
      return true;
    }
    
    if (!isAuthenticated()) {
      console.log('AuthContext: Session validation failed - not authenticated');
      return false;
    }
    
    // If user is not loaded yet but we have tokens and user data in storage, allow it
    if (!user) {
      const hasToken = localStorage.getItem('accessToken');
      const hasStoredUser = localStorage.getItem('user');
      if (hasToken && hasStoredUser) {
        console.log('AuthContext: User not loaded yet but tokens exist, allowing validation');
        return true;
      } else {
        console.log('AuthContext: No user and no stored tokens, validation failed');
        return false;
      }
    }
    
    // Accept both 'SHOP_OWNER' and 'shop_owner' as equivalent
    const normalized = (r) => (r || '').toString().toUpperCase();
    const userRole = normalized(user.role);
    const currentRoleNorm = normalized(currentRole);
    
    console.log('AuthContext: Role comparison - user.role:', userRole, 'currentRole:', currentRoleNorm);
    
    if (userRole !== currentRoleNorm) {
      // Only fail if both values are set and different
      if (userRole && currentRoleNorm) {
        console.error('AuthContext: Role inconsistency detected:', userRole, 'vs', currentRoleNorm);
        forceLogout('Role inconsistency');
        return false;
      } else {
        console.log('AuthContext: Role comparison skipped - one role is empty');
      }
    }
    
    // Verify session exists - but be more lenient during initialization
    const storedSessionId = localStorage.getItem('sessionId');
    console.log('AuthContext: Session ID comparison - stored:', storedSessionId, 'current:', sessionId);
    
    if (storedSessionId && sessionId && storedSessionId !== sessionId) {
      console.error('AuthContext: Session ID mismatch detected:', storedSessionId, 'vs', sessionId);
      forceLogout('Session ID mismatch');
      return false;
    }
    
    console.log('AuthContext: Session validation passed');
    return true;
  };

  const requireRole = (requiredRole) => {
    if (!validateSession()) {
      throw new Error('Invalid session');
    }
    
    if (!hasRole(requiredRole)) {
      throw new Error(`Access denied. Required role: ${requiredRole}, Current role: ${currentRole}`);
    }
    
    return true;
  };

  const isShopOwner = () => {
    try {
      return validateSession() && hasRole('SHOP_OWNER');
    } catch {
      return false;
    }
  };

  const isCustomer = () => {
    try {
      return validateSession() && hasRole('CUSTOMER');
    } catch {
      return false;
    }
  };

  const isCasualSeller = () => {
    try {
      return validateSession() && hasRole('CASUAL_SELLER');
    } catch {
      return false;
    }
  };

  const isDeliveryAgent = () => {
    try {
      return validateSession() && hasRole('DELIVERY_AGENT');
    } catch {
      return false;
    }
  };

  const isAdmin = () => {
    try {
      return validateSession() && hasRole('ADMIN');
    } catch {
      return false;
    }
  };

  const getUserShops = async () => {
    try {
      requireRole('SHOP_OWNER');
      
      const response = await api.getUserShops();
      return response.shops;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  const createShop = async (shopData) => {
    try {
      setError(null);
      requireRole('SHOP_OWNER');
      
      const response = await api.createShop(shopData);
      
      // Update user with new shop
      const updatedUser = {
        ...user,
        shops: [...(user.shops || []), response.shop]
      };
      setUser(updatedUser);
      
      return response;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  // Admin-specific login with enhanced security
  const adminLogin = async (credentials, adminCode) => {
    try {
      setError(null);
      setLoading(true);
      
      // Force logout any existing session
      if (sessionId) {
        await forceLogout('Admin login initiated');
      }
      
      // Validate admin code (this should be validated by backend)
      if (!adminCode) {
        throw new Error('Admin access code is required');
      }
      
      const response = await api.adminLogin(credentials.email, credentials.password, adminCode);
      const newUser = response.user;
      
      if (newUser.role !== 'ADMIN') {
        throw new Error('Access denied. This account is not authorized for admin access.');
      }
      
      // Store user data and tokens (same as regular login)
      localStorage.setItem('user', JSON.stringify(newUser));
      if (response.access_token) {
        localStorage.setItem('accessToken', response.access_token);
      }
      if (response.refresh_token) {
        localStorage.setItem('refreshToken', response.refresh_token);
      }
      
      // Create secure admin session with shorter duration
      const newSessionId = generateSecureSessionId();
      const sessionTime = Date.now().toString();
      
      localStorage.setItem('sessionId', newSessionId);
      localStorage.setItem('currentRole', 'ADMIN');
      localStorage.setItem('sessionStartTime', sessionTime);
      localStorage.setItem('adminSession', 'true'); // Flag for admin session
      
      setUser(newUser);
      setSessionId(newSessionId);
      setCurrentRole('ADMIN');
      setSessionStartTime(sessionTime);
      
      console.log(`Admin login successful, Session: ${newSessionId.substring(0, 8)}...`);
      
      return response;
    } catch (error) {
      setError(error.message);
      await clearAuthData();
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Prevent role switching during active session
  const switchRole = () => {
    throw new Error('Role switching is not allowed. Please log out and log in with the appropriate account.');
  };

  // Return URL and state management for seamless navigation
  const setAuthReturnUrl = (url, state = null) => {
    setReturnUrl(url);
    if (state) {
      setCartState(state);
      // Persist cart state in localStorage for cross-session persistence
      localStorage.setItem('pendingCartState', JSON.stringify(state));
    }
    // Store return URL in localStorage for persistence
    localStorage.setItem('authReturnUrl', url);
  };

  const getAuthReturnUrl = () => {
    const storedUrl = localStorage.getItem('authReturnUrl');
    const storedCart = localStorage.getItem('pendingCartState');
    
    return {
      url: returnUrl || storedUrl,
      cartState: cartState || (storedCart ? JSON.parse(storedCart) : null)
    };
  };

  const clearAuthReturnUrl = () => {
    setReturnUrl(null);
    setCartState(null);
    localStorage.removeItem('authReturnUrl');
    localStorage.removeItem('pendingCartState');
  };

  const redirectAfterAuth = (defaultUrl = null) => {
    const { url, cartState: pendingCart } = getAuthReturnUrl();
    
    if (url) {
      // Clear the return URL first
      clearAuthReturnUrl();
      
      // Return the stored URL and any pending cart state
      return {
        redirectUrl: url,
        pendingCartState: pendingCart
      };
    }
    
    // No stored URL, use role-based default redirection
    if (defaultUrl) {
      return { redirectUrl: defaultUrl };
    }
    
    // Role-based default redirection
    switch (user?.role) {
      case 'SHOP_OWNER':
        return { redirectUrl: '/shop-owner-dashboard' };
      case 'ADMIN':
        return { redirectUrl: '/admin-dashboard' };
      case 'CUSTOMER':
      case 'CASUAL_SELLER':
      case 'DELIVERY_AGENT':
      default:
        return { redirectUrl: '/product-catalog' };
    }
  };

  const value = {
    // State
    user,
    loading,
    error,
    sessionId,
    currentRole,
    sessionStartTime,
    returnUrl,
    cartState,
    
    // Auth methods
    login,
    register,
    logout,
    forceLogout,
    adminLogin,
    updateProfile,
    
    // Security methods
    validateSession,
    requireRole,
    switchRole, // This will throw an error
    
    // Navigation and state management
    setAuthReturnUrl,
    getAuthReturnUrl,
    clearAuthReturnUrl,
    redirectAfterAuth,
    
    // Utility methods
    isAuthenticated,
    hasRole,
    isShopOwner,
    isCustomer,
    isCasualSeller,
    isDeliveryAgent,
    isAdmin,
    
    // Shop methods (for shop owners)
    getUserShops,
    createShop,
    
    // Clear error
    clearError: () => setError(null),
    
    // Initialization state
    isInitializing,
    authCheckComplete
  };

  // Error boundary for AuthProvider
  if (providerError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-500 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Authentication Error</h1>
          <p className="text-gray-600 mb-4">There was a problem initializing the authentication system.</p>
          <button
            onClick={() => {
              setProviderError(null);
              window.location.reload();
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

