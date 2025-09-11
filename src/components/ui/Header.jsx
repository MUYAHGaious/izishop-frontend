import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Icon from '../AppIcon';
import Button from './Button';
import Input from './Input';
import NotificationBell from './NotificationBell';
import { useAuth } from '../../contexts/AuthContext';
import { useWishlist } from '../../contexts/WishlistContext';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [cartCount, setCartCount] = useState(0);
  const [notificationCount, setNotificationCount] = useState(0);
  const [cartAnimating, setCartAnimating] = useState(false);
  const [notificationAnimating, setNotificationAnimating] = useState(false);
  const [userProfileImage, setUserProfileImage] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { getWishlistCount } = useWishlist();
  
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

    const updateNotificationCount = () => {
      const count = localStorage.getItem('notificationCount');
      const newCount = count ? parseInt(count) : 0;
      const prevCount = notificationCount;
      
      if (newCount > prevCount && prevCount >= 0) {
        setNotificationAnimating(true);
        setTimeout(() => setNotificationAnimating(false), 1000);
      }
      
      setNotificationCount(newCount);
    };

    const updateProfileImage = () => {
      if (user?.id) {
        const savedImage = localStorage.getItem(`profile_image_${user.id}`);
        setUserProfileImage(savedImage || user.profile_image_url || null);
      }
    };

    updateCartCount();
    updateNotificationCount();
    updateProfileImage();
    
    // Listen for storage changes
    window.addEventListener('storage', updateCartCount);
    window.addEventListener('storage', updateNotificationCount);
    window.addEventListener('storage', updateProfileImage);
    
    // Custom events
    window.addEventListener('cartUpdated', updateCartCount);
    window.addEventListener('notificationUpdated', updateNotificationCount);
    window.addEventListener('profileImageUpdated', updateProfileImage);
    
    return () => {
      window.removeEventListener('storage', updateCartCount);
      window.removeEventListener('storage', updateNotificationCount);
      window.removeEventListener('storage', updateProfileImage);
      window.removeEventListener('cartUpdated', updateCartCount);
      window.removeEventListener('notificationUpdated', updateNotificationCount);
      window.removeEventListener('profileImageUpdated', updateProfileImage);
    };
  }, [user, cartCount, notificationCount]);

  const isActive = (path) => location.pathname === path;

  // Simplified navigation items
  const getNavigationItems = () => {
    return [
      { label: 'Products', path: '/product-catalog', icon: 'Package' },
      { label: 'Shops', path: '/shops-listing', icon: 'Store' },
      { label: 'Marketplace', path: '/casual-marketplace', icon: 'ShoppingBag' },
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
    <header className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-b border-white/20 z-50 shadow-sm">
      <div className="flex items-center justify-between h-18 px-6 lg:px-8">
        {/* Company Logo */}
        <Link to="/" className="flex items-center space-x-3 flex-shrink-0">
          <Icon name="Package" size={28} className="text-teal-600" />
          <span className="text-2xl font-bold text-gray-900 hidden sm:block">IziShopin</span>
        </Link>

        {/* Simplified Desktop Navigation */}
        <nav className="hidden lg:flex items-center space-x-6">
          <Link
            to="/product-catalog"
            className={`text-sm font-medium transition-colors hover:text-teal-600 ${
              isActive('/product-catalog') ? 'text-teal-600' : 'text-gray-700'
            }`}
          >
            Products
          </Link>
          <Link
            to="/shops-listing"
            className={`text-sm font-medium transition-colors hover:text-teal-600 ${
              isActive('/shops-listing') ? 'text-teal-600' : 'text-gray-700'
            }`}
          >
            Shops
          </Link>
          <Link
            to="/casual-marketplace"
            className={`text-sm font-medium transition-colors hover:text-teal-600 ${
              isActive('/casual-marketplace') ? 'text-teal-600' : 'text-gray-700'
            }`}
          >
            Marketplace
          </Link>
        </nav>

        {/* Search Bar */}
        <div className="flex-1 max-w-lg mx-8">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Icon name="Search" size={18} className="text-gray-400" />
            </div>
            <input
              type="search"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-100/80 backdrop-blur-sm border-0 rounded-2xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
            />
            <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
              <button className="p-1.5 bg-gray-900 rounded-xl hover:bg-gray-800 transition-colors">
                <Icon name="Search" size={14} className="text-white" />
              </button>
            </div>
          </div>
        </div>

        {/* Simplified Right Section */}
        <div className="flex items-center space-x-4">
          {/* Wishlist Icon Only */}
          <Link to="/wishlist" className="p-2 hover:bg-gray-100/50 rounded-xl transition-colors relative">
            <Icon name="Heart" size={20} className="text-red-500" />
            {wishlistCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {wishlistCount}
              </span>
            )}
          </Link>

          {/* Bell Icon */}
          <Link to="/notifications" className="p-2 hover:bg-gray-100/50 rounded-xl transition-colors relative">
            <Icon name="Bell" size={20} className="text-amber-600" />
            {notificationCount > 0 && (
              <span className={`absolute -top-1 -right-1 bg-amber-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center ${notificationAnimating ? 'animate-bounce' : ''}`}>
                {notificationCount > 99 ? '99+' : notificationCount}
              </span>
            )}
          </Link>

          {/* Cart Icon */}
          <Link to="/shopping-cart" className="p-2 hover:bg-gray-100/50 rounded-xl transition-colors relative">
            <Icon name="ShoppingCart" size={20} className="text-teal-600" />
            {cartCount > 0 && (
              <span className={`absolute -top-1 -right-1 bg-teal-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center ${cartAnimating ? 'animate-bounce' : ''}`}>
                {cartCount > 99 ? '99+' : cartCount}
              </span>
            )}
          </Link>
            
            {/* User Avatar */}
            {isAuthenticated() ? (
              <div className="relative group">
                <button className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center overflow-hidden shadow-lg hover:shadow-xl transition-all">
                  {userProfileImage ? (
                    <img 
                      src={userProfileImage} 
                      alt="Profile" 
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-sm font-bold text-white">
                      {user?.first_name?.[0]?.toUpperCase() || 'U'}
                    </span>
                  )}
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
                      onClick={() => navigate('/settings')}
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
              className="bg-teal-500 hover:bg-teal-600 text-white border-0 shadow-sm"
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
              
              {/* Mobile Wishlist */}
              <Link
                to="/wishlist"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center justify-between px-3 py-3 rounded-md text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-muted transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <Icon name="Heart" size={18} />
                  <span>Wishlist</span>
                </div>
                {wishlistCount > 0 && (
                  <span className="bg-red-500 text-white text-xs font-medium rounded-full px-2 py-1">
                    {wishlistCount}
                  </span>
                )}
              </Link>
              
              {/* Mobile Cart */}
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
                  className="bg-teal-500 hover:bg-teal-600 text-white border-0 shadow-sm"
                >
                  Get Started
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;