import { useState, useEffect, useCallback } from 'react';
import { useWebSocket } from '../contexts/WebSocketContext';
import { useDataCache } from '../contexts/DataCacheContext';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

/**
 * Custom hook for efficient dashboard data management
 * Handles caching, real-time updates, and error states
 */
export const useDashboardData = (dashboardType = 'shop-owner') => {
  const { user } = useAuth();
  const { subscribeToDashboardUpdates, subscribeToOrderUpdates, subscribeToProductUpdates, isConnected } = useWebSocket();
  const { fetchWithCache, invalidateCache, isLoading, preloadData } = useDataCache();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Define data fetchers based on dashboard type - memoized to prevent infinite loops
  const getFetchers = useCallback(() => {
    const fetchers = {
      'shop-owner': {
        shopData: () => api.getMyShop(),
        productStats: () => api.getMyProductStats(),
        products: () => api.getMyProducts(0, 100, false),
        orders: () => api.getMyOrders ? api.getMyOrders() : Promise.resolve([]),
      },
      'admin': {
        dashboardOverview: () => api.getDashboardOverview(),
        users: () => api.getDashboardUsers(),
        activity: () => api.getDashboardActivity(),
        systemStats: () => api.getSystemStats(),
      },
      'customer': {
        profile: () => api.getCurrentUser(),
        orders: () => api.getMyOrders ? api.getMyOrders() : Promise.resolve([]),
        wishlist: () => api.getWishlist ? api.getWishlist() : Promise.resolve([]),
      }
    };
    return fetchers[dashboardType] || {};
  }, [dashboardType]);

  // Generic data fetcher with caching
  const fetchData = useCallback(async (dataType, params = {}, forceRefresh = false) => {
    const fetchers = getFetchers();
    const fetcher = fetchers[dataType];
    
    if (!fetcher) {
      throw new Error(`No fetcher defined for data type: ${dataType}`);
    }

    const cacheKey = `${dashboardType}-${dataType}`;
    const cacheParams = { userId: user?.id, ...params };

    try {
      setError(null);
      const data = await fetchWithCache(cacheKey, fetcher, cacheParams, forceRefresh);
      setLastUpdated(new Date());
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [getFetchers, dashboardType, user?.id, fetchWithCache]);

  // Batch fetch multiple data types
  const fetchMultipleData = useCallback(async (dataTypes, forceRefresh = false) => {
    setLoading(true);
    setError(null);

    try {
      const results = {};
      const promises = dataTypes.map(async (dataType) => {
        try {
          const data = await fetchData(dataType, {}, forceRefresh);
          results[dataType] = data;
        } catch (err) {
          console.error(`Error fetching ${dataType}:`, err);
          results[dataType] = null;
        }
      });

      await Promise.all(promises);
      return results;
    } catch (err) {
      setError(err.message);
      return {};
    } finally {
      setLoading(false);
    }
  }, [fetchData]);

  // Invalidate specific data types
  const invalidateData = useCallback((dataTypes) => {
    if (Array.isArray(dataTypes)) {
      dataTypes.forEach(dataType => {
        invalidateCache(`${dashboardType}-${dataType}`);
      });
    } else {
      invalidateCache(`${dashboardType}-${dataTypes}`);
    }
  }, [dashboardType, invalidateCache]);

  // Preload data for better performance
  const preloadDashboardData = useCallback(async (dataTypes) => {
    const fetchers = getFetchers();
    const promises = dataTypes.map(async (dataType) => {
      if (fetchers[dataType]) {
        const cacheKey = `${dashboardType}-${dataType}`;
        const cacheParams = { userId: user?.id };
        try {
          await preloadData(cacheKey, fetchers[dataType], cacheParams);
        } catch (error) {
          // Silently fail for preloading
          console.warn(`Preload failed for ${dataType}:`, error);
        }
      }
    });
    await Promise.all(promises);
  }, [getFetchers, dashboardType, user?.id, preloadData]);

  // Set up real-time subscriptions - THROTTLED TO PREVENT LOOPS
  const setupRealTimeUpdates = useCallback((onUpdate) => {
    if (!subscribeToDashboardUpdates) return () => {}; // Guard clause
    
    const subscriptions = [];
    let lastUpdate = 0;
    const THROTTLE_MS = 5000; // 5 second minimum between updates

    // Dashboard updates - THROTTLED
    subscriptions.push(
      subscribeToDashboardUpdates((data) => {
        const now = Date.now();
        if (now - lastUpdate < THROTTLE_MS) {
          console.log('Dashboard update throttled - too frequent');
          return;
        }
        lastUpdate = now;
        
        console.log(`${dashboardType} dashboard update:`, data);
        
        // Invalidate relevant cache entries
        invalidateData(['shopData', 'productStats', 'dashboardOverview']);
        
        if (onUpdate) {
          onUpdate('dashboard', data);
        }
      })
    );

    // Product updates (for shop owners and admins) - THROTTLED
    if (['shop-owner', 'admin'].includes(dashboardType) && subscribeToProductUpdates) {
      let lastProductUpdate = 0;
      subscriptions.push(
        subscribeToProductUpdates((data) => {
          const now = Date.now();
          if (now - lastProductUpdate < THROTTLE_MS) {
            console.log('Product update throttled - too frequent');
            return;
          }
          lastProductUpdate = now;
          
          console.log(`Product update for ${dashboardType}:`, data);
          
          // Invalidate product-related cache
          invalidateData(['products', 'productStats']);
          
          if (onUpdate) {
            onUpdate('products', data);
          }
        })
      );
    }

    // Order updates - THROTTLED
    if (subscribeToOrderUpdates) {
      let lastOrderUpdate = 0;
      subscriptions.push(
        subscribeToOrderUpdates((data) => {
          const now = Date.now();
          if (now - lastOrderUpdate < THROTTLE_MS) {
            console.log('Order update throttled - too frequent');
            return;
          }
          lastOrderUpdate = now;
          
          console.log(`Order update for ${dashboardType}:`, data);
          
          // Invalidate order-related cache
          invalidateData(['orders', 'dashboardOverview']);
          
          if (onUpdate) {
            onUpdate('orders', data);
          }
        })
      );
    }

    // Return cleanup function
    return () => {
      subscriptions.forEach(unsubscribe => unsubscribe());
    };
  }, [dashboardType, subscribeToDashboardUpdates, subscribeToOrderUpdates, subscribeToProductUpdates, invalidateData]);

  // Connection status indicator
  const getConnectionStatus = useCallback(() => {
    return {
      isConnected,
      isLoading: isLoading(`${dashboardType}-connection`),
      lastUpdated
    };
  }, [isConnected, isLoading, dashboardType, lastUpdated]);

  // Refresh all data
  const refreshAllData = useCallback(async () => {
    const fetchers = getFetchers();
    const dataTypes = Object.keys(fetchers);
    return await fetchMultipleData(dataTypes, true);
  }, [getFetchers, fetchMultipleData]);

  return {
    // Data fetching
    fetchData,
    fetchMultipleData,
    refreshAllData,
    preloadDashboardData,
    
    // Cache management
    invalidateData,
    
    // Real-time updates
    setupRealTimeUpdates,
    
    // Status
    loading,
    error,
    getConnectionStatus,
    
    // Utilities
    isDataLoading: (dataType) => isLoading(`${dashboardType}-${dataType}`),
    setError,
    clearError: () => setError(null)
  };
};

export default useDashboardData;