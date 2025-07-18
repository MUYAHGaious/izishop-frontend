import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import api from '../../../services/api';

const Analytics = () => {
  const [timeRange, setTimeRange] = useState('30d');
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

  const [userChartData, setUserChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch user data for analytics
      const userData = await api.getDashboardUsers();
      const overviewData = await api.getDashboardOverview();
      
      // Update analytics data with real data
      setAnalyticsData({
        revenue: {
          current: overviewData.monthly_revenue || 0,
          previous: 0, // Would need historical data
          growth: 0
        },
        orders: {
          current: overviewData.total_orders || 0,
          previous: 0,
          growth: 0
        },
        users: {
          current: overviewData.total_users || 0,
          previous: overviewData.total_users - overviewData.new_users_this_month || 0,
          growth: overviewData.new_users_this_month > 0 ? 
            ((overviewData.new_users_this_month / (overviewData.total_users - overviewData.new_users_this_month)) * 100) : 0
        },
        shops: {
          current: overviewData.shop_owners || 0,
          previous: 0,
          growth: 0
        }
      });

      // Set chart data from real user registration data
      setUserChartData(userData.daily_registrations || []);
      
    } catch (err) {
      setError(err.message || 'Failed to fetch analytics data');
      console.error('Analytics data fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const [chartData, setChartData] = useState({
    revenue: [
      { date: '2024-06-19', value: 450000 },
      { date: '2024-06-20', value: 520000 },
      { date: '2024-06-21', value: 480000 },
      { date: '2024-06-22', value: 610000 },
      { date: '2024-06-23', value: 580000 },
      { date: '2024-06-24', value: 670000 },
      { date: '2024-06-25', value: 720000 },
      { date: '2024-06-26', value: 650000 },
      { date: '2024-06-27', value: 780000 },
      { date: '2024-06-28', value: 820000 },
      { date: '2024-06-29', value: 750000 },
      { date: '2024-06-30', value: 890000 },
      { date: '2024-07-01', value: 920000 },
      { date: '2024-07-02', value: 850000 },
      { date: '2024-07-03', value: 980000 },
      { date: '2024-07-04', value: 1020000 },
      { date: '2024-07-05', value: 950000 },
      { date: '2024-07-06', value: 1100000 },
      { date: '2024-07-07', value: 1150000 },
      { date: '2024-07-08', value: 1080000 },
      { date: '2024-07-09', value: 1200000 },
      { date: '2024-07-10', value: 1250000 },
      { date: '2024-07-11', value: 1180000 },
      { date: '2024-07-12', value: 1300000 },
      { date: '2024-07-13', value: 1350000 },
      { date: '2024-07-14', value: 1280000 },
      { date: '2024-07-15', value: 1400000 },
      { date: '2024-07-16', value: 1450000 },
      { date: '2024-07-17', value: 1380000 },
      { date: '2024-07-18', value: 1500000 }
    ],
    orders: [
      { date: '2024-06-19', value: 45 },
      { date: '2024-06-20', value: 52 },
      { date: '2024-06-21', value: 48 },
      { date: '2024-06-22', value: 61 },
      { date: '2024-06-23', value: 58 },
      { date: '2024-06-24', value: 67 },
      { date: '2024-06-25', value: 72 },
      { date: '2024-06-26', value: 65 },
      { date: '2024-06-27', value: 78 },
      { date: '2024-06-28', value: 82 },
      { date: '2024-06-29', value: 75 },
      { date: '2024-06-30', value: 89 },
      { date: '2024-07-01', value: 92 },
      { date: '2024-07-02', value: 85 },
      { date: '2024-07-03', value: 98 },
      { date: '2024-07-04', value: 102 },
      { date: '2024-07-05', value: 95 },
      { date: '2024-07-06', value: 110 },
      { date: '2024-07-07', value: 115 },
      { date: '2024-07-08', value: 108 },
      { date: '2024-07-09', value: 120 },
      { date: '2024-07-10', value: 125 },
      { date: '2024-07-11', value: 118 },
      { date: '2024-07-12', value: 130 },
      { date: '2024-07-13', value: 135 },
      { date: '2024-07-14', value: 128 },
      { date: '2024-07-15', value: 140 },
      { date: '2024-07-16', value: 145 },
      { date: '2024-07-17', value: 138 },
      { date: '2024-07-18', value: 150 }
    ]
  });

  const [topShops, setTopShops] = useState([
    { id: 1, name: 'Tech Store Pro', revenue: 5600000, orders: 234, growth: 18.5 },
    { id: 2, name: 'Fashion Hub', revenue: 4200000, orders: 189, growth: 15.2 },
    { id: 3, name: 'Home & Garden', revenue: 3800000, orders: 156, growth: 12.8 },
    { id: 4, name: 'Beauty Corner', revenue: 3200000, orders: 145, growth: 22.1 },
    { id: 5, name: 'Sports Central', revenue: 2900000, orders: 134, growth: 8.7 }
  ]);

  const [topCategories, setTopCategories] = useState([
    { name: 'Electronics', revenue: 8500000, percentage: 35.2 },
    { name: 'Fashion', revenue: 6200000, percentage: 25.7 },
    { name: 'Home & Garden', revenue: 4800000, percentage: 19.9 },
    { name: 'Beauty', revenue: 2900000, percentage: 12.0 },
    { name: 'Sports', revenue: 1800000, percentage: 7.2 }
  ]);

  const timeRanges = [
    { value: '7d', label: 'Last 7 days' },
    { value: '30d', label: 'Last 30 days' },
    { value: '90d', label: 'Last 3 months' },
    { value: '1y', label: 'Last year' }
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

  const formatPercentage = (num) => {
    return `${num > 0 ? '+' : ''}${num.toFixed(1)}%`;
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
    <div className="p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
          <p className="text-gray-600">Track platform performance and growth metrics</p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(analyticsData.revenue.current)}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Icon name="DollarSign" size={24} className="text-green-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <Icon name="TrendingUp" size={16} className="text-green-500 mr-1" />
            <span className="text-green-500 font-medium">{formatPercentage(analyticsData.revenue.growth)}</span>
            <span className="text-gray-500 ml-1">vs previous period</span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(analyticsData.orders.current)}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Icon name="ShoppingBag" size={24} className="text-blue-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <Icon name="TrendingUp" size={16} className="text-green-500 mr-1" />
            <span className="text-green-500 font-medium">{formatPercentage(analyticsData.orders.growth)}</span>
            <span className="text-gray-500 ml-1">vs previous period</span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(analyticsData.users.current)}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Icon name="Users" size={24} className="text-purple-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <Icon name="TrendingUp" size={16} className="text-green-500 mr-1" />
            <span className="text-green-500 font-medium">{formatPercentage(analyticsData.users.growth)}</span>
            <span className="text-gray-500 ml-1">vs previous period</span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Active Shops</p>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(analyticsData.shops.current)}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Icon name="Store" size={24} className="text-orange-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <Icon name="TrendingUp" size={16} className="text-green-500 mr-1" />
            <span className="text-green-500 font-medium">{formatPercentage(analyticsData.shops.growth)}</span>
            <span className="text-gray-500 ml-1">vs previous period</span>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Revenue Trend</h3>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span>Daily Revenue</span>
            </div>
          </div>
          <LineChart data={chartData.revenue} color="#3B82F6" />
        </div>

        {/* Orders Chart */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Orders Trend</h3>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>Daily Orders</span>
            </div>
          </div>
          <LineChart data={chartData.orders} color="#10B981" />
        </div>
      </div>

      {/* Top Performers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Shops */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Top Performing Shops</h3>
          <div className="space-y-4">
            {topShops.map((shop, index) => (
              <div key={shop.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-purple-600">#{index + 1}</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{shop.name}</p>
                    <p className="text-sm text-gray-500">{shop.orders} orders</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">{formatCurrency(shop.revenue)}</p>
                  <p className="text-sm text-green-600">{formatPercentage(shop.growth)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Categories */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Revenue by Category</h3>
          <div className="space-y-4">
            {topCategories.map((category, index) => (
              <div key={category.name} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900">{category.name}</span>
                  <span className="text-sm text-gray-500">{category.percentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${category.percentage}%` }}
                  ></div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Revenue</span>
                  <span className="text-xs font-medium text-gray-900">{formatCurrency(category.revenue)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Icon name="TrendingUp" size={20} className="text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Conversion Rate</p>
              <p className="text-xl font-bold text-gray-900">3.2%</p>
            </div>
          </div>
          <p className="text-sm text-green-600">+0.5% from last month</p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Icon name="DollarSign" size={20} className="text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Avg. Order Value</p>
              <p className="text-xl font-bold text-gray-900">{formatCurrency(125000)}</p>
            </div>
          </div>
          <p className="text-sm text-green-600">+8.2% from last month</p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Icon name="Users" size={20} className="text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Customer Retention</p>
              <p className="text-xl font-bold text-gray-900">68.5%</p>
            </div>
          </div>
          <p className="text-sm text-green-600">+2.1% from last month</p>
        </div>
      </div>
    </div>
  );
};

export default Analytics;

