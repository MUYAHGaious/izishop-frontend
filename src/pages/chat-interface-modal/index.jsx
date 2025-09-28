import React, { useState, useEffect, useRef } from 'react';
import Button from '../../components/ui/Button';

import Icon from '../../components/AppIcon';
import ContactOptions from './components/ContactOptions';
import ChatInterface from './components/ChatInterface';
import EmailForm from './components/EmailForm';

const ChatInterfaceModal = ({ isOpen, onClose, shop, currentProduct, orderContext, customerService }) => {
  const [activeTab, setActiveTab] = useState('chat');
  const [currentView, setCurrentView] = useState('conversations'); // 'conversations' or 'chat'
  const [activeConversation, setActiveConversation] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [allMessages, setAllMessages] = useState({}); // Messages for all conversations
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [ownerOnline, setOwnerOnline] = useState(shop?.isOnline || false);
  const [attachments, setAttachments] = useState([]);
  const [showEmojis, setShowEmojis] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize conversations when modal opens
  useEffect(() => {
    if (isOpen) {
      // Load saved conversations from localStorage or initialize with sample data
      const savedConversations = localStorage.getItem('chatConversations');
      const savedMessages = localStorage.getItem('chatMessages');

      if (savedConversations && savedMessages) {
        setConversations(JSON.parse(savedConversations));
        setAllMessages(JSON.parse(savedMessages));
      } else {
        // Initialize with sample conversations
        const initialConversations = [
          {
            id: 'techshop-cm',
            name: 'TechShop CM',
            avatar: '/assets/images/default-shop.png',
            lastMessage: 'Thank you for your order!',
            timestamp: new Date(Date.now() - 300000),
            unread: 2,
            online: true,
            type: 'shop'
          },
          {
            id: 'fashion-hub',
            name: 'Fashion Hub',
            avatar: '/assets/images/default-shop.png',
            lastMessage: 'Your package is ready for pickup',
            timestamp: new Date(Date.now() - 3600000),
            unread: 0,
            online: false,
            type: 'shop'
          },
          {
            id: 'customer-support',
            name: 'Customer Support',
            avatar: '/assets/images/support-avatar.png',
            lastMessage: 'How can we help you today?',
            timestamp: new Date(Date.now() - 86400000),
            unread: 0,
            online: true,
            type: 'support'
          }
        ];

        const initialMessages = {
          'techshop-cm': [
            {
              id: 1,
              text: 'Hello! Welcome to TechShop CM. How can I help you today?',
              sender: 'shop',
              timestamp: new Date(Date.now() - 3600000),
              status: 'delivered'
            }
          ],
          'fashion-hub': [
            {
              id: 1,
              text: 'Your order #12345 is ready for pickup!',
              sender: 'shop',
              timestamp: new Date(Date.now() - 3600000),
              status: 'delivered'
            }
          ],
          'customer-support': [
            {
              id: 1,
              text: 'Hello! This is IziShop customer support. How can we assist you today?',
              sender: 'support',
              timestamp: new Date(Date.now() - 86400000),
              status: 'delivered'
            }
          ]
        };

        setConversations(initialConversations);
        setAllMessages(initialMessages);
      }

      // If specific shop/order context is provided, find or create conversation
      if (shop && !customerService) {
        const existingConv = conversations.find(conv => conv.name === shop.name);
        if (!existingConv) {
          const newConversation = {
            id: `shop-${Date.now()}`,
            name: shop.name,
            avatar: shop.logo || '/assets/images/default-shop.png',
            lastMessage: `Hi! Welcome to ${shop.name}. How can I help you today?`,
            timestamp: new Date(),
            unread: 0,
            online: shop.isOnline || true,
            type: 'shop'
          };

          const welcomeMessage = {
            id: 1,
            text: `Hi! Welcome to ${shop.name}. How can I help you today?`,
            sender: 'shop',
            timestamp: new Date(),
            status: 'delivered'
          };

          setConversations(prev => [newConversation, ...prev]);
          setAllMessages(prev => ({
            ...prev,
            [newConversation.id]: [welcomeMessage]
          }));
          setActiveConversation(newConversation);
          setCurrentView('chat');
        }
      }

      // For customer service with order context
      if (customerService && orderContext) {
        const convId = `order-${orderContext.id}`;
        const existingConv = conversations.find(conv => conv.id === convId);

        if (!existingConv) {
          const customerConversation = {
            id: convId,
            name: `Customer: ${orderContext.customer?.name}`,
            avatar: orderContext.customer?.avatar || '/assets/images/default-avatar.png',
            lastMessage: `Customer service chat for order #${orderContext.id}`,
            timestamp: new Date(),
            unread: 0,
            online: true,
            type: 'customer'
          };

          const welcomeMessage = {
            id: 1,
            text: `Hello ${orderContext.customer?.name || 'Customer'}! I'm here to help with your order #${orderContext.id}. How can I assist you today?`,
            sender: 'shop',
            timestamp: new Date(),
            status: 'delivered'
          };

          setConversations(prev => [customerConversation, ...prev]);
          setAllMessages(prev => ({
            ...prev,
            [customerConversation.id]: [welcomeMessage]
          }));
          setActiveConversation(customerConversation);
          setCurrentView('chat');
        }
      }
    }
  }, [isOpen, shop, customerService, orderContext]);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      sender: 'user',
      text: newMessage,
      timestamp: new Date(),
      status: 'sending'
    };

    setMessages(prev => [...prev, userMessage]);
    setNewMessage('');
    setIsTyping(true);

    // Simulate shop owner response
    setTimeout(() => {
      setIsTyping(false);
      const shopResponse = {
        id: Date.now() + 1,
        sender: 'shop',
        text: getAutoResponse(newMessage),
        timestamp: new Date(),
        status: 'delivered'
      };
      setMessages(prev => [...prev, shopResponse]);
    }, 1500);
  };

  const getAutoResponse = (message) => {
    const lowerMessage = message.toLowerCase();
    if (lowerMessage.includes('price') || lowerMessage.includes('cost')) {
      return "Let me check the current pricing for you. Are you interested in any specific product?";
    }
    if (lowerMessage.includes('shipping') || lowerMessage.includes('delivery')) {
      return "We offer delivery within 1-3 business days. Shipping costs depend on your location.";
    }
    if (lowerMessage.includes('warranty') || lowerMessage.includes('guarantee')) {
      return "All our products come with manufacturer warranty. Extended warranty options are also available.";
    }
    return "Thank you for your message! Let me get back to you with the information you need.";
  };

  const handleCall = () => {
    if (shop?.phone) {
      window.open(`tel:${shop.phone}`);
    }
  };

  const handleEmailSent = () => {
    setActiveTab('chat');
    const emailConfirmation = {
      id: Date.now(),
      sender: 'system',
      text: 'Your email has been sent successfully. The shop owner will get back to you soon.',
      timestamp: new Date(),
      status: 'delivered'
    };
    setMessages(prev => [...prev, emailConfirmation]);
  };

  const quickMessages = [
    "What are your business hours?",
    "Do you have this in stock?",
    "What\'s the warranty?",
    "Can you deliver to my location?",
    "What payment methods do you accept?"
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-md mx-4 bg-surface rounded-2xl shadow-elevated max-h-[90vh] flex flex-col">

        {/* Conversations List View */}
        {currentView === 'conversations' && (
          <>
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border bg-gradient-to-r from-teal-50 to-blue-50">
              <h3 className="font-semibold text-text-primary">Messages</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
              >
                <Icon name="X" size={20} />
              </Button>
            </div>

            {/* Search */}
            <div className="p-3 border-b border-border">
              <div className="relative">
                <Icon name="Search" size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary" />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm bg-background"
                />
              </div>
            </div>

            {/* Conversations List */}
            <div className="flex-1 overflow-y-auto">
              {conversations
                .filter(conv => conv.name.toLowerCase().includes(searchQuery.toLowerCase()))
                .map((conversation) => (
                <div
                  key={conversation.id}
                  onClick={() => {
                    setActiveConversation(conversation);
                    setMessages(allMessages[conversation.id] || []);
                    setCurrentView('chat');
                    // Mark as read
                    setConversations(prev => prev.map(conv =>
                      conv.id === conversation.id ? { ...conv, unread: 0 } : conv
                    ));
                  }}
                  className="flex items-center p-3 hover:bg-muted cursor-pointer border-b border-border transition-colors"
                >
                  <div className="relative flex-shrink-0 mr-3">
                    <img
                      src={conversation.avatar}
                      alt={conversation.name}
                      className="w-12 h-12 rounded-full object-cover"
                      onError={(e) => {
                        e.target.src = '/assets/images/no_image.png';
                      }}
                    />
                    {conversation.online && (
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-success border-2 border-surface rounded-full"></div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-medium text-text-primary truncate text-sm">
                        {conversation.name}
                      </h4>
                      <span className="text-xs text-text-secondary">
                        {new Date(conversation.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-sm text-text-secondary truncate">
                      {conversation.lastMessage}
                    </p>
                  </div>

                  {conversation.unread > 0 && (
                    <div className="ml-2 bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                      {conversation.unread}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        {/* Chat View */}
        {currentView === 'chat' && activeConversation && (
          <>
            {/* Chat Header */}
            <div className="flex items-center justify-between p-4 border-b border-border bg-gradient-to-r from-teal-50 to-blue-50">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setCurrentView('conversations')}
                  className="mr-1"
                >
                  <Icon name="ArrowLeft" size={20} />
                </Button>
                <div className="w-10 h-10 bg-muted rounded-lg overflow-hidden">
                  <img
                    src={activeConversation.avatar}
                    alt={activeConversation.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = '/assets/images/no_image.png';
                    }}
                  />
                </div>
                <div>
                  <h3 className="font-semibold text-text-primary text-sm">{activeConversation.name}</h3>
                  <div className="flex items-center gap-2 text-xs">
                    <div className={`w-2 h-2 rounded-full ${
                      activeConversation.online ? 'bg-success' : 'bg-error'
                    }`} />
                    <span className="text-text-secondary">
                      {activeConversation.online ? 'Online' : 'Last seen recently'}
                    </span>
                  </div>
                </div>
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
              >
                <Icon name="X" size={20} />
              </Button>
            </div>
          </>
        )}

        {/* Current Product Context */}
        {currentProduct && (
          <div className="p-3 bg-muted/50 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-background rounded overflow-hidden">
                <img
                  src={currentProduct.image}
                  alt={currentProduct.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = '/assets/images/no_image.png';
                  }}
                />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-text-primary truncate">
                  {currentProduct.name}
                </p>
                <p className="text-xs text-text-secondary">
                  Asking about this product
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Contact Options */}
        <ContactOptions
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onCall={handleCall}
          shop={shop}
        />

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {activeTab === 'chat' && (
            <ChatInterface
              messages={messages}
              newMessage={newMessage}
              setNewMessage={setNewMessage}
              onSendMessage={handleSendMessage}
              isTyping={isTyping}
              quickMessages={quickMessages}
              messagesEndRef={messagesEndRef}
            />
          )}
          
          {activeTab === 'email' && (
            <EmailForm
              shop={shop}
              currentProduct={currentProduct}
              onEmailSent={handleEmailSent}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatInterfaceModal;