import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const FilterPanel = ({ 
  isOpen, 
  onClose, 
  filters, 
  onFilterChange, 
  onClearAll,
  categories = [],
  conditions = [],
  priceRange,
  onPriceRangeChange
}) => {
  const [tempPriceRange, setTempPriceRange] = useState(priceRange || { min: '', max: '' });

  const handlePriceRangeApply = () => {
    onPriceRangeChange(tempPriceRange);
    onFilterChange('priceRange', tempPriceRange);
  };

  const handleConditionChange = (condition) => {
    const currentConditions = filters.conditions || [];
    const newConditions = currentConditions.includes(condition)
      ? currentConditions.filter(c => c !== condition)
      : [...currentConditions, condition];
    onFilterChange('conditions', newConditions);
  };

  const handleCategoryFilter = (categoryId) => {
    const currentCategories = filters.categories || [];
    const newCategories = currentCategories.includes(categoryId)
      ? currentCategories.filter(c => c !== categoryId)
      : [...currentCategories, categoryId];
    onFilterChange('categories', newCategories);
  };

  // Mobile overlay
  if (isOpen && window.innerWidth < 1024) {
    return (
      <div className="lg:hidden fixed inset-0 z-50 overflow-hidden">
        <div className="absolute inset-0 bg-black/50" onClick={onClose}></div>
        <div className="absolute right-0 top-0 h-full w-80 bg-white shadow-xl">
          <FilterContent />
        </div>
      </div>
    );
  }

  // Desktop sidebar (always visible)
  if (isOpen) {
    return <FilterContent />;
  }

  return null;

  function FilterContent() {
    return (
      <div className="h-full overflow-y-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 lg:hidden">
          <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Icon name="X" size={20} />
          </button>
        </div>

        <div className="hidden lg:block mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Filter Results</h2>
        </div>

        {/* Active Filters Count */}
        {Object.keys(filters).length > 0 && (
          <div className="mb-6 p-3 bg-teal-50 border border-teal-200 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm text-teal-800">
                {Object.keys(filters).length} active filter{Object.keys(filters).length > 1 ? 's' : ''}
              </span>
              <Button
                onClick={onClearAll}
                variant="outline"
                size="sm"
                className="text-xs border-teal-300 text-teal-700 hover:bg-teal-100"
              >
                Clear All
              </Button>
            </div>
          </div>
        )}

        {/* Price Range */}
        <div className="mb-8">
          <h3 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
            <Icon name="DollarSign" size={16} />
            Price Range
          </h3>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <input
                type="number"
                placeholder="Min"
                value={tempPriceRange.min}
                onChange={(e) => setTempPriceRange(prev => ({ ...prev, min: e.target.value }))}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-teal-500 focus:border-teal-500"
              />
              <input
                type="number"
                placeholder="Max"
                value={tempPriceRange.max}
                onChange={(e) => setTempPriceRange(prev => ({ ...prev, max: e.target.value }))}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-teal-500 focus:border-teal-500"
              />
            </div>
            <Button
              onClick={handlePriceRangeApply}
              size="sm"
              className="w-full bg-teal-500 hover:bg-teal-600 text-white"
            >
              Apply Price Filter
            </Button>
          </div>
        </div>

        {/* Condition */}
        <div className="mb-8">
          <h3 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
            <Icon name="Star" size={16} />
            Condition
          </h3>
          <div className="space-y-2">
            {conditions.map((condition) => (
              <label key={condition} className="flex items-center">
                <input
                  type="checkbox"
                  checked={(filters.conditions || []).includes(condition)}
                  onChange={() => handleConditionChange(condition)}
                  className="rounded border-gray-300 text-teal-600 focus:ring-teal-500 mr-3"
                />
                <span className="text-sm text-gray-700">{condition}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Categories */}
        {categories.length > 0 && (
          <div className="mb-8">
            <h3 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
              <Icon name="Grid3X3" size={16} />
              Categories
            </h3>
            <div className="space-y-2">
              {categories.map((category) => (
                <label key={category.id} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={(filters.categories || []).includes(category.id)}
                    onChange={() => handleCategoryFilter(category.id)}
                    className="rounded border-gray-300 text-teal-600 focus:ring-teal-500 mr-3"
                  />
                  <div className="flex items-center gap-2">
                    <Icon name={category.icon} size={14} className="text-gray-500" />
                    <span className="text-sm text-gray-700">{category.name}</span>
                    {category.count > 0 && (
                      <span className="text-xs text-gray-500">({category.count})</span>
                    )}
                  </div>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Listing Features */}
        <div className="mb-8">
          <h3 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
            <Icon name="Settings" size={16} />
            Features
          </h3>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={(filters.features || []).includes('negotiable')}
                onChange={() => {
                  const currentFeatures = filters.features || [];
                  const newFeatures = currentFeatures.includes('negotiable')
                    ? currentFeatures.filter(f => f !== 'negotiable')
                    : [...currentFeatures, 'negotiable'];
                  onFilterChange('features', newFeatures);
                }}
                className="rounded border-gray-300 text-teal-600 focus:ring-teal-500 mr-3"
              />
              <span className="text-sm text-gray-700">Negotiable Price</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={(filters.features || []).includes('with_images')}
                onChange={() => {
                  const currentFeatures = filters.features || [];
                  const newFeatures = currentFeatures.includes('with_images')
                    ? currentFeatures.filter(f => f !== 'with_images')
                    : [...currentFeatures, 'with_images'];
                  onFilterChange('features', newFeatures);
                }}
                className="rounded border-gray-300 text-teal-600 focus:ring-teal-500 mr-3"
              />
              <span className="text-sm text-gray-700">With Images</span>
            </label>
          </div>
        </div>

        {/* Apply Filters Button - Mobile */}
        <div className="lg:hidden mt-8 pt-6 border-t border-gray-200">
          <Button
            onClick={onClose}
            className="w-full bg-teal-500 hover:bg-teal-600 text-white"
          >
            Apply Filters
          </Button>
        </div>
      </div>
    );
  }
};

export default FilterPanel;