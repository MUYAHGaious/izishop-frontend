import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';

const ShopOverview = ({ shopData }) => {
  const [todayStats, setTodayStats] = useState({
    orders: 12,
    revenue: 450000,
    visitors: 89,
    conversionRate: 3.2
  });

  const [recentOrders, setRecentOrders] = useState([
    { id: 'ORD-001', customer: 'John Doe', amount: 125000, status: 'pending', time: '10 min ago' },
    { id: 'ORD-002', customer: 'Jane Smith', amount: 89000, status: 'processing', time: '25 min ago' },
    { id: 'ORD-003', customer: 'Mike Johnson', amount: 156000, status: 'shipped', time: '1 hour ago' },
    { id: 'ORD-004', customer: 'Sarah Wilson', amount: 78000, status: 'delivered', time: '2 hours ago' }
  ]);

  const [lowStockProducts, setLowStockProducts] = useState([
    { id: 1, name: 'iPhone 15 Pro', stock: 2, minStock: 5, price: 850000 },
    { id: 2, name: 'Samsung Galaxy S24', stock: 1, minStock: 3, price: 750000 },
    { id: 3, name: 'MacBook Air M3', stock: 0, minStock: 2, price: 1200000 }
  ]);

  const [quickActions] = useState([
    { id: 1, title: 'Add Product', description: 'Add new product to inventory', icon: 'Plus', color: 'bg-blue-500', action: 'add-product' },
    { id: 2, title: 'Process Orders', description: '5 orders need processing', icon: 'Package', color: 'bg-green-500', action: 'process-orders' },
    { id: 3, title: 'Update Inventory', description: 'Update stock levels', icon: 'BarChart3', color: 'bg-purple-500', action: 'update-inventory' },
    { id: 4, title: 'Customer Support', description: '3 messages waiting', icon: 'MessageCircle', color: 'bg-orange-500', action: 'customer-support' }
  ]);

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
            <p className="text-sm text-blue-100">Rating</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">{formatCurrency(shopData.monthlyRevenue)}</p>
            <p className="text-sm text-blue-100">Monthly Revenue</p>
          </div>
        </div>
      </div>

      {/* Today's Performance */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Today's Orders</p>
              <p className="text-2xl font-bold text-gray-900">{todayStats.orders}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Icon name="ShoppingBag" size={24} className="text-blue-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <Icon name="TrendingUp" size={16} className="text-green-500 mr-1" />
            <span className="text-green-500 font-medium">+15%</span>
            <span className="text-gray-500 ml-1">vs yesterday</span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Today's Revenue</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(todayStats.revenue)}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Icon name="DollarSign" size={24} className="text-green-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <Icon name="TrendingUp" size={16} className="text-green-500 mr-1" />
            <span className="text-green-500 font-medium">+22%</span>
            <span className="text-gray-500 ml-1">vs yesterday</span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Shop Visitors</p>
              <p className="text-2xl font-bold text-gray-900">{todayStats.visitors}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Icon name="Eye" size={24} className="text-purple-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <Icon name="TrendingUp" size={16} className="text-green-500 mr-1" />
            <span className="text-green-500 font-medium">+8%</span>
            <span className="text-gray-500 ml-1">vs yesterday</span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Conversion Rate</p>
              <p className="text-2xl font-bold text-gray-900">{todayStats.conversionRate}%</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Icon name="Target" size={24} className="text-orange-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <Icon name="TrendingUp" size={16} className="text-green-500 mr-1" />
            <span className="text-green-500 font-medium">+0.5%</span>
            <span className="text-gray-500 ml-1">vs yesterday</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <button
              key={action.id}
              className="p-4 rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all text-left group"
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

      {/* Recent Orders & Low Stock */}
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
            {recentOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Icon name="ShoppingBag" size={16} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{order.id}</p>
                    <p className="text-sm text-gray-500">{order.customer}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">{formatCurrency(order.amount)}</p>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getOrderStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                    <span className="text-xs text-gray-500">{order.time}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
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
            {lowStockProducts.map((product) => (
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
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStockStatusColor(product.stock, product.minStock)}`}>
                    {product.stock === 0 ? 'Out of Stock' : `${product.stock} left`}
                  </span>
                  <p className="text-xs text-gray-500 mt-1">Min: {product.minStock}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

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

