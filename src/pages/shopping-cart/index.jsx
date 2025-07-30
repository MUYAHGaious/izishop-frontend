import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { useCart } from '../../contexts/CartContext';
import Header from '../../components/ui/Header';
import CartItem from './components/CartItem';
import OrderSummary from './components/OrderSummary';
import DeliveryOptions from './components/DeliveryOptions';
import EmptyCart from './components/EmptyCart';
import SavedForLater from './components/SavedForLater';
import StickyCheckoutBar from './components/StickyCheckoutBar';

import Button from '../../components/ui/Button';

const ShoppingCart = () => {
  const navigate = useNavigate();
  
  let cartHook;
  try {
    cartHook = useCart();
  } catch (error) {
    console.error('Error accessing cart context:', error);
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Cart Error</h1>
          <p className="text-gray-600 mb-4">Unable to load cart. Please refresh the page.</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }
  
  const { 
    cartItems = [], 
    savedItems = [], 
    updateQuantity, 
    removeFromCart, 
    saveForLater, 
    moveToCart, 
    removeFromSaved,
    clearCart,
    getCartTotals,
    isLoading = false
  } = cartHook || {};
  const [selectedDeliveryOption, setSelectedDeliveryOption] = useState('standard');
  const [appliedPromoCode, setAppliedPromoCode] = useState('');


  // Debug: Log cart data to check structure
  console.log('Shopping Cart Debug:', {
    cartItems,
    savedItems,
    isLoading,
    cartTotals: getCartTotals()
  });

  const handleQuantityChange = (itemId, newQuantity) => {
    updateQuantity(itemId, newQuantity);
  };

  const handleRemoveItem = (itemId) => {
    removeFromCart(itemId);
  };

  const handleSaveForLater = (itemId) => {
    saveForLater(itemId);
  };

  const handleMoveToCart = (savedItemId) => {
    moveToCart(savedItemId);
  };

  const handleRemoveSavedItem = (savedItemId) => {
    removeFromSaved(savedItemId);
  };

  const handleDeliveryOptionChange = (optionId) => {
    setSelectedDeliveryOption(optionId);
  };

  const handleApplyPromoCode = (code) => {
    setAppliedPromoCode(code);
  };

  const handleProceedToCheckout = () => {
    if (cartItems.length === 0) return;
    
    // Save checkout data
    const checkoutData = {
      items: cartItems,
      deliveryOption: selectedDeliveryOption,
      promoCode: appliedPromoCode,
      timestamp: new Date().toISOString()
    };
    
    localStorage.setItem('checkoutData', JSON.stringify(checkoutData));
    navigate('/checkout');
  };

  const handleContinueShopping = () => {
    navigate('/product-catalog');
  };

  const handleClearCart = () => {
    if (window.confirm('Are you sure you want to clear your cart?')) {
      clearCart();
    }
  };

  const handleSelectAll = () => {
    // Implementation for bulk selection
    console.log('Select all items');
  };

  // Calculate totals with safety checks
  const cartTotals = getCartTotals ? getCartTotals() : { subtotal: 0, itemCount: 0 };
  const subtotal = cartTotals?.subtotal || 0;
  const itemCount = cartTotals?.itemCount || 0;
  const deliveryFee = selectedDeliveryOption === 'express' ? 5000 : selectedDeliveryOption === 'same-day' ? 8000 : 2500;
  const tax = (subtotal || 0) * 0.1925; // 19.25% VAT in Cameroon
  const discount = appliedPromoCode === 'SAVE10' ? (subtotal || 0) * 0.1 : appliedPromoCode === 'WELCOME20' ? (subtotal || 0) * 0.2 : 0;
  const total = (subtotal || 0) + deliveryFee + tax - discount;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Helmet>
          <title>Shopping Cart - IziShop</title>
          <meta name="description" content="Review your cart items and proceed to checkout on IziShop marketplace" />
        </Helmet>
        
        <Header />
        
        <div className="pt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-2 border-primary border-t-transparent mx-auto mb-4"></div>
                <p className="text-text-secondary">Loading your cart...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{`Shopping Cart (${typeof itemCount === 'number' && !isNaN(itemCount) ? itemCount : 0}) - IziShop`}</title>
        <meta name="description" content="Review your cart items and proceed to checkout on IziShop marketplace" />
      </Helmet>
      
      <Header />
      
      <div className="pt-16 pb-20 lg:pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {!Array.isArray(cartItems) || cartItems.length === 0 ? (
            <EmptyCart />
          ) : (
            <>
              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                    Shopping Cart
                  </h1>
                  <p className="text-text-secondary mt-1">
                    {itemCount} {itemCount === 1 ? 'item' : 'items'} in your cart
                  </p>
                </div>

                {/* Desktop Actions */}
                <div className="hidden sm:flex items-center space-x-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSelectAll}
                    iconName="CheckSquare"
                    iconPosition="left"
                  >
                    Select All
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearCart}
                    iconName="Trash2"
                    iconPosition="left"
                    className="text-error hover:text-error"
                  >
                    Clear Cart
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleContinueShopping}
                    iconName="ArrowLeft"
                    iconPosition="left"
                  >
                    Continue Shopping
                  </Button>
                </div>
              </div>

              {/* Main Content */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Cart Items - Left Column */}
                <div className="lg:col-span-2 space-y-4">
                  {/* Mobile Actions */}
                  <div className="sm:hidden flex items-center justify-between mb-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleSelectAll}
                      iconName="CheckSquare"
                      iconPosition="left"
                    >
                      Select All
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleClearCart}
                      iconName="Trash2"
                      iconPosition="left"
                      className="text-error hover:text-error"
                    >
                      Clear
                    </Button>
                  </div>

                  {Array.isArray(cartItems) && cartItems.map((item) => (
                    <CartItem
                      key={item.id}
                      item={item}
                      onQuantityChange={handleQuantityChange}
                      onRemove={handleRemoveItem}
                      onSaveForLater={handleSaveForLater}
                    />
                  ))}

                  {/* Continue Shopping - Mobile */}
                  <div className="sm:hidden">
                    <Button
                      variant="outline"
                      fullWidth
                      onClick={handleContinueShopping}
                      iconName="ArrowLeft"
                      iconPosition="left"
                    >
                      Continue Shopping
                    </Button>
                  </div>

                  {/* Delivery Options - Mobile */}
                  <div className="lg:hidden">
                    <DeliveryOptions
                      selectedOption={selectedDeliveryOption}
                      onOptionChange={handleDeliveryOptionChange}
                    />
                  </div>
                </div>

                {/* Order Summary - Right Column */}
                <div className="space-y-6">
                  {/* Desktop Delivery Options */}
                  <div className="hidden lg:block">
                    <DeliveryOptions
                      selectedOption={selectedDeliveryOption}
                      onOptionChange={handleDeliveryOptionChange}
                    />
                  </div>

                  <OrderSummary
                    subtotal={subtotal}
                    deliveryFee={deliveryFee}
                    tax={tax}
                    discount={discount}
                    total={total}
                    onApplyPromoCode={handleApplyPromoCode}
                    onProceedToCheckout={handleProceedToCheckout}
                  />
                </div>
              </div>

              {/* Saved for Later */}
              {Array.isArray(savedItems) && savedItems.length > 0 && (
                <div className="mt-12">
                  <SavedForLater
                    savedItems={savedItems}
                    onMoveToCart={handleMoveToCart}
                    onRemove={handleRemoveSavedItem}
                  />
                </div>
              )}

              {/* Sticky Checkout Bar - Mobile */}
              <StickyCheckoutBar
                itemCount={itemCount}
                total={total}
                onProceedToCheckout={handleProceedToCheckout}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShoppingCart;