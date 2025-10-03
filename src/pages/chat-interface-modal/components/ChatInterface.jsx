import React from 'react';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Icon from '../../../components/AppIcon';

const ChatInterface = ({
  messages,
  newMessage,
  setNewMessage,
  onSendMessage,
  isTyping,
  quickMessages,
  messagesEndRef,
  // Media props
  selectedMedia,
  mediaPreview,
  fileInputRef,
  onMediaSelect,
  onCancelMedia,
  onSendMedia,
  // Voice props
  isRecording,
  recordingDuration,
  audioBlob,
  onStartRecording,
  onStopRecording,
  onCancelRecording,
  onSendVoice
}) => {
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (selectedMedia) {
        onSendMedia();
      } else {
        onSendMessage();
      }
    }
  };

  const handleQuickMessage = (message) => {
    setNewMessage(message);
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.sender === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-xs px-3 py-2 rounded-2xl ${
                message.sender === 'user' ? 'bg-primary text-primary-foreground'
                  : message.sender === 'system' ? 'bg-muted text-text-secondary text-center'
                  : message.sender === 'support' ? 'bg-blue-50 text-blue-900 border border-blue-200'
                  : 'bg-muted text-text-primary'
              }`}
            >
              {/* WhatsApp-style quoted message for error context */}
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
                    {message.quotedContent.orderId && (
                      <div>🛒 Order: {message.quotedContent.orderId}</div>
                    )}
                  </div>
                </div>
              )}

              {/* Media (Image/Video) */}
              {message.media && (
                <div className="mb-2">
                  {message.media.type === 'image' ? (
                    <img
                      src={message.media.url}
                      alt={message.media.name}
                      className="rounded-lg max-w-full max-h-64 object-cover"
                      onError={(e) => {
                        e.target.src = '/assets/images/no_image.png';
                      }}
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
                  <Icon name="Mic" size={16} className="opacity-70" />
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
              {message.text && (
                <p className="text-sm whitespace-pre-line">{message.text}</p>
              )}

              <div className={`flex items-center gap-1 mt-1 ${
                message.sender === 'user' ? 'justify-end' : 'justify-start'
              }`}>
                <span className="text-xs opacity-70">
                  {formatTime(message.timestamp)}
                </span>
                {message.sender === 'user' && (
                  <Icon
                    name={message.status === 'sending' ? 'Clock' : 'Check'}
                    size={12}
                    className="opacity-70"
                  />
                )}
                {message.sender === 'support' && (
                  <Icon name="Headphones" size={12} className="opacity-70 text-blue-600" />
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-muted text-text-primary px-3 py-2 rounded-2xl">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-text-secondary rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-text-secondary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                <div className="w-2 h-2 bg-text-secondary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Messages */}
      <div className="p-4 border-t border-border">
        <div className="flex gap-2 overflow-x-auto pb-2 mb-3">
          {quickMessages.map((message, index) => (
            <button
              key={index}
              onClick={() => handleQuickMessage(message)}
              className="flex-shrink-0 px-3 py-2 bg-muted hover:bg-muted-hover text-text-primary rounded-full text-sm transition-colors"
            >
              {message}
            </button>
          ))}
        </div>

        {/* Media Preview */}
        {selectedMedia && (
          <div className="mb-3 p-3 bg-gradient-to-r from-teal-50 to-cyan-50 rounded-xl border border-teal-200">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                {selectedMedia.type.startsWith('image/') ? (
                  <img
                    src={mediaPreview}
                    alt="Preview"
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-lg bg-gray-200 flex items-center justify-center">
                    <Icon name="Video" size={24} className="text-gray-600" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{selectedMedia.name}</p>
                <p className="text-xs text-gray-500">{(selectedMedia.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
              <button
                onClick={onCancelMedia}
                className="flex-shrink-0 p-1 hover:bg-red-100 rounded-full transition-colors"
              >
                <Icon name="X" size={16} className="text-red-600" />
              </button>
            </div>
          </div>
        )}

        {/* Voice Recording Preview */}
        {audioBlob && (
          <div className="mb-3 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200">
            <div className="flex items-center gap-3">
              <Icon name="Mic" size={20} className="text-purple-600" />
              <audio
                src={URL.createObjectURL(audioBlob)}
                controls
                className="flex-1"
                style={{ height: '32px' }}
              />
              <span className="text-sm text-purple-600 font-medium">{formatDuration(recordingDuration)}</span>
              <button
                onClick={onCancelRecording}
                className="flex-shrink-0 p-1 hover:bg-red-100 rounded-full transition-colors"
              >
                <Icon name="X" size={16} className="text-red-600" />
              </button>
            </div>
          </div>
        )}

        {/* Recording UI */}
        {isRecording && (
          <div className="mb-3 p-3 bg-gradient-to-r from-red-50 to-pink-50 rounded-xl border border-red-200">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-red-600 font-medium">Recording...</span>
              <span className="flex-1 text-center text-sm text-red-600 font-mono">{formatDuration(recordingDuration)}</span>
              <button
                onClick={onStopRecording}
                className="px-3 py-1 bg-red-600 text-white text-xs rounded-full hover:bg-red-700 transition-colors"
              >
                Stop
              </button>
            </div>
          </div>
        )}

        {/* Message Input */}
        <div className="flex gap-2">
          {!isRecording && !audioBlob && (
            <>
              {/* Attach Button */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                onChange={onMediaSelect}
                className="hidden"
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => fileInputRef.current?.click()}
                disabled={isRecording}
              >
                <Icon name="Paperclip" size={18} />
              </Button>
            </>
          )}

          {/* Message Input or Send Media */}
          {selectedMedia ? (
            <Button
              onClick={onSendMedia}
              className="flex-1"
            >
              <Icon name="Send" size={16} className="mr-2" />
              Send Media
            </Button>
          ) : audioBlob ? (
            <Button
              onClick={onSendVoice}
              className="flex-1"
            >
              <Icon name="Send" size={16} className="mr-2" />
              Send Voice
            </Button>
          ) : !isRecording ? (
            <>
              <div className="flex-1 relative">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type a message..."
                />
              </div>

              {/* Send or Mic Button */}
              {newMessage.trim() ? (
                <Button
                  onClick={onSendMessage}
                  size="icon"
                >
                  <Icon name="Send" size={16} />
                </Button>
              ) : (
                <Button
                  onClick={onStartRecording}
                  size="icon"
                  variant="ghost"
                >
                  <Icon name="Mic" size={18} />
                </Button>
              )}
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
