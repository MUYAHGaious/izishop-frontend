import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { useAuth } from './AuthContext';

const WebSocketContext = createContext();

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};

const WebSocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState(null);
  const [subscribers, setSubscribers] = useState(new Map());
  const { user, isAuthenticated } = useAuth();
  const reconnectTimeoutRef = useRef(null);
  const heartbeatIntervalRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;

  // WebSocket URL - replace with your actual WebSocket server URL
  const WS_URL = import.meta.env.VITE_WEBSOCKET_URL || 'ws://localhost:8000/ws';

  const connect = () => {
    if (!isAuthenticated() || socket?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      console.log('Connecting to WebSocket...');
      const token = localStorage.getItem('authToken');
      
      // Don't connect if no valid token
      if (!token || token === 'null' || token === 'undefined') {
        console.log('No valid auth token, skipping WebSocket connection');
        return;
      }
      
      const wsUrl = `${WS_URL}?token=${token}`;
      const newSocket = new WebSocket(wsUrl);

      newSocket.onopen = () => {
        console.log('WebSocket connected successfully');
        setIsConnected(true);
        setSocket(newSocket);
        reconnectAttemptsRef.current = 0;

        // Send user identification
        if (user) {
          newSocket.send(JSON.stringify({
            type: 'identify',
            userId: user.id,
            role: user.role
          }));
        }

        // Start heartbeat
        startHeartbeat(newSocket);
      };

      newSocket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('WebSocket message received:', data);
          
          setLastMessage(data);
          
          // Notify subscribers
          if (data.type && subscribers.has(data.type)) {
            const typeSubscribers = subscribers.get(data.type);
            typeSubscribers.forEach(callback => {
              try {
                callback(data);
              } catch (error) {
                console.error('Error in subscriber callback:', error);
              }
            });
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      newSocket.onclose = (event) => {
        console.log('WebSocket connection closed:', event.code, event.reason);
        setIsConnected(false);
        setSocket(null);
        stopHeartbeat();

        // Attempt to reconnect if not manually closed
        if (event.code !== 1000 && reconnectAttemptsRef.current < maxReconnectAttempts) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000);
          console.log(`Attempting to reconnect in ${delay}ms (attempt ${reconnectAttemptsRef.current + 1})`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttemptsRef.current++;
            connect();
          }, delay);
        }
      };

      newSocket.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
    }
  };

  const disconnect = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    stopHeartbeat();
    
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.close(1000, 'Manual disconnect');
    }
    
    setSocket(null);
    setIsConnected(false);
  };

  const startHeartbeat = (ws) => {
    heartbeatIntervalRef.current = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'ping' }));
      }
    }, 30000); // Send ping every 30 seconds
  };

  const stopHeartbeat = () => {
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }
  };

  const sendMessage = (message) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(message));
      return true;
    } else {
      console.warn('WebSocket not connected. Cannot send message:', message);
      return false;
    }
  };

  // Subscribe to specific message types
  const subscribe = (messageType, callback) => {
    if (!subscribers.has(messageType)) {
      subscribers.set(messageType, new Set());
    }
    subscribers.get(messageType).add(callback);

    // Return unsubscribe function
    return () => {
      const typeSubscribers = subscribers.get(messageType);
      if (typeSubscribers) {
        typeSubscribers.delete(callback);
        if (typeSubscribers.size === 0) {
          subscribers.delete(messageType);
        }
      }
    };
  };

  // Subscribe to dashboard updates
  const subscribeToDashboardUpdates = (callback) => {
    return subscribe('dashboard_update', callback);
  };

  // Subscribe to order updates
  const subscribeToOrderUpdates = (callback) => {
    return subscribe('order_update', callback);
  };

  // Subscribe to product updates
  const subscribeToProductUpdates = (callback) => {
    return subscribe('product_update', callback);
  };

  // Subscribe to notification updates
  const subscribeToNotifications = (callback) => {
    return subscribe('notification', callback);
  };

  // Request specific data updates
  const requestUpdate = (type, data = {}) => {
    return sendMessage({
      type: 'request_update',
      updateType: type,
      ...data
    });
  };

  // Connect when user is authenticated
  useEffect(() => {
    if (isAuthenticated() && user) {
      connect();
    } else {
      disconnect();
    }

    // Cleanup on unmount
    return () => {
      disconnect();
    };
  }, [isAuthenticated(), user?.id]);

  // Handle browser visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Page is hidden, reduce activity
        stopHeartbeat();
      } else {
        // Page is visible, resume activity
        if (socket && socket.readyState === WebSocket.OPEN) {
          startHeartbeat(socket);
        } else if (isAuthenticated()) {
          connect();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [socket, isAuthenticated]);

  const value = {
    socket,
    isConnected,
    lastMessage,
    connect,
    disconnect,
    sendMessage,
    subscribe,
    subscribeToDashboardUpdates,
    subscribeToOrderUpdates,
    subscribeToProductUpdates,
    subscribeToNotifications,
    requestUpdate
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};

export { WebSocketProvider };
export default WebSocketProvider;