import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';

const ProductCard = ({ product, onAddToCart, onToggleWishlist }) => {
  const [isWishlisted, setIsWishlisted] = useState(product.isWishlisted || false);
  const [isLoading, setIsLoading] = useState(false);

  const handleWishlistToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsWishlisted(!isWishlisted);
    if (onToggleWishlist) {
      await onToggleWishlist(product.id, !isWishlisted);
    }
  };

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsLoading(true);
    try {
      if (onAddToCart) {
        await onAddToCart(product);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price).replace('XAF', 'XAF');
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Icon key={i} name="Star" size={12} className="text-amber-400 fill-current" />
      );
    }

    if (hasHalfStar) {
      stars.push(
        <Icon key="half" name="Star" size={12} className="text-amber-400 fill-current opacity-50" />
      );
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <Icon key={`empty-${i}`} name="Star" size={12} className="text-gray-300" />
      );
    }

    return stars;
  };

  return (
    <div className="group bg-card rounded-lg border border-border hover:shadow-moderate transition-all duration-200 overflow-hidden">
      {/* Product Image */}
      <div className="relative aspect-square overflow-hidden bg-muted">
        <Link to={`/product-detail-modal?id=${product.id}`}>
          <Image
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </Link>
        
        {/* Wishlist Button */}
        <button
          onClick={handleWishlistToggle}
          className={`absolute top-2 right-2 p-2 rounded-full transition-all duration-200 ${
            isWishlisted 
              ? 'bg-red-500 text-white shadow-moderate' 
              : 'bg-white/80 text-text-secondary hover:bg-white hover:text-red-500'
          }`}
        >
          <Icon 
            name="Heart" 
            size={16} 
            className={isWishlisted ? 'fill-current' : ''} 
          />
        </button>

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {product.isNew && (
            <span className="px-2 py-1 bg-success text-success-foreground text-xs font-medium rounded">
              New
            </span>
          )}
          {product.discount && (
            <span className="px-2 py-1 bg-destructive text-destructive-foreground text-xs font-medium rounded">
              -{product.discount}%
            </span>
          )}
          {product.isBestSeller && (
            <span className="px-2 py-1 bg-accent text-accent-foreground text-xs font-medium rounded">
              Best Seller
            </span>
          )}
        </div>

        {/* Quick Actions Overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
          <div className="flex gap-2">
            <Link to={`/product-detail-modal?id=${product.id}`}>
              <Button variant="secondary" size="sm" iconName="Eye">
                Quick View
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-3">
        {/* Shop Name */}
        <Link 
          to={`/shop-profile?id=${product.shopId}`}
          className="text-xs text-text-secondary hover:text-primary transition-colors mb-1 block"
        >
          {product.shopName}
        </Link>

        {/* Product Name */}
        <Link to={`/product-detail-modal?id=${product.id}`}>
          <h3 className="font-medium text-text-primary line-clamp-2 hover:text-primary transition-colors mb-1">
            {product.name}
          </h3>
        </Link>

        {/* Rating */}
        <div className="flex items-center gap-1 mb-1">
          <div className="flex items-center">
            {renderStars(product.rating)}
          </div>
          <span className="text-xs text-text-secondary ml-1">
            ({product.reviewCount})
          </span>
        </div>

        {/* Price */}
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg font-semibold text-text-primary">
            {formatPrice(product.price)}
          </span>
          {product.originalPrice && product.originalPrice > product.price && (
            <span className="text-sm text-text-secondary line-through">
              {formatPrice(product.originalPrice)}
            </span>
          )}
        </div>

        {/* Stock Status */}
        <div className="flex items-center gap-2 mb-2">
          <div className={`w-2 h-2 rounded-full ${
            product.stock > 10 ? 'bg-success' : 
            product.stock > 0 ? 'bg-warning' : 'bg-destructive'
          }`} />
          <span className={`text-xs ${
            product.stock > 10 ? 'text-success' : 
            product.stock > 0 ? 'text-warning' : 'text-destructive'
          }`}>
            {product.stock > 10 ? 'In Stock' : 
             product.stock > 0 ? `Only ${product.stock} left` : 'Out of Stock'}
          </span>
        </div>

        {/* Add to Cart Button */}
        <Button
          variant="default"
          size="sm"
          fullWidth
          loading={isLoading}
          disabled={product.stock === 0}
          onClick={handleAddToCart}
          iconName="ShoppingCart"
          iconPosition="left"
        >
          {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
        </Button>
      </div>
    </div>
  );
};

export default ProductCard;