import React from "react";
import { BrowserRouter, Routes as RouterRoutes, Route } from "react-router-dom";
import ScrollToTop from "components/ScrollToTop";
import ErrorBoundary from "components/ErrorBoundary";
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
import CustomerDashboard from "./pages/customer-dashboard";
import ProductDetail from "./pages/product-detail";
import ProductManagement from "./pages/product-management";
import ShoppingCart from "./pages/shopping-cart";
import NotFound from "./pages/NotFound";

const Routes = () => {
  return (
    <BrowserRouter>
      <ErrorBoundary>
      <ScrollToTop />
      <RouterRoutes>
        {/* Define your routes here */}
        <Route path="/" element={<ProductCatalog />} />
        <Route path="/product-catalog" element={<ProductCatalog />} />
        <Route path="/shopping-cart-checkout" element={<ShoppingCartCheckout />} />
        <Route path="/shop-profile" element={<ShopProfile />} />
        <Route path="/product-detail-modal" element={<ProductDetailModal />} />
        <Route path="/shop-owner-dashboard" element={<ShopOwnerDashboard />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/shops-listing" element={<ShopsListing />} />
        <Route path="/chat-interface-modal" element={<ChatInterfaceModal />} />
        <Route path="/notification-center-modal" element={<NotificationCenterModal />} />
        <Route path="/landing-page" element={<LandingPage />} />
        <Route path="/authentication-login-register" element={<AuthenticationLoginRegister />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/customer-dashboard" element={<CustomerDashboard />} />
        <Route path="/product-detail" element={<ProductDetail />} />
        <Route path="/product-management" element={<ProductManagement />} />
        <Route path="/shopping-cart" element={<ShoppingCart />} />
        <Route path="*" element={<NotFound />} />
      </RouterRoutes>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default Routes;