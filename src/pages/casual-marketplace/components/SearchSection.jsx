import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';

const SearchSection = ({ searchParams, setSearchParams, placeholder = "Search items..." }) => {
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
    <div className="bg-gradient-to-r from-teal-500 to-blue-600 pt-24 pb-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Casual Marketplace</h1>
          <p className="text-teal-100 text-lg">
            Buy and sell items easily with only 5% transaction fee
          </p>
        </div>
        
        <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={placeholder}
              className="w-full pl-12 pr-24 py-4 text-lg border-0 rounded-xl shadow-lg focus:ring-4 focus:ring-white/30 transition-all duration-300"
            />
            <Icon 
              name="Search" 
              size={24} 
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" 
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-teal-500 hover:bg-teal-600 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-300"
            >
              Search
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SearchSection;