import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
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
  Mic,
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
import logger from '../../utils/logger';
import chatStorage from '../../utils/chatStorage';

// Utility function to parse UTC timestamps correctly
// Handles both ISO format with 'Z' and SQLite format without timezone
const parseUTCTimestamp = (timestamp) => {
  if (!timestamp) return new Date();

  // If timestamp already has 'Z' suffix (UTC indicator), use it directly
  if (timestamp.endsWith('Z')) {
    return new Date(timestamp);
  }

  // Otherwise, assume it's UTC time from SQLite and append 'Z'
  return new Date(timestamp + 'Z');
};

// Utility function to deduplicate conversations by ID
const dedupeConversations = (conversations) => {
  const seen = new Set();
  return conversations.filter(conv => {
    if (seen.has(conv.id)) {
      console.log('🔍 Removing duplicate conversation:', conv.id);
      return false;
    }
    seen.add(conv.id);
    return true;
  });
};

const MessagesPage = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [currentView, setCurrentView] = useState('conversations');
  const [conversations, setConversations] = useState([]);
  const [archivedConversations, setArchivedConversations] = useState([]);
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
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [audioBlob, setAudioBlob] = useState(null);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const wsRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recordingIntervalRef = useRef(null);
  const sellerChatInitializedRef = useRef(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/authentication-login-register');
    }
  }, [isAuthenticated, navigate]);

  // Initialize WebSocket and load data
  useEffect(() => {
    // Check sessionStorage FIRST (more reliable than URL params)
    const createSupportChat = sessionStorage.getItem('createSupportChat');
    const storedErrorContext = sessionStorage.getItem('supportErrorContext');
    const supportAlreadyCreated = sessionStorage.getItem('supportChatCreated');

    const createSellerChat = sessionStorage.getItem('createSellerChat');
    const storedProductContext = sessionStorage.getItem('productContext');
    const sellerAlreadyCreated = sessionStorage.getItem('sellerChatCreated');

    logger.info('🎯 INIT EFFECT RUNNING');
    logger.info('Init useEffect', {
      createSupportChat: createSupportChat,
      hasErrorContext: !!storedErrorContext,
      supportAlreadyCreated: supportAlreadyCreated,
      createSellerChat: createSellerChat,
      hasProductContext: !!storedProductContext,
      sellerAlreadyCreated: sellerAlreadyCreated,
      hasUser: !!user,
      isAuth: isAuthenticated(),
      locationSearch: location.search
    });

    if (createSupportChat === 'true' && storedErrorContext) {
      // Support mode - don't make any API calls, let the support chat effect handle it
      logger.info('✅ Support mode detected via sessionStorage, skipping all API calls');

      // Only clear state if conversation hasn't been created yet
      if (supportAlreadyCreated !== 'true') {
        logger.info('🧹 Preparing for support chat creation - loading existing chats from IndexedDB');

        // Load existing chats from IndexedDB so we can merge them with the new support chat
        const loadExistingChats = async () => {
          try {
            if (user) {
              const existingChats = await chatStorage.getUserConversations(user.id);
              logger.info(`📂 Loaded ${existingChats.length} existing chats from IndexedDB`);
              if (existingChats.length > 0) {
                setConversations(existingChats);
              }
            }
          } catch (error) {
            logger.error('Failed to load existing chats from IndexedDB:', error);
          }
        };

        loadExistingChats();
        setContacts([]);
        setLoading(false);
      } else {
        logger.info('⏭️ Support chat already created, restoring from sessionStorage');

        // Restore conversation, messages, and view state from sessionStorage
        try {
          const storedConversation = sessionStorage.getItem('supportConversationData');
          const storedMessages = sessionStorage.getItem('supportMessagesData');
          const storedView = sessionStorage.getItem('supportActiveView');

          logger.info('SessionStorage data check', {
            hasConversation: !!storedConversation,
            hasMessages: !!storedMessages,
            hasView: !!storedView
          });

          if (storedConversation && storedMessages) {
            const conversation = JSON.parse(storedConversation);
            const messages = JSON.parse(storedMessages);

            logger.info('Restoring support chat', {
              conversation,
              messagesCount: messages.length,
              view: storedView
            });

            // Load other existing chats and merge with the support chat
            const loadAndMergeChats = async () => {
              try {
                if (user) {
                  const existingChats = await chatStorage.getUserConversations(user.id);
                  logger.info(`📂 Loaded ${existingChats.length} existing chats from IndexedDB`);

                  // Merge: put support chat first, then other existing chats (avoiding duplicates)
                  const otherChats = existingChats.filter(chat => chat.id !== conversation.id);
                  setConversations([conversation, ...otherChats]);
                } else {
                  // If no user yet, just show the support chat
                  setConversations([conversation]);
                }
              } catch (error) {
                logger.error('Failed to load existing chats:', error);
                setConversations([conversation]);
              }
            };

            loadAndMergeChats();
            setActiveConversation(conversation);
            setMessages(messages);
            setCurrentView(storedView || 'chat');
            setSelectedConversationType('support');
            setLoading(false);
          } else {
            logger.warn('⚠️ Support chat data missing from sessionStorage', {
              storedConversation: storedConversation?.substring(0, 100),
              storedMessages: storedMessages?.substring(0, 100)
            });
          }
        } catch (error) {
          logger.error('Failed to restore support chat from sessionStorage', { error: error.message });
        }
      }
      return; // Exit early, don't call any APIs
    }

    if (createSellerChat === 'true' && storedProductContext) {
      // Seller mode - don't load existing chats to prevent duplicates
      // The seller chat creation effect will handle creating/updating the conversation
      logger.info('✅ Seller mode detected via sessionStorage, will create/update seller chat');

      // Set flag to prevent this effect from running again
      sellerChatInitializedRef.current = true;

      // Start with empty conversation list - seller chat effect will populate it
      setConversations([]);
      setContacts([]);
      setLoading(false);

      // IMPORTANT: Return early to prevent normal mode from interfering with seller chat
      // The seller chat creation effect will handle all state updates
      return;
    }

    // Check if seller chat was already initialized - prevent re-running normal mode after seller chat
    if (sellerChatInitializedRef.current) {
      logger.info('⏸️ Seller chat already initialized, skipping normal mode initialization');
      return;
    }

    // Normal mode - load data and merge with saved support chats
    logger.info('❓ Support mode check failed, checking if should load normal data...');
    if (isAuthenticated() && user) {
      logger.info('📡 Normal mode - loading conversations and contacts');

      // Load saved support conversations from IndexedDB
      const loadSavedSupportChats = async () => {
        try {
          const supportConversations = await chatStorage.getUserConversations(user.id);
          if (supportConversations.length > 0) {
            logger.info(`Found ${supportConversations.length} saved support chats from IndexedDB`);
            setConversations(supportConversations);
          }
        } catch (error) {
          console.error('Failed to load saved support chats from IndexedDB:', error);
        }
      };

      loadSavedSupportChats();

      initializeWebSocket();
      loadConversations();
      loadContacts();
    } else {
      logger.info('⏸️ Not loading data - either not authenticated or no user');
    }

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [user, location.search]);

  // Poll for new messages every 3 seconds when a conversation is active
  useEffect(() => {
    if (!activeConversation || !user) return;

    const pollInterval = setInterval(async () => {
      try {
        const response = await api.getChatMessages(activeConversation.id);
        console.log('🔄 Polling - Backend returned:', response?.length, 'messages, Local has:', messages.length);

        if (response && response.length > messages.length) {
          console.log('📨 New messages detected via polling');

          // Backend returns messages in DESC order, reverse to show oldest first
          const reversedMessages = [...response].reverse().map(msg => {
            // Convert attachments array to media format
            if (msg.attachments && msg.attachments.length > 0) {
              const attachment = msg.attachments[0];
              return {
                ...msg,
                media: {
                  url: attachment.url,
                  type: attachment.type,
                  name: attachment.name,
                  size: attachment.size
                }
              };
            }
            return msg;
          });

          // Merge with existing messages, avoiding duplicates
          setMessages(prev => {
            console.log('🔍 Polling - Filtering duplicates from', reversedMessages.length, 'messages');

            const newMessages = reversedMessages.filter(newMsg => {
              const isDuplicate = prev.some(existingMsg => {
                const idMatch = existingMsg.id === newMsg.id;
                const contentMatch = existingMsg.content === newMsg.content &&
                                   existingMsg.sender_id === newMsg.sender_id;
                const timeDiff = Math.abs(new Date(existingMsg.created_at) - new Date(newMsg.created_at));

                if (idMatch || (contentMatch && timeDiff < 5000)) {
                  console.log('🔄 Polling - Skipping duplicate:', newMsg.id, newMsg.content.substring(0, 20));
                  return true;
                }
                return false;
              });

              return !isDuplicate;
            });

            if (newMessages.length > 0) {
              console.log(`✅ Polling - Adding ${newMessages.length} new message(s):`, newMessages);
              return [...prev, ...newMessages];
            }

            console.log('ℹ️ Polling - No new messages to add (all were duplicates)');
            return prev;
          });
        }
      } catch (error) {
        console.error('Failed to poll messages:', error);
      }
    }, 3000); // Poll every 3 seconds

    return () => clearInterval(pollInterval);
  }, [activeConversation?.id, messages.length, user]);

  // Debug logging for state changes and automatic deduplication safety net
  useEffect(() => {
    logger.info('📊 STATE UPDATE - conversations', { count: conversations.length, conversations });

    // Safety net: If duplicates detected, auto-deduplicate
    const uniqueIds = new Set(conversations.map(c => c.id));
    if (uniqueIds.size < conversations.length) {
      logger.warn(`⚠️ Duplicate conversations detected! ${conversations.length} total, ${uniqueIds.size} unique. Auto-deduplicating...`);
      setConversations(dedupeConversations(conversations));
    }
  }, [conversations]);

  useEffect(() => {
    logger.info('📊 STATE UPDATE - activeConversation', { activeConversation });
  }, [activeConversation]);

  useEffect(() => {
    logger.info('📊 STATE UPDATE - currentView', { currentView });
  }, [currentView]);

  useEffect(() => {
    logger.info('📊 STATE UPDATE - messages', { count: messages.length, messages });
  }, [messages]);

  useEffect(() => {
    logger.info('📊 STATE UPDATE - selectedConversationType', { selectedConversationType });
  }, [selectedConversationType]);

  // Handle error context from Contact Support navigation - check sessionStorage immediately
  useEffect(() => {
    logger.info('🔍 Checking for support chat request...');

    // Check sessionStorage immediately - don't wait for URL params
    const createChat = sessionStorage.getItem('createSupportChat');
    const storedErrorContext = sessionStorage.getItem('supportErrorContext');
    const alreadyCreated = sessionStorage.getItem('supportChatCreated');

    logger.info('Support chat flags', {
      createSupportChat: createChat,
      hasContext: !!storedErrorContext,
      alreadyCreated: alreadyCreated,
      hasUser: !!user,
      loading: loading
    });

    if (createChat === 'true' && storedErrorContext && user && alreadyCreated !== 'true') {
      logger.info('✅ Support chat request detected! Creating chat now...');

      try {
        const parsedErrorContext = JSON.parse(storedErrorContext);
        logger.info('Parsed error context', { parsedErrorContext });
        setErrorContext(parsedErrorContext);

        // Mark as created to prevent duplicate creation
        sessionStorage.setItem('supportChatCreated', 'true');

        logger.info('🚀 Calling createSupportConversationWithError...');
        createSupportConversationWithError(parsedErrorContext);

        // Clear flags after a delay to ensure the init effect doesn't run in normal mode
        setTimeout(() => {
          sessionStorage.removeItem('supportErrorContext');
          sessionStorage.removeItem('createSupportChat');
          sessionStorage.removeItem('supportChatCreated');
          logger.info('Cleared support chat flags from sessionStorage');
        }, 2000);

      } catch (error) {
        logger.error('Failed to parse error context', { error: error.message });
        sessionStorage.removeItem('supportErrorContext');
        sessionStorage.removeItem('createSupportChat');
        sessionStorage.removeItem('supportChatCreated');
      }
    } else {
      logger.info('Support chat conditions not met', {
        hasFlag: createChat === 'true',
        hasContext: !!storedErrorContext,
        hasUser: !!user,
        notAlreadyCreated: alreadyCreated !== 'true'
      });
    }
  }, [user]);

  // Handle product context from Contact Seller navigation
  useEffect(() => {
    logger.info('🔍 Checking for seller chat request...');

    const createChat = sessionStorage.getItem('createSellerChat');
    const storedProductContext = sessionStorage.getItem('productContext');

    logger.info('Seller chat flags', {
      createSellerChat: createChat,
      hasContext: !!storedProductContext,
      hasUser: !!user,
      loading: loading
    });

    if (createChat === 'true' && storedProductContext && user) {
      logger.info('✅ Seller chat request detected! Creating chat now...');

      try {
        const parsedProductContext = JSON.parse(storedProductContext);
        logger.info('Parsed product context', parsedProductContext);

        // Clear flags IMMEDIATELY to allow future clicks
        sessionStorage.removeItem('productContext');
        sessionStorage.removeItem('createSellerChat');
        sessionStorage.removeItem('sellerChatCreated');
        logger.info('Cleared seller chat flags from sessionStorage');

        logger.info('🚀 Creating seller conversation with product context...');
        createSellerConversationWithProduct(parsedProductContext);

      } catch (error) {
        logger.error('Failed to parse product context', { error: error.message });
        sessionStorage.removeItem('productContext');
        sessionStorage.removeItem('createSellerChat');
        sessionStorage.removeItem('sellerChatCreated');
      }
    } else {
      logger.info('Seller chat conditions not met', {
        hasFlag: createChat === 'true',
        hasContext: !!storedProductContext,
        hasUser: !!user
      });
    }
  }, [user]);

  // Recreate blob URLs for media and voice messages when messages are loaded
  useEffect(() => {
    setMessages(prevMessages => {
      return prevMessages.map(msg => {
        let updatedMsg = { ...msg };

        // Handle media messages
        if (msg.media && msg.media.blob) {
          if (!msg.media.url || msg.media.url.startsWith('blob:')) {
            updatedMsg = {
              ...updatedMsg,
              media: {
                ...msg.media,
                url: URL.createObjectURL(msg.media.blob)
              }
            };
          }
        }

        // Handle voice messages
        if (msg.voice && msg.voice.blob) {
          if (!msg.voice.url || msg.voice.url.startsWith('blob:')) {
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
  }, [messages.length]); // Run when messages array changes

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
    console.log('🔔 handleNewMessage called with:', message);

    // Prevent duplicate messages - check if message already exists
    setMessages(prev => {
      console.log('📋 Current messages count:', prev.length);
      console.log('🔍 Checking for duplicates...');

      const messageExists = prev.some(msg => {
        const idMatch = msg.id === message.id;
        const contentMatch = msg.content === message.content && msg.sender_id === message.sender_id;
        const timeDiff = Math.abs(new Date(msg.created_at) - new Date(message.created_at));

        if (idMatch) {
          console.log('⚠️ Found duplicate by ID:', msg.id);
        }
        if (contentMatch && timeDiff < 5000) {
          console.log('⚠️ Found duplicate by content+sender+time:', {
            content: msg.content,
            sender_id: msg.sender_id,
            timeDiff: timeDiff + 'ms'
          });
        }

        return idMatch || (contentMatch && timeDiff < 5000);
      });

      if (messageExists) {
        console.log('❌ Message already exists, skipping duplicate:', message.id);
        return prev;
      }

      console.log('✅ Adding new message from WebSocket:', message.id);
      return [...prev, message];
    });

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
      const apiConversations = response || [];

      // Load saved support chats from IndexedDB
      let supportConversations = [];
      if (user) {
        try {
          supportConversations = await chatStorage.getUserConversations(user.id);
          console.log(`📂 Loaded ${supportConversations.length} saved support chats from IndexedDB`);
        } catch (error) {
          console.error('Failed to load support chats from IndexedDB:', error);
        }
      }

      // Merge API conversations with support chats (support chats first) and deduplicate
      const mergedConversations = [...supportConversations, ...apiConversations];
      const dedupedConversations = dedupeConversations(mergedConversations);
      setConversations(dedupedConversations);

      console.log(`💬 Total conversations: ${dedupedConversations.length} (${supportConversations.length} support + ${apiConversations.length} API, after deduplication)`);
    } catch (error) {
      console.error('Failed to load conversations:', error);

      // Even if API fails, still load support chats from IndexedDB
      if (user) {
        try {
          const supportConversations = await chatStorage.getUserConversations(user.id);
          setConversations(supportConversations);
          console.log(`📂 Loaded ${supportConversations.length} support chats (API failed)`);
        } catch (dbError) {
          console.error('Failed to load from IndexedDB:', dbError);
          setConversations([]);
        }
      } else {
        setConversations([]);
      }
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
      // Check if support conversation already exists in IndexedDB
      let supportConversation = null;

      try {
        const allChats = await chatStorage.getUserConversations(user.id);
        supportConversation = allChats.find(conv =>
          conv.type === 'customer_support' && conv.title?.includes('IziShop Customer Support')
        );
        console.log('🔍 Found existing support conversation in IndexedDB:', supportConversation);
      } catch (error) {
        console.log('⚠️ Failed to check IndexedDB for existing support chat:', error);
      }

      // Also check in current state as fallback
      if (!supportConversation) {
        supportConversation = conversations.find(conv =>
          conv.type === 'customer_support' && conv.title?.includes('IziShop Customer Support')
        );
        console.log('🔍 Found existing support conversation in state:', supportConversation);
      }

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
        console.log('📝 Adding to conversations array...');

        // Store conversation in sessionStorage for persistence across re-mounts
        sessionStorage.setItem('supportConversationData', JSON.stringify(supportConversation));

        setConversations(prev => {
          const newConversations = [supportConversation, ...prev];
          const dedupedConversations = dedupeConversations(newConversations);
          console.log('📝 New conversations array length:', dedupedConversations.length);
          console.log('📝 New conversations:', dedupedConversations);
          return dedupedConversations;
        });
      }

      // If conversation already exists, load its messages and add the new error message
      let allMessages = [];

      if (supportConversation.id.startsWith('support-') && supportConversation.userId) {
        // Existing conversation - load messages and append new error
        console.log('📂 Loading existing messages for support chat:', supportConversation.id);

        try {
          const existingMessages = await chatStorage.getConversationMessages(supportConversation.id);
          console.log(`📬 Loaded ${existingMessages.length} existing messages`);

          const userErrorMessage = {
            id: `msg-${Date.now()}`,
            content: errorContext.prefilledMessage,
            sender_id: user?.id,
            created_at: new Date().toISOString(),
            status: 'delivered',
            error_context: errorContext
          };

          const supportResponseMessage = {
            id: `msg-${Date.now() + 1}`,
            content: `I can see the issue you're experiencing${errorContext.orderId ? ` with order #${errorContext.orderId}` : ' with order management'}. Let me check this for you and provide a solution. This type of ${errorContext.errorType?.replace('_', ' ')} can usually be resolved quickly.`,
            sender_id: 'support-bot',
            created_at: new Date(Date.now() + 1000).toISOString(),
            status: 'delivered',
            is_bot_message: true
          };

          allMessages = [...existingMessages, userErrorMessage, supportResponseMessage];
          console.log('💬 Appended new error message to existing conversation');
        } catch (error) {
          console.error('Failed to load existing messages:', error);
          // Fallback: just create new messages
          allMessages = [
            {
              id: `msg-${Date.now()}`,
              content: errorContext.prefilledMessage,
              sender_id: user?.id,
              created_at: new Date().toISOString(),
              status: 'delivered',
              error_context: errorContext
            }
          ];
        }
      } else {
        // New conversation - create welcome messages
        console.log('📝 Creating initial messages for new support chat');

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

        allMessages = [supportWelcomeMessage, userErrorMessage, supportResponseMessage];
      }

      // Update conversation's last message
      supportConversation.last_message = {
        content: allMessages[allMessages.length - 1].content,
        created_at: allMessages[allMessages.length - 1].created_at,
        is_bot_message: allMessages[allMessages.length - 1].is_bot_message
      };
      supportConversation.last_message_at = allMessages[allMessages.length - 1].created_at;

      console.log('💬 Final messages:', allMessages);

      // Store conversation, messages and view state in sessionStorage BEFORE state updates
      sessionStorage.setItem('supportConversationData', JSON.stringify(supportConversation));
      sessionStorage.setItem('supportMessagesData', JSON.stringify(allMessages));
      sessionStorage.setItem('supportActiveView', 'chat');

      setMessages(allMessages);
      setActiveConversation(supportConversation);
      setCurrentView('chat');

      // Add conversation to the list (or move to top if already exists)
      setConversations(prev => {
        const filtered = prev.filter(c => c.id !== supportConversation.id);
        return [supportConversation, ...filtered];
      });

      // Auto-switch to support filter
      setSelectedConversationType('support');

      // Save to IndexedDB for persistence
      saveSupportChatToIndexedDB(supportConversation, allMessages);

      console.log('✅ Support conversation with error context created successfully!');
      console.log('🔍 Final state - activeConversation:', supportConversation);
      console.log('🔍 Final state - currentView:', 'chat');
      console.log('🔍 Final state - messages count:', 3);
      console.log('🔍 Final state - conversations count:', conversations.length + 1);

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

  // Create seller conversation with product context
  const createSellerConversationWithProduct = async (productContext) => {
    console.log('🚀 createSellerConversationWithProduct called with:', productContext);

    try {
      // Clear old sessionStorage data to prevent caching issues
      sessionStorage.removeItem('sellerConversationData');
      sessionStorage.removeItem('sellerMessagesData');
      sessionStorage.removeItem('sellerActiveView');

      const sellerId = productContext.product?.seller_id;
      const sellerName = productContext.product?.seller_name || 'Seller';

      // Check if conversation with this seller already exists
      let sellerConversation = null;

      try {
        const allChats = await chatStorage.getUserConversations(user.id);
        sellerConversation = allChats.find(conv =>
          conv.type === 'shop' && conv.title?.includes(sellerName)
        );
        console.log('🔍 Found existing seller conversation in IndexedDB:', sellerConversation);
      } catch (error) {
        console.log('⚠️ Failed to check IndexedDB for existing seller chat:', error);
      }

      // Also check in current state as fallback
      if (!sellerConversation) {
        sellerConversation = conversations.find(conv =>
          conv.type === 'shop' && conv.title?.includes(sellerName)
        );
        console.log('🔍 Found existing seller conversation in state:', sellerConversation);
      }

      // Always call backend API to create/update conversation with new product message
      console.log('📝 Creating/updating seller conversation in backend...');

      try {
        const response = await api.createDirectConversation(
          sellerId,
          productContext.prefilledMessage
        );

        console.log('✅ Backend conversation created/updated:', response);

        // Use the backend-created/updated conversation
        sellerConversation = response;

        // Update existing conversation in list or add new one (with deduplication)
        setConversations(prev => {
          const existingIndex = prev.findIndex(c => c.id === sellerConversation.id);
          let updated;
          if (existingIndex >= 0) {
            // Update existing conversation (move to top and update data)
            updated = [...prev];
            updated.splice(existingIndex, 1);
            updated = [sellerConversation, ...updated];
          } else {
            // Add new conversation
            updated = [sellerConversation, ...prev];
          }
          // Always dedupe to prevent duplicates from any source
          return dedupeConversations(updated);
        });
      } catch (error) {
        console.error('❌ Failed to create/update conversation in backend:', error);

        // Fallback: create local conversation if backend fails
        if (!sellerConversation) {
          sellerConversation = {
            id: `seller-${sellerId}-${Date.now()}`,
            title: sellerName,
            type: 'shop',
            last_message: {
              content: productContext.prefilledMessage,
              created_at: new Date().toISOString()
            },
            last_message_at: new Date().toISOString(),
            unread_count: 0,
            avatar: productContext.product?.image || '/assets/images/default-shop.png',
            seller_id: sellerId,
            participants: [
              { id: sellerId, name: sellerName, is_online: false }
            ]
          };

          setConversations(prev => [sellerConversation, ...prev]);
        }
      }

      console.log('📝 Final seller conversation:', sellerConversation);

      // Store conversation in sessionStorage
      sessionStorage.setItem('sellerConversationData', JSON.stringify(sellerConversation));

      // Fetch all messages from backend
      let allMessages = [];

      try {
        // Fetch messages from backend API
        console.log('📥 Fetching messages from backend for conversation:', sellerConversation.id);
        const messagesResponse = await api.getChatMessages(sellerConversation.id);

        console.log('📦 Raw messages from backend:', messagesResponse);
        console.log('📊 Message count:', messagesResponse.length);
        console.log('🕐 Message timestamps:', messagesResponse.map(m => ({ content: m.content.substring(0, 30), time: m.created_at })));

        // Backend returns messages in DESC order (newest first), reverse to show oldest first
        const reversedMessages = [...messagesResponse].reverse();

        // Add product context to the latest message (the one we just sent)
        allMessages = reversedMessages.map((msg, index) => {
          if (index === reversedMessages.length - 1) {
            // Latest message - add product context
            return { ...msg, product_context: productContext };
          }
          return msg;
        });

        console.log(`💬 Loaded ${allMessages.length} messages from backend (oldest to newest)`);
        console.log('📝 All messages to display:', allMessages.map(m => ({ content: m.content.substring(0, 30), time: m.created_at })));
      } catch (error) {
        console.error('❌ Failed to load messages from backend:', error);
        console.error('Error details:', error.message, error.stack);

        // Fallback: Use last_message from conversation response
        if (sellerConversation.last_message && sellerConversation.last_message.content) {
          console.log('⚠️ Falling back to last_message from conversation');
          allMessages = [
            {
              id: sellerConversation.last_message.id || `msg-${Date.now()}`,
              content: sellerConversation.last_message.content,
              sender_id: sellerConversation.last_message.sender_id || user?.id,
              sender_name: sellerConversation.last_message.sender_name,
              created_at: sellerConversation.last_message.created_at,
              status: 'sent',
              is_bot_message: sellerConversation.last_message.is_bot_message || false,
              product_context: productContext
            }
          ];
        }
      }

      // Update conversation's last message only if we have messages
      if (allMessages.length > 0) {
        sellerConversation.last_message = {
          content: allMessages[allMessages.length - 1].content,
          created_at: allMessages[allMessages.length - 1].created_at
        };
        sellerConversation.last_message_at = allMessages[allMessages.length - 1].created_at;
      }

      console.log('💬 Final messages:', allMessages);

      // DON'T store in sessionStorage - always fetch fresh from backend
      // This ensures we always see the latest messages

      // Conversation already added to state at line 832, no need to merge again
      // Just save to IndexedDB for persistence
      console.log('💾 Saving conversation to IndexedDB');

      // Save to IndexedDB for persistence (do this BEFORE setting state)
      await chatStorage.saveConversation(user.id, sellerConversation);
      await chatStorage.saveMessages(sellerConversation.id, allMessages);

      // Backend conversation already created at line 821 - no need to create again
      console.log('✅ Backend conversation already created earlier in this function');

      console.log('✅ Seller conversation with product context created successfully!');
      console.log('🔍 Final state - activeConversation:', sellerConversation);
      console.log('🔍 Final state - currentView:', 'chat');
      console.log('🔍 Final state - messages count:', allMessages.length);

      // Set all UI state at the very end, after all async operations complete
      // This ensures React batches them together and nothing interferes
      console.log('🎯 Setting final UI state to open chat...');
      console.log('   - Messages:', allMessages.length);
      console.log('   - Active conversation ID:', sellerConversation.id);
      console.log('   - Current view:', 'chat');

      setMessages(allMessages);
      setActiveConversation(sellerConversation);
      setSelectedConversationType('all');
      setCurrentView('chat');

      console.log('✅ UI state set - chat should now be visible');

      // Verify state was actually set
      setTimeout(() => {
        console.log('🔍 Verifying state after 100ms...');
        console.log('   - activeConversation is set:', !!sellerConversation);
        console.log('   - currentView should be chat');
      }, 100);

    } catch (error) {
      console.error('❌ Failed to create seller conversation:', error);
    }
  };

  const loadMessages = async (conversationId) => {
    try {
      const response = await api.getChatMessages(conversationId);
      // Backend returns messages in DESC order (newest first), reverse to show oldest first
      const reversedMessages = response ? [...response].reverse().map(msg => {
        // Convert attachments array to media format
        if (msg.attachments && msg.attachments.length > 0) {
          const attachment = msg.attachments[0];
          return {
            ...msg,
            media: {
              url: attachment.url,
              type: attachment.type,
              name: attachment.name,
              size: attachment.size
            }
          };
        }
        return msg;
      }) : [];

      setMessages(reversedMessages);

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

  // Validate file integrity using magic numbers and browser APIs
  const validateFileIntegrity = async (file) => {
    return new Promise((resolve) => {
      // For images, use Image loading to validate
      if (file.type.startsWith('image/')) {
        const img = new Image();
        const url = URL.createObjectURL(file);

        img.onload = () => {
          URL.revokeObjectURL(url);
          // Check if image has valid dimensions
          if (img.width > 0 && img.height > 0) {
            resolve(true);
          } else {
            resolve(false);
          }
        };

        img.onerror = () => {
          URL.revokeObjectURL(url);
          resolve(false);
        };

        // Timeout after 5 seconds
        setTimeout(() => {
          URL.revokeObjectURL(url);
          resolve(false);
        }, 5000);

        img.src = url;
      }
      // For videos, use video element to validate
      else if (file.type.startsWith('video/')) {
        const video = document.createElement('video');
        const url = URL.createObjectURL(file);

        video.onloadedmetadata = () => {
          URL.revokeObjectURL(url);
          // Check if video has valid duration and dimensions
          if (video.duration > 0 && video.videoWidth > 0 && video.videoHeight > 0) {
            resolve(true);
          } else {
            resolve(false);
          }
        };

        video.onerror = () => {
          URL.revokeObjectURL(url);
          resolve(false);
        };

        // Timeout after 5 seconds
        setTimeout(() => {
          URL.revokeObjectURL(url);
          resolve(false);
        }, 5000);

        video.src = url;
        video.preload = 'metadata';
      } else {
        resolve(false);
      }
    });
  };

  // Handle media file selection with comprehensive validation
  const handleMediaSelect = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      // 1. Validate file type using MIME type (prevents basic file extension spoofing)
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm'];
      if (!validTypes.includes(file.type)) {
        alert('❌ Invalid file type. Please select an image (JPEG, PNG, GIF, WebP) or video (MP4, WebM) file.');
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }

      // 2. Validate file size (max 50MB - WhatsApp uses 16MB, we're being generous)
      const maxSize = 50 * 1024 * 1024; // 50MB
      if (file.size > maxSize) {
        alert(`❌ File size (${(file.size / 1024 / 1024).toFixed(2)}MB) exceeds the 50MB limit. Please choose a smaller file.`);
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }

      // 3. Check if file is corrupted by validating it can be loaded
      const isValid = await validateFileIntegrity(file);
      if (!isValid) {
        alert('❌ The selected file appears to be corrupted or invalid. Please try a different file.');
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }

      // 4. Check available storage space before proceeding
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        try {
          const estimate = await navigator.storage.estimate();
          const availableSpace = estimate.quota - estimate.usage;
          const requiredSpace = file.size * 1.5; // Buffer for overhead

          if (availableSpace < requiredSpace) {
            alert(`❌ Insufficient storage space. Available: ${(availableSpace / 1024 / 1024).toFixed(2)}MB, Required: ${(requiredSpace / 1024 / 1024).toFixed(2)}MB. Please free up space and try again.`);
            if (fileInputRef.current) fileInputRef.current.value = '';
            return;
          }

          console.log('💾 Storage check passed:', {
            available: `${(availableSpace / 1024 / 1024).toFixed(2)}MB`,
            required: `${(requiredSpace / 1024 / 1024).toFixed(2)}MB`,
            quota: `${(estimate.quota / 1024 / 1024).toFixed(2)}MB`,
            usage: `${(estimate.usage / 1024 / 1024).toFixed(2)}MB`
          });
        } catch (storageError) {
          console.warn('⚠️ Could not check storage quota:', storageError);
          // Continue anyway - browser will throw QuotaExceededError if needed
        }
      }

      setSelectedMedia(file);

      // 5. Create preview URL (will be revoked when cancelled or sent)
      const previewUrl = URL.createObjectURL(file);
      setMediaPreview(previewUrl);

      console.log('📎 Media selected and validated:', {
        name: file.name,
        type: file.type,
        size: `${(file.size / 1024 / 1024).toFixed(2)}MB`
      });

    } catch (error) {
      console.error('❌ Error selecting media:', error);
      alert(`❌ Failed to select media: ${error.message}`);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Cancel media selection
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

  // Send media message with comprehensive error handling
  const sendMediaMessage = async (retryCount = 0) => {
    if (!selectedMedia || !activeConversation) return;

    const messageId = `msg-${Date.now()}`;
    const MAX_RETRIES = 3;

    try {
      console.log('📤 Uploading media file to server...');

      // Upload file to server first
      const uploadResponse = await api.uploadChatMedia(selectedMedia);
      console.log('✅ Media uploaded:', uploadResponse);

      const mediaType = selectedMedia.type.startsWith('image/') ? 'image' : 'video';
      const captionText = newMessage.trim();

      // Construct full URL from relative path
      const mediaUrl = uploadResponse.url.startsWith('http')
        ? uploadResponse.url
        : `${api.baseURL}${uploadResponse.url}`;

      console.log('🔗 Media URL constructed:', mediaUrl);
      console.log('📦 Upload response:', uploadResponse);

      // Create message with uploaded media URL
      const mediaMessage = {
        id: messageId,
        content: captionText || '', // Optional caption
        sender_id: user?.id,
        created_at: new Date().toISOString(),
        status: 'sending',
        is_bot_message: false,
        media: {
          type: mediaType,
          name: uploadResponse.filename,
          size: uploadResponse.size,
          url: mediaUrl // Full server URL
        }
      };

      // Add message to state immediately
      setMessages(prev => [...prev, mediaMessage]);
      setNewMessage('');

      // Cancel selection (revoke preview URL)
      cancelMediaSelection();

      // Send via WebSocket if available
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          type: 'send_message',
          conversation_id: activeConversation.id,
          content: captionText || `📷 ${mediaType}`,
          message_type: mediaType,
          media_url: mediaUrl,
          media_type: mediaType,
          media_name: uploadResponse.filename,
          media_size: uploadResponse.size
        }));
        console.log('📤 Media message sent via WebSocket with URL:', mediaUrl);
      }

      // Simulate status progression
      setTimeout(() => {
        setMessages(prev =>
          prev.map(msg => msg.id === messageId ? { ...msg, status: 'sent' } : msg)
        );

        setTimeout(async () => {
          try {
            // Attempt to save to IndexedDB with quota error handling
            const updatedMessages = messages.concat([{ ...mediaMessage, status: 'delivered' }]);

            if (activeConversation?.type === 'customer_support') {
              const updatedConversation = {
                ...activeConversation,
                last_message: {
                  content: captionText || `📷 ${mediaMessage.media.type}`,
                  created_at: mediaMessage.created_at
                },
                last_message_at: mediaMessage.created_at
              };

              try {
                // Try to save to IndexedDB
                await saveSupportChatToIndexedDB(updatedConversation, updatedMessages);

                // Update state on success
                setMessages(prev =>
                  prev.map(msg => msg.id === messageId ? { ...msg, status: 'delivered' } : msg)
                );

                sessionStorage.setItem('supportMessagesData', JSON.stringify(updatedMessages));
                sessionStorage.setItem('supportConversationData', JSON.stringify(updatedConversation));

                console.log('✅ Media message saved to IndexedDB');

              } catch (dbError) {
                console.error('❌ IndexedDB save failed:', dbError);

                // Check if it's a quota error
                if (dbError.name === 'QuotaExceededError' ||
                    (dbError.message && dbError.message.includes('quota'))) {

                  console.warn('⚠️ Storage quota exceeded! Attempting cleanup...');

                  // Try to free up space by clearing old messages
                  try {
                    const stats = await chatStorage.getStorageStats();
                    console.log('📊 Current storage:', stats);

                    // Alert user about storage issue
                    alert(`⚠️ Storage quota exceeded! You have ${stats.messages} messages stored. Please clear old conversations to free up space.`);

                    // Mark message as failed
                    setMessages(prev =>
                      prev.map(msg => msg.id === messageId ? { ...msg, status: 'failed', error: 'Storage full' } : msg)
                    );

                  } catch (cleanupError) {
                    console.error('Failed to check storage stats:', cleanupError);
                  }

                } else if (retryCount < MAX_RETRIES) {
                  // Retry on other errors
                  console.log(`🔄 Retrying... (${retryCount + 1}/${MAX_RETRIES})`);
                  setTimeout(() => {
                    sendMediaMessage(retryCount + 1);
                  }, 1000 * (retryCount + 1)); // Exponential backoff

                } else {
                  // Max retries exceeded
                  console.error('❌ Failed to save after max retries');
                  alert('Failed to send media message. Please check your connection and try again.');

                  setMessages(prev =>
                    prev.map(msg => msg.id === messageId ? { ...msg, status: 'failed', error: 'Save failed' } : msg)
                  );
                }
              }
            }

          } catch (error) {
            console.error('❌ Error in message delivery:', error);
            setMessages(prev =>
              prev.map(msg => msg.id === messageId ? { ...msg, status: 'failed', error: error.message } : msg)
            );
          }
        }, 500);
      }, 300);

      console.log('📤 Media message sending:', mediaMessage);

    } catch (error) {
      console.error('❌ Failed to send media message:', error);
      alert(`Failed to send media: ${error.message}`);

      // Mark as failed in UI
      setMessages(prev =>
        prev.map(msg => msg.id === messageId ? { ...msg, status: 'failed', error: error.message } : msg)
      );
    }
  };

  // Start voice recording with comprehensive error handling
  const startVoiceRecording = async () => {
    try {
      // Request microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Determine best audio format based on browser
      let mimeType = 'audio/webm;codecs=opus'; // Default: WebM Opus (best quality, wide support)

      // Fallback for Safari/iOS
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'audio/mp4'; // Safari iOS 17+ supports this
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = 'audio/webm'; // Try without codec specification
          if (!MediaRecorder.isTypeSupported(mimeType)) {
            mimeType = ''; // Let browser choose
          }
        }
      }

      // Create MediaRecorder instance
      const mediaRecorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      // Handle data available event
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
          console.log('🎤 Audio chunk recorded:', event.data.size, 'bytes');
        }
      };

      // Handle recording stop
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType || 'audio/webm' });
        setAudioBlob(audioBlob);

        // Stop all tracks to release microphone
        stream.getTracks().forEach(track => track.stop());

        console.log('🎤 Recording stopped. Total size:', audioBlob.size, 'bytes');
      };

      // Handle errors
      mediaRecorder.onerror = (event) => {
        console.error('❌ MediaRecorder error:', event.error);
        alert(`Recording error: ${event.error.name}`);
        stopVoiceRecording();
      };

      // Start recording
      mediaRecorder.start(100); // Collect data every 100ms
      setIsRecording(true);
      setRecordingDuration(0);

      // Start duration timer
      recordingIntervalRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);

      console.log('🎤 Voice recording started with format:', mimeType || 'auto');

    } catch (error) {
      console.error('❌ Failed to start recording:', error);

      // Handle specific errors
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        alert('❌ Microphone permission denied. Please allow microphone access to record voice messages.');
      } else if (error.name === 'NotFoundError') {
        alert('❌ No microphone found. Please connect a microphone and try again.');
      } else if (error.name === 'NotReadableError') {
        alert('❌ Microphone is already in use by another application.');
      } else {
        alert(`❌ Failed to start recording: ${error.message}`);
      }
    }
  };

  // Stop voice recording
  const stopVoiceRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }

    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current);
      recordingIntervalRef.current = null;
    }

    setIsRecording(false);
  };

  // Cancel voice recording
  const cancelVoiceRecording = () => {
    stopVoiceRecording();
    setAudioBlob(null);
    setRecordingDuration(0);
    audioChunksRef.current = [];
  };

  // Send voice message
  const sendVoiceMessage = async () => {
    if (!audioBlob || !activeConversation) return;

    const messageId = `msg-${Date.now()}`;

    try {
      // Create voice message URL
      const voiceUrl = URL.createObjectURL(audioBlob);

      // Create voice message
      const voiceMessage = {
        id: messageId,
        content: '', // Voice messages don't have text content
        sender_id: user?.id,
        created_at: new Date().toISOString(),
        status: 'sending',
        is_bot_message: false,
        voice: {
          duration: recordingDuration,
          size: audioBlob.size,
          mimeType: audioBlob.type,
          blob: audioBlob,
          url: voiceUrl
        }
      };

      // Add message to state immediately
      setMessages(prev => [...prev, voiceMessage]);

      // Reset voice recording state
      setAudioBlob(null);
      setRecordingDuration(0);

      // Simulate status progression
      setTimeout(() => {
        setMessages(prev =>
          prev.map(msg => msg.id === messageId ? { ...msg, status: 'sent' } : msg)
        );

        setTimeout(() => {
          setMessages(prev => {
            const updatedMessages = prev.map(msg =>
              msg.id === messageId ? { ...msg, status: 'delivered' } : msg
            );

            // Save to IndexedDB
            if (activeConversation?.type === 'customer_support') {
              const updatedConversation = {
                ...activeConversation,
                last_message: {
                  content: `🎤 Voice message (${recordingDuration}s)`,
                  created_at: voiceMessage.created_at
                },
                last_message_at: voiceMessage.created_at
              };

              sessionStorage.setItem('supportMessagesData', JSON.stringify(updatedMessages));
              sessionStorage.setItem('supportConversationData', JSON.stringify(updatedConversation));
              saveSupportChatToIndexedDB(updatedConversation, updatedMessages);
            }

            return updatedMessages;
          });
        }, 500);
      }, 300);

      console.log('🎤 Voice message sent:', voiceMessage);
    } catch (error) {
      console.error('❌ Failed to send voice message:', error);
      alert(`Failed to send voice message: ${error.message}`);
    }
  };

  // Delete conversation
  const deleteConversation = async (conversation) => {
    try {
      // Remove from conversations list
      setConversations(prev => prev.filter(c => c.id !== conversation.id));

      // Clear active conversation if it's the one being deleted
      if (activeConversation?.id === conversation.id) {
        setActiveConversation(null);
        setMessages([]);
        setCurrentView('conversations');
      }

      // Remove from IndexedDB
      if (conversation.type === 'customer_support') {
        await chatStorage.deleteSupportChat();
        sessionStorage.removeItem('supportMessagesData');
        sessionStorage.removeItem('supportConversationData');
      } else {
        await chatStorage.deleteConversation(conversation.id);
      }

      console.log('✅ Conversation deleted:', conversation.id);
    } catch (error) {
      console.error('❌ Failed to delete conversation:', error);
      // Don't show alert since deletion from UI succeeded
    }
  };

  // Archive conversation
  const archiveConversation = (conversation) => {
    // Remove from active conversations and add to archived
    setConversations(prev => prev.filter(c => c.id !== conversation.id));
    setArchivedConversations(prev => [...prev, { ...conversation, archived: true }]);

    // Clear active conversation if it's the one being archived
    if (activeConversation?.id === conversation.id) {
      setActiveConversation(null);
      setMessages([]);
      setCurrentView('conversations');
    }

    console.log('📦 Conversation archived:', conversation.id);
    alert('Chat archived successfully!');
  };

  // Unarchive conversation
  const unarchiveConversation = (conversation) => {
    // Remove from archived and add back to active conversations
    setArchivedConversations(prev => prev.filter(c => c.id !== conversation.id));
    setConversations(prev => [...prev, { ...conversation, archived: false }]);

    console.log('📂 Conversation unarchived:', conversation.id);
    alert('Chat unarchived successfully!');
  };

  // Mute/Unmute conversation
  const toggleMuteConversation = (conversation) => {
    setConversations(prev =>
      prev.map(c =>
        c.id === conversation.id
          ? { ...c, muted: !c.muted }
          : c
      )
    );
    console.log(conversation.muted ? '🔔 Unmuted:' : '🔕 Muted:', conversation.id);
    alert(conversation.muted ? 'Notifications unmuted!' : 'Notifications muted!');
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !activeConversation) return;

    const messageContent = newMessage.trim();
    setNewMessage('');

    try {
      // Create local message for immediate display with 'sending' status
      const localMessage = {
        id: `msg-${Date.now()}`,
        content: messageContent,
        sender_id: user?.id,
        created_at: new Date().toISOString(),
        status: 'sending',
        is_bot_message: false
      };

      // Add message to local state immediately
      setMessages(prev => [...prev, localMessage]);

      // Simulate status progression: sending -> sent -> delivered
      setTimeout(() => {
        setMessages(prev =>
          prev.map(msg => msg.id === localMessage.id ? { ...msg, status: 'sent' } : msg)
        );

        // After 500ms, mark as delivered
        setTimeout(() => {
          setMessages(prev => {
            const updatedMessages = prev.map(msg =>
              msg.id === localMessage.id ? { ...msg, status: 'delivered' } : msg
            );

            // Save to IndexedDB AFTER status is updated to delivered
            if (activeConversation?.type === 'customer_support') {
              const updatedConversation = {
                ...activeConversation,
                last_message: {
                  content: messageContent,
                  created_at: localMessage.created_at
                },
                last_message_at: localMessage.created_at
              };

              sessionStorage.setItem('supportMessagesData', JSON.stringify(updatedMessages));
              sessionStorage.setItem('supportConversationData', JSON.stringify(updatedConversation));

              // Persist to IndexedDB with final delivered status
              saveSupportChatToIndexedDB(updatedConversation, updatedMessages);
            }

            return updatedMessages;
          });
        }, 500);
      }, 300);

      // Update conversation's last message
      if (activeConversation.type === 'customer_support' || activeConversation.type === 'shop') {
        const updatedConversation = {
          ...activeConversation,
          last_message: {
            content: messageContent,
            created_at: localMessage.created_at
          },
          last_message_at: localMessage.created_at
        };

        setActiveConversation(updatedConversation);

        // Update conversations list
        setConversations(prev =>
          prev.map(conv => conv.id === activeConversation.id ? updatedConversation : conv)
        );

        // Save seller chat to IndexedDB
        if (activeConversation.type === 'shop') {
          await chatStorage.saveConversation(user.id, updatedConversation);
          const currentMessages = [...messages, localMessage];
          await chatStorage.saveMessages(activeConversation.id, currentMessages);
        }
      }

      // Send to backend API for seller/shop chats
      if (activeConversation.type === 'shop' && activeConversation.seller_id) {
        try {
          console.log('📤 Sending message to seller:', {
            conversationId: activeConversation.id,
            sellerId: activeConversation.seller_id,
            message: messageContent
          });

          // For seller chats, we need to send the message to the backend
          // First check if this is a local-only conversation (starts with 'seller-')
          if (activeConversation.id.startsWith('seller-')) {
            // Local conversation - need to create backend conversation and send message
            console.log('🆕 Creating new backend conversation...');
            const response = await api.createDirectConversation(activeConversation.seller_id, messageContent);
            console.log('📥 Backend conversation response:', response);

            // Update the local conversation ID to match backend
            if (response && response.id) {
              const updatedConversation = {
                ...activeConversation,
                id: response.id, // Use backend conversation ID
                backendId: response.id
              };

              setActiveConversation(updatedConversation);
              setConversations(prev =>
                prev.map(conv =>
                  conv.id === activeConversation.id ? updatedConversation : conv
                )
              );

              console.log('✅ Backend conversation created:', response.id);
            }
          } else {
            // Backend conversation exists - send message normally
            await api.sendChatMessage(activeConversation.id, {
              content: messageContent,
              message_type: 'text'
            });
          }
          console.log('✅ Message sent to seller via API');
        } catch (error) {
          console.error('Failed to send message to seller via API:', error);
        }
      }

      // Try to send via WebSocket if available (for regular chats)
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

  // Delete message function
  const deleteMessage = (messageId) => {
    const updatedMessages = messages.filter(msg => msg.id !== messageId);
    setMessages(updatedMessages);

    // Update storage
    if (activeConversation?.type === 'customer_support') {
      sessionStorage.setItem('supportMessagesData', JSON.stringify(updatedMessages));
      saveSupportChatToIndexedDB(activeConversation, updatedMessages);
    }
  };

  // Edit message function
  const editMessage = (messageId, newContent) => {
    setMessages(prev =>
      prev.map(msg =>
        msg.id === messageId
          ? { ...msg, content: newContent, edited: true, edited_at: new Date().toISOString() }
          : msg
      )
    );

    // Update storage
    if (activeConversation?.type === 'customer_support') {
      setTimeout(() => {
        const updatedMessages = messages.map(msg =>
          msg.id === messageId
            ? { ...msg, content: newContent, edited: true, edited_at: new Date().toISOString() }
            : msg
        );
        sessionStorage.setItem('supportMessagesData', JSON.stringify(updatedMessages));
        saveSupportChatToIndexedDB(activeConversation, updatedMessages);
      }, 100);
    }
  };

  // Save support chat to IndexedDB for persistence (WhatsApp/Telegram pattern)
  const saveSupportChatToIndexedDB = async (conversation, messages) => {
    if (!user || !conversation) return;

    try {
      // Save conversation metadata
      await chatStorage.saveConversation(user.id, conversation);

      // Save messages in batch (10-100x faster than individual saves)
      await chatStorage.saveMessages(conversation.id, messages);

      console.log('💾 Support chat saved to IndexedDB');
    } catch (error) {
      console.error('Failed to save support chat to IndexedDB:', error);
    }
  };

  // Load messages for a specific conversation
  const loadConversationMessages = async (conversationId) => {
    // Check if it's a support or seller conversation (stored in IndexedDB)
    if (conversationId.startsWith('support-') || conversationId.startsWith('seller-')) {
      try {
        const messages = await chatStorage.getConversationMessages(conversationId);
        if (messages && messages.length > 0) {
          setMessages(messages);
          console.log(`💬 Loaded ${messages.length} messages from IndexedDB for ${conversationId}`);
          return;
        } else {
          console.log(`⚠️ No messages found in IndexedDB for ${conversationId}`);
        }
      } catch (error) {
        console.error('Failed to load conversation messages from IndexedDB:', error);
      }
    }

    // Fallback to loading from API
    loadMessages(conversationId);
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

    // Use the new function that handles both support chats and API chats
    await loadConversationMessages(conversation.id);

    setConversations(prev => prev.map(conv =>
      conv.id === conversation.id ? { ...conv, unread_count: 0 } : conv
    ));
  };

  const scrollToBottom = (instant = false) => {
    if (instant) {
      // Instant scroll without animation (for initial load)
      messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
    } else {
      // Smooth scroll (for new messages)
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Track if this is the first time loading messages for this conversation
  const previousMessagesLength = useRef(0);
  const previousConversationId = useRef(null);

  useEffect(() => {
    // Reset counter when switching conversations
    if (activeConversation?.id !== previousConversationId.current) {
      previousMessagesLength.current = 0;
      previousConversationId.current = activeConversation?.id;
    }

    // If messages just loaded (went from 0 to any number), scroll instantly
    const isInitialLoad = previousMessagesLength.current === 0 && messages.length > 0;
    scrollToBottom(isInitialLoad);
    previousMessagesLength.current = messages.length;
  }, [messages, activeConversation?.id]);

  const filteredConversations = conversations.filter(conv => {
    const matchesSearch = !searchQuery ||
      conv.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.participants?.some(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesType = selectedConversationType === 'all' ||
      (selectedConversationType === 'direct' && conv.type === 'direct_message') ||
      (selectedConversationType === 'groups' && conv.type === 'group_chat') ||
      (selectedConversationType === 'support' && conv.type === 'customer_support') ||
      (selectedConversationType === 'shop' && conv.type === 'shop');

    return matchesSearch && matchesType;
  });

  if (!isAuthenticated()) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50" data-testid="messages-page">
      <Header />

      <main className="pt-24 lg:pt-28 pb-0">
        <div className="flex h-[calc(100vh-4rem)] lg:h-[calc(100vh-5rem)]">

          {/* Sidebar - Always visible on desktop (WhatsApp style) */}
          <div className={`w-full lg:w-96 bg-white/95 backdrop-blur-xl border-r border-gray-200/50 flex flex-col ${
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

              {/* Conversations View - Show when in conversations view OR when there's an active chat */}
              {(currentView === 'conversations' || currentView === 'chat') && (
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
                          onDelete={deleteConversation}
                          onArchive={archiveConversation}
                          onMute={toggleMuteConversation}
                        />
                      ))
                    )}
                  </div>
                </>
              )}

              {/* Archived Chats View */}
              {currentView === 'archived' && (
                <>
                  <div className="p-4 border-b border-gray-200/50 flex items-center gap-3">
                    <button
                      onClick={() => setCurrentView('conversations')}
                      className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
                    >
                      <ArrowLeft size={20} />
                    </button>
                    <h3 className="font-semibold text-gray-900">Archived Chats</h3>
                  </div>
                  <div className="space-y-1 p-2">
                    {archivedConversations.length === 0 ? (
                      <div className="text-center py-12 text-gray-500">
                        <Archive size={40} className="mx-auto mb-3 opacity-50" />
                        <p className="font-medium">No archived chats</p>
                        <p className="text-sm">Archived conversations will appear here</p>
                      </div>
                    ) : (
                      archivedConversations.map((conversation) => (
                        <ConversationItem
                          key={conversation.id}
                          conversation={conversation}
                          onSelect={selectConversation}
                          isActive={activeConversation?.id === conversation.id}
                          onlineUsers={onlineUsers}
                          onDelete={deleteConversation}
                          onArchive={unarchiveConversation}
                          onMute={toggleMuteConversation}
                          isArchived={true}
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
                    <button
                      onClick={() => setCurrentView('archived')}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <Archive size={18} className="text-gray-600" />
                      <span>Archived Chats</span>
                      {archivedConversations.length > 0 && (
                        <span className="ml-auto text-xs bg-gray-200 px-2 py-1 rounded-full">
                          {archivedConversations.length}
                        </span>
                      )}
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

          {/* Main Chat Area - WhatsApp style split view */}
          <div className={`flex-1 flex flex-col ${
            currentView === 'chat' && activeConversation ? 'flex' : 'hidden lg:flex'
          }`}>
            {activeConversation ? (
              <>
                {/* Chat Header */}
                <ChatHeader
                  conversation={activeConversation}
                  onBack={() => setCurrentView('conversations')}
                  onlineUsers={onlineUsers}
                  onDelete={deleteConversation}
                  onArchive={archiveConversation}
                  onMute={toggleMuteConversation}
                />

                {/* Messages Container */}
                <div className="flex-1 overflow-y-auto bg-gray-50/80 backdrop-blur-sm">
                  <div className="p-6 space-y-4">
                    {messages.map((message) => (
                      <MessageBubble
                        key={message.id}
                        message={message}
                        isOwnMessage={message.sender_id === user?.id}
                        onDelete={deleteMessage}
                        onEdit={editMessage}
                      />
                    ))}

                    {isTyping && (
                      <TypingIndicator />
                    )}

                    <div ref={messagesEndRef} />
                  </div>
                </div>

                {/* Message Input */}
                <MessageInput
                  value={newMessage}
                  onChange={setNewMessage}
                  onSend={sendMessage}
                  onTyping={handleTyping}
                  disabled={!activeConversation}
                  selectedMedia={selectedMedia}
                  mediaPreview={mediaPreview}
                  onMediaSelect={handleMediaSelect}
                  onMediaCancel={cancelMediaSelection}
                  onMediaSend={sendMediaMessage}
                  fileInputRef={fileInputRef}
                  isRecording={isRecording}
                  recordingDuration={recordingDuration}
                  audioBlob={audioBlob}
                  onStartRecording={startVoiceRecording}
                  onStopRecording={stopVoiceRecording}
                  onCancelRecording={cancelVoiceRecording}
                  onSendVoice={sendVoiceMessage}
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
const ConversationItem = ({ conversation, onSelect, isActive, onlineUsers, onDelete, onArchive, onMute, isArchived = false }) => {
  const isOnline = conversation.participants?.some(p => onlineUsers.has(p.id));
  const [showActions, setShowActions] = React.useState(false);
  const [menuPosition, setMenuPosition] = React.useState({ top: 0, right: 0 });
  const buttonRef = React.useRef(null);

  const handleMenuToggle = (e) => {
    e.stopPropagation();
    if (!showActions && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setMenuPosition({
        top: rect.bottom + 4,
        right: window.innerWidth - rect.right
      });
    }
    setShowActions(!showActions);
  };

  return (
    <div
      className={`relative group flex items-center p-3 hover:bg-gray-50/80 backdrop-blur-sm cursor-pointer rounded-xl transition-all duration-200 ${
        isActive ? 'bg-teal-50/80 backdrop-blur-sm border border-teal-200/50' : ''
      }`}
      onContextMenu={(e) => {
        e.preventDefault();
        if (buttonRef.current) {
          const rect = buttonRef.current.getBoundingClientRect();
          setMenuPosition({
            top: rect.bottom + 4,
            right: window.innerWidth - rect.right
          });
        }
        setShowActions(true);
      }}
    >
      <div onClick={() => onSelect(conversation)} className="flex items-center flex-1 min-w-0">
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
            <h4 className="font-medium text-gray-900 truncate flex items-center gap-2">
              {conversation.muted && <Bell size={14} className="text-gray-400" />}
              {conversation.title}
            </h4>
            <span className="text-xs text-gray-500">
              {conversation.last_message_at && parseUTCTimestamp(conversation.last_message_at).toLocaleTimeString('en-US', {
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

      {/* Quick action button (visible on hover) */}
      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          ref={buttonRef}
          onClick={handleMenuToggle}
          className="p-2 hover:bg-gray-200 rounded-lg"
        >
          <MoreVertical size={16} className="text-gray-500" />
        </button>
      </div>

      {/* Actions menu - Using Portal to render at document body level */}
      {showActions && ReactDOM.createPortal(
        <>
          <div
            className="fixed inset-0 z-[9998]"
            onClick={() => setShowActions(false)}
          />
          <div
            className="fixed w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-[9999]"
            style={{ top: `${menuPosition.top}px`, right: `${menuPosition.right}px` }}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                onMute?.(conversation);
                setShowActions(false);
              }}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3"
            >
              <Bell size={14} />
              {conversation.muted ? 'Unmute' : 'Mute'}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onArchive?.(conversation);
                setShowActions(false);
              }}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3"
            >
              <Archive size={14} />
              {isArchived ? 'Unarchive' : 'Archive'}
            </button>
            <hr className="my-1" />
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (confirm('Delete this conversation?')) {
                  onDelete?.(conversation);
                }
                setShowActions(false);
              }}
              className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-3"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
              Delete
            </button>
          </div>
        </>,
        document.body
      )}
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

const ChatHeader = ({ conversation, onBack, onlineUsers, onDelete, onArchive, onMute }) => {
  const isOnline = conversation.participants?.some(p => onlineUsers.has(p.id));
  const [showMenu, setShowMenu] = React.useState(false);
  const [menuPosition, setMenuPosition] = React.useState({ top: 0, right: 0 });
  const buttonRef = React.useRef(null);

  const handleMenuToggle = () => {
    if (!showMenu && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setMenuPosition({
        top: rect.bottom + 4,
        right: window.innerWidth - rect.right
      });
    }
    setShowMenu(!showMenu);
  };

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
        <button
          onClick={() => alert('🎙️ Voice calling feature coming soon!')}
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100/80 backdrop-blur-sm rounded-xl transition-all duration-200"
        >
          <Phone size={18} />
        </button>
        <button
          ref={buttonRef}
          onClick={handleMenuToggle}
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100/80 backdrop-blur-sm rounded-xl transition-all duration-200"
        >
          <MoreVertical size={18} />
        </button>
      </div>

      {/* Dropdown Menu - Using Portal */}
      {showMenu && ReactDOM.createPortal(
        <>
          <div
            className="fixed inset-0 z-[9998]"
            onClick={() => setShowMenu(false)}
          />
          <div
            className="fixed w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-[9999]"
            style={{ top: `${menuPosition.top}px`, right: `${menuPosition.right}px` }}
          >
            <button
              onClick={() => {
                onMute?.(conversation);
                setShowMenu(false);
              }}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3"
            >
              <Bell size={16} />
              {conversation.muted ? 'Unmute' : 'Mute'} Notifications
            </button>
            <button
              onClick={() => {
                onArchive?.(conversation);
                setShowMenu(false);
              }}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3"
            >
              <Archive size={16} />
              Archive Chat
            </button>
            <hr className="my-2" />
            <button
              onClick={() => {
                if (confirm('Are you sure you want to delete this conversation? This action cannot be undone.')) {
                  onDelete?.(conversation);
                  setShowMenu(false);
                }
              }}
              className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-3"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
              Delete Chat
            </button>
          </div>
        </>,
        document.body
      )}
    </div>
  );
};

const MessageBubble = ({ message, isOwnMessage, onDelete, onEdit }) => {
  const [showActions, setShowActions] = React.useState(false);
  const [isEditing, setIsEditing] = React.useState(false);
  const [editedContent, setEditedContent] = React.useState(message.content);

  const formatTime = (timestamp) => {
    return parseUTCTimestamp(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'sending':
        return <Clock size={14} className="text-gray-400" />;
      case 'sent':
        return <Check size={14} className="text-gray-400" />;
      case 'delivered':
        return <CheckCheck size={14} className="text-gray-400" />;
      case 'read':
        return <CheckCheck size={14} className="text-blue-500" />;
      default:
        return <Clock size={14} className="text-gray-400" />;
    }
  };

  const handleEdit = () => {
    if (editedContent.trim() && editedContent !== message.content) {
      onEdit(message.id, editedContent.trim());
      setIsEditing(false);
    } else {
      setIsEditing(false);
      setEditedContent(message.content);
    }
  };

  return (
    <div
      className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} gap-2 group`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {!isOwnMessage && (
        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
          {message.is_bot_message ? (
            <Bot size={16} className="text-teal-600" />
          ) : (
            <User size={16} className="text-gray-600" />
          )}
        </div>
      )}

      <div className={`max-w-xs lg:max-w-md ${isOwnMessage ? 'order-1' : 'order-2'} relative`}>
        {/* Message actions dropdown - disabled for media and voice messages */}
        {isOwnMessage && showActions && !message.is_bot_message && !message.media && !message.voice && (
          <div className="absolute -top-8 right-0 bg-white shadow-lg rounded-lg border border-gray-200 flex gap-1 p-1 z-10">
            <button
              onClick={() => setIsEditing(true)}
              className="px-2 py-1 hover:bg-gray-100 rounded text-xs text-gray-700"
            >
              Edit
            </button>
            <button
              onClick={() => onDelete(message.id)}
              className="px-2 py-1 hover:bg-red-50 rounded text-xs text-red-600"
            >
              Delete
            </button>
          </div>
        )}

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

          {/* Message content - editable or display */}
          {isEditing ? (
            <div className="space-y-2">
              <input
                type="text"
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleEdit();
                  if (e.key === 'Escape') {
                    setIsEditing(false);
                    setEditedContent(message.content);
                  }
                }}
                className="w-full px-2 py-1 bg-white/50 border border-white/30 rounded text-sm focus:outline-none focus:ring-1 focus:ring-white"
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  onClick={handleEdit}
                  className="px-2 py-1 bg-white text-teal-600 rounded text-xs hover:bg-white/90"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setEditedContent(message.content);
                  }}
                  className="px-2 py-1 bg-white/50 text-white rounded text-xs hover:bg-white/40"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Voice message display */}
              {message.voice && (
                <div className="flex items-center gap-3 min-w-[200px]">
                  <button className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <polygon points="5 3 19 12 5 21 5 3"></polygon>
                    </svg>
                  </button>
                  <audio src={message.voice.url} controls className="flex-1" preload="metadata" />
                  <span className="text-xs opacity-70 whitespace-nowrap">
                    {Math.floor(message.voice.duration / 60)}:{(message.voice.duration % 60).toString().padStart(2, '0')}
                  </span>
                </div>
              )}

              {/* Media display (images and videos) */}
              {message.media && (
                <div className="mb-2">
                  {message.media.type === 'image' ? (
                    <img
                      src={message.media.url}
                      alt={message.media.name}
                      className="max-w-full max-h-96 rounded-lg cursor-pointer hover:opacity-95 transition-opacity"
                      loading="lazy"
                      onClick={() => window.open(message.media.url, '_blank')}
                    />
                  ) : message.media.type === 'video' ? (
                    <video
                      src={message.media.url}
                      controls
                      className="max-w-full max-h-96 rounded-lg"
                      preload="metadata"
                    >
                      Your browser does not support video playback.
                    </video>
                  ) : null}
                </div>
              )}

              {/* Text content (caption for media or standalone text) */}
              {message.content && (
                <p className="text-sm whitespace-pre-line break-words">{message.content}</p>
              )}
            </>
          )}
        </div>

        <div className={`flex items-center gap-1 mt-1 text-xs ${
          isOwnMessage ? 'justify-end text-gray-400' : 'justify-start text-gray-500'
        }`}>
          {message.edited && <span className="italic">edited</span>}
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

const MessageInput = ({
  value,
  onChange,
  onSend,
  onTyping,
  disabled,
  selectedMedia,
  mediaPreview,
  onMediaSelect,
  onMediaCancel,
  onMediaSend,
  fileInputRef,
  isRecording,
  recordingDuration,
  audioBlob,
  onStartRecording,
  onStopRecording,
  onCancelRecording,
  onSendVoice
}) => {
  const handleSendClick = () => {
    if (selectedMedia) {
      onMediaSend();
    } else {
      onSend();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendClick();
    }
  };

  return (
    <div className="p-4 border-t border-gray-200/50 bg-white backdrop-blur-sm shadow-lg pb-20 lg:pb-4">
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={onMediaSelect}
        accept="image/jpeg,image/png,image/gif,image/webp,video/mp4,video/webm"
        className="hidden"
      />

      {/* Media preview (shown when media is selected) */}
      {selectedMedia && mediaPreview && (
        <div className="mb-3 relative">
          <div className="relative inline-block max-w-xs rounded-lg overflow-hidden border-2 border-teal-500/50 shadow-lg">
            {selectedMedia.type.startsWith('image/') ? (
              <img
                src={mediaPreview}
                alt="Preview"
                className="max-h-48 rounded-lg"
              />
            ) : (
              <video
                src={mediaPreview}
                className="max-h-48 rounded-lg"
                controls={false}
              />
            )}

            {/* Cancel button overlay */}
            <button
              onClick={onMediaCancel}
              className="absolute top-2 right-2 p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg transition-all duration-200"
              title="Remove media"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          {/* Media info */}
          <div className="mt-2 text-xs text-gray-500">
            {selectedMedia.name} ({(selectedMedia.size / 1024 / 1024).toFixed(2)} MB)
          </div>
        </div>
      )}

      {/* Voice recording UI */}
      {isRecording && (
        <div className="mb-3 p-4 bg-red-50 border-2 border-red-500 rounded-xl flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-red-700">Recording...</span>
          </div>
          <span className="text-sm text-gray-700 font-mono">
            {Math.floor(recordingDuration / 60)}:{(recordingDuration % 60).toString().padStart(2, '0')}
          </span>
          <div className="flex-1"></div>
          <button
            onClick={onStopRecording}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium"
          >
            Stop
          </button>
        </div>
      )}

      {/* Voice preview (after recording) */}
      {audioBlob && !isRecording && (
        <div className="mb-3 p-4 bg-teal-50 border-2 border-teal-500 rounded-xl">
          <div className="flex items-center gap-3 mb-3">
            <div className="text-teal-700 font-medium text-sm">🎤 Voice Message</div>
            <span className="text-xs text-gray-600">
              {Math.floor(recordingDuration / 60)}:{(recordingDuration % 60).toString().padStart(2, '0')}
            </span>
          </div>
          <audio src={URL.createObjectURL(audioBlob)} controls className="w-full mb-3" />
          <div className="flex gap-2">
            <button
              onClick={onSendVoice}
              className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 text-sm font-medium"
            >
              Send
            </button>
            <button
              onClick={onCancelRecording}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Input controls */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => fileInputRef.current?.click()}
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100/80 backdrop-blur-sm rounded-xl transition-all duration-200"
          disabled={disabled || isRecording || audioBlob}
          title="Attach image or video"
        >
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
            onKeyDown={handleKeyDown}
            placeholder={selectedMedia ? "Add a caption (optional)..." : "Type a message..."}
            disabled={disabled || isRecording || audioBlob}
            className="w-full px-4 py-3 bg-gray-50/80 backdrop-blur-sm border border-gray-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500/50 transition-all duration-200 placeholder-gray-500 shadow-sm"
          />
        </div>
        <button
          onClick={isRecording ? onStopRecording : onStartRecording}
          className={`p-2 rounded-xl transition-all duration-200 ${
            isRecording
              ? 'bg-red-500 text-white hover:bg-red-600'
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100/80 backdrop-blur-sm'
          }`}
          disabled={disabled || audioBlob || selectedMedia}
          title={isRecording ? "Stop recording" : "Record voice message"}
        >
          <Mic size={18} />
        </button>
        <button
          onClick={handleSendClick}
          disabled={(!value.trim() && !selectedMedia) || disabled || isRecording || audioBlob}
          className="p-3 bg-teal-600 text-white rounded-xl hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
};

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
        <button
          onClick={onNewChat}
          className="px-6 py-3 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition-all duration-200 shadow-sm"
        >
          Start New Chat
        </button>
      </div>
    </div>
  );
};

export default MessagesPage;