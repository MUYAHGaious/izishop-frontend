import React, { useState, useEffect } from 'react';
import Icon from '../AppIcon';
import Button from './Button';
import { useAuth } from '../../contexts/AuthContext';
import authService from '../../services/authService';

const SessionExpiryWarning = () => {
  const { logout } = useAuth();
  const [show, setShow] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isExtending, setIsExtending] = useState(false);

  useEffect(() => {
    const checkSessionExpiry = () => {
      const accessToken = authService.getAccessToken();
      if (!accessToken) {
        setShow(false);
        return;
      }

      const payload = authService.decodeToken(accessToken);
      if (!payload?.exp) {
        setShow(false);
        return;
      }

      const currentTime = Math.floor(Date.now() / 1000);
      const timeUntilExpiry = payload.exp - currentTime;
      
      // Show warning when less than 5 minutes remain
      if (timeUntilExpiry > 0 && timeUntilExpiry <= 300) {
        setShow(true);
        setTimeRemaining(timeUntilExpiry);
      } else {
        setShow(false);
      }
    };

    // Check immediately
    checkSessionExpiry();

    // Check every 30 seconds
    const interval = setInterval(checkSessionExpiry, 30000);

    // Listen for token refresh events
    const handleTokenRefresh = () => {
      setShow(false);
    };

    window.addEventListener('tokenRefresh', handleTokenRefresh);

    return () => {
      clearInterval(interval);
      window.removeEventListener('tokenRefresh', handleTokenRefresh);
    };
  }, []);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleExtendSession = async () => {
    try {
      setIsExtending(true);
      await authService.refreshAccessToken();
      setShow(false);
    } catch (error) {
      console.error('Failed to extend session:', error);
      // If refresh fails, logout
      await logout();
    } finally {
      setIsExtending(false);
    }
  };

  const handleLogoutNow = async () => {
    await logout();
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
            <Icon name="Clock" size={24} className="text-yellow-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Session Expiring Soon</h3>
            <p className="text-sm text-gray-600">
              Your session will expire in {formatTime(timeRemaining)}
            </p>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-start space-x-2">
            <Icon name="AlertTriangle" size={16} className="text-yellow-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-yellow-800">
              <p className="font-medium mb-1">Save your work</p>
              <p>
                To prevent data loss, please save any unsaved changes before your session expires.
              </p>
            </div>
          </div>
        </div>

        <div className="flex space-x-3">
          <Button
            variant="outline"
            onClick={handleLogoutNow}
            className="flex-1"
            disabled={isExtending}
          >
            Logout Now
          </Button>
          <Button
            variant="default"
            onClick={handleExtendSession}
            className="flex-1"
            disabled={isExtending}
            iconName={isExtending ? "Loader2" : "RefreshCw"}
            iconPosition="left"
          >
            {isExtending ? 'Extending...' : 'Extend Session'}
          </Button>
        </div>

        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">
            This session will automatically extend when you perform actions in the app
          </p>
        </div>
      </div>
    </div>
  );
};

export default SessionExpiryWarning;