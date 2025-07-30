import React, { useState, useEffect } from 'react';
import Icon from '../AppIcon';
import { useNotifications } from '../../contexts/NotificationContext';
import '../../styles/notification-overlay.css';

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
    const date = new Date(timestamp);
    const diffInMs = now - date;
    const minutes = Math.floor(diffInMs / 60000);
    const hours = Math.floor(diffInMs / 3600000);
    const days = Math.floor(diffInMs / 86400000);

    if (diffInMs < 60000) return 'Just now'; // Less than 1 minute
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days}d ago`;
    
    // For older notifications, show date
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
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
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-[9998]" onClick={onClose}></div>
      
      {/* Notification Dropdown */}
      <div className="absolute top-full right-0 mt-2 w-96 max-h-[600px] bg-white rounded-xl shadow-xl border border-gray-100 z-[9999] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-4 py-3 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
              <p className="text-xs text-gray-500">{unreadCount} unread</p>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Icon name="X" size={20} className="text-gray-500" />
            </button>
          </div>

          {/* Filter Tabs */}
          <div className="flex space-x-1 bg-gray-50 rounded-lg p-1">
            {[
              { key: 'all', label: 'All' },
              { key: 'unread', label: 'Unread' },
              { key: 'read', label: 'Read' }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`flex-1 px-2 py-1.5 text-xs font-medium rounded-md transition-all ${
                  filter === tab.key
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                {tab.label}
                {tab.key === 'unread' && unreadCount > 0 && (
                  <span className="ml-1 bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-full text-xs">
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
                  className={`relative border-b border-gray-50 transition-colors hover:bg-gray-50 ${
                    !notification.read ? 'bg-blue-50/30' : 'bg-white'
                  }`}
                >
                  {/* Unread indicator */}
                  {!notification.read && (
                    <div className="absolute left-3 top-4 w-2 h-2 bg-blue-500 rounded-full"></div>
                  )}
                  
                  <div className="flex items-start space-x-3 p-3 pl-6">
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      !notification.read ? 'bg-blue-100' : 'bg-gray-100'
                    }`}>
                      <Icon 
                        name={notification.icon || 'Bell'} 
                        size={16} 
                        className={getNotificationColor(notification.type)}
                      />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-1">
                        <h4 className={`text-sm font-medium truncate ${
                          !notification.read ? 'text-gray-900' : 'text-gray-700'
                        }`}>
                          {notification.title}
                        </h4>
                        <div className="flex items-center space-x-1 ml-2">
                          {!notification.read && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMarkAsRead(notification.id);
                              }}
                              className="p-1 hover:bg-blue-100 rounded transition-colors"
                              title="Mark as read"
                              disabled={isLoading}
                            >
                              <Icon name="Check" size={12} className="text-blue-600" />
                            </button>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteNotification(notification.id);
                            }}
                            className="p-1 hover:bg-red-100 rounded transition-colors"
                            title="Delete notification"
                            disabled={isLoading}
                          >
                            <Icon name="Trash2" size={12} className="text-red-600" />
                          </button>
                        </div>
                      </div>
                      
                      {/* Message - Truncated with expand option */}
                      <p className="text-xs text-gray-600 mb-2 overflow-hidden" style={{
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical'
                      }}>
                        {notification.message}
                      </p>
                      
                      {/* Footer with time and actions */}
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          {formatTime(notification.timestamp)}
                        </span>
                        
                        {/* Action button if available */}
                        {notification.actionUrl && notification.actionLabel && (
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(notification.actionUrl, '_blank');
                            }}
                            className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                          >
                            {notification.actionLabel}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default NotificationOverlay;