import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import OrderDetailModal from '../../components/ui/OrderDetailModal';
import CustomSelect from '../../components/ui/CustomSelect';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

const MyOrders = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    totalPages: 1
  });
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isOrderDetailModalOpen, setIsOrderDetailModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('date_desc');
  const [showFilters, setShowFilters] = useState(false);
  const [dateRange, setDateRange] = useState('');
  const [amountRange, setAmountRange] = useState('');
  const [selectedShop, setSelectedShop] = useState('');

  // Cancellation states
  const [cancellingOrderId, setCancellingOrderId] = useState(null);
  const [showCancellationForm, setShowCancellationForm] = useState(false);
  const [cancellationReason, setCancellationReason] = useState('customer_changed_mind');
  const [cancellationDescription, setCancellationDescription] = useState('');
  const [isProcessingCancellation, setIsProcessingCancellation] = useState(false);

  // Notification states for better UX
  const [notification, setNotification] = useState(null);
  const [showNotification, setShowNotification] = useState(false);


  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/authentication-login-register');
      return;
    }

    fetchOrders();
  }, [isAuthenticated, navigate, activeTab]);

  // Industry-standard notification helper functions
  const showNotificationMessage = (message, type = 'error', duration = null) => {
    // Clear any existing notification first
    if (notification) {
      setShowNotification(false);
      setTimeout(() => setNotification(null), 100);
    }

    // Set default durations based on message type (following industry standards)
    const defaultDuration = type === 'success' ? 4000 : type === 'warning' ? 7000 : 6000;
    const finalDuration = duration || defaultDuration;

    // Show new notification with slight delay for better UX
    setTimeout(() => {
      setNotification({ message, type, duration: finalDuration });
      setShowNotification(true);

      // Auto-hide notification after duration
      setTimeout(() => {
        setShowNotification(false);
        setTimeout(() => setNotification(null), 500); // Allow exit animation
      }, finalDuration);
    }, notification ? 150 : 0);
  };

  const hideNotification = () => {
    setShowNotification(false);
    setTimeout(() => setNotification(null), 500);
  };

  // Function to navigate to messages page with error context (WhatsApp-style reply)
  const navigateToSupportWithContext = (errorMessage, errorType, orderId = null) => {
    console.log('🚀 navigateToSupportWithContext called with:', { errorMessage, errorType, orderId });

    const timestamp = new Date().toLocaleString();

    // Create error context to pass via URL params and localStorage
    const errorContext = {
      type: 'error_report',
      originalError: errorMessage,
      errorType: errorType,
      timestamp: timestamp,
      orderId: orderId,
      userAgent: navigator.userAgent,
      currentPage: 'My Orders',
      // Pre-filled message like WhatsApp reply
      prefilledMessage: `Hi Support Team,

I encountered an issue while trying to manage my order:

📋 Error Details:
"${errorMessage}"

🕒 When: ${timestamp}
📄 Page: My Orders${orderId ? `\n🛒 Order ID: ${orderId}` : ''}

Could you please help me resolve this issue?`
    };

    console.log('📝 Error context to store:', errorContext);

    // Store error context in localStorage so messages page can access it
    localStorage.setItem('supportErrorContext', JSON.stringify(errorContext));

    console.log('💾 Stored in localStorage:', localStorage.getItem('supportErrorContext'));

    // Navigate to messages page with error flag
    console.log('🔗 Navigating to /messages?support=true&error=true');
    navigate('/messages?support=true&error=true');
  };

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const params = {
        page: pagination.page,
        limit: 10
      };

      if (activeTab !== 'all') {
        params.status = activeTab;
      }

      console.log('🔄 Fetching customer orders with params:', params);
      const response = await api.getCustomerOrders(params);
      console.log('✅ Customer orders response:', response);

      if (response && response.orders) {
        // Add detailed logging of the first order to see structure
        if (response.orders.length > 0) {
          console.log('🔍 First order structure:', response.orders[0]);
          console.log('🔍 First order items:', response.orders[0].items);
          console.log('🔍 First order payment_method:', response.orders[0].payment_method);
          console.log('🔍 All keys in first order:', Object.keys(response.orders[0]));
        }
        setOrders(response.orders);
        setPagination({
          total: response.total || 0,
          page: response.page || 1,
          totalPages: response.totalPages || 1
        });
      } else {
        setOrders([]);
      }
    } catch (error) {
      console.error('❌ Error fetching orders:', error);
      console.error('❌ Error details:', {
        status: error.status,
        message: error.message,
        response: error.response
      });
      setError(error.message || 'Failed to load orders');
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to format date
  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('en-GB', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
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
        return 'text-green-800 bg-green-100 border-green-300 ring-1 ring-green-200';
      case 'shipped':
      case 'in_transit':
        return 'text-teal-800 bg-teal-100 border-teal-300 ring-1 ring-teal-200';
      case 'processing':
        return 'text-blue-800 bg-blue-100 border-blue-300 ring-1 ring-blue-200';
      case 'pending':
      case 'confirmed':
        return 'text-orange-800 bg-orange-100 border-orange-300 ring-1 ring-orange-200';
      case 'cancelled':
      case 'failed':
        return 'text-red-800 bg-red-100 border-red-300 ring-1 ring-red-200';
      default:
        return 'text-gray-800 bg-gray-100 border-gray-300 ring-1 ring-gray-200';
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
      'shipped': 85,
      'delivered': 100,
      'completed': 100
    };
    return progressMap[status?.toLowerCase()] || 0;
  };

  // Count orders by status
  const getOrderCounts = () => {
    const counts = {
      all: orders.length,
      pending: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0
    };

    orders.forEach(order => {
      const status = order.status?.toLowerCase();
      if (status === 'pending' || status === 'confirmed') counts.pending++;
      else if (status === 'processing') counts.processing++;
      else if (status === 'shipped' || status === 'in_transit') counts.shipped++;
      else if (status === 'delivered' || status === 'completed') counts.delivered++;
      else if (status === 'cancelled' || status === 'failed') counts.cancelled++;
    });

    return counts;
  };

  const orderCounts = getOrderCounts();
  const filteredOrders = orders; // Orders are already filtered by API

  const tabs = [
    { id: 'all', label: 'All Orders', count: orderCounts.all },
    { id: 'pending', label: 'Pending', count: orderCounts.pending },
    { id: 'processing', label: 'Processing', count: orderCounts.processing },
    { id: 'shipped', label: 'Shipped', count: orderCounts.shipped },
    { id: 'delivered', label: 'Delivered', count: orderCounts.delivered }
  ];

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleViewOrderDetails = (order) => {
    console.log('👀 handleViewOrderDetails called with order:', order);
    console.log('👀 Order items in handleViewOrderDetails:', order.items);
    console.log('👀 Order payment_method in handleViewOrderDetails:', order.payment_method);
    console.log('👀 Order keys in handleViewOrderDetails:', Object.keys(order));
    setSelectedOrder(order);
    setIsOrderDetailModalOpen(true);
  };

  const handleCloseOrderDetailModal = () => {
    setIsOrderDetailModalOpen(false);
    setSelectedOrder(null);
  };

  // Enhanced filtering and search
  const filteredAndSortedOrders = React.useMemo(() => {
    let filtered = [...orders];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(order =>
        (order.order_number || order.id)?.toString().toLowerCase().includes(query) ||
        order.shop_name?.toLowerCase().includes(query) ||
        order.items?.some(item =>
          item.product_name?.toLowerCase().includes(query)
        )
      );
    }

    // Apply date range filter
    if (dateRange) {
      const days = parseInt(dateRange);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);

      filtered = filtered.filter(order => {
        const orderDate = new Date(order.created_at || order.order_date);
        return orderDate >= cutoffDate;
      });
    }

    // Apply amount range filter
    if (amountRange) {
      filtered = filtered.filter(order => {
        const amount = order.total_amount || order.total || 0;

        if (amountRange === '0-50000') {
          return amount < 50000;
        } else if (amountRange === '50000-100000') {
          return amount >= 50000 && amount < 100000;
        } else if (amountRange === '100000-500000') {
          return amount >= 100000 && amount < 500000;
        } else if (amountRange === '500000+') {
          return amount >= 500000;
        }
        return true;
      });
    }

    // Apply shop filter
    if (selectedShop) {
      filtered = filtered.filter(order => order.shop_name === selectedShop);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date_desc':
          return new Date(b.created_at || b.order_date) - new Date(a.created_at || a.order_date);
        case 'date_asc':
          return new Date(a.created_at || a.order_date) - new Date(b.created_at || b.order_date);
        case 'amount_desc':
          return (b.total_amount || b.total || 0) - (a.total_amount || a.total || 0);
        case 'amount_asc':
          return (a.total_amount || a.total || 0) - (b.total_amount || b.total || 0);
        case 'status':
          return (a.status || '').localeCompare(b.status || '');
        default:
          return 0;
      }
    });

    return filtered;
  }, [orders, searchQuery, sortBy, dateRange, amountRange, selectedShop]);

  const handleReorder = (order) => {
    // Add items to cart and navigate to cart
    console.log('Reordering:', order);
    // Implementation for reorder functionality
  };

  const handleCancelOrder = async (order) => {
    try {
      // Check if order can be cancelled
      const policy = await api.getOrderCancellationPolicy(order.id);

      if (!policy.can_cancel) {
        showNotificationMessage(
          policy.reason.replace('Cannot cancel order: ', ''),
          'warning'
        );
        return;
      }

      // Show embedded cancellation form
      setCancellingOrderId(order.id);
      setShowCancellationForm(true);
      setCancellationDescription('');
      setCancellationReason('customer_changed_mind');
    } catch (error) {
      console.error('Error checking cancellation policy:', error);
      showNotificationMessage(
        'Failed to check cancellation policy. Please try again.',
        'error'
      );
    }
  };

  const submitCancellation = async () => {
    if (!cancellingOrderId) return;

    try {
      setIsProcessingCancellation(true);

      const cancellationData = {
        reason: cancellationReason,
        description: cancellationDescription,
        refund_requested: true,
        restock_items: true
      };

      const result = await api.cancelOrder(cancellingOrderId, cancellationData);

      if (result.success) {
        showNotificationMessage(
          result.message || 'Your order has been cancelled and refund is being processed.',
          'success'
        );

        // Refresh orders to show updated status
        fetchOrders();

        // Reset cancellation form
        setShowCancellationForm(false);
        setCancellingOrderId(null);
        setCancellationDescription('');
      } else {
        showNotificationMessage(
          `Cancellation failed: ${result.message}`,
          'error'
        );
      }
    } catch (error) {
      console.error('Error cancelling order:', error);
      showNotificationMessage(
        'Failed to cancel order. Please try again.',
        'error'
      );
    } finally {
      setIsProcessingCancellation(false);
    }
  };

  const cancelCancellation = () => {
    setShowCancellationForm(false);
    setCancellingOrderId(null);
    setCancellationDescription('');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="pt-24">
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-2 border-teal-600 border-t-transparent mx-auto mb-4"></div>
                <p className="text-gray-600">Loading your orders...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="pt-24">
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Icon name="AlertCircle" size={40} className="text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Failed to Load Orders</h3>
              <p className="text-gray-600 mb-6">{error}</p>
              <Button onClick={fetchOrders} variant="default" iconName="RefreshCw" iconPosition="left">
                Try Again
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>My Orders - IziShop</title>
        <meta name="description" content="Track and manage your orders on IziShop marketplace" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-teal-50">
        <Header />

        <div className="pt-24 pb-12">
          <div className="max-w-7xl mx-auto px-6 py-8">
            {/* Professional Header Section */}
            <div className="mb-12">
              {/* Title and Actions */}
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
                <div className="mb-6 lg:mb-0">
                  <h1 className="text-4xl font-bold text-gray-900 mb-2">
                    My Orders
                  </h1>
                  <p className="text-lg text-gray-600">
                    Track and manage your orders • {orders.length} total orders
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    variant="outline"
                    onClick={() => setShowFilters(!showFilters)}
                    iconName="Filter"
                    iconPosition="left"
                    className="px-6 py-3 border-gray-300 hover:border-teal-500 hover:text-teal-600"
                  >
                    Advanced Filters
                  </Button>
                  <Button
                    variant="default"
                    onClick={() => navigate('/product-catalog')}
                    iconName="ShoppingBag"
                    iconPosition="left"
                    className="px-6 py-3 bg-teal-600 hover:bg-teal-700"
                  >
                    Continue Shopping
                  </Button>
                </div>
              </div>

              {/* Search and Sort Bar - Professional Layout */}
              <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 p-6">
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Search Input - Enhanced */}
                  <div className="flex-1 relative">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Search Orders
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Icon name="Search" size={20} className="text-gray-400" />
                      </div>
                      <input
                        type="text"
                        placeholder="Search by order number, shop name, or product..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-12 py-4 border-2 border-gray-200 rounded-xl focus:ring-0 focus:border-teal-500 placeholder-gray-400 bg-white text-gray-900 marketplace-transition hover:border-gray-300"
                      />
                      {searchQuery && (
                        <button
                          onClick={() => setSearchQuery('')}
                          className="absolute inset-y-0 right-0 pr-4 flex items-center hover:bg-gray-50 rounded-r-lg marketplace-transition"
                        >
                          <Icon name="X" size={18} className="text-gray-400 hover:text-gray-600" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Sort Dropdown - Custom Professional */}
                  <div className="lg:w-64">
                    <CustomSelect
                      label="Sort By"
                      value={sortBy}
                      onChange={setSortBy}
                      options={[
                        { value: "date_desc", label: "Latest Orders First" },
                        { value: "date_asc", label: "Oldest Orders First" },
                        { value: "amount_desc", label: "Highest Amount First" },
                        { value: "amount_asc", label: "Lowest Amount First" },
                        { value: "status", label: "Group by Status" }
                      ]}
                      placeholder="Choose sorting..."
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Advanced Filters Panel */}
            {showFilters && (
              <div className="mb-8 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl p-6 marketplace-transition overflow-visible">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Advanced Filters</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSearchQuery('');
                      setSortBy('date_desc');
                      setActiveTab('all');
                      setDateRange('');
                      setAmountRange('');
                      setSelectedShop('');
                    }}
                    className="text-teal-600 hover:text-teal-700 hover:bg-teal-50"
                  >
                    Clear All Filters
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
                  <div>
                    <CustomSelect
                      label="Date Range"
                      value={dateRange}
                      onChange={setDateRange}
                      options={[
                        { value: "", label: "All Time" },
                        { value: "7", label: "Last 7 Days" },
                        { value: "30", label: "Last 30 Days" },
                        { value: "90", label: "Last 3 Months" },
                        { value: "365", label: "Last Year" }
                      ]}
                      placeholder="Select date range..."
                    />
                  </div>

                  <div>
                    <CustomSelect
                      label="Amount Range"
                      value={amountRange}
                      onChange={setAmountRange}
                      options={[
                        { value: "", label: "All Amounts" },
                        { value: "0-50000", label: "Under 50,000 XAF" },
                        { value: "50000-100000", label: "50,000 - 100,000 XAF" },
                        { value: "100000-500000", label: "100,000 - 500,000 XAF" },
                        { value: "500000+", label: "Over 500,000 XAF" }
                      ]}
                      placeholder="Select amount range..."
                    />
                  </div>

                  <div>
                    <CustomSelect
                      label="Shop"
                      value={selectedShop}
                      onChange={setSelectedShop}
                      options={[
                        { value: "", label: "All Shops" },
                        ...[...new Set(orders.map(order => order.shop_name))].filter(Boolean).map(shopName => ({
                          value: shopName,
                          label: shopName
                        }))
                      ]}
                      placeholder="Select shop..."
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Results Summary */}
            {searchQuery && (
              <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-800 font-medium">
                  <Icon name="Search" size={18} className="inline mr-2" />
                  Found {filteredAndSortedOrders.length} orders matching "{searchQuery}"
                </p>
              </div>
            )}

            {/* Status Tabs - Professional Design */}
            <div className="mb-8">
              <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 p-2">
                <div className="flex overflow-x-auto">
                  <div className="flex space-x-2 min-w-full">
                    {tabs.map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => handleTabChange(tab.id)}
                        className={`px-6 py-3 rounded-lg text-sm font-medium marketplace-transition whitespace-nowrap ${
                          activeTab === tab.id
                            ? 'bg-teal-600 text-white'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                      >
                        {tab.label}
                        <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                          activeTab === tab.id
                            ? 'bg-teal-500 text-white'
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {tab.count}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Orders List - Enhanced Professional Design */}
            {filteredAndSortedOrders.length > 0 ? (
              <div className="space-y-6">
                {filteredAndSortedOrders.map((order) => (
                  <div key={order.id} className="bg-white/90 backdrop-blur-sm rounded-xl border border-gray-200 overflow-hidden hover:bg-white hover:border-gray-300">
                    {/* Order Header - Enhanced Layout */}
                    <div className="p-6 border-b border-gray-100">
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                        <div className="mb-4 lg:mb-0">
                          <h3 className="text-xl font-bold text-gray-900 mb-2">
                            Order #{order.order_number || order.id}
                          </h3>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                            <p className="text-gray-600 flex items-center">
                              <Icon name="Calendar" size={16} className="mr-2 text-gray-400" />
                              {formatDate(order.created_at || order.order_date)}
                            </p>
                            {order.shop_name && (
                              <p className="text-gray-600 flex items-center">
                                <Icon name="Store" size={16} className="mr-2 text-gray-400" />
                                {order.shop_name}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col lg:items-end gap-3">
                          <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold border-2 ${getStatusColor(order.status)}`}>
                            {getStatusText(order.status)}
                          </span>
                          <p className="text-2xl font-bold text-gray-900">
                            {formatCurrency(order.total_amount || order.total || 0)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Order Items - Enhanced Layout */}
                    <div className="p-6">
                      {/* Progress Bar */}
                      <div className="relative mb-6">
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

                      <h4 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h4>
                      <div className="space-y-4">
                        {order.items && order.items.length > 0 ? (
                          order.items.map((item, index) => (
                            <div key={item.id || index} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                              <div className="w-16 h-16 lg:w-20 lg:h-20 flex-shrink-0 overflow-hidden rounded-lg bg-gray-200">
                                {item.product_image ? (
                                  <img
                                    src={item.product_image}
                                    alt={item.product_name || 'Product'}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      e.target.style.display = 'none';
                                      e.target.nextSibling.style.display = 'flex';
                                    }}
                                  />
                                ) : null}
                                <div className="w-full h-full flex items-center justify-center" style={{ display: item.product_image ? 'none' : 'flex' }}>
                                  <Icon name="Package" size={24} className="text-gray-400" />
                                </div>
                              </div>

                              <div className="flex-1 min-w-0">
                                <h5 className="font-semibold text-gray-900 text-base lg:text-lg mb-2">
                                  {item.product_name || 'Product'}
                                </h5>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                                  <div>
                                    <span className="text-gray-500">Quantity:</span>
                                    <span className="ml-1 font-medium text-gray-900">{item.quantity || 1}</span>
                                  </div>
                                  <div>
                                    <span className="text-gray-500">Unit Price:</span>
                                    <span className="ml-1 font-medium text-gray-900">
                                      {formatCurrency(item.unit_price || item.price || 0)}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-gray-500">Total:</span>
                                    <span className="ml-1 font-semibold text-gray-900">
                                      {formatCurrency(item.total_price || ((item.unit_price || item.price || 0) * (item.quantity || 1)))}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="p-6 bg-gray-50 rounded-lg text-center">
                            <Icon name="Package" size={32} className="text-gray-400 mx-auto mb-2" />
                            <p className="text-gray-600">No items information available</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Order Actions and Tracking */}
                    <div className="p-6 bg-gray-50/50 border-t border-gray-100">
                      {order.tracking_number && (
                        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                          <p className="text-sm text-blue-800 font-medium mb-1">Tracking Number</p>
                          <p className="text-blue-600 font-mono">{order.tracking_number}</p>
                        </div>
                      )}

                      <div className="flex flex-wrap gap-3">
                        {/* Primary Action - View Details */}
                        <Button
                          variant="default"
                          size="md"
                          iconName="Eye"
                          iconPosition="left"
                          className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2"
                          onClick={() => handleViewOrderDetails(order)}
                        >
                          View Details
                        </Button>

                        {/* Tracking Button */}
                        {(order.status === 'shipped' || order.status === 'in_transit') && order.tracking_number && (
                          <Button
                            variant="outline"
                            size="sm"
                            iconName="Truck"
                            iconPosition="left"
                            className="border-teal-300 text-teal-700 hover:bg-teal-50"
                          >
                            Track Package
                          </Button>
                        )}

                        {/* Reorder Button - for completed orders */}
                        {(order.status === 'delivered' || order.status === 'completed') && (
                          <Button
                            variant="outline"
                            size="sm"
                            iconName="RotateCcw"
                            iconPosition="left"
                            className="border-blue-300 text-blue-700 hover:bg-blue-50"
                            onClick={() => handleReorder(order)}
                          >
                            Reorder
                          </Button>
                        )}

                        {/* Review Button */}
                        {(order.status === 'delivered' || order.status === 'completed') && (
                          <Button
                            variant="outline"
                            size="sm"
                            iconName="Star"
                            iconPosition="left"
                            className="border-amber-300 text-amber-700 hover:bg-amber-50"
                          >
                            Review
                          </Button>
                        )}

                        {/* Invoice/Receipt Button */}
                        <Button
                          variant="ghost"
                          size="sm"
                          iconName="Download"
                          iconPosition="left"
                          className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                        >
                          Invoice
                        </Button>

                        {/* Cancel Button - for pending/processing orders */}
                        {(order.status === 'pending' || order.status === 'processing') && (
                          <Button
                            variant="ghost"
                            size="sm"
                            iconName="X"
                            iconPosition="left"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleCancelOrder(order)}
                          >
                            Cancel
                          </Button>
                        )}

                        {/* Return/Exchange Button - for delivered orders within return window */}
                        {(order.status === 'delivered' || order.status === 'completed') && (
                          <Button
                            variant="ghost"
                            size="sm"
                            iconName="RefreshCw"
                            iconPosition="left"
                            className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                          >
                            Return
                          </Button>
                        )}
                      </div>

                      {/* Embedded Cancellation Form */}
                      {showCancellationForm && cancellingOrderId === order.id && (
                        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="text-lg font-semibold text-red-800 flex items-center">
                              <Icon name="AlertTriangle" size={20} className="mr-2" />
                              Cancel Order
                            </h4>
                            <button
                              onClick={cancelCancellation}
                              className="text-red-600 hover:text-red-800"
                            >
                              <Icon name="X" size={20} />
                            </button>
                          </div>

                          <div className="space-y-4">
                            {/* Cancellation Reason */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Reason for cancellation
                              </label>
                              <select
                                value={cancellationReason}
                                onChange={(e) => setCancellationReason(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                              >
                                <option value="customer_changed_mind">Changed my mind</option>
                                <option value="wrong_item_ordered">Ordered wrong item</option>
                                <option value="duplicate_order">Duplicate order</option>
                                <option value="delivery_issues">Delivery issues</option>
                                <option value="pricing_error">Pricing error</option>
                                <option value="other">Other</option>
                              </select>
                            </div>

                            {/* Additional Description */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Additional details (optional)
                              </label>
                              <textarea
                                value={cancellationDescription}
                                onChange={(e) => setCancellationDescription(e.target.value)}
                                placeholder="Please provide any additional details about your cancellation..."
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                                rows={3}
                                maxLength={500}
                              />
                              <p className="text-xs text-gray-500 mt-1">
                                {cancellationDescription.length}/500 characters
                              </p>
                            </div>

                            {/* Cancellation Info */}
                            <div className="bg-white p-3 rounded border">
                              <h5 className="font-medium text-gray-900 mb-2">What happens next:</h5>
                              <ul className="text-sm text-gray-600 space-y-1">
                                <li>• Your order will be cancelled immediately</li>
                                <li>• Full refund will be processed (3-5 business days)</li>
                                <li>• Items will be returned to inventory</li>
                                <li>• You'll receive a confirmation email</li>
                              </ul>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3 pt-2">
                              <Button
                                variant="default"
                                size="sm"
                                onClick={submitCancellation}
                                disabled={isProcessingCancellation}
                                className="bg-red-600 hover:bg-red-700 text-white flex-1"
                              >
                                {isProcessingCancellation ? (
                                  <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                                    Processing...
                                  </>
                                ) : (
                                  'Confirm Cancellation'
                                )}
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={cancelCancellation}
                                disabled={isProcessingCancellation}
                                className="border-gray-300 text-gray-700 hover:bg-gray-50"
                              >
                                Keep Order
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Icon name="Package" size={40} className="text-gray-400" />
                </div>

                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No orders found
                </h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  {activeTab === 'all'
                    ? "You haven't placed any orders yet. Start shopping to see your orders here."
                    : `No ${getStatusText(activeTab)} orders found.`
                  }
                </p>

                <Button
                  variant="default"
                  onClick={() => navigate('/product-catalog')}
                  iconName="ShoppingBag"
                  iconPosition="left"
                  className="bg-teal-600 hover:bg-teal-700"
                >
                  Start Shopping
                </Button>
              </div>
            )}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="mt-8 flex justify-center">
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pagination.page <= 1}
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                    iconName="ChevronLeft"
                    iconPosition="left"
                  >
                    Previous
                  </Button>

                  <span className="px-4 py-2 text-sm text-gray-600">
                    Page {pagination.page} of {pagination.totalPages}
                  </span>

                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pagination.page >= pagination.totalPages}
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                    iconName="ChevronRight"
                    iconPosition="right"
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Order Detail Modal */}
      <OrderDetailModal
        isOpen={isOrderDetailModalOpen}
        onClose={handleCloseOrderDetailModal}
        order={selectedOrder}
      />

      {/* Industry-Standard Notification System - Stripe/Vercel/Linear Style */}
      {notification && (
        <div className="fixed inset-0 z-50 pointer-events-none">
          {/* Notification Container */}
          <div className="absolute top-4 right-4 pointer-events-auto">
            <div
              className={`${
                showNotification
                  ? 'animate-notification-enter'
                  : 'transform -translate-y-2 opacity-0 scale-95 transition-all duration-300 ease-in'
              }`}
            >
              {/* Main Notification Card */}
              <div className={`
                relative overflow-hidden min-w-[380px] max-w-md
                bg-white dark:bg-gray-900
                border border-gray-200 dark:border-gray-700
                rounded-lg shadow-lg backdrop-blur-xl
                ${notification.type === 'success' ? 'shadow-green-500/10' : ''}
                ${notification.type === 'warning' ? 'shadow-amber-500/10' : ''}
                ${notification.type === 'error' ? 'shadow-red-500/10' : ''}
              `}>

                {/* Status Indicator Bar */}
                <div className={`absolute top-0 left-0 w-full h-0.5 ${
                  notification.type === 'success' ? 'bg-green-500' :
                  notification.type === 'warning' ? 'bg-amber-500' :
                  'bg-red-500'
                }`} />

                {/* Content Area */}
                <div className="p-4 pr-12">
                  <div className="flex items-start space-x-3">

                    {/* Status Icon with Modern Design */}
                    <div className={`
                      flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center
                      ${notification.type === 'success' ? 'bg-green-100 dark:bg-green-900/30' : ''}
                      ${notification.type === 'warning' ? 'bg-amber-100 dark:bg-amber-900/30' : ''}
                      ${notification.type === 'error' ? 'bg-red-100 dark:bg-red-900/30' : ''}
                    `}>
                      <Icon
                        name={
                          notification.type === 'success' ? 'CheckCircle2' :
                          notification.type === 'warning' ? 'AlertTriangle' :
                          'XCircle'
                        }
                        size={18}
                        className={`
                          ${notification.type === 'success' ? 'text-green-600 dark:text-green-400' : ''}
                          ${notification.type === 'warning' ? 'text-amber-600 dark:text-amber-400' : ''}
                          ${notification.type === 'error' ? 'text-red-600 dark:text-red-400' : ''}
                        `}
                      />
                    </div>

                    {/* Message Content */}
                    <div className="flex-1 min-w-0">
                      {/* Title */}
                      <div className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">
                        {notification.type === 'success' && 'Order Action Completed'}
                        {notification.type === 'warning' && 'Action Not Available'}
                        {notification.type === 'error' && 'Something Went Wrong'}
                      </div>

                      {/* Message */}
                      <div className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                        {notification.message}
                      </div>

                      {/* Action Buttons for certain types */}
                      {notification.type === 'warning' && (
                        <div className="mt-3 flex items-center space-x-2">
                          <button
                            onClick={() => navigate('/help/cancellation-policy')}
                            className="text-xs font-medium text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 transition-colors"
                          >
                            Learn More
                          </button>
                          <span className="text-gray-300 dark:text-gray-600">•</span>
                          <button
                            onClick={() => {
                              hideNotification();
                              navigateToSupportWithContext(
                                notification.message,
                                'order_cancellation_failed',
                                cancellingOrderId
                              );
                            }}
                            className="text-xs font-medium text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 transition-colors"
                          >
                            Contact Support
                          </button>
                        </div>
                      )}

                      {/* Error type action buttons */}
                      {notification.type === 'error' && (
                        <div className="mt-3 flex items-center space-x-2">
                          <button
                            onClick={() => window.location.reload()}
                            className="text-xs font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors"
                          >
                            Refresh Page
                          </button>
                          <span className="text-gray-300 dark:text-gray-600">•</span>
                          <button
                            onClick={() => {
                              hideNotification();
                              navigateToSupportWithContext(
                                notification.message,
                                'general_error',
                                null
                              );
                            }}
                            className="text-xs font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors"
                          >
                            Get Help
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Close Button */}
                <button
                  onClick={hideNotification}
                  className="absolute top-2 right-2 p-2 rounded-md text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <Icon name="X" size={14} />
                </button>

                {/* Elegant Progress Bar */}
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gray-100 dark:bg-gray-800">
                  <div
                    className={`h-full transition-all duration-75 ease-linear ${
                      notification.type === 'success' ? 'bg-green-500' :
                      notification.type === 'warning' ? 'bg-amber-500' :
                      'bg-red-500'
                    }`}
                    style={{
                      animation: showNotification ? `progressShrink ${(notification.duration || 5000)}ms linear forwards` : 'none'
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Subtle Backdrop for Mobile */}
          <div className={`sm:hidden absolute inset-0 bg-black/5 transition-opacity duration-300 ${
            showNotification ? 'opacity-100' : 'opacity-0'
          }`} onClick={hideNotification} />
        </div>
      )}
    </>
  );
};

export default MyOrders;