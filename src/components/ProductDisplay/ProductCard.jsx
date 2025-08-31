import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../AppIcon';
import Image from '../AppImage';
import Button from '../ui/Button';
import { useWishlist } from '../../contexts/WishlistContext';
import { getProductTags } from '../../utils/productTags';
import TagList from '../ui/Tag';

const ProductCard = ({ 
  product, 
  variant = 'default',
  showWishlist = true,
  showBadges = true,
  showQuickActions = false,
  showDescription = false,
  showShopInfo = true,
  showRating = true,
  showStock = true,
  onAddToCart,
  onToggleWishlist,
  className = "",
  ...props 
}) => {
  // Safety check for product
  if (!product || !product.id) {
    console.warn('ProductCard: Invalid product data received', product);
    return null;
  }

  const { isInWishlist, toggleWishlist, isLoading: wishlistLoading } = useWishlist();
  const [isLoading, setIsLoading] = useState(false);
  
  // Check if this product is in the wishlist
  const isWishlisted = isInWishlist(product.id);

  // Variant configurations
  const variants = {
    default: {
      container: "bg-card rounded-lg border border-border hover:shadow-moderate transition-all duration-200 overflow-hidden",
      imageContainer: "relative aspect-square overflow-hidden bg-muted",
      content: "p-2",
      title: "font-medium text-text-primary line-clamp-2 hover:text-primary transition-colors mb-2",
      price: "text-lg font-semibold text-text-primary"
    },
    compact: {
      container: "bg-transparent border-none hover:bg-muted/50 rounded-lg p-2 transition-all duration-200",
      imageContainer: "relative aspect-square overflow-hidden bg-muted rounded-md",
      content: "p-2",
      title: "font-medium text-text-primary line-clamp-1 hover:text-primary transition-colors mb-1 text-sm",
      price: "text-sm font-semibold text-text-primary"
    },
    detailed: {
      container: "bg-card rounded-lg border border-border hover:shadow-moderate transition-all duration-200 overflow-hidden",
      imageContainer: "relative aspect-square overflow-hidden bg-muted",
      content: "p-4",
      title: "font-semibold text-text-primary hover:text-primary transition-colors mb-3 text-lg",
      price: "text-xl font-bold text-text-primary"
    },
    horizontal: {
      container: "bg-card rounded-lg border border-border p-3 flex gap-3",
      imageContainer: "relative w-20 h-20 overflow-hidden bg-muted rounded-md flex-shrink-0",
      content: "flex-1 min-w-0",
      title: "font-medium text-text-primary line-clamp-2 hover:text-primary transition-colors mb-2",
      price: "text-base font-semibold text-text-primary"
    }
  };

  const config = variants[variant] || variants.default;

  const handleWishlistToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      const result = await toggleWishlist(product);
      
      // Call the optional callback if provided
      if (onToggleWishlist) {
        await onToggleWishlist(product.id, !isWishlisted);
      }
      
      // Show toast notification
      if (result.success) {
        // You can implement a toast notification system here
        console.log(result.message);
        
        // Example: Show a simple alert (replace with proper toast)
        if (result.message.includes('Added')) {
          // Show success message
          console.log('✅ Added to wishlist');
        } else if (result.message.includes('Removed')) {
          // Show removal message
          console.log('🗑️ Removed from wishlist');
        }
      } else {
        console.warn(result.message);
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
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

  const renderImage = () => (
    <div className={config.imageContainer}>
      <Link to={`/product-detail-modal?id=${product.id}`}>
        <Image
          src={product.image_urls?.[0] || product.image || '/assets/images/no_image.png'}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </Link>
      
      {showWishlist && (
        <button
          onClick={handleWishlistToggle}
          disabled={wishlistLoading}
          className={`absolute top-2 right-2 p-2 rounded-full transition-all duration-200 ${
            isWishlisted 
              ? 'bg-red-500 text-white shadow-moderate' 
              : 'bg-white/80 text-text-secondary hover:bg-white hover:text-red-500'
          } ${wishlistLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {wishlistLoading ? (
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          ) : (
            <Icon 
              name="Heart" 
              size={16} 
              className={isWishlisted ? 'fill-current' : ''} 
            />
          )}
        </button>
      )}
      
             {showBadges && (
         <div className="absolute top-2 left-2 flex flex-col gap-1">
           <TagList
             tags={getProductTags(product)}
             size="xs"
             maxTags={3}
             className="flex-col gap-1"
             onTagClick={(tag) => console.log(`Clicked on ${tag.label} tag for ${product.name}`)}
           />
         </div>
       )}
      
      {showQuickActions && (
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
          <div className="flex gap-2">
            <Link to={`/product-detail-modal?id=${product.id}`}>
              <Button variant="secondary" size="sm" iconName="Eye">
                Quick View
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );

  const renderContent = () => (
    <div className={config.content}>
      {showShopInfo && product.shopName && (
        <Link 
          to={`/shop-profile?id=${product.shopId}`}
          className="text-xs text-text-secondary hover:text-primary transition-colors mb-1 block"
        >
          {product.shopName}
        </Link>
      )}

      <Link to={`/product-detail-modal?id=${product.id}`}>
        <h3 className={config.title}>
          {product.name}
        </h3>
      </Link>

      {showDescription && product.description && (
        <p className="text-text-secondary text-sm mb-3 line-clamp-3">
          {product.description}
        </p>
      )}

      {showRating && (
        <div className="flex items-center gap-1 mb-2">
          <div className="flex items-center">
            {renderStars(product.rating)}
          </div>
          <span className="text-xs text-text-secondary ml-1">
            ({product.reviewCount})
          </span>
        </div>
      )}

      <div className="flex items-center gap-2 mb-3">
        <span className={config.price}>
          {formatPrice(product.price)}
        </span>
        {product.originalPrice && product.originalPrice > product.price && (
          <span className="text-sm text-text-secondary line-through">
            {formatPrice(product.originalPrice)}
          </span>
        )}
      </div>

      {showStock && (
        <div className="flex items-center gap-2 mb-3">
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
      )}

      <div className="mt-2">
        <Button
          variant="default"
          size="sm"
          fullWidth={variant !== 'horizontal'}
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

  if (variant === 'horizontal') {
    return (
      <div className={`group ${config.container} ${className}`} {...props}>
        {renderImage()}
        {renderContent()}
      </div>
    );
  }

  return (
    <div className={`group ${config.container} ${className}`} {...props}>
      {renderImage()}
      {renderContent()}
    </div>
  );
};

export default ProductCard;
