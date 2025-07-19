import React, { useEffect } from 'react';
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
    setAuthReturnUrl 
  } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkAccess = async () => {
      // If no authentication required, allow access
      if (!requireAuth) {
        return;
      }

      // Check if user is authenticated
      if (!isAuthenticated()) {
        console.log('RouteGuard: User not authenticated, redirecting to login');
        
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

      // Validate the session
      if (!validateSession()) {
        console.log('RouteGuard: Invalid session detected, forcing logout');
        await forceLogout('Invalid session detected');
        navigate(redirectTo);
        return;
      }

      // Check for admin-only routes
      if (adminOnly && user?.role !== 'ADMIN') {
        console.log('RouteGuard: Admin access required, current role:', user?.role);
        
        showToast({
          type: 'error',
          message: 'Admin access required for this page',
          duration: 4000
        });
        
        // Redirect admin-only routes to admin login
        navigate('/admin-login');
        return;
      }

      // Check for specific role requirements
      if (requiredRole && !hasRole(requiredRole)) {
        console.log('RouteGuard: Required role not met', { 
          required: requiredRole, 
          current: user?.role 
        });
        
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
      if (user?.role !== storedRole) {
        console.log('RouteGuard: Role mismatch detected, forcing logout for security');
        await forceLogout('Role mismatch detected');
        navigate(redirectTo);
        return;
      }
    };

    checkAccess();
  }, [
    requireAuth,
    requiredRole,
    adminOnly,
    isAuthenticated,
    user,
    location.pathname,
    location.search,
    navigate,
    redirectTo
  ]);

  // If authentication is required but user is not authenticated, don't render
  if (requireAuth && !isAuthenticated()) {
    return null;
  }

  // If specific role is required but user doesn't have it, don't render
  if (requiredRole && !hasRole(requiredRole)) {
    return null;
  }

  // If admin only but user is not admin, don't render
  if (adminOnly && user?.role !== 'ADMIN') {
    return null;
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