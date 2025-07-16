import React, { useState } from 'react';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import MobileBottomTab from '../../components/ui/MobileBottomTab';
import Breadcrumbs from '../../components/ui/Breadcrumbs';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import UserManagementTab from './components/UserManagementTab';
import ShopOversightTab from './components/ShopOversightTab';
import DisputesTab from './components/DisputesTab';
import AnalyticsTab from './components/AnalyticsTab';
import CommissionTrackingTab from './components/CommissionTrackingTab';
import SystemMonitoringWidget from './components/SystemMonitoringWidget';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('users');

  const tabs = [
    { id: 'users', label: 'User Management', icon: 'Users' },
    { id: 'shops', label: 'Shop Oversight', icon: 'Store' },
    { id: 'disputes', label: 'Disputes', icon: 'AlertTriangle' },
    { id: 'analytics', label: 'Analytics', icon: 'BarChart3' },
    { id: 'commission', label: 'Commission', icon: 'DollarSign' }
  ];

  const breadcrumbItems = [
    { label: 'Home', path: '/product-catalog' },
    { label: 'Admin Dashboard', path: '/admin-dashboard' }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'users':
        return <UserManagementTab />;
      case 'shops':
        return <ShopOversightTab />;
      case 'disputes':
        return <DisputesTab />;
      case 'analytics':
        return <AnalyticsTab />;
      case 'commission':
        return <CommissionTrackingTab />;
      default:
        return <UserManagementTab />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Sidebar />
      
      <div className="lg:pl-64 pt-16">
        <div className="p-4 lg:p-6 pb-20 lg:pb-6">
          <Breadcrumbs items={breadcrumbItems} />
          
          {/* Dashboard Header */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-text-primary">Admin Dashboard</h1>
              <p className="text-text-secondary mt-1">Comprehensive platform oversight and management</p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" iconName="RefreshCw" iconPosition="left">
                Refresh
              </Button>
              <Button variant="outline" iconName="Settings" iconPosition="left">
                Settings
              </Button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-card rounded-lg border border-border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-text-secondary text-sm">Total Users</p>
                  <p className="text-2xl font-bold text-text-primary">16,847</p>
                </div>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Icon name="Users" size={24} className="text-primary" />
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
                  <p className="text-text-secondary text-sm">Active Shops</p>
                  <p className="text-2xl font-bold text-text-primary">1,247</p>
                </div>
                <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center">
                  <Icon name="Store" size={24} className="text-secondary" />
                </div>
              </div>
              <div className="flex items-center mt-4 text-sm">
                <Icon name="TrendingUp" size={16} className="text-success mr-1" />
                <span className="text-success">+8.2%</span>
                <span className="text-text-secondary ml-1">from last month</span>
              </div>
            </div>

            <div className="bg-card rounded-lg border border-border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-text-secondary text-sm">Open Disputes</p>
                  <p className="text-2xl font-bold text-text-primary">23</p>
                </div>
                <div className="w-12 h-12 bg-warning/10 rounded-lg flex items-center justify-center">
                  <Icon name="AlertTriangle" size={24} className="text-warning" />
                </div>
              </div>
              <div className="flex items-center mt-4 text-sm">
                <Icon name="TrendingDown" size={16} className="text-success mr-1" />
                <span className="text-success">-15.3%</span>
                <span className="text-text-secondary ml-1">from last month</span>
              </div>
            </div>

            <div className="bg-card rounded-lg border border-border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-text-secondary text-sm">Monthly Revenue</p>
                  <p className="text-2xl font-bold text-text-primary">156.2M XAF</p>
                </div>
                <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center">
                  <Icon name="DollarSign" size={24} className="text-success" />
                </div>
              </div>
              <div className="flex items-center mt-4 text-sm">
                <Icon name="TrendingUp" size={16} className="text-success mr-1" />
                <span className="text-success">+18.7%</span>
                <span className="text-text-secondary ml-1">from last month</span>
              </div>
            </div>
          </div>

          {/* System Monitoring Widget */}
          <div className="mb-8">
            <SystemMonitoringWidget />
          </div>

          {/* Main Content Area */}
          <div className="bg-card rounded-lg border border-border">
            {/* Tab Navigation */}
            <div className="border-b border-border">
              <div className="flex overflow-x-auto">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 px-6 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                      activeTab === tab.id
                        ? 'border-primary text-primary bg-primary/5' :'border-transparent text-text-secondary hover:text-text-primary hover:border-border'
                    }`}
                  >
                    <Icon name={tab.icon} size={18} />
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {renderTabContent()}
            </div>
          </div>
        </div>
      </div>

      <MobileBottomTab />
    </div>
  );
};

export default AdminDashboard;