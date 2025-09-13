import React, { useState, useRef, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import SimpleCategoryDropdown from './SimpleCategoryDropdown';

const SearchSection = ({ searchParams, setSearchParams, categories = [], selectedCategory = 'all', onCategorySelect }) => {
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const searchRef = useRef(null);

  // Mock search suggestions
  const mockSuggestions = [
    { type: 'recent', text: 'Samsung Galaxy S24', icon: 'Clock' },
    { type: 'recent', text: 'Nike Air Max', icon: 'Clock' },
    { type: 'trending', text: 'iPhone 15 Pro', icon: 'TrendingUp' },
    { type: 'trending', text: 'MacBook Pro M3', icon: 'TrendingUp' },
    { type: 'category', text: 'Electronics', icon: 'Smartphone' },
    { type: 'category', text: 'Fashion', icon: 'Shirt' },
    { type: 'category', text: 'Sports', icon: 'Dumbbell' }
  ];

  // Handle search input change
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    if (value.length > 0) {
      // Filter suggestions based on input
      const filtered = mockSuggestions.filter(suggestion =>
        suggestion.text.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(filtered.slice(0, 6));
      setShowSuggestions(true);
    } else {
      setSuggestions(mockSuggestions.slice(0, 6));
      setShowSuggestions(true);
    }
  };

  // Handle search submit
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const newParams = new URLSearchParams(searchParams);
      newParams.set('q', searchQuery.trim());
      // Only set category if it's not 'all'
      if (selectedCategory !== 'all') {
        newParams.set('category', selectedCategory);
      }
      setSearchParams(newParams);
      setShowSuggestions(false);
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion) => {
    setSearchQuery(suggestion.text);
    const newParams = new URLSearchParams(searchParams);
    newParams.set('q', suggestion.text);
    // Only set category if it's not 'all'
    if (selectedCategory !== 'all') {
      newParams.set('category', selectedCategory);
    }
    setSearchParams(newParams);
    setShowSuggestions(false);
  };

  // Handle category selection
  const handleCategorySelect = (category) => {
    if (onCategorySelect) {
      onCategorySelect(category);
    }
  };

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="bg-gradient-to-r from-teal-500 via-teal-600 to-emerald-500 pt-32">
      <div className="container mx-auto px-4 py-8">
        {/* Search Bar */}
        <div className="max-w-4xl mx-auto relative" ref={searchRef}>
          <form onSubmit={handleSearchSubmit} className="relative">
            <div className="relative flex items-center bg-white rounded-2xl shadow-lg overflow-hidden">
              {/* Category Dropdown */}
              <SimpleCategoryDropdown
                categories={categories}
                selectedCategory={selectedCategory}
                onCategorySelect={handleCategorySelect}
                className="flex-shrink-0"
              />
              
              {/* Search Input */}
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onFocus={() => setShowSuggestions(true)}
                  placeholder="Search for products, brands, categories..."
                  className="w-full h-14 pl-6 pr-32 text-lg border-0 focus:ring-4 focus:ring-white/30 focus:outline-none"
                />
                
                {/* Search Button */}
                <Button
                  type="submit"
                  className="absolute right-2 top-2 h-10 px-6 bg-teal-500 hover:bg-teal-600 text-white rounded-xl"
                >
                  <Icon name="Search" size={20} />
                  <span className="hidden sm:inline ml-2">Search</span>
                </Button>
              </div>
            </div>
          </form>

          {/* Search Suggestions Dropdown */}
          {showSuggestions && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 z-40 max-h-96 overflow-y-auto">
              {suggestions.length > 0 ? (
                <div className="p-4">
                  {/* Recent Searches */}
                  {suggestions.some(s => s.type === 'recent') && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-500 mb-2 px-2">Recent Searches</h4>
                      {suggestions.filter(s => s.type === 'recent').map((suggestion, index) => (
                        <button
                          key={`recent-${index}`}
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="w-full flex items-center px-3 py-2 hover:bg-gray-50 rounded-lg text-left"
                        >
                          <Icon name={suggestion.icon} size={16} className="text-gray-400 mr-3" />
                          <span className="text-gray-700">{suggestion.text}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Trending Searches */}
                  {suggestions.some(s => s.type === 'trending') && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-500 mb-2 px-2">Trending</h4>
                      {suggestions.filter(s => s.type === 'trending').map((suggestion, index) => (
                        <button
                          key={`trending-${index}`}
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="w-full flex items-center px-3 py-2 hover:bg-gray-50 rounded-lg text-left"
                        >
                          <Icon name={suggestion.icon} size={16} className="text-teal-500 mr-3" />
                          <span className="text-gray-700">{suggestion.text}</span>
                          <span className="ml-auto text-xs text-teal-500 font-medium">Trending</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Categories */}
                  {suggestions.some(s => s.type === 'category') && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-2 px-2">Categories</h4>
                      {suggestions.filter(s => s.type === 'category').map((suggestion, index) => (
                        <button
                          key={`category-${index}`}
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="w-full flex items-center px-3 py-2 hover:bg-gray-50 rounded-lg text-left"
                        >
                          <Icon name={suggestion.icon} size={16} className="text-blue-500 mr-3" />
                          <span className="text-gray-700">{suggestion.text}</span>
                          <span className="ml-auto text-xs text-blue-500">Category</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-8 text-center text-gray-500">
                  <Icon name="Search" size={32} className="mx-auto mb-2 text-gray-300" />
                  <p>No suggestions found</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Quick Search Tags */}
        <div className="max-w-4xl mx-auto mt-6">
          <div className="flex flex-wrap gap-2 justify-center">
            {['iPhone', 'Samsung', 'Nike', 'Adidas', 'MacBook', 'Headphones'].map((tag) => (
              <button
                key={tag}
                onClick={() => handleSuggestionClick({ text: tag })}
                className="px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-full text-sm hover:bg-white/30 transition-all duration-200"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchSection;

