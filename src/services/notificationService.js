// AI Analytics Notification Service
// Handles intelligent notifications based on data maturity and ML insights

import api from './api';
import { SalesPredictor, CustomerAnalytics } from '../utils/mlAnalytics';

export class NotificationService {
  constructor() {
    this.notifications = [];
    this.userDataMaturity = null;
    this.lastAnalysis = null;
    this.subscribers = [];
    this.isRunning = false;
    this.intervalId = null;
    this.focusHandler = null;
    this.visibilityHandler = null;
    this.failedQueue = [];
    
    // Bind methods to preserve context
    this.fetchNotifications = this.fetchNotifications.bind(this);
    this.notifySubscribers = this.notifySubscribers.bind(this);
    this.startRealTimeNotifications = this.startRealTimeNotifications.bind(this);
    this.stopNotifications = this.stopNotifications.bind(this);
  }

  // Determine user's data maturity level
  calculateDataMaturity(salesData, customerData, daysActive) {
    const dataPoints = salesData.length;
    const customerCount = customerData?.customers?.length || 0;
    
    let maturityLevel = 'new';
    let accuracyScore = 0;
    
    if (daysActive >= 60 && dataPoints >= 30) {
      maturityLevel = 'advanced';
      accuracyScore = 90;
    } else if (daysActive >= 30 && dataPoints >= 14) {
      maturityLevel = 'mature';
      accuracyScore = 85;
    } else if (daysActive >= 14 && dataPoints >= 7) {
      maturityLevel = 'developing';
      accuracyScore = 80;
    } else if (daysActive >= 7 && dataPoints >= 3) {
      maturityLevel = 'emerging';
      accuracyScore = 70;
    } else if (daysActive >= 3 && dataPoints >= 1) {
      maturityLevel = 'early';
      accuracyScore = 60;
    }

    this.userDataMaturity = {
      level: maturityLevel,
      daysActive,
      dataPoints,
      customerCount,
      accuracyScore,
      canPredict: dataPoints >= 3,
      canDetectTrends: dataPoints >= 7,
      canDetectAnomalies: dataPoints >= 14,
      canSegmentCustomers: daysActive >= 30 && customerCount >= 10
    };

    return this.userDataMaturity;
  }

  // Generate notifications based on ML analysis and data maturity
  async generateSmartNotifications(salesData, customerData, analyticsData, daysActive) {
    const maturity = this.calculateDataMaturity(salesData, customerData, daysActive);
    const notifications = [];

    // Initialize ML models if we have enough data
    let mlInsights = null;
    if (salesData.length >= 3) {
      const salesPredictor = new SalesPredictor();
      salesPredictor.setSalesData(salesData);
      mlInsights = salesPredictor.generateInsights();
    }

    // TIER 1: Immediate Notifications (Real-time)
    notifications.push(...this.generateImmediateNotifications(analyticsData, maturity));

    // TIER 2: Daily Notifications
    if (maturity.level !== 'new') {
      notifications.push(...this.generateDailyNotifications(analyticsData, mlInsights, maturity));
    }

    // TIER 3: Weekly Notifications  
    if (maturity.canDetectTrends) {
      notifications.push(...this.generateWeeklyNotifications(mlInsights, maturity));
    }

    // TIER 4: Monthly Notifications
    if (maturity.canSegmentCustomers) {
      notifications.push(...this.generateMonthlyNotifications(customerData, maturity));
    }

    // TIER 5: Retention-Focused Notifications
    notifications.push(...this.generateRetentionNotifications(maturity, analyticsData));

    return this.prioritizeNotifications(notifications);
  }

  // TIER 1: Immediate Notifications (Real-time)
  generateImmediateNotifications(analyticsData, maturity) {
    const notifications = [];
    const now = new Date();

    // Revenue milestones
    const revenue = analyticsData.revenue?.current || 0;
    if (revenue >= 1000000 && revenue < 1100000) { // ~1M XAF
      notifications.push({
        id: `milestone_1m_${now.getTime()}`,
        type: 'milestone',
        priority: 'high',
        title: '🎉 Congratulations! You hit 1M XAF in revenue!',
        message: 'Amazing achievement! Your business is growing strong.',
        actionable: true,
        action: 'View detailed analytics',
        tier: 1,
        triggerTime: now,
        expiresAt: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) // 7 days
      });
    }

    // Sales spike detection (for users with some data)
    if (maturity.dataPoints >= 3) {
      const dailyAverage = revenue / maturity.dataPoints;
      const todayRevenue = analyticsData.todayStats?.today_sales || 0;
      
      if (todayRevenue > dailyAverage * 2) {
        notifications.push({
          id: `spike_${now.getTime()}`,
          type: 'anomaly',
          priority: 'high',
          title: '📈 Sales Spike Detected!',
          message: `Today's sales (${this.formatCurrency(todayRevenue)}) are ${Math.round((todayRevenue / dailyAverage) * 100)}% above average!`,
          actionable: true,
          action: 'Analyze what drove this spike',
          tier: 1,
          triggerTime: now
        });
      }
    }

    return notifications;
  }

  // TIER 2: Daily Notifications
  generateDailyNotifications(analyticsData, mlInsights, maturity) {
    const notifications = [];
    const now = new Date();

    // Daily performance summary
    const todayStats = analyticsData.todayStats;
    if (todayStats) {
      const salesChange = todayStats.sales_change || 0;

      let emoji = '📊';
      let tone = 'neutral';
      if (salesChange > 10) { emoji = '🚀'; tone = 'positive'; }
      else if (salesChange < -10) { emoji = '📉'; tone = 'concerning'; }

      notifications.push({
        id: `daily_summary_${now.getDate()}`,
        type: 'summary',
        priority: 'medium',
        title: `${emoji} Yesterday's Performance`,
        message: this.generateDailySummaryMessage(todayStats, tone),
        actionable: true,
        action: 'View full analytics',
        tier: 2,
        scheduledFor: 'daily_9am',
        accuracy: maturity.accuracyScore
      });
    }

    // Customer activity notifications
    const newCustomers = analyticsData.customers?.new || 0;
    if (newCustomers > 0) {
      notifications.push({
        id: `new_customers_${now.getDate()}`,
        type: 'customer',
        priority: 'medium',
        title: `👥 ${newCustomers} New Customer${newCustomers > 1 ? 's' : ''}!`,
        message: 'Great job attracting new customers! Focus on providing excellent service to turn them into loyal buyers.',
        actionable: true,
        action: 'View customer insights',
        tier: 2,
        scheduledFor: 'daily_9am'
      });
    }

    return notifications;
  }

  // TIER 3: Weekly Notifications
  generateWeeklyNotifications(mlInsights, maturity) {
    const notifications = [];

    if (!mlInsights) return notifications;

    // Sales forecast notification
    if (mlInsights.predictions && mlInsights.predictions.length > 0) {
      const avgPrediction = mlInsights.predictions.reduce((sum, p) => sum + p.predictedSales, 0) / mlInsights.predictions.length;
      const confidence = mlInsights.predictions.reduce((sum, p) => sum + p.confidence, 0) / mlInsights.predictions.length;

      notifications.push({
        id: `weekly_forecast_${this.getWeek()}`,
        type: 'forecast',
        priority: 'high',
        title: '🔮 Your 7-Day Sales Forecast',
        message: `AI predicts ${this.formatCurrency(avgPrediction * 7)} in sales this week (${Math.round(confidence)}% confidence)`,
        actionable: true,
        action: 'View detailed forecast',
        tier: 3,
        scheduledFor: 'weekly_monday_8am',
        accuracy: maturity.accuracyScore
      });
    }

    // Trend analysis notification
    if (mlInsights.trend) {
      const { direction, strength, trendStrength } = mlInsights.trend;
      let emoji = '📈';
      let message = '';

      if (direction === 'increasing' && strength === 'strong') {
        emoji = '🚀';
        message = `Strong upward trend detected! Sales growing at ${trendStrength}% rate. Consider increasing inventory.`;
      } else if (direction === 'decreasing' && strength === 'strong') {
        emoji = '⚠️';
        message = `Declining trend detected. Sales dropping ${Math.abs(trendStrength)}%. Time to review strategy.`;
      } else {
        emoji = '📊';
        message = `Sales trend is ${direction} with ${strength} strength. Monitor closely for changes.`;
      }

      notifications.push({
        id: `trend_analysis_${this.getWeek()}`,
        type: 'trend',
        priority: direction === 'decreasing' && strength === 'strong' ? 'high' : 'medium',
        title: `${emoji} Weekly Trend Analysis`,
        message,
        actionable: true,
        action: 'View trend details',
        tier: 3,
        scheduledFor: 'weekly_monday_8am'
      });
    }

    return notifications;
  }

  // TIER 4: Monthly Notifications
  generateMonthlyNotifications(customerData, maturity) {
    const notifications = [];

    if (!customerData.customers || customerData.customers.length < 10) {
      return notifications;
    }

    // Customer segmentation insights
    const customerAnalytics = new CustomerAnalytics();
    const segments = customerAnalytics.rfmAnalysis(customerData.customers);
    
    const segmentCounts = segments.reduce((acc, customer) => {
      acc[customer.segment] = (acc[customer.segment] || 0) + 1;
      return acc;
    }, {});

    const champions = segmentCounts['Champions'] || 0;
    const atRisk = segmentCounts['At Risk'] || 0;

    notifications.push({
      id: `monthly_segments_${new Date().getMonth()}`,
      type: 'segmentation',
      priority: 'high',
      title: '👑 Monthly Customer Insights',
      message: `You have ${champions} Champion customers and ${atRisk} at-risk customers. Focus on retention strategies.`,
      actionable: true,
      action: 'View customer segments',
      tier: 4,
      scheduledFor: 'monthly_1st_8am',
      accuracy: maturity.accuracyScore
    });

    return notifications;
  }

  // TIER 5: Retention-Focused Notifications
  generateRetentionNotifications(maturity, analyticsData) {
    const notifications = [];

    // Onboarding sequence for new users
    if (maturity.level === 'new') {
      notifications.push({
        id: 'welcome_onboarding',
        type: 'onboarding',
        priority: 'high',
        title: '🎯 Welcome to Smart Analytics!',
        message: 'Start adding products and making sales to unlock powerful AI insights about your business.',
        actionable: true,
        action: 'Add your first product',
        tier: 5,
        retention: true
      });
    }

    // Engagement notifications for developing users
    if (maturity.level === 'early' || maturity.level === 'emerging') {
      notifications.push({
        id: 'early_engagement',
        type: 'engagement',
        priority: 'medium',
        title: '📊 Your Analytics Are Getting Smarter!',
        message: `After ${maturity.daysActive} days, AI accuracy is now ${maturity.accuracyScore}%. Keep selling to unlock advanced predictions!`,
        actionable: true,
        action: 'View current insights',
        tier: 5,
        retention: true
      });
    }

    // Feature unlock notifications
    if (maturity.canDetectTrends && !this.hasSeenFeature('trends')) {
      notifications.push({
        id: 'feature_unlock_trends',
        type: 'feature_unlock',
        priority: 'high',
        title: '🔓 New Feature Unlocked: Trend Analysis!',
        message: 'You now have enough data for AI trend detection. See where your business is heading!',
        actionable: true,
        action: 'Explore trend analysis',
        tier: 5,
        retention: true
      });
    }

    return notifications;
  }

  // Prioritize notifications based on retention impact and urgency
  prioritizeNotifications(notifications) {
    return notifications.sort((a, b) => {
      // Retention-focused notifications get priority
      if (a.retention && !b.retention) return -1;
      if (!a.retention && b.retention) return 1;

      // Then by priority level
      const priorityOrder = { 'high': 3, 'medium': 2, 'low': 1 };
      const aPriority = priorityOrder[a.priority] || 0;
      const bPriority = priorityOrder[b.priority] || 0;
      
      if (aPriority !== bPriority) return bPriority - aPriority;

      // Then by tier (lower tier = more immediate)
      return a.tier - b.tier;
    });
  }

  // Helper methods
  formatCurrency(amount) {
    if (!amount) return 'XAF 0';
    
    if (amount >= 1000000) {
      return `XAF ${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `XAF ${(amount / 1000).toFixed(1)}K`;
    }
    return `XAF ${amount}`;
  }

  generateDailySummaryMessage(todayStats, tone) {
    const { today_sales, today_orders, sales_change } = todayStats;
    
    if (tone === 'positive') {
      return `Excellent day! ${this.formatCurrency(today_sales)} in sales (${sales_change > 0 ? '+' : ''}${sales_change.toFixed(1)}%) with ${today_orders} orders. Keep up the momentum!`;
    } else if (tone === 'concerning') {
      return `Sales were ${this.formatCurrency(today_sales)} yesterday (${sales_change.toFixed(1)}% change). Let's analyze what can be improved.`;
    } else {
      return `Yesterday: ${this.formatCurrency(today_sales)} in sales with ${today_orders} orders. Steady progress!`;
    }
  }

  hasSeenFeature(feature) {
    return localStorage.getItem(`feature_seen_${feature}`) === 'true';
  }

  markFeatureSeen(feature) {
    localStorage.setItem(`feature_seen_${feature}`, 'true');
  }

  getWeek() {
    const onejan = new Date(new Date().getFullYear(), 0, 1);
    const today = new Date();
    const dayOfYear = ((today - onejan + 86400000) / 86400000);
    return Math.ceil(dayOfYear / 7);
  }

  // Send notification to backend through main notification system
  async sendNotification(notification) {
    try {
      // Map AI notification to main notification format
      const mainNotification = {
        title: notification.title,
        message: notification.message,
        type: this.mapNotificationTypeToMain(notification.type),
        priority: notification.priority || 'medium',
        action_url: notification.action || null,
        action_label: notification.actionable ? notification.action : null,
        icon: this.getIconForNotificationType(notification.type),
      };

      // Send through main notification API using admin endpoint
      // First get current user ID
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user?.id) {
        throw new Error('User not found');
      }

      const notificationRequest = {
        user_id: user.id,
        ...mainNotification
      };

      try {
        await api.request('/notifications/create', {
          method: 'POST',
          body: JSON.stringify(notificationRequest)
        });
      } catch (apiError) {
        // If API endpoint doesn't exist, create notification locally for now
        console.warn('Notification API not available, storing locally:', apiError.message);
        this.addNotification({
          id: Date.now() + Math.random(),
          timestamp: new Date(),
          read: false,
          is_read: false,
          ...mainNotification
        });
      }
      
      return true;
    } catch (error) {
      console.error('Failed to send AI notification through main system:', error);
      return false;
    }
  }

  // Map AI notification types to main notification system types
  mapNotificationTypeToMain(aiType) {
    const typeMap = {
      'milestone': 'ACHIEVEMENT',
      'anomaly': 'SYSTEM',
      'summary': 'ORDER',
      'customer': 'ORDER',
      'forecast': 'SYSTEM',
      'trend': 'SYSTEM',
      'segmentation': 'SYSTEM',
      'onboarding': 'SYSTEM',
      'engagement': 'SYSTEM',
      'feature_unlock': 'SYSTEM'
    };
    return typeMap[aiType] || 'SYSTEM';
  }

  // Get icon for notification type
  getIconForNotificationType(type) {
    const iconMap = {
      'milestone': 'TrendingUp',
      'anomaly': 'AlertTriangle',
      'summary': 'BarChart',
      'customer': 'Users',
      'forecast': 'TrendingUp',
      'trend': 'BarChart',
      'segmentation': 'Users',
      'onboarding': 'Info',
      'engagement': 'Heart',
      'feature_unlock': 'Gift'
    };
    return iconMap[type] || 'Bell';
  }

  // Process all notifications
  async processNotifications(salesData, customerData, analyticsData, daysActive) {
    const notifications = await this.generateSmartNotifications(
      salesData, 
      customerData, 
      analyticsData, 
      daysActive
    );

    const results = [];
    for (const notification of notifications) {
      const sent = await this.sendNotification(notification);
      results.push({ notification, sent });
    }

    return results;
  }

  // Subscribe to notification updates
  subscribe(callback) {
    this.subscribers.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.subscribers.indexOf(callback);
      if (index > -1) {
        this.subscribers.splice(index, 1);
      }
    };
  }

  // Notify all subscribers
  notifySubscribers() {
    // Ensure notifications is always an array
    const notifications = Array.isArray(this.notifications) ? this.notifications : [];
    
    const data = {
      notifications: notifications,
      unreadCount: notifications.filter(n => !n.read && !n.is_read).length,
      count: notifications.length
    };
    
    this.subscribers.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error('Error in notification subscriber:', error);
      }
    });
  }

  // Start real-time notifications
  startRealTimeNotifications() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    
    // Poll for notifications more frequently - every 5 seconds for real-time feel
    this.intervalId = setInterval(async () => {
      try {
        await this.fetchNotifications();
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    }, 5000); // Reduced from 30 seconds to 5 seconds
    
    // Initial fetch
    this.fetchNotifications();
    
    // Also check for notifications when the window gains focus
    this.setupFocusListener();
    
    // Set up visibility change listener for when user switches tabs
    this.setupVisibilityListener();
  }

  // Setup focus listener to refresh notifications when window gains focus
  setupFocusListener() {
    this.focusHandler = () => {
      if (this.isRunning) {
        this.fetchNotifications();
      }
    };
    window.addEventListener('focus', this.focusHandler);
  }

  // Setup visibility change listener
  setupVisibilityListener() {
    this.visibilityHandler = () => {
      if (!document.hidden && this.isRunning) {
        // Page became visible, refresh notifications
        this.fetchNotifications();
      }
    };
    document.addEventListener('visibilitychange', this.visibilityHandler);
  }

  // Stop notifications
  stopNotifications() {
    this.isRunning = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    
    // Clean up event listeners
    if (this.focusHandler) {
      window.removeEventListener('focus', this.focusHandler);
      this.focusHandler = null;
    }
    
    if (this.visibilityHandler) {
      document.removeEventListener('visibilitychange', this.visibilityHandler);
      this.visibilityHandler = null;
    }
  }

  // Fetch notifications from API
  async fetchNotifications() {
    try {
      const response = await api.getNotifications();
      
      // Ensure response is always an array
      const newNotifications = Array.isArray(response) ? response : [];
      
      // Check if there are actually new notifications
      const previousCount = this.notifications.length;
      const previousUnreadIds = new Set(
        this.notifications
          .filter(n => !n.read && !n.is_read)
          .map(n => n.id)
      );
      
      // Update notifications
      this.notifications = newNotifications;
      
      // Check for new unread notifications
      const currentUnreadIds = new Set(
        newNotifications
          .filter(n => !n.read && !n.is_read)
          .map(n => n.id)
      );
      
      // Find truly new notifications (not previously seen as unread)
      const newUnreadNotifications = newNotifications.filter(n => 
        (!n.read && !n.is_read) && !previousUnreadIds.has(n.id)
      );
      
      // Show browser notifications for new unread notifications
      if (newUnreadNotifications.length > 0 && Notification.permission === 'granted') {
        newUnreadNotifications.forEach(notification => {
          new Notification(notification.title || 'New Notification', {
            body: notification.message || notification.content,
            icon: '/favicon.ico',
            badge: '/favicon.ico',
            tag: `notification_${notification.id}`, // Prevent duplicates
            silent: false,
            requireInteraction: notification.priority === 'high'
          });
        });
      }
      
      // Always notify subscribers to trigger UI updates
      this.notifySubscribers();
      
      // Log new notifications for debugging
      if (newUnreadNotifications.length > 0) {
        console.log(`📧 ${newUnreadNotifications.length} new notification(s) received:`, 
          newUnreadNotifications.map(n => n.title).join(', '));
      }
      
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      // Don't clear existing notifications on error - just log it
      // This prevents UI flickering when there are temporary network issues
      if (this.notifications.length === 0) {
        this.notifications = [];
      }
      this.notifySubscribers();
    }
  }

  // Mark notification as read
  async markAsRead(notificationId) {
    try {
      await api.markNotificationAsRead(notificationId);
      
      // Update local state
      const notification = this.notifications.find(n => n.id === notificationId);
      if (notification) {
        notification.read = true;
        this.notifySubscribers();
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      throw error;
    }
  }

  // Mark all notifications as read
  async markAllAsRead() {
    try {
      await api.markAllNotificationsAsRead();
      
      // Update local state
      this.notifications.forEach(n => n.read = true);
      this.notifySubscribers();
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
      throw error;
    }
  }

  // Delete notification
  async deleteNotification(notificationId) {
    try {
      await api.deleteNotification(notificationId);
      
      // Update local state
      this.notifications = this.notifications.filter(n => n.id !== notificationId);
      this.notifySubscribers();
    } catch (error) {
      console.error('Failed to delete notification:', error);
      throw error;
    }
  }

  // Clear all notifications
  async clearAll() {
    try {
      await api.clearAllNotifications();
      
      // Update local state
      this.notifications = [];
      this.notifySubscribers();
    } catch (error) {
      console.error('Failed to clear all notifications:', error);
      throw error;
    }
  }

  // Get filtered notifications
  getFilteredNotifications(filter = 'all') {
    switch (filter) {
      case 'unread':
        return this.notifications.filter(n => !n.read);
      case 'read':
        return this.notifications.filter(n => n.read);
      default:
        return this.notifications;
    }
  }

  // Request notification permission
  async requestNotificationPermission() {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return false;
    }
    
    if (Notification.permission === 'granted') {
      return true;
    }
    
    if (Notification.permission === 'denied') {
      return false;
    }
    
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  // Add notification
  addNotification(notification) {
    const newNotification = {
      id: Date.now() + Math.random(),
      timestamp: new Date(),
      created_at: new Date().toISOString(),
      read: false,
      is_read: false,
      ...notification
    };
    
    this.notifications.unshift(newNotification);
    this.notifySubscribers();
    
    // Show browser notification if permission granted
    if (Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: `notification_${newNotification.id}`,
        silent: false
      });
    }
    
    console.log('📧 New notification added:', notification.title);
  }

  // Force refresh notifications (manual trigger)
  async forceRefresh() {
    console.log('🔄 Forcing notification refresh...');
    await this.fetchNotifications();
  }

  // Simulate receiving a new notification (for testing)
  simulateNewNotification(type = 'test') {
    const testNotifications = {
      order: {
        title: '📦 New Order Received',
        message: 'You have received a new order #12345. Please review and process it.',
        type: 'ORDER',
        priority: 'high',
        icon: 'Package'
      },
      payment: {
        title: '💰 Payment Received',
        message: 'Payment of XAF 25,000 has been confirmed for order #12345',
        type: 'PAYMENT',
        priority: 'medium',
        icon: 'CreditCard'
      },
      system: {
        title: '🔔 System Notification',
        message: 'Your dashboard has been updated with new features!',
        type: 'SYSTEM',
        priority: 'low',
        icon: 'Bell'
      },
      test: {
        title: '🧪 Test Notification',
        message: 'This is a test notification to verify real-time updates work correctly.',
        type: 'SYSTEM',
        priority: 'medium',
        icon: 'TestTube'
      }
    };

    const notification = testNotifications[type] || testNotifications.test;
    this.addNotification(notification);
    return notification;
  }

  // Initialize service (for compatibility)
  async initialize(userId, authToken) {
    // Store user info if needed
    this.userId = userId;
    this.authToken = authToken;
    
    // Start fetching notifications
    await this.fetchNotifications();
  }

  // Get current state
  getState() {
    const notifications = Array.isArray(this.notifications) ? this.notifications : [];
    return {
      notifications: notifications,
      unreadCount: notifications.filter(n => !n.read && !n.is_read).length
    };
  }

  // Generate and send AI analytics notifications
  async generateAndSendAINotifications(analyticsData) {
    try {
      // Mock sales and customer data for now - in real app this would come from API
      const salesData = analyticsData?.salesHistory || [];
      const customerData = { customers: analyticsData?.customers || [] };
      const daysActive = analyticsData?.daysActive || 30;

      // Generate AI notifications
      const aiNotifications = await this.generateSmartNotifications(
        salesData,
        customerData,
        analyticsData,
        daysActive
      );

      // Send each notification through the main system
      const results = [];
      for (const notification of aiNotifications) {
        const sent = await this.sendNotification(notification);
        results.push({ notification, sent });
      }

      // Refresh notifications from the main system
      await this.fetchNotifications();

      return results;
    } catch (error) {
      console.error('Failed to generate and send AI notifications:', error);
      return [];
    }
  }
}

export default new NotificationService();