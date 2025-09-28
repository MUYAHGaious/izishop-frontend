import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  MessageCircle,
  X,
  Send,
  Phone,
  Video,
  MoreVertical,
  Search,
  Paperclip,
  Smile,
  ArrowLeft,
  Check,
  CheckCheck,
  Clock,
  AlertCircle,
  User,
  Bot
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

const ProfessionalChatSystem = ({ isOpen, onClose, initialContext = null }) => {
  const { user, isAuthenticated } = useAuth();
  const [currentView, setCurrentView] = useState('conversations'); // 'conversations' | 'chat'
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const messagesEndRef = useRef(null);
  const wsRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Initialize WebSocket connection
  useEffect(() => {
    if (isOpen && isAuthenticated() && user) {
      initializeWebSocket();
      loadConversations();
    }

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [isOpen, user]);

  const initializeWebSocket = useCallback(() => {
    if (!user) return;

    try {
      const wsUrl = `ws://localhost:8000/api/chat/ws/${user.id}?token=${localStorage.getItem('token')}`;
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log('WebSocket connected');
      };

      wsRef.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        handleWebSocketMessage(data);
      };

      wsRef.current.onclose = () => {
        console.log('WebSocket disconnected');
        // Attempt to reconnect after 3 seconds
        setTimeout(() => {
          if (isOpen && isAuthenticated()) {
            initializeWebSocket();
          }
        }, 3000);
      };

      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
    } catch (error) {
      console.error('Failed to initialize WebSocket:', error);
    }
  }, [user, isOpen]);

  const handleWebSocketMessage = (data) => {
    switch (data.type) {
      case 'new_message':
        handleNewMessage(data.message);
        break;
      case 'typing_indicator':
        handleTypingIndicator(data);
        break;
      case 'user_online':
        setOnlineUsers(prev => new Set([...prev, data.user_id]));
        break;
      case 'user_offline':
        setOnlineUsers(prev => {
          const newSet = new Set(prev);
          newSet.delete(data.user_id);
          return newSet;
        });
        break;
      default:
        console.log('Unknown message type:', data.type);
    }
  };

  const handleNewMessage = (message) => {
    setMessages(prev => [...prev, message]);

    // Update conversation list
    setConversations(prev => prev.map(conv =>
      conv.id === message.conversation_id
        ? {
            ...conv,
            last_message: {
              content: message.content,
              sender_name: message.sender_name,
              created_at: message.created_at,
              is_bot_message: message.is_bot_message
            },
            last_message_at: message.created_at,
            unread_count: activeConversation?.id === message.conversation_id ? 0 : (conv.unread_count || 0) + 1
          }
        : conv
    ));
  };

  const handleTypingIndicator = (data) => {
    if (data.conversation_id === activeConversation?.id) {
      setIsTyping(data.is_typing);

      if (data.is_typing) {
        // Clear typing indicator after 3 seconds
        setTimeout(() => setIsTyping(false), 3000);
      }
    }
  };

  const loadConversations = async () => {
    try {
      setLoading(true);
      const response = await api.get('/chat/conversations');
      setConversations(response.data || []);
    } catch (error) {
      console.error('Failed to load conversations:', error);
      setError('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (conversationId) => {
    try {
      const response = await api.get(`/chat/conversations/${conversationId}/messages`);
      setMessages(response.data || []);

      // Mark messages as read
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          type: 'mark_read',
          conversation_id: conversationId
        }));
      }
    } catch (error) {
      console.error('Failed to load messages:', error);
      setError('Failed to load messages');
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !activeConversation) return;

    const messageContent = newMessage.trim();
    setNewMessage('');

    try {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          type: 'send_message',
          conversation_id: activeConversation.id,
          content: messageContent,
          message_type: 'text'
        }));
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      setError('Failed to send message');
    }
  };

  const handleTyping = () => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN && activeConversation) {
      wsRef.current.send(JSON.stringify({
        type: 'typing',
        conversation_id: activeConversation.id,
        is_typing: true
      }));

      // Clear previous timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Stop typing indicator after 1 second of no typing
      typingTimeoutRef.current = setTimeout(() => {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({
            type: 'typing',
            conversation_id: activeConversation.id,
            is_typing: false
          }));
        }
      }, 1000);
    }
  };

  const selectConversation = async (conversation) => {
    setActiveConversation(conversation);
    setCurrentView('chat');
    await loadMessages(conversation.id);

    // Update unread count
    setConversations(prev => prev.map(conv =>
      conv.id === conversation.id
        ? { ...conv, unread_count: 0 }
        : conv
    ));
  };

  const createNewConversation = async (type = 'customer_support', context = {}) => {
    try {
      const response = await api.post('/chat/conversations', {
        type,
        title: context.title,
        shop_id: context.shop_id,
        order_id: context.order_id,
        product_id: context.product_id,
        initial_message: context.initial_message || "Hello, I need assistance."
      });

      const newConversation = response.data;
      setConversations(prev => [newConversation, ...prev]);
      await selectConversation(newConversation);
    } catch (error) {
      console.error('Failed to create conversation:', error);
      setError('Failed to create conversation');
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Auto-scroll effect
  useEffect(() => {
    const timer = setTimeout(scrollToBottom, 100);
    return () => clearTimeout(timer);
  }, [messages]);

  if (!isOpen) return null;

  const filteredConversations = conversations.filter(conv =>
    conv.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.participants?.some(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-4xl h-[90vh] bg-white rounded-2xl shadow-2xl flex overflow-hidden">

        {/* Conversations List */}
        {currentView === 'conversations' && (
          <div className="w-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b bg-gray-50">
              <h2 className="text-xl font-semibold text-gray-900">Messages</h2>
              <button
                onClick={onClose}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Search */}
            <div className="p-4 border-b">
              <div className="relative">
                <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>
            </div>

            {/* Quick Actions */}
            <div className="p-4 border-b bg-gray-50">
              <div className="flex gap-2">
                <button
                  onClick={() => createNewConversation('customer_support')}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <MessageCircle size={16} />
                  New Support Chat
                </button>
              </div>
            </div>

            {/* Conversations */}
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-32 text-gray-500">
                  <MessageCircle size={32} className="mb-2" />
                  <p>No conversations yet</p>
                  <p className="text-sm">Start a new chat to get help</p>
                </div>
              ) : (
                filteredConversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    onClick={() => selectConversation(conversation)}
                    className="flex items-center p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-100 transition-colors"
                  >
                    <div className="relative flex-shrink-0 mr-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        {conversation.type === 'customer_support' ? (
                          <Bot size={20} className="text-blue-600" />
                        ) : (
                          <User size={20} className="text-blue-600" />
                        )}
                      </div>
                      {conversation.participants?.some(p => onlineUsers.has(p.id)) && (
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-medium text-gray-900 truncate">
                          {conversation.title}
                        </h4>
                        <span className="text-xs text-gray-500">
                          {new Date(conversation.last_message_at).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-600 truncate">
                          {conversation.last_message?.is_bot_message && (
                            <Bot size={14} className="inline mr-1 text-blue-500" />
                          )}
                          {conversation.last_message?.content || 'No messages yet'}
                        </p>
                        {conversation.unread_count > 0 && (
                          <span className="ml-2 px-2 py-1 bg-blue-600 text-white text-xs rounded-full min-w-[20px] text-center">
                            {conversation.unread_count}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Chat View */}
        {currentView === 'chat' && activeConversation && (
          <div className="w-full flex flex-col">
            {/* Chat Header */}
            <div className="flex items-center justify-between p-4 border-b bg-gray-50">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setCurrentView('conversations')}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  <ArrowLeft size={20} />
                </button>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    {activeConversation.type === 'customer_support' ? (
                      <Bot size={20} className="text-blue-600" />
                    ) : (
                      <User size={20} className="text-blue-600" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{activeConversation.title}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      Online
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-lg transition-colors">
                  <Phone size={18} />
                </button>
                <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-lg transition-colors">
                  <Video size={18} />
                </button>
                <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-lg transition-colors">
                  <MoreVertical size={18} />
                </button>
                <button
                  onClick={onClose}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <MessageBubble
                  key={message.id}
                  message={message}
                  isOwnMessage={message.sender_id === user?.id}
                />
              ))}

              {/* Typing Indicator */}
              {isTyping && (
                <div className="flex items-center gap-2 text-gray-500">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                    <Bot size={16} />
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 border-t bg-gray-50">
              <div className="flex items-center gap-2">
                <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-lg transition-colors">
                  <Paperclip size={18} />
                </button>
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => {
                      setNewMessage(e.target.value);
                      handleTyping();
                    }}
                    onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="Type a message..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>
                <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-lg transition-colors">
                  <Smile size={18} />
                </button>
                <button
                  onClick={sendMessage}
                  disabled={!newMessage.trim()}
                  className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Error Toast */}
      {error && (
        <div className="fixed bottom-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <AlertCircle size={16} />
          {error}
          <button onClick={() => setError(null)} className="ml-2 text-red-500 hover:text-red-700">
            <X size={14} />
          </button>
        </div>
      )}
    </div>
  );
};

// Message Bubble Component
const MessageBubble = ({ message, isOwnMessage }) => {
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'sent':
        return <Clock size={12} className="text-gray-400" />;
      case 'delivered':
        return <Check size={12} className="text-gray-500" />;
      case 'read':
        return <CheckCheck size={12} className="text-blue-500" />;
      default:
        return null;
    }
  };

  return (
    <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} gap-2`}>
      {!isOwnMessage && (
        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
          {message.is_bot_message ? (
            <Bot size={16} className="text-blue-600" />
          ) : (
            <User size={16} className="text-gray-600" />
          )}
        </div>
      )}

      <div className={`max-w-xs lg:max-w-md ${isOwnMessage ? 'order-1' : 'order-2'}`}>
        <div
          className={`px-4 py-2 rounded-2xl ${
            isOwnMessage
              ? 'bg-blue-600 text-white rounded-br-md'
              : message.is_bot_message
              ? 'bg-blue-50 text-blue-900 border border-blue-200 rounded-bl-md'
              : 'bg-gray-100 text-gray-900 rounded-bl-md'
          }`}
        >
          <p className="text-sm">{message.content}</p>
        </div>

        <div className={`flex items-center gap-1 mt-1 text-xs text-gray-500 ${
          isOwnMessage ? 'justify-end' : 'justify-start'
        }`}>
          <span>{formatTime(message.created_at)}</span>
          {isOwnMessage && getStatusIcon(message.status)}
        </div>
      </div>

      {isOwnMessage && (
        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
          <User size={16} className="text-blue-600" />
        </div>
      )}
    </div>
  );
};

export default ProfessionalChatSystem;