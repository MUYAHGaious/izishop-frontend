import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import { showToast } from '../../../components/ui/Toast';
import api from '../../../services/api';

const ShopSettings = ({ shopData, setShopData }) => {
  const [activeSection, setActiveSection] = useState('general');
  const [settings, setSettings] = useState({
    general: {
      shopName: shopData.name || 'Tech Store Pro',
      shopDescription: 'Premium electronics and gadgets store in Cameroon',
      shopLogo: '',
      shopBanner: '',
      contactEmail: 'contact@techstorepro.cm',
      contactPhone: '+237 6XX XXX XXX',
      address: '123 Main Street, Douala, Cameroon',
      businessHours: {
        monday: { open: '08:00', close: '18:00', closed: false },
        tuesday: { open: '08:00', close: '18:00', closed: false },
        wednesday: { open: '08:00', close: '18:00', closed: false },
        thursday: { open: '08:00', close: '18:00', closed: false },
        friday: { open: '08:00', close: '18:00', closed: false },
        saturday: { open: '09:00', close: '17:00', closed: false },
        sunday: { open: '10:00', close: '16:00', closed: false }
      }
    },
    shipping: {
      enableLocalDelivery: true,
      localDeliveryFee: 2500,
      localDeliveryRadius: 10,
      enableNationalShipping: true,
      nationalShippingFee: 5000,
      freeShippingThreshold: 50000,
      processingTime: 2,
      estimatedDeliveryTime: '3-7 business days',
      shippingZones: [
        { name: 'Douala', fee: 2500, enabled: true },
        { name: 'Yaoundé', fee: 3500, enabled: true },
        { name: 'Bamenda', fee: 4500, enabled: true },
        { name: 'Garoua', fee: 5500, enabled: true }
      ]
    },
    payment: {
      enableMobileMoney: true,
      enableBankTransfer: true,
      enableCashOnDelivery: true,
      enableCreditCard: false,
      mobileMoneyProviders: {
        mtn: true,
        orange: true,
        camtel: false
      },
      bankDetails: {
        bankName: 'Afriland First Bank',
        accountNumber: '12345678901',
        accountName: 'Tech Store Pro'
      },
      paymentTerms: 'Payment due within 24 hours of order confirmation'
    },
    notifications: {
      emailNotifications: true,
      smsNotifications: true,
      orderNotifications: true,
      lowStockAlerts: true,
      customerReviewAlerts: true,
      promotionalEmails: false,
      notificationEmail: 'notifications@techstorepro.cm',
      notificationPhone: '+237 6XX XXX XXX'
    },
    policies: {
      returnPolicy: '30-day return policy for unopened items',
      refundPolicy: 'Full refund within 7 days of return approval',
      privacyPolicy: 'We protect customer data according to GDPR standards',
      termsOfService: 'Standard terms and conditions apply',
      shippingPolicy: 'Items shipped within 2 business days',
      warrantyPolicy: 'Manufacturer warranty applies to all products'
    },
    seo: {
      metaTitle: 'Tech Store Pro - Premium Electronics in Cameroon',
      metaDescription: 'Shop the latest electronics, smartphones, laptops and gadgets at Tech Store Pro. Fast delivery across Cameroon.',
      metaKeywords: 'electronics, smartphones, laptops, gadgets, Cameroon, Douala',
      googleAnalyticsId: '',
      facebookPixelId: '',
      enableSitemap: true,
      enableRobotsTxt: true
    }
  });

  const sections = [
    { id: 'general', label: 'General', icon: 'Settings' },
    { id: 'shipping', label: 'Shipping', icon: 'Truck' },
    { id: 'payment', label: 'Payment', icon: 'CreditCard' },
    { id: 'notifications', label: 'Notifications', icon: 'Bell' },
    { id: 'policies', label: 'Policies', icon: 'FileText' },
    { id: 'seo', label: 'SEO & Marketing', icon: 'Search' }
  ];

  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  const handleSettingChange = (section, key, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
  };

  const handleNestedSettingChange = (section, parentKey, key, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [parentKey]: {
          ...prev[section][parentKey],
          [key]: value
        }
      }
    }));
  };

  const handleBusinessHoursChange = (day, field, value) => {
    setSettings(prev => ({
      ...prev,
      general: {
        ...prev.general,
        businessHours: {
          ...prev.general.businessHours,
          [day]: {
            ...prev.general.businessHours[day],
            [field]: value
          }
        }
      }
    }));
  };

  const handleShippingZoneChange = (index, field, value) => {
    setSettings(prev => ({
      ...prev,
      shipping: {
        ...prev.shipping,
        shippingZones: prev.shipping.shippingZones.map((zone, i) => 
          i === index ? { ...zone, [field]: value } : zone
        )
      }
    }));
  };

  const handleSaveSettings = async () => {
    try {
      console.log('Saving settings:', settings);
      
      // Save notification preferences via API
      if (activeSection === 'notifications') {
        const notificationPrefs = {
          email_notifications: settings.notifications.emailNotifications,
          sms_notifications: settings.notifications.smsNotifications,
          order_notifications: settings.notifications.orderNotifications,
          low_stock_alerts: settings.notifications.lowStockAlerts,
          review_alerts: settings.notifications.customerReviewAlerts,
          promotional_emails: settings.notifications.promotionalEmails,
          notification_email: settings.notifications.notificationEmail,
          notification_phone: settings.notifications.notificationPhone
        };
        
        // Save to backend API
        await api.updateNotificationPreferences(notificationPrefs);
        showToast.success('Notification settings saved successfully');
      }
      
      // Update shop data for general settings
      if (activeSection === 'general') {
        setShopData(prev => ({
          ...prev,
          name: settings.general.shopName
        }));
        showToast.success('General settings saved successfully');
      }
      
      // Add more section-specific save logic here
      if (activeSection === 'payment') {
        showToast.success('Payment settings saved successfully');
      }
      
      if (activeSection === 'shipping') {
        showToast.success('Shipping settings saved successfully');
      }
      
    } catch (error) {
      console.error('Error saving settings:', error);
      showToast({
        type: 'error',
        message: 'Failed to save settings. Please try again.',
        duration: 3000
      });
    }
  };

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Shop Name</label>
          <input
            type="text"
            value={settings.general.shopName}
            onChange={(e) => handleSettingChange('general', 'shopName', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Contact Email</label>
          <input
            type="email"
            value={settings.general.contactEmail}
            onChange={(e) => handleSettingChange('general', 'contactEmail', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Shop Description</label>
        <textarea
          value={settings.general.shopDescription}
          onChange={(e) => handleSettingChange('general', 'shopDescription', e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Contact Phone</label>
          <input
            type="tel"
            value={settings.general.contactPhone}
            onChange={(e) => handleSettingChange('general', 'contactPhone', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
          <input
            type="text"
            value={settings.general.address}
            onChange={(e) => handleSettingChange('general', 'address', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div>
        <h4 className="text-lg font-medium text-gray-900 mb-4">Business Hours</h4>
        <div className="space-y-3">
          {days.map(day => (
            <div key={day} className="flex items-center space-x-4">
              <div className="w-24">
                <span className="text-sm font-medium text-gray-700 capitalize">{day}</span>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={!settings.general.businessHours[day].closed}
                  onChange={(e) => handleBusinessHoursChange(day, 'closed', !e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-600">Open</span>
              </div>
              {!settings.general.businessHours[day].closed && (
                <>
                  <input
                    type="time"
                    value={settings.general.businessHours[day].open}
                    onChange={(e) => handleBusinessHoursChange(day, 'open', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <span className="text-gray-500">to</span>
                  <input
                    type="time"
                    value={settings.general.businessHours[day].close}
                    onChange={(e) => handleBusinessHoursChange(day, 'close', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderShippingSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Processing Time (days)</label>
          <input
            type="number"
            value={settings.shipping.processingTime}
            onChange={(e) => handleSettingChange('shipping', 'processingTime', parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Free Shipping Threshold (XAF)</label>
          <input
            type="number"
            value={settings.shipping.freeShippingThreshold}
            onChange={(e) => handleSettingChange('shipping', 'freeShippingThreshold', parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Estimated Delivery Time</label>
        <input
          type="text"
          value={settings.shipping.estimatedDeliveryTime}
          onChange={(e) => handleSettingChange('shipping', 'estimatedDeliveryTime', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-900">Local Delivery</p>
            <p className="text-sm text-gray-500">Enable delivery within your city</p>
          </div>
          <button
            onClick={() => handleSettingChange('shipping', 'enableLocalDelivery', !settings.shipping.enableLocalDelivery)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              settings.shipping.enableLocalDelivery ? 'bg-blue-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings.shipping.enableLocalDelivery ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {settings.shipping.enableLocalDelivery && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Local Delivery Fee (XAF)</label>
              <input
                type="number"
                value={settings.shipping.localDeliveryFee}
                onChange={(e) => handleSettingChange('shipping', 'localDeliveryFee', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Radius (km)</label>
              <input
                type="number"
                value={settings.shipping.localDeliveryRadius}
                onChange={(e) => handleSettingChange('shipping', 'localDeliveryRadius', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-900">National Shipping</p>
            <p className="text-sm text-gray-500">Enable shipping across Cameroon</p>
          </div>
          <button
            onClick={() => handleSettingChange('shipping', 'enableNationalShipping', !settings.shipping.enableNationalShipping)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              settings.shipping.enableNationalShipping ? 'bg-blue-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings.shipping.enableNationalShipping ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {settings.shipping.enableNationalShipping && (
        <div>
          <h4 className="text-lg font-medium text-gray-900 mb-4">Shipping Zones</h4>
          <div className="space-y-3">
            {settings.shipping.shippingZones.map((zone, index) => (
              <div key={index} className="flex items-center space-x-4 p-3 border border-gray-200 rounded-lg">
                <input
                  type="checkbox"
                  checked={zone.enabled}
                  onChange={(e) => handleShippingZoneChange(index, 'enabled', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <div className="flex-1">
                  <span className="font-medium text-gray-900">{zone.name}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">Fee:</span>
                  <input
                    type="number"
                    value={zone.fee}
                    onChange={(e) => handleShippingZoneChange(index, 'fee', parseInt(e.target.value))}
                    className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <span className="text-sm text-gray-600">XAF</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
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
                <p className="text-sm text-gray-500">MTN, Orange, Camtel</p>
              </div>
            </div>
            <button
              onClick={() => handleSettingChange('payment', 'enableMobileMoney', !settings.payment.enableMobileMoney)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.payment.enableMobileMoney ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.payment.enableMobileMoney ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {settings.payment.enableMobileMoney && (
            <div className="ml-8 space-y-2">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={settings.payment.mobileMoneyProviders.mtn}
                  onChange={(e) => handleNestedSettingChange('payment', 'mobileMoneyProviders', 'mtn', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">MTN Mobile Money</span>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={settings.payment.mobileMoneyProviders.orange}
                  onChange={(e) => handleNestedSettingChange('payment', 'mobileMoneyProviders', 'orange', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Orange Money</span>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={settings.payment.mobileMoneyProviders.camtel}
                  onChange={(e) => handleNestedSettingChange('payment', 'mobileMoneyProviders', 'camtel', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Camtel Money</span>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Icon name="Building" size={20} className="text-blue-600" />
              <div>
                <p className="font-medium text-gray-900">Bank Transfer</p>
                <p className="text-sm text-gray-500">Direct bank transfers</p>
              </div>
            </div>
            <button
              onClick={() => handleSettingChange('payment', 'enableBankTransfer', !settings.payment.enableBankTransfer)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.payment.enableBankTransfer ? 'bg-blue-600' : 'bg-gray-200'
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
              <Icon name="Banknote" size={20} className="text-orange-600" />
              <div>
                <p className="font-medium text-gray-900">Cash on Delivery</p>
                <p className="text-sm text-gray-500">Pay when you receive</p>
              </div>
            </div>
            <button
              onClick={() => handleSettingChange('payment', 'enableCashOnDelivery', !settings.payment.enableCashOnDelivery)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.payment.enableCashOnDelivery ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.payment.enableCashOnDelivery ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {settings.payment.enableBankTransfer && (
        <div>
          <h4 className="text-lg font-medium text-gray-900 mb-4">Bank Details</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Bank Name</label>
              <input
                type="text"
                value={settings.payment.bankDetails.bankName}
                onChange={(e) => handleNestedSettingChange('payment', 'bankDetails', 'bankName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Account Number</label>
              <input
                type="text"
                value={settings.payment.bankDetails.accountNumber}
                onChange={(e) => handleNestedSettingChange('payment', 'bankDetails', 'accountNumber', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Account Name</label>
              <input
                type="text"
                value={settings.payment.bankDetails.accountName}
                onChange={(e) => handleNestedSettingChange('payment', 'bankDetails', 'accountName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Payment Terms</label>
        <textarea
          value={settings.payment.paymentTerms}
          onChange={(e) => handleSettingChange('payment', 'paymentTerms', e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Notification Email</label>
          <input
            type="email"
            value={settings.notifications.notificationEmail}
            onChange={(e) => handleSettingChange('notifications', 'notificationEmail', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Notification Phone</label>
          <input
            type="tel"
            value={settings.notifications.notificationPhone}
            onChange={(e) => handleSettingChange('notifications', 'notificationPhone', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-900">Email Notifications</p>
            <p className="text-sm text-gray-500">Receive notifications via email</p>
          </div>
          <button
            onClick={() => handleSettingChange('notifications', 'emailNotifications', !settings.notifications.emailNotifications)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              settings.notifications.emailNotifications ? 'bg-blue-600' : 'bg-gray-200'
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
            <p className="text-sm text-gray-500">Receive notifications via SMS</p>
          </div>
          <button
            onClick={() => handleSettingChange('notifications', 'smsNotifications', !settings.notifications.smsNotifications)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              settings.notifications.smsNotifications ? 'bg-blue-600' : 'bg-gray-200'
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
            <p className="font-medium text-gray-900">Order Notifications</p>
            <p className="text-sm text-gray-500">Get notified about new orders</p>
          </div>
          <button
            onClick={() => handleSettingChange('notifications', 'orderNotifications', !settings.notifications.orderNotifications)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              settings.notifications.orderNotifications ? 'bg-blue-600' : 'bg-gray-200'
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
            <p className="font-medium text-gray-900">Low Stock Alerts</p>
            <p className="text-sm text-gray-500">Get alerted when products are low in stock</p>
          </div>
          <button
            onClick={() => handleSettingChange('notifications', 'lowStockAlerts', !settings.notifications.lowStockAlerts)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              settings.notifications.lowStockAlerts ? 'bg-blue-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings.notifications.lowStockAlerts ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-900">Customer Review Alerts</p>
            <p className="text-sm text-gray-500">Get notified about new customer reviews</p>
          </div>
          <button
            onClick={() => handleSettingChange('notifications', 'customerReviewAlerts', !settings.notifications.customerReviewAlerts)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              settings.notifications.customerReviewAlerts ? 'bg-blue-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings.notifications.customerReviewAlerts ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Additional Notification Actions */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="text-sm font-medium text-gray-900 mb-3">Notification Actions</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <button
            onClick={async () => {
              try {
                await api.sendTestNotification('email');
                showToast.success('Test email notification sent!');
              } catch (error) {
                showToast({
                  type: 'error',
                  message: 'Failed to send test email',
                  duration: 3000
                });
              }
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
          >
            <Icon name="Mail" size={16} />
            <span>Send Test Email</span>
          </button>
          
          <button
            onClick={async () => {
              try {
                await api.sendTestNotification('sms');
                showToast.success('Test SMS notification sent!');
              } catch (error) {
                showToast({
                  type: 'error',
                  message: 'Failed to send test SMS',
                  duration: 3000
                });
              }
            }}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
          >
            <Icon name="MessageSquare" size={16} />
            <span>Send Test SMS</span>
          </button>
          
          <button
            onClick={async () => {
              try {
                await api.markAllNotificationsAsRead();
                showToast.success('All notifications marked as read');
              } catch (error) {
                showToast({
                  type: 'error',
                  message: 'Failed to mark notifications as read',
                  duration: 3000
                });
              }
            }}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2"
          >
            <Icon name="CheckCheck" size={16} />
            <span>Mark All Read</span>
          </button>
        </div>
      </div>

      {/* Notification History */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-medium text-gray-900">Recent Notifications</h4>
          <button
            onClick={() => window.open('/notification-center-modal', '_blank')}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            View All
          </button>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Order notifications sent today</span>
            <span className="font-medium text-gray-900">12</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Low stock alerts sent this week</span>
            <span className="font-medium text-gray-900">3</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Review alerts sent this month</span>
            <span className="font-medium text-gray-900">7</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPoliciesSettings = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Return Policy</label>
        <textarea
          value={settings.policies.returnPolicy}
          onChange={(e) => handleSettingChange('policies', 'returnPolicy', e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Refund Policy</label>
        <textarea
          value={settings.policies.refundPolicy}
          onChange={(e) => handleSettingChange('policies', 'refundPolicy', e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Shipping Policy</label>
        <textarea
          value={settings.policies.shippingPolicy}
          onChange={(e) => handleSettingChange('policies', 'shippingPolicy', e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Warranty Policy</label>
        <textarea
          value={settings.policies.warrantyPolicy}
          onChange={(e) => handleSettingChange('policies', 'warrantyPolicy', e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Privacy Policy</label>
        <textarea
          value={settings.policies.privacyPolicy}
          onChange={(e) => handleSettingChange('policies', 'privacyPolicy', e.target.value)}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Terms of Service</label>
        <textarea
          value={settings.policies.termsOfService}
          onChange={(e) => handleSettingChange('policies', 'termsOfService', e.target.value)}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
    </div>
  );

  const renderSEOSettings = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Meta Title</label>
        <input
          type="text"
          value={settings.seo.metaTitle}
          onChange={(e) => handleSettingChange('seo', 'metaTitle', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <p className="text-xs text-gray-500 mt-1">Recommended: 50-60 characters</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Meta Description</label>
        <textarea
          value={settings.seo.metaDescription}
          onChange={(e) => handleSettingChange('seo', 'metaDescription', e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <p className="text-xs text-gray-500 mt-1">Recommended: 150-160 characters</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Meta Keywords</label>
        <input
          type="text"
          value={settings.seo.metaKeywords}
          onChange={(e) => handleSettingChange('seo', 'metaKeywords', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <p className="text-xs text-gray-500 mt-1">Separate keywords with commas</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Google Analytics ID</label>
          <input
            type="text"
            value={settings.seo.googleAnalyticsId}
            onChange={(e) => handleSettingChange('seo', 'googleAnalyticsId', e.target.value)}
            placeholder="GA-XXXXXXXXX-X"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Facebook Pixel ID</label>
          <input
            type="text"
            value={settings.seo.facebookPixelId}
            onChange={(e) => handleSettingChange('seo', 'facebookPixelId', e.target.value)}
            placeholder="XXXXXXXXXXXXXXX"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-900">Enable Sitemap</p>
            <p className="text-sm text-gray-500">Generate XML sitemap for search engines</p>
          </div>
          <button
            onClick={() => handleSettingChange('seo', 'enableSitemap', !settings.seo.enableSitemap)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              settings.seo.enableSitemap ? 'bg-blue-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings.seo.enableSitemap ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-900">Enable Robots.txt</p>
            <p className="text-sm text-gray-500">Control search engine crawling</p>
          </div>
          <button
            onClick={() => handleSettingChange('seo', 'enableRobotsTxt', !settings.seo.enableRobotsTxt)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              settings.seo.enableRobotsTxt ? 'bg-blue-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings.seo.enableRobotsTxt ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );

  const renderSectionContent = () => {
    switch (activeSection) {
      case 'general':
        return renderGeneralSettings();
      case 'shipping':
        return renderShippingSettings();
      case 'payment':
        return renderPaymentSettings();
      case 'notifications':
        return renderNotificationSettings();
      case 'policies':
        return renderPoliciesSettings();
      case 'seo':
        return renderSEOSettings();
      default:
        return renderGeneralSettings();
    }
  };

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Shop Settings</h2>
          <p className="text-gray-600">Configure your shop preferences and policies</p>
        </div>
        <button
          onClick={handleSaveSettings}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
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
                      ? 'bg-blue-50 text-blue-700'
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

export default ShopSettings;

