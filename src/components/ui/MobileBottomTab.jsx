import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Icon from '../AppIcon';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';

const MobileBottomTab = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { cartCount } = useCart();
  const { isAuthenticated } = useAuth();
  const [searchClicked, setSearchClicked] = useState(false);

  const isActive = (path) => location.pathname === path;

  const tabItems = [
    {
      label: 'Browse',
      path: '/product-catalog',
      icon: 'Package',
      activeIcon: 'Package'
    },
    {
      label: 'Search',
      icon: 'Search',
      activeIcon: 'Search',
      action: 'search'
    },
    {
      label: 'Cart',
      path: '/shopping-cart',
      icon: 'ShoppingCart',
      activeIcon: 'ShoppingCart',
      badge: cartCount
    },
    {
      label: 'Profile',
      path: isAuthenticated() ? '/user-profile' : '/authentication-login-register',
      icon: 'User',
      activeIcon: 'User'
    }
  ];

  const handleTabClick = (item) => {
    if (item.action === 'search') {
      setSearchClicked(true);
      
      // Try multiple selectors to find search input
      const searchInput = document.querySelector('input[type="search"]') || 
                         document.querySelector('input[placeholder*="Search"]') ||
                         document.querySelector('input[placeholder*="search"]');
      
      if (searchInput) {
        searchInput.focus();
        searchInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        // If no search input found, navigate to product catalog with search focus
        navigate('/product-catalog');
        // Try again after navigation
        setTimeout(() => {
          const delayedSearchInput = document.querySelector('input[type="search"]') || 
                                   document.querySelector('input[placeholder*="Search"]') ||
                                   document.querySelector('input[placeholder*="search"]');
          if (delayedSearchInput) {
            delayedSearchInput.focus();
          }
        }, 100);
      }
      
      // Reset visual feedback after 1 second
      setTimeout(() => setSearchClicked(false), 1000);
    }
  };

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-white/20 z-50 shadow-lg">
      <div className="flex items-center justify-around px-2 py-3">
        {tabItems.map((item) => {
          const active = item.path ? isActive(item.path) : false;
          
          // Render search button differently
          if (item.action === 'search') {
            return (
              <button
                key={item.label}
                onClick={() => handleTabClick(item)}
                className={`flex flex-col items-center justify-center min-w-0 flex-1 px-3 py-2 rounded-xl transition-all duration-200 ${
                  searchClicked 
                    ? 'text-teal-700 bg-teal-50/80 backdrop-blur-sm' 
                    : 'text-gray-600 hover:text-teal-600 hover:bg-gray-50/80 backdrop-blur-sm'
                }`}
              >
                <div className="relative">
                  <Icon 
                    name={item.icon} 
                    size={20}
                    className={`transition-all duration-200 ${
                      searchClicked ? 'text-teal-700' : 'text-gray-600'
                    }`}
                  />
                </div>
                <span className={`text-xs font-medium mt-1 truncate transition-colors duration-200 ${
                  searchClicked ? 'text-teal-700' : 'text-gray-600'
                }`}>
                  {item.label}
                </span>
              </button>
            );
          }
          
          // Render regular navigation links
          return (
            <Link
              key={item.label}
              to={item.path}
              onClick={() => handleTabClick(item)}
              className={`flex flex-col items-center justify-center min-w-0 flex-1 px-3 py-2 rounded-xl transition-all duration-200 ${
                active
                  ? 'text-teal-700 bg-teal-50/80 backdrop-blur-sm' 
                  : 'text-gray-600 hover:text-teal-600 hover:bg-gray-50/80 backdrop-blur-sm'
              }`}
            >
              <div className="relative">
                <Icon 
                  name={active ? item.activeIcon : item.icon} 
                  size={20}
                  className={`transition-all duration-200 ${
                    active ? 'text-teal-700' : 'text-gray-600'
                  }`}
                />
                {item.badge && item.badge > 0 && (
                  <span className="absolute -top-2 -right-2 bg-teal-500 text-white text-xs font-medium rounded-full w-5 h-5 flex items-center justify-center shadow-sm">
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </div>
              <span className={`text-xs font-medium mt-1 truncate transition-colors duration-200 ${
                active ? 'text-teal-700' : 'text-gray-600'
              }`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileBottomTab;