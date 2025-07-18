import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';

const ShopAnalytics = () => {
  const [timeRange, setTimeRange] = useState('7d');
  const [analyticsData, setAnalyticsData] = useState({
    revenue: {
      current: 2450000,
      previous: 2100000,
      change: 16.7
    },
    orders: {
      current: 45,
      previous: 38,
      change: 18.4
    },
    customers: {
      current: 32,
      previous: 28,
      change: 14.3
    },
    conversionRate: {
      current: 3.2,
      previous: 2.8,
      change: 14.3
    }
  });

  const [topProducts, setTopProducts] = useState([
    { name: 'iPhone 15 Pro', sales: 15, revenue: 12750000, growth: 25 },
    { name: 'Samsung Galaxy S24', sales: 12, revenue: 9000000, growth: 18 },
    { name: 'Wireless Headphones', sales: 28, revenue: 2492000, growth: 35 },
    { name: 'MacBook Air M3', sales: 5, revenue: 6000000, growth: -5 },
    { name: 'Gaming Chair', sales: 8, revenue: 1248000, growth: 12 }
  ]);

  const [salesData, setSalesData] = useState([
    { date: '2024-07-12', sales: 350000, orders: 6 },
    { date: '2024-07-13', sales: 420000, orders: 8 },
    { date: '2024-07-14', sales: 280000, orders: 4 },
    { date: '2024-07-15', sales: 520000, orders: 9 },
    { date: '2024-07-16', sales: 380000, orders: 7 },
    { date: '2024-07-17', sales: 450000, orders: 8 },
    { date: '2024-07-18', sales: 390000, orders: 7 }
  ]);

  const [customerInsights, setCustomerInsights] = useState({
    newCustomers: 12,
    returningCustomers: 20,
    customerRetentionRate: 68.5,
    averageOrderValue: 156000,
    customerLifetimeValue: 890000
  });

  const [trafficSources, setTrafficSources] = useState([
    { source: 'Direct', visitors: 245, percentage: 35 },
    { source: 'Social Media', visitors: 189, percentage: 27 },
    { source: 'Search Engine', visitors: 154, percentage: 22 },
    { source: 'Email', visitors: 77, percentage: 11 },
    { source: 'Referral', visitors: 35, percentage: 5 }
  ]);

  const timeRanges = [
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
    { value: '90d', label: 'Last 3 Months' },
    { value: '1y', label: 'Last Year' }
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

  const getChangeColor = (change) => {
    return change > 0 ? 'text-green-600' : change < 0 ? 'text-red-600' : 'text-gray-600';
  };

  const getChangeIcon = (change) => {
    return change > 0 ? 'TrendingUp' : change < 0 ? 'TrendingDown' : 'Minus';
  };

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Shop Analytics</h2>
          <p className="text-gray-600">Track your shop's performance and insights</p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {timeRanges.map(range => (
              <option key={range.value} value={range.value}>{range.label}</option>
            ))}
          </select>
          <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2">
            <Icon name="Download" size={16} />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Revenue</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(analyticsData.revenue.current)}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Icon name="DollarSign" size={24} className="text-green-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <Icon name={getChangeIcon(analyticsData.revenue.change)} size={16} className={`mr-1 ${getChangeColor(analyticsData.revenue.change)}`} />
            <span className={`font-medium ${getChangeColor(analyticsData.revenue.change)}`}>
              {formatPercentage(analyticsData.revenue.change)}
            </span>
            <span className="text-gray-500 ml-1">vs previous period</span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Orders</p>
              <p className="text-2xl font-bold text-gray-900">{analyticsData.orders.current}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Icon name="ShoppingBag" size={24} className="text-blue-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <Icon name={getChangeIcon(analyticsData.orders.change)} size={16} className={`mr-1 ${getChangeColor(analyticsData.orders.change)}`} />
            <span className={`font-medium ${getChangeColor(analyticsData.orders.change)}`}>
              {formatPercentage(analyticsData.orders.change)}
            </span>
            <span className="text-gray-500 ml-1">vs previous period</span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Customers</p>
              <p className="text-2xl font-bold text-gray-900">{analyticsData.customers.current}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Icon name="Users" size={24} className="text-purple-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <Icon name={getChangeIcon(analyticsData.customers.change)} size={16} className={`mr-1 ${getChangeColor(analyticsData.customers.change)}`} />
            <span className={`font-medium ${getChangeColor(analyticsData.customers.change)}`}>
              {formatPercentage(analyticsData.customers.change)}
            </span>
            <span className="text-gray-500 ml-1">vs previous period</span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Conversion Rate</p>
              <p className="text-2xl font-bold text-gray-900">{analyticsData.conversionRate.current}%</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Icon name="Target" size={24} className="text-orange-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <Icon name={getChangeIcon(analyticsData.conversionRate.change)} size={16} className={`mr-1 ${getChangeColor(analyticsData.conversionRate.change)}`} />
            <span className={`font-medium ${getChangeColor(analyticsData.conversionRate.change)}`}>
              {formatPercentage(analyticsData.conversionRate.change)}
            </span>
            <span className="text-gray-500 ml-1">vs previous period</span>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Chart */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Sales Trend</h3>
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span>Revenue</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>Orders</span>
              </div>
            </div>
          </div>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <div className="text-center">
              <Icon name="BarChart3" size={48} className="text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">Sales trend chart</p>
              <p className="text-sm text-gray-400">Chart visualization will be displayed here</p>
            </div>
          </div>
        </div>

        {/* Traffic Sources */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Traffic Sources</h3>
          <div className="space-y-4">
            {trafficSources.map((source, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    index === 0 ? 'bg-blue-500' :
                    index === 1 ? 'bg-green-500' :
                    index === 2 ? 'bg-yellow-500' :
                    index === 3 ? 'bg-purple-500' : 'bg-gray-500'
                  }`}></div>
                  <span className="text-sm font-medium text-gray-900">{source.source}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-600">{source.visitors} visitors</span>
                  <span className="text-sm font-medium text-gray-900">{source.percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Products & Customer Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Top Products</h3>
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              View All
            </button>
          </div>
          <div className="space-y-4">
            {topProducts.map((product, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                    <Icon name="Package" size={16} className="text-gray-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{product.name}</p>
                    <p className="text-sm text-gray-500">{product.sales} sales</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">{formatCurrency(product.revenue)}</p>
                  <div className="flex items-center space-x-1">
                    <Icon name={getChangeIcon(product.growth)} size={12} className={getChangeColor(product.growth)} />
                    <span className={`text-xs font-medium ${getChangeColor(product.growth)}`}>
                      {formatPercentage(product.growth)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Customer Insights */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Customer Insights</h3>
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">{customerInsights.newCustomers}</p>
                <p className="text-sm text-gray-600">New Customers</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">{customerInsights.returningCustomers}</p>
                <p className="text-sm text-gray-600">Returning Customers</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Customer Retention Rate</span>
                <span className="font-medium text-gray-900">{customerInsights.customerRetentionRate}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Average Order Value</span>
                <span className="font-medium text-gray-900">{formatCurrency(customerInsights.averageOrderValue)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Customer Lifetime Value</span>
                <span className="font-medium text-gray-900">{formatCurrency(customerInsights.customerLifetimeValue)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Insights */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Performance Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center space-x-2 mb-2">
              <Icon name="TrendingUp" size={20} className="text-green-600" />
              <h4 className="font-medium text-green-800">Strong Performance</h4>
            </div>
            <p className="text-sm text-green-700">Your revenue is up 16.7% compared to the previous period. Keep up the great work!</p>
          </div>
          
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center space-x-2 mb-2">
              <Icon name="Users" size={20} className="text-blue-600" />
              <h4 className="font-medium text-blue-800">Customer Growth</h4>
            </div>
            <p className="text-sm text-blue-700">You gained 12 new customers this period. Consider running a referral program to boost growth.</p>
          </div>
          
          <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <div className="flex items-center space-x-2 mb-2">
              <Icon name="AlertTriangle" size={20} className="text-yellow-600" />
              <h4 className="font-medium text-yellow-800">Opportunity</h4>
            </div>
            <p className="text-sm text-yellow-700">Your conversion rate could be improved. Consider optimizing your product pages and checkout process.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopAnalytics;

