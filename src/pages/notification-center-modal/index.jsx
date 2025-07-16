import React, { useState, useEffect } from 'react';
import { X, Bell, Package, Tag, AlertTriangle, CheckCircle, Trash2, Search } from 'lucide-react';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

const NotificationCenterModal = ({ isOpen, onClose, notifications: initialNotifications = [] }) => {
  const [notifications, setNotifications] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNotifications, setSelectedNotifications] = useState([]);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [sortBy, setSortBy] = useState('newest');

  // Sample notifications data
  const sampleNotifications = [
    {
      id: 1,
      type: 'order',
      title: 'Order Shipped',
      description: 'Your order #12345 has been shipped and is on its way',
      timestamp: new Date(Date.now() - 60000 * 30), // 30 minutes ago
      read: false,
      priority: 'medium',
      icon: 'Package',
      actionUrl: '/orders/12345'
    },
    {
      id: 2,
      type: 'promotion',
      title: 'Flash Sale Started',
      description: 'Up to 50% off on electronics - Limited time offer!',
      timestamp: new Date(Date.now() - 60000 * 60 * 2), // 2 hours ago
      read: false,
      priority: 'high',
      icon: 'Tag',
      actionUrl: '/promotions/flash-sale'
    },
    {
      id: 3,
      type: 'system',
      title: 'Account Security Alert',
      description: 'New device login detected from Chrome on Windows',
      timestamp: new Date(Date.now() - 60000 * 60 * 5), // 5 hours ago
      read: true,
      priority: 'high',
      icon: 'AlertTriangle',
      actionUrl: '/security'
    },
    {
      id: 4,
      type: 'order',
      title: 'Order Delivered',
      description: 'Your order #12340 has been successfully delivered',
      timestamp: new Date(Date.now() - 60000 * 60 * 24), // 1 day ago
      read: true,
      priority: 'low',
      icon: 'CheckCircle',
      actionUrl: '/orders/12340'
    },
    {
      id: 5,
      type: 'promotion',
      title: 'New Product Launch',
      description: 'Check out our latest smartphone collection',
      timestamp: new Date(Date.now() - 60000 * 60 * 48), // 2 days ago
      read: false,
      priority: 'medium',
      icon: 'Package',
      actionUrl: '/products/new'
    }
  ];

  useEffect(() => {
    if (initialNotifications.length > 0) {
      setNotifications(initialNotifications);
    } else {
      setNotifications(sampleNotifications);
    }
  }, [initialNotifications]);

  const tabs = [
    { id: 'all', label: 'All', count: notifications.length },
    { id: 'order', label: 'Orders', count: notifications.filter(n => n.type === 'order').length },
    { id: 'promotion', label: 'Promotions', count: notifications.filter(n => n.type === 'promotion').length },
    { id: 'system', label: 'System', count: notifications.filter(n => n.type === 'system').length }
  ];

  const filteredNotifications = notifications
    .filter(notification => {
      const matchesTab = activeTab === 'all' || notification.type === activeTab;
      const matchesSearch = notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           notification.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesTab && matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.timestamp) - new Date(a.timestamp);
      if (sortBy === 'oldest') return new Date(a.timestamp) - new Date(b.timestamp);
      if (sortBy === 'unread') return a.read - b.read;
      return 0;
    });

  const unreadCount = notifications.filter(n => !n.read).length;

  const formatTime = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const handleMarkAsRead = (id) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  const handleDelete = (id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const handleBulkDelete = () => {
    setNotifications(prev => 
      prev.filter(notification => !selectedNotifications.includes(notification.id))
    );
    setSelectedNotifications([]);
    setShowConfirmDialog(false);
  };

  const handleSelectNotification = (id) => {
    setSelectedNotifications(prev => 
      prev.includes(id) 
        ? prev.filter(nId => nId !== id)
        : [...prev, id]
    );
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-error';
      case 'medium': return 'text-warning';
      case 'low': return 'text-success';
      default: return 'text-text-secondary';
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'order': return 'Package';
      case 'promotion': return 'Tag';
      case 'system': return 'AlertTriangle';
      default: return 'Bell';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-modal bg-background/80 backdrop-blur-sm">
      <div className="fixed inset-0 flex items-start justify-center pt-4 md:pt-20">
        <div className="w-full max-w-2xl mx-4 bg-surface rounded-lg shadow-elevated max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div className="flex items-center space-x-3">
              <Icon name="Bell" size={20} className="text-primary" />
              <h2 className="text-lg font-semibold text-text-primary">Notifications</h2>
              {unreadCount > 0 && (
                <span className="bg-accent text-accent-foreground text-xs font-medium px-2 py-1 rounded-full">
                  {unreadCount}
                </span>
              )}
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X size={20} />
            </Button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-border overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'text-primary border-b-2 border-primary' :'text-text-secondary hover:text-text-primary'
                }`}
              >
                <span>{tab.label}</span>
                {tab.count > 0 && (
                  <span className="bg-muted text-muted-foreground text-xs font-medium px-2 py-1 rounded-full">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Controls */}
          <div className="p-4 border-b border-border space-y-3">
            <div className="flex items-center space-x-3">
              <div className="flex-1">
                <Input
                  type="search"
                  placeholder="Search notifications..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full"
                />
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 bg-input border border-border rounded-md text-sm"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="unread">Unread First</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {selectedNotifications.length > 0 && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setShowConfirmDialog(true)}
                  >
                    <Trash2 size={16} className="mr-2" />
                    Delete Selected ({selectedNotifications.length})
                  </Button>
                )}
              </div>
              <div className="flex items-center space-x-2">
                {unreadCount > 0 && (
                  <Button variant="outline" size="sm" onClick={handleMarkAllAsRead}>
                    Mark All Read
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto">
            {filteredNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Bell size={48} className="text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium text-text-primary mb-2">
                  {searchQuery ? 'No matching notifications' : 'No notifications'}
                </h3>
                <p className="text-text-secondary">
                  {searchQuery ? 'Try adjusting your search terms' : 'You\'re all caught up!'}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {filteredNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-muted/50 transition-colors ${
                      !notification.read ? 'bg-primary/5' : ''
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <input
                        type="checkbox"
                        checked={selectedNotifications.includes(notification.id)}
                        onChange={() => handleSelectNotification(notification.id)}
                        className="mt-1 w-4 h-4 rounded border-border"
                      />
                      
                      <div className={`p-2 rounded-lg ${
                        notification.type === 'order' ? 'bg-primary/10' :
                        notification.type === 'promotion'? 'bg-accent/10' : 'bg-secondary/10'
                      }`}>
                        <Icon
                          name={getNotificationIcon(notification.type)}
                          size={16}
                          className={
                            notification.type === 'order' ? 'text-primary' :
                            notification.type === 'promotion'? 'text-accent' : 'text-secondary'
                          }
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <h4 className="text-sm font-medium text-text-primary">
                                {notification.title}
                              </h4>
                              {!notification.read && (
                                <div className="w-2 h-2 bg-primary rounded-full" />
                              )}
                            </div>
                            <p className="text-sm text-text-secondary mb-2">
                              {notification.description}
                            </p>
                            <div className="flex items-center space-x-4 text-xs text-text-secondary">
                              <span>{formatTime(notification.timestamp)}</span>
                              <span className={`font-medium ${getPriorityColor(notification.priority)}`}>
                                {notification.priority.toUpperCase()}
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2 ml-4">
                            {!notification.read && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleMarkAsRead(notification.id)}
                              >
                                <CheckCircle size={16} />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(notification.id)}
                            >
                              <Trash2 size={16} />
                            </Button>
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
          <div className="p-4 border-t border-border">
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-secondary">
                {filteredNotifications.length} notifications
              </span>
              <Button variant="outline" size="sm">
                <Icon name="Settings" size={16} className="mr-2" />
                Preferences
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 z-modal bg-background/80 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-surface rounded-lg p-6 max-w-md mx-4 shadow-elevated">
            <h3 className="text-lg font-semibold text-text-primary mb-3">
              Delete Notifications
            </h3>
            <p className="text-text-secondary mb-6">
              Are you sure you want to delete {selectedNotifications.length} notification(s)? 
              This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleBulkDelete}>
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationCenterModal;