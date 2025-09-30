import React, { useState, useEffect, useRef } from 'react';
import {
  MessageCircle,
  X,
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
  ExternalLink,
  Star,
  MessageSquare
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const ChatModal = ({ isOpen, onClose }) => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState('conversations');
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  const wsRef = useRef(null);

  useEffect(() => {
    if (isOpen && isAuthenticated() && user) {
      loadConversations();
      loadContacts();
      initializeWebSocket();
    }

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [isOpen, user]);

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
          if (isOpen && isAuthenticated()) initializeWebSocket();
        }, 3000);
      };
    } catch (error) {
      console.error('WebSocket error:', error);
    }
  };

  const handleWebSocketMessage = (data) => {
    if (data.type === 'new_message') {
      setMessages(prev => [...prev, data.message]);
      setConversations(prev => prev.map(conv =>
        conv.id === data.message.conversation_id
          ? {
              ...conv,
              last_message: {
                content: data.message.content,
                created_at: data.message.created_at
              },
              unread_count: activeConversation?.id === data.message.conversation_id ? 0 : (conv.unread_count || 0) + 1
            }
          : conv
      ));
    }
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

  const startDirectMessage = async (userId) => {
    try {
      const response = await api.post('/chat/conversations/direct', {
        recipient_id: userId,
        initial_message: "Hello!"
      });
      setConversations(prev => [response, ...prev.filter(c => c.id !== response.id)]);
      setActiveConversation(response);
      setCurrentView('chat');
    } catch (error) {
      console.error('Failed to start direct message:', error);
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

  const goToFullChatPage = () => {
    onClose();
    navigate('/messages');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-4xl h-[80vh] bg-white/95 backdrop-blur-xl rounded-xl shadow-xl border border-white/20 flex overflow-hidden">

        {/* Sidebar */}
        <div className="w-80 bg-gray-50/80 backdrop-blur-sm border-r border-gray-200/50 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-gray-200/50 bg-white/80 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Messages</h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={goToFullChatPage}
                  className="p-2 text-gray-500 hover:text-teal-600 hover:bg-teal-50/80 backdrop-blur-sm rounded-xl transition-all duration-200 border border-teal-200/50"
                  title="Open full chat page"
                >
                  <ExternalLink size={18} />
                </button>
                <button
                  onClick={onClose}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100/80 backdrop-blur-sm rounded-xl transition-all duration-200"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Search */}
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (currentView === 'search') {
                    searchUsers(e.target.value);
                  }
                }}
                className="w-full pl-9 pr-4 py-2 bg-gray-50/80 backdrop-blur-sm border border-gray-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500/50 transition-all duration-200 text-sm placeholder-gray-500 shadow-sm"
              />
            </div>
          </div>

          {/* Navigation */}
          <div className="flex border-b border-gray-200/50 bg-white/80 backdrop-blur-sm">
            {[
              { id: 'conversations', label: 'Chats', icon: MessageCircle },
              { id: 'contacts', label: 'Contacts', icon: Users },
              { id: 'search', label: 'Search', icon: Search }
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
                  className={`flex-1 py-3 px-2 text-xs font-medium border-b-2 transition-all duration-200 ${
                    currentView === tab.id
                      ? 'border-teal-600 text-teal-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <IconComponent size={14} className="mx-auto mb-1" />
                  <div>{tab.label}</div>
                </button>
              );
            })}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {currentView === 'conversations' && (
              <div className="p-2 space-y-1">
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-teal-600"></div>
                  </div>
                ) : conversations.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <MessageCircle size={24} className="mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No conversations yet</p>
                    <button
                      onClick={() => setCurrentView('search')}
                      className="text-xs text-teal-600 hover:underline mt-1"
                    >
                      Start a new chat
                    </button>
                  </div>
                ) : (
                  conversations.slice(0, 8).map((conv) => (
                    <ConversationItem
                      key={conv.id}
                      conversation={conv}
                      isActive={activeConversation?.id === conv.id}
                      onClick={() => {
                        setActiveConversation(conv);
                        setCurrentView('chat');
                      }}
                    />
                  ))
                )}
              </div>
            )}

            {currentView === 'contacts' && (
              <div className="p-2 space-y-1">
                {contacts.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Users size={24} className="mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No contacts yet</p>
                  </div>
                ) : (
                  contacts.slice(0, 10).map((contact) => (
                    <ContactItem
                      key={contact.id}
                      contact={contact}
                      onStartChat={() => startDirectMessage(contact.id)}
                    />
                  ))
                )}
              </div>
            )}

            {currentView === 'search' && (
              <div className="p-2">
                <button
                  onClick={() => setCurrentView('search')}
                  className="w-full flex items-center gap-2 p-3 text-teal-600 hover:bg-teal-50/80 backdrop-blur-sm rounded-xl transition-all duration-200 mb-2 border border-teal-200/50"
                >
                  <Plus size={16} />
                  <span className="text-sm font-medium">New Chat</span>
                </button>

                {searchQuery.length < 2 ? (
                  <div className="text-center py-6 text-gray-500">
                    <Search size={20} className="mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Search for people</p>
                    <p className="text-xs text-gray-400">Type at least 2 characters</p>
                  </div>
                ) : searchResults.length === 0 ? (
                  <div className="text-center py-6 text-gray-500">
                    <p className="text-sm">No users found</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {searchResults.slice(0, 8).map((user) => (
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
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {currentView === 'chat' && activeConversation ? (
            <>
              {/* Chat Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200/50 bg-white/80 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setCurrentView('conversations')}
                    className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100/80 backdrop-blur-sm rounded-xl transition-all duration-200 lg:hidden"
                  >
                    <ArrowLeft size={16} />
                  </button>
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                    <User size={16} className="text-gray-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 text-sm">{activeConversation.title}</h3>
                    <p className="text-xs text-gray-500">Online</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100/80 backdrop-blur-sm rounded-xl transition-all duration-200">
                    <Phone size={16} />
                  </button>
                  <button className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100/80 backdrop-blur-sm rounded-xl transition-all duration-200">
                    <MoreVertical size={16} />
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/80 backdrop-blur-sm">
                {messages.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <MessageCircle size={32} className="mx-auto mb-2 opacity-30" />
                    <p className="text-sm">No messages yet</p>
                    <p className="text-xs">Start the conversation!</p>
                  </div>
                ) : (
                  messages.map((message) => (
                    <MessageBubble
                      key={message.id}
                      message={message}
                      isOwnMessage={message.sender_id === user?.id}
                    />
                  ))
                )}
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-gray-200/50 bg-white/80 backdrop-blur-sm">
                <div className="flex items-center gap-2">
                  <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100/80 backdrop-blur-sm rounded-xl transition-all duration-200">
                    <Paperclip size={16} />
                  </button>
                  <div className="flex-1">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                      placeholder="Type a message..."
                      className="w-full px-3 py-2 bg-gray-50/80 backdrop-blur-sm border border-gray-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500/50 transition-all duration-200 text-sm placeholder-gray-500 shadow-sm"
                    />
                  </div>
                  <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100/80 backdrop-blur-sm rounded-xl transition-all duration-200">
                    <Smile size={16} />
                  </button>
                  <button
                    onClick={sendMessage}
                    disabled={!newMessage.trim()}
                    className="p-2 bg-teal-600 text-white rounded-xl hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
                  >
                    <Send size={16} />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <WelcomeScreen onNewChat={() => setCurrentView('search')} onOpenFullPage={goToFullChatPage} />
          )}
        </div>
      </div>
    </div>
  );
};

// Sub-components
const ConversationItem = ({ conversation, isActive, onClick }) => (
  <div
    onClick={onClick}
    className={`flex items-center p-2 hover:bg-gray-100/80 backdrop-blur-sm cursor-pointer rounded-xl transition-all duration-200 ${
      isActive ? 'bg-teal-50/80 backdrop-blur-sm border border-teal-200/50' : ''
    }`}
  >
    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mr-2">
      <User size={14} className="text-gray-600" />
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex items-center justify-between mb-1">
        <h4 className="text-sm font-medium text-gray-900 truncate">{conversation.title}</h4>
        <span className="text-xs text-gray-500">
          {conversation.last_message_at && new Date(conversation.last_message_at).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
          })}
        </span>
      </div>
      <p className="text-xs text-gray-600 truncate">
        {conversation.last_message?.content || 'No messages yet'}
      </p>
    </div>
    {conversation.unread_count > 0 && (
      <span className="ml-1 px-1.5 py-0.5 bg-teal-600 text-white text-xs rounded-full min-w-[16px] text-center shadow-sm">
        {conversation.unread_count > 9 ? '9+' : conversation.unread_count}
      </span>
    )}
  </div>
);

const ContactItem = ({ contact, onStartChat }) => (
  <div className="flex items-center p-2 hover:bg-gray-100/80 backdrop-blur-sm rounded-xl transition-all duration-200">
    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mr-2">
      <User size={14} className="text-gray-600" />
    </div>
    <div className="flex-1">
      <h4 className="text-sm font-medium text-gray-900">{contact.name}</h4>
      <p className="text-xs text-gray-500">
        {contact.is_online ? 'Online' : 'Offline'}
      </p>
    </div>
    <button
      onClick={onStartChat}
      className="p-1.5 text-teal-600 hover:bg-teal-50/80 backdrop-blur-sm rounded-xl transition-all duration-200"
    >
      <MessageSquare size={14} />
    </button>
  </div>
);

const SearchResultItem = ({ user, onStartChat }) => (
  <div className="flex items-center p-2 hover:bg-gray-100/80 backdrop-blur-sm rounded-xl transition-all duration-200">
    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mr-2">
      <User size={14} className="text-gray-600" />
    </div>
    <div className="flex-1">
      <h4 className="text-sm font-medium text-gray-900">{user.first_name} {user.last_name}</h4>
      <p className="text-xs text-gray-500">{user.email}</p>
    </div>
    <button
      onClick={onStartChat}
      className="px-2 py-1 text-xs bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-all duration-200 shadow-sm"
    >
      Message
    </button>
  </div>
);

const MessageBubble = ({ message, isOwnMessage }) => {
  const formatTime = (timestamp) => new Date(timestamp).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} gap-2`}>
      {!isOwnMessage && (
        <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
          {message.is_bot_message ? (
            <Bot size={12} className="text-primary" />
          ) : (
            <User size={12} className="text-gray-600" />
          )}
        </div>
      )}

      <div className="max-w-xs">
        <div
          className={`px-3 py-2 rounded-lg text-sm ${
            isOwnMessage
              ? 'bg-teal-600 text-white rounded-br-sm'
              : message.is_bot_message
              ? 'bg-teal-50/80 backdrop-blur-sm text-teal-700 border border-teal-200/50 rounded-bl-sm'
              : 'bg-white/80 backdrop-blur-sm border border-gray-200/50 text-gray-900 rounded-bl-sm'
          } shadow-sm`}
        >
          {message.content}
        </div>
        <div className={`flex items-center gap-1 mt-1 text-xs text-gray-500 ${
          isOwnMessage ? 'justify-end' : 'justify-start'
        }`}>
          <span>{formatTime(message.created_at)}</span>
          {isOwnMessage && (
            message.status === 'read' ? <CheckCheck size={10} className="text-teal-600" /> :
            message.status === 'delivered' ? <Check size={10} /> :
            <Clock size={10} className="text-gray-400" />
          )}
        </div>
      </div>
    </div>
  );
};

const WelcomeScreen = ({ onNewChat, onOpenFullPage }) => (
  <div className="flex-1 flex items-center justify-center bg-gray-50/80 backdrop-blur-sm">
    <div className="text-center">
      <MessageCircle size={48} className="mx-auto mb-4 text-gray-400" />
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Welcome to IziShop Messenger</h3>
      <p className="text-gray-600 mb-6 text-sm">Connect with shops, customers, and get support</p>
      <div className="space-y-2">
        <button
          onClick={onNewChat}
          className="block w-full px-4 py-2 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition-all duration-200 text-sm shadow-sm"
        >
          Start New Chat
        </button>
        <button
          onClick={onOpenFullPage}
          className="block w-full px-4 py-2 border border-gray-200/50 text-gray-700 rounded-xl hover:bg-gray-50/80 backdrop-blur-sm transition-all duration-200 text-sm"
        >
          Open Full Chat Page
        </button>
      </div>
    </div>
  </div>
);

export default ChatModal;