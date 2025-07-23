import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Icon from '../AppIcon';
import Button from './Button';
import Input from './Input';
import NotificationOverlay from './NotificationOverlay';
import SettingsOverlay from './SettingsOverlay';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [cartCount, setCartCount] = useState(0);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [userProfileImage, setUserProfileImage] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { unreadCount } = useNotifications();

  // Determine dashboard path for admin/shop owner with safe fallbacks
  let dashboardPath = null;
  try {
    if (user?.role === 'ADMIN' || user?.role === 'admin') {
      dashboardPath = '/admin-dashboard';
    } else if (user?.role === 'SHOP_OWNER' || user?.role === 'shop_owner') {
      dashboardPath = '/shop-owner-dashboard';
    }
  } catch (error) {
    console.error('Error determining dashboard path:', error);
    dashboardPath = null;
  }

  // Update cart count and profile image from localStorage
  useEffect(() => {
    const updateCartCount = () => {
      const count = localStorage.getItem('cartItemCount');
      setCartCount(count ? parseInt(count) : 0);
    };

    const updateProfileImage = () => {
      if (user?.id) {
        const savedImage = localStorage.getItem(`profile_image_${user.id}`);
        setUserProfileImage(savedImage || user.profile_image_url || null);
      }
    };

    updateCartCount();
    updateProfileImage();
    
    // Listen for storage changes
    window.addEventListener('storage', updateCartCount);
    window.addEventListener('storage', updateProfileImage);
    
    // Custom event for cart updates
    window.addEventListener('cartUpdated', updateCartCount);
    
    // Custom event for profile image updates
    window.addEventListener('profileImageUpdated', updateProfileImage);
    
    return () => {
      window.removeEventListener('storage', updateCartCount);
      window.removeEventListener('storage', updateProfileImage);
      window.removeEventListener('cartUpdated', updateCartCount);
      window.removeEventListener('profileImageUpdated', updateProfileImage);
    };
  }, [user]);

  const isActive = (path) => location.pathname === path;

  // Simplified navigation items
  const getNavigationItems = () => {
    return [
      { label: 'Products', path: '/product-catalog', icon: 'Package' },
      { label: 'Shops', path: '/shops-listing', icon: 'Store' },
    ];
  };

  const navigationItems = getNavigationItems();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to product catalog with search query
      navigate(`/product-catalog?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery(''); // Clear search after submitting
    }
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
        <div className="hidden lg:flex items-center space-x-3">
          <button
            onClick={() => setIsNotificationOpen(true)}
            className="relative p-2 text-text-secondary hover:text-text-primary transition-colors"
          >
            <Icon name="Bell" size={20} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-medium rounded-full w-5 h-5 flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>
          
          <Link
            to="/shopping-cart"
            className="relative p-2 text-text-secondary hover:text-text-primary transition-colors"
          >
            <Icon name="ShoppingCart" size={20} />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-accent text-accent-foreground text-xs font-medium rounded-full w-5 h-5 flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>
          
          {/* Account Button with Profile Picture */}
          {isAuthenticated() ? (
            <button
              onClick={() => navigate('/user-profile')}
              className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center overflow-hidden">
                {userProfileImage ? (
                  <img 
                    src={userProfileImage} 
                    alt="Profile" 
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <span className="text-xs font-bold text-white">
                    {user?.first_name?.[0]?.toUpperCase() || 'U'}
                  </span>
                )}
              </div>
            </button>
          ) : (
            <Button 
              variant="ghost" 
              iconName="User" 
              size="sm"
              onClick={() => navigate('/authentication-login-register')}
            >
              Sign In
            </Button>
          )}
          
          <Button 
            variant="default" 
            iconName="Plus" 
            size="sm"
            onClick={() => {
              if (isAuthenticated()) {
                if (user?.role === 'SHOP_OWNER' || user?.role === 'shop_owner') {
                  navigate('/shop-owner-dashboard');
                } else {
                  navigate('/shops-listing');
                }
              } else {
                navigate('/authentication-login-register');
              }
            }}
          >
            Get Started
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
                {unreadCount > 0 && (
                  <span className="bg-red-500 text-white text-xs font-medium rounded-full px-2 py-1">
                    {unreadCount}
                  </span>
                )}
              </button>
              
              <Link
                to="/shopping-cart"
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
              
              {/* Mobile Account Button with Profile Picture */}
              {isAuthenticated() ? (
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    navigate('/user-profile');
                  }}
                  className="flex items-center space-x-3 px-3 py-3 rounded-md text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-muted transition-colors w-full"
                >
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center overflow-hidden">
                    {userProfileImage ? (
                      <img 
                        src={userProfileImage} 
                        alt="Profile" 
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-xs font-bold text-white">
                        {user?.first_name?.[0]?.toUpperCase() || 'U'}
                      </span>
                    )}
                  </div>
                  <span>Account</span>
                </button>
              ) : (
                <Button
                  variant="ghost"
                  fullWidth
                  iconName="User"
                  iconPosition="left"
                  onClick={() => {
                    setIsMenuOpen(false);
                    navigate('/authentication-login-register');
                  }}
                >
                  Sign In
                </Button>
              )}
              
              <Button
                variant="default"
                fullWidth
                iconName="Plus"
                iconPosition="left"
                onClick={() => {
                  setIsMenuOpen(false);
                  if (isAuthenticated()) {
                    if (user?.role === 'SHOP_OWNER' || user?.role === 'shop_owner') {
                      navigate('/shop-owner-dashboard');
                    } else {
                      navigate('/shops-listing');
                    }
                  } else {
                    navigate('/authentication-login-register');
                  }
                }}
              >
                Get Started
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