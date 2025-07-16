import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';

const ProductGrid = ({ products, shopId }) => {
  const [sortBy, setSortBy] = useState('newest');
  const [filterCategory, setFilterCategory] = useState('all');

  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'popular', label: 'Most Popular' },
    { value: 'rating', label: 'Highest Rated' }
  ];

  const categoryOptions = [
    { value: 'all', label: 'All Categories' },
    { value: 'electronics', label: 'Electronics' },
    { value: 'fashion', label: 'Fashion' },
    { value: 'home', label: 'Home & Garden' },
    { value: 'sports', label: 'Sports' },
    { value: 'books', label: 'Books' }
  ];

  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-CM', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0
    }).format(price);
  };

  const handleAddToCart = (product, e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Adding to cart:', product);
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Select
            label="Sort by"
            options={sortOptions}
            value={sortBy}
            onChange={setSortBy}
          />
        </div>
        <div className="flex-1">
          <Select
            label="Category"
            options={categoryOptions}
            value={filterCategory}
            onChange={setFilterCategory}
          />
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {products.map((product) => (
          <Link
            key={product.id}
            to={`/product-detail-modal?id=${product.id}`}
            className="group bg-surface rounded-xl border border-border overflow-hidden hover:shadow-elevated transition-all duration-300 hover:-translate-y-1"
          >
            {/* Product Image */}
            <div className="relative aspect-square overflow-hidden bg-muted">
              <Image
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              
              {/* Badges */}
              <div className="absolute top-2 left-2 flex flex-col gap-1">
                {product.isNew && (
                  <span className="bg-success text-success-foreground text-xs font-medium px-2 py-1 rounded-full">
                    New
                  </span>
                )}
                {product.discount > 0 && (
                  <span className="bg-error text-error-foreground text-xs font-medium px-2 py-1 rounded-full">
                    -{product.discount}%
                  </span>
                )}
              </div>

              {/* Quick Actions */}
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="icon"
                  className="bg-white/90 backdrop-blur-sm hover:bg-white"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('Add to wishlist:', product);
                  }}
                >
                  <Icon name="Heart" size={16} />
                </Button>
              </div>

              {/* Add to Cart Button */}
              <div className="absolute bottom-2 left-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="default"
                  size="sm"
                  fullWidth
                  iconName="ShoppingCart"
                  iconPosition="left"
                  onClick={(e) => handleAddToCart(product, e)}
                  className="bg-white/90 backdrop-blur-sm text-primary hover:bg-white"
                >
                  Add to Cart
                </Button>
              </div>
            </div>

            {/* Product Info */}
            <div className="p-3 md:p-4">
              <h3 className="font-medium text-text-primary text-sm md:text-base line-clamp-2 mb-2 group-hover:text-primary transition-colors">
                {product.name}
              </h3>
              
              <div className="flex items-center gap-1 mb-2">
                <Icon name="Star" size={12} className="text-accent fill-current" />
                <span className="text-xs text-text-secondary">{product.rating}</span>
                <span className="text-xs text-text-secondary">({product.reviewCount})</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="font-bold text-primary text-sm md:text-base">
                    {formatPrice(product.price)}
                  </span>
                  {product.originalPrice && product.originalPrice > product.price && (
                    <span className="text-xs text-text-secondary line-through">
                      {formatPrice(product.originalPrice)}
                    </span>
                  )}
                </div>
                
                <div className="flex items-center gap-1 text-xs text-text-secondary">
                  <Icon name="Package" size={12} />
                  <span>{product.stock}</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Load More */}
      {products.length >= 12 && (
        <div className="text-center pt-6">
          <Button variant="outline" iconName="ChevronDown" iconPosition="right">
            Load More Products
          </Button>
        </div>
      )}
    </div>
  );
};

export default ProductGrid;