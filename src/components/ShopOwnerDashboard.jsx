import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Icon from './AppIcon';
import Button from './ui/Button';
import { showToast } from './ui/Toast';
import api from '../services/api';

const ShopOwnerDashboard = () => {
  const { user, refreshUserData } = useAuth();
  const navigate = useNavigate();
  const [shop, setShop] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasShop, setHasShop] = useState(false);

  useEffect(() => {
    checkShopStatus();
  }, [user]);

  const checkShopStatus = async () => {
    if (!user || user.role !== 'SHOP_OWNER') {
      navigate('/settings?tab=subscription');
      return;
    }

    try {
      setIsLoading(true);
      const response = await api.get('/api/shops/check-shop-exists');
      
      if (response.success && response.has_shop) {
        setShop(response);
        setHasShop(true);
      } else {
        setHasShop(false);
      }
    } catch (error) {
      console.error('Error checking shop status:', error);
      setHasShop(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateShop = () => {
    navigate('/create-shop');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!hasShop) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-16">
          {/* Welcome Header */}
          <div className="text-center mb-12">
            <div className="w-24 h-24 bg-gradient-to-r from-teal-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Icon name="Store" className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Welcome to Your Shop Owner Dashboard!
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              You're now a shop owner! Let's set up your shop so you can start selling and managing your business.
            </p>
          </div>

          {/* Setup Steps */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Let's get your shop ready!</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-teal-50 rounded-xl">
                <div className="w-16 h-16 bg-teal-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icon name="Edit" className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">1. Create Your Shop</h3>
                <p className="text-gray-600">Set up your shop profile with basic information, contact details, and policies.</p>
              </div>

              <div className="text-center p-6 bg-blue-50 rounded-xl">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icon name="Package" className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">2. Add Products</h3>
                <p className="text-gray-600">Start adding your products with descriptions, images, and pricing.</p>
              </div>

              <div className="text-center p-6 bg-green-50 rounded-xl">
                <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icon name="TrendingUp" className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">3. Start Selling</h3>
                <p className="text-gray-600">Manage orders, track sales, and grow your business.</p>
              </div>
            </div>
          </div>

          {/* Benefits */}
          <div className="bg-gradient-to-r from-teal-500 to-teal-600 rounded-2xl p-8 text-white mb-8">
            <h2 className="text-2xl font-bold mb-6">What you get as a Shop Owner:</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Icon name="CheckCircle" className="w-6 h-6 text-teal-200" />
                  <span>Unlimited product listings</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Icon name="CheckCircle" className="w-6 h-6 text-teal-200" />
                  <span>Advanced analytics dashboard</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Icon name="CheckCircle" className="w-6 h-6 text-teal-200" />
                  <span>Custom store branding</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Icon name="CheckCircle" className="w-6 h-6 text-teal-200" />
                  <span>Priority customer support</span>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Icon name="CheckCircle" className="w-6 h-6 text-teal-200" />
                  <span>Inventory management tools</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Icon name="CheckCircle" className="w-6 h-6 text-teal-200" />
                  <span>Order tracking system</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Icon name="CheckCircle" className="w-6 h-6 text-teal-200" />
                  <span>Marketing tools & promotions</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Icon name="CheckCircle" className="w-6 h-6 text-teal-200" />
                  <span>API access for integrations</span>
                </div>
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="text-center">
            <Button
              onClick={handleCreateShop}
              className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              <Icon name="Plus" className="w-6 h-6 mr-3" />
              Create Your Shop Now
            </Button>
            
            <p className="text-gray-600 mt-4">
              It only takes a few minutes to get started!
            </p>
          </div>
        </div>
      </div>
    );
  }

  // If user has a shop, show the regular dashboard
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Shop Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user?.firstName}! Manage your shop and track your sales.</p>
        </div>

        {/* Shop Info Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-teal-100 rounded-xl flex items-center justify-center">
                <Icon name="Store" className="w-8 h-8 text-teal-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{shop.name}</h2>
                <p className="text-gray-600">{shop.category}</p>
                <p className="text-sm text-gray-500">{shop.description}</p>
              </div>
            </div>
            <div className="text-right">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                <Icon name="CheckCircle" className="w-4 h-4 mr-1" />
                Active
              </span>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Icon name="Package" className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Products</p>
                <p className="text-2xl font-bold text-gray-900">{shop.product_count || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Icon name="ShoppingCart" className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">{shop.order_count || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Icon name="DollarSign" className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">${shop.total_revenue || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Icon name="Star" className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Average Rating</p>
                <p className="text-2xl font-bold text-gray-900">{shop.average_rating || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Button
            onClick={() => navigate('/add-product')}
            className="p-6 h-auto flex flex-col items-center space-y-3 bg-white border-2 border-dashed border-gray-300 hover:border-teal-500 hover:bg-teal-50"
          >
            <Icon name="Plus" className="w-8 h-8 text-gray-400" />
            <span className="font-semibold text-gray-700">Add New Product</span>
            <span className="text-sm text-gray-500">Start selling more items</span>
          </Button>

          <Button
            onClick={() => navigate('/my-products')}
            className="p-6 h-auto flex flex-col items-center space-y-3 bg-white border-2 border-dashed border-gray-300 hover:border-teal-500 hover:bg-teal-50"
          >
            <Icon name="Package" className="w-8 h-8 text-gray-400" />
            <span className="font-semibold text-gray-700">Manage Products</span>
            <span className="text-sm text-gray-500">Edit your inventory</span>
          </Button>

          <Button
            onClick={() => navigate('/order-management')}
            className="p-6 h-auto flex flex-col items-center space-y-3 bg-white border-2 border-dashed border-gray-300 hover:border-teal-500 hover:bg-teal-50"
          >
            <Icon name="ShoppingCart" className="w-8 h-8 text-gray-400" />
            <span className="font-semibold text-gray-700">View Orders</span>
            <span className="text-sm text-gray-500">Track your sales</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ShopOwnerDashboard;
