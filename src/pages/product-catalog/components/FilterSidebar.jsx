import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const FilterSidebar = ({ filters, onFiltersChange, onClearFilters, isVisible, onClose }) => {
  const [expandedSections, setExpandedSections] = useState({
    categories: true,
    price: true,
    colors: true,
    size: true,
    offers: true,
    brands: false,
    condition: true,
    seller: true,
    rating: false,
    material: false
  });

  const [priceRange, setPriceRange] = useState({
    min: filters.priceRange?.min || '',
    max: filters.priceRange?.max || ''
  });

  const categories = [
    { id: 'girls-fashion', name: 'Girls Fashion', count: 1234 },
    { id: 'boys-fashion', name: 'Boys Fashion', count: 856 },
    { id: 'electronics', name: 'Electronics', count: 642 },
    { id: 'home-garden', name: 'Home & Garden', count: 423 },
    { id: 'sports', name: 'Sports & Outdoors', count: 312 },
    { id: 'beauty', name: 'Beauty & Health', count: 234 }
  ];

  const colors = [
    { id: 'blue', name: 'Blue', hex: '#3B82F6' },
    { id: 'red', name: 'Red', hex: '#EF4444' },
    { id: 'pink', name: 'Pink', hex: '#EC4899' },
    { id: 'white', name: 'White', hex: '#FFFFFF' },
    { id: 'orange', name: 'Orange', hex: '#F97316' },
    { id: 'green', name: 'Green', hex: '#10B981' },
    { id: 'teal', name: 'Teal', hex: '#06B6D4' }
  ];

  const sizes = [
    { id: 'xs', name: 'XS' },
    { id: 's', name: 'S' },
    { id: 'm', name: 'M' },
    { id: 'xl', name: 'XL' },
    { id: 'xxl', name: 'XXL' }
  ];

  const offers = [
    { id: 'free-shipping', name: 'Free Shipping' },
    { id: 'discount-price', name: 'Discount Price' },
    { id: 'new-arrival', name: 'New Arrival' }
  ];

  const materials = [
    { id: 'cotton', name: 'Cotton' },
    { id: 'polyester', name: 'Polyester' },
    { id: 'denim', name: 'Denim' },
    { id: 'silk', name: 'Silk' }
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
    if (filters?.categories?.length) count += filters.categories.length;
    if (filters?.colors?.length) count += filters.colors.length;
    if (filters?.sizes?.length) count += filters.sizes.length;
    if (filters?.offers?.length) count += filters.offers.length;
    if (filters?.materials?.length) count += filters.materials.length;
    if (filters?.brands?.length) count += filters.brands.length;
    if (filters?.conditions?.length) count += filters.conditions.length;
    if (filters?.sellerTypes?.length) count += filters.sellerTypes.length;
    if (filters?.ratings?.length) count += filters.ratings.length;
    if (filters?.priceRange?.min || filters?.priceRange?.max) count += 1;
    return count;
  };

  const CustomCheckbox = ({ checked, onChange, label, count }) => (
    <div className="flex items-center justify-between py-1">
      <label className="flex items-center cursor-pointer flex-1">
        <div className="relative">
          <input
            type="checkbox"
            checked={checked}
            onChange={onChange}
            className="sr-only"
          />
          <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
            checked 
              ? 'bg-green-500 border-green-500' 
              : 'bg-transparent border-gray-500'
          }`}>
            {checked && <Icon name="Check" size={10} className="text-white" />}
          </div>
        </div>
        <span className="ml-3 text-sm text-gray-300">{label}</span>
      </label>
      {count && (
        <span className="text-xs text-gray-500 ml-2">{count}</span>
      )}
    </div>
  );

  const ToggleSwitch = ({ checked, onChange, label }) => (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm text-gray-300">{label}</span>
      <button
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
          checked ? 'bg-green-500' : 'bg-gray-600'
        }`}
      >
        <span
          className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
            checked ? 'translate-x-5' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );

  const ColorCircle = ({ color, checked, onChange }) => (
    <button
      onClick={() => onChange(!checked)}
      className={`w-7 h-7 rounded-full border-2 relative ${
        checked ? 'border-white' : 'border-gray-600'
      } ${color.hex === '#FFFFFF' ? 'border-gray-400' : ''}`}
      style={{ backgroundColor: color.hex }}
    >
      {checked && (
        <div className="absolute inset-0 rounded-full flex items-center justify-center">
          <Icon name="Check" size={12} className={color.hex === '#FFFFFF' ? 'text-black' : 'text-white'} />
        </div>
      )}
    </button>
  );

  const SizeButton = ({ size, checked, onChange }) => (
    <button
      onClick={() => onChange(!checked)}
      className={`px-3 py-2 text-sm rounded border transition-colors ${
        checked 
          ? 'bg-green-500 border-green-500 text-white' 
          : 'bg-transparent border-gray-600 text-gray-300 hover:border-gray-500'
      }`}
    >
      {size.name}
    </button>
  );

  const renderSection = (title, sectionKey, children) => (
    <div className="border-b border-gray-800">
      <button
        onClick={() => toggleSection(sectionKey)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-800/50 transition-colors"
      >
        <span className="font-medium text-white text-sm">{title}</span>
        <Icon 
          name="ChevronDown" 
          size={16} 
          className={`text-gray-400 transition-transform ${expandedSections[sectionKey] ? 'rotate-180' : ''}`} 
        />
      </button>
      
      {expandedSections[sectionKey] && (
        <div className="px-4 pb-4">
          {children}
        </div>
      )}
    </div>
  );

  const sidebarContent = (
    <div className="h-full flex flex-col bg-gray-900">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-800">
        <div className="flex items-center space-x-2">
          <Icon name="SlidersHorizontal" size={16} className="text-white" />
          <h2 className="font-semibold text-white">Filter</h2>
          {getActiveFiltersCount() > 0 && (
            <span className="bg-green-500 text-white text-xs font-medium px-2 py-1 rounded-full">
              {getActiveFiltersCount()}
            </span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          {getActiveFiltersCount() > 0 && (
            <button
              onClick={onClearFilters}
              className="text-xs text-gray-400 hover:text-white transition-colors"
            >
              Clear All
            </button>
          )}
          <button
            onClick={onClose}
            className="md:hidden p-1 text-gray-400 hover:text-white transition-colors"
          >
            <Icon name="X" size={16} />
          </button>
        </div>
      </div>

      {/* Filter Content */}
      <div className="flex-1 overflow-y-auto filter-sidebar-scroll" style={{
        scrollbarWidth: 'none',
        msOverflowStyle: 'none'
      }}>
        <style>{`
          .filter-sidebar-scroll::-webkit-scrollbar {
            display: none;
          }
        `}</style>
        {/* Shop by Category */}
        {renderSection('Shop by Category', 'categories', (
          <div className="space-y-2">
            {categories.map((category) => (
              <CustomCheckbox
                key={category.id}
                checked={filters.categories?.includes(category.id) || false}
                onChange={(e) => handleFilterChange('categories', category.id, e.target.checked)}
                label={category.name}
                count={category.count}
              />
            ))}
          </div>
        ))}

        {/* Price Range */}
        {renderSection('Price', 'price', (
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">$</span>
                <input
                  type="number"
                  placeholder="40"
                  value={priceRange.min}
                  onChange={(e) => handlePriceRangeChange('min', e.target.value)}
                  className="w-full pl-7 pr-3 py-2 bg-gray-800 border border-gray-700 rounded text-white placeholder-gray-500 text-sm focus:outline-none focus:border-gray-600"
                />
              </div>
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">$</span>
                <input
                  type="number"
                  placeholder="950"
                  value={priceRange.max}
                  onChange={(e) => handlePriceRangeChange('max', e.target.value)}
                  className="w-full pl-7 pr-3 py-2 bg-gray-800 border border-gray-700 rounded text-white placeholder-gray-500 text-sm focus:outline-none focus:border-gray-600"
                />
              </div>
            </div>
          </div>
        ))}

        {/* Colors */}
        {renderSection('Colors', 'colors', (
          <div className="flex flex-wrap gap-2">
            {colors.map((color) => (
              <ColorCircle
                key={color.id}
                color={color}
                checked={filters.colors?.includes(color.id) || false}
                onChange={(checked) => handleFilterChange('colors', color.id, checked)}
              />
            ))}
          </div>
        ))}

        {/* Size */}
        {renderSection('Size', 'size', (
          <div className="flex flex-wrap gap-2">
            {sizes.map((size) => (
              <SizeButton
                key={size.id}
                size={size}
                checked={filters.sizes?.includes(size.id) || false}
                onChange={(checked) => handleFilterChange('sizes', size.id, checked)}
              />
            ))}
          </div>
        ))}

        {/* Offers */}
        {renderSection('Offers', 'offers', (
          <div className="space-y-3">
            {offers.map((offer) => (
              <ToggleSwitch
                key={offer.id}
                checked={filters.offers?.includes(offer.id) || false}
                onChange={(checked) => handleFilterChange('offers', offer.id, checked)}
                label={offer.name}
              />
            ))}
        </div>
        ))}

        {/* Material */}
        {renderSection('Material', 'material', (
          <div className="space-y-2">
            {materials.map((material) => (
              <CustomCheckbox
                key={material.id}
                checked={filters.materials?.includes(material.id) || false}
                onChange={(e) => handleFilterChange('materials', material.id, e.target.checked)}
                label={material.name}
              />
            ))}
          </div>
        ))}

        {/* Brands */}
        {renderSection('Brands', 'brands', (
          <div className="space-y-2">
            {brands.map((brand) => (
              <CustomCheckbox
                key={brand.id}
                checked={filters.brands?.includes(brand.id) || false}
                onChange={(e) => handleFilterChange('brands', brand.id, e.target.checked)}
                label={brand.name}
                count={brand.count}
              />
            ))}
          </div>
        ))}

        {/* Condition */}
        {renderSection('Condition', 'condition', (
          <div className="space-y-2">
            {conditions.map((condition) => (
              <CustomCheckbox
                key={condition.id}
                checked={filters.conditions?.includes(condition.id) || false}
                onChange={(e) => handleFilterChange('conditions', condition.id, e.target.checked)}
                label={condition.name}
                count={condition.count}
              />
            ))}
          </div>
        ))}

        {/* Seller Type */}
        {renderSection('Seller Type', 'seller', (
          <div className="space-y-2">
            {sellerTypes.map((seller) => (
              <CustomCheckbox
                key={seller.id}
                checked={filters.sellerTypes?.includes(seller.id) || false}
                onChange={(e) => handleFilterChange('sellerTypes', seller.id, e.target.checked)}
                label={seller.name}
                count={seller.count}
              />
            ))}
          </div>
        ))}

        {/* Rating */}
        {renderSection('Rating', 'rating', (
          <div className="space-y-2">
            {ratings.map((rating) => (
              <CustomCheckbox
                key={rating.id}
                checked={filters.ratings?.includes(rating.id) || false}
                onChange={(e) => handleFilterChange('ratings', rating.id, e.target.checked)}
                label={rating.name}
                count={rating.count}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );

  // Desktop sidebar
  if (!isVisible) {
    return (
      <div className="hidden lg:block w-80 border-r border-gray-800 bg-gray-900">
        {sidebarContent}
      </div>
    );
  }

  // Mobile overlay
  return (
    <div className="lg:hidden fixed inset-0 z-50 bg-black/50 backdrop-blur-sm">
      <div className="absolute inset-y-0 left-0 w-full max-w-sm bg-gray-900 border-r border-gray-800">
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