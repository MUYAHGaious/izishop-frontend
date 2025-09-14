import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import { showToast } from '../../components/ui/Toast';
import LoadingScreen from '../../components/ui/LoadingScreen';
import Header from '../../components/ui/Header';
import NavigationSection from '../../components/ui/NavigationSection';
import MobileBottomTab from '../../components/ui/MobileBottomTab';
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
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [wishlistCount, setWishlistCount] = useState(0);

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
      setLoading(true);
      console.log('Loading customer dashboard data...');
      
      // Fetch data in parallel for better performance
      const [statsData, ordersData, wishlistData] = await Promise.all([
        api.getCustomerStats(),
        api.getCustomerRecentOrders(5),
        api.getCustomerWishlist({ limit: 1 }) // Just get count
      ]);
      
      console.log('Customer data loaded:', { statsData, ordersData, wishlistData });
      
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

      setStats(mappedStats);
      setRecentOrders(ordersData);
      setWishlistCount(wishlistData.length);
      setLastUpdated(new Date());
      
    } catch (error) {
      console.error('Failed to load customer data:', error);
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
      setLoading(false);
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

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'processing': return 'bg-yellow-100 text-yellow-800';
      case 'shipped': return 'bg-blue-100 text-blue-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <LoadingScreen 
        message="Loading your customer dashboard..."
        variant="default"
        showProgress={false}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Navigation Header */}
      <Header />
      
      {/* Secondary Navigation */}
      <NavigationSection />
      
      {/* Dashboard Header */}
      <div className="bg-gradient-to-r from-teal-50 to-cyan-50 shadow-sm border-b border-teal-200">
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
                    iconName="ShoppingCart"
                    iconPosition="left"
                    onClick={() => navigate('/shopping-cart')}
                    className="relative"
                  >
                    Cart
                    {/* Cart badge could go here */}
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    iconName="Heart"
                    iconPosition="left"
                    onClick={() => navigate('/wishlist')}
                    className="relative"
                  >
                    Wishlist
                    {wishlistCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {wishlistCount}
                      </span>
                    )}
                  </Button>
                  
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
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    iconName="LogOut"
                    iconPosition="left"
                    onClick={logout}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    Logout
                  </Button>
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
          <div className="bg-white rounded-lg p-6 border border-teal-200 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/my-orders')}>
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
          <div className="bg-white rounded-lg p-6 border border-teal-200 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/my-orders?status=active')}>
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
          <div className="bg-white rounded-lg p-6 border border-teal-200 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/my-orders?status=delivered')}>
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
          <div className="bg-white rounded-lg p-6 border border-teal-200 hover:shadow-lg transition-shadow cursor-pointer">
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
          <div className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-lg p-6 border border-teal-200 mb-8">
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
              <div key={order.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="text-lg font-medium text-gray-900">{order.order_number}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">From: {order.shop_name}</p>
                      <p className="text-xs text-gray-400">Tracking: {order.tracking_number}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">{formatCurrency(order.total_amount)}</p>
                    <p className="text-sm text-gray-500">{order.items_count} items • {formatDate(order.order_date)}</p>
                    <p className="text-xs text-gray-400">{order.payment_method}</p>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="text-sm text-gray-600 mb-2">
                    <strong>Items:</strong> {order.items?.map(item => `${item.name} (x${item.quantity})`).join(', ')}
                  </div>
                  <div className="text-sm text-gray-500 mb-3">
                    Delivery to: {order.delivery_address}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    Ordered: {formatDate(order.order_date)}
                    {order.delivery_date && (
                      <span> • Delivered: {formatDate(order.delivery_date)}</span>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      iconName="Eye"
                      iconPosition="left"
                      onClick={() => navigate(`/order-details/${order.id}`)}
                    >
                      View Details
                    </Button>
                    {order.status !== 'Delivered' && order.status !== 'Cancelled' && (
                      <Button
                        size="sm"
                        variant="outline"
                        iconName="MapPin"
                        iconPosition="left"
                        onClick={() => navigate(`/track-order/${order.tracking_number}`)}
                      >
                        Track Order
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
          <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-lg p-6 border border-teal-200 text-center hover:shadow-lg transition-all cursor-pointer" onClick={() => navigate('/product-catalog')}>
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
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-lg p-6 border border-emerald-200 text-center hover:shadow-lg transition-all cursor-pointer" onClick={() => navigate('/wishlist')}>
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
          <div className="bg-gradient-to-br from-cyan-50 to-teal-50 rounded-lg p-6 border border-cyan-200 text-center hover:shadow-lg transition-all cursor-pointer" onClick={() => navigate('/customer-support')}>
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
    </div>
  );
};

export default CustomerDashboard;