import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useAuth } from '../../contexts/AuthContext';
import AppLayout from '../../components/layouts/AppLayout';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';

const SellerDashboard = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalSales: 0,
    totalRevenue: 0,
    pendingOrders: 0
  });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    // Simulate loading stats
    const timer = setTimeout(() => {
      setStats({
        totalProducts: 12,
        totalSales: 45,
        totalRevenue: 125000,
        pendingOrders: 3
      });
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const quickActions = [
    {
      title: 'Add Product',
      description: 'List a new product for sale',
      icon: 'Plus',
      href: '/add-product',
      color: 'bg-blue-500'
    },
    {
      title: 'View Products',
      description: 'Manage your product listings',
      icon: 'Package',
      href: '/my-products',
      color: 'bg-green-500'
    },
    {
      title: 'Sales Report',
      description: 'View your sales analytics',
      icon: 'TrendingUp',
      href: '/sales',
      color: 'bg-purple-500'
    },
    {
      title: 'Orders',
      description: 'Manage customer orders',
      icon: 'ShoppingBag',
      href: '/order-management',
      color: 'bg-orange-500'
    }
  ];

  if (loading) {
    return (
      <AppLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <Helmet>
        <title>Seller Dashboard - IziShopin</title>
        <meta name="description" content="Manage your selling activities and track performance" />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Seller Dashboard</h1>
            <p className="text-gray-600">Welcome back, {user?.name || 'Seller'}!</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Products</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalProducts}</p>
                </div>
                <div className="bg-blue-100 p-2 rounded-lg">
                  <Icon name="Package" size={20} className="text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Sales</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalSales}</p>
                </div>
                <div className="bg-green-100 p-2 rounded-lg">
                  <Icon name="TrendingUp" size={20} className="text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">XAF {stats.totalRevenue.toLocaleString()}</p>
                </div>
                <div className="bg-purple-100 p-2 rounded-lg">
                  <Icon name="DollarSign" size={20} className="text-purple-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pending Orders</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.pendingOrders}</p>
                </div>
                <div className="bg-orange-100 p-2 rounded-lg">
                  <Icon name="Clock" size={20} className="text-orange-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {quickActions.map((action) => (
                <a
                  key={action.title}
                  href={action.href}
                  className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow block"
                >
                  <div className="flex items-center mb-3">
                    <div className={`${action.color} p-2 rounded-lg mr-3`}>
                      <Icon name={action.icon} size={20} className="text-white" />
                    </div>
                    <h3 className="font-medium text-gray-900">{action.title}</h3>
                  </div>
                  <p className="text-sm text-gray-600">{action.description}</p>
                </a>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
            </div>
            <div className="p-6">
              <div className="text-center py-8">
                <Icon name="Activity" size={48} className="text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No recent activity</h3>
                <p className="text-gray-500">Your selling activity will appear here</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default SellerDashboard;