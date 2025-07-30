import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../AppIcon';
import NotificationOverlay from './NotificationOverlay';
import { useNotifications } from '../../contexts/NotificationContext';

const NotificationBell = ({ 
  variant = 'default', // 'default', 'header', 'dashboard', 'mobile'
  size = 20,
  className = '',
  showOverlay = false, // Default to false, navigate to page instead
  showBadge = true,
  badgePosition = 'top-right', // 'top-right', 'top-left', 'bottom-right', 'bottom-left'
  onClick = null // Custom click handler (overrides default behavior)
}) => {
  const navigate = useNavigate();
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const { unreadCount, isLoading } = useNotifications();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (showOverlay) {
      setIsNotificationOpen(true);
    } else {
      // Navigate to notifications page
      navigate('/notifications');
    }
  };

  const getBadgePosition = () => {
    switch (badgePosition) {
      case 'top-left':
        return '-top-1 -left-1';
      case 'bottom-right':
        return '-bottom-1 -right-1';
      case 'bottom-left':
        return '-bottom-1 -left-1';
      default: // top-right
        return '-top-1 -right-1';
    }
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'header':
        return 'p-2 text-text-secondary hover:text-text-primary transition-colors';
      case 'dashboard':
        return 'p-2 rounded-lg hover:bg-gray-100 transition-colors';
      case 'mobile':
        return 'p-3 rounded-md hover:bg-muted transition-colors';
      default:
        return 'p-2 hover:bg-gray-100 rounded-lg transition-colors';
    }
  };

  const getBadgeStyles = () => {
    const baseAnimation = 'animate-pulse';
    switch (variant) {
      case 'header':
        return `bg-red-500 text-white text-xs font-medium rounded-full w-5 h-5 flex items-center justify-center ${baseAnimation}`;
      case 'dashboard':
        return `bg-destructive text-destructive-foreground text-xs font-medium rounded-full w-5 h-5 flex items-center justify-center ${baseAnimation}`;
      case 'mobile':
        return `bg-red-500 text-white text-xs font-medium rounded-full px-2 py-1 ${baseAnimation}`;
      default:
        return `bg-red-500 text-white text-xs font-medium rounded-full w-5 h-5 flex items-center justify-center ${baseAnimation}`;
    }
  };

  return (
    <div className="relative">
      <button
        onClick={handleClick}
        className={`relative ${getVariantStyles()} ${className}`}
        disabled={isLoading}
        aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
      >
        <Icon name="Bell" size={size} />
        
        {showBadge && unreadCount > 0 && (
          <span className={`absolute ${getBadgePosition()} ${getBadgeStyles()}`}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
        
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
          </div>
        )}
      </button>

      {showOverlay && (
        <NotificationOverlay
          isOpen={isNotificationOpen}
          onClose={() => setIsNotificationOpen(false)}
        />
      )}
    </div>
  );
};

export default NotificationBell;