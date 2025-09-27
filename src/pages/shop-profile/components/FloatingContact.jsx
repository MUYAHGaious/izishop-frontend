import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import ChatModal from '../../../components/ui/ChatModal';
import { MessageCircle, Phone, Mail, Clock, MapPin, Star, Zap, X, Plus } from 'lucide-react';

const FloatingContact = ({ shop, onContact }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [lastSeen, setLastSeen] = useState('2 min ago');


  // Simulate some activity for demo
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.8) {
        setUnreadCount(prev => prev + 1);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const contactOptions = [
    {
      label: 'Start Chat',
      sublabel: 'Usually replies instantly',
      icon: MessageCircle,
      action: () => {
        setIsExpanded(false);
        setIsChatOpen(true);
        setUnreadCount(0);
      },
      color: 'bg-teal-500 hover:bg-teal-600',
      available: true
    },
    {
      label: 'Call Now',
      sublabel: shop?.phone || 'Phone available',
      icon: Phone,
      action: () => {
        setIsExpanded(false);
        window.open(`tel:${shop?.phone || '+237600000000'}`);
      },
      color: 'bg-green-500 hover:bg-green-600',
      available: !!shop?.phone
    },
    {
      label: 'Send Email',
      sublabel: shop?.email || 'Email support',
      icon: Mail,
      action: () => {
        setIsExpanded(false);
        window.open(`mailto:${shop?.email || 'shop@example.com'}`);
      },
      color: 'bg-blue-500 hover:bg-blue-600',
      available: !!shop?.email
    },
    {
      label: 'WhatsApp',
      sublabel: 'Quick messaging',
      icon: MessageCircle,
      action: () => {
        setIsExpanded(false);
        const message = encodeURIComponent(`Hi! I'm interested in your products at ${shop?.name}.`);
        window.open(`https://wa.me/${(shop?.phone || '+237600000000').replace(/\D/g, '')}?text=${message}`);
      },
      color: 'bg-green-400 hover:bg-green-500',
      available: !!shop?.phone
    }
  ].filter(option => option.available);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <>
      <div 
        className="fixed bottom-4 right-4 z-50" 
        style={{ 
          position: 'fixed !important', 
          bottom: '16px !important', 
          right: '16px !important', 
          zIndex: '9999 !important',
          transform: 'none !important'
        }}
      >
        {/* Tooltip temporarily removed to fix positioning issues */}

        {/* Enhanced Contact Options */}
        <div className={`flex flex-col gap-2 mb-4 transition-all duration-500 ${
          isExpanded ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95 pointer-events-none'
        }`}>
          {contactOptions.map((option, index) => {
            const IconComponent = option.icon;
            return (
              <div
                key={option.label}
                className="flex items-center gap-3 animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Enhanced Label Card */}
                <div className="bg-white text-gray-900 px-4 py-3 rounded-xl shadow-lg border border-gray-100 min-w-0 flex-shrink-0">
                  <div className="text-sm font-semibold">{option.label}</div>
                  <div className="text-xs text-gray-500">{option.sublabel}</div>
                </div>

                {/* Enhanced Action Button */}
                <button
                  onClick={option.action}
                  className={`w-14 h-14 ${option.color} rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-200 relative`}
                >
                  <IconComponent size={22} className="text-white" />

                  {/* Special indicator for chat with unread count */}
                  {option.label === 'Start Chat' && unreadCount > 0 && (
                    <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                      {unreadCount}
                    </div>
                  )}
                </button>
              </div>
            );
          })}

          {/* Shop Info Card */}
          <div className="bg-white text-gray-900 px-4 py-3 rounded-xl shadow-lg border border-gray-100 mt-2">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center">
                <Star size={14} className="text-teal-600" />
              </div>
              <div>
                <div className="text-sm font-semibold">{shop?.name}</div>
                <div className="text-xs text-gray-500 flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  Online • Last seen {lastSeen}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4 text-xs text-gray-600">
              <div className="flex items-center gap-1">
                <Clock size={12} />
                Avg. response: 2 min
              </div>
              <div className="flex items-center gap-1">
                <Star size={12} />
                {(shop?.average_rating || 4.5).toFixed(1)} rating
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Main Contact Button */}
        <div className="relative">
          <button
            onClick={toggleExpanded}
            className={`w-16 h-16 bg-teal-500 hover:bg-teal-600 rounded-full flex items-center justify-center shadow-xl hover:shadow-2xl transform hover:scale-110 transition-all duration-300 relative ${
              isExpanded ? 'rotate-45' : 'rotate-0'
            }`}
          >
            {isExpanded ? (
              <X size={28} className="text-white" />
            ) : (
              <MessageCircle size={28} className="text-white" />
            )}

            {/* Professional Pulse Animation - Industry Standard */}
            {!isExpanded && (
              <>
                {/* Primary pulse ring - most prominent */}
                <div className="absolute inset-0 rounded-full bg-teal-500 opacity-25 animate-ping"></div>
                {/* Secondary pulse ring - delayed for layered effect */}
                <div 
                  className="absolute inset-0 rounded-full bg-teal-500 opacity-15 animate-ping"
                  style={{ animationDelay: '0.5s' }}
                ></div>
                {/* Tertiary pulse ring - subtle background */}
                <div 
                  className="absolute inset-0 rounded-full bg-teal-500 opacity-10 animate-ping"
                  style={{ animationDelay: '1s' }}
                ></div>
                {/* Continuous subtle glow */}
                <div className="absolute inset-0 rounded-full bg-teal-500 opacity-5 animate-pulse"></div>
              </>
            )}
          </button>

          {/* Enhanced Status Indicators */}
          <div className="absolute -top-1 -right-1">
            {/* Online Status */}
            <div className="w-5 h-5 bg-green-400 rounded-full border-2 border-white flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            </div>
          </div>

          {/* Unread Messages Badge */}
          {unreadCount > 0 && !isExpanded && (
            <div className="absolute -top-2 -left-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold animate-bounce">
              {unreadCount}
            </div>
          )}

          {/* Typing Indicator */}
          {isTyping && !isExpanded && (
            <div className="absolute -bottom-1 -left-1 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
              <div className="flex gap-1">
                <div className="w-1 h-1 bg-white rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                <div className="w-1 h-1 bg-white rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                <div className="w-1 h-1 bg-white rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Chat Modal */}
      <ChatModal
        isOpen={isChatOpen}
        onClose={() => {
          setIsChatOpen(false);
          setUnreadCount(0);
        }}
        shop={shop}
      />
    </>
  );
};

export default FloatingContact;