import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../../components/AppIcon';

const GlassNavigation = ({ className = '', isAuthPage = true }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 ${className}`}>
      {/* Glass morphism background - adapted for auth page */}
      <div className={`absolute inset-0 ${
        isAuthPage 
          ? 'bg-white/98 backdrop-blur-xl border-b border-gray-200/60 shadow-md' 
          : 'bg-white/10 backdrop-blur-md border-b border-white/20'
      }`} />
      
      {/* Navigation content */}
      <div className="relative px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo - Mobile optimized */}
          <Link 
            to="/" 
            className="flex items-center space-x-2 group transition-all duration-300 hover:scale-105"
          >
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-primary to-primary/80 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
              <Icon name="Store" size={16} className="sm:w-5 sm:h-5 text-white" />
            </div>
            <div>
              <h1 className={`text-lg sm:text-xl font-bold ${
                isAuthPage ? 'text-gray-900' : 'text-white drop-shadow-lg'
              }`}>IziShopin</h1>
              <p className={`text-xs -mt-1 hidden sm:block ${
                isAuthPage ? 'text-gray-600' : 'text-white/80'
              }`}>Cameroon's B2B Marketplace</p>
            </div>
          </Link>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`sm:hidden p-2 rounded-lg transition-all duration-300 ${
              isAuthPage 
                ? 'bg-gray-100 hover:bg-gray-200 border border-gray-200' 
                : 'bg-white/10 hover:bg-white/20 border border-white/20'
            }`}
          >
            <Icon 
              name={isMenuOpen ? "X" : "Menu"} 
              size={20} 
              className={isAuthPage ? 'text-gray-700' : 'text-white'} 
            />
          </button>

          {/* Desktop Navigation Links */}
          <div className="hidden sm:flex items-center space-x-3 lg:space-x-4">
            {/* Home Link */}
            <Link
              to="/"
              className={`group flex items-center space-x-2 px-3 py-2 lg:px-4 rounded-full transition-all duration-300 backdrop-blur-sm ${
                isAuthPage 
                  ? 'bg-gray-100 hover:bg-gray-200 border border-gray-200 hover:border-gray-300'
                  : 'bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/30'
              }`}
            >
              <Icon 
                name="Home" 
                size={14} 
                className={`lg:w-4 lg:h-4 transition-colors ${
                  isAuthPage 
                    ? 'text-gray-600 group-hover:text-gray-800'
                    : 'text-white/80 group-hover:text-white'
                }`} 
              />
              <span className={`text-sm font-medium transition-colors ${
                isAuthPage 
                  ? 'text-gray-600 group-hover:text-gray-800'
                  : 'text-white/80 group-hover:text-white'
              }`}>
                Home
              </span>
            </Link>

            {/* Browse Shops Link */}
            <Link
              to="/shops-listing"
              className={`group flex items-center space-x-2 px-3 py-2 lg:px-4 rounded-full transition-all duration-300 backdrop-blur-sm ${
                isAuthPage 
                  ? 'bg-gray-100 hover:bg-gray-200 border border-gray-200 hover:border-gray-300'
                  : 'bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/30'
              }`}
            >
              <Icon 
                name="Store" 
                size={14} 
                className={`lg:w-4 lg:h-4 transition-colors ${
                  isAuthPage 
                    ? 'text-gray-600 group-hover:text-gray-800'
                    : 'text-white/80 group-hover:text-white'
                }`} 
              />
              <span className={`text-sm font-medium transition-colors ${
                isAuthPage 
                  ? 'text-gray-600 group-hover:text-gray-800'
                  : 'text-white/80 group-hover:text-white'
              }`}>
                Shops
              </span>
            </Link>

            {/* Help Link */}
            <button className={`group flex items-center space-x-2 px-3 py-2 lg:px-4 rounded-full transition-all duration-300 backdrop-blur-sm ${
              isAuthPage 
                ? 'bg-gray-100 hover:bg-gray-200 border border-gray-200 hover:border-gray-300'
                : 'bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/30'
            }`}>
              <Icon 
                name="HelpCircle" 
                size={14} 
                className={`lg:w-4 lg:h-4 transition-colors ${
                  isAuthPage 
                    ? 'text-gray-600 group-hover:text-gray-800'
                    : 'text-white/80 group-hover:text-white'
                }`} 
              />
              <span className={`text-sm font-medium transition-colors ${
                isAuthPage 
                  ? 'text-gray-600 group-hover:text-gray-800'
                  : 'text-white/80 group-hover:text-white'
              }`}>
                Help
              </span>
            </button>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {isMenuOpen && (
          <div className={`sm:hidden mt-4 pb-4 ${
            isAuthPage ? 'border-t border-gray-200' : 'border-t border-white/20'
          }`}>
            <div className="flex flex-col space-y-2 pt-4">
              <Link
                to="/"
                onClick={() => setIsMenuOpen(false)}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-300 ${
                  isAuthPage 
                    ? 'bg-gray-100 hover:bg-gray-200 border border-gray-200'
                    : 'bg-white/10 hover:bg-white/20 border border-white/20'
                }`}
              >
                <Icon 
                  name="Home" 
                  size={18} 
                  className={isAuthPage ? 'text-gray-600' : 'text-white/80'} 
                />
                <span className={`font-medium ${
                  isAuthPage ? 'text-gray-700' : 'text-white/90'
                }`}>Home</span>
              </Link>
              
              <Link
                to="/shops-listing"
                onClick={() => setIsMenuOpen(false)}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-300 ${
                  isAuthPage 
                    ? 'bg-gray-100 hover:bg-gray-200 border border-gray-200'
                    : 'bg-white/10 hover:bg-white/20 border border-white/20'
                }`}
              >
                <Icon 
                  name="Store" 
                  size={18} 
                  className={isAuthPage ? 'text-gray-600' : 'text-white/80'} 
                />
                <span className={`font-medium ${
                  isAuthPage ? 'text-gray-700' : 'text-white/90'
                }`}>Browse Shops</span>
              </Link>
              
              <button 
                onClick={() => setIsMenuOpen(false)}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-300 text-left ${
                  isAuthPage 
                    ? 'bg-gray-100 hover:bg-gray-200 border border-gray-200'
                    : 'bg-white/10 hover:bg-white/20 border border-white/20'
                }`}
              >
                <Icon 
                  name="HelpCircle" 
                  size={18} 
                  className={isAuthPage ? 'text-gray-600' : 'text-white/80'} 
                />
                <span className={`font-medium ${
                  isAuthPage ? 'text-gray-700' : 'text-white/90'
                }`}>Help & Support</span>
              </button>
              
              <div className={`pt-2 mt-2 ${
                isAuthPage ? 'border-t border-gray-200' : 'border-t border-white/20'
              }`}>
                <Link
                  to="/product-catalog"
                  onClick={() => setIsMenuOpen(false)}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-300 ${
                    isAuthPage 
                      ? 'bg-gray-100 hover:bg-gray-200 border border-gray-200'
                      : 'bg-white/10 hover:bg-white/20 border border-white/20'
                  }`}
                >
                  <Icon 
                    name="ShoppingBag" 
                    size={18} 
                    className={isAuthPage ? 'text-gray-600' : 'text-white/80'} 
                  />
                  <span className={`font-medium ${
                    isAuthPage ? 'text-gray-700' : 'text-white/90'
                  }`}>Browse Products</span>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Subtle gradient overlay */}
      <div className={`absolute inset-0 pointer-events-none ${
        isAuthPage 
          ? 'bg-gradient-to-r from-gray-50/50 via-transparent to-gray-50/50'
          : 'bg-gradient-to-r from-primary/5 via-transparent to-primary/5'
      }`} />
    </nav>
  );
};

export default GlassNavigation;

