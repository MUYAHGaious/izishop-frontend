import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { showToast } from '../../../components/ui/Toast';
import { useAuth } from '../../../contexts/AuthContext';

const StickyPurchaseBar = ({ product, selectedVariant, quantity, onQuantityChange, onAddToCart }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const windowHeight = window.innerHeight;
      
      // Show sticky bar when user scrolls past the main product info
      setIsVisible(scrollPosition > windowHeight * 0.5);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-CM', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0
    }).format(price);
  };

  const handleAddToCart = async () => {
    if (!product || !product.inStock) return;

    // Check if user is authenticated
    if (!isAuthenticated()) {
      showToast({
        type: 'info',
        message: 'Please log in to add items to your cart',
        duration: 3000
      });
      navigate('/authentication-login-register');
      return;
    }

    setIsAddingToCart(true);
    
    try {
      // Use the parent component's addToCart function
      if (onAddToCart) {
        await onAddToCart();
        showToast(`${product.name} added to cart!`, 'success', 3000);
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      showToast('Failed to add item to cart', 'error', 3000);
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleBuyNow = () => {
    if (!product || !product.inStock) return;

    // Check if user is authenticated
    if (!isAuthenticated()) {
      showToast({
        type: 'info',
        message: 'Please log in to place an order',
        duration: 3000
      });
      navigate('/authentication-login-register');
      return;
    }

    // Add to cart first
    handleAddToCart();
    
    // Navigate to checkout
    setTimeout(() => {
      navigate('/shopping-cart');
    }, 500);
  };

  const handleQuantityChange = (change) => {
    const newQuantity = quantity + change;
    const maxStock = selectedVariant?.stock || product?.stock || 99;
    
    if (newQuantity >= 1 && newQuantity <= maxStock) {
      onQuantityChange(newQuantity);
    }
  };

  if (!product || !isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-surface border-t border-border shadow-modal z-1000 marketplace-transition">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-3">
          {/* Product Info - Hidden on mobile */}
          <div className="hidden md:flex items-center space-x-4 flex-1">
            <img
              src={product.images?.[0] || '/assets/images/no_image.png'}
              alt={product.name}
              className="w-12 h-12 rounded-md object-cover"
            />
            <div className="min-w-0">
              <h3 className="font-semibold text-foreground truncate">
                {product.name}
              </h3>
              <div className="flex items-center space-x-2">
                <span className="text-lg font-bold text-primary font-mono">
                  {formatPrice(selectedVariant?.price || product.price)}
                </span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <span className="text-sm text-text-secondary line-through font-mono">
                    {formatPrice(product.originalPrice)}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Mobile Price Display */}
          <div className="md:hidden flex items-center space-x-2">
            <span className="text-lg font-bold text-primary font-mono">
              {formatPrice(selectedVariant?.price || product.price)}
            </span>
          </div>

          {/* Quantity Selector */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center border border-border rounded-md">
              <button
                onClick={() => handleQuantityChange(-1)}
                disabled={quantity <= 1}
                className="p-2 text-text-secondary hover:text-foreground hover:bg-muted marketplace-transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Icon name="Minus" size={16} />
              </button>
              <span className="px-3 py-2 text-foreground font-medium min-w-[50px] text-center">
                {quantity}
              </span>
              <button
                onClick={() => handleQuantityChange(1)}
                disabled={quantity >= (selectedVariant?.stock || product.stock || 99)}
                className="p-2 text-text-secondary hover:text-foreground hover:bg-muted marketplace-transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Icon name="Plus" size={16} />
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddToCart}
                disabled={!product.inStock || isAddingToCart}
                loading={isAddingToCart}
                className="hidden sm:flex"
              >
                <Icon name="ShoppingCart" size={16} className="mr-2" />
                Add to Cart
              </Button>

              {/* Mobile Add to Cart */}
              <button
                onClick={handleAddToCart}
                disabled={!product.inStock || isAddingToCart}
                className="sm:hidden p-2 border border-border rounded-md text-text-secondary hover:text-foreground hover:bg-muted marketplace-transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAddingToCart ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent"></div>
                ) : (
                  <Icon name="ShoppingCart" size={16} />
                )}
              </button>

              <Button
                variant="default"
                size="sm"
                onClick={handleBuyNow}
                disabled={!product.inStock || isAddingToCart}
                className="min-w-[100px]"
              >
                <Icon name="Zap" size={16} className="mr-2" />
                Buy Now
              </Button>
            </div>
          </div>
        </div>

        {/* Stock Warning */}
        {product.inStock && (selectedVariant?.stock || product.stock) <= 5 && (
          <div className="pb-2">
            <div className="flex items-center justify-center space-x-2 text-warning">
              <Icon name="AlertTriangle" size={14} />
              <span className="text-sm font-medium">
                Only {selectedVariant?.stock || product.stock} left in stock!
              </span>
            </div>
          </div>
        )}

        {/* Out of Stock */}
        {!product.inStock && (
          <div className="pb-2">
            <div className="flex items-center justify-center space-x-2 text-error">
              <Icon name="XCircle" size={14} />
              <span className="text-sm font-medium">Currently out of stock</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StickyPurchaseBar;