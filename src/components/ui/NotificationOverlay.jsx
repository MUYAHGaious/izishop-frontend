import React, { useState, useEffect } from 'react';
import Icon from '../AppIcon';
import Button from './Button';

const NotificationOverlay = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('all');

  // Mock notifications data
  useEffect(() => {
    const mockNotifications = [
      {
        id: 1,
        type: 'order',
        title: 'New Order Received',
        message: 'Order #ORD-2025-001 has been placed by Jean-Baptiste',
        timestamp: new Date(Date.now() - 300000), // 5 minutes ago
        read: false,
        icon: 'Package'
      },
      {
        id: 2,
        type: 'payment',
        title: 'Payment Confirmed',
        message: 'Payment of 45,000 XAF has been confirmed for Order #ORD-2025-002',
        timestamp: new Date(Date.now() - 900000), // 15 minutes ago
        read: false,
        icon: 'CreditCard'
      },
      {
        id: 3,
        type: 'delivery',
        title: 'Delivery Update',
        message: 'Your order is out for delivery and will arrive within 2 hours',
        timestamp: new Date(Date.now() - 1800000), // 30 minutes ago
        read: true,
        icon: 'Truck'
      },
      {
        id: 4,
        type: 'system',
        title: 'System Maintenance',
        message: 'Scheduled maintenance will occur tonight from 2:00 AM to 4:00 AM',
        timestamp: new Date(Date.now() - 3600000), // 1 hour ago
        read: true,
        icon: 'Settings'
      },
      {
        id: 5,
        type: 'promotion',
        title: 'New Promotion Available',
        message: 'Get 20% off on all electronics this weekend!',
        timestamp: new Date(Date.now() - 7200000), // 2 hours ago
        read: false,
        icon: 'Tag'
      }
    ];
    setNotifications(mockNotifications);
  }, []);

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !notification.read;
    return notification.type === filter;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  const deleteNotification = (id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const formatTime = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'order': return 'text-blue-600';
      case 'payment': return 'text-green-600';
      case 'delivery': return 'text-orange-600';
      case 'system': return 'text-gray-600';
      case 'promotion': return 'text-purple-600';
      default: return 'text-gray-600';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/20 z-[9998] flex justify-end">
      <div className="bg-white w-full max-w-md h-full shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <Icon name="X" size={20} className="text-gray-500" />
            </button>
          </div>

          {/* Filter Tabs */}
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
            {[
              { key: 'all', label: 'All' },
              { key: 'unread', label: `Unread (${unreadCount})` },
              { key: 'order', label: 'Orders' },
              { key: 'system', label: 'System' }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`flex-1 px-3 py-2 text-xs font-medium rounded-md transition-colors ${
                  filter === tab.key
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Actions */}
          {unreadCount > 0 && (
            <div className="mt-3">
              <Button
                variant="outline"
                size="sm"
                onClick={markAllAsRead}
                className="w-full"
              >
                Mark all as read
              </Button>
            </div>
          )}
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto">
          {filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
              <Icon name="Bell" size={48} className="mb-4 opacity-50" />
              <p className="text-sm">No notifications found</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-gray-50 transition-colors ${
                    !notification.read ? 'bg-blue-50/50' : ''
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      !notification.read ? 'bg-blue-100' : 'bg-gray-100'
                    }`}>
                      <Icon 
                        name={notification.icon} 
                        size={16} 
                        className={getNotificationColor(notification.type)}
                      />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className={`text-sm font-medium ${
                            !notification.read ? 'text-gray-900' : 'text-gray-700'
                          }`}>
                            {notification.title}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-500 mt-2">
                            {formatTime(notification.timestamp)}
                          </p>
                        </div>
                        
                        <div className="flex items-center space-x-1 ml-2">
                          {!notification.read && (
                            <button
                              onClick={() => markAsRead(notification.id)}
                              className="p-1 hover:bg-gray-200 rounded transition-colors"
                              title="Mark as read"
                            >
                              <Icon name="Check" size={14} className="text-gray-500" />
                            </button>
                          )}
                          <button
                            onClick={() => deleteNotification(notification.id)}
                            className="p-1 hover:bg-gray-200 rounded transition-colors"
                            title="Delete notification"
                          >
                            <Icon name="Trash2" size={14} className="text-gray-500" />
                          </button>
                        </div>
                      </div>
                      
                      {!notification.read && (
                        <div className="absolute left-2 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-blue-600 rounded-full"></div>
                      )}
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

