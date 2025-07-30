import React, { createContext, useContext, useState, useEffect } from 'react';
import notificationService from '../services/notificationService';

// Error boundary for notification context
class NotificationErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('NotificationContext Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // Return children with safe defaults
      console.warn('NotificationContext crashed, providing fallback');
      return this.props.children;
    }

    return this.props.children;
  }
}

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    // Return safe defaults if context not available
    console.warn('useNotifications called outside of NotificationProvider, returning defaults');
    return {
      notifications: [],
      unreadCount: 0,
      isLoading: false,
      error: null,
      permissionGranted: false,
      addNotification: () => Promise.resolve(),
      markAsRead: () => Promise.resolve(),
      markAllAsRead: () => Promise.resolve(),
      deleteNotification: () => Promise.resolve(),
      clearAll: () => Promise.resolve(),
      clearError: () => {},
      requestPermission: () => Promise.resolve(false),
      loadUserNotifications: () => Promise.resolve(),
      getFilteredNotifications: () => []
    };
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Mark component as mounted
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Get auth state from localStorage to avoid circular dependency
  useEffect(() => {
    const checkAuthState = () => {
      try {
        const token = localStorage.getItem('accessToken');
        const userData = localStorage.getItem('user');
        if (token && userData) {
          setUser(JSON.parse(userData));
          setIsAuthenticated(true);
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Error checking auth state in NotificationContext:', error);
        setUser(null);
        setIsAuthenticated(false);
        setError('Failed to check authentication state');
      }
    };

    // Delay initial check to prevent race conditions
    setTimeout(checkAuthState, 100);
    
    // Listen for auth changes
    window.addEventListener('storage', checkAuthState);
    return () => window.removeEventListener('storage', checkAuthState);
  }, []);

  // Initialize notification service when user authenticates
  useEffect(() => {
    if (isAuthenticated && user) {
      try {
        console.log('Initializing notifications for user:', user.email);
        // Start notification polling for authenticated users
        notificationService.startRealTimeNotifications();
      } catch (error) {
        console.error('Error initializing notification service:', error);
        setError('Failed to initialize notifications');
      }
    } else {
      console.log('User not authenticated, skipping notification initialization');
      try {
        notificationService.stopNotifications();
      } catch (error) {
        console.error('Error stopping notification service:', error);
      }
    }
  }, [isAuthenticated, user]);

  // Subscribe to notification service updates
  useEffect(() => {
    let unsubscribe;
    try {
      unsubscribe = notificationService.subscribe(({ notifications, unreadCount, count }) => {
        try {
          const newNotifications = notifications || [];
          const newUnreadCount = unreadCount || 0;
          
          // Update state
          setNotifications(newNotifications);
          setUnreadCount(newUnreadCount);
          
          // Log updates for debugging
          console.log(`🔔 Notification state updated: ${newNotifications.length} total, ${newUnreadCount} unread`);
          
        } catch (error) {
          console.error('Error updating notification state:', error);
          setError('Failed to update notifications');
        }
      });
    } catch (error) {
      console.error('Error subscribing to notification service:', error);
      setError('Failed to subscribe to notifications');
    }

    return () => {
      try {
        if (unsubscribe) unsubscribe();
      } catch (error) {
        console.error('Error unsubscribing from notification service:', error);
      }
    };
  }, []);

  const initializeNotifications = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Request browser notification permission
      const granted = await notificationService.requestNotificationPermission();
      setPermissionGranted(granted);
      
      // Initialize notification service with user credentials
      const authToken = localStorage.getItem('authToken');
      await notificationService.initialize(user.id, authToken);
      
      // Get initial state
      const { notifications: initialNotifications, unreadCount: initialUnreadCount } = notificationService.getState();
      setNotifications(initialNotifications);
      setUnreadCount(initialUnreadCount);
    } catch (error) {
      console.error('Failed to initialize notifications:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const cleanupNotifications = () => {
    notificationService.stopNotifications();
    setNotifications([]);
    setUnreadCount(0);
    setError(null);
  };

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    try {
      await notificationService.markAsRead(notificationId);
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      setError(error.message);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
      setError(error.message);
    }
  };

  // Delete notification
  const deleteNotification = async (notificationId) => {
    try {
      await notificationService.deleteNotification(notificationId);
    } catch (error) {
      console.error('Failed to delete notification:', error);
      setError(error.message);
    }
  };

  // Clear all notifications
  const clearAll = async () => {
    try {
      await notificationService.clearAll();
    } catch (error) {
      console.error('Failed to clear all notifications:', error);
      setError(error.message);
    }
  };

  // Get filtered notifications
  const getFilteredNotifications = (filter = 'all') => {
    return notificationService.getFilteredNotifications(filter);
  };

  // Refresh notifications
  const refresh = async () => {
    try {
      setIsLoading(true);
      await notificationService.fetchNotifications();
    } catch (error) {
      console.error('Failed to refresh notifications:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Add new notification (for testing or manual additions)
  const addNotification = (notification) => {
    notificationService.addNotification({
      id: Date.now() + Math.random(), // Generate unique ID
      timestamp: new Date(),
      read: false,
      ...notification
    });
  };

  // Trigger a test notification (for development/testing)
  const triggerTestNotification = (type = 'test') => {
    if (notificationService && typeof notificationService.simulateNewNotification === 'function') {
      return notificationService.simulateNewNotification(type);
    } else {
      // Fallback for direct context usage
      const testNotifications = [
        {
          type: 'ORDER',
          title: 'Test Order Notification',
          message: 'This is a test order notification to verify real-time updates',
          icon: 'Package',
          priority: 'high'
        },
        {
          type: 'PAYMENT',
          title: 'Test Payment Notification', 
          message: 'Test payment confirmation notification',
          icon: 'CreditCard',
          priority: 'medium'
        },
        {
          type: 'SYSTEM',
          title: 'Test System Notification',
          message: 'This is a test system notification',
          icon: 'Settings',
          priority: 'low'
        }
      ];
      
      const randomNotification = testNotifications[Math.floor(Math.random() * testNotifications.length)];
      addNotification(randomNotification);
      return randomNotification;
    }
  };

  // Force refresh notifications
  const forceRefresh = async () => {
    try {
      setIsLoading(true);
      if (notificationService && typeof notificationService.forceRefresh === 'function') {
        await notificationService.forceRefresh();
      } else {
        await notificationService.fetchNotifications();
      }
    } catch (error) {
      console.error('Failed to force refresh notifications:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Request permission for browser notifications
  const requestPermission = async () => {
    try {
      const granted = await notificationService.requestNotificationPermission();
      setPermissionGranted(granted);
      return granted;
    } catch (error) {
      console.error('Failed to request notification permission:', error);
      setError(error.message);
      return false;
    }
  };

  // Get notifications by type
  const getNotificationsByType = (type) => {
    return notifications.filter(notification => notification.type === type);
  };

  // Get recent notifications (last 24 hours)
  const getRecentNotifications = () => {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    return notifications.filter(notification => 
      new Date(notification.timestamp) > twentyFourHoursAgo
    );
  };

  // Get notification statistics
  const getStatistics = () => {
    const total = notifications.length;
    const unread = unreadCount;
    const read = total - unread;
    const byType = notifications.reduce((acc, notification) => {
      acc[notification.type] = (acc[notification.type] || 0) + 1;
      return acc;
    }, {});

    return {
      total,
      unread,
      read,
      byType,
      recentCount: getRecentNotifications().length
    };
  };

  // Clear error
  const clearError = () => {
    setError(null);
  };

  const value = {
    // State
    notifications,
    unreadCount,
    isLoading,
    error,
    permissionGranted,
    
    // Actions
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
    refresh,
    forceRefresh,
    addNotification,
    triggerTestNotification,
    requestPermission,
    clearError,
    
    // Utilities
    getFilteredNotifications,
    getNotificationsByType,
    getRecentNotifications,
    getStatistics,
    
    // Service reference (for advanced usage)
    notificationService
  };

  // Don't render until component is mounted
  if (!mounted) {
    return children;
  }

  return (
    <NotificationErrorBoundary>
      <NotificationContext.Provider value={value}>
        {children}
      </NotificationContext.Provider>
    </NotificationErrorBoundary>
  );
};

export default NotificationContext;