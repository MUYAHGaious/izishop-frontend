import React from 'react';
import { useNotifications } from '../../contexts/NotificationContext';
import Button from './Button';
import Icon from '../AppIcon';

const NotificationDemo = ({ className = '' }) => {
  const { 
    unreadCount, 
    triggerTestNotification, 
    markAllAsRead, 
    getStatistics,
    isLoading,
    error
  } = useNotifications();

  const stats = getStatistics();

  if (process.env.NODE_ENV !== 'development') {
    return null; // Only show in development
  }

  return (
    <div className={`p-4 bg-yellow-50 border border-yellow-200 rounded-lg ${className}`}>
      <div className="flex items-center space-x-2 mb-3">
        <Icon name="Zap" size={16} className="text-yellow-600" />
        <h3 className="text-sm font-medium text-yellow-800">Notification Demo (Dev Only)</h3>
      </div>
      
      <div className="text-xs text-yellow-700 mb-3">
        <p><strong>Unread:</strong> {unreadCount} | <strong>Total:</strong> {stats.total}</p>
        <p><strong>Auto-simulation:</strong> New notifications every 30s</p>
        {error && <p className="text-red-600"><strong>Error:</strong> {error}</p>}
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={triggerTestNotification}
          disabled={isLoading}
          className="text-xs"
        >
          Add Test Notification
        </Button>
        
        {unreadCount > 0 && (
          <Button
            size="sm"
            variant="ghost"
            onClick={markAllAsRead}
            disabled={isLoading}
            className="text-xs text-yellow-700 hover:text-yellow-800"
          >
            Mark All Read
          </Button>
        )}
        
        <div className="text-xs text-yellow-600 flex items-center">
          {isLoading && (
            <>
              <div className="w-2 h-2 bg-yellow-600 rounded-full animate-pulse mr-1"></div>
              Loading...
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationDemo;