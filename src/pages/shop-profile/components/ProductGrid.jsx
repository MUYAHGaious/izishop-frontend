import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';
import useCartAuth from '../../../hooks/useCartAuth';
import { showToast } from '../../../components/ui/Toast';

const ProductGrid = ({ products, shopId }) => {
  const [sortBy, setSortBy] = useState('newest');
  const [filterCategory, setFilterCategory] = useState('all');
  const { handleAddToCart, handleAddToWishlist } = useCartAuth();

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

  const onAddToCart = async (product, e) => {
    e.preventDefault();
    e.stopPropagation();
    
    await handleAddToCart(product, 1, {}, async () => {
      // Success callback - this runs if user is authenticated
      console.log('Product added to cart:', product);
      showToast(`${product.name} added to cart!`, 'success');
    });
  };

  const onAddToWishlist = async (product, e) => {
    e.preventDefault();
    e.stopPropagation();
    
    await handleAddToWishlist(product, async () => {
      // Success callback
      console.log('Product added to wishlist:', product);
      showToast(`${product.name} added to wishlist!`, 'success');
    });
  };

  // Filter and sort products
  const filteredAndSortedProducts = React.useMemo(() => {
    let filtered = [...products];

    // Apply category filter
    if (filterCategory !== 'all') {
      filtered = filtered.filter(product => product.category === filterCategory);
    }

    // Apply sorting
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'popular':
        filtered.sort((a, b) => (b.sales || 0) - (a.sales || 0));
        break;
      case 'newest':
      default:
        filtered.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
        break;
    }

    return filtered;
  }, [products, filterCategory, sortBy]);

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

      {/* Products Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-text-secondary">
          Showing {filteredAndSortedProducts.length} of {products.length} products
        </p>
      </div>

      {/* Products Grid */}
      {filteredAndSortedProducts.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {filteredAndSortedProducts.map((product) => (
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
                  onClick={(e) => onAddToWishlist(product, e)}
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
                  onClick={(e) => onAddToCart(product, e)}
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
      ) : (
        <div className="text-center py-12">
          <Icon name="Package" size={48} className="text-text-secondary mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-text-primary mb-2">No products found</h3>
          <p className="text-text-secondary">
            {filterCategory !== 'all' ? 'Try changing the category filter' : 'This shop has no products yet'}
          </p>
        </div>
      )}

      {/* Load More */}
      {filteredAndSortedProducts.length >= 12 && (
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