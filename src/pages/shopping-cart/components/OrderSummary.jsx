import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const OrderSummary = ({ 
  subtotal, 
  deliveryFee, 
  tax, 
  discount, 
  total,
  onApplyPromoCode,
  onProceedToCheckout,
  className = "" 
}) => {
  const [promoCode, setPromoCode] = useState('');
  const [promoError, setPromoError] = useState('');
  const [promoSuccess, setPromoSuccess] = useState('');
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0
    }).format(price).replace('XAF', 'XAF ');
  };

  const handleApplyPromoCode = async () => {
    if (!promoCode.trim()) {
      setPromoError('Please enter a promo code');
      return;
    }

    setIsApplyingPromo(true);
    setPromoError('');
    setPromoSuccess('');

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock promo code validation
      const validCodes = ['SAVE10', 'WELCOME20', 'FREESHIP'];
      if (validCodes.includes(promoCode.toUpperCase())) {
        setPromoSuccess('Promo code applied successfully!');
        onApplyPromoCode(promoCode.toUpperCase());
      } else {
        setPromoError('Invalid promo code. Please try again.');
      }
    } catch (error) {
      setPromoError('Failed to apply promo code. Please try again.');
    } finally {
      setIsApplyingPromo(false);
    }
  };

  const handlePromoCodeChange = (e) => {
    setPromoCode(e.target.value);
    setPromoError('');
    setPromoSuccess('');
  };

  const summaryItems = [
    { label: 'Subtotal', value: subtotal, type: 'normal' },
    { label: 'Delivery Fee', value: deliveryFee, type: 'normal' },
    { label: 'Tax', value: tax, type: 'normal' },
    ...(discount > 0 ? [{ label: 'Discount', value: -discount, type: 'discount' }] : [])
  ];

  return (
    <div className={`bg-white border border-gray-200 rounded-xl shadow-lg ${className}`}>
      <div className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Order Summary
        </h3>

        {/* Price Breakdown */}
        <div className="space-y-3 mb-6">
          {summaryItems.map((item, index) => (
            <div key={index} className="flex items-center justify-between">
              <span className="text-sm text-text-secondary">
                {item.label}
              </span>
              <span className={`text-sm font-medium font-mono ${
                item.type === 'discount' ? 'text-success' : 'text-foreground'
              }`}>
                {item.type === 'discount' ? '-' : ''}{formatPrice(Math.abs(item.value))}
              </span>
            </div>
          ))}
        </div>

        {/* Promo Code Section */}
        <div className="mb-6">
          <div className="flex space-x-2">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Enter promo code"
                value={promoCode}
                onChange={handlePromoCodeChange}
                error={promoError}
                className="text-sm"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleApplyPromoCode}
              disabled={isApplyingPromo || !promoCode.trim()}
              loading={isApplyingPromo}
              className="px-4"
            >
              Apply
            </Button>
          </div>
          
          {promoSuccess && (
            <div className="flex items-center mt-2 text-xs text-success">
              <Icon name="CheckCircle" size={12} className="mr-1" />
              {promoSuccess}
            </div>
          )}
        </div>

        {/* Total */}
        <div className="border-t border-border pt-4 mb-6">
          <div className="flex items-center justify-between">
            <span className="text-base font-semibold text-foreground">
              Total
            </span>
            <span className="text-xl font-bold text-teal-600 font-mono">
              {formatPrice(total)}
            </span>
          </div>
        </div>

        {/* Checkout Button */}
        <Button
          variant="default"
          size="lg"
          fullWidth
          onClick={onProceedToCheckout}
          iconName="ArrowRight"
          iconPosition="right"
          className="mb-4 bg-teal-500 hover:bg-teal-600 text-white"
        >
          Proceed to Checkout
        </Button>

        {/* Security Badge */}
        <div className="flex items-center justify-center text-xs text-text-secondary">
          <Icon name="Shield" size={12} className="mr-1" />
          <span>Secure checkout with SSL encryption</span>
        </div>

        {/* Payment Methods */}
        <div className="mt-4 pt-4 border-t border-border">
          <p className="text-xs text-text-secondary mb-3 text-center font-medium">
            We accept
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-lg mx-auto">
            {/* MTN Mobile Money */}
            <div className="bg-white rounded-xl p-3 shadow-lg border border-gray-200 flex items-center justify-center min-h-[60px] group relative">
              <img 
                src="/assets/brands/69-691715_mtn-mm-logo-generic-mtn-mobile-money-logo.svg" 
                alt="MTN Mobile Money" 
                className="max-h-12 w-auto object-contain"
              />
              <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                MTN Mobile Money
              </div>
            </div>
            
            {/* Orange Money */}
            <div className="bg-white rounded-xl p-3 shadow-lg border border-gray-200 flex items-center justify-center min-h-[60px] group relative">
              <img 
                src="/assets/brands/Orange_Money-Logo.wine.svg" 
                alt="Orange Money" 
                className="max-h-12 w-auto object-contain"
              />
              <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                Orange Money
              </div>
            </div>
            
            {/* VISA */}
            <div className="bg-white rounded-xl p-3 shadow-lg border border-gray-200 flex items-center justify-center min-h-[60px] group relative">
              <svg width="50" height="30" viewBox="0 0 50 30" fill="none">
                <rect width="50" height="30" rx="6" fill="#1A1F71"/>
                <text x="25" y="20" textAnchor="middle" fill="#FFF" fontSize="12" fontWeight="bold">VISA</text>
              </svg>
              <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                VISA
              </div>
            </div>
            
            {/* Mastercard */}
            <div className="bg-white rounded-xl p-3 shadow-lg border border-gray-200 flex items-center justify-center min-h-[60px] group relative">
              <svg width="50" height="30" viewBox="0 0 50 30" fill="none">
                <rect width="50" height="30" rx="6" fill="#EB001B"/>
                <circle cx="18" cy="15" r="9" fill="#EB001B"/>
                <circle cx="32" cy="15" r="9" fill="#F79E1B"/>
                <path d="M25 6c-5 0-9 4-9 9s4 9 9 9 9-4 9-9-4-9-9-9z" fill="#FF5F00"/>
              </svg>
              <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                Mastercard
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;