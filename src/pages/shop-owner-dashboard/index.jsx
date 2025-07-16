import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import MobileBottomTab from '../../components/ui/MobileBottomTab';
import Breadcrumbs from '../../components/ui/Breadcrumbs';
import DashboardHeader from './components/DashboardHeader';
import MetricsCards from './components/MetricsCards';
import TabNavigation from './components/TabNavigation';
import ProductsTab from './components/ProductsTab';
import OrdersTab from './components/OrdersTab';
import InventoryTab from './components/InventoryTab';
import AnalyticsTab from './components/AnalyticsTab';
import EarningsTab from './components/EarningsTab';

const ShopOwnerDashboard = () => {
  const [activeTab, setActiveTab] = useState('products');

  const shopData = {
    name: "TechHub Electronics",
    category: "Electronics & Gadgets",
    location: "Douala, Cameroon",
    rating: 4.8,
    followers: 2456,
    verified: true
  };

  const notifications = {
    unread: 5,
    recent: [
      { id: 1, type: 'order', message: 'New order received', time: '2 min ago' },
      { id: 2, type: 'inventory', message: 'Low stock alert', time: '15 min ago' },
      { id: 3, type: 'review', message: 'New customer review', time: '1 hour ago' }
    ]
  };

  const metrics = {
    totalSales: 1234,
    pendingOrders: 23,
    inventoryValue: 2450000,
    monthlyRevenue: 1773000
  };

  const breadcrumbItems = [
    { label: 'Home', path: '/product-catalog' },
    { label: 'Dashboard', path: '/shop-owner-dashboard' }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'products':
        return <ProductsTab />;
      case 'orders':
        return <OrdersTab />;
      case 'inventory':
        return <InventoryTab />;
      case 'analytics':
        return <AnalyticsTab />;
      case 'earnings':
        return <EarningsTab />;
      default:
        return <ProductsTab />;
    }
  };

  return (
    <>
      <Helmet>
        <title>Shop Owner Dashboard - IziShop</title>
        <meta name="description" content="Manage your shop with comprehensive analytics, inventory tracking, order management, and earnings overview on IziShop marketplace." />
        <meta name="keywords" content="shop dashboard, inventory management, order tracking, sales analytics, earnings, IziShop" />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Header />
        <Sidebar />
        
        <main className="lg:ml-64 pt-16 pb-20 lg:pb-0">
          <div className="max-w-7xl mx-auto">
            {/* Dashboard Header */}
            <DashboardHeader shopData={shopData} notifications={notifications} />
            
            {/* Main Content */}
            <div className="p-6">
              <Breadcrumbs items={breadcrumbItems} />
              
              {/* Metrics Cards */}
              <MetricsCards metrics={metrics} />
              
              {/* Tab Navigation */}
              <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
              
              {/* Tab Content */}
              <div className="bg-surface border-x border-b border-border rounded-b-xl">
                {renderTabContent()}
              </div>
            </div>
          </div>
        </main>

        <MobileBottomTab />
      </div>
    </>
  );
};

export default ShopOwnerDashboard;