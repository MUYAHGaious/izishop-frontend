/**
 * Configuration Registry Service
 * Manages dynamic configuration, caching, and state management
 * Provides reactive configuration updates across the application
 */

class ConfigRegistry {
  constructor() {
    this.config = new Map();
    this.cache = new Map();
    this.observers = new Set();
    this.storageKey = 'izishop_api_config';
    this.maxCacheAge = 300000; // 5 minutes
    this.maxCacheSize = 100;
    
    // Initialize
    this.loadFromStorage();
    this.startCacheCleanup();
    
    // Bind methods to preserve context
    this.handleStorageChange = this.handleStorageChange.bind(this);
    this.handleBeforeUnload = this.handleBeforeUnload.bind(this);
    
    // Listen for storage changes (multi-tab sync)
    window.addEventListener('storage', this.handleStorageChange);
    window.addEventListener('beforeunload', this.handleBeforeUnload);
  }

  // Core Configuration Management
  set(key, value, options = {}) {
    const entry = {
      value,
      timestamp: Date.now(),
      ttl: options.ttl || this.maxCacheAge,
      persistent: options.persistent !== false,
      source: options.source || 'manual'
    };

    this.config.set(key, entry);
    
    if (entry.persistent) {
      this.saveToStorage();
    }
    
    this.notifyObservers(key, value);
    console.log(`📝 Config set: ${key}`, { value, options });
    
    return this;
  }

  get(key, defaultValue = null) {
    const entry = this.config.get(key);
    
    if (!entry) {
      return defaultValue;
    }
    
    // Check TTL
    if (this.isExpired(entry)) {
      this.config.delete(key);
      this.saveToStorage();
      console.log(`⏰ Config expired: ${key}`);
      return defaultValue;
    }
    
    return entry.value;
  }

  has(key) {
    const entry = this.config.get(key);
    return entry && !this.isExpired(entry);
  }

  delete(key) {
    const existed = this.config.delete(key);
    if (existed) {
      this.saveToStorage();
      this.notifyObservers(key, undefined);
      console.log(`🗑️ Config deleted: ${key}`);
    }
    return existed;
  }

  // Active Endpoint Management
  setActiveEndpoint(endpoint, metadata = {}) {
    this.set('activeEndpoint', {
      url: endpoint,
      selectedAt: Date.now(),
      ...metadata
    }, {
      ttl: 300000, // 5 minutes
      source: 'endpoint_selection'
    });
    
    // Also cache recent endpoints for quick access
    this.addToRecentEndpoints(endpoint);
    
    return this;
  }

  getActiveEndpoint() {
    const data = this.get('activeEndpoint');
    return data?.url || null;
  }

  getActiveEndpointMetadata() {
    return this.get('activeEndpoint');
  }

  addToRecentEndpoints(endpoint, maxRecent = 5) {
    const recent = this.get('recentEndpoints', []);
    
    // Remove if already exists
    const filtered = recent.filter(item => 
      (typeof item === 'string' ? item : item.url) !== endpoint
    );
    
    // Add to beginning
    filtered.unshift({
      url: endpoint,
      lastUsed: Date.now()
    });
    
    // Keep only maxRecent items
    const trimmed = filtered.slice(0, maxRecent);
    
    this.set('recentEndpoints', trimmed, {
      ttl: 86400000, // 24 hours
      source: 'recent_endpoints'
    });
  }

  getRecentEndpoints() {
    return this.get('recentEndpoints', []);
  }

  // Environment Configuration
  setEnvironmentConfig(environment, config) {
    this.set(`environment_${environment}`, config, {
      ttl: 86400000, // 24 hours
      source: 'environment_config'
    });
  }

  getEnvironmentConfig(environment) {
    return this.get(`environment_${environment}`);
  }

  // Health Check Results Caching
  cacheHealthResult(endpoint, result) {
    const cacheKey = `health_${endpoint}`;
    this.cache.set(cacheKey, {
      result,
      timestamp: Date.now(),
      ttl: 30000 // 30 seconds for health data
    });
    
    // Maintain cache size
    this.maintainCacheSize();
  }

  getCachedHealthResult(endpoint) {
    const cacheKey = `health_${endpoint}`;
    const entry = this.cache.get(cacheKey);
    
    if (!entry || this.isExpired(entry)) {
      this.cache.delete(cacheKey);
      return null;
    }
    
    return entry.result;
  }

  // Performance Metrics
  recordPerformanceMetric(endpoint, metric, value) {
    const metricsKey = `metrics_${endpoint}`;
    const metrics = this.get(metricsKey, {});
    
    if (!metrics[metric]) {
      metrics[metric] = [];
    }
    
    metrics[metric].push({
      value,
      timestamp: Date.now()
    });
    
    // Keep only last 50 measurements per metric
    if (metrics[metric].length > 50) {
      metrics[metric] = metrics[metric].slice(-50);
    }
    
    this.set(metricsKey, metrics, {
      ttl: 3600000, // 1 hour
      source: 'performance_metrics'
    });
  }

  getPerformanceMetrics(endpoint) {
    return this.get(`metrics_${endpoint}`, {});
  }

  getAverageResponseTime(endpoint) {
    const metrics = this.getPerformanceMetrics(endpoint);
    const responseTimes = metrics.responseTime || [];
    
    if (responseTimes.length === 0) return null;
    
    const recent = responseTimes.slice(-10); // Last 10 measurements
    const sum = recent.reduce((total, item) => total + item.value, 0);
    return Math.round(sum / recent.length);
  }

  // Feature Flags
  setFeatureFlag(flag, enabled, metadata = {}) {
    this.set(`feature_${flag}`, {
      enabled,
      ...metadata,
      updatedAt: Date.now()
    }, {
      ttl: 86400000, // 24 hours
      source: 'feature_flags'
    });
  }

  isFeatureEnabled(flag, defaultValue = false) {
    const feature = this.get(`feature_${flag}`);
    return feature?.enabled !== undefined ? feature.enabled : defaultValue;
  }

  // Observer Pattern for Reactive Updates
  subscribe(callback, filter = null) {
    const observer = { callback, filter };
    this.observers.add(observer);
    
    // Return unsubscribe function
    return () => this.observers.delete(observer);
  }

  notifyObservers(key, value) {
    this.observers.forEach(observer => {
      try {
        if (!observer.filter || observer.filter(key, value)) {
          observer.callback(key, value);
        }
      } catch (error) {
        console.error('Observer notification error:', error);
      }
    });
  }

  // Storage Management
  saveToStorage() {
    try {
      const persistentData = {};
      
      for (const [key, entry] of this.config.entries()) {
        if (entry.persistent && !this.isExpired(entry)) {
          persistentData[key] = entry;
        }
      }
      
      const serialized = JSON.stringify(persistentData);
      localStorage.setItem(this.storageKey, serialized);
      
    } catch (error) {
      console.warn('Failed to save config to storage:', error);
      
      // Handle quota exceeded by clearing old data
      if (error.name === 'QuotaExceededError') {
        this.clearExpiredEntries();
        try {
          const minimalData = {
            activeEndpoint: this.config.get('activeEndpoint')
          };
          localStorage.setItem(this.storageKey, JSON.stringify(minimalData));
        } catch (retryError) {
          console.error('Failed to save minimal config:', retryError);
        }
      }
    }
  }

  loadFromStorage() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (!stored) return;
      
      const data = JSON.parse(stored);
      let loadedCount = 0;
      
      Object.entries(data).forEach(([key, entry]) => {
        if (entry && typeof entry === 'object' && !this.isExpired(entry)) {
          this.config.set(key, entry);
          loadedCount++;
        }
      });
      
      console.log(`📂 Loaded ${loadedCount} config entries from storage`);
      
    } catch (error) {
      console.warn('Failed to load config from storage:', error);
      // Clear corrupted data
      localStorage.removeItem(this.storageKey);
    }
  }

  handleStorageChange(event) {
    if (event.key === this.storageKey && event.newValue !== event.oldValue) {
      console.log('🔄 Config updated in another tab, reloading...');
      this.loadFromStorage();
    }
  }

  handleBeforeUnload() {
    // Ensure config is saved before page unload
    this.saveToStorage();
  }

  // Utility Methods
  isExpired(entry) {
    if (!entry.ttl) return false;
    return Date.now() - entry.timestamp > entry.ttl;
  }

  clearExpiredEntries() {
    let clearedCount = 0;
    
    for (const [key, entry] of this.config.entries()) {
      if (this.isExpired(entry)) {
        this.config.delete(key);
        clearedCount++;
      }
    }
    
    if (clearedCount > 0) {
      console.log(`🧹 Cleared ${clearedCount} expired config entries`);
      this.saveToStorage();
    }
    
    return clearedCount;
  }

  maintainCacheSize() {
    if (this.cache.size <= this.maxCacheSize) return;
    
    // Convert to array and sort by timestamp
    const entries = Array.from(this.cache.entries())
      .sort(([,a], [,b]) => a.timestamp - b.timestamp);
    
    // Remove oldest entries
    const toRemove = entries.slice(0, entries.length - this.maxCacheSize);
    toRemove.forEach(([key]) => this.cache.delete(key));
    
    console.log(`🧹 Removed ${toRemove.length} old cache entries`);
  }

  startCacheCleanup() {
    // Clean up expired entries every 5 minutes
    setInterval(() => {
      this.clearExpiredEntries();
      this.maintainCacheSize();
    }, 300000);
  }

  // Debug and Admin Methods
  getConfigSummary() {
    const summary = {
      totalEntries: this.config.size,
      cacheSize: this.cache.size,
      observers: this.observers.size,
      recentEndpoints: this.getRecentEndpoints().length,
      activeEndpoint: this.getActiveEndpoint(),
      environment: this.get('detectedEnvironment')
    };
    
    console.table(summary);
    return summary;
  }

  exportConfig() {
    const exportData = {
      timestamp: Date.now(),
      config: Object.fromEntries(this.config.entries()),
      version: '1.0'
    };
    
    return JSON.stringify(exportData, null, 2);
  }

  importConfig(jsonData) {
    try {
      const data = JSON.parse(jsonData);
      let importedCount = 0;
      
      if (data.config && typeof data.config === 'object') {
        Object.entries(data.config).forEach(([key, entry]) => {
          if (entry && typeof entry === 'object') {
            this.config.set(key, entry);
            importedCount++;
          }
        });
        
        this.saveToStorage();
        console.log(`📥 Imported ${importedCount} config entries`);
      }
      
      return importedCount;
    } catch (error) {
      console.error('Failed to import config:', error);
      throw error;
    }
  }

  clear() {
    this.config.clear();
    this.cache.clear();
    localStorage.removeItem(this.storageKey);
    console.log('🧹 Configuration cleared');
  }

  // Cleanup on instance destruction
  destroy() {
    window.removeEventListener('storage', this.handleStorageChange);
    window.removeEventListener('beforeunload', this.handleBeforeUnload);
    this.observers.clear();
    console.log('🗑️ ConfigRegistry destroyed');
  }
}

export default ConfigRegistry;