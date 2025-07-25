import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Icon from '../AppIcon';

const MobileBottomTab = () => {
  const location = useLocation();
  const [cartCount] = React.useState(3);

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
      path: '/product-catalog',
      icon: 'Search',
      activeIcon: 'Search',
      action: 'search'
    },
    {
      label: 'Cart',
      path: '/shopping-cart-checkout',
      icon: 'ShoppingCart',
      activeIcon: 'ShoppingCart',
      badge: cartCount
    },
    {
      label: 'Profile',
      path: '/shop-profile',
      icon: 'User',
      activeIcon: 'User'
    }
  ];

  const handleTabClick = (item) => {
    if (item.action === 'search') {
      // Focus search input in header
      const searchInput = document.querySelector('input[type="search"]');
      if (searchInput) {
        searchInput.focus();
      }
    }
  };

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-surface border-t border-border z-header">
      <div className="flex items-center justify-around px-2 py-2">
        {tabItems.map((item) => {
          const active = isActive(item.path);
          
          return (
            <Link
              key={item.label}
              to={item.path}
              onClick={() => handleTabClick(item)}
              className={`flex flex-col items-center justify-center min-w-0 flex-1 px-2 py-2 rounded-lg transition-colors ${
                active
                  ? 'text-primary bg-primary/10' : 'text-text-secondary hover:text-text-primary hover:bg-muted'
              }`}
            >
              <div className="relative">
                <Icon 
                  name={active ? item.activeIcon : item.icon} 
                  size={20}
                  strokeWidth={active ? 2.5 : 2}
                />
                {item.badge && item.badge > 0 && (
                  <span className="absolute -top-2 -right-2 bg-accent text-accent-foreground text-xs font-medium rounded-full w-5 h-5 flex items-center justify-center">
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </div>
              <span className={`text-xs font-medium mt-1 truncate ${
                active ? 'text-primary' : 'text-text-secondary'
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