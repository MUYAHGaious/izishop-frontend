import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import MobileBottomTab from '../../components/ui/MobileBottomTab';
import Breadcrumbs from '../../components/ui/Breadcrumbs';
import CheckoutSteps from './components/CheckoutSteps';
import CartItem from './components/CartItem';
import OrderSummary from './components/OrderSummary';
import ShippingForm from './components/ShippingForm';
import PaymentForm from './components/PaymentForm';
import OrderConfirmation from './components/OrderConfirmation';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';

const ShoppingCartCheckout = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [cartItems, setCartItems] = useState([]);
  const [orderData, setOrderData] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  // Mock cart data
  const mockCartItems = [
    {
      id: 1,
      name: "Samsung Galaxy S24 Ultra",
      shop: "TechHub Cameroon",
      price: 850000,
      quantity: 1,
      image: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=400&h=400&fit=crop",
      variant: "256GB, Titanium Black"
    },
    {
      id: 2,
      name: "Apple MacBook Pro 14-inch",
      shop: "Digital Store Yaoundé",
      price: 1200000,
      quantity: 1,
      image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=400&fit=crop",
      variant: "M3 Pro, 512GB SSD"
    },
    {
      id: 3,
      name: "Sony WH-1000XM5 Headphones",
      shop: "Audio Paradise",
      price: 125000,
      quantity: 2,
      image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop",
      variant: "Midnight Black"
    }
  ];

  useEffect(() => {
    // Simulate loading cart data
    const timer = setTimeout(() => {
      setCartItems(mockCartItems);
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleUpdateQuantity = (itemId, newQuantity) => {
    setCartItems(items =>
      items.map(item =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const handleRemoveItem = (itemId) => {
    setCartItems(items => items.filter(item => item.id !== itemId));
  };

  const handleProceedToCheckout = () => {
    setCurrentStep(2);
  };

  const handleShippingNext = (shippingData) => {
    setOrderData(prev => ({ ...prev, ...shippingData }));
    setCurrentStep(3);
  };

  const handlePaymentNext = (paymentData) => {
    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = subtotal > 50000 ? 0 : 2500;
    const tax = subtotal * 0.1925;
    const total = subtotal + shipping + tax;

    setOrderData(prev => ({ 
      ...prev, 
      ...paymentData,
      items: cartItems,
      subtotal,
      shipping,
      tax,
      total
    }));
    setCurrentStep(4);
  };

  const handleStepBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const calculateTotal = () => {
    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = subtotal > 50000 ? 0 : 2500;
    const tax = subtotal * 0.1925;
    return subtotal + shipping + tax;
  };

  const breadcrumbItems = [
    { label: 'Home', path: '/product-catalog' },
    { label: 'Shopping Cart', path: '/shopping-cart-checkout' }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-16 pb-20 lg:pb-8">
          <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-text-secondary">Loading your cart...</p>
              </div>
            </div>
          </div>
        </main>
        <MobileBottomTab />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-16 pb-20 lg:pb-8">
        <div className="container mx-auto px-4 py-6">
          <Breadcrumbs items={breadcrumbItems} />
          
          {/* Page Header */}
          <div className="mb-6">
            <h1 className="text-2xl lg:text-3xl font-bold text-text-primary mb-2">
              {currentStep === 1 ? 'Shopping Cart' :
               currentStep === 2 ? 'Shipping Information' :
               currentStep === 3 ? 'Payment': 'Order Confirmation'}
            </h1>
            <p className="text-text-secondary">
              {currentStep === 1 ? 'Review your items and proceed to checkout' :
               currentStep === 2 ? 'Enter your shipping details' :
               currentStep === 3 ? 'Complete your payment securely': 'Your order has been successfully placed'}
            </p>
          </div>

          {/* Checkout Steps */}
          <CheckoutSteps currentStep={currentStep} />

          {/* Empty Cart State */}
          {cartItems.length === 0 && currentStep === 1 && (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                <Icon name="ShoppingCart" size={40} className="text-text-secondary" />
              </div>
              <h2 className="text-xl font-semibold text-text-primary mb-2">
                Your cart is empty
              </h2>
              <p className="text-text-secondary mb-6">
                Looks like you haven't added any items to your cart yet.
              </p>
              <Button
                variant="default"
                onClick={() => navigate('/product-catalog')}
                iconName="ArrowLeft"
                iconPosition="left"
              >
                Continue Shopping
              </Button>
            </div>
          )}

          {/* Cart Step */}
          {currentStep === 1 && cartItems.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2">
                <div className="space-y-4">
                  {cartItems.map((item) => (
                    <CartItem
                      key={item.id}
                      item={item}
                      onUpdateQuantity={handleUpdateQuantity}
                      onRemove={handleRemoveItem}
                    />
                  ))}
                </div>

                {/* Continue Shopping */}
                <div className="mt-6 pt-6 border-t border-border">
                  <Button
                    variant="outline"
                    onClick={() => navigate('/product-catalog')}
                    iconName="ArrowLeft"
                    iconPosition="left"
                  >
                    Continue Shopping
                  </Button>
                </div>
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <OrderSummary
                  items={cartItems}
                  onProceedToCheckout={handleProceedToCheckout}
                />
              </div>
            </div>
          )}

          {/* Shipping Step */}
          {currentStep === 2 && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <ShippingForm
                  onNext={handleShippingNext}
                  onBack={handleStepBack}
                />
              </div>
              <div className="lg:col-span-1">
                <OrderSummary items={cartItems} isCheckout={true} />
              </div>
            </div>
          )}

          {/* Payment Step */}
          {currentStep === 3 && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <PaymentForm
                  onNext={handlePaymentNext}
                  onBack={handleStepBack}
                  orderTotal={calculateTotal()}
                />
              </div>
              <div className="lg:col-span-1">
                <OrderSummary items={cartItems} isCheckout={true} />
              </div>
            </div>
          )}

          {/* Confirmation Step */}
          {currentStep === 4 && (
            <OrderConfirmation orderData={orderData} />
          )}
        </div>
      </main>

      <MobileBottomTab />
    </div>
  );
};

export default ShoppingCartCheckout;