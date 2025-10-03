import React, { useState, useEffect } from 'react';
import Icon from '../AppIcon';
import Button from './Button';
import Modal from './Modal';
import api from '../../services/api';
import { showToast } from './Toast';

const OrderDetailModal = ({ isOpen, onClose, order: orderProp }) => {
  const [activeTab, setActiveTab] = useState('overview');

  // Use the order data passed as prop
  const order = orderProp;
  const isLoading = false;
  const error = null;

  // Handler functions for buttons
  const handleTrackPackage = () => {
    if (order?.tracking_number) {
      // Open tracking in new tab - you can customize this URL based on your carrier
      window.open(`https://www.track.com/tracking/${order.tracking_number}`, '_blank');
    }
  };

  const handleLeaveReview = () => {
    if (order?.items && order.items.length > 0) {
      const firstItem = order.items[0];
      const productId = firstItem.product_id || firstItem.id;
      // Use window.location to navigate
      window.location.href = `/product-detail?id=${productId}&review=true`;
    }
  };

  const handleDownloadInvoice = () => {
    showToast({
      type: 'warning',
      message: 'Invoice download feature will be implemented soon',
      duration: 3000
    });
  };

  const handleCancelOrder = async () => {
    if (confirm('Are you sure you want to cancel this order?')) {
      try {
        await api.cancelOrder(order.id, {
          reason: 'customer_request',
          description: 'Cancelled from order details modal'
        });
        alert('Order cancelled successfully');
        onClose();
        window.location.reload();
      } catch (error) {
        console.error('Error cancelling order:', error);
        alert('Failed to cancel order. Please try again.');
      }
    }
  };

  // Debug: Log the order data to see what we're working with
  React.useEffect(() => {
    if (order && isOpen) {
      console.log('🔍 OrderDetailModal received order data:', order);
      console.log('🔍 Order items:', order.items);
      console.log('🔍 Order payment_method:', order.payment_method);
      console.log('🔍 Order keys:', Object.keys(order));
    }
  }, [order, isOpen]);

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('en-GB', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Invalid date';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-CM', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getStatusColor = (status) => {
    const normalizedStatus = status?.toLowerCase();
    switch (normalizedStatus) {
      case 'delivered':
      case 'completed':
        return 'text-emerald-700 bg-emerald-50 border-emerald-200';
      case 'shipped':
      case 'in_transit':
        return 'text-teal-700 bg-teal-50 border-teal-200';
      case 'processing':
      case 'pending':
      case 'confirmed':
        return 'text-amber-700 bg-amber-50 border-amber-200';
      case 'cancelled':
      case 'failed':
        return 'text-red-700 bg-red-50 border-red-200';
      default:
        return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  const getStatusText = (status) => {
    const normalizedStatus = status?.toLowerCase();
    switch (normalizedStatus) {
      case 'delivered':
      case 'completed':
        return 'Delivered';
      case 'shipped':
      case 'in_transit':
        return 'Shipped';
      case 'processing':
        return 'Processing';
      case 'pending':
        return 'Pending';
      case 'confirmed':
        return 'Confirmed';
      case 'cancelled':
        return 'Cancelled';
      case 'failed':
        return 'Failed';
      default:
        return status || 'Unknown';
    }
  };

  // Order tracking timeline data
  // Enhanced status helper functions
  const getEnhancedStatusText = (status) => {
    const statusMap = {
      'pending': 'Order Placed',
      'confirmed': 'Order Confirmed',
      'payment_processing': 'Processing Payment',
      'payment_confirmed': 'Payment Confirmed',
      'processing': 'Preparing Your Order',
      'picking': 'Picking Items',
      'packed': 'Order Packed',
      'ready_for_pickup': 'Ready for Pickup',
      'picked_up': 'Picked Up by Carrier',
      'in_transit': 'In Transit',
      'out_for_delivery': 'Out for Delivery',
      'delivery_attempted': 'Delivery Attempted',
      'delivered': 'Delivered Successfully',
      'completed': 'Order Completed',
      'cancelled': 'Order Cancelled',
      'returned': 'Order Returned',
      'refunded': 'Refund Processed',
      'exception': 'Delivery Exception'
    };
    return statusMap[status?.toLowerCase()] || getStatusText(status);
  };

  const getEnhancedStatusDescription = (status) => {
    const descriptionMap = {
      'pending': 'We\'ve received your order and are processing it.',
      'confirmed': 'Your order is confirmed and we\'re processing your payment.',
      'payment_processing': 'Your payment is being processed.',
      'payment_confirmed': 'Payment confirmed! We\'re preparing your order.',
      'processing': 'Your order is being prepared by the seller.',
      'picking': 'Items are being picked from our warehouse.',
      'packed': 'Your order has been carefully packed.',
      'ready_for_pickup': 'Your order is ready for carrier pickup.',
      'picked_up': 'Your package has been picked up by our delivery partner.',
      'in_transit': 'Your package is on its way to you.',
      'out_for_delivery': 'Your package is out for delivery today.',
      'delivery_attempted': 'Delivery was attempted but unsuccessful. We\'ll try again.',
      'delivered': 'Your package has been delivered successfully!',
      'completed': 'Order completed. Thank you for shopping with us!',
      'cancelled': 'Your order has been cancelled.',
      'returned': 'Your order has been returned.',
      'refunded': 'Your refund has been processed.',
      'exception': 'There\'s an issue with your delivery. We\'re working to resolve it.'
    };
    return descriptionMap[status?.toLowerCase()] || 'Status update available.';
  };

  const getDeliveryStatusBanner = (status) => {
    const bannerMap = {
      'delivered': 'bg-emerald-50 border-emerald-400',
      'out_for_delivery': 'bg-blue-50 border-blue-400',
      'in_transit': 'bg-indigo-50 border-indigo-400',
      'processing': 'bg-amber-50 border-amber-400',
      'cancelled': 'bg-red-50 border-red-400',
      'exception': 'bg-orange-50 border-orange-400'
    };
    return bannerMap[status?.toLowerCase()] || 'bg-gray-50 border-gray-400';
  };

  const getProgressPercentage = (status) => {
    const progressMap = {
      'pending': 5,
      'confirmed': 15,
      'payment_processing': 20,
      'payment_confirmed': 25,
      'processing': 35,
      'picking': 45,
      'packed': 55,
      'ready_for_pickup': 65,
      'picked_up': 75,
      'in_transit': 85,
      'out_for_delivery': 95,
      'delivered': 100,
      'completed': 100
    };
    return progressMap[status?.toLowerCase()] || 0;
  };

  const getEnhancedOrderTimeline = (order) => {
    const timeline = [
      {
        status: 'pending',
        title: 'Order Placed',
        description: 'We\'ve received your order and are processing it.',
        timestamp: order?.created_at,
        icon: 'ShoppingCart'
      },
      {
        status: 'confirmed',
        title: 'Order Confirmed',
        description: 'Your order is confirmed and payment is being processed.',
        timestamp: order?.confirmed_at,
        icon: 'CheckCircle'
      },
      {
        status: 'payment_confirmed',
        title: 'Payment Confirmed',
        description: 'Payment successful! We\'re preparing your order.',
        timestamp: order?.payment_confirmed_at,
        icon: 'CreditCard'
      },
      {
        status: 'processing',
        title: 'Preparing Your Order',
        description: 'Your order is being prepared by the seller.',
        timestamp: order?.processing_started_at,
        icon: 'Package'
      },
      {
        status: 'packed',
        title: 'Order Packed',
        description: 'Your order has been carefully packed and is ready for pickup.',
        timestamp: order?.packed_at,
        icon: 'Box'
      },
      {
        status: 'picked_up',
        title: 'Picked Up',
        description: 'Your package has been picked up by our delivery partner.',
        timestamp: order?.picked_up_at,
        icon: 'Truck'
      },
      {
        status: 'in_transit',
        title: 'In Transit',
        description: 'Your package is on its way to you.',
        timestamp: order?.shipped_at,
        icon: 'MapPin'
      },
      {
        status: 'out_for_delivery',
        title: 'Out for Delivery',
        description: 'Your package is out for delivery today.',
        timestamp: order?.out_for_delivery_at,
        icon: 'Navigation'
      },
      {
        status: 'delivered',
        title: 'Delivered',
        description: 'Your package has been delivered successfully!',
        timestamp: order?.delivered_at,
        icon: 'Home'
      }
    ];

    const currentStatus = order?.status?.toLowerCase();

    return timeline.map(step => {
      let state = 'upcoming';

      if (step.timestamp) {
        state = 'completed';
      } else if (step.status === currentStatus) {
        state = 'current';
      } else {
        // Check if this step comes before the current status
        const statusOrder = ['pending', 'confirmed', 'payment_confirmed', 'processing', 'packed', 'picked_up', 'in_transit', 'out_for_delivery', 'delivered'];
        const stepIndex = statusOrder.indexOf(step.status);
        const currentIndex = statusOrder.indexOf(currentStatus);

        if (stepIndex < currentIndex) {
          state = 'completed';
        }
      }

      return { ...step, state };
    });
  };

  const getNextStepInfo = (status) => {
    const nextStepMap = {
      'pending': 'We\'ll confirm your order and process payment shortly.',
      'confirmed': 'Payment is being processed. You\'ll receive confirmation soon.',
      'payment_confirmed': 'Your order will be prepared and packed by the seller.',
      'processing': 'Your items are being picked and will be packed soon.',
      'packed': 'Your order is ready and waiting for carrier pickup.',
      'picked_up': 'Your package is being transported to the delivery facility.',
      'in_transit': 'Your package will be out for delivery soon.',
      'out_for_delivery': 'Your package should arrive today. Someone should be available to receive it.',
      'delivery_attempted': 'We\'ll attempt delivery again. You can also arrange pickup or reschedule.',
    };
    return nextStepMap[status?.toLowerCase()];
  };

  const formatTime = (dateString) => {
    try {
      return new Date(dateString).toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return '';
    }
  };

  // Legacy function for backward compatibility
  const getOrderTimeline = (order) => {
    return getEnhancedOrderTimeline(order);
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: 'Package' },
    { id: 'tracking', label: 'Tracking', icon: 'Truck' },
    { id: 'items', label: 'Items', icon: 'ShoppingBag' },
    { id: 'billing', label: 'Billing', icon: 'CreditCard' }
  ];

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="4xl" showCloseButton={false}>
      <div className="bg-white rounded-lg max-h-[95vh] md:max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-4 md:px-6 py-4 border-b border-gray-200 bg-gray-50 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <h2 className="text-lg md:text-xl font-semibold text-gray-900 truncate">
                Order Details
              </h2>
              {order && (
                <p className="text-sm text-gray-600 mt-1 truncate">
                  Order #{order.order_number || order.id}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors ml-4 flex-shrink-0"
            >
              <Icon name="X" size={20} className="text-gray-500" />
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-2 border-teal-600 border-t-transparent mx-auto mb-4"></div>
            <p className="text-gray-600">Loading order details...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Icon name="AlertCircle" size={24} className="text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Order</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={fetchOrderDetails} variant="outline" size="sm">
              Try Again
            </Button>
          </div>
        ) : order ? (
          <>
            {/* Status Bar */}
            <div className="px-4 md:px-6 py-4 bg-gradient-to-r from-teal-50 to-blue-50 border-b border-brand-light flex-shrink-0">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="min-w-0">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(order.status)}`}>
                    {getStatusText(order.status)}
                  </span>
                  <p className="text-sm text-gray-600 mt-1 truncate">
                    Placed on {formatDate(order.created_at)}
                  </p>
                </div>
                <div className="text-left sm:text-right flex-shrink-0">
                  <p className="text-xl md:text-2xl font-bold text-gray-900">
                    {formatCurrency(order.total_amount || order.total || 0)}
                  </p>
                  <p className="text-sm text-gray-600">Total</p>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="px-4 md:px-6 border-b border-gray-200 flex-shrink-0">
              <nav className="flex space-x-4 md:space-x-8 overflow-x-auto scrollbar-hide">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-3 md:py-4 px-2 md:px-1 border-b-2 font-medium text-sm flex items-center space-x-1 md:space-x-2 transition-colors whitespace-nowrap flex-shrink-0 ${
                      activeTab === tab.id
                        ? 'border-teal-500 text-teal-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon name={tab.icon} size={16} />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </button>
                ))}
              </nav>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6">
              {activeTab === 'overview' && (
                <div className="space-y-4 md:space-y-6">
                  {/* Quick Stats */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                    <div className="bg-gray-50 p-3 md:p-4 rounded-lg">
                      <p className="text-xs md:text-sm text-gray-600">Order Number</p>
                      <p className="font-semibold text-gray-900 text-sm md:text-base truncate">{order.order_number || order.id}</p>
                    </div>
                    <div className="bg-gray-50 p-3 md:p-4 rounded-lg">
                      <p className="text-xs md:text-sm text-gray-600">Items</p>
                      <p className="font-semibold text-gray-900 text-sm md:text-base">{order.items?.length || 0}</p>
                    </div>
                    <div className="bg-gray-50 p-3 md:p-4 rounded-lg">
                      <p className="text-xs md:text-sm text-gray-600">Shop</p>
                      <p className="font-semibold text-gray-900 text-sm md:text-base truncate">{order.shop_name || 'N/A'}</p>
                    </div>
                    <div className="bg-gray-50 p-3 md:p-4 rounded-lg">
                      <p className="text-xs md:text-sm text-gray-600">Payment Method</p>
                      <p className="font-semibold text-gray-900 text-sm md:text-base truncate">{order.payment_method || 'N/A'}</p>
                    </div>
                  </div>

                  {/* Shipping Information */}
                  {(order.shipping_address || order.tracking_number) && (
                    <div className="bg-blue-50 p-3 md:p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-2 md:mb-3 flex items-center text-sm md:text-base">
                        <Icon name="Truck" size={16} className="mr-2" />
                        Shipping Information
                      </h4>
                      {order.tracking_number && (
                        <p className="text-xs md:text-sm text-gray-700 mb-2">
                          <span className="font-medium">Tracking Number:</span>
                          <span className="block sm:inline sm:ml-1 break-all">{order.tracking_number}</span>
                        </p>
                      )}
                      {order.shipping_address && (
                        <p className="text-xs md:text-sm text-gray-700">
                          <span className="font-medium">Address:</span>
                          <span className="block sm:inline sm:ml-1">{order.shipping_address}</span>
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'tracking' && (
                <div className="space-y-6">
                  {/* Enhanced Delivery Status Banner */}
                  <div className={`p-4 rounded-lg border-l-4 ${getDeliveryStatusBanner(order.status)}`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900">{getEnhancedStatusText(order.status)}</h3>
                        <p className="text-sm text-gray-600 mt-1">{getEnhancedStatusDescription(order.status)}</p>
                      </div>
                      {order.current_estimated_delivery && (
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">Expected Delivery</p>
                          <p className="text-sm text-gray-600">{formatDate(order.current_estimated_delivery)}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="relative">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Order Progress</span>
                      <span className="text-sm text-gray-500">{getProgressPercentage(order.status)}% Complete</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-teal-500 to-emerald-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${getProgressPercentage(order.status)}%` }}
                      />
                    </div>
                  </div>

                  {/* Enhanced Timeline */}
                  <div className="relative">
                    <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                    <div className="space-y-6">
                      {getEnhancedOrderTimeline(order).map((step, index) => (
                        <div key={step.status} className="relative flex items-start space-x-4">
                          {/* Timeline dot with connecting line */}
                          <div className="relative z-10">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                              step.state === 'completed' ? 'bg-emerald-50 border-emerald-500 text-emerald-600' :
                              step.state === 'current' ? 'bg-teal-50 border-teal-500 text-teal-600 shadow-md' :
                              'bg-gray-50 border-gray-300 text-gray-400'
                            }`}>
                              {step.state === 'completed' ? (
                                <Icon name="Check" size={16} />
                              ) : step.state === 'current' ? (
                                <div className="w-3 h-3 bg-teal-500 rounded-full animate-pulse"></div>
                              ) : (
                                <Icon name={step.icon || 'Circle'} size={14} />
                              )}
                            </div>
                            {/* Animated pulse for current step */}
                            {step.state === 'current' && (
                              <div className="absolute inset-0 w-8 h-8 rounded-full bg-teal-400 opacity-25 animate-ping"></div>
                            )}
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0 pb-6">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className={`font-medium transition-colors ${
                                step.state === 'completed' ? 'text-gray-900' :
                                step.state === 'current' ? 'text-teal-700' :
                                'text-gray-500'
                              }`}>
                                {step.title}
                                {step.state === 'current' && (
                                  <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-teal-100 text-teal-700">
                                    In Progress
                                  </span>
                                )}
                              </h4>
                              {step.timestamp && (
                                <span className="text-sm text-gray-500">
                                  {formatDate(step.timestamp)}
                                </span>
                              )}
                            </div>
                            <p className={`text-sm ${
                              step.state === 'completed' ? 'text-gray-600' :
                              step.state === 'current' ? 'text-teal-600' :
                              'text-gray-400'
                            }`}>
                              {step.description}
                            </p>

                            {/* Additional info for certain statuses */}
                            {step.status === 'out_for_delivery' && step.state === 'current' && (
                              <div className="mt-2 p-3 bg-blue-50 rounded-lg">
                                <div className="flex items-center text-blue-700">
                                  <Icon name="Truck" size={16} className="mr-2" />
                                  <span className="text-sm font-medium">Your package is being delivered today</span>
                                </div>
                                {order.delivery_window_start && order.delivery_window_end && (
                                  <p className="text-sm text-blue-600 mt-1">
                                    Expected between {formatTime(order.delivery_window_start)} - {formatTime(order.delivery_window_end)}
                                  </p>
                                )}
                              </div>
                            )}

                            {/* Tracking number info */}
                            {step.status === 'in_transit' && order.tracking_number && step.state === 'current' && (
                              <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="text-sm font-medium text-gray-700">Tracking Number</p>
                                    <p className="text-sm text-gray-600 font-mono">{order.tracking_number}</p>
                                  </div>
                                  <button className="px-3 py-1 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
                                    Track with Carrier
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Next Steps */}
                  {getNextStepInfo(order.status) && (
                    <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <h4 className="font-medium text-blue-900 mb-2 flex items-center">
                        <Icon name="Info" size={16} className="mr-2" />
                        What's Next?
                      </h4>
                      <p className="text-sm text-blue-700">{getNextStepInfo(order.status)}</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'items' && (
                <div className="space-y-4">
                  <div className="space-y-4">
                    {order.items?.map((item, index) => (
                      <div key={item.id || index} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                        <div className="w-16 h-16 flex-shrink-0 overflow-hidden rounded-lg bg-gray-200">
                          {item.product?.image_url || item.image ? (
                            <img
                              src={item.product?.image_url || item.image}
                              alt={item.product?.name || item.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <div className="w-full h-full flex items-center justify-center" style={{ display: item.product?.image_url || item.image ? 'none' : 'flex' }}>
                            <Icon name="Package" size={24} className="text-gray-400" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 mb-1">
                            {item.product?.name || item.name || 'Product'}
                          </h4>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <span>Quantity: {item.quantity || 1}</span>
                            <span>Unit Price: {formatCurrency(item.unit_price || item.price || 0)}</span>
                            <span className="font-medium text-gray-900">
                              Total: {formatCurrency(item.total_price || ((item.unit_price || item.price || 0) * (item.quantity || 1)))}
                            </span>
                          </div>
                          {item.product?.description && (
                            <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                              {item.product.description}
                            </p>
                          )}
                        </div>
                      </div>
                    )) || (
                      <div className="text-center py-8 text-gray-500">
                        No items found for this order
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'billing' && (
                <div className="space-y-4 md:space-y-6">
                  {/* Order Summary */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-4">Order Summary</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Subtotal</span>
                        <span className="text-gray-900">{formatCurrency((order.subtotal || order.total_amount || order.total || 0) * 0.9)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Shipping</span>
                        <span className="text-gray-900">{formatCurrency((order.shipping_cost || (order.total_amount || order.total || 0) * 0.05))}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Tax</span>
                        <span className="text-gray-900">{formatCurrency((order.tax || (order.total_amount || order.total || 0) * 0.05))}</span>
                      </div>
                      <div className="border-t border-gray-300 pt-2 mt-2">
                        <div className="flex justify-between font-semibold">
                          <span className="text-gray-900">Total</span>
                          <span className="text-gray-900">{formatCurrency(order.total_amount || order.total || 0)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Payment Information */}
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                      <Icon name="CreditCard" size={16} className="mr-2" />
                      Payment Information
                    </h4>
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">Payment Method:</span> {order.payment_method || 'Credit Card'}
                    </p>
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">Payment Status:</span>
                      <span className="ml-1 px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                        {order.payment_status || 'Paid'}
                      </span>
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="px-4 md:px-6 py-3 md:py-4 border-t border-gray-200 bg-gray-50 flex flex-wrap gap-2 md:gap-3 flex-shrink-0">
              {order.tracking_number && (
                <Button
                  variant="outline"
                  size="sm"
                  iconName="ExternalLink"
                  iconPosition="left"
                  className="border-teal-300 text-teal-700 hover:bg-teal-50"
                  onClick={handleTrackPackage}
                >
                  Track Package
                </Button>
              )}

              {(order.status === 'delivered' || order.status === 'completed') && (
                <Button
                  variant="outline"
                  size="sm"
                  iconName="Star"
                  iconPosition="left"
                  className="border-amber-300 text-amber-700 hover:bg-amber-50"
                  onClick={handleLeaveReview}
                >
                  Leave Review
                </Button>
              )}

              <Button
                variant="outline"
                size="sm"
                iconName="Download"
                iconPosition="left"
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
                onClick={handleDownloadInvoice}
              >
                Download Invoice
              </Button>

              {(order.status === 'pending' || order.status === 'processing') && (
                <Button
                  variant="outline"
                  size="sm"
                  iconName="X"
                  iconPosition="left"
                  className="border-red-300 text-red-700 hover:bg-red-50"
                  onClick={handleCancelOrder}
                >
                  Cancel Order
                </Button>
              )}
            </div>
          </>
        ) : (
          <div className="p-8 text-center">
            <Icon name="Package" size={48} className="text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Order Not Found</h3>
            <p className="text-gray-600">The requested order could not be found.</p>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default OrderDetailModal;