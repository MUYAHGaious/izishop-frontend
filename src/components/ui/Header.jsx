import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Icon from '../AppIcon';
import Button from './Button';
import Input from './Input';
import NotificationOverlay from './NotificationOverlay';
import SettingsOverlay from './SettingsOverlay';
import { useAuth } from '../../contexts/AuthContext';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [cartCount, setCartCount] = useState(0);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(3);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  // Update cart count from localStorage
  useEffect(() => {
    const updateCartCount = () => {
      const count = localStorage.getItem('cartItemCount');
      setCartCount(count ? parseInt(count) : 0);
    };

    updateCartCount();
    
    // Listen for storage changes
    window.addEventListener('storage', updateCartCount);
    
    // Custom event for cart updates
    window.addEventListener('cartUpdated', updateCartCount);
    
    return () => {
      window.removeEventListener('storage', updateCartCount);
      window.removeEventListener('cartUpdated', updateCartCount);
    };
  }, []);

  const isActive = (path) => location.pathname === path;

  const navigationItems = [
    { label: 'Products', path: '/product-catalog', icon: 'Package' },
    { label: 'Shops', path: '/shops-listing', icon: 'Store' },
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    console.log('Search query:', searchQuery);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="fixed top-0 left-0 right-0 bg-surface border-b border-border z-header">
      <div className="flex items-center justify-between h-16 px-4 lg:px-6">
        {/* Logo */}
        <Link to="/product-catalog" className="flex items-center space-x-2 flex-shrink-0">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Icon name="ShoppingBag" size={20} color="white" />
          </div>
          <span className="text-xl font-bold text-primary hidden sm:block">IziShop</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center space-x-8">
          {navigationItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive(item.path)
                  ? 'text-primary bg-primary/10' :'text-text-secondary hover:text-text-primary hover:bg-muted'
              }`}
            >
              <Icon name={item.icon} size={16} />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* Search Bar */}
        <div className="flex-1 max-w-md mx-4 lg:mx-8">
          <form onSubmit={handleSearch} className="relative">
            <Input
              type="search"
              placeholder="Search products, shops..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4"
            />
            <Icon
              name="Search"
              size={18}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary"
            />
          </form>
        </div>

        {/* Desktop Actions */}
        <div className="hidden lg:flex items-center space-x-4">
          <button
            onClick={() => setIsNotificationOpen(true)}
            className="relative p-2 text-text-secondary hover:text-text-primary transition-colors"
          >
            <Icon name="Bell" size={20} />
            {notificationCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-medium rounded-full w-5 h-5 flex items-center justify-center">
                {notificationCount}
              </span>
            )}
          </button>
          
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="p-2 text-text-secondary hover:text-text-primary transition-colors"
          >
            <Icon name="Settings" size={20} />
          </button>
          
          <Link
            to="/shopping-cart-checkout"
            className="relative p-2 text-text-secondary hover:text-text-primary transition-colors"
          >
            <Icon name="ShoppingCart" size={20} />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-accent text-accent-foreground text-xs font-medium rounded-full w-5 h-5 flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>
          
          <Button variant="ghost" iconName="User" iconPosition="left">
            Account
          </Button>
          
          <Button variant="default" iconName="Plus" iconPosition="left">
            Sell
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleMenu}
          className="lg:hidden"
        >
          <Icon name={isMenuOpen ? "X" : "Menu"} size={20} />
        </Button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden bg-surface border-t border-border animate-fade-in">
          <div className="px-4 py-4 space-y-4">
            {/* Mobile Navigation */}
            <nav className="space-y-2">
              {navigationItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`flex items-center space-x-3 px-3 py-3 rounded-md text-sm font-medium transition-colors ${
                    isActive(item.path)
                      ? 'text-primary bg-primary/10' :'text-text-secondary hover:text-text-primary hover:bg-muted'
                  }`}
                >
                  <Icon name={item.icon} size={18} />
                  <span>{item.label}</span>
                </Link>
              ))}
            </nav>

            {/* Mobile Actions */}
            <div className="pt-4 border-t border-border space-y-3">
              <button
                onClick={() => {
                  setIsNotificationOpen(true);
                  setIsMenuOpen(false);
                }}
                className="flex items-center justify-between px-3 py-3 rounded-md text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-muted transition-colors w-full"
              >
                <div className="flex items-center space-x-3">
                  <Icon name="Bell" size={18} />
                  <span>Notifications</span>
                </div>
                {notificationCount > 0 && (
                  <span className="bg-red-500 text-white text-xs font-medium rounded-full px-2 py-1">
                    {notificationCount}
                  </span>
                )}
              </button>
              
              <button
                onClick={() => {
                  setIsSettingsOpen(true);
                  setIsMenuOpen(false);
                }}
                className="flex items-center space-x-3 px-3 py-3 rounded-md text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-muted transition-colors w-full"
              >
                <Icon name="Settings" size={18} />
                <span>Settings</span>
              </button>
              
              <Link
                to="/shopping-cart-checkout"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center justify-between px-3 py-3 rounded-md text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-muted transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <Icon name="ShoppingCart" size={18} />
                  <span>Cart</span>
                </div>
                {cartCount > 0 && (
                  <span className="bg-accent text-accent-foreground text-xs font-medium rounded-full px-2 py-1">
                    {cartCount}
                  </span>
                )}
              </Link>
              
              <Button
                variant="ghost"
                fullWidth
                iconName="User"
                iconPosition="left"
                onClick={() => setIsMenuOpen(false)}
              >
                Account
              </Button>
              
              <Button
                variant="default"
                fullWidth
                iconName="Plus"
                iconPosition="left"
                onClick={() => setIsMenuOpen(false)}
              >
                Start Selling
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Notification Overlay */}
      <NotificationOverlay
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
      />
      
      {/* Settings Overlay */}
      <SettingsOverlay
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </header>
  );
};

export default Header;