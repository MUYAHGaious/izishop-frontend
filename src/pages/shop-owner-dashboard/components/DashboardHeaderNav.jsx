import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import NotificationBell from '../../../components/ui/NotificationBell';
import { useAuth } from '../../../contexts/AuthContext';
import { useWishlist } from '../../../contexts/WishlistContext';

const DashboardHeaderNav = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
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
      try {
        const count = localStorage.getItem('cartItemCount');
        setCartCount(count ? parseInt(count) : 0);
      } catch (error) {
        console.error('Error updating cart count:', error);
        setCartCount(0);
      }
    };

    const updateNotificationCount = () => {
      try {
        const count = localStorage.getItem('notificationCount');
        setNotificationCount(count ? parseInt(count) : 0);
      } catch (error) {
        console.error('Error updating notification count:', error);
        setNotificationCount(0);
      }
    };

    const updateProfileImage = () => {
      try {
        const image = localStorage.getItem('userProfileImage');
        if (image) {
          setUserProfileImage(image);
        }
      } catch (error) {
        console.error('Error updating profile image:', error);
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

        {/* Spacer to push right section to the right */}
        <div className="flex-1"></div>

        {/* Simplified Right Section */}
        <div className="flex items-center space-x-4">
          {/* Bell Icon */}
          <Link to="/notifications" className="p-2 hover:bg-gray-100/50 rounded-xl transition-colors relative">
            <Icon name="Bell" size={20} className="text-amber-600" />
            {notificationCount > 0 && (
              <span className={`absolute -top-1 -right-1 bg-amber-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center ${notificationAnimating ? 'animate-bounce' : ''}`}>
                {notificationCount > 99 ? '99+' : notificationCount}
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
                          onClick={() => navigate('/create-shop')}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <Icon name="Plus" size={16} className="mr-3 text-gray-500" />
                          Create Shop
                        </button>
                      </>
                    )}
                    
                    {user?.role === 'ADMIN' && (
                      <button
                        onClick={() => navigate('/admin-dashboard')}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <Icon name="Settings" size={16} className="mr-3 text-gray-500" />
                        Admin Dashboard
                      </button>
                    )}
                    
                    <button
                      onClick={() => navigate('/settings')}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <Icon name="Settings" size={16} className="mr-3 text-gray-500" />
                      Settings
                    </button>
                    
                    <div className="border-t border-gray-100 my-1"></div>
                    
                    <button
                      onClick={async () => {
                        try {
                          // Call logout function if available
                          if (typeof window !== 'undefined' && window.logout) {
                            await window.logout();
                          }
                          // Clear localStorage
                          localStorage.removeItem('user');
                          localStorage.removeItem('authToken');
                          localStorage.removeItem('refreshToken');
                          // Redirect to home
                          window.location.href = '/';
                        } catch (error) {
                          console.error('Logout error:', error);
                          // Force redirect anyway
                          window.location.href = '/';
                        }
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <Icon name="LogOut" size={16} className="mr-3" />
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-3">
              <Button
                onClick={() => navigate('/authentication-login-register')}
                variant="outline"
                className="text-sm font-medium"
              >
                Login
              </Button>
              <Button
                onClick={() => navigate('/authentication-login-register')}
                className="bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium"
              >
                Sign Up
              </Button>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={toggleMenu}
          className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <Icon name={isMenuOpen ? "X" : "Menu"} size={24} className="text-gray-700" />
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-200 shadow-lg">
          <div className="px-4 py-2 space-y-1">
            <Link
              to="/product-catalog"
              className="block px-3 py-2 text-sm font-medium text-gray-700 hover:text-teal-600 hover:bg-gray-50 rounded-lg transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Products
            </Link>
            <Link
              to="/shops-listing"
              className="block px-3 py-2 text-sm font-medium text-gray-700 hover:text-teal-600 hover:bg-gray-50 rounded-lg transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Shops
            </Link>
            <Link
              to="/casual-marketplace"
              className="block px-3 py-2 text-sm font-medium text-gray-700 hover:text-teal-600 hover:bg-gray-50 rounded-lg transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Marketplace
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default DashboardHeaderNav;
