import React, { useState, useEffect, useRef, useCallback } from 'react';
import Icon from '../../../components/AppIcon';
import api from '../../../services/api';
import RevenueByCategoryCard from '../../../components/charts/RevenueByCategoryCard';
import TopPerformingShopsCard from '../../../components/charts/TopPerformingShopsCard';
import RealTimeChart from '../../../components/charts/RealTimeChart';
import ChartFilters from '../../../components/charts/ChartFilters';
import AdditionalMetricsCards from '../../../components/charts/AdditionalMetricsCards';

const Analytics = () => {
  const [timeRange, setTimeRange] = useState('30d');
  const [filters, setFilters] = useState({
    timeRange: '30d',
    metricType: 'revenue',
    granularity: 'auto',
    shopId: null,
    categoryId: null,
    region: null
  });
  
  const [analyticsData, setAnalyticsData] = useState({
    revenue: {
      current: 0,
      previous: 0,
      growth: 0
    },
    orders: {
      current: 0,
      previous: 0,
      growth: 0
    },
    users: {
      current: 0,
      previous: 0,
      growth: 0
    },
    shops: {
      current: 0,
      previous: 0,
      growth: 0
    }
  });

  const [chartData, setChartData] = useState({
    revenue: [],
    orders: []
  });
  
  const [topShops, setTopShops] = useState([]);
  const [topCategories, setTopCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [realTimeEnabled, setRealTimeEnabled] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const intervalRef = useRef(null);

  useEffect(() => {
    fetchAnalyticsData();
  }, [filters.timeRange]);

  // Real-time data updates
  useEffect(() => {
    if (realTimeEnabled) {
      intervalRef.current = setInterval(() => {
        fetchAnalyticsData(true); // Silent update
      }, 30000); // Update every 30 seconds

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [realTimeEnabled, filters.timeRange]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Handle filter changes
  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
    setTimeRange(newFilters.timeRange);
  };

  // Refresh data manually
  const refreshData = async () => {
    setRefreshing(true);
    await fetchAnalyticsData();
    setRefreshing(false);
  };

  const fetchAnalyticsData = async (silent = false) => {
    try {
      if (!silent) {
        setLoading(true);
      }
      setError(null);
      
      // Fetch analytics data with time range
      const analyticsResponse = await api.getDashboardAnalytics(timeRange);
      
      // Check if we're getting valid data structure
      if (!analyticsResponse) {
        setAnalyticsData({
          revenue: { current: 0, previous: 0, growth: 0 },
          orders: { current: 0, previous: 0, growth: 0 },
          users: { current: 0, previous: 0, growth: 0 },
          shops: { current: 0, previous: 0, growth: 0 }
        });
        
        setChartData({ revenue: [], orders: [] });
        setTopShops([]);
        setTopCategories([]);
        setError('No analytics data available');
        return;
      }
      
      // Update analytics data with real data
      setAnalyticsData({
        revenue: {
          current: analyticsResponse.key_metrics?.revenue?.current || 0,
          previous: analyticsResponse.key_metrics?.revenue?.previous || 0,
          growth: analyticsResponse.key_metrics?.revenue?.growth || 0
        },
        orders: {
          current: analyticsResponse.key_metrics?.orders?.current || 0,
          previous: analyticsResponse.key_metrics?.orders?.previous || 0,
          growth: analyticsResponse.key_metrics?.orders?.growth || 0
        },
        users: {
          current: analyticsResponse.key_metrics?.users?.current || 0,
          previous: analyticsResponse.key_metrics?.users?.previous || 0,
          growth: analyticsResponse.key_metrics?.users?.growth || 0
        },
        shops: {
          current: analyticsResponse.key_metrics?.shops?.current || 0,
          previous: analyticsResponse.key_metrics?.shops?.previous || 0,
          growth: analyticsResponse.key_metrics?.shops?.growth || 0
        }
      });

      // Set chart data from analytics response
      const dailyData = analyticsResponse.daily_data || [];
      setChartData({
        revenue: dailyData.map(day => ({ date: day.date, value: day.revenue })),
        orders: dailyData.map(day => ({ date: day.date, value: day.orders }))
      });
      
      // Set top performers data
      const topShopsData = analyticsResponse.top_performers?.shops || [];
      const topCategoriesData = analyticsResponse.top_performers?.categories || [];
      
      setTopShops(topShopsData);
      setTopCategories(topCategoriesData);
      
      // Update last updated timestamp
      setLastUpdated(new Date());
      
    } catch (err) {
      console.error('Analytics API error:', err);
      setError(`API Error: ${err.message || 'Failed to fetch analytics data'}`);
      
      // Set empty state when API fails
      setAnalyticsData({
        revenue: { current: 0, previous: 0, growth: 0 },
        orders: { current: 0, previous: 0, growth: 0 },
        users: { current: 0, previous: 0, growth: 0 },
        shops: { current: 0, previous: 0, growth: 0 }
      });
      setChartData({ revenue: [], orders: [] });
      setTopShops([]);
      setTopCategories([]);
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  };


  const timeRanges = [
    { value: '7d', label: 'Last 7 days' },
    { value: '30d', label: 'Last 30 days' },
    { value: '90d', label: 'Last 3 months' },
    { value: '1y', label: 'Last year' }
  ];

  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return 'XAF 0';
    return new Intl.NumberFormat('fr-CM', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatNumber = (num) => {
    if (num === null || num === undefined) return '0';
    return new Intl.NumberFormat().format(num);
  };

  const formatPercentage = (num) => {
    if (num === 0 || num === null || num === undefined) return '-';
    return `${num > 0 ? '+' : ''}${num.toFixed(1)}%`;
  };

  const formatTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - date) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return 'Over a day ago';
  };

  const toggleRealTime = () => {
    setRealTimeEnabled(!realTimeEnabled);
  };

  // Simple line chart component
  const LineChart = ({ data, color = '#3B82F6' }) => {
    const maxValue = Math.max(...data.map(d => d.value));
    const minValue = Math.min(...data.map(d => d.value));
    const range = maxValue - minValue;

    return (
      <div className="h-64 w-full relative">
        <svg className="w-full h-full" viewBox="0 0 400 200">
          <defs>
            <linearGradient id={`gradient-${color.replace('#', '')}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={color} stopOpacity="0.3" />
              <stop offset="100%" stopColor={color} stopOpacity="0.05" />
            </linearGradient>
          </defs>
          
          {/* Grid lines */}
          {[0, 1, 2, 3, 4].map(i => (
            <line
              key={i}
              x1="0"
              y1={i * 40}
              x2="400"
              y2={i * 40}
              stroke="#E5E7EB"
              strokeWidth="1"
            />
          ))}
          
          {/* Data line */}
          <polyline
            fill="none"
            stroke={color}
            strokeWidth="2"
            points={data.map((point, index) => {
              const x = (index / (data.length - 1)) * 400;
              const y = 180 - ((point.value - minValue) / range) * 160;
              return `${x},${y}`;
            }).join(' ')}
          />
          
          {/* Fill area */}
          <polygon
            fill={`url(#gradient-${color.replace('#', '')})`}
            points={`0,180 ${data.map((point, index) => {
              const x = (index / (data.length - 1)) * 400;
              const y = 180 - ((point.value - minValue) / range) * 160;
              return `${x},${y}`;
            }).join(' ')} 400,180`}
          />
          
          {/* Data points */}
          {data.map((point, index) => {
            const x = (index / (data.length - 1)) * 400;
            const y = 180 - ((point.value - minValue) / range) * 160;
            return (
              <circle
                key={index}
                cx={x}
                cy={y}
                r="3"
                fill={color}
                className="hover:r-5 transition-all"
              />
            );
          })}
        </svg>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-4 lg:p-6 space-y-8">
        {/* API Status Warning - Only show for actual API connection errors */}
        {error && error.includes('API Error') && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
            <div className="flex">
              <Icon name="AlertTriangle" className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <p className="text-sm text-red-700">
                  <strong>Backend API Error:</strong> There was an error connecting to the analytics API. 
                  Please check that the backend server is running at <code>localhost:8000</code>.
                </p>
                <p className="text-xs text-red-600 mt-1">
                  Error: {error}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* No Data Info - Show when API works but no data available */}
        {error && error.includes('No analytics data') && (
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
            <div className="flex">
              <Icon name="Info" className="h-5 w-5 text-blue-400" />
              <div className="ml-3">
                <p className="text-sm text-blue-700">
                  <strong>No Data Available:</strong> Your analytics dashboard is ready, but there's no transaction data yet. 
                  Start adding shops, products, and orders to see analytics here.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h2>
              <div className="flex items-center space-x-4 mt-2">
                <p className="text-gray-600">Track platform performance and growth metrics</p>
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${realTimeEnabled ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`}></div>
                  <span className="text-xs text-gray-500">
                    {realTimeEnabled ? 'Live' : 'Paused'} • Updated {formatTimeAgo(lastUpdated)}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button 
                onClick={toggleRealTime}
                className={`px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 ${
                  realTimeEnabled 
                    ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Icon name={realTimeEnabled ? "Pause" : "Play"} size={16} />
                <span>{realTimeEnabled ? 'Pause' : 'Resume'} Live</span>
              </button>
              <button 
                onClick={refreshData}
                disabled={refreshing}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-2 disabled:opacity-50"
              >
                <Icon name={refreshing ? "Loader" : "RefreshCw"} size={16} className={refreshing ? "animate-spin" : ""} />
                <span>Refresh</span>
              </button>
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                {timeRanges.map(range => (
                  <option key={range.value} value={range.value}>{range.label}</option>
                ))}
              </select>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
                <Icon name="Download" size={16} />
                <span>Export</span>
              </button>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-gray-900">Key Performance Metrics</h3>
            <div className="flex items-center space-x-2">
              {realTimeEnabled && (
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-xs text-green-600 font-medium">Live Updates</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Icon name="DollarSign" size={24} className="text-green-600" />
                </div>
                {realTimeEnabled && (
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                )}
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-3xl font-bold text-gray-900 font-mono">
                  {formatCurrency(analyticsData.revenue.current)}
                </p>
                <div className="flex items-center text-sm">
                  <Icon 
                    name={analyticsData.revenue.growth >= 0 ? "TrendingUp" : "TrendingDown"} 
                    size={16} 
                    className={analyticsData.revenue.growth >= 0 ? "text-green-500 mr-1" : "text-red-500 mr-1"} 
                  />
                  <span className={`font-medium ${analyticsData.revenue.growth >= 0 ? "text-green-500" : "text-red-500"}`}>
                    {formatPercentage(analyticsData.revenue.growth)}
                  </span>
                  <span className="text-gray-500 ml-1">vs previous period</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Icon name="ShoppingBag" size={24} className="text-blue-600" />
                </div>
                {realTimeEnabled && (
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                )}
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-3xl font-bold text-gray-900 font-mono">
                  {formatNumber(analyticsData.orders.current)}
                </p>
                <div className="flex items-center text-sm">
                  <Icon 
                    name={analyticsData.orders.growth >= 0 ? "TrendingUp" : "TrendingDown"} 
                    size={16} 
                    className={analyticsData.orders.growth >= 0 ? "text-green-500 mr-1" : "text-red-500 mr-1"} 
                  />
                  <span className={`font-medium ${analyticsData.orders.growth >= 0 ? "text-green-500" : "text-red-500"}`}>
                    {formatPercentage(analyticsData.orders.growth)}
                  </span>
                  <span className="text-gray-500 ml-1">vs previous period</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Icon name="Users" size={24} className="text-purple-600" />
                </div>
                {realTimeEnabled && (
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                )}
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-3xl font-bold text-gray-900 font-mono">
                  {formatNumber(analyticsData.users.current)}
                </p>
                <div className="flex items-center text-sm">
                  <Icon 
                    name={analyticsData.users.growth >= 0 ? "TrendingUp" : "TrendingDown"} 
                    size={16} 
                    className={analyticsData.users.growth >= 0 ? "text-green-500 mr-1" : "text-red-500 mr-1"} 
                  />
                  <span className={`font-medium ${analyticsData.users.growth >= 0 ? "text-green-500" : "text-red-500"}`}>
                    {formatPercentage(analyticsData.users.growth)}
                  </span>
                  <span className="text-gray-500 ml-1">vs previous period</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Icon name="Store" size={24} className="text-orange-600" />
                </div>
                {realTimeEnabled && (
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                )}
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-600">Active Shops</p>
                <p className="text-3xl font-bold text-gray-900 font-mono">
                  {formatNumber(analyticsData.shops.current)}
                </p>
                <div className="flex items-center text-sm">
                  <Icon 
                    name={analyticsData.shops.growth >= 0 ? "TrendingUp" : "TrendingDown"} 
                    size={16} 
                    className={analyticsData.shops.growth >= 0 ? "text-green-500 mr-1" : "text-red-500 mr-1"} 
                  />
                  <span className={`font-medium ${analyticsData.shops.growth >= 0 ? "text-green-500" : "text-red-500"}`}>
                    {formatPercentage(analyticsData.shops.growth)}
                  </span>
                  <span className="text-gray-500 ml-1">vs previous period</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Chart Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <ChartFilters
            onFiltersChange={handleFiltersChange}
            initialFilters={filters}
            showTimeRange={true}
            showMetricType={true}
            showShopFilter={false}
            showCategoryFilter={true}
            showRegionFilter={true}
            showGranularity={true}
            availableCategories={topCategories}
            userRole="admin"
          />
        </div>

        {/* Real-Time Charts */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-gray-900">Performance Trends</h3>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Icon name="TrendingUp" size={16} />
              <span>Real-time data visualization</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Chart */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <RealTimeChart
                data={chartData.revenue}
                title="Revenue Trend"
                metric="value"
                color="#3B82F6"
                height={300}
                timeRange={filters.timeRange}
                loading={loading}
                error={error}
                showForecast={true}
                showAnomalies={true}
                enableZoom={true}
                enableTooltips={true}
                showGrid={true}
                animated={true}
              />
            </div>

            {/* Orders Chart */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <RealTimeChart
                data={chartData.orders}
                title="Orders Trend"
                metric="value"
                color="#10B981"
                height={300}
                timeRange={filters.timeRange}
                loading={loading}
                error={error}
                showForecast={true}
                showAnomalies={true}
                enableZoom={true}
                enableTooltips={true}
                showGrid={true}
                animated={true}
              />
            </div>
          </div>
        </div>

        {/* Performance Analysis */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-gray-900">Performance Analysis</h3>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Icon name="BarChart3" size={16} />
              <span>Top performers and insights</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Performing Shops */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <TopPerformingShopsCard
                data={topShops}
                loading={loading}
                error={error}
                timeRange={filters.timeRange}
                maxShops={10}
                onShopClick={(shop) => console.log('Shop clicked:', shop)}
                showChart={true}
                sortBy="revenue"
                userRole="admin"
                realTimeEnabled={realTimeEnabled}
                lastUpdated={lastUpdated}
              />
            </div>

            {/* Revenue by Category */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <RevenueByCategoryCard
                data={topCategories}
                loading={loading}
                error={error}
                timeRange={filters.timeRange}
                viewType="pie"
                onCategoryClick={(category) => console.log('Category clicked:', category)}
                showPercentages={true}
                showLegend={true}
                maxCategories={8}
              />
            </div>
          </div>
        </div>

        {/* Additional Metrics */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-gray-900">Key Performance Indicators</h3>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Icon name="Info" size={16} />
              <span>Click cards for detailed insights</span>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <AdditionalMetricsCards
              analyticsData={analyticsData}
              loading={loading}
              error={error}
              timeRange={filters.timeRange}
              onMetricClick={(metricKey, metric) => {
                console.log(`Metric clicked: ${metricKey}`, metric);
                // You can add navigation or modal logic here
              }}
              userRole="admin"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;

