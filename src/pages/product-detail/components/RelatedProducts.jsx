import React, { useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Image from '../../../components/AppImage';
import { useAuth } from '../../../contexts/AuthContext';
import { useCart } from '../../../contexts/CartContext';
import { useWishlist } from '../../../contexts/WishlistContext';
import { showToast } from '../../../components/ui/Toast';

const RelatedProducts = ({ currentProductId, category, relatedProducts = [] }) => {
  const scrollRef = useRef(null);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  const handleAddToCart = async (product) => {
    if (!isAuthenticated()) {
      showToast('Please log in to add items to your cart', 'info', 3000);
      navigate('/authentication-login-register');
      return;
    }

    try {
      await addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        shopId: product.shop?.id,
        shopName: product.shop?.name
      });
      showToast(`${product.name} added to cart!`, 'success', 2000);
    } catch (error) {
      console.error('Error adding to cart:', error);
      showToast('Failed to add item to cart', 'error', 3000);
    }
  };

  const handleWishlistToggle = async (product) => {
    if (!isAuthenticated()) {
      showToast('Please log in to manage your wishlist', 'info', 3000);
      navigate('/authentication-login-register');
      return;
    }

    try {
      if (isInWishlist(product.id)) {
        await removeFromWishlist(product.id);
        showToast('Removed from wishlist', 'success', 2000);
      } else {
        await addToWishlist({
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.image,
          shopId: product.shop?.id,
          shopName: product.shop?.name
        });
        showToast('Added to wishlist', 'success', 2000);
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
      showToast('Failed to update wishlist', 'error', 3000);
    }
  };

  const handleProductClick = (productId) => {
    navigate(`/product-detail?id=${productId}`);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-CM', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0
    }).format(price);
  };

  const calculateDiscount = (originalPrice, currentPrice) => {
    if (!originalPrice || originalPrice <= currentPrice) return null;
    return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
  };

  if (!relatedProducts || relatedProducts.length === 0) {
    return null;
  }

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="bg-surface border border-border rounded-lg overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-foreground">Related Products</h2>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => scroll('left')}
              className="p-2 rounded-full border border-border text-text-secondary hover:text-foreground hover:bg-muted marketplace-transition"
            >
              <Icon name="ChevronLeft" size={20} />
            </button>
            <button
              onClick={() => scroll('right')}
              className="p-2 rounded-full border border-border text-text-secondary hover:text-foreground hover:bg-muted marketplace-transition"
            >
              <Icon name="ChevronRight" size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Products Carousel */}
      <div className="p-6">
        <div
          ref={scrollRef}
          className="flex space-x-4 overflow-x-auto scrollbar-hide scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {relatedProducts.map((product) => (
            <Link
              key={product.id}
              to={`/product-detail?id=${product.id}`}
              className="flex-shrink-0 w-64 bg-surface border border-border rounded-lg overflow-hidden hover:shadow-modal marketplace-transition group"
            >
              {/* Product Image */}
              <div className="relative aspect-square overflow-hidden">
                <Image
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 marketplace-transition"
                />
                
                {/* Badges */}
                <div className="absolute top-2 left-2 space-y-1">
                  {product.discount && (
                    <span className="bg-error text-error-foreground px-2 py-1 rounded-full text-xs font-medium">
                      -{product.discount}%
                    </span>
                  )}
                  {product.isSecondHand && (
                    <span className="bg-secondary text-secondary-foreground px-2 py-1 rounded-full text-xs font-medium">
                      Second-hand
                    </span>
                  )}
                </div>

                {/* Quick Actions */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 marketplace-transition">
                  <button className="p-2 bg-surface/80 backdrop-blur-sm rounded-full text-text-secondary hover:text-foreground hover:bg-surface marketplace-transition">
                    <Icon name="Heart" size={16} />
                  </button>
                </div>

                {/* Stock Status */}
                {!product.inStock && (
                  <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                    <span className="bg-error text-error-foreground px-3 py-1 rounded-full text-sm font-medium">
                      Out of Stock
                    </span>
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="p-4 space-y-3">
                {/* Product Name */}
                <h3 className="font-semibold text-foreground line-clamp-2 group-hover:text-primary marketplace-transition">
                  {product.name}
                </h3>

                {/* Shop Info */}
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-text-secondary truncate">
                    {product.shop.name}
                  </span>
                  {product.shop.isVerified && (
                    <Icon name="BadgeCheck" size={14} className="text-primary flex-shrink-0" />
                  )}
                </div>

                {/* Rating */}
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1">
                    <Icon name="Star" size={14} className="text-warning fill-current" />
                    <span className="text-sm font-medium text-foreground">
                      {product.rating}
                    </span>
                  </div>
                  <span className="text-sm text-text-secondary">
                    ({product.reviewCount})
                  </span>
                </div>

                {/* Pricing */}
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg font-bold text-primary font-mono">
                      {formatPrice(product.price)}
                    </span>
                    {product.originalPrice && (
                      <span className="text-sm text-text-secondary line-through font-mono">
                        {formatPrice(product.originalPrice)}
                      </span>
                    )}
                  </div>
                  
                  {product.isSecondHand && product.condition && (
                    <div className="flex items-center space-x-1">
                      <Icon name="RefreshCw" size={12} className="text-secondary" />
                      <span className="text-xs text-secondary">
                        Condition: {product.condition}
                      </span>
                    </div>
                  )}
                </div>

                {/* Add to Cart Button */}
                <Button
                  variant="outline"
                  size="sm"
                  fullWidth
                  disabled={!product.inStock}
                  onClick={() => handleAddToCart(product)}
                  className="mt-3"
                >
                  <Icon name="ShoppingCart" size={14} className="mr-2" />
                  {product.inStock ? 'Add to Cart' : 'Out of Stock'}
                </Button>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* View All Button */}
      <div className="p-6 border-t border-border text-center">
        <Link to={`/product-catalog?category=${category}`}>
          <Button variant="outline">
            View All {category} Products
            <Icon name="ArrowRight" size={16} className="ml-2" />
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default RelatedProducts;