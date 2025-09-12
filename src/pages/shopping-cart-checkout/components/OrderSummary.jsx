import React from 'react';
import Button from '../../../components/ui/Button';

const OrderSummary = ({ items, onProceedToCheckout, isCheckout = false }) => {
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = subtotal > 50000 ? 0 : 2500; // Free shipping over 50,000 XAF
  const tax = subtotal * 0.1925; // 19.25% VAT
  const total = subtotal + shipping + tax;

  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  return (
    <div className="bg-card rounded-lg border border-border p-6 sticky top-24">
      <h3 className="text-lg font-semibold text-text-primary mb-4">
        Order Summary
      </h3>

      {/* Items Count */}
      <div className="flex justify-between text-sm text-text-secondary mb-3">
        <span>Items ({items.length})</span>
        <span>{formatPrice(subtotal)}</span>
      </div>

      {/* Shipping */}
      <div className="flex justify-between text-sm text-text-secondary mb-3">
        <span>Shipping</span>
        <span className={shipping === 0 ? 'text-success font-medium' : ''}>
          {shipping === 0 ? 'Free' : formatPrice(shipping)}
        </span>
      </div>

      {/* Tax */}
      <div className="flex justify-between text-sm text-text-secondary mb-4">
        <span>Tax (VAT 19.25%)</span>
        <span>{formatPrice(tax)}</span>
      </div>

      {/* Free Shipping Notice */}
      {shipping > 0 && (
        <div className="bg-accent/10 border border-accent/20 rounded-md p-3 mb-4">
          <p className="text-xs text-accent-foreground">
            Add {formatPrice(50000 - subtotal)} more for free shipping
          </p>
        </div>
      )}

      {/* Total */}
      <div className="border-t border-border pt-4 mb-6">
        <div className="flex justify-between text-lg font-semibold text-text-primary">
          <span>Total</span>
          <span>{formatPrice(total)}</span>
        </div>
      </div>

      {/* Action Button */}
      {!isCheckout && (
        <Button
          variant="default"
          fullWidth
          onClick={onProceedToCheckout}
          disabled={items.length === 0}
        >
          Proceed to Checkout
        </Button>
      )}

      {/* Security Badge */}
      <div className="flex items-center justify-center space-x-2 mt-4 text-xs text-text-secondary">
        <div className="w-4 h-4 bg-success rounded-full flex items-center justify-center">
          <span className="text-white text-xs">✓</span>
        </div>
        <span>Secure SSL Encryption</span>
      </div>
    </div>
  );
};

export default OrderSummary;