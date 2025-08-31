import React, { useState, useEffect } from 'react';
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

  // Universal filters that make sense for ALL product types
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

  const FilterSection = ({ title, isExpanded, onToggle, children, count, icon }) => (
    <div className="bg-white border border-gray-100 rounded-xl shadow-sm mb-4 overflow-hidden hover:shadow-md transition-all duration-200">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-5 hover:bg-gray-50/80 transition-all duration-200 group"
      >
        <div className="flex items-center space-x-3">
          {icon && <Icon name={icon} size={18} className="text-gray-600 group-hover:text-teal-600 transition-colors" />}
        <div className="flex items-center space-x-2">
            <span className="font-bold text-gray-900 text-base">{title}</span>
            {count > 0 && (
              <span className="bg-gradient-to-r from-teal-500 to-teal-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">
              {count}
            </span>
          )}
        </div>
        </div>
        <div className={`p-2 rounded-full transition-all duration-200 ${isExpanded ? 'bg-teal-100 rotate-180' : 'bg-gray-100'}`}>
        <Icon 
            name="ChevronDown" 
          size={16} 
            className={`transition-colors duration-200 ${isExpanded ? 'text-teal-600' : 'text-gray-500'}`}
        />
        </div>
      </button>
      {isExpanded && (
        <div className="px-5 pb-5 bg-gray-50/30">
          {children}
        </div>
      )}
    </div>
  );

  const CheckboxItem = ({ id, label, count, checked, onChange }) => (
    <div className={`group p-3 rounded-lg transition-all duration-200 cursor-pointer ${
      checked ? 'bg-teal-50 border border-teal-200' : 'hover:bg-gray-50 border border-transparent'
    }`} onClick={onChange}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3 flex-1">
          <div className="relative">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
              className="sr-only"
            />
            <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all duration-200 shadow-sm ${
              checked 
                ? 'bg-gradient-to-br from-teal-500 to-teal-600 border-teal-500 shadow-teal-200' 
                : 'bg-white border-gray-300 group-hover:border-teal-300 group-hover:shadow-md'
            }`}>
              {checked && <Icon name="Check" size={12} className="text-white" />}
            </div>
          </div>
          <span className={`text-sm font-medium transition-colors ${
            checked ? 'text-teal-900' : 'text-gray-700 group-hover:text-gray-900'
          }`}>{label}</span>
        </div>
      {count && (
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full transition-colors ${
            checked 
              ? 'bg-teal-200 text-teal-800' 
              : 'bg-gray-200 text-gray-600 group-hover:bg-gray-300'
          }`}>
            {count.toLocaleString()}
          </span>
        )}
      </div>
    </div>
  );

  const content = (
    <div className="bg-gradient-to-b from-gray-50/50 to-white h-full flex flex-col min-h-0">

      {/* Fixed Header - Outside scrollable area */}
      <div className="bg-white border-b border-gray-100 p-6 shadow-sm flex-shrink-0 z-10 sticky top-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Icon name="SlidersHorizontal" size={20} className="text-gray-600" />
            <div>
              <h2 className="text-xl font-bold text-gray-900">Filters</h2>
              <p className="text-sm text-gray-500 mt-0.5">Refine your search</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {Object.keys(filters).length > 0 && (
              <button
                onClick={onClearAll}
                className="text-sm text-gray-600 hover:text-teal-600 font-semibold bg-gray-100 hover:bg-teal-50 px-3 py-2 rounded-lg transition-all duration-200 hover:shadow-md"
              >
                Clear All
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Scrollable Content with Custom Scrollbar */}
      <div 
        className="flex-1 overflow-y-auto filter-panel-scroll min-h-0"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none'
        }}
      >
        <div className="p-6 space-y-6 h-full">
        <style>{`
          .filter-panel-scroll::-webkit-scrollbar {
            display: none !important;
            width: 0 !important;
            height: 0 !important;
          }
          .filter-panel-scroll::-webkit-scrollbar-track {
            display: none !important;
          }
          .filter-panel-scroll::-webkit-scrollbar-thumb {
            display: none !important;
          }
          .filter-panel-scroll::-webkit-scrollbar-corner {
            display: none !important;
          }
          .filter-panel-scroll {
            scrollbar-width: none !important;
            -ms-overflow-style: none !important;
          }
        `}</style>
        {/* Price Range */}
        <FilterSection
          title="Price Range"
          icon="DollarSign"
          isExpanded={expandedSections.price}
          onToggle={() => toggleSection('price')}
          count={0}
        >
          <div className="space-y-3 mt-4">
            {priceRanges.map((range) => (
              <div
                key={range.id}
                className={`p-3 rounded-lg cursor-pointer transition-all duration-200 border ${
                  filters.priceRange?.id === range.id
                    ? 'bg-teal-50 border-teal-200 shadow-sm'
                    : 'bg-white border-gray-200 hover:border-teal-200 hover:shadow-md'
                }`}
                onClick={() => handlePriceRangeChange(range)}
              >
                <div className="flex items-center space-x-3">
                  <div className="relative">
                <input
                  type="radio"
                  name="priceRange"
                  checked={filters.priceRange?.id === range.id}
                  onChange={() => handlePriceRangeChange(range)}
                      className="sr-only"
                    />
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                      filters.priceRange?.id === range.id
                        ? 'bg-gradient-to-br from-teal-500 to-teal-600 border-teal-500 shadow-lg shadow-teal-200' 
                        : 'bg-white border-gray-300 hover:border-teal-300'
                    }`}>
                      {filters.priceRange?.id === range.id && (
                        <div className="w-2.5 h-2.5 bg-white rounded-full shadow-sm"></div>
                      )}
                    </div>
                  </div>
                  <span className={`text-sm font-medium transition-colors ${
                    filters.priceRange?.id === range.id ? 'text-teal-900' : 'text-gray-700'
                  }`}>{range.label}</span>
                </div>
              </div>
            ))}
          </div>
        </FilterSection>

        {/* Categories */}
        <FilterSection
          title="Categories"
          icon="Grid3X3"
          isExpanded={expandedSections.category}
          onToggle={() => toggleSection('category')}
          count={filters.categories?.length || 0}
        >
          <div className="space-y-2 mt-4">
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
          icon="Tag"
          isExpanded={expandedSections.brand}
          onToggle={() => toggleSection('brand')}
          count={filters.brands?.length || 0}
        >
          <div className="space-y-2 mt-4">
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

        {/* Customer Rating */}
        <FilterSection
          title="Customer Rating"
          icon="Star"
          isExpanded={expandedSections.rating}
          onToggle={() => toggleSection('rating')}
          count={0}
        >
          <div className="space-y-3 mt-4">
            {[5, 4, 3, 2, 1].map((rating) => (
              <div
                key={rating}
                className={`p-3 rounded-lg cursor-pointer transition-all duration-200 border ${
                  filters.rating?.includes(rating)
                    ? 'bg-teal-50 border-teal-200 shadow-sm'
                    : 'bg-white border-gray-200 hover:border-teal-200 hover:shadow-md'
                }`}
                onClick={() => handleFilterToggle('rating', rating)}
              >
                <div className="flex items-center space-x-3">
                  <div className="relative">
                <input
                  type="checkbox"
                  checked={filters.rating?.includes(rating) || false}
                  onChange={() => handleFilterToggle('rating', rating)}
                      className="sr-only"
                    />
                    <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all duration-200 shadow-sm ${
                      filters.rating?.includes(rating)
                        ? 'bg-gradient-to-br from-teal-500 to-teal-600 border-teal-500 shadow-teal-200' 
                        : 'bg-white border-gray-300 hover:border-teal-300'
                    }`}>
                      {filters.rating?.includes(rating) && <Icon name="Check" size={12} className="text-white" />}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Icon 
                      key={i}
                      name="Star" 
                          size={16} 
                      className={i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'} 
                    />
                  ))}
                    </div>
                    <span className={`text-sm font-medium transition-colors ${
                      filters.rating?.includes(rating) ? 'text-teal-900' : 'text-gray-700'
                    }`}>& Up</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </FilterSection>

        {/* Features */}
        <FilterSection
          title="Features"
          icon="Zap"
          isExpanded={expandedSections.features}
          onToggle={() => toggleSection('features')}
          count={filters.features?.length || 0}
        >
          <div className="space-y-2 mt-4">
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
      </div>

      {/* Footer - Apply Button for Mobile */}
      <div className="lg:hidden border-t border-gray-200 p-6 bg-white shadow-lg">
        <Button
          onClick={onClose}
          className="w-full bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white font-bold py-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
        >
          Apply Filters
        </Button>
      </div>
    </div>
  );

  // Mobile overlay
  if (!isOpen) return null;

  return (
    <>
      {/* Mobile Overlay */}
      <div className="lg:hidden fixed inset-0 z-50">
        <div 
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          onClick={onClose}
        />
        <div className="absolute right-0 top-0 bottom-0 w-80 max-w-[90vw] shadow-2xl">
          {content}
        </div>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:block h-full">
        {content}
      </div>
    </>
  );
};

export default FilterPanel;