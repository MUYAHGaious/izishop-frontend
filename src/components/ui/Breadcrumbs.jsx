import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import Icon from '../AppIcon';

const Breadcrumbs = ({ items = [] }) => {
  const location = useLocation();

  // Auto-generate breadcrumbs based on current route if no items provided
  const generateBreadcrumbs = () => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const breadcrumbs = [{ label: 'Home', path: '/product-catalog' }];

    const routeMap = {
      'product-catalog': 'Products',
      'product-detail-modal': 'Product Details',
      'shopping-cart-checkout': 'Cart & Checkout',
      'shop-profile': 'Shop Profile',
      'shop-owner-dashboard': 'Shop Dashboard',
      'admin-dashboard': 'Admin Dashboard'
    };

    pathSegments.forEach((segment, index) => {
      const path = '/' + pathSegments.slice(0, index + 1).join('/');
      const label = routeMap[segment] || segment.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      
      breadcrumbs.push({ label, path });
    });

    return breadcrumbs;
  };

  const breadcrumbItems = items.length > 0 ? items : generateBreadcrumbs();

  if (breadcrumbItems.length <= 1) {
    return null;
  }

  return (
    <nav className="flex items-center space-x-2 text-sm text-text-secondary mb-6" aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2">
        {breadcrumbItems.map((item, index) => {
          const isLast = index === breadcrumbItems.length - 1;
          const isFirst = index === 0;

          return (
            <li key={item.path || index} className="flex items-center">
              {!isFirst && (
                <Icon 
                  name="ChevronRight" 
                  size={14} 
                  className="mx-2 text-text-secondary/60" 
                />
              )}
              
              {isLast ? (
                <span className="font-medium text-text-primary truncate max-w-[200px] sm:max-w-none">
                  {item.label}
                </span>
              ) : (
                <Link
                  to={item.path}
                  className="hover:text-text-primary transition-colors truncate max-w-[120px] sm:max-w-[200px] md:max-w-none"
                  title={item.label}
                >
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;