import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const ActionButtons = ({ product, selectedVariants, quantity, onClose }) => {
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isBuyingNow, setIsBuyingNow] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const navigate = useNavigate();

  const handleAddToCart = async () => {
    setIsAddingToCart(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setIsAddingToCart(false);
    setShowSuccess(true);
    
    // Hide success message after 2 seconds
    setTimeout(() => {
      setShowSuccess(false);
    }, 2000);
    
    console.log('Added to cart:', {
      product: product.id,
      variants: selectedVariants,
      quantity
    });
  };

  const handleBuyNow = async () => {
    setIsBuyingNow(true);
    
    // Simulate adding to cart and redirecting
    await new Promise(resolve => setTimeout(resolve, 800));
    
    onClose();
    navigate('/shopping-cart-checkout');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: `Check out this product: ${product.name}`,
        url: window.location.href,
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      console.log('Link copied to clipboard');
    }
  };

  const isOutOfStock = !product.inStock;
  const hasRequiredVariants = true; // In real app, check if all required variants are selected

  return (
    <>
      {/* Success Message */}
      {showSuccess && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-success text-success-foreground px-4 py-2 rounded-lg shadow-elevated z-50 animate-slide-up">
          <div className="flex items-center space-x-2">
            <Icon name="CheckCircle" size={16} />
            <span className="text-sm font-medium">Added to cart successfully!</span>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="sticky bottom-0 left-0 right-0 bg-surface border-t border-border p-4 space-y-3">
        {/* Secondary Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              iconName="Share"
              iconPosition="left"
              onClick={handleShare}
            >
              Share
            </Button>
            <Button
              variant="ghost"
              size="sm"
              iconName="MessageCircle"
              iconPosition="left"
            >
              Chat
            </Button>
          </div>
          
          <div className="text-sm text-text-secondary">
            Total: <span className="font-semibold text-text-primary">
              {new Intl.NumberFormat('fr-FR', {
                style: 'currency',
                currency: 'XAF',
                minimumFractionDigits: 0,
              }).format(product.price * quantity)}
            </span>
          </div>
        </div>

        {/* Primary Actions */}
        <div className="flex space-x-3">
          <Button
            variant="outline"
            size="lg"
            fullWidth
            iconName="ShoppingCart"
            iconPosition="left"
            onClick={handleAddToCart}
            disabled={isOutOfStock || !hasRequiredVariants || isAddingToCart}
            loading={isAddingToCart}
          >
            {isAddingToCart ? 'Adding...' : 'Add to Cart'}
          </Button>
          
          <Button
            variant="default"
            size="lg"
            fullWidth
            iconName="Zap"
            iconPosition="left"
            onClick={handleBuyNow}
            disabled={isOutOfStock || !hasRequiredVariants || isBuyingNow}
            loading={isBuyingNow}
          >
            {isBuyingNow ? 'Processing...' : 'Buy Now'}
          </Button>
        </div>

        {/* Stock Warning */}
        {isOutOfStock && (
          <div className="flex items-center justify-center space-x-2 text-destructive text-sm">
            <Icon name="AlertCircle" size={16} />
            <span>This item is currently out of stock</span>
          </div>
        )}

        {/* Variant Selection Warning */}
        {!hasRequiredVariants && (
          <div className="flex items-center justify-center space-x-2 text-warning text-sm">
            <Icon name="AlertTriangle" size={16} />
            <span>Please select all required options</span>
          </div>
        )}
      </div>
    </>
  );
};

export default ActionButtons;