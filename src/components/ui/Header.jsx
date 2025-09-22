import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Icon from '../AppIcon';
import Button from './Button';
import Input from './Input';
import NotificationBell from './NotificationBell';
import NavigationSection from './NavigationSection';
import { useAuth } from '../../contexts/AuthContext';
import { useWishlist } from '../../contexts/WishlistContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { useLanguage } from '../../contexts/LanguageContext';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [cartCount, setCartCount] = useState(0);
  const [cartAnimating, setCartAnimating] = useState(false);
  const [notificationAnimating, setNotificationAnimating] = useState(false);
  const [userProfileImage, setUserProfileImage] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { getWishlistCount } = useWishlist();
  const { unreadCount } = useNotifications();
  const { t } = useLanguage();

  // Move useRef to top level of component
  const prevUnreadCount = useRef(unreadCount);
  
  // Safety check for wishlist count
  const wishlistCount = getWishlistCount ? getWishlistCount() : 0;

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

  // Update cart count, notifications, and profile image from localStorage
  useEffect(() => {
    const updateCartCount = () => {
      const count = localStorage.getItem('cartItemCount');
      const newCount = count ? parseInt(count) : 0;
      const prevCount = cartCount;
      
      if (newCount > prevCount && prevCount > 0) {
        setCartAnimating(true);
        setTimeout(() => setCartAnimating(false), 1000);
      }
      
      setCartCount(newCount);
    };

    // Animation for notification count changes
    if (unreadCount > prevUnreadCount.current && prevUnreadCount.current >= 0) {
      setNotificationAnimating(true);
      setTimeout(() => setNotificationAnimating(false), 1000);
    }
    prevUnreadCount.current = unreadCount;

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
    
    // Custom events
    window.addEventListener('cartUpdated', updateCartCount);
    window.addEventListener('profileImageUpdated', updateProfileImage);
    
    return () => {
      window.removeEventListener('storage', updateCartCount);
      window.removeEventListener('storage', updateProfileImage);
      window.removeEventListener('cartUpdated', updateCartCount);
      window.removeEventListener('profileImageUpdated', updateProfileImage);
    };
  }, [user, cartCount, unreadCount]);

  const isActive = (path) => location.pathname === path;

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
    <>
    <header className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-b border-white/20 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Identity - Clean */}
          <Link to="/" className="flex items-center space-x-3 flex-shrink-0 group">
            <Icon name="Package" size={24} className="text-teal-600 group-hover:text-teal-700 transition-colors duration-200" />
            <span className="text-xl font-semibold text-gray-900 tracking-tight">IziShopin</span>
          </Link>

          {/* Desktop Search - Stripe/Linear inspired */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Icon name="Search" size={16} className="text-gray-400" />
              </div>
              <input
                type="search"
                placeholder="Search products, shops, brands..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch(e)}
                className="w-full pl-12 pr-4 py-3 bg-gray-50/80 backdrop-blur-sm border border-gray-200/50 rounded-xl text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500/50 transition-all duration-200 shadow-sm"
              />
            </div>
          </div>

          {/* Desktop Actions - Linear/Notion inspired */}
          <div className="hidden md:flex items-center space-x-2">
            {/* Wishlist */}
            <Link 
              to="/wishlist" 
              className="p-2.5 text-gray-600 hover:text-red-500 transition-colors duration-200 relative group"
            >
              <Icon name="Heart" size={20} className="group-hover:scale-110 transition-transform duration-200" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-medium rounded-full w-5 h-5 flex items-center justify-center">
                  {wishlistCount > 99 ? '99+' : wishlistCount}
                </span>
              )}
            </Link>

            {/* Notifications */}
            {isAuthenticated() && (
              <Link 
                to="/notifications" 
                className="p-2.5 text-gray-600 hover:text-amber-600 transition-colors duration-200 relative group"
              >
                <Icon name="Bell" size={20} className="group-hover:scale-110 transition-transform duration-200" />
                {unreadCount > 0 && (
                  <span className={`absolute -top-1 -right-1 bg-amber-500 text-white text-xs font-medium rounded-full w-5 h-5 flex items-center justify-center ${notificationAnimating ? 'animate-pulse' : ''}`}>
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </Link>
            )}

            {/* Cart */}
            <Link 
              to="/shopping-cart" 
              className="p-2.5 text-gray-600 hover:text-teal-600 transition-colors duration-200 relative group"
            >
              <Icon name="ShoppingCart" size={20} className="group-hover:scale-110 transition-transform duration-200" />
              {cartCount > 0 && (
                <span className={`absolute -top-1 -right-1 bg-teal-500 text-white text-xs font-medium rounded-full w-5 h-5 flex items-center justify-center ${cartAnimating ? 'animate-pulse' : ''}`}>
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </Link>

            {/* User Profile */}
            {isAuthenticated() ? (
              <div className="relative ml-2">
                <button 
                  onClick={toggleMenu}
                  className="w-9 h-9 rounded-lg bg-gradient-to-br from-gray-100/80 to-gray-200/80 backdrop-blur-sm hover:from-gray-200/90 hover:to-gray-300/90 flex items-center justify-center overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 border border-gray-200/50"
                >
                  {userProfileImage ? (
                    <img 
                      src={userProfileImage} 
                      alt="Profile" 
                      className="w-full h-full rounded-lg object-cover"
                    />
                  ) : (
                    <span className="text-sm font-medium text-gray-700">
                      {user?.first_name?.[0]?.toUpperCase() || 'U'}
                    </span>
                  )}
                </button>
                
                {/* Professional Dropdown */}
                {isMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white/95 backdrop-blur-xl border border-white/20 rounded-xl shadow-xl z-50 overflow-hidden">
                    {/* User Info Header */}
                    <div className="px-4 py-4 bg-gradient-to-r from-gray-50/80 to-gray-100/80 backdrop-blur-sm border-b border-white/20">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center overflow-hidden shadow-sm">
                          {userProfileImage ? (
                            <img 
                              src={userProfileImage} 
                              alt="Profile" 
                              className="w-full h-full rounded-lg object-cover"
                            />
                          ) : (
                            <span className="text-sm font-medium text-white">
                              {user?.first_name?.[0]?.toUpperCase() || 'U'}
                            </span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {user?.first_name} {user?.last_name}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {user?.email}
                          </p>
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-teal-100 text-teal-800 mt-1">
                            {user?.role === 'SHOP_OWNER' ? 'Shop Owner' : user?.role === 'ADMIN' ? 'Administrator' : 'Customer'}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Menu Items */}
                    <div className="py-2">
                      <button
                        onClick={() => {
                          setIsMenuOpen(false);
                          navigate('/user-profile');
                        }}
                        className="flex items-center w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50/80 backdrop-blur-sm transition-colors duration-150"
                      >
                        <Icon name="User" size={16} className="mr-3 text-gray-400" />
                        My Profile
                      </button>
                      
                      {(user?.role === 'SHOP_OWNER' || user?.role === 'shop_owner') && (
                        <>
                          <button
                            onClick={() => {
                              setIsMenuOpen(false);
                              navigate('/shop-owner-dashboard');
                            }}
                            className="flex items-center w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50/80 backdrop-blur-sm transition-colors duration-150"
                          >
                            <Icon name="LayoutDashboard" size={16} className="mr-3 text-gray-400" />
                            Shop Dashboard
                          </button>
                          <button
                            onClick={() => {
                              setIsMenuOpen(false);
                              navigate('/add-product');
                            }}
                            className="flex items-center w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50/80 backdrop-blur-sm transition-colors duration-150"
                          >
                            <Icon name="Plus" size={16} className="mr-3 text-gray-400" />
                            Add Product
                          </button>
                        </>
                      )}
                      
                      <button
                        onClick={() => {
                          setIsMenuOpen(false);
                          navigate('/order-management');
                        }}
                        className="flex items-center w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50/80 backdrop-blur-sm transition-colors duration-150"
                      >
                        <Icon name="Package" size={16} className="mr-3 text-gray-400" />
                        My Orders
                      </button>
                      
                      <div className="border-t border-gray-100 my-2"></div>
                      
                      <button
                        onClick={() => {
                          setIsMenuOpen(false);
                          navigate('/settings');
                        }}
                        className="flex items-center w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50/80 backdrop-blur-sm transition-colors duration-150"
                      >
                        <Icon name="Settings" size={16} className="mr-3 text-gray-400" />
                        Settings
                      </button>
                      
                      <button
                        onClick={() => {
                          setIsMenuOpen(false);
                          localStorage.removeItem('authToken');
                          localStorage.removeItem('user');
                          navigate('/authentication-login-register');
                        }}
                        className="flex items-center w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50/80 backdrop-blur-sm transition-colors duration-150"
                      >
                        <Icon name="LogOut" size={16} className="mr-3 text-red-400" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Button 
                variant="default" 
                size="sm"
                onClick={() => navigate('/authentication-login-register')}
                className="ml-2 bg-teal-600 hover:bg-teal-700 text-white border-0 shadow-sm px-4 py-2 text-sm font-medium"
              >
                Sign In
              </Button>
            )}
          </div>

          {/* Mobile Actions */}
          <div className="flex md:hidden items-center space-x-2">
            {/* Mobile Search Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {/* Mobile search toggle */}}
              className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <Icon name="Search" size={18} />
            </Button>

            {/* Mobile Cart */}
            <Link 
              to="/shopping-cart" 
              className="p-2 text-gray-600 hover:text-teal-600 transition-colors relative"
            >
              <Icon name="ShoppingCart" size={18} />
              {cartCount > 0 && (
                <span className={`absolute -top-1 -right-1 bg-teal-500 text-white text-xs font-medium rounded-full w-4 h-4 flex items-center justify-center ${cartAnimating ? 'animate-pulse' : ''}`}>
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </Link>

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMenu}
              className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <Icon name={isMenuOpen ? "X" : "Menu"} size={18} />
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu - Professional Design */}
      {isMenuOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-xl border-t border-white/20 shadow-xl">
          <div className="px-4 py-6 space-y-6">
            {/* Mobile Search - Apple iOS inspired */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Icon name="Search" size={16} className="text-gray-400" />
              </div>
              <input
                type="search"
                placeholder="Search products, shops, brands..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch(e)}
                className="w-full pl-12 pr-4 py-3 bg-gray-50/80 backdrop-blur-sm border border-gray-200/50 rounded-xl text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500/50 transition-all duration-200 shadow-sm"
              />
            </div>

            {/* Navigation Links from NavigationSection */}
            <nav className="space-y-1">
              <Link
                to="/product-catalog"
                onClick={() => setIsMenuOpen(false)}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive('/product-catalog')
                    ? 'text-teal-700 bg-teal-50/80 backdrop-blur-sm border border-teal-200/50' 
                    : 'text-gray-700 hover:bg-gray-50/80 backdrop-blur-sm hover:text-gray-900'
                }`}
              >
                <Icon name="Package" size={18} className="text-gray-500" />
                <span>Products</span>
              </Link>
              <Link
                to="/shops-listing"
                onClick={() => setIsMenuOpen(false)}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive('/shops-listing')
                    ? 'text-teal-700 bg-teal-50/80 backdrop-blur-sm border border-teal-200/50' 
                    : 'text-gray-700 hover:bg-gray-50/80 backdrop-blur-sm hover:text-gray-900'
                }`}
              >
                <Icon name="Store" size={18} className="text-gray-500" />
                <span>Shops</span>
              </Link>
              <Link
                to="/casual-marketplace"
                onClick={() => setIsMenuOpen(false)}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive('/casual-marketplace')
                    ? 'text-teal-700 bg-teal-50/80 backdrop-blur-sm border border-teal-200/50' 
                    : 'text-gray-700 hover:bg-gray-50/80 backdrop-blur-sm hover:text-gray-900'
                }`}
              >
                <Icon name="ShoppingBag" size={18} className="text-gray-500" />
                <span>Marketplace</span>
              </Link>
              
              <Link
                to="/my-orders"
                onClick={() => setIsMenuOpen(false)}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive('/my-orders')
                    ? 'text-teal-700 bg-teal-50/80 backdrop-blur-sm border border-teal-200/50' 
                    : 'text-gray-700 hover:bg-gray-50/80 backdrop-blur-sm hover:text-gray-900'
                }`}
              >
                <Icon name="Package" size={18} className="text-gray-500" />
                <span>My Orders</span>
              </Link>
              
              <Link
                to="/customer-support"
                onClick={() => setIsMenuOpen(false)}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive('/customer-support')
                    ? 'text-teal-700 bg-teal-50/80 backdrop-blur-sm border border-teal-200/50' 
                    : 'text-gray-700 hover:bg-gray-50/80 backdrop-blur-sm hover:text-gray-900'
                }`}
              >
                <Icon name="User" size={18} className="text-gray-500" />
                <span>Support</span>
              </Link>
              
              <Link
                to="/create-shop"
                onClick={() => setIsMenuOpen(false)}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive('/create-shop')
                    ? 'text-teal-700 bg-teal-50/80 backdrop-blur-sm border border-teal-200/50' 
                    : 'text-gray-700 hover:bg-gray-50/80 backdrop-blur-sm hover:text-gray-900'
                }`}
              >
                <Icon name="Store" size={18} className="text-gray-500" />
                <span>Sell on IziShopin</span>
              </Link>
            </nav>

            {/* User Actions */}
            <div className="pt-4 border-t border-gray-200 space-y-1">
              {/* Notifications */}
              {isAuthenticated() && (
                <Link
                  to="/notifications"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50/80 backdrop-blur-sm hover:text-gray-900 transition-all duration-200"
                >
                  <div className="flex items-center space-x-3">
                    <Icon name="Bell" size={18} className="text-gray-500" />
                    <span>Notifications</span>
                  </div>
                  {unreadCount > 0 && (
                    <span className="bg-amber-500 text-white text-xs font-medium rounded-full px-2 py-1 shadow-sm">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </Link>
              )}
              
              {/* Wishlist */}
              <Link
                to="/wishlist"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-all duration-200"
              >
                <div className="flex items-center space-x-3">
                  <Icon name="Heart" size={18} className="text-gray-500" />
                  <span>Wishlist</span>
                </div>
                {wishlistCount > 0 && (
                  <span className="bg-red-500 text-white text-xs font-medium rounded-full px-2 py-1 shadow-sm">
                    {wishlistCount}
                  </span>
                )}
              </Link>
              
              {/* Account Section */}
              {isAuthenticated() ? (
                <div className="border-t border-gray-200 pt-4 space-y-1">
                  {/* User Info Card */}
                  <div className="px-4 py-4 bg-gradient-to-r from-gray-50/80 to-gray-100/80 backdrop-blur-sm rounded-xl border border-white/20">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center overflow-hidden shadow-sm">
                        {userProfileImage ? (
                          <img 
                            src={userProfileImage} 
                            alt="Profile" 
                            className="w-full h-full rounded-lg object-cover"
                          />
                        ) : (
                          <span className="text-sm font-medium text-white">
                            {user?.first_name?.[0]?.toUpperCase() || 'U'}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {user?.first_name} {user?.last_name}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {user?.email}
                        </p>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-teal-100 text-teal-800 mt-1">
                          {user?.role === 'SHOP_OWNER' ? 'Shop Owner' : user?.role === 'ADMIN' ? 'Administrator' : 'Customer'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Profile Actions */}
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      navigate('/user-profile');
                    }}
                    className="flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50/80 backdrop-blur-sm hover:text-gray-900 transition-all duration-200 w-full"
                  >
                    <Icon name="User" size={18} className="text-gray-500" />
                    <span>My Profile</span>
                  </button>
                  
                  {(user?.role === 'SHOP_OWNER' || user?.role === 'shop_owner') && (
                    <>
                      <button
                        onClick={() => {
                          setIsMenuOpen(false);
                          navigate('/shop-owner-dashboard');
                        }}
                        className="flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50/80 backdrop-blur-sm hover:text-gray-900 transition-all duration-200 w-full"
                      >
                        <Icon name="LayoutDashboard" size={18} className="text-gray-500" />
                        <span>Shop Dashboard</span>
                      </button>
                      <button
                        onClick={() => {
                          setIsMenuOpen(false);
                          navigate('/add-product');
                        }}
                        className="flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50/80 backdrop-blur-sm hover:text-gray-900 transition-all duration-200 w-full"
                      >
                        <Icon name="Plus" size={18} className="text-gray-500" />
                        <span>Add Product</span>
                      </button>
                    </>
                  )}
                  
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      navigate('/order-management');
                    }}
                    className="flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50/80 backdrop-blur-sm hover:text-gray-900 transition-all duration-200 w-full"
                  >
                    <Icon name="Package" size={18} className="text-gray-500" />
                    <span>My Orders</span>
                  </button>
                  
                  <div className="border-t border-gray-200 my-2"></div>
                  
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      navigate('/settings');
                    }}
                    className="flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50/80 backdrop-blur-sm hover:text-gray-900 transition-all duration-200 w-full"
                  >
                    <Icon name="Settings" size={18} className="text-gray-500" />
                    <span>Settings</span>
                  </button>
                  
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      localStorage.removeItem('authToken');
                      localStorage.removeItem('user');
                      navigate('/authentication-login-register');
                    }}
                    className="flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50/80 backdrop-blur-sm transition-all duration-200 w-full"
                  >
                    <Icon name="LogOut" size={18} className="text-red-500" />
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
                  className="bg-teal-600 hover:bg-teal-700 text-white border-0 shadow-sm py-3 font-medium"
                >
                  Get Started
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
    
    {/* Navigation Section */}
    <NavigationSection />
    </>
  );
};

export default Header;