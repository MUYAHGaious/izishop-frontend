import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import MainHeader from '../../components/ui/MainHeader';
import CartItem from './components/CartItem';
import OrderSummary from './components/OrderSummary';
import DeliveryOptions from './components/DeliveryOptions';
import EmptyCart from './components/EmptyCart';
import SavedForLater from './components/SavedForLater';
import StickyCheckoutBar from './components/StickyCheckoutBar';

import Button from '../../components/ui/Button';

const ShoppingCart = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [savedItems, setSavedItems] = useState([]);
  const [selectedDeliveryOption, setSelectedDeliveryOption] = useState('standard');
  const [appliedPromoCode, setAppliedPromoCode] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Mock cart data
  const mockCartItems = [
    {
      id: 1,
      productId: 'prod-1',
      name: 'iPhone 14 Pro Max 256GB',
      price: 850000,
      originalPrice: 950000,
      quantity: 1,
      maxStock: 10,
      stock: 3,
      image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=400&fit=crop',
      shopId: 'shop-1',
      shopName: 'TechHub Store',
      variant: '256GB, Deep Purple',
      deliveryEstimate: '2-3 days',
      freeDelivery: true
    },
    {
      id: 2,
      productId: 'prod-2',
      name: 'Samsung Galaxy Buds Pro 2',
      price: 125000,
      originalPrice: null,
      quantity: 2,
      maxStock: 25,
      stock: 15,
      image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400&h=400&fit=crop',
      shopId: 'shop-2',
      shopName: 'Audio World',
      variant: 'Phantom Black',
      deliveryEstimate: '1-2 days',
      freeDelivery: false
    },
    {
      id: 3,
      productId: 'prod-3',
      name: 'MacBook Air M2 13-inch',
      price: 1200000,
      originalPrice: null,
      quantity: 1,
      maxStock: 5,
      stock: 2,
      image: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=400&h=400&fit=crop',
      shopId: 'shop-3',
      shopName: 'Apple Store Cameroon',
      variant: '256GB SSD, 8GB RAM, Midnight',
      deliveryEstimate: '3-5 days',
      freeDelivery: true
    }
  ];

  const mockSavedItems = [
    {
      id: 4,
      productId: 'prod-4',
      name: 'Nike Air Max 270 React',
      price: 85000,
      originalPrice: 95000,
      stock: 8,
      image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop',
      shopId: 'shop-4',
      shopName: 'SportZone',
      variant: 'Size 42, Black/White',
      savedDate: '2 days ago'
    },
    {
      id: 5,
      productId: 'prod-5',
      name: 'Sony WH-1000XM4 Headphones',
      price: 180000,
      originalPrice: null,
      stock: 0,
      image: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400&h=400&fit=crop',
      shopId: 'shop-5',
      shopName: 'Audio Pro',
      variant: 'Black, Wireless',
      savedDate: '1 week ago'
    }
  ];

  useEffect(() => {
    // Simulate loading cart data
    const loadCartData = async () => {
      setIsLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Load from localStorage or use mock data
      const savedCartItems = localStorage.getItem('cartItems');
      const savedForLaterItems = localStorage.getItem('savedForLaterItems');
      
      if (savedCartItems) {
        setCartItems(JSON.parse(savedCartItems));
      } else {
        setCartItems(mockCartItems);
      }
      
      if (savedForLaterItems) {
        setSavedItems(JSON.parse(savedForLaterItems));
      } else {
        setSavedItems(mockSavedItems);
      }
      
      setIsLoading(false);
    };

    loadCartData();
  }, []);

  // Save cart items to localStorage whenever they change
  useEffect(() => {
    if (cartItems.length > 0) {
      localStorage.setItem('cartItems', JSON.stringify(cartItems));
      localStorage.setItem('cartItemCount', cartItems.reduce((sum, item) => sum + item.quantity, 0).toString());
    } else {
      localStorage.removeItem('cartItems');
      localStorage.setItem('cartItemCount', '0');
    }
  }, [cartItems]);

  // Save saved items to localStorage
  useEffect(() => {
    localStorage.setItem('savedForLaterItems', JSON.stringify(savedItems));
  }, [savedItems]);

  const handleQuantityChange = (itemId, newQuantity) => {
    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const handleRemoveItem = (itemId) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== itemId));
  };

  const handleSaveForLater = (itemId) => {
    const itemToSave = cartItems.find(item => item.id === itemId);
    if (itemToSave) {
      const savedItem = {
        ...itemToSave,
        savedDate: 'Just now'
      };
      setSavedItems(prevItems => [savedItem, ...prevItems]);
      handleRemoveItem(itemId);
    }
  };

  const handleMoveToCart = (itemId) => {
    const itemToMove = savedItems.find(item => item.id === itemId);
    if (itemToMove && itemToMove.stock > 0) {
      const cartItem = {
        ...itemToMove,
        quantity: 1,
        maxStock: itemToMove.stock
      };
      setCartItems(prevItems => [...prevItems, cartItem]);
      setSavedItems(prevItems => prevItems.filter(item => item.id !== itemId));
    }
  };

  const handleRemoveSavedItem = (itemId) => {
    setSavedItems(prevItems => prevItems.filter(item => item.id !== itemId));
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
      setCartItems([]);
    }
  };

  const handleSelectAll = () => {
    // Implementation for bulk selection
    console.log('Select all items');
  };

  // Calculate totals
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const deliveryFee = selectedDeliveryOption === 'express' ? 5000 : selectedDeliveryOption === 'same-day' ? 8000 : 2500;
  const tax = subtotal * 0.1925; // 19.25% VAT in Cameroon
  const discount = appliedPromoCode === 'SAVE10' ? subtotal * 0.1 : appliedPromoCode === 'WELCOME20' ? subtotal * 0.2 : 0;
  const total = subtotal + deliveryFee + tax - discount;
  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Helmet>
          <title>Shopping Cart - IziShop</title>
          <meta name="description" content="Review your cart items and proceed to checkout on IziShop marketplace" />
        </Helmet>
        
        <MainHeader />
        
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
        <title>Shopping Cart ({itemCount}) - IziShop</title>
        <meta name="description" content="Review your cart items and proceed to checkout on IziShop marketplace" />
      </Helmet>
      
      <MainHeader />
      
      <div className="pt-16 pb-20 lg:pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {cartItems.length === 0 ? (
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

                  {cartItems.map((item) => (
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
              {savedItems.length > 0 && (
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