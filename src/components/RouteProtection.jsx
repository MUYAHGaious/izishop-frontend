import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { showToast } from './ui/Toast';

// Enhanced route protection component with better user experience
const RouteProtection = ({ 
  children, 
  requireAuth = true, 
  roles = [], 
  redirectTo = '/authentication-login-register',
  fallbackComponent = null,
  showUnauthorizedMessage = true 
}) => {
  const { 
    isAuthenticated, 
    user, 
    loading, 
    validateSession, 
    setAuthReturnUrl 
  } = useAuth();
  const location = useLocation();

  // Show loading state while authentication is being verified
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Verifying access...</p>
        </div>
      </div>
    );
  }

  // If authentication is not required, render children
  if (!requireAuth) {
    return children;
  }

  // Check if user is authenticated
  if (!isAuthenticated()) {
    // Store current location for return after login
    setAuthReturnUrl(location.pathname + location.search);
    
    if (showUnauthorizedMessage) {
      showToast({
        type: 'warning',
        message: 'Please log in to access this page',
        duration: 3000
      });
    }
    
    return <Navigate to={redirectTo} replace />;
  }

  // Validate session
  if (!validateSession()) {
    if (showUnauthorizedMessage) {
      showToast({
        type: 'error',
        message: 'Session expired. Please log in again.',
        duration: 4000
      });
    }
    
    return <Navigate to={redirectTo} replace />;
  }

  // Check role-based access
  if (roles.length > 0) {
    const userRole = user?.role?.toUpperCase();
    const allowedRoles = roles.map(role => role.toUpperCase());
    
    if (!allowedRoles.includes(userRole)) {
      if (showUnauthorizedMessage) {
        showToast({
          type: 'error',
          message: `Access denied. This page requires ${roles.join(' or ')} privileges.`,
          duration: 4000
        });
      }
      
      // Redirect to appropriate dashboard based on current role
      const roleRedirects = {
        'SHOP_OWNER': '/shop-owner-dashboard',
        'ADMIN': '/admin-dashboard',
        'CUSTOMER': '/customer-dashboard',
        'CASUAL_SELLER': '/seller-dashboard',
        'DELIVERY_AGENT': '/delivery-dashboard'
      };
      
      const redirectPath = roleRedirects[userRole] || '/product-catalog';
      
      if (fallbackComponent) {
        return fallbackComponent;
      }
      
      return <Navigate to={redirectPath} replace />;
    }
  }

  // All checks passed, render children
  return children;
};

// Predefined route protection components for common use cases
export const PublicRoute = ({ children, redirectIfAuthenticated = true, redirectTo = null }) => {
  const { isAuthenticated, user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }
  
  if (redirectIfAuthenticated && isAuthenticated()) {
    // Determine redirect based on user role if no specific redirect provided
    if (!redirectTo) {
      const roleRedirects = {
        'SHOP_OWNER': '/shop-owner-dashboard',
        'ADMIN': '/admin-dashboard',
        'CUSTOMER': '/customer-dashboard',
        'CASUAL_SELLER': '/seller-dashboard',
        'DELIVERY_AGENT': '/delivery-dashboard'
      };
      
      const userRole = user?.role?.toUpperCase();
      redirectTo = roleRedirects[userRole] || '/product-catalog';
    }
    
    return <Navigate to={redirectTo} replace />;
  }
  
  return children;
};

export const ProtectedRoute = ({ children, roles = [], ...props }) => (
  <RouteProtection roles={roles} {...props}>
    {children}
  </RouteProtection>
);

export const AdminRoute = ({ children, ...props }) => (
  <RouteProtection roles={['ADMIN']} redirectTo="/admin-login" {...props}>
    {children}
  </RouteProtection>
);

export const ShopOwnerRoute = ({ children, ...props }) => (
  <RouteProtection roles={['SHOP_OWNER']} {...props}>
    {children}
  </RouteProtection>
);

export const CustomerRoute = ({ children, ...props }) => (
  <RouteProtection roles={['CUSTOMER']} {...props}>
    {children}
  </RouteProtection>
);

export const SellerRoute = ({ children, ...props }) => (
  <RouteProtection roles={['CASUAL_SELLER']} {...props}>
    {children}
  </RouteProtection>
);

export const DeliveryRoute = ({ children, ...props }) => (
  <RouteProtection roles={['DELIVERY_AGENT']} {...props}>
    {children}
  </RouteProtection>
);

export const MultiRoleRoute = ({ roles, children, ...props }) => (
  <RouteProtection roles={roles} {...props}>
    {children}
  </RouteProtection>
);

// Higher-order component for route protection
export const withRouteProtection = (Component, protectionConfig = {}) => {
  return function ProtectedComponent(props) {
    return (
      <RouteProtection {...protectionConfig}>
        <Component {...props} />
      </RouteProtection>
    );
  };
};

export default RouteProtection;