import React, { useState, useRef, useEffect } from 'react';
import Icon from '../../../components/AppIcon';

const ShopCategoryDropdown = ({ categories = [], selectedCategory = 'all', onCategorySelect, className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
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
        setIsOpen(false);
      }
    };

    if (isOpen) {
      // Add a small delay to prevent immediate closing
      const timeoutId = setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside);
      }, 100);
      
      return () => {
        clearTimeout(timeoutId);
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Filter categories based on search term
  const filteredCategories = categories.filter(category =>
    category.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get selected category name
  const selectedCategoryName = categories.find(cat => cat.id === selectedCategory)?.label || 'All Categories';

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Dropdown Button */}
      <div
        className="flex items-center justify-between px-4 py-3 bg-white border-r border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors duration-150 min-w-48"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
      >
      <div className="flex items-center space-x-2">
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
            <div className="text-sm font-medium text-gray-500 mb-3">Select Shop Category</div>
            {categories.length > 0 ? (
              <div className="space-y-1">
                {filteredCategories.map((category) => (
                  <div
                    key={category.id}
                    onClick={() => handleCategorySelect(category)}
                    className="flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer hover:bg-teal-50 transition-colors duration-150"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-gray-700 font-medium">
                        {category.label}
                      </span>
                    </div>
                    {selectedCategory === category.id && (
                      <Icon 
                        name="Check" 
                        size={16} 
                        className="text-teal-600 flex-shrink-0" 
                      />
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Icon name="Store" size={32} className="mx-auto mb-2 text-gray-300" />
                <p>No categories available</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ShopCategoryDropdown;
