import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';
import Input from '../../../components/ui/Input';

const ShopProducts = ({ products, onProductClick, onAddToCart }) => {
  const [sortBy, setSortBy] = useState('newest');
  const [filterCategory, setFilterCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid');

  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'popular', label: 'Most Popular' },
    { value: 'rating', label: 'Highest Rated' }
  ];

  const categoryOptions = [
    { value: 'all', label: 'All Categories' },
    { value: 'electronics', label: 'Electronics' },
    { value: 'clothing', label: 'Clothing' },
    { value: 'home', label: 'Home & Garden' },
    { value: 'sports', label: 'Sports' },
    { value: 'books', label: 'Books' }
  ];

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-CM', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0
    }).format(price);
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || product.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.createdAt) - new Date(a.createdAt);
      case 'oldest':
        return new Date(a.createdAt) - new Date(b.createdAt);
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'popular':
        return b.sales - a.sales;
      case 'rating':
        return b.rating - a.rating;
      default:
        return 0;
    }
  });

  const ProductCard = ({ product }) => (
    <div className="bg-surface border border-border rounded-lg overflow-hidden marketplace-shadow-card hover:shadow-lg marketplace-transition group">
      <div className="relative aspect-square overflow-hidden">
        <Image
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 marketplace-transition"
        />
        {product.discount > 0 && (
          <div className="absolute top-2 left-2 bg-error text-error-foreground px-2 py-1 rounded-md text-xs font-medium">
            -{product.discount}%
          </div>
        )}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 marketplace-transition">
          <Button
            variant="ghost"
            size="icon"
            className="bg-surface/80 backdrop-blur-sm"
            iconName="Heart"
            iconSize={16}
          />
        </div>
      </div>
      
      <div className="p-3">
        <h3 
          className="font-medium text-foreground text-sm mb-1 line-clamp-2 cursor-pointer hover:text-primary marketplace-transition"
          onClick={() => onProductClick(product)}
        >
          {product.name}
        </h3>
        
        <div className="flex items-center space-x-1 mb-2">
          <Icon name="Star" size={12} className="text-warning fill-current" />
          <span className="text-xs text-text-secondary">
            {product.rating} ({product.reviewCount})
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-primary text-sm font-mono">
              {formatPrice(product.price)}
            </span>
            {product.originalPrice && (
              <span className="text-xs text-text-secondary line-through font-mono">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>
          
          <Button
            variant="outline"
            size="xs"
            onClick={() => onAddToCart(product)}
            iconName="ShoppingCart"
            iconSize={12}
          />
        </div>
        
        {product.stock <= 5 && product.stock > 0 && (
          <div className="mt-2 text-xs text-warning">
            Only {product.stock} left in stock
          </div>
        )}
        
        {product.stock === 0 && (
          <div className="mt-2 text-xs text-error">
            Out of stock
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Filters and Search */}
      <div className="bg-surface border border-border rounded-lg p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-3 md:space-y-0 md:space-x-4">
          <div className="flex-1">
            <Input
              type="search"
              placeholder="Search products in this shop..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>
          
          <div className="flex items-center space-x-3">
            <Select
              options={categoryOptions}
              value={filterCategory}
              onChange={setFilterCategory}
              placeholder="Category"
              className="w-40"
            />
            
            <Select
              options={sortOptions}
              value={sortBy}
              onChange={setSortBy}
              placeholder="Sort by"
              className="w-40"
            />
            
            <div className="flex items-center border border-border rounded-md">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 marketplace-transition ${
                  viewMode === 'grid' ?'bg-primary text-primary-foreground' :'text-text-secondary hover:text-foreground'
                }`}
              >
                <Icon name="Grid3X3" size={16} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 marketplace-transition ${
                  viewMode === 'list' ?'bg-primary text-primary-foreground' :'text-text-secondary hover:text-foreground'
                }`}
              >
                <Icon name="List" size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      {sortedProducts.length > 0 ? (
        <div className={`grid gap-4 ${
          viewMode === 'grid' ?'grid-cols-2 md:grid-cols-3 lg:grid-cols-4' :'grid-cols-1'
        }`}>
          {sortedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Icon name="Package" size={48} className="mx-auto mb-4 text-text-secondary" />
          <h3 className="text-lg font-medium text-foreground mb-2">No products found</h3>
          <p className="text-text-secondary">
            {searchQuery || filterCategory !== 'all' ?'Try adjusting your search or filters' :'This shop hasn\'t added any products yet'}
          </p>
        </div>
      )}
    </div>
  );
};

export default ShopProducts;