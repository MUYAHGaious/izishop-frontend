import React from 'react';
import Icon from '../../../components/AppIcon';

const CategoryNavigation = ({ categories, selectedCategory, onCategoryChange }) => {
  return (
    <div className="bg-white border-b border-gray-200 sticky top-0 z-20">
      <div className="container mx-auto px-4">
        <div className="flex overflow-x-auto scrollbar-hide py-4 space-x-6">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => onCategoryChange(category.id)}
              className={`flex flex-col items-center min-w-[80px] p-3 rounded-xl transition-all duration-300 hover:scale-105 ${
                selectedCategory === category.id
                  ? 'bg-teal-50 text-teal-600 shadow-md scale-105'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <div className={`p-3 rounded-full mb-2 transition-colors duration-300 ${
                selectedCategory === category.id
                  ? 'bg-teal-100'
                  : 'bg-gray-100'
              }`}>
                <Icon 
                  name={category.icon} 
                  size={20} 
                  className={selectedCategory === category.id ? 'text-teal-600' : 'text-gray-500'} 
                />
              </div>
              <span className="text-xs font-medium text-center leading-tight">
                {category.name}
              </span>
              {category.count > 0 && (
                <span className="text-xs text-gray-500 mt-1">
                  ({category.count})
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategoryNavigation;