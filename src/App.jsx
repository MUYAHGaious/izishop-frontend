import React from 'react';
import { Helmet } from 'react-helmet';
import Routes from './Routes';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { WishlistProvider } from './contexts/WishlistProvider';
import { ShopProvider } from './contexts/ShopContext';
import { DataCacheProvider } from './contexts/DataCacheContext';
import { WebSocketProvider } from './contexts/WebSocketContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { ToastManager } from './components/ui/Toast';
import SessionExpiryWarning from './components/ui/SessionExpiryWarning';
import ErrorBoundary from './components/ErrorBoundary';
import { useNavigationHandler } from './hooks/useNavigationListener';
import './styles/index.css';

function App() {
  const [hasError, setHasError] = React.useState(false);
  const [errorInfo, setErrorInfo] = React.useState(null);

  // Global error boundary effect
  React.useEffect(() => {
    const handleError = (event) => {
      console.error('Global error caught:', event.error);
      if (event.error && !event.error.message.includes('extension')) {
        setHasError(true);
        setErrorInfo(event.error.message);
      }
    };

    const handleUnhandledRejection = (event) => {
      console.error('Unhandled promise rejection:', event.reason);
      if (event.reason && !event.reason.message?.includes('extension')) {
        setHasError(true);
        setErrorInfo(event.reason.message || 'Unknown error');
      }
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

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
      if (event.message && event.message.includes('polyfill.js')) {
        event.preventDefault();
        return false;
      }
    };

    const handleUnhandledRejection = (event) => {
      // Suppress extension-related promise rejections
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
      setHasError(false);
      setErrorInfo(null);
    },
    onBackNavigation: ({ location, action }) => {
      console.log('⬅️ Browser back/forward navigation detected:', {
        path: location.pathname,
        action
      });
      // Additional handling for back navigation if needed
    }
  });

  // Error fallback UI
  if (hasError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-500 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Something went wrong</h1>
          <p className="text-gray-600 mb-4">The application encountered an error and needs to be reloaded.</p>
          {errorInfo && (
            <div className="text-sm text-gray-500 mb-4 p-3 bg-gray-100 rounded">
              Error: {errorInfo}
            </div>
          )}
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
          >
            Reload Application
          </button>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
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
    </ErrorBoundary>
  );
}

export default App;

