import React, { lazy, Suspense } from "react";
import { Routes as RouterRoutes, Route, Navigate } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";
import ErrorBoundary from "./components/ErrorBoundary";
import { useAuth } from "./contexts/AuthContext";
import RouteGuard, { 
  AdminRouteGuard, 
  ShopOwnerRouteGuard, 
  AuthenticatedRouteGuard, 
  PublicRouteGuard 
} from "./components/RouteGuard";
// Add your imports here
const ProductCatalog = lazy(() => import("./pages/product-catalog"));
const ShoppingCartCheckout = lazy(() => import("./pages/shopping-cart-checkout"));
const ShopProfile = lazy(() => import("./pages/shop-profile"));
const ProductDetailModal = lazy(() => import("./pages/product-detail-modal"));
const ShopOwnerDashboard = lazy(() => import("./pages/shop-owner-dashboard"));
const AdminDashboard = lazy(() => import("./pages/admin-dashboard"));
const AdminLogin = lazy(() => import("./pages/admin-login"));
const ShopsListing = lazy(() => import("./pages/shops-listing"));
const ChatInterfaceModal = lazy(() => import("./pages/chat-interface-modal"));
const MessagesPage = lazy(() => import("./pages/messages"));
const NotificationCenterModal = lazy(() => import("./pages/notification-center-modal"));
const NotificationsPage = lazy(() => import("./pages/notifications"));
const LandingPage = lazy(() => import("./pages/landing-page"));
const AuthenticationLoginRegister = lazy(() => import("./pages/authentication-login-register"));
const Checkout = lazy(() => import("./pages/checkout"));
const ProductDetail = lazy(() => import("./pages/product-detail"));
const ShoppingCart = lazy(() => import("./pages/shopping-cart"));
const NotFound = lazy(() => import("./pages/NotFound"));
const AdminSetup = lazy(() => import("./pages/admin-setup"));
const MyShopProfile = lazy(() => import("./pages/my-shop-profile"));
const AddProduct = lazy(() => import("./pages/add-product"));
const UserProfile = lazy(() => import("./pages/user-profile"));
const PublicProfile = lazy(() => import("./pages/public-profile"));
const Wishlist = lazy(() => import("./pages/wishlist"));
const WishlistDemo = lazy(() => import("./components/ProductDisplay/WishlistDemo"));
const TagDemo = lazy(() => import("./components/ProductDisplay/TagDemo"));
const SellerDashboard = lazy(() => import("./pages/seller-dashboard"));
const MyProducts = lazy(() => import("./pages/my-products"));
const OrderSuccess = lazy(() => import("./pages/order-success"));
const MyOrders = lazy(() => import("./pages/my-orders"));
const CustomerSupport = lazy(() => import("./pages/customer-support"));
const OrderManagement = lazy(() => import("./pages/order-management"));
const CustomerDashboard = lazy(() => import("./pages/customer-dashboard"));
const DeliveryAgentDashboard = lazy(() => import("./pages/delivery-agent-dashboard"));
const UserSettings = lazy(() => import("./pages/user-settings"));
const Settings = lazy(() => import("./pages/Settings"));
const CasualMarketplace = lazy(() => import("./pages/casual-marketplace"));
const CreateShop = lazy(() => import("./pages/CreateShop"));
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
  
  // Enhanced authentication check
  const accessToken = localStorage.getItem('accessToken') || localStorage.getItem('authToken');
  const storedUser = localStorage.getItem('user');
  
  console.log('ProtectedRoute Debug:', {
    accessToken: !!accessToken,
    storedUser: !!storedUser,
    user: user,
    requiredRole,
    userRole: user?.role,
    isAuthenticated: isAuthenticated()
  });
  
  if (!accessToken || !storedUser) {
    console.log('ProtectedRoute: No token or user, redirecting to login');
    return <Navigate to="/authentication-login-register" replace />;
  }
  
  // Parse stored user to check role if user context is not loaded yet
  let userRole = user?.role;
  if (!userRole && storedUser) {
    try {
      const parsedUser = JSON.parse(storedUser);
      userRole = parsedUser.role;
      console.log('ProtectedRoute: Using stored user role:', userRole);
    } catch (e) {
      console.error('ProtectedRoute: Failed to parse stored user');
    }
  }
  
  if (requiredRole && userRole !== requiredRole) {
    console.log('ProtectedRoute: Role mismatch - required:', requiredRole, 'actual:', userRole);
    return <Navigate to="/unauthorized" replace />;
  }
  
  console.log('ProtectedRoute: All checks passed, rendering children');
  return children;
};

// Public Route Component (redirect to dashboard if already logged in)
const PublicRoute = ({ children }) => {
  // Don't use useAuth here - just check localStorage directly to avoid context issues
  const accessToken = localStorage.getItem('accessToken') || localStorage.getItem('authToken');
  const storedUser = localStorage.getItem('user');
  
  if (accessToken && storedUser) {
    try {
      const user = JSON.parse(storedUser);
      // Already logged in, redirect to appropriate page
      // NEW LOGIC: Most users go to product catalog, only admins go to dashboard
      if (user?.role === 'ADMIN') {
        return <Navigate to="/admin-dashboard" replace />;
      } else {
        // All other users (customers, shop owners, delivery agents, etc.) go to product catalog
        return <Navigate to="/product-catalog" replace />;
      }
    } catch (e) {
      // If user data is corrupted, clear it and continue
      localStorage.removeItem('user');
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
      <Route path="/casual-marketplace" element={<CasualMarketplace />} />
      <Route path="/shop/:slug" element={<ShopProfile />} />
      <Route path="/shops/:id" element={<ShopProfile />} />
      <Route path="/create-shop" element={<CreateShop />} />
      <Route path="/product-detail" element={<ProductDetail />} />
      <Route path="/profile/:userId" element={<PublicProfile />} />
      
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
        element={<AdminLogin />}
      />
      
      {/* Admin setup - always accessible */}
      <Route path="/admin-setup" element={<AdminSetup />} />
      
      {/* Protected routes */}
      <Route 
        path="/notifications" 
        element={
          <AuthenticatedRouteGuard>
            <NotificationsPage />
          </AuthenticatedRouteGuard>
        } 
      />
      <Route 
        path="/user-profile" 
        element={
          <AuthenticatedRouteGuard>
            <UserProfile />
          </AuthenticatedRouteGuard>
        } 
      />
      
      <Route 
        path="/settings" 
        element={
          <AuthenticatedRouteGuard>
            <Settings />
          </AuthenticatedRouteGuard>
        } 
      />
      
      <Route
        path="/user-settings"
        element={
          <AuthenticatedRouteGuard>
            <UserSettings />
          </AuthenticatedRouteGuard>
        }
      />

      <Route
        path="/messages"
        element={
          <AuthenticatedRouteGuard>
            <MessagesPage />
          </AuthenticatedRouteGuard>
        }
      />
      <Route 
        path="/shop-owner-dashboard" 
        element={
          <ShopOwnerRouteGuard>
            <ShopOwnerDashboard />
          </ShopOwnerRouteGuard>
        } 
      />
      <Route 
        path="/admin-dashboard" 
        element={
          <AdminRouteGuard>
            <AdminDashboard />
          </AdminRouteGuard>
        } 
      />
      <Route 
        path="/customer-dashboard" 
        element={
          <ProtectedRoute requiredRole="CUSTOMER">
            <CustomerDashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/delivery-agent-dashboard" 
        element={
          <ProtectedRoute requiredRole="DELIVERY_AGENT">
            <DeliveryAgentDashboard />
          </ProtectedRoute>
        } 
      />
      
      {/* Cart and checkout - require authentication */}
      <Route 
        path="/shopping-cart" 
        element={
          <AuthenticatedRouteGuard>
            <ShoppingCart />
          </AuthenticatedRouteGuard>
        } 
      />
      <Route 
        path="/shopping-cart-checkout" 
        element={
          <AuthenticatedRouteGuard>
            <ShoppingCartCheckout />
          </AuthenticatedRouteGuard>
        } 
      />
      <Route 
        path="/checkout" 
        element={
          <AuthenticatedRouteGuard>
            <Checkout />
          </AuthenticatedRouteGuard>
        } 
      />
      
      {/* Order success page */}
      <Route 
        path="/order-success" 
        element={
          <AuthenticatedRouteGuard>
            <OrderSuccess />
          </AuthenticatedRouteGuard>
        } 
      />
      
      {/* My orders page */}
      <Route 
        path="/my-orders" 
        element={
          <AuthenticatedRouteGuard>
            <MyOrders />
          </AuthenticatedRouteGuard>
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
      
      {/* Shop profile - public view with shop ID */}
      <Route 
        path="/my-shop-profile/:shopId" 
        element={<MyShopProfile />} 
      />
      
      {/* Shop profile - private view for shop owners */}
      <Route 
        path="/my-shop-profile" 
        element={
          <ProtectedRoute requiredRole="SHOP_OWNER">
            <MyShopProfile />
          </ProtectedRoute>
        } 
      />
      
             {/* Demo route for testing wishlist */}
       <Route
         path="/wishlist-demo"
         element={<WishlistDemo />}
       />
       
       {/* Demo route for testing tagging system */}
       <Route
         path="/tag-demo"
         element={<TagDemo />}
       />
      
      {/* Customer routes */}
      <Route 
        path="/wishlist" 
        element={
          <AuthenticatedRouteGuard>
            <Wishlist />
          </AuthenticatedRouteGuard>
        } 
      />
      
      {/* Casual seller routes */}
      <Route 
        path="/seller-dashboard" 
        element={
          <AuthenticatedRouteGuard>
            <SellerDashboard />
          </AuthenticatedRouteGuard>
        } 
      />
      <Route 
        path="/my-products" 
        element={
          <AuthenticatedRouteGuard>
            <MyProducts />
          </AuthenticatedRouteGuard>
        } 
      />
      <Route 
        path="/sales" 
        element={
          <AuthenticatedRouteGuard>
            <div className="min-h-screen bg-gray-50 p-8">
              <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Sales Analytics</h1>
                <p className="text-gray-600">Sales reports and analytics will be available here.</p>
              </div>
            </div>
          </AuthenticatedRouteGuard>
        } 
      />
      
      {/* Modal routes */}
      <Route path="/product-detail-modal" element={<ProductDetailModal />} />
      <Route path="/chat-interface-modal" element={<ChatInterfaceModal />} />
      <Route path="/notification-center-modal" element={<NotificationCenterModal />} />
      
      {/* Redirects for old routes */}
      <Route path="/landing-page" element={<Navigate to="/" replace />} />
      <Route path="/shop-profile" element={<Navigate to="/shops-listing" replace />} />
      
      {/* Customer Support */}
      <Route 
        path="/customer-support" 
        element={
          <AuthenticatedRouteGuard>
            <CustomerSupport />
          </AuthenticatedRouteGuard>
        } 
      />
      
      {/* Order Management */}
      <Route 
        path="/order-management" 
        element={
          <ShopOwnerRouteGuard>
            <OrderManagement />
          </ShopOwnerRouteGuard>
        } 
      />
      
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
    <ErrorBoundary>
      <ScrollToTop />
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      }>
        <AppRoutes />
      </Suspense>
    </ErrorBoundary>
  );
};

export default Routes;

