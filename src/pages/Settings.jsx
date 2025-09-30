import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSearchParams } from 'react-router-dom';
import Icon from '../components/AppIcon';
import api from '../services/api';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import BlurText from '../components/ui/BlurText';
import ShinyText from '../components/ui/ShinyText';
import Header from '../components/ui/Header';
import SubscriptionManagement from '../components/SubscriptionManagement';

const Settings = () => {
  const { user, loading, refreshUserData } = useAuth();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('account');
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  
  // Payment flow state
  const [paymentStep, setPaymentStep] = useState(1);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [paymentData, setPaymentData] = useState({
    phoneNumber: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardName: '',
    billingAddress: '',
    city: '',
    postalCode: ''
  });

  // Role change state
  const [showRoleChangeModal, setShowRoleChangeModal] = useState(false);
  const [selectedNewRole, setSelectedNewRole] = useState('');
  const [roleChangeReason, setRoleChangeReason] = useState('');

  // Settings state
  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      push: true,
      sms: false,
      marketing: true,
      orderUpdates: true,
      priceAlerts: true,
      securityAlerts: true
    },
    privacy: {
      profileVisibility: 'public',
      showOnlineStatus: true,
      allowMessages: true,
      showLastSeen: true,
      allowDataCollection: false,
      allowAnalytics: true
    },
    preferences: {
      theme: 'light',
      language: 'en',
      currency: 'XAF',
      timezone: 'Africa/Douala',
      dateFormat: 'DD/MM/YYYY',
      timeFormat: '24h'
    },
    security: {
      twoFactorAuth: false,
      loginNotifications: true,
      sessionTimeout: 30,
      requirePasswordChange: false
    }
  });

  // Profile data
  const [profileData, setProfileData] = useState({
    firstName: user?.first_name || '',
    lastName: user?.last_name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    bio: user?.bio || '',
    company: user?.company || '',
    website: user?.website || '',
    location: user?.location || ''
  });

  // Handle URL parameter for tab selection
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && ['account', 'subscription', 'notifications', 'privacy', 'preferences'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  const tabs = [
    { id: 'account', label: 'Account & Profile', icon: 'User', description: 'Manage your personal information' },
    { id: 'subscription', label: 'Subscription & Billing', icon: 'CreditCard', description: 'Manage your plan and payments' },
    { id: 'notifications', label: 'Notifications', icon: 'Bell', description: 'Control how you receive updates' },
    { id: 'privacy', label: 'Privacy & Security', icon: 'Shield', description: 'Manage your privacy settings' },
    { id: 'preferences', label: 'Preferences', icon: 'Settings', description: 'Customize your experience' },
    { id: 'integrations', label: 'Integrations', icon: 'Zap', description: 'Connect third-party services' }
  ];

  const paymentMethods = [
    {
      id: 'mtn_money',
      name: 'MTN Mobile Money',
      icon: 'Smartphone',
      description: 'Pay with your MTN Mobile Money account',
      available: true
    },
    {
      id: 'orange_money',
      name: 'Orange Money',
      icon: 'Smartphone',
      description: 'Pay with your Orange Money account',
      available: true
    },
    {
      id: 'visa_mastercard',
      name: 'Credit/Debit Card',
      icon: 'CreditCard',
      description: 'Visa, Mastercard, and other major cards',
      available: true
    },
    {
      id: 'bank_transfer',
      name: 'Bank Transfer',
      icon: 'Building',
      description: 'Direct bank transfer',
      available: false
    }
  ];

  const showNotification = (message, type) => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: '' });
    }, 5000);
  };

  // Make currentRole reactive to user changes
  const currentRole = useMemo(() => {
    console.log('Settings: User role changed:', user?.role);
    return getCurrentRoleDisplay(user?.role);
  }, [user?.role]);

  function getCurrentRoleDisplay(role) {
    switch (role?.toLowerCase()) {
      case 'admin': return { name: 'Administrator', description: 'Full platform access and management', color: 'red' };
      case 'shop_owner': return { name: 'Shop Owner', description: 'Professional online store with premium features', color: 'amber' };
      case 'casual_seller': return { name: 'Casual Seller', description: 'Sell items with no monthly fees', color: 'green' };
      case 'delivery_agent': return { name: 'Delivery Agent', description: 'Handle deliveries and logistics', color: 'blue' };
      case 'customer': return { name: 'Customer', description: 'Browse and purchase products', color: 'blue' };
      default: return { name: 'Customer', description: 'Browse and purchase products', color: 'blue' };
    }
  }

  // Loading guard
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-teal-50 to-teal-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  const handleSettingChange = (category, key, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
  };

  const handleProfileChange = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveProfile = async () => {
    setIsLoading(true);
    try {
      await api.updateProfile(profileData);
      showNotification('Profile updated successfully!', 'success');
    } catch (error) {
      showNotification('Failed to update profile', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    setIsLoading(true);
    try {
      // Save settings to backend
      showNotification('Settings saved successfully!', 'success');
    } catch (error) {
      showNotification('Failed to save settings', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const processSubscription = async () => {
    setIsLoading(true);
    try {
      const paymentPayload = {
        paymentMethod: selectedPaymentMethod,
        amount: 20000,
        currency: 'XAF'
      };

      if (selectedPaymentMethod === 'mtn_money' || selectedPaymentMethod === 'orange_money') {
        paymentPayload.phoneNumber = paymentData.phoneNumber;
        paymentPayload.operator = selectedPaymentMethod === 'mtn_money' ? 'MTN' : 'Orange';
      } else if (selectedPaymentMethod === 'visa_mastercard') {
        paymentPayload.cardDetails = {
          cardNumber: paymentData.cardNumber,
          expiryDate: paymentData.expiryDate,
          cvv: paymentData.cvv,
          cardName: paymentData.cardName,
          billingAddress: paymentData.billingAddress,
          city: paymentData.city,
          postalCode: paymentData.postalCode
        };
      }

      const response = await api.createShopSubscription(paymentPayload);
      
      if (response.payment_url) {
        window.open(response.payment_url, '_blank');
        showNotification('Payment window opened. Complete the payment to activate your subscription.', 'success');
      } else {
        // Development mode or direct activation
        showNotification(response.message || 'Subscription activated successfully!', 'success');
        
        // Refresh user data to show updated role
        setTimeout(async () => {
          try {
            await refreshUserData();
            showNotification('Role updated successfully! You are now a Shop Owner.', 'success');
          } catch (error) {
            console.error('Failed to refresh user data:', error);
            // Fallback to page reload
            window.location.reload();
          }
        }, 2000);
      }
      
      setPaymentStep(1);
    } catch (error) {
      showNotification(error.response?.data?.detail || 'Payment processing failed', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleUpgrade = async (newRole) => {
    if (newRole === 'SHOP_OWNER') {
      // For shop owner, show payment flow
      setPaymentStep(2);
    } else {
      // For other roles, show role change modal
      setSelectedNewRole(newRole);
      setShowRoleChangeModal(true);
    }
  };

  const handleRoleChange = async () => {
    if (!selectedNewRole) return;
    
    setIsLoading(true);
    try {
      console.log('Attempting role change:', { new_role: selectedNewRole, reason: roleChangeReason });
      
      const response = await api.request('/api/auth/change-role', {
        method: 'POST',
        body: JSON.stringify({
          new_role: selectedNewRole,
          reason: roleChangeReason
        })
      });
      
      console.log('Role change response:', response);
      
      if (response.success) {
        showNotification(`Role changed to ${selectedNewRole} successfully!`, 'success');
        
        // Force refresh user data and wait for it to complete
        console.log('Refreshing user data after role change...');
        const refreshedUser = await refreshUserData();
        console.log('Refreshed user data:', refreshedUser);
        
        // Force a page reload as a fallback to ensure UI updates
        setTimeout(() => {
          console.log('Forcing page reload to ensure UI updates...');
          window.location.reload();
        }, 1000);
        
        setShowRoleChangeModal(false);
        setSelectedNewRole('');
        setRoleChangeReason('');
      } else {
        showNotification(response.message || 'Failed to change role', 'error');
      }
    } catch (error) {
      console.error('Role change error:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.status,
        response: error.response
      });
      showNotification(error.message || 'Failed to change role', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const renderAccountTab = () => (
    <div className="space-y-8">
      {/* Profile Header */}
      <div className="bg-gradient-to-r from-teal-500 to-teal-700 rounded-2xl p-4 sm:p-8 text-white">
        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center flex-shrink-0">
            <Icon name="User" size={32} className="sm:w-10 sm:h-10 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl sm:text-2xl font-bold truncate">{profileData.firstName} {profileData.lastName}</h2>
            <p className="text-teal-100 text-sm sm:text-base truncate">{profileData.email}</p>
            <div className="mt-2 flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-white/20 backdrop-blur-sm">
                <Icon name="Crown" size={16} className="mr-2" />
                {currentRole.name}
                    </span>
              <button
                onClick={async () => {
                  try {
                    await refreshUserData();
                    showNotification('Role refreshed successfully!', 'success');
                  } catch (error) {
                    showNotification('Failed to refresh role', 'error');
                  }
                }}
                className="text-white/80 hover:text-white text-sm underline"
              >
                Refresh Role
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Form */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-8">
        <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6">Personal Information</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
      <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
            <Input
              value={profileData.firstName}
              onChange={(e) => handleProfileChange('firstName', e.target.value)}
              placeholder="Enter your first name"
            />
              </div>
              <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
            <Input
              value={profileData.lastName}
              onChange={(e) => handleProfileChange('lastName', e.target.value)}
              placeholder="Enter your last name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <Input
              type="email"
              value={profileData.email}
              onChange={(e) => handleProfileChange('email', e.target.value)}
              placeholder="Enter your email"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
            <Input
              value={profileData.phone}
              onChange={(e) => handleProfileChange('phone', e.target.value)}
              placeholder="Enter your phone number"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
            <textarea
              value={profileData.bio}
              onChange={(e) => handleProfileChange('bio', e.target.value)}
              placeholder="Tell us about yourself"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              rows={3}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Company</label>
            <Input
              value={profileData.company}
              onChange={(e) => handleProfileChange('company', e.target.value)}
              placeholder="Your company name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
            <Input
              value={profileData.website}
              onChange={(e) => handleProfileChange('website', e.target.value)}
              placeholder="https://yourwebsite.com"
            />
          </div>
        </div>
        <div className="mt-8 flex justify-end">
          <Button onClick={handleSaveProfile} disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </div>
  );

  const renderSubscriptionTab = () => (
    <div className="space-y-8">
      {/* Current Plan */}
      <div className="bg-gradient-to-r from-teal-500 to-teal-700 rounded-2xl p-4 sm:p-8 text-white">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
          <div className="flex-1 min-w-0">
            <h3 className="text-xl sm:text-2xl font-bold mb-2">{currentRole.name}</h3>
            <p className="text-teal-100 mb-4 text-sm sm:text-base">{currentRole.description}</p>
            {user?.subscription?.status === 'active' && (
              <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-white/20 backdrop-blur-sm">
                  <Icon name="CheckCircle" size={16} className="mr-2" />
                      Active Subscription
                    </span>
                <span className="text-xl sm:text-2xl font-bold">{user?.subscription?.monthly_fee || '20,000'} XAF/month</span>
                  </div>
                )}
              </div>
          <div className="flex-shrink-0">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <Icon name="Crown" size={24} className="sm:w-8 sm:h-8 text-white" />
            </div>
              </div>
        </div>
      </div>

      {/* Subscription Management - Only show for subscribed users */}
      {user?.subscription?.status === 'active' && (
        <SubscriptionManagement onSwitchToSubscriptionTab={() => setActiveTab('subscription')} />
      )}

      {/* Role Change Options - Show for all users */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Change Your Role</h3>
        <p className="text-gray-600 mb-6">Switch to a different role level based on your needs</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { value: 'CUSTOMER', label: 'Customer', description: 'Basic shopping access only', color: 'gray' },
            { value: 'DELIVERY_AGENT', label: 'Delivery Agent', description: 'Can deliver orders for other sellers', color: 'blue' },
            { value: 'CASUAL_SELLER', label: 'Casual Seller', description: 'Can sell up to 10 products', color: 'purple' },
            { value: 'SHOP_OWNER', label: 'Shop Owner', description: 'Professional selling platform', color: 'teal' }
          ].map((role) => (
            <div key={role.value} className={`border rounded-xl p-4 hover:border-${role.color}-300 transition-colors ${
              user?.role === role.value ? `border-${role.color}-500 bg-${role.color}-50` : 'border-gray-200'
            }`}>
              <div className="text-center">
                <div className={`w-12 h-12 bg-${role.color}-100 rounded-full flex items-center justify-center mx-auto mb-3`}>
                  <Icon name={role.value === 'CUSTOMER' ? 'User' : role.value === 'DELIVERY_AGENT' ? 'Truck' : role.value === 'CASUAL_SELLER' ? 'Package' : 'Store'} size={24} className={`text-${role.color}-600`} />
          </div>
                <h4 className="font-semibold text-gray-900 mb-2">{role.label}</h4>
                <p className="text-sm text-gray-600 mb-4">{role.description}</p>
                {user?.role === role.value ? (
                  <div className="w-full bg-green-100 text-green-700 py-2 px-4 rounded-lg font-medium">
                    Current Role
                  </div>
                ) : (
                  <button
                    onClick={() => handleRoleUpgrade(role.value)}
                    className={`w-full bg-${role.color}-100 text-${role.color}-700 py-2 px-4 rounded-lg font-medium hover:bg-${role.color}-200 transition-colors`}
                  >
                    Switch to {role.label}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Subscription Options - Show for users without active subscription */}
      {user?.subscription?.status !== 'active' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8">
          {/* Shop Owner Plan */}
          <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-gradient-to-l from-teal-500 to-teal-600 text-white px-4 py-1 text-sm font-medium">
              Most Popular
            </div>
            <div className="mb-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center">
                  <Icon name="Store" size={24} className="text-teal-600" />
                </div>
        <div>
                  <h4 className="text-xl font-bold text-gray-900">Shop Owner</h4>
                  <p className="text-gray-600">Professional selling platform</p>
                  </div>
                </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">20,000 XAF<span className="text-lg text-gray-500">/month</span></div>
              <p className="text-sm text-gray-600">7-day free trial included</p>
              </div>

            <ul className="space-y-3 mb-8">
              {[
                'Unlimited product listings',
                'Advanced analytics dashboard',
                'Custom store branding',
                'Priority customer support',
                'Marketing tools & promotions',
                'Inventory management'
                  ].map((feature, index) => (
                <li key={index} className="flex items-center space-x-3">
                  <Icon name="CheckCircle" size={16} className="text-green-500 flex-shrink-0" />
                  <span className="text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>

            <Button 
              onClick={() => setPaymentStep(2)}
              className="w-full bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white"
            >
              <Icon name="CreditCard" size={20} className="mr-2" />
              Start Free Trial
            </Button>
                      </div>

          {/* Casual Seller Plan */}
          <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-8">
            <div className="mb-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center">
                  <Icon name="Package" size={24} className="text-teal-600" />
                </div>
                      <div>
                  <h4 className="text-xl font-bold text-gray-900">Casual Seller</h4>
                  <p className="text-gray-600">Sell without monthly fees</p>
                      </div>
                    </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">Free</div>
              <p className="text-sm text-gray-600">No monthly subscription</p>
                </div>

            <ul className="space-y-3 mb-8">
              {[
                'Up to 10 product listings',
                'Basic analytics',
                'Standard support',
                'Mobile app access',
                'Secure payments',
                'Order management'
              ].map((feature, index) => (
                <li key={index} className="flex items-center space-x-3">
                  <Icon name="CheckCircle" size={16} className="text-green-500 flex-shrink-0" />
                  <span className="text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>

            <Button 
              onClick={() => handleRoleUpgrade('CASUAL_SELLER')}
              variant="outline"
              className="w-full"
            >
              <Icon name="UserPlus" size={20} className="mr-2" />
              Upgrade to Casual Seller
            </Button>
              </div>
            </div>
          )}

      {/* Payment Form */}
          {paymentStep === 2 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-8">
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Choose Payment Method</h3>
            <p className="text-gray-600">Select your preferred payment method for the subscription</p>
              </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                {paymentMethods.map((method) => (
                  <div
                    key={method.id}
                onClick={() => setSelectedPaymentMethod(method.id)}
                className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                      selectedPaymentMethod === method.id
                    ? 'border-teal-500 bg-teal-50'
                    : 'border-gray-200 hover:border-gray-300'
                } ${!method.available ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className="flex items-center space-x-3">
                  <Icon name={method.icon} size={24} className="text-gray-600" />
                  <div>
                    <h4 className="font-medium text-gray-900">{method.name}</h4>
                        <p className="text-sm text-gray-600">{method.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {selectedPaymentMethod && (
            <div className="space-y-6">
              {selectedPaymentMethod === 'mtn_money' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">MTN Mobile Money Number</label>
                  <Input
                    value={paymentData.phoneNumber}
                    onChange={(e) => setPaymentData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                    placeholder="+237 6XX XXX XXX"
                  />
            </div>
          )}

              {selectedPaymentMethod === 'orange_money' && (
                  <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Orange Money Number</label>
                  <Input
                        value={paymentData.phoneNumber}
                    onChange={(e) => setPaymentData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                    placeholder="+237 6XX XXX XXX"
                  />
                </div>
              )}

              {selectedPaymentMethod === 'visa_mastercard' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Card Number</label>
                    <Input
                      value={paymentData.cardNumber}
                      onChange={(e) => setPaymentData(prev => ({ ...prev, cardNumber: e.target.value }))}
                      placeholder="1234 5678 9012 3456"
                    />
                  </div>
                    <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Expiry Date</label>
                    <Input
                        value={paymentData.expiryDate}
                      onChange={(e) => setPaymentData(prev => ({ ...prev, expiryDate: e.target.value }))}
                        placeholder="MM/YY"
                      />
                    </div>
                    <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">CVV</label>
                    <Input
                        value={paymentData.cvv}
                      onChange={(e) => setPaymentData(prev => ({ ...prev, cvv: e.target.value }))}
                        placeholder="123"
                      />
                    </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Cardholder Name</label>
                    <Input
                      value={paymentData.cardName}
                      onChange={(e) => setPaymentData(prev => ({ ...prev, cardName: e.target.value }))}
                      placeholder="John Doe"
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-4">
                <Button variant="outline" onClick={() => setPaymentStep(1)}>
                  Cancel
                </Button>
                <Button onClick={processSubscription} disabled={isLoading}>
                  {isLoading ? 'Processing...' : 'Complete Subscription'}
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );

  const renderNotificationsTab = () => (
    <div className="space-y-8">
      <div className="bg-white rounded-2xl border border-gray-200 p-8">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">Notification Preferences</h3>
        
        <div className="space-y-6">
        <div>
            <h4 className="text-lg font-medium text-gray-900 mb-4">Email Notifications</h4>
            <div className="space-y-4">
              {[
                { key: 'email', label: 'Email notifications', description: 'Receive updates via email' },
                { key: 'orderUpdates', label: 'Order updates', description: 'Get notified about order status changes' },
                { key: 'priceAlerts', label: 'Price alerts', description: 'Be notified when prices change' },
                { key: 'marketing', label: 'Marketing emails', description: 'Receive promotional content and offers' }
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between">
                <div>
                    <h5 className="font-medium text-gray-900">{item.label}</h5>
                    <p className="text-sm text-gray-600">{item.description}</p>
                </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.notifications[item.key]}
                      onChange={(e) => handleSettingChange('notifications', item.key, e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                  </label>
              </div>
              ))}
            </div>
                </div>

      <div>
            <h4 className="text-lg font-medium text-gray-900 mb-4">Push Notifications</h4>
            <div className="space-y-4">
              {[
                { key: 'push', label: 'Push notifications', description: 'Receive notifications on your device' },
                { key: 'securityAlerts', label: 'Security alerts', description: 'Important security notifications' }
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between">
                  <div>
                    <h5 className="font-medium text-gray-900">{item.label}</h5>
                    <p className="text-sm text-gray-600">{item.description}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.notifications[item.key]}
                      onChange={(e) => handleSettingChange('notifications', item.key, e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                  </label>
            </div>
          ))}
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <Button onClick={handleSaveSettings} disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </div>
    </div>
  );

  const renderPrivacyTab = () => (
    <div className="space-y-8">
      <div className="bg-white rounded-2xl border border-gray-200 p-8">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">Privacy & Security</h3>
        
        <div className="space-y-6">
      <div>
            <h4 className="text-lg font-medium text-gray-900 mb-4">Profile Visibility</h4>
            <div className="space-y-4">
              {[
                { value: 'public', label: 'Public', description: 'Anyone can see your profile' },
                { value: 'private', label: 'Private', description: 'Only you can see your profile' },
                { value: 'friends', label: 'Friends only', description: 'Only your connections can see your profile' }
              ].map((option) => (
                <label key={option.value} className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="profileVisibility"
                    value={option.value}
                    checked={settings.privacy.profileVisibility === option.value}
              onChange={(e) => handleSettingChange('privacy', 'profileVisibility', e.target.value)}
                    className="w-4 h-4 text-teal-600"
                  />
      <div>
                    <h5 className="font-medium text-gray-900">{option.label}</h5>
                    <p className="text-sm text-gray-600">{option.description}</p>
                  </div>
            </label>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-lg font-medium text-gray-900 mb-4">Security Settings</h4>
            <div className="space-y-4">
              {[
                { key: 'twoFactorAuth', label: 'Two-factor authentication', description: 'Add an extra layer of security' },
                { key: 'loginNotifications', label: 'Login notifications', description: 'Get notified of new logins' },
                { key: 'requirePasswordChange', label: 'Require password change', description: 'Force password change on next login' }
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between">
                  <div>
                    <h5 className="font-medium text-gray-900">{item.label}</h5>
                    <p className="text-sm text-gray-600">{item.description}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.security[item.key]}
                      onChange={(e) => handleSettingChange('security', item.key, e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                  </label>
            </div>
          ))}
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <Button onClick={handleSaveSettings} disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </div>
    </div>
  );

  const renderPreferencesTab = () => (
    <div className="space-y-8">
      <div className="bg-white rounded-2xl border border-gray-200 p-8">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">Preferences</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div>
            <h4 className="text-lg font-medium text-gray-900 mb-4">Appearance</h4>
            <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Theme</label>
              <select
                value={settings.preferences.theme}
                onChange={(e) => handleSettingChange('preferences', 'theme', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="auto">Auto</option>
              </select>
              </div>
            </div>
            </div>

            <div>
            <h4 className="text-lg font-medium text-gray-900 mb-4">Localization</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
              <select
                value={settings.preferences.language}
                onChange={(e) => handleSettingChange('preferences', 'language', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                <option value="en">English</option>
                <option value="fr">Français</option>
              </select>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
              <select
                value={settings.preferences.currency}
                onChange={(e) => handleSettingChange('preferences', 'currency', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                >
                  <option value="XAF">XAF (Central African Franc)</option>
                  <option value="USD">USD (US Dollar)</option>
                  <option value="EUR">EUR (Euro)</option>
              </select>
            </div>
            </div>
          </div>
            </div>

        <div className="mt-8 flex justify-end">
          <Button onClick={handleSaveSettings} disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </div>
    </div>
  );

  const renderIntegrationsTab = () => (
    <div className="space-y-8">
      <div className="bg-white rounded-2xl border border-gray-200 p-8">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">Third-party Integrations</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { name: 'Google Analytics', description: 'Track your website traffic', connected: false, icon: 'BarChart' },
            { name: 'Facebook Pixel', description: 'Track conversions and optimize ads', connected: false, icon: 'Share' },
            { name: 'Mailchimp', description: 'Manage your email marketing', connected: false, icon: 'Mail' },
            { name: 'Zapier', description: 'Automate workflows', connected: false, icon: 'Zap' }
          ].map((integration) => (
            <div key={integration.name} className="p-6 border border-gray-200 rounded-xl">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Icon name={integration.icon} size={24} className="text-gray-600" />
                </div>
            <div>
                  <h4 className="font-medium text-gray-900">{integration.name}</h4>
                  <p className="text-sm text-gray-600">{integration.description}</p>
            </div>
          </div>
              <Button variant="outline" className="w-full">
                {integration.connected ? 'Disconnect' : 'Connect'}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-teal-50 to-teal-100">
      {/* Top Navigation */}
      <Header />
      
      {/* Settings Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4 sm:py-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-teal-500 to-teal-700 rounded-2xl flex items-center justify-center flex-shrink-0">
                <Icon name="Settings" size={24} className="sm:w-8 sm:h-8 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  <ShinyText>Settings</ShinyText>
                </h1>
                <p className="text-gray-600 mt-1 text-sm sm:text-base">Manage your account preferences and subscription</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-8">
          {/* Mobile Sidebar - Horizontal Scroll */}
          <div className="lg:w-1/4">
            <nav className="flex lg:flex-col space-x-2 lg:space-x-0 lg:space-y-2 overflow-x-auto pb-2 lg:pb-0">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-shrink-0 lg:w-full flex items-center space-x-2 lg:space-x-3 px-3 lg:px-4 py-2 lg:py-3 text-left rounded-xl transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-lg'
                      : 'text-gray-700 hover:bg-teal-50 hover:shadow-sm'
                  }`}
                >
                  <Icon name={tab.icon} size={20} />
                  <div className="flex-1">
                    <div className="font-medium text-sm lg:text-base">{tab.label}</div>
                    <div className="text-xs opacity-75 hidden lg:block">{tab.description}</div>
                  </div>
                </button>
              ))}
            </nav>
          </div>

          {/* Main Content */}
          <div className="lg:w-3/4 w-full">
            {activeTab === 'account' && renderAccountTab()}
            {activeTab === 'subscription' && renderSubscriptionTab()}
            {activeTab === 'notifications' && renderNotificationsTab()}
            {activeTab === 'privacy' && renderPrivacyTab()}
            {activeTab === 'preferences' && renderPreferencesTab()}
            {activeTab === 'integrations' && renderIntegrationsTab()}
          </div>
        </div>
      </div>

      {/* Role Change Modal */}
      {showRoleChangeModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Change Role</h3>
              <button
                onClick={() => setShowRoleChangeModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <Icon name="X" size={20} />
              </button>
            </div>
            
            <div className="mb-4">
              <p className="text-gray-600 mb-4">
                You are about to change your role to <strong>{selectedNewRole}</strong>. 
                This action may affect your access to certain features.
              </p>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for role change (optional)
                </label>
                <textarea
                  value={roleChangeReason}
                  onChange={(e) => setRoleChangeReason(e.target.value)}
                  placeholder="Tell us why you want to change your role..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  rows={3}
                />
              </div>
            </div>
            
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowRoleChangeModal(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleRoleChange}
                disabled={isLoading}
                className="flex-1 bg-teal-600 hover:bg-teal-700"
              >
                {isLoading ? 'Changing...' : 'Confirm Change'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Notification Toast */}
      {notification.show && (
        <div className="fixed top-4 left-4 right-4 sm:left-auto sm:right-4 z-50 max-w-sm w-full sm:w-auto">
          <div className={`rounded-xl p-4 shadow-lg backdrop-blur-sm ${
            notification.type === 'success' 
              ? 'bg-green-500/90 text-white' 
              : notification.type === 'error'
              ? 'bg-red-500/90 text-white'
              : 'bg-teal-500/90 text-white'
          }`}>
            <div className="flex items-center space-x-2">
              <Icon 
                name={notification.type === 'success' ? 'CheckCircle' : notification.type === 'error' ? 'XCircle' : 'Info'} 
                size={20} 
              />
              <span className="font-medium">{notification.message}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;