import React from 'react';
import Icon from '../../../components/AppIcon';

const FilterChips = ({ 
  filters, 
  onRemoveFilter, 
  onClearAll,
  className = 'mt-4 flex flex-wrap gap-2',
  chipClassName = 'inline-flex items-center px-3 py-1 bg-teal-100 text-teal-800 text-sm rounded-full transition-all duration-300 hover:scale-105 hover:bg-teal-200 animate-fadeIn',
  clearClassName = 'text-sm text-gray-500 hover:text-gray-700 underline transition-all duration-200 hover:scale-105',
  showPriceChip = false,
  showHeader = false
}) => {
  const getFilterChips = () => {
    const chips = [];
    
    Object.entries(filters).forEach(([filterType, values]) => {
      if (Array.isArray(values) && values.length > 0) {
        values.forEach(value => {
          chips.push({
            type: filterType,
            value: value,
            label: getFilterLabel(filterType, value)
          });
        });
      } else if (showPriceChip && filterType === 'priceRange' && (values.min != null || values.max != null)) {
        const minVal = values.min != null ? values.min : 0;
        const maxVal = values.max != null ? values.max : 'Max';
        const label = `Price: ${minVal} - ${maxVal}`;
        chips.push({ type: filterType, value: values, label });
      }
    });
    
    return chips;
  };

  const getFilterLabel = (type, value) => {
    const labelMaps = {
      categories: {
        'electronics': 'Electronics',
        'fashion': 'Fashion',
        'home': 'Home & Garden',
        'sports': 'Sports',
        'books': 'Books',
        'beauty': 'Beauty',
        'automotive': 'Automotive',
        'toys': 'Toys'
      },
      brands: {
        'samsung': 'Samsung',
        'apple': 'Apple',
        'nike': 'Nike',
        'adidas': 'Adidas',
        'sony': 'Sony',
        'lg': 'LG',
        'hp': 'HP',
        'dell': 'Dell'
      },
      ratings: {
        '5': '5 Stars',
        '4': '4+ Stars',
        '3': '3+ Stars',
        '2': '2+ Stars',
        '1': '1+ Stars'
      },
      availability: {
        'in-stock': 'In Stock',
        'out-of-stock': 'Out of Stock',
        'pre-order': 'Pre-order',
        'backorder': 'Backorder'
      }
    };

    return labelMaps[type]?.[String(value)] || value;
  };

  const handleRemoveFilter = (chip) => {
    if (chip.type === 'priceRange') {
      onRemoveFilter(chip.type, { min: '', max: '' });
    } else {
      onRemoveFilter(chip.type, chip.value);
    }
  };

  const chips = getFilterChips();

  if (chips.length === 0) {
    return null;
  }

  return (
    <div className={className}>
      {showHeader && (
        <span className="text-sm font-medium text-gray-700 mr-2">Active Filters:</span>
      )}

      {chips.map((chip, index) => (
        <span key={`${chip.type}-${index}`} className={chipClassName}>
          {chip.label}
          <button
            onClick={() => handleRemoveFilter(chip)}
            className="ml-2 hover:text-teal-600 transition-all duration-200 hover:scale-110"
          >
            <Icon name="X" size={12} />
          </button>
        </span>
      ))}

      <button
        onClick={onClearAll}
        className={`${clearClassName} ml-2`}
      >
        Clear all
      </button>
    </div>
  );
};

export default FilterChips;

