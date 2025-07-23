import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Icon from '../AppIcon';
import Button from './Button';

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const dashboardItems = [
    {
      label: 'Shop Dashboard',
      path: '/shop-owner-dashboard',
      icon: 'BarChart3',
      description: 'Sales analytics and overview'
    },
    {
      label: 'Admin Dashboard',
      path: '/admin-dashboard',
      icon: 'Settings',
      description: 'Platform administration'
    },
  ];

  const quickActions = [
    { label: 'View Profile', path: '/shop-profile', icon: 'User' },
  ];

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className={`hidden lg:flex lg:fixed lg:inset-y-0 lg:left-0 lg:z-sidebar bg-surface border-r border-border transition-all duration-300 ${
        isCollapsed ? 'lg:w-16' : 'lg:w-64'
      }`}>
        <div className="flex flex-col w-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            {!isCollapsed && (
              <Link to="/product-catalog" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Icon name="ShoppingBag" size={20} color="white" />
                </div>
                <span className="text-lg font-semibold text-primary">IziShop</span>
              </Link>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="flex-shrink-0"
            >
              <Icon name={isCollapsed ? "ChevronRight" : "ChevronLeft"} size={16} />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            <div className="space-y-1">
              {!isCollapsed && (
                <h3 className="px-3 text-xs font-semibold text-text-secondary uppercase tracking-wider mb-3">
                  Dashboard
                </h3>
              )}
              {dashboardItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors group ${
                    isActive(item.path)
                      ? 'text-primary bg-primary/10 border-r-2 border-primary' :'text-text-secondary hover:text-text-primary hover:bg-muted'
                  }`}
                  title={isCollapsed ? item.label : ''}
                >
                  <Icon name={item.icon} size={18} className="flex-shrink-0" />
                  {!isCollapsed && (
                    <div className="ml-3 flex-1">
                      <div className="text-sm font-medium">{item.label}</div>
                      <div className="text-xs text-text-secondary group-hover:text-text-primary">
                        {item.description}
                      </div>
                    </div>
                  )}
                </Link>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="pt-6 space-y-1">
              {!isCollapsed && (
                <h3 className="px-3 text-xs font-semibold text-text-secondary uppercase tracking-wider mb-3">
                  Quick Actions
                </h3>
              )}
              {quickActions.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-muted transition-colors"
                  title={isCollapsed ? item.label : ''}
                >
                  <Icon name={item.icon} size={18} className="flex-shrink-0" />
                  {!isCollapsed && <span className="ml-3">{item.label}</span>}
                </Link>
              ))}
            </div>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-border">
            {!isCollapsed ? (
              <div className="flex items-center space-x-3 p-3 rounded-md bg-muted">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <Icon name="User" size={16} color="white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-text-primary truncate">
                    Shop Owner
                  </div>
                  <div className="text-xs text-text-secondary truncate">
                    owner@izishopin.com
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex justify-center">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <Icon name="User" size={16} color="white" />
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      <div className="lg:hidden">
        {/* This would be implemented with a mobile menu state */}
      </div>
    </>
  );
};

export default Sidebar;