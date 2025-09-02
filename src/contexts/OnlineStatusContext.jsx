import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { useAuth } from './AuthContext';
import api from '../services/api';
import { showToast } from '../components/ui/Toast';

const OnlineStatusContext = createContext();

export const useOnlineStatus = () => {
  const context = useContext(OnlineStatusContext);
  if (!context) {
    throw new Error('useOnlineStatus must be used within an OnlineStatusProvider');
  }
  return context;
};

export const OnlineStatusProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [onlineUsers, setOnlineUsers] = useState(new Map());
  const [isConnected, setIsConnected] = useState(false);
  const [lastSeen, setLastSeen] = useState(new Map());
  
  const wsRef = useRef(null);
  const heartbeatIntervalRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  // WebSocket connection management
  const connectWebSocket = () => {
    try {
      // Skip WebSocket connection if user is not authenticated
      if (!isAuthenticated() || !user) {
        console.log('Skipping WebSocket connection - user not authenticated');
        return;
      }
      
      const wsUrl = `wss://izishop-backend.onrender.com/ws/online-status`;
      console.log('Attempting WebSocket connection to:', wsUrl);
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log('Online status WebSocket connected');
        setIsConnected(true);
        reconnectAttempts.current = 0;
        
        // Send authentication if user is logged in
        if (isAuthenticated() && user) {
          sendMessage({
            type: 'authenticate',
            user_id: user.id,
            user_type: user.user_type,
            access_token: api.getAccessToken()
          });
          
          // Start heartbeat for shop owners
          if (user.user_type === 'shop_owner') {
            startHeartbeat();
          }
        }
      };

      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          handleWebSocketMessage(data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      wsRef.current.onclose = () => {
        console.log('Online status WebSocket disconnected');
        setIsConnected(false);
        stopHeartbeat();
        
        // Attempt to reconnect
        if (reconnectAttempts.current < maxReconnectAttempts) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttempts.current++;
            connectWebSocket();
          }, delay);
        } else {
          showToast('Connection lost. Please refresh the page.', 'error');
        }
      };

      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
    }
  };

  // Handle incoming WebSocket messages
  const handleWebSocketMessage = (data) => {
    switch (data.type) {
      case 'user_online':
        setOnlineUsers(prev => new Map(prev.set(data.user_id, {
          user_id: data.user_id,
          user_type: data.user_type,
          shop_id: data.shop_id,
          timestamp: new Date(data.timestamp)
        })));
        break;

      case 'user_offline':
        setOnlineUsers(prev => {
          const newMap = new Map(prev);
          newMap.delete(data.user_id);
          return newMap;
        });
        setLastSeen(prev => new Map(prev.set(data.user_id, new Date(data.last_seen))));
        break;

      case 'bulk_status_update':
        const newOnlineUsers = new Map();
        const newLastSeen = new Map();
        
        data.online_users.forEach(user => {
          newOnlineUsers.set(user.user_id, {
            user_id: user.user_id,
            user_type: user.user_type,
            shop_id: user.shop_id,
            timestamp: new Date(user.timestamp)
          });
        });
        
        data.last_seen.forEach(entry => {
          newLastSeen.set(entry.user_id, new Date(entry.last_seen));
        });
        
        setOnlineUsers(newOnlineUsers);
        setLastSeen(newLastSeen);
        break;

      case 'authentication_success':
        console.log('Online status authentication successful');
        break;

      case 'authentication_failed':
        console.error('Online status authentication failed');
        break;

      case 'heartbeat_ack':
        // Heartbeat acknowledged
        break;

      default:
        console.log('Unknown message type:', data.type);
    }
  };

  // Send message through WebSocket
  const sendMessage = (message) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    }
  };

  // Start heartbeat for shop owners
  const startHeartbeat = () => {
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
    }

    heartbeatIntervalRef.current = setInterval(() => {
      if (isAuthenticated() && user?.user_type === 'shop_owner') {
        sendMessage({
          type: 'heartbeat',
          user_id: user.id,
          timestamp: new Date().toISOString()
        });
      }
    }, 60000); // Send heartbeat every 60 seconds
  };

  // Stop heartbeat
  const stopHeartbeat = () => {
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }
  };

  // Check if a user/shop is online
  const isUserOnline = (userId) => {
    return onlineUsers.has(userId);
  };

  const isShopOnline = (shopId) => {
    for (const [userId, userData] of onlineUsers) {
      if (userData.shop_id === shopId && userData.user_type === 'shop_owner') {
        return true;
      }
    }
    return false;
  };

  // Get last seen time for a user
  const getUserLastSeen = (userId) => {
    return lastSeen.get(userId);
  };

  // Format last seen time
  const formatLastSeen = (userId) => {
    const lastSeenTime = getUserLastSeen(userId);
    if (!lastSeenTime) return 'Never';

    const now = new Date();
    const diffMinutes = Math.floor((now - lastSeenTime) / (1000 * 60));
    
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
    
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    
    return lastSeenTime.toLocaleDateString();
  };

  // Get online status for a shop owner
  const getShopOnlineStatus = (shopId, shopOwnerId) => {
    const isOnline = isShopOnline(shopId) || isUserOnline(shopOwnerId);
    
    if (isOnline) {
      return {
        status: 'online',
        display: 'Online',
        color: 'text-green-600',
        indicator: 'bg-green-500'
      };
    }
    
    const lastSeenText = formatLastSeen(shopOwnerId);
    return {
      status: 'offline',
      display: lastSeenText === 'Never' ? 'Offline' : `Last seen ${lastSeenText}`,
      color: 'text-gray-500',
      indicator: 'bg-gray-400'
    };
  };

  // Initialize WebSocket connection
  useEffect(() => {
    connectWebSocket();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      stopHeartbeat();
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, []);

  // Handle authentication changes
  useEffect(() => {
    if (isAuthenticated() && user && isConnected) {
      sendMessage({
        type: 'authenticate',
        user_id: user.id,
        user_type: user.user_type,
        access_token: api.getAccessToken()
      });
      
      if (user.user_type === 'shop_owner') {
        startHeartbeat();
      }
    } else {
      stopHeartbeat();
    }
  }, [user, isAuthenticated, isConnected]);

  const value = {
    onlineUsers,
    lastSeen,
    isConnected,
    isUserOnline,
    isShopOnline,
    getUserLastSeen,
    formatLastSeen,
    getShopOnlineStatus,
    sendMessage
  };

  return (
    <OnlineStatusContext.Provider value={value}>
      {children}
    </OnlineStatusContext.Provider>
  );
};

export default OnlineStatusProvider;