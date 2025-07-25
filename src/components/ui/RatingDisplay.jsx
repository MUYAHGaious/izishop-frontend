import React from 'react';
import Icon from '../AppIcon';

const RatingDisplay = ({ 
  rating = 0, 
  totalReviews = 0, 
  size = 'medium',
  showNumber = true,
  showTotal = true,
  className = ''
}) => {
  const sizeClasses = {
    small: 'text-sm',
    medium: 'text-base',
    large: 'text-lg'
  };

  const iconSizes = {
    small: 12,
    medium: 16,
    large: 20
  };

  const renderStars = () => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating - fullStars >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    // Full stars
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Icon
          key={`full-${i}`}
          name="Star"
          size={iconSizes[size]}
          className="text-yellow-400 fill-current"
        />
      );
    }

    // Half star
    if (hasHalfStar) {
      stars.push(
        <div key="half" className="relative">
          <Icon
            name="Star"
            size={iconSizes[size]}
            className="text-gray-300 fill-current"
          />
          <div className="absolute inset-0 overflow-hidden w-1/2">
            <Icon
              name="Star"
              size={iconSizes[size]}
              className="text-yellow-400 fill-current"
            />
          </div>
        </div>
      );
    }

    // Empty stars
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <Icon
          key={`empty-${i}`}
          name="Star"
          size={iconSizes[size]}
          className="text-gray-300 fill-current"
        />
      );
    }

    return stars;
  };

  return (
    <div className={`flex items-center space-x-1 ${sizeClasses[size]} ${className}`}>
      <div className="flex items-center space-x-0.5">
        {renderStars()}
      </div>
      {showNumber && (
        <span className="font-medium text-gray-700">
          {rating.toFixed(1)}
        </span>
      )}
      {showTotal && totalReviews > 0 && (
        <span className="text-gray-500">
          ({totalReviews})
        </span>
      )}
    </div>
  );
};

export default RatingDisplay;