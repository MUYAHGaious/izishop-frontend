import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import api from '../../../services/api';

const SubscriptionManagement = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [metrics, setMetrics] = useState({
    totalSubscriptions: 0,
    activeSubscriptions: 0,
    monthlyRevenue: 0,
    churnRate: 0,
    trialConversions: 0
  });
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('30d');

  useEffect(() => {
    fetchSubscriptionData();
  }, [selectedPeriod]);

  const fetchSubscriptionData = async () => {
    try {
      setLoading(true);
      
      // Fetch subscriptions
      const subscriptionResponse = await api.get('/admin/subscriptions');
      setSubscriptions(subscriptionResponse.data || []);
      
      // Fetch subscription metrics
      const metricsResponse = await api.get(`/admin/subscription-metrics?period=${selectedPeriod}`);
      setMetrics(metricsResponse.data || metrics);
      
    } catch (error) {
      console.error('Error fetching subscription data:', error);
      // Use mock data for development
      setSubscriptions(generateMockSubscriptions());
      setMetrics({
        totalSubscriptions: 45,
        activeSubscriptions: 38,
        monthlyRevenue: 1134.62,
        churnRate: 8.5,
        trialConversions: 72.3
      });
    } finally {
      setLoading(false);
    }
  };

  const generateMockSubscriptions = () => {
    const statuses = ['active', 'trialing', 'past_due', 'canceled'];
    const plans = ['shop_owner'];
    
    return Array.from({ length: 20 }, (_, i) => ({
      id: `sub_${i + 1}`,
      userId: `user_${i + 1}`,
      userEmail: `shop.owner.${i + 1}@example.com`,
      userName: `Shop Owner ${i + 1}`,
      planType: plans[Math.floor(Math.random() * plans.length)],
      status: statuses[Math.floor(Math.random() * statuses.length)],
      monthlyFee: 29.99,
      currentPeriodStart: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
      currentPeriodEnd: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000),
      trialEndsAt: Math.random() > 0.7 ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) : null,
      createdAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000)
    }));
  };

  const getStatusColor = (status) => {
    const colors = {
      'active': 'bg-teal-100 text-teal-800',
      'trialing': 'bg-teal-100 text-teal-800',
      'past_due': 'bg-yellow-100 text-yellow-800',
      'canceled': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status) => {
    const icons = {
      'active': 'CheckCircle',
      'trialing': 'Clock',
      'past_due': 'AlertTriangle',
      'canceled': 'XCircle'
    };
    return icons[status] || 'Help';
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Subscription Management</h2>
          <p className="text-sm text-gray-600 mt-1">Monitor and manage Shop Owner subscriptions</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="1y">Last Year</option>
          </select>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="p-3 bg-teal-100 rounded-xl">
              <Icon name="Users" size={24} className="text-teal-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Total Subscriptions</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.totalSubscriptions}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="p-3 bg-teal-100 rounded-xl">
              <Icon name="CheckCircle" size={24} className="text-teal-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Active</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.activeSubscriptions}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="p-3 bg-teal-100 rounded-xl">
              <Icon name="DollarSign" size={24} className="text-teal-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Monthly Revenue</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(metrics.monthlyRevenue)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="p-3 bg-red-100 rounded-xl">
              <Icon name="TrendingDown" size={24} className="text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Churn Rate</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.churnRate}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-xl">
              <Icon name="TrendingUp" size={24} className="text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Trial Conversion</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.trialConversions}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Subscriptions Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="px-8 py-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Recent Subscriptions</h3>
          <p className="text-sm text-gray-600 mt-1">Manage and monitor subscription activities</p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-8 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-8 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Plan
                </th>
                <th className="px-8 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-8 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Revenue
                </th>
                <th className="px-8 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Period
                </th>
                <th className="px-8 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {subscriptions.map((subscription) => (
                <tr key={subscription.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-8 py-6 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-12 w-12 bg-gradient-to-r from-teal-500 to-teal-600 rounded-full flex items-center justify-center shadow-sm">
                        <span className="text-white font-semibold text-sm">
                          {subscription.userName.charAt(0)}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-semibold text-gray-900">{subscription.userName}</div>
                        <div className="text-sm text-gray-500">{subscription.userEmail}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 whitespace-nowrap">
                    <div className="text-sm font-semibold text-gray-900">Shop Owner</div>
                    <div className="text-sm text-gray-500">{formatCurrency(subscription.monthlyFee)}/month</div>
                  </td>
                  <td className="px-8 py-6 whitespace-nowrap">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(subscription.status)}`}>
                      <Icon name={getStatusIcon(subscription.status)} size={12} className="mr-1" />
                      {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
                    </span>
                    {subscription.trialEndsAt && (
                      <div className="text-xs text-gray-500 mt-2">
                        Trial ends {formatDate(subscription.trialEndsAt)}
                      </div>
                    )}
                  </td>
                  <td className="px-8 py-6 whitespace-nowrap">
                    <div className="text-sm font-semibold text-gray-900">{formatCurrency(subscription.monthlyFee)}</div>
                  </td>
                  <td className="px-8 py-6 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {formatDate(subscription.currentPeriodStart)} - {formatDate(subscription.currentPeriodEnd)}
                    </div>
                  </td>
                  <td className="px-8 py-6 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-3">
                      <button className="text-teal-600 hover:text-teal-900 p-2 rounded-lg hover:bg-teal-50 transition-colors">
                        <Icon name="Eye" size={16} />
                      </button>
                      <button className="text-gray-600 hover:text-gray-900 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                        <Icon name="Edit" size={16} />
                      </button>
                      {subscription.status === 'active' && (
                        <button className="text-red-600 hover:text-red-900 p-2 rounded-lg hover:bg-red-50 transition-colors">
                          <Icon name="Pause" size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Table Footer */}
        <div className="px-8 py-4 bg-gray-50 border-t border-gray-200 rounded-b-xl">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Showing {subscriptions.length} subscriptions
            </p>
            <div className="flex items-center space-x-2">
              <button className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                Previous
              </button>
              <button className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionManagement;