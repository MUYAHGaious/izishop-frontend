import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const NotificationCenter = () => {
  const [activeTab, setActiveTab] = useState('all');

  const notifications = [
    {
      id: 1,
      type: 'order',
      title: 'New Order Received',
      message: 'Marie Dubois placed an order for Samsung Galaxy A54',
      time: '5 minutes ago',
      isRead: false,
      priority: 'high',
      action: () => window.location.href = '/order-management'
    },
    {
      id: 2,
      type: 'review',
      title: 'New Product Review',
      message: 'Jean Baptiste left a 5-star review for Nike Air Max 270',
      time: '15 minutes ago',
      isRead: false,
      priority: 'medium',
      action: () => console.log('View review')
    },
    {
      id: 3,
      type: 'inventory',
      title: 'Low Stock Alert',
      message: 'MacBook Pro 13" is running low on stock (1 remaining)',
      time: '1 hour ago',
      isRead: true,
      priority: 'high',
      action: () => window.location.href = '/product-management'
    },
    {
      id: 4,
      type: 'message',
      title: 'Customer Inquiry',
      message: 'Fatima Hassan asked about product availability',
      time: '2 hours ago',
      isRead: false,
      priority: 'medium',
      action: () => console.log('Open customer messages')
    },
    {
      id: 5,
      type: 'payment',
      title: 'Payment Received',
      message: 'Payment of 285,000 XAF received for order ORD-2025-001',
      time: '3 hours ago',
      isRead: true,
      priority: 'low',
      action: () => console.log('View payment details')
    },
    {
      id: 6,
      type: 'system',
      title: 'Platform Update',
      message: 'New features available in your dashboard',
      time: '1 day ago',
      isRead: true,
      priority: 'low',
      action: () => console.log('View platform updates')
    }
  ];

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'order':
        return 'ShoppingCart';
      case 'review':
        return 'Star';
      case 'inventory':
        return 'Package';
      case 'message':
        return 'MessageCircle';
      case 'payment':
        return 'CreditCard';
      case 'system':
        return 'Bell';
      default:
        return 'Bell';
    }
  };

  const getNotificationColor = (type, priority) => {
    if (priority === 'high') return 'text-error';
    if (priority === 'medium') return 'text-warning';
    
    switch (type) {
      case 'order':
        return 'text-primary';
      case 'review':
        return 'text-success';
      case 'inventory':
        return 'text-warning';
      case 'message':
        return 'text-secondary';
      case 'payment':
        return 'text-success';
      default:
        return 'text-muted-foreground';
    }
  };

  const getFilteredNotifications = () => {
    switch (activeTab) {
      case 'unread':
        return notifications.filter(n => !n.isRead);
      case 'high':
        return notifications.filter(n => n.priority === 'high');
      default:
        return notifications;
    }
  };

  const handleMarkAsRead = (notificationId) => {
    console.log(`Mark notification ${notificationId} as read`);
  };

  const handleMarkAllAsRead = () => {
    console.log('Mark all notifications as read');
  };

  const filteredNotifications = getFilteredNotifications();
  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="bg-surface rounded-lg border border-border elevation-1">
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h3 className="text-lg font-semibold text-foreground">Notifications</h3>
            {unreadCount > 0 && (
              <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full font-medium">
                {unreadCount} unread
              </span>
            )}
          </div>
          
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllAsRead}
              className="text-xs"
            >
              Mark all read
            </Button>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center space-x-1 mt-4">
          <Button
            variant={activeTab === 'all' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('all')}
            className="text-xs"
          >
            All ({notifications.length})
          </Button>
          <Button
            variant={activeTab === 'unread' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('unread')}
            className="text-xs"
          >
            Unread ({unreadCount})
          </Button>
          <Button
            variant={activeTab === 'high' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('high')}
            className="text-xs"
          >
            Priority ({notifications.filter(n => n.priority === 'high').length})
          </Button>
        </div>
      </div>

      <div className="max-h-96 overflow-y-auto">
        {filteredNotifications.length === 0 ? (
          <div className="p-8 text-center">
            <Icon name="Bell" size={48} className="text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No notifications found</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 hover:bg-muted/30 transition-micro cursor-pointer ${
                  !notification.isRead ? 'bg-primary/5' : ''
                }`}
                onClick={notification.action}
              >
                <div className="flex items-start space-x-3">
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    !notification.isRead ? 'bg-primary/10' : 'bg-muted'
                  }`}>
                    <Icon 
                      name={getNotificationIcon(notification.type)} 
                      size={16} 
                      className={getNotificationColor(notification.type, notification.priority)}
                    />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0 pr-2">
                        <div className="flex items-center space-x-2">
                          <h4 className={`text-sm font-medium truncate ${
                            !notification.isRead ? 'text-foreground' : 'text-muted-foreground'
                          }`}>
                            {notification.title}
                          </h4>
                          {notification.priority === 'high' && (
                            <div className="w-2 h-2 bg-error rounded-full flex-shrink-0"></div>
                          )}
                          {!notification.isRead && (
                            <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0"></div>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1 break-words overflow-hidden" 
                           style={{
                             display: '-webkit-box',
                             WebkitLineClamp: 2,
                             WebkitBoxOrient: 'vertical',
                             wordBreak: 'break-word'
                           }}>
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {notification.time}
                        </p>
                      </div>
                      
                      {!notification.isRead && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMarkAsRead(notification.id);
                          }}
                          iconName="Check"
                          iconSize={14}
                          className="ml-2 flex-shrink-0"
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {filteredNotifications.length > 0 && (
        <div className="p-4 border-t border-border">
          <Button
            variant="outline"
            fullWidth
            onClick={() => console.log('View all notifications')}
            iconName="ExternalLink"
            iconPosition="right"
            iconSize={16}
          >
            View All Notifications
          </Button>
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;