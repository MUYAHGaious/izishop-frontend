import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';

const AnalyticsTab = () => {
  const [dateRange, setDateRange] = useState('7d');

  const dateRangeOptions = [
    { value: '7d', label: 'Last 7 days' },
    { value: '30d', label: 'Last 30 days' },
    { value: '90d', label: 'Last 3 months' },
    { value: '1y', label: 'Last year' }
  ];

  const salesData = [
    { name: 'Mon', sales: 2400, orders: 12, revenue: 240000 },
    { name: 'Tue', sales: 1398, orders: 8, revenue: 139800 },
    { name: 'Wed', sales: 9800, orders: 24, revenue: 980000 },
    { name: 'Thu', sales: 3908, orders: 16, revenue: 390800 },
    { name: 'Fri', sales: 4800, orders: 20, revenue: 480000 },
    { name: 'Sat', sales: 3800, orders: 18, revenue: 380000 },
    { name: 'Sun', sales: 4300, orders: 22, revenue: 430000 }
  ];

  const categoryData = [
    { name: 'Electronics', value: 45, color: '#1E40AF' },
    { name: 'Fashion', value: 25, color: '#7C3AED' },
    { name: 'Food & Beverage', value: 15, color: '#F59E0B' },
    { name: 'Accessories', value: 10, color: '#10B981' },
    { name: 'Others', value: 5, color: '#EF4444' }
  ];

  const customerData = [
    { name: 'Jan', newCustomers: 65, returningCustomers: 28 },
    { name: 'Feb', newCustomers: 59, returningCustomers: 48 },
    { name: 'Mar', newCustomers: 80, returningCustomers: 40 },
    { name: 'Apr', newCustomers: 81, returningCustomers: 19 },
    { name: 'May', newCustomers: 56, returningCustomers: 96 },
    { name: 'Jun', newCustomers: 55, returningCustomers: 27 }
  ];

  const topProducts = [
    {
      name: "Premium Wireless Headphones",
      sales: 156,
      revenue: 7020000,
      growth: 12.5,
      image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=60&h=60&fit=crop"
    },
    {
      name: "Smart Fitness Tracker",
      sales: 134,
      revenue: 4288000,
      growth: 8.3,
      image: "https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=60&h=60&fit=crop"
    },
    {
      name: "Artisan Coffee Beans",
      sales: 98,
      revenue: 1176000,
      growth: 15.7,
      image: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=60&h=60&fit=crop"
    },
    {
      name: "Organic Cotton T-Shirt",
      sales: 89,
      revenue: 756500,
      growth: -2.1,
      image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=60&h=60&fit=crop"
    },
    {
      name: "Handmade Leather Wallet",
      sales: 67,
      revenue: 1239500,
      growth: 5.4,
      image: "https://images.unsplash.com/photo-1627123424574-724758594e93?w=60&h=60&fit=crop"
    }
  ];

  const analyticsCards = [
    {
      title: 'Total Revenue',
      value: '3,042,100 XAF',
      change: '+12.5%',
      changeType: 'positive',
      icon: 'DollarSign',
      color: 'text-success',
      bgColor: 'bg-success/10'
    },
    {
      title: 'Total Orders',
      value: '1,234',
      change: '+8.2%',
      changeType: 'positive',
      icon: 'ShoppingCart',
      color: 'text-primary',
      bgColor: 'bg-primary/10'
    },
    {
      title: 'Avg Order Value',
      value: '24,650 XAF',
      change: '+3.1%',
      changeType: 'positive',
      icon: 'TrendingUp',
      color: 'text-secondary',
      bgColor: 'bg-secondary/10'
    },
    {
      title: 'Conversion Rate',
      value: '3.2%',
      change: '-0.5%',
      changeType: 'negative',
      icon: 'Target',
      color: 'text-warning',
      bgColor: 'bg-warning/10'
    }
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-text-primary">Analytics Overview</h2>
          <p className="text-text-secondary">Track your shop's performance and growth</p>
        </div>
        <div className="flex items-center space-x-3">
          <Select
            options={dateRangeOptions}
            value={dateRange}
            onChange={setDateRange}
            className="w-40"
          />
          <Button variant="outline" iconName="Download" iconPosition="left">
            Export Report
          </Button>
        </div>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        {analyticsCards.map((card, index) => (
          <div key={index} className="bg-surface border border-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 ${card.bgColor} rounded-lg flex items-center justify-center`}>
                <Icon name={card.icon} size={24} className={card.color} />
              </div>
              <div className={`flex items-center space-x-1 text-sm ${
                card.changeType === 'positive' ? 'text-success' : 'text-destructive'
              }`}>
                <Icon 
                  name={card.changeType === 'positive' ? 'ArrowUp' : 'ArrowDown'} 
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
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="name" stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <Tooltip 
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
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Distribution */}
        <div className="bg-surface border border-border rounded-xl p-6">
          <h3 className="text-lg font-semibold text-text-primary mb-6">Sales by Category</h3>
          <div className="w-full h-80" aria-label="Category Distribution Chart">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
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
            {categoryData.map((category, index) => (
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
      <div className="bg-surface border border-border rounded-xl p-6 mb-8">
        <h3 className="text-lg font-semibold text-text-primary mb-6">Customer Analytics</h3>
        <div className="w-full h-80" aria-label="Customer Analytics Chart">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={customerData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="name" stroke="#6B7280" />
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

      {/* Top Products */}
      <div className="bg-surface border border-border rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-text-primary">Top Performing Products</h3>
          <Button variant="outline" size="sm" iconName="ArrowRight" iconPosition="right">
            View All
          </Button>
        </div>
        <div className="space-y-4">
          {topProducts.map((product, index) => (
            <div key={index} className="flex items-center space-x-4 p-4 rounded-lg hover:bg-muted/50 transition-colors">
              <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = '/assets/images/no_image.png';
                  }}
                />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-text-primary truncate">{product.name}</h4>
                <p className="text-sm text-text-secondary">{product.sales} sales</p>
              </div>
              <div className="text-right">
                <div className="font-medium text-text-primary">
                  {product.revenue.toLocaleString()} XAF
                </div>
                <div className={`text-sm flex items-center space-x-1 ${
                  product.growth > 0 ? 'text-success' : 'text-destructive'
                }`}>
                  <Icon 
                    name={product.growth > 0 ? 'ArrowUp' : 'ArrowDown'} 
                    size={14} 
                  />
                  <span>{Math.abs(product.growth)}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsTab;