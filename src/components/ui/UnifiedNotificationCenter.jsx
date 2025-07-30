import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../AppIcon';
import { useNotifications } from '../../contexts/NotificationContext';
import NotificationDetailModal from './NotificationDetailModal';

const UnifiedNotificationCenter = ({ 
  variant = 'dropdown', // 'dropdown', 'page', 'mobile'
  maxHeight = 'max-h-96',
  showHeader = true,
  className = ''
}) => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all', 'unread', 'read'
  
  const {
    notifications,
    unreadCount,
    isLoading,
    error,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
    refresh,
    forceRefresh,
    triggerTestNotification,
    getFilteredNotifications,
    clearError
  } = useNotifications();

  // Auto-refresh notifications when dropdown is open
  useEffect(() => {
    if (isOpen) {
      // Refresh immediately when opened
      refresh();
      // Then refresh every 10 seconds while open
      const interval = setInterval(refresh, 10000);
      return () => clearInterval(interval);
    }
  }, [isOpen, refresh]);

  // Listen for keyboard shortcuts (optional)
  useEffect(() => {
    const handleKeyPress = (e) => {
      // Ctrl/Cmd + Shift + N to refresh notifications
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'N') {
        e.preventDefault();
        refresh();
        console.log('🔄 Manual notification refresh triggered');
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [refresh]);

  const handleNotificationClick = async (notification) => {
    if (!notification.read && !notification.is_read) {
      await markAsRead(notification.id);
    }
    
    if (variant === 'dropdown') {
      setSelectedNotification(notification);
    }
    
    // Handle action URLs
    if (notification.action_url) {
      if (notification.action_url.startsWith('/')) {
        navigate(notification.action_url);
        setIsOpen(false);
      } else {
        window.open(notification.action_url, '_blank');
      }
    }
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
    // Optionally close dropdown after marking all as read
    if (variant === 'dropdown') {
      setTimeout(() => setIsOpen(false), 1000);
    }
  };

  const handleClearAll = async () => {
    await clearAll();
    setIsOpen(false);
  };

  const filteredNotifications = getFilteredNotifications(filter);

  const getNotificationIcon = (notification) => {
    // Use custom icon if provided, otherwise use type-based icon
    if (notification.icon) {
      return notification.icon;
    }
    
    switch (notification.type) {
      case 'ORDER':
      case 'order':
        return 'Package';
      case 'PAYMENT':
      case 'payment':
        return 'CreditCard';
      case 'SYSTEM':
      case 'system':
        return 'Settings';
      case 'ACHIEVEMENT':
      case 'achievement':
      case 'milestone':
        return 'Trophy';
      case 'CUSTOMER':
      case 'customer':
        return 'Users';
      case 'ANALYTICS':
      case 'analytics':
      case 'forecast':
        return 'BarChart3';
      default:
        return 'Bell';
    }
  };

  const getNotificationColor = (notification) => {
    if (!notification.read && !notification.is_read) {
      return 'bg-blue-50 border-l-4 border-l-blue-500';
    }
    return 'hover:bg-gray-50';
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return 'text-red-600 bg-red-100';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100';
      case 'low':
        return 'text-blue-600 bg-blue-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  const renderNotificationItem = (notification) => (
    <div
      key={notification.id}
      onClick={() => handleNotificationClick(notification)}
      className={`p-4 border-b border-gray-100 cursor-pointer transition-colors ${getNotificationColor(notification)}`}
    >
      <div className="flex items-start space-x-3">
        {/* Icon */}
        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
          <Icon 
            name={getNotificationIcon(notification)} 
            size={18} 
            className="text-gray-600" 
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className="text-sm font-medium text-gray-900 truncate">
                {notification.title}
              </h4>
              <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                {notification.message}
              </p>
            </div>
            
            {/* Unread badge */}
            {!notification.read && !notification.is_read && (
              <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-2"></div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-500">
                {formatTimestamp(notification.created_at || notification.timestamp)}
              </span>
              
              {notification.priority && (
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(notification.priority)}`}>
                  {notification.priority}
                </span>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex items-center space-x-1">
              {notification.action_label && (
                <span className="text-xs text-blue-600 font-medium">
                  {notification.action_label}
                </span>
              )}
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteNotification(notification.id);
                }}
                className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                title="Delete notification"
              >
                <Icon name="X" size={12} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (variant === 'dropdown') {
    return (
      <div className={`relative ${className}`}>
        {/* Notification Bell */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors"
          disabled={isLoading}
        >
          <Icon name="Bell" size={20} />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-medium rounded-full flex items-center justify-center animate-pulse">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-3 h-3 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
            </div>
          )}
        </button>

        {/* Dropdown */}
        {isOpen && (
          <>
            <div className={`absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50 ${maxHeight} overflow-hidden`}>
              {/* Header */}
              {showHeader && (
                <div className="p-4 border-b border-gray-200 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Notifications
                    </h3>
                    <button
                      onClick={() => setIsOpen(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <Icon name="X" size={16} />
                    </button>
                  </div>
                  
                  {/* Filter tabs */}
                  <div className="flex items-center space-x-4 mt-2">
                    {['all', 'unread', 'read'].map((filterType) => (
                      <button
                        key={filterType}
                        onClick={() => setFilter(filterType)}
                        className={`text-sm font-medium capitalize transition-colors ${
                          filter === filterType 
                            ? 'text-blue-600 border-b-2 border-blue-600' 
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        {filterType}
                        {filterType === 'unread' && unreadCount > 0 && (
                          <span className="ml-1 text-xs bg-red-500 text-white rounded-full px-1.5 py-0.5">
                            {unreadCount}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Error message */}
              {error && (
                <div className="p-4 bg-red-50 border-b border-red-200">
                  <div className="flex items-start space-x-2">
                    <Icon name="AlertTriangle" size={16} className="text-red-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-red-800">{error}</p>
                      <button
                        onClick={clearError}
                        className="text-xs text-red-600 hover:text-red-700 mt-1"
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Notifications list */}
              <div className="overflow-y-auto" style={{ maxHeight: '400px' }}>
                {isLoading && notifications.length === 0 ? (
                  <div className="p-8 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading notifications...</p>
                  </div>
                ) : filteredNotifications.length > 0 ? (
                  filteredNotifications.map(renderNotificationItem)
                ) : (
                  <div className="p-8 text-center text-gray-500">
                    <Icon name="Bell" size={48} className="mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-medium mb-2">
                      {filter === 'unread' ? 'No unread notifications' : 
                       filter === 'read' ? 'No read notifications' : 'No notifications yet'}
                    </p>
                    <p className="text-sm">
                      {filter === 'all' ? "You'll see important updates here when they arrive." : 
                       `Switch to "${filter === 'unread' ? 'all' : 'unread'}" to see other notifications.`}
                    </p>
                  </div>
                )}
              </div>

              {/* Footer actions */}
              <div className="p-3 border-t border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    {filteredNotifications.length} notification{filteredNotifications.length !== 1 ? 's' : ''}
                  </span>
                  <div className="flex items-center space-x-2">
                    {/* Test notification button (for development) */}
                    {process.env.NODE_ENV === 'development' && (
                      <button
                        onClick={() => triggerTestNotification()}
                        className="text-xs text-purple-600 hover:text-purple-700 font-medium"
                        title="Add test notification"
                      >
                        Test
                      </button>
                    )}
                    
                    {/* Force refresh button */}
                    <button
                      onClick={() => forceRefresh()}
                      className="text-xs text-gray-600 hover:text-gray-700 font-medium"
                      title="Refresh notifications"
                    >
                      <Icon name="RefreshCw" size={12} />
                    </button>
                    
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllAsRead}
                        className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Mark all read
                      </button>
                    )}
                    <button
                      onClick={handleClearAll}
                      className="text-sm text-red-600 hover:text-red-700 font-medium"
                    >
                      Clear all
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Overlay */}
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setIsOpen(false)}
            />
          </>
        )}

        {/* Notification detail modal */}
        {selectedNotification && (
          <NotificationDetailModal
            notification={selectedNotification}
            isOpen={!!selectedNotification}
            onClose={() => setSelectedNotification(null)}
            onMarkAsRead={() => markAsRead(selectedNotification.id)}
            onDelete={() => {
              deleteNotification(selectedNotification.id);
              setSelectedNotification(null);
            }}
          />
        )}
      </div>
    );
  }

  // For page variant, return just the list
  return (
    <div className={className}>
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start space-x-2">
            <Icon name="AlertTriangle" size={16} className="text-red-600 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-red-800">{error}</p>
              <button
                onClick={clearError}
                className="text-xs text-red-600 hover:text-red-700 mt-1"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {isLoading && notifications.length === 0 ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading notifications...</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredNotifications.map(renderNotificationItem)}
        </div>
      )}
    </div>
  );
};

export default UnifiedNotificationCenter;