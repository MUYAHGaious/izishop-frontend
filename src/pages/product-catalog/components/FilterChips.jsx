import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const FilterChips = ({ filters, onRemoveFilter, onClearAll }) => {
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
      } else if (filterType === 'priceRange' && (values.min || values.max)) {
        const label = `Price: ${values.min || '0'} - ${values.max || '∞'} XAF`;
        chips.push({
          type: filterType,
          value: values,
          label: label
        });
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

    return labelMaps[type]?.[value] || value;
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
    <div className="flex flex-wrap items-center gap-2 p-4 bg-muted/50 border-b border-border">
      <span className="text-sm font-medium text-text-secondary mr-2">
        Active Filters:
      </span>
      
      {chips.map((chip, index) => (
        <div
          key={`${chip.type}-${index}`}
          className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary text-sm rounded-full border border-primary/20"
        >
          <span>{chip.label}</span>
          <button
            onClick={() => handleRemoveFilter(chip)}
            className="hover:text-destructive transition-colors"
          >
            <Icon name="X" size={14} />
          </button>
        </div>
      ))}
      
      {chips.length > 1 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearAll}
          className="text-destructive hover:text-destructive ml-2"
        >
          Clear All
        </Button>
      )}
    </div>
  );
};

export default FilterChips;