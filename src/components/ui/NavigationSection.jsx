import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Icon from '../AppIcon';
import { useAuth } from '../../contexts/AuthContext';

const NavigationSection = () => {
  const location = useLocation();
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const languageRef = useRef(null);
  const { user, isAuthenticated } = useAuth();

  const isActive = (path) => location.pathname === path;

  // Get greeting message based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  // Get user's first name or default greeting
  const getUserGreeting = () => {
    if (isAuthenticated() && user) {
      // Try different possible name fields
      const userName = user.name || user.first_name || user.username || user.email?.split('@')[0];
      if (userName) {
        const firstName = userName.split(' ')[0];
        return `${getGreeting()}, ${firstName}`;
      }
    }
    return getGreeting();
  };

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'it', name: 'Italiano', flag: '🇮🇹' },
    { code: 'pt', name: 'Português', flag: '🇵🇹' },
    { code: 'zh', name: '中文', flag: '🇨🇳' },
    { code: 'ja', name: '日本語', flag: '🇯🇵' },
    { code: 'ko', name: '한국어', flag: '🇰🇷' },
    { code: 'ar', name: 'العربية', flag: '🇸🇦' }
  ];

  const [selectedLanguage, setSelectedLanguage] = useState(languages[0]);

  // Handle click outside to close language dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (languageRef.current && !languageRef.current.contains(event.target)) {
        setIsLanguageOpen(false);
      }
    };

    if (isLanguageOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isLanguageOpen]);

  const handleLanguageSelect = (language) => {
    setSelectedLanguage(language);
    setIsLanguageOpen(false);
  };

  return (
    <div className="fixed top-16 left-0 right-0 bg-white/80 backdrop-blur-xl border-b border-white/20 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6">
        <div className="flex items-center justify-between h-10">
          {/* Left side - Greeting and Navigation */}
          <div className="flex items-center space-x-4">
            {/* Greeting Message */}
            <Link 
              to="/user-profile" 
              className="text-sm font-medium text-gray-700 hover:text-teal-600 hover:bg-teal-50 px-2 py-1 rounded-lg transition-all duration-200 hidden sm:block cursor-pointer"
            >
              {getUserGreeting()}
            </Link>
            
            {/* Divider */}
            <div className="w-px h-4 bg-gray-300 hidden sm:block"></div>
            
            {/* Main Navigation Links */}
            <nav className="flex items-center space-x-2">
            <Link
              to="/product-catalog"
              className={`flex items-center space-x-1 px-2 py-1 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive('/product-catalog') 
                  ? 'bg-teal-100 text-teal-700' 
                  : 'text-gray-700 hover:text-teal-600 hover:bg-teal-50'
              }`}
            >
              <Icon name="Package" size={14} />
              <span>Products</span>
            </Link>
            <Link
              to="/shops-listing"
              className={`flex items-center space-x-1 px-2 py-1 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive('/shops-listing') 
                  ? 'bg-teal-100 text-teal-700' 
                  : 'text-gray-700 hover:text-teal-600 hover:bg-teal-50'
              }`}
            >
              <Icon name="Store" size={14} />
              <span>Shops</span>
            </Link>
            <Link
              to="/casual-marketplace"
              className={`flex items-center space-x-1 px-2 py-1 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive('/casual-marketplace') 
                  ? 'bg-teal-100 text-teal-700' 
                  : 'text-gray-700 hover:text-teal-600 hover:bg-teal-50'
              }`}
            >
              <Icon name="ShoppingBag" size={14} />
              <span>Marketplace</span>
            </Link>
            
            {/* Divider */}
            <div className="w-px h-4 bg-gray-300 mx-2"></div>
            
            {/* Quick Access Links */}
            <Link
              to="/my-orders"
              className={`flex items-center space-x-1 px-2 py-1 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive('/my-orders') 
                  ? 'bg-teal-100 text-teal-700' 
                  : 'text-gray-700 hover:text-teal-600 hover:bg-teal-50'
              }`}
            >
              <Icon name="Package" size={14} />
              <span>My Orders</span>
            </Link>
            <Link
              to="/customer-support"
              className={`flex items-center space-x-1 px-2 py-1 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive('/customer-support') 
                  ? 'bg-teal-100 text-teal-700' 
                  : 'text-gray-700 hover:text-teal-600 hover:bg-teal-50'
              }`}
            >
              <Icon name="Headphones" size={14} />
              <span>Support</span>
            </Link>
            <Link
              to="/settings"
              className={`flex items-center space-x-1 px-2 py-1 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive('/settings') 
                  ? 'bg-teal-100 text-teal-700' 
                  : 'text-gray-700 hover:text-teal-600 hover:bg-teal-50'
              }`}
            >
              <Icon name="Settings" size={14} />
              <span>Settings</span>
            </Link>
            <Link
              to="/create-shop"
              className={`flex items-center space-x-1 px-2 py-1 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive('/create-shop') 
                  ? 'bg-teal-100 text-teal-700' 
                  : 'text-gray-700 hover:text-teal-600 hover:bg-teal-50'
              }`}
            >
              <Icon name="Store" size={14} />
              <span>Sell</span>
            </Link>
            </nav>
          </div>

          {/* Language Dropdown */}
          <div className="relative" ref={languageRef}>
            <button
              onClick={() => setIsLanguageOpen(!isLanguageOpen)}
              className="flex items-center space-x-1 px-2 py-1 rounded-lg text-sm font-medium text-gray-700 hover:text-teal-600 hover:bg-teal-50 transition-all duration-200"
            >
              <span className="text-lg">{selectedLanguage.flag}</span>
              <span>{selectedLanguage.name}</span>
              <Icon 
                name={isLanguageOpen ? "ChevronUp" : "ChevronDown"} 
                size={16} 
                className="text-gray-500" 
              />
            </button>

            {/* Language Dropdown Menu */}
            {isLanguageOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 max-h-80 overflow-y-auto">
                <div className="p-2">
                  {languages.map((language) => (
                    <button
                      key={language.code}
                      onClick={() => handleLanguageSelect(language)}
                      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm transition-colors duration-150 ${
                        selectedLanguage.code === language.code
                          ? 'bg-teal-50 text-teal-700'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <span className="text-lg">{language.flag}</span>
                      <span className="font-medium">{language.name}</span>
                      {selectedLanguage.code === language.code && (
                        <Icon name="Check" size={16} className="text-teal-600 ml-auto" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NavigationSection;
