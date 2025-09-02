import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import api from '../../../services/api';
import { showToast } from '../../../components/ui/Toast';

const AnalyticsCards = ({ timeRange = '7d' }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [todayStats, setTodayStats] = useState(null);
  const [analyticsData, setAnalyticsData] = useState({
    revenue: { current: 0, previous: 0, change: 0 },
    orders: { current: 0, previous: 0, change: 0, average_value: 0 },
    customers: { current: 0, previous: 0, change: 0, new: 0, returning: 0, retention_rate: 0, lifetime_value: 0 },
    conversionRate: { current: 0, previous: 0, change: 0 }
  });

  // Load analytics data
  useEffect(() => {
    const loadAnalyticsData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Load both today stats and period analytics in parallel
        const [todayData, periodData] = await Promise.all([
          api.getShopOwnerTodayStats(),
          api.getShopOwnerAnalytics(timeRange)
        ]);

        console.log('=== ANALYTICS DATA DEBUG ===');
        console.log('Today stats:', todayData);
        console.log('Period analytics:', periodData);
        console.log('Revenue data:', periodData?.revenue);
        console.log('Orders data:', periodData?.orders);
        console.log('Customers data:', periodData?.customers);
        console.log('Full analytics object:', periodData);
        console.log('=== END DEBUG ===');
        
        setTodayStats(todayData);
        setAnalyticsData(periodData);
        
      } catch (error) {
        // Handle expected errors gracefully for new shop owners
        const is404Error = error.status === 404 || error.message?.includes('404') || error.message?.includes('Shop not found') || error.message?.includes('not found');
        if (is404Error) {
          console.log('No analytics data found - expected for new shops');
          setTodayStats({ revenue: 0, orders: 0, customers: 0, products: 0 });
          setAnalyticsData({
            revenue: { current: 0, previous: 0, change: 0 },
            orders: { current: 0, previous: 0, change: 0 },
            customers: { current: 0, previous: 0, change: 0 }
          });
        } else {
          console.error('Error loading analytics data:', error);
          setError(error.message || 'Failed to load analytics data');
          showToast({
            type: 'error',
            message: 'Failed to load analytics data. Please try again.',
            duration: 3000
          });
        }
      } finally {
        setLoading(false);
      }
    };

    loadAnalyticsData();
  }, [timeRange]);

  // Manual refresh function for debugging
  const handleManualRefresh = async () => {
    console.log('Manual refresh triggered');
    try {
      const periodData = await api.getShopOwnerAnalytics(timeRange);
      console.log('Manual refresh - Analytics data:', periodData);
      setAnalyticsData(periodData);
    } catch (error) {
      console.error('Manual refresh error:', error);
    }
  };

  const formatCurrency = (amount) => {
    if (!amount || amount === 0) return 'XAF 0';
    
    const absAmount = Math.abs(amount);
    let formattedAmount;
    let suffix = '';
    
    if (absAmount >= 1000000000) {
      formattedAmount = (amount / 1000000000).toFixed(1);
      suffix = 'B';
    } else if (absAmount >= 1000000) {
      formattedAmount = (amount / 1000000).toFixed(1);
      suffix = 'M';
    } else if (absAmount >= 1000) {
      formattedAmount = (amount / 1000).toFixed(1);
      suffix = 'K';
    } else {
      formattedAmount = amount.toString();
    }
    
    // Remove unnecessary decimal places
    if (formattedAmount.endsWith('.0')) {
      formattedAmount = formattedAmount.slice(0, -2);
    }
    
    return `XAF ${formattedAmount}${suffix}`;
  };

  const formatNumber = (num) => {
    if (!num || num === 0) return '0';
    
    const absNum = Math.abs(num);
    let formattedNum;
    let suffix = '';
    
    if (absNum >= 1000000000) {
      formattedNum = (num / 1000000000).toFixed(1);
      suffix = 'B';
    } else if (absNum >= 1000000) {
      formattedNum = (num / 1000000).toFixed(1);
      suffix = 'M';
    } else if (absNum >= 1000) {
      formattedNum = (num / 1000).toFixed(1);
      suffix = 'K';
    } else {
      formattedNum = num.toString();
    }
    
    // Remove unnecessary decimal places
    if (formattedNum.endsWith('.0')) {
      formattedNum = formattedNum.slice(0, -2);
    }
    
    return `${formattedNum}${suffix}`;
  };


  // Helper function to check if user is new (no data)
  const isNewUser = () => {
    return analyticsData && 
           analyticsData.revenue?.current === 0 && 
           analyticsData.orders?.current === 0 && 
           analyticsData.customers?.current === 0;
  };

  const getChangeColor = (change) => {
    // For new users, don't show trends
    if (isNewUser()) return 'text-gray-600';
    return change > 0 ? 'text-green-600' : change < 0 ? 'text-red-600' : 'text-gray-600';
  };

  const getChangeIcon = (change) => {
    // For new users, show neutral icon
    if (isNewUser()) return 'Minus';
    return change > 0 ? 'TrendingUp' : change < 0 ? 'TrendingDown' : 'Minus';
  };

  const getChangeBackground = (change) => {
    // For new users, show neutral background
    if (isNewUser()) return 'bg-gray-50';
    return change > 0 ? 'bg-green-50' : change < 0 ? 'bg-red-50' : 'bg-gray-50';
  };

  const formatPercentage = (num) => {
    // For new users, don't show percentage changes
    if (isNewUser()) return 'No data yet';
    return `${num > 0 ? '+' : ''}${num.toFixed(1)}%`;
  };

  // Loading state
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, index) => (
          <div key={index} className="bg-white rounded-xl p-6 border border-gray-200 animate-pulse">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-20"></div>
                <div className="h-8 bg-gray-200 rounded w-24"></div>
              </div>
              <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
            </div>
            <div className="mt-4 flex items-center space-x-2">
              <div className="h-4 bg-gray-200 rounded w-16"></div>
              <div className="h-4 bg-gray-200 rounded w-20"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6">
        <div className="flex items-center space-x-2">
          <Icon name="AlertTriangle" size={20} className="text-red-500" />
          <h3 className="text-lg font-semibold text-red-800">Failed to Load Analytics</h3>
        </div>
        <p className="text-red-600 mt-2">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Message for New Users - Moved to Top */}
      {analyticsData && 
       analyticsData.revenue?.current === 0 && 
       analyticsData.orders?.current === 0 && 
       analyticsData.customers?.current === 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 text-center">
          <Icon name="TrendingUp" size={48} className="text-blue-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Welcome to Your Analytics Dashboard!</h3>
          <p className="text-gray-600 mb-4">
            Start selling to see your revenue, orders, and customer data here. 
            Your analytics will appear once you receive your first orders.
          </p>
          <div className="flex items-center justify-center space-x-4 text-sm text-blue-600">
            <span>• Add products to your shop</span>
            <span>• Share your shop link</span>
            <span>• Start making sales</span>
          </div>
        </div>
      )}

      {/* Debug Button - Remove in production */}
      <div className="flex justify-end">
        <button 
          onClick={handleManualRefresh}
          className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
        >
          Debug Refresh
        </button>
      </div>
      
      {/* Today's Stats - Quick Overview */}
      {todayStats && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Icon name="Calendar" size={20} className="mr-2 text-blue-600" />
            Today's Performance
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{formatCurrency(todayStats.today_sales)}</p>
              <p className="text-sm text-gray-600">Today's Sales</p>
              <div className="flex items-center justify-center mt-1">
                <Icon 
                  name={getChangeIcon(todayStats.sales_change)} 
                  size={12} 
                  className={`mr-1 ${getChangeColor(todayStats.sales_change)}`} 
                />
                <span className={`text-xs ${getChangeColor(todayStats.sales_change)}`}>
                  {formatPercentage(todayStats.sales_change)}
                </span>
              </div>
            </div>
            
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{formatNumber(todayStats.today_orders)}</p>
              <p className="text-sm text-gray-600">Today's Orders</p>
              <div className="flex items-center justify-center mt-1">
                <Icon 
                  name={getChangeIcon(todayStats.orders_change)} 
                  size={12} 
                  className={`mr-1 ${getChangeColor(todayStats.orders_change)}`} 
                />
                <span className={`text-xs ${getChangeColor(todayStats.orders_change)}`}>
                  {formatPercentage(todayStats.orders_change)}
                </span>
              </div>
            </div>
            
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">{formatNumber(todayStats.active_products)}</p>
              <p className="text-sm text-gray-600">Active Products</p>
              <p className="text-xs text-gray-500 mt-1">of {todayStats.total_products} total</p>
            </div>
            
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">{formatNumber(todayStats.low_stock_products)}</p>
              <p className="text-sm text-gray-600">Low Stock</p>
              <p className="text-xs text-orange-500 mt-1">Need attention</p>
            </div>
          </div>
        </div>
      )}

      {/* Period Analytics - Main Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Revenue Card */}
        <div className="bg-white rounded-xl p-4 border border-gray-200 hover:shadow-lg transition-shadow overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-600 mb-1">Revenue</p>
              <p className="text-lg font-bold text-gray-900 truncate">{formatCurrency(analyticsData.revenue?.current || 0)}</p>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0 ml-2">
              <Icon name="Receipt" size={20} className="text-green-600" />
            </div>
          </div>
          <div className={`flex items-center text-xs p-2 rounded-lg ${getChangeBackground(analyticsData.revenue?.change || 0)}`}>
            <Icon 
              name={getChangeIcon(analyticsData.revenue?.change || 0)} 
              size={12} 
              className={`mr-1 ${getChangeColor(analyticsData.revenue?.change || 0)}`} 
            />
            <span className={`font-medium ${getChangeColor(analyticsData.revenue?.change || 0)}`}>
              {formatPercentage(analyticsData.revenue?.change || 0)}
            </span>
            <span className="text-gray-500 ml-1 truncate">vs previous</span>
          </div>
        </div>

        {/* Orders Card */}
        <div className="bg-white rounded-xl p-4 border border-gray-200 hover:shadow-lg transition-shadow overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-600 mb-1">Orders</p>
              <p className="text-lg font-bold text-gray-900">{formatNumber(analyticsData.orders?.current || 0)}</p>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 ml-2">
              <Icon name="ShoppingBag" size={20} className="text-blue-600" />
            </div>
          </div>
          <div className={`flex items-center text-xs p-2 rounded-lg ${getChangeBackground(analyticsData.orders?.change || 0)}`}>
            <Icon 
              name={getChangeIcon(analyticsData.orders?.change || 0)} 
              size={12} 
              className={`mr-1 ${getChangeColor(analyticsData.orders?.change || 0)}`} 
            />
            <span className={`font-medium ${getChangeColor(analyticsData.orders?.change || 0)}`}>
              {formatPercentage(analyticsData.orders?.change || 0)}
            </span>
            <span className="text-gray-500 ml-1 truncate">vs previous</span>
          </div>
          <div className="mt-1 text-xs text-gray-500 truncate">
            Avg: {formatCurrency(analyticsData.orders?.average_value || 0)}
          </div>
        </div>

        {/* Customers Card */}
        <div className="bg-white rounded-xl p-4 border border-gray-200 hover:shadow-lg transition-shadow overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-600 mb-1">Customers</p>
              <p className="text-lg font-bold text-gray-900">{formatNumber(analyticsData.customers?.current || 0)}</p>
            </div>
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0 ml-2">
              <Icon name="Users" size={20} className="text-purple-600" />
            </div>
          </div>
          <div className={`flex items-center text-xs p-2 rounded-lg ${getChangeBackground(analyticsData.customers?.change || 0)}`}>
            <Icon 
              name={getChangeIcon(analyticsData.customers?.change || 0)} 
              size={12} 
              className={`mr-1 ${getChangeColor(analyticsData.customers?.change || 0)}`} 
            />
            <span className={`font-medium ${getChangeColor(analyticsData.customers?.change || 0)}`}>
              {formatPercentage(analyticsData.customers?.change || 0)}
            </span>
            <span className="text-gray-500 ml-1 truncate">vs previous</span>
          </div>
          <div className="mt-1 text-xs text-gray-500 flex justify-between">
            <span className="truncate">New: {analyticsData.customers?.new || 0}</span>
            <span className="truncate">Return: {analyticsData.customers?.returning || 0}</span>
          </div>
        </div>

        {/* Customer Lifetime Value Card */}
        <div className="bg-white rounded-xl p-4 border border-gray-200 hover:shadow-lg transition-shadow overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-600 mb-1">Customer LTV</p>
              <p className="text-lg font-bold text-gray-900 truncate">{formatCurrency(analyticsData.customers?.lifetime_value || 0)}</p>
            </div>
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0 ml-2">
              <Icon name="Target" size={20} className="text-orange-600" />
            </div>
          </div>
          <div className="flex items-center text-xs p-2 bg-gray-50 rounded-lg">
            <Icon name="Info" size={12} className="mr-1 text-blue-500" />
            <span className="text-gray-500 truncate">Retention: {analyticsData.customers?.retention_rate || 0}%</span>
          </div>
          <div className="mt-1 text-xs text-gray-500 truncate">
            Avg customer lifetime value
          </div>
        </div>
      </div>

      {/* Monthly Overview */}
      {todayStats && (
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Icon name="BarChart3" size={20} className="mr-2 text-gray-600" />
            Monthly Overview
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">This Month Sales</p>
                  <p className="text-xl font-bold text-green-600">{formatCurrency(todayStats.this_month_sales)}</p>
                </div>
                <div className="flex items-center text-sm">
                  <Icon 
                    name={getChangeIcon(todayStats.monthly_sales_change)} 
                    size={16} 
                    className={`mr-1 ${getChangeColor(todayStats.monthly_sales_change)}`} 
                  />
                  <span className={getChangeColor(todayStats.monthly_sales_change)}>
                    {formatPercentage(todayStats.monthly_sales_change)}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">This Month Orders</p>
                  <p className="text-xl font-bold text-blue-600">{formatNumber(todayStats.this_month_orders)}</p>
                </div>
                <div className="flex items-center text-sm">
                  <Icon 
                    name={getChangeIcon(todayStats.monthly_orders_change)} 
                    size={16} 
                    className={`mr-1 ${getChangeColor(todayStats.monthly_orders_change)}`} 
                  />
                  <span className={getChangeColor(todayStats.monthly_orders_change)}>
                    {formatPercentage(todayStats.monthly_orders_change)}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Last Month Sales</p>
                <p className="text-xl font-bold text-gray-700">{formatCurrency(todayStats.last_month_sales)}</p>
              </div>
              
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Last Month Orders</p>
                <p className="text-xl font-bold text-gray-700">{formatNumber(todayStats.last_month_orders)}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsCards;