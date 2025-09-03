import React, { useState, useEffect } from 'react';
import Icon from '../AppIcon';
import Button from './Button';
import { showToast } from './Toast';
import { useAuth } from '../../contexts/AuthContext';

const SettingsOverlay = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('appearance');
  const [settings, setSettings] = useState({
    theme: 'light',
    language: 'en',
    notifications: {
      email: true,
      push: true,
      sms: false,
      marketing: false
    },
    privacy: {
      profileVisibility: 'public',
      showOnlineStatus: true,
      allowMessages: true
    },
    display: {
      currency: 'XAF',
      timezone: 'Africa/Douala',
      dateFormat: 'DD/MM/YYYY'
    }
  });

  // Load settings from localStorage on component mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('userSettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  const handleSettingChange = (category, key, value) => {
    setSettings(prev => {
      const newSettings = {
        ...prev,
        [category]: {
          ...prev[category],
          [key]: value
        }
      };
      
      // Save to localStorage
      localStorage.setItem('userSettings', JSON.stringify(newSettings));
      
      // Apply theme change immediately
      if (category === 'theme' || key === 'theme') {
        document.documentElement.setAttribute('data-theme', value);
      }
      
      return newSettings;
    });
  };

  const handleDirectSettingChange = (key, value) => {
    setSettings(prev => {
      const newSettings = {
        ...prev,
        [key]: value
      };
      
      // Save to localStorage
      localStorage.setItem('userSettings', JSON.stringify(newSettings));
      
      // Apply theme change immediately
      if (key === 'theme') {
        document.documentElement.setAttribute('data-theme', value);
      }
      
      return newSettings;
    });
  };

  const resetSettings = () => {
    const defaultSettings = {
      theme: 'light',
      language: 'en',
      notifications: {
        email: true,
        push: true,
        sms: false,
        marketing: false
      },
      privacy: {
        profileVisibility: 'public',
        showOnlineStatus: true,
        allowMessages: true
      },
      display: {
        currency: 'XAF',
        timezone: 'Africa/Douala',
        dateFormat: 'DD/MM/YYYY'
      }
    };
    
    setSettings(defaultSettings);
    localStorage.setItem('userSettings', JSON.stringify(defaultSettings));
    document.documentElement.setAttribute('data-theme', 'light');
    showToast('Settings reset to default', 'success');
  };

  const exportSettings = () => {
    const dataStr = JSON.stringify(settings, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'izishopin-settings.json';
    link.click();
    URL.revokeObjectURL(url);
    showToast('Settings exported successfully', 'success');
  };

  const tabs = [
    { id: 'appearance', label: 'Appearance', icon: 'Palette' },
    { id: 'notifications', label: 'Notifications', icon: 'Bell' },
    { id: 'privacy', label: 'Privacy', icon: 'Shield' },
    { id: 'display', label: 'Display', icon: 'Monitor' }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white/95 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl w-full max-w-5xl max-h-[85vh] overflow-hidden animate-slideUp">
        {/* Modern Header with Glass Morphism */}
        <div className="relative bg-gradient-to-r from-teal-50 via-blue-50 to-purple-50 border-b border-white/20">
          {/* Decorative blur circles */}
          <div className="absolute top-0 left-0 w-32 h-32 bg-teal-400/20 rounded-full blur-xl -translate-y-8 -translate-x-8"></div>
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-400/20 rounded-full blur-xl -translate-y-4 translate-x-4"></div>
          
          <div className="relative flex items-center justify-between p-8">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Icon name="Settings" size={24} className="text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">Settings</h2>
                <p className="text-gray-600 text-sm mt-1">Customize your IziShopin experience</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 bg-white/60 backdrop-blur-sm hover:bg-white/80 rounded-2xl flex items-center justify-center transition-all duration-200 hover:scale-105"
            >
              <Icon name="X" size={18} className="text-gray-600" />
            </button>
          </div>
        </div>

        <div className="flex h-[calc(85vh-120px)]">
          {/* Sidebar Navigation */}
          <div className="w-64 bg-gradient-to-b from-gray-50/80 to-white/50 backdrop-blur-sm border-r border-white/20 p-6">
            {/* User Info Card */}
            <div className="mb-8 p-4 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/20 shadow-sm">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                  <span className="text-white font-bold text-sm">
                    {user?.first_name?.[0]?.toUpperCase() || 'U'}
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{user?.first_name} {user?.last_name}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
              </div>
            </div>

            {/* Navigation Tabs */}
            <nav className="space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 text-left ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-teal-500 to-blue-600 text-white shadow-lg scale-105'
                      : 'text-gray-700 hover:bg-white/60 hover:scale-102'
                  }`}
                >
                  <Icon name={tab.icon} size={18} />
                  <span className="font-medium text-sm">{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-8">
              {/* Appearance Tab */}
              {activeTab === 'appearance' && (
                <div className="space-y-8 animate-fadeIn">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                      <Icon name="Palette" size={20} className="mr-3 text-teal-600" />
                      Appearance Settings
                    </h3>
                    
                    {/* Theme Selection */}
                    <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-white/20 p-6 shadow-sm">
                      <label className="block text-sm font-semibold text-gray-800 mb-4">Theme Preference</label>
                      <div className="grid grid-cols-3 gap-4">
                        {[
                          { value: 'light', label: 'Light', icon: 'Sun', bg: 'from-yellow-400 to-orange-500' },
                          { value: 'dark', label: 'Dark', icon: 'Moon', bg: 'from-gray-700 to-gray-900' },
                          { value: 'system', label: 'System', icon: 'Monitor', bg: 'from-blue-500 to-purple-600' }
                        ].map((theme) => (
                          <button
                            key={theme.value}
                            onClick={() => handleDirectSettingChange('theme', theme.value)}
                            className={`relative group p-6 rounded-xl border-2 transition-all duration-300 hover:scale-105 ${
                              settings.theme === theme.value
                                ? 'border-teal-500 bg-teal-50 shadow-lg'
                                : 'border-gray-200 bg-white/40 hover:border-gray-300 hover:bg-white/60'
                            }`}
                          >
                            <div className={`w-12 h-12 bg-gradient-to-br ${theme.bg} rounded-xl flex items-center justify-center mx-auto mb-3`}>
                              <Icon name={theme.icon} size={20} className="text-white" />
                            </div>
                            <p className="font-medium text-gray-900 text-center">{theme.label}</p>
                            {settings.theme === theme.value && (
                              <div className="absolute -top-1 -right-1 w-6 h-6 bg-teal-500 rounded-full flex items-center justify-center">
                                <Icon name="Check" size={12} className="text-white" />
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Language Selection */}
                    <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-white/20 p-6 shadow-sm mt-6">
                      <label className="block text-sm font-semibold text-gray-800 mb-4">Language</label>
                      <select
                        value={settings.language}
                        onChange={(e) => handleDirectSettingChange('language', e.target.value)}
                        className="w-full px-4 py-3 border border-white/30 rounded-xl bg-white/60 backdrop-blur-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                      >
                        <option value="en">🇺🇸 English</option>
                        <option value="fr">🇫🇷 Français</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Notifications Tab */}
              {activeTab === 'notifications' && (
                <div className="space-y-8 animate-fadeIn">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                      <Icon name="Bell" size={20} className="mr-3 text-blue-600" />
                      Notification Preferences
                    </h3>
                    
                    <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-white/20 p-6 shadow-sm">
                      <div className="space-y-6">
                        {[
                          { key: 'email', label: 'Email Notifications', description: 'Receive order updates and promotions via email', icon: 'Mail' },
                          { key: 'push', label: 'Push Notifications', description: 'Get browser notifications for important updates', icon: 'Smartphone' },
                          { key: 'sms', label: 'SMS Notifications', description: 'Receive text messages for order status', icon: 'MessageSquare' },
                          { key: 'marketing', label: 'Marketing Communications', description: 'Get promotional offers and new product updates', icon: 'Tag' }
                        ].map((notification) => (
                          <div key={notification.key} className="flex items-center justify-between p-4 rounded-xl bg-white/40 border border-white/30">
                            <div className="flex items-start space-x-4">
                              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                                <Icon name={notification.icon} size={16} className="text-white" />
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900">{notification.label}</p>
                                <p className="text-sm text-gray-600 mt-1">{notification.description}</p>
                              </div>
                            </div>
                            <button
                              onClick={() => handleSettingChange('notifications', notification.key, !settings.notifications[notification.key])}
                              className={`relative inline-flex h-7 w-12 items-center rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 ${
                                settings.notifications[notification.key] ? 'bg-gradient-to-r from-teal-500 to-blue-600' : 'bg-gray-300'
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
                <div className="space-y-8 animate-fadeIn">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                      <Icon name="Shield" size={20} className="mr-3 text-green-600" />
                      Privacy & Security
                    </h3>
                    
                    <div className="space-y-6">
                      {/* Profile Visibility */}
                      <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-white/20 p-6 shadow-sm">
                        <label className="block text-sm font-semibold text-gray-800 mb-4">Profile Visibility</label>
                        <select
                          value={settings.privacy.profileVisibility}
                          onChange={(e) => handleSettingChange('privacy', 'profileVisibility', e.target.value)}
                          className="w-full px-4 py-3 border border-white/30 rounded-xl bg-white/60 backdrop-blur-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                        >
                          <option value="public">🌐 Public - Anyone can see your profile</option>
                          <option value="private">🔒 Private - Only you can see your profile</option>
                          <option value="friends">👥 Friends Only - Only friends can see your profile</option>
                        </select>
                      </div>

                      {/* Privacy Toggles */}
                      <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-white/20 p-6 shadow-sm">
                        <div className="space-y-6">
                          {[
                            { key: 'showOnlineStatus', label: 'Show Online Status', description: 'Let others see when you\'re active', icon: 'Activity' },
                            { key: 'allowMessages', label: 'Allow Messages', description: 'Allow other users to send you messages', icon: 'MessageCircle' }
                          ].map((privacy) => (
                            <div key={privacy.key} className="flex items-center justify-between p-4 rounded-xl bg-white/40 border border-white/30">
                              <div className="flex items-start space-x-4">
                                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                                  <Icon name={privacy.icon} size={16} className="text-white" />
                                </div>
                                <div>
                                  <p className="font-semibold text-gray-900">{privacy.label}</p>
                                  <p className="text-sm text-gray-600 mt-1">{privacy.description}</p>
                                </div>
                              </div>
                              <button
                                onClick={() => handleSettingChange('privacy', privacy.key, !settings.privacy[privacy.key])}
                                className={`relative inline-flex h-7 w-12 items-center rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${
                                  settings.privacy[privacy.key] ? 'bg-gradient-to-r from-green-500 to-emerald-600' : 'bg-gray-300'
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
                <div className="space-y-8 animate-fadeIn">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                      <Icon name="Monitor" size={20} className="mr-3 text-purple-600" />
                      Display & Format
                    </h3>
                    
                    <div className="space-y-6">
                      {/* Currency */}
                      <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-white/20 p-6 shadow-sm">
                        <label className="block text-sm font-semibold text-gray-800 mb-4">Currency</label>
                        <select
                          value={settings.display.currency}
                          onChange={(e) => handleSettingChange('display', 'currency', e.target.value)}
                          className="w-full px-4 py-3 border border-white/30 rounded-xl bg-white/60 backdrop-blur-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                        >
                          <option value="XAF">🇨🇲 XAF - Central African Franc</option>
                          <option value="USD">🇺🇸 USD - US Dollar</option>
                          <option value="EUR">🇪🇺 EUR - Euro</option>
                        </select>
                      </div>

                      {/* Date Format */}
                      <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-white/20 p-6 shadow-sm">
                        <label className="block text-sm font-semibold text-gray-800 mb-4">Date Format</label>
                        <select
                          value={settings.display.dateFormat}
                          onChange={(e) => handleSettingChange('display', 'dateFormat', e.target.value)}
                          className="w-full px-4 py-3 border border-white/30 rounded-xl bg-white/60 backdrop-blur-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                        >
                          <option value="DD/MM/YYYY">DD/MM/YYYY (25/12/2024)</option>
                          <option value="MM/DD/YYYY">MM/DD/YYYY (12/25/2024)</option>
                          <option value="YYYY-MM-DD">YYYY-MM-DD (2024-12-25)</option>
                        </select>
                      </div>

                      {/* Timezone */}
                      <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-white/20 p-6 shadow-sm">
                        <label className="block text-sm font-semibold text-gray-800 mb-4">Timezone</label>
                        <select
                          value={settings.display.timezone}
                          onChange={(e) => handleSettingChange('display', 'timezone', e.target.value)}
                          className="w-full px-4 py-3 border border-white/30 rounded-xl bg-white/60 backdrop-blur-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                        >
                          <option value="Africa/Douala">🇨🇲 Africa/Douala (GMT+1)</option>
                          <option value="Europe/London">🇬🇧 Europe/London (GMT+0)</option>
                          <option value="America/New_York">🇺🇸 America/New_York (GMT-5)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modern Footer */}
        <div className="border-t border-white/20 bg-gradient-to-r from-gray-50/90 to-white/50 backdrop-blur-sm p-6">
          <div className="flex items-center justify-between">
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={resetSettings}
                className="px-6 py-2.5 border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 rounded-xl"
              >
                <Icon name="RotateCcw" size={16} className="mr-2" />
                Reset
              </Button>
              <Button
                variant="outline"
                onClick={exportSettings}
                className="px-6 py-2.5 border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 rounded-xl"
              >
                <Icon name="Download" size={16} className="mr-2" />
                Export
              </Button>
            </div>
            <Button
              onClick={onClose}
              className="px-8 py-2.5 bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
            >
              <Icon name="Check" size={16} className="mr-2" />
              Save & Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsOverlay;

