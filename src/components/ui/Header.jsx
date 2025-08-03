import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Icon from '../AppIcon';
import Button from './Button';
import Input from './Input';
import NotificationBell from './NotificationBell';
import SettingsOverlay from './SettingsOverlay';
import { useAuth } from '../../contexts/AuthContext';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [cartCount, setCartCount] = useState(0);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [userProfileImage, setUserProfileImage] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

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
      <div className="flex items-center justify-between h-16 px-3 sm:px-4 lg:px-6">
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
        <div className="hidden sm:flex flex-1 max-w-md mx-2 sm:mx-4 lg:mx-8">
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
        <div className="hidden sm:flex items-center space-x-2 lg:space-x-3">
          {/* Only show notification bell for authenticated users */}
          {isAuthenticated() && (
            <NotificationBell variant="header" size={20} />
          )}
          
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
            <div className="relative group">
              <button className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded-lg transition-colors">
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
                <Icon name="ChevronDown" size={16} className="text-gray-500" />
              </button>
              
              {/* Dropdown Menu */}
              <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="py-2">
                  {/* User Info */}
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">{user?.first_name} {user?.last_name}</p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                    <p className="text-xs text-blue-600 mt-1">{user?.role === 'SHOP_OWNER' ? 'Shop Owner' : user?.role === 'ADMIN' ? 'Administrator' : 'Customer'}</p>
                  </div>
                  
                  {/* Quick Actions */}
                  <div className="py-1">
                    <button
                      onClick={() => navigate('/user-profile')}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <Icon name="User" size={16} className="mr-3 text-gray-500" />
                      My Profile
                    </button>
                    
                    {(user?.role === 'SHOP_OWNER' || user?.role === 'shop_owner') && (
                      <>
                        <button
                          onClick={() => navigate('/shop-owner-dashboard')}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <Icon name="LayoutDashboard" size={16} className="mr-3 text-gray-500" />
                          Shop Dashboard
                        </button>
                        <button
                          onClick={() => navigate('/my-shop-profile')}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <Icon name="Store" size={16} className="mr-3 text-gray-500" />
                          My Shop
                        </button>
                        <button
                          onClick={() => navigate('/add-product')}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <Icon name="Plus" size={16} className="mr-3 text-gray-500" />
                          Add Product
                        </button>
                      </>
                    )}
                    
                    {user?.role === 'ADMIN' && (
                      <button
                        onClick={() => navigate('/admin-dashboard')}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <Icon name="Shield" size={16} className="mr-3 text-gray-500" />
                        Admin Dashboard
                      </button>
                    )}
                    
                    <button
                      onClick={() => navigate('/order-management')}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <Icon name="Package" size={16} className="mr-3 text-gray-500" />
                      My Orders
                    </button>
                    
                    <button
                      onClick={() => navigate('/wishlist')}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <Icon name="Heart" size={16} className="mr-3 text-gray-500" />
                      Wishlist
                    </button>
                    
                    <div className="border-t border-gray-100 my-1"></div>
                    
                    <button
                      onClick={() => setIsSettingsOpen(true)}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <Icon name="Settings" size={16} className="mr-3 text-gray-500" />
                      Settings
                    </button>
                    
                    <button
                      onClick={() => {
                        localStorage.removeItem('authToken');
                        localStorage.removeItem('user');
                        navigate('/authentication-login-register');
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <Icon name="LogOut" size={16} className="mr-3 text-red-500" />
                      Sign Out
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <Button 
              variant="default" 
              iconName="Plus" 
              size="sm"
              onClick={() => navigate('/authentication-login-register')}
            >
              Get Started
            </Button>
          )}
        </div>

        {/* Mobile Search and Menu */}
        <div className="flex items-center space-x-2 sm:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {/* Mobile search toggle */}}
            className="p-2"
          >
            <Icon name="Search" size={18} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleMenu}
            className="p-2"
          >
            <Icon name={isMenuOpen ? "X" : "Menu"} size={18} />
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="sm:hidden bg-surface border-t border-border animate-fade-in">
          <div className="px-3 py-4 space-y-3">
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
              {/* Only show notification bell for authenticated users */}
              {isAuthenticated() && (
                <div className="flex items-center justify-between px-3 py-3 rounded-md text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-muted transition-colors w-full">
                  <div className="flex items-center space-x-3">
                    <NotificationBell 
                      variant="mobile" 
                      size={18} 
                      onClick={() => setIsMenuOpen(false)}
                      className="p-0"
                    />
                  <span>Notifications</span>
                </div>
              </div>
              )}
              
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
              
              {/* Mobile Account Section */}
              {isAuthenticated() ? (
                <div className="border-t border-gray-200 pt-4">
                  <div className="px-3 py-2 border-b border-gray-100 mb-2">
                    <div className="flex items-center space-x-3">
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
                      <div>
                        <p className="text-sm font-medium text-gray-900">{user?.first_name} {user?.last_name}</p>
                        <p className="text-xs text-gray-500">{user?.role === 'SHOP_OWNER' ? 'Shop Owner' : user?.role === 'ADMIN' ? 'Administrator' : 'Customer'}</p>
                      </div>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      navigate('/user-profile');
                    }}
                    className="flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-muted transition-colors w-full"
                  >
                    <Icon name="User" size={16} />
                    <span>My Profile</span>
                  </button>
                  
                  {(user?.role === 'SHOP_OWNER' || user?.role === 'shop_owner') && (
                    <>
                      <button
                        onClick={() => {
                          setIsMenuOpen(false);
                          navigate('/shop-owner-dashboard');
                        }}
                        className="flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-muted transition-colors w-full"
                      >
                        <Icon name="LayoutDashboard" size={16} />
                        <span>Shop Dashboard</span>
                      </button>
                      <button
                        onClick={() => {
                          setIsMenuOpen(false);
                          navigate('/add-product');
                        }}
                        className="flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-muted transition-colors w-full"
                      >
                        <Icon name="Plus" size={16} />
                        <span>Add Product</span>
                      </button>
                    </>
                  )}
                  
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      navigate('/order-management');
                    }}
                    className="flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-muted transition-colors w-full"
                  >
                    <Icon name="Package" size={16} />
                    <span>My Orders</span>
                  </button>
                  
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      localStorage.removeItem('authToken');
                      localStorage.removeItem('user');
                      navigate('/authentication-login-register');
                    }}
                    className="flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium text-red-600 hover:bg-red-50 transition-colors w-full"
                  >
                    <Icon name="LogOut" size={16} />
                    <span>Sign Out</span>
                  </button>
                </div>
              ) : (
                <Button
                  variant="default"
                  fullWidth
                  iconName="Plus"
                  iconPosition="left"
                  onClick={() => {
                    setIsMenuOpen(false);
                    navigate('/authentication-login-register');
                  }}
                >
                  Get Started
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Settings Overlay */}
      <SettingsOverlay
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </header>
  );
};

export default Header;