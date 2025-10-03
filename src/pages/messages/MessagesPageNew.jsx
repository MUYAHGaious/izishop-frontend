import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  MessageCircle,
  Send,
  Search,
  ArrowLeft,
  Check,
  CheckCheck,
  User,
  Bot
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import MobileBottomTab from '../../components/ui/MobileBottomTab';
import api from '../../services/api';

/**
 * Clean Chat System Architecture
 *
 * PRINCIPLES:
 * 1. Single Source of Truth: Backend API is the source of truth
 * 2. No Multiple Storage: No sessionStorage caching, IndexedDB only for offline
 * 3. Deduplication: Always dedupe conversations by ID
 * 4. Batched State Updates: All related state changes happen together
 * 5. Clear Data Flow: Props down, events up
 */

// Utility: Parse UTC timestamps correctly
const parseUTC = (timestamp) => {
  if (!timestamp) return new Date();
  return new Date(timestamp.endsWith('Z') ? timestamp : timestamp + 'Z');
};

// Utility: Format time for display
const formatTime = (timestamp) => {
  return parseUTC(timestamp).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Utility: Deduplicate conversations by ID
const dedupeConversations = (conversations) => {
  const seen = new Set();
  return conversations.filter(conv => {
    if (seen.has(conv.id)) return false;
    seen.add(conv.id);
    return true;
  });
};

const MessagesPageNew = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Core State (Single Source of Truth)
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState('list'); // 'list' or 'chat'

  // Refs
  const wsRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Derived State
  const activeConversation = conversations.find(c => c.id === activeConversationId);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/authentication-login-register');
    }
  }, [isAuthenticated, navigate]);

  // Initialize: Load conversations and setup WebSocket
  useEffect(() => {
    if (!user) return;

    const init = async () => {
      setLoading(true);
      try {
        // Check for special navigation (Contact Seller, Contact Support)
        const createSellerChat = sessionStorage.getItem('createSellerChat');
        const productContext = sessionStorage.getItem('productContext');

        if (createSellerChat === 'true' && productContext) {
          await handleContactSeller(JSON.parse(productContext));
        } else {
          // Normal mode: Load all conversations
          await loadConversations();
        }

        // Setup WebSocket
        setupWebSocket();
      } catch (error) {
        console.error('Failed to initialize chat:', error);
      } finally {
        setLoading(false);
      }
    };

    init();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [user]);

  // Load all conversations from backend
  const loadConversations = async () => {
    try {
      const response = await api.getUserConversations();
      const convs = Array.isArray(response) ? response : [];
      setConversations(dedupeConversations(convs));
    } catch (error) {
      console.error('Failed to load conversations:', error);
      setConversations([]);
    }
  };

  // Handle Contact Seller flow
  const handleContactSeller = async (productContext) => {
    try {
      console.log('📞 Contact Seller:', productContext);

      // Clear sessionStorage flags
      sessionStorage.removeItem('createSellerChat');
      sessionStorage.removeItem('productContext');

      const { sellerId, sellerName, prefilledMessage } = productContext;

      // Create/update conversation via API
      const conversation = await api.createDirectConversation(sellerId, prefilledMessage);

      // Load all conversations (to get full list)
      await loadConversations();

      // Load messages for this conversation
      const msgs = await api.getChatMessages(conversation.id);

      // Open this conversation - BATCH ALL STATE UPDATES
      setActiveConversationId(conversation.id);
      setMessages(Array.isArray(msgs) ? msgs.reverse() : []);
      setCurrentView('chat');

      console.log('✅ Contact Seller complete');
    } catch (error) {
      console.error('Failed to handle Contact Seller:', error);
      // Fallback: Just load normal conversations
      await loadConversations();
    }
  };

  // Setup WebSocket for real-time updates
  const setupWebSocket = () => {
    if (!user) return;

    try {
      const wsUrl = `ws://localhost:8000/ws/chat/${user.id}`;
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => console.log('✅ WebSocket connected');

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        handleWebSocketMessage(data);
      };

      ws.onerror = (error) => console.error('❌ WebSocket error:', error);
      ws.onclose = () => console.log('🔌 WebSocket closed');

      wsRef.current = ws;
    } catch (error) {
      console.error('Failed to setup WebSocket:', error);
    }
  };

  // Handle WebSocket messages
  const handleWebSocketMessage = (data) => {
    console.log('📨 WebSocket message:', data);

    switch (data.type) {
      case 'new_message':
        handleNewMessage(data.message);
        break;
      case 'user_online':
        // Handle online status
        break;
      case 'user_offline':
        // Handle offline status
        break;
      default:
        console.log('Unknown WebSocket message type:', data.type);
    }
  };

  // Handle new incoming message
  const handleNewMessage = (message) => {
    // If message is for active conversation, add to messages
    if (message.conversation_id === activeConversationId) {
      setMessages(prev => [...prev, message]);
    }

    // Update conversation's last message
    setConversations(prev => {
      const convs = prev.map(conv => {
        if (conv.id === message.conversation_id) {
          return {
            ...conv,
            last_message: {
              content: message.content,
              created_at: message.created_at
            },
            last_message_at: message.created_at,
            unread_count: message.sender_id !== user.id ? (conv.unread_count || 0) + 1 : 0
          };
        }
        return conv;
      });

      // Sort by last_message_at
      return convs.sort((a, b) =>
        parseUTC(b.last_message_at) - parseUTC(a.last_message_at)
      );
    });
  };

  // Open a conversation
  const openConversation = async (conversationId) => {
    try {
      setActiveConversationId(conversationId);
      setCurrentView('chat');

      // Load messages
      const msgs = await api.getChatMessages(conversationId);
      setMessages(Array.isArray(msgs) ? msgs.reverse() : []);

      // Mark as read
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          type: 'mark_read',
          conversation_id: conversationId
        }));
      }

      // Update unread count in state
      setConversations(prev =>
        prev.map(conv =>
          conv.id === conversationId ? { ...conv, unread_count: 0 } : conv
        )
      );
    } catch (error) {
      console.error('Failed to open conversation:', error);
    }
  };

  // Send a message
  const sendMessage = async () => {
    if (!newMessage.trim() || !activeConversationId) return;

    const messageText = newMessage.trim();
    setNewMessage('');

    try {
      // Optimistically add message to UI
      const tempMessage = {
        id: `temp-${Date.now()}`,
        conversation_id: activeConversationId,
        sender_id: user.id,
        content: messageText,
        created_at: new Date().toISOString(),
        status: 'sending'
      };
      setMessages(prev => [...prev, tempMessage]);

      // Send to backend
      const sentMessage = await api.sendChatMessage(activeConversationId, {
        content: messageText,
        message_type: 'text'
      });

      // Replace temp message with real one
      setMessages(prev =>
        prev.map(msg => msg.id === tempMessage.id ? sentMessage : msg)
      );
    } catch (error) {
      console.error('Failed to send message:', error);
      // Remove failed message
      setMessages(prev => prev.filter(msg => !msg.id.startsWith('temp-')));
    }
  };

  // Go back to conversation list
  const goBack = () => {
    setCurrentView('list');
    setActiveConversationId(null);
    setMessages([]);
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Render loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <MessageCircle className="w-12 h-12 text-orange-500 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">Loading messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 py-4 pb-20">
        <div className="bg-white rounded-lg shadow-sm h-[calc(100vh-200px)]">

          {currentView === 'list' ? (
            /* Conversation List View */
            <div className="h-full flex flex-col">
              <div className="p-4 border-b">
                <h1 className="text-2xl font-bold text-gray-800">Messages</h1>
              </div>

              <div className="flex-1 overflow-y-auto">
                {conversations.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-500">
                    <MessageCircle className="w-16 h-16 mb-4" />
                    <p>No conversations yet</p>
                  </div>
                ) : (
                  conversations.map(conv => (
                    <div
                      key={conv.id}
                      onClick={() => openConversation(conv.id)}
                      className="p-4 border-b hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                          {conv.type === 'support' ? (
                            <Bot className="w-6 h-6 text-orange-600" />
                          ) : (
                            <User className="w-6 h-6 text-orange-600" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="font-semibold text-gray-800 truncate">
                              {conv.title || 'Conversation'}
                            </h3>
                            {conv.last_message_at && (
                              <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                                {formatTime(conv.last_message_at)}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center justify-between">
                            <p className="text-sm text-gray-600 truncate">
                              {conv.last_message?.content || 'No messages yet'}
                            </p>
                            {conv.unread_count > 0 && (
                              <span className="bg-orange-500 text-white text-xs rounded-full px-2 py-1 ml-2 flex-shrink-0">
                                {conv.unread_count}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : (
            /* Chat View */
            <div className="h-full flex flex-col">
              {/* Chat Header */}
              <div className="p-4 border-b flex items-center gap-3">
                <button onClick={goBack} className="p-2 hover:bg-gray-100 rounded-full">
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                  {activeConversation?.type === 'support' ? (
                    <Bot className="w-5 h-5 text-orange-600" />
                  ) : (
                    <User className="w-5 h-5 text-orange-600" />
                  )}
                </div>
                <div className="flex-1">
                  <h2 className="font-semibold text-gray-800">
                    {activeConversation?.title || 'Chat'}
                  </h2>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg, index) => {
                  const isOwn = msg.sender_id === user?.id;
                  const showAvatar = !isOwn;

                  return (
                    <div
                      key={msg.id || index}
                      className={`flex gap-2 ${isOwn ? 'justify-end' : 'justify-start'}`}
                    >
                      {showAvatar && (
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                          <User className="w-4 h-4 text-gray-600" />
                        </div>
                      )}
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          isOwn
                            ? 'bg-orange-500 text-white'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        <p className="text-sm break-words">{msg.content}</p>
                        <div className={`flex items-center gap-1 mt-1 ${isOwn ? 'justify-end' : ''}`}>
                          <span className={`text-xs ${isOwn ? 'text-orange-100' : 'text-gray-500'}`}>
                            {formatTime(msg.created_at)}
                          </span>
                          {isOwn && (
                            msg.status === 'read' ? (
                              <CheckCheck className="w-3 h-3 text-orange-100" />
                            ) : (
                              <Check className="w-3 h-3 text-orange-100" />
                            )
                          )}
                        </div>
                      </div>
                      {isOwn && <div className="w-8" />}
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-4 border-t">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!newMessage.trim()}
                    className="bg-orange-500 text-white p-3 rounded-full hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <MobileBottomTab />
    </div>
  );
};

export default MessagesPageNew;
