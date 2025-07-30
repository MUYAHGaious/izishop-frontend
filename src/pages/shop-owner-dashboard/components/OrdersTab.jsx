import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import api from '../../../services/api';
import { showToast } from '../../../components/ui/Toast';

const OrdersTab = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [ordersPerPage] = useState(10);

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
        
        // Transform API response to match component structure
        const transformedOrders = (response.orders || response || []).map(order => ({
          id: order.id || `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 3)}`,
          customer: {
            name: order.customer_name || order.user?.name || 'Unknown Customer',
            email: order.customer_email || order.user?.email || 'unknown@email.com',
            avatar: order.customer_avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(order.customer_name || 'User')}&background=random`
          },
          items: order.items || [{
            name: order.product_name || 'Product',
            quantity: order.quantity || 1,
            price: parseFloat(order.unit_price || order.total_amount || 0)
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
          message: 'Failed to load orders. Using sample data.',
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

  // Handle order status updates
  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await api.updateOrderStatus(orderId, newStatus);
      
      // Update local state
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId 
            ? { ...order, status: newStatus }
            : order
        )
      );
      
      showToast({
        type: 'success',
        message: `Order ${orderId} status updated to ${newStatus}`,
        duration: 3000
      });
    } catch (error) {
      console.error('Error updating order status:', error);
      showToast({
        type: 'error',
        message: 'Failed to update order status',
        duration: 3000
      });
    }
  };

  const statusOptions = [
    { value: '', label: 'All Orders' },
    { value: 'pending', label: 'Pending' },
    { value: 'processing', label: 'Processing' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { label: 'Pending', color: 'text-warning bg-warning/10' },
      processing: { label: 'Processing', color: 'text-primary bg-primary/10' },
      shipped: { label: 'Shipped', color: 'text-secondary bg-secondary/10' },
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
          <Button variant="outline" iconName="RefreshCw" iconPosition="left">
            Refresh
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
                  {order.total.toLocaleString()} XAF
                </span>
              </div>
            </div>

            {/* Order Items */}
            <div className="bg-muted/50 rounded-lg p-4 mb-4">
              <h4 className="text-sm font-medium text-text-primary mb-2">Order Items:</h4>
              <div className="space-y-2">
                {order.items.map((item, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <span className="text-text-secondary">
                      {item.name} × {item.quantity}
                    </span>
                    <span className="font-medium text-text-primary">
                      {(item.price * item.quantity).toLocaleString()} XAF
                    </span>
                  </div>
                ))}
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
                    onClick={() => handleStatusUpdate(order.id, 'processing')}
                  >
                    Accept Order
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    iconName="X" 
                    iconPosition="left"
                    onClick={() => handleStatusUpdate(order.id, 'cancelled')}
                  >
                    Decline
                  </Button>
                </>
              )}
              {order.status === 'processing' && (
                <Button 
                  variant="default" 
                  size="sm" 
                  iconName="Truck" 
                  iconPosition="left"
                  onClick={() => handleStatusUpdate(order.id, 'shipped')}
                >
                  Mark as Shipped
                </Button>
              )}
              {order.status === 'shipped' && (
                <Button 
                  variant="default" 
                  size="sm" 
                  iconName="Package" 
                  iconPosition="left"
                  onClick={() => handleStatusUpdate(order.id, 'delivered')}
                >
                  Mark as Delivered
                </Button>
              )}
              <Button variant="outline" size="sm" iconName="MessageCircle" iconPosition="left">
                Contact Customer
              </Button>
              <Button variant="outline" size="sm" iconName="Eye" iconPosition="left">
                View Details
              </Button>
              <Button variant="ghost" size="sm" iconName="MoreHorizontal">
                More
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
            >
              Previous
            </Button>
            <span className="px-3 py-1 text-sm text-text-secondary">
              Page {currentPage}
            </span>
            <Button 
              variant="outline" 
              size="sm" 
              iconName="ChevronRight" 
              iconPosition="right"
              onClick={() => setCurrentPage(prev => prev + 1)}
              disabled={filteredOrders.length < ordersPerPage}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersTab;