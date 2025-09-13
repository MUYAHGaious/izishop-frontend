import React, { useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import Icon from '../AppIcon';

const LanguageSwitcher = () => {
  const { currentLanguage, toggleLanguage, t } = useLanguage();
  const [isHovered, setIsHovered] = useState(false);

  const getCurrentLanguageDisplay = () => {
    return currentLanguage === 'en-GB' ? 'EN' : 'FR';
  };

  const getOtherLanguageDisplay = () => {
    return currentLanguage === 'en-GB' ? 'FR' : 'EN';
  };

  return (
    <div className="relative">
      <button
        onClick={toggleLanguage}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="flex items-center space-x-1 p-2 hover:bg-gray-100/50 rounded-xl transition-all duration-200 group"
        title={t('language.switch')}
      >
        {/* Globe Icon */}
        <Icon name="Globe" size={16} className="text-blue-600 group-hover:text-blue-700" />

        {/* Language Code */}
        <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 min-w-[20px]">
          {getCurrentLanguageDisplay()}
        </span>

        {/* Subtle indicator */}
        <Icon name="ChevronDown" size={12} className="text-gray-400 group-hover:text-gray-600" />
      </button>

      {/* Hover tooltip */}
      {isHovered && (
        <div className="absolute top-full right-0 mt-1 px-2 py-1 bg-gray-900 text-white text-xs rounded-md whitespace-nowrap z-50">
          Switch to {getOtherLanguageDisplay()}
          <div className="absolute -top-1 right-3 w-0 h-0 border-l-2 border-r-2 border-b-2 border-transparent border-b-gray-900"></div>
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;