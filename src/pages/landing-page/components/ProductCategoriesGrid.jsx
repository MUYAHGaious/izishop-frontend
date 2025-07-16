import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';

const ProductCategoriesGrid = () => {
  const [hoveredCategory, setHoveredCategory] = useState(null);

  const categories = [
    {
      id: 1,
      name: "Electronics",
      image: "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&h=300&fit=crop",
      icon: "Smartphone",
      productCount: 1247,
      description: "Smartphones, laptops, and gadgets",
      color: "from-blue-500 to-purple-600",
      featured: true
    },
    {
      id: 2,
      name: "Fashion",
      image: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=400&h=300&fit=crop",
      icon: "Shirt",
      productCount: 2156,
      description: "Clothing, shoes, and accessories",
      color: "from-pink-500 to-rose-600",
      featured: true
    },
    {
      id: 3,
      name: "Home & Garden",
      image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop",
      icon: "Home",
      productCount: 892,
      description: "Furniture, decor, and garden tools",
      color: "from-green-500 to-emerald-600",
      featured: false
    },
    {
      id: 4,
      name: "Sports & Fitness",
      image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop",
      icon: "Dumbbell",
      productCount: 634,
      description: "Sports equipment and fitness gear",
      color: "from-orange-500 to-red-600",
      featured: false
    },
    {
      id: 5,
      name: "Beauty & Health",
      image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=300&fit=crop",
      icon: "Heart",
      productCount: 1089,
      description: "Cosmetics, skincare, and wellness",
      color: "from-purple-500 to-pink-600",
      featured: true
    },
    {
      id: 6,
      name: "Books & Education",
      image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=300&fit=crop",
      icon: "Book",
      productCount: 445,
      description: "Books, courses, and learning materials",
      color: "from-indigo-500 to-blue-600",
      featured: false
    },
    {
      id: 7,
      name: "Automotive",
      image: "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=400&h=300&fit=crop",
      icon: "Car",
      productCount: 321,
      description: "Car parts, accessories, and tools",
      color: "from-gray-500 to-slate-600",
      featured: false
    },
    {
      id: 8,
      name: "Food & Beverages",
      image: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&h=300&fit=crop",
      icon: "Coffee",
      productCount: 756,
      description: "Fresh food, snacks, and beverages",
      color: "from-yellow-500 to-orange-600",
      featured: true
    }
  ];

  const handleCategoryHover = (categoryId) => {
    setHoveredCategory(categoryId);
  };

  const handleCategoryLeave = () => {
    setHoveredCategory(null);
  };

  const formatProductCount = (count) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
  };

  return (
    <section className="py-16 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Shop by Category
          </h2>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto">
            Explore thousands of products across all categories
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {categories.map((category) => (
            <Link
              key={category.id}
              to={`/product-catalog?category=${encodeURIComponent(category.name.toLowerCase())}`}
              className="group relative"
              onMouseEnter={() => handleCategoryHover(category.id)}
              onMouseLeave={handleCategoryLeave}
            >
              <div className="relative h-48 md:h-56 lg:h-64 rounded-lg overflow-hidden bg-card border border-border shadow-card hover:shadow-modal marketplace-transition">
                {/* Background Image */}
                <Image
                  src={category.image}
                  alt={category.name}
                  className="w-full h-full object-cover group-hover:scale-110 marketplace-transition"
                />

                {/* Gradient Overlay */}
                <div className={`absolute inset-0 bg-gradient-to-t ${category.color} opacity-60 group-hover:opacity-70 marketplace-transition`}></div>

                {/* Featured Badge */}
                {category.featured && (
                  <div className="absolute top-3 right-3">
                    <span className="px-2 py-1 bg-accent text-accent-foreground text-xs font-medium rounded-full">
                      Featured
                    </span>
                  </div>
                )}

                {/* Category Content */}
                <div className="absolute inset-0 flex flex-col justify-between p-4 text-white">
                  {/* Icon */}
                  <div className="flex justify-center mb-2">
                    <div className="w-12 h-12 md:w-16 md:h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:bg-white/30 marketplace-transition">
                      <Icon 
                        name={category.icon} 
                        size={24} 
                        className="text-white group-hover:scale-110 marketplace-transition" 
                      />
                    </div>
                  </div>

                  {/* Category Info */}
                  <div className="text-center">
                    <h3 className="text-lg md:text-xl font-bold mb-1 group-hover:scale-105 marketplace-transition">
                      {category.name}
                    </h3>
                    <p className="text-sm opacity-90 mb-2 line-clamp-2">
                      {category.description}
                    </p>
                    <div className="flex items-center justify-center space-x-1 text-sm font-medium">
                      <Icon name="Package" size={14} />
                      <span>{formatProductCount(category.productCount)} products</span>
                    </div>
                  </div>
                </div>

                {/* Hover Effect */}
                <div className={`absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 marketplace-transition flex items-center justify-center ${
                  hoveredCategory === category.id ? 'opacity-100' : ''
                }`}>
                  <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
                    <Icon name="ArrowRight" size={20} className="text-white" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Popular Categories */}
        <div className="mt-12">
          <h3 className="text-xl font-semibold text-foreground mb-6 text-center">
            Popular Categories
          </h3>
          <div className="flex flex-wrap justify-center gap-3">
            {categories
              .filter(cat => cat.featured)
              .map((category) => (
                <Link
                  key={`popular-${category.id}`}
                  to={`/product-catalog?category=${encodeURIComponent(category.name.toLowerCase())}`}
                  className="inline-flex items-center px-4 py-2 bg-card border border-border rounded-full text-sm font-medium text-foreground hover:bg-muted hover:border-primary marketplace-transition"
                >
                  <Icon name={category.icon} size={16} className="mr-2" />
                  {category.name}
                  <span className="ml-2 text-xs text-text-secondary">
                    ({formatProductCount(category.productCount)})
                  </span>
                </Link>
              ))}
          </div>
        </div>

        {/* View All Categories */}
        <div className="text-center mt-8">
          <Link to="/product-catalog">
            <button className="inline-flex items-center px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 marketplace-transition">
              <Icon name="Grid3x3" size={20} className="mr-2" />
              View All Categories
              <Icon name="ArrowRight" size={16} className="ml-2" />
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ProductCategoriesGrid;