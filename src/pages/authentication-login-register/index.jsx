import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
    title: 'Shop & Sell Instantly',
    desc: 'Access thousands of products and trusted suppliers across Cameroon.'
  },
  {
    icon: 'Shield',
    title: 'Secure Payments',
    desc: 'Your transactions are protected with industry-leading security.'
  },
  {
    icon: 'Award',
    title: 'Verified Sellers',
    desc: 'All sellers are verified for quality and reliability.'
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
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already authenticated
    const user = localStorage.getItem('user');
    if (user) {
      const userData = JSON.parse(user);
      redirectToDashboard(userData.role);
    }
  }, []);

  const redirectToDashboard = (role) => {
    // Handle both frontend role format and backend enum format
    const normalizedRole = role.toLowerCase().replace('_', '');
    
    switch (normalizedRole) {
      case 'customer': 
        navigate('/landing-page');
        break;
      case 'shopowner': 
        navigate('/shops-listing'); // Changed to correct route
        break;
      case 'casualseller': 
        navigate('/product-catalog');
        break;
      case 'deliveryagent': 
        navigate('/landing-page');
        break;
      case 'admin': 
        navigate('/landing-page');
        break;
      default:
        navigate('/landing-page');
    }
  };

  const handleLogin = async (userData) => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setShowSuccessMessage(true);
      setTimeout(() => {
        redirectToDashboard(userData.role);
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
      await new Promise(resolve => setTimeout(resolve, 2000));
      setShowSuccessMessage(true);
      setTimeout(() => {
        redirectToDashboard(userData.role);
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
        <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl p-8 max-w-md w-full text-center shadow-2xl backdrop-blur-xl bg-white/80">
            <div className="w-16 h-16 bg-success rounded-full flex items-center justify-center mx-auto mb-4 marketplace-spring">
              <Icon name="Check" size={32} color="white" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">
              {activeTab === 'login' ? 'Welcome Back!' : 'Account Created!'}
            </h2>
            <p className="text-text-secondary mb-4">
              {activeTab === 'login' ?'You have successfully signed in to your account.' :'Your account has been created successfully. Welcome to IziShop!'}
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
    <div className="min-h-screen bg-background relative overflow-hidden flex flex-col md:flex-row items-stretch">
      <AuthBackground />
      {/* Left: Hero Image as background (desktop), Top (mobile) */}
      <div className="w-full md:w-1/2 flex-1 min-h-full relative overflow-hidden">
        <div className="absolute inset-0 w-full h-full">
          <img 
            src="/auth-hero.jpg" 
            alt="Shopping cart and online payment" 
            className="w-full h-full object-cover object-center scale-105 blur-sm md:blur-none transition-all duration-700" 
            style={{ filter: 'brightness(0.7)' }}
          />
          {/* Overlay for contrast */}
          <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-blue-900/40 to-indigo-900/60" />
        </div>
      </div>
      {/* Right: Auth Form Panel */}
      <div className="w-full md:w-1/2 flex-1 min-h-full flex flex-col justify-center items-center relative z-20 px-4 sm:px-8 py-12 animate-fade-in">
        <div className="w-full max-w-md">
          <AuthModal>
            <div className="p-4 sm:p-6 md:p-8">
              <div className="max-w-md mx-auto w-full">
                <div className="flex flex-col items-center mb-6">
                  <img src="/izishopin_logo_transparent.png" alt="IziShopin" className="h-30 md:h-32 w-auto mb-2 drop-shadow-xl" />
                  <h2 className="text-2xl font-bold text-foreground mb-1 text-center">Welcome to IziShopin</h2>
                  <p className="text-sm text-text-secondary text-center">Cameroon’s trusted B2B marketplace</p>
                </div>
                <AuthTabs activeTab={activeTab} onTabChange={setActiveTab} />
                {activeTab === 'login' ? (
                  <div className="space-y-4 sm:space-y-6">
                    <LoginForm onLogin={handleLogin} isLoading={isLoading} />
                    <SocialAuthButtons onSocialLogin={handleSocialLogin} isLoading={isLoading} />
                    <div className="text-center">
                      <p className="text-sm text-text-secondary">
                        Don't have an account?{' '}
                        <button
                          onClick={() => setActiveTab('register')}
                          className="text-primary hover:text-primary/80 font-medium marketplace-transition"
                        >
                          Sign up here
                        </button>
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4 sm:space-y-6">
                    <RegisterForm onRegister={handleRegister} isLoading={isLoading} />
                    <SocialAuthButtons onSocialLogin={handleSocialLogin} isLoading={isLoading} />
                    <div className="text-center">
                      <p className="text-sm text-text-secondary">
                        Already have an account?{' '}
                        <button
                          onClick={() => setActiveTab('login')}
                          className="text-primary hover:text-primary/80 font-medium marketplace-transition"
                        >
                          Sign in here
                        </button>
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </AuthModal>
        </div>
        <div className="mt-8 text-center text-xs text-text-secondary opacity-80 md:hidden">
          &copy; {new Date().getFullYear()} IziShopin. All rights reserved.
        </div>
      </div>
      {/* Fade-in animation keyframes */}
      <style>{`
        @keyframes fade-in { from { opacity: 0; transform: translateY(32px); } to { opacity: 1; transform: none; } }
        .animate-fade-in { animation: fade-in 1s cubic-bezier(.4,0,.2,1) both; }
      `}</style>
    </div>
  );
};

export default AuthenticationLoginRegister;