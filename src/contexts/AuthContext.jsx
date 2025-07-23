import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
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

  // Initialize auth state on mount
  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      setLoading(true);
      
      // Simple session restoration without complex validation
      const storedUser = localStorage.getItem('user');
      const accessToken = localStorage.getItem('accessToken');
      const storedSessionId = localStorage.getItem('sessionId');
      const storedRole = localStorage.getItem('currentRole');
      
      if (storedUser && accessToken && storedSessionId && storedRole) {
        try {
          const currentUser = JSON.parse(storedUser);
          setUser(currentUser);
          setSessionId(storedSessionId);
          setCurrentRole(storedRole);
          setSessionStartTime(Date.now().toString());
        } catch (parseError) {
          console.error('Failed to parse stored user data:', parseError);
          // Clear corrupted data
          localStorage.removeItem('user');
          localStorage.removeItem('accessToken');
          localStorage.removeItem('sessionId');
          localStorage.removeItem('currentRole');
        }
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
    } finally {
      setLoading(false);
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
      
      console.log('Calling API login...');
      const response = await api.login(credentials.email, credentials.password);
      console.log('API login response received:', response);
      const newUser = response.user;
      
      // Store user data and tokens
      localStorage.setItem('user', JSON.stringify(newUser));
      if (response.access_token) {
        localStorage.setItem('accessToken', response.access_token);
      }
      if (response.refresh_token) {
        localStorage.setItem('refreshToken', response.refresh_token);
      }
      
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
      setUser(response.user);
      
      return response;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setError(null);
      await api.logout();
      await clearAuthData();
      console.log('User logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      // Force logout even if API call fails
      await clearAuthData();
    }
  };

  const forceLogout = async (reason = 'Security logout') => {
    console.warn(`Force logout triggered: ${reason}`);
    try {
      // Attempt to notify backend of forced logout
      if (sessionId) {
        await api.logout();
      }
    } catch (error) {
      console.error('Error during forced logout:', error);
    } finally {
      await clearAuthData();
    }
  };

  const clearAuthData = async () => {
    // Clear all authentication data (including new token storage keys)
    localStorage.removeItem('authToken'); // Legacy key
    localStorage.removeItem('accessToken'); // New key
    localStorage.removeItem('refreshToken'); // New key
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
    // Simple check using localStorage only to avoid state dependency loops
    const accessToken = localStorage.getItem('accessToken');
    const storedUser = localStorage.getItem('user');
    return !!(accessToken && storedUser);
  };

  const hasRole = (role) => {
    // Accept both 'SHOP_OWNER' and 'shop_owner' as equivalent
    const normalized = (r) => (r || '').toString().toUpperCase();
    return user && normalized(user.role) === normalized(role) && normalized(currentRole) === normalized(role) && sessionId;
  };

  const validateSession = () => {
    if (!isAuthenticated()) {
      return false;
    }
    // Accept both 'SHOP_OWNER' and 'shop_owner' as equivalent
    const normalized = (r) => (r || '').toString().toUpperCase();
    if (normalized(user.role) !== normalized(currentRole)) {
      console.error('Role inconsistency detected');
      forceLogout('Role inconsistency');
      return false;
    }
    // Verify session exists
    const storedSessionId = localStorage.getItem('sessionId');
    if (storedSessionId !== sessionId) {
      console.error('Session ID mismatch detected');
      forceLogout('Session ID mismatch');
      return false;
    }
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
    clearError: () => setError(null)
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

