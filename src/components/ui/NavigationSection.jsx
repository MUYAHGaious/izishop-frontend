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
              <span>{t('nav.products')}</span>
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
              <span>{t('nav.shops')}</span>
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
              <span>{t('nav.marketplace')}</span>
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
              <span>{t('nav.myOrders')}</span>
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
              <span>{t('nav.support')}</span>
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
              <span>{t('nav.settings')}</span>
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
              <span>{t('nav.sell')}</span>
            </Link>
            </nav>
          </div>

          {/* Language Switcher */}
          <LanguageSwitcher />
        </div>
      </div>
    </div>
  );
};

export default NavigationSection;
