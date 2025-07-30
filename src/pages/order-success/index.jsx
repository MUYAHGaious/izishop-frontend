import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';

const OrderSuccess = () => {
  const navigate = useNavigate();
  const [orderDetails, setOrderDetails] = useState(null);

  useEffect(() => {
    // Load order details from localStorage or API
    const checkoutData = localStorage.getItem('checkoutData');
    if (checkoutData) {
      try {
        const parsedData = JSON.parse(checkoutData);
        setOrderDetails(parsedData);
      } catch (error) {
        console.error('Error loading order details:', error);
      }
    }
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-CM', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const handleContinueShopping = () => {
    navigate('/product-catalog');
  };

  const handleViewOrders = () => {
    navigate('/my-orders');
  };

  const generateOrderNumber = () => {
    return `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
  };

  const orderNumber = generateOrderNumber();
  const estimatedDelivery = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB');

  return (
    <>
      <Helmet>
        <title>Order Success - IziShop</title>
        <meta name="description" content="Your order has been placed successfully. Thank you for shopping with IziShop." />
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="bg-surface border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Icon name="ShoppingBag" size={20} color="white" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-foreground">IziShop</h1>
                  <p className="text-xs text-muted-foreground">Order Confirmation</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="px-4 py-6 sm:px-6 lg:px-8 sm:py-12 max-w-3xl mx-auto">
          {/* Success Icon and Message */}
          <div className="text-center mb-6 sm:mb-8">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <Icon name="CheckCircle" size={32} className="text-success sm:w-10 sm:h-10" />
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
              Order Placed Successfully!
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground mb-4 px-2">
              Thank you for your purchase. We've received your order and will process it shortly.
            </p>
            
            <div className="bg-success/10 rounded-lg p-3 sm:p-4 mx-2 sm:mx-0 sm:inline-block">
              <p className="text-success font-semibold text-sm sm:text-base">
                Order Number: {orderNumber}
              </p>
            </div>
          </div>

          {/* Order Details Card */}
          <div className="bg-surface rounded-lg border border-border p-4 sm:p-6 elevation-1 mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-3 sm:mb-4">Order Details</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {/* Order Info */}
              <div>
                <h3 className="font-medium text-foreground mb-3">Order Information</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Order Number:</span>
                    <span className="text-foreground font-medium">{orderNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Order Date:</span>
                    <span className="text-foreground">{new Date().toLocaleDateString('en-GB')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Estimated Delivery:</span>
                    <span className="text-foreground">{estimatedDelivery}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Payment Status:</span>
                    <span className="text-success font-medium">Confirmed</span>
                  </div>
                </div>
              </div>

              {/* Payment Info */}
              <div>
                <h3 className="font-medium text-foreground mb-3">Payment Information</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Payment Method:</span>
                    <span className="text-foreground">MTN Mobile Money</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Amount:</span>
                    <span className="text-foreground font-semibold">{formatCurrency(1430000)}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Icon name="Shield" size={14} className="text-success" />
                    <span className="text-success text-xs">Protected by Escrow</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* What's Next */}
          <div className="bg-primary/5 rounded-lg border border-primary/20 p-4 sm:p-6 mb-4 sm:mb-6">
            <h2 className="text-base sm:text-lg font-semibold text-foreground mb-3 sm:mb-4 flex items-center space-x-2">
              <Icon name="Clock" size={18} className="text-primary sm:w-5 sm:h-5" />
              <span>What happens next?</span>
            </h2>
            
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs font-bold">1</span>
                </div>
                <div>
                  <p className="font-medium text-foreground">Order Confirmation</p>
                  <p className="text-sm text-muted-foreground">You'll receive an email confirmation shortly with your order details.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-muted rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-muted-foreground text-xs font-bold">2</span>
                </div>
                <div>
                  <p className="font-medium text-foreground">Order Processing</p>
                  <p className="text-sm text-muted-foreground">The seller will prepare your items for shipment within 1-2 business days.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-muted rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-muted-foreground text-xs font-bold">3</span>
                </div>
                <div>
                  <p className="font-medium text-foreground">Shipping & Delivery</p>
                  <p className="text-sm text-muted-foreground">Track your package and receive it by {estimatedDelivery}.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 sm:flex-row sm:gap-4 justify-center">
            <Button
              variant="default"
              onClick={handleContinueShopping}
              iconName="ShoppingBag"
              iconPosition="left"
              className="w-full sm:min-w-48 sm:w-auto"
              fullWidth
            >
              Continue Shopping
            </Button>
            
            <Button
              variant="outline"
              onClick={handleViewOrders}
              iconName="Package"
              iconPosition="left"
              className="w-full sm:min-w-48 sm:w-auto"
              fullWidth
            >
              View My Orders
            </Button>
          </div>

          {/* Help Section */}
          <div className="mt-6 sm:mt-8 text-center">
            <div className="bg-muted/50 rounded-lg p-4">
              <h3 className="font-medium text-foreground mb-2">Need Help?</h3>
              <p className="text-sm text-muted-foreground mb-3">
                If you have any questions about your order, our support team is here to help.
              </p>
              <div className="flex items-center justify-center space-x-4 text-sm">
                <div className="flex items-center space-x-1">
                  <Icon name="Mail" size={14} className="text-primary" />
                  <span className="text-primary">support@izishop.cm</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Icon name="Phone" size={14} className="text-primary" />
                  <span className="text-primary">+237 6XX XXX XXX</span>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default OrderSuccess;