import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';
import { useWishlist } from '../../../contexts/WishlistContext';

const ProductCard = ({ product, onAddToCart, onToggleWishlist }) => {
  const [isLoading, setIsLoading] = useState(false);
  const { isInWishlist, toggleWishlist, isLoading: wishlistLoading } = useWishlist();

  const handleWishlistToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      // Use the WishlistContext which has batch system integration
      const result = await toggleWishlist(product);
      console.log('🔄 Wishlist toggle result:', result);

      // Also call the parent callback if provided (for backward compatibility)
      if (onToggleWishlist) {
        await onToggleWishlist(product.id, !isInWishlist(product.id));
      }
    } catch (error) {
      console.error('Failed to toggle wishlist:', error);
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
            src={product.image_urls?.[0] || product.image || '/assets/images/no_image.png'}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </Link>
        
        {/* Wishlist Button */}
        <button
          onClick={handleWishlistToggle}
          disabled={wishlistLoading}
          className={`absolute top-2 right-2 p-2 rounded-full transition-all duration-200 ${
            isInWishlist(product.id)
              ? 'bg-red-500 text-white shadow-moderate'
              : 'bg-white/80 text-text-secondary hover:bg-white hover:text-red-500'
          } ${wishlistLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <Icon
            name="Heart"
            size={16}
            className={`${isInWishlist(product.id) ? 'fill-current' : ''} ${wishlistLoading ? 'animate-pulse' : ''}`}
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
        {/* Enhanced Shop Info Section - More Prominent */}
        <div className="mb-3 p-3 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border border-gray-200 shadow-sm">
          {/* DEBUG: Shop Data Display */}
          <div className="mb-2 p-2 bg-red-100 border border-red-300 rounded text-xs">
            <div><strong>DEBUG - Shop Data:</strong></div>
            <div>shopName: {JSON.stringify(product.shopName)}</div>
            <div>shopId: {JSON.stringify(product.shopId)}</div>
            <div>shopVerified: {JSON.stringify(product.shopVerified)}</div>
            <div>shopRating: {JSON.stringify(product.shopRating)}</div>
          </div>

          {/* Shop Name and Trust Signals */}
          <div className="flex items-center justify-between mb-2">
            <Link
              to={`/shop-profile?id=${product.shopId}`}
              className="flex items-center space-x-2 text-sm font-semibold text-gray-800 hover:text-teal-600 transition-colors flex-1 group"
            >
             <div className="flex items-center space-x-2">
               <div className="w-6 h-6 bg-teal-100 rounded-full flex items-center justify-center">
                 <Icon name="Store" size={12} className="text-teal-600" />
               </div>
               <span className="truncate font-medium">{product.shopName || 'IziShopin Store'}</span>
             </div>
              
              {/* Trust Badges */}
              <div className="flex items-center space-x-1">
               {product.shopVerified && (
                 <div className="flex items-center space-x-1 bg-green-100 px-2 py-1 rounded-full">
                   <Icon name="CheckCircle" size={10} className="text-green-600" />
                   <span className="text-xs font-medium text-green-700">Verified</span>
                 </div>
               )}
               {product.shopRating >= 4.5 && (
                 <div className="flex items-center space-x-1 bg-yellow-100 px-2 py-1 rounded-full">
                   <Icon name="Star" size={10} className="text-yellow-600 fill-current" />
                   <span className="text-xs font-medium text-yellow-700">Top Seller</span>
                 </div>
               )}
              </div>
            </Link>
          </div>

          {/* Shop Rating, Location, and Type */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center space-x-3">
              {product.shopRating ? (
                <div className="flex items-center space-x-1">
                  <Icon name="Star" size={12} className="text-amber-400 fill-current" />
                  <span className="text-gray-700 font-medium">
                    {product.shopRating.toFixed(1)}
                  </span>
                </div>
              ) : (
                <span className="text-gray-500">New shop</span>
              )}
              
              {/* Shop Location */}
              <div className="flex items-center space-x-1 text-gray-500">
                <Icon name="MapPin" size={10} />
                <span>{product.shopLocation || 'Cameroon'}</span>
              </div>
            </div>

            {/* Seller Type Badge */}
            {product.sellerType && (
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                product.sellerType === 'shop_owner'
                  ? 'bg-teal-100 text-teal-700 border border-teal-200'
                  : product.sellerType === 'casual_seller'
                  ? 'bg-orange-100 text-orange-700 border border-orange-200'
                  : 'bg-gray-100 text-gray-700 border border-gray-200'
              }`}>
                {product.sellerType === 'shop_owner' ? 'Professional' :
                 product.sellerType === 'casual_seller' ? 'Individual' : 'Store'}
              </span>
            )}
          </div>
        </div>

        {/* Product Name */}
        <Link to={`/product-detail-modal?id=${product.id}`}>
          <h3 className="font-medium text-text-primary line-clamp-2 hover:text-primary transition-colors mb-2">
            {product.name}
          </h3>
        </Link>

        {/* Rating */}
        <div className="flex items-center gap-1 mb-2">
          <div className="flex items-center">
            {renderStars(product.rating)}
          </div>
          <span className="text-xs text-text-secondary ml-1">
            ({product.reviewCount})
          </span>
        </div>

        {/* Price */}
        <div className="flex items-center gap-2 mb-3">
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