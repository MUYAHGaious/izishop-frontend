import React from 'react';
import { Helmet } from 'react-helmet';
import Routes from './Routes';
import { AuthProvider } from './contexts/AuthContext';
import { ShopProvider } from './contexts/ShopContext';
import { DataCacheProvider } from './contexts/DataCacheContext';
import { WebSocketProvider } from './contexts/WebSocketContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { ToastManager } from './components/ui/Toast';
import ErrorBoundary from './components/ErrorBoundary';
import './styles/index.css';

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
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
                </div>
              </NotificationProvider>
            </WebSocketProvider>
          </DataCacheProvider>
        </ShopProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;

