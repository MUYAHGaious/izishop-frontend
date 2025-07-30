import React, { useEffect, useState } from 'react';
import Icon from '../AppIcon';

const LoadingScreen = ({ 
  message = 'Loading...', 
  showProgress = false, 
  progress = 0,
  variant = 'default', // 'default', 'auth', 'minimal'
  className = ''
}) => {
  const [dots, setDots] = useState('');
  const [shouldReduceMotion, setShouldReduceMotion] = useState(false);

  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setShouldReduceMotion(mediaQuery.matches);
    
    const handleChange = (e) => setShouldReduceMotion(e.matches);
    mediaQuery.addEventListener('change', handleChange);
    
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Animated dots for loading text
  useEffect(() => {
    if (shouldReduceMotion) return;
    
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);
    
    return () => clearInterval(interval);
  }, [shouldReduceMotion]);

  const getVariantStyles = () => {
    switch (variant) {
      case 'auth':
        return {
          container: 'min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800',
          card: 'bg-white/95 backdrop-blur-xl border border-white/30 rounded-2xl p-8',
          text: 'text-gray-900',
          spinner: 'border-blue-600',
          accent: 'from-blue-500 to-purple-600'
        };
      case 'minimal':
        return {
          container: 'min-h-screen bg-gray-50',
          card: 'bg-white shadow-lg rounded-xl p-6',
          text: 'text-gray-900',
          spinner: 'border-blue-600',
          accent: 'from-blue-500 to-blue-600'
        };
      default:
        return {
          container: 'min-h-screen bg-background',
          card: 'bg-surface shadow-xl rounded-2xl p-8 border border-border',
          text: 'text-text-primary',
          spinner: 'border-primary',
          accent: 'from-primary to-accent'
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <div className={`${styles.container} relative overflow-hidden flex items-center justify-center p-4 ${className}`}>
      {/* Background Animation (if motion is allowed) */}
      {!shouldReduceMotion && (
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-white/5 rounded-full animate-pulse"></div>
          <div className="absolute top-3/4 right-1/4 w-24 h-24 bg-white/5 rounded-full animate-pulse delay-1000"></div>
          <div className="absolute bottom-1/4 left-1/3 w-20 h-20 bg-white/5 rounded-full animate-pulse delay-500"></div>
        </div>
      )}
      
      <div className={`${styles.card} max-w-sm w-full text-center shadow-2xl relative z-10`}>
        {/* Logo/Brand Section */}
        <div className="mb-6">
          <div className={`w-20 h-20 bg-gradient-to-br ${styles.accent} rounded-2xl flex items-center justify-center mx-auto mb-4 ${!shouldReduceMotion ? 'animate-pulse' : ''}`}>
            <Icon name="ShoppingBag" size={32} className="text-white" />
          </div>
          <h2 className={`text-2xl font-bold ${styles.text} mb-1`}>IziShopin</h2>
          <p className={`text-sm ${styles.text} opacity-60`}>Cameroon's Premier B2B Marketplace</p>
        </div>

        {/* Loading Animation */}
        <div className="mb-6">
          {/* Main Spinner */}
          <div className="relative w-16 h-16 mx-auto mb-4">
            {!shouldReduceMotion ? (
              <>
                <div className={`absolute inset-0 border-4 border-gray-200 rounded-full`}></div>
                <div className={`absolute inset-0 border-4 ${styles.spinner} border-t-transparent rounded-full animate-spin`}></div>
              </>
            ) : (
              <div className={`w-16 h-16 ${styles.spinner.replace('border-', 'bg-')} rounded-full opacity-60`}></div>
            )}
            
            {/* Inner pulse */}
            {!shouldReduceMotion && (
              <div className="absolute inset-2 bg-current opacity-10 rounded-full animate-ping"></div>
            )}
          </div>

          {/* Progress Bar (if enabled) */}
          {showProgress && (
            <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
              <div 
                className={`bg-gradient-to-r ${styles.accent} h-2 rounded-full transition-all duration-300 ease-out`}
                style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
              ></div>
            </div>
          )}
        </div>

        {/* Loading Message */}
        <div className={`${styles.text} space-y-2`}>
          <p className="text-lg font-medium">
            {message}{!shouldReduceMotion ? dots : ''}
          </p>
          {showProgress && (
            <p className="text-sm opacity-60">
              {Math.round(progress)}% complete
            </p>
          )}
        </div>

        {/* Loading Steps Animation (if not reduced motion) */}
        {!shouldReduceMotion && (
          <div className="flex items-center justify-center space-x-2 mt-6">
            <div className="w-2 h-2 bg-current rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-current rounded-full animate-bounce delay-100"></div>
            <div className="w-2 h-2 bg-current rounded-full animate-bounce delay-200"></div>
          </div>
        )}
      </div>
    </div>
  );
};

// Hook for showing loading screen
export const useLoadingScreen = (initialLoading = false) => {
  const [isLoading, setIsLoading] = useState(initialLoading);
  const [message, setMessage] = useState('Loading...');
  const [progress, setProgress] = useState(0);

  const showLoading = (loadingMessage = 'Loading...') => {
    setMessage(loadingMessage);
    setIsLoading(true);
  };

  const hideLoading = () => {
    setIsLoading(false);
    setProgress(0);
  };

  const updateProgress = (newProgress) => {
    setProgress(newProgress);
  };

  const updateMessage = (newMessage) => {
    setMessage(newMessage);
  };

  return {
    isLoading,
    message,
    progress,
    showLoading,
    hideLoading,
    updateProgress,
    updateMessage
  };
};

// Lightweight spinner for inline use
export const Spinner = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };

  return (
    <div className={`${sizeClasses[size]} ${className}`}>
      <div className="w-full h-full border-2 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
    </div>
  );
};

// Page transition loader
export const PageLoader = ({ children, loading, message = 'Loading page...' }) => {
  if (loading) {
    return <LoadingScreen message={message} variant="minimal" />;
  }
  
  return children;
};

export default LoadingScreen;