import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import api from '../../../services/api';
import { showToast } from '../../../components/ui/Toast';

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedTimeRange, setSelectedTimeRange] = useState('all');
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [ordersPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const [orderStats, setOrderStats] = useState({
    total: 0,
    pending: 0,
    processing: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0
  });

  // Load real order data
  const loadOrders = async () => {
    try {
      setLoading(true);
      
      // Fetch orders from API
      const ordersResponse = await api.getShopOwnerOrders({
        page: 1,
        page_size: 100, // Get all orders for filtering
        include_stats: true
      });
      
      if (ordersResponse && ordersResponse.orders) {
        setOrders(ordersResponse.orders);
        setFilteredOrders(ordersResponse.orders);
        
        // Calculate stats
        const stats = ordersResponse.orders.reduce((acc, order) => {
          acc.total++;
          acc[order.status] = (acc[order.status] || 0) + 1;
          return acc;
        }, {
          total: 0,
          pending: 0,
          processing: 0,
          shipped: 0,
          delivered: 0,
          cancelled: 0
        });
        
        setOrderStats(stats);
      }
    } catch (error) {
      console.error('Failed to load orders:', error);
      showToast({
        type: 'error',
        message: 'Failed to load orders. Please try again.',
        duration: 3000
      });
      
      // Fallback to mock data if API fails
      const mockOrders = [
      {
        id: 'ORD-001',
        customer: 'John Doe',
        customerEmail: 'john@example.com',
        customerPhone: '+237 6XX XXX XXX',
        items: [
          { name: 'iPhone 15 Pro', quantity: 1, price: 850000 },
          { name: 'Phone Case', quantity: 1, price: 15000 }
        ],
        total: 865000,
        status: 'pending',
        paymentStatus: 'paid',
        paymentMethod: 'Mobile Money',
        orderDate: '2024-07-18T10:30:00Z',
        shippingAddress: '123 Main St, Douala, Cameroon',
        notes: 'Please handle with care',
        priority: 'normal'
      },
      {
        id: 'ORD-002',
        customer: 'Jane Smith',
        customerEmail: 'jane@example.com',
        customerPhone: '+237 6XX XXX XXX',
        items: [
          { name: 'Samsung Galaxy S24', quantity: 1, price: 750000 },
          { name: 'Screen Protector', quantity: 2, price: 5000 }
        ],
        total: 760000,
        status: 'processing',
        paymentStatus: 'paid',
        paymentMethod: 'Bank Transfer',
        orderDate: '2024-07-18T09:15:00Z',
        shippingAddress: '456 Oak Ave, Yaoundé, Cameroon',
        notes: '',
        priority: 'high'
      },
      {
        id: 'ORD-003',
        customer: 'Mike Johnson',
        customerEmail: 'mike@example.com',
        customerPhone: '+237 6XX XXX XXX',
        items: [
          { name: 'Wireless Headphones', quantity: 1, price: 89000 }
        ],
        total: 89000,
        status: 'shipped',
        paymentStatus: 'paid',
        paymentMethod: 'Mobile Money',
        orderDate: '2024-07-17T14:20:00Z',
        shippingAddress: '789 Pine St, Bamenda, Cameroon',
        notes: 'Deliver after 5 PM',
        priority: 'normal'
      },
      {
        id: 'ORD-004',
        customer: 'Sarah Wilson',
        customerEmail: 'sarah@example.com',
        customerPhone: '+237 6XX XXX XXX',
        items: [
          { name: 'Gaming Chair', quantity: 1, price: 156000 }
        ],
        total: 156000,
        status: 'delivered',
        paymentStatus: 'paid',
        paymentMethod: 'Mobile Money',
        orderDate: '2024-07-16T11:45:00Z',
        shippingAddress: '321 Cedar Rd, Garoua, Cameroon',
        notes: '',
        priority: 'normal'
      },
      {
        id: 'ORD-005',
        customer: 'David Brown',
        customerEmail: 'david@example.com',
        customerPhone: '+237 6XX XXX XXX',
        items: [
          { name: 'MacBook Air M3', quantity: 1, price: 1200000 }
        ],
        total: 1200000,
        status: 'cancelled',
        paymentStatus: 'refunded',
        paymentMethod: 'Bank Transfer',
        orderDate: '2024-07-15T16:30:00Z',
        shippingAddress: '654 Elm St, Douala, Cameroon',
        notes: 'Customer requested cancellation',
        priority: 'low'
      }
      ];
      
      setOrders(mockOrders);
      setFilteredOrders(mockOrders);
      
      // Calculate stats for mock data
      const mockStats = mockOrders.reduce((acc, order) => {
        acc.total++;
        acc[order.status] = (acc[order.status] || 0) + 1;
        return acc;
      }, {
        total: 0,
        pending: 0,
        processing: 0,
        shipped: 0,
        delivered: 0,
        cancelled: 0
      });
      
      setOrderStats(mockStats);
    } finally {
      setLoading(false);
    }
  };

  // Load orders on component mount
  useEffect(() => {
    loadOrders();
  }, []);

  // Auto-refresh orders every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      loadOrders();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Filter orders
  useEffect(() => {
    let filtered = orders.filter(order => {
      const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           order.customerEmail.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = selectedStatus === 'all' || order.status === selectedStatus;
      
      let matchesTimeRange = true;
      if (selectedTimeRange !== 'all') {
        const orderDate = new Date(order.orderDate);
        const now = new Date();
        const daysDiff = Math.floor((now - orderDate) / (1000 * 60 * 60 * 24));
        
        switch (selectedTimeRange) {
          case 'today':
            matchesTimeRange = daysDiff === 0;
            break;
          case 'week':
            matchesTimeRange = daysDiff <= 7;
            break;
          case 'month':
            matchesTimeRange = daysDiff <= 30;
            break;
          default:
            matchesTimeRange = true;
        }
      }
      
      return matchesSearch && matchesStatus && matchesTimeRange;
    });
    
    setFilteredOrders(filtered);
    setCurrentPage(1);
  }, [searchTerm, selectedStatus, selectedTimeRange, orders]);

  const statuses = [
    { value: 'all', label: 'All Status' },
    { value: 'pending', label: 'Pending' },
    { value: 'processing', label: 'Processing' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  const timeRanges = [
    { value: 'all', label: 'All Time' },
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'refunded': return 'bg-blue-100 text-blue-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-600';
      case 'normal': return 'text-blue-600';
      case 'low': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-CM', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleOrderAction = async (action, orderId) => {
    try {
      let newStatus;
      switch (action) {
        case 'process':
          newStatus = 'processing';
          break;
        case 'ship':
          newStatus = 'shipped';
          break;
        case 'deliver':
          newStatus = 'delivered';
          break;
        case 'cancel':
          newStatus = 'cancelled';
          break;
        default:
          console.log(`${action} order ${orderId}`);
          return;
      }

      // Update order status via API
      await api.updateOrderStatus(orderId, newStatus);
      showToast.success(`Order ${orderId} updated to ${newStatus}`);
      
      // Refresh orders list
      await loadOrders();
    } catch (error) {
      console.error('Failed to update order:', error);
      showToast({
        type: 'error',
        message: 'Failed to update order status. Please try again.',
        duration: 3000
      });
    }
  };

  const handleBulkAction = async (action) => {
    if (selectedOrders.length === 0) {
      showToast({
        type: 'error',
        message: 'Please select orders to perform bulk action',
        duration: 3000
      });
      return;
    }

    try {
      let newStatus;
      switch (action) {
        case 'process':
          newStatus = 'processing';
          break;
        case 'ship':
          newStatus = 'shipped';
          break;
        case 'print':
          // Handle print action differently
          console.log('Printing labels for orders:', selectedOrders);
          showToast.success(`Print labels for ${selectedOrders.length} orders`);
          return;
        default:
          console.log(`${action} orders:`, selectedOrders);
          return;
      }

      // Update multiple orders
      const updatePromises = selectedOrders.map(orderId => 
        api.updateOrderStatus(orderId, newStatus)
      );
      
      await Promise.all(updatePromises);
      showToast.success(`${selectedOrders.length} orders updated to ${newStatus}`);
      
      // Clear selection and refresh
      setSelectedOrders([]);
      await loadOrders();
    } catch (error) {
      console.error('Failed to perform bulk action:', error);
      showToast({
        type: 'error',
        message: 'Failed to update orders. Please try again.',
        duration: 3000
      });
    }
  };

  const toggleOrderSelection = (orderId) => {
    setSelectedOrders(prev => 
      prev.includes(orderId) 
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    );
  };

  const getCurrentPageOrders = () => {
    const indexOfLastOrder = currentPage * ordersPerPage;
    const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
    return filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);
  };

  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Order Management</h2>
          <p className="text-gray-600">Track and manage your shop orders</p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2">
            <Icon name="Download" size={16} />
            <span>Export</span>
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
            <Icon name="Plus" size={16} />
            <span>Manual Order</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center space-x-2">
            <Icon name="ShoppingBag" size={20} className="text-blue-600" />
            <span className="text-sm text-gray-600">Total</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-1">{orderStats.total}</p>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center space-x-2">
            <Icon name="Clock" size={20} className="text-yellow-600" />
            <span className="text-sm text-gray-600">Pending</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-1">{orderStats.pending}</p>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center space-x-2">
            <Icon name="Package" size={20} className="text-blue-600" />
            <span className="text-sm text-gray-600">Processing</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-1">{orderStats.processing}</p>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center space-x-2">
            <Icon name="Truck" size={20} className="text-purple-600" />
            <span className="text-sm text-gray-600">Shipped</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-1">{orderStats.shipped}</p>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center space-x-2">
            <Icon name="CheckCircle" size={20} className="text-green-600" />
            <span className="text-sm text-gray-600">Delivered</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-1">{orderStats.delivered}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg p-4 border border-gray-200">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Icon name="Search" size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search orders by ID, customer, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {statuses.map(status => (
              <option key={status.value} value={status.value}>{status.label}</option>
            ))}
          </select>
          
          {/* Time Range Filter */}
          <select
            value={selectedTimeRange}
            onChange={(e) => setSelectedTimeRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {timeRanges.map(range => (
              <option key={range.value} value={range.value}>{range.label}</option>
            ))}
          </select>
        </div>

        {/* Bulk Actions */}
        {selectedOrders.length > 0 && (
          <div className="mt-4 flex items-center space-x-2">
            <span className="text-sm text-gray-600">{selectedOrders.length} selected</span>
            <button
              onClick={() => handleBulkAction('process')}
              className="px-3 py-1 bg-blue-100 text-blue-800 rounded text-sm hover:bg-blue-200 transition-colors"
            >
              Mark Processing
            </button>
            <button
              onClick={() => handleBulkAction('ship')}
              className="px-3 py-1 bg-purple-100 text-purple-800 rounded text-sm hover:bg-purple-200 transition-colors"
            >
              Mark Shipped
            </button>
            <button
              onClick={() => handleBulkAction('print')}
              className="px-3 py-1 bg-gray-100 text-gray-800 rounded text-sm hover:bg-gray-200 transition-colors"
            >
              Print Labels
            </button>
          </div>
        )}
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {getCurrentPageOrders().map((order) => (
          <div key={order.id} className="bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
            <div className="p-4 lg:p-6">
              {/* Order Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={selectedOrders.includes(order.id)}
                    onChange={() => toggleOrderSelection(order.id)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <div className="flex items-center space-x-2">
                    <Icon name="Flag" size={16} className={getPriorityColor(order.priority)} />
                    <h3 className="text-lg font-semibold text-gray-900">{order.id}</h3>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(order.paymentStatus)}`}>
                      {order.paymentStatus}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900">{formatCurrency(order.total)}</p>
                  <p className="text-sm text-gray-500">{formatDate(order.orderDate)}</p>
                </div>
              </div>

              {/* Customer Info */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Customer Information</h4>
                  <div className="space-y-1">
                    <p className="text-sm text-gray-900">{order.customer}</p>
                    <p className="text-sm text-gray-500">{order.customerEmail}</p>
                    <p className="text-sm text-gray-500">{order.customerPhone}</p>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Shipping Address</h4>
                  <p className="text-sm text-gray-900">{order.shippingAddress}</p>
                  <div className="mt-2">
                    <p className="text-xs text-gray-500">Payment: {order.paymentMethod}</p>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Order Items</h4>
                <div className="space-y-2">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center">
                          <Icon name="Package" size={14} className="text-gray-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{item.name}</p>
                          <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                        </div>
                      </div>
                      <p className="text-sm font-medium text-gray-900">{formatCurrency(item.price * item.quantity)}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Notes */}
              {order.notes && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Notes</h4>
                  <p className="text-sm text-gray-600 bg-yellow-50 p-3 rounded">{order.notes}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleOrderAction('view', order.id)}
                    className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 text-sm"
                  >
                    <Icon name="Eye" size={14} />
                    <span>View Details</span>
                  </button>
                  <button
                    onClick={() => handleOrderAction('contact', order.id)}
                    className="flex items-center space-x-1 text-green-600 hover:text-green-700 text-sm"
                  >
                    <Icon name="MessageCircle" size={14} />
                    <span>Contact Customer</span>
                  </button>
                  <button
                    onClick={() => handleOrderAction('print', order.id)}
                    className="flex items-center space-x-1 text-gray-600 hover:text-gray-700 text-sm"
                  >
                    <Icon name="Printer" size={14} />
                    <span>Print</span>
                  </button>
                </div>
                <div className="flex items-center space-x-2">
                  {order.status === 'pending' && (
                    <button
                      onClick={() => handleOrderAction('process', order.id)}
                      className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
                    >
                      Process Order
                    </button>
                  )}
                  {order.status === 'processing' && (
                    <button
                      onClick={() => handleOrderAction('ship', order.id)}
                      className="px-3 py-1 bg-purple-600 text-white rounded text-sm hover:bg-purple-700 transition-colors"
                    >
                      Mark as Shipped
                    </button>
                  )}
                  {order.status === 'shipped' && (
                    <button
                      onClick={() => handleOrderAction('deliver', order.id)}
                      className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors"
                    >
                      Mark as Delivered
                    </button>
                  )}
                  {(order.status === 'pending' || order.status === 'processing') && (
                    <button
                      onClick={() => handleOrderAction('cancel', order.id)}
                      className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Showing {((currentPage - 1) * ordersPerPage) + 1} to {Math.min(currentPage * ordersPerPage, filteredOrders.length)} of {filteredOrders.length} orders
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Previous
            </button>
            <span className="text-sm text-gray-500">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderManagement;

