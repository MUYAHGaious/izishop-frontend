import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const CategoryNavigation = ({ selectedCategory, onCategoryChange, className = "" }) => {
  const [expandedCategories, setExpandedCategories] = useState({});

  const categories = [
    {
      id: 'all',
      name: 'All Categories',
      icon: 'Grid3x3',
      count: 3154,
      subcategories: []
    },
    {
      id: 'electronics',
      name: 'Electronics',
      icon: 'Smartphone',
      count: 1234,
      subcategories: [
        { id: 'smartphones', name: 'Smartphones', count: 456 },
        { id: 'laptops', name: 'Laptops & Computers', count: 234 },
        { id: 'audio', name: 'Audio & Headphones', count: 189 },
        { id: 'cameras', name: 'Cameras & Photography', count: 123 },
        { id: 'gaming', name: 'Gaming', count: 98 },
        { id: 'accessories', name: 'Accessories', count: 134 }
      ]
    },
    {
      id: 'fashion',
      name: 'Fashion & Clothing',
      icon: 'Shirt',
      count: 856,
      subcategories: [
        { id: 'mens-clothing', name: "Men\'s Clothing", count: 324 },
        { id: 'womens-clothing', name: "Women\'s Clothing", count: 412 },
        { id: 'shoes', name: 'Shoes & Footwear', count: 156 },
        { id: 'bags', name: 'Bags & Accessories', count: 89 },
        { id: 'jewelry', name: 'Jewelry & Watches', count: 67 }
      ]
    },
    {
      id: 'home',
      name: 'Home & Garden',
      icon: 'Home',
      count: 642,
      subcategories: [
        { id: 'furniture', name: 'Furniture', count: 234 },
        { id: 'decor', name: 'Home Decor', count: 189 },
        { id: 'kitchen', name: 'Kitchen & Dining', count: 156 },
        { id: 'garden', name: 'Garden & Outdoor', count: 98 },
        { id: 'appliances', name: 'Home Appliances', count: 87 }
      ]
    },
    {
      id: 'sports',
      name: 'Sports & Outdoors',
      icon: 'Dumbbell',
      count: 423,
      subcategories: [
        { id: 'fitness', name: 'Fitness Equipment', count: 156 },
        { id: 'outdoor', name: 'Outdoor Recreation', count: 123 },
        { id: 'team-sports', name: 'Team Sports', count: 89 },
        { id: 'water-sports', name: 'Water Sports', count: 55 }
      ]
    },
    {
      id: 'books',
      name: 'Books & Media',
      icon: 'Book',
      count: 312,
      subcategories: [
        { id: 'books', name: 'Books', count: 234 },
        { id: 'movies', name: 'Movies & TV', count: 45 },
        { id: 'music', name: 'Music', count: 33 }
      ]
    },
    {
      id: 'toys',
      name: 'Toys & Games',
      icon: 'Gamepad2',
      count: 289,
      subcategories: [
        { id: 'kids-toys', name: 'Kids Toys', count: 156 },
        { id: 'board-games', name: 'Board Games', count: 78 },
        { id: 'puzzles', name: 'Puzzles', count: 55 }
      ]
    },
    {
      id: 'beauty',
      name: 'Beauty & Health',
      icon: 'Heart',
      count: 234,
      subcategories: [
        { id: 'skincare', name: 'Skincare', count: 89 },
        { id: 'makeup', name: 'Makeup', count: 67 },
        { id: 'health', name: 'Health & Wellness', count: 78 }
      ]
    },
    {
      id: 'automotive',
      name: 'Automotive',
      icon: 'Car',
      count: 156,
      subcategories: [
        { id: 'parts', name: 'Auto Parts', count: 89 },
        { id: 'accessories', name: 'Car Accessories', count: 67 }
      ]
    }
  ];

  const toggleCategory = (categoryId) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  const handleCategorySelect = (categoryId) => {
    onCategoryChange(categoryId);
  };

  const formatCount = (count) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
  };

  return (
    <div className={`bg-background border-r border-border ${className}`}>
      <div className="p-4 border-b border-border">
        <h2 className="font-semibold text-foreground flex items-center space-x-2">
          <Icon name="Filter" size={16} />
          <span>Categories</span>
        </h2>
      </div>

      <div className="overflow-y-auto max-h-[calc(100vh-200px)]">
        {categories.map((category) => (
          <div key={category.id} className="border-b border-border last:border-b-0">
            <div className="flex items-center">
              <button
                onClick={() => handleCategorySelect(category.id)}
                className={`flex-1 flex items-center justify-between p-3 text-left marketplace-transition ${
                  selectedCategory === category.id
                    ? 'bg-primary/10 text-primary border-r-2 border-primary' :'text-foreground hover:bg-muted'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon 
                    name={category.icon} 
                    size={16} 
                    className={selectedCategory === category.id ? 'text-primary' : 'text-text-secondary'} 
                  />
                  <span className="font-medium text-sm">{category.name}</span>
                </div>
                <span className="text-xs text-text-secondary bg-muted px-2 py-1 rounded-full">
                  {formatCount(category.count)}
                </span>
              </button>

              {category.subcategories.length > 0 && (
                <button
                  onClick={() => toggleCategory(category.id)}
                  className="p-3 text-text-secondary hover:text-foreground hover:bg-muted marketplace-transition"
                >
                  <Icon 
                    name="ChevronDown" 
                    size={14} 
                    className={`marketplace-transition ${expandedCategories[category.id] ? 'rotate-180' : ''}`} 
                  />
                </button>
              )}
            </div>

            {/* Subcategories */}
            {expandedCategories[category.id] && category.subcategories.length > 0 && (
              <div className="bg-muted/50">
                {category.subcategories.map((subcategory) => (
                  <button
                    key={subcategory.id}
                    onClick={() => handleCategorySelect(subcategory.id)}
                    className={`w-full flex items-center justify-between p-3 pl-12 text-left text-sm marketplace-transition ${
                      selectedCategory === subcategory.id
                        ? 'bg-primary/10 text-primary' :'text-foreground hover:bg-muted'
                    }`}
                  >
                    <span>{subcategory.name}</span>
                    <span className="text-xs text-text-secondary">
                      {formatCount(subcategory.count)}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryNavigation;