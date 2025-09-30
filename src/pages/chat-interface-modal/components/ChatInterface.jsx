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
  messagesEndRef 
}) => {
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSendMessage();
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
                message.sender === 'user' ?'bg-primary text-primary-foreground'
                  : message.sender === 'system' ?'bg-muted text-text-secondary text-center'
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

              <p className="text-sm whitespace-pre-line">{message.text}</p>
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

        {/* Message Input */}
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="pr-10"
            />
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
            >
              <Icon name="Paperclip" size={16} />
            </Button>
          </div>
          
          <Button
            onClick={onSendMessage}
            disabled={!newMessage.trim()}
            size="icon"
          >
            <Icon name="Send" size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;