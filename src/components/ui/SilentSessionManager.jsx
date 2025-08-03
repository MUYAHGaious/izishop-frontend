import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import secureSessionService from '../../services/secureSessionService';

/**
 * Silent Session Manager Component
 * Handles session events without user interruption
 * Follows security best practices for session management
 */
const SilentSessionManager = () => {
  // Temporarily disabled to prevent errors - will re-enable after testing
  return null;
  
  const navigate = useNavigate();
  const { logout, isAuthenticated } = useAuth();
  const hasNotifiedLogout = useRef(false);

  useEffect(() => {
    try {
      // Listen for silent logout events
      const handleSilentLogout = (event) => {
        try {
          const { reason } = event.detail || {};
          
          // Prevent multiple logout attempts
          if (hasNotifiedLogout.current) return;
          hasNotifiedLogout.current = true;
          
          // Perform cleanup
          if (logout) {
            logout();
          }
          
          // Redirect to login page with return URL
          const currentPath = window.location.pathname;
          const returnUrl = encodeURIComponent(currentPath !== '/authentication-login-register' ? currentPath : '/product-catalog');
          
          // Use setTimeout to ensure state updates complete
          setTimeout(() => {
            if (navigate) {
              navigate(`/authentication-login-register?return=${returnUrl}`, { 
                replace: true 
              });
            }
            
            // Reset flag after navigation
            setTimeout(() => {
              hasNotifiedLogout.current = false;
            }, 1000);
          }, 100);
        } catch (error) {
          console.error('Error handling silent logout:', error);
          hasNotifiedLogout.current = false;
        }
      };

      // Listen for session events
      const handleSessionEvent = (sessionData) => {
        try {
          if (!sessionData || !sessionData.type) return;
          
          switch (sessionData.type) {
            case 'silent_refresh_success':
              // Session refreshed successfully - no action needed
              break;
              
            case 'silent_logout':
              // Handle logout silently
              handleSilentLogout({ detail: { reason: sessionData.reason } });
              break;
              
            default:
              break;
          }
        } catch (error) {
          console.error('Error handling session event:', error);
        }
      };

      // Add event listeners with error handling
      window.addEventListener('silentLogout', handleSilentLogout);
      
      let unsubscribe = () => {};
      if (secureSessionService && secureSessionService.addSessionListener) {
        unsubscribe = secureSessionService.addSessionListener(handleSessionEvent);
      }

      // Cleanup
      return () => {
        try {
          window.removeEventListener('silentLogout', handleSilentLogout);
          if (unsubscribe) {
            unsubscribe();
          }
        } catch (error) {
          console.error('Error cleaning up SilentSessionManager:', error);
        }
      };
    } catch (error) {
      console.error('Error initializing SilentSessionManager:', error);
      return () => {}; // Return empty cleanup function
    }
  }, [navigate, logout]);

  // Reset logout flag when user authenticates
  useEffect(() => {
    if (isAuthenticated()) {
      hasNotifiedLogout.current = false;
    }
  }, [isAuthenticated]);

  // This component renders nothing - it only handles events
  return null;
};

export default SilentSessionManager;