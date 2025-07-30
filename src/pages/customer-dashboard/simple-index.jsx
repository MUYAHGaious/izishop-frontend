import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import NotificationBell from '../../components/ui/NotificationBell';
import { showToast } from '../../components/ui/Toast';
import api from '../../services/api';

const CustomerDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    deliveredOrders: 0,
    totalSpent: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mock data for now
  const mockOrders = [
    {
      id: 'ORD-001',
      shop: 'TechHub Cameroon',
      items: [
        { name: 'iPhone 15 Pro', quantity: 1, price: 850000 },
        { name: 'Phone Case', quantity: 1, price: 15000 }
      ],
      total: 865000,
      status: 'delivered',
      orderDate: '2024-07-20T10:30:00Z',
      deliveryDate: '2024-07-21T14:00:00Z'
    },
    {
      id: 'ORD-002',
      shop: 'Fashion Forward',
      items: [
        { name: 'Summer Dress', quantity: 1, price: 45000 },
        { name: 'Sandals', quantity: 1, price: 25000 }
      ],
      total: 70000,
      status: 'in_transit',
      orderDate: '2024-07-22T09:15:00Z',
      estimatedDelivery: '2024-07-23T16:00:00Z'
    },
    {
      id: 'ORD-003',
      shop: 'Electronics Hub',
      items: [
        { name: 'Wireless Headphones', quantity: 1, price: 89000 }
      ],
      total: 89000,
      status: 'pending',
      orderDate: '2024-07-23T14:20:00Z'
    }
  ];

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API calls
      // const ordersData = await api.getCustomerOrders();
      // const statsData = await api.getCustomerStats();
      
      // For now, use mock data
      setRecentOrders(mockOrders);
      setStats({
        totalOrders: mockOrders.length,
        pendingOrders: mockOrders.filter(o => o.status === 'pending').length,
        deliveredOrders: mockOrders.filter(o => o.status === 'delivered').length,
        totalSpent: mockOrders.reduce((sum, order) => sum + order.total, 0)
      });
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      showToast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'in_transit': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-CM', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Dashboard</h1>
              <p className="text-gray-600">Welcome back, {user?.first_name || 'Customer'}</p>
            </div>
            <div className="flex items-center space-x-4">
              <NotificationBell variant="header" size={20} />
              <Button
                variant="outline"
                iconName="Settings"
                iconPosition="left"
                onClick={() => navigate('/user-profile')}
              >
                Settings
              </Button>
              <Button
                variant="ghost"
                iconName="LogOut"
                iconPosition="left"
                onClick={logout}
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white mb-8">
          <h2 className="text-2xl font-bold mb-2">Welcome to IziShopin!</h2>
          <p className="text-blue-100 mb-4">Discover amazing products from verified sellers across Cameroon</p>
          <Button
            variant="secondary"
            iconName="ShoppingBag"
            iconPosition="left"
            onClick={() => navigate('/product-catalog')}
            className="bg-white text-blue-600 hover:bg-blue-50"
          >
            Continue Shopping
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Icon name="ShoppingBag" size={20} className="text-blue-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Icon name="Clock" size={20} className="text-yellow-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Pending Orders</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingOrders}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <Icon name="CheckCircle" size={20} className="text-green-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Delivered</p>
                <p className="text-2xl font-bold text-gray-900">{stats.deliveredOrders}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Icon name="Banknote" size={20} className="text-purple-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Spent</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalSpent)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button
              variant="outline"
              className="p-4 h-auto flex-col space-y-2"
              onClick={() => navigate('/product-catalog')}
            >
              <Icon name="Search" size={24} className="text-blue-600" />
              <span>Browse Products</span>
            </Button>
            <Button
              variant="outline"
              className="p-4 h-auto flex-col space-y-2"
              onClick={() => navigate('/my-orders')}
            >
              <Icon name="Package" size={24} className="text-green-600" />
              <span>My Orders</span>
            </Button>
            <Button
              variant="outline"
              className="p-4 h-auto flex-col space-y-2"
              onClick={() => navigate('/shopping-cart')}
            >
              <Icon name="ShoppingCart" size={24} className="text-purple-600" />
              <span>Shopping Cart</span>
            </Button>
            <Button
              variant="outline"
              className="p-4 h-auto flex-col space-y-2"
              onClick={() => navigate('/user-profile')}
            >
              <Icon name="User" size={24} className="text-orange-600" />
              <span>My Profile</span>
            </Button>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900">Recent Orders</h2>
            <Button
              variant="ghost"
              onClick={() => navigate('/my-orders')}
              iconName="ArrowRight"
              iconPosition="right"
            >
              View All
            </Button>
          </div>
          <div className="divide-y divide-gray-200">
            {recentOrders.length > 0 ? recentOrders.map((order) => (
              <div key={order.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="text-lg font-medium text-gray-900">{order.id}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {order.status.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">from {order.shop}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">{formatCurrency(order.total)}</p>
                    <p className="text-sm text-gray-500">{formatDate(order.orderDate)}</p>
                  </div>
                </div>

                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Items</h4>
                  <div className="space-y-1">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span className="text-gray-900">{item.name} (x{item.quantity})</span>
                        <span className="text-gray-600">{formatCurrency(item.price * item.quantity)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    {order.status === 'delivered' ? (
                      <span>Delivered on {formatDate(order.deliveryDate)}</span>
                    ) : order.status === 'in_transit' ? (
                      <span>Estimated delivery: {formatDate(order.estimatedDelivery)}</span>
                    ) : (
                      <span>Processing...</span>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      iconName="Eye"
                      iconPosition="left"
                    >
                      View Details
                    </Button>
                    {order.status === 'delivered' && (
                      <Button
                        size="sm"
                        variant="outline"
                        iconName="Star"
                        iconPosition="left"
                      >
                        Rate Order
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )) : (
              <div className="p-12 text-center">
                <Icon name="ShoppingBag" size={48} className="text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
                <p className="text-gray-500 mb-4">Start shopping to see your orders here</p>
                <Button
                  onClick={() => navigate('/product-catalog')}
                  iconName="ShoppingBag"
                  iconPosition="left"
                >
                  Start Shopping
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;