import React, { useState, useRef, useEffect } from 'react';
import Icon from '../../../components/AppIcon';

const CategoryDropdown = ({ 
  categories = [], 
  selectedCategory, 
  onCategorySelect, 
  className = "" 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);

  // Filter categories based on search term
  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle category selection
  const handleCategorySelect = (category) => {
    console.log('Selecting category:', category);
    if (onCategorySelect) {
      onCategorySelect(category);
    }
    setIsOpen(false);
    setSearchTerm('');
  };

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        console.log('Clicking outside, closing dropdown');
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Get selected category name
  const selectedCategoryName = categories.find(cat => cat.id === selectedCategory)?.name || 'All Categories';
  
  // Debug logging
  console.log('CategoryDropdown - Categories:', categories);
  console.log('CategoryDropdown - Selected Category:', selectedCategory);
  console.log('CategoryDropdown - Selected Category Name:', selectedCategoryName);
  console.log('CategoryDropdown - Is Open:', isOpen);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Dropdown Button */}
      <div
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          console.log('Category dropdown clicked, isOpen:', isOpen);
          setIsOpen(!isOpen);
        }}
        className="flex items-center justify-between w-full h-14 px-4 bg-white border-r border-gray-200 rounded-l-2xl hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-inset min-w-48 cursor-pointer select-none"
        style={{ pointerEvents: 'auto' }}
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
          className="absolute top-full left-0 w-80 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-200 z-[9999] max-h-96 overflow-hidden"
          style={{ 
            position: 'absolute', 
            top: '100%', 
            left: 0, 
            marginTop: '8px',
            zIndex: 9999
          }}
        >
          {/* Search within categories */}
          <div className="p-3 border-b border-gray-100">
            <div className="relative">
              <Icon name="Search" size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                autoFocus
              />
            </div>
          </div>

          {/* Categories List */}
          <div className="max-h-80 overflow-y-auto">
            {filteredCategories.length > 0 ? (
              <div className="p-2">
                {filteredCategories.map((category) => (
                  <button
                    key={category.id}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      console.log('Category selected:', category);
                      handleCategorySelect(category);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-3 rounded-lg text-left transition-colors group ${
                      selectedCategory === category.id
                        ? 'bg-teal-50 text-teal-700'
                        : 'hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        selectedCategory === category.id
                          ? 'bg-teal-100'
                          : 'bg-gray-100 group-hover:bg-teal-50'
                      }`}>
                        <Icon 
                          name={category.icon || 'Package'} 
                          size={16} 
                          className={
                            selectedCategory === category.id
                              ? 'text-teal-600'
                              : 'text-gray-500 group-hover:text-teal-600'
                          } 
                        />
                      </div>
                      <div>
                        <div className="font-medium">{category.name}</div>
                        {category.count !== undefined && (
                          <div className="text-xs text-gray-500">
                            {category.count} product{category.count !== 1 ? 's' : ''}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {selectedCategory === category.id && (
                      <Icon name="Check" size={16} className="text-teal-600" />
                    )}
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-gray-500">
                <Icon name="Search" size={32} className="mx-auto mb-2 text-gray-300" />
                <p>No categories found</p>
                <p className="text-xs mt-2">Categories: {categories.length}</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-gray-100 bg-gray-50">
            <div className="text-xs text-gray-500 text-center">
              Select a category to narrow your search
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryDropdown;
