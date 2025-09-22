import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';

const OrderPending = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { clearCart } = useCart();
  const { user } = useAuth();
  const [orderDetails, setOrderDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [paymentData, setPaymentData] = useState(null);
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [orderNumber, setOrderNumber] = useState(null);

  useEffect(() => {
    const initializeOrderPending = async () => {
      try {
        // Get payment reference from URL parameters
        const paymentReference = searchParams.get('reference');
        const transactionId = searchParams.get('transaction_id');
        const status = searchParams.get('status');
        const orderId = searchParams.get('order_id');

        console.log('Order pending params:', { paymentReference, transactionId, status, orderId });

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

      } catch (error) {
        console.error('Error loading order details:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeOrderPending();
  }, []); // Empty dependency array to run only once

  const checkPaymentStatus = async () => {
    const orderId = searchParams.get('order_id');
    if (!orderId || !user) return;

    setCheckingStatus(true);
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const orderData = await response.json();
        
        // Check if payment status has changed
        if (orderData.payment_status === 'paid') {
          // Redirect to success page
          navigate(`/order-success?order_id=${orderId}&status=completed`);
          return;
        } else if (orderData.payment_status === 'failed') {
          // Redirect to failed page
          navigate(`/order-failed?order_id=${orderId}&status=failed`);
          return;
        }
        
        // Update order details
        setOrderDetails(orderData);
        setPaymentData({
          items: orderData.items,
          total: orderData.total_amount
        });
      }
    } catch (error) {
      console.error('Error checking payment status:', error);
    } finally {
      setCheckingStatus(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-CM', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const handleContinueShopping = () => {
    navigate('/');
  };

  const handleViewOrders = () => {
    if (user) {
      navigate('/profile/orders');
    } else {
      navigate('/login');
    }
  };

  const generateOrderNumber = () => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 5).toUpperCase();
    return `ORD-${timestamp}-${random}`;
  };

  // Order number is now set in state to prevent infinite loops
  const estimatedDelivery = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB');

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
      <div className="min-h-screen bg-gradient-to-r from-yellow-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-yellow-200 border-t-yellow-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your order...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Payment Pending - IziShop</title>
        <meta name="description" content="Your payment is being processed. Please wait for confirmation." />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-r from-yellow-50 to-orange-50">
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
                  <Icon name="Package" size={24} className="text-yellow-600" />
                  <span className="text-xl font-bold text-gray-900">IziShopin</span>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Icon name="Clock" size={16} className="text-yellow-500" />
                  <span>Payment Pending</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="px-4 py-6 sm:px-6 lg:px-8 sm:py-12 max-w-3xl mx-auto">
          {/* Pending Icon and Message */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Icon name="Clock" size={40} className="text-yellow-600" />
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Payment Pending
            </h1>
            <p className="text-lg text-gray-600 mb-6 max-w-2xl mx-auto">
              Your payment is being processed. Please wait for confirmation from your mobile money provider.
            </p>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 inline-block">
              <p className="text-yellow-800 font-semibold">
                Order Reference: {orderNumber || 'Loading...'}
              </p>
              <p className="text-yellow-700 text-sm mt-1">
                Status: Awaiting payment confirmation
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
                    <span className="text-gray-600">Estimated Delivery:</span>
                    <span className="text-gray-900">{estimatedDelivery}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment Status:</span>
                    <span className="text-yellow-600 font-medium">Pending</span>
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
                    <span className="text-gray-600">Total Amount:</span>
                    <span className="text-gray-900 font-semibold">{formatCurrency(total)}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Icon name="Clock" size={14} className="text-yellow-600" />
                    <span className="text-yellow-600 text-xs">Processing payment</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Items Summary */}
            {paymentData?.items && paymentData.items.length > 0 && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="font-medium text-gray-900 mb-3">Items Ordered ({paymentData.items.length})</h3>
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

          {/* Payment Instructions */}
          <div className="bg-blue-50 rounded-xl border border-blue-200 p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <Icon name="Smartphone" size={20} className="text-blue-600" />
              <span>Complete Your Payment</span>
            </h2>

            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-sm font-bold">1</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Check Your Phone</p>
                  <p className="text-sm text-gray-600">Look for a payment request from your mobile money provider (MTN MoMo or Orange Money).</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-gray-600 text-sm font-bold">2</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Authorize Payment</p>
                  <p className="text-sm text-gray-600">Enter your mobile money PIN to authorize the payment of {formatCurrency(total)}.</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-gray-600 text-sm font-bold">3</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Wait for Confirmation</p>
                  <p className="text-sm text-gray-600">You'll receive a confirmation message once the payment is processed.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              variant="default"
              onClick={checkPaymentStatus}
              iconName="RefreshCw"
              iconPosition="left"
              className="w-full sm:w-auto px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white"
              disabled={checkingStatus}
            >
              {checkingStatus ? 'Checking...' : 'Check Status'}
            </Button>

            <Button
              variant="outline"
              onClick={handleViewOrders}
              iconName="Package"
              iconPosition="left"
              className="w-full sm:w-auto px-8 py-3 border-blue-600 text-blue-600 hover:bg-blue-50"
            >
              View My Orders
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

          {/* Auto-refresh notice */}
          <div className="mt-6 text-center">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">
                <Icon name="Info" size={16} className="inline mr-2 text-blue-600" />
                This page will automatically update when your payment is confirmed. You can also check the status manually.
              </p>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default OrderPending;
