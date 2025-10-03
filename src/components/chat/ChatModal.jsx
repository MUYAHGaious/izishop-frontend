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
  ArrowLeft,
  Check,
  CheckCheck,
  Clock,
  User,
  Bot,
  Paperclip,
  ExternalLink,
  MessageSquare,
  Mic,
  Trash2,
  Archive,
  Volume2,
  VolumeX,
  Video
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import chatStorage from '../../utils/chatStorage';
import Icon from '../AppIcon';

const ChatModal = ({ isOpen, onClose }) => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState('conversations');
  const [conversations, setConversations] = useState([]);
  const [archivedConversations, setArchivedConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [allMessages, setAllMessages] = useState({});
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [showMenu, setShowMenu] = useState(null);
  const [isTyping, setIsTyping] = useState(false);

  // Media attachment state
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);
  const fileInputRef = useRef(null);

  // Voice recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [audioBlob, setAudioBlob] = useState(null);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const recordingIntervalRef = useRef(null);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen && isAuthenticated() && user) {
      loadConversationsFromDB();
    }
  }, [isOpen, user]);

  useEffect(() => {
    scrollToBottom();
  }, [allMessages, activeConversation]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadConversationsFromDB = async () => {
    try {
      setLoading(true);
      console.log('🔄 Loading conversations from IndexedDB for user:', user.id);

      // Load conversations from IndexedDB
      const dbConversations = await chatStorage.getUserConversations(user.id);
      console.log('📦 Loaded conversations:', dbConversations);

      // Map to modal format
      const mappedConversations = dbConversations.map(conv => ({
        id: conv.id,
        title: conv.title,
        avatar: conv.avatar || '/assets/images/default-shop.png',
        last_message: conv.last_message,
        last_message_at: conv.last_message_at,
        unread_count: conv.unread_count || 0,
        is_online: conv.is_online || false,
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
          content: msg.content || '',
          sender_id: msg.sender_id,
          created_at: new Date(msg.created_at),
          status: msg.status || 'delivered',
          is_bot_message: msg.is_bot_message || false,
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
    } finally {
      setLoading(false);
    }
  };

  const handleSelectConversation = async (conv) => {
    setActiveConversation(conv);
    setCurrentView('chat');

    // Mark conversation as read
    if (conv.unread_count > 0) {
      try {
        await chatStorage.saveConversation(user.id, {
          ...conv,
          unread_count: 0
        });

        // Update local state
        setConversations(prev => prev.map(c =>
          c.id === conv.id ? { ...c, unread_count: 0 } : c
        ));
      } catch (error) {
        console.error('Error marking conversation as read:', error);
      }
    }
  };

  // Media attachment handlers
  const handleMediaSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB');
      return;
    }

    setSelectedMedia(file);

    // Create preview
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setMediaPreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setMediaPreview(null);
    }
  };

  const handleCancelMedia = () => {
    setSelectedMedia(null);
    setMediaPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSendMedia = async () => {
    if (!selectedMedia || !activeConversation) return;

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const mediaMessage = {
          id: Date.now().toString(),
          content: newMessage.trim() || '',
          sender_id: user.id,
          created_at: new Date().toISOString(),
          status: 'sent',
          media: {
            type: selectedMedia.type.startsWith('image/') ? 'image' : 'video',
            url: reader.result,
            name: selectedMedia.name,
            blob: selectedMedia
          }
        };

        // Save to IndexedDB
        const currentMessages = allMessages[activeConversation.id] || [];
        await chatStorage.saveMessages(activeConversation.id, [...currentMessages, mediaMessage]);

        // Update conversation
        await chatStorage.saveConversation(user.id, {
          ...activeConversation,
          last_message: {
            content: `📷 ${selectedMedia.type.startsWith('image/') ? 'Photo' : 'Video'}`,
            created_at: new Date().toISOString()
          },
          last_message_at: new Date().toISOString()
        });

        // Update local state
        setAllMessages(prev => ({
          ...prev,
          [activeConversation.id]: [...(prev[activeConversation.id] || []), mediaMessage]
        }));

        setConversations(prev => prev.map(c =>
          c.id === activeConversation.id
            ? {
                ...c,
                last_message: {
                  content: `📷 ${selectedMedia.type.startsWith('image/') ? 'Photo' : 'Video'}`,
                  created_at: new Date().toISOString()
                },
                last_message_at: new Date().toISOString()
              }
            : c
        ));

        // Clear media
        handleCancelMedia();
        setNewMessage('');
      };
      reader.readAsDataURL(selectedMedia);
    } catch (error) {
      console.error('Error sending media:', error);
    }
  };

  // Voice recording handlers
  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        setAudioBlob(blob);
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
      setRecordingDuration(0);

      recordingIntervalRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Could not access microphone. Please check permissions.');
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    }
  };

  const handleCancelRecording = () => {
    setAudioBlob(null);
    setRecordingDuration(0);
  };

  const handleSendVoice = async () => {
    if (!audioBlob || !activeConversation) return;

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const voiceMessage = {
          id: Date.now().toString(),
          content: '',
          sender_id: user.id,
          created_at: new Date().toISOString(),
          status: 'sent',
          voice: {
            url: reader.result,
            duration: recordingDuration,
            blob: audioBlob
          }
        };

        // Save to IndexedDB
        const currentMessages = allMessages[activeConversation.id] || [];
        await chatStorage.saveMessages(activeConversation.id, [...currentMessages, voiceMessage]);

        // Update conversation
        await chatStorage.saveConversation(user.id, {
          ...activeConversation,
          last_message: {
            content: `🎤 Voice message (${Math.floor(recordingDuration / 60)}:${(recordingDuration % 60).toString().padStart(2, '0')})`,
            created_at: new Date().toISOString()
          },
          last_message_at: new Date().toISOString()
        });

        // Update local state
        setAllMessages(prev => ({
          ...prev,
          [activeConversation.id]: [...(prev[activeConversation.id] || []), voiceMessage]
        }));

        setConversations(prev => prev.map(c =>
          c.id === activeConversation.id
            ? {
                ...c,
                last_message: {
                  content: `🎤 Voice message (${Math.floor(recordingDuration / 60)}:${(recordingDuration % 60).toString().padStart(2, '0')})`,
                  created_at: new Date().toISOString()
                },
                last_message_at: new Date().toISOString()
              }
            : c
        ));

        // Clear voice recording
        handleCancelRecording();
      };
      reader.readAsDataURL(audioBlob);
    } catch (error) {
      console.error('Error sending voice message:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !activeConversation) return;

    const messageContent = newMessage.trim();
    setNewMessage('');

    try {
      const textMessage = {
        id: Date.now().toString(),
        content: messageContent,
        sender_id: user.id,
        created_at: new Date().toISOString(),
        status: 'sent'
      };

      // Save to IndexedDB
      const currentMessages = allMessages[activeConversation.id] || [];
      await chatStorage.saveMessages(activeConversation.id, [...currentMessages, textMessage]);

      // Update conversation
      await chatStorage.saveConversation(user.id, {
        ...activeConversation,
        last_message: {
          content: messageContent,
          created_at: new Date().toISOString()
        },
        last_message_at: new Date().toISOString()
      });

      // Update local state
      setAllMessages(prev => ({
        ...prev,
        [activeConversation.id]: [...(prev[activeConversation.id] || []), textMessage]
      }));

      setConversations(prev => prev.map(c =>
        c.id === activeConversation.id
          ? {
              ...c,
              last_message: {
                content: messageContent,
                created_at: new Date().toISOString()
              },
              last_message_at: new Date().toISOString()
            }
          : c
      ));
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  // CRUD operations
  const handleDeleteConversation = async (convId, isSupportChat = false) => {
    try {
      if (isSupportChat) {
        await chatStorage.deleteSupportChat();
      } else {
        await chatStorage.deleteConversation(convId);
      }

      setConversations(prev => prev.filter(c => c.id !== convId));
      setArchivedConversations(prev => prev.filter(c => c.id !== convId));

      if (activeConversation?.id === convId) {
        setActiveConversation(null);
        setCurrentView('conversations');
      }

      setShowMenu(null);
    } catch (error) {
      console.error('Error deleting conversation:', error);
    }
  };

  const handleArchiveConversation = async (conv) => {
    try {
      const updatedConv = { ...conv, archived: !conv.archived };

      await chatStorage.saveConversation(user.id, updatedConv);

      if (updatedConv.archived) {
        setConversations(prev => prev.filter(c => c.id !== conv.id));
        setArchivedConversations(prev => [...prev, updatedConv]);
      } else {
        setArchivedConversations(prev => prev.filter(c => c.id !== conv.id));
        setConversations(prev => [...prev, updatedConv]);
      }

      setShowMenu(null);
    } catch (error) {
      console.error('Error archiving conversation:', error);
    }
  };

  const handleMuteConversation = async (conv) => {
    try {
      const updatedConv = { ...conv, muted: !conv.muted };

      await chatStorage.saveConversation(user.id, updatedConv);

      setConversations(prev => prev.map(c =>
        c.id === conv.id ? updatedConv : c
      ));

      setShowMenu(null);
    } catch (error) {
      console.error('Error muting conversation:', error);
    }
  };

  const goToFullChatPage = () => {
    onClose();
    navigate('/messages');
  };

  if (!isOpen) return null;

  const messages = activeConversation ? (allMessages[activeConversation.id] || []) : [];

  return (
    <div className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm flex items-center justify-center p-0 sm:p-4">
      <div className="w-full h-full sm:h-[90vh] sm:max-w-4xl bg-white/95 backdrop-blur-xl sm:rounded-xl shadow-xl border border-white/20 flex overflow-hidden">

        {/* Sidebar */}
        <div className={`${
          currentView === 'conversations' ? 'flex' : 'hidden'
        } lg:flex w-full lg:w-80 bg-gray-50/80 backdrop-blur-sm border-r border-gray-200/50 flex-col`}>
          {/* Header */}
          <div className="p-3 sm:p-4 border-b border-gray-200/50 bg-white/80 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900">Messages</h2>
              <div className="flex items-center gap-1 sm:gap-2">
                <button
                  onClick={goToFullChatPage}
                  className="p-1.5 sm:p-2 text-gray-500 hover:text-teal-600 hover:bg-teal-50/80 backdrop-blur-sm rounded-xl transition-all duration-200 border border-teal-200/50"
                  title="Open full chat page"
                >
                  <ExternalLink size={16} className="sm:w-[18px] sm:h-[18px]" />
                </button>
                <button
                  onClick={onClose}
                  className="p-1.5 sm:p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100/80 backdrop-blur-sm rounded-xl transition-all duration-200"
                >
                  <X size={16} className="sm:w-[18px] sm:h-[18px]" />
                </button>
              </div>
            </div>

            {/* Search */}
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 sm:w-4 sm:h-4" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 sm:pl-9 pr-3 sm:pr-4 py-2 bg-gray-50/80 backdrop-blur-sm border border-gray-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500/50 transition-all duration-200 text-xs sm:text-sm placeholder-gray-500 shadow-sm"
              />
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
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
                    onClick={goToFullChatPage}
                    className="text-xs text-teal-600 hover:underline mt-1"
                  >
                    Start a new chat
                  </button>
                </div>
              ) : (
                conversations
                  .filter(conv =>
                    conv.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    conv.last_message?.content?.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .slice(0, 10)
                  .map((conv) => (
                    <ConversationItem
                      key={conv.id}
                      conversation={conv}
                      isActive={activeConversation?.id === conv.id}
                      onClick={() => handleSelectConversation(conv)}
                      onMenuClick={(e) => {
                        e.stopPropagation();
                        setShowMenu(showMenu === conv.id ? null : conv.id);
                      }}
                      showMenu={showMenu === conv.id}
                      onDelete={() => handleDeleteConversation(conv.id, conv.type === 'support')}
                      onArchive={() => handleArchiveConversation(conv)}
                      onMute={() => handleMuteConversation(conv)}
                    />
                  ))
              )}
            </div>
          </div>
        </div>

        {/* Chat Area */}
        <div className={`${
          currentView === 'chat' ? 'flex' : 'hidden'
        } lg:flex flex-1 flex-col`}>
          {currentView === 'chat' && activeConversation ? (
            <>
              {/* Chat Header */}
              <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-200/50 bg-white/80 backdrop-blur-sm">
                <div className="flex items-center gap-2 sm:gap-3">
                  <button
                    onClick={() => setCurrentView('conversations')}
                    className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100/80 backdrop-blur-sm rounded-xl transition-all duration-200 lg:hidden"
                  >
                    <ArrowLeft size={18} />
                  </button>
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-200 rounded-full flex items-center justify-center">
                    <User size={16} className="text-gray-600 sm:w-5 sm:h-5" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 text-sm sm:text-base">{activeConversation.title}</h3>
                    <p className="text-xs text-gray-500">
                      {activeConversation.is_online ? 'Online' : 'Offline'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2 sm:space-y-3 bg-gray-50/80 backdrop-blur-sm">
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
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-white/80 backdrop-blur-sm border border-gray-200/50 px-3 py-2 rounded-lg">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Media Preview */}
              {selectedMedia && (
                <div className="p-2 sm:p-3 border-t border-gray-200/50 bg-gradient-to-r from-teal-50 to-cyan-50">
                  <div className="flex items-start gap-2 sm:gap-3">
                    <div className="flex-shrink-0">
                      {selectedMedia.type.startsWith('image/') ? (
                        <img
                          src={mediaPreview}
                          alt="Preview"
                          className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg bg-gray-200 flex items-center justify-center">
                          <Video size={20} className="text-gray-600 sm:w-6 sm:h-6" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">{selectedMedia.name}</p>
                      <p className="text-xs text-gray-500">{(selectedMedia.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                    <button
                      onClick={handleCancelMedia}
                      className="flex-shrink-0 p-1 hover:bg-red-100 rounded-full transition-colors"
                    >
                      <X size={14} className="text-red-600 sm:w-4 sm:h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Voice Recording Preview */}
              {audioBlob && (
                <div className="p-2 sm:p-3 border-t border-gray-200/50 bg-gradient-to-r from-purple-50 to-pink-50">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <Mic size={18} className="text-purple-600 sm:w-5 sm:h-5" />
                    <audio
                      src={URL.createObjectURL(audioBlob)}
                      controls
                      className="flex-1"
                      style={{ height: '28px' }}
                    />
                    <span className="text-xs sm:text-sm text-purple-600 font-medium">
                      {Math.floor(recordingDuration / 60)}:{(recordingDuration % 60).toString().padStart(2, '0')}
                    </span>
                    <button
                      onClick={handleCancelRecording}
                      className="flex-shrink-0 p-1 hover:bg-red-100 rounded-full transition-colors"
                    >
                      <X size={14} className="text-red-600 sm:w-4 sm:h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Recording UI */}
              {isRecording && (
                <div className="p-2 sm:p-3 border-t border-gray-200/50 bg-gradient-to-r from-red-50 to-pink-50">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-2 h-2 sm:w-3 sm:h-3 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="text-xs sm:text-sm text-red-600 font-medium">Recording...</span>
                    <span className="flex-1 text-center text-xs sm:text-sm text-red-600 font-mono">
                      {Math.floor(recordingDuration / 60)}:{(recordingDuration % 60).toString().padStart(2, '0')}
                    </span>
                    <button
                      onClick={handleStopRecording}
                      className="px-2 sm:px-3 py-1 bg-red-600 text-white text-xs rounded-full hover:bg-red-700 transition-colors"
                    >
                      Stop
                    </button>
                  </div>
                </div>
              )}

              {/* Message Input */}
              <div className="p-2 sm:p-3 md:p-4 border-t border-gray-200/50 bg-white/80 backdrop-blur-sm">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  {!isRecording && !audioBlob && (
                    <>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*,video/*"
                        onChange={handleMediaSelect}
                        className="hidden"
                      />
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="p-1.5 sm:p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100/80 backdrop-blur-sm rounded-xl transition-all duration-200"
                      >
                        <Paperclip size={16} className="sm:w-[18px] sm:h-[18px]" />
                      </button>
                    </>
                  )}

                  {selectedMedia ? (
                    <button
                      onClick={handleSendMedia}
                      className="flex-1 px-3 sm:px-4 py-2 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition-all duration-200 shadow-sm flex items-center justify-center gap-2 text-sm"
                    >
                      <Send size={14} className="sm:w-4 sm:h-4" />
                      <span className="hidden xs:inline">Send Media</span>
                      <span className="xs:hidden">Send</span>
                    </button>
                  ) : audioBlob ? (
                    <button
                      onClick={handleSendVoice}
                      className="flex-1 px-3 sm:px-4 py-2 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition-all duration-200 shadow-sm flex items-center justify-center gap-2 text-sm"
                    >
                      <Send size={14} className="sm:w-4 sm:h-4" />
                      <span className="hidden xs:inline">Send Voice</span>
                      <span className="xs:hidden">Send</span>
                    </button>
                  ) : !isRecording ? (
                    <>
                      <div className="flex-1">
                        <input
                          type="text"
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                          placeholder="Type a message..."
                          className="w-full px-2.5 sm:px-3 py-1.5 sm:py-2 bg-gray-50/80 backdrop-blur-sm border border-gray-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500/50 transition-all duration-200 text-xs sm:text-sm placeholder-gray-500 shadow-sm"
                        />
                      </div>

                      {newMessage.trim() ? (
                        <button
                          onClick={handleSendMessage}
                          className="p-1.5 sm:p-2 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition-all duration-200 shadow-sm"
                        >
                          <Send size={16} className="sm:w-[18px] sm:h-[18px]" />
                        </button>
                      ) : (
                        <button
                          onClick={handleStartRecording}
                          className="p-1.5 sm:p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100/80 backdrop-blur-sm rounded-xl transition-all duration-200"
                        >
                          <Mic size={16} className="sm:w-[18px] sm:h-[18px]" />
                        </button>
                      )}
                    </>
                  ) : null}
                </div>
              </div>
            </>
          ) : (
            <WelcomeScreen onOpenFullPage={goToFullChatPage} />
          )}
        </div>
      </div>
    </div>
  );
};

// Sub-components
const ConversationItem = ({ conversation, isActive, onClick, onMenuClick, showMenu, onDelete, onArchive, onMute }) => (
  <div className="relative">
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
          <div className="flex items-center gap-1">
            <h4 className="text-sm font-medium text-gray-900 truncate">{conversation.title}</h4>
            {conversation.muted && <VolumeX size={12} className="text-gray-400" />}
          </div>
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
      <button
        onClick={onMenuClick}
        className="ml-1 p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded transition-colors"
      >
        <MoreVertical size={14} />
      </button>
    </div>

    {/* Context Menu */}
    {showMenu && (
      <div className="absolute right-2 top-full mt-1 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
        <button
          onClick={onMute}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
        >
          {conversation.muted ? <Volume2 size={14} /> : <VolumeX size={14} />}
          {conversation.muted ? 'Unmute' : 'Mute'}
        </button>
        <button
          onClick={onArchive}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
        >
          <Archive size={14} />
          {conversation.archived ? 'Unarchive' : 'Archive'}
        </button>
        <button
          onClick={onDelete}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
        >
          <Trash2 size={14} />
          Delete
        </button>
      </div>
    )}
  </div>
);

const MessageBubble = ({ message, isOwnMessage }) => {
  const formatTime = (timestamp) => new Date(timestamp).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} gap-1.5 sm:gap-2`}>
      {!isOwnMessage && (
        <div className="w-5 h-5 sm:w-6 sm:h-6 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
          {message.is_bot_message ? (
            <Bot size={10} className="text-teal-600 sm:w-3 sm:h-3" />
          ) : (
            <User size={10} className="text-gray-600 sm:w-3 sm:h-3" />
          )}
        </div>
      )}

      <div className="max-w-[75%] sm:max-w-xs">
        <div
          className={`px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-lg text-xs sm:text-sm ${
            isOwnMessage
              ? 'bg-teal-600 text-white rounded-br-sm'
              : message.is_bot_message
              ? 'bg-teal-50/80 backdrop-blur-sm text-teal-700 border border-teal-200/50 rounded-bl-sm'
              : 'bg-white/80 backdrop-blur-sm border border-gray-200/50 text-gray-900 rounded-bl-sm'
          } shadow-sm`}
        >
          {/* Quoted Error Context */}
          {message.isQuotedError && message.quotedContent && (
            <div className="mb-2 p-2 bg-red-50 border-l-4 border-red-400 rounded-r-lg">
              <div className="flex items-center gap-1 mb-1">
                <Icon name="AlertTriangle" size={12} className="text-red-600" />
                <span className="text-xs font-medium text-red-600">Error Report</span>
              </div>
              <p className="text-xs text-red-700 italic">"{message.quotedContent.content}"</p>
              <div className="text-xs text-red-500 mt-1 space-y-0.5">
                <div>📅 {message.quotedContent.timestamp}</div>
                <div>📄 {message.quotedContent.page}</div>
              </div>
            </div>
          )}

          {/* Media */}
          {message.media && (
            <div className="mb-2">
              {message.media.type === 'image' ? (
                <img
                  src={message.media.url}
                  alt={message.media.name}
                  className="rounded-lg max-w-full max-h-64 object-cover"
                />
              ) : (
                <video
                  src={message.media.url}
                  controls
                  className="rounded-lg max-w-full max-h-64"
                />
              )}
              <p className="text-xs opacity-70 mt-1">{message.media.name}</p>
            </div>
          )}

          {/* Voice Message */}
          {message.voice && (
            <div className="flex items-center gap-2 min-w-[200px]">
              <Mic size={16} className="opacity-70" />
              <audio
                src={message.voice.url}
                controls
                className="flex-1"
                style={{ height: '32px' }}
              />
              <span className="text-xs opacity-70">{formatDuration(message.voice.duration)}</span>
            </div>
          )}

          {/* Text Message */}
          {message.content && (
            <p className="text-sm whitespace-pre-line">{message.content}</p>
          )}
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

const WelcomeScreen = ({ onOpenFullPage }) => (
  <div className="flex-1 flex items-center justify-center bg-gray-50/80 backdrop-blur-sm">
    <div className="text-center">
      <MessageCircle size={48} className="mx-auto mb-4 text-gray-400" />
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Welcome to IziShop Messenger</h3>
      <p className="text-gray-600 mb-6 text-sm">Connect with shops, customers, and get support</p>
      <button
        onClick={onOpenFullPage}
        className="px-6 py-3 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition-all duration-200 text-sm shadow-sm"
      >
        Open Full Chat Page
      </button>
    </div>
  </div>
);

export default ChatModal;
