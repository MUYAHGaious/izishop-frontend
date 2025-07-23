import React, { useState, useEffect } from 'react';
import Icon from '../AppIcon';
import { useNotifications } from '../../contexts/NotificationContext';

const NotificationOverlay = ({ isOpen, onClose }) => {
  const [filter, setFilter] = useState('all');
  const {
    notifications,
    unreadCount,
    isLoading,
    error,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    getFilteredNotifications,
    clearError
  } = useNotifications();

  const filteredNotifications = getFilteredNotifications(filter);

  // Prevent body scrolling when overlay is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const formatTime = (timestamp) => {
    const now = new Date();
    const diff = now - new Date(timestamp);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    return `${days}d`;
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'order': return 'text-blue-500';
      case 'payment': return 'text-green-500';
      case 'delivery': return 'text-orange-500';
      case 'system': return 'text-gray-500';
      case 'promotion': return 'text-purple-500';
      default: return 'text-gray-500';
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await markAsRead(notificationId);
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    try {
      await deleteNotification(notificationId);
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[9999] flex justify-end">
      <div className="w-full max-w-sm h-full bg-white flex flex-col shadow-2xl transform transition-transform duration-300 ease-out">
        {/* Header */}
        <div className="px-4 py-6 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Notifications</h2>
              <p className="text-sm text-gray-500">{unreadCount} unread</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Icon name="X" size={24} className="text-gray-500" />
            </button>
          </div>

          {/* Filter Tabs */}
          <div className="flex space-x-1 bg-gray-50 rounded-xl p-1">
            {[
              { key: 'all', label: 'All' },
              { key: 'unread', label: 'Unread' },
              { key: 'order', label: 'Orders' },
              { key: 'system', label: 'System' }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`flex-1 px-3 py-3 text-sm font-medium rounded-lg transition-all ${
                  filter === tab.key
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                {tab.label}
                {tab.key === 'unread' && unreadCount > 0 && (
                  <span className="ml-2 bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full text-xs">
                    {unreadCount}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Mark All Read Button */}
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              disabled={isLoading}
              className="w-full mt-4 px-4 py-3 bg-blue-50 hover:bg-blue-100 text-blue-700 text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Loading...' : 'Mark all as read'}
            </button>
          )}

          {/* Error Display */}
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-lg">
              <div className="flex items-start space-x-3">
                <Icon name="AlertCircle" size={16} className="text-red-500 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-red-800">{error}</p>
                  <button
                    onClick={clearError}
                    className="text-xs text-red-600 hover:text-red-800 font-medium mt-1"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Notifications List */}
        <div 
          className="flex-1 overflow-y-auto" 
          style={{ 
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            WebkitScrollbar: { display: 'none' }
          }}
        >
          <style jsx>{`
            div::-webkit-scrollbar {
              display: none;
            }
          `}</style>
          
          {isLoading && filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 px-6">
              <div className="w-8 h-8 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
              <p className="text-sm text-gray-500">Loading notifications...</p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 px-6">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Icon name="Bell" size={24} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-700 mb-2">No notifications</h3>
              <p className="text-sm text-gray-500 text-center">You're all caught up!</p>
              {filter !== 'all' && (
                <button
                  onClick={() => setFilter('all')}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium mt-3"
                >
                  Show all notifications
                </button>
              )}
            </div>
          ) : (
            <div>
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`relative border-b border-gray-50 transition-colors ${
                    !notification.read ? 'bg-blue-50/30' : 'bg-white'
                  }`}
                >
                  {/* Unread indicator */}
                  {!notification.read && (
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-blue-500 rounded-full"></div>
                  )}
                  
                  <div className="flex items-start space-x-4 p-4 pl-8">
                    <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
                      !notification.read ? 'bg-blue-100' : 'bg-gray-100'
                    }`}>
                      <Icon 
                        name={notification.icon} 
                        size={20} 
                        className={getNotificationColor(notification.type)}
                      />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className={`text-sm font-medium mb-1 ${
                        !notification.read ? 'text-gray-900' : 'text-gray-700'
                      }`}>
                        {notification.title}
                      </h4>
                      <p className="text-sm text-gray-600 mb-2 leading-relaxed">
                        {notification.message}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          {formatTime(notification.timestamp)}
                        </span>
                        <div className="flex items-center space-x-2">
                          {!notification.read && (
                            <button
                              onClick={() => handleMarkAsRead(notification.id)}
                              className="p-2 hover:bg-blue-100 rounded-lg transition-colors"
                              disabled={isLoading}
                            >
                              <Icon name="Check" size={16} className="text-blue-600" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteNotification(notification.id)}
                            className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                            disabled={isLoading}
                          >
                            <Icon name="Trash2" size={16} className="text-red-600" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationOverlay;