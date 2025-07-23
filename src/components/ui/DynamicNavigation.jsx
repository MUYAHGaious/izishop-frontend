import React, { useState, useEffect, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Icon from '../AppIcon';
import Button from './Button';
import Input from './Input';
import NotificationOverlay from './NotificationOverlay';
import SettingsOverlay from './SettingsOverlay';
import UserMenu from './UserMenu';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';

const DynamicNavigation = ({ variant = 'default' }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [cartCount, setCartCount] = useState(0);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  
  const location = useLocation();
  const navigate = useNavigate();
  const { 
    isAuthenticated, 
    user, 
    logout, 
    isShopOwner, 
    isCustomer, 
    isCasualSeller, 
    isDeliveryAgent, 
    isAdmin 
  } = useAuth();

  // Role-based navigation configuration (memoized to prevent infinite re-renders)
  const navigationConfig = useMemo(() => {
    const baseItems = [
      { label: 'Home', path: '/', icon: 'Home', public: true },
      { label: 'Products', path: '/product-catalog', icon: 'Package', public: true },
      { label: 'Shops', path: '/shops-listing', icon: 'Store', public: true },
    ];

    if (!isAuthenticated()) {
      return { items: baseItems, dashboard: null };
    }

    let roleSpecificItems = [];
    let dashboardConfig = null;

    if (isShopOwner()) {
      dashboardConfig = {
        label: 'Shop Dashboard',
        path: '/shop-owner-dashboard',
        icon: 'LayoutDashboard'
      };
      roleSpecificItems = [
        { label: 'My Shop', path: '/my-shop-profile', icon: 'Store' },
        { label: 'Add Product', path: '/add-product', icon: 'Plus' },
        { label: 'Orders', path: '/order-management', icon: 'Package' },
      ];
    } else if (isCustomer()) {
      dashboardConfig = {
        label: 'Dashboard',
        path: '/customer-dashboard',
        icon: 'User'
      };
      roleSpecificItems = [
        { label: 'My Orders', path: '/order-management', icon: 'Package' },
        { label: 'Wishlist', path: '/wishlist', icon: 'Heart' },
      ];
    } else if (isCasualSeller()) {
      dashboardConfig = {
        label: 'Seller Dashboard',
        path: '/seller-dashboard',
        icon: 'ShoppingBag'
      };
      roleSpecificItems = [
        { label: 'My Products', path: '/my-products', icon: 'Package' },
        { label: 'Sales', path: '/sales', icon: 'TrendingUp' },
      ];
    } else if (isDeliveryAgent()) {
      dashboardConfig = {
        label: 'Delivery Dashboard',
        path: '/delivery-dashboard',
        icon: 'Truck'
      };
      roleSpecificItems = [
        { label: 'Active Deliveries', path: '/active-deliveries', icon: 'MapPin' },
        { label: 'Delivery History', path: '/delivery-history', icon: 'Clock' },
      ];
    } else if (isAdmin()) {
      dashboardConfig = {
        label: 'Admin Dashboard',
        path: '/admin-dashboard',
        icon: 'Shield'
      };
      roleSpecificItems = [
        { label: 'User Management', path: '/admin/users', icon: 'Users' },
        { label: 'Shop Management', path: '/admin/shops', icon: 'Store' },
        { label: 'System Settings', path: '/admin/settings', icon: 'Settings' },
      ];
    }

    return {
      items: [...baseItems, ...roleSpecificItems],
      dashboard: dashboardConfig
    };
  }, [isAuthenticated, isShopOwner, isCustomer, isCasualSeller, isDeliveryAgent, isAdmin]);

  // Use notification context for real-time notification data
  const { unreadCount, isLoading: notificationsLoading } = useNotifications();

  // Update cart count from localStorage
  useEffect(() => {
    const updateCartCount = () => {
      const count = localStorage.getItem('cartItemCount');
      setCartCount(count ? parseInt(count) : 0);
    };

    updateCartCount();
    
    // Listen for storage changes
    window.addEventListener('storage', updateCartCount);
    window.addEventListener('cartUpdated', updateCartCount);
    
    return () => {
      window.removeEventListener('storage', updateCartCount);
      window.removeEventListener('cartUpdated', updateCartCount);
    };
  }, []);

  const isActive = (path) => location.pathname === path;
  const { items: navigationItems, dashboard } = navigationConfig;

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/product-catalog?search=${encodeURIComponent(searchQuery)}`);
      setIsSearchExpanded(false);
    }
  };

  const handleLoginRedirect = () => {
    navigate('/authentication-login-register');
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const getUserInitials = () => {
    return user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';
  };

  const renderLogo = () => (
    <Link to="/" className="flex items-center space-x-2 flex-shrink-0">
      <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
        <Icon name="ShoppingBag" size={20} color="white" />
      </div>
      <span className="text-xl font-bold text-primary hidden sm:block">IziShop</span>
    </Link>
  );

  const renderSearchBar = () => (
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
  );

  const renderDesktopActions = () => (
    <div className="hidden lg:flex items-center space-x-4">
      {/* Dashboard Button */}
      {dashboard && (
        <Button
          variant="default"
          iconName={dashboard.icon}
          iconPosition="left"
          onClick={() => navigate(dashboard.path)}
          className="flex items-center space-x-2"
        >
          <span>{dashboard.label}</span>
        </Button>
      )}

      {/* Notifications */}
      <button
        onClick={() => setIsNotificationOpen(true)}
        className="relative p-2 text-text-secondary hover:text-text-primary transition-colors"
      >
        <Icon name="Bell" size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-medium rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>
      
      {/* Settings */}
      <button
        onClick={() => setIsSettingsOpen(true)}
        className="p-2 text-text-secondary hover:text-text-primary transition-colors"
      >
        <Icon name="Settings" size={20} />
      </button>
      
      {/* Cart */}
      <Link
        to="/shopping-cart"
        className="relative p-2 text-text-secondary hover:text-text-primary transition-colors"
      >
        <Icon name="ShoppingCart" size={20} />
        {cartCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-accent text-accent-foreground text-xs font-medium rounded-full w-5 h-5 flex items-center justify-center">
            {cartCount > 99 ? '99+' : cartCount}
          </span>
        )}
      </Link>
      
      {/* User Menu or Auth Buttons */}
      {isAuthenticated() ? (
        <UserMenu 
          user={user} 
          onLogout={handleLogout}
          userInitials={getUserInitials()}
        />
      ) : (
        <div className="flex items-center space-x-2">
          <Button variant="ghost" onClick={handleLoginRedirect}>
            Login
          </Button>
          <Button variant="default" onClick={handleLoginRedirect}>
            Sign Up
          </Button>
        </div>
      )}
    </div>
  );

  const renderMobileMenu = () => (
    isMenuOpen && (
      <div className="md:hidden bg-surface border-t border-border animate-fade-in">
        <div className="px-3 py-4 space-y-4 max-h-[calc(100vh-4rem)] overflow-y-auto">
          {/* Mobile Navigation */}
          <nav className="space-y-1">
            {navigationItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMenuOpen(false)}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  isActive(item.path)
                    ? 'text-primary bg-primary/10 border border-primary/20' 
                    : 'text-text-secondary hover:text-text-primary hover:bg-muted'
                }`}
              >
                <Icon name={item.icon} size={20} />
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>

          {/* Mobile Actions */}
          <div className="pt-3 border-t border-border space-y-3">
            {/* Dashboard Button */}
            {dashboard && (
              <Button
                variant="default"
                fullWidth
                iconName={dashboard.icon}
                iconPosition="left"
                onClick={() => {
                  navigate(dashboard.path);
                  setIsMenuOpen(false);
                }}
                className="justify-start px-4 py-3 text-sm"
              >
                {dashboard.label}
              </Button>
            )}

            {/* Sell Button - Mobile (Casual Sellers Only) */}
            {isAuthenticated() && isCasualSeller() && (
              <Button
                variant="outline"
                fullWidth
                iconName="Plus"
                iconPosition="left"
                onClick={() => {
                  navigate('/add-product');
                  setIsMenuOpen(false);
                }}
                className="justify-start px-4 py-3 text-sm border-accent text-accent hover:bg-accent/10"
              >
                Start Selling
              </Button>
            )}

            {/* Notifications - Mobile */}
            {isAuthenticated() && (
              <button
                onClick={() => {
                  setIsNotificationOpen(true);
                  setIsMenuOpen(false);
                }}
                className="flex items-center justify-between w-full px-4 py-3 rounded-lg text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-muted transition-colors"
                disabled={notificationsLoading}
              >
                <div className="flex items-center space-x-3">
                  <Icon name="Bell" size={20} />
                  <span>Notifications</span>
                  {notificationsLoading && (
                    <div className="w-2 h-2 bg-text-secondary rounded-full animate-pulse"></div>
                  )}
                </div>
                {notificationsLoading ? (
                  <span className="bg-gray-400 text-white text-xs font-medium rounded-full w-5 h-5 flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  </span>
                ) : unreadCount > 0 ? (
                  <span className="bg-red-500 text-white text-xs font-medium rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                ) : null}
              </button>
            )}

            {/* Settings - Mobile */}
            {isAuthenticated() && (
              <button
                onClick={() => {
                  setIsSettingsOpen(true);
                  setIsMenuOpen(false);
                }}
                className="flex items-center w-full px-4 py-3 rounded-lg text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-muted transition-colors"
              >
                <Icon name="Settings" size={20} />
                <span className="ml-3">Settings</span>
              </button>
            )}

            {/* Mobile Auth Buttons */}
            {!isAuthenticated() && (
              <div className="space-y-2">
                <Button
                  variant="outline"
                  fullWidth
                  onClick={() => {
                    handleLoginRedirect();
                    setIsMenuOpen(false);
                  }}
                  className="py-3 text-sm"
                >
                  Sign In
                </Button>
                <Button
                  variant="default"
                  fullWidth
                  onClick={() => {
                    handleLoginRedirect();
                    setIsMenuOpen(false);
                  }}
                  className="py-3 text-sm"
                >
                  Get Started
                </Button>
              </div>
            )}

            {/* Authenticated user logout */}
            {isAuthenticated() && (
              <div className="pt-3 border-t border-border">
                <div className="flex items-center px-4 py-2 text-xs text-text-secondary">
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center mr-3">
                    <span className="text-xs font-medium text-white">
                      {getUserInitials()}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-text-primary">{user?.name || 'User'}</p>
                    <p className="text-xs">{user?.email}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  fullWidth
                  iconName="LogOut"
                  iconPosition="left"
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="justify-start px-4 py-3 text-sm mt-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  Logout
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  );

  const renderMobileSearchOverlay = () => (
    isSearchExpanded && (
      <div className="md:hidden fixed inset-0 bg-surface z-50">
        <div className="flex items-center p-4 border-b border-border h-14 sm:h-16">
          <form onSubmit={handleSearch} className="flex-1 mr-3">
            <div className="relative">
              <Input
                type="search"
                placeholder="Search products, shops..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 h-10 text-sm"
                autoFocus
              />
              <Icon
                name="Search"
                size={18}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary"
              />
            </div>
          </form>
          <button
            onClick={() => setIsSearchExpanded(false)}
            className="p-2 rounded-md text-text-secondary hover:text-text-primary hover:bg-muted transition-colors"
          >
            <Icon name="X" size={20} />
          </button>
        </div>
        
        {/* Search suggestions or recent searches could go here */}
        <div className="p-4">
          <div className="text-sm text-text-secondary">
            <p className="mb-2">Popular searches:</p>
            <div className="flex flex-wrap gap-2">
              {['Electronics', 'Fashion', 'Home & Garden', 'Sports'].map((term) => (
                <button
                  key={term}
                  onClick={() => {
                    setSearchQuery(term);
                    handleSearch({ preventDefault: () => {} });
                  }}
                  className="px-3 py-1.5 bg-muted text-text-secondary rounded-full text-xs hover:bg-muted/80 transition-colors"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  );

  return (
    <>
      {/* Mobile-First Navigation Header */}
      <header className="fixed top-0 left-0 right-0 bg-surface border-b border-border z-header">
        <div className="flex items-center justify-between h-14 sm:h-16 px-3 sm:px-4 lg:px-6">
          {/* Logo */}
          {renderLogo()}

          {/* Mobile Search Button - Visible on small screens */}
          <button
            onClick={() => setIsSearchExpanded(true)}
            className="md:hidden p-2 rounded-md text-text-secondary hover:text-text-primary hover:bg-muted transition-colors order-2"
          >
            <Icon name="Search" size={18} />
          </button>

          {/* Desktop Navigation - Hidden on mobile */}
          <nav className="hidden md:flex items-center space-x-4 lg:space-x-8 order-2">
            {navigationItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-1 lg:space-x-2 px-2 lg:px-3 py-2 rounded-md text-xs lg:text-sm font-medium transition-colors ${
                  isActive(item.path)
                    ? 'text-primary bg-primary/10' 
                    : 'text-text-secondary hover:text-text-primary hover:bg-muted'
                }`}
              >
                <Icon name={item.icon} size={14} className="lg:w-4 lg:h-4" />
                <span className="hidden lg:inline">{item.label}</span>
              </Link>
            ))}
          </nav>

          {/* Search Bar - Tablet and Desktop */}
          <div className="hidden md:block flex-1 max-w-xs lg:max-w-md mx-4 order-3">
            {renderSearchBar()}
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-1 sm:space-x-2 order-4">
            {/* Desktop Actions - Hidden on mobile */}
            <div className="hidden md:flex items-center space-x-1 lg:space-x-2">
              {/* Dashboard Button */}
              {dashboard && (
                <Button
                  variant="default"
                  size="sm"
                  iconName={dashboard.icon}
                  iconPosition="left"
                  onClick={() => navigate(dashboard.path)}
                  className="flex items-center space-x-1 lg:space-x-2 px-2 lg:px-3 py-1.5 lg:py-2 text-xs lg:text-sm"
                >
                  <span className="hidden lg:inline">{dashboard.label}</span>
                </Button>
              )}

              {/* Notifications */}
              <button
                onClick={() => setIsNotificationOpen(true)}
                className="relative p-1.5 lg:p-2 text-text-secondary hover:text-text-primary transition-colors rounded-md hover:bg-muted"
                disabled={notificationsLoading}
              >
                <Icon name="Bell" size={18} className="lg:w-5 lg:h-5" />
                {notificationsLoading ? (
                  <span className="absolute -top-0.5 -right-0.5 bg-gray-400 text-white text-xs font-medium rounded-full w-4 h-4 lg:w-5 lg:h-5 flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  </span>
                ) : unreadCount > 0 ? (
                  <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-xs font-medium rounded-full w-4 h-4 lg:w-5 lg:h-5 flex items-center justify-center animate-pulse">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                ) : null}
              </button>
              
              {/* Settings */}
              <button
                onClick={() => setIsSettingsOpen(true)}
                className="p-1.5 lg:p-2 text-text-secondary hover:text-text-primary transition-colors rounded-md hover:bg-muted"
              >
                <Icon name="Settings" size={18} className="lg:w-5 lg:h-5" />
              </button>
            </div>
            
            {/* Cart - Always visible */}
            <Link
              to="/shopping-cart"
              className="relative p-1.5 lg:p-2 text-text-secondary hover:text-text-primary transition-colors rounded-md hover:bg-muted"
            >
              <Icon name="ShoppingCart" size={18} className="lg:w-5 lg:h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-accent text-accent-foreground text-xs font-medium rounded-full w-4 h-4 lg:w-5 lg:h-5 flex items-center justify-center">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </Link>
            
            {/* User Menu or Auth Buttons - Desktop */}
            <div className="hidden md:block">
              {isAuthenticated() ? (
                <div className="flex items-center space-x-1 lg:space-x-2">
                  {/* Sell Button - Only for Casual Sellers */}
                  {isCasualSeller() && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      iconName="Plus" 
                      iconPosition="left"
                      onClick={() => navigate('/add-product')}
                      className="text-xs lg:text-sm px-2 lg:px-3"
                    >
                      <span className="hidden lg:inline">Sell</span>
                    </Button>
                  )}
                  
                  {/* User Account Menu */}
                  <UserMenu 
                    user={user} 
                    isAuthenticated={isAuthenticated()}
                    onLogout={handleLogout}
                    userInitials={getUserInitials()}
                  />
                </div>
              ) : (
                <div className="flex items-center space-x-1 lg:space-x-2">
                  <Button variant="ghost" size="sm" onClick={handleLoginRedirect} className="text-xs lg:text-sm px-2 lg:px-3">
                    Sign In
                  </Button>
                  <Button variant="default" size="sm" onClick={handleLoginRedirect} className="text-xs lg:text-sm px-2 lg:px-3">
                    Get Started
                  </Button>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-1.5"
            >
              <Icon name={isMenuOpen ? "X" : "Menu"} size={18} />
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {renderMobileMenu()}
      </header>

      {/* Mobile Search Overlay */}
      {renderMobileSearchOverlay()}

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
    </>
  );
};

export default DynamicNavigation;