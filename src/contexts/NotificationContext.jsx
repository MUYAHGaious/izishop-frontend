import React, { createContext, useContext, useState, useEffect } from 'react';
import notificationService from '../services/notificationService';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    // Return safe defaults if context not available
    return {
      notifications: [],
      unreadCount: 0,
      isLoading: false,
      error: null,
      permissionGranted: false,
      addNotification: () => {},
      markAsRead: () => {},
      markAllAsRead: () => {},
      deleteNotification: () => {},
      clearAll: () => {},
      clearError: () => {},
      requestPermission: () => {},
      loadUserNotifications: () => {},
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
        console.error('Error checking auth state:', error);
        setUser(null);
        setIsAuthenticated(false);
      }
    };

    checkAuthState();
    // Listen for auth changes
    window.addEventListener('storage', checkAuthState);
    return () => window.removeEventListener('storage', checkAuthState);
  }, []);

  // Initialize notification service when user authenticates (disabled for now)
  useEffect(() => {
    // Temporarily disable notification initialization to prevent loops
    console.log('Notification initialization disabled');
  }, []);

  // Subscribe to notification service updates
  useEffect(() => {
    const unsubscribe = notificationService.subscribe(({ notifications, unreadCount }) => {
      setNotifications(notifications);
      setUnreadCount(unreadCount);
    });

    return unsubscribe;
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
  const triggerTestNotification = () => {
    const testNotifications = [
      {
        type: 'order',
        title: 'Test Order Notification',
        message: 'This is a test order notification to verify real-time updates',
        icon: 'Package'
      },
      {
        type: 'payment',
        title: 'Test Payment Notification', 
        message: 'Test payment confirmation notification',
        icon: 'CreditCard'
      },
      {
        type: 'system',
        title: 'Test System Notification',
        message: 'This is a test system notification',
        icon: 'Settings'
      }
    ];
    
    const randomNotification = testNotifications[Math.floor(Math.random() * testNotifications.length)];
    addNotification(randomNotification);
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

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationContext;