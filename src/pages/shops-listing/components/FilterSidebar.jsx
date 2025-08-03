import React, { useState } from 'react';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Icon from '../../../components/AppIcon';

const FilterSidebar = ({ 
  filters, 
  onFilterChange,
  categories, 
  searchQuery, 
  setSearchQuery, 
  onSearch,
  sortBy,
  onSortChange,
  sortOptions,
  resultsCount,
  loading 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    onSearch();
  };

  const sortOptionsList = sortOptions || [
    { value: 'relevance', label: 'Most Relevant' },
    { value: 'rating', label: 'Highest Rated' },
    { value: 'newest', label: 'Newest First' },
    { value: 'popularity', label: 'Most Popular' }
  ];

  return (
    <div className="bg-surface border border-border rounded-xl p-6 sticky top-20 h-fit">
      {/* Mobile Toggle */}
      <div className="lg:hidden flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-text-primary">Filters & Search</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          iconName={isExpanded ? "ChevronUp" : "ChevronDown"}
        >
          {isExpanded ? 'Hide' : 'Show'}
        </Button>
      </div>

      <div className={`space-y-6 ${!isExpanded ? 'hidden lg:block' : 'block'}`}>
        {/* Search Section */}
        <div>
          <h4 className="text-sm font-medium text-text-primary mb-3 flex items-center">
            <Icon name="Search" size={16} className="mr-2" />
            Search Shops
          </h4>
          <form onSubmit={handleSearchSubmit} className="space-y-2">
            <div className="relative">
              <Input
                type="search"
                placeholder="Search by name, category, location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
              <Icon 
                name="Search" 
                size={16} 
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" 
              />
            </div>
            <Button 
              type="submit" 
              disabled={loading}
              className="w-full"
              size="sm"
            >
              {loading ? 'Searching...' : 'Search'}
            </Button>
          </form>
        </div>

        {/* Results Count */}
        <div className="text-sm text-text-secondary border-t border-border pt-4">
          <div className="flex items-center justify-between">
            <span>{resultsCount} shops found</span>
            <Icon name="Store" size={16} />
          </div>
        </div>

        {/* Sort Section */}
        <div>
          <h4 className="text-sm font-medium text-text-primary mb-3 flex items-center">
            <Icon name="ArrowUpDown" size={16} className="mr-2" />
            Sort By
          </h4>
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="w-full px-3 py-2 border border-border rounded-lg bg-surface text-text-primary focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            {sortOptionsList.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Category Filter */}
        <div>
          <h4 className="text-sm font-medium text-text-primary mb-3 flex items-center">
            <Icon name="Tag" size={16} className="mr-2" />
            Categories
          </h4>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {categories.map((category) => {
              const isActive = (category.id === 'all' && (!filters.categories?.length || filters.categories.length === 0)) ||
                             (category.id !== 'all' && filters.categories?.includes(category.id));
              
              return (
                <button
                  key={category.id}
                  onClick={() => {
                    if (category.id === 'all') {
                      onFilterChange('categories', []);
                    } else {
                      onFilterChange('categories', [category.id]);
                    }
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-text-secondary hover:bg-muted hover:text-text-primary'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{category.label}</span>
                    {isActive && <Icon name="Check" size={14} />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Rating Filter */}
        <div>
          <h4 className="text-sm font-medium text-text-primary mb-3 flex items-center">
            <Icon name="Star" size={16} className="mr-2" />
            Minimum Rating
          </h4>
          <div className="space-y-2">
            {[4.5, 4.0, 3.5, 3.0].map((rating) => (
              <button
                key={rating}
                onClick={() => onFilterChange('minRating', filters.minRating === rating ? null : rating)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                  filters.minRating === rating
                    ? 'bg-yellow-100 text-yellow-800 border border-yellow-300'
                    : 'text-text-secondary hover:bg-muted'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Icon name="Star" size={14} className="text-yellow-500" />
                    <span>{rating}+ Stars</span>
                  </div>
                  {filters.minRating === rating && <Icon name="Check" size={14} />}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Shop Status Filters */}
        <div>
          <h4 className="text-sm font-medium text-text-primary mb-3 flex items-center">
            <Icon name="Settings" size={16} className="mr-2" />
            Shop Status
          </h4>
          <div className="space-y-2">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.verifiedOnly || false}
                onChange={(e) => onFilterChange('verifiedOnly', e.target.checked)}
                className="w-4 h-4 text-primary border-border rounded focus:ring-primary"
              />
              <span className="text-sm text-text-secondary flex items-center gap-1">
                <Icon name="CheckCircle" size={14} className="text-primary" />
                Verified Only
              </span>
            </label>
            
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.onlineOnly || false}
                onChange={(e) => onFilterChange('onlineOnly', e.target.checked)}
                className="w-4 h-4 text-primary border-border rounded focus:ring-primary"
              />
              <span className="text-sm text-text-secondary flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                Online Only
              </span>
            </label>
          </div>
        </div>

        {/* Clear Filters */}
        <div className="border-t border-border pt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              onFilterChange('categories', []);
              onFilterChange('minRating', null);
              onFilterChange('verifiedOnly', false);
              onFilterChange('onlineOnly', false);
              setSearchQuery('');
            }}
            className="w-full"
            iconName="X"
          >
            Clear All Filters
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="bg-muted rounded-lg p-4 text-center">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="font-semibold text-text-primary">{resultsCount}</div>
              <div className="text-text-secondary">Total Shops</div>
            </div>
            <div>
              <div className="font-semibold text-text-primary">{filters.categories?.length || 0}</div>
              <div className="text-text-secondary">Active Filters</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterSidebar;