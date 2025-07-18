import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../../components/AppIcon';

const GlassNavigation = ({ className = '' }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 ${className}`}>
      {/* Glass morphism background */}
      <div className="absolute inset-0 bg-white/10 backdrop-blur-md border-b border-white/20" />
      
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
              <h1 className="text-lg sm:text-xl font-bold text-white drop-shadow-lg">IziShopin</h1>
              <p className="text-xs text-white/80 -mt-1 hidden sm:block">Cameroon's B2B Marketplace</p>
            </div>
          </Link>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="sm:hidden p-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 transition-all duration-300"
          >
            <Icon 
              name={isMenuOpen ? "X" : "Menu"} 
              size={20} 
              className="text-white" 
            />
          </button>

          {/* Desktop Navigation Links */}
          <div className="hidden sm:flex items-center space-x-3 lg:space-x-4">
            {/* Home Link */}
            <Link
              to="/"
              className="group flex items-center space-x-2 px-3 py-2 lg:px-4 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/30 transition-all duration-300 backdrop-blur-sm"
            >
              <Icon name="Home" size={14} className="lg:w-4 lg:h-4 text-white/80 group-hover:text-white transition-colors" />
              <span className="text-sm font-medium text-white/80 group-hover:text-white transition-colors">
                Home
              </span>
            </Link>

            {/* Browse Shops Link */}
            <Link
              to="/shops-listing"
              className="group flex items-center space-x-2 px-3 py-2 lg:px-4 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/30 transition-all duration-300 backdrop-blur-sm"
            >
              <Icon name="Store" size={14} className="lg:w-4 lg:h-4 text-white/80 group-hover:text-white transition-colors" />
              <span className="text-sm font-medium text-white/80 group-hover:text-white transition-colors">
                Shops
              </span>
            </Link>

            {/* Help Link */}
            <button className="group flex items-center space-x-2 px-3 py-2 lg:px-4 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/30 transition-all duration-300 backdrop-blur-sm">
              <Icon name="HelpCircle" size={14} className="lg:w-4 lg:h-4 text-white/80 group-hover:text-white transition-colors" />
              <span className="text-sm font-medium text-white/80 group-hover:text-white transition-colors">
                Help
              </span>
            </button>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {isMenuOpen && (
          <div className="sm:hidden mt-4 pb-4 border-t border-white/20">
            <div className="flex flex-col space-y-2 pt-4">
              <Link
                to="/"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center space-x-3 px-4 py-3 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 transition-all duration-300"
              >
                <Icon name="Home" size={18} className="text-white/80" />
                <span className="text-white/90 font-medium">Home</span>
              </Link>
              
              <Link
                to="/shops-listing"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center space-x-3 px-4 py-3 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 transition-all duration-300"
              >
                <Icon name="Store" size={18} className="text-white/80" />
                <span className="text-white/90 font-medium">Browse Shops</span>
              </Link>
              
              <button 
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center space-x-3 px-4 py-3 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 transition-all duration-300 text-left"
              >
                <Icon name="HelpCircle" size={18} className="text-white/80" />
                <span className="text-white/90 font-medium">Help & Support</span>
              </button>
              
              <div className="pt-2 border-t border-white/20 mt-2">
                <Link
                  to="/product-catalog"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center space-x-3 px-4 py-3 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 transition-all duration-300"
                >
                  <Icon name="ShoppingBag" size={18} className="text-white/80" />
                  <span className="text-white/90 font-medium">Browse Products</span>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5 pointer-events-none" />
    </nav>
  );
};

export default GlassNavigation;

