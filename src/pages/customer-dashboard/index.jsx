import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import { showToast } from '../../components/ui/Toast';
import Header from '../../components/ui/Header';
import NavigationSection from '../../components/ui/NavigationSection';
import MobileBottomTab from '../../components/ui/MobileBottomTab';
import OrderDetailModal from '../../components/ui/OrderDetailModal';
import api from '../../services/api';

const CustomerDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [stats, setStats] = useState({
    total_orders: 0,
    active_orders: 0,
    delivered_orders: 0,
    total_spent: 0,
    saved_amount: 0,
    loyalty_points: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isOrderDetailModalOpen, setIsOrderDetailModalOpen] = useState(false);

  // Optimized refresh interval to reduce server load
  const REFRESH_INTERVAL = 300000; // 5 minutes

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    loadCustomerData();
    
    // Set up auto-refresh interval
    const refreshTimer = setInterval(() => {
      refreshData();
    }, REFRESH_INTERVAL);

    return () => {
      clearInterval(timer);
      clearInterval(refreshTimer);
    };
  }, []);

  const loadCustomerData = async () => {
    try {
      console.log('🔄 Loading customer dashboard data...');

      // Fetch data in parallel for better performance
      console.log('📡 Calling API endpoints...');
      const [statsData, ordersData, wishlistData] = await Promise.all([
        api.getCustomerStats().catch(err => {
          console.error('❌ Stats API failed:', err);
          return { total_orders: 0, pending_orders: 0, total_spent: 0, avg_order_value: 0 };
        }),
        api.getCustomerRecentOrders(5).catch(err => {
          console.error('❌ Recent orders API failed:', err);
          return [];
        }),
        api.getCustomerWishlist({ limit: 1 }).catch(err => {
          console.error('❌ Wishlist API failed:', err);
          return [];
        })
      ]);

      console.log('✅ Customer data loaded:');
      console.log('  📊 Stats:', statsData);
      console.log('  📦 Orders:', ordersData);
      console.log('  ❤️  Wishlist:', wishlistData);

      // Update state with fresh data - map backend fields to frontend structure
      const mappedStats = {
        total_orders: statsData.total_orders || 0,
        active_orders: statsData.pending_orders || 0,
        delivered_orders: (statsData.total_orders || 0) - (statsData.pending_orders || 0),
        total_spent: statsData.total_spent || 0,
        saved_amount: 0, // Not provided by backend yet
        loyalty_points: 0, // Not provided by backend yet
        favorite_categories: [], // Not provided by backend yet
        last_order_date: null, // Not provided by backend yet
        avg_order_value: statsData.avg_order_value || 0
      };

      console.log('📝 Mapped stats:', mappedStats);

      setStats(mappedStats);
      setRecentOrders(ordersData);
      setWishlistCount(wishlistData.length);
      setLastUpdated(new Date());

    } catch (error) {
      console.error('❌ Failed to load customer data:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        response: error.response
      });

      showToast({
        type: 'error',
        message: 'Failed to load dashboard data. Please check your connection.',
        duration: 4000
      });

      // Set empty states for real data only
      setStats({
        total_orders: 0,
        active_orders: 0,
        delivered_orders: 0,
        total_spent: 0,
        saved_amount: 0,
        loyalty_points: 0,
        favorite_categories: [],
        last_order_date: null
      });
      setRecentOrders([]);
      setWishlistCount(0);
    } finally {
    }
  };
  
  // Refresh data without full loading screen
  const refreshData = useCallback(async () => {
    try {
      setRefreshing(true);
      
      const [statsData, ordersData, wishlistData] = await Promise.all([
        api.getCustomerStats(),
        api.getCustomerRecentOrders(5),
        api.getCustomerWishlist({ limit: 1 })
      ]);
      
      // Map backend fields to frontend structure
      const mappedStats = {
        total_orders: statsData.total_orders || 0,
        active_orders: statsData.pending_orders || 0,
        delivered_orders: (statsData.total_orders || 0) - (statsData.pending_orders || 0),
        total_spent: statsData.total_spent || 0,
        saved_amount: 0, // Not provided by backend yet
        loyalty_points: 0, // Not provided by backend yet
        favorite_categories: [], // Not provided by backend yet
        last_order_date: null, // Not provided by backend yet
        avg_order_value: statsData.avg_order_value || 0
      };

      setStats(mappedStats);
      setRecentOrders(ordersData);
      setWishlistCount(wishlistData.length);
      setLastUpdated(new Date());
      
    } catch (error) {
      console.warn('Failed to refresh customer data:', error);
      showToast({
        type: 'error',
        message: 'Failed to refresh data. Please try again.',
        duration: 3000
      });
    } finally {
      setRefreshing(false);
    }
  }, []);

  // Helper functions from my-orders page
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

  const handleViewOrderDetails = (order) => {
    setSelectedOrder(order);
    setIsOrderDetailModalOpen(true);
  };

  const handleCloseOrderDetailModal = () => {
    setIsOrderDetailModalOpen(false);
    setSelectedOrder(null);
  };

  const handleReorder = (order) => {
    showToast({
      type: 'warning',
      message: 'Reorder feature will be implemented soon',
      duration: 3000
    });
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
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Navigation Header */}
      <Header />
      
      {/* Secondary Navigation */}
      <NavigationSection />
      
      {/* Dashboard Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 pt-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-teal-900">Customer Dashboard</h1>
              <p className="text-teal-700">Welcome back, {user?.first_name || 'Customer'}</p>
            </div>
            <div className="flex items-center space-x-3">
              {/* Status Indicators */}
              <div className="hidden lg:flex items-center space-x-2 text-sm text-teal-600">
                {lastUpdated && (
                  <span className="flex items-center space-x-1">
                    <Icon name="Clock" size={12} />
                    <span>Updated: {lastUpdated.toLocaleTimeString()}</span>
                  </span>
                )}
                {refreshing && (
                  <div className="flex items-center space-x-1 text-teal-600">
                    <div className="animate-spin rounded-full h-3 w-3 border border-teal-600 border-t-transparent"></div>
                    <span>Refreshing...</span>
                  </div>
                )}
              </div>

              {/* Enhanced Action Buttons */}
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  iconName="RefreshCw"
                  iconPosition="left"
                  onClick={refreshData}
                  loading={refreshing}
                  className="hidden sm:flex"
                >
                  Refresh
                </Button>
                
                {/* Quick Actions Dropdown for Mobile */}
                <div className="sm:hidden">
                  <Button
                    variant="outline"
                    size="sm"
                    iconName="Menu"
                    onClick={() => {/* Toggle mobile menu */}}
                  />
                </div>

                {/* Desktop Navigation */}
                <div className="hidden sm:flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    iconName="Package"
                    iconPosition="left"
                    onClick={() => navigate('/my-orders')}
                  >
                    Orders
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    iconName="User"
                    iconPosition="left"
                    onClick={() => navigate('/user-profile')}
                  >
                    Profile
                  </Button>
                  
                  {/* Loyalty Points Quick Access */}
                  {stats.loyalty_points > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      iconName="Star"
                      iconPosition="left"
                      onClick={() => navigate('/loyalty-rewards')}
                      className="bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100"
                    >
                      {stats.loyalty_points} pts
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Enhanced Stats Cards with Real Data */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Orders Card */}
          <div className="bg-white rounded-lg p-6 border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/my-orders')}>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-teal-600 rounded-lg flex items-center justify-center">
                    <Icon name="Package" size={20} className="text-white" />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-teal-600">Total Orders</p>
                  <p className="text-2xl font-bold text-teal-900">{stats.total_orders}</p>
                  {stats.last_order_date && (
                    <p className="text-xs text-teal-500">Last: {formatDate(stats.last_order_date)}</p>
                  )}
                </div>
              </div>
              <div className="text-teal-600">
                <Icon name="TrendingUp" size={16} />
              </div>
            </div>
          </div>

          {/* Active Orders Card */}
          <div className="bg-white rounded-lg p-6 border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/my-orders?status=active')}>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg flex items-center justify-center">
                    <Icon name="Clock" size={20} className="text-white" />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-teal-600">Active Orders</p>
                  <p className="text-2xl font-bold text-teal-900">{stats.active_orders}</p>
                  <p className="text-xs text-teal-500">In progress</p>
                </div>
              </div>
              {stats.active_orders > 0 && (
                <div className="text-amber-600 animate-pulse">
                  <Icon name="Clock" size={16} />
                </div>
              )}
            </div>
          </div>

          {/* Delivered Orders Card */}
          <div className="bg-white rounded-lg p-6 border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/my-orders?status=delivered')}>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg flex items-center justify-center">
                    <Icon name="CheckCircle" size={20} className="text-white" />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-teal-600">Delivered</p>
                  <p className="text-2xl font-bold text-teal-900">{stats.delivered_orders}</p>
                  {stats.total_orders > 0 && (
                    <p className="text-xs text-teal-500">{Math.round((stats.delivered_orders / stats.total_orders) * 100)}% success rate</p>
                  )}
                </div>
              </div>
              <div className="text-emerald-600">
                <Icon name="CheckCircle" size={16} />
              </div>
            </div>
          </div>

          {/* Total Spent Card */}
          <div className="bg-white rounded-lg p-6 border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-teal-600 rounded-lg flex items-center justify-center">
                    <Icon name="Banknote" size={20} className="text-white" />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-teal-600">Total Spent</p>
                  <p className="text-2xl font-bold text-teal-900">{formatCurrency(stats.total_spent)}</p>
                  {stats.saved_amount > 0 && (
                    <p className="text-xs text-emerald-600">Saved: {formatCurrency(stats.saved_amount)}</p>
                  )}
                </div>
              </div>
              <div className="text-cyan-600">
                <Icon name="TrendingUp" size={16} />
              </div>
            </div>
          </div>
        </div>

        {/* Loyalty Points Card */}
        {stats.loyalty_points > 0 && (
          <div className="bg-white rounded-lg p-6 border border-gray-200 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-lg flex items-center justify-center">
                  <Icon name="Star" size={24} className="text-white" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-teal-900">Loyalty Points</h3>
                  <p className="text-2xl font-bold text-teal-600">{stats.loyalty_points} points</p>
                  <p className="text-sm text-teal-700">Redeem for discounts and rewards</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/loyalty-rewards')}
                >
                  View Rewards
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => navigate('/redeem-points')}
                >
                  Redeem Points
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Favorite Categories */}
        {stats.favorite_categories && stats.favorite_categories.length > 0 && (
          <div className="bg-white rounded-lg p-6 border border-gray-200 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Your Favorite Categories</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/product-catalog')}
              >
                Explore More
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {stats.favorite_categories.map((category, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium cursor-pointer hover:bg-blue-200 transition-colors"
                  onClick={() => navigate(`/product-catalog?category=${category.toLowerCase()}`)}
                >
                  {category}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Recent Orders */}
        <div className="bg-white shadow rounded-lg mb-8">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-900">Recent Orders</h2>
            <Button
              variant="outline"
              size="sm"
              iconName="Eye"
              iconPosition="left"
              onClick={() => navigate('/my-orders')}
            >
              View All
            </Button>
          </div>
          <div className="divide-y divide-gray-200">
            {recentOrders.length === 0 ? (
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icon name="Package" size={32} className="text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Orders Yet</h3>
                <p className="text-gray-500 mb-4">You haven't placed any orders yet. Start shopping to see your orders here!</p>
                <Button
                  onClick={() => navigate('/product-catalog')}
                  className="bg-blue-500 hover:bg-blue-600 text-white"
                >
                  Browse Products
                </Button>
              </div>
            ) : (
              recentOrders.map((order) => (
                <div key={order.id} className="bg-white/90 backdrop-blur-sm rounded-xl border border-gray-200 overflow-hidden hover:bg-white hover:border-gray-300 mb-3">
                  {/* Order Header */}
                  <div className="p-4 border-b border-gray-100">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                      <div className="mb-3 lg:mb-0">
                        <h3 className="text-lg font-bold text-gray-900 mb-1">
                          Order #{order.order_number || order.id}
                        </h3>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                          <p className="text-gray-600 flex items-center text-sm">
                            <Icon name="Calendar" size={14} className="mr-2 text-gray-400" />
                            {formatDate(order.created_at)}
                          </p>
                          {order.shop_name && (
                            <p className="text-gray-600 flex items-center text-sm">
                              <Icon name="Store" size={14} className="mr-2 text-gray-400" />
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

                  {/* Order Items */}
                  <div className="p-4">
                    {/* Progress Bar */}
                    <div className="relative mb-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-gray-700">Order Progress</span>
                        <span className="text-xs text-gray-500">{getProgressPercentage(order.status)}% Complete</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div
                          className="bg-gradient-to-r from-teal-500 to-emerald-500 h-1.5 rounded-full transition-all duration-500"
                          style={{ width: `${getProgressPercentage(order.status)}%` }}
                        />
                      </div>
                    </div>

                    <h4 className="text-base font-semibold text-gray-900 mb-2">Order Items</h4>
                    <div className="space-y-2">
                      {order.items && order.items.length > 0 ? (
                        order.items.map((item, index) => (
                          <div key={item.id || index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                            <div className="w-12 h-12 lg:w-14 lg:h-14 flex-shrink-0 overflow-hidden rounded-lg bg-gray-200">
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
                                <Icon name="Package" size={16} className="text-gray-400" />
                              </div>
                            </div>

                            <div className="flex-1 min-w-0">
                              <h5 className="font-semibold text-gray-900 text-sm lg:text-base mb-1">
                                {item.product_name || 'Product'}
                              </h5>
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                                <div>
                                  <span className="text-gray-500">Qty:</span>
                                  <span className="ml-1 font-medium text-gray-900">{item.quantity || 1}</span>
                                </div>
                                <div>
                                  <span className="text-gray-500">Price:</span>
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

                  {/* Order Actions */}
                  <div className="p-4 bg-gray-50/50 border-t border-gray-100">
                    {order.tracking_number && (
                      <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-xs text-blue-800 font-medium mb-1">Tracking Number</p>
                        <p className="text-blue-600 font-mono text-sm">{order.tracking_number}</p>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="default"
                        size="sm"
                        iconName="Eye"
                        iconPosition="left"
                        className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 text-sm"
                        onClick={() => handleViewOrderDetails(order)}
                      >
                        View Details
                      </Button>

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
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Enhanced Quick Actions with Real Data */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Browse Products Card */}
          <div className="bg-white rounded-lg p-6 border border-gray-200 text-center hover:shadow-lg transition-all cursor-pointer" onClick={() => navigate('/product-catalog')}>
            <div className="w-14 h-14 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-lg flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Icon name="Search" size={28} className="text-white" />
            </div>
            <h3 className="text-lg font-semibold text-teal-900 mb-2">Browse Products</h3>
            <p className="text-sm text-teal-700 mb-3">Discover new products from verified sellers</p>
            {stats.favorite_categories && stats.favorite_categories.length > 0 && (
              <div className="mb-4">
                <p className="text-xs text-teal-600 font-medium mb-2">Recommended for you:</p>
                <div className="flex flex-wrap justify-center gap-1">
                  {stats.favorite_categories.slice(0, 2).map((category, index) => (
                    <span key={index} className="px-2 py-1 bg-teal-100 text-teal-700 rounded-full text-xs">
                      {category}
                    </span>
                  ))}
                </div>
              </div>
            )}
            <Button
              variant="default"
              fullWidth
              className="bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700"
            >
              Start Shopping
            </Button>
          </div>

          {/* Enhanced Wishlist Card */}
          <div className="bg-white rounded-lg p-6 border border-gray-200 text-center hover:shadow-lg transition-all cursor-pointer" onClick={() => navigate('/wishlist')}>
            <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center mx-auto mb-4 shadow-lg relative">
              <Icon name="Heart" size={28} className="text-white" />
              {wishlistCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold">
                  {wishlistCount}
                </span>
              )}
            </div>
            <h3 className="text-lg font-semibold text-teal-900 mb-2">Your Wishlist</h3>
            <p className="text-sm text-teal-700 mb-2">Save items for later and track price changes</p>
            {wishlistCount > 0 ? (
              <div className="mb-4">
                <p className="text-lg font-bold text-emerald-600">{wishlistCount} items saved</p>
                <p className="text-xs text-teal-600">Click to view all saved items</p>
              </div>
            ) : (
              <div className="mb-4">
                <p className="text-sm text-teal-600">No items saved yet</p>
                <p className="text-xs text-teal-500">Start adding products you love!</p>
              </div>
            )}
            <Button
              variant="default"
              fullWidth
              className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
            >
              View Wishlist {wishlistCount > 0 ? `(${wishlistCount})` : ''}
            </Button>
          </div>

          {/* Enhanced Customer Support Card */}
          <div className="bg-white rounded-lg p-6 border border-gray-200 text-center hover:shadow-lg transition-all cursor-pointer" onClick={() => navigate('/customer-support')}>
            <div className="w-14 h-14 bg-gradient-to-br from-cyan-500 to-teal-600 rounded-lg flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Icon name="MessageCircle" size={28} className="text-white" />
            </div>
            <h3 className="text-lg font-semibold text-teal-900 mb-2">Customer Support</h3>
            <p className="text-sm text-teal-700 mb-3">Get help with orders, returns, and questions</p>
            <div className="mb-4">
              <div className="flex items-center justify-center space-x-4 text-xs text-teal-600">
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                  <span>Online 24/7</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Icon name="Phone" size={12} />
                  <span>Call Support</span>
                </div>
              </div>
            </div>
            <Button
              variant="default"
              fullWidth
              className="bg-gradient-to-r from-cyan-500 to-teal-600 hover:from-cyan-600 hover:to-teal-700"
            >
              Contact Support
            </Button>
          </div>
        </div>

        {/* Additional Quick Access Row */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <Button
            variant="outline"
            className="h-16 flex flex-col items-center justify-center space-y-1 hover:bg-gray-50"
            onClick={() => navigate('/track-order')}
          >
            <Icon name="MapPin" size={20} className="text-blue-600" />
            <span className="text-sm font-medium">Track Order</span>
          </Button>
          
          <Button
            variant="outline"
            className="h-16 flex flex-col items-center justify-center space-y-1 hover:bg-gray-50"
            onClick={() => navigate('/order-history')}
          >
            <Icon name="History" size={20} className="text-green-600" />
            <span className="text-sm font-medium">Order History</span>
          </Button>
          
          <Button
            variant="outline"
            className="h-16 flex flex-col items-center justify-center space-y-1 hover:bg-gray-50"
            onClick={() => navigate('/user-profile')}
          >
            <Icon name="Settings" size={20} className="text-purple-600" />
            <span className="text-sm font-medium">Settings</span>
          </Button>
          
          <Button
            variant="outline"
            className="h-16 flex flex-col items-center justify-center space-y-1 hover:bg-gray-50"
            onClick={() => navigate('/help')}
          >
            <Icon name="HelpCircle" size={20} className="text-orange-600" />
            <span className="text-sm font-medium">Help & FAQ</span>
          </Button>
        </div>
      </div>
      
      {/* Mobile Bottom Navigation */}
      <MobileBottomTab />

      {/* Order Detail Modal */}
      <OrderDetailModal
        isOpen={isOrderDetailModalOpen}
        onClose={handleCloseOrderDetailModal}
        order={selectedOrder}
      />
    </div>
  );
};

export default CustomerDashboard;