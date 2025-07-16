import React from 'react';
import Select from '../../../components/ui/Select';

const SortDropdown = ({ value, onChange, resultsCount }) => {
  const sortOptions = [
    { value: 'relevance', label: 'Most Relevant' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'rating', label: 'Highest Rated' },
    { value: 'newest', label: 'Newest First' },
    { value: 'bestseller', label: 'Best Sellers' },
    { value: 'discount', label: 'Highest Discount' }
  ];

  const formatResultsCount = (count) => {
    return new Intl.NumberFormat('fr-FR').format(count);
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-surface border-b border-border">
      {/* Results Count */}
      <div className="text-sm text-text-secondary">
        <span className="font-medium text-text-primary">
          {formatResultsCount(resultsCount)}
        </span>
        {' '}results found
      </div>

      {/* Sort Dropdown */}
      <div className="flex items-center gap-3">
        <span className="text-sm text-text-secondary whitespace-nowrap">
          Sort by:
        </span>
        <div className="min-w-[200px]">
          <Select
            options={sortOptions}
            value={value}
            onChange={onChange}
            placeholder="Select sort option"
          />
        </div>
      </div>
    </div>
  );
};

export default SortDropdown;