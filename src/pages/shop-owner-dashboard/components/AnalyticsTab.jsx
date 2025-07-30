import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, LineChart, Line } from 'recharts';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';
import api from '../../../services/api';
import { showToast } from '../../../components/ui/Toast';

const AnalyticsTab = () => {
  const [dateRange, setDateRange] = useState('7d');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [analyticsData, setAnalyticsData] = useState(null);
  const [salesData, setSalesData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [customerData, setCustomerData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [error, setError] = useState(null);

  const dateRangeOptions = [
    { value: '7d', label: 'Last 7 days' },
    { value: '30d', label: 'Last 30 days' },
    { value: '90d', label: 'Last 3 months' },
    { value: '1y', label: 'Last year' }
  ];

  // Load analytics data when component mounts or date range changes
  useEffect(() => {
    loadAnalyticsData();
  }, [dateRange]);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load all analytics data in parallel
      const [
        analyticsResponse,
        salesResponse,
        topProductsResponse
      ] = await Promise.all([
        api.getShopOwnerAnalytics(dateRange),
        api.getShopOwnerSalesData(dateRange),
        api.getShopOwnerTopProducts(5)
      ]);

      console.log('Analytics data loaded:', analyticsResponse);
      console.log('Sales data loaded:', salesResponse);
      console.log('Top products loaded:', topProductsResponse);

      setAnalyticsData(analyticsResponse);
      setSalesData(processSalesData(salesResponse));
      setTopProducts(topProductsResponse);
      
      // Generate customer data from analytics
      setCustomerData(generateCustomerData(analyticsResponse));
      
      // Generate category data (this would come from product categories in real implementation)
      setCategoryData(generateCategoryData());

    } catch (error) {
      console.error('Error loading analytics data:', error);
      setError(error.message || 'Failed to load analytics data');
      showToast({
        type: 'error',
        message: 'Failed to load analytics data. Please try again.',
        duration: 4000
      });
    } finally {
      setLoading(false);
    }
  };

  // Process sales data for chart display
  const processSalesData = (rawSalesData) => {
    if (!rawSalesData || !Array.isArray(rawSalesData)) {
      return [];
    }

    return rawSalesData.map(item => ({
      date: new Date(item.date).toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      }),
      sales: item.sales,
      orders: item.orders,
      revenue: item.sales // Using sales as revenue for chart
    }));
  };

  // Generate customer data from analytics (simplified)
  const generateCustomerData = (analytics) => {
    if (!analytics || !analytics.customers) {
      return [];
    }

    // This is simplified - in a real app, you'd have historical customer data
    const { current, previous, new: newCustomers, returning } = analytics.customers;
    
    return [
      { 
        period: 'Previous Period',
        newCustomers: Math.max(0, previous - returning),
        returningCustomers: returning
      },
      { 
        period: 'Current Period',
        newCustomers: newCustomers || 0,
        returningCustomers: returning || 0
      }
    ];
  };

  // Generate category data (this would come from product analytics in real implementation)
  const generateCategoryData = () => {
    // This would be replaced with real category analytics from backend
    return [
      { name: 'Electronics', value: 35, color: '#1E40AF' },
      { name: 'Fashion', value: 25, color: '#7C3AED' },
      { name: 'Food & Beverage', value: 20, color: '#F59E0B' },
      { name: 'Home & Garden', value: 15, color: '#10B981' },
      { name: 'Others', value: 5, color: '#EF4444' }
    ];
  };

  // Format currency values
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-CM', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  // Format percentage
  const formatPercentage = (value) => {
    const num = parseFloat(value) || 0;
    return `${num > 0 ? '+' : ''}${num.toFixed(1)}%`;
  };

  // Get change color based on value
  const getChangeColor = (change) => {
    const num = parseFloat(change) || 0;
    return num > 0 ? 'text-success' : num < 0 ? 'text-destructive' : 'text-muted';
  };

  // Get change icon based on value
  const getChangeIcon = (change) => {
    const num = parseFloat(change) || 0;
    return num > 0 ? 'ArrowUp' : num < 0 ? 'ArrowDown' : 'Minus';
  };

  // Check if user is new (no significant data)
  const isNewUser = () => {
    return analyticsData && 
           analyticsData.revenue?.current === 0 && 
           analyticsData.orders?.current === 0 && 
           analyticsData.customers?.current === 0;
  };

  // Generate analytics cards from real data
  const getAnalyticsCards = () => {
    if (!analyticsData) return [];
    
    const newUser = isNewUser();

    return [
      {
        title: 'Total Revenue',
        value: formatCurrency(analyticsData.revenue?.current || 0),
        change: newUser ? 'No data yet' : formatPercentage(analyticsData.revenue?.change || 0),
        changeType: newUser ? 'neutral' : ((analyticsData.revenue?.change || 0) >= 0 ? 'positive' : 'negative'),
        icon: 'DollarSign',
        color: 'text-success',
        bgColor: 'bg-success/10'
      },
      {
        title: 'Total Orders',
        value: (analyticsData.orders?.current || 0).toString(),
        change: newUser ? 'No data yet' : formatPercentage(analyticsData.orders?.change || 0),
        changeType: newUser ? 'neutral' : ((analyticsData.orders?.change || 0) >= 0 ? 'positive' : 'negative'),
        icon: 'ShoppingCart',
        color: 'text-primary',
        bgColor: 'bg-primary/10'
      },
      {
        title: 'Avg Order Value',
        value: formatCurrency(analyticsData.orders?.average_value || 0),
        change: newUser ? 'No data yet' : '+0.0%', // Would calculate from historical data
        changeType: newUser ? 'neutral' : 'positive',
        icon: 'TrendingUp',
        color: 'text-secondary',
        bgColor: 'bg-secondary/10'
      },
      {
        title: 'Total Customers',
        value: (analyticsData.customers?.current || 0).toString(),
        change: newUser ? 'No data yet' : formatPercentage(analyticsData.customers?.change || 0),
        changeType: newUser ? 'neutral' : ((analyticsData.customers?.change || 0) >= 0 ? 'positive' : 'negative'),
        icon: 'Users',
        color: 'text-info',
        bgColor: 'bg-info/10'
      }
    ];
  };


  // Filter products based on search query
  const filteredProducts = topProducts.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filter category data based on selection
  const filteredCategoryData = selectedCategory === 'all' 
    ? categoryData 
    : categoryData.filter(category => category.name.toLowerCase() === selectedCategory.toLowerCase());

  // Loading state
  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-text-secondary">Loading analytics data...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <Icon name="AlertTriangle" size={48} className="text-destructive mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-text-primary mb-2">Failed to Load Analytics</h3>
            <p className="text-text-secondary mb-4">{error}</p>
            <Button onClick={loadAnalyticsData} variant="outline">
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const analyticsCards = getAnalyticsCards();

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-text-primary">Analytics Overview</h2>
          <p className="text-text-secondary">Track your shop's performance and growth</p>
        </div>
        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-3">
          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent w-full lg:w-64"
            />
            <Icon name="Search" size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
          </div>
          
          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-surface"
          >
            <option value="all">All Categories</option>
            <option value="electronics">Electronics</option>
            <option value="fashion">Fashion</option>
            <option value="food & beverage">Food & Beverage</option>
            <option value="home & garden">Home & Garden</option>
            <option value="others">Others</option>
          </select>
          
          {/* Date Range */}
          <Select
            options={dateRangeOptions}
            value={dateRange}
            onChange={setDateRange}
            className="w-40"
          />
          
        </div>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        {analyticsCards.map((card, index) => (
          <div key={index} className="bg-surface border border-border rounded-xl p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 ${card.bgColor} rounded-lg flex items-center justify-center`}>
                <Icon name={card.icon} size={24} className={card.color} />
              </div>
              <div className={`flex items-center space-x-1 text-sm ${
                card.changeType === 'positive' ? 'text-success' : 
                card.changeType === 'negative' ? 'text-destructive' : 'text-muted'
              }`}>
                <Icon 
                  name={
                    card.changeType === 'positive' ? 'ArrowUp' : 
                    card.changeType === 'negative' ? 'ArrowDown' : 'Minus'
                  } 
                  size={16} 
                />
                <span>{card.change}</span>
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-text-primary mb-1">{card.value}</h3>
              <p className="text-text-secondary text-sm">{card.title}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
        {/* Sales Trend */}
        <div className="bg-surface border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-text-primary">Sales Trend</h3>
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-primary rounded-full"></div>
                <span className="text-text-secondary">Revenue</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-secondary rounded-full"></div>
                <span className="text-text-secondary">Orders</span>
              </div>
            </div>
          </div>
          <div className="w-full h-80" aria-label="Sales Trend Chart">
            {salesData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="date" stroke="#6B7280" />
                  <YAxis stroke="#6B7280" />
                  <Tooltip 
                    formatter={(value, name) => [
                      name === 'revenue' ? formatCurrency(value) : value,
                      name === 'revenue' ? 'Revenue' : 'Orders'
                    ]}
                    contentStyle={{ 
                      backgroundColor: '#FFFFFF', 
                      border: '1px solid #E5E7EB',
                      borderRadius: '8px'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#1E40AF" 
                    fill="#1E40AF" 
                    fillOpacity={0.1}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="orders" 
                    stroke="#7C3AED" 
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full bg-muted/20 rounded-lg">
                <div className="text-center">
                  <Icon name="BarChart3" size={48} className="text-muted mx-auto mb-2" />
                  <p className="text-text-secondary">No sales data available for this period</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Category Distribution */}
        <div className="bg-surface border border-border rounded-xl p-6">
          <h3 className="text-lg font-semibold text-text-primary mb-6">Sales by Category</h3>
          <div className="w-full h-80" aria-label="Category Distribution Chart">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={filteredCategoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {filteredCategoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => [`${value}%`, 'Percentage']}
                  contentStyle={{ 
                    backgroundColor: '#FFFFFF', 
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
            {filteredCategoryData.map((category, index) => (
              <div key={index} className="flex items-center space-x-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: category.color }}
                ></div>
                <span className="text-sm text-text-secondary">{category.name}</span>
                <span className="text-sm font-medium text-text-primary">{category.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Customer Analytics */}
      {customerData.length > 0 && (
        <div className="bg-surface border border-border rounded-xl p-6 mb-8">
          <h3 className="text-lg font-semibold text-text-primary mb-6">Customer Analytics</h3>
          <div className="w-full h-80" aria-label="Customer Analytics Chart">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={customerData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="period" stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#FFFFFF', 
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="newCustomers" fill="#1E40AF" name="New Customers" />
                <Bar dataKey="returningCustomers" fill="#7C3AED" name="Returning Customers" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Top Products */}
      <div className="bg-surface border border-border rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-text-primary">Top Performing Products</h3>
          <Button 
            variant="outline" 
            size="sm" 
            iconName="ArrowRight" 
            iconPosition="right"
            onClick={() => showToast({
              type: 'info',
              message: 'Product management page will be implemented soon',
              duration: 3000
            })}
          >
            View All
          </Button>
        </div>
        <div className="space-y-4">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product, index) => (
              <div key={product.id || index} className="flex items-center space-x-4 p-4 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted flex-shrink-0 flex items-center justify-center">
                  <Icon name="Package" size={20} className="text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-text-primary truncate">{product.name}</h4>
                  <p className="text-sm text-text-secondary">{product.sales} sales</p>
                </div>
                <div className="text-right">
                  <div className="font-medium text-text-primary">
                    {formatCurrency(product.revenue)}
                  </div>
                  <div className={`text-sm flex items-center space-x-1 ${
                    product.growth > 0 ? 'text-success' : 'text-destructive'
                  }`}>
                    <Icon 
                      name={product.growth > 0 ? 'ArrowUp' : 'ArrowDown'} 
                      size={14} 
                    />
                    <span>{Math.abs(product.growth || 0).toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <Icon name="Package" size={48} className="text-muted mx-auto mb-2" />
              <p className="text-text-secondary">No product data available</p>
            </div>
          )}
        </div>
      </div>

      {/* Performance Summary */}
      {analyticsData && (
        <div className="bg-surface border border-border rounded-xl p-6 mt-6">
          <h3 className="text-lg font-semibold text-text-primary mb-6">Performance Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-success/10 border border-success/20 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Icon name="TrendingUp" size={20} className="text-success" />
                <h4 className="font-medium text-success">Revenue Growth</h4>
              </div>
              <p className="text-sm text-text-secondary">
                Your revenue is {formatPercentage(analyticsData.revenue?.change)} compared to the previous period.
              </p>
            </div>
            
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Icon name="ShoppingCart" size={20} className="text-primary" />
                <h4 className="font-medium text-primary">Order Performance</h4>
              </div>
              <p className="text-sm text-text-secondary">
                You received {analyticsData.orders?.current || 0} orders with an average value of {formatCurrency(analyticsData.orders?.average_value)}.
              </p>
            </div>
            
            <div className="bg-info/10 border border-info/20 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Icon name="Users" size={20} className="text-info" />
                <h4 className="font-medium text-info">Customer Growth</h4>
              </div>
              <p className="text-sm text-text-secondary">
                You have {analyticsData.customers?.current || 0} customers, {formatPercentage(analyticsData.customers?.change)} compared to last period.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsTab;