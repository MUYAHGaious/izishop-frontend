/**
 * SmartSearch - Intelligent Search Engine
 * Handles semantic understanding, fuzzy matching, context awareness, and learning
 */

class SmartSearch {
  constructor(options = {}) {
    this.data = [];
    this.searchHistory = JSON.parse(localStorage.getItem('search_history') || '[]');
    this.userPreferences = JSON.parse(localStorage.getItem('user_preferences') || '{}');
    this.synonyms = this.buildSynonymMap();
    this.contextFilters = options.contextFilters || {};
    this.permissions = options.permissions || {};
    this.searchAnalytics = JSON.parse(localStorage.getItem('search_analytics') || '{}');
    
    // Performance optimization
    this.searchCache = new Map();
    this.maxCacheSize = 1000;
  }

  // Build comprehensive synonym mapping for semantic understanding
  buildSynonymMap() {
    return {
      // Business terms
      'profit': ['revenue', 'income', 'earnings', 'money', 'cash'],
      'customer': ['client', 'user', 'buyer', 'consumer'],
      'product': ['item', 'goods', 'merchandise', 'service'],
      'order': ['purchase', 'transaction', 'sale', 'booking'],
      'urgent': ['priority', 'important', 'critical', 'rush'],
      'recent': ['latest', 'new', 'current', 'fresh'],
      
      // Technical terms
      'error': ['bug', 'issue', 'problem', 'fail'],
      'user': ['account', 'profile', 'member'],
      'data': ['information', 'record', 'entry'],
      
      // Status terms
      'active': ['live', 'running', 'enabled', 'on'],
      'inactive': ['disabled', 'off', 'stopped', 'paused'],
      'pending': ['waiting', 'queued', 'processing'],
      'completed': ['done', 'finished', 'success'],
      
      // Time-based
      'today': ['current', 'now'],
      'yesterday': ['previous', 'last'],
      'week': ['weekly', '7 days'],
      'month': ['monthly', '30 days'],
      'year': ['yearly', 'annual', '12 months']
    };
  }

  // Advanced fuzzy matching with Levenshtein distance
  fuzzyMatch(query, target, threshold = 0.7) {
    if (!query || !target) return false;
    
    const queryLower = query.toLowerCase().trim();
    const targetLower = target.toLowerCase().trim();
    
    // Exact match
    if (queryLower === targetLower) return true;
    
    // Contains match
    if (targetLower.includes(queryLower) || queryLower.includes(targetLower)) return true;
    
    // Levenshtein distance calculation
    const distance = this.levenshteinDistance(queryLower, targetLower);
    const maxLength = Math.max(queryLower.length, targetLower.length);
    const similarity = 1 - (distance / maxLength);
    
    return similarity >= threshold;
  }

  levenshteinDistance(str1, str2) {
    const matrix = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  }

  // Semantic understanding with synonym expansion
  expandQuery(query) {
    const words = query.toLowerCase().split(/\s+/);
    const expandedWords = [];
    
    words.forEach(word => {
      expandedWords.push(word);
      
      // Add synonyms
      Object.keys(this.synonyms).forEach(key => {
        if (key === word || this.synonyms[key].includes(word)) {
          expandedWords.push(key, ...this.synonyms[key]);
        }
      });
    });
    
    return [...new Set(expandedWords)];
  }

  // Intent detection for natural language queries
  detectIntent(query) {
    const intents = {
      find: ['find', 'search', 'get', 'show', 'display', 'list'],
      filter: ['filter', 'where', 'with', 'having'],
      count: ['count', 'how many', 'number of', 'total'],
      sort: ['sort', 'order', 'arrange', 'rank'],
      recent: ['recent', 'latest', 'new', 'today', 'yesterday'],
      urgent: ['urgent', 'priority', 'important', 'critical'],
      status: ['active', 'inactive', 'pending', 'completed', 'failed']
    };
    
    const detectedIntents = [];
    const queryLower = query.toLowerCase();
    
    Object.keys(intents).forEach(intent => {
      if (intents[intent].some(keyword => queryLower.includes(keyword))) {
        detectedIntents.push(intent);
      }
    });
    
    return detectedIntents;
  }

  // Context-aware filtering based on user permissions and page context
  applyContextFilters(items, context, userRole, userId = null, userDepartment = null, shopId = null) {
    // For now, implement basic role-based filtering without external config
    // This can be enhanced later with the SearchConfig integration
    
    try {
      // Basic role validation
      if (!userRole) {
        console.warn('No user role provided for search filtering');
        return [];
      }

      // Filter items based on user context
      let filteredItems = items.filter(item => {
        // Shop owners can only see their own shop data
        if (userRole === 'SHOP_OWNER') {
          return !item.shop_owner_id || item.shop_owner_id === userId || 
                 !item.shop_id || item.shop_id === shopId;
        }
        
        // For other roles, allow all items for now
        return true;
      });

      // Clean sensitive fields
      filteredItems = filteredItems.map(item => {
        const cleanItem = { ...item };
        
        // Remove sensitive fields based on role
        if (userRole !== 'SUPER_ADMIN' && userRole !== 'ADMIN') {
          delete cleanItem.password;
          delete cleanItem.api_keys;
          delete cleanItem.tokens;
          delete cleanItem.private_notes;
        }
        
        return cleanItem;
      });
      
      return filteredItems;
    } catch (error) {
      console.warn('Search filtering error:', error.message);
      return items; // Return original items if filtering fails
    }
  }

  // Intelligent scoring algorithm
  calculateScore(item, query, expandedQuery, intents) {
    let score = 0;
    const queryLower = query.toLowerCase();
    
    // Search through all item properties
    Object.keys(item).forEach(key => {
      const value = String(item[key]).toLowerCase();
      
      // Exact match bonus
      if (value.includes(queryLower)) {
        score += 100;
      }
      
      // Fuzzy match
      if (this.fuzzyMatch(queryLower, value)) {
        score += 50;
      }
      
      // Synonym matches
      expandedQuery.forEach(term => {
        if (value.includes(term)) {
          score += 25;
        }
      });
      
      // Field importance weighting
      const fieldWeights = {
        title: 3, name: 3, email: 2.5,
        description: 2, content: 2,
        tags: 2, category: 1.5,
        id: 0.5, created_at: 0.5
      };
      
      score *= (fieldWeights[key] || 1);
    });
    
    // Intent-based scoring
    intents.forEach(intent => {
      switch (intent) {
        case 'recent':
          if (item.created_at || item.date) {
            const itemDate = new Date(item.created_at || item.date);
            const daysSince = (Date.now() - itemDate.getTime()) / (1000 * 60 * 60 * 24);
            score += Math.max(0, 50 - daysSince);
          }
          break;
        case 'urgent':
          if (item.priority === 'high' || item.urgent === true) {
            score += 75;
          }
          break;
        case 'status':
          if (item.status) {
            score += 25;
          }
          break;
      }
    });
    
    // User preference bonus
    if (this.userPreferences[item.category] || this.userPreferences[item.type]) {
      score += 30;
    }
    
    // Search history relevance
    const historyMatch = this.searchHistory.find(h => 
      h.query.toLowerCase().includes(queryLower) || queryLower.includes(h.query.toLowerCase())
    );
    if (historyMatch && historyMatch.clickedResults.includes(item.id)) {
      score += 40;
    }
    
    return score;
  }

  // Main search function with caching
  search(query, options = {}) {
    if (!query || query.trim().length === 0) return [];
    
    const cacheKey = `${query}_${JSON.stringify(options)}`;
    if (this.searchCache.has(cacheKey)) {
      return this.searchCache.get(cacheKey);
    }
    
    const startTime = performance.now();
    
    // Expand query with synonyms
    const expandedQuery = this.expandQuery(query);
    const intents = this.detectIntent(query);
    
    // Apply context filters with user info for role-based security
    let searchData = this.applyContextFilters(
      this.data, 
      options.context, 
      options.userRole,
      options.userId,
      options.userDepartment,
      options.shopId
    );
    
    // Score and filter results
    const results = searchData
      .map(item => ({
        ...item,
        _score: this.calculateScore(item, query, expandedQuery, intents)
      }))
      .filter(item => item._score > 0)
      .sort((a, b) => b._score - a._score)
      .slice(0, options.limit || 50);
    
    // Cache results
    if (this.searchCache.size >= this.maxCacheSize) {
      const firstKey = this.searchCache.keys().next().value;
      this.searchCache.delete(firstKey);
    }
    this.searchCache.set(cacheKey, results);
    
    // Analytics
    const searchTime = performance.now() - startTime;
    this.recordSearch(query, results.length, searchTime, options);
    
    return results;
  }

  // Intelligent autocomplete with suggestions
  getAutocompleteSuggestions(query, options = {}) {
    if (!query || query.length < 2) return [];
    
    const suggestions = [];
    const queryLower = query.toLowerCase();
    
    // Recent searches
    this.searchHistory
      .filter(h => h.query.toLowerCase().startsWith(queryLower))
      .slice(0, 3)
      .forEach(h => suggestions.push({
        text: h.query,
        type: 'recent',
        icon: '🕒'
      }));
    
    // Smart completions from data
    const completions = new Set();
    this.data.forEach(item => {
      Object.keys(item).forEach(key => {
        const value = String(item[key]);
        if (value.toLowerCase().includes(queryLower)) {
          completions.add(value);
        }
      });
    });
    
    Array.from(completions)
      .slice(0, 7)
      .forEach(completion => suggestions.push({
        text: completion,
        type: 'completion',
        icon: '💡'
      }));
    
    // Intelligent suggestions based on intent
    const intents = this.detectIntent(query);
    if (intents.includes('recent')) {
      suggestions.push({
        text: `${query} from today`,
        type: 'smart',
        icon: '🎯'
      });
    }
    
    return suggestions.slice(0, options.limit || 10);
  }

  // Learning system - records user interactions
  recordSearch(query, resultCount, searchTime, options) {
    const searchRecord = {
      query,
      resultCount,
      searchTime,
      timestamp: Date.now(),
      context: options.context,
      clickedResults: []
    };
    
    this.searchHistory.unshift(searchRecord);
    this.searchHistory = this.searchHistory.slice(0, 100); // Keep last 100 searches
    
    // Update analytics
    this.searchAnalytics[query] = (this.searchAnalytics[query] || 0) + 1;
    
    this.saveToStorage();
  }

  recordClick(query, itemId) {
    const searchRecord = this.searchHistory.find(h => h.query === query);
    if (searchRecord) {
      searchRecord.clickedResults.push(itemId);
    }
    this.saveToStorage();
  }

  // Data management
  setData(data) {
    this.data = Array.isArray(data) ? data : [data];
    this.searchCache.clear(); // Clear cache when data changes
    return this;
  }

  addData(item) {
    this.data.push(item);
    this.searchCache.clear();
    return this;
  }

  // Configuration methods
  setContextFilters(context, filters) {
    this.contextFilters[context] = filters;
    return this;
  }

  setPermissions(role, permissions) {
    this.permissions[role] = permissions;
    return this;
  }

  // Storage management
  saveToStorage() {
    localStorage.setItem('search_history', JSON.stringify(this.searchHistory));
    localStorage.setItem('user_preferences', JSON.stringify(this.userPreferences));
    localStorage.setItem('search_analytics', JSON.stringify(this.searchAnalytics));
  }

  // Analytics and insights
  getSearchAnalytics() {
    return {
      topQueries: Object.entries(this.searchAnalytics)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10),
      recentSearches: this.searchHistory.slice(0, 20),
      averageSearchTime: this.searchHistory.reduce((sum, h) => sum + h.searchTime, 0) / this.searchHistory.length
    };
  }

  // Performance optimization
  clearCache() {
    this.searchCache.clear();
    return this;
  }

  optimize() {
    // Clean old search history
    const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    this.searchHistory = this.searchHistory.filter(h => h.timestamp > oneWeekAgo);
    
    // Clean analytics for unused queries
    Object.keys(this.searchAnalytics).forEach(query => {
      if (this.searchAnalytics[query] < 2) {
        delete this.searchAnalytics[query];
      }
    });
    
    this.saveToStorage();
    return this;
  }
}

export default SmartSearch;