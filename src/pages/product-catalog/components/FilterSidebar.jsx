import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { Checkbox } from '../../../components/ui/Checkbox';

const FilterSidebar = ({ filters, onFiltersChange, onClearFilters, isVisible, onClose }) => {
  const [expandedSections, setExpandedSections] = useState({
    categories: true,
    price: true,
    brands: false,
    condition: true,
    seller: true,
    rating: false
  });

  const [priceRange, setPriceRange] = useState({
    min: filters.priceRange?.min || '',
    max: filters.priceRange?.max || ''
  });

  const categories = [
    { id: 'electronics', name: 'Electronics', count: 1234 },
    { id: 'fashion', name: 'Fashion & Clothing', count: 856 },
    { id: 'home', name: 'Home & Garden', count: 642 },
    { id: 'sports', name: 'Sports & Outdoors', count: 423 },
    { id: 'books', name: 'Books & Media', count: 312 },
    { id: 'toys', name: 'Toys & Games', count: 289 },
    { id: 'beauty', name: 'Beauty & Health', count: 234 },
    { id: 'automotive', name: 'Automotive', count: 156 }
  ];

  const brands = [
    { id: 'apple', name: 'Apple', count: 89 },
    { id: 'samsung', name: 'Samsung', count: 76 },
    { id: 'nike', name: 'Nike', count: 54 },
    { id: 'adidas', name: 'Adidas', count: 43 },
    { id: 'sony', name: 'Sony', count: 38 },
    { id: 'lg', name: 'LG', count: 32 }
  ];

  const conditions = [
    { id: 'new', name: 'New', count: 2341 },
    { id: 'like-new', name: 'Like New', count: 456 },
    { id: 'good', name: 'Good', count: 234 },
    { id: 'fair', name: 'Fair', count: 123 }
  ];

  const sellerTypes = [
    { id: 'shop', name: 'Verified Shops', count: 1876 },
    { id: 'casual', name: 'Individual Sellers', count: 1278 }
  ];

  const ratings = [
    { id: '4+', name: '4 Stars & Up', count: 1234 },
    { id: '3+', name: '3 Stars & Up', count: 2341 },
    { id: '2+', name: '2 Stars & Up', count: 2856 },
    { id: '1+', name: '1 Star & Up', count: 3154 }
  ];

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleFilterChange = (filterType, value, checked) => {
    const currentValues = filters[filterType] || [];
    let newValues;

    if (checked) {
      newValues = [...currentValues, value];
    } else {
      newValues = currentValues.filter(v => v !== value);
    }

    onFiltersChange({
      ...filters,
      [filterType]: newValues
    });
  };

  const handlePriceRangeChange = (field, value) => {
    const newPriceRange = { ...priceRange, [field]: value };
    setPriceRange(newPriceRange);
    
    // Apply price filter with debounce
    clearTimeout(window.priceFilterTimeout);
    window.priceFilterTimeout = setTimeout(() => {
      onFiltersChange({
        ...filters,
        priceRange: {
          min: newPriceRange.min ? parseFloat(newPriceRange.min) : null,
          max: newPriceRange.max ? parseFloat(newPriceRange.max) : null
        }
      });
    }, 500);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.categories?.length) count += filters.categories.length;
    if (filters.brands?.length) count += filters.brands.length;
    if (filters.conditions?.length) count += filters.conditions.length;
    if (filters.sellerTypes?.length) count += filters.sellerTypes.length;
    if (filters.ratings?.length) count += filters.ratings.length;
    if (filters.priceRange?.min || filters.priceRange?.max) count += 1;
    return count;
  };

  const renderFilterSection = (title, items, filterKey, sectionKey) => (
    <div className="border-b border-border last:border-b-0">
      <button
        onClick={() => toggleSection(sectionKey)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-muted marketplace-transition"
      >
        <span className="font-medium text-foreground">{title}</span>
        <Icon 
          name="ChevronDown" 
          size={16} 
          className={`marketplace-transition ${expandedSections[sectionKey] ? 'rotate-180' : ''}`} 
        />
      </button>
      
      {expandedSections[sectionKey] && (
        <div className="px-4 pb-4 space-y-2 max-h-64 overflow-y-auto">
          {items.map((item) => (
            <div key={item.id} className="flex items-center justify-between">
              <Checkbox
                label={item.name}
                checked={filters[filterKey]?.includes(item.id) || false}
                onChange={(e) => handleFilterChange(filterKey, item.id, e.target.checked)}
                className="flex-1"
              />
              <span className="text-xs text-text-secondary ml-2">
                {item.count}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const sidebarContent = (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center space-x-2">
          <h2 className="font-semibold text-foreground">Filters</h2>
          {getActiveFiltersCount() > 0 && (
            <span className="bg-primary text-primary-foreground text-xs font-medium px-2 py-1 rounded-full">
              {getActiveFiltersCount()}
            </span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          {getActiveFiltersCount() > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearFilters}
              iconName="X"
              iconPosition="left"
            >
              Clear
            </Button>
          )}
          <button
            onClick={onClose}
            className="md:hidden p-1 rounded-md text-text-secondary hover:text-foreground hover:bg-muted marketplace-transition"
          >
            <Icon name="X" size={20} />
          </button>
        </div>
      </div>

      {/* Filter Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Price Range */}
        <div className="border-b border-border">
          <button
            onClick={() => toggleSection('price')}
            className="w-full flex items-center justify-between p-4 text-left hover:bg-muted marketplace-transition"
          >
            <span className="font-medium text-foreground">Price Range</span>
            <Icon 
              name="ChevronDown" 
              size={16} 
              className={`marketplace-transition ${expandedSections.price ? 'rotate-180' : ''}`} 
            />
          </button>
          
          {expandedSections.price && (
            <div className="px-4 pb-4 space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="number"
                  placeholder="Min (XAF)"
                  value={priceRange.min}
                  onChange={(e) => handlePriceRangeChange('min', e.target.value)}
                />
                <Input
                  type="number"
                  placeholder="Max (XAF)"
                  value={priceRange.max}
                  onChange={(e) => handlePriceRangeChange('max', e.target.value)}
                />
              </div>
              <div className="flex items-center space-x-2 text-xs text-text-secondary">
                <span>Popular ranges:</span>
                <button
                  onClick={() => {
                    setPriceRange({ min: '0', max: '50000' });
                    handlePriceRangeChange('min', '0');
                    handlePriceRangeChange('max', '50000');
                  }}
                  className="text-primary hover:underline"
                >
                  Under 50K
                </button>
                <button
                  onClick={() => {
                    setPriceRange({ min: '50000', max: '200000' });
                    handlePriceRangeChange('min', '50000');
                    handlePriceRangeChange('max', '200000');
                  }}
                  className="text-primary hover:underline"
                >
                  50K-200K
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Categories */}
        {renderFilterSection('Categories', categories, 'categories', 'categories')}

        {/* Brands */}
        {renderFilterSection('Brands', brands, 'brands', 'brands')}

        {/* Condition */}
        {renderFilterSection('Condition', conditions, 'conditions', 'condition')}

        {/* Seller Type */}
        {renderFilterSection('Seller Type', sellerTypes, 'sellerTypes', 'seller')}

        {/* Rating */}
        {renderFilterSection('Rating', ratings, 'ratings', 'rating')}
      </div>
    </div>
  );

  // Desktop sidebar
  if (!isVisible) {
    return (
      <div className="hidden lg:block w-80 border-r border-border bg-background">
        {sidebarContent}
      </div>
    );
  }

  // Mobile overlay
  return (
    <div className="lg:hidden fixed inset-0 z-1050 bg-background/80 backdrop-blur-sm">
      <div className="absolute inset-y-0 left-0 w-full max-w-sm bg-background border-r border-border">
        {sidebarContent}
      </div>
      <div 
        className="absolute inset-0 left-80"
        onClick={onClose}
      />
    </div>
  );
};

export default FilterSidebar;