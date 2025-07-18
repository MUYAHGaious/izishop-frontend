import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import ShopOverview from './components/ShopOverview';
import ProductManagement from './components/ProductManagement';
import OrderManagement from './components/OrderManagement';
import CustomerManagement from './components/CustomerManagement';
import ShopAnalytics from './components/ShopAnalytics';
import ShopSettings from './components/ShopSettings';
import api from '../../services/api';

const ShopOwnerDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [shopData, setShopData] = useState({
    name: 'Loading...',
    owner: 'Loading...',
    status: 'active',
    rating: 0,
    totalProducts: 0,
    totalOrders: 0,
    monthlyRevenue: 0
  });
  const [productStats, setProductStats] = useState({
    total_products: 0,
    active_products: 0,
    inactive_products: 0,
    low_stock_products: 0,
    out_of_stock_products: 0
  });
  const [loading, setLoading] = useState(true);
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  // Check shop owner authentication
  useEffect(() => {
    if (!isAuthenticated() || user?.role !== 'SHOP_OWNER') {
      navigate('/authentication-login-register');
    }
  }, [isAuthenticated, user, navigate]);

  // Fetch real-time data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch shop data
        const shopResponse = await api.getMyShop();
        setShopData(prev => ({
          ...prev,
          name: shopResponse.name,
          owner: user?.email || 'Shop Owner',
          status: shopResponse.is_active ? 'active' : 'inactive',
          rating: 4.8 // This would come from reviews in the future
        }));

        // Fetch product statistics
        const productStatsResponse = await api.getMyProductStats();
        setProductStats(productStatsResponse);
        
        // Update shop data with product counts
        setShopData(prev => ({
          ...prev,
          totalProducts: productStatsResponse.total_products,
          // These would come from order/revenue APIs in the future
          totalOrders: 0, // Placeholder
          monthlyRevenue: 0 // Placeholder
        }));

        // Mock real-time notifications (would be replaced with real API)
        const mockNotifications = [
          { id: 1, type: 'product', message: `${productStatsResponse.low_stock_products} products are low in stock`, time: '5 min ago' },
          { id: 2, type: 'info', message: `You have ${productStatsResponse.active_products} active products`, time: '10 min ago' }
        ];
        setNotifications(mockNotifications);

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated() && user?.role === 'SHOP_OWNER') {
      fetchDashboardData();
      
      // Set up real-time updates every 30 seconds
      const interval = setInterval(fetchDashboardData, 30000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, user, api]);

  // Real-time clock
  const [currentTime, setCurrentTime] = useState(new Date());
  
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/authentication-login-register');
    } catch (error) {
      console.error('Logout error:', error);
      // Force navigation even if logout fails
      navigate('/authentication-login-register');
    }
  };

  const handleAddProduct = () => {
    navigate('/add-product');
  };

  const handleViewProducts = () => {
    setActiveTab('products');
  };

  const handleViewShop = () => {
    navigate('/my-shop-profile');
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: 'BarChart3', color: 'text-blue-600' },
    { id: 'products', label: 'Products', icon: 'Package', color: 'text-green-600' },
    { id: 'orders', label: 'Orders', icon: 'ShoppingBag', color: 'text-orange-600' },
    { id: 'customers', label: 'Customers', icon: 'Users', color: 'text-purple-600' },
    { id: 'analytics', label: 'Analytics', icon: 'TrendingUp', color: 'text-indigo-600' },
    { id: 'settings', label: 'Settings', icon: 'Settings', color: 'text-gray-600' }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <ShopOverview shopData={shopData} productStats={productStats} />;
      case 'products':
        return <ProductManagement />;
      case 'orders':
        return <OrderManagement />;
      case 'customers':
        return <CustomerManagement />;
      case 'analytics':
        return <ShopAnalytics />;
      case 'settings':
        return <ShopSettings shopData={shopData} setShopData={setShopData} />;
      default:
        return <ShopOverview shopData={shopData} productStats={productStats} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Icon name="Menu" size={24} className="text-gray-600" />
            </button>
            <div>
              <h1 className="text-lg font-bold text-gray-900">{shopData.name}</h1>
              <p className="text-xs text-gray-500">Shop Dashboard</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Real-time Clock */}
            <div className="hidden sm:block text-xs text-gray-500">
              {currentTime.toLocaleTimeString()}
            </div>
            
            {/* Quick Add Product */}
            <button 
              onClick={handleAddProduct}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              title="Add Product"
            >
              <Icon name="Plus" size={20} className="text-blue-600" />
            </button>
            
            {/* Notifications */}
            <div className="relative">
              <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors relative">
                <Icon name="Bell" size={20} className="text-gray-600" />
                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {notifications.length}
                  </span>
                )}
              </button>
            </div>
            
            {/* Profile */}
            <button 
              onClick={handleLogout}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              title="Logout"
            >
              <Icon name="LogOut" size={20} className="text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white border-r border-gray-200">
          {/* Shop Info */}
          <div className="flex flex-col p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Icon name="Store" size={24} className="text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-lg font-bold text-gray-900 truncate">{shopData.name}</h1>
                <p className="text-sm text-gray-500">Shop Owner Dashboard</p>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center space-x-1">
                <Icon name="Star" size={16} className="text-yellow-400 fill-current" />
                <span className="text-sm font-medium text-gray-900">{shopData.rating}</span>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                shopData.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
              }`}>
                {shopData.status}
              </span>
            </div>
          </div>
          
          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon name={tab.icon} size={20} className={activeTab === tab.id ? 'text-blue-700' : tab.color} />
                <span className="ml-3">{tab.label}</span>
              </button>
            ))}
          </nav>
          
          {/* Quick Actions */}
          <div className="p-4 border-t border-gray-200">
            <div className="space-y-2">
              <button 
                onClick={handleAddProduct}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
              >
                <Icon name="Plus" size={16} />
                <span>Add Product</span>
              </button>
              
              <button 
                onClick={handleViewProducts}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
              >
                <Icon name="Package" size={16} />
                <span>View Products</span>
              </button>
              
              <button 
                onClick={handleViewShop}
                className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2"
              >
                <Icon name="Store" size={16} />
                <span>View Shop</span>
              </button>
            </div>
            
            {/* Real-time Clock */}
            <div className="mt-4 text-center">
              <div className="text-xs text-gray-500">Current Time</div>
              <div className="text-sm font-medium text-gray-900">
                {currentTime.toLocaleTimeString()}
              </div>
              <div className="text-xs text-gray-500">
                {currentTime.toLocaleDateString()}
              </div>
            </div>
          </div>
          
          {/* User Profile */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                <Icon name="User" size={20} className="text-gray-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{shopData.owner}</p>
                <p className="text-xs text-gray-500 truncate">Shop Owner</p>
              </div>
              <button 
                onClick={handleLogout}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Icon name="LogOut" size={16} className="text-gray-500" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black bg-opacity-50" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="fixed inset-y-0 left-0 w-64 bg-white" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
              <h1 className="text-lg font-bold text-gray-900">{shopData.name}</h1>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Icon name="X" size={20} className="text-gray-600" />
              </button>
            </div>
            
            <nav className="px-4 py-6 space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon name={tab.icon} size={20} className={activeTab === tab.id ? 'text-blue-700' : tab.color} />
                  <span className="ml-3">{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="lg:pl-64">
        <main className="p-4 lg:p-8 pb-20 lg:pb-8">
          {/* Desktop Header */}
          <div className="hidden lg:flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {tabs.find(tab => tab.id === activeTab)?.label || 'Dashboard'}
              </h1>
              <p className="text-gray-600 mt-1">Manage your shop and track performance</p>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="relative">
                <Icon name="Search" size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search products, orders..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              {/* Notifications */}
              <div className="relative">
                <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors relative">
                  <Icon name="Bell" size={20} className="text-gray-600" />
                  {notifications.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {notifications.length}
                    </span>
                  )}
                </button>
              </div>
              
              {/* Quick Actions */}
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
                <Icon name="Plus" size={16} />
                <span>Add Product</span>
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 min-h-[600px]">
            {renderTabContent()}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
        <div className="grid grid-cols-6 gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center py-2 px-1 transition-colors ${
                activeTab === tab.id
                  ? 'text-blue-600'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <Icon name={tab.icon} size={20} />
              <span className="text-xs mt-1 truncate">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Floating Action Button (Mobile) */}
      <div className="lg:hidden fixed bottom-20 right-4 z-30">
        <button className="w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors flex items-center justify-center">
          <Icon name="Plus" size={24} />
        </button>
      </div>
    </div>
  );
};

export default ShopOwnerDashboard;

