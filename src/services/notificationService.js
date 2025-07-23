// Real-time notification service using Firebase
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, where, onSnapshot, orderBy, limit } from 'firebase/firestore';
import api from './api';

// Firebase config - replace with your actual config
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "izishop-notifications.firebaseapp.com",
  projectId: "izishop-notifications",
  storageBucket: "izishop-notifications.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id"
};

class NotificationService {
  constructor() {
    this.listeners = new Set();
    this.notificationCount = 0;
    this.notifications = [];
    this.unsubscribeFirebase = null;
    this.fallbackInterval = null;
    
    // Initialize Firebase
    try {
      this.app = initializeApp(firebaseConfig);
      this.db = getFirestore(this.app);
      this.firebaseEnabled = true;
    } catch (error) {
      console.warn('Firebase initialization failed, using fallback:', error);
      this.firebaseEnabled = false;
    }
  }

  // Subscribe to notification updates
  subscribe(callback) {
    this.listeners.add(callback);
    
    // Immediately call with current state
    callback({
      count: this.notificationCount,
      notifications: this.notifications
    });
    
    return () => {
      this.listeners.delete(callback);
    };
  }

  // Notify all subscribers of updates
  notify() {
    const data = {
      count: this.notificationCount,
      notifications: this.notifications
    };
    
    this.listeners.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error('Notification listener error:', error);
      }
    });
  }

  // Start real-time notifications
  startRealTimeNotifications() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    if (!user.id) {
      console.warn('No user ID found, cannot start notifications');
      return;
    }

    if (this.firebaseEnabled) {
      this.startFirebaseListener(user);
    } else {
      this.startFallbackPolling(user);
    }
  }

  // Start Firebase real-time listener
  startFirebaseListener(user) {
    try {
      const notificationsRef = collection(this.db, 'notifications');
      
      // Query for user's notifications
      const q = query(
        notificationsRef,
        where('userId', '==', user.id),
        where('read', '==', false),
        orderBy('timestamp', 'desc'),
        limit(50)
      );

      // Listen for real-time updates
      this.unsubscribeFirebase = onSnapshot(q, (snapshot) => {
        const notifications = [];
        
        snapshot.forEach((doc) => {
          notifications.push({
            id: doc.id,
            ...doc.data()
          });
        });

        this.notifications = notifications;
        this.notificationCount = notifications.length;
        this.notify();
      });

      console.log('Firebase real-time notifications started');
    } catch (error) {
      console.error('Firebase listener failed, falling back to polling:', error);
      this.startFallbackPolling(user);
    }
  }

  // Fallback polling when Firebase is not available
  startFallbackPolling(user) {
    // Clear any existing interval
    if (this.fallbackInterval) {
      clearInterval(this.fallbackInterval);
    }

    // Initial fetch
    this.fetchNotificationsFromAPI(user);

    // Poll every 30 seconds
    this.fallbackInterval = setInterval(() => {
      this.fetchNotificationsFromAPI(user);
    }, 30000);

    console.log('Fallback polling notifications started');
  }

  // Fetch notifications from API (fallback or real implementation)
  async fetchNotificationsFromAPI(user) {
    try {
      let notifications = [];
      let unreadCount = 0;

      // Generate real notifications based on user role and data
      switch (user.role) {
        case 'ADMIN':
        case 'admin':
          const adminNotifications = await this.generateAdminNotifications();
          notifications = adminNotifications.notifications;
          unreadCount = adminNotifications.unread_count;
          break;
          
        case 'SHOP_OWNER':
        case 'shop_owner':
          const shopNotifications = await this.generateShopOwnerNotifications();
          notifications = shopNotifications.notifications;
          unreadCount = shopNotifications.unread_count;
          break;
          
        default:
          // Customer notifications
          notifications = [];
          unreadCount = 0;
          break;
      }

      this.notifications = notifications;
      this.notificationCount = unreadCount;
      this.notify();

    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      // Set to 0 on error
      this.notifications = [];
      this.notificationCount = 0;
      this.notify();
    }
  }

  // Generate admin notifications based on real data
  async generateAdminNotifications() {
    try {
      const notifications = [];
      let unreadCount = 0;

      // Try to get real dashboard data
      const dashboardData = await api.getDashboardOverview();
      const users = await api.getDashboardUsers();

      // New users in last 24 hours
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const newUsers = users.filter(user => 
        new Date(user.created_at) > yesterday
      );

      if (newUsers.length > 0) {
        notifications.push({
          id: `new-users-${Date.now()}`,
          type: 'user_registration',
          title: `${newUsers.length} new user${newUsers.length > 1 ? 's' : ''} registered`,
          message: `${newUsers.length} new user${newUsers.length > 1 ? 's' : ''} registered in the last 24 hours`,
          timestamp: new Date().toISOString(),
          read: false,
          priority: 'medium',
          userId: 'admin'
        });
        unreadCount++;
      }

      // System alerts based on metrics
      if (dashboardData.totalUsers > 1000) {
        notifications.push({
          id: `milestone-users-${Date.now()}`,
          type: 'milestone',
          title: 'User milestone reached!',
          message: `Platform now has ${dashboardData.totalUsers} registered users`,
          timestamp: new Date().toISOString(),
          read: false,
          priority: 'low',
          userId: 'admin'
        });
        unreadCount++;
      }

      return { notifications, unread_count: unreadCount };

    } catch (error) {
      console.error('Error generating admin notifications:', error);
      return { notifications: [], unread_count: 0 };
    }
  }

  // Generate shop owner notifications based on real data
  async generateShopOwnerNotifications() {
    try {
      const notifications = [];
      let unreadCount = 0;

      // Get real product data
      const products = await api.getMyProducts(0, 100, false);

      // Low stock alerts (5 or fewer items)
      const lowStockProducts = products.filter(product => 
        product.stock_quantity <= 5 && product.stock_quantity > 0
      );

      if (lowStockProducts.length > 0) {
        notifications.push({
          id: `low-stock-${Date.now()}`,
          type: 'inventory',
          title: `${lowStockProducts.length} product${lowStockProducts.length > 1 ? 's' : ''} low on stock`,
          message: `Products: ${lowStockProducts.map(p => p.name).slice(0, 3).join(', ')}${lowStockProducts.length > 3 ? '...' : ''}`,
          timestamp: new Date().toISOString(),
          read: false,
          priority: 'medium'
        });
        unreadCount++;
      }

      // Out of stock alerts
      const outOfStockProducts = products.filter(product => 
        product.stock_quantity === 0
      );

      if (outOfStockProducts.length > 0) {
        notifications.push({
          id: `out-of-stock-${Date.now()}`,
          type: 'inventory',
          title: `${outOfStockProducts.length} product${outOfStockProducts.length > 1 ? 's' : ''} out of stock`,
          message: `Products: ${outOfStockProducts.map(p => p.name).slice(0, 3).join(', ')}${outOfStockProducts.length > 3 ? '...' : ''}`,
          timestamp: new Date().toISOString(),
          read: false,
          priority: 'high'
        });
        unreadCount++;
      }

      // New products added recently (if any)
      const recentProducts = products.filter(product => {
        const createdDate = new Date(product.created_at);
        const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
        return createdDate > yesterday;
      });

      if (recentProducts.length > 0) {
        notifications.push({
          id: `new-products-${Date.now()}`,
          type: 'success',
          title: `${recentProducts.length} new product${recentProducts.length > 1 ? 's' : ''} added`,
          message: `Successfully added: ${recentProducts.map(p => p.name).slice(0, 2).join(', ')}`,
          timestamp: new Date().toISOString(),
          read: false,
          priority: 'low'
        });
        unreadCount++;
      }

      return { notifications, unread_count: unreadCount };

    } catch (error) {
      console.error('Error generating shop owner notifications:', error);
      return { notifications: [], unread_count: 0 };
    }
  }

  // Stop all notifications
  stopNotifications() {
    if (this.unsubscribeFirebase) {
      this.unsubscribeFirebase();
      this.unsubscribeFirebase = null;
    }

    if (this.fallbackInterval) {
      clearInterval(this.fallbackInterval);
      this.fallbackInterval = null;
    }
  }

  // Mark notification as read
  markAsRead(notificationId) {
    this.notifications = this.notifications.map(notification =>
      notification.id === notificationId
        ? { ...notification, read: true }
        : notification
    );
    
    this.notificationCount = this.notifications.filter(n => !n.read).length;
    this.notify();

    // TODO: Update Firebase/API when available
  }

  // Get current notification count
  getCount() {
    return this.notificationCount;
  }

  // Get all notifications
  getNotifications() {
    return this.notifications;
  }

  // Missing methods that NotificationContext expects
  async requestNotificationPermission() {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  }

  async initialize(userId, authToken) {
    // Start real-time notifications
    this.startRealTimeNotifications();
    return Promise.resolve();
  }

  getState() {
    return {
      notifications: this.notifications,
      unreadCount: this.notificationCount
    };
  }

  async markAllAsRead() {
    this.notifications = this.notifications.map(notification => ({
      ...notification,
      read: true
    }));
    this.notificationCount = 0;
    this.notify();
    return Promise.resolve();
  }

  getFilteredNotifications(filter = 'all') {
    switch (filter) {
      case 'unread':
        return this.notifications.filter(n => !n.read);
      case 'read':
        return this.notifications.filter(n => n.read);
      case 'all':
      default:
        return this.notifications;
    }
  }
}

export default new NotificationService();