import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthBackground from './components/AuthBackground';
import AuthModal from './components/AuthModal';
import AuthTabs from './components/AuthTabs';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import SocialAuthButtons from './components/SocialAuthButtons';
import Icon from '../../components/AppIcon';

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
    switch (role) {
      case 'customer': navigate('/landing-page');
        break;
      case 'shop_owner': navigate('/shop-profile');
        break;
      case 'casual_seller': navigate('/product-catalog');
        break;
      case 'delivery_agent': navigate('/landing-page');
        break;
      case 'admin': navigate('/landing-page');
        break;
      default:
        navigate('/landing-page');
    }
  };

  const handleLogin = async (userData) => {
    setIsLoading(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setShowSuccessMessage(true);
      
      // Redirect after success message
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
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setShowSuccessMessage(true);
      
      // Redirect after success message
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
      // Simulate social login
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
          <div className="bg-card border border-border rounded-2xl p-8 max-w-md w-full text-center shadow-2xl">
            <div className="w-16 h-16 bg-success rounded-full flex items-center justify-center mx-auto mb-4 marketplace-spring">
              <Icon name="Check" size={32} color="white" />
            </div>
            
            <h2 className="text-2xl font-bold text-foreground mb-2">
              {activeTab === 'login' ? 'Welcome Back!' : 'Account Created!'}
            </h2>
            
            <p className="text-text-secondary mb-4">
              {activeTab === 'login' ?'You have successfully signed in to your account.' :'Your account has been created successfully. Welcome to IziShop!'
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
      
      {/* Simplified Header */}
      <header className="relative z-20 bg-card/80 backdrop-blur-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/landing-page" className="flex items-center">
              <img 
                src="/izishopin_logo_transparent.png" 
                alt="IziShopin" 
                className="h-8 w-auto"
              />
            </Link>
            
            <Link
              to="/landing-page"
              className="text-text-secondary hover:text-foreground marketplace-transition"
            >
              <Icon name="ArrowLeft" size={20} />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen pt-16 pb-20 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <AuthModal>
          <div className="p-4 sm:p-6 md:p-8">
            <div className="max-w-md mx-auto w-full">
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

      {/* Footer */}
      <footer className="relative z-20 bg-card/80 backdrop-blur-sm border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between space-y-2 sm:space-y-0">
            <div className="text-sm text-text-secondary">
              © {new Date().getFullYear()} IziShop. All rights reserved.
            </div>
            <div className="flex items-center space-x-6 text-sm">
              <Link to="/terms" className="text-text-secondary hover:text-foreground marketplace-transition">
                Terms of Service
              </Link>
              <Link to="/privacy" className="text-text-secondary hover:text-foreground marketplace-transition">
                Privacy Policy
              </Link>
              <Link to="/support" className="text-text-secondary hover:text-foreground marketplace-transition">
                Support
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AuthenticationLoginRegister;