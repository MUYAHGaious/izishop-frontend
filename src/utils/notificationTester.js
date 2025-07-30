// Notification Testing Utility
// Use this in the browser console to test real-time notifications

import notificationService from '../services/notificationService';

export const testNotifications = {
  // Test basic notification
  basic: () => {
    return notificationService.simulateNewNotification('test');
  },

  // Test order notification
  order: () => {
    return notificationService.simulateNewNotification('order');
  },

  // Test payment notification
  payment: () => {
    return notificationService.simulateNewNotification('payment');
  },

  // Test system notification
  system: () => {
    return notificationService.simulateNewNotification('system');
  },

  // Test multiple notifications
  multiple: (count = 3) => {
    const types = ['order', 'payment', 'system', 'test'];
    const results = [];
    
    for (let i = 0; i < count; i++) {
      setTimeout(() => {
        const type = types[Math.floor(Math.random() * types.length)];
        const result = notificationService.simulateNewNotification(type);
        results.push(result);
        console.log(`📧 Test notification ${i + 1}/${count} sent:`, result.title);
      }, i * 2000); // 2 second intervals
    }
    
    return results;
  },

  // Test notification at specific interval
  interval: (intervalSeconds = 10, maxCount = 5) => {
    let count = 0;
    const intervalId = setInterval(() => {
      if (count >= maxCount) {
        clearInterval(intervalId);
        console.log('✅ Interval testing completed');
        return;
      }
      
      count++;
      const result = testNotifications.basic();
      console.log(`📧 Interval test ${count}/${maxCount}:`, result.title);
    }, intervalSeconds * 1000);
    
    console.log(`🔄 Started interval testing: ${maxCount} notifications every ${intervalSeconds} seconds`);
    return intervalId;
  },

  // Force refresh notifications
  refresh: () => {
    console.log('🔄 Forcing notification refresh...');
    return notificationService.forceRefresh();
  },

  // Check current notification state
  status: () => {
    const state = notificationService.getState();
    console.log('📊 Current notification state:', {
      total: state.notifications.length,
      unread: state.unreadCount,
      isRunning: notificationService.isRunning,
      notifications: state.notifications.map(n => ({
        id: n.id,
        title: n.title,
        read: n.read || n.is_read,
        type: n.type
      }))
    });
    return state;
  },

  // Enable/disable real-time polling
  togglePolling: () => {
    if (notificationService.isRunning) {
      notificationService.stopNotifications();
      console.log('🛑 Notification polling stopped');
    } else {
      notificationService.startRealTimeNotifications();
      console.log('▶️ Notification polling started');
    }
    return notificationService.isRunning;
  }
};

// Make available globally for console testing
if (typeof window !== 'undefined') {
  window.testNotifications = testNotifications;
  console.log('🧪 Notification testing utilities loaded. Try: testNotifications.basic()');
}

export default testNotifications;