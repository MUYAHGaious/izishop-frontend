import React, { useState, useEffect } from 'react';
import Icon from '../AppIcon';
import Button from './Button';
import { showToast } from './Toast';

const SettingsOverlay = ({ isOpen, onClose }) => {
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
    link.download = 'izishop-settings.json';
    link.click();
    URL.revokeObjectURL(url);
    showToast('Settings exported successfully', 'success');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Settings</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Customize your IziShop experience</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <Icon name="X" size={20} className="text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Settings Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)] space-y-8">
          {/* Appearance */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Appearance</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Theme
                </label>
                <div className="flex space-x-3">
                  {[
                    { value: 'light', label: 'Light', icon: 'Sun' },
                    { value: 'dark', label: 'Dark', icon: 'Moon' },
                    { value: 'system', label: 'System', icon: 'Monitor' }
                  ].map((theme) => (
                    <button
                      key={theme.value}
                      onClick={() => handleDirectSettingChange('theme', theme.value)}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
                        settings.theme === theme.value
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                          : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      <Icon name={theme.icon} size={16} />
                      <span className="text-sm">{theme.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Language
                </label>
                <select
                  value={settings.language}
                  onChange={(e) => handleDirectSettingChange('language', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="en">English</option>
                  <option value="fr">Français</option>
                </select>
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Notifications</h3>
            <div className="space-y-4">
              {[
                { key: 'email', label: 'Email Notifications', description: 'Receive notifications via email' },
                { key: 'push', label: 'Push Notifications', description: 'Receive browser push notifications' },
                { key: 'sms', label: 'SMS Notifications', description: 'Receive notifications via SMS' },
                { key: 'marketing', label: 'Marketing Communications', description: 'Receive promotional emails and offers' }
              ].map((notification) => (
                <div key={notification.key} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{notification.label}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">{notification.description}</p>
                  </div>
                  <button
                    onClick={() => handleSettingChange('notifications', notification.key, !settings.notifications[notification.key])}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.notifications[notification.key] ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.notifications[notification.key] ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Privacy */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Privacy</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Profile Visibility
                </label>
                <select
                  value={settings.privacy.profileVisibility}
                  onChange={(e) => handleSettingChange('privacy', 'profileVisibility', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                  <option value="friends">Friends Only</option>
                </select>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Show Online Status</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Let others see when you're online</p>
                </div>
                <button
                  onClick={() => handleSettingChange('privacy', 'showOnlineStatus', !settings.privacy.showOnlineStatus)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.privacy.showOnlineStatus ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.privacy.showOnlineStatus ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Allow Messages</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Allow others to send you messages</p>
                </div>
                <button
                  onClick={() => handleSettingChange('privacy', 'allowMessages', !settings.privacy.allowMessages)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.privacy.allowMessages ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.privacy.allowMessages ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Display */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Display</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Currency
                </label>
                <select
                  value={settings.display.currency}
                  onChange={(e) => handleSettingChange('display', 'currency', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="XAF">XAF (Central African Franc)</option>
                  <option value="USD">USD (US Dollar)</option>
                  <option value="EUR">EUR (Euro)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Date Format
                </label>
                <select
                  value={settings.display.dateFormat}
                  onChange={(e) => handleSettingChange('display', 'dateFormat', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                  <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <div className="flex space-x-3">
            <Button
              variant="outline"
              size="sm"
              onClick={resetSettings}
            >
              Reset to Default
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={exportSettings}
            >
              Export Settings
            </Button>
          </div>
          <Button
            onClick={onClose}
          >
            Done
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SettingsOverlay;

