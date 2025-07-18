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
  const navigate = useNavigate();
  const { user, login, register, isAuthenticated } = useAuth();

  useEffect(() => {
    // Check if user is already authenticated and redirect once
    if (isAuthenticated() && user?.role && !hasRedirected) {
      setHasRedirected(true);
      // Small delay to prevent rapid redirects
      setTimeout(() => {
        redirectToDashboard(user.role);
      }, 100);
    }
  }, [isAuthenticated(), user?.role, hasRedirected]);

  const redirectToDashboard = (role) => {
    // Use the exact role format from backend
    switch (role) {
      case 'CUSTOMER': 
        navigate('/landing-page');
        break;
      case 'SHOP_OWNER': 
        navigate('/shop-owner-dashboard');
        break;
      case 'CASUAL_SELLER': 
        navigate('/product-catalog');
        break;
      case 'DELIVERY_AGENT': 
        navigate('/landing-page');
        break;
      case 'ADMIN': 
        navigate('/admin-dashboard');
        break;
      default:
        navigate('/landing-page');
    }
  };

  const handleLogin = async (userData) => {
    setIsLoading(true);
    try {
      const response = await login(userData);
      setShowSuccessMessage(true);
      setTimeout(() => {
        redirectToDashboard(response.user.role);
      }, 2000);
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (userData) => {
    setIsLoading(true);
    try {
      const response = await register(userData);
      setShowSuccessMessage(true);
      setTimeout(() => {
        redirectToDashboard(response.user.role);
      }, 2000);
    } catch (error) {
      console.error('Registration error:', error);
    } finally {
      setIsLoading(false);
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
                : user?.role === 'shop_owner' 
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
      <GlassNavigation />
      
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
          <div className="w-1/2 relative overflow-hidden">
            <div className="absolute inset-0 w-full h-full">
              <img 
                src="/auth-hero.jpg" 
                alt="Shopping cart and online payment" 
                className="w-full h-full object-cover object-center" 
                style={{ filter: 'brightness(0.7)' }}
              />
              <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-blue-900/40 to-indigo-900/60" />
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
                    <LoginForm onLogin={handleLogin} isLoading={isLoading} />
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
                  <LoginForm onLogin={handleLogin} isLoading={isLoading} />
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

