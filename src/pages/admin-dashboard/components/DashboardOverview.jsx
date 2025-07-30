import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import api from '../../../services/api';
import SystemReportModal from './SystemReportModal';
import RecentActivitiesModal from './RecentActivitiesModal';

const DashboardOverview = ({ onTabChange }) => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeShops: 0,
    totalOrders: 0,
    monthlyRevenue: 0,
    pendingApprovals: 0,
    systemHealth: 0,
    customers: 0,
    shopOwners: 0,
    deliveryAgents: 0,
    admins: 0,
    newUsersThisMonth: 0,
    usersToday: 0
  });

  const [trends, setTrends] = useState({});
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showActivitiesModal, setShowActivitiesModal] = useState(false);

  useEffect(() => {
    fetchDashboardData();
    
    // Set up auto-refresh every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch overview data and activity in parallel
      const [overviewData, activityData] = await Promise.all([
        api.getDashboardOverview(),
        api.getDashboardActivity()
      ]);

      setStats({
        totalUsers: overviewData.total_users,
        activeShops: overviewData.shop_owners, // Using shop owners as active shops for now
        totalOrders: overviewData.total_orders,
        monthlyRevenue: overviewData.monthly_revenue,
        pendingApprovals: overviewData.pending_approvals,
        systemHealth: overviewData.system_health,
        customers: overviewData.customers,
        shopOwners: overviewData.shop_owners,
        deliveryAgents: overviewData.delivery_agents,
        admins: overviewData.admins,
        newUsersThisMonth: overviewData.new_users_this_month,
        usersToday: overviewData.users_today
      });

      setTrends(overviewData.trends || {});
      setLastUpdated(overviewData.last_updated);
      setRecentActivity(activityData.activities || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch dashboard data');
      console.error('Dashboard data fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    { id: 1, title: 'Review Orders', description: `${stats.totalOrders || 0} total orders`, icon: 'ShoppingBag', color: 'bg-yellow-500', action: 'review-orders' },
    { id: 2, title: 'User Management', description: `${stats.totalUsers || 0} total users`, icon: 'Users', color: 'bg-blue-500', action: 'user-management' },
    { id: 3, title: 'Analytics', description: 'View detailed analytics', icon: 'BarChart3', color: 'bg-indigo-500', action: 'analytics' },
    { id: 4, title: 'System Health', description: `${stats.systemHealth || 0}% healthy`, icon: 'Activity', color: 'bg-green-500', action: 'system-health' }
  ];

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-CM', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat().format(num);
  };

  const renderTrendIndicator = (trendKey) => {
    const trend = trends[trendKey];
    if (!trend) return null;

    const isUp = trend.direction === 'up';
    const isDown = trend.direction === 'down';
    const isNeutral = trend.direction === 'neutral';

    return (
      <div className="mt-4 flex items-center text-sm">
        <Icon 
          name={isUp ? "TrendingUp" : isDown ? "TrendingDown" : "Minus"} 
          size={16} 
          className={`mr-1 ${
            isUp ? 'text-green-500' : 
            isDown ? 'text-red-500' : 
            'text-gray-500'
          }`} 
        />
        <span className={`font-medium ${
          isUp ? 'text-green-500' : 
          isDown ? 'text-red-500' : 
          'text-gray-500'
        }`}>
          {isNeutral ? '0' : `${isUp ? '+' : '-'}${trend.percentage}`}%
        </span>
        <span className="text-gray-500 ml-1">
          {trendKey === 'users_today' ? 'from yesterday' : 'from last month'}
        </span>
      </div>
    );
  };

  const formatLastUpdated = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const handleQuickAction = (action) => {
    switch (action) {
      case 'review-orders':
        if (onTabChange) onTabChange('orders');
        break;
      case 'user-management':
        if (onTabChange) onTabChange('users');
        break;
      case 'analytics':
        if (onTabChange) onTabChange('analytics');
        break;
      case 'system-health':
        // Could open a system health modal or scroll to system health section
        setShowReportModal(true);
        break;
      default:
        console.log(`Action ${action} not implemented yet`);
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'order': return 'ShoppingBag';
      case 'user': return 'UserPlus';
      case 'shop': return 'Store';
      case 'system': return 'Server';
      case 'dispute': return 'AlertTriangle';
      default: return 'Activity';
    }
  };

  const getActivityColor = (status) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-50';
      case 'completed': return 'text-green-600 bg-green-50';
      case 'resolved': return 'text-blue-600 bg-blue-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  if (loading) {
    return (
      <div className="p-4 lg:p-6 space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading dashboard data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 lg:p-6 space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <Icon name="AlertCircle" size={20} className="text-red-600 mr-2" />
            <div>
              <h3 className="text-red-800 font-medium">Error loading dashboard</h3>
              <p className="text-red-600 text-sm mt-1">{error}</p>
            </div>
          </div>
          <button
            onClick={fetchDashboardData}
            className="mt-3 bg-red-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Welcome back, Admin!</h2>
            <p className="text-blue-100">Here's what's happening with your platform today.</p>
          </div>
          <Button
            onClick={() => setShowReportModal(true)}
            variant="secondary"
            iconName="FileText"
            className="bg-white/20 hover:bg-white/30 text-white border-white/30"
          >
            Generate Report
          </Button>
        </div>
        <div className="mt-4 flex items-center space-x-4 text-sm">
          <div className="flex items-center space-x-1">
            <Icon name="RefreshCw" size={16} />
            <span>Last updated: {lastUpdated ? formatLastUpdated(lastUpdated) : 'Loading...'}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Icon name="Activity" size={16} />
            <span>System Status: {stats.systemHealth > 90 ? 'Healthy' : 'Needs Attention'}</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span>Live Data</span>
          </div>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Total Users */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(stats.totalUsers)}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Icon name="Users" size={24} className="text-blue-600" />
            </div>
          </div>
          {renderTrendIndicator('total_users')}
        </div>

        {/* Active Shops */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Active Shops</p>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(stats.activeShops)}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Icon name="Store" size={24} className="text-purple-600" />
            </div>
          </div>
          {renderTrendIndicator('shop_owners')}
        </div>

        {/* Total Orders */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(stats.totalOrders)}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Icon name="ShoppingBag" size={24} className="text-green-600" />
            </div>
          </div>
          {renderTrendIndicator('orders')}
        </div>

        {/* Monthly Revenue */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-md transition-shadow md:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Monthly Revenue</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.monthlyRevenue)}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Icon name="DollarSign" size={24} className="text-yellow-600" />
            </div>
          </div>
          {renderTrendIndicator('revenue')}
        </div>


        {/* System Health */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">System Health</p>
              <p className="text-2xl font-bold text-gray-900">{stats.systemHealth}%</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Icon name="Activity" size={24} className="text-green-600" />
            </div>
          </div>
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${stats.systemHealth}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* New Users Today */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">New Users Today</p>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(stats.usersToday)}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Icon name="UserPlus" size={24} className="text-blue-600" />
            </div>
          </div>
          {renderTrendIndicator('users_today')}
        </div>

        {/* New Users This Month */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">New Users This Month</p>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(stats.newUsersThisMonth)}</p>
            </div>
            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
              <Icon name="TrendingUp" size={24} className="text-indigo-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <Icon name="Calendar" size={16} className="text-indigo-500 mr-1" />
            <span className="text-indigo-500 font-medium">This Month</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <button
              key={action.id}
              onClick={() => handleQuickAction(action.action)}
              className="p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md hover:bg-blue-50 transition-all text-left group active:scale-95"
            >
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 ${action.color} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <Icon name={action.icon} size={20} className="text-white" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 group-hover:text-blue-700">{action.title}</p>
                  <p className="text-sm text-gray-500 group-hover:text-blue-600">{action.description}</p>
                </div>
              </div>
              <div className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="flex items-center text-xs text-blue-600">
                  <span>Click to navigate</span>
                  <Icon name="ArrowRight" size={12} className="ml-1" />
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
          <button 
            onClick={() => setShowActivitiesModal(true)}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center space-x-1 hover:bg-blue-50 px-2 py-1 rounded transition-colors"
          >
            <span>View All</span>
            <Icon name="ExternalLink" size={14} />
          </button>
        </div>
        <div className="space-y-4">
          {recentActivity.map((activity) => (
            <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getActivityColor(activity.status)}`}>
                <Icon name={getActivityIcon(activity.type)} size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900">{activity.message}</p>
                <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
              </div>
              <div className={`px-2 py-1 rounded-full text-xs font-medium ${getActivityColor(activity.status)}`}>
                {activity.status}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* System Report Modal */}
      <SystemReportModal 
        isOpen={showReportModal} 
        onClose={() => setShowReportModal(false)} 
      />

      {/* Recent Activities Modal */}
      <RecentActivitiesModal 
        isOpen={showActivitiesModal} 
        onClose={() => setShowActivitiesModal(false)} 
      />
    </div>
  );
};

export default DashboardOverview;

