import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import { showToast } from '../../utils/toast';
import { useNavigate, useSearchParams } from 'react-router-dom';

const UserSettings = () => {
  const { user, refreshUserData } = useAuth();
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [selectedRole, setSelectedRole] = useState('');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Check for upgrade success/failure from URL params
  useEffect(() => {
    const upgradeStatus = searchParams.get('upgrade');
    if (upgradeStatus === 'success') {
      showToast('🎉 Role upgraded successfully! Welcome to your new features.', 'success');
      refreshUserData(); // Refresh user data to show new role
    } else if (upgradeStatus === 'cancelled') {
      showToast('Upgrade cancelled. You can try again anytime!', 'info');
    }
  }, [searchParams, refreshUserData]);

  const roleOptions = [
    {
      value: 'CASUAL_SELLER',
      label: 'Casual Seller',
      description: 'Sell random items - no monthly fees!',
      benefits: [
        'Sell new, used, or any items',
        'No monthly subscription',
        'Simple listing process', 
        'Pay only transaction fees',
        'Perfect for occasional selling'
      ],
      icon: '💼',
      isPremium: false,
      freeUpgrade: true
    },
    {
      value: 'DELIVERY_AGENT',
      label: 'Delivery Agent',
      description: 'Earn money delivering orders',
      benefits: [
        'Flexible working hours',
        'Competitive delivery rates',
        'Route optimization tools',
        'Weekly payouts',
        'Work when you want'
      ],
      icon: '🚚',
      isPremium: false,
      freeUpgrade: true
    },
    {
      value: 'SHOP_OWNER',
      label: 'Shop Owner (Premium)',
      description: 'Professional online store with premium features',
      benefits: [
        'Your own branded shop',
        'Advanced inventory management',
        'Professional seller dashboard', 
        'Marketing tools & analytics',
        'Priority customer support',
        'Custom shop URL'
      ],
      icon: '🏪',
      isPremium: true,
      monthlyFee: '$29.99/month',
      freeUpgrade: false
    }
  ];

  const handleRoleUpgrade = async () => {
    if (!selectedRole) {
      showToast('Please select a role to upgrade to', 'error');
      return;
    }

    const selectedOption = roleOptions.find(r => r.value === selectedRole);
    
    // For premium roles (Shop Owner), create Tranzak payment request
    if (selectedOption?.isPremium) {
      setIsUpgrading(true);
      try {
        // Call backend to create Tranzak payment request
        const response = await api.post('/api/tranzak/create-shop-subscription');
        
        if (response.data.payment_url) {
          // Redirect to Tranzak payment page
          window.location.href = response.data.payment_url;
        } else {
          throw new Error('No payment URL received');
        }
      } catch (error) {
        console.error('Failed to create payment request:', error);
        showToast(error.response?.data?.detail || 'Failed to start subscription process', 'error');
        setIsUpgrading(false);
      }
      return;
    }

    // For free roles, upgrade directly
    setIsUpgrading(true);
    try {
      console.log(`Upgrading to role: ${selectedRole}`);
      
      const response = await api.upgradeUserRole(selectedRole);
      
      // Track the role upgrade event for analytics
      try {
        await api.post('/api/admin/track-event', {
          user_id: user?.id,
          event_type: 'role_upgrade',
          metadata: {
            new_role: selectedRole,
            upgrade_method: 'free_upgrade',
            timestamp: new Date().toISOString(),
            source: 'user_settings'
          }
        });
      } catch (trackingError) {
        console.log('Analytics tracking failed:', trackingError);
        // Don't fail the upgrade process if tracking fails
      }
      
      showToast(response.message || 'Role upgraded successfully!', 'success');
      
      // Refresh user data if required
      if (response.requires_refresh) {
        await refreshUserData();
      }
      
      setSelectedRole('');
      
    } catch (error) {
      console.error('Role upgrade failed:', error);
      showToast(error.message || 'Failed to upgrade role', 'error');
    } finally {
      setIsUpgrading(false);
    }
  };

  const getRoleDisplayName = (role) => {
    switch (role) {
      case 'CUSTOMER': return 'Customer';
      case 'SHOP_OWNER': return 'Shop Owner';
      case 'DELIVERY_AGENT': return 'Delivery Agent';
      case 'CASUAL_SELLER': return 'Casual Seller';
      default: return role;
    }
  };

  const availableUpgrades = roleOptions.filter(option => 
    option.value !== user?.role && 
    (user?.role === 'CUSTOMER' || user?.role === 'customer')
  );

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">Account Settings</h1>
            <p className="text-gray-600 mt-1">Manage your account preferences and role</p>
          </div>

          <div className="p-6">
            {/* Current Role Section */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Current Role</h2>
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-semibold">
                      {user?.role === 'CUSTOMER' || user?.role === 'customer' ? '👤' : '🏪'}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {getRoleDisplayName(user?.role)}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {user?.role === 'CUSTOMER' || user?.role === 'customer' 
                        ? 'Browse and purchase products' 
                        : 'Advanced marketplace features'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Role Upgrade Section */}
            {availableUpgrades.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Upgrade Your Role</h2>
                <p className="text-gray-600 mb-6">
                  Unlock additional features by upgrading your account role
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                  {availableUpgrades.map((option) => (
                    <div
                      key={option.value}
                      className={`p-6 rounded-lg border-2 cursor-pointer transition-all relative ${
                        selectedRole === option.value
                          ? 'border-teal-500 bg-teal-50'
                          : option.isPremium 
                            ? 'border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 hover:border-amber-400'
                            : 'border-gray-200 bg-white hover:border-teal-300'
                      }`}
                      onClick={() => setSelectedRole(option.value)}
                    >
                      {/* Premium Badge */}
                      {option.isPremium && (
                        <div className="absolute -top-3 -right-3 bg-amber-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                          PREMIUM
                        </div>
                      )}

                      {/* Free Badge */}
                      {option.freeUpgrade && (
                        <div className="absolute -top-3 -right-3 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                          FREE
                        </div>
                      )}

                      <div className="text-center mb-4">
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 ${
                          option.isPremium ? 'bg-amber-100' : 'bg-teal-100'
                        }`}>
                          <span className="text-2xl">{option.icon}</span>
                        </div>
                        <h3 className="font-semibold text-gray-900">{option.label}</h3>
                        <p className="text-sm text-gray-600 mt-1">{option.description}</p>
                        
                        {/* Monthly Fee Display */}
                        {option.isPremium && (
                          <div className="mt-2 px-3 py-1 bg-amber-100 text-amber-800 text-sm font-medium rounded-full inline-block">
                            {option.monthlyFee}
                          </div>
                        )}
                        {option.freeUpgrade && (
                          <div className="mt-2 px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full inline-block">
                            100% Free
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        {option.benefits.map((benefit, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm">
                            <div className={`w-1.5 h-1.5 rounded-full ${
                              option.isPremium ? 'bg-amber-500' : 'bg-teal-500'
                            }`}></div>
                            <span className="text-gray-600">{benefit}</span>
                          </div>
                        ))}
                      </div>

                      {selectedRole === option.value && (
                        <div className={`mt-4 p-3 rounded-lg ${
                          option.isPremium ? 'bg-amber-100' : 'bg-teal-100'
                        }`}>
                          <p className={`text-xs font-medium ${
                            option.isPremium ? 'text-amber-700' : 'text-teal-700'
                          }`}>
                            ✓ Selected for {option.isPremium ? 'subscription' : 'upgrade'}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {selectedRole && (
                  <div className="flex justify-center">
                    {roleOptions.find(r => r.value === selectedRole)?.isPremium ? (
                      // Premium Shop Owner - Show subscription flow
                      <div className="text-center">
                        <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                          <h4 className="font-semibold text-amber-900 mb-2">🏪 Premium Shop Subscription</h4>
                          <p className="text-sm text-amber-700 mb-3">
                            Get your professional online shop for just <strong>$29.99/month</strong>
                          </p>
                          <div className="text-xs text-amber-600">
                            ✓ 7-day free trial • ✓ Cancel anytime • ✓ Secure payment via Tranzak
                          </div>
                        </div>
                        <button
                          onClick={handleRoleUpgrade}
                          disabled={isUpgrading}
                          className="px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                          {isUpgrading ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              Processing...
                            </>
                          ) : (
                            <>
                              <span>💳</span>
                              Start 7-Day Free Trial
                            </>
                          )}
                        </button>
                      </div>
                    ) : (
                      // Free roles - Direct upgrade
                      <button
                        onClick={handleRoleUpgrade}
                        disabled={isUpgrading}
                        className="px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {isUpgrading ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Upgrading...
                          </>
                        ) : (
                          <>
                            <span>🚀</span>
                            Upgrade to {roleOptions.find(r => r.value === selectedRole)?.label}
                          </>
                        )}
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {availableUpgrades.length === 0 && (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🎉</span>
                </div>
                <h3 className="font-medium text-gray-900 mb-2">You're all set!</h3>
                <p className="text-gray-600">
                  You already have an advanced role with full access to platform features.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserSettings;