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
    // use role-based redirection - DEFAULT TO PRODUCT CATALOG
    let finalRedirectUrl = redirectUrl;
    if (!finalRedirectUrl || finalRedirectUrl === '/product-catalog') {
      // NEW LOGIC: Most users go to product catalog, only specific roles go to dashboard
      switch (role) {
        case 'ADMIN':
        case 'admin':
          // Admins need dashboard access for management
          finalRedirectUrl = '/admin-dashboard';
          break;
        case 'SHOP_OWNER':
        case 'shop_owner':
          // Shop owners also go to product catalog by default
          // They can access dashboard later via navigation menu
          finalRedirectUrl = '/product-catalog';
          break;
        case 'CUSTOMER':
        case 'customer':
        case 'DELIVERY_AGENT':
        case 'delivery_agent':
        case 'CASUAL_SELLER':
        case 'casual_seller':
        default:
          // ALL OTHER USERS go to product catalog to start shopping
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
      
      // Wait a bit longer to ensure all state updates are complete
      setTimeout(() => {
        console.log('=== REDIRECTING AFTER LOGIN ===');
        console.log('Auth state before redirect:', isAuthenticated());
        console.log('User state before redirect:', user);
        redirectToDashboard(response.user.role);
      }, 1000);
      
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
    console.log('=== STARTING REGISTRATION PROCESS ===');
    try {
      console.log('handleRegister called with registrationData');
      console.log('Registration data received:', registrationData);
      console.log('User data:', registrationData);
      console.log('Shop data:', registrationData.shopData);
      
      // Extract shop data if present
      const { shopData, ...userData } = registrationData;
      
      console.log('=== CALLING AUTH CONTEXT REGISTER ===');
      // First, create the user account
      const response = await register(userData);
      console.log('=== AUTH CONTEXT REGISTER COMPLETED ===');
      console.log('User registration response:', response);
      console.log('Response type:', typeof response);
      console.log('Response keys:', response ? Object.keys(response) : 'No response');
      console.log('User object:', response?.user);
      console.log('Access token present:', !!response?.access_token);
      console.log('Refresh token present:', !!response?.refresh_token);
      
      // Check if registration was successful
      if (response && response.user) {
        console.log('=== REGISTRATION SUCCESSFUL ===');
        console.log('Registration successful, user created:', response.user);
        
        // Check if user was auto-logged in (has access token)
        if (response.access_token) {
          console.log('=== AUTO-LOGIN PATH ===');
          console.log('Auto-login successful, user role:', response.user.role);
          console.log('User authenticated after registration:', isAuthenticated());
          
          // Store tokens and user data for auto-login
          localStorage.setItem('accessToken', response.access_token);
          localStorage.setItem('refreshToken', response.refresh_token);
          localStorage.setItem('user', JSON.stringify(response.user));
          
          console.log('=== REDIRECTING TO DASHBOARD ===');
          // Redirect to dashboard immediately
          redirectToDashboard(response.user.role);
          setIsLoading(false);
          return;
        } else {
          console.log('=== NO AUTO-LOGIN PATH ===');
          // No auto-login, show success message and redirect to login
          console.log('Registration successful but no auto-login');
          showToast('Registration successful! Please log in to access your dashboard.', 'success');
          setActiveTab('login');
          setIsLoading(false);
          return;
        }
      } else {
        console.log('=== REGISTRATION FAILED ===');
        // Registration failed
        console.log('Registration failed:', response);
        const errorMessage = response?.error || response?.detail || 'Registration failed. Please try again.';
        showToast(errorMessage, 'error');
        setIsLoading(false);
        return;
      }
          
    } catch (error) {
      console.error('=== REGISTRATION ERROR ===');
      console.error('Registration error:', error);
      console.error('Error message:', error?.message);
      console.error('Error response:', error?.response?.data);
      console.error('Error status:', error?.response?.status);
      console.error('==========================');
      
      let errorMessage = 'Registration failed. Please try again.';
      
      // Safely extract error message from different error formats
      try {
        if (error && error.response && error.response.data) {
          errorMessage = error.response.data.detail || error.response.data.error || errorMessage;
        } else if (error && error.message) {
          errorMessage = error.message;
        }
      } catch (e) {
        console.warn('Error extracting error message:', e);
        errorMessage = 'Registration failed. Please try again.';
      }
      
      showToast(errorMessage, 'error');
      setIsLoading(false);
      return;
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
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-blue-50 to-indigo-100 relative">
      {/* Desktop Layout - Exact match to reference */}
      <div className="min-h-screen">
        
        {/* Desktop Layout */}
        <div className="hidden lg:flex min-h-screen">
          {/* Left: Auth Form Section - Clean white background */}
          <div className="w-1/2 bg-white flex items-center justify-center p-8">
            <div className="w-full max-w-sm">
              <div className="space-y-8">
                {/* Logo and Brand */}
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-8">
                    <Icon name="Package" size={28} className="text-teal-600" />
                    <span className="text-2xl font-bold text-gray-900">IziShopin</span>
                  </div>
                  
                  <h1 className="text-2xl font-semibold text-gray-900 mb-2">
                    {activeTab === 'login' ? 'Sign in to IziShopin' : 'Join IziShopin'}
                  </h1>
                  <p className="text-gray-600 text-sm">
                    {activeTab === 'login' ? 'Discover a new world of ideas with IziShopin' : 'Create your account to get started'}
                  </p>
                </div>

                {/* Social Auth Buttons */}
                <div className="space-y-3">
                  <button 
                    onClick={() => handleSocialLogin('google')}
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-300 font-medium hover:scale-[1.02] hover:shadow-md transform"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Sign {activeTab === 'login' ? 'in' : 'up'} with Google
                  </button>
                  
                  <button 
                    onClick={() => handleSocialLogin('apple')}
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-300 font-medium hover:scale-[1.02] hover:shadow-md transform"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                    </svg>
                    Sign {activeTab === 'login' ? 'in' : 'up'} with Apple
                  </button>
                </div>

                {/* Divider */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="bg-white px-4 text-gray-500">Or sign {activeTab === 'login' ? 'in' : 'up'} with your email</span>
                  </div>
                </div>

                {/* Auth Forms with smooth transitions */}
                <div className="relative min-h-[280px]">
                  <div className={`transition-all duration-500 ease-in-out transform ${
                    activeTab === 'login' 
                      ? 'translate-x-0 opacity-100' 
                      : '-translate-x-full opacity-0 absolute inset-0 pointer-events-none'
                  }`}>
                    <LoginForm 
                      onLogin={handleLogin} 
                      isLoading={isLoading} 
                      onSwitchToRegister={() => setActiveTab('register')}
                    />
                  </div>
                  <div className={`transition-all duration-500 ease-in-out transform ${
                    activeTab === 'register' 
                      ? 'translate-x-0 opacity-100' 
                      : 'translate-x-full opacity-0 absolute inset-0 pointer-events-none'
                  }`}>
                    <RegisterForm onRegister={handleRegister} isLoading={isLoading} />
                  </div>
                </div>

                {/* Switch between login/register */}
                <div className="text-center mt-1">
                  <p className="text-sm text-gray-600">
                    {activeTab === 'login' ? "Don't have an account? " : "Already have an account? "}
                    <button
                      onClick={() => setActiveTab(activeTab === 'login' ? 'register' : 'login')}
                      className="font-semibold text-teal-600 hover:text-teal-500 transition-colors duration-200"
                    >
                      {activeTab === 'login' ? 'Sign Up' : 'Sign In'}
                    </button>
                  </p>
                </div>

                                 {/* Footer */}
                 <div className="flex items-center justify-between text-xs text-gray-500 pt-4">
                   <button className="hover:text-gray-700 transition-colors">Privacy Policy</button>
                   <span>Copyright 2025</span>
                 </div>
               </div>
             </div>
           </div>
           
           {/* Right: Content Panel - Teal background */}
          <div className="w-1/2 bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center p-8">
            <div className="w-full max-w-md text-white">
              <div className="space-y-8">
                <div>
                  <h2 className="text-2xl font-semibold mb-4">Explore the most engaging marketplace.</h2>
                </div>

                {/* Content Card */}
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                  <div className="text-center mb-4">
                    <div className="bg-white/20 rounded-full px-4 py-2 inline-block text-sm font-medium">
                      List of products
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    {/* Product Items */}
                    <div className="flex items-center gap-4 p-3 bg-white/10 rounded-xl">
                      <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-red-500 rounded-lg flex items-center justify-center">
                        <Icon name="ShoppingBag" size={20} className="text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-sm">Master in business</div>
                        <div className="text-xs opacity-80">Larry Bowers</div>
                      </div>
                      <div className="w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center">
                        <Icon name="Play" size={14} className="text-white" />
                      </div>
                    </div>

                    <div className="flex items-center gap-4 p-3 bg-white/10 rounded-xl">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-lg flex items-center justify-center">
                        <Icon name="Globe" size={20} className="text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-sm">Virtual world</div>
                        <div className="text-xs opacity-80">Marcus Stokes</div>
                      </div>
                      <div className="w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center">
                        <Icon name="Play" size={14} className="text-white" />
                      </div>
                    </div>

                    <div className="flex items-center gap-4 p-3 bg-white/10 rounded-xl">
                      <div className="w-10 h-10 bg-gradient-to-br from-gray-400 to-gray-600 rounded-lg flex items-center justify-center">
                        <Icon name="TrendingUp" size={20} className="text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-sm">Cryptocurrencies</div>
                        <div className="text-xs opacity-80">Lewis Reeves</div>
                      </div>
                      <div className="w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center">
                        <Icon name="Play" size={14} className="text-white" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="lg:hidden min-h-screen bg-white">
          <div className="p-6">
            <div className="max-w-sm mx-auto">
              <div className="space-y-8">
                {/* Logo and Brand */}
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-8">
                    <Icon name="Package" size={28} className="text-teal-600" />
                    <span className="text-2xl font-bold text-gray-900">IziShopin</span>
                  </div>
                  
                  <h1 className="text-2xl font-semibold text-gray-900 mb-2">
                    {activeTab === 'login' ? 'Sign in to IziShopin' : 'Join IziShopin'}
                  </h1>
                  <p className="text-gray-600 text-sm">
                    {activeTab === 'login' ? 'Discover a new world of ideas with IziShopin' : 'Create your account to get started'}
                  </p>
                </div>

                {/* Social Auth Buttons */}
                <div className="space-y-3">
                  <button 
                    onClick={() => handleSocialLogin('google')}
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-300 font-medium hover:scale-[1.02] hover:shadow-md transform"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Sign {activeTab === 'login' ? 'in' : 'up'} with Google
                  </button>
                  
                  <button 
                    onClick={() => handleSocialLogin('apple')}
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-300 font-medium hover:scale-[1.02] hover:shadow-md transform"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                    </svg>
                    Sign {activeTab === 'login' ? 'in' : 'up'} with Apple
                  </button>
                </div>

                {/* Divider */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="bg-white px-4 text-gray-500">Or sign {activeTab === 'login' ? 'in' : 'up'} with your email</span>
                  </div>
                </div>

                {/* Auth Forms with smooth transitions */}
                <div className="relative min-h-[280px]">
                  <div className={`transition-all duration-500 ease-in-out transform ${
                    activeTab === 'login' 
                      ? 'translate-x-0 opacity-100' 
                      : '-translate-x-full opacity-0 absolute inset-0 pointer-events-none'
                  }`}>
                    <LoginForm 
                      onLogin={handleLogin} 
                      isLoading={isLoading} 
                      onSwitchToRegister={() => setActiveTab('register')}
                    />
                  </div>
                  <div className={`transition-all duration-500 ease-in-out transform ${
                    activeTab === 'register' 
                      ? 'translate-x-0 opacity-100' 
                      : 'translate-x-full opacity-0 absolute inset-0 pointer-events-none'
                  }`}>
                    <RegisterForm onRegister={handleRegister} isLoading={isLoading} />
                  </div>
                </div>

                {/* Switch between login/register */}
                <div className="text-center mt-1">
                  <p className="text-sm text-gray-600">
                    {activeTab === 'login' ? "Don't have an account? " : "Already have an account? "}
                    <button
                      onClick={() => setActiveTab(activeTab === 'login' ? 'register' : 'login')}
                      className="font-semibold text-teal-600 hover:text-teal-500 transition-colors duration-200"
                    >
                      {activeTab === 'login' ? 'Sign Up' : 'Sign In'}
                    </button>
                  </p>
                </div>

                                 {/* Footer */}
                 <div className="flex items-center justify-between text-xs text-gray-500 pt-4">
                   <button className="hover:text-gray-700 transition-colors">Privacy Policy</button>
                   <span>Copyright 2025</span>
                 </div>
               </div>
             </div>
           </div>
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

