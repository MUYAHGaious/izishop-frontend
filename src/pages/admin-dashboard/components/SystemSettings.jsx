import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const SystemSettings = () => {
  const [activeSection, setActiveSection] = useState('general');
  const [settings, setSettings] = useState({
    general: {
      siteName: 'IziShopin',
      siteDescription: 'B2B Marketplace for Cameroon',
      maintenanceMode: false,
      allowRegistration: true,
      emailVerificationRequired: true,
      defaultLanguage: 'en',
      defaultCurrency: 'XAF',
      timezone: 'Africa/Douala'
    },
    payment: {
      enableMobileMoney: true,
      enableBankTransfer: true,
      enableCreditCard: false,
      commissionRate: 5.0,
      minimumWithdrawal: 10000,
      autoPayoutEnabled: false,
      payoutSchedule: 'weekly'
    },
    notifications: {
      emailNotifications: true,
      smsNotifications: true,
      pushNotifications: true,
      orderNotifications: true,
      userRegistrationNotifications: true,
      systemAlerts: true,
      marketingEmails: false
    },
    security: {
      twoFactorAuth: false,
      sessionTimeout: 30,
      maxLoginAttempts: 5,
      passwordMinLength: 8,
      requireSpecialChars: true,
      ipWhitelist: '',
      enableAuditLog: true
    },
    shipping: {
      enableLocalDelivery: true,
      enableNationalShipping: true,
      enableInternationalShipping: false,
      defaultShippingCost: 2500,
      freeShippingThreshold: 50000,
      maxDeliveryDays: 7
    }
  });

  const sections = [
    { id: 'general', label: 'General', icon: 'Settings' },
    { id: 'payment', label: 'Payment', icon: 'CreditCard' },
    { id: 'notifications', label: 'Notifications', icon: 'Bell' },
    { id: 'security', label: 'Security', icon: 'Shield' },
    { id: 'shipping', label: 'Shipping', icon: 'Truck' }
  ];

  const handleSettingChange = (section, key, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
  };

  const handleSaveSettings = () => {
    console.log('Saving settings:', settings);
    // Implement save functionality here
  };

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Site Name</label>
        <input
          type="text"
          value={settings.general.siteName}
          onChange={(e) => handleSettingChange('general', 'siteName', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Site Description</label>
        <textarea
          value={settings.general.siteDescription}
          onChange={(e) => handleSettingChange('general', 'siteDescription', e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Default Language</label>
          <select
            value={settings.general.defaultLanguage}
            onChange={(e) => handleSettingChange('general', 'defaultLanguage', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          >
            <option value="en">English</option>
            <option value="fr">French</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Default Currency</label>
          <select
            value={settings.general.defaultCurrency}
            onChange={(e) => handleSettingChange('general', 'defaultCurrency', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          >
            <option value="XAF">XAF (Central African Franc)</option>
            <option value="USD">USD (US Dollar)</option>
            <option value="EUR">EUR (Euro)</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
        <select
          value={settings.general.timezone}
          onChange={(e) => handleSettingChange('general', 'timezone', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
        >
          <option value="Africa/Douala">Africa/Douala</option>
          <option value="UTC">UTC</option>
        </select>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-900">Maintenance Mode</p>
            <p className="text-sm text-gray-500">Temporarily disable the site for maintenance</p>
          </div>
          <button
            onClick={() => handleSettingChange('general', 'maintenanceMode', !settings.general.maintenanceMode)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              settings.general.maintenanceMode ? 'bg-teal-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings.general.maintenanceMode ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-900">Allow Registration</p>
            <p className="text-sm text-gray-500">Allow new users to register</p>
          </div>
          <button
            onClick={() => handleSettingChange('general', 'allowRegistration', !settings.general.allowRegistration)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              settings.general.allowRegistration ? 'bg-teal-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings.general.allowRegistration ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-900">Email Verification Required</p>
            <p className="text-sm text-gray-500">Require email verification for new accounts</p>
          </div>
          <button
            onClick={() => handleSettingChange('general', 'emailVerificationRequired', !settings.general.emailVerificationRequired)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              settings.general.emailVerificationRequired ? 'bg-teal-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings.general.emailVerificationRequired ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );

  const renderPaymentSettings = () => (
    <div className="space-y-6">
      <div>
        <h4 className="text-lg font-medium text-gray-900 mb-4">Payment Methods</h4>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Icon name="Smartphone" size={20} className="text-green-600" />
              <div>
                <p className="font-medium text-gray-900">Mobile Money</p>
                <p className="text-sm text-gray-500">MTN Mobile Money, Orange Money</p>
              </div>
            </div>
            <button
              onClick={() => handleSettingChange('payment', 'enableMobileMoney', !settings.payment.enableMobileMoney)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.payment.enableMobileMoney ? 'bg-teal-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.payment.enableMobileMoney ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Icon name="Building" size={20} className="text-teal-600" />
              <div>
                <p className="font-medium text-gray-900">Bank Transfer</p>
                <p className="text-sm text-gray-500">Direct bank transfers</p>
              </div>
            </div>
            <button
              onClick={() => handleSettingChange('payment', 'enableBankTransfer', !settings.payment.enableBankTransfer)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.payment.enableBankTransfer ? 'bg-teal-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.payment.enableBankTransfer ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Icon name="CreditCard" size={20} className="text-teal-600" />
              <div>
                <p className="font-medium text-gray-900">Credit/Debit Cards</p>
                <p className="text-sm text-gray-500">Visa, Mastercard</p>
              </div>
            </div>
            <button
              onClick={() => handleSettingChange('payment', 'enableCreditCard', !settings.payment.enableCreditCard)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.payment.enableCreditCard ? 'bg-teal-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.payment.enableCreditCard ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Commission Rate (%)</label>
          <input
            type="number"
            step="0.1"
            value={settings.payment.commissionRate}
            onChange={(e) => handleSettingChange('payment', 'commissionRate', parseFloat(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Withdrawal (XAF)</label>
          <input
            type="number"
            value={settings.payment.minimumWithdrawal}
            onChange={(e) => handleSettingChange('payment', 'minimumWithdrawal', parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Payout Schedule</label>
        <select
          value={settings.payment.payoutSchedule}
          onChange={(e) => handleSettingChange('payment', 'payoutSchedule', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
        >
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
        </select>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <p className="font-medium text-gray-900">Auto Payout</p>
          <p className="text-sm text-gray-500">Automatically process payouts based on schedule</p>
        </div>
        <button
          onClick={() => handleSettingChange('payment', 'autoPayoutEnabled', !settings.payment.autoPayoutEnabled)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            settings.payment.autoPayoutEnabled ? 'bg-teal-600' : 'bg-gray-200'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              settings.payment.autoPayoutEnabled ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-900">Email Notifications</p>
            <p className="text-sm text-gray-500">Send notifications via email</p>
          </div>
          <button
            onClick={() => handleSettingChange('notifications', 'emailNotifications', !settings.notifications.emailNotifications)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              settings.notifications.emailNotifications ? 'bg-teal-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings.notifications.emailNotifications ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-900">SMS Notifications</p>
            <p className="text-sm text-gray-500">Send notifications via SMS</p>
          </div>
          <button
            onClick={() => handleSettingChange('notifications', 'smsNotifications', !settings.notifications.smsNotifications)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              settings.notifications.smsNotifications ? 'bg-teal-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings.notifications.smsNotifications ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-900">Push Notifications</p>
            <p className="text-sm text-gray-500">Send push notifications to mobile apps</p>
          </div>
          <button
            onClick={() => handleSettingChange('notifications', 'pushNotifications', !settings.notifications.pushNotifications)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              settings.notifications.pushNotifications ? 'bg-teal-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings.notifications.pushNotifications ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-900">Order Notifications</p>
            <p className="text-sm text-gray-500">Notify about new orders and status changes</p>
          </div>
          <button
            onClick={() => handleSettingChange('notifications', 'orderNotifications', !settings.notifications.orderNotifications)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              settings.notifications.orderNotifications ? 'bg-teal-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings.notifications.orderNotifications ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-900">User Registration Notifications</p>
            <p className="text-sm text-gray-500">Notify about new user registrations</p>
          </div>
          <button
            onClick={() => handleSettingChange('notifications', 'userRegistrationNotifications', !settings.notifications.userRegistrationNotifications)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              settings.notifications.userRegistrationNotifications ? 'bg-teal-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings.notifications.userRegistrationNotifications ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-900">System Alerts</p>
            <p className="text-sm text-gray-500">Critical system notifications</p>
          </div>
          <button
            onClick={() => handleSettingChange('notifications', 'systemAlerts', !settings.notifications.systemAlerts)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              settings.notifications.systemAlerts ? 'bg-teal-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings.notifications.systemAlerts ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-900">Marketing Emails</p>
            <p className="text-sm text-gray-500">Send promotional and marketing emails</p>
          </div>
          <button
            onClick={() => handleSettingChange('notifications', 'marketingEmails', !settings.notifications.marketingEmails)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              settings.notifications.marketingEmails ? 'bg-teal-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings.notifications.marketingEmails ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Session Timeout (minutes)</label>
          <input
            type="number"
            value={settings.security.sessionTimeout}
            onChange={(e) => handleSettingChange('security', 'sessionTimeout', parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Max Login Attempts</label>
          <input
            type="number"
            value={settings.security.maxLoginAttempts}
            onChange={(e) => handleSettingChange('security', 'maxLoginAttempts', parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Password Minimum Length</label>
          <input
            type="number"
            value={settings.security.passwordMinLength}
            onChange={(e) => handleSettingChange('security', 'passwordMinLength', parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">IP Whitelist</label>
        <textarea
          value={settings.security.ipWhitelist}
          onChange={(e) => handleSettingChange('security', 'ipWhitelist', e.target.value)}
          placeholder="Enter IP addresses separated by commas"
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
        />
        <p className="text-sm text-gray-500 mt-1">Leave empty to allow all IPs</p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-900">Two-Factor Authentication</p>
            <p className="text-sm text-gray-500">Require 2FA for admin accounts</p>
          </div>
          <button
            onClick={() => handleSettingChange('security', 'twoFactorAuth', !settings.security.twoFactorAuth)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              settings.security.twoFactorAuth ? 'bg-teal-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings.security.twoFactorAuth ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-900">Require Special Characters</p>
            <p className="text-sm text-gray-500">Require special characters in passwords</p>
          </div>
          <button
            onClick={() => handleSettingChange('security', 'requireSpecialChars', !settings.security.requireSpecialChars)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              settings.security.requireSpecialChars ? 'bg-teal-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings.security.requireSpecialChars ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-900">Enable Audit Log</p>
            <p className="text-sm text-gray-500">Log all admin actions for security</p>
          </div>
          <button
            onClick={() => handleSettingChange('security', 'enableAuditLog', !settings.security.enableAuditLog)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              settings.security.enableAuditLog ? 'bg-teal-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings.security.enableAuditLog ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );

  const renderShippingSettings = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-900">Local Delivery</p>
            <p className="text-sm text-gray-500">Enable delivery within the same city</p>
          </div>
          <button
            onClick={() => handleSettingChange('shipping', 'enableLocalDelivery', !settings.shipping.enableLocalDelivery)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              settings.shipping.enableLocalDelivery ? 'bg-teal-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings.shipping.enableLocalDelivery ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-900">National Shipping</p>
            <p className="text-sm text-gray-500">Enable shipping within Cameroon</p>
          </div>
          <button
            onClick={() => handleSettingChange('shipping', 'enableNationalShipping', !settings.shipping.enableNationalShipping)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              settings.shipping.enableNationalShipping ? 'bg-teal-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings.shipping.enableNationalShipping ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-900">International Shipping</p>
            <p className="text-sm text-gray-500">Enable international shipping</p>
          </div>
          <button
            onClick={() => handleSettingChange('shipping', 'enableInternationalShipping', !settings.shipping.enableInternationalShipping)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              settings.shipping.enableInternationalShipping ? 'bg-teal-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings.shipping.enableInternationalShipping ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Default Shipping Cost (XAF)</label>
          <input
            type="number"
            value={settings.shipping.defaultShippingCost}
            onChange={(e) => handleSettingChange('shipping', 'defaultShippingCost', parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Free Shipping Threshold (XAF)</label>
          <input
            type="number"
            value={settings.shipping.freeShippingThreshold}
            onChange={(e) => handleSettingChange('shipping', 'freeShippingThreshold', parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Max Delivery Days</label>
          <input
            type="number"
            value={settings.shipping.maxDeliveryDays}
            onChange={(e) => handleSettingChange('shipping', 'maxDeliveryDays', parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          />
        </div>
      </div>
    </div>
  );

  const renderSectionContent = () => {
    switch (activeSection) {
      case 'general':
        return renderGeneralSettings();
      case 'payment':
        return renderPaymentSettings();
      case 'notifications':
        return renderNotificationSettings();
      case 'security':
        return renderSecuritySettings();
      case 'shipping':
        return renderShippingSettings();
      default:
        return renderGeneralSettings();
    }
  };

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">System Settings</h2>
          <p className="text-gray-600">Configure platform settings and preferences</p>
        </div>
        <button
          onClick={handleSaveSettings}
          className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors flex items-center space-x-2"
        >
          <Icon name="Save" size={16} />
          <span>Save Changes</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Settings Navigation */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <nav className="space-y-2">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    activeSection === section.id
                      ? 'bg-teal-50 text-teal-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon name={section.icon} size={18} />
                  <span>{section.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              {sections.find(s => s.id === activeSection)?.label} Settings
            </h3>
            {renderSectionContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemSettings;

