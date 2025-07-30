import React, { useEffect } from 'react';
import Icon from '../AppIcon';
import { useNotifications } from '../../contexts/NotificationContext';

const NotificationDetailModal = ({ notification, isOpen, onClose, onMarkAsRead, onDelete }) => {
  const { markAsRead, deleteNotification } = useNotifications();

  // Close modal on escape key
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Auto mark as read when opened
  useEffect(() => {
    if (isOpen && notification && !notification.read) {
      markAsRead(notification.id);
      if (onMarkAsRead) onMarkAsRead(notification.id);
    }
  }, [isOpen, notification, markAsRead, onMarkAsRead]);

  if (!isOpen || !notification) return null;

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMs = now - date;
    const diffInHours = diffInMs / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
    }
    
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      month: 'long', 
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
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

  const handleDelete = async () => {
    try {
      await deleteNotification(notification.id);
      if (onDelete) onDelete(notification.id);
      onClose();
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[9999] flex items-center justify-center p-4">
      {/* Modal Container */}
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden transform transition-all duration-300 ease-out">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getNotificationColor(notification.type, notification.priority)}`}>
              <Icon name={getNotificationIcon(notification.type)} size={24} />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 line-clamp-1">
                {notification.title}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {formatTime(notification.timestamp)}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Priority Indicator */}
            {notification.priority === 'high' && (
              <span className="bg-red-100 text-red-700 text-xs px-2 py-1 rounded-full font-medium">
                High Priority
              </span>
            )}
            
            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Close notification"
            >
              <Icon name="X" size={20} className="text-gray-500" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {/* Message */}
          <div className="prose prose-sm max-w-none">
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {notification.message}
            </p>
          </div>

          {/* Action URL */}
          {notification.actionUrl && notification.actionLabel && (
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-blue-900">Action Available</h4>
                  <p className="text-sm text-blue-700 mt-1">{notification.actionLabel}</p>
                </div>
                <button
                  onClick={() => {
                    window.open(notification.actionUrl, '_blank');
                    onClose();
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Open
                </button>
              </div>
            </div>
          )}

          {/* Metadata */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-900">Type:</span>
                <span className="ml-2 text-gray-600 capitalize">
                  {notification.type.replace('_', ' ')}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-900">Priority:</span>
                <span className={`ml-2 capitalize ${
                  notification.priority === 'high' 
                    ? 'text-red-600 font-medium' 
                    : notification.priority === 'medium'
                    ? 'text-yellow-600'
                    : 'text-gray-600'
                }`}>
                  {notification.priority}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-900">Status:</span>
                <span className={`ml-2 ${notification.read ? 'text-gray-600' : 'text-blue-600 font-medium'}`}>
                  {notification.read ? 'Read' : 'Unread'}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-900">ID:</span>
                <span className="ml-2 text-gray-600 font-mono text-xs">
                  {notification.id}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Close
            </button>
          </div>
          
          <div className="flex items-center space-x-3">
            {notification.actionUrl && notification.actionLabel && (
              <button
                onClick={() => {
                  window.open(notification.actionUrl, '_blank');
                  onClose();
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center space-x-2"
              >
                <Icon name="ExternalLink" size={16} />
                <span>{notification.actionLabel}</span>
              </button>
            )}
            
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center space-x-2"
            >
              <Icon name="Trash2" size={16} />
              <span>Delete</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationDetailModal;