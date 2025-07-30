import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import GlassNavigation from './components/GlassNavigation';
import AuthBackground from './components/AuthBackground';
import AuthModal from './components/AuthModal';
import AuthTabs from './components/AuthTabs';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import SocialAuthButtons from './components/SocialAuthButtons';
import Icon from '../../components/AppIcon';
import { showToast } from '../../components/ui/Toast';
import LoadingScreen from '../../components/ui/LoadingScreen';
import api from '../../services/api';

const brandBenefits = [
  {
    icon: 'ShoppingBag',
    title: 'Shop & Sell',
    desc: 'Access thousands of products across Cameroon.'
  },
  {
    icon: 'Shield',
    title: 'Secure Payments',
    desc: 'Protected transactions with industry security.'
  },
  {
    icon: 'Award',
    title: 'Verified Sellers',
    desc: 'All sellers verified for quality and reliability.'
  },
  {
    icon: 'Truck',
    title: 'Fast Delivery',
    desc: 'Nationwide delivery with real-time tracking.'
  }
];

const AuthenticationLoginRegister = () => {
  const [activeTab, setActiveTab] = useState('login');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [hasRedirected, setHasRedirected] = useState(false);
  const [autoLoginMessage, setAutoLoginMessage] = useState('');
  const navigate = useNavigate();
  const { user, login, register, isAuthenticated, redirectAfterAuth } = useAuth();

  useEffect(() => {
    // Check if user is already authenticated and redirect once
    if (isAuthenticated() && user?.role && !hasRedirected) {
      console.log('Auth state detected, redirecting user:', user.role);
      setHasRedirected(true);
      // Small delay to prevent rapid redirects
      setTimeout(() => {
        redirectToDashboard(user.role);
      }, 100);
    }
  }, [user, hasRedirected, isAuthenticated]);

  const redirectToDashboard = (role) => {
    console.log('=== REDIRECT TO DASHBOARD DEBUG ===');
    console.log('Role received:', role);
    console.log('Current auth state:', {
      isAuthenticated: isAuthenticated(),
      accessToken: !!localStorage.getItem('accessToken'),
      user: localStorage.getItem('user')
    });
    
    // Use the new return URL system for seamless navigation
    const { redirectUrl, pendingCartState } = redirectAfterAuth();
    
    console.log('Redirecting after auth:', { redirectUrl, pendingCartState, role });
    
    // If redirectAfterAuth doesn't provide a URL (e.g., during registration), 
    // use role-based redirection
    let finalRedirectUrl = redirectUrl;
    if (!finalRedirectUrl || finalRedirectUrl === '/product-catalog') {
      // Role-based default redirection for registration
      switch (role) {
        case 'SHOP_OWNER':
        case 'shop_owner':
          finalRedirectUrl = '/shop-owner-dashboard';
          break;
        case 'ADMIN':
        case 'admin':
          finalRedirectUrl = '/admin-dashboard';
          break;
        case 'CUSTOMER':
        case 'customer':
          finalRedirectUrl = '/customer-dashboard';
          break;
        case 'DELIVERY_AGENT':
        case 'delivery_agent':
          finalRedirectUrl = '/delivery-agent-dashboard';
          break;
        case 'CASUAL_SELLER':
        case 'casual_seller':
        default:
          finalRedirectUrl = '/product-catalog';
          break;
      }
    }
    
    console.log('Final redirect URL:', finalRedirectUrl);
    console.log('About to navigate to:', finalRedirectUrl);
    
    // Navigate to the determined URL
    navigate(finalRedirectUrl);
    
    console.log('Navigate called, current location should change to:', finalRedirectUrl);
    
    // If there's pending cart state, handle it
    if (pendingCartState) {
      // This will be handled by the destination page (e.g., product details page)
      console.log('Pending cart state to restore:', pendingCartState);
    }
  };

  const handleLogin = async (credentials) => {
    setIsLoading(true);
    try {
      console.log('=== AUTH PAGE handleLogin called ===');
      console.log('Credentials:', { email: credentials.email, password: '[REDACTED]' });
      const response = await login(credentials);
      console.log('Login successful, user role:', response.user.role);
      
      // Force immediate redirect after successful login
      setTimeout(() => {
        redirectToDashboard(response.user.role);
      }, 500);
      
      setIsLoading(false);
    } catch (error) {
      console.error('=== AUTH PAGE LOGIN ERROR ===');
      console.error('Error in auth page handleLogin:', error);
      console.error('Error message:', error?.message);
      console.error('===============================');
      setIsLoading(false);
      // Re-throw the error so LoginForm can handle it
      console.log('=== ABOUT TO RE-THROW ERROR TO LOGINFORM ===');
      throw error;
    }
  };

  const handleRegister = async (registrationData) => {
    setIsLoading(true);
    try {
      console.log('handleRegister called with registrationData');
      
      // Extract shop data if present
      const { shopData, ...userData } = registrationData;
      
      // First, create the user account
      const response = await register(userData);
      console.log('User registration successful, user role:', response.user.role);
      
      // Check if user is authenticated after registration
      const isNowAuthenticated = isAuthenticated();
      console.log('User authenticated after registration:', isNowAuthenticated);
      console.log('Response includes access_token:', !!response.access_token);
      console.log('Response includes user:', !!response.user);
      console.log('User role:', response.user?.role);
      
      // If user is shop owner and shop data was provided, create the shop
      if ((response.user.role === 'SHOP_OWNER' || response.user.role === 'shop_owner') && shopData) {
        try {
          console.log('Creating shop automatically after registration...');
          
          // Prepare shop data with required fields based on backend schema
          const shopCreateData = {
            name: shopData.name,
            description: shopData.description,
            address: shopData.address,
            phone: shopData.phone || null,
            email: shopData.email || null
          };
          
          console.log('Shop creation data prepared:', shopCreateData);
          console.log('Auth token available:', !!localStorage.getItem('authToken'));
          
          // Create shop using API service
          const shopResponse = await api.createShop(shopCreateData);
          console.log('Shop created successfully:', shopResponse);
          
          // Show success message for both user and shop creation
          if (isAuthenticated()) {
            console.log('Shop owner is authenticated, redirecting to dashboard');
            redirectToDashboard(response.user.role);
          } else {
            console.log('Shop owner registered but not authenticated, attempting automatic login');
            try {
              setAutoLoginMessage('Setting up your shop...');
              await new Promise(resolve => setTimeout(resolve, 500));
              
              setAutoLoginMessage('Logging you in...');
              const loginResponse = await login({
                email: userData.email,
                password: userData.password
              });
              console.log('Automatic login successful after shop creation:', loginResponse);
              
              setAutoLoginMessage('Redirecting to dashboard...');
              // Double-check authentication and force redirect if needed
              setTimeout(() => {
                if (isAuthenticated()) {
                  redirectToDashboard(response.user.role);
                } else {
                  setAutoLoginMessage('');
                }
              }, 500);
            } catch (loginError) {
              console.warn('Automatic login failed after shop creation:', loginError);
              showToast.success('Registration and shop creation successful! Please log in to access your dashboard.');
              setActiveTab('login');
            }
          }
          setIsLoading(false);
          
        } catch (shopError) {
          console.error('Shop creation failed after user registration:', shopError);
          console.error('Shop creation error details:', {
            message: shopError.message,
            response: shopError.response?.data,
            status: shopError.response?.status
          });
          
          // Show specific validation error to user
          let errorMessage = 'Failed to create shop. ';
          if (shopError.response?.status === 422) {
            const validationErrors = shopError.response?.data?.detail?.errors || [];
            if (validationErrors.length > 0) {
              errorMessage += validationErrors.join('. ');
            } else if (shopError.response?.data?.detail) {
              errorMessage += shopError.response.data.detail;
            }
          } else {
            errorMessage += shopError.message || 'Please try again.';
          }
          
          showToast({
            type: 'error',
            message: errorMessage,
            duration: 5000
          });
          
          // For validation errors, don't auto-login, let user fix the error
          if (shopError.response?.status === 422) {
            console.log('Shop creation validation error, staying on registration to let user fix it');
            setIsLoading(false);
            setAutoLoginMessage('');
            // User data is still in the form, they can correct the shop name and retry
            return;
          }
          
          // For other errors, user was created successfully but shop creation failed
          // Still redirect to dashboard but show a warning
          if (isAuthenticated()) {
            redirectToDashboard(response.user.role);
          } else {
            // Try automatic login for shop owners for non-validation errors
            try {
              console.log('Attempting automatic login for shop owner after shop creation error');
              
              setAutoLoginMessage('Setting up your account...');
              await new Promise(resolve => setTimeout(resolve, 500));
              
              setAutoLoginMessage('Logging you in...');
              const loginResponse = await login({
                email: userData.email,
                password: userData.password
              });
              console.log('Automatic login successful after shop error:', loginResponse);
              
              setAutoLoginMessage('Redirecting to dashboard...');
              setTimeout(() => {
                if (isAuthenticated()) {
                  redirectToDashboard(response.user.role);
                } else {
                  setAutoLoginMessage('');
                }
              }, 500);
            } catch (loginError) {
              console.warn('Automatic login failed after shop creation failure:', loginError);
              showToast({
                type: 'warning',
                message: 'Registration successful! Please log in to access your dashboard.',
                duration: 4000
              });
              setActiveTab('login');
            }
          }
          setIsLoading(false);
        }
      } else {
        // Regular user (not shop owner) or no shop data
        console.log('No shop creation needed for this user type');
        
        // Force redirect if user is authenticated
        if (isAuthenticated()) {
          console.log('User is authenticated, redirecting to dashboard');
          redirectToDashboard(response.user.role);
        } else {
          // User registered but not authenticated
          console.log('User registered but not authenticated');
          
          // For delivery agents and customers, try to log them in automatically
          if (response.user.role === 'DELIVERY_AGENT' || response.user.role === 'CUSTOMER') {
            try {
              console.log('=== DELIVERY AGENT REGISTRATION DEBUG ===');
              console.log('User role:', response.user.role);
              console.log('User created:', response.user);
              console.log('Tokens in response:', { 
                access_token: !!response.access_token, 
                refresh_token: !!response.refresh_token 
              });
              
              setAutoLoginMessage('Setting up your account...');
              await new Promise(resolve => setTimeout(resolve, 500));
              
              setAutoLoginMessage('Logging you in...');
              const loginResponse = await login({
                email: userData.email,
                password: userData.password
              });
              console.log('Automatic login response:', loginResponse);
              console.log('Auth state after login:', {
                isAuthenticated: isAuthenticated(),
                accessToken: !!localStorage.getItem('accessToken'),
                user: localStorage.getItem('user')
              });
              
              setAutoLoginMessage('Redirecting to dashboard...');
              // Immediate redirect attempt
              console.log('Attempting immediate redirect...');
              redirectToDashboard(response.user.role);
              
              // Backup check after delay
              setTimeout(() => {
                console.log('Backup redirect check - Auth state:', {
                  isAuthenticated: isAuthenticated(),
                  accessToken: !!localStorage.getItem('accessToken'),
                  currentPath: window.location.pathname
                });
                
                if (isAuthenticated()) {
                  console.log('User is authenticated, forcing redirect...');
                  redirectToDashboard(response.user.role);
                } else {
                  console.warn('User not authenticated after automatic login, showing manual login');
                  setAutoLoginMessage('');
                  showToast.success('Registration successful! Please log in to access your dashboard.');
                  setActiveTab('login');
                }
              }, 1000);
            } catch (loginError) {
              console.error('=== AUTOMATIC LOGIN FAILED ===');
              console.error('Login error:', loginError);
              console.error('Error details:', {
                message: loginError.message,
                stack: loginError.stack
              });
              setAutoLoginMessage('');
              showToast.success('Registration successful! Please log in to access your dashboard.');
              setActiveTab('login');
            }
          } else {
            // For other roles, show verification message
            showToast.success('Registration successful! Please check your email for verification.');
            setActiveTab('login');
          }
        }
        setIsLoading(false);
      }
      
    } catch (error) {
      console.error('Registration error:', error);
      setIsLoading(false);
      throw error; // Re-throw to allow form to handle the error
    }
  };

  const handleSocialLogin = async (provider) => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const mockSocialUser = {
        id: Date.now(),
        email: `user@${provider}.com`,
        name: `${provider.charAt(0).toUpperCase() + provider.slice(1)} User`,
        role: 'customer',
        avatar: `https://ui-avatars.com/api/?name=${provider}+User&background=1E40AF&color=fff`,
        provider: provider,
        createdAt: new Date().toISOString()
      };
      localStorage.setItem('user', JSON.stringify(mockSocialUser));
      localStorage.setItem('authToken', `mock-${provider}-token-` + Date.now());
      setShowSuccessMessage(true);
      setTimeout(() => {
        redirectToDashboard(mockSocialUser.role);
      }, 2000);
    } catch (error) {
      console.error('Social login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Show auto-login loading message using LoadingScreen component
  if (autoLoginMessage) {
    return (
      <LoadingScreen 
        message={autoLoginMessage}
        variant="auth"
        showProgress={false}
      />
    );
  }

  if (showSuccessMessage) {
    return (
      <div className="min-h-screen bg-background relative overflow-hidden">
        <AuthBackground />
        <GlassNavigation />
        <div className="relative z-10 min-h-screen flex items-center justify-center p-4 pt-20">
          <div className="bg-white/95 backdrop-blur-xl border border-white/30 rounded-2xl p-6 sm:p-8 max-w-sm sm:max-w-md w-full text-center shadow-2xl">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
              <Icon name="Check" size={24} className="sm:w-8 sm:h-8 text-white" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2">
              {activeTab === 'login' ? 'Welcome Back!' : 'Account Created!'}
            </h2>
            <p className="text-sm sm:text-base text-text-secondary mb-6">
              {activeTab === 'login' 
                ? 'You have successfully signed in to your account.' 
                : (user?.role === 'shop_owner' || user?.role === 'SHOP_OWNER')
                  ? 'Your account and shop have been created successfully. Welcome to IziShopin!'
                  : 'Your account has been created successfully. Welcome to IziShopin!'
              }
            </p>
            <div className="flex items-center justify-center space-x-2 text-primary">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent"></div>
              <span className="text-sm">Redirecting to dashboard...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <AuthBackground />
      <GlassNavigation isAuthPage={true} />
      
      {/* Mobile-first layout */}
      <div className="relative z-10 min-h-screen pt-16 sm:pt-20">
        {/* Hero Section - Mobile first, then desktop */}
        <div className="px-4 py-8 sm:py-12 lg:hidden">
          <div className="text-center text-white mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold mb-3 drop-shadow-lg">
              Join Cameroon's Leading B2B Marketplace
            </h1>
            <p className="text-sm sm:text-base text-white/90 drop-shadow mb-6">
              Connect with trusted suppliers and buyers. Grow your business with secure payments.
            </p>
            
            {/* Mobile Benefits Grid */}
            <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto">
              {brandBenefits.map((benefit, index) => (
                <div 
                  key={index} 
                  className="p-3 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 text-center"
                >
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <Icon name={benefit.icon} size={16} className="text-white" />
                  </div>
                  <h3 className="font-semibold text-xs mb-1">{benefit.title}</h3>
                  <p className="text-xs text-white/80 leading-tight">{benefit.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden lg:flex min-h-screen">
          {/* Left: Hero Section */}
          <div className="w-1/2 relative overflow-hidden rounded-t-lg lg:rounded-t-xl">
            <div className="absolute inset-0 w-full h-full">
              <img 
                src="/auth-hero.jpg" 
                alt="Shopping cart and online payment" 
                className="w-full h-full object-cover object-center rounded-t-lg lg:rounded-t-xl" 
                style={{ filter: 'brightness(0.7)' }}
              />
              <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-blue-900/40 to-indigo-900/60 rounded-t-lg lg:rounded-t-xl" />
            </div>

            <div className="absolute inset-0 flex flex-col justify-center items-start p-12 text-white">
              <div className="max-w-lg">
                <h1 className="text-5xl font-bold mb-4 drop-shadow-lg">
                  Join Cameroon's Leading B2B Marketplace
                </h1>
                <p className="text-xl mb-8 text-white/90 drop-shadow">
                  Connect with trusted suppliers and buyers. Grow your business with secure payments and nationwide delivery.
                </p>
                
                <div className="grid grid-cols-2 gap-4">
                  {brandBenefits.map((benefit, index) => (
                    <div 
                      key={index} 
                      className="flex items-start space-x-3 p-4 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 hover:bg-white/20 transition-all duration-300"
                    >
                      <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Icon name={benefit.icon} size={16} className="text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm mb-1">{benefit.title}</h3>
                        <p className="text-xs text-white/80">{benefit.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          {/* Right: Auth Form */}
          <div className="w-1/2 flex items-center justify-center p-8">
            <AuthModal>
              <div className="max-w-md mx-auto w-full">
                <div className="flex flex-col items-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                    <Icon name="Store" size={24} className="text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground mb-1 text-center">Welcome to IziShopin</h2>
                  <p className="text-sm text-text-secondary text-center">Cameroon's trusted B2B marketplace</p>
                </div>
                
                <AuthTabs activeTab={activeTab} onTabChange={setActiveTab} />
                
                {activeTab === 'login' ? (
                  <div className="space-y-6">
                    <LoginForm 
                      onLogin={handleLogin} 
                      isLoading={isLoading} 
                      onSwitchToRegister={() => setActiveTab('register')}
                    />
                    <SocialAuthButtons onSocialLogin={handleSocialLogin} isLoading={isLoading} />
                    <div className="text-center">
                      <p className="text-sm text-text-secondary">
                        Don't have an account?{' '}
                        <button
                          onClick={() => setActiveTab('register')}
                          className="text-primary hover:text-primary/80 font-medium transition-colors duration-200"
                        >
                          Sign up here
                        </button>
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <RegisterForm onRegister={handleRegister} isLoading={isLoading} />
                    <SocialAuthButtons onSocialLogin={handleSocialLogin} isLoading={isLoading} />
                    <div className="text-center">
                      <p className="text-sm text-text-secondary">
                        Already have an account?{' '}
                        <button
                          onClick={() => setActiveTab('login')}
                          className="text-primary hover:text-primary/80 font-medium transition-colors duration-200"
                        >
                          Sign in here
                        </button>
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </AuthModal>
          </div>
        </div>

        {/* Mobile Auth Form */}
        <div className="lg:hidden px-4 pb-8">
          <AuthModal>
            <div className="w-full">
              <div className="flex flex-col items-center mb-6">
                <div className="w-14 h-14 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center mb-3 shadow-lg">
                  <Icon name="Store" size={20} className="text-white" />
                </div>
                <h2 className="text-xl font-bold text-foreground mb-1 text-center">Welcome to IziShopin</h2>
                <p className="text-sm text-text-secondary text-center">Cameroon's trusted B2B marketplace</p>
              </div>
              
              <AuthTabs activeTab={activeTab} onTabChange={setActiveTab} />
              
              {activeTab === 'login' ? (
                <div className="space-y-4">
                  <LoginForm 
                    onLogin={handleLogin} 
                    isLoading={isLoading} 
                    onSwitchToRegister={() => setActiveTab('register')}
                  />
                  <SocialAuthButtons onSocialLogin={handleSocialLogin} isLoading={isLoading} />
                  <div className="text-center">
                    <p className="text-sm text-text-secondary">
                      Don't have an account?{' '}
                      <button
                        onClick={() => setActiveTab('register')}
                        className="text-primary hover:text-primary/80 font-medium transition-colors duration-200"
                      >
                        Sign up here
                      </button>
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <RegisterForm onRegister={handleRegister} isLoading={isLoading} />
                  <SocialAuthButtons onSocialLogin={handleSocialLogin} isLoading={isLoading} />
                  <div className="text-center">
                    <p className="text-sm text-text-secondary">
                      Already have an account?{' '}
                      <button
                        onClick={() => setActiveTab('login')}
                        className="text-primary hover:text-primary/80 font-medium transition-colors duration-200"
                      >
                        Sign in here
                      </button>
                    </p>
                  </div>
                </div>
              )}
            </div>
          </AuthModal>
        </div>
        
        {/* Mobile Footer */}
        <div className="lg:hidden text-center text-xs text-white/60 pb-4 px-4">
          &copy; {new Date().getFullYear()} IziShopin. All rights reserved.
        </div>
      </div>
      
      {/* Enhanced mobile-first styles */}
      <style>{`
        @keyframes fade-in { 
          from { 
            opacity: 0; 
            transform: translateY(20px); 
          } 
          to { 
            opacity: 1; 
            transform: none; 
          } 
        }
        
        .animate-fade-in { 
          animation: fade-in 0.8s cubic-bezier(.4,0,.2,1) both; 
        }
        
        /* Mobile-optimized glass morphism */
        .backdrop-blur-xl {
          backdrop-filter: blur(20px);
        }
        
        .backdrop-blur-md {
          backdrop-filter: blur(12px);
        }
        
        .backdrop-blur-sm {
          backdrop-filter: blur(6px);
        }
        
        /* Touch-friendly interactions */
        @media (max-width: 640px) {
          button, a {
            min-height: 44px;
            min-width: 44px;
          }
        }
      `}</style>
    </div>
  );
};

export default AuthenticationLoginRegister;

