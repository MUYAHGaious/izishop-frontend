import React, { useRef } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import GlassIcons from '../../../components/ui/GlassIcons';

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

          {/* Categories Container - Glass Icons */}
          <div className="flex justify-center px-10">
            <GlassIcons 
              items={categories.map((category) => ({
                icon: <Icon name={category.icon} size={24} className="text-white" />,
                color: 'teal',
                label: `${category.name} (${category.count})`,
                customClass: `cursor-pointer ${selectedCategory === category.id ? 'selected' : ''}`,
                onClick: () => onCategoryChange(category.id)
              }))} 
              className="category-navigation"
            />
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
      <div className="bg-gradient-to-r from-teal-50 to-emerald-50 border-t border-gray-100">
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

