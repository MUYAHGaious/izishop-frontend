import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import NavigationSection from '../../components/ui/NavigationSection';
import TabNavigation from './components/TabNavigation';
import ShopOverview from './components/ShopOverview';
import ProductsTab from './components/ProductsTab';
import OrdersTab from './components/OrdersTab';
import InventoryTab from './components/InventoryTab';
import ShopAnalytics from './components/ShopAnalytics';
import EarningsTab from './components/EarningsTab';
import DashboardHeader from './components/DashboardHeader';
import api from '../../services/api';
import { showToast } from '../../components/ui/Toast';

const ShopOwnerDashboardMain = () => {
  const { user, refreshUserData } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    lowStockItems: 0
  });

  useEffect(() => {
    if (!user || user.role !== 'SHOP_OWNER') {
      navigate('/settings?tab=subscription');
      return;
    }
    fetchShopData();
  }, [user, navigate]);

  const fetchShopData = async () => {
    try {
      setLoading(true);
      
      // Fetch shop details
      const shopResponse = await api.get('/api/shops/my-shop');
      console.log('Shop response:', shopResponse);
      const shopData = shopResponse.data || shopResponse;
      console.log('Shop data:', shopData);
      
      // Add fallback data to prevent undefined errors
      const shopWithFallbacks = {
        name: shopData?.name || 'My Shop',
        category: shopData?.category || 'General',
        location: shopData?.location || 'Unknown',
        profile_photo: shopData?.profile_photo || null,
        owner: shopData?.owner || user?.firstName || 'Shop Owner',
        description: shopData?.description || 'No description available',
        ...shopData
      };
      
      setShop(shopWithFallbacks);
      
      // Fetch shop statistics
      const statsResponse = await api.get('/api/analytics/user-stats');
      console.log('Raw stats response:', statsResponse);

      // Extract data from the response structure
      const statsData = statsResponse.data?.data?.overview || {};
      console.log('Extracted stats data:', statsData);

      setStats({
        totalProducts: statsData.total_products || 0,
        totalOrders: statsData.total_orders || 0,
        totalRevenue: statsData.total_revenue || 0,
        pendingOrders: statsData.pending_orders || 0,
        lowStockItems: statsData.low_stock_items || 0
      });
      
    } catch (error) {
      console.error('Error fetching shop data:', error);
      showToast('Failed to load shop data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <ShopOverview shopData={shop} stats={stats} onTabChange={handleTabChange} />;
      case 'products':
        return <ProductsTab shopData={shop} />;
      case 'orders':
        return <OrdersTab shopData={shop} />;
      case 'inventory':
        return <InventoryTab shopData={shop} />;
      case 'analytics':
        return <ShopAnalytics shopData={shop} />;
      case 'earnings':
        return <EarningsTab shopData={shop} />;
      default:
        return <ShopOverview shopData={shop} stats={stats} onTabChange={handleTabChange} />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <NavigationSection />
        <div className="pt-32 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading your dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <NavigationSection />
        <div className="pt-32 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">No Shop Found</h2>
            <p className="text-gray-600 mb-6">You need to create a shop first.</p>
            <button
              onClick={() => navigate('/create-shop')}
              className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-lg font-medium"
            >
              Create Shop
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Top Navigation Header */}
      <Header />
      <NavigationSection />
      
      {/* Dashboard Header */}
      <div className="pt-32">
        <DashboardHeader shopData={shop} stats={stats} />
      </div>
      
      {/* Tab Navigation */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <TabNavigation activeTab={activeTab} onTabChange={handleTabChange} />
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default ShopOwnerDashboardMain;
