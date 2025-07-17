import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';

const ProductCategoriesGrid = () => {
  const [hoveredCategory, setHoveredCategory] = useState(null);

  const categories = [
    {
      id: 1,
      name: "Electronics & Technology",
      image: "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&h=300&fit=crop",
      icon: "Smartphone",
      productCount: "2.5M+",
      description: "Smartphones, computers, and tech accessories",
      color: "#0A73B7",
      featured: true
    },
    {
      id: 2,
      name: "Fashion & Apparel",
      image: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=400&h=300&fit=crop",
      icon: "Shirt",
      productCount: "1.8M+",
      description: "Clothing, shoes, bags, and accessories",
      color: "#F56522",
      featured: true
    },
    {
      id: 3,
      name: "Home & Living",
      image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop",
      icon: "Home",
      productCount: "950K+",
      description: "Furniture, decor, and household items",
      color: "#0A73B7",
      featured: true
    },
    {
      id: 4,
      name: "Industrial Equipment",
      image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=300&fit=crop",
      icon: "Settings",
      productCount: "750K+",
      description: "Machinery, tools, and industrial supplies",
      color: "#F56522",
      featured: true
    },
    {
      id: 5,
      name: "Automotive & Transportation",
      image: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400&h=300&fit=crop",
      icon: "Car",
      productCount: "680K+",
      description: "Auto parts, vehicles, and accessories",
      color: "#0A73B7",
      featured: false
    },
    {
      id: 6,
      name: "Health & Beauty",
      image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=300&fit=crop",
      icon: "Heart",
      productCount: "520K+",
      description: "Cosmetics, skincare, and wellness products",
      color: "#F56522",
      featured: false
    },
    {
      id: 7,
      name: "Food & Agriculture",
      image: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&h=300&fit=crop",
      icon: "Apple",
      productCount: "430K+",
      description: "Fresh produce, processed foods, and beverages",
      color: "#0A73B7",
      featured: false
    },
    {
      id: 8,
      name: "Sports & Recreation",
      image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop",
      icon: "Dumbbell",
      productCount: "380K+",
      description: "Sports equipment and outdoor gear",
      color: "#F56522",
      featured: false
    }
  ];

  const featuredCategories = categories.filter(cat => cat.featured);
  const allCategories = categories;

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: '#111827' }}>
            Explore millions of offerings tailored to your business needs
          </h2>
          <p className="text-lg max-w-3xl mx-auto" style={{ color: '#6B7280' }}>
            Discover products and suppliers across thousands of categories from verified businesses nationwide
          </p>
        </div>

        {/* Featured Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {featuredCategories.map((category) => (
            <Link
              key={category.id}
              to={`/product-catalog?category=${category.name.toLowerCase().replace(/\s+/g, '-')}`}
              className="group relative overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
              onMouseEnter={() => setHoveredCategory(category.id)}
              onMouseLeave={() => setHoveredCategory(null)}
            >
              {/* Background Image */}
              <div className="aspect-w-16 aspect-h-12 relative">
                <Image
                  src={category.image}
                  alt={category.name}
                  className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div 
                  className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"
                  style={{ 
                    background: `linear-gradient(to top, ${category.color}CC, ${category.color}40, transparent)`
                  }}
                ></div>
              </div>

              {/* Content Overlay */}
              <div className="absolute inset-0 p-6 flex flex-col justify-end text-white">
                <div className="flex items-center mb-2">
                  <div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center mr-3"
                    style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
                  >
                    <Icon name={category.icon} size={20} color="white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{category.name}</h3>
                    <p className="text-sm opacity-90">{category.productCount} products</p>
                  </div>
                </div>
                <p className="text-sm opacity-80 group-hover:opacity-100 transition-opacity">
                  {category.description}
                </p>
              </div>

              {/* Hover Effect */}
              <div 
                className={`absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                  hoveredCategory === category.id ? 'scale-110' : 'scale-100'
                }`}
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
              >
                <Icon name="ArrowRight" size={16} color="white" />
              </div>
            </Link>
          ))}
        </div>

        {/* All Categories Grid */}
        <div className="mb-8">
          <h3 className="text-2xl font-bold mb-6 text-center" style={{ color: '#111827' }}>
            Browse All Categories
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {allCategories.map((category) => (
              <Link
                key={category.id}
                to={`/product-catalog?category=${category.name.toLowerCase().replace(/\s+/g, '-')}`}
                className="group p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200 text-center"
                style={{ backgroundColor: '#F3F4F6' }}
              >
                <div 
                  className="w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform"
                  style={{ backgroundColor: category.color }}
                >
                  <Icon name={category.icon} size={24} color="white" />
                </div>
                <h4 className="font-medium text-sm mb-1" style={{ color: '#111827' }}>
                  {category.name}
                </h4>
                <p className="text-xs" style={{ color: '#6B7280' }}>
                  {category.productCount}
                </p>
              </Link>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <Link to="/product-catalog">
            <button 
              className="px-8 py-3 text-white font-semibold rounded-lg hover:opacity-90 transition-opacity"
              style={{ backgroundColor: '#0A73B7' }}
            >
              View All Categories
              <Icon name="ArrowRight" size={16} className="ml-2 inline" />
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ProductCategoriesGrid;

