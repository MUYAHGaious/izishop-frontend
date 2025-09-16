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

    // Add to cart first
    handleAddToCart();
    
    // Navigate to checkout (guest users can proceed to checkout)
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
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-teal-200 shadow-xl z-1000 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-4">
          {/* Product Info - Hidden on mobile */}
          <div className="hidden md:flex items-center space-x-4 flex-1">
            <img
              src={product.images?.[0] || '/assets/images/no_image.png'}
              alt={product.name}
              className="w-12 h-12 rounded-xl object-cover"
            />
            <div className="min-w-0">
              <h3 className="font-semibold text-gray-900 truncate">
                {product.name}
              </h3>
              <div className="flex items-center space-x-2">
                <span className="text-lg font-bold text-teal-600 font-mono">
                  {formatPrice(selectedVariant?.price || product.price)}
                </span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <span className="text-sm text-gray-500 line-through font-mono">
                    {formatPrice(product.originalPrice)}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Mobile Price Display */}
          <div className="md:hidden flex items-center space-x-2">
            <span className="text-lg font-bold text-teal-600 font-mono">
              {formatPrice(selectedVariant?.price || product.price)}
            </span>
          </div>

          {/* Quantity Selector */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center border border-teal-300 rounded-xl">
              <button
                onClick={() => handleQuantityChange(-1)}
                disabled={quantity <= 1}
                className="p-2 text-teal-600 hover:text-teal-700 hover:bg-teal-50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Icon name="Minus" size={16} />
              </button>
              <span className="px-3 py-2 text-gray-900 font-medium min-w-[50px] text-center">
                {quantity}
              </span>
              <button
                onClick={() => handleQuantityChange(1)}
                disabled={quantity >= (selectedVariant?.stock || product.stock_quantity || 99)}
                className="p-2 text-teal-600 hover:text-teal-700 hover:bg-teal-50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Icon name="Plus" size={16} />
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-2">
              <Button
                className="hidden sm:flex border-teal-300 text-teal-600 hover:bg-teal-50 hover:border-teal-400 px-4 py-2 rounded-xl font-medium transition-all duration-300"
                variant="outline"
                size="sm"
                onClick={handleAddToCart}
                disabled={!(selectedVariant?.stock || product?.stock_quantity || 0) > 0 || isAddingToCart}
                loading={isAddingToCart}
              >
                <Icon name="ShoppingCart" size={16} className="mr-2" />
                Add to Cart
              </Button>

              {/* Mobile Add to Cart */}
              <button
                onClick={handleAddToCart}
                disabled={!(selectedVariant?.stock || product?.stock_quantity || 0) > 0 || isAddingToCart}
                className="sm:hidden p-2 border border-teal-300 rounded-xl text-teal-600 hover:text-teal-700 hover:bg-teal-50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAddingToCart ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-teal-600 border-t-transparent"></div>
                ) : (
                  <Icon name="ShoppingCart" size={16} />
                )}
              </button>

              <Button
                className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white min-w-[100px] px-4 py-2 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300"
                variant="default"
                size="sm"
                onClick={handleBuyNow}
                disabled={!(selectedVariant?.stock || product?.stock_quantity || 0) > 0 || isAddingToCart}
              >
                <Icon name="Zap" size={16} className="mr-2" />
                Buy Now
              </Button>
            </div>
          </div>
        </div>

        {/* Stock Warning */}
        {(selectedVariant?.stock || product?.stock_quantity || 0) > 0 && (selectedVariant?.stock || product.stock_quantity) <= 5 && (
          <div className="pb-2">
            <div className="flex items-center justify-center space-x-2 text-yellow-600">
              <Icon name="AlertTriangle" size={14} />
              <span className="text-sm font-medium">
                Only {selectedVariant?.stock || product.stock_quantity} left in stock!
              </span>
            </div>
          </div>
        )}

        {/* Out of Stock */}
        {(selectedVariant?.stock || product?.stock_quantity || 0) <= 0 && (
          <div className="pb-2">
            <div className="flex items-center justify-center space-x-2 text-red-500">
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