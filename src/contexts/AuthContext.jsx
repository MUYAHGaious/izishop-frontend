import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

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

  // Initialize auth state on mount
  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      setLoading(true);
      
      // Check if user is already logged in
      const token = localStorage.getItem('authToken');
      if (token) {
        try {
          const currentUser = await api.getCurrentUser();
          setUser(currentUser);
        } catch (error) {
          console.error('Failed to get current user:', error);
          // Clear invalid token
          localStorage.removeItem('authToken');
          setUser(null);
        }
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      // Clear invalid auth data
      localStorage.removeItem('authToken');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      setError(null);
      setLoading(true);
      
      const response = await api.login(credentials.email, credentials.password);
      setUser(response.user);
      
      return response;
    } catch (error) {
      setError(error.message);
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
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      // Force logout even if API call fails
      setUser(null);
    }
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
    return !!user && !!localStorage.getItem('authToken');
  };

  const hasRole = (role) => {
    return user && user.role === role;
  };

  const isShopOwner = () => {
    return hasRole('SHOP_OWNER');
  };

  const isCustomer = () => {
    return hasRole('CUSTOMER');
  };

  const isCasualSeller = () => {
    return hasRole('CASUAL_SELLER');
  };

  const isDeliveryAgent = () => {
    return hasRole('DELIVERY_AGENT');
  };

  const getUserShops = async () => {
    try {
      if (!isShopOwner()) {
        throw new Error('User is not a shop owner');
      }
      
      // TODO: Implement getUserShops API method
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
      
      if (!isShopOwner()) {
        throw new Error('Only shop owners can create shops');
      }
      
      // TODO: Implement createShop API method
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

  const value = {
    // State
    user,
    loading,
    error,
    
    // Auth methods
    login,
    register,
    logout,
    updateProfile,
    
    // Utility methods
    isAuthenticated,
    hasRole,
    isShopOwner,
    isCustomer,
    isCasualSeller,
    isDeliveryAgent,
    
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

