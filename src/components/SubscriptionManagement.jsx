import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { showToast } from './ui/Toast';
import api from '../services/api';
import Icon from './AppIcon';

const SubscriptionManagement = ({ onSwitchToSubscriptionTab }) => {
  const { user, refreshUserData } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showDowngradeModal, setShowDowngradeModal] = useState(false);
  const [selectedNewRole, setSelectedNewRole] = useState('');
  const [cancellationReason, setCancellationReason] = useState('');
  const [userStats, setUserStats] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);

  // Available roles for downgrading
  const availableRoles = [
    { value: 'CUSTOMER', label: 'Customer', description: 'Basic shopping access only' },
    { value: 'DELIVERY_AGENT', label: 'Delivery Agent', description: 'Can deliver orders for other sellers' },
    { value: 'CASUAL_SELLER', label: 'Casual Seller', description: 'Can sell up to 10 products' },
    { value: 'FREE', label: 'Free User', description: 'Limited access, no selling privileges' }
  ];

  const currentSubscription = user?.subscription || {};
  const isSubscribed = currentSubscription.status === 'active';

  // Fetch user statistics and activity
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch user statistics
        const statsResponse = await api.get('/api/analytics/user-stats');
        if (statsResponse.success) {
          setUserStats(statsResponse.data);
        }
        
        // Fetch recent activity
        const activityResponse = await api.get('/api/analytics/recent-activity');
        if (activityResponse.success) {
          setRecentActivity(activityResponse.data);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchUserData();
    }
  }, [user]);

  const handleCancelSubscription = async () => {
    if (!cancellationReason.trim()) {
      showToast('Please provide a reason for cancellation', 'error');
      return;
    }

    setIsLoading(true);
    try {
      await api.post('/api/subscription/cancel', {
        reason: cancellationReason,
        user_id: user.id
      });

      showToast('Subscription cancelled successfully', 'success');
      await refreshUserData();
      setShowCancelModal(false);
      setCancellationReason('');
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      showToast('Failed to cancel subscription. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleDowngrade = async () => {
    if (!selectedNewRole) {
      showToast('Please select a new role', 'error');
      return;
    }

    setIsLoading(true);
    try {
      await api.post('/api/subscription/downgrade', {
        new_role: selectedNewRole,
        user_id: user.id,
        current_role: user.role
      });

      showToast(`Successfully downgraded to ${availableRoles.find(r => r.value === selectedNewRole)?.label}`, 'success');
      await refreshUserData();
      setShowDowngradeModal(false);
      setSelectedNewRole('');
    } catch (error) {
      console.error('Error downgrading role:', error);
      showToast('Failed to downgrade role. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const getDataDeletionWarning = (newRole) => {
    const warnings = {
      'CUSTOMER': [
        'All your product listings will be removed',
        'Your shop profile will be deactivated',
        'You will lose access to seller dashboard',
        'Your sales history will be archived'
      ],
      'DELIVERY_AGENT': [
        'All your product listings will be removed',
        'Your shop profile will be deactivated',
        'You will lose access to seller dashboard',
        'Your sales history will be archived',
        'You will gain access to delivery dashboard'
      ],
      'CASUAL_SELLER': [
        'You can only list up to 10 products',
        'Advanced seller features will be disabled',
        'Your current product count will be reduced if over 10'
      ],
      'FREE': [
        'All your product listings will be removed',
        'Your shop profile will be deactivated',
        'You will lose all selling privileges',
        'Your sales history will be archived',
        'You will have limited access to features'
      ]
    };
    return warnings[newRole] || [];
  };

  if (!isSubscribed) {
    return (
      <div className="space-y-6">
        {/* Current Plan Status */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Current Plan</h3>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
              {userStats?.subscription?.plan || 'Free Plan'}
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-xl">
              <div className="text-2xl font-bold text-gray-900">
                {isLoading ? '...' : (userStats?.overview?.total_products || 0)}
              </div>
              <div className="text-sm text-gray-600">Products Listed</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-xl">
              <div className="text-2xl font-bold text-gray-900">
                {isLoading ? '...' : (userStats?.overview?.total_orders || 0)}
              </div>
              <div className="text-sm text-gray-600">Orders Received</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-xl">
              <div className="text-2xl font-bold text-gray-900">
                {isLoading ? '...' : `$${userStats?.overview?.total_revenue || 0}`}
              </div>
              <div className="text-sm text-gray-600">Revenue Generated</div>
            </div>
          </div>
        </div>

        {/* Plan Comparison */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Available Plans</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Free Plan */}
            <div className="border border-gray-200 rounded-xl p-6">
              <div className="text-center mb-4">
                <h4 className="text-xl font-semibold text-gray-900">Free Plan</h4>
                <div className="text-3xl font-bold text-gray-900 mt-2">$0<span className="text-lg text-gray-500">/month</span></div>
              </div>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center text-sm text-gray-600">
                  <Icon name="Check" className="w-4 h-4 text-green-500 mr-3" />
                  Up to 10 products
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <Icon name="Check" className="w-4 h-4 text-green-500 mr-3" />
                  Basic analytics
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <Icon name="Check" className="w-4 h-4 text-green-500 mr-3" />
                  Community support
                </li>
                <li className="flex items-center text-sm text-gray-400">
                  <Icon name="X" className="w-4 h-4 text-gray-400 mr-3" />
                  Custom shop branding
                </li>
                <li className="flex items-center text-sm text-gray-400">
                  <Icon name="X" className="w-4 h-4 text-gray-400 mr-3" />
                  Advanced analytics
                </li>
              </ul>
              <button className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg font-medium">
                Current Plan
              </button>
            </div>

            {/* Shop Owner Plan */}
            <div className="border-2 border-teal-500 rounded-xl p-6 relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-teal-500 text-white px-3 py-1 rounded-full text-sm font-medium">Recommended</span>
              </div>
              <div className="text-center mb-4">
                <h4 className="text-xl font-semibold text-gray-900">Shop Owner</h4>
                <div className="text-3xl font-bold text-gray-900 mt-2">$29.99<span className="text-lg text-gray-500">/month</span></div>
                <p className="text-sm text-gray-600 mt-1">7-day free trial</p>
              </div>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center text-sm text-gray-600">
                  <Icon name="Check" className="w-4 h-4 text-green-500 mr-3" />
                  Unlimited products
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <Icon name="Check" className="w-4 h-4 text-green-500 mr-3" />
                  Advanced analytics
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <Icon name="Check" className="w-4 h-4 text-green-500 mr-3" />
                  Custom shop branding
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <Icon name="Check" className="w-4 h-4 text-green-500 mr-3" />
                  Priority support
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <Icon name="Check" className="w-4 h-4 text-green-500 mr-3" />
                  API access
                </li>
              </ul>
              <button 
                onClick={() => onSwitchToSubscriptionTab ? onSwitchToSubscriptionTab() : window.location.href = '/settings?tab=subscription'}
                className="w-full bg-teal-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-teal-700 transition-colors"
              >
                Upgrade Now
              </button>
            </div>
          </div>
        </div>

        {/* Role Change Options */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Change Your Role</h3>
          <p className="text-gray-600 mb-6">Switch to a different role level based on your needs</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {availableRoles.map((role) => (
              <div key={role.value} className="border border-gray-200 rounded-xl p-4 hover:border-teal-300 transition-colors">
                <div className="text-center">
                  <h4 className="font-semibold text-gray-900 mb-2">{role.label}</h4>
                  <p className="text-sm text-gray-600 mb-4">{role.description}</p>
                  <button
                    onClick={() => {
                      setSelectedNewRole(role.value);
                      setShowDowngradeModal(true);
                    }}
                    className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                  >
                    Switch to {role.label}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Usage Statistics */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Usage This Month</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Products Listed</span>
                <span>
                  {isLoading ? '...' : `${userStats?.overview?.products_this_month || 0} / ${userStats?.usage?.products?.limit || '∞'}`}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-teal-500 h-2 rounded-full transition-all duration-300" 
                  style={{
                    width: userStats?.usage?.products?.percentage ? `${Math.min(userStats.usage.products.percentage, 100)}%` : '0%'
                  }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Storage Used</span>
                <span>
                  {isLoading ? '...' : `${userStats?.usage?.storage?.used_mb || 0} MB / ${userStats?.usage?.storage?.limit_mb || '∞'} MB`}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300" 
                  style={{
                    width: userStats?.usage?.storage?.percentage ? `${Math.min(userStats.usage.storage.percentage, 100)}%` : '0%'
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        {recentActivity.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
            <div className="space-y-3">
              {recentActivity.slice(0, 5).map((activity, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Icon name={activity.icon || "Activity"} className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                    <p className="text-xs text-gray-600">{activity.description}</p>
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(activity.timestamp).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Current Subscription Status */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Current Subscription</h3>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
            <Icon name="CheckCircle" className="w-4 h-4 mr-1" />
            Active
          </span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-1">Plan</h4>
              <p className="text-lg font-semibold text-gray-900">{currentSubscription.plan_type || 'Shop Owner'}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-1">Monthly Fee</h4>
              <p className="text-lg font-semibold text-gray-900">${currentSubscription.monthly_fee || '29.99'}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-1">Next Billing</h4>
              <p className="text-sm text-gray-900">
                {currentSubscription.current_period_end ? 
                  new Date(currentSubscription.current_period_end).toLocaleDateString() : 
                  'N/A'
                }
              </p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-1">Status</h4>
              <p className="text-sm text-gray-900 capitalize">{currentSubscription.status || 'Active'}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-1">Trial Ends</h4>
              <p className="text-sm text-gray-900">
                {currentSubscription.trial_ends_at ? 
                  new Date(currentSubscription.trial_ends_at).toLocaleDateString() : 
                  'N/A'
                }
              </p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-1">Started</h4>
              <p className="text-sm text-gray-900">
                {currentSubscription.created_at ? 
                  new Date(currentSubscription.created_at).toLocaleDateString() : 
                  'N/A'
                }
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Subscription Management Actions */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Manage Subscription</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => setShowCancelModal(true)}
            className="flex items-center justify-center space-x-3 p-4 border border-red-200 rounded-xl hover:bg-red-50 transition-colors group"
          >
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center group-hover:bg-red-200 transition-colors">
              <Icon name="XCircle" className="w-5 h-5 text-red-600" />
            </div>
            <div className="text-left">
              <h4 className="font-semibold text-gray-900">Cancel Subscription</h4>
              <p className="text-sm text-gray-600">Permanently cancel your subscription</p>
            </div>
          </button>

          <button
            onClick={() => setShowDowngradeModal(true)}
            className="flex items-center justify-center space-x-3 p-4 border border-yellow-200 rounded-xl hover:bg-yellow-50 transition-colors group"
          >
            <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center group-hover:bg-yellow-200 transition-colors">
              <Icon name="ArrowDown" className="w-5 h-5 text-yellow-600" />
            </div>
            <div className="text-left">
              <h4 className="font-semibold text-gray-900">Change Plan</h4>
              <p className="text-sm text-gray-600">Switch to a different plan</p>
            </div>
          </button>
        </div>
      </div>

      {/* Cancel Subscription Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <Icon name="AlertTriangle" className="w-5 h-5 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Cancel Subscription</h3>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-600 mb-4">
                Are you sure you want to cancel your subscription? This action cannot be undone.
              </p>
              
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <h4 className="font-semibold text-red-800 mb-2">⚠️ What will happen:</h4>
                <ul className="text-sm text-red-700 space-y-1">
                  <li>• All your product listings will be removed</li>
                  <li>• Your shop profile will be deactivated</li>
                  <li>• You will lose access to seller dashboard</li>
                  <li>• Your sales history will be archived</li>
                  <li>• You will be downgraded to a free user</li>
                </ul>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for cancellation (required)
                </label>
                <textarea
                  value={cancellationReason}
                  onChange={(e) => setCancellationReason(e.target.value)}
                  placeholder="Please tell us why you're cancelling..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  rows={3}
                />
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowCancelModal(false)}
                className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Keep Subscription
              </button>
              <button
                onClick={handleCancelSubscription}
                disabled={isLoading || !cancellationReason.trim()}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? 'Cancelling...' : 'Yes, Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Downgrade Role Modal */}
      {showDowngradeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                <Icon name="AlertTriangle" className="w-5 h-5 text-yellow-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Downgrade Role</h3>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-600 mb-4">
                Select a new role level. This will change your current permissions and may affect your data.
              </p>
              
              <div className="space-y-3 mb-6">
                {availableRoles.map((role) => (
                  <label key={role.value} className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="radio"
                      name="newRole"
                      value={role.value}
                      checked={selectedNewRole === role.value}
                      onChange={(e) => setSelectedNewRole(e.target.value)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{role.label}</div>
                      <div className="text-sm text-gray-600">{role.description}</div>
                    </div>
                  </label>
                ))}
              </div>

              {selectedNewRole && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="font-semibold text-yellow-800 mb-2">⚠️ Data Impact Warning:</h4>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    {getDataDeletionWarning(selectedNewRole).map((warning, index) => (
                      <li key={index}>• {warning}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowDowngradeModal(false)}
                className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleRoleDowngrade}
                disabled={isLoading || !selectedNewRole}
                className="flex-1 bg-yellow-600 text-white py-2 px-4 rounded-lg hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? 'Processing...' : 'Confirm Downgrade'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionManagement;
