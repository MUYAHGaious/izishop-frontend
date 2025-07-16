import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const StickyCheckoutBar = ({ 
  itemCount, 
  total, 
  onProceedToCheckout,
  className = "" 
}) => {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0
    }).format(price).replace('XAF', 'XAF ');
  };

  return (
    <div className={`fixed bottom-0 left-0 right-0 bg-surface border-t border-border z-50 lg:hidden ${className}`}>
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Cart Summary */}
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <Icon name="ShoppingCart" size={16} className="text-text-secondary" />
              <span className="text-sm text-text-secondary">
                {itemCount} {itemCount === 1 ? 'item' : 'items'}
              </span>
            </div>
            <div className="text-lg font-bold text-primary font-mono">
              {formatPrice(total)}
            </div>
          </div>

          {/* Checkout Button */}
          <Button
            variant="default"
            size="lg"
            onClick={onProceedToCheckout}
            iconName="ArrowRight"
            iconPosition="right"
            className="px-8"
          >
            Checkout
          </Button>
        </div>
      </div>
    </div>
  );
};

export default StickyCheckoutBar;