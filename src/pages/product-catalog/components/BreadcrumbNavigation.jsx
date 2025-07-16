import React from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../../components/AppIcon';

const BreadcrumbNavigation = ({ currentCategory, searchQuery, className = "" }) => {
  const getCategoryHierarchy = (categoryId) => {
    const categoryMap = {
      'all': { name: 'All Categories', parent: null },
      'electronics': { name: 'Electronics', parent: null },
      'smartphones': { name: 'Smartphones', parent: 'electronics' },
      'laptops': { name: 'Laptops & Computers', parent: 'electronics' },
      'audio': { name: 'Audio & Headphones', parent: 'electronics' },
      'cameras': { name: 'Cameras & Photography', parent: 'electronics' },
      'gaming': { name: 'Gaming', parent: 'electronics' },
      'accessories': { name: 'Accessories', parent: 'electronics' },
      'fashion': { name: 'Fashion & Clothing', parent: null },
      'mens-clothing': { name: "Men\'s Clothing", parent: 'fashion' },
      'womens-clothing': { name: "Women\'s Clothing", parent: 'fashion' },
      'shoes': { name: 'Shoes & Footwear', parent: 'fashion' },
      'bags': { name: 'Bags & Accessories', parent: 'fashion' },
      'jewelry': { name: 'Jewelry & Watches', parent: 'fashion' },
      'home': { name: 'Home & Garden', parent: null },
      'furniture': { name: 'Furniture', parent: 'home' },
      'decor': { name: 'Home Decor', parent: 'home' },
      'kitchen': { name: 'Kitchen & Dining', parent: 'home' },
      'garden': { name: 'Garden & Outdoor', parent: 'home' },
      'appliances': { name: 'Home Appliances', parent: 'home' },
      'sports': { name: 'Sports & Outdoors', parent: null },
      'fitness': { name: 'Fitness Equipment', parent: 'sports' },
      'outdoor': { name: 'Outdoor Recreation', parent: 'sports' },
      'team-sports': { name: 'Team Sports', parent: 'sports' },
      'water-sports': { name: 'Water Sports', parent: 'sports' },
      'books': { name: 'Books & Media', parent: null },
      'toys': { name: 'Toys & Games', parent: null },
      'beauty': { name: 'Beauty & Health', parent: null },
      'automotive': { name: 'Automotive', parent: null }
    };

    const hierarchy = [];
    let current = categoryId;

    while (current && categoryMap[current]) {
      hierarchy.unshift({
        id: current,
        name: categoryMap[current].name
      });
      current = categoryMap[current].parent;
    }

    return hierarchy;
  };

  const buildBreadcrumbs = () => {
    const breadcrumbs = [
      { name: 'Home', path: '/landing-page', isLink: true }
    ];

    if (searchQuery) {
      breadcrumbs.push({
        name: 'Search Results',
        path: '/product-catalog',
        isLink: true
      });
      breadcrumbs.push({
        name: `"${searchQuery}"`,
        path: null,
        isLink: false
      });
    } else if (currentCategory && currentCategory !== 'all') {
      const hierarchy = getCategoryHierarchy(currentCategory);
      
      hierarchy.forEach((category, index) => {
        breadcrumbs.push({
          name: category.name,
          path: index === hierarchy.length - 1 ? null : `/product-catalog?category=${category.id}`,
          isLink: index !== hierarchy.length - 1
        });
      });
    } else {
      breadcrumbs.push({
        name: 'All Products',
        path: null,
        isLink: false
      });
    }

    return breadcrumbs;
  };

  const breadcrumbs = buildBreadcrumbs();

  return (
    <nav className={`flex items-center space-x-2 text-sm ${className}`} aria-label="Breadcrumb">
      {breadcrumbs.map((breadcrumb, index) => (
        <React.Fragment key={index}>
          {index > 0 && (
            <Icon name="ChevronRight" size={14} className="text-text-secondary" />
          )}
          
          {breadcrumb.isLink ? (
            <Link
              to={breadcrumb.path}
              className="text-text-secondary hover:text-primary marketplace-transition"
            >
              {breadcrumb.name}
            </Link>
          ) : (
            <span className="text-foreground font-medium">
              {breadcrumb.name}
            </span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

export default BreadcrumbNavigation;