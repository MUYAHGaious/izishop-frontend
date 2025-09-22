import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import Icon from '../AppIcon';
import LanguageSwitcher from './LanguageSwitcher';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';

const NavigationSection = () => {
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();
  const { t } = useLanguage();

  const isActive = (path) => location.pathname === path;

  // Get greeting message based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t('greeting.morning');
    if (hour < 17) return t('greeting.afternoon');
    return t('greeting.evening');
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


  return (
    <div className="hidden md:block fixed top-16 left-0 right-0 bg-white/80 backdrop-blur-xl border-b border-white/20 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-12">
          {/* Left side - Professional Navigation */}
          <div className="flex items-center space-x-6">
            {/* Greeting Message - Professional */}
            <Link 
              to="/user-profile" 
              className="text-sm font-medium text-gray-600 hover:text-teal-600 px-3 py-1.5 transition-colors duration-200 hidden lg:block cursor-pointer"
            >
              {getUserGreeting()}
            </Link>
            
            {/* Divider */}
            <div className="w-px h-5 bg-gray-200 hidden lg:block"></div>
            
            {/* Main Navigation Links - Professional */}
            <nav className="flex items-center space-x-1">
              <Link
                to="/product-catalog"
                className={`flex items-center space-x-2 px-3 py-1.5 text-sm font-medium transition-colors duration-200 ${
                  isActive('/product-catalog') 
                    ? 'text-teal-700' 
                    : 'text-gray-600 hover:text-teal-600'
                }`}
              >
                <Icon name="Package" size={16} />
                <span className="hidden sm:inline">{t('nav.products')}</span>
              </Link>
              <Link
                to="/shops-listing"
                className={`flex items-center space-x-2 px-3 py-1.5 text-sm font-medium transition-colors duration-200 ${
                  isActive('/shops-listing') 
                    ? 'text-teal-700' 
                    : 'text-gray-600 hover:text-teal-600'
                }`}
              >
                <Icon name="Store" size={16} />
                <span className="hidden sm:inline">{t('nav.shops')}</span>
              </Link>
              <Link
                to="/casual-marketplace"
                className={`flex items-center space-x-2 px-3 py-1.5 text-sm font-medium transition-colors duration-200 ${
                  isActive('/casual-marketplace') 
                    ? 'text-teal-700' 
                    : 'text-gray-600 hover:text-teal-600'
                }`}
              >
                <Icon name="ShoppingBag" size={16} />
                <span className="hidden sm:inline">{t('nav.marketplace')}</span>
              </Link>
              
              {/* Divider */}
              <div className="w-px h-5 bg-gray-200 mx-2"></div>
              
              {/* Quick Access Links - Professional */}
              <Link
                to="/my-orders"
                className={`flex items-center space-x-2 px-3 py-1.5 text-sm font-medium transition-colors duration-200 ${
                  isActive('/my-orders') 
                    ? 'text-teal-700' 
                    : 'text-gray-600 hover:text-teal-600'
                }`}
              >
                <Icon name="Package" size={16} />
                <span className="hidden md:inline">{t('nav.myOrders')}</span>
              </Link>
              <Link
                to="/customer-support"
                className={`flex items-center space-x-2 px-3 py-1.5 text-sm font-medium transition-colors duration-200 ${
                  isActive('/customer-support') 
                    ? 'text-teal-700' 
                    : 'text-gray-600 hover:text-teal-600'
                }`}
              >
                <Icon name="User" size={16} />
                <span className="hidden md:inline">{t('nav.support')}</span>
              </Link>
              <Link
                to="/create-shop"
                className={`flex items-center space-x-2 px-3 py-1.5 text-sm font-medium transition-colors duration-200 ${
                  isActive('/create-shop') 
                    ? 'text-teal-700' 
                    : 'text-gray-600 hover:text-teal-600'
                }`}
              >
                <Icon name="Store" size={16} />
                <span className="hidden md:inline">{t('nav.sell')}</span>
              </Link>
            </nav>
          </div>

          {/* Right side - Language Switcher */}
          <div className="hidden sm:block">
            <LanguageSwitcher />
          </div>
        </div>
      </div>
    </div>
  );
};

export default NavigationSection;
