import React from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../../components/AppIcon';

const CategoryBreadcrumbs = ({ categories = [] }) => {
  const breadcrumbItems = [
    { label: 'Home', path: '/product-catalog' },
    ...categories
  ];

  if (breadcrumbItems.length <= 1) {
    return null;
  }

  return (
    <nav className="flex items-center space-x-2 text-sm text-text-secondary px-4 py-3 bg-muted/30 border-b border-border" aria-label="Category breadcrumb">
      <ol className="flex items-center space-x-2 overflow-x-auto">
        {breadcrumbItems.map((item, index) => {
          const isLast = index === breadcrumbItems.length - 1;
          const isFirst = index === 0;

          return (
            <li key={item.path || index} className="flex items-center whitespace-nowrap">
              {!isFirst && (
                <Icon 
                  name="ChevronRight" 
                  size={14} 
                  className="mx-2 text-text-secondary/60 flex-shrink-0" 
                />
              )}
              
              {isLast ? (
                <span className="font-medium text-text-primary">
                  {item.label}
                </span>
              ) : (
                <Link
                  to={item.path}
                  className="hover:text-text-primary transition-colors"
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

export default CategoryBreadcrumbs;