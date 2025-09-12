import React, { useState } from 'react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';

const AnalyticsTab = () => {
  const [timeRange, setTimeRange] = useState('7d');

  const timeRangeOptions = [
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
    { value: '90d', label: 'Last 3 Months' },
    { value: '1y', label: 'Last Year' }
  ];

  const revenueData = [
    { name: 'Jan', revenue: 12500000, orders: 1250 },
    { name: 'Feb', revenue: 15200000, orders: 1420 },
    { name: 'Mar', revenue: 18900000, orders: 1680 },
    { name: 'Apr', revenue: 16700000, orders: 1540 },
    { name: 'May', revenue: 21300000, orders: 1890 },
    { name: 'Jun', revenue: 24800000, orders: 2150 },
    { name: 'Jul', revenue: 22100000, orders: 1980 }
  ];

  const userGrowthData = [
    { name: 'Jan', customers: 8500, shops: 245, agents: 89 },
    { name: 'Feb', customers: 9200, shops: 267, agents: 95 },
    { name: 'Mar', customers: 10800, shops: 289, agents: 102 },
    { name: 'Apr', customers: 11500, shops: 312, agents: 108 },
    { name: 'May', customers: 13200, shops: 334, agents: 115 },
    { name: 'Jun', customers: 14900, shops: 356, agents: 123 },
    { name: 'Jul', customers: 16400, shops: 378, agents: 131 }
  ];

  const categoryData = [
    { name: 'Electronics', value: 35, color: '#1E40AF' },
    { name: 'Fashion', value: 28, color: '#7C3AED' },
    { name: 'Home & Garden', value: 18, color: '#F59E0B' },
    { name: 'Books', value: 12, color: '#10B981' },
    { name: 'Sports', value: 7, color: '#EF4444' }
  ];

  const geographicData = [
    { region: 'Douala', orders: 3450, revenue: 45600000 },
    { region: 'Yaoundé', orders: 2890, revenue: 38200000 },
    { region: 'Bamenda', orders: 1560, revenue: 20800000 },
    { region: 'Bafoussam', orders: 1230, revenue: 16400000 },
    { region: 'Garoua', orders: 890, revenue: 11900000 }
  ];

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0
    }).format(value);
  };

  const formatNumber = (value) => {
    return new Intl.NumberFormat('en-US').format(value);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-text-primary">Platform Analytics</h2>
          <p className="text-text-secondary">Comprehensive insights and performance metrics</p>
        </div>
        <div className="flex items-center gap-3">
          <Select
            options={timeRangeOptions}
            value={timeRange}
            onChange={setTimeRange}
            className="w-40"
          />
          <Button variant="outline" iconName="Download" iconPosition="left">
            Export Report
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-card rounded-lg border border-border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-secondary text-sm">Total Revenue</p>
              <p className="text-2xl font-bold text-text-primary">156.2M XAF</p>
            </div>
            <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center">
              <Icon name="DollarSign" size={24} className="text-success" />
            </div>
          </div>
          <div className="flex items-center mt-4 text-sm">
            <Icon name="TrendingUp" size={16} className="text-success mr-1" />
            <span className="text-success">+18.2%</span>
            <span className="text-text-secondary ml-1">from last month</span>
          </div>
        </div>

        <div className="bg-card rounded-lg border border-border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-secondary text-sm">Total Orders</p>
              <p className="text-2xl font-bold text-text-primary">12,847</p>
            </div>
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <Icon name="ShoppingCart" size={24} className="text-primary" />
            </div>
          </div>
          <div className="flex items-center mt-4 text-sm">
            <Icon name="TrendingUp" size={16} className="text-success mr-1" />
            <span className="text-success">+12.5%</span>
            <span className="text-text-secondary ml-1">from last month</span>
          </div>
        </div>

        <div className="bg-card rounded-lg border border-border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-secondary text-sm">Active Users</p>
              <p className="text-2xl font-bold text-text-primary">16,400</p>
            </div>
            <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center">
              <Icon name="Users" size={24} className="text-secondary" />
            </div>
          </div>
          <div className="flex items-center mt-4 text-sm">
            <Icon name="TrendingUp" size={16} className="text-success mr-1" />
            <span className="text-success">+8.7%</span>
            <span className="text-text-secondary ml-1">from last month</span>
          </div>
        </div>

        <div className="bg-card rounded-lg border border-border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-secondary text-sm">Conversion Rate</p>
              <p className="text-2xl font-bold text-text-primary">3.24%</p>
            </div>
            <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
              <Icon name="Target" size={24} className="text-accent" />
            </div>
          </div>
          <div className="flex items-center mt-4 text-sm">
            <Icon name="TrendingUp" size={16} className="text-success mr-1" />
            <span className="text-success">+0.3%</span>
            <span className="text-text-secondary ml-1">from last month</span>
          </div>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-card rounded-lg border border-border p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-text-primary">Revenue Trends</h3>
            <Button variant="ghost" size="sm" iconName="MoreHorizontal" />
          </div>
          <div className="w-full h-80" aria-label="Revenue Trends Chart">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="name" stroke="#6B7280" />
                <YAxis stroke="#6B7280" tickFormatter={(value) => `${value / 1000000}M`} />
                <Tooltip 
                  formatter={(value) => [formatCurrency(value), 'Revenue']}
                  labelStyle={{ color: '#1F2937' }}
                  contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#1E40AF" 
                  fill="#1E40AF" 
                  fillOpacity={0.1}
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* User Growth Chart */}
        <div className="bg-card rounded-lg border border-border p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-text-primary">User Growth</h3>
            <Button variant="ghost" size="sm" iconName="MoreHorizontal" />
          </div>
          <div className="w-full h-80" aria-label="User Growth Chart">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={userGrowthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="name" stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <Tooltip 
                  labelStyle={{ color: '#1F2937' }}
                  contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="customers" 
                  stroke="#1E40AF" 
                  strokeWidth={2}
                  name="Customers"
                />
                <Line 
                  type="monotone" 
                  dataKey="shops" 
                  stroke="#7C3AED" 
                  strokeWidth={2}
                  name="Shops"
                />
                <Line 
                  type="monotone" 
                  dataKey="agents" 
                  stroke="#F59E0B" 
                  strokeWidth={2}
                  name="Agents"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Distribution */}
        <div className="bg-card rounded-lg border border-border p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-text-primary">Sales by Category</h3>
            <Button variant="ghost" size="sm" iconName="MoreHorizontal" />
          </div>
          <div className="w-full h-80" aria-label="Category Distribution Chart">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}%`}
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => [`${value}%`, 'Share']}
                  labelStyle={{ color: '#1F2937' }}
                  contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Geographic Distribution */}
        <div className="bg-card rounded-lg border border-border p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-text-primary">Top Regions</h3>
            <Button variant="ghost" size="sm" iconName="MoreHorizontal" />
          </div>
          <div className="space-y-4">
            {geographicData.map((region, index) => (
              <div key={region.region} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-semibold text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-text-primary">{region.region}</p>
                    <p className="text-sm text-text-secondary">{formatNumber(region.orders)} orders</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-text-primary">{formatCurrency(region.revenue)}</p>
                  <div className="w-24 bg-border rounded-full h-2 mt-1">
                    <div 
                      className="bg-primary h-2 rounded-full" 
                      style={{ width: `${(region.revenue / 45600000) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="bg-card rounded-lg border border-border p-6">
        <h3 className="text-lg font-semibold text-text-primary mb-6">Performance Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-3">
              <Icon name="Zap" size={24} className="text-success" />
            </div>
            <p className="text-2xl font-bold text-text-primary">98.5%</p>
            <p className="text-sm text-text-secondary">Uptime</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
              <Icon name="Clock" size={24} className="text-primary" />
            </div>
            <p className="text-2xl font-bold text-text-primary">1.2s</p>
            <p className="text-sm text-text-secondary">Avg Load Time</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-3">
              <Icon name="Shield" size={24} className="text-accent" />
            </div>
            <p className="text-2xl font-bold text-text-primary">99.9%</p>
            <p className="text-sm text-text-secondary">Security Score</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-3">
              <Icon name="Heart" size={24} className="text-secondary" />
            </div>
            <p className="text-2xl font-bold text-text-primary">4.8</p>
            <p className="text-sm text-text-secondary">User Satisfaction</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsTab;