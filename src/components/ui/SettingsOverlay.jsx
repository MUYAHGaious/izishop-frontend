import React, { useState, useEffect } from 'react';
import Icon from '../AppIcon';
import Button from './Button';
import api from '../../services/api';

const SettingsOverlay = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState({
    theme: 'light',
    language: 'en',
    notifications: {
      email: true,
      push: true,
      sms: false,
      marketing: true
    },
    privacy: {
      profileVisibility: 'public',
      showOnlineStatus: true,
      allowMessages: true
    },
    display: {
      currency: 'XAF',
      dateFormat: 'DD/MM/YYYY',
      timezone: 'Africa/Douala'
    }
  });

  // Role upgrade state
  const [user, setUser] = useState(null);
  const [selectedRole, setSelectedRole] = useState('');
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  const tabs = [
    { id: 'general', label: 'General', icon: 'Settings' },
    { id: 'account', label: 'Account', icon: 'User' },
    { id: 'notifications', label: 'Notifications', icon: 'Bell' },
    { id: 'privacy', label: 'Privacy', icon: 'Shield' },
    { id: 'display', label: 'Display', icon: 'Monitor' }
  ];

  const themes = [
    { value: 'light', label: 'Light', icon: 'Sun', gradient: 'from-yellow-400 to-orange-500' },
    { value: 'dark', label: 'Dark', icon: 'Moon', gradient: 'from-gray-700 to-gray-900' },
    { value: 'auto', label: 'Auto', icon: 'Monitor', gradient: 'from-blue-500 to-purple-600' }
  ];

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleSettingChange = (category, key, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
  };

  const handleDirectSettingChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const resetSettings = () => {
    setSettings({
      theme: 'light',
      language: 'en',
      notifications: {
        email: true,
        push: true,
        sms: false,
        marketing: true
      },
      privacy: {
        profileVisibility: 'public',
        showOnlineStatus: true,
        allowMessages: true
      },
      display: {
        currency: 'XAF',
        dateFormat: 'DD/MM/YYYY',
        timezone: 'Africa/Douala'
      }
    });
  };

  const exportSettings = () => {
    const dataStr = JSON.stringify(settings, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'settings.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const showToast = (message, type) => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
  };

  const handleRoleUpgrade = async (role) => {
    if (!role) {
      showToast('Please select a role to upgrade to', 'error');
      return;
    }

    // For premium roles (Shop Owner), create Tranzak payment request
    if (role === 'SHOP_OWNER') {
      setIsUpgrading(true);
      try {
        // Call backend to create Tranzak payment request
        const response = await api.createShopSubscription();
        
        if (response.payment_url) {
          // Redirect to Tranzak payment page
          window.location.href = response.payment_url;
        } else {
          throw new Error('No payment URL received');
        }
      } catch (error) {
        console.error('Failed to create payment request:', error);
        
        // Check if it's a Tranzak configuration error
        const errorMessage = error.response?.data?.detail || error.message || 'Failed to start subscription process';
        
        if (errorMessage.includes('authentication') || errorMessage.includes('Tranzak') || errorMessage.includes('Payment service')) {
          showToast('Payment service is currently unavailable. Please contact support for manual upgrade.', 'error');
        } else {
          showToast(errorMessage, 'error');
        }
        setIsUpgrading(false);
      }
      return;
    }

    // For free roles, upgrade directly
    setIsUpgrading(true);
    try {
      const response = await api.upgradeUserRole(role);
      showToast(response.message || 'Role upgraded successfully!', 'success');
      setSelectedRole('');
    } catch (error) {
      console.error('Role upgrade failed:', error);
      showToast(error.message || 'Failed to upgrade role', 'error');
    } finally {
      setIsUpgrading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-[9999] animate-fadeIn flex items-center justify-center p-2 sm:p-4" style={{ backdropFilter: 'blur(8px)', zIndex: 9999 }}>
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg w-full max-w-4xl max-h-[85vh] sm:max-h-[80vh] overflow-hidden flex flex-col transition-all duration-300 ease-in-out" style={{ animation: 'fadeIn 0.3s ease-out, slideUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)', transform: 'translateY(500px)' }}>
        {/* Clean Header */}
        <div className="bg-gray-50 border-b border-gray-200">
          <div className="p-6 sm:p-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  Settings
                </h2>
                <p className="text-gray-600 mt-1">Customize your experience</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Icon name="X" size={24} className="text-gray-600" />
              </button>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 bg-white">
          <div className="flex overflow-x-auto scrollbar-hide">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-6 py-4 text-sm font-medium transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'text-gray-900 border-b-2 border-gray-900 bg-gray-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Icon name={tab.icon} size={18} className="mr-2" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8">
          <div className="transition-all duration-300 ease-in-out">
            {/* General Tab */}
            {activeTab === 'general' && (
              <div className="space-y-6 animate-fadeIn">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <Icon name="Settings" size={20} className="mr-3 text-gray-600" />
                  General Settings
                </h3>
                
                {/* Theme Selection */}
                <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
                  <label className="block text-sm font-semibold text-gray-800 mb-4">Theme</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {themes.map((theme) => (
                      <button
                        key={theme.value}
                        onClick={() => handleDirectSettingChange('theme', theme.value)}
                        className={`relative p-4 rounded-lg border-2 transition-colors ${
                          settings.theme === theme.value
                            ? 'border-gray-900 bg-gray-100'
                            : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                      >
                        <div className="w-12 h-12 mx-auto mb-3 rounded-lg bg-gray-600 flex items-center justify-center">
                          <Icon name={theme.icon} size={20} className="text-white" />
                        </div>
                        <p className="font-medium text-gray-900 text-center">{theme.label}</p>
                        {settings.theme === theme.value && (
                          <div className="absolute -top-1 -right-1 w-6 h-6 bg-gray-900 rounded-full flex items-center justify-center">
                            <Icon name="Check" size={12} className="text-white" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Language Selection */}
                <div className="bg-gray-50 rounded-lg border border-gray-200 p-6 mt-4">
                  <label className="block text-sm font-semibold text-gray-800 mb-4">Language</label>
                    <select
                      value={settings.language}
                      onChange={(e) => handleDirectSettingChange('language', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-colors"
                    >
                      <option value="en">English</option>
                      <option value="fr">Français</option>
                    </select>
                </div>
              </div>
            </div>
          )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div className="space-y-6 animate-fadeIn">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <Icon name="Bell" size={20} className="mr-3 text-gray-600" />
                  Notification Preferences
                </h3>
                
                <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
                  <div className="space-y-6">
                    {[
                      { key: 'email', label: 'Email Notifications', description: 'Receive order updates and promotions via email', icon: 'Mail' },
                      { key: 'push', label: 'Push Notifications', description: 'Get browser notifications for important updates', icon: 'Smartphone' },
                      { key: 'sms', label: 'SMS Notifications', description: 'Receive text messages for order status', icon: 'MessageSquare' },
                      { key: 'marketing', label: 'Marketing Communications', description: 'Get promotional offers and new product updates', icon: 'Tag' }
                    ].map((notification) => (
                      <div key={notification.key} className="flex items-center justify-between p-4 rounded-lg bg-white border border-gray-200">
                        <div className="flex items-start space-x-4">
                          <div className="w-10 h-10 bg-gray-600 rounded-lg flex items-center justify-center">
                            <Icon name={notification.icon} size={16} className="text-white" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{notification.label}</p>
                            <p className="text-sm text-gray-600 mt-1">{notification.description}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleSettingChange('notifications', notification.key, !settings.notifications[notification.key])}
                          className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 ${
                            settings.notifications[notification.key] ? 'bg-gray-900' : 'bg-gray-300'
                          }`}
                        >
                          <span
                            className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition-transform duration-300 ${
                              settings.notifications[notification.key] ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

            {/* Privacy Tab */}
            {activeTab === 'privacy' && (
              <div className="space-y-6 animate-fadeIn">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <Icon name="Shield" size={20} className="mr-3 text-gray-600" />
                  Privacy & Security
                </h3>
                
                <div className="space-y-4">
                  {/* Profile Visibility */}
                  <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
                    <label className="block text-sm font-semibold text-gray-800 mb-4">Profile Visibility</label>
                    <select
                      value={settings.privacy.profileVisibility}
                      onChange={(e) => handleSettingChange('privacy', 'profileVisibility', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-colors"
                    >
                      <option value="public">Public - Anyone can see your profile</option>
                      <option value="private">Private - Only you can see your profile</option>
                      <option value="friends">Friends Only - Only friends can see your profile</option>
                    </select>
                  </div>

                  {/* Privacy Toggles */}
                  <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
                    <div className="space-y-6">
                      {[
                        { key: 'showOnlineStatus', label: 'Show Online Status', description: 'Let others see when you\'re active', icon: 'Activity' },
                        { key: 'allowMessages', label: 'Allow Messages', description: 'Allow other users to send you messages', icon: 'MessageCircle' }
                      ].map((privacy) => (
                        <div key={privacy.key} className="flex items-center justify-between p-4 rounded-lg bg-white border border-gray-200">
                          <div className="flex items-start space-x-4">
                            <div className="w-10 h-10 bg-gray-600 rounded-lg flex items-center justify-center">
                              <Icon name={privacy.icon} size={16} className="text-white" />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">{privacy.label}</p>
                              <p className="text-sm text-gray-600 mt-1">{privacy.description}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleSettingChange('privacy', privacy.key, !settings.privacy[privacy.key])}
                            className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 ${
                              settings.privacy[privacy.key] ? 'bg-gray-900' : 'bg-gray-300'
                            }`}
                          >
                            <span
                              className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition-transform duration-300 ${
                                settings.privacy[privacy.key] ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

            {/* Display Tab */}
            {activeTab === 'display' && (
              <div className="space-y-6 animate-fadeIn">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <Icon name="Monitor" size={20} className="mr-3 text-gray-600" />
                  Display & Format
                </h3>
                
                <div className="space-y-4">
                  {/* Currency */}
                  <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
                    <label className="block text-sm font-semibold text-gray-800 mb-4">Currency</label>
                    <select
                      value={settings.display.currency}
                      onChange={(e) => handleSettingChange('display', 'currency', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-colors"
                    >
                      <option value="XAF">XAF - Central African Franc</option>
                      <option value="USD">USD - US Dollar</option>
                      <option value="EUR">EUR - Euro</option>
                    </select>
                  </div>

                  {/* Date Format */}
                  <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
                    <label className="block text-sm font-semibold text-gray-800 mb-4">Date Format</label>
                    <select
                      value={settings.display.dateFormat}
                      onChange={(e) => handleSettingChange('display', 'dateFormat', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-colors"
                    >
                      <option value="DD/MM/YYYY">DD/MM/YYYY (25/12/2024)</option>
                      <option value="MM/DD/YYYY">MM/DD/YYYY (12/25/2024)</option>
                      <option value="YYYY-MM-DD">YYYY-MM-DD (2024-12-25)</option>
                    </select>
                  </div>

                  {/* Timezone */}
                  <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
                    <label className="block text-sm font-semibold text-gray-800 mb-4">Timezone</label>
                    <select
                      value={settings.display.timezone}
                      onChange={(e) => handleSettingChange('display', 'timezone', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-colors"
                    >
                      <option value="Africa/Douala">Africa/Douala (GMT+1)</option>
                      <option value="Europe/London">Europe/London (GMT+0)</option>
                      <option value="America/New_York">America/New_York (GMT-5)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

            {/* Account Tab */}
            {activeTab === 'account' && (
              <div className="space-y-6 animate-fadeIn">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                    <Icon name="User" size={20} className="mr-3 text-gray-600" />
                    Account & Role
                  </h3>
                  
                  <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
                    <div className="mb-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">Current Role</h4>
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gray-600 rounded-lg flex items-center justify-center">
                          <Icon name="User" size={16} className="text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">Customer</p>
                          <p className="text-sm text-gray-600">Basic account with shopping features</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">Upgrade Your Account</h4>
                      <div className="space-y-4">
                        <div className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
                          <div className="flex items-start space-x-4">
                            <div className="w-12 h-12 bg-gray-600 rounded-lg flex items-center justify-center">
                              <Icon name="Briefcase" size={20} className="text-white" />
                            </div>
                            <div className="flex-1">
                              <h5 className="font-semibold text-gray-900">Casual Seller</h5>
                              <p className="text-sm text-gray-600 mb-2">Sell individual items - no monthly fees!</p>
                              <ul className="text-xs text-gray-500 space-y-1">
                                <li>• Sell new, used, or any items</li>
                                <li>• No monthly subscription</li>
                                <li>• Pay only transaction fees</li>
                              </ul>
                            </div>
                            <Button
                              onClick={() => handleRoleUpgrade('CASUAL_SELLER')}
                              disabled={isUpgrading}
                              className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-lg text-sm disabled:opacity-50"
                            >
                              {isUpgrading ? 'Upgrading...' : 'Upgrade'}
                            </Button>
                          </div>
                        </div>

                        <div className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
                          <div className="flex items-start space-x-4">
                            <div className="w-12 h-12 bg-gray-600 rounded-lg flex items-center justify-center">
                              <Icon name="Truck" size={20} className="text-white" />
                            </div>
                            <div className="flex-1">
                              <h5 className="font-semibold text-gray-900">Delivery Agent</h5>
                              <p className="text-sm text-gray-600 mb-2">Earn money delivering orders</p>
                              <ul className="text-xs text-gray-500 space-y-1">
                                <li>• Flexible working hours</li>
                                <li>• Competitive delivery rates</li>
                                <li>• Work when you want</li>
                              </ul>
                            </div>
                            <Button
                              onClick={() => handleRoleUpgrade('DELIVERY_AGENT')}
                              disabled={isUpgrading}
                              className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-lg text-sm disabled:opacity-50"
                            >
                              {isUpgrading ? 'Upgrading...' : 'Upgrade'}
                            </Button>
                          </div>
                        </div>

                        <div className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
                          <div className="flex items-start space-x-4">
                            <div className="w-12 h-12 bg-gray-600 rounded-lg flex items-center justify-center">
                              <Icon name="Store" size={20} className="text-white" />
                            </div>
                            <div className="flex-1">
                              <h5 className="font-semibold text-gray-900">Shop Owner (Premium)</h5>
                              <p className="text-sm text-gray-600 mb-2">Professional online store with premium features</p>
                              <ul className="text-xs text-gray-500 space-y-1">
                                <li>• Your own branded shop</li>
                                <li>• Advanced inventory management</li>
                                <li>• Marketing tools & analytics</li>
                                <li>• $29.99/month</li>
                              </ul>
                            </div>
                            <Button
                              onClick={() => handleRoleUpgrade('SHOP_OWNER')}
                              disabled={isUpgrading}
                              className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-lg text-sm disabled:opacity-50"
                            >
                              {isUpgrading ? 'Processing...' : 'Subscribe ($29.99/mo)'}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Clean Footer */}
        <div className="border-t border-gray-200 bg-gray-50 p-4">
          <div className="flex items-center justify-between">
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={resetSettings}
                className="px-6 py-2.5 border-gray-300 hover:bg-gray-100 hover:border-gray-400 transition-colors rounded-lg"
              >
                <Icon name="RotateCcw" size={16} className="mr-2" />
                Reset
              </Button>
              <Button
                variant="outline"
                onClick={exportSettings}
                className="px-6 py-2.5 border-gray-300 hover:bg-gray-100 hover:border-gray-400 transition-colors rounded-lg"
              >
                <Icon name="Download" size={16} className="mr-2" />
                Export
              </Button>
            </div>
            <Button
              onClick={onClose}
              className="px-8 py-2.5 bg-gray-900 hover:bg-gray-800 text-white rounded-lg shadow-sm hover:shadow-md transition-colors"
            >
              <Icon name="Check" size={16} className="mr-2" />
              Save & Close
            </Button>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {toast.show && (
        <div className="fixed top-4 right-4 z-[10000] animate-fadeIn">
          <div className={`px-6 py-3 rounded-lg shadow-lg ${
            toast.type === 'success' 
              ? 'bg-green-500 text-white' 
              : toast.type === 'error' 
              ? 'bg-red-500 text-white' 
              : 'bg-gray-500 text-white'
          }`}>
            <div className="flex items-center space-x-2">
              <Icon 
                name={toast.type === 'success' ? 'Check' : 'X'} 
                size={16} 
              />
              <span className="font-medium">{toast.message}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsOverlay;