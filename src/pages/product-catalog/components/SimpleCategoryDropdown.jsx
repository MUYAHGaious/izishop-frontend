import React, { useState, useRef, useEffect } from 'react';
import Icon from '../../../components/AppIcon';

const SimpleCategoryDropdown = ({ 
  categories = [], 
  selectedCategory, 
  onCategorySelect, 
  className = "" 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Handle category selection
  const handleCategorySelect = (category) => {
    if (onCategorySelect) {
      onCategorySelect(category);
    }
    setIsOpen(false);
  };

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        console.log('Clicking outside, closing dropdown');
        setIsOpen(false);
      }
    };

    if (isOpen) {
      // Add a small delay to prevent immediate closing
      setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside);
      }, 100);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Get selected category name
  const selectedCategoryName = categories.find(cat => cat.id === selectedCategory)?.name || 'All Categories';
  

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Dropdown Button */}
      <div
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="flex items-center justify-between w-full h-14 px-4 bg-white border-r border-gray-200 rounded-l-2xl hover:bg-gray-50 transition-colors cursor-pointer select-none min-w-48"
      >
        <div className="flex items-center space-x-3">
          <Icon name="Grid3x3" size={20} className="text-gray-500" />
          <span className="text-gray-700 font-medium truncate">
            {selectedCategoryName}
          </span>
        </div>
        <Icon 
          name={isOpen ? "ChevronUp" : "ChevronDown"} 
          size={16} 
          className="text-gray-400 flex-shrink-0" 
        />
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div 
          className="fixed bg-white rounded-2xl shadow-2xl border-2 border-teal-200 max-h-96 overflow-y-auto z-[9999]"
          style={{ 
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '400px',
            zIndex: 99999,
            backgroundColor: 'white',
            maxHeight: '80vh'
          }}
        >
          <div className="p-4">
            <div className="text-sm font-medium text-gray-500 mb-3">Select Category</div>
            {categories.length > 0 ? (
              <div className="space-y-1">
                {categories.map((category) => (
                  <div
                    key={category.id}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      console.log('Category selected:', category);
                      handleCategorySelect(category);
                    }}
                    className={`flex items-center space-x-3 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                      selectedCategory === category.id
                        ? 'bg-teal-100 text-teal-700'
                        : 'hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <Icon 
                      name={category.icon || 'Package'} 
                      size={16} 
                      className={
                        selectedCategory === category.id
                          ? 'text-teal-600'
                          : 'text-gray-500'
                      } 
                    />
                    <span className="font-medium">{category.name}</span>
                    {category.count !== undefined && (
                      <span className="text-xs text-gray-500 ml-auto">
                        {category.count}
                      </span>
                    )}
                    {selectedCategory === category.id && (
                      <Icon name="Check" size={16} className="text-teal-600 ml-auto" />
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-4">
                <p>No categories available</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SimpleCategoryDropdown;
