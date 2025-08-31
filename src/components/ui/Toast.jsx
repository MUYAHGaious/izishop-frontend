import React, { useState, useEffect } from 'react';
import Icon from '../AppIcon';

const Toast = ({ message, type = 'success', duration = 3000, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Wait for animation to complete
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getToastStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      default:
        return 'bg-green-50 border-green-200 text-green-800';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return 'CheckCircle';
      case 'error':
        return 'XCircle';
      case 'warning':
        return 'AlertTriangle';
      case 'info':
        return 'Info';
      default:
        return 'CheckCircle';
    }
  };

  return (
    <div
      className={`fixed top-20 right-4 z-[9999] max-w-sm w-full border rounded-xl p-4 shadow-lg transition-all duration-300 ${
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      } ${getToastStyles()}`}
    >
      <div className="flex items-center space-x-3">
        <Icon name={getIcon()} size={20} />
        <div className="flex-1">
          <p className="text-sm font-medium">{message}</p>
        </div>
        <button
          onClick={() => {
            setIsVisible(false);
            setTimeout(onClose, 300);
          }}
          className="text-current hover:opacity-70 transition-opacity"
        >
          <Icon name="X" size={16} />
        </button>
      </div>
    </div>
  );
};

// Toast Manager Component
export const ToastManager = () => {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const handleToast = (event) => {
      const { message, type, duration } = event.detail;
      
      // Validate event data
      if (!message || typeof message !== 'string') {
        console.warn('ToastManager: Invalid toast event received', event.detail);
        return;
      }
      
      const id = Date.now();
      
      setToasts(prev => {
        // Prevent excessive toasts
        if (prev.length > 10) {
          return [...prev.slice(-9), { id, message, type, duration }];
        }
        return [...prev, { id, message, type, duration }];
      });
    };

    // Use a more specific event listener to avoid conflicts
    const eventName = 'showToast';
    window.addEventListener(eventName, handleToast);
    return () => window.removeEventListener(eventName, handleToast);
  }, []);

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  // Auto-remove toasts after duration
  useEffect(() => {
    if (toasts.length === 0) return;
    
    const timers = toasts.map(toast => 
      setTimeout(() => removeToast(toast.id), toast.duration || 3000)
    );
    
    return () => {
      timers.forEach(timer => clearTimeout(timer));
    };
  }, [toasts]);

  return (
    <>
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </>
  );
};

// Helper function to show toast
export const showToast = (options) => {
  // Ensure we're not in a render phase
  if (typeof window === 'undefined') return;
  
  const { message, type = 'success', duration = 3000 } = typeof options === 'string' 
    ? { message: options } 
    : options;
  
  // Validate options
  if (!message || typeof message !== 'string') {
    console.warn('showToast: Invalid message provided', options);
    return;
  }
  
  const event = new CustomEvent('showToast', {
    detail: { message, type, duration }
  });
  window.dispatchEvent(event);
};

export default Toast;

