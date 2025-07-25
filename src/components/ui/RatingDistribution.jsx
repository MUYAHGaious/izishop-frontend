import React from 'react';
import Icon from '../AppIcon';

const RatingDistribution = ({ distribution = {}, totalReviews = 0, className = '' }) => {
  // Ensure all rating levels are present
  const completeDistribution = {
    5: distribution[5] || 0,
    4: distribution[4] || 0,
    3: distribution[3] || 0,
    2: distribution[2] || 0,
    1: distribution[1] || 0,
  };

  const getPercentage = (count) => {
    if (totalReviews === 0) return 0;
    return (count / totalReviews) * 100;
  };

  if (totalReviews === 0) {
    return (
      <div className={`p-4 text-center text-gray-500 ${className}`}>
        <Icon name="Star" size={24} className="text-gray-300 mx-auto mb-2" />
        <p className="text-sm">No reviews yet</p>
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <h4 className="text-sm font-semibold text-gray-700 mb-3">Rating Distribution</h4>
      {[5, 4, 3, 2, 1].map((rating) => {
        const count = completeDistribution[rating];
        const percentage = getPercentage(count);
        
        return (
          <div key={rating} className="flex items-center space-x-2 text-sm">
            <div className="flex items-center space-x-1 w-8">
              <span className="text-gray-600">{rating}</span>
              <Icon name="Star" size={12} className="text-yellow-400 fill-current" />
            </div>
            
            <div className="flex-1 relative">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
            </div>
            
            <div className="w-12 text-right">
              <span className="text-gray-600">{count}</span>
            </div>
            
            <div className="w-10 text-right">
              <span className="text-gray-500 text-xs">
                {percentage.toFixed(0)}%
              </span>
            </div>
          </div>
        );
      })}
      
      <div className="pt-2 mt-3 border-t border-gray-200">
        <div className="flex justify-between text-sm text-gray-600">
          <span>Total Reviews</span>
          <span className="font-medium">{totalReviews}</span>
        </div>
      </div>
    </div>
  );
};

export default RatingDistribution;