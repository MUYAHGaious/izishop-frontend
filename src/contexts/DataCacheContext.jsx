import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';

const DataCacheContext = createContext();

export const useDataCache = () => {
  const context = useContext(DataCacheContext);
  if (!context) {
    throw new Error('useDataCache must be used within a DataCacheProvider');
  }
  return context;
};

const DataCacheProvider = ({ children }) => {
  const [cache, setCache] = useState(new Map());
  const [loadingStates, setLoadingStates] = useState(new Map());
  const [requestCounts, setRequestCounts] = useState(new Map());

  // Cache configuration
  const DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes
  const CACHE_CONFIG = {
    'dashboard-data': { ttl: 2 * 60 * 1000 }, // 2 minutes for dashboard
    'product-stats': { ttl: 5 * 60 * 1000 }, // 5 minutes for product stats
    'orders': { ttl: 1 * 60 * 1000 }, // 1 minute for orders
    'notifications': { ttl: 30 * 1000 }, // 30 seconds for notifications
    'products': { ttl: 10 * 60 * 1000 }, // 10 minutes for products
    'shops': { ttl: 15 * 60 * 1000 }, // 15 minutes for shops
  };

  const generateCacheKey = (type, params = {}) => {
    const paramString = Object.keys(params)
      .sort()
      .map(key => `${key}:${params[key]}`)
      .join('|');
    return paramString ? `${type}:${paramString}` : type;
  };

  const isCacheValid = (cacheEntry, ttl) => {
    if (!cacheEntry) return false;
    const now = Date.now();
    return (now - cacheEntry.timestamp) < ttl;
  };

  const getCachedData = useCallback((type, params = {}) => {
    const key = generateCacheKey(type, params);
    const cacheEntry = cache.get(key);
    const config = CACHE_CONFIG[type] || { ttl: DEFAULT_TTL };
    
    if (isCacheValid(cacheEntry, config.ttl)) {
      console.log(`Cache hit for ${key}`);
      return cacheEntry.data;
    }
    
    console.log(`Cache miss for ${key}`);
    return null;
  }, [cache]);

  const setCachedData = useCallback((type, data, params = {}) => {
    const key = generateCacheKey(type, params);
    const cacheEntry = {
      data,
      timestamp: Date.now(),
      type,
      params
    };
    
    console.log(`Caching data for ${key}`);
    setCache(prev => new Map(prev).set(key, cacheEntry));
  }, []);

  const invalidateCache = useCallback((type, params = null) => {
    if (params === null) {
      // Invalidate all entries for this type
      setCache(prev => {
        const newCache = new Map(prev);
        for (const [key, entry] of newCache) {
          if (entry.type === type) {
            newCache.delete(key);
          }
        }
        return newCache;
      });
      console.log(`Invalidated all cache entries for type: ${type}`);
    } else {
      // Invalidate specific entry
      const key = generateCacheKey(type, params);
      setCache(prev => {
        const newCache = new Map(prev);
        newCache.delete(key);
        return newCache;
      });
      console.log(`Invalidated cache entry: ${key}`);
    }
  }, []);

  const clearCache = useCallback(() => {
    setCache(new Map());
    setLoadingStates(new Map());
    setRequestCounts(new Map());
    console.log('Cache cleared');
  }, []);

  const isLoading = useCallback((type, params = {}) => {
    const key = generateCacheKey(type, params);
    return loadingStates.get(key) || false;
  }, [loadingStates]);

  const setLoading = useCallback((type, loading, params = {}) => {
    const key = generateCacheKey(type, params);
    setLoadingStates(prev => {
      const newStates = new Map(prev);
      if (loading) {
        newStates.set(key, true);
      } else {
        newStates.delete(key);
      }
      return newStates;
    });
  }, []);

  // Enhanced fetch function with caching and circuit breaker
  const fetchWithCache = useCallback(async (type, fetchFunction, params = {}, forceRefresh = false) => {
    const key = generateCacheKey(type, params);
    
    // Circuit breaker: prevent too many requests for the same key
    const now = Date.now();
    const requestWindow = 10000; // 10 seconds
    const maxRequests = 5;
    
    const currentRequests = requestCounts.get(key) || [];
    const recentRequests = currentRequests.filter(timestamp => now - timestamp < requestWindow);
    
    if (recentRequests.length >= maxRequests) {
      console.warn(`Circuit breaker: Too many requests for ${key}, returning cached data`);
      return getCachedData(type, params);
    }
    
    // Update request count
    setRequestCounts(prev => new Map(prev).set(key, [...recentRequests, now]));
    
    // Check if already loading
    if (isLoading(type, params)) {
      console.log(`Already loading ${key}, skipping...`);
      return getCachedData(type, params);
    }

    // Check cache first (unless force refresh)
    if (!forceRefresh) {
      const cachedData = getCachedData(type, params);
      if (cachedData !== null) {
        return cachedData;
      }
    }

    try {
      setLoading(type, true, params);
      console.log(`Fetching fresh data for ${key}`);
      
      const data = await fetchFunction(params);
      setCachedData(type, data, params);
      
      return data;
    } catch (error) {
      // Don't log 404 errors as they're often expected (e.g., new users with no data)
      const is404Error = error.status === 404 || 
                        error.message?.includes('404') || 
                        error.message?.includes('Shop not found') ||
                        error.message?.includes('not found');
      
      if (!is404Error) {
        console.error(`Error fetching data for ${key}:`, error);
      } else {
        console.log(`404 for ${key} - likely expected for new user`);
      }
      throw error;
    } finally {
      setLoading(type, false, params);
    }
  }, [getCachedData, setCachedData, isLoading, setLoading, requestCounts]);

  // Preload data for better performance
  const preloadData = useCallback(async (type, fetchFunction, params = {}) => {
    const cachedData = getCachedData(type, params);
    if (cachedData === null && !isLoading(type, params)) {
      try {
        await fetchWithCache(type, fetchFunction, params);
      } catch (error) {
        // Silently fail for preloading
        console.warn(`Preload failed for ${type}:`, error);
      }
    }
  }, [getCachedData, isLoading, fetchWithCache]);

  // Batch update cache entries
  const batchUpdateCache = useCallback((updates) => {
    setCache(prev => {
      const newCache = new Map(prev);
      updates.forEach(({ type, data, params = {} }) => {
        const key = generateCacheKey(type, params);
        const cacheEntry = {
          data,
          timestamp: Date.now(),
          type,
          params
        };
        newCache.set(key, cacheEntry);
      });
      return newCache;
    });
  }, []);

  // Get cache statistics
  const getCacheStats = useCallback(() => {
    const stats = {
      totalEntries: cache.size,
      entriesByType: {},
      totalSize: 0
    };

    for (const [key, entry] of cache) {
      const type = entry.type;
      if (!stats.entriesByType[type]) {
        stats.entriesByType[type] = 0;
      }
      stats.entriesByType[type]++;
      
      // Rough size calculation
      stats.totalSize += JSON.stringify(entry).length;
    }

    return stats;
  }, [cache]);

  const value = useMemo(() => ({
    // Core cache operations
    getCachedData,
    setCachedData,
    invalidateCache,
    clearCache,
    
    // Loading states
    isLoading,
    setLoading,
    
    // Enhanced fetch
    fetchWithCache,
    preloadData,
    
    // Batch operations
    batchUpdateCache,
    
    // Utilities
    getCacheStats,
    
    // Cache configuration
    CACHE_CONFIG
  }), [
    getCachedData,
    setCachedData,
    invalidateCache,
    clearCache,
    isLoading,
    setLoading,
    fetchWithCache,
    preloadData,
    batchUpdateCache,
    getCacheStats
  ]);

  return (
    <DataCacheContext.Provider value={value}>
      {children}
    </DataCacheContext.Provider>
  );
};

export { DataCacheProvider };
export default DataCacheProvider;