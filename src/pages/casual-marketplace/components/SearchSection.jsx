import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import SimpleCategoryDropdown from '../../product-catalog/components/SimpleCategoryDropdown';

const SearchSection = ({ searchParams, setSearchParams, categories = [], selectedCategory = 'all', onCategorySelect, placeholder = "Search items..." }) => {
  const [query, setQuery] = useState(searchParams.get('q') || '');

  useEffect(() => {
    setQuery(searchParams.get('q') || '');
  }, [searchParams]);

  const handleSearch = (e) => {
    e.preventDefault();
    const newParams = new URLSearchParams(searchParams);
    if (query.trim()) {
      newParams.set('q', query.trim());
    } else {
      newParams.delete('q');
    }
    setSearchParams(newParams);
  };

  return (
    <div className="bg-gradient-to-r from-teal-500 to-blue-600 pt-32 pb-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Casual Marketplace</h1>
          <p className="text-teal-100 text-lg">
            Buy and sell items easily with only 5% transaction fee
          </p>
        </div>
        
        <form onSubmit={handleSearch} className="max-w-4xl mx-auto">
          <div className="relative flex items-center bg-white rounded-xl shadow-lg overflow-hidden">
            {/* Category Dropdown */}
            <SimpleCategoryDropdown
              categories={categories}
              selectedCategory={selectedCategory}
              onCategorySelect={onCategorySelect}
              className="flex-shrink-0"
            />
            
            {/* Search Input */}
            <div className="flex-1 relative">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={placeholder}
                className="w-full h-14 pl-6 pr-32 text-lg border-0 focus:ring-4 focus:ring-white/30 focus:outline-none"
              />
              
              {/* Search Button */}
              <button
                type="submit"
                className="absolute right-2 top-2 h-10 px-6 bg-teal-500 hover:bg-teal-600 text-white rounded-xl transition-all duration-150 shadow-md hover:shadow-lg flex items-center"
              >
                <Icon name="Search" size={18} />
                <span className="hidden sm:inline ml-2 text-sm">Search</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SearchSection;