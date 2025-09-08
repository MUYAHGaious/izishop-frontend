import React, { useRef, useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import GlassIcons from '../../../components/ui/GlassIcons';

const CategoryNavigation = ({ categories, selectedCategory, onCategoryChange }) => {
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScrollButtons = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  useEffect(() => {
    checkScrollButtons();
    const scrollContainer = scrollRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', checkScrollButtons);
      return () => scrollContainer.removeEventListener('scroll', checkScrollButtons);
    }
  }, [categories]);

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  return (
    <div className="bg-white border-b border-gray-200 z-20">
      <div className="container mx-auto px-4 py-4">
        <div className="relative flex items-center">
          {/* Scroll Left Button - Always visible */}
          <button
            onClick={scrollLeft}
            disabled={!canScrollLeft}
            className={`flex-shrink-0 w-12 h-12 bg-white shadow-lg rounded-full flex items-center justify-center transition-all duration-200 border border-gray-200 mr-4 ${
              canScrollLeft 
                ? 'hover:bg-gray-50 cursor-pointer text-gray-600' 
                : 'opacity-30 cursor-not-allowed text-gray-400'
            }`}
          >
            <Icon name="ArrowLeft" size={20} />
          </button>

          {/* Categories Container - Glass Icons */}
          <div className="flex-1 overflow-hidden">
            <div 
              ref={scrollRef}
              className="overflow-x-auto scrollbar-hide"
              style={{ 
                scrollbarWidth: 'none', 
                msOverflowStyle: 'none'
              }}
            >
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
          </div>

          {/* Scroll Right Button - Always visible */}
          <button
            onClick={scrollRight}
            disabled={!canScrollRight}
            className={`flex-shrink-0 w-12 h-12 bg-white shadow-lg rounded-full flex items-center justify-center transition-all duration-200 border border-gray-200 ml-4 ${
              canScrollRight 
                ? 'hover:bg-gray-50 cursor-pointer text-gray-600' 
                : 'opacity-30 cursor-not-allowed text-gray-400'
            }`}
          >
            <Icon name="ArrowRight" size={20} />
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

