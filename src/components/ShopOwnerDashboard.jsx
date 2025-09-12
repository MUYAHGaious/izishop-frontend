import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Icon from './AppIcon';
import Button from './ui/Button';
import { showToast } from './ui/Toast';
import api from '../services/api';

const ShopOwnerDashboard = () => {
  const { user, refreshUserData } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [shop, setShop] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasShop, setHasShop] = useState(false);

  useEffect(() => {
    checkShopStatus();
  }, [user]);

  // Handle shop_created parameter - force refresh if shop was just created
  useEffect(() => {
    if (searchParams.get('shop_created') === 'true') {
      console.log('Shop was just created, forcing refresh...');
      // Clear the URL parameter
      navigate('/shop-owner-dashboard', { replace: true });
      // Force refresh shop status
      checkShopStatus();
    }
  }, [searchParams, navigate]);

  const checkShopStatus = async () => {
    if (!user || user.role !== 'SHOP_OWNER') {
      navigate('/settings?tab=subscription');
      return;
    }

    try {
      setIsLoading(true);
      
      // First try to get shop details directly
      try {
        const shopDetails = await api.get('/api/shops/my-shop');
        console.log('Shop details found:', shopDetails);
        setShop(shopDetails.data || shopDetails);
        setHasShop(true);
        return;
      } catch (shopError) {
        console.log('No shop found via my-shop endpoint, trying check-shop-exists...');
      }
      
      // Fallback to check-shop-exists
      const response = await api.get('/api/shops/check-shop-exists');
      console.log('Shop check response:', response);
      
      if (response.success && response.has_shop) {
        // If user has a shop, get the full shop details
        try {
          const shopDetails = await api.get('/api/shops/my-shop');
          console.log('Shop details:', shopDetails);
          setShop(shopDetails.data || shopDetails);
          setHasShop(true);
        } catch (shopError) {
          console.error('Error fetching shop details:', shopError);
          // Fall back to basic shop info
          setShop(response);
          setHasShop(true);
        }
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

  // If user has a shop, show the modern redesigned dashboard
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 relative overflow-hidden">
      {/* Background blur effects inspired by landing page */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-teal-400/10 rounded-full -translate-y-48 -translate-x-48 pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-gray-400/5 rounded-full translate-y-40 translate-x-40 pointer-events-none"></div>
      
      <div className="max-w-7xl mx-auto px-6 py-8 relative z-10">
        {/* Modern Header Section */}
        <div className="mb-12">
          <div className="bg-gradient-to-r from-teal-500 to-teal-600 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden">
            {/* Blur circle effects like landing page */}
            <div className="absolute top-0 left-0 w-48 h-48 bg-white/15 rounded-full -translate-y-24 -translate-x-24 pointer-events-none"></div>
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-white/10 rounded-full translate-y-16 translate-x-16 pointer-events-none"></div>
            
            <div className="relative z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-6">
                  <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                    <Icon name="Store" className="w-10 h-10 text-white" />
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                      {shop.name}
                    </h1>
                    <p className="text-teal-100 text-lg">{shop.category}</p>
                    <p className="text-teal-200 text-sm mt-1">{shop.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-white/20 backdrop-blur-sm text-white">
                    <Icon name="CheckCircle" className="w-4 h-4 mr-2" />
                    Shop Active
                  </span>
                  <p className="text-teal-100 text-sm mt-2">Welcome back, {user?.firstName}!</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modern Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
                <Icon name="Package" className="w-7 h-7 text-white" />
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-gray-900">{shop.product_count || 0}</p>
                <p className="text-sm font-medium text-gray-600">Products</p>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-gradient-to-r from-teal-500 to-teal-600 h-2 rounded-full" style={{ width: '70%' }}></div>
            </div>
            <p className="text-xs text-gray-500 mt-2">Inventory status</p>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <Icon name="ShoppingCart" className="w-7 h-7 text-white" />
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-gray-900">{shop.order_count || 0}</p>
                <p className="text-sm font-medium text-gray-600">Orders</p>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full" style={{ width: '85%' }}></div>
            </div>
            <p className="text-xs text-gray-500 mt-2">Order completion</p>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                <Icon name="DollarSign" className="w-7 h-7 text-white" />
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-gray-900">${shop.total_revenue || 0}</p>
                <p className="text-sm font-medium text-gray-600">Revenue</p>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full" style={{ width: '90%' }}></div>
            </div>
            <p className="text-xs text-gray-500 mt-2">Monthly target</p>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center shadow-lg">
                <Icon name="Star" className="w-7 h-7 text-white" />
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-gray-900">{shop.average_rating || 0}</p>
                <p className="text-sm font-medium text-gray-600">Rating</p>
              </div>
            </div>
            <div className="flex justify-end space-x-1">
              {[...Array(5)].map((_, i) => (
                <Icon key={i} name="Star" className={`w-4 h-4 ${i < (shop.average_rating || 0) ? 'text-yellow-500' : 'text-gray-300'}`} />
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">Customer feedback</p>
          </div>
        </div>

        {/* Modern Action Cards */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Button
              onClick={() => navigate('/add-product')}
              className="bg-gradient-to-br from-teal-400 to-teal-600 text-white rounded-2xl p-8 h-auto shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 border-none relative overflow-hidden group"
            >
              {/* Blur effects */}
              <div className="absolute top-0 left-0 w-24 h-24 bg-white/15 rounded-full -translate-y-12 -translate-x-12 pointer-events-none group-hover:scale-110 transition-transform duration-300"></div>
              
              <div className="relative z-10 flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-4">
                  <Icon name="Plus" className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2">Add New Product</h3>
                <p className="text-teal-100 text-sm">Start selling more items and grow your inventory</p>
              </div>
            </Button>

            <Button
              onClick={() => navigate('/my-products')}
              className="bg-gradient-to-br from-gray-700 to-gray-900 text-white rounded-2xl p-8 h-auto shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 border-none relative overflow-hidden group"
            >
              {/* Blur effects */}
              <div className="absolute top-0 left-0 w-24 h-24 bg-white/15 rounded-full -translate-y-12 -translate-x-12 pointer-events-none group-hover:scale-110 transition-transform duration-300"></div>
              
              <div className="relative z-10 flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-4">
                  <Icon name="Package" className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2">Manage Products</h3>
                <p className="text-gray-300 text-sm">Edit and organize your product catalog</p>
              </div>
            </Button>

            <Button
              onClick={() => navigate('/order-management')}
              className="bg-gradient-to-br from-blue-500 to-blue-700 text-white rounded-2xl p-8 h-auto shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 border-none relative overflow-hidden group"
            >
              {/* Blur effects */}
              <div className="absolute top-0 left-0 w-24 h-24 bg-white/15 rounded-full -translate-y-12 -translate-x-12 pointer-events-none group-hover:scale-110 transition-transform duration-300"></div>
              
              <div className="relative z-10 flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-4">
                  <Icon name="ShoppingCart" className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2">View Orders</h3>
                <p className="text-blue-100 text-sm">Track sales and manage customer orders</p>
              </div>
            </Button>
          </div>
        </div>

        {/* Additional Modern Features */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Activity */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Recent Activity</h3>
              <Icon name="Activity" className="w-5 h-5 text-gray-400" />
            </div>
            <div className="space-y-4">
              <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-xl">
                <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                  <Icon name="Plus" className="w-5 h-5 text-teal-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">New product added</p>
                  <p className="text-xs text-gray-500">2 hours ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-xl">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Icon name="ShoppingCart" className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Order received</p>
                  <p className="text-xs text-gray-500">4 hours ago</p>
                </div>
              </div>
            </div>
          </div>

          {/* Performance Insights */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Performance</h3>
              <Icon name="TrendingUp" className="w-5 h-5 text-green-500" />
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Sales Growth</span>
                <span className="text-sm font-semibold text-green-600">+12%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-gradient-to-r from-teal-500 to-teal-600 h-2 rounded-full" style={{ width: '65%' }}></div>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-sm text-gray-600">Customer Satisfaction</span>
                <span className="text-sm font-semibold text-blue-600">96%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopOwnerDashboard;
