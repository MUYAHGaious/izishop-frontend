import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const FilterPanel = ({ isOpen, onClose, filters, onFilterChange, onClearAll }) => {
  const [expandedSections, setExpandedSections] = useState({
    price: true,
    brand: true,
    rating: true,
    features: true,
    category: true
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-FR').format(price);
  };

  // Filter options
  const priceRanges = [
    { id: '0-50000', label: 'Under 50,000 XAF', min: 0, max: 50000 },
    { id: '50000-100000', label: '50,000 - 100,000 XAF', min: 50000, max: 100000 },
    { id: '100000-250000', label: '100,000 - 250,000 XAF', min: 100000, max: 250000 },
    { id: '250000-500000', label: '250,000 - 500,000 XAF', min: 250000, max: 500000 },
    { id: '500000+', label: 'Over 500,000 XAF', min: 500000, max: Infinity }
  ];

  const brands = [
    { id: 'samsung', name: 'Samsung', count: 234 },
    { id: 'apple', name: 'Apple', count: 189 },
    { id: 'nike', name: 'Nike', count: 156 },
    { id: 'adidas', name: 'Adidas', count: 143 },
    { id: 'sony', name: 'Sony', count: 98 },
    { id: 'canon', name: 'Canon', count: 76 },
    { id: 'local', name: 'Local Brands', count: 245 }
  ];

  const categories = [
    { id: 'electronics', name: 'Electronics', count: 1247 },
    { id: 'fashion', name: 'Fashion', count: 892 },
    { id: 'sports', name: 'Sports & Outdoors', count: 634 },
    { id: 'home', name: 'Home & Garden', count: 456 },
    { id: 'beauty', name: 'Beauty & Health', count: 321 },
    { id: 'books', name: 'Books & Media', count: 289 },
    { id: 'automotive', name: 'Automotive', count: 178 }
  ];

  const features = [
    { id: 'free-shipping', name: 'Free Shipping', count: 1456 },
    { id: 'new-arrivals', name: 'New Arrivals', count: 234 },
    { id: 'on-sale', name: 'On Sale', count: 567 },
    { id: 'best-seller', name: 'Best Sellers', count: 123 },
    { id: 'eco-friendly', name: 'Eco-Friendly', count: 89 },
    { id: 'premium', name: 'Premium Quality', count: 156 }
  ];

  const handleFilterToggle = (filterType, value) => {
    const currentValues = filters[filterType] || [];
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value];
    
    onFilterChange(filterType, newValues);
  };

  const handlePriceRangeChange = (range) => {
    onFilterChange('priceRange', range);
  };

  const FilterSection = ({ title, isExpanded, onToggle, children, count }) => (
    <div className="border-b border-gray-200 last:border-b-0">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors duration-200"
      >
        <div className="flex items-center space-x-2">
          <span className="font-medium text-gray-900">{title}</span>
          {count && (
            <span className="text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded-full">
              {count}
            </span>
          )}
        </div>
        <Icon 
          name={isExpanded ? "ChevronUp" : "ChevronDown"} 
          size={16} 
          className="text-gray-500 transition-transform duration-200"
        />
      </button>
      {isExpanded && (
        <div className="px-4 pb-4">
          {children}
        </div>
      )}
    </div>
  );

  const CheckboxItem = ({ id, label, count, checked, onChange }) => (
    <label className="flex items-center space-x-3 py-2 cursor-pointer hover:bg-gray-50 rounded-lg px-2 transition-colors duration-200">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500 focus:ring-2"
      />
      <span className="flex-1 text-sm text-gray-700">{label}</span>
      {count && (
        <span className="text-xs text-gray-500">({count})</span>
      )}
    </label>
  );

  const content = (
    <div className="bg-white h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-orange-50 to-pink-50">
        <div className="flex items-center space-x-2">
          <Icon name="Filter" size={20} className="text-orange-500" />
          <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
        </div>
        <div className="flex items-center space-x-2">
          {Object.keys(filters).length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearAll}
              className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
            >
              Clear All
            </Button>
          )}
          {/* Mobile close button */}
          <button
            onClick={onClose}
            className="lg:hidden w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors duration-200"
          >
            <Icon name="X" size={16} className="text-gray-500" />
          </button>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Price Range */}
        <FilterSection
          title="Price Range"
          isExpanded={expandedSections.price}
          onToggle={() => toggleSection('price')}
        >
          <div className="space-y-2">
            {priceRanges.map((range) => (
              <label
                key={range.id}
                className="flex items-center space-x-3 py-2 cursor-pointer hover:bg-gray-50 rounded-lg px-2 transition-colors duration-200"
              >
                <input
                  type="radio"
                  name="priceRange"
                  checked={filters.priceRange?.id === range.id}
                  onChange={() => handlePriceRangeChange(range)}
                  className="w-4 h-4 text-orange-500 border-gray-300 focus:ring-orange-500 focus:ring-2"
                />
                <span className="text-sm text-gray-700">{range.label}</span>
              </label>
            ))}
          </div>
        </FilterSection>

        {/* Categories */}
        <FilterSection
          title="Categories"
          isExpanded={expandedSections.category}
          onToggle={() => toggleSection('category')}
          count={filters.categories?.length}
        >
          <div className="space-y-1">
            {categories.map((category) => (
              <CheckboxItem
                key={category.id}
                id={category.id}
                label={category.name}
                count={category.count}
                checked={filters.categories?.includes(category.id) || false}
                onChange={() => handleFilterToggle('categories', category.id)}
              />
            ))}
          </div>
        </FilterSection>

        {/* Brands */}
        <FilterSection
          title="Brands"
          isExpanded={expandedSections.brand}
          onToggle={() => toggleSection('brand')}
          count={filters.brands?.length}
        >
          <div className="space-y-1">
            {brands.map((brand) => (
              <CheckboxItem
                key={brand.id}
                id={brand.id}
                label={brand.name}
                count={brand.count}
                checked={filters.brands?.includes(brand.id) || false}
                onChange={() => handleFilterToggle('brands', brand.id)}
              />
            ))}
          </div>
        </FilterSection>

        {/* Rating */}
        <FilterSection
          title="Customer Rating"
          isExpanded={expandedSections.rating}
          onToggle={() => toggleSection('rating')}
        >
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((rating) => (
              <label
                key={rating}
                className="flex items-center space-x-3 py-2 cursor-pointer hover:bg-gray-50 rounded-lg px-2 transition-colors duration-200"
              >
                <input
                  type="checkbox"
                  checked={filters.rating?.includes(rating) || false}
                  onChange={() => handleFilterToggle('rating', rating)}
                  className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500 focus:ring-2"
                />
                <div className="flex items-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Icon 
                      key={i}
                      name="Star" 
                      size={14} 
                      className={i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'} 
                    />
                  ))}
                  <span className="text-sm text-gray-700 ml-2">& Up</span>
                </div>
              </label>
            ))}
          </div>
        </FilterSection>

        {/* Features */}
        <FilterSection
          title="Features"
          isExpanded={expandedSections.features}
          onToggle={() => toggleSection('features')}
          count={filters.features?.length}
        >
          <div className="space-y-1">
            {features.map((feature) => (
              <CheckboxItem
                key={feature.id}
                id={feature.id}
                label={feature.name}
                count={feature.count}
                checked={filters.features?.includes(feature.id) || false}
                onChange={() => handleFilterToggle('features', feature.id)}
              />
            ))}
          </div>
        </FilterSection>
      </div>

      {/* Footer - Apply Button for Mobile */}
      <div className="lg:hidden border-t border-gray-200 p-4 bg-gray-50">
        <Button
          onClick={onClose}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white"
        >
          Apply Filters
        </Button>
      </div>
    </div>
  );

  // Return overlay for both mobile and desktop
  if (!isOpen) return null;

  return (
    <>
      {/* Overlay for both mobile and desktop */}
      <div className="fixed inset-0 z-50">
        <div 
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />
        {/* Mobile: slide from right, Desktop: slide from left */}
        <div className="absolute top-0 bottom-0 w-80 max-w-[90vw] lg:left-0 right-0 lg:right-auto">
          {content}
        </div>
      </div>
    </>
  );
};

export default FilterPanel;