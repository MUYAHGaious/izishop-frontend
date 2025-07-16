import React from 'react';
import Button from '../../../components/ui/Button';

import { Checkbox } from '../../../components/ui/Checkbox';
import Icon from '../../../components/AppIcon';

const FilterPanel = ({ filters, onFilterChange, categories, onClose }) => {
  const locations = [
    'Douala',
    'Yaoundé',
    'Bamenda',
    'Bafoussam',
    'Garoua',
    'Maroua',
    'Ngaoundéré',
    'Bertoua'
  ];

  const businessTypes = [
    'Individual',
    'Small Business',
    'Corporation',
    'Cooperative'
  ];

  const handleCategoryChange = (categoryId) => {
    const currentCategories = filters.categories || [];
    const newCategories = currentCategories.includes(categoryId)
      ? currentCategories.filter(id => id !== categoryId)
      : [...currentCategories, categoryId];
    
    onFilterChange('categories', newCategories);
  };

  const handleLocationChange = (location) => {
    const currentLocations = filters.locations || [];
    const newLocations = currentLocations.includes(location)
      ? currentLocations.filter(loc => loc !== location)
      : [...currentLocations, location];
    
    onFilterChange('locations', newLocations);
  };

  const handleBusinessTypeChange = (type) => {
    const currentTypes = filters.businessTypes || [];
    const newTypes = currentTypes.includes(type)
      ? currentTypes.filter(t => t !== type)
      : [...currentTypes, type];
    
    onFilterChange('businessTypes', newTypes);
  };

  const handleRatingChange = (rating) => {
    onFilterChange('minRating', rating);
  };

  const handleClearAll = () => {
    onFilterChange('categories', []);
    onFilterChange('locations', []);
    onFilterChange('businessTypes', []);
    onFilterChange('minRating', 0);
    onFilterChange('verifiedOnly', false);
    onFilterChange('premiumOnly', false);
    onFilterChange('onlineOnly', false);
  };

  return (
    <div className="space-y-6">
      {/* Mobile Header */}
      {onClose && (
        <div className="flex items-center justify-between lg:hidden">
          <h3 className="text-lg font-semibold text-text-primary">Filters</h3>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <Icon name="X" size={20} />
          </Button>
        </div>
      )}

      {/* Categories */}
      <div className="space-y-3">
        <h4 className="font-medium text-text-primary flex items-center gap-2">
          <Icon name="Grid" size={16} />
          Categories
        </h4>
        <div className="space-y-2">
          {categories.slice(1).map((category) => (
            <Checkbox
              key={category.id}
              id={category.id}
              label={category.label}
              checked={filters.categories?.includes(category.id) || false}
              onChange={() => handleCategoryChange(category.id)}
            />
          ))}
        </div>
      </div>

      {/* Location */}
      <div className="space-y-3">
        <h4 className="font-medium text-text-primary flex items-center gap-2">
          <Icon name="MapPin" size={16} />
          Location
        </h4>
        <div className="space-y-2">
          {locations.map((location) => (
            <Checkbox
              key={location}
              id={location}
              label={location}
              checked={filters.locations?.includes(location) || false}
              onChange={() => handleLocationChange(location)}
            />
          ))}
        </div>
      </div>

      {/* Rating */}
      <div className="space-y-3">
        <h4 className="font-medium text-text-primary flex items-center gap-2">
          <Icon name="Star" size={16} />
          Minimum Rating
        </h4>
        <div className="space-y-2">
          {[4, 3, 2, 1].map((rating) => (
            <div key={rating} className="flex items-center gap-2">
              <input
                type="radio"
                id={`rating-${rating}`}
                name="rating"
                checked={filters.minRating === rating}
                onChange={() => handleRatingChange(rating)}
                className="w-4 h-4 text-primary border-border focus:ring-primary"
              />
              <label htmlFor={`rating-${rating}`} className="flex items-center gap-1 text-sm">
                <span>{rating}</span>
                <Icon name="Star" size={14} className="text-accent" />
                <span className="text-text-secondary">& up</span>
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Business Type */}
      <div className="space-y-3">
        <h4 className="font-medium text-text-primary flex items-center gap-2">
          <Icon name="Building" size={16} />
          Business Type
        </h4>
        <div className="space-y-2">
          {businessTypes.map((type) => (
            <Checkbox
              key={type}
              id={type}
              label={type}
              checked={filters.businessTypes?.includes(type) || false}
              onChange={() => handleBusinessTypeChange(type)}
            />
          ))}
        </div>
      </div>

      {/* Quick Filters */}
      <div className="space-y-3">
        <h4 className="font-medium text-text-primary flex items-center gap-2">
          <Icon name="Filter" size={16} />
          Quick Filters
        </h4>
        <div className="space-y-2">
          <Checkbox
            id="verified"
            label="Verified Shops Only"
            checked={filters.verifiedOnly || false}
            onChange={(checked) => onFilterChange('verifiedOnly', checked)}
          />
          <Checkbox
            id="premium"
            label="Premium Shops Only"
            checked={filters.premiumOnly || false}
            onChange={(checked) => onFilterChange('premiumOnly', checked)}
          />
          <Checkbox
            id="online"
            label="Online Shops Only"
            checked={filters.onlineOnly || false}
            onChange={(checked) => onFilterChange('onlineOnly', checked)}
          />
        </div>
      </div>

      {/* Clear All Button */}
      <div className="pt-4 border-t border-border">
        <Button
          variant="outline"
          onClick={handleClearAll}
          className="w-full"
          iconName="X"
          iconPosition="left"
        >
          Clear All Filters
        </Button>
      </div>
    </div>
  );
};

export default FilterPanel;