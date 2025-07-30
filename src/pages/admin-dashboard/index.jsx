import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Icon from '../../components/AppIcon';
import DashboardOverview from './components/DashboardOverview';
import UserManagement from './components/UserManagement';
import ShopManagement from './components/ShopManagement';
import OrderManagement from './components/OrderManagement';
import Analytics from './components/Analytics';
import SystemSettings from './components/SystemSettings';
import NotificationCenter from './components/NotificationCenter';
import notificationService from '../../services/notificationService';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notificationCount, setNotificationCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();

  // Show loading while auth is being checked
  if (!user && isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  // Check admin authentication
  useEffect(() => {
    try {
      if (!isAuthenticated() || !user || user.role !== 'ADMIN') {
        console.log('Admin auth check failed, redirecting to login');
        navigate('/admin-login');
      } else {
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error in admin auth check:', error);
      navigate('/admin-login');
    }
  }, [user, isAuthenticated, navigate]);

  // Real notification service
  useEffect(() => {
    try {
      // Subscribe to real notifications
      const unsubscribe = notificationService.subscribe((data) => {
        setNotifications(data.notifications);
        setNotificationCount(data.count);
      });

      // Start real-time notifications
      notificationService.startRealTimeNotifications();

      return () => {
        try {
          unsubscribe();
          notificationService.stopNotifications();
        } catch (error) {
          console.error('Error cleaning up notifications:', error);
        }
      };
    } catch (error) {
      console.error('Error initializing notifications:', error);
    }
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/admin-login');
    } catch (error) {
      console.error('Logout error:', error);
      // Force navigation anyway
      navigate('/admin-login');
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: 'BarChart3', color: 'text-blue-600' },
    { id: 'users', label: 'Users', icon: 'Users', color: 'text-green-600' },
    { id: 'shops', label: 'Shops', icon: 'Store', color: 'text-purple-600' },
    { id: 'orders', label: 'Orders', icon: 'ShoppingBag', color: 'text-orange-600' },
    { id: 'analytics', label: 'Analytics', icon: 'TrendingUp', color: 'text-indigo-600' },
    { id: 'notifications', label: 'Notifications', icon: 'Send', color: 'text-pink-600' },
    { id: 'settings', label: 'Settings', icon: 'Settings', color: 'text-gray-600' }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <DashboardOverview onTabChange={setActiveTab} />;
      case 'users':
        return <UserManagement />;
      case 'shops':
        return <ShopManagement />;
      case 'orders':
        return <OrderManagement />;
      case 'analytics':
        return <Analytics />;
      case 'notifications':
        return <NotificationCenter />;
      case 'settings':
        return <SystemSettings />;
      default:
        return <DashboardOverview onTabChange={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="flex items-center justify-between h-16 px-4 lg:px-6">
          {/* Left Side - Logo and Title */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/landing-page')}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <Icon name="ArrowLeft" size={20} />
              <span className="text-sm font-medium hidden sm:block">Back to Site</span>
            </button>
            <div className="hidden sm:block w-px h-6 bg-gray-300"></div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Icon name="Shield" size={16} color="white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">Admin Dashboard</h1>
              </div>
            </div>
          </div>

          {/* Center - Quick Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {tabs.slice(0, 4).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Right Side - Actions */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <Icon name="Menu" size={20} />
            </button>
            
            <button 
              onClick={handleLogout}
              className="hidden lg:flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
            >
              <Icon name="LogOut" size={16} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Header */}
      <div className="lg:hidden bg-white border-b border-gray-200 sticky top-16 z-40" style={{display: 'none'}}>
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Icon name="Menu" size={24} className="text-gray-600" />
            </button>
            <h1 className="text-xl font-bold text-gray-900">Admin</h1>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Profile */}
            <button 
              onClick={handleLogout}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Icon name="LogOut" size={20} className="text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col lg:pt-16 lg:z-30">
        <div className="flex flex-col flex-grow bg-white border-r border-gray-200">
          {/* Logo */}
          <div className="flex items-center h-16 px-6 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">IziShopin</h1>
            <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">Admin</span>
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
          
          {/* User Profile */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Icon name="User" size={20} className="text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">Admin User</p>
                <p className="text-xs text-gray-500 truncate">admin@izishopin.com</p>
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
              <h1 className="text-xl font-bold text-gray-900">IziShopin Admin</h1>
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
              <p className="text-gray-600 mt-1">Manage your platform with comprehensive tools</p>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="relative">
                <Icon name="Search" size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
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
    </div>
  );
};

export default AdminDashboard;

