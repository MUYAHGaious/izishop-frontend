import React, { useState, useEffect } from 'react';
import Icon from '../AppIcon';

const GlassmorphismToast = ({ 
  isVisible, 
  message, 
  type = 'success', // 'success', 'error', 'warning', 'info'
  duration = 4000,
  onClose 
}) => {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setIsAnimating(true);
      const timer = setTimeout(() => {
        handleClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration]);

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => {
      if (onClose) onClose();
    }, 400); // Wait for exit animation to complete
  };

  const getToastConfig = () => {
    const configs = {
      success: {
        icon: 'CheckCircle',
        iconBg: 'bg-emerald-500',
        iconColor: 'text-white',
        textColor: 'text-gray-900',
        borderColor: 'border-emerald-200/50'
      },
      error: {
        icon: 'XCircle',
        iconBg: 'bg-red-500',
        iconColor: 'text-white', 
        textColor: 'text-gray-900',
        borderColor: 'border-red-200/50'
      },
      warning: {
        icon: 'AlertTriangle',
        iconBg: 'bg-amber-500',
        iconColor: 'text-white',
        textColor: 'text-gray-900',
        borderColor: 'border-amber-200/50'
      },
      info: {
        icon: 'Info',
        iconBg: 'bg-blue-500',
        iconColor: 'text-white',
        textColor: 'text-gray-900',
        borderColor: 'border-blue-200/50'
      }
    };
    return configs[type] || configs.success;
  };

  const config = getToastConfig();

  if (!isVisible && !isAnimating) return null;

  return (
    <>
      {/* CSS Keyframes */}
      <style>{`
        @keyframes slideInFromTopCenter {
          0% {
            transform: translateX(-50%) translateY(-120px) scale(0.85);
            opacity: 0;
            filter: blur(8px);
          }
          60% {
            transform: translateX(-50%) translateY(-8px) scale(1.02);
            opacity: 0.9;
            filter: blur(0px);
          }
          100% {
            transform: translateX(-50%) translateY(0px) scale(1);
            opacity: 1;
            filter: blur(0px);
          }
        }
        
        @keyframes slideOutToTopCenter {
          0% {
            transform: translateX(-50%) translateY(0px) scale(1);
            opacity: 1;
            filter: blur(0px);
          }
          100% {
            transform: translateX(-50%) translateY(-120px) scale(0.85);
            opacity: 0;
            filter: blur(8px);
          }
        }
        
        @keyframes progressBar {
          0% { width: 100%; }
          100% { width: 0%; }
        }

        @keyframes iconPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
      `}</style>

      <div 
        className={`fixed top-6 left-1/2 z-[9999] max-w-md w-full px-4`}
        style={{
          transform: 'translateX(-50%)',
          animation: isAnimating 
            ? 'slideInFromTopCenter 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards'
            : 'slideOutToTopCenter 0.4s cubic-bezier(0.55, 0.085, 0.68, 0.53) forwards'
        }}
      >
        <div 
          className={`
            relative overflow-hidden rounded-2xl border ${config.borderColor}
            backdrop-blur-xl backdrop-saturate-150
            bg-white/80 shadow-2xl
          `}
          style={{
            backdropFilter: 'blur(24px) saturate(150%)',
            WebkitBackdropFilter: 'blur(24px) saturate(150%)',
            boxShadow: `
              0 20px 25px -5px rgba(0, 0, 0, 0.1),
              0 10px 10px -5px rgba(0, 0, 0, 0.04),
              0 0 0 1px rgba(255, 255, 255, 0.1) inset
            `,
          }}
        >
          {/* Subtle gradient overlay */}
          <div 
            className="absolute inset-0 opacity-50"
            style={{
              background: `linear-gradient(135deg, 
                rgba(255, 255, 255, 0.4) 0%, 
                rgba(255, 255, 255, 0.1) 100%
              )`,
            }}
          />
          
          {/* Main content */}
          <div className="relative p-4 flex items-center space-x-4">
            {/* Icon */}
            <div 
              className={`
                flex-shrink-0 w-10 h-10 rounded-full 
                ${config.iconBg} ${config.iconColor}
                flex items-center justify-center shadow-lg
              `}
              style={{
                animation: isAnimating ? 'iconPulse 0.6s ease-out' : 'none'
              }}
            >
              <Icon name={config.icon} size={20} />
            </div>
            
            {/* Message */}
            <div className="flex-1 min-w-0">
              <p className={`
                text-sm font-medium leading-5 ${config.textColor}
                break-words
              `}>
                {message}
              </p>
            </div>
            
            {/* Close button */}
            <button
              onClick={handleClose}
              className="
                flex-shrink-0 p-2 rounded-full 
                hover:bg-gray-100/50 active:bg-gray-200/50
                transition-all duration-200 
                text-gray-500 hover:text-gray-700
              "
            >
              <Icon name="X" size={16} />
            </button>
          </div>

          {/* Progress bar */}
          <div className="absolute bottom-0 left-0 w-full h-1 bg-gray-200/30">
            <div 
              className={`h-full ${config.iconBg} transition-all duration-300`}
              style={{
                animation: isAnimating ? `progressBar ${duration}ms linear forwards` : 'none'
              }}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default GlassmorphismToast;