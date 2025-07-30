import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import api from '../../../services/api';

const RecentActivitiesModal = ({ isOpen, onClose }) => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    if (isOpen) {
      fetchAllActivities();
    }
  }, [isOpen]);

  const fetchAllActivities = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await api.getDashboardActivity();
      setActivities(data.activities || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch activities');
      console.error('Activities fetch error:', err);
    } finally {
      setLoading(false);
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
      case 'pending': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'completed': return 'text-green-600 bg-green-50 border-green-200';
      case 'resolved': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'order': return 'text-blue-600 bg-blue-50';
      case 'user': return 'text-green-600 bg-green-50';
      case 'shop': return 'text-purple-600 bg-purple-50';
      case 'system': return 'text-gray-600 bg-gray-50';
      case 'dispute': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const filterActivities = (activities) => {
    let filtered = activities;
    
    if (filter !== 'all') {
      filtered = filtered.filter(activity => activity.type === filter);
    }
    
    // Sort activities
    filtered.sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.created_at || Date.now()) - new Date(a.created_at || Date.now());
      } else {
        return new Date(a.created_at || Date.now()) - new Date(b.created_at || Date.now());
      }
    });
    
    return filtered;
  };

  const formatTime = (timeString) => {
    if (!timeString) return 'Just now';
    
    // If it's already formatted (like "1 hour ago"), return as is
    if (timeString.includes('ago') || timeString.includes('sec') || timeString.includes('min') || timeString.includes('hour')) {
      return timeString;
    }
    
    // Otherwise, format the date
    try {
      const date = new Date(timeString);
      const now = new Date();
      const diff = now - date;
      const minutes = Math.floor(diff / 60000);
      const hours = Math.floor(diff / 3600000);
      const days = Math.floor(diff / 86400000);
      
      if (minutes < 1) return 'Just now';
      if (minutes < 60) return `${minutes} min ago`;
      if (hours < 24) return `${hours} hours ago`;
      return `${days} days ago`;
    } catch (error) {
      return timeString;
    }
  };

  const filteredActivities = filterActivities(activities);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Recent Activities</h2>
              <p className="text-indigo-100 mt-1">Complete activity log and system events</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <Icon name="X" size={24} />
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="border-b border-gray-200 p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mr-2">Filter by type:</label>
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Types</option>
                  <option value="user">User Activities</option>
                  <option value="order">Orders</option>
                  <option value="shop">Shop Activities</option>
                  <option value="system">System Events</option>
                  <option value="dispute">Disputes</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mr-2">Sort by:</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                </select>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button onClick={fetchAllActivities} variant="outline" size="sm" iconName="RefreshCw" disabled={loading}>
                Refresh
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {loading && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading Activities...</h3>
              <p className="text-gray-600">Fetching recent system activities...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
              <Icon name="AlertCircle" size={32} className="mx-auto text-red-600 mb-4" />
              <h3 className="text-lg font-semibold text-red-900 mb-2">Error Loading Activities</h3>
              <p className="text-red-700 mb-4">{error}</p>
              <Button onClick={fetchAllActivities} variant="outline" iconName="RefreshCw">
                Try Again
              </Button>
            </div>
          )}

          {!loading && !error && filteredActivities.length === 0 && (
            <div className="text-center py-12">
              <Icon name="Activity" size={48} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Activities Found</h3>
              <p className="text-gray-600">
                {filter === 'all' ? 'No recent activities to display.' : `No ${filter} activities found.`}
              </p>
            </div>
          )}

          {!loading && !error && filteredActivities.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {filteredActivities.length} {filter === 'all' ? 'Activities' : `${filter} Activities`}
                </h3>
                <span className="text-sm text-gray-500">
                  Showing {filter === 'all' ? 'all' : filter} activities sorted by {sortBy}
                </span>
              </div>

              {filteredActivities.map((activity, index) => (
                <div key={activity.id || index} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                  <div className="flex items-start space-x-4">
                    {/* Activity Icon */}
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${getTypeColor(activity.type)}`}>
                      <Icon name={getActivityIcon(activity.type)} size={18} />
                    </div>
                    
                    {/* Activity Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900 mb-1">{activity.message}</p>
                          
                          {/* Additional Info */}
                          {activity.user_email && (
                            <p className="text-xs text-gray-500 mb-1">
                              User: {activity.user_email}
                            </p>
                          )}
                          
                          <div className="flex items-center space-x-3 text-xs text-gray-500">
                            <span className="flex items-center">
                              <Icon name="Clock" size={12} className="mr-1" />
                              {formatTime(activity.time)}
                            </span>
                            <span className="flex items-center">
                              <Icon name="Tag" size={12} className="mr-1" />
                              {activity.type}
                            </span>
                          </div>
                        </div>
                        
                        {/* Status Badge */}
                        <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getActivityColor(activity.status)}`}>
                          <div className="flex items-center space-x-1">
                            <div className={`w-2 h-2 rounded-full ${
                              activity.status === 'completed' ? 'bg-green-500' :
                              activity.status === 'pending' ? 'bg-yellow-500' : 'bg-blue-500'
                            }`}></div>
                            <span className="capitalize">{activity.status}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4 flex justify-between items-center">
          <div className="text-sm text-gray-500">
            {!loading && !error && (
              <>
                Showing {filteredActivities.length} of {activities.length} total activities
              </>
            )}
          </div>
          <Button onClick={onClose} variant="outline">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RecentActivitiesModal;