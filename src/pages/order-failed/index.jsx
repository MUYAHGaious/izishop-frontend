import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';

const OrderFailed = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { clearCart } = useCart();
  const { user } = useAuth();
  const [orderDetails, setOrderDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [paymentData, setPaymentData] = useState(null);
  const [orderNumber, setOrderNumber] = useState(null);

  useEffect(() => {
    const initializeOrderFailed = async () => {
      try {
        // Get payment reference from URL parameters
        const paymentReference = searchParams.get('reference');
        const transactionId = searchParams.get('transaction_id');
        const status = searchParams.get('status');
        const orderId = searchParams.get('order_id');
        const errorMessage = searchParams.get('error');

        console.log('Order failed params:', { paymentReference, transactionId, status, orderId, errorMessage });

        // Set order number once
        const refFromUrl = searchParams.get('reference');
        const orderIdFromUrl = searchParams.get('order_id');
        const finalOrderNumber = orderIdFromUrl || refFromUrl || generateOrderNumber();
        setOrderNumber(finalOrderNumber);

        // Load checkout data from localStorage
        const checkoutDataStr = localStorage.getItem('checkoutFormData');
        const cartDataStr = localStorage.getItem('checkoutData');

        if (checkoutDataStr) {
          const checkoutData = JSON.parse(checkoutDataStr);
          setOrderDetails(checkoutData);
        }

        if (cartDataStr) {
          const cartData = JSON.parse(cartDataStr);
          setPaymentData(cartData);
        }

        // If we have an order ID, try to fetch real order data from backend
        if (orderId && user) {
          try {
            const response = await fetch(`/api/orders/${orderId}`, {
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
              }
            });
            
            if (response.ok) {
              const realOrderData = await response.json();
              console.log('Real order data:', realOrderData);
              setOrderDetails(realOrderData);
              setPaymentData({
                items: realOrderData.items,
                total: realOrderData.total_amount
              });
            }
          } catch (error) {
            console.error('Error fetching real order data:', error);
          }
        }

        // Update order status to failed in backend
        if (orderId && user) {
          try {
            await fetch(`/api/orders/${orderId}/status`, {
              method: 'PATCH',
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                status: 'cancelled',
                notes: `Payment failed: ${errorMessage || 'Unknown error'}`
              })
            });
          } catch (error) {
            console.error('Error updating order status:', error);
          }
        }

      } catch (error) {
        console.error('Error loading order details:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeOrderFailed();
  }, []); // Empty dependency array to run only once

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-CM', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const handleRetryPayment = () => {
    // Navigate back to checkout with the same data
    navigate('/checkout');
  };

  const handleContinueShopping = () => {
    navigate('/');
  };

  const handleContactSupport = () => {
    // Navigate to support or open email
    window.location.href = 'mailto:support@izishopin.cm?subject=Payment Failed - Order Support';
  };

  const generateOrderNumber = () => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 5).toUpperCase();
    return `ORD-${timestamp}-${random}`;
  };

  // Order number is now set in state to prevent infinite loops
  const errorMessage = searchParams.get('error') || 'Payment processing failed';

  // Calculate totals from real order data
  const subtotal = paymentData?.items?.reduce((sum, item) => {
    const price = item.unit_price || item.price || 0;
    const quantity = item.quantity || 0;
    return sum + (price * quantity);
  }, 0) || 0;
  
  const taxRate = 0.1925; // 19.25% TVA Cameroun
  const taxes = subtotal * taxRate;
  const deliveryCost = orderDetails?.deliveryCost || 0;
  const total = subtotal + taxes + deliveryCost;

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-r from-red-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red-200 border-t-red-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Processing your order status...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Payment Failed - IziShop</title>
        <meta name="description" content="Your payment could not be processed. Please try again or contact support." />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-r from-red-50 to-orange-50">
        {/* Header */}
        <header className="bg-white shadow-sm sticky top-0 z-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => navigate('/')}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Go home"
                >
                  <Icon name="Home" size={20} className="text-gray-600" />
                </button>
                <div className="flex items-center space-x-2">
                  <Icon name="Package" size={24} className="text-red-600" />
                  <span className="text-xl font-bold text-gray-900">IziShopin</span>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Icon name="XCircle" size={16} className="text-red-500" />
                  <span>Payment Failed</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="px-4 py-6 sm:px-6 lg:px-8 sm:py-12 max-w-3xl mx-auto">
          {/* Failed Icon and Message */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Icon name="XCircle" size={40} className="text-red-600" />
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Payment Failed
            </h1>
            <p className="text-lg text-gray-600 mb-6 max-w-2xl mx-auto">
              We're sorry, but your payment could not be processed. Please try again or contact our support team for assistance.
            </p>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4 inline-block">
              <p className="text-red-800 font-semibold">
                Order Reference: {orderNumber || 'Loading...'}
              </p>
              <p className="text-red-700 text-sm mt-1">
                Error: {errorMessage}
              </p>
            </div>
          </div>

          {/* Order Details Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Details</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Order Info */}
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Order Information</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Order Reference:</span>
                    <span className="text-gray-900 font-medium">{orderNumber || 'Loading...'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Order Date:</span>
                    <span className="text-gray-900">{new Date().toLocaleDateString('en-GB')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment Status:</span>
                    <span className="text-red-600 font-medium">Failed</span>
                  </div>
                </div>
              </div>

              {/* Payment Info */}
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Payment Information</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment Method:</span>
                    <span className="text-gray-900">{orderDetails?.payment_method || orderDetails?.paymentMethod || 'Mobile Money'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Amount:</span>
                    <span className="text-gray-900 font-semibold">{formatCurrency(total)}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Icon name="AlertTriangle" size={14} className="text-red-600" />
                    <span className="text-red-600 text-xs">Payment not processed</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Items Summary */}
            {paymentData?.items && paymentData.items.length > 0 && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="font-medium text-gray-900 mb-3">Items ({paymentData.items.length})</h3>
                <div className="space-y-3">
                  {paymentData.items.slice(0, 3).map((item, index) => {
                    const price = item.unit_price || item.price || 0;
                    const quantity = item.quantity || 0;
                    const name = item.product_name || item.name || 'Unknown Product';
                    
                    return (
                      <div key={index} className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex-shrink-0"></div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{name}</p>
                          <p className="text-sm text-gray-600">Qty: {quantity} × {formatCurrency(price)}</p>
                        </div>
                        <span className="text-sm font-medium text-gray-900">{formatCurrency(price * quantity)}</span>
                      </div>
                    );
                  })}
                  {paymentData.items.length > 3 && (
                    <p className="text-sm text-gray-600">+ {paymentData.items.length - 3} more items</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* What to do next */}
          <div className="bg-orange-50 rounded-xl border border-orange-200 p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <Icon name="RefreshCw" size={20} className="text-orange-600" />
              <span>What can you do?</span>
            </h2>

            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-sm font-bold">1</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Retry Payment</p>
                  <p className="text-sm text-gray-600">Try the payment again with the same order details.</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-gray-600 text-sm font-bold">2</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Check Payment Method</p>
                  <p className="text-sm text-gray-600">Verify your mobile money account has sufficient funds.</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-gray-600 text-sm font-bold">3</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Contact Support</p>
                  <p className="text-sm text-gray-600">Get help from our support team if the issue persists.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              variant="default"
              onClick={handleRetryPayment}
              iconName="RefreshCw"
              iconPosition="left"
              className="w-full sm:w-auto px-8 py-3 bg-orange-600 hover:bg-orange-700 text-white"
            >
              Retry Payment
            </Button>

            <Button
              variant="outline"
              onClick={handleContactSupport}
              iconName="Mail"
              iconPosition="left"
              className="w-full sm:w-auto px-8 py-3 border-orange-600 text-orange-600 hover:bg-orange-50"
            >
              Contact Support
            </Button>

            <Button
              variant="outline"
              onClick={handleContinueShopping}
              iconName="ShoppingBag"
              iconPosition="left"
              className="w-full sm:w-auto px-8 py-3 border-gray-600 text-gray-600 hover:bg-gray-50"
            >
              Continue Shopping
            </Button>
          </div>

          {/* Help Section */}
          <div className="mt-8 text-center">
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="font-medium text-gray-900 mb-2">Need Help?</h3>
              <p className="text-sm text-gray-600 mb-4">
                If you continue to experience payment issues, our support team is here to help.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <Icon name="Mail" size={16} className="text-orange-600" />
                  <span className="text-gray-700">support@izishopin.cm</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Icon name="Phone" size={16} className="text-orange-600" />
                  <span className="text-gray-700">+237 6XX XXX XXX</span>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default OrderFailed;
