import React, { useState, useEffect, useRef, useCallback } from 'react';
import SmartSearch from '../utils/SmartSearch';
import { getSearchPlaceholder } from '../utils/SearchConfig';
import './SmartSearchInput.css';

const SmartSearchInput = ({
  data = [],
  placeholder = null, // Will be auto-generated based on role and context
  context = "default",
  userRole = "user",
  userId = null, // Current user ID for permission filtering
  userDepartment = null, // User's department for department-based filtering
  shopId = null, // Shop ID for shop-specific filtering
  onResults = () => {},
  onSelect = () => {},
  className = "",
  maxResults = 50,
  showAnalytics = false,
  customFilters = {},
  customPermissions = {},
  debounceMs = 150,
  enableVoiceSearch = false
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [searchTime, setSearchTime] = useState(0);
  const [isVoiceRecording, setIsVoiceRecording] = useState(false);
  
  const searchRef = useRef(null);
  const suggestionRefs = useRef([]);
  const debounceRef = useRef(null);
  const smartSearchRef = useRef(null);
  const recognitionRef = useRef(null);

  // Initialize SmartSearch instance
  useEffect(() => {
    smartSearchRef.current = new SmartSearch();
    smartSearchRef.current
      .setData(data)
      .setContextFilters(context, customFilters)
      .setPermissions(userRole, customPermissions);

    // Initialize voice recognition if supported
    if (enableVoiceSearch && 'webkitSpeechRecognition' in window) {
      recognitionRef.current = new window.webkitSpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';
      
      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setQuery(transcript);
        handleSearch(transcript);
        setIsVoiceRecording(false);
      };
      
      recognitionRef.current.onerror = () => {
        setIsVoiceRecording(false);
      };
      
      recognitionRef.current.onend = () => {
        setIsVoiceRecording(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [data, context, userRole, customFilters, customPermissions, enableVoiceSearch]);

  // Debounced search function
  const debouncedSearch = useCallback((searchQuery) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    
    debounceRef.current = setTimeout(() => {
      performSearch(searchQuery);
    }, debounceMs);
  }, [debounceMs]);

  // Main search function
  const performSearch = async (searchQuery) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setSuggestions([]);
      setShowSuggestions(false);
      onResults([]);
      return;
    }

    setIsLoading(true);
    const startTime = performance.now();

    try {
      // Get search results with user info for role-based filtering
      const searchResults = smartSearchRef.current.search(searchQuery, {
        context,
        userRole,
        userId,
        userDepartment,
        shopId,
        limit: maxResults
      });

      // Get autocomplete suggestions
      const autocompleteSuggestions = smartSearchRef.current.getAutocompleteSuggestions(searchQuery, {
        limit: 8
      });

      const endTime = performance.now();
      const duration = endTime - startTime;

      setResults(searchResults);
      setSuggestions(autocompleteSuggestions);
      setSearchTime(duration);
      setShowSuggestions(true);
      
      onResults(searchResults);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle search input
  const handleSearch = (searchQuery) => {
    debouncedSearch(searchQuery);
  };

  // Handle input change
  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    setSelectedIndex(-1);
    handleSearch(value);
  };

  // Handle suggestion selection
  const handleSuggestionSelect = (suggestion) => {
    setQuery(suggestion.text);
    setShowSuggestions(false);
    setSelectedIndex(-1);
    performSearch(suggestion.text);
  };

  // Handle result selection
  const handleResultSelect = (result) => {
    smartSearchRef.current.recordClick(query, result.id);
    onSelect(result);
    setShowSuggestions(false);
    
    // Update user preferences based on selection
    const preferences = JSON.parse(localStorage.getItem('user_preferences') || '{}');
    if (result.category) {
      preferences[result.category] = (preferences[result.category] || 0) + 1;
    }
    localStorage.setItem('user_preferences', JSON.stringify(preferences));
  };

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    const totalItems = suggestions.length + results.length;
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < totalItems - 1 ? prev + 1 : -1
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > -1 ? prev - 1 : totalItems - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          if (selectedIndex < suggestions.length) {
            handleSuggestionSelect(suggestions[selectedIndex]);
          } else {
            handleResultSelect(results[selectedIndex - suggestions.length]);
          }
        } else if (query.trim()) {
          performSearch(query);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        searchRef.current?.blur();
        break;
    }
  };

  // Handle voice search
  const handleVoiceSearch = () => {
    if (recognitionRef.current && !isVoiceRecording) {
      setIsVoiceRecording(true);
      recognitionRef.current.start();
    }
  };

  // Clear search
  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setSuggestions([]);
    setShowSuggestions(false);
    setSelectedIndex(-1);
    onResults([]);
    searchRef.current?.focus();
  };

  // Click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Highlight matching text
  const highlightMatch = (text, query) => {
    if (!query.trim()) return text;
    
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? 
        <mark key={index} className="search-highlight">{part}</mark> : part
    );
  };

  return (
    <div className={`smart-search-container ${className}`} ref={searchRef}>
      <div className="search-input-wrapper">
        <div className="search-icon">
          {isLoading ? (
            <div className="loading-spinner" />
          ) : (
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
            </svg>
          )}
        </div>
        
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => query && setShowSuggestions(true)}
          placeholder={placeholder || getSearchPlaceholder(userRole, context)}
          className="search-input"
          autoComplete="off"
          spellCheck="false"
        />
        
        {query && (
          <button
            type="button"
            className="clear-button"
            onClick={clearSearch}
            title="Clear search"
          >
            ×
          </button>
        )}
        
        {enableVoiceSearch && recognitionRef.current && (
          <button
            type="button"
            className={`voice-button ${isVoiceRecording ? 'recording' : ''}`}
            onClick={handleVoiceSearch}
            title="Voice search"
            disabled={isVoiceRecording}
          >
            🎤
          </button>
        )}
      </div>

      {showSuggestions && (suggestions.length > 0 || results.length > 0) && (
        <div className="search-dropdown">
          {suggestions.length > 0 && (
            <div className="suggestions-section">
              <div className="section-header">Suggestions</div>
              {suggestions.map((suggestion, index) => (
                <div
                  key={`suggestion-${index}`}
                  ref={el => suggestionRefs.current[index] = el}
                  className={`suggestion-item ${selectedIndex === index ? 'selected' : ''}`}
                  onClick={() => handleSuggestionSelect(suggestion)}
                >
                  <span className="suggestion-icon">{suggestion.icon}</span>
                  <span className="suggestion-text">
                    {highlightMatch(suggestion.text, query)}
                  </span>
                  <span className="suggestion-type">{suggestion.type}</span>
                </div>
              ))}
            </div>
          )}

          {results.length > 0 && (
            <div className="results-section">
              <div className="section-header">
                Results ({results.length})
                {searchTime > 0 && (
                  <span className="search-time">
                    {searchTime.toFixed(0)}ms
                  </span>
                )}
              </div>
              {results.slice(0, 10).map((result, index) => {
                const resultIndex = suggestions.length + index;
                return (
                  <div
                    key={result.id || index}
                    className={`result-item ${selectedIndex === resultIndex ? 'selected' : ''}`}
                    onClick={() => handleResultSelect(result)}
                  >
                    <div className="result-title">
                      {highlightMatch(result.title || result.name || 'Untitled', query)}
                    </div>
                    {result.description && (
                      <div className="result-description">
                        {highlightMatch(result.description.substring(0, 100), query)}
                        {result.description.length > 100 && '...'}
                      </div>
                    )}
                    <div className="result-meta">
                      {result.category && (
                        <span className="result-category">{result.category}</span>
                      )}
                      {result._score && showAnalytics && (
                        <span className="result-score">
                          Score: {result._score.toFixed(0)}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
              
              {results.length > 10 && (
                <div className="more-results">
                  +{results.length - 10} more results
                </div>
              )}
            </div>
          )}

          {query && results.length === 0 && suggestions.length === 0 && !isLoading && (
            <div className="no-results">
              <div className="no-results-icon">🔍</div>
              <div className="no-results-text">
                No results found for "{query}"
              </div>
              <div className="no-results-suggestion">
                Try different keywords or check spelling
              </div>
            </div>
          )}
        </div>
      )}

      {showAnalytics && query && (
        <div className="search-analytics">
          <small>
            Found {results.length} results in {searchTime.toFixed(0)}ms
          </small>
        </div>
      )}
    </div>
  );
};

export default SmartSearchInput;