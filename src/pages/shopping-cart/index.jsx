import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';

// FRESH REDESIGNED SHOPPING CART - FORCE RELOAD v2.0
import { useCart } from '../../contexts/CartContext';
import Header from '../../components/ui/Header';
import CartItem from './components/CartItem';
import OrderSummary from './components/OrderSummary';
import DeliveryOptions from './components/DeliveryOptions';
import EmptyCart from './components/EmptyCart';
import SavedForLater from './components/SavedForLater';
import StickyCheckoutBar from './components/StickyCheckoutBar';
import ProductRecommendations from './components/ProductRecommendations';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';

const ShoppingCart = () => {
  const navigate = useNavigate();
  
  // Cart context with error handling
  let cartHook;
  try {
    cartHook = useCart();
  } catch (error) {
    console.error('Error accessing cart context:', error);
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
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

  // Local state
  const [selectedDeliveryOption, setSelectedDeliveryOption] = useState('standard');
  const [appliedPromoCode, setAppliedPromoCode] = useState('');

  // Debug cart data
  console.log('🛒 Fresh Cart Debug:', {
    cartItems,
    savedItems,
    isLoading,
    cartTotals: getCartTotals ? getCartTotals() : null
  });

  // Event handlers
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
    console.log('Select all items');
  };

  // Calculate totals with safety
  const cartTotals = getCartTotals ? getCartTotals() : { subtotal: 0, itemCount: 0 };
  const subtotal = cartTotals?.subtotal || 0;
  const itemCount = cartTotals?.itemCount || 0;
  const deliveryFee = selectedDeliveryOption === 'express' ? 5000 : selectedDeliveryOption === 'same-day' ? 8000 : 2500;
  const tax = subtotal * 0.1925; // 19.25% VAT Cameroon
  const discount = appliedPromoCode === 'SAVE10' ? subtotal * 0.1 : appliedPromoCode === 'WELCOME20' ? subtotal * 0.2 : 0;
  const total = subtotal + deliveryFee + tax - discount;

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Helmet>
          <title>Shopping Cart - IziShop</title>
          <meta name="description" content="Review your cart items and proceed to checkout on IziShop marketplace" />
        </Helmet>
        
        <Header />
        
        <div className="pt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-2 border-teal-500 border-t-transparent mx-auto mb-4"></div>
                <p className="text-gray-600">Loading your cart...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-gray-100">
      <Helmet>
        <title>{`Shopping Cart (${itemCount}) - IziShop`}</title>
        <meta name="description" content="Review your cart items and proceed to checkout on IziShop marketplace" />
      </Helmet>
      
      <Header />
      
      <div className="pt-16 pb-20 lg:pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          {/* Empty Cart State */}
          {!Array.isArray(cartItems) || cartItems.length === 0 ? (
            <EmptyCart />
          ) : (
            <>
              {/* Header Section - Modern Design */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 mb-8">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full flex items-center justify-center">
                        <Icon name="ShoppingCart" size={20} className="text-white" />
                      </div>
                      <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                        Shopping Cart
                      </h1>
                    </div>
                    <p className="text-gray-600 text-sm sm:text-base">
                      {itemCount} {itemCount === 1 ? 'item' : 'items'} ready for checkout
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
                    className="text-red-600 hover:text-red-700"
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
              </div>

              {/* Main Content Grid - Modern Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Cart Items - Left Column (2/3) */}
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
                      className="text-red-600 hover:text-red-700"
                    >
                      Clear
                    </Button>
                  </div>

                  {/* Cart Items List */}
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

                {/* Order Summary - Right Column (1/3) */}
                <div className="space-y-6">
                  
                  {/* Desktop Delivery Options */}
                  <div className="hidden lg:block">
                    <DeliveryOptions
                      selectedOption={selectedDeliveryOption}
                      onOptionChange={handleDeliveryOptionChange}
                    />
                  </div>

                  {/* Order Summary */}
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

              {/* Product Recommendations - You might also like */}
              {true && (
                <div className="mt-16">
                  <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                        You might also like
                      </h2>
                    </div>
                    <ProductRecommendations
                      cartItems={cartItems}
                      type="cart"
                      limit={4}
                    />
                  </div>
                </div>
              )}

              {/* Frequently Bought Together */}
              {true && (
                <div className="mt-8">
                  <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div>
                        <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                          Frequently bought together
                        </h2>
                        <p className="text-sm text-gray-600">
                          Customers who bought items in your cart also bought these
                        </p>
                      </div>
                    </div>
                    <ProductRecommendations
                      cartItems={cartItems}
                      type="frequently-bought"
                      limit={3}
                    />
                  </div>
                </div>
              )}

              {/* Saved for Later Section */}
              {Array.isArray(savedItems) && savedItems.length > 0 && (
                <div className="mt-12">
                  <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                        <Icon name="Bookmark" size={16} className="text-white" />
                      </div>
                      <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                        Saved for Later
                      </h2>
                    </div>
                    <SavedForLater
                      savedItems={savedItems}
                      onMoveToCart={handleMoveToCart}
                      onRemove={handleRemoveSavedItem}
                    />
                  </div>
                </div>
              )}

              {/* Sticky Mobile Checkout Bar */}
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