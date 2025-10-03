import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';
import ContactOptions from './components/ContactOptions';
import ChatInterface from './components/ChatInterface';
import EmailForm from './components/EmailForm';
import chatStorage from '../../utils/chatStorage';
import { useAuth } from '../../contexts/AuthContext';

const ChatInterfaceModal = ({ isOpen, onClose, shop, currentProduct, orderContext, customerService }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('chat');
  const [currentView, setCurrentView] = useState('conversations'); // 'conversations', 'chat', or 'archived'
  const [activeConversation, setActiveConversation] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [archivedConversations, setArchivedConversations] = useState([]);
  const [allMessages, setAllMessages] = useState({}); // Messages for all conversations
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [ownerOnline, setOwnerOnline] = useState(shop?.isOnline || false);
  const [searchQuery, setSearchQuery] = useState('');

  // Media state
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);

  // Voice recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [audioBlob, setAudioBlob] = useState(null);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recordingIntervalRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Media handling
  const handleMediaSelect = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const validVideoTypes = ['video/mp4', 'video/webm', 'video/ogg'];
    const validTypes = [...validImageTypes, ...validVideoTypes];

    if (!validTypes.includes(file.type)) {
      alert('❌ Please select a valid image (JPEG, PNG, GIF, WebP) or video (MP4, WebM, OGG) file.');
      return;
    }

    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      alert('❌ File size must be less than 50MB');
      return;
    }

    setSelectedMedia(file);
    const previewUrl = URL.createObjectURL(file);
    setMediaPreview(previewUrl);
  };

  const cancelMediaSelection = () => {
    if (mediaPreview) {
      URL.revokeObjectURL(mediaPreview);
    }
    setSelectedMedia(null);
    setMediaPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const sendMediaMessage = async () => {
    if (!selectedMedia || !activeConversation) return;

    const messageId = `msg-${Date.now()}`;
    const messageMediaUrl = URL.createObjectURL(selectedMedia);

    const mediaMessage = {
      id: messageId,
      text: newMessage.trim() || '',
      sender: 'user',
      timestamp: new Date(),
      status: 'sending',
      media: {
        type: selectedMedia.type.startsWith('image/') ? 'image' : 'video',
        name: selectedMedia.name,
        size: selectedMedia.size,
        mimeType: selectedMedia.type,
        blob: selectedMedia,
        url: messageMediaUrl
      }
    };

    setMessages(prev => [...prev, mediaMessage]);
    setNewMessage('');
    cancelMediaSelection();

    // Save to IndexedDB
    if (activeConversation) {
      setAllMessages(prev => ({
        ...prev,
        [activeConversation.id]: [...(prev[activeConversation.id] || []), mediaMessage]
      }));

      try {
        await chatStorage.saveMessages(activeConversation.id, [{
          id: messageId,
          content: mediaMessage.text,
          sender_id: user.id,
          created_at: mediaMessage.timestamp.toISOString(),
          status: 'sending',
          media: mediaMessage.media
        }]);
      } catch (error) {
        console.error('Error saving media message:', error);
      }
    }

    setTimeout(() => {
      setMessages(prev =>
        prev.map(msg =>
          msg.id === messageId ? { ...msg, status: 'delivered' } : msg
        )
      );
    }, 500);
  };

  // Voice recording
  const startVoiceRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      let mimeType = 'audio/webm;codecs=opus';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'audio/mp4';
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = 'audio/webm';
          if (!MediaRecorder.isTypeSupported(mimeType)) {
            mimeType = '';
          }
        }
      }

      const mediaRecorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType || 'audio/webm' });
        setAudioBlob(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start(100);
      setIsRecording(true);
      setRecordingDuration(0);

      recordingIntervalRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);

    } catch (error) {
      if (error.name === 'NotAllowedError') {
        alert('❌ Microphone permission denied');
      } else if (error.name === 'NotFoundError') {
        alert('❌ No microphone found');
      } else {
        alert('❌ Error accessing microphone');
      }
    }
  };

  const stopVoiceRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    }
  };

  const cancelVoiceRecording = () => {
    stopVoiceRecording();
    setAudioBlob(null);
    setRecordingDuration(0);
  };

  const sendVoiceMessage = async () => {
    if (!audioBlob || !activeConversation) return;

    const messageId = `msg-${Date.now()}`;
    const voiceUrl = URL.createObjectURL(audioBlob);

    const voiceMessage = {
      id: messageId,
      text: '',
      sender: 'user',
      timestamp: new Date(),
      status: 'sending',
      voice: {
        blob: audioBlob,
        url: voiceUrl,
        duration: recordingDuration
      }
    };

    setMessages(prev => [...prev, voiceMessage]);
    setAudioBlob(null);
    setRecordingDuration(0);

    // Save to IndexedDB
    if (activeConversation) {
      setAllMessages(prev => ({
        ...prev,
        [activeConversation.id]: [...(prev[activeConversation.id] || []), voiceMessage]
      }));

      try {
        await chatStorage.saveMessages(activeConversation.id, [{
          id: messageId,
          content: '',
          sender_id: user.id,
          created_at: voiceMessage.timestamp.toISOString(),
          status: 'sending',
          voice: voiceMessage.voice
        }]);
      } catch (error) {
        console.error('Error saving voice message:', error);
      }
    }

    setTimeout(() => {
      setMessages(prev =>
        prev.map(msg =>
          msg.id === messageId ? { ...msg, status: 'delivered' } : msg
        )
      );
    }, 500);
  };

  // CRUD operations - Update IndexedDB
  const deleteConversation = async (conversation) => {
    try {
      setConversations(prev => prev.filter(c => c.id !== conversation.id));
      setArchivedConversations(prev => prev.filter(c => c.id !== conversation.id));

      if (activeConversation?.id === conversation.id) {
        setActiveConversation(null);
        setMessages([]);
        setCurrentView('conversations');
      }

      // Delete from IndexedDB
      if (conversation.type === 'customer_support') {
        await chatStorage.deleteSupportChat();
      } else {
        await chatStorage.deleteConversation(conversation.id);
      }

      delete allMessages[conversation.id];
    } catch (error) {
      console.error('Error deleting conversation:', error);
    }
  };

  const archiveConversation = async (conversation) => {
    setConversations(prev => prev.filter(c => c.id !== conversation.id));
    setArchivedConversations(prev => [...prev, { ...conversation, archived: true }]);

    if (activeConversation?.id === conversation.id) {
      setActiveConversation(null);
      setMessages([]);
      setCurrentView('conversations');
    }

    // Update in IndexedDB
    try {
      await chatStorage.saveConversation(user.id, {
        id: conversation.id,
        title: conversation.name,
        archived: true
      });
    } catch (error) {
      console.error('Error archiving conversation:', error);
    }
  };

  const unarchiveConversation = async (conversation) => {
    setArchivedConversations(prev => prev.filter(c => c.id !== conversation.id));
    setConversations(prev => [...prev, { ...conversation, archived: false }]);

    // Update in IndexedDB
    try {
      await chatStorage.saveConversation(user.id, {
        id: conversation.id,
        title: conversation.name,
        archived: false
      });
    } catch (error) {
      console.error('Error unarchiving conversation:', error);
    }
  };

  const toggleMuteConversation = async (conversation) => {
    const newMutedState = !conversation.muted;

    setConversations(prev =>
      prev.map(c =>
        c.id === conversation.id ? { ...c, muted: newMutedState } : c
      )
    );
    setArchivedConversations(prev =>
      prev.map(c =>
        c.id === conversation.id ? { ...c, muted: newMutedState } : c
      )
    );

    // Update in IndexedDB
    try {
      await chatStorage.saveConversation(user.id, {
        id: conversation.id,
        title: conversation.name,
        muted: newMutedState
      });
    } catch (error) {
      console.error('Error toggling mute:', error);
    }
  };

  // Recreate blob URLs for media and voice messages
  useEffect(() => {
    setMessages(prevMessages => {
      return prevMessages.map(msg => {
        let updatedMsg = { ...msg };

        if (msg.media && msg.media.blob) {
          if (!msg.media.url || !msg.media.url.startsWith('blob:')) {
            updatedMsg = {
              ...updatedMsg,
              media: {
                ...msg.media,
                url: URL.createObjectURL(msg.media.blob)
              }
            };
          }
        }

        if (msg.voice && msg.voice.blob) {
          if (!msg.voice.url || !msg.voice.url.startsWith('blob:')) {
            updatedMsg = {
              ...updatedMsg,
              voice: {
                ...msg.voice,
                url: URL.createObjectURL(msg.voice.blob)
              }
            };
          }
        }

        return updatedMsg;
      });
    });
  }, [messages.length]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize conversations when modal opens - Load from IndexedDB like messages page
  useEffect(() => {
    if (isOpen && user) {
      loadConversationsFromDB();
    }
  }, [isOpen, user]);

  const loadConversationsFromDB = async () => {
    try {
      console.log('🔄 Loading conversations from IndexedDB for user:', user.id);

      // Load conversations from IndexedDB
      const dbConversations = await chatStorage.getUserConversations(user.id);
      console.log('📦 Loaded conversations:', dbConversations);

      // Map to modal format
      const mappedConversations = dbConversations.map(conv => ({
        id: conv.id,
        name: conv.title,
        avatar: conv.avatar || '/assets/images/default-shop.png',
        lastMessage: conv.last_message?.content || 'No messages yet',
        timestamp: conv.last_message_at ? new Date(conv.last_message_at) : new Date(),
        unread: conv.unread_count || 0,
        online: conv.is_online || false,
        type: conv.type,
        muted: conv.muted || false,
        archived: conv.archived || false
      }));

      console.log('🗂️ Mapped conversations:', mappedConversations);

      setConversations(mappedConversations.filter(c => !c.archived));
      setArchivedConversations(mappedConversations.filter(c => c.archived));

      // Load messages for each conversation
      const messagesMap = {};
      for (const conv of dbConversations) {
        const messages = await chatStorage.getConversationMessages(conv.id);
        console.log(`💬 Loaded ${messages.length} messages for conversation ${conv.id}`);

        messagesMap[conv.id] = messages.map(msg => ({
          id: msg.id,
          text: msg.content || '',
          sender: msg.sender_id === user.id ? 'user' : (msg.is_bot_message ? 'support' : 'shop'),
          timestamp: new Date(msg.created_at),
          status: msg.status || 'delivered',
          media: msg.media,
          voice: msg.voice,
          isQuotedError: msg.isQuotedError,
          quotedContent: msg.quotedContent
        }));
      }

      console.log('📨 All messages loaded:', messagesMap);
      setAllMessages(messagesMap);

    } catch (error) {
      console.error('❌ Error loading conversations from IndexedDB:', error);
    }
  };

  // Save to IndexedDB when conversations/messages change
  useEffect(() => {
    if (isOpen && user && activeConversation) {
      const saveMessages = async () => {
        try {
          const messagesToSave = messages.map(msg => ({
            id: msg.id,
            content: msg.text,
            sender_id: msg.sender === 'user' ? user.id : null,
            created_at: msg.timestamp.toISOString(),
            status: msg.status,
            is_bot_message: msg.sender === 'support',
            media: msg.media,
            voice: msg.voice,
            conversationId: activeConversation.id
          }));

          await chatStorage.saveMessages(activeConversation.id, messagesToSave);
        } catch (error) {
          console.error('Error saving messages:', error);
        }
      };

      saveMessages();
    }
  }, [messages, isOpen, user, activeConversation]);

  // Original logic for specific shop/order context
  useEffect(() => {
    if (isOpen) {

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
        const convId = `support-${orderContext.id}`;
        const existingConv = conversations.find(conv => conv.id === convId);

        if (!existingConv) {
          const supportConversation = {
            id: convId,
            name: 'IziShop Customer Support',
            avatar: '/assets/images/support-avatar.png',
            lastMessage: orderContext.errorReport ? 'Error report received' : `Support chat for order #${orderContext.id}`,
            timestamp: new Date(),
            unread: 0,
            online: true,
            type: 'support'
          };

          const initialMessages = [];

          // Add welcome message from support
          const welcomeMessage = {
            id: 1,
            text: `Hello ${orderContext.customer?.name || 'Customer'}! I'm here to help you. I can see you're having an issue - let me assist you right away.`,
            sender: 'support',
            timestamp: new Date(),
            status: 'delivered'
          };
          initialMessages.push(welcomeMessage);

          // If there's an error context, create a quoted error message (WhatsApp style)
          if (orderContext.errorReport) {
            const quotedErrorMessage = {
              id: 2,
              text: orderContext.initialMessage || `I encountered an issue with my order cancellation:\n\n"${orderContext.errorReport.originalError}"\n\nCould you please help me resolve this?`,
              sender: 'user',
              timestamp: new Date(),
              status: 'delivered',
              isQuotedError: true,
              quotedContent: {
                type: 'error',
                content: orderContext.errorReport.originalError,
                timestamp: orderContext.errorReport.timestamp,
                page: orderContext.errorReport.currentPage,
                orderId: orderContext.errorReport.orderId
              }
            };
            initialMessages.push(quotedErrorMessage);

            // Auto-response from support acknowledging the error
            const supportResponse = {
              id: 3,
              text: `I can see the issue you're experiencing with${orderContext.errorReport.orderId ? ` order #${orderContext.errorReport.orderId}` : ' order cancellation'}. Let me check this for you and provide a solution. This type of ${orderContext.errorReport.errorType.replace('_', ' ')} can usually be resolved quickly.`,
              sender: 'support',
              timestamp: new Date(Date.now() + 1000),
              status: 'delivered'
            };
            initialMessages.push(supportResponse);
          }

          setConversations(prev => [supportConversation, ...prev]);
          setAllMessages(prev => ({
            ...prev,
            [supportConversation.id]: initialMessages
          }));
          setActiveConversation(supportConversation);
          setMessages(initialMessages);
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
              <div>
                <h3 className="font-semibold text-text-primary">Messages</h3>
                <p className="text-xs text-text-secondary">Quick chat view</p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    window.location.href = '/messages';
                  }}
                  className="text-xs"
                >
                  <Icon name="Maximize2" size={14} className="mr-1" />
                  Full View
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                >
                  <Icon name="X" size={20} />
                </Button>
              </div>
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

            {/* Feature Banner */}
            <div className="mx-3 mt-3 mb-2 p-3 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-lg text-white text-sm">
              <div className="flex items-start gap-2">
                <Icon name="Sparkles" size={16} className="flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium mb-1">Want more features?</p>
                  <p className="text-xs opacity-90 mb-2">
                    Send photos, videos, voice messages, and more in the full messaging experience!
                  </p>
                  <button
                    onClick={() => window.location.href = '/messages'}
                    className="text-xs bg-white text-teal-600 px-3 py-1 rounded-full font-medium hover:bg-gray-100 transition-colors"
                  >
                    Open Full Messaging →
                  </button>
                </div>
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
              // Media props
              selectedMedia={selectedMedia}
              mediaPreview={mediaPreview}
              fileInputRef={fileInputRef}
              onMediaSelect={handleMediaSelect}
              onCancelMedia={cancelMediaSelection}
              onSendMedia={sendMediaMessage}
              // Voice props
              isRecording={isRecording}
              recordingDuration={recordingDuration}
              audioBlob={audioBlob}
              onStartRecording={startVoiceRecording}
              onStopRecording={stopVoiceRecording}
              onCancelRecording={cancelVoiceRecording}
              onSendVoice={sendVoiceMessage}
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