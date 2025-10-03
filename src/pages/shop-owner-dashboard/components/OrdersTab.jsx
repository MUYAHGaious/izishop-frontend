import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import ChatInterfaceModal from '../../chat-interface-modal';
import ChatModal from '../../../components/chat/ChatModal';
import api from '../../../services/api';
import { showToast } from '../../../components/ui/Toast';

const OrdersTab = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [ordersPerPage] = useState(10);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingOrderId, setUpdatingOrderId] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactingCustomer, setContactingCustomer] = useState(null);
  const [showChatModal, setShowChatModal] = useState(false);

  // Load orders from API
  useEffect(() => {
    const loadOrders = async () => {
      try {
        setLoading(true);
        const response = await api.getShopOwnerOrders({
          page: currentPage,
          limit: ordersPerPage,
          status: statusFilter || undefined,
          search: searchQuery || undefined
        });
        
        console.log('Orders API response:', response);
        
        // Transform API response to match component structure
        const transformedOrders = (response.orders || response || []).map(order => ({
          id: order.id || `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 3)}`,
          customer: {
            name: order.customer_name || order.user?.name || 'Unknown Customer',
            email: order.customer_email || order.user?.email || 'unknown@email.com',
            avatar: order.customer_avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(order.customer_name || 'User')}&background=random`
          },
          items: (order.items && Array.isArray(order.items)) ? order.items.map(item => ({
            id: item.id,
            name: item.product_name || 'Product',
            quantity: item.quantity || 1,
            price: parseFloat(item.unit_price || 0),
            totalPrice: parseFloat(item.total_price || 0),
            image: item.product_image || null,
            description: item.product_description || null,
            variants: item.variants || null
          })) : [{
            name: order.product_name || 'Product',
            quantity: order.quantity || 1,
            price: parseFloat(order.unit_price || order.total_amount || 0),
            totalPrice: parseFloat(order.total_amount || 0)
          }],
          total: parseFloat(order.total_amount || 0),
          status: order.status || 'pending',
          paymentStatus: order.payment_status || 'pending',
          orderDate: order.created_at || new Date().toISOString(),
          deliveryAddress: order.delivery_address || order.shipping_address || 'Address not provided',
          trackingNumber: order.tracking_number || null
        }));
        
        setOrders(transformedOrders);
      } catch (error) {
        console.error('Error loading orders:', error);
        showToast({
          type: 'error',
          message: 'Failed to load orders.',
          duration: 3000
        });
        
        // No fallback data - show empty state
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, [currentPage, statusFilter, searchQuery]);

  // Handle refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      // Reset to first page and reload orders
      setCurrentPage(1);
      setSearchQuery('');
      setStatusFilter('');

      // Reload orders with fresh data
      const response = await api.getShopOwnerOrders({
        page: 1,
        limit: ordersPerPage
      });

      console.log('Refresh - Orders API response:', response);

      // Transform API response to match component structure
      const transformedOrders = (response.orders || response || []).map(order => ({
        id: order.id || `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 3)}`,
        customer: {
          name: order.customer_name || order.user?.name || 'Unknown Customer',
          email: order.customer_email || order.user?.email || 'unknown@email.com',
          avatar: order.customer_avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(order.customer_name || 'User')}&background=random`
        },
        items: (order.items && Array.isArray(order.items)) ? order.items.map(item => ({
          id: item.id,
          name: item.product_name || 'Product',
          quantity: item.quantity || 1,
          price: parseFloat(item.unit_price || 0),
          totalPrice: parseFloat(item.total_price || 0),
          image: item.product_image || null,
          description: item.product_description || null,
          variants: item.variants || null
        })) : [{
          name: order.product_name || 'Product',
          quantity: order.quantity || 1,
          price: parseFloat(order.unit_price || order.total_amount || 0),
          totalPrice: parseFloat(order.total_amount || 0)
        }],
        total: parseFloat(order.total_amount || 0),
        status: order.status || 'pending',
        paymentStatus: order.payment_status || 'pending',
        orderDate: order.created_at || new Date().toISOString(),
        deliveryAddress: order.delivery_address || order.shipping_address || 'Address not provided',
        trackingNumber: order.tracking_number || null
      }));

      setOrders(transformedOrders);

      showToast({
        type: 'success',
        message: 'Orders refreshed successfully!',
        duration: 2000
      });

    } catch (error) {
      console.error('Error refreshing orders:', error);
      showToast({
        type: 'error',
        message: 'Failed to refresh orders.',
        duration: 3000
      });
    } finally {
      setRefreshing(false);
    }
  };

  // Handle order status updates with enhanced API
  const handleStatusUpdate = async (orderId, newStatus, notes = null) => {
    try {
      setUpdatingOrderId(orderId);

      const statusData = {
        new_status: newStatus,
        notes: notes || `Status updated to ${newStatus}`
      };

      const response = await api.updateOrderStatusEnhanced(orderId, statusData);

      // Update local state with the response data
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order.id === orderId
            ? {
                ...order,
                status: newStatus,
                statusUpdatedAt: response.status_updated_at || new Date().toISOString()
              }
            : order
        )
      );

      showToast({
        type: 'success',
        message: `Order status updated to ${newStatus}`,
        duration: 3000
      });
    } catch (error) {
      console.error('Error updating order status:', error);
      showToast({
        type: 'error',
        message: 'Failed to update order status. Please try again.',
        duration: 3000
      });
    } finally {
      setUpdatingOrderId(null);
    }
  };

  // Handle viewing order details
  const handleViewOrderDetails = async (order) => {
    try {
      setSelectedOrder(order);
      setShowOrderModal(true);
    } catch (error) {
      console.error('Error loading order details:', error);
      showToast({
        type: 'error',
        message: 'Failed to load order details',
        duration: 3000
      });
    }
  };

  // Handle contacting customer - now opens chat modal directly
  const handleContactCustomer = (order) => {
    setContactingCustomer(order);
    setShowChatModal(true);
  };

  const statusOptions = [
    { value: '', label: 'All Orders' },
    { value: 'pending', label: 'Pending' },
    { value: 'processing', label: 'Processing' },
    { value: 'in_transit', label: 'Shipped' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { label: 'Pending', color: 'text-warning bg-warning/10' },
      processing: { label: 'Processing', color: 'text-primary bg-primary/10' },
      in_transit: { label: 'Shipped', color: 'text-secondary bg-secondary/10' },
      delivered: { label: 'Delivered', color: 'text-success bg-success/10' },
      cancelled: { label: 'Cancelled', color: 'text-destructive bg-destructive/10' }
    };

    const config = statusConfig[status] || { label: status, color: 'text-text-secondary bg-muted' };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const getPaymentBadge = (status) => {
    const config = {
      paid: { label: 'Paid', color: 'text-success bg-success/10' },
      pending: { label: 'Pending', color: 'text-warning bg-warning/10' },
      refunded: { label: 'Refunded', color: 'text-destructive bg-destructive/10' }
    };

    const paymentConfig = config[status] || { label: status, color: 'text-text-secondary bg-muted' };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${paymentConfig.color}`}>
        {paymentConfig.label}
      </span>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.customer.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = !statusFilter || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6">
      {/* Header Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          <div className="flex-1 max-w-md">
            <Input
              type="search"
              placeholder="Search orders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select
            options={statusOptions}
            value={statusFilter}
            onChange={setStatusFilter}
            placeholder="Filter by status"
            className="w-full sm:w-48"
          />
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            iconName="RefreshCw"
            iconPosition="left"
            onClick={handleRefresh}
            disabled={refreshing || loading}
            className="bg-white hover:bg-teal-50 border-teal-200 text-teal-700 hover:border-teal-300 transition-all duration-200"
          >
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {loading ? (
          // Loading skeleton
          Array.from({ length: ordersPerPage }).map((_, index) => (
            <div key={index} className="bg-surface border border-border rounded-xl p-6 animate-pulse">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-muted rounded-full"></div>
                  <div className="space-y-2">
                    <div className="w-32 h-4 bg-muted rounded"></div>
                    <div className="w-24 h-3 bg-muted rounded"></div>
                    <div className="w-20 h-3 bg-muted rounded"></div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-16 h-6 bg-muted rounded-full"></div>
                  <div className="w-16 h-6 bg-muted rounded-full"></div>
                  <div className="w-24 h-4 bg-muted rounded"></div>
                </div>
              </div>
              <div className="w-full h-16 bg-muted rounded mb-4"></div>
              <div className="w-full h-8 bg-muted rounded"></div>
            </div>
          ))
        ) : filteredOrders.length > 0 ? (
          filteredOrders.map((order) => (
          <div key={order.id} className="bg-surface border border-border rounded-xl p-6 hover:shadow-moderate transition-shadow">
            {/* Order Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-muted">
                  <img
                    src={order.customer.avatar}
                    alt={order.customer.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = '/assets/images/no_image.png';
                    }}
                  />
                </div>
                <div>
                  <h3 className="font-semibold text-text-primary">{order.id}</h3>
                  <p className="text-sm text-text-secondary">{order.customer.name}</p>
                  <p className="text-xs text-text-secondary">{formatDate(order.orderDate)}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                {getStatusBadge(order.status)}
                {getPaymentBadge(order.paymentStatus)}
                <span className="font-semibold text-text-primary">
                  {(order.total && !isNaN(order.total) ? order.total : 0).toLocaleString()} XAF
                </span>
              </div>
            </div>

            {/* Order Items */}
            <div className="bg-muted/50 rounded-lg p-4 mb-4">
              <h4 className="text-sm font-medium text-text-primary mb-3 flex items-center">
                <Icon name="Package2" size={16} className="mr-2" />
                Order Items ({order.items.length} item{order.items.length !== 1 ? 's' : ''})
              </h4>
              <div className="space-y-3">
                {order.items.map((item, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-white rounded-lg border border-border">
                    {/* Product Image */}
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                      <img
                        src={item.image || '/assets/images/no_image.png'}
                        alt={item.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = '/assets/images/no_image.png';
                        }}
                      />
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h5 className="text-sm font-medium text-text-primary truncate">
                            {item.name}
                          </h5>
                          {item.description && (
                            <p className="text-xs text-text-secondary mt-1 overflow-hidden" style={{display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical'}}>
                              {item.description}
                            </p>
                          )}
                          {item.variants && Object.keys(item.variants).length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {Object.entries(item.variants).map(([key, value]) => (
                                <span key={key} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                                  {key}: {value}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Quantity Badge */}
                        <div className="ml-2 flex-shrink-0">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-teal-100 text-teal-800">
                            ×{item.quantity}
                          </span>
                        </div>
                      </div>

                      {/* Pricing Information */}
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
                        <div className="text-xs text-text-secondary">
                          <span className="font-medium">Unit Price:</span> {(item.price && !isNaN(item.price) ? item.price : 0).toLocaleString()} XAF
                        </div>
                        <div className="text-sm font-semibold text-text-primary">
                          {(item.totalPrice && !isNaN(item.totalPrice) ? item.totalPrice : (item.price && !isNaN(item.price) ? item.price : 0) * (item.quantity || 0)).toLocaleString()} XAF
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Summary */}
              <div className="mt-3 pt-3 border-t border-border">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-text-primary">
                    Total ({order.items.reduce((sum, item) => sum + (item.quantity || 0), 0)} items)
                  </span>
                  <span className="text-lg font-bold text-text-primary">
                    {(order.total && !isNaN(order.total) ? order.total : 0).toLocaleString()} XAF
                  </span>
                </div>
              </div>
            </div>

            {/* Delivery Info */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
              <div className="flex-1">
                <div className="flex items-start space-x-2">
                  <Icon name="MapPin" size={16} className="text-text-secondary mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-text-primary">Delivery Address:</p>
                    <p className="text-sm text-text-secondary">{order.deliveryAddress}</p>
                  </div>
                </div>
              </div>
              {order.trackingNumber && (
                <div className="flex items-center space-x-2">
                  <Icon name="Truck" size={16} className="text-text-secondary" />
                  <span className="text-sm text-text-secondary">
                    Tracking: {order.trackingNumber}
                  </span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-border">
              {order.status === 'pending' && (
                <>
                  <Button
                    variant="default"
                    size="sm"
                    iconName="Check"
                    iconPosition="left"
                    onClick={() => handleStatusUpdate(order.id, 'processing', 'Order accepted and being prepared')}
                    disabled={updatingOrderId === order.id}
                    className="bg-teal-600 hover:bg-teal-700 text-white border-teal-600 hover:border-teal-700 disabled:opacity-50"
                  >
                    {updatingOrderId === order.id ? 'Updating...' : 'Accept Order'}
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    iconName="X"
                    iconPosition="left"
                    onClick={() => handleStatusUpdate(order.id, 'cancelled', 'Order declined by shop owner')}
                    disabled={updatingOrderId === order.id}
                    className="bg-red-600 hover:bg-red-700 text-white border-red-600 hover:border-red-700 disabled:opacity-50"
                  >
                    {updatingOrderId === order.id ? 'Updating...' : 'Decline'}
                  </Button>
                </>
              )}
              {order.status === 'processing' && (
                <Button
                  variant="default"
                  size="sm"
                  iconName="Truck"
                  iconPosition="left"
                  onClick={() => handleStatusUpdate(order.id, 'in_transit', 'Order has been shipped and is in transit')}
                  disabled={updatingOrderId === order.id}
                  className="bg-blue-600 hover:bg-blue-700 text-white border-blue-600 hover:border-blue-700 disabled:opacity-50"
                >
                  {updatingOrderId === order.id ? 'Updating...' : 'Mark as Shipped'}
                </Button>
              )}
              {order.status === 'in_transit' && (
                <Button
                  variant="default"
                  size="sm"
                  iconName="Package"
                  iconPosition="left"
                  onClick={() => handleStatusUpdate(order.id, 'delivered', 'Order has been delivered to customer')}
                  disabled={updatingOrderId === order.id}
                  className="bg-green-600 hover:bg-green-700 text-white border-green-600 hover:border-green-700 disabled:opacity-50"
                >
                  {updatingOrderId === order.id ? 'Updating...' : 'Mark as Delivered'}
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                iconName="MessageCircle"
                iconPosition="left"
                onClick={() => handleContactCustomer(order)}
                className="bg-white hover:bg-teal-50 border-teal-200 text-teal-700 hover:border-teal-300"
              >
                Contact Customer
              </Button>
              <Button
                variant="outline"
                size="sm"
                iconName="Eye"
                iconPosition="left"
                onClick={() => handleViewOrderDetails(order)}
                className="bg-white hover:bg-teal-50 border-teal-200 text-teal-700 hover:border-teal-300"
              >
                View Details
              </Button>
            </div>
          </div>
          ))
        ) : (
          <div className="bg-surface border border-border rounded-xl p-8 text-center">
            <div className="flex flex-col items-center space-y-4">
              <Icon name="ShoppingBag" size={48} className="text-muted" />
              <h3 className="text-lg font-medium text-text-primary">No orders found</h3>
              <p className="text-text-secondary">
                {searchQuery || statusFilter 
                  ? "Try adjusting your search or filter criteria"
                  : "Orders will appear here when customers make purchases"
                }
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Pagination */}
      {!loading && filteredOrders.length > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-6">
          <div className="text-sm text-text-secondary">
            Showing {filteredOrders.length} orders
            {searchQuery && ` matching "${searchQuery}"`}
            {statusFilter && ` with status "${statusOptions.find(opt => opt.value === statusFilter)?.label}"`}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              iconName="ChevronLeft"
              iconPosition="left"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="bg-white hover:bg-teal-50 border-teal-200 text-teal-700 hover:border-teal-300 disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-200"
            >
              Previous
            </Button>
            <span className="px-3 py-1 text-sm text-gray-600 bg-gray-50 rounded-md border">
              Page {currentPage}
            </span>
            <Button
              variant="outline"
              size="sm"
              iconName="ChevronRight"
              iconPosition="right"
              onClick={() => setCurrentPage(prev => prev + 1)}
              disabled={filteredOrders.length < ordersPerPage}
              className="bg-white hover:bg-teal-50 border-teal-200 text-teal-700 hover:border-teal-300 disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-200"
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Order Details Modal */}
      {showOrderModal && selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={() => {
            setShowOrderModal(false);
            setSelectedOrder(null);
          }}
          onStatusUpdate={handleStatusUpdate}
          updatingOrderId={updatingOrderId}
        />
      )}

      {/* Contact Customer Modal */}
      {showContactModal && contactingCustomer && (
        <ContactCustomerModal
          order={contactingCustomer}
          onClose={() => {
            setShowContactModal(false);
            setContactingCustomer(null);
          }}
        />
      )}

      {/* Chat Modal - Direct chat with customer */}
      {showChatModal && (
        <ChatModal
          isOpen={showChatModal}
          onClose={() => {
            setShowChatModal(false);
            setContactingCustomer(null);
          }}
        />
      )}
    </div>
  );
};

// Order Details Modal Component
const OrderDetailsModal = ({ order, onClose, onStatusUpdate, updatingOrderId }) => {
  const [statusHistory, setStatusHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    const fetchStatusHistory = async () => {
      try {
        setLoadingHistory(true);
        const history = await api.getOrderStatusHistory(order.id);
        setStatusHistory(history || []);
      } catch (error) {
        console.error('Error fetching status history:', error);
        // Set empty array on error to prevent crashes
        setStatusHistory([]);
      } finally {
        setLoadingHistory(false);
      }
    };

    if (order?.id) {
      fetchStatusHistory();
    }
  }, [order?.id]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'processing': return 'text-blue-600 bg-blue-100';
      case 'in_transit': return 'text-purple-600 bg-purple-100';
      case 'delivered': return 'text-green-600 bg-green-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      case 'returned': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return 'Clock';
      case 'processing': return 'Package';
      case 'in_transit': return 'Truck';
      case 'delivered': return 'CheckCircle';
      case 'cancelled': return 'XCircle';
      case 'returned': return 'RotateCcw';
      default: return 'Circle';
    }
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleString();
    } catch (error) {
      return 'Invalid Date';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Order Details</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <Icon name="X" size={24} className="text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Order Header Information */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Order Information</h3>
                <p><span className="font-medium">Order ID:</span> {order?.id || 'N/A'}</p>
                <p><span className="font-medium">Customer:</span> {order?.customer?.name || 'Unknown Customer'}</p>
                <p><span className="font-medium">Email:</span> {order?.customer?.email || 'N/A'}</p>
                <p><span className="font-medium">Order Date:</span> {formatDate(order?.orderDate)}</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Status & Payment</h3>
                <div className="flex items-center space-x-2 mb-2">
                  <span className="font-medium">Status:</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order?.status || 'pending')}`}>
                    {order?.status ? order.status.charAt(0).toUpperCase() + order.status.slice(1) : 'Unknown'}
                  </span>
                </div>
                <p><span className="font-medium">Payment:</span>
                  <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                    order?.paymentStatus === 'paid' ? 'text-green-600 bg-green-100' : 'text-yellow-600 bg-yellow-100'
                  }`}>
                    {order?.paymentStatus ? order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1) : 'Unknown'}
                  </span>
                </p>
                <p><span className="font-medium">Total:</span> {(order?.total && !isNaN(order?.total) ? order?.total : 0).toLocaleString()} XAF</p>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
              <Icon name="Package2" size={20} className="mr-2" />
              Order Items ({(order?.items || []).length} item{(order?.items || []).length !== 1 ? 's' : ''})
            </h3>
            <div className="bg-white border rounded-lg overflow-hidden">
              {(order?.items || []).map((item, index) => (
                <div key={index} className={`p-4 ${index !== (order?.items || []).length - 1 ? 'border-b border-gray-200' : ''}`}>
                  <div className="flex items-start space-x-4">
                    {/* Product Image */}
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                      <img
                        src={item?.image || '/assets/images/no_image.png'}
                        alt={item?.name || 'Product'}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = '/assets/images/no_image.png';
                        }}
                      />
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 mb-1">{item?.name || 'Unknown Item'}</h4>
                          {item?.description && (
                            <p className="text-sm text-gray-600 mb-2 overflow-hidden" style={{display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical'}}>
                              {item.description}
                            </p>
                          )}
                          {item?.variants && Object.keys(item.variants).length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-2">
                              {Object.entries(item.variants).map(([key, value]) => (
                                <span key={key} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                  {key}: {value}
                                </span>
                              ))}
                            </div>
                          )}
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <span className="flex items-center">
                              <Icon name="Hash" size={14} className="mr-1" />
                              Quantity: {item?.quantity || 0}
                            </span>
                            <span className="flex items-center">
                              <Icon name="DollarSign" size={14} className="mr-1" />
                              Unit Price: {(item?.price && !isNaN(item?.price) ? item?.price : 0).toLocaleString()} XAF
                            </span>
                          </div>
                        </div>

                        {/* Price and Quantity */}
                        <div className="text-right ml-4">
                          <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-teal-100 text-teal-800 mb-2">
                            ×{item?.quantity || 0}
                          </div>
                          <p className="font-bold text-lg text-gray-900">
                            {(item?.totalPrice && !isNaN(item?.totalPrice) ? item?.totalPrice : (item?.price && !isNaN(item?.price) ? item?.price : 0) * (item?.quantity || 0)).toLocaleString()} XAF
                          </p>
                          <p className="text-sm text-gray-600">Subtotal</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Items Summary */}
              <div className="p-4 bg-gray-50 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-gray-600">
                    <Icon name="ShoppingCart" size={16} className="mr-2" />
                    <span className="font-medium">
                      Total Items: {(order?.items || []).reduce((sum, item) => sum + (item?.quantity || 0), 0)}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">
                      {(order?.total && !isNaN(order?.total) ? order?.total : 0).toLocaleString()} XAF
                    </p>
                    <p className="text-sm text-gray-600">Order Total</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Delivery Information */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Delivery Information</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-start space-x-2">
                <Icon name="MapPin" size={20} className="text-gray-500 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">Delivery Address</p>
                  <p className="text-gray-600">{order?.deliveryAddress || 'No address provided'}</p>
                </div>
              </div>
              {order?.trackingNumber && (
                <div className="flex items-center space-x-2 mt-3 pt-3 border-t border-gray-200">
                  <Icon name="Truck" size={20} className="text-gray-500" />
                  <div>
                    <p className="font-medium text-gray-900">Tracking Number</p>
                    <p className="text-gray-600">{order.trackingNumber}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Status Progression */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Status Progression</h3>
            <div className="bg-white border rounded-lg p-4">
              {loadingHistory ? (
                <div className="flex items-center justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-teal-600"></div>
                  <span className="ml-2 text-gray-600">Loading history...</span>
                </div>
              ) : statusHistory.length > 0 ? (
                <div className="space-y-3">
                  {statusHistory.map((record, index) => (
                    <div key={record.id} className="flex items-start space-x-3">
                      <div className={`p-2 rounded-full ${getStatusColor(record.new_status)}`}>
                        <Icon name={getStatusIcon(record.new_status)} size={16} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-gray-900">
                            {record.old_status ?
                              `Status changed from ${record.old_status} to ${record.new_status}` :
                              `Order created with status: ${record.new_status}`
                            }
                          </p>
                          <span className="text-sm text-gray-500">
                            {formatDate(record.changed_at)}
                          </span>
                        </div>
                        {record.notes && (
                          <p className="text-sm text-gray-600 mt-1">{record.notes}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600 text-center py-4">No status history available</p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200">
            {order?.status === 'pending' && (
              <>
                <Button
                  variant="default"
                  iconName="Check"
                  iconPosition="left"
                  onClick={() => onStatusUpdate(order?.id, 'processing', 'Order accepted and being prepared')}
                  disabled={updatingOrderId === order?.id}
                  className="bg-teal-600 hover:bg-teal-700 text-white"
                >
                  {updatingOrderId === order?.id ? 'Updating...' : 'Accept Order'}
                </Button>
                <Button
                  variant="destructive"
                  iconName="X"
                  iconPosition="left"
                  onClick={() => onStatusUpdate(order?.id, 'cancelled', 'Order declined by shop owner')}
                  disabled={updatingOrderId === order?.id}
                >
                  {updatingOrderId === order?.id ? 'Updating...' : 'Decline Order'}
                </Button>
              </>
            )}
            {order?.status === 'processing' && (
              <Button
                variant="default"
                iconName="Truck"
                iconPosition="left"
                onClick={() => onStatusUpdate(order?.id, 'in_transit', 'Order has been shipped and is in transit')}
                disabled={updatingOrderId === order?.id}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {updatingOrderId === order?.id ? 'Updating...' : 'Mark as Shipped'}
              </Button>
            )}
            {order?.status === 'in_transit' && (
              <Button
                variant="default"
                iconName="Package"
                iconPosition="left"
                onClick={() => onStatusUpdate(order?.id, 'delivered', 'Order has been delivered to customer')}
                disabled={updatingOrderId === order?.id}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {updatingOrderId === order?.id ? 'Updating...' : 'Mark as Delivered'}
              </Button>
            )}
            <Button
              variant="outline"
              iconName="MessageCircle"
              iconPosition="left"
              onClick={() => handleContactCustomer(order)}
              className="border-teal-200 text-teal-700 hover:bg-teal-50"
            >
              Contact Customer
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Contact Customer Modal Component
const ContactCustomerModal = ({ order, onClose }) => {
  const [contactMethod, setContactMethod] = useState('chat');
  const [message, setMessage] = useState('');
  const [subject, setSubject] = useState('');
  const [sending, setSending] = useState(false);
  const [showChat, setShowChat] = useState(false);

  const handleContactCustomer = async (method) => {
    if (!message.trim() || (method === 'email' && !subject.trim())) {
      showToast({
        type: 'error',
        message: method === 'email' ? 'Please fill in both subject and message' : 'Please write a message',
        duration: 3000
      });
      return;
    }

    try {
      setSending(true);

      switch (method) {
        case 'email':
          const mailtoLink = `mailto:${order?.customer?.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
          window.open(mailtoLink, '_blank');
          showToast({
            type: 'success',
            message: 'Email client opened successfully',
            duration: 3000
          });
          break;

        case 'whatsapp':
          // Extract phone number if available (you might need to add this field to your customer data)
          const phone = order?.customer?.phone || '';
          if (!phone) {
            showToast({
              type: 'error',
              message: 'Customer phone number not available',
              duration: 3000
            });
            return;
          }
          const whatsappMessage = `Hello ${order?.customer?.name}, regarding your order ${order?.id}: ${message}`;
          const whatsappLink = `https://wa.me/${phone.replace(/[^\d]/g, '')}?text=${encodeURIComponent(whatsappMessage)}`;
          window.open(whatsappLink, '_blank');
          showToast({
            type: 'success',
            message: 'WhatsApp opened successfully',
            duration: 3000
          });
          break;

        case 'sms':
          const smsPhone = order?.customer?.phone || '';
          if (!smsPhone) {
            showToast({
              type: 'error',
              message: 'Customer phone number not available',
              duration: 3000
            });
            return;
          }
          const smsMessage = `Hello ${order?.customer?.name}, regarding order ${order?.id}: ${message}`;
          const smsLink = `sms:${smsPhone}?body=${encodeURIComponent(smsMessage)}`;
          window.open(smsLink, '_blank');
          showToast({
            type: 'success',
            message: 'SMS app opened successfully',
            duration: 3000
          });
          break;

        case 'chat':
          // Open the existing chat interface modal with order context
          setShowChat(true);
          onClose(); // Close the contact modal since chat modal will open
          return;

        case 'internal':
          // This would be for an internal messaging system
          showToast({
            type: 'info',
            message: 'Internal messaging system not implemented yet',
            duration: 3000
          });
          break;

        default:
          throw new Error('Invalid contact method');
      }

      onClose();
    } catch (error) {
      console.error('Error contacting customer:', error);
      showToast({
        type: 'error',
        message: 'Failed to open contact method',
        duration: 3000
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Contact Customer</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <Icon name="X" size={24} className="text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Customer Information */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">Customer Information</h3>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200">
                <img
                  src={order?.customer?.avatar}
                  alt={order?.customer?.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = '/assets/images/no_image.png';
                  }}
                />
              </div>
              <div>
                <p className="font-medium text-gray-900">{order?.customer?.name || 'Unknown Customer'}</p>
                <p className="text-sm text-gray-600">{order?.customer?.email || 'No email available'}</p>
                <p className="text-xs text-gray-500">Order: {order?.id}</p>
              </div>
            </div>
          </div>

          {/* Contact Method Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Contact Method
            </label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <button
                onClick={() => setContactMethod('chat')}
                className={`p-3 rounded-lg border-2 flex flex-col items-center space-y-1 transition-colors ${
                  contactMethod === 'chat'
                    ? 'border-teal-500 bg-teal-50 text-teal-700'
                    : 'border-gray-200 hover:border-gray-300 text-gray-600'
                }`}
              >
                <Icon name="MessageSquare" size={20} />
                <span className="text-xs font-medium">Live Chat</span>
                <span className="text-xs text-green-600 font-medium">Recommended</span>
              </button>
              <button
                onClick={() => setContactMethod('email')}
                className={`p-3 rounded-lg border-2 flex flex-col items-center space-y-1 transition-colors ${
                  contactMethod === 'email'
                    ? 'border-teal-500 bg-teal-50 text-teal-700'
                    : 'border-gray-200 hover:border-gray-300 text-gray-600'
                }`}
              >
                <Icon name="Mail" size={20} />
                <span className="text-xs font-medium">Email</span>
              </button>
              <button
                onClick={() => setContactMethod('whatsapp')}
                className={`p-3 rounded-lg border-2 flex flex-col items-center space-y-1 transition-colors ${
                  contactMethod === 'whatsapp'
                    ? 'border-teal-500 bg-teal-50 text-teal-700'
                    : 'border-gray-200 hover:border-gray-300 text-gray-600'
                }`}
              >
                <Icon name="MessageCircle" size={20} />
                <span className="text-xs font-medium">WhatsApp</span>
              </button>
              <button
                onClick={() => setContactMethod('sms')}
                className={`p-3 rounded-lg border-2 flex flex-col items-center space-y-1 transition-colors ${
                  contactMethod === 'sms'
                    ? 'border-teal-500 bg-teal-50 text-teal-700'
                    : 'border-gray-200 hover:border-gray-300 text-gray-600'
                }`}
              >
                <Icon name="Smartphone" size={20} />
                <span className="text-xs font-medium">SMS</span>
              </button>
              <button
                onClick={() => setContactMethod('internal')}
                className={`p-3 rounded-lg border-2 flex flex-col items-center space-y-1 transition-colors ${
                  contactMethod === 'internal'
                    ? 'border-teal-500 bg-teal-50 text-teal-700'
                    : 'border-gray-200 hover:border-gray-300 text-gray-600'
                }`}
              >
                <Icon name="Users" size={20} />
                <span className="text-xs font-medium">Internal</span>
              </button>
            </div>
          </div>

          {/* Message Form */}
          {contactMethod === 'chat' ? (
            <div className="bg-gradient-to-r from-teal-50 to-blue-50 rounded-lg p-6 text-center">
              <Icon name="MessageSquare" size={48} className="mx-auto text-teal-600 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Start Live Chat</h3>
              <p className="text-gray-600 mb-4">
                Open a real-time chat session with {order?.customer?.name} to discuss order {order?.id}
              </p>
              <div className="flex items-center justify-center space-x-2 text-sm text-gray-500 mb-4">
                <Icon name="Clock" size={16} />
                <span>Instant messaging • Order context included</span>
              </div>
              <Button
                variant="default"
                onClick={() => handleContactCustomer('chat')}
                iconName="MessageSquare"
                iconPosition="left"
                className="bg-teal-600 hover:bg-teal-700 text-white"
              >
                Open Chat with Customer
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {contactMethod === 'email' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject
                  </label>
                  <Input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Enter message subject..."
                    className="w-full"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={`Type your ${contactMethod === 'email' ? 'email' : contactMethod === 'whatsapp' ? 'WhatsApp message' : contactMethod === 'sms' ? 'SMS' : 'message'} to the customer...`}
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
                />
              </div>
            </div>
          )}

          {/* Quick Templates */}
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Quick Templates</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSubject(`Order Update - ${order?.id}`);
                  setMessage(`Dear ${order?.customer?.name || 'Customer'},\n\nI wanted to provide you with an update on your order ${order?.id}.\n\n[Add your update here]\n\nBest regards,\nYour Shop`);
                }}
                className="text-left justify-start"
              >
                Order Update
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSubject(`Shipping Information - ${order?.id}`);
                  setMessage(`Dear ${order?.customer?.name || 'Customer'},\n\nYour order ${order?.id} has been shipped!\n\n[Add tracking information here]\n\nThank you for your business!`);
                }}
                className="text-left justify-start"
              >
                Shipping Info
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSubject(`Thank You - ${order?.id}`);
                  setMessage(`Dear ${order?.customer?.name || 'Customer'},\n\nThank you for your recent order ${order?.id}. We appreciate your business!\n\nIf you have any questions, please don't hesitate to contact us.\n\nBest regards`);
                }}
                className="text-left justify-start"
              >
                Thank You
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSubject(`Order Issue - ${order?.id}`);
                  setMessage(`Dear ${order?.customer?.name || 'Customer'},\n\nWe need to discuss an issue with your order ${order?.id}.\n\n[Describe the issue here]\n\nWe apologize for any inconvenience and will resolve this quickly.`);
                }}
                className="text-left justify-start"
              >
                Issue Report
              </Button>
            </div>
          </div>

          {/* Action Buttons */}
          {contactMethod !== 'chat' && (
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <Button
                variant="outline"
                onClick={onClose}
                disabled={sending}
              >
                Cancel
              </Button>
              <Button
                variant="default"
                onClick={() => handleContactCustomer(contactMethod)}
                disabled={sending || !message.trim() || (contactMethod === 'email' && !subject.trim())}
                iconName={sending ? 'Loader2' : contactMethod === 'email' ? 'Mail' : contactMethod === 'whatsapp' ? 'MessageCircle' : contactMethod === 'sms' ? 'Smartphone' : 'Send'}
                iconPosition="left"
                className="bg-teal-600 hover:bg-teal-700 text-white"
              >
                {sending ? 'Opening...' : `Send via ${contactMethod === 'email' ? 'Email' : contactMethod === 'whatsapp' ? 'WhatsApp' : contactMethod === 'sms' ? 'SMS' : 'Internal'}`}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Order-Specific Customer Service Chat */}
      {showChat && (
        <ChatInterfaceModal
          isOpen={showChat}
          onClose={() => {
            setShowChat(false);
          }}
          shop={{
            name: `Customer: ${order?.customer?.name}`,
            logo: order?.customer?.avatar || '/assets/images/default-shop.png',
            isOnline: true,
            responseTime: 'Customer Service Chat',
            phone: order?.customer?.phone,
            email: order?.customer?.email
          }}
          currentProduct={{
            name: `Order #${order?.id}`,
            image: '/assets/images/order-icon.png',
            description: `${order?.items?.length || 0} items • ${(order?.total || 0).toLocaleString()} XAF`
          }}
          orderContext={order}
          customerService={true}
        />
      )}
    </div>
  );
};


export default OrdersTab;