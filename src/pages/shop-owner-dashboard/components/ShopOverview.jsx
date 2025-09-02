import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import RatingDisplay from '../../../components/ui/RatingDisplay';
import RatingDistribution from '../../../components/ui/RatingDistribution';
import SmartSearchInput from '../../../components/SmartSearchInput';
import { ROLES, CONTEXTS } from '../../../utils/SearchConfig';
import { useAuth } from '../../../contexts/AuthContext';
import { useShop } from '../../../contexts/ShopContext';
import api from '../../../services/api';

const ShopOverview = ({ shopData, onTabChange }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { selectedShop } = useShop();
  const [todayStats, setTodayStats] = useState({
    orders: 0,
    revenue: 0,
    visitors: 0,
    conversionRate: 0
  });

  const [ratingStats, setRatingStats] = useState({
    average_rating: 0,
    total_reviews: 0,
    rating_distribution: {}
  });

  const [recentRatings, setRecentRatings] = useState([]);
  const [loadingRatings, setLoadingRatings] = useState(true);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [loadingLowStock, setLoadingLowStock] = useState(true);

  const [recentOrders, setRecentOrders] = useState([]);

  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);

  // Search-related state
  const [searchData, setSearchData] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [selectedSearchResult, setSelectedSearchResult] = useState(null);

  // Generate quick actions with real-time data
  const getQuickActions = () => [
    { 
      id: 1, 
      title: 'Add Product', 
      description: 'Add new product to inventory', 
      icon: 'Plus', 
      color: 'bg-blue-500', 
      action: () => navigate('/add-product')
    },
    { 
      id: 2, 
      title: 'Process Orders', 
      description: pendingOrdersCount > 0 ? `${pendingOrdersCount} orders need processing` : 'No pending orders', 
      icon: 'Package', 
      color: pendingOrdersCount > 0 ? 'bg-green-500' : 'bg-gray-400', 
      action: () => onTabChange && onTabChange('orders')
    },
    { 
      id: 3, 
      title: 'Update Inventory', 
      description: lowStockProducts.length > 0 ? `${lowStockProducts.length} products low in stock` : 'Inventory levels good', 
      icon: 'BarChart3', 
      color: lowStockProducts.length > 0 ? 'bg-purple-500' : 'bg-gray-400', 
      action: () => navigate('/my-products')
    },
    { 
      id: 4, 
      title: 'Customer Support', 
      description: unreadMessagesCount > 0 ? `${unreadMessagesCount} messages waiting` : 'No unread messages', 
      icon: 'MessageCircle', 
      color: unreadMessagesCount > 0 ? 'bg-orange-500' : 'bg-gray-400', 
      action: () => navigate('/customer-support')
    }
  ];

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-CM', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat().format(num);
  };

  const getOrderStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-50';
      case 'processing': return 'text-blue-600 bg-blue-50';
      case 'shipped': return 'text-purple-600 bg-purple-50';
      case 'delivered': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStockStatusColor = (stock, minStock) => {
    if (stock === 0) return 'text-red-600 bg-red-50';
    if (stock <= minStock) return 'text-yellow-600 bg-yellow-50';
    return 'text-green-600 bg-green-50';
  };

  // Helper function to check if user is new (no significant data)
  const isNewUser = () => {
    // Check if we have today's stats and shop data
    if (!todayStats || !shopData) return false;
    
    // Consider user as new if:
    // 1. Today's orders and revenue are both 0
    // 2. Total orders in shop are 0 or very low (less than 3)
    // 3. Monthly revenue is 0 or very low
    const hasNoTodayActivity = (todayStats.orders || 0) === 0 && (todayStats.revenue || 0) === 0;
    const hasMinimalHistory = (shopData.totalOrders || 0) < 3 && (shopData.monthlyRevenue || 0) < 10000;
    
    console.log('New user check:', {
      todayOrders: todayStats.orders,
      todayRevenue: todayStats.revenue,
      totalOrders: shopData.totalOrders,
      monthlyRevenue: shopData.monthlyRevenue,
      hasNoTodayActivity,
      hasMinimalHistory,
      isNew: hasNoTodayActivity && hasMinimalHistory
    });
    
    return hasNoTodayActivity && hasMinimalHistory;
  };

  // Prepare comprehensive search data combining all dashboard elements
  const prepareSearchData = () => {
    const combinedData = [];

    // Add products data
    if (lowStockProducts.length > 0) {
      lowStockProducts.forEach(product => {
        combinedData.push({
          id: `product-${product.id}`,
          name: product.name,
          title: product.name,
          description: `Product - ${formatCurrency(product.price)} - Stock: ${product.stock}`,
          category: 'Products',
          type: 'product',
          price: product.price,
          stock: product.stock,
          status: product.stock === 0 ? 'out_of_stock' : product.stock <= 5 ? 'low_stock' : 'active',
          shop_owner_id: user?.id,
          shop_id: selectedShop?.id,
          created_at: product.created_at || new Date().toISOString(),
          searchable_text: `${product.name} product inventory stock ${product.price}`
        });
      });
    }

    // Add orders data
    if (recentOrders.length > 0) {
      recentOrders.forEach(order => {
        combinedData.push({
          id: `order-${order.id}`,
          name: `Order ${order.id || order.order_number}`,
          title: `Order ${order.id || order.order_number}`,
          description: `Order from ${order.customer || order.customer_name} - ${formatCurrency(order.amount || order.total_amount)}`,
          category: 'Orders',
          type: 'order',
          customer_name: order.customer || order.customer_name,
          total: order.amount || order.total_amount,
          status: order.status,
          shop_owner_id: user?.id,
          shop_id: selectedShop?.id,
          created_at: order.created_at || order.time,
          searchable_text: `order ${order.customer || order.customer_name} ${order.status} ${order.amount || order.total_amount}`
        });
      });
    }

    // Add ratings/reviews data
    if (recentRatings.length > 0) {
      recentRatings.forEach(rating => {
        combinedData.push({
          id: `review-${rating.id}`,
          name: `Review by ${rating.user_name || rating.user_first_name}`,
          title: `${rating.rating} Star Review`,
          description: rating.review ? rating.review.substring(0, 100) + '...' : `${rating.rating} star rating`,
          category: 'Reviews',
          type: 'review',
          rating: rating.rating,
          user_name: rating.user_name || rating.user_first_name,
          review: rating.review,
          shop_owner_id: user?.id,
          shop_id: selectedShop?.id,
          created_at: rating.created_at,
          searchable_text: `review rating ${rating.rating} ${rating.user_name || rating.user_first_name} ${rating.review || ''}`
        });
      });
    }

    // Add shop analytics data
    combinedData.push({
      id: 'shop-analytics',
      name: 'Shop Analytics',
      title: 'Shop Performance Analytics',
      description: `Revenue: ${formatCurrency(shopData.monthlyRevenue)} - Orders: ${shopData.totalOrders} - Rating: ${shopData.rating}`,
      category: 'Analytics',
      type: 'analytics',
      monthly_revenue: shopData.monthlyRevenue,
      total_orders: shopData.totalOrders,
      total_products: shopData.totalProducts,
      rating: shopData.rating,
      shop_owner_id: user?.id,
      shop_id: selectedShop?.id,
      created_at: new Date().toISOString(),
      searchable_text: `analytics revenue orders products rating performance stats ${shopData.monthlyRevenue} ${shopData.totalOrders}`
    });

    // Add today's stats
    combinedData.push({
      id: 'today-stats',
      name: "Today's Performance",
      title: "Today's Sales & Orders",
      description: `Today: ${formatNumber(todayStats.orders)} orders, ${formatCurrency(todayStats.revenue)} revenue`,
      category: 'Analytics',
      type: 'daily_stats',
      orders: todayStats.orders,
      revenue: todayStats.revenue,
      visitors: todayStats.visitors,
      conversion_rate: todayStats.conversionRate,
      shop_owner_id: user?.id,
      shop_id: selectedShop?.id,
      created_at: new Date().toISOString(),
      searchable_text: `today daily stats orders revenue visitors conversion ${todayStats.orders} ${todayStats.revenue}`
    });

    return combinedData;
  };

  // Handle search results
  const handleSearchResults = (results) => {
    setSearchResults(results);
  };

  // Handle search result selection
  const handleSearchResultSelect = (result) => {
    setSelectedSearchResult(result);
    
    // Navigate based on result type
    switch (result.type) {
      case 'product':
        navigate('/my-products');
        break;
      case 'order':
        onTabChange && onTabChange('orders');
        break;
      case 'review':
        navigate('/shop-reviews');
        break;
      case 'analytics':
      case 'daily_stats':
        onTabChange && onTabChange('analytics');
        break;
      default:
        console.log('Selected:', result);
    }
  };

  const getTrendIcon = (changeType, isNewAccount = false) => {
    if (isNewAccount) return 'Minus';
    return changeType === 'increase' ? 'TrendingUp' : 'TrendingDown';
  };

  const getTrendColor = (changeType, isNewAccount = false) => {
    if (isNewAccount) return 'text-gray-500';
    return changeType === 'increase' ? 'text-green-500' : 'text-red-500';
  };

  const formatTrendPercentage = (change, isNewAccount = false) => {
    if (isNewAccount) return 'No data yet';
    return `${change >= 0 ? '+' : ''}${change}%`;
  };

  // Safe trend rendering that always checks for new user state
  const renderTrendIndicator = (changeType, changeValue, label = 'vs yesterday') => {
    const isNew = isNewUser();
    
    return (
      <div className="mt-4 flex items-center text-sm">
        <Icon 
          name={getTrendIcon(changeType, isNew)} 
          size={16} 
          className={`mr-1 ${getTrendColor(changeType, isNew)}`} 
        />
        <span className={`font-medium ${getTrendColor(changeType, isNew)}`}>
          {formatTrendPercentage(changeValue, isNew)}
        </span>
        <span className="text-gray-500 ml-1">{label}</span>
      </div>
    );
  };

  // Fetch all dashboard data when component mounts
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!shopData?.name) return;
      
      try {
        // Fetch today's statistics
        setLoadingStats(true);
        try {
          const todayStatsData = await api.getShopOwnerTodayStats();
          setTodayStats(todayStatsData);
        } catch (error) {
          const is404Error = error.status === 404 || error.message?.includes('404') || error.message?.includes('Shop not found') || error.message?.includes('not found');
          if (is404Error) {
            console.log('No today stats found - expected for new shops');
            setTodayStats({ sales: 0, orders: 0, revenue: 0, visitors: 0 });
          } else {
            console.error('Error fetching today stats:', error);
            setTodayStats({ sales: 0, orders: 0, revenue: 0, visitors: 0 });
          }
        }
        
        // Fetch rating statistics
        setLoadingRatings(true);
        try {
          const stats = await api.getMyShopRatingStats();
          setRatingStats(stats);
          
          // Fetch recent ratings (first 5) only if shop has reviews
          if (stats.total_reviews > 0 && !stats.isNewShop) {
            const ratingsResponse = await api.getShopRatings(shopData.id || 'current-shop', {
              page: 1,
              page_size: 5,
              sort_by: 'newest'
            });
            setRecentRatings(ratingsResponse.ratings || []);
          }
        } catch (error) {
          // Handle expected errors gracefully for new shop owners
          const is404Error = error.status === 404 || error.message?.includes('404') || error.message?.includes('Shop not found') || error.message?.includes('not found');
          if (is404Error) {
            console.log('No rating stats found - expected for new shops');
            setRatingStats({
              average_rating: 0,
              total_reviews: 0,
              rating_distribution: {},
              isNewShop: true
            });
            setRecentRatings([]);
          } else {
            console.error('Unexpected error fetching rating stats:', error);
            setRatingStats({
              average_rating: 0,
              total_reviews: 0,
              rating_distribution: {}
            });
          }
        }
        
        // Fetch recent orders
        setLoadingOrders(true);
        try {
          const recentOrdersData = await api.getShopOwnerRecentOrders(4);
          setRecentOrders(recentOrdersData);
        } catch (error) {
          const is404Error = error.status === 404 || error.message?.includes('404') || error.message?.includes('Shop not found') || error.message?.includes('not found');
          if (is404Error) {
            console.log('No recent orders found - expected for new shops');
            setRecentOrders([]);
          } else {
            console.error('Error fetching recent orders:', error);
            setRecentOrders([]);
          }
        }
        
        // Fetch low stock products
        setLoadingLowStock(true);
        try {
          const lowStockData = await api.getShopOwnerLowStockProducts();
          setLowStockProducts(lowStockData);
        } catch (error) {
          const is404Error = error.status === 404 || error.message?.includes('404') || error.message?.includes('Shop not found') || error.message?.includes('not found');
          if (is404Error) {
            console.log('No low stock products found - expected for new shops');
            setLowStockProducts([]);
          } else {
            console.error('Error fetching low stock products:', error);
            setLowStockProducts([]);
          }
        }
        
        // Fetch pending orders count
        try {
          const ordersResponse = await api.getShopOwnerOrders({
            page: 1,
            limit: 100,
            status: 'pending'
          });
          const pendingOrders = ordersResponse.orders || ordersResponse || [];
          setPendingOrdersCount(pendingOrders.length);
        } catch (error) {
          console.warn('Failed to fetch pending orders count:', error);
          setPendingOrdersCount(0);
        }
        
        // Fetch unread messages count (if support system exists)
        try {
          // This would be a real API call to get unread support messages
          // For now, we'll simulate it based on shop activity
          const mockUnreadCount = (shopData.totalOrders > 5 && Math.random() > 0.7) ? Math.floor(Math.random() * 5) : 0;
          setUnreadMessagesCount(mockUnreadCount);
        } catch (error) {
          console.warn('Failed to fetch unread messages count:', error);
          setUnreadMessagesCount(0);
        }
        
      } catch (error) {
        console.warn('Failed to fetch dashboard data:', error);
      } finally {
        setLoadingRatings(false);
        setLoadingStats(false);
        setLoadingOrders(false);
        setLoadingLowStock(false);
      }
    };

    fetchDashboardData();
  }, [shopData?.name, shopData?.id]);

  // Update search data whenever dashboard data changes
  useEffect(() => {
    const newSearchData = prepareSearchData();
    setSearchData(newSearchData);
  }, [
    lowStockProducts, 
    recentOrders, 
    recentRatings, 
    shopData, 
    todayStats,
    user?.id,
    selectedShop?.id
  ]);

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">Welcome back, {shopData.owner}!</h2>
        <p className="text-blue-100">Here's how your shop is performing today.</p>
        <div className="mt-4 grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold">{formatNumber(shopData.totalProducts)}</p>
            <p className="text-sm text-blue-100">Products</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">{formatNumber(shopData.totalOrders)}</p>
            <p className="text-sm text-blue-100">Total Orders</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">{shopData.rating}</p>
            <p className="text-sm text-blue-100">Rating ({shopData.totalReviews || 0} reviews)</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">{formatCurrency(shopData.monthlyRevenue)}</p>
            <p className="text-sm text-blue-100">Monthly Revenue</p>
          </div>
        </div>
      </div>

      {/* Smart Search Section */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Quick Search</h3>
            <p className="text-sm text-gray-600">Search across your products, orders, reviews, and analytics</p>
          </div>
          {searchResults.length > 0 && (
            <div className="text-sm text-gray-500">
              {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} found
            </div>
          )}
        </div>
        
        <div className="max-w-2xl">
          <SmartSearchInput
            data={searchData}
            context={CONTEXTS.SHOP_OVERVIEW}
            userRole={ROLES.SHOP_OWNER}
            userId={user?.id}
            userDepartment={null}
            shopId={selectedShop?.id}
            onResults={handleSearchResults}
            onSelect={handleSearchResultSelect}
            showAnalytics={true}
            enableVoiceSearch={true}
            className="w-full"
          />
        </div>

        {/* Search Results Preview */}
        {searchResults.length > 0 && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {searchResults.slice(0, 6).map((result) => (
              <div
                key={result.id}
                onClick={() => handleSearchResultSelect(result)}
                className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all cursor-pointer group"
              >
                <div className="flex items-start space-x-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    result.type === 'product' ? 'bg-blue-100' :
                    result.type === 'order' ? 'bg-green-100' :
                    result.type === 'review' ? 'bg-purple-100' :
                    'bg-orange-100'
                  }`}>
                    <Icon 
                      name={
                        result.type === 'product' ? 'Package' :
                        result.type === 'order' ? 'ShoppingBag' :
                        result.type === 'review' ? 'Star' :
                        'BarChart3'
                      } 
                      size={20} 
                      className={
                        result.type === 'product' ? 'text-blue-600' :
                        result.type === 'order' ? 'text-green-600' :
                        result.type === 'review' ? 'text-purple-600' :
                        'text-orange-600'
                      }
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                      {result.title}
                    </h4>
                    <p className="text-sm text-gray-500 line-clamp-2">
                      {result.description}
                    </p>
                    <div className="mt-2 flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        result.type === 'product' ? 'bg-blue-100 text-blue-800' :
                        result.type === 'order' ? 'bg-green-100 text-green-800' :
                        result.type === 'review' ? 'bg-purple-100 text-purple-800' :
                        'bg-orange-100 text-orange-800'
                      }`}>
                        {result.category}
                      </span>
                      {result._score && (
                        <span className="text-xs text-gray-400">
                          Score: {result._score.toFixed(0)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {selectedSearchResult && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center space-x-2 text-sm text-blue-700">
              <Icon name="Info" size={16} />
              <span>Last selected: {selectedSearchResult.title}</span>
            </div>
          </div>
        )}
      </div>

      {/* Today's Performance */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Today's Orders</p>
              {loadingStats ? (
                <div className="w-16 h-8 bg-gray-200 rounded animate-pulse"></div>
              ) : (
                <p className="text-2xl font-bold text-gray-900">{formatNumber(todayStats.orders)}</p>
              )}
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Icon name="ShoppingBag" size={24} className="text-blue-600" />
            </div>
          </div>
          {renderTrendIndicator(todayStats.orders_change_type, todayStats.orders_change, 'vs yesterday')}
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Today's Revenue</p>
              {loadingStats ? (
                <div className="w-20 h-8 bg-gray-200 rounded animate-pulse"></div>
              ) : (
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(todayStats.revenue)}</p>
              )}
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Icon name="Banknote" size={24} className="text-green-600" />
            </div>
          </div>
          {renderTrendIndicator(todayStats.sales_change_type, todayStats.sales_change, 'vs yesterday')}
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Shop Visitors</p>
              {loadingStats ? (
                <div className="w-16 h-8 bg-gray-200 rounded animate-pulse"></div>
              ) : (
                <p className="text-2xl font-bold text-gray-900">{formatNumber(todayStats.visitors)}</p>
              )}
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Icon name="Eye" size={24} className="text-purple-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <Icon name="TrendingUp" size={16} className="text-gray-400 mr-1" />
            <span className="text-gray-400 font-medium">--</span>
            <span className="text-gray-500 ml-1">analytics needed</span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Conversion Rate</p>
              {loadingStats ? (
                <div className="w-14 h-8 bg-gray-200 rounded animate-pulse"></div>
              ) : (
                <p className="text-2xl font-bold text-gray-900">{todayStats.conversionRate}%</p>
              )}
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Icon name="Target" size={24} className="text-orange-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <Icon name="TrendingUp" size={16} className="text-gray-400 mr-1" />
            <span className="text-gray-400 font-medium">--</span>
            <span className="text-gray-500 ml-1">analytics needed</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {getQuickActions().map((action) => (
            <button
              key={action.id}
              onClick={action.action}
              className="p-4 rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all text-left group cursor-pointer"
            >
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 ${action.color} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <Icon name={action.icon} size={20} className="text-white" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{action.title}</p>
                  <p className="text-sm text-gray-500">{action.description}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Orders & Ratings Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              View All
            </button>
          </div>
          <div className="space-y-4">
            {loadingOrders ? (
              Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
                    <div>
                      <div className="w-20 h-4 bg-gray-200 rounded animate-pulse mb-1"></div>
                      <div className="w-16 h-3 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="w-24 h-4 bg-gray-200 rounded animate-pulse mb-1"></div>
                    <div className="w-16 h-3 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                </div>
              ))
            ) : recentOrders.length > 0 ? (
              recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Icon name="ShoppingBag" size={16} className="text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{order.id || order.order_number}</p>
                      <p className="text-sm text-gray-500">{order.customer || order.customer_name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">{formatCurrency(order.amount || order.total_amount)}</p>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getOrderStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                      <span className="text-xs text-gray-500">{order.time || order.created_at}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Icon name="ShoppingBag" size={32} className="text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">No recent orders</p>
              </div>
            )}
          </div>
        </div>

        {/* Ratings Overview */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Customer Reviews</h3>
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              View All
            </button>
          </div>
          
          {loadingRatings ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : ratingStats.total_reviews > 0 ? (
            <div className="space-y-4">
              {/* Rating Summary */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-2xl font-bold text-gray-900">
                      {parseFloat(ratingStats.average_rating || 0).toFixed(1)}
                    </span>
                    <RatingDisplay 
                      rating={parseFloat(ratingStats.average_rating || 0)} 
                      totalReviews={ratingStats.total_reviews}
                      size="small"
                      showNumber={false}
                    />
                  </div>
                  <p className="text-sm text-gray-500">
                    {ratingStats.total_reviews} customer review{ratingStats.total_reviews !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>

              {/* Recent Reviews */}
              {recentRatings.slice(0, 3).map((rating) => (
                <div key={rating.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                    <Icon name="User" size={14} className="text-gray-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {rating.user_name || rating.user_first_name}
                      </p>
                      <RatingDisplay 
                        rating={rating.rating} 
                        size="small"
                        showNumber={false}
                        showTotal={false}
                      />
                    </div>
                    {rating.review && (
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {rating.review}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(rating.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Icon name="Star" size={32} className="text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500 text-sm mb-1">No reviews yet</p>
              <p className="text-gray-400 text-xs">Encourage customers to leave reviews</p>
            </div>
          )}
        </div>

        {/* Low Stock Alert */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Low Stock Alert</h3>
            <button className="text-sm text-orange-600 hover:text-orange-700 font-medium">
              Manage Inventory
            </button>
          </div>
          <div className="space-y-4">
            {loadingLowStock ? (
              Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
                    <div>
                      <div className="w-24 h-4 bg-gray-200 rounded animate-pulse mb-1"></div>
                      <div className="w-20 h-3 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="w-16 h-6 bg-gray-200 rounded-full animate-pulse mb-1"></div>
                    <div className="w-12 h-3 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                </div>
              ))
            ) : lowStockProducts.length > 0 ? (
              lowStockProducts.map((product) => (
                <div key={product.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                      <Icon name="Package" size={16} className="text-gray-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{product.name}</p>
                      <p className="text-sm text-gray-500">{formatCurrency(product.price)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStockStatusColor(product.stock, product.minStock || product.min_stock)}`}>
                      {product.stock === 0 ? 'Out of Stock' : `${product.stock} left`}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">Min: {product.minStock || product.min_stock}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Icon name="Package" size={32} className="text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">All products in stock</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Rating Distribution Section */}
      {ratingStats.total_reviews > 0 && (
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Customer Feedback Analysis</h3>
            <div className="flex items-center space-x-2">
              <RatingDisplay 
                rating={parseFloat(ratingStats.average_rating || 0)} 
                totalReviews={ratingStats.total_reviews}
                size="medium"
                className="text-gray-600"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <RatingDistribution 
                distribution={ratingStats.rating_distribution || {}}
                totalReviews={ratingStats.total_reviews}
              />
            </div>
            
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-gray-700">Recent Customer Feedback</h4>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {recentRatings.map((rating) => (
                  <div key={rating.id} className="p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-900">
                          {rating.user_name || rating.user_first_name}
                        </span>
                        {rating.is_verified_purchase && (
                          <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                            Verified Purchase
                          </span>
                        )}
                      </div>
                      <RatingDisplay 
                        rating={rating.rating} 
                        size="small"
                        showNumber={false}
                        showTotal={false}
                      />
                    </div>
                    {rating.review && (
                      <p className="text-sm text-gray-600 mb-2">
                        {rating.review}
                      </p>
                    )}
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{new Date(rating.created_at).toLocaleDateString()}</span>
                      {rating.helpful_count > 0 && (
                        <span>{rating.helpful_count} found helpful</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Performance Chart Placeholder */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Sales Performance (Last 7 Days)</h3>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span>Daily Sales</span>
          </div>
        </div>
        <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
          <div className="text-center">
            <Icon name="BarChart3" size={48} className="text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500">Sales chart will be displayed here</p>
            <p className="text-sm text-gray-400">Connect analytics to view detailed performance</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopOverview;

