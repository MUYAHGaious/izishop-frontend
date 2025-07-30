import React, { useState, useEffect } from 'react';
import Icon from '../AppIcon';
import notificationService from '../../services/notificationService';

const NotificationCenter = ({ analyticsData, salesData, customerData, daysActive = 1 }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    generateNotifications();
  }, [analyticsData, salesData, customerData, daysActive]);

  const generateNotifications = async () => {
    try {
      setLoading(true);
      
      // Check if notificationService is properly loaded
      if (!notificationService || typeof notificationService.generateSmartNotifications !== 'function') {
        console.warn('NotificationService not properly loaded, using fallback notifications');
        // Provide fallback notifications for now
        const fallbackNotifications = [
          {
            id: 'fallback-1',
            title: 'Welcome to AI Analytics!',
            message: 'Your smart notification system is now active and learning from your data.',
            type: 'onboarding',
            priority: 'medium',
            tier: 1,
            retention: true,
            read: false,
            actionable: true,
            action: 'Learn More'
          }
        ];
        setNotifications(fallbackNotifications);
        setUnreadCount(1);
        setLoading(false);
        return;
      }
      
      const generatedNotifications = await notificationService.generateSmartNotifications(
        salesData || [],
        customerData || { customers: [] },
        analyticsData || {},
        daysActive
      );
      
      // Filter to show only the most important notifications
      const importantNotifications = generatedNotifications
        .filter(n => n.retention || n.priority === 'high' || n.tier <= 2)
        .slice(0, 5); // Show max 5 notifications
      
      setNotifications(importantNotifications);
      setUnreadCount(importantNotifications.filter(n => !n.read).length);
    } catch (error) {
      console.error('Error generating notifications:', error);
      // Provide error fallback
      setNotifications([{
        id: 'error-1',
        title: 'Notification System Loading',
        message: 'AI notifications are being initialized. Please refresh the page in a moment.',
        type: 'onboarding',
        priority: 'low',
        tier: 1,
        retention: false,
        read: false,
        actionable: false
      }]);
      setUnreadCount(1);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = (notificationId) => {
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const handleNotificationClick = (notification) => {
    markAsRead(notification.id);
    if (notification.actionable) {
      // Handle action (could navigate to specific page)
      console.log('Notification action:', notification.action);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'border-red-200 bg-red-50';
      case 'medium': return 'border-yellow-200 bg-yellow-50';
      case 'low': return 'border-blue-200 bg-blue-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'milestone': return 'Trophy';
      case 'anomaly': return 'TrendingUp';
      case 'forecast': return 'Activity';
      case 'trend': return 'BarChart3';
      case 'customer': return 'Users';
      case 'onboarding': return 'Zap';
      case 'engagement': return 'Heart';
      case 'feature_unlock': return 'Unlock';
      case 'segmentation': return 'Target';
      default: return 'Bell';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'milestone': return 'text-yellow-600';
      case 'anomaly': return 'text-green-600';
      case 'forecast': return 'text-purple-600';
      case 'trend': return 'text-blue-600';
      case 'customer': return 'text-indigo-600';
      case 'onboarding': return 'text-orange-600';
      case 'engagement': return 'text-pink-600';
      case 'feature_unlock': return 'text-emerald-600';
      case 'segmentation': return 'text-cyan-600';
      default: return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="relative">
        <button className="p-2 text-gray-600 hover:text-gray-900 relative">
          <Icon name="Bell" size={20} />
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-gray-300 rounded-full animate-pulse"></div>
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-gray-600 hover:text-gray-900 relative transition-colors"
      >
        <Icon name="Bell" size={20} />
        {unreadCount > 0 && (
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </div>
        )}
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-y-auto">
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">AI Insights</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <Icon name="X" size={16} />
              </button>
            </div>
            <p className="text-sm text-gray-600 mt-1">Smart notifications from your analytics</p>
          </div>

          {/* Notifications List */}
          <div className="max-h-72 overflow-y-auto">
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                    !notification.read ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    {/* Icon */}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getPriorityColor(notification.priority)}`}>
                      <Icon 
                        name={getTypeIcon(notification.type)} 
                        size={16} 
                        className={getTypeColor(notification.type)} 
                      />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {notification.title}
                        </p>
                        {notification.retention && (
                          <div className="ml-2 px-2 py-1 bg-purple-100 text-purple-600 text-xs rounded-full">
                            Retention
                          </div>
                        )}
                      </div>
                      
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {notification.message}
                      </p>

                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center space-x-2 text-xs text-gray-500">
                          <span className={`px-2 py-1 rounded-full ${
                            notification.priority === 'high' ? 'bg-red-100 text-red-600' :
                            notification.priority === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                            'bg-blue-100 text-blue-600'
                          }`}>
                            {notification.priority}
                          </span>
                          <span>Tier {notification.tier}</span>
                          {notification.accuracy && (
                            <span>{notification.accuracy}% accurate</span>
                          )}
                        </div>

                        {notification.actionable && (
                          <button className="text-xs text-blue-600 hover:text-blue-700 font-medium">
                            {notification.action}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-gray-500">
                <Icon name="Bell" size={48} className="mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium mb-2">No new insights yet</p>
                <p className="text-sm">Keep using your dashboard to unlock AI-powered notifications!</p>
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-3 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">
                  Showing {notifications.length} insights
                </span>
                <button 
                  onClick={() => {
                    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
                    setUnreadCount(0);
                  }}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Mark all read
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default NotificationCenter;