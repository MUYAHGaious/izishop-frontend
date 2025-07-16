import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const SearchAndFilters = ({ onSearch, onFilter, onSort, savedFilters, onSaveFilter }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilters, setActiveFilters] = useState({
    category: '',
    status: '',
    condition: '',
    priceRange: '',
    stockLevel: ''
  });
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [filterName, setFilterName] = useState('');

  const categoryOptions = [
    { value: '', label: 'All Categories' },
    { value: 'electronics', label: 'Electronics' },
    { value: 'clothing', label: 'Clothing & Fashion' },
    { value: 'home', label: 'Home & Garden' },
    { value: 'sports', label: 'Sports & Outdoors' },
    { value: 'books', label: 'Books & Media' },
    { value: 'automotive', label: 'Automotive' },
    { value: 'health', label: 'Health & Beauty' },
    { value: 'toys', label: 'Toys & Games' }
  ];

  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'draft', label: 'Draft' },
    { value: 'out-of-stock', label: 'Out of Stock' }
  ];

  const conditionOptions = [
    { value: '', label: 'All Conditions' },
    { value: 'new', label: 'New' },
    { value: 'like-new', label: 'Like New' },
    { value: 'good', label: 'Good' },
    { value: 'fair', label: 'Fair' },
    { value: 'poor', label: 'Poor' }
  ];

  const priceRangeOptions = [
    { value: '', label: 'All Prices' },
    { value: '0-1000', label: 'Under 1,000 XAF' },
    { value: '1000-5000', label: '1,000 - 5,000 XAF' },
    { value: '5000-10000', label: '5,000 - 10,000 XAF' },
    { value: '10000-50000', label: '10,000 - 50,000 XAF' },
    { value: '50000+', label: 'Over 50,000 XAF' }
  ];

  const stockLevelOptions = [
    { value: '', label: 'All Stock Levels' },
    { value: 'in-stock', label: 'In Stock' },
    { value: 'low-stock', label: 'Low Stock (≤5)' },
    { value: 'out-of-stock', label: 'Out of Stock' }
  ];

  const sortOptions = [
    { value: 'name-asc', label: 'Name (A-Z)' },
    { value: 'name-desc', label: 'Name (Z-A)' },
    { value: 'price-asc', label: 'Price (Low to High)' },
    { value: 'price-desc', label: 'Price (High to Low)' },
    { value: 'stock-asc', label: 'Stock (Low to High)' },
    { value: 'stock-desc', label: 'Stock (High to Low)' },
    { value: 'created-desc', label: 'Newest First' },
    { value: 'created-asc', label: 'Oldest First' }
  ];

  const handleSearch = (value) => {
    setSearchTerm(value);
    onSearch(value);
  };

  const handleFilterChange = (filterKey, value) => {
    const newFilters = {
      ...activeFilters,
      [filterKey]: value
    };
    setActiveFilters(newFilters);
    onFilter(newFilters);
  };

  const clearAllFilters = () => {
    const clearedFilters = {
      category: '',
      status: '',
      condition: '',
      priceRange: '',
      stockLevel: ''
    };
    setActiveFilters(clearedFilters);
    setSearchTerm('');
    onFilter(clearedFilters);
    onSearch('');
  };

  const getActiveFilterCount = () => {
    return Object.values(activeFilters).filter(value => value !== '').length;
  };

  const handleSaveFilter = () => {
    if (filterName.trim()) {
      onSaveFilter(filterName, { ...activeFilters, searchTerm });
      setFilterName('');
    }
  };

  const applySavedFilter = (filter) => {
    setActiveFilters(filter.filters);
    setSearchTerm(filter.filters.searchTerm || '');
    onFilter(filter.filters);
    onSearch(filter.filters.searchTerm || '');
  };

  return (
    <div className="bg-surface rounded-lg border border-border p-6 mb-6">
      {/* Search Bar */}
      <div className="flex flex-col lg:flex-row gap-4 mb-4">
        <div className="flex-1">
          <div className="relative">
            <Icon 
              name="Search" 
              size={20} 
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" 
            />
            <input
              type="text"
              placeholder="Search products by name, SKU, or description..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            iconName="Filter"
            iconPosition="left"
            iconSize={16}
          >
            Filters
            {getActiveFilterCount() > 0 && (
              <span className="ml-2 bg-primary text-white text-xs px-2 py-0.5 rounded-full">
                {getActiveFilterCount()}
              </span>
            )}
          </Button>
          
          {getActiveFilterCount() > 0 && (
            <Button
              variant="ghost"
              onClick={clearAllFilters}
              iconName="X"
              iconSize={16}
              className="text-muted-foreground hover:text-foreground"
            >
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Quick Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        <Select
          options={categoryOptions}
          value={activeFilters.category}
          onChange={(value) => handleFilterChange('category', value)}
          placeholder="Category"
          className="w-40"
        />
        <Select
          options={statusOptions}
          value={activeFilters.status}
          onChange={(value) => handleFilterChange('status', value)}
          placeholder="Status"
          className="w-32"
        />
        <Select
          options={sortOptions}
          value=""
          onChange={onSort}
          placeholder="Sort by..."
          className="w-40"
        />
      </div>

      {/* Advanced Filters */}
      {showAdvancedFilters && (
        <div className="border-t border-border pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            <Select
              label="Condition"
              options={conditionOptions}
              value={activeFilters.condition}
              onChange={(value) => handleFilterChange('condition', value)}
            />
            <Select
              label="Price Range"
              options={priceRangeOptions}
              value={activeFilters.priceRange}
              onChange={(value) => handleFilterChange('priceRange', value)}
            />
            <Select
              label="Stock Level"
              options={stockLevelOptions}
              value={activeFilters.stockLevel}
              onChange={(value) => handleFilterChange('stockLevel', value)}
            />
          </div>

          {/* Save Filter */}
          <div className="flex items-center space-x-2 pt-4 border-t border-border">
            <Input
              type="text"
              placeholder="Filter name..."
              value={filterName}
              onChange={(e) => setFilterName(e.target.value)}
              className="w-48"
            />
            <Button
              variant="outline"
              onClick={handleSaveFilter}
              disabled={!filterName.trim()}
              iconName="Save"
              iconSize={16}
            >
              Save Filter
            </Button>
          </div>
        </div>
      )}

      {/* Saved Filters */}
      {savedFilters.length > 0 && (
        <div className="border-t border-border pt-4 mt-4">
          <h4 className="text-sm font-medium text-foreground mb-2">Saved Filters</h4>
          <div className="flex flex-wrap gap-2">
            {savedFilters.map((filter) => (
              <Button
                key={filter.id}
                variant="ghost"
                size="sm"
                onClick={() => applySavedFilter(filter)}
                iconName="Filter"
                iconPosition="left"
                iconSize={14}
                className="border border-border hover:border-primary/20"
              >
                {filter.name}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchAndFilters;