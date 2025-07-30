import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../contexts/NotificationContext';
import Icon from '../../components/AppIcon';
import { useAuth } from '../../contexts/AuthContext';
import NotificationDetailModal from '../../components/ui/NotificationDetailModal';
import '../../styles/notifications-page.css';

const NotificationsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
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

  const [activeTab, setActiveTab] = useState('all');
  const [selectedNotifications, setSelectedNotifications] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'cards'
  const [selectedNotificationDetail, setSelectedNotificationDetail] = useState(null);

  const filteredNotifications = getFilteredNotifications(activeTab).filter(notification =>
    notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    notification.message.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectAll = () => {
    if (selectedNotifications.size === filteredNotifications.length) {
      setSelectedNotifications(new Set());
    } else {
      setSelectedNotifications(new Set(filteredNotifications.map(n => n.id)));
    }
  };

  const handleSelectNotification = (id) => {
    const newSelected = new Set(selectedNotifications);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedNotifications(newSelected);
  };

  const handleBulkAction = async (action) => {
    const selectedIds = Array.from(selectedNotifications);
    try {
      switch (action) {
        case 'markRead':
          await Promise.all(selectedIds.map(id => markAsRead(id)));
          break;
        case 'delete':
          await Promise.all(selectedIds.map(id => deleteNotification(id)));
          break;
      }
      setSelectedNotifications(new Set());
    } catch (error) {
      console.error(`Failed to ${action} notifications:`, error);
    }
  };

  const handleNotificationClick = (notification) => {
    setSelectedNotificationDetail(notification);
    // Auto mark as read when opened
    if (!notification.read) {
      markAsRead(notification.id);
    }
  };

  const formatTime = (timestamp) => {
    const now = new Date();
    const date = new Date(timestamp);
    const diffInDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) {
      return date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
    } else if (diffInDays === 1) {
      return 'Yesterday';
    } else if (diffInDays < 7) {
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'order': return 'Package';
      case 'payment': return 'CreditCard';
      case 'system': return 'Settings';
      case 'security': return 'Shield';
      case 'promotion': return 'Tag';
      case 'message': return 'MessageCircle';
      default: return 'Bell';
    }
  };

  const getNotificationColor = (type, priority = 'medium') => {
    const baseColors = {
      order: 'blue',
      payment: 'green',
      system: 'gray',
      security: 'red',
      promotion: 'purple',
      message: 'indigo',
      default: 'gray'
    };
    
    const color = baseColors[type] || baseColors.default;
    
    if (priority === 'high') {
      return `bg-${color}-100 text-${color}-700 border-${color}-200`;
    }
    return `bg-${color}-50 text-${color}-600`;
  };

  const tabs = [
    { key: 'all', label: 'All', count: notifications.length },
    { key: 'unread', label: 'Unread', count: unreadCount },
    { key: 'read', label: 'Read', count: notifications.length - unreadCount }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Icon name="ArrowLeft" size={20} />
            </button>
            <h1 className="text-lg font-semibold text-gray-900">Notifications</h1>
            {unreadCount > 0 && (
              <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Icon name="MoreVertical" size={20} />
          </button>
        </div>
        
        {/* Mobile Search */}
        <div className="px-4 pb-4">
          <div className="relative">
            <Icon name="Search" size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search notifications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto lg:flex lg:gap-6 lg:p-6">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block w-64 bg-white rounded-lg shadow-sm h-fit sticky top-6">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
              <button
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Icon name="X" size={20} />
              </button>
            </div>

            {/* Search */}
            <div className="relative mb-6">
              <Icon name="Search" size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search notifications..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Navigation Tabs */}
            <nav className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors ${
                    activeTab === tab.key
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span className="font-medium">{tab.label}</span>
                  {tab.count > 0 && (
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      activeTab === tab.key
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>

            {/* Quick Actions */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Quick Actions</h3>
              <div className="space-y-2">
                <button
                  onClick={markAllAsRead}
                  disabled={unreadCount === 0}
                  className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors disabled:text-gray-400 disabled:hover:bg-transparent"
                >
                  Mark all as read
                </button>
                <button
                  onClick={() => setViewMode(viewMode === 'list' ? 'cards' : 'list')}
                  className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  {viewMode === 'list' ? 'Card view' : 'List view'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 lg:bg-white lg:rounded-lg lg:shadow-sm">
          {/* Desktop Header */}
          <div className="hidden lg:block border-b border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  {tabs.find(tab => tab.key === activeTab)?.label} 
                  <span className="text-gray-500 ml-2">({filteredNotifications.length})</span>
                </h2>
                {selectedNotifications.size > 0 && (
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">
                      {selectedNotifications.size} selected
                    </span>
                    <button
                      onClick={() => handleBulkAction('markRead')}
                      className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors"
                    >
                      Mark read
                    </button>
                    <button
                      onClick={() => handleBulkAction('delete')}
                      className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded-full hover:bg-red-200 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
              
              <div className="flex items-center space-x-2">
                {filteredNotifications.length > 0 && (
                  <button
                    onClick={handleSelectAll}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    title={selectedNotifications.size === filteredNotifications.length ? 'Deselect all' : 'Select all'}
                  >
                    <Icon 
                      name={selectedNotifications.size === filteredNotifications.length ? 'CheckSquare' : 'Square'} 
                      size={18} 
                    />
                  </button>
                )}
                <button
                  onClick={() => setViewMode(viewMode === 'list' ? 'cards' : 'list')}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  title={`Switch to ${viewMode === 'list' ? 'card' : 'list'} view`}
                >
                  <Icon name={viewMode === 'list' ? 'Grid' : 'List'} size={18} />
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Tabs */}
          <div className="lg:hidden bg-white border-b border-gray-200 sticky top-16 z-10">
            <div className="flex overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex-shrink-0 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.key
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.label}
                  {tab.count > 0 && (
                    <span className="ml-2 bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Notifications List/Grid */}
          <div className="p-4 lg:p-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="w-8 h-8 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-500">Loading notifications...</p>
                </div>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icon name="Bell" size={24} className="text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchQuery ? 'No matching notifications' : 'No notifications'}
                </h3>
                <p className="text-gray-500">
                  {searchQuery 
                    ? 'Try adjusting your search terms' 
                    : activeTab === 'unread' 
                      ? "You're all caught up!" 
                      : 'New notifications will appear here'
                  }
                </p>
              </div>
            ) : (
              <div className={viewMode === 'cards' ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4' : 'space-y-1'}>
                {filteredNotifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    isSelected={selectedNotifications.has(notification.id)}
                    onSelect={() => handleSelectNotification(notification.id)}
                    onMarkAsRead={() => markAsRead(notification.id)}
                    onDelete={() => deleteNotification(notification.id)}
                    onNotificationClick={handleNotificationClick}
                    viewMode={viewMode}
                    formatTime={formatTime}
                    getNotificationIcon={getNotificationIcon}
                    getNotificationColor={getNotificationColor}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Actions Menu */}
      {showMobileMenu && (
        <div className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-50">
          <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-xl p-4">
            <div className="flex justify-center mb-4">
              <div className="w-8 h-1 bg-gray-300 rounded-full"></div>
            </div>
            <div className="space-y-3">
              <button
                onClick={() => {
                  markAllAsRead();
                  setShowMobileMenu(false);
                }}
                disabled={unreadCount === 0}
                className="w-full flex items-center space-x-3 p-3 text-left rounded-lg hover:bg-gray-50 transition-colors disabled:text-gray-400"
              >
                <Icon name="CheckCircle" size={20} />
                <span>Mark all as read</span>
              </button>
              <button
                onClick={() => {
                  setViewMode(viewMode === 'list' ? 'cards' : 'list');
                  setShowMobileMenu(false);
                }}
                className="w-full flex items-center space-x-3 p-3 text-left rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Icon name={viewMode === 'list' ? 'Grid' : 'List'} size={20} />
                <span>Switch to {viewMode === 'list' ? 'card' : 'list'} view</span>
              </button>
            </div>
            <button
              onClick={() => setShowMobileMenu(false)}
              className="w-full mt-4 p-3 text-center text-gray-500 border-t border-gray-200"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Notification Detail Modal */}
      <NotificationDetailModal
        notification={selectedNotificationDetail}
        isOpen={!!selectedNotificationDetail}
        onClose={() => setSelectedNotificationDetail(null)}
        onMarkAsRead={(id) => markAsRead(id)}
        onDelete={(id) => deleteNotification(id)}
      />
    </div>
  );
};

// Notification Item Component
const NotificationItem = ({ 
  notification, 
  isSelected, 
  onSelect, 
  onMarkAsRead, 
  onDelete, 
  onNotificationClick,
  viewMode,
  formatTime,
  getNotificationIcon,
  getNotificationColor
}) => {
  const [showActions, setShowActions] = useState(false);

  if (viewMode === 'cards') {
    return (
      <div 
        className={`relative bg-white border rounded-lg p-4 transition-all duration-200 hover:shadow-md cursor-pointer ${
          !notification.read ? 'border-blue-200 bg-blue-50/30' : 'border-gray-200'
        } ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
        onClick={() => onNotificationClick(notification)}
      >
        {/* Card Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSelect();
              }}
              className="flex-shrink-0"
            >
              <Icon 
                name={isSelected ? 'CheckSquare' : 'Square'} 
                size={18} 
                className={isSelected ? 'text-blue-600' : 'text-gray-400'} 
              />
            </button>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getNotificationColor(notification.type, notification.priority)}`}>
              <Icon name={getNotificationIcon(notification.type)} size={18} />
            </div>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowActions(!showActions);
            }}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <Icon name="MoreHorizontal" size={16} />
          </button>
        </div>

        {/* Card Content */}
        <div className="space-y-2">
          <h3 className={`font-medium text-sm leading-tight ${
            !notification.read ? 'text-gray-900' : 'text-gray-700'
          }`}>
            {notification.title}
          </h3>
          <p className="text-xs text-gray-600 line-clamp-2">
            {notification.message.length > 100 
              ? `${notification.message.substring(0, 100)}...` 
              : notification.message
            }
          </p>
          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-gray-500">{formatTime(notification.timestamp)}</span>
            <div className="flex items-center space-x-2">
              {notification.message.length > 100 && (
                <span className="text-xs text-blue-600 font-medium">Click to read more</span>
              )}
              {!notification.read && (
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              )}
            </div>
          </div>
        </div>

        {/* Actions Menu */}
        {showActions && (
          <div className="absolute top-12 right-4 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-10">
            {!notification.read && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onMarkAsRead();
                  setShowActions(false);
                }}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors"
              >
                Mark as read
              </button>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
                setShowActions(false);
              }}
              className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              Delete
            </button>
          </div>
        )}
      </div>
    );
  }

  // List View
  return (
    <div 
      className={`flex items-center space-x-4 p-4 hover:bg-gray-50 transition-colors border-b border-gray-100 cursor-pointer ${
        !notification.read ? 'bg-blue-50/30' : ''
      } ${isSelected ? 'bg-blue-100' : ''}`}
      onClick={() => onNotificationClick(notification)}
    >
      {/* Selection Checkbox */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onSelect();
        }}
        className="flex-shrink-0"
      >
        <Icon 
          name={isSelected ? 'CheckSquare' : 'Square'} 
          size={18} 
          className={isSelected ? 'text-blue-600' : 'text-gray-400'} 
        />
      </button>

      {/* Unread Indicator */}
      <div className="flex-shrink-0 w-2">
        {!notification.read && (
          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
        )}
      </div>

      {/* Icon */}
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${getNotificationColor(notification.type, notification.priority)}`}>
        <Icon name={getNotificationIcon(notification.type)} size={16} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className={`text-sm font-medium truncate ${
              !notification.read ? 'text-gray-900' : 'text-gray-700'
            }`}>
              {notification.title}
            </h3>
            <p className="text-sm text-gray-600 mt-1 line-clamp-1">
              {notification.message.length > 120 
                ? `${notification.message.substring(0, 120)}...` 
                : notification.message
              }
            </p>
            {notification.message.length > 120 && (
              <span className="text-xs text-blue-600 font-medium">Click to read more</span>
            )}
          </div>
          <div className="flex items-center space-x-2 ml-4">
            <span className="text-xs text-gray-500 whitespace-nowrap">
              {formatTime(notification.timestamp)}
            </span>
            <div className="flex items-center space-x-1">
              {!notification.read && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onMarkAsRead();
                  }}
                  className="p-1 hover:bg-blue-100 rounded transition-colors"
                  title="Mark as read"
                >
                  <Icon name="Check" size={14} className="text-blue-600" />
                </button>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                className="p-1 hover:bg-red-100 rounded transition-colors"
                title="Delete"
              >
                <Icon name="Trash2" size={14} className="text-red-600" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;