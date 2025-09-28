import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  MessageCircle,
  X,
  Send,
  Search,
  MoreVertical,
  Phone,
  Info,
  Plus,
  Users,
  Settings,
  Archive,
  Bell,
  ArrowLeft,
  Check,
  CheckCheck,
  Clock,
  User,
  Bot,
  Paperclip,
  Smile,
  Edit3,
  Star,
  UserPlus,
  MessageSquare
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

const TelegramLikeMessenger = ({ isOpen, onClose }) => {
  const { user, isAuthenticated } = useAuth();
  const [currentView, setCurrentView] = useState('conversations'); // conversations, chat, contacts, search, settings
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
  const [selectedConversationType, setSelectedConversationType] = useState('all'); // all, direct, groups, support

  const messagesEndRef = useRef(null);
  const wsRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Initialize WebSocket and load data
  useEffect(() => {
    if (isOpen && isAuthenticated() && user) {
      initializeWebSocket();
      loadConversations();
      loadContacts();
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

      wsRef.current.onopen = () => console.log('WebSocket connected');
      wsRef.current.onmessage = (event) => handleWebSocketMessage(JSON.parse(event.data));
      wsRef.current.onclose = () => {
        console.log('WebSocket disconnected');
        setTimeout(() => {
          if (isOpen && isAuthenticated()) initializeWebSocket();
        }, 3000);
      };
    } catch (error) {
      console.error('WebSocket error:', error);
    }
  }, [user, isOpen]);

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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-white flex">

      {/* Sidebar */}
      <div className="w-80 bg-gray-50 border-r flex flex-col">

        {/* Sidebar Header */}
        <div className="p-4 border-b bg-white">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-semibold text-gray-900">IziShop Messenger</h1>
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              <X size={20} />
            </button>
          </div>

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
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b bg-white">
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
                className={`flex-1 py-3 px-2 text-sm font-medium border-b-2 transition-colors ${
                  currentView === tab.id
                    ? 'border-blue-500 text-blue-600'
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
              <div className="p-3 bg-white border-b">
                <div className="flex space-x-1">
                  {[
                    { id: 'all', label: 'All' },
                    { id: 'direct', label: 'Direct' },
                    { id: 'groups', label: 'Groups' },
                    { id: 'support', label: 'Support' }
                  ].map(filter => (
                    <button
                      key={filter.id}
                      onClick={() => setSelectedConversationType(filter.id)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
                        selectedConversationType === filter.id
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* New Chat Button */}
              <div className="p-3 border-b">
                <button
                  onClick={() => setCurrentView('search')}
                  className="w-full flex items-center gap-3 px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Plus size={18} />
                  <span className="font-medium">New Chat</span>
                </button>
              </div>

              {/* Conversations List */}
              <div className="space-y-1 p-2">
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  </div>
                ) : filteredConversations.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <MessageCircle size={32} className="mx-auto mb-2 opacity-50" />
                    <p>No conversations yet</p>
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

          {/* Contacts View */}
          {currentView === 'contacts' && (
            <div className="space-y-1 p-2">
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
          )}

          {/* Search View */}
          {currentView === 'search' && (
            <div className="space-y-1 p-2">
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
                searchResults.map((user) => (
                  <SearchResultItem
                    key={user.id}
                    user={user}
                    onStartChat={() => startDirectMessage(user.id)}
                  />
                ))
              )}
            </div>
          )}

          {/* Settings View */}
          {currentView === 'settings' && (
            <div className="p-4 space-y-4">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <User size={24} className="text-blue-600" />
                </div>
                <h3 className="font-semibold">{user?.first_name} {user?.last_name}</h3>
                <p className="text-sm text-gray-500">{user?.email}</p>
              </div>

              <div className="space-y-2">
                <button className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-gray-100 rounded-lg">
                  <Bell size={18} className="text-gray-600" />
                  <span>Notifications</span>
                </button>
                <button className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-gray-100 rounded-lg">
                  <Archive size={18} className="text-gray-600" />
                  <span>Archived Chats</span>
                </button>
                <button className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-gray-100 rounded-lg">
                  <Star size={18} className="text-gray-600" />
                  <span>Starred Messages</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {currentView === 'chat' && activeConversation ? (
          <>
            {/* Chat Header */}
            <ChatHeader
              conversation={activeConversation}
              onBack={() => setCurrentView('conversations')}
              onlineUsers={onlineUsers}
            />

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
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
          <WelcomeScreen onNewChat={() => setCurrentView('search')} />
        )}
      </div>
    </div>
  );
};

// Component: Conversation Item
const ConversationItem = ({ conversation, onSelect, isActive, onlineUsers }) => {
  const isOnline = conversation.participants?.some(p => onlineUsers.has(p.id));

  return (
    <div
      onClick={() => onSelect(conversation)}
      className={`flex items-center p-3 hover:bg-gray-100 cursor-pointer rounded-lg transition-colors ${
        isActive ? 'bg-blue-50 border-l-4 border-blue-500' : ''
      }`}
    >
      <div className="relative mr-3">
        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
          {conversation.type === 'group_chat' ? (
            <Users size={20} className="text-gray-600" />
          ) : conversation.type === 'customer_support' ? (
            <Bot size={20} className="text-blue-600" />
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
              <Bot size={12} className="inline mr-1 text-blue-500" />
            )}
            {conversation.last_message?.content || 'No messages yet'}
          </p>
          {conversation.unread_count > 0 && (
            <span className="ml-2 px-2 py-1 bg-blue-600 text-white text-xs rounded-full min-w-[20px] text-center">
              {conversation.unread_count > 99 ? '99+' : conversation.unread_count}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

// Component: Contact Item
const ContactItem = ({ contact, onStartChat }) => (
  <div className="flex items-center p-3 hover:bg-gray-100 rounded-lg">
    <div className="relative mr-3">
      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
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
      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
    >
      <MessageSquare size={18} />
    </button>
  </div>
);

// Component: Search Result Item
const SearchResultItem = ({ user, onStartChat }) => (
  <div className="flex items-center p-3 hover:bg-gray-100 rounded-lg">
    <div className="relative mr-3">
      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
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
          <span className="text-yellow-600">Request sent</span>
        ) : (
          user.email
        )}
      </p>
    </div>
    <button
      onClick={() => onStartChat()}
      className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
    >
      Message
    </button>
  </div>
);

// Component: Chat Header
const ChatHeader = ({ conversation, onBack, onlineUsers }) => {
  const isOnline = conversation.participants?.some(p => onlineUsers.has(p.id));

  return (
    <div className="flex items-center justify-between p-4 border-b bg-white">
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg lg:hidden"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
          {conversation.type === 'group_chat' ? (
            <Users size={20} className="text-gray-600" />
          ) : conversation.type === 'customer_support' ? (
            <Bot size={20} className="text-blue-600" />
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
        <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
          <Phone size={18} />
        </button>
        <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
          <MoreVertical size={18} />
        </button>
      </div>
    </div>
  );
};

// Component: Message Bubble
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
        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
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
              : 'bg-white border border-gray-200 text-gray-900 rounded-bl-md'
          } shadow-sm`}
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
    </div>
  );
};

// Component: Typing Indicator
const TypingIndicator = () => (
  <div className="flex items-center gap-2 text-gray-500">
    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
      <User size={16} className="text-gray-600" />
    </div>
    <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-md px-4 py-2 shadow-sm">
      <div className="flex items-center gap-1">
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
      </div>
    </div>
  </div>
);

// Component: Message Input
const MessageInput = ({ value, onChange, onSend, onTyping, disabled }) => (
  <div className="p-4 border-t bg-white">
    <div className="flex items-center gap-2">
      <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
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
          className="w-full px-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
        />
      </div>
      <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
        <Smile size={18} />
      </button>
      <button
        onClick={onSend}
        disabled={!value.trim() || disabled}
        className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Send size={18} />
      </button>
    </div>
  </div>
);

// Component: Welcome Screen
const WelcomeScreen = ({ onNewChat }) => (
  <div className="flex-1 flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <MessageCircle size={64} className="mx-auto mb-4 text-gray-400" />
      <h2 className="text-2xl font-semibold text-gray-900 mb-2">Welcome to IziShop Messenger</h2>
      <p className="text-gray-600 mb-6">Connect with shops, customers, and get support instantly</p>
      <button
        onClick={onNewChat}
        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        Start New Chat
      </button>
    </div>
  </div>
);

export default TelegramLikeMessenger;