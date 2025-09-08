import React, { useState, useRef, useEffect } from 'react';
import Icon from '../../components/AppIcon';

const CustomDropdown = ({ 
  options = [], 
  value, 
  onChange, 
  placeholder = "Select an option",
  className = "",
  disabled = false 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleOptionClick = (option) => {
    onChange(option.value);
    setIsOpen(false);
  };

  const selectedOption = options.find(option => option.value === value);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Dropdown Button */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          w-full flex items-center justify-between px-4 py-3 
          bg-white border-2 border-gray-200 rounded-xl
          text-sm font-medium text-gray-700
          focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          ${isOpen ? 'border-teal-500 shadow-xl' : ''}
        `}
      >
        <div className="flex items-center gap-3">
          {selectedOption?.icon && (
            <Icon name={selectedOption.icon} size={16} className="text-gray-500" />
          )}
          <span className="truncate">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>
        <Icon 
          name="ChevronDown" 
          size={16} 
          className={`text-gray-400 transition-all duration-300 ease-out ${
            isOpen ? 'rotate-180 text-teal-500' : 'rotate-0'
          }`} 
        />
      </button>

      {/* Dropdown Menu */}
      <div className={`
        absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden
        transition-all duration-300 ease-out transform origin-top
        ${isOpen 
          ? 'opacity-100 scale-y-100 translate-y-0' 
          : 'opacity-0 scale-y-0 -translate-y-4 pointer-events-none'
        }
      `}>
        <div className="py-2">
          {options.map((option, index) => (
            <button
              key={option.value}
              type="button"
              onClick={() => handleOptionClick(option)}
              className={`
                w-full flex items-center gap-3 px-4 py-3 text-left
                text-sm font-medium transition-all duration-200 ease-out
                hover:bg-teal-50 hover:text-teal-700 hover:translate-x-1
                ${value === option.value 
                  ? 'bg-teal-100 text-teal-800 font-semibold' 
                  : 'text-gray-700'
                }
                ${index === 0 ? 'rounded-t-lg' : ''}
                ${index === options.length - 1 ? 'rounded-b-lg' : ''}
              `}
            >
              {option.icon && (
                <Icon 
                  name={option.icon} 
                  size={16} 
                  className={`transition-colors duration-200 ${
                    value === option.value ? 'text-teal-600' : 'text-gray-500'
                  }`} 
                />
              )}
              <span className="truncate transition-colors duration-200">{option.label}</span>
              {value === option.value && (
                <Icon 
                  name="Check" 
                  size={16} 
                  className="text-teal-600 ml-auto transition-all duration-200 scale-100" 
                />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CustomDropdown;
