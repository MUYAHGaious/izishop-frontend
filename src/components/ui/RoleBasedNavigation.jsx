import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Icon from '../AppIcon';
import Button from './Button';

const RoleBasedNavigation = () => {
  const [userRole, setUserRole] = useState('customer');
  const [isExpanded, setIsExpanded] = useState(true);
  const location = useLocation();

  // Determine user role based on current path
  useEffect(() => {
    const currentPath = location.pathname;
    if (currentPath.includes('admin')) {
      setUserRole('admin');
    } else if (currentPath.includes('shop-owner')) {
      setUserRole('shop-owner');
    } else {
      setUserRole('customer');
    }
  }, [location.pathname]);

  // Role-based navigation configuration
  const navigationConfig = {
    customer: {
      title: 'Customer Portal',
      items: [
        { label: 'Dashboard', path: '/customer-dashboard', icon: 'Home', badge: null },
        { label: 'Casual Marketplace', path: '/casual-marketplace', icon: 'ShoppingBag', badge: 'New' },
        { label: 'Orders', path: '/order-management', icon: 'Package', badge: '3' },
        { label: 'Checkout', path: '/checkout', icon: 'CreditCard', badge: null },
      ]
    },
    'shop-owner': {
      title: 'Shop Management',
      items: [
        { label: 'Dashboard', path: '/shop-owner-dashboard', icon: 'Store', badge: null },
        { label: 'Casual Marketplace', path: '/casual-marketplace', icon: 'ShoppingBag', badge: null },
        { label: 'Products', path: '/product-management', icon: 'Package2', badge: '12' },
        { label: 'Orders', path: '/order-management', icon: 'ShoppingCart', badge: '5' },
      ]
    },
    admin: {
      title: 'Admin Panel',
      items: [
        { label: 'Dashboard', path: '/admin-dashboard', icon: 'LayoutDashboard', badge: null },
        { label: 'Order Management', path: '/order-management', icon: 'Package', badge: '8' },
        { label: 'Product Management', path: '/product-management', icon: 'ShoppingBag', badge: null },
      ]
    }
  };

  const currentConfig = navigationConfig[userRole];

  const handleNavigation = (path) => {
    window.location.href = path;
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className={`lg:fixed lg:top-16 lg:left-0 lg:h-[calc(100vh-4rem)] bg-surface border-r border-border z-1000 transition-smooth ${
      isExpanded ? 'lg:w-64' : 'lg:w-16'
    }`}>
      {/* Navigation Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        {isExpanded && (
          <div>
            <h2 className="text-sm font-medium text-text-secondary">{currentConfig.title}</h2>
            <p className="text-xs text-muted-foreground capitalize">{userRole} Access</p>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleExpanded}
          className="hidden lg:flex"
        >
          <Icon name={isExpanded ? "ChevronLeft" : "ChevronRight"} size={16} />
        </Button>
      </div>

      {/* Navigation Items */}
      <nav className="p-2">
        <div className="space-y-1">
          {currentConfig.items.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Button
                key={item.path}
                variant={isActive ? "default" : "ghost"}
                fullWidth
                onClick={() => handleNavigation(item.path)}
                className={`justify-start transition-micro hover-scale ${
                  !isExpanded ? 'lg:justify-center lg:px-2' : ''
                }`}
              >
                <Icon name={item.icon} size={20} />
                {isExpanded && (
                  <>
                    <span className="ml-3">{item.label}</span>
                    {item.badge && (
                      <span className="ml-auto bg-accent text-accent-foreground text-xs px-2 py-0.5 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </Button>
            );
          })}
        </div>
      </nav>

      {/* User Context */}
      {isExpanded && (
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border bg-muted/50">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <Icon name="User" size={16} color="white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {userRole === 'shop-owner' ? 'Shop Owner' : userRole === 'admin' ? 'Administrator' : 'Customer'}
              </p>
              <p className="text-xs text-muted-foreground">Active Session</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoleBasedNavigation;