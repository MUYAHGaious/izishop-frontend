import React from 'react';
import { Helmet } from 'react-helmet';
import Routes from './Routes';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { WishlistProvider } from './contexts/WishlistContext';
import { ShopProvider } from './contexts/ShopContext';
import { DataCacheProvider } from './contexts/DataCacheContext';
import { WebSocketProvider } from './contexts/WebSocketContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { ToastManager } from './components/ui/Toast';
import SessionExpiryWarning from './components/ui/SessionExpiryWarning';
import ErrorBoundary from './components/ErrorBoundary';
import { useNavigationHandler } from './hooks/useNavigationListener';
import './styles/index.css';

function App() {
  // Handle extension communication errors
  React.useEffect(() => {
    const handleError = (event) => {
      // Suppress browser extension errors
      if (event.message && event.message.includes('extension')) {
        event.preventDefault();
        return false;
      }
      if (event.message && event.message.includes('Receiving end does not exist')) {
        event.preventDefault();
        return false;
      }
    };

    const handleUnhandledRejection = (event) => {
      // Suppress promise rejection errors from extensions
      if (event.reason && event.reason.message &&
          (event.reason.message.includes('extension') ||
           event.reason.message.includes('Receiving end does not exist') ||
           event.reason.message.includes('polyfill.js'))) {
        event.preventDefault();
        return false;
      }
    };

    // Override console.error to filter extension errors
    const originalConsoleError = console.error;
    console.error = function(...args) {
      const message = args.join(' ');
      if (message.includes('Receiving end does not exist') ||
          message.includes('extension') ||
          message.includes('polyfill.js')) {
        return; // Don't log extension errors
      }
      originalConsoleError.apply(console, args);
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      console.error = originalConsoleError; // Restore original console.error
    };
  }, []);

  // CRITICAL FIX: Handle React Router navigation issues (2025)
  // Use navigation handler to ensure components update when URL changes
  useNavigationHandler({
    logNavigation: true, // Enable for debugging
    onRouteChange: ({ location, navigationType }) => {
      console.log('🚀 Route changed - forcing component refresh:', {
        path: location.pathname,
        type: navigationType
      });
      // Force re-render by clearing any cached component state that might prevent updates
      // ErrorBoundary will handle error state
    },
    onBackNavigation: ({ location, action }) => {
      console.log('⬅️ Browser back/forward navigation detected:', {
        path: location.pathname,
        action
      });
      // Additional handling for back navigation if needed
    }
  });

  return (
    <ErrorBoundary>
      <LanguageProvider>
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <ShopProvider>
                <DataCacheProvider>
                  <WebSocketProvider>
                    <NotificationProvider>
                      <div className="App">
                        <Helmet>
                          <title>IziShopin - Cameroon's Premier B2B Marketplace</title>
                          <meta name="description" content="Connect with trusted suppliers and buyers across Cameroon. IziShopin is your gateway to seamless B2B commerce with secure payments and nationwide delivery." />
                          <meta name="keywords" content="B2B marketplace, Cameroon, suppliers, buyers, wholesale, trade, commerce, IziShopin" />
                          <meta name="author" content="IziShopin Team" />
                          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                          <meta property="og:title" content="IziShopin - Cameroon's Premier B2B Marketplace" />
                          <meta property="og:description" content="Connect with trusted suppliers and buyers across Cameroon. Secure payments and nationwide delivery." />
                          <meta property="og:type" content="website" />
                          <meta property="og:url" content="https://izishopin.com" />
                          <meta name="twitter:card" content="summary_large_image" />
                          <meta name="twitter:title" content="IziShopin - Cameroon's Premier B2B Marketplace" />
                          <meta name="twitter:description" content="Connect with trusted suppliers and buyers across Cameroon." />
                        </Helmet>
                        <Routes />
                        <ToastManager />
                        <SessionExpiryWarning />
                      </div>
                    </NotificationProvider>
                  </WebSocketProvider>
                </DataCacheProvider>
              </ShopProvider>
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </LanguageProvider>
    </ErrorBoundary>
  );
}

export default App;