import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { showToast } from './ui/Toast';

const RouteGuard = ({ 
  children, 
  requireAuth = true, 
  requiredRole = null, 
  redirectTo = '/authentication-login-register',
  adminOnly = false 
}) => {
  const { 
    isAuthenticated, 
    user, 
    hasRole, 
    validateSession, 
    forceLogout,
    setAuthReturnUrl,
    loading,
    isInitializing,
    authCheckComplete
  } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [retryCount, setRetryCount] = useState(0);
  const [isChecking, setIsChecking] = useState(false);
  const timeoutRef = useRef(null);
  const MAX_RETRIES = 5;

  useEffect(() => {
    const checkAccess = async () => {
      // If no authentication required, allow access
      if (!requireAuth) {
        setIsChecking(false);
        return;
      }

      setIsChecking(true);

      // Don't redirect if AuthContext is still initializing or loading
      if (isInitializing || loading || !authCheckComplete) {
        console.log('RouteGuard: AuthContext still initializing/loading, waiting...', {
          isInitializing,
          loading,
          authCheckComplete
        });
        setIsChecking(false);
        return;
      }
      
      // Additional check: if this is an admin route and we just logged in as admin, give it more time
      if (adminOnly && localStorage.getItem('adminSession') === 'true' && !user) {
        console.log('RouteGuard: Admin route detected but user not loaded yet, waiting...');
        setTimeout(() => {
          if (!isInitializing && !loading && authCheckComplete) {
            checkAccess();
          }
        }, 100);
        return;
      }
      
      // Add a small delay to ensure AuthContext is fully stabilized
      // Reduce delay for admin routes to prevent flash
      const delay = adminOnly ? 50 : 200;
      await new Promise(resolve => setTimeout(resolve, delay));

      // Check if user is authenticated
      const authResult = isAuthenticated();
      console.log('RouteGuard: Checking authentication - isAuthenticated():', authResult, 'user:', !!user);
      
      // More robust authentication check - also check localStorage directly
      const hasToken = localStorage.getItem('accessToken');
      const hasUser = localStorage.getItem('user');
      
      console.log('RouteGuard: Token check - hasToken:', !!hasToken, 'hasUser:', !!hasUser);
      console.log('RouteGuard: AuthContext state - loading:', loading, 'isInitializing:', isInitializing);
      console.log('RouteGuard: Current path:', location.pathname);
      
      // Be very aggressive about preventing redirects on page reload
      // Only redirect if we're absolutely sure there's no valid authentication
      const hasValidTokens = hasToken && hasUser;
      const shouldRedirect = !authResult && !hasValidTokens;
      
      if (shouldRedirect) {
        // One final check - try to parse user data to be absolutely sure
        try {
          const userData = JSON.parse(hasUser || '{}');
          if (userData.id && hasToken) {
            console.log('RouteGuard: Found valid user data in final check, NOT redirecting');
            setIsChecking(false);
            return;
          }
        } catch (error) {
          console.log('RouteGuard: Failed to parse user data, proceeding with redirect');
        }
        
        console.log('RouteGuard: User not authenticated, redirecting to login');
        console.log('RouteGuard: Redirect reason - authResult:', authResult, 'hasToken:', !!hasToken, 'hasUser:', !!hasUser);
        
        // Store the current URL for return after authentication
        setAuthReturnUrl(location.pathname + location.search);
        
        showToast({
          type: 'warning',
          message: 'Please log in to access this page',
          duration: 3000
        });
        
        navigate(redirectTo);
        return;
      }
      
      // If we have tokens but user state is not set yet (timing issue), wait a bit
      if (hasToken && hasUser && !user) {
        if (retryCount < MAX_RETRIES) {
          console.log(`RouteGuard: Tokens exist but user state not loaded yet, retrying... (${retryCount + 1}/${MAX_RETRIES})`);
          console.log('RouteGuard: AuthContext state - loading:', loading, 'isInitializing:', isInitializing);
          setRetryCount(prev => prev + 1);
          timeoutRef.current = setTimeout(() => checkAccess(), 500); // Reduced delay for faster response
          return;
        } else {
          console.log('RouteGuard: Max retries reached, trying to load user from localStorage');
          // Try to load user from localStorage as fallback
          try {
            const storedUser = JSON.parse(localStorage.getItem('user'));
            if (storedUser && storedUser.id) {
              console.log('RouteGuard: Successfully loaded user from localStorage, allowing access');
              // Don't set user state here, let AuthContext handle it
              // Just allow access to continue
              setIsChecking(false);
              return;
            }
          } catch (error) {
            console.error('RouteGuard: Failed to parse stored user data:', error);
          }
          
          console.log('RouteGuard: Max retries reached and no valid user data, forcing logout');
          await forceLogout('User data not available after retries');
          navigate(redirectTo);
          return;
        }
      }

      // Validate the session only if user is loaded
      if (user && !validateSession()) {
        console.log('RouteGuard: Invalid session detected');
        console.log('RouteGuard: Session validation failed - user:', user, 'sessionId:', localStorage.getItem('sessionId'), 'currentRole:', localStorage.getItem('currentRole'), 'adminSession:', localStorage.getItem('adminSession'));
        console.log('RouteGuard: AuthContext state - isInitializing:', isInitializing, 'loading:', loading, 'authCheckComplete:', authCheckComplete);
        
        // Only force logout if this is not an admin session or if we're absolutely sure the session is invalid
        const isAdminSession = localStorage.getItem('adminSession') === 'true';
        const hasValidTokens = localStorage.getItem('accessToken') && localStorage.getItem('user');
        
        if (!isAdminSession || !hasValidTokens) {
          console.log('RouteGuard: Forcing logout due to invalid session');
          await forceLogout('Invalid session detected');
          navigate(redirectTo);
          return;
        } else {
          console.log('RouteGuard: Admin session with valid tokens, not forcing logout');
          // Allow the admin session to continue
        }
      }

      // Check for admin-only routes
      if (adminOnly) {
        // Check both AuthContext state and localStorage as fallback
        const isAdmin = user?.role === 'ADMIN' || 
                       localStorage.getItem('currentRole') === 'ADMIN' ||
                       localStorage.getItem('adminSession') === 'true';
        
        console.log('RouteGuard: Admin check - user role:', user?.role, 'localStorage role:', localStorage.getItem('currentRole'), 'adminSession:', localStorage.getItem('adminSession'), 'isAdmin:', isAdmin);
        
        if (!isAdmin) {
          console.log('RouteGuard: Admin access denied, redirecting to admin login');
          
          showToast({
            type: 'error',
            message: 'Admin access required for this page',
            duration: 4000
          });
          
          // Redirect admin-only routes to admin login
          navigate('/admin-login');
          return;
        } else {
          console.log('RouteGuard: Admin access granted');
        }
      }

      // Check for specific role requirements
      if (requiredRole && !hasRole(requiredRole)) {
        console.log('RouteGuard: Required role not met', { 
          required: requiredRole, 
          current: user?.role,
          isLoading: loading,
          isInitializing: isInitializing
        });
        
        // Double-check with localStorage before showing error
        const hasToken = localStorage.getItem('accessToken');
        const hasStoredUser = localStorage.getItem('user');
        
        if (hasToken && hasStoredUser) {
          try {
            const storedUserData = JSON.parse(hasStoredUser);
            const normalized = (r) => (r || '').toString().toUpperCase();
            
            if (normalized(storedUserData.role) === normalized(requiredRole)) {
              console.log('RouteGuard: Role check passed via localStorage fallback');
              setIsChecking(false);
              return;
            }
          } catch (error) {
            console.error('RouteGuard: Failed to parse stored user for role check:', error);
          }
        }
        
        showToast({
          type: 'error',
          message: `Access denied. This page requires ${requiredRole} privileges.`,
          duration: 4000
        });
        
        // Redirect to appropriate dashboard based on current role
        switch (user?.role) {
          case 'SHOP_OWNER':
            navigate('/shop-owner-dashboard');
            break;
          case 'ADMIN':
            navigate('/admin-dashboard');
            break;
          case 'CUSTOMER':
          case 'CASUAL_SELLER':
          case 'DELIVERY_AGENT':
          default:
            navigate('/product-catalog');
            break;
        }
        return;
      }

      // Additional security check for role switching prevention
      const storedRole = localStorage.getItem('currentRole');
      console.log('RouteGuard: Role check - user.role:', user?.role, 'storedRole:', storedRole);
      
      if (user?.role && storedRole && user.role !== storedRole) {
        console.log('RouteGuard: Role mismatch detected, forcing logout for security');
        await forceLogout('Role mismatch detected');
        navigate(redirectTo);
        return;
      }

      // All checks passed
      setIsChecking(false);
    };

    // Reset retry count when user changes (but not during retries)
    if (user) {
      setRetryCount(0);
    }
    
    checkAccess();
    
    // Cleanup timeout on unmount
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [
    requireAuth,
    requiredRole,
    adminOnly,
    isAuthenticated,
    user,
    location.pathname,
    location.search,
    navigate,
    redirectTo,
    isInitializing,
    loading
  ]);

  // Show loading while checking authentication, initializing, or if AuthContext is loading
  if (loading || isInitializing || !authCheckComplete || (isChecking && requireAuth)) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">
            {isInitializing ? 'Initializing session...' : 
             loading ? 'Loading...' : 
             'Verifying authentication...'}
          </p>
          {retryCount > 0 && (
            <p className="text-xs text-gray-500 mt-2">Attempt {retryCount}/{MAX_RETRIES}</p>
          )}
        </div>
      </div>
    );
  }

  // If authentication is required but user is not authenticated, check localStorage as fallback
  if (requireAuth && !isAuthenticated()) {
    // Don't redirect during initialization - AuthContext is still loading
    if (isInitializing || loading || !authCheckComplete) {
      console.log('RouteGuard: Auth required but still initializing, showing loading...');
      return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading session...</p>
          </div>
        </div>
      );
    }
    
    // Final fallback: check if we have valid tokens and user data in localStorage
    const hasToken = localStorage.getItem('accessToken');
    const hasStoredUser = localStorage.getItem('user');
    
    if (hasToken && hasStoredUser) {
      try {
        const storedUser = JSON.parse(hasStoredUser);
        if (storedUser.id) {
          console.log('RouteGuard: Using localStorage fallback for authentication');
          // Allow render, AuthContext will catch up
        } else {
          return null;
        }
      } catch (error) {
        return null;
      }
    } else {
      return null;
    }
  }

  // If specific role is required but user doesn't have it, check localStorage fallback
  if (requiredRole && !hasRole(requiredRole)) {
    if (!user) {
      // Check localStorage as fallback
      try {
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        if (storedUser.role && storedUser.role === requiredRole) {
          console.log('RouteGuard: Using localStorage fallback for role check');
          // Allow render, AuthContext will catch up
        } else {
          return null;
        }
      } catch (error) {
        return null;
      }
    } else {
      return null;
    }
  }

  // If admin only but user is not admin, check localStorage fallback
  if (adminOnly && user?.role !== 'ADMIN') {
    if (!user) {
      // Check localStorage as fallback
      try {
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        if (storedUser.role === 'ADMIN') {
          console.log('RouteGuard: Using localStorage fallback for admin check');
          // Allow render, AuthContext will catch up
        } else {
          return null;
        }
      } catch (error) {
        return null;
      }
    } else {
      return null;
    }
  }

  // All checks passed, render the protected content
  return children;
};

// Specialized route guards for common use cases
export const AdminRouteGuard = ({ children, redirectTo = '/admin-login' }) => (
  <RouteGuard 
    requireAuth={true} 
    adminOnly={true} 
    redirectTo={redirectTo}
  >
    {children}
  </RouteGuard>
);

export const ShopOwnerRouteGuard = ({ children }) => (
  <RouteGuard 
    requireAuth={true} 
    requiredRole="SHOP_OWNER"
  >
    {children}
  </RouteGuard>
);

export const CustomerRouteGuard = ({ children }) => (
  <RouteGuard 
    requireAuth={true} 
    requiredRole="CUSTOMER"
  >
    {children}
  </RouteGuard>
);

export const AuthenticatedRouteGuard = ({ children }) => (
  <RouteGuard requireAuth={true}>
    {children}
  </RouteGuard>
);

export const PublicRouteGuard = ({ children }) => (
  <RouteGuard requireAuth={false}>
    {children}
  </RouteGuard>
);

export default RouteGuard;