import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const FilterPanel = ({ filters, onFilterChange, categories, onClose }) => {
  const [expandedSections, setExpandedSections] = useState({
    location: true,
    category: true,
    rating: true,
    verification: true,
    features: true,
    shopType: true
  });
  const [searchTerm, setSearchTerm] = useState('');

  // Count active filters
  const activeFilterCount = Object.values(filters).reduce((total, value) => {
    if (Array.isArray(value)) return total + value.length;
    if (value && value !== '') return total + 1;
    return total;
  }, 0);

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Shop-specific filter options
  const locations = [
    { id: 'douala', name: 'Douala', count: 456 },
    { id: 'yaounde', name: 'Yaoundé', count: 234 },
    { id: 'bafoussam', name: 'Bafoussam', count: 123 },
    { id: 'bamenda', name: 'Bamenda', count: 89 },
    { id: 'garoua', name: 'Garoua', count: 67 },
    { id: 'maroua', name: 'Maroua', count: 45 },
    { id: 'ngaoundere', name: 'Ngaoundéré', count: 34 }
  ];

  const shopTypes = [
    { id: 'verified-store', name: 'Verified Stores', count: 234 },
    { id: 'individual-seller', name: 'Individual Sellers', count: 456 },
    { id: 'brand-store', name: 'Brand Stores', count: 89 },
    { id: 'local-business', name: 'Local Businesses', count: 123 }
  ];

  const verificationStatus = [
    { id: 'verified', name: 'Verified Shops', count: 234 },
    { id: 'premium', name: 'Premium Shops', count: 89 },
    { id: 'trusted', name: 'Trusted Sellers', count: 156 }
  ];

  const shopFeatures = [
    { id: 'fast-delivery', name: 'Fast Delivery', count: 234 },
    { id: 'online-payment', name: 'Online Payment', count: 189 },
    { id: 'customer-support', name: '24/7 Support', count: 123 },
    { id: 'return-policy', name: 'Return Policy', count: 156 },
    { id: 'bulk-orders', name: 'Bulk Orders', count: 89 },
    { id: 'warranty', name: 'Warranty Included', count: 76 }
  ];

  const handleFilterToggle = (filterType, value) => {
    const currentValues = filters[filterType] || [];
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value];
    
    onFilterChange(filterType, newValues);
  };

  const FilterSection = ({ title, isExpanded, onToggle, children, count, icon, activeFilters = 0 }) => (
    <div className="bg-white border border-gray-100 rounded-xl shadow-sm mb-3 overflow-hidden hover:shadow-md transition-all duration-150">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-50/80 transition-all duration-150 group"
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
            {/* Active filter indicator */}
            {activeFilters > 0 && (
              <span className="bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                {activeFilters}
              </span>
            )}
          </div>
        </div>
        <div className={`p-2 rounded-full transition-all duration-150 ${isExpanded ? 'bg-teal-100 rotate-180' : 'bg-gray-100'}`}>
          <Icon 
            name="ChevronDown" 
            size={16} 
            className={`transition-colors duration-150 ${isExpanded ? 'text-teal-600' : 'text-gray-500'}`}
          />
        </div>
      </button>
      {isExpanded && (
        <div className="px-4 pb-4 bg-gray-50/30">
          {children}
        </div>
      )}
    </div>
  );

  const CheckboxItem = ({ id, label, count, checked, onChange }) => (
    <div className={`group p-3 rounded-lg transition-all duration-150 cursor-pointer ${
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
            <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all duration-150 shadow-sm ${
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

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-white/20 h-full flex flex-col">
             {/* Natural scrollbar styles */}
       <style>{`
         /* Hide scrollbar while keeping scrollable */
         .filter-scroll {
           scrollbar-width: none;
           scrollbar-color: transparent transparent;
         }
         
         .filter-scroll::-webkit-scrollbar {
           display: none;
         }
         
         /* Smooth scrolling */
         .filter-scroll {
           scroll-behavior: smooth;
         }
       `}</style>
      
      {/* Enhanced Header */}
      <div className="bg-white border-b border-gray-100 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Icon name="SlidersHorizontal" size={20} className="text-gray-600" />
            <div>
              <h2 className="text-xl font-bold text-gray-900">Filters</h2>
              <p className="text-sm text-gray-500 mt-0.5">Refine your shop search</p>
            </div>
          </div>
          
          {/* Active Filters Badge */}
          {activeFilterCount > 0 && (
            <div className="bg-teal-100 text-teal-800 text-xs font-bold px-3 py-1.5 rounded-full">
              {activeFilterCount} active
            </div>
          )}
        </div>
        
        {/* Filter Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {activeFilterCount > 0 && (
              <button
                onClick={() => {
                  Object.keys(filters).forEach(key => {
                    onFilterChange(key, []);
                  });
                }}
                className="text-sm text-red-600 hover:text-red-700 font-medium bg-red-50 hover:bg-red-100 px-3 py-2 rounded-lg transition-all duration-150 hover:shadow-md flex items-center gap-2"
              >
                <Icon name="X" size={14} />
                Clear All Filters
              </button>
            )}
          </div>
          
          {/* Quick Actions */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                // Set default filters
                onFilterChange('categories', ['electronics']);
                onFilterChange('minRating', 4);
              }}
              className="text-xs text-teal-600 hover:text-teal-700 font-medium bg-teal-50 hover:bg-teal-100 px-2 py-1.5 rounded-lg transition-all duration-150"
            >
              Quick Setup
            </button>
          </div>
        </div>
        
        {/* Search within filters */}
        <div className="mt-4">
          <div className="relative">
            <Icon name="Search" size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search within filters..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-150"
            />
          </div>
        </div>
        
        {/* Filter Progress Bar */}
        {activeFilterCount > 0 && (
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
              <span>Filter Progress</span>
              <span>{activeFilterCount} applied</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-teal-500 to-teal-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min((activeFilterCount / 5) * 100, 100)}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>

                   {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-6 pb-8 space-y-4 filter-scroll max-h-[calc(100vh-200px)]">
        {/* Categories */}
        <FilterSection
          title="Categories"
          icon="Grid3X3"
          isExpanded={expandedSections.category}
          onToggle={() => toggleSection('category')}
          count={filters.categories?.length || 0}
          activeFilters={filters.categories?.length || 0}
        >
          <div className="space-y-1.5 mt-3">
            {categories.map((category) => (
              <CheckboxItem
                key={category.id}
                id={category.id}
                label={category.label}
                count={Math.floor(Math.random() * 100) + 50} // Random count for demo
                checked={filters.categories?.includes(category.id) || false}
                onChange={() => handleFilterToggle('categories', category.id)}
              />
            ))}
          </div>
        </FilterSection>

        {/* Location */}
        <FilterSection
          title="Location"
          icon="MapPin"
          isExpanded={expandedSections.location}
          onToggle={() => toggleSection('location')}
          count={filters.locations?.length || 0}
        >
          <div className="space-y-1.5 mt-3">
            {locations.map((location) => (
              <CheckboxItem
                key={location.id}
                id={location.id}
                label={location.name}
                count={location.count}
                checked={filters.locations?.includes(location.id) || false}
                onChange={() => handleFilterToggle('locations', location.id)}
              />
            ))}
          </div>
        </FilterSection>

        {/* Shop Type */}
        <FilterSection
          title="Shop Type"
          icon="Store"
          isExpanded={expandedSections.shopType}
          onToggle={() => toggleSection('shopType')}
          count={filters.shopTypes?.length || 0}
        >
          <div className="space-y-1.5 mt-3">
            {shopTypes.map((type) => (
              <CheckboxItem
                key={type.id}
                id={type.id}
                label={type.name}
                count={type.count}
                checked={filters.shopTypes?.includes(type.id) || false}
                onChange={() => handleFilterToggle('shopTypes', type.id)}
              />
            ))}
          </div>
        </FilterSection>

        {/* Verification Status */}
        <FilterSection
          title="Verification"
          icon="CheckCircle"
          isExpanded={expandedSections.verification}
          onToggle={() => toggleSection('verification')}
          count={filters.verification?.length || 0}
        >
          <div className="space-y-2 mt-4">
            {verificationStatus.map((status) => (
              <CheckboxItem
                key={status.id}
                id={status.id}
                label={status.name}
                count={status.count}
                checked={filters.verification?.includes(status.id) || false}
                onChange={() => handleFilterToggle('verification', status.id)}
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
                className={`p-3 rounded-lg cursor-pointer transition-all duration-150 border ${
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
                    <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all duration-150 shadow-sm ${
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
          title="Shop Features"
          icon="Zap"
          isExpanded={expandedSections.features}
          onToggle={() => toggleSection('features')}
          count={filters.features?.length || 0}
        >
          <div className="space-y-2 mt-4">
            {shopFeatures.map((feature) => (
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
      <div className="lg:hidden border-t border-gray-200 p-6 bg-white shadow-lg">
        <button
          onClick={onClose}
          className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-4 rounded-xl transition-all duration-150 shadow-md hover:shadow-lg"
        >
          Apply Filters
        </button>
      </div>
    </div>
  );
};

export default FilterPanel;