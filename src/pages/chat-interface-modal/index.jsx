import React, { useState, useEffect, useRef } from 'react';
import Button from '../../components/ui/Button';

import Icon from '../../components/AppIcon';
import ContactOptions from './components/ContactOptions';
import ChatInterface from './components/ChatInterface';
import EmailForm from './components/EmailForm';

const ChatInterfaceModal = ({ isOpen, onClose, shop, currentProduct }) => {
  const [activeTab, setActiveTab] = useState('chat');
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [ownerOnline, setOwnerOnline] = useState(shop?.isOnline || false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      // Initialize with welcome message
      const welcomeMessage = {
        id: 1,
        sender: 'shop',
        text: `Hi! Welcome to ${shop?.name}. How can I help you today?`,
        timestamp: new Date(),
        status: 'delivered'
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen, shop?.name]);

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
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-muted rounded-lg overflow-hidden">
              <img
                src={shop?.logo}
                alt={shop?.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = '/assets/images/no_image.png';
                }}
              />
            </div>
            <div>
              <h3 className="font-semibold text-text-primary">{shop?.name}</h3>
              <div className="flex items-center gap-2 text-sm">
                <div className={`w-2 h-2 rounded-full ${
                  ownerOnline ? 'bg-success' : 'bg-error'
                }`} />
                <span className="text-text-secondary">
                  {ownerOnline ? 'Online' : 'Offline'}
                </span>
                {shop?.responseTime && (
                  <span className="text-text-secondary">
                    • {shop.responseTime}
                  </span>
                )}
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