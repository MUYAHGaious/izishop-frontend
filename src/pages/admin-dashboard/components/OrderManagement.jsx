import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedTimeRange, setSelectedTimeRange] = useState('all');
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [ordersPerPage] = useState(10);

  // Mock order data
  useEffect(() => {
    const mockOrders = [
      {
        id: 'ORD-001',
        customer: 'John Doe',
        customerEmail: 'john@example.com',
        shop: 'Tech Store Pro',
        items: 3,
        total: 125000,
        status: 'pending',
        paymentStatus: 'paid',
        orderDate: '2024-07-18T10:30:00Z',
        deliveryDate: '2024-07-20T00:00:00Z',
        shippingAddress: 'Douala, Cameroon',
        priority: 'normal'
      },
      {
        id: 'ORD-002',
        customer: 'Jane Smith',
        customerEmail: 'jane@example.com',
        shop: 'Fashion Hub',
        items: 2,
        total: 89000,
        status: 'processing',
        paymentStatus: 'paid',
        orderDate: '2024-07-18T09:15:00Z',
        deliveryDate: '2024-07-19T00:00:00Z',
        shippingAddress: 'Yaoundé, Cameroon',
        priority: 'high'
      },
      {
        id: 'ORD-003',
        customer: 'Mike Johnson',
        customerEmail: 'mike@example.com',
        shop: 'Home & Garden',
        items: 1,
        total: 45000,
        status: 'shipped',
        paymentStatus: 'paid',
        orderDate: '2024-07-17T14:20:00Z',
        deliveryDate: '2024-07-18T00:00:00Z',
        shippingAddress: 'Bamenda, Cameroon',
        priority: 'normal'
      },
      {
        id: 'ORD-004',
        customer: 'Sarah Wilson',
        customerEmail: 'sarah@example.com',
        shop: 'Sports Central',
        items: 4,
        total: 156000,
        status: 'delivered',
        paymentStatus: 'paid',
        orderDate: '2024-07-16T11:45:00Z',
        deliveryDate: '2024-07-17T00:00:00Z',
        shippingAddress: 'Garoua, Cameroon',
        priority: 'normal'
      },
      {
        id: 'ORD-005',
        customer: 'David Brown',
        customerEmail: 'david@example.com',
        shop: 'Book World',
        items: 2,
        total: 34000,
        status: 'cancelled',
        paymentStatus: 'refunded',
        orderDate: '2024-07-15T16:30:00Z',
        deliveryDate: null,
        shippingAddress: 'Douala, Cameroon',
        priority: 'low'
      },
      {
        id: 'ORD-006',
        customer: 'Lisa Garcia',
        customerEmail: 'lisa@example.com',
        shop: 'Beauty Corner',
        items: 5,
        total: 234000,
        status: 'disputed',
        paymentStatus: 'paid',
        orderDate: '2024-07-14T13:10:00Z',
        deliveryDate: '2024-07-16T00:00:00Z',
        shippingAddress: 'Yaoundé, Cameroon',
        priority: 'high'
      }
    ];
    setOrders(mockOrders);
    setFilteredOrders(mockOrders);
  }, []);

  // Filter orders
  useEffect(() => {
    let filtered = orders.filter(order => {
      const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           order.shop.toLowerCase().includes(searchTerm.toLowerCase());
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
    { value: 'cancelled', label: 'Cancelled' },
    { value: 'disputed', label: 'Disputed' }
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
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      case 'disputed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'refunded': return 'bg-purple-100 text-purple-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-600';
      case 'normal': return 'text-teal-600';
      case 'low': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
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

  const handleOrderAction = (action, orderId) => {
    console.log(`${action} order ${orderId}`);
    // Implement order actions here
  };

  const handleBulkAction = (action) => {
    console.log(`${action} orders:`, selectedOrders);
    // Implement bulk actions here
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
          <p className="text-gray-600">Monitor and manage all orders across the platform</p>
        </div>
        <button className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors flex items-center space-x-2">
          <Icon name="Download" size={16} />
          <span>Export Orders</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center space-x-2">
            <Icon name="ShoppingBag" size={20} className="text-teal-600" />
            <span className="text-sm text-gray-600">Total</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-1">{orders.length}</p>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center space-x-2">
            <Icon name="Clock" size={20} className="text-yellow-600" />
            <span className="text-sm text-gray-600">Pending</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {orders.filter(o => o.status === 'pending').length}
          </p>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center space-x-2">
            <Icon name="Truck" size={20} className="text-teal-600" />
            <span className="text-sm text-gray-600">Shipped</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {orders.filter(o => o.status === 'shipped').length}
          </p>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center space-x-2">
            <Icon name="CheckCircle" size={20} className="text-green-600" />
            <span className="text-sm text-gray-600">Delivered</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {orders.filter(o => o.status === 'delivered').length}
          </p>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center space-x-2">
            <Icon name="AlertTriangle" size={20} className="text-red-600" />
            <span className="text-sm text-gray-600">Disputed</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {orders.filter(o => o.status === 'disputed').length}
          </p>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center space-x-2">
            <Icon name="DollarSign" size={20} className="text-green-600" />
            <span className="text-sm text-gray-600">Revenue</span>
          </div>
          <p className="text-lg font-bold text-gray-900 mt-1">
            {formatCurrency(orders.reduce((sum, order) => sum + order.total, 0))}
          </p>
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
                placeholder="Search orders by ID, customer, or shop..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
          </div>
          
          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          >
            {statuses.map(status => (
              <option key={status.value} value={status.value}>{status.label}</option>
            ))}
          </select>
          
          {/* Time Range Filter */}
          <select
            value={selectedTimeRange}
            onChange={(e) => setSelectedTimeRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
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
              className="px-3 py-1 bg-teal-100 text-teal-800 rounded text-sm hover:bg-teal-200 transition-colors"
            >
              Process
            </button>
            <button
              onClick={() => handleBulkAction('ship')}
              className="px-3 py-1 bg-teal-100 text-teal-800 rounded text-sm hover:bg-teal-200 transition-colors"
            >
              Ship
            </button>
            <button
              onClick={() => handleBulkAction('cancel')}
              className="px-3 py-1 bg-red-100 text-red-800 rounded text-sm hover:bg-red-200 transition-colors"
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* Orders Table/Cards */}
      <div className="bg-white rounded-lg border border-gray-200">
        {/* Desktop Table */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedOrders.length === getCurrentPageOrders().length && getCurrentPageOrders().length > 0}
                    onChange={() => {
                      const currentPageOrderIds = getCurrentPageOrders().map(order => order.id);
                      setSelectedOrders(prev => 
                        prev.length === currentPageOrderIds.length 
                          ? []
                          : currentPageOrderIds
                      );
                    }}
                    className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Shop</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {getCurrentPageOrders().map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedOrders.includes(order.id)}
                      onChange={() => toggleOrderSelection(order.id)}
                      className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <Icon name="Flag" size={16} className={getPriorityColor(order.priority)} />
                      <div>
                        <p className="font-medium text-gray-900">{order.id}</p>
                        <p className="text-sm text-gray-500">{order.items} items</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-900">{order.customer}</p>
                      <p className="text-sm text-gray-500">{order.customerEmail}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-900">{order.shop}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-900">{formatCurrency(order.total)}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(order.paymentStatus)}`}>
                      {order.paymentStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {formatDate(order.orderDate)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleOrderAction('view', order.id)}
                        className="text-teal-600 hover:text-teal-700"
                      >
                        <Icon name="Eye" size={16} />
                      </button>
                      <button
                        onClick={() => handleOrderAction('edit', order.id)}
                        className="text-gray-600 hover:text-gray-700"
                      >
                        <Icon name="Edit" size={16} />
                      </button>
                      {order.status === 'disputed' && (
                        <button
                          onClick={() => handleOrderAction('resolve', order.id)}
                          className="text-green-600 hover:text-green-700"
                        >
                          <Icon name="CheckCircle" size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="lg:hidden divide-y divide-gray-200">
          {getCurrentPageOrders().map((order) => (
            <div key={order.id} className="p-4">
              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  checked={selectedOrders.includes(order.id)}
                  onChange={() => toggleOrderSelection(order.id)}
                  className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Icon name="Flag" size={16} className={getPriorityColor(order.priority)} />
                      <p className="font-medium text-gray-900">{order.id}</p>
                    </div>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => handleOrderAction('view', order.id)}
                        className="p-1 text-blue-600 hover:text-blue-700"
                      >
                        <Icon name="Eye" size={16} />
                      </button>
                      <button
                        onClick={() => handleOrderAction('edit', order.id)}
                        className="p-1 text-gray-600 hover:text-gray-700"
                      >
                        <Icon name="Edit" size={16} />
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500">{order.customer} • {order.shop}</p>
                  <div className="flex items-center space-x-2 mt-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(order.paymentStatus)}`}>
                      {order.paymentStatus}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="font-medium text-gray-900">{formatCurrency(order.total)}</span>
                    <span className="text-sm text-gray-500">{formatDate(order.orderDate)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-3 border-t border-gray-200 flex items-center justify-between">
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
    </div>
  );
};

export default OrderManagement;

