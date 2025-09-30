import React, { useState, useEffect } from 'react';
import { MessageCircle, X, Bell, HelpCircle, Phone, Mail } from 'lucide-react';
import ChatModal from './ChatModal';
import { useAuth } from '../../contexts/AuthContext';
import { useLocation } from 'react-router-dom';

const ProfessionalFloatingContact = ({ shop = null }) => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOnline, setIsOnline] = useState(true);
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const containerRef = React.useRef(null);

  // Pages where the chat icon should NOT be displayed
  const hiddenRoutes = [
    '/authentication-login-register',
    '/admin-dashboard',
    '/shop-owner-dashboard',
    '/messages',
    '/chat',
    '/checkout',
    '/order-success',
    '/payment'
  ];

  // Check if current route should hide the chat icon
  const shouldHide = hiddenRoutes.some(route => location.pathname.startsWith(route));

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target) && isExpanded) {
        setIsExpanded(false);
      }
    };

    // Add event listener when menu is expanded
    if (isExpanded) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isExpanded]);

  // Simulate unread messages for demo
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.9 && !isChatOpen) {
        setUnreadCount(prev => prev + 1);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [isChatOpen]);

  const openChat = () => {
    if (!isAuthenticated()) {
      // Redirect to login if not authenticated
      window.location.href = '/authentication-login-register';
      return;
    }
    setIsChatOpen(true);
    setUnreadCount(0);
    setIsExpanded(false);
  };

  const quickActions = [
    {
      label: 'Live Chat',
      sublabel: 'Get instant help',
      icon: MessageCircle,
      action: openChat,
      color: 'bg-teal-600 hover:bg-teal-700',
      primary: true
    },
    ...(shop ? [
      {
        label: 'Call Shop',
        sublabel: 'Direct contact',
        icon: Phone,
        action: () => {
          if (shop.phone) {
            window.open(`tel:${shop.phone}`);
          }
          setIsExpanded(false);
        },
        color: 'bg-green-500 hover:bg-green-600'
      },
      {
        label: 'Email Shop',
        sublabel: 'Send message',
        icon: Mail,
        action: () => {
          if (shop.email) {
            window.open(`mailto:${shop.email}`);
          }
          setIsExpanded(false);
        },
        color: 'bg-purple-500 hover:bg-purple-600'
      }
    ] : [
      {
        label: 'Support',
        sublabel: 'Get help',
        icon: HelpCircle,
        action: () => {
          window.open('tel:+237600000000');
          setIsExpanded(false);
        },
        color: 'bg-green-500 hover:bg-green-600'
      }
    ])
  ].filter(Boolean);

  // Don't render on hidden routes
  if (shouldHide) {
    return null;
  }

  return (
    <>
      <div
        ref={containerRef}
        className="fixed bottom-6 right-6 z-[9998] flex flex-col items-end pointer-events-none"
      >
        {/* Quick Actions Menu */}
        <div className={`mb-4 transition-all duration-300 ease-out transform pointer-events-auto ${
          isExpanded
            ? 'opacity-100 translate-y-0 scale-100'
            : 'opacity-0 translate-y-4 scale-95 pointer-events-none'
        }`}>
          <div className="flex flex-col gap-3">
            {quickActions.map((action, index) => {
              const IconComponent = action.icon;
              return (
                <div
                  key={action.label}
                  className="flex items-center gap-3 animate-slide-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Action Label */}
                  <div className="bg-white/95 backdrop-blur-xl text-gray-900 px-4 py-3 rounded-xl shadow-lg border border-white/20 min-w-0 flex-shrink-0">
                    <div className="text-sm font-semibold">{action.label}</div>
                    <div className="text-xs text-gray-500">{action.sublabel}</div>
                  </div>

                  {/* Action Button */}
                  <button
                    onClick={action.action}
                    className={`w-12 h-12 ${action.color} rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-200 text-white`}
                  >
                    <IconComponent size={20} />
                  </button>
                </div>
              );
            })}

            {/* Info Card */}
            <div className="bg-white/95 backdrop-blur-xl text-gray-900 px-4 py-3 rounded-xl shadow-lg border border-white/20 mt-2">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <MessageCircle size={14} className="text-blue-600" />
                </div>
                <div>
                  <div className="text-sm font-semibold">
                    {shop?.name || 'IziShop Support'}
                  </div>
                  <div className="text-xs text-gray-500 flex items-center gap-1">
                    <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-teal-400' : 'bg-gray-400'} ${isOnline ? 'animate-pulse' : ''}`}></div>
                    {isOnline ? 'Online • Available 24/7' : 'Offline • We\'ll respond soon'}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4 text-xs text-gray-600">
                <div className="flex items-center gap-1">
                  <MessageCircle size={12} />
                  Avg. response: {shop ? '2 min' : 'Instant'}
                </div>
                <div className="flex items-center gap-1">
                  <Bell size={12} />
                  24/7 Support
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Contact Button */}
        <div className="relative pointer-events-auto">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`w-14 h-14 bg-teal-600 hover:bg-teal-700 rounded-full flex items-center justify-center shadow-xl hover:shadow-2xl transform hover:scale-110 transition-all duration-300 text-white ${
              isExpanded ? 'rotate-45' : 'rotate-0'
            }`}
          >
            {isExpanded ? (
              <X size={24} />
            ) : (
              <MessageCircle size={24} />
            )}

            {/* Very subtle pulse animation only when there are unread messages */}
            {!isExpanded && unreadCount > 0 && (
              <>
                <div className="absolute inset-0 rounded-full bg-teal-600 opacity-5 animate-ping"></div>
              </>
            )}
          </button>

          {/* Unread Messages Badge */}
          {unreadCount > 0 && !isExpanded && (
            <div className="absolute -top-2 -left-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">
              {unreadCount > 99 ? '99+' : unreadCount}
            </div>
          )}
        </div>
      </div>

      {/* Chat Modal */}
      <ChatModal
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
      />

      {/* Styles for animations */}
      <style jsx>{`
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-slide-up {
          animation: slide-up 0.3s ease-out forwards;
        }
      `}</style>
    </>
  );
};

export default ProfessionalFloatingContact;