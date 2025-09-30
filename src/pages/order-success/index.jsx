import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';

const OrderSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { clearCart } = useCart();
  const { user } = useAuth();
  const [orderDetails, setOrderDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [paymentData, setPaymentData] = useState(null);
  const [orderNumber, setOrderNumber] = useState(null);

  useEffect(() => {
    const initializeOrderSuccess = async () => {
      try {
        // Get payment reference from URL parameters (from Tranzak redirect)
        const paymentReference = searchParams.get('reference');
        const transactionId = searchParams.get('transaction_id');
        const status = searchParams.get('status');
        const orderId = searchParams.get('order_id');
        const amount = searchParams.get('amount'); // Get amount from URL if available

        console.log('Order success params:', { paymentReference, transactionId, status, orderId, amount });

        // Set order number once
        const refFromUrl = searchParams.get('reference');
        const orderIdFromUrl = searchParams.get('order_id');
        const finalOrderNumber = orderIdFromUrl || refFromUrl || generateOrderNumber();
        setOrderNumber(finalOrderNumber);

        // Load checkout data from localStorage
        const checkoutDataStr = localStorage.getItem('checkoutFormData');
        const cartDataStr = localStorage.getItem('checkoutData');

        let orderData = null;
        let cartData = null;

        if (checkoutDataStr) {
          orderData = JSON.parse(checkoutDataStr);
          setOrderDetails(orderData);
        }

        if (cartDataStr) {
          cartData = JSON.parse(cartDataStr);
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

        // If payment was successful, clear the cart and saved data AFTER preserving order data
        if (status === 'success' || status === 'completed') {
          // Send order confirmation to backend API
          if (orderId && user) {
            try {
              await fetch(`/api/orders/${orderId}/confirm`, {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${localStorage.getItem('token')}`,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  paymentReference,
                  transactionId,
                  status: 'completed'
                })
              });
            } catch (error) {
              console.error('Error confirming order:', error);
            }
          }

          // Clear cart and localStorage AFTER we've used the data
          clearCart();
          localStorage.removeItem('checkoutFormData');
          localStorage.removeItem('checkoutData');
        }

      } catch (error) {
        console.error('Error loading order details:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeOrderSuccess();
  }, []); // Empty dependency array to run only once

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
      navigate('/my-orders');
    } else {
      navigate('/authentication-login-register');
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
    // Handle both cart format and order format
    const price = item.unit_price || item.price || 0;
    const quantity = item.quantity || 0;
    return sum + (price * quantity);
  }, 0) || 0;

  const taxRate = 0.1925; // 19.25% TVA Cameroun
  const taxes = subtotal * taxRate;
  const deliveryCost = orderDetails?.deliveryCost || 0;

  // Use URL amount parameter if available, otherwise calculate from items
  const urlAmount = searchParams.get('amount');
  const calculatedTotal = subtotal + taxes + deliveryCost;
  const total = urlAmount ? parseFloat(urlAmount) : (paymentData?.total || calculatedTotal);
  
  // Debug logging
  console.log('Order success totals:', {
    subtotal,
    taxes,
    deliveryCost,
    total,
    paymentData,
    orderDetails
  });

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-r from-teal-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Processing your order...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Order Success - IziShop</title>
        <meta name="description" content="Your order has been placed successfully. Thank you for shopping with IziShop." />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-r from-teal-50 to-cyan-50">
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
                  <Icon name="Package" size={24} className="text-teal-600" />
                  <span className="text-xl font-bold text-gray-900">IziShopin</span>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Icon name="CheckCircle" size={16} className="text-green-500" />
                  <span>Order Confirmed</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="px-4 py-6 sm:px-6 lg:px-8 sm:py-12 max-w-3xl mx-auto">
          {/* Success Icon and Message */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Icon name="CheckCircle" size={40} className="text-green-600" />
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Payment Successful!
            </h1>
            <p className="text-lg text-gray-600 mb-6 max-w-2xl mx-auto">
              Thank you for your purchase. Your order has been confirmed and will be processed shortly.
            </p>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4 inline-block">
              <p className="text-green-800 font-semibold">
                Order Reference: {orderNumber || 'Loading...'}
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
                    <span className="text-green-600 font-medium">Confirmed</span>
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
                    <Icon name="Shield" size={14} className="text-green-600" />
                    <span className="text-green-600 text-xs">Protected by Escrow</span>
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

          {/* What's Next */}
          <div className="bg-teal-50 rounded-xl border border-teal-200 p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <Icon name="Clock" size={20} className="text-teal-600" />
              <span>What happens next?</span>
            </h2>

            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-teal-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-sm font-bold">1</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Order Confirmation</p>
                  <p className="text-sm text-gray-600">You'll receive an email confirmation shortly with your order details.</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-gray-600 text-sm font-bold">2</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Order Processing</p>
                  <p className="text-sm text-gray-600">The seller will prepare your items for shipment within 1-2 business days.</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-gray-600 text-sm font-bold">3</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Shipping & Delivery</p>
                  <p className="text-sm text-gray-600">Track your package and receive it by {estimatedDelivery}.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              variant="default"
              onClick={handleContinueShopping}
              iconName="ShoppingBag"
              iconPosition="left"
              className="w-full sm:w-auto px-8 py-3 bg-teal-600 hover:bg-teal-700 text-white"
            >
              Continue Shopping
            </Button>

            <Button
              variant="outline"
              onClick={handleViewOrders}
              iconName="Package"
              iconPosition="left"
              className="w-full sm:w-auto px-8 py-3 border-teal-600 text-teal-600 hover:bg-teal-50"
            >
              View My Orders
            </Button>
          </div>

          {/* Help Section */}
          <div className="mt-8 text-center">
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="font-medium text-gray-900 mb-2">Need Help?</h3>
              <p className="text-sm text-gray-600 mb-4">
                If you have any questions about your order, our support team is here to help.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <Icon name="Mail" size={16} className="text-teal-600" />
                  <span className="text-gray-700">support@izishopin.cm</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Icon name="Phone" size={16} className="text-teal-600" />
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

export default OrderSuccess;