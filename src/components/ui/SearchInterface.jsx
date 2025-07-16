import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../AppIcon';
import Input from './Input';

const SearchInterface = ({ 
  onSearch, 
  placeholder = "Search products, shops...", 
  showSuggestions = true,
  className = "" 
}) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  // Mock suggestions data
  const mockSuggestions = [
    { type: 'product', text: 'iPhone 14 Pro', category: 'Electronics' },
    { type: 'product', text: 'Samsung Galaxy S23', category: 'Electronics' },
    { type: 'product', text: 'MacBook Air M2', category: 'Computers' },
    { type: 'shop', text: 'TechHub Store', category: 'Electronics Shop' },
    { type: 'shop', text: 'Fashion Central', category: 'Clothing Shop' },
    { type: 'category', text: 'Smartphones', category: 'Category' },
    { type: 'category', text: 'Laptops', category: 'Category' },
    { type: 'recent', text: 'Wireless headphones', category: 'Recent Search' }
  ];

  useEffect(() => {
    if (query.length > 0 && showSuggestions) {
      setIsLoading(true);
      // Simulate API call delay
      const timer = setTimeout(() => {
        const filtered = mockSuggestions.filter(item =>
          item.text.toLowerCase().includes(query.toLowerCase())
        );
        setSuggestions(filtered.slice(0, 8));
        setIsLoading(false);
        setIsOpen(true);
      }, 200);

      return () => clearTimeout(timer);
    } else {
      setSuggestions([]);
      setIsOpen(false);
    }
  }, [query, showSuggestions]);

  const handleInputChange = (e) => {
    setQuery(e.target.value);
    setSelectedIndex(-1);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      performSearch(query.trim());
    }
  };

  const performSearch = (searchQuery) => {
    setIsOpen(false);
    setQuery(searchQuery);
    
    // Add to recent searches
    const recentSearches = JSON.parse(localStorage.getItem('recentSearches') || '[]');
    const updatedSearches = [searchQuery, ...recentSearches.filter(s => s !== searchQuery)].slice(0, 5);
    localStorage.setItem('recentSearches', JSON.stringify(updatedSearches));

    if (onSearch) {
      onSearch(searchQuery);
    } else {
      navigate(`/product-catalog?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    performSearch(suggestion.text);
  };

  const handleKeyDown = (e) => {
    if (!isOpen || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          handleSuggestionClick(suggestions[selectedIndex]);
        } else if (query.trim()) {
          performSearch(query.trim());
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  const handleFocus = () => {
    if (query.length > 0 && suggestions.length > 0) {
      setIsOpen(true);
    }
  };

  const handleBlur = () => {
    // Delay closing to allow suggestion clicks
    setTimeout(() => setIsOpen(false), 150);
  };

  const getSuggestionIcon = (type) => {
    switch (type) {
      case 'product':
        return 'Package';
      case 'shop':
        return 'Store';
      case 'category':
        return 'Tag';
      case 'recent':
        return 'Clock';
      default:
        return 'Search';
    }
  };

  const clearSearch = () => {
    setQuery('');
    setSuggestions([]);
    setIsOpen(false);
    inputRef.current?.focus();
  };

  return (
    <div className={`relative ${className}`}>
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <Input
            ref={inputRef}
            type="search"
            placeholder={placeholder}
            value={query}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={handleFocus}
            onBlur={handleBlur}
            className="w-full pl-10 pr-10"
            autoComplete="off"
          />
          
          {/* Search Icon */}
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon 
              name="Search" 
              size={16} 
              color="var(--color-text-secondary)" 
            />
          </div>

          {/* Clear Button */}
          {query && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-text-secondary hover:text-foreground marketplace-transition"
            >
              <Icon name="X" size={16} />
            </button>
          )}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent"></div>
            </div>
          )}
        </div>
      </form>

      {/* Suggestions Dropdown */}
      {isOpen && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-popover border border-border rounded-md shadow-modal z-1010 max-h-80 overflow-y-auto">
          {suggestions.map((suggestion, index) => (
            <button
              key={`${suggestion.type}-${suggestion.text}-${index}`}
              onClick={() => handleSuggestionClick(suggestion)}
              className={`w-full flex items-center px-4 py-3 text-left hover:bg-muted marketplace-transition ${
                index === selectedIndex ? 'bg-muted' : ''
              }`}
            >
              <Icon 
                name={getSuggestionIcon(suggestion.type)} 
                size={16} 
                className="mr-3 text-text-secondary flex-shrink-0" 
              />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-foreground truncate">
                  {suggestion.text}
                </div>
                <div className="text-xs text-text-secondary">
                  {suggestion.category}
                </div>
              </div>
              <Icon 
                name="ArrowUpRight" 
                size={14} 
                className="ml-2 text-text-secondary flex-shrink-0" 
              />
            </button>
          ))}
        </div>
      )}

      {/* No Results */}
      {isOpen && !isLoading && query.length > 0 && suggestions.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-popover border border-border rounded-md shadow-modal z-1010">
          <div className="px-4 py-6 text-center">
            <Icon name="Search" size={24} className="mx-auto mb-2 text-text-secondary" />
            <p className="text-sm text-text-secondary">No results found for "{query}"</p>
            <p className="text-xs text-text-secondary mt-1">Try different keywords</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchInterface;