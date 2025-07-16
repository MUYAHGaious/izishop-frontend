import React from 'react';
import { useLocation } from 'react-router-dom';
import Icon from '../AppIcon';
import Button from './Button';

const BreadcrumbNavigation = () => {
  const location = useLocation();

  // Generate breadcrumb items based on current path
  const generateBreadcrumbs = () => {
    const pathSegments = location.pathname.split('/').filter(segment => segment);
    
    // Route mapping for better labels
    const routeLabels = {
      'checkout': 'Checkout',
      'customer-dashboard': 'Customer Dashboard',
      'shop-owner-dashboard': 'Shop Owner Dashboard',
      'product-management': 'Product Management',
      'order-management': 'Order Management',
      'admin-dashboard': 'Admin Dashboard'
    };

    // Route icons
    const routeIcons = {
      'checkout': 'CreditCard',
      'customer-dashboard': 'User',
      'shop-owner-dashboard': 'Store',
      'product-management': 'Package2',
      'order-management': 'ShoppingCart',
      'admin-dashboard': 'LayoutDashboard'
    };

    const breadcrumbs = [
      {
        label: 'Home',
        path: '/',
        icon: 'Home',
        isActive: false
      }
    ];

    let currentPath = '';
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const isLast = index === pathSegments.length - 1;
      
      breadcrumbs.push({
        label: routeLabels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1),
        path: currentPath,
        icon: routeIcons[segment] || 'ChevronRight',
        isActive: isLast
      });
    });

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  const handleNavigation = (path) => {
    if (path !== location.pathname) {
      window.location.href = path;
    }
  };

  // Don't show breadcrumbs on home page or if only one level deep
  if (breadcrumbs.length <= 2) {
    return null;
  }

  return (
    <nav className="flex items-center space-x-1 text-sm mb-6" aria-label="Breadcrumb">
      {/* Desktop Breadcrumbs */}
      <div className="hidden md:flex items-center space-x-1">
        {breadcrumbs.map((crumb, index) => (
          <div key={crumb.path} className="flex items-center">
            {index > 0 && (
              <Icon 
                name="ChevronRight" 
                size={16} 
                className="text-muted-foreground mx-2" 
              />
            )}
            
            {crumb.isActive ? (
              <span className="flex items-center space-x-1 text-foreground font-medium">
                <Icon name={crumb.icon} size={16} />
                <span>{crumb.label}</span>
              </span>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleNavigation(crumb.path)}
                iconName={crumb.icon}
                iconPosition="left"
                iconSize={16}
                className="text-muted-foreground hover:text-foreground transition-micro px-2 py-1 h-auto"
              >
                {crumb.label}
              </Button>
            )}
          </div>
        ))}
      </div>

      {/* Mobile Breadcrumbs - Simplified */}
      <div className="md:hidden flex items-center space-x-2 w-full">
        {breadcrumbs.length > 2 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.history.back()}
            iconName="ArrowLeft"
            iconPosition="left"
            iconSize={16}
            className="text-muted-foreground hover:text-foreground transition-micro px-2 py-1 h-auto"
          >
            Back
          </Button>
        )}
        
        <Icon name="ChevronRight" size={16} className="text-muted-foreground" />
        
        <span className="flex items-center space-x-1 text-foreground font-medium truncate">
          <Icon name={breadcrumbs[breadcrumbs.length - 1].icon} size={16} />
          <span className="truncate">{breadcrumbs[breadcrumbs.length - 1].label}</span>
        </span>
      </div>

      {/* Expandable Full Path on Mobile */}
      <div className="md:hidden">
        <details className="relative">
          <summary className="cursor-pointer text-xs text-muted-foreground">
            Show full path
          </summary>
          <div className="absolute top-6 left-0 bg-background border rounded-md shadow-lg p-2 z-10 min-w-[200px]">
            {breadcrumbs.map((crumb, index) => (
              <div key={crumb.path} className="flex items-center text-xs py-1">
                {index > 0 && (
                  <Icon 
                    name="ChevronRight" 
                    size={12} 
                    className="text-muted-foreground mx-1" 
                  />
                )}
                <Icon name={crumb.icon} size={12} className="mr-1" />
                <span className={crumb.isActive ? 'font-medium' : 'text-muted-foreground'}>
                  {crumb.label}
                </span>
              </div>
            ))}
          </div>
        </details>
      </div>
    </nav>
  );
};

export default BreadcrumbNavigation;