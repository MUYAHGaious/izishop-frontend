import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { Checkbox } from '../../../components/ui/Checkbox';

const FilterPanel = ({ isOpen, onClose, filters, onFilterChange, onClearAll }) => {
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [expandedSections, setExpandedSections] = useState({
    categories: true,
    price: true,
    brands: true,
    ratings: true,
    availability: true
  });

  const categories = [
    { id: 'electronics', label: 'Electronics', count: 1247 },
    { id: 'fashion', label: 'Fashion & Clothing', count: 892 },
    { id: 'home', label: 'Home & Garden', count: 634 },
    { id: 'sports', label: 'Sports & Outdoors', count: 456 },
    { id: 'books', label: 'Books & Media', count: 321 },
    { id: 'beauty', label: 'Beauty & Personal Care', count: 289 },
    { id: 'automotive', label: 'Automotive', count: 178 },
    { id: 'toys', label: 'Toys & Games', count: 145 }
  ];

  const brands = [
    { id: 'samsung', label: 'Samsung', count: 234 },
    { id: 'apple', label: 'Apple', count: 189 },
    { id: 'nike', label: 'Nike', count: 156 },
    { id: 'adidas', label: 'Adidas', count: 134 },
    { id: 'sony', label: 'Sony', count: 98 },
    { id: 'lg', label: 'LG', count: 87 },
    { id: 'hp', label: 'HP', count: 76 },
    { id: 'dell', label: 'Dell', count: 65 }
  ];

  const ratings = [
    { id: '5', label: '5 Stars', count: 456 },
    { id: '4', label: '4 Stars & Up', count: 789 },
    { id: '3', label: '3 Stars & Up', count: 1234 },
    { id: '2', label: '2 Stars & Up', count: 1567 },
    { id: '1', label: '1 Star & Up', count: 1890 }
  ];

  const availability = [
    { id: 'in-stock', label: 'In Stock', count: 1456 },
    { id: 'out-of-stock', label: 'Out of Stock', count: 234 },
    { id: 'pre-order', label: 'Pre-order', count: 89 },
    { id: 'backorder', label: 'Backorder', count: 45 }
  ];

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handlePriceChange = (type, value) => {
    const newRange = { ...priceRange, [type]: value };
    setPriceRange(newRange);
    onFilterChange('priceRange', newRange);
  };

  const handleCheckboxChange = (filterType, value, checked) => {
    const currentValues = filters[filterType] || [];
    const newValues = checked
      ? [...currentValues, value]
      : currentValues.filter(v => v !== value);
    onFilterChange(filterType, newValues);
  };

  const FilterSection = ({ title, items, filterType, expanded, onToggle }) => (
    <div className="border-b border-border pb-4 mb-4">
      <button
        onClick={onToggle}
        className="flex items-center justify-between w-full py-2 text-left"
      >
        <h3 className="font-medium text-text-primary">{title}</h3>
        <Icon 
          name={expanded ? "ChevronUp" : "ChevronDown"} 
          size={16} 
          className="text-text-secondary"
        />
      </button>
      
      {expanded && (
        <div className="mt-3 space-y-2 max-h-48 overflow-y-auto">
          {items.map((item) => (
            <div key={item.id} className="flex items-center justify-between">
              <Checkbox
                label={item.label}
                checked={(filters[filterType] || []).includes(item.id)}
                onChange={(e) => handleCheckboxChange(filterType, item.id, e.target.checked)}
                className="flex-1"
              />
              <span className="text-xs text-text-secondary ml-2">
                ({item.count})
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={onClose}
        />
      )}

      {/* Filter Panel */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-50 lg:z-auto
        w-full lg:w-80 bg-surface border-r border-border
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        overflow-y-auto
      `}>
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold text-text-primary">Filters</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <Icon name="X" size={20} />
          </Button>
        </div>

        {/* Filter Content */}
        <div className="p-4 lg:p-6">
          {/* Active Filters Summary */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-text-primary">Active Filters</h3>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onClearAll}
                className="text-destructive hover:text-destructive"
              >
                Clear All
              </Button>
            </div>
            
            {Object.keys(filters).length > 0 && (
              <div className="flex flex-wrap gap-2">
                {Object.entries(filters).map(([key, values]) => 
                  Array.isArray(values) ? values.map(value => (
                    <span 
                      key={`${key}-${value}`}
                      className="inline-flex items-center px-2 py-1 bg-primary/10 text-primary text-xs rounded-md"
                    >
                      {value}
                      <button
                        onClick={() => handleCheckboxChange(key, value, false)}
                        className="ml-1 hover:text-destructive"
                      >
                        <Icon name="X" size={12} />
                      </button>
                    </span>
                  )) : null
                )}
              </div>
            )}
          </div>

          {/* Categories */}
          <FilterSection
            title="Categories"
            items={categories}
            filterType="categories"
            expanded={expandedSections.categories}
            onToggle={() => toggleSection('categories')}
          />

          {/* Price Range */}
          <div className="border-b border-border pb-4 mb-4">
            <button
              onClick={() => toggleSection('price')}
              className="flex items-center justify-between w-full py-2 text-left"
            >
              <h3 className="font-medium text-text-primary">Price Range</h3>
              <Icon 
                name={expandedSections.price ? "ChevronUp" : "ChevronDown"} 
                size={16} 
                className="text-text-secondary"
              />
            </button>
            
            {expandedSections.price && (
              <div className="mt-3 space-y-3">
                <div className="flex items-center space-x-2">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={priceRange.min}
                    onChange={(e) => handlePriceChange('min', e.target.value)}
                    className="flex-1"
                  />
                  <span className="text-text-secondary">-</span>
                  <Input
                    type="number"
                    placeholder="Max"
                    value={priceRange.max}
                    onChange={(e) => handlePriceChange('max', e.target.value)}
                    className="flex-1"
                  />
                </div>
                <div className="text-xs text-text-secondary">
                  Price in XAF (CFA Franc)
                </div>
              </div>
            )}
          </div>

          {/* Brands */}
          <FilterSection
            title="Brands"
            items={brands}
            filterType="brands"
            expanded={expandedSections.brands}
            onToggle={() => toggleSection('brands')}
          />

          {/* Ratings */}
          <FilterSection
            title="Customer Ratings"
            items={ratings}
            filterType="ratings"
            expanded={expandedSections.ratings}
            onToggle={() => toggleSection('ratings')}
          />

          {/* Availability */}
          <FilterSection
            title="Availability"
            items={availability}
            filterType="availability"
            expanded={expandedSections.availability}
            onToggle={() => toggleSection('availability')}
          />
        </div>

        {/* Mobile Apply Button */}
        <div className="lg:hidden sticky bottom-0 p-4 bg-surface border-t border-border">
          <Button 
            variant="default" 
            fullWidth 
            onClick={onClose}
          >
            Apply Filters
          </Button>
        </div>
      </div>
    </>
  );
};

export default FilterPanel;