import React, { useRef } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const CategoryNavigation = ({ categories, selectedCategory, onCategoryChange }) => {
  const scrollRef = useRef(null);

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -200, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 200, behavior: 'smooth' });
    }
  };

  return (
    <div className="bg-white border-b border-gray-200 z-20">
      <div className="container mx-auto px-4 py-4">
        <div className="relative">
          {/* Scroll Left Button */}
          <button
            onClick={scrollLeft}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white shadow-lg rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors"
          >
            <Icon name="ChevronLeft" size={16} className="text-gray-600" />
          </button>

          {/* Categories Container */}
          <div
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto scrollbar-hide px-10 scroll-smooth"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => onCategoryChange(category.id)}
                className={`flex-shrink-0 flex flex-col items-center p-4 rounded-xl transition-all duration-200 min-w-[100px] ${
                  selectedCategory === category.id
                    ? 'bg-gradient-to-br from-orange-500 to-pink-500 text-white shadow-lg transform scale-105'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100 hover:shadow-md'
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${
                  selectedCategory === category.id
                    ? 'bg-white/20'
                    : 'bg-white'
                }`}>
                  <Icon 
                    name={category.icon} 
                    size={16} 
                    className={selectedCategory === category.id ? 'text-white' : 'text-orange-500'} 
                  />
                </div>
                <span className="text-sm font-medium text-center leading-tight">
                  {category.name}
                </span>
                <span className={`text-xs mt-1 ${
                  selectedCategory === category.id ? 'text-white/80' : 'text-gray-500'
                }`}>
                  {category.count.toLocaleString()}
                </span>
              </button>
            ))}
          </div>

          {/* Scroll Right Button */}
          <button
            onClick={scrollRight}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white shadow-lg rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors"
          >
            <Icon name="ChevronRight" size={16} className="text-gray-600" />
          </button>
        </div>
      </div>

      {/* Category Quick Stats */}
      <div className="bg-gradient-to-r from-orange-50 to-pink-50 border-t border-gray-100">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-center gap-8 text-sm">
            <div className="flex items-center gap-2">
              <Icon name="Truck" size={16} className="text-green-500" />
              <span className="text-gray-600">Free shipping on orders over 50,000 XAF</span>
            </div>
            <div className="flex items-center gap-2">
              <Icon name="Shield" size={16} className="text-blue-500" />
              <span className="text-gray-600">Secure payments</span>
            </div>
            <div className="flex items-center gap-2">
              <Icon name="RotateCcw" size={16} className="text-purple-500" />
              <span className="text-gray-600">30-day returns</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryNavigation;

