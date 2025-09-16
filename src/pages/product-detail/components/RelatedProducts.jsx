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
    <div className="bg-white border border-teal-200 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-teal-200/50">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Related Products</h2>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => scroll('left')}
              className="p-3 rounded-xl border border-teal-300 text-teal-600 hover:text-teal-700 hover:bg-teal-50 transition-all duration-300"
            >
              <Icon name="ChevronLeft" size={20} />
            </button>
            <button
              onClick={() => scroll('right')}
              className="p-3 rounded-xl border border-teal-300 text-teal-600 hover:text-teal-700 hover:bg-teal-50 transition-all duration-300"
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
              className="flex-shrink-0 w-64 bg-white border border-teal-200 rounded-2xl overflow-hidden transition-all duration-300 group"
            >
              {/* Product Image */}
              <div className="relative aspect-square overflow-hidden">
                <Image
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                
                {/* Badges */}
                <div className="absolute top-2 left-2 space-y-1">
                  {product.discount && (
                    <span className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1 rounded-full text-xs font-medium shadow-sm">
                      -{product.discount}%
                    </span>
                  )}
                  {product.isSecondHand && (
                    <span className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white px-3 py-1 rounded-full text-xs font-medium shadow-sm">
                      Second-hand
                    </span>
                  )}
                </div>

                {/* Quick Actions */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <button className="p-2 bg-white/90 backdrop-blur-sm rounded-full text-gray-500 hover:text-teal-600 hover:bg-white transition-all duration-300">
                    <Icon name="Heart" size={16} />
                  </button>
                </div>

                {/* Stock Status */}
                {!product.inStock && (
                  <div className="absolute inset-0 bg-gray-900/80 flex items-center justify-center">
                    <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                      Out of Stock
                    </span>
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="p-4 space-y-3">
                {/* Product Name */}
                <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-teal-600 transition-colors duration-300">
                  {product.name || 'Unnamed Product'}
                </h3>

                {/* Shop Info */}
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500 truncate">
                    {product.shop?.name || 'Unknown Shop'}
                  </span>
                  {product.shop?.isVerified && (
                    <Icon name="BadgeCheck" size={14} className="text-teal-600 flex-shrink-0" />
                  )}
                </div>

                {/* Rating */}
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1">
                    <Icon name="Star" size={14} className="text-yellow-400 fill-current" />
                    <span className="text-sm font-medium text-gray-900">
                      {product.rating || '0.0'}
                    </span>
                  </div>
                  <span className="text-sm text-gray-500">
                    ({product.reviewCount || 0})
                  </span>
                </div>

                {/* Pricing */}
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg font-bold text-teal-600 font-mono">
                      {formatPrice(product.price || 0)}
                    </span>
                    {product.originalPrice && (
                      <span className="text-sm text-gray-500 line-through font-mono">
                        {formatPrice(product.originalPrice)}
                      </span>
                    )}
                  </div>
                  
                  {product.isSecondHand && product.condition && (
                    <div className="flex items-center space-x-1">
                      <Icon name="RefreshCw" size={12} className="text-teal-600" />
                      <span className="text-xs text-teal-600">
                        Condition: {product.condition}
                      </span>
                    </div>
                  )}
                </div>

                {/* Add to Cart Button */}
                <Button
                  className={`mt-3 w-full py-2 rounded-xl font-medium transition-all duration-300 ${
                    product.inStock 
                      ? 'border-teal-300 text-teal-600 hover:bg-teal-50 hover:border-teal-400' 
                      : 'border-gray-300 text-gray-400 cursor-not-allowed'
                  }`}
                  variant="outline"
                  size="sm"
                  fullWidth
                  disabled={!product.inStock}
                  onClick={() => handleAddToCart(product)}
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
      <div className="p-6 border-t border-teal-200/50 text-center">
        <Link to={`/product-catalog?category=${category}`}>
          <Button 
            className="border-teal-300 text-teal-600 hover:bg-teal-50 hover:border-teal-400 px-6 py-3 rounded-xl font-medium transition-all duration-300"
            variant="outline"
          >
            View All {category} Products
            <Icon name="ArrowRight" size={16} className="ml-2" />
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default RelatedProducts;