import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import api from '../services/api';

const ShopContext = createContext();

export const useShop = () => {
  const context = useContext(ShopContext);
  if (!context) {
    throw new Error('useShop must be used within a ShopProvider');
  }
  return context;
};

export const ShopProvider = ({ children }) => {
  const { user } = useAuth();
  const [selectedShop, setSelectedShop] = useState(null);
  const [userShops, setUserShops] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load user shops when user changes
  useEffect(() => {
    if (user?.role === 'SHOP_OWNER') {
      loadUserShops();
    } else {
      setUserShops([]);
      setSelectedShop(null);
    }
  }, [user]);

  const loadUserShops = async () => {
    try {
      setLoading(true);
      const shops = await api.getMyShops();
      setUserShops(shops || []);
      
      // Auto-select first shop if only one exists and no shop is currently selected
      if (shops.length === 1 && !selectedShop) {
        setSelectedShop(shops[0]);
      }
      
      // Clear selected shop if it no longer exists
      if (selectedShop && !shops.find(shop => shop.id === selectedShop.id)) {
        setSelectedShop(null);
      }
    } catch (error) {
      console.error('Failed to load user shops:', error);
      setUserShops([]);
    } finally {
      setLoading(false);
    }
  };

  const selectShop = (shop) => {
    setSelectedShop(shop);
    // Store in localStorage for persistence
    if (shop) {
      localStorage.setItem('selectedShopId', shop.id);
    } else {
      localStorage.removeItem('selectedShopId');
    }
  };

  const refreshShops = () => {
    return loadUserShops();
  };

  // Restore selected shop from localStorage on mount
  useEffect(() => {
    const savedShopId = localStorage.getItem('selectedShopId');
    if (savedShopId && userShops.length > 0) {
      const savedShop = userShops.find(shop => shop.id === savedShopId);
      if (savedShop) {
        setSelectedShop(savedShop);
      }
    }
  }, [userShops]);

  const value = {
    selectedShop,
    userShops,
    loading,
    selectShop,
    refreshShops,
    hasMultipleShops: userShops.length > 1,
    hasShops: userShops.length > 0
  };

  return (
    <ShopContext.Provider value={value}>
      {children}
    </ShopContext.Provider>
  );
};

export default ShopContext;