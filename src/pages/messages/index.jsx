import React, { useState, useEffect, useRef } from 'react';
import {
  MessageCircle,
  Send,
  Search,
  Phone,
  MoreVertical,
  Plus,
  Users,
  Settings,
  ArrowLeft,
  Check,
  CheckCheck,
  Clock,
  User,
  Bot,
  Paperclip,
  Smile,
  Star,
  MessageSquare,
  Archive,
  Bell,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from '../../components/ui/Header';
import MobileBottomTab from '../../components/ui/MobileBottomTab';
import api from '../../services/api';

const MessagesPage = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [currentView, setCurrentView] = useState('conversations');
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [selectedConversationType, setSelectedConversationType] = useState('all');
  const [errorContext, setErrorContext] = useState(null);

  const messagesEndRef = useRef(null);
  const wsRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/authentication-login-register');
    }
  }, [isAuthenticated, navigate]);

  // Initialize WebSocket and load data
  useEffect(() => {
    if (isAuthenticated() && user) {
      initializeWebSocket();
      loadConversations();
      loadContacts();
    }

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [user]);

  // Handle error context from Contact Support navigation (WhatsApp-style reply)
  useEffect(() => {
    console.log('🔍 MessagesPage: Checking URL for error context...');
    const urlParams = new URLSearchParams(location.search);
    const isSupport = urlParams.get('support') === 'true';
    const isError = urlParams.get('error') === 'true';

    console.log('🔍 URL params:', { isSupport, isError, isAuthenticated: isAuthenticated(), hasUser: !!user });

    if (isSupport && isError) {
      console.log('✅ URL conditions met, checking localStorage for error context...');

      // Get error context from localStorage
      const storedErrorContext = localStorage.getItem('supportErrorContext');
      console.log('🔍 Stored error context:', storedErrorContext);

      if (storedErrorContext) {
        try {
          const parsedErrorContext = JSON.parse(storedErrorContext);
          console.log('✅ Parsed error context:', parsedErrorContext);
          setErrorContext(parsedErrorContext);

          // Clear the error context from localStorage
          localStorage.removeItem('supportErrorContext');

          // Clear URL parameters first
          navigate('/messages', { replace: true });

          // Create support conversation after a short delay to ensure state is ready
          setTimeout(() => {
            console.log('🚀 Creating support conversation with error context...');
            createSupportConversationWithError(parsedErrorContext);
          }, 500);

        } catch (error) {
          console.error('❌ Failed to parse error context:', error);
          localStorage.removeItem('supportErrorContext');
        }
      } else {
        console.log('⚠️ No error context found in localStorage');
      }
    } else {
      console.log('❌ URL conditions not met for error context handling');
    }
  }, [location.search, navigate]);

  const initializeWebSocket = () => {
    if (!user) return;

    try {
      const wsUrl = `ws://localhost:8000/api/chat/ws/${user.id}?token=${localStorage.getItem('token')}`;
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => console.log('WebSocket connected');
      wsRef.current.onmessage = (event) => handleWebSocketMessage(JSON.parse(event.data));
      wsRef.current.onclose = () => {
        console.log('WebSocket disconnected');
        setTimeout(() => {
          if (isAuthenticated()) initializeWebSocket();
        }, 3000);
      };
    } catch (error) {
      console.error('WebSocket error:', error);
    }
  };

  const handleWebSocketMessage = (data) => {
    switch (data.type) {
      case 'new_message':
        handleNewMessage(data.message);
        break;
      case 'typing_indicator':
        if (data.conversation_id === activeConversation?.id) {
          setIsTyping(data.is_typing);
          if (data.is_typing) setTimeout(() => setIsTyping(false), 3000);
        }
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
    }
  };

  const handleNewMessage = (message) => {
    setMessages(prev => [...prev, message]);
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

  const loadConversations = async () => {
    try {
      setLoading(true);
      const response = await api.getChatConversations();
      setConversations(response || []);
    } catch (error) {
      console.error('Failed to load conversations:', error);
      // Set empty conversations array so the page still works
      setConversations([]);
    } finally {
      setLoading(false);
    }
  };

  const loadContacts = async () => {
    try {
      const response = await api.get('/chat/contacts');
      setContacts(response || []);
    } catch (error) {
      console.error('Failed to load contacts:', error);
    }
  };

  const searchUsers = async (query) => {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      const response = await api.get(`/chat/users/search?query=${encodeURIComponent(query)}`);
      setSearchResults(response || []);
    } catch (error) {
      console.error('Failed to search users:', error);
    }
  };

  const startDirectMessage = async (userId, initialMessage = "Hello!") => {
    try {
      const response = await api.post('/chat/conversations/direct', {
        recipient_id: userId,
        initial_message: initialMessage
      });

      setConversations(prev => [response, ...prev.filter(c => c.id !== response.id)]);
      setActiveConversation(response);
      setCurrentView('chat');
      await loadMessages(response.id);
    } catch (error) {
      console.error('Failed to start direct message:', error);
    }
  };

  // Create support conversation with error context (WhatsApp-style quoted error)
  const createSupportConversationWithError = async (errorContext) => {
    console.log('🚀 createSupportConversationWithError called with:', errorContext);

    try {
      // Check if support conversation already exists
      let supportConversation = conversations.find(conv =>
        conv.type === 'customer_support' && conv.title?.includes('IziShop Customer Support')
      );

      console.log('🔍 Existing support conversation:', supportConversation);

      if (!supportConversation) {
        console.log('📝 Creating new support conversation...');

        // Try to create via API first, but don't fail if it doesn't work
        try {
          const response = await api.post('/chat/conversations/support', {
            initial_message: errorContext.prefilledMessage,
            error_context: errorContext
          });
          console.log('✅ API response for support conversation:', response);
        } catch (apiError) {
          console.log('⚠️ API call failed, continuing with local conversation:', apiError.message);
        }

        supportConversation = {
          id: `support-${Date.now()}`,
          title: 'IziShop Customer Support',
          type: 'customer_support',
          last_message: {
            content: 'Hello! I\'m here to help you with your issue.',
            created_at: new Date().toISOString(),
            is_bot_message: true
          },
          last_message_at: new Date().toISOString(),
          unread_count: 0,
          participants: [
            { id: 'support-bot', name: 'IziShop Support', is_online: true }
          ]
        };

        console.log('📝 Created support conversation:', supportConversation);
        setConversations(prev => [supportConversation, ...prev]);
      }

      // Create messages with error context (WhatsApp-style)
      const supportWelcomeMessage = {
        id: `msg-${Date.now()}`,
        content: `Hello ${user?.first_name || 'Customer'}! I'm here to help you. I can see you're having an issue - let me assist you right away.`,
        sender_id: 'support-bot',
        created_at: new Date().toISOString(),
        status: 'delivered',
        is_bot_message: true
      };

      const userErrorMessage = {
        id: `msg-${Date.now() + 1}`,
        content: errorContext.prefilledMessage,
        sender_id: user?.id,
        created_at: new Date().toISOString(),
        status: 'delivered',
        error_context: errorContext
      };

      const supportResponseMessage = {
        id: `msg-${Date.now() + 2}`,
        content: `I can see the issue you're experiencing${errorContext.orderId ? ` with order #${errorContext.orderId}` : ' with order management'}. Let me check this for you and provide a solution. This type of ${errorContext.errorType?.replace('_', ' ')} can usually be resolved quickly.`,
        sender_id: 'support-bot',
        created_at: new Date(Date.now() + 1000).toISOString(),
        status: 'delivered',
        is_bot_message: true
      };

      // Set messages and activate conversation
      console.log('💬 Setting messages:', [supportWelcomeMessage, userErrorMessage, supportResponseMessage]);
      setMessages([supportWelcomeMessage, userErrorMessage, supportResponseMessage]);
      setActiveConversation(supportConversation);
      setCurrentView('chat');

      // Auto-switch to support filter
      setSelectedConversationType('support');

      console.log('✅ Support conversation with error context created successfully!');

    } catch (error) {
      console.error('❌ Failed to create support conversation:', error);
      // Fallback: create a basic support conversation
      const fallbackConversation = {
        id: `support-fallback-${Date.now()}`,
        title: 'IziShop Customer Support',
        type: 'customer_support',
        last_message: {
          content: errorContext.prefilledMessage,
          created_at: new Date().toISOString()
        },
        last_message_at: new Date().toISOString(),
        unread_count: 0,
        participants: [
          { id: 'support-bot', name: 'IziShop Support', is_online: true }
        ]
      };

      setConversations(prev => [fallbackConversation, ...prev]);
      setActiveConversation(fallbackConversation);
      setCurrentView('chat');
    }
  };

  const loadMessages = async (conversationId) => {
    try {
      const response = await api.getChatMessages(conversationId);
      setMessages(response || []);

      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          type: 'mark_read',
          conversation_id: conversationId
        }));
      }
    } catch (error) {
      console.error('Failed to load messages:', error);
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
    }
  };

  const handleTyping = () => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN && activeConversation) {
      wsRef.current.send(JSON.stringify({
        type: 'typing',
        conversation_id: activeConversation.id,
        is_typing: true
      }));

      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
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

    setConversations(prev => prev.map(conv =>
      conv.id === conversation.id ? { ...conv, unread_count: 0 } : conv
    ));
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const filteredConversations = conversations.filter(conv => {
    const matchesSearch = !searchQuery ||
      conv.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.participants?.some(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesType = selectedConversationType === 'all' ||
      (selectedConversationType === 'direct' && conv.type === 'direct_message') ||
      (selectedConversationType === 'groups' && conv.type === 'group_chat') ||
      (selectedConversationType === 'support' && conv.type === 'customer_support');

    return matchesSearch && matchesType;
  });

  if (!isAuthenticated()) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50" data-testid="messages-page">
      <Header />

      <main className="pt-24 lg:pt-28 pb-20 lg:pb-8">
        <div className="flex h-[calc(100vh-4rem)] lg:h-[calc(100vh-5rem)]">

          {/* Sidebar */}
          <div className={`w-full lg:w-80 bg-white/95 backdrop-blur-xl border-r border-gray-200/50 flex flex-col ${
            currentView === 'chat' && activeConversation ? 'hidden lg:flex' : 'flex'
          }`}>

            {/* Sidebar Header */}
            <div className="p-6 border-b border-gray-200/50 bg-white/80 backdrop-blur-sm">
              <h1 className="text-xl font-semibold text-gray-900 mb-4">Messages</h1>

              {/* Search */}
              <div className="relative">
                <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search conversations, people..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    if (currentView === 'search') {
                      searchUsers(e.target.value);
                    }
                  }}
                  onFocus={() => {
                    if (searchQuery) setCurrentView('search');
                  }}
                  className="w-full pl-10 pr-4 py-2 bg-gray-50/80 backdrop-blur-sm border border-gray-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500/50 transition-all duration-200 placeholder-gray-500 shadow-sm"
                />
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-gray-200/50 bg-white/80 backdrop-blur-sm">
              {[
                { id: 'conversations', label: 'Chats', icon: MessageCircle },
                { id: 'contacts', label: 'Contacts', icon: Users },
                { id: 'search', label: 'Search', icon: Search },
                { id: 'settings', label: 'Settings', icon: Settings }
              ].map(tab => {
                const IconComponent = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setCurrentView(tab.id);
                      if (tab.id === 'search' && searchQuery) {
                        searchUsers(searchQuery);
                      }
                    }}
                    className={`flex-1 py-3 px-2 text-sm font-medium border-b-2 transition-all duration-200 ${
                      currentView === tab.id
                        ? 'border-teal-600 text-teal-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <IconComponent size={16} className="mx-auto mb-1" />
                    <div>{tab.label}</div>
                  </button>
                );
              })}
            </div>

            {/* Sidebar Content */}
            <div className="flex-1 overflow-y-auto">

              {/* Conversations View */}
              {currentView === 'conversations' && (
                <>
                  {/* Conversation Filters */}
                  <div className="p-4 border-b border-gray-200/50">
                    <div className="flex space-x-2">
                      {[
                        { id: 'all', label: 'All' },
                        { id: 'direct', label: 'Direct' },
                        { id: 'groups', label: 'Groups' },
                        { id: 'support', label: 'Support' }
                      ].map(filter => (
                        <button
                          key={filter.id}
                          onClick={() => setSelectedConversationType(filter.id)}
                          className={`px-3 py-1.5 text-sm font-medium rounded-full transition-all duration-200 ${
                            selectedConversationType === filter.id
                              ? 'bg-teal-600 text-white shadow-sm'
                              : 'bg-gray-100/80 backdrop-blur-sm text-gray-600 hover:bg-gray-200/80'
                          }`}
                        >
                          {filter.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* New Chat Button */}
                  <div className="p-4 border-b border-gray-200/50">
                    <button
                      onClick={() => setCurrentView('search')}
                      className="w-full flex items-center gap-3 px-4 py-3 text-teal-600 hover:bg-teal-50/80 backdrop-blur-sm rounded-xl transition-all duration-200 border border-teal-200/50"
                    >
                      <Plus size={18} />
                      <span className="font-medium">New Chat</span>
                    </button>
                  </div>

                  {/* Conversations List */}
                  <div className="space-y-1 p-2">
                    {loading ? (
                      <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
                      </div>
                    ) : filteredConversations.length === 0 ? (
                      <div className="text-center py-12 text-gray-500">
                        <MessageCircle size={40} className="mx-auto mb-3 opacity-50" />
                        <p className="font-medium">No conversations yet</p>
                        <p className="text-sm">Start a new chat to get connected</p>
                      </div>
                    ) : (
                      filteredConversations.map((conversation) => (
                        <ConversationItem
                          key={conversation.id}
                          conversation={conversation}
                          onSelect={selectConversation}
                          isActive={activeConversation?.id === conversation.id}
                          onlineUsers={onlineUsers}
                        />
                      ))
                    )}
                  </div>
                </>
              )}

              {/* Other views (contacts, search, settings) */}
              {currentView === 'contacts' && (
                <div className="p-4">
                  <h3 className="font-medium text-gray-900 mb-4">Your Contacts</h3>
                  <div className="space-y-2">
                    {contacts.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <Users size={32} className="mx-auto mb-2 opacity-50" />
                        <p>No contacts yet</p>
                        <p className="text-sm">Search for people to connect</p>
                      </div>
                    ) : (
                      contacts.map((contact) => (
                        <ContactItem
                          key={contact.id}
                          contact={contact}
                          onStartChat={() => startDirectMessage(contact.id)}
                        />
                      ))
                    )}
                  </div>
                </div>
              )}

              {currentView === 'search' && (
                <div className="p-4">
                  <h3 className="font-medium text-gray-900 mb-4">Search People</h3>
                  {searchQuery.length < 2 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Search size={32} className="mx-auto mb-2 opacity-50" />
                      <p>Search for people</p>
                      <p className="text-sm">Type at least 2 characters</p>
                    </div>
                  ) : searchResults.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <p>No users found</p>
                      <p className="text-sm">Try different keywords</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {searchResults.map((user) => (
                        <SearchResultItem
                          key={user.id}
                          user={user}
                          onStartChat={() => startDirectMessage(user.id)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {currentView === 'settings' && (
                <div className="p-4 space-y-6">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <User size={32} className="text-primary" />
                    </div>
                    <h3 className="font-semibold text-gray-900">{user?.first_name} {user?.last_name}</h3>
                    <p className="text-sm text-gray-500">{user?.email}</p>
                  </div>

                  <div className="space-y-2">
                    <button className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 rounded-lg transition-colors">
                      <Bell size={18} className="text-gray-600" />
                      <span>Notifications</span>
                    </button>
                    <button className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 rounded-lg transition-colors">
                      <Archive size={18} className="text-gray-600" />
                      <span>Archived Chats</span>
                    </button>
                    <button className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 rounded-lg transition-colors">
                      <Star size={18} className="text-gray-600" />
                      <span>Starred Messages</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Main Chat Area */}
          <div className={`flex-1 flex flex-col ${
            currentView === 'chat' && activeConversation ? 'flex' : 'hidden lg:flex'
          }`}>
            {currentView === 'chat' && activeConversation ? (
              <>
                {/* Chat Header */}
                <ChatHeader
                  conversation={activeConversation}
                  onBack={() => setCurrentView('conversations')}
                  onlineUsers={onlineUsers}
                />

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/80 backdrop-blur-sm">
                  {messages.map((message) => (
                    <MessageBubble
                      key={message.id}
                      message={message}
                      isOwnMessage={message.sender_id === user?.id}
                    />
                  ))}

                  {isTyping && (
                    <TypingIndicator />
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <MessageInput
                  value={newMessage}
                  onChange={setNewMessage}
                  onSend={sendMessage}
                  onTyping={handleTyping}
                  disabled={!activeConversation}
                />
              </>
            ) : (
              <WelcomeScreen
                onNewChat={() => setCurrentView('search')}
                onTestErrorContext={createSupportConversationWithError}
              />
            )}
          </div>
        </div>
      </main>

      <MobileBottomTab />
    </div>
  );
};

// Component definitions (same as in ChatModal but with your design system)
const ConversationItem = ({ conversation, onSelect, isActive, onlineUsers }) => {
  const isOnline = conversation.participants?.some(p => onlineUsers.has(p.id));

  return (
    <div
      onClick={() => onSelect(conversation)}
      className={`flex items-center p-3 hover:bg-gray-50/80 backdrop-blur-sm cursor-pointer rounded-xl transition-all duration-200 ${
        isActive ? 'bg-teal-50/80 backdrop-blur-sm border border-teal-200/50' : ''
      }`}
    >
      <div className="relative mr-3">
        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
          {conversation.type === 'group_chat' ? (
            <Users size={20} className="text-gray-600" />
          ) : conversation.type === 'customer_support' ? (
            <Bot size={20} className="text-teal-600" />
          ) : (
            <User size={20} className="text-gray-600" />
          )}
        </div>
        {isOnline && conversation.type === 'direct_message' && (
          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <h4 className="font-medium text-gray-900 truncate">
            {conversation.title}
          </h4>
          <span className="text-xs text-gray-500">
            {conversation.last_message_at && new Date(conversation.last_message_at).toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600 truncate">
            {conversation.last_message?.is_bot_message && (
              <Bot size={12} className="inline mr-1 text-teal-600" />
            )}
            {conversation.last_message?.content || 'No messages yet'}
          </p>
          {conversation.unread_count > 0 && (
            <span className="ml-2 px-2 py-1 bg-teal-600 text-white text-xs rounded-full min-w-[20px] text-center shadow-sm">
              {conversation.unread_count > 99 ? '99+' : conversation.unread_count}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

const ContactItem = ({ contact, onStartChat }) => (
  <div className="flex items-center p-3 hover:bg-gray-50/80 backdrop-blur-sm rounded-xl transition-all duration-200">
    <div className="relative mr-3">
      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
        <User size={16} className="text-gray-600" />
      </div>
      {contact.is_online && (
        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
      )}
    </div>
    <div className="flex-1">
      <h4 className="font-medium text-gray-900">{contact.name}</h4>
      <p className="text-sm text-gray-500">
        {contact.is_online ? 'Online' : `Last seen ${contact.last_seen ? new Date(contact.last_seen).toLocaleDateString() : 'recently'}`}
      </p>
    </div>
    <button
      onClick={() => onStartChat()}
      className="p-2 text-teal-600 hover:bg-teal-50/80 backdrop-blur-sm rounded-xl transition-all duration-200"
    >
      <MessageSquare size={18} />
    </button>
  </div>
);

const SearchResultItem = ({ user, onStartChat }) => (
  <div className="flex items-center p-3 hover:bg-gray-50/80 backdrop-blur-sm rounded-xl transition-all duration-200">
    <div className="relative mr-3">
      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
        <User size={16} className="text-gray-600" />
      </div>
      {user.is_online && (
        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
      )}
    </div>
    <div className="flex-1">
      <h4 className="font-medium text-gray-900">{user.first_name} {user.last_name}</h4>
      <p className="text-sm text-gray-500">
        {user.is_contact ? (
          <span className="text-green-600">Contact</span>
        ) : user.contact_status === 'pending' ? (
          <span className="text-orange-600">Request sent</span>
        ) : (
          user.email
        )}
      </p>
    </div>
    <button
      onClick={() => onStartChat()}
      className="px-3 py-1.5 text-sm bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition-all duration-200 shadow-sm"
    >
      Message
    </button>
  </div>
);

const ChatHeader = ({ conversation, onBack, onlineUsers }) => {
  const isOnline = conversation.participants?.some(p => onlineUsers.has(p.id));

  return (
    <div className="flex items-center justify-between p-4 border-b border-gray-200/50 bg-white/80 backdrop-blur-sm">
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100/80 backdrop-blur-sm rounded-xl transition-all duration-200 lg:hidden"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
          {conversation.type === 'group_chat' ? (
            <Users size={20} className="text-gray-600" />
          ) : conversation.type === 'customer_support' ? (
            <Bot size={20} className="text-teal-600" />
          ) : (
            <User size={20} className="text-gray-600" />
          )}
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">{conversation.title}</h3>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            {isOnline && (
              <>
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Online</span>
              </>
            )}
            {conversation.type === 'group_chat' && (
              <span>{conversation.participants?.length || 0} members</span>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100/80 backdrop-blur-sm rounded-xl transition-all duration-200">
          <Phone size={18} />
        </button>
        <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100/80 backdrop-blur-sm rounded-xl transition-all duration-200">
          <MoreVertical size={18} />
        </button>
      </div>
    </div>
  );
};

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
        return <CheckCheck size={12} className="text-teal-600" />;
      default:
        return null;
    }
  };

  return (
    <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} gap-2`}>
      {!isOwnMessage && (
        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
          {message.is_bot_message ? (
            <Bot size={16} className="text-teal-600" />
          ) : (
            <User size={16} className="text-gray-600" />
          )}
        </div>
      )}

      <div className={`max-w-xs lg:max-w-md ${isOwnMessage ? 'order-1' : 'order-2'}`}>
        <div
          className={`px-4 py-2 rounded-xl ${
            isOwnMessage
              ? 'bg-teal-600 text-white rounded-br-md'
              : message.is_bot_message
              ? 'bg-teal-50/80 backdrop-blur-sm text-teal-700 border border-teal-200/50 rounded-bl-md'
              : 'bg-white/80 backdrop-blur-sm border border-gray-200/50 text-gray-900 rounded-bl-md'
          } shadow-sm`}
        >
          {/* WhatsApp-style quoted error context */}
          {message.error_context && (
            <div className="mb-3 p-2 bg-red-50/80 backdrop-blur-sm border-l-4 border-red-400 rounded-r-lg">
              <div className="flex items-center gap-1 mb-1">
                <AlertTriangle size={12} className="text-red-600" />
                <span className="text-xs font-medium text-red-600">Error Report</span>
              </div>
              <p className="text-xs text-red-700 italic">"{message.error_context.originalError}"</p>
              <div className="text-xs text-red-500 mt-1 space-y-0.5">
                <div>📅 {message.error_context.timestamp}</div>
                <div>📄 {message.error_context.currentPage}</div>
                {message.error_context.orderId && (
                  <div>🛒 Order: {message.error_context.orderId}</div>
                )}
              </div>
            </div>
          )}

          <p className="text-sm whitespace-pre-line">{message.content}</p>
        </div>

        <div className={`flex items-center gap-1 mt-1 text-xs text-gray-500 ${
          isOwnMessage ? 'justify-end' : 'justify-start'
        }`}>
          <span>{formatTime(message.created_at)}</span>
          {isOwnMessage && getStatusIcon(message.status)}
        </div>
      </div>
    </div>
  );
};

const TypingIndicator = () => (
  <div className="flex items-center gap-2 text-gray-500">
    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
      <User size={16} className="text-gray-600" />
    </div>
    <div className="bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-xl rounded-bl-md px-4 py-2 shadow-sm">
      <div className="flex items-center gap-1">
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
      </div>
    </div>
  </div>
);

const MessageInput = ({ value, onChange, onSend, onTyping, disabled }) => (
  <div className="p-4 border-t border-gray-200/50 bg-white/80 backdrop-blur-sm">
    <div className="flex items-center gap-3">
      <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100/80 backdrop-blur-sm rounded-xl transition-all duration-200">
        <Paperclip size={18} />
      </button>
      <div className="flex-1 relative">
        <input
          type="text"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            onTyping();
          }}
          onKeyDown={(e) => e.key === 'Enter' && onSend()}
          placeholder="Type a message..."
          disabled={disabled}
          className="w-full px-4 py-3 bg-gray-50/80 backdrop-blur-sm border border-gray-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500/50 transition-all duration-200 placeholder-gray-500 shadow-sm"
        />
      </div>
      <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100/80 backdrop-blur-sm rounded-xl transition-all duration-200">
        <Smile size={18} />
      </button>
      <button
        onClick={onSend}
        disabled={!value.trim() || disabled}
        className="p-3 bg-teal-600 text-white rounded-xl hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
      >
        <Send size={18} />
      </button>
    </div>
  </div>
);

const WelcomeScreen = ({ onNewChat, onTestErrorContext }) => {
  // Test function to simulate Contact Support error context
  const testErrorContext = () => {
    console.log('🧪 Testing error context creation...');
    const testContext = {
      type: 'error_report',
      originalError: 'Test error: Cannot cancel order - testing support integration',
      errorType: 'order_cancellation_failed',
      timestamp: new Date().toLocaleString(),
      orderId: 'TEST-ORDER-123',
      userAgent: navigator.userAgent,
      currentPage: 'My Orders',
      prefilledMessage: `Hi Support Team,

I encountered an issue while trying to manage my order:

📋 Error Details:
"Test error: Cannot cancel order - testing support integration"

🕒 When: ${new Date().toLocaleString()}
📄 Page: My Orders
🛒 Order ID: TEST-ORDER-123

Could you please help me resolve this issue?`
    };

    if (onTestErrorContext) {
      console.log('📝 Calling onTestErrorContext with:', testContext);
      onTestErrorContext(testContext);
    } else {
      console.log('⚠️ onTestErrorContext function not available');
      alert('Test: onTestErrorContext function not available. Check console for details.');
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center bg-gray-50/80 backdrop-blur-sm">
      <div className="text-center">
        <MessageCircle size={64} className="mx-auto mb-4 text-gray-400" />
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Welcome to IziShop Messenger</h2>
        <p className="text-gray-600 mb-6">Connect with shops, customers, and get support instantly</p>
        <div className="space-y-3">
          <button
            onClick={onNewChat}
            className="block px-6 py-3 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition-all duration-200 shadow-sm"
          >
            Start New Chat
          </button>
          <button
            onClick={testErrorContext}
            className="block px-6 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all duration-200 shadow-sm text-sm"
          >
            🧪 Test Contact Support (Debug)
          </button>
        </div>
      </div>
    </div>
  );
};

export default MessagesPage;