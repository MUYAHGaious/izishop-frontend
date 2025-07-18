import React from "react";
import { BrowserRouter, Routes as RouterRoutes, Route, Navigate } from "react-router-dom";
import ScrollToTop from "components/ScrollToTop";
import ErrorBoundary from "components/ErrorBoundary";
import { useAuth } from "./contexts/AuthContext";
// Add your imports here
import ProductCatalog from "./pages/product-catalog";
import ShoppingCartCheckout from "./pages/shopping-cart-checkout";
import ShopProfile from "./pages/shop-profile";
import ProductDetailModal from "./pages/product-detail-modal";
import ShopOwnerDashboard from "./pages/shop-owner-dashboard";
import AdminDashboard from "./pages/admin-dashboard";
import AdminLogin from "./pages/admin-login";
import ShopsListing from "./pages/shops-listing";
import ChatInterfaceModal from "./pages/chat-interface-modal";
import NotificationCenterModal from "./pages/notification-center-modal";
import LandingPage from "./pages/landing-page";
import AuthenticationLoginRegister from "./pages/authentication-login-register";
import Checkout from "./pages/checkout";
import ProductDetail from "./pages/product-detail";
import ShoppingCart from "./pages/shopping-cart";
import NotFound from "./pages/NotFound";
import AdminSetup from "./pages/admin-setup";
import MyShopProfile from "./pages/my-shop-profile";
import AddProduct from "./pages/add-product";

// Protected Route Component
const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { user, isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    </div>;
  }
  
  if (!isAuthenticated()) {
    return <Navigate to="/authentication-login-register" replace />;
  }
  
  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }
  
  return children;
};

// Public Route Component (redirect to dashboard if already logged in)
const PublicRoute = ({ children }) => {
  const { user, isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    </div>;
  }
  
  if (isAuthenticated()) {
    // Redirect to appropriate dashboard based on user role
    if (user?.role === 'SHOP_OWNER') {
      return <Navigate to="/shop-owner-dashboard" replace />;
    } else if (user?.role === 'ADMIN') {
      return <Navigate to="/admin-dashboard" replace />;
    } else {
      return <Navigate to="/customer-dashboard" replace />;
    }
  }
  
  return children;
};

const AppRoutes = () => {
  return (
    <RouterRoutes>
      {/* Public routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/product-catalog" element={<ProductCatalog />} />
      <Route path="/shops-listing" element={<ShopsListing />} />
      <Route path="/shop/:slug" element={<ShopProfile />} />
      <Route path="/shops/:id" element={<ShopProfile />} />
      <Route path="/product-detail" element={<ProductDetail />} />
      
      {/* Auth routes - only show if not authenticated */}
      <Route 
        path="/authentication-login-register" 
        element={
          <PublicRoute>
            <AuthenticationLoginRegister />
          </PublicRoute>
        } 
      />
      <Route 
        path="/admin-login" 
        element={
          <PublicRoute>
            <AdminLogin />
          </PublicRoute>
        } 
      />
      
      {/* Admin setup - always accessible */}
      <Route path="/admin-setup" element={<AdminSetup />} />
      
      {/* Protected routes */}
      <Route 
        path="/shop-owner-dashboard" 
        element={
          <ProtectedRoute requiredRole="SHOP_OWNER">
            <ShopOwnerDashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin-dashboard" 
        element={
          <ProtectedRoute requiredRole="ADMIN">
            <AdminDashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/customer-dashboard" 
        element={
          <ProtectedRoute requiredRole="CUSTOMER">
            <div className="min-h-screen bg-gray-50 p-8">
              <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Customer Dashboard</h1>
                <p className="text-gray-600">Welcome to your customer dashboard!</p>
              </div>
            </div>
          </ProtectedRoute>
        } 
      />
      
      {/* Cart and checkout - require authentication */}
      <Route 
        path="/shopping-cart" 
        element={
          <ProtectedRoute>
            <ShoppingCart />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/shopping-cart-checkout" 
        element={
          <ProtectedRoute>
            <ShoppingCartCheckout />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/checkout" 
        element={
          <ProtectedRoute>
            <Checkout />
          </ProtectedRoute>
        } 
      />
      
      
      {/* Add product - shop owners only */}
      <Route 
        path="/add-product" 
        element={
          <ProtectedRoute requiredRole="SHOP_OWNER">
            <AddProduct />
          </ProtectedRoute>
        } 
      />
      
      {/* Shop profile - shop owners only */}
      <Route 
        path="/shop-profile/:shopId" 
        element={
          <ProtectedRoute requiredRole="SHOP_OWNER">
            <MyShopProfile />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/my-shop-profile" 
        element={
          <ProtectedRoute requiredRole="SHOP_OWNER">
            <MyShopProfile />
          </ProtectedRoute>
        } 
      />
      
      {/* Modal routes */}
      <Route path="/product-detail-modal" element={<ProductDetailModal />} />
      <Route path="/chat-interface-modal" element={<ChatInterfaceModal />} />
      <Route path="/notification-center-modal" element={<NotificationCenterModal />} />
      
      {/* Redirects for old routes */}
      <Route path="/landing-page" element={<Navigate to="/" replace />} />
      <Route path="/shop-profile" element={<Navigate to="/shops-listing" replace />} />
      
      {/* Error routes */}
      <Route path="/unauthorized" element={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Unauthorized</h1>
            <p className="text-gray-600 mb-8">You don't have permission to access this page.</p>
            <button 
              onClick={() => window.history.back()} 
              className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark"
            >
              Go Back
            </button>
          </div>
        </div>
      } />
      
      <Route path="*" element={<NotFound />} />
    </RouterRoutes>
  );
};

const Routes = () => {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <ScrollToTop />
        <AppRoutes />
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default Routes;

