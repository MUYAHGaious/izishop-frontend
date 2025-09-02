import React, { useState, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import LoginEmailInput from '../../../components/ui/LoginEmailInput';
import { Checkbox } from '../../../components/ui/Checkbox';
import Icon from '../../../components/AppIcon';
import { showToast } from '../../../components/ui/Toast';
import rememberMeService from '../../../services/rememberMeService';

const LoginForm = ({ onLogin, isLoading, onSwitchToRegister }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [errors, setErrors] = useState({});
  const [loginError, setLoginError] = useState(''); // NEW: For specific login errors
  const [showPassword, setShowPassword] = useState(false);
  const [isLoadingRemembered, setIsLoadingRemembered] = useState(false);

  // Load remembered credentials on component mount
  useEffect(() => {
    const loadRememberedCredentials = async () => {
      try {
        setIsLoadingRemembered(true);
        
        // Validate secure usage
        if (!rememberMeService.validateSecureUsage()) {
          console.warn('Remember me service validation failed');
          return;
        }

        // Get remembered credentials
        const rememberedCredentials = rememberMeService.getRememberedCredentials();
        
        if (rememberedCredentials) {
          console.log('Found remembered credentials for:', rememberedCredentials.email);
          
          setFormData(prev => ({
            ...prev,
            email: rememberedCredentials.email,
            rememberMe: true
          }));
          
          // Show toast to inform user
          showToast({
            type: 'info',
            message: `Welcome back, ${rememberedCredentials.email}`,
            duration: 3000
          });
        }
      } catch (error) {
        console.error('Failed to load remembered credentials:', error);
      } finally {
        setIsLoadingRemembered(false);
      }
    };

    loadRememberedCredentials();
    
    // Cleanup expired tokens
    rememberMeService.cleanupExpiredTokens();
  }, []);

  // Enhanced validation functions
  const validateEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!email) return 'Email is required';
    if (!emailRegex.test(email)) return 'Please enter a valid email address';
    if (email.length > 254) return 'Email address is too long';
    return null;
  };

  const validatePassword = (password) => {
    if (!password) return 'Password is required';
    if (password.length < 6) return 'Password must be at least 6 characters';
    if (password.length > 128) return 'Password is too long';
    return null;
  };

  const validateForm = useCallback(() => {
    const newErrors = {};

    const emailError = validateEmail(formData.email);
    if (emailError) newErrors.email = emailError;

    const passwordError = validatePassword(formData.password);
    if (passwordError) newErrors.password = passwordError;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData.email, formData.password]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      // Prepare credentials for auth context
      const credentials = {
        email: formData.email.trim().toLowerCase(),
        password: formData.password
      };
      
      console.log('Attempting login with credentials:', { email: credentials.email, password: '[REDACTED]' });
      
      // Pass credentials to parent component's handleLogin function
      if (onLogin) {
        const loginResponse = await onLogin(credentials);
        
        // Handle remember me after successful login
        if (loginResponse && loginResponse.access_token) {
          rememberMeService.handleSuccessfulLogin(
            credentials.email, 
            formData.rememberMe,
            loginResponse.access_token
          );
          
          if (formData.rememberMe) {
            showToast({
              type: 'success',
              message: 'Login credentials saved securely',
              duration: 3000
            });
          }
        }
      } else {
        console.error('No onLogin callback provided');
      }
    } catch (error) {
      console.log('=== LOGINFORM RECEIVED ERROR ===');
      console.error('=== LOGIN ERROR CAUGHT ===');
      console.error('Error object:', error);
      console.error('Error message:', error?.message);
      console.error('========================');
      
      let errorMessage = 'Incorrect email or password. Please check your credentials.';
      
      // Parse error message
      if (error?.message) {
        if (error.message.includes('Incorrect email or password') ||
            error.message.includes('Invalid credentials') || 
            error.message.includes('Unauthorized') ||
            error.message.includes('401')) {
          errorMessage = 'Incorrect email or password. Please check your credentials.';
        } else {
          errorMessage = error.message;
        }
      }
      
      console.log('Setting login error message:', errorMessage);
      
      // Show toast notification
      try {
        showToast({
          type: 'error',
          message: errorMessage,
          duration: 5000
        });
        console.log('Toast shown successfully');
      } catch (toastError) {
        console.error('Toast error:', toastError);
      }
    }
  };

  const handleInputChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    let newValue = type === 'checkbox' ? checked : value;
    
    // Input sanitization
    if (name === 'email') {
      newValue = value.toLowerCase().trim();
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));
    
    // Clear errors when user starts typing (real-time validation handled by LoginEmailInput)
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    
    // Clear login error when user starts typing in password field
    if (name === 'password' && loginError) {
      setLoginError('');
    }
  }, []);

  
  return (
    <form onSubmit={handleSubmit} className="space-y-4 animate-fade-in">
      <LoginEmailInput
        value={formData.email}
        onChange={handleInputChange}
        error={errors.email}
        disabled={isLoadingRemembered}
      />

      <div className="relative">
        <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-teal-500 focus-within:border-transparent transition-all duration-300 focus-within:scale-[1.01] transform">
          <div className="flex items-center px-3">
            <div className="w-2 h-2 bg-gray-400 rounded-full mx-0.5"></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full mx-0.5"></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full mx-0.5"></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full mx-0.5"></div>
          </div>
          <input
            type={showPassword ? 'text' : 'password'}
            name="password"
            placeholder=""
            value={formData.password}
            onChange={handleInputChange}
            className="flex-1 px-3 py-3 focus:outline-none"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="px-3 py-3 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <Icon name={showPassword ? 'EyeOff' : 'Eye'} size={16} />
          </button>
        </div>
        {(loginError || errors.password) && (
          <p className="text-sm text-red-500 mt-1">{loginError || errors.password}</p>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Checkbox
            label="Remember me"
            name="rememberMe"
            checked={formData.rememberMe}
            onChange={handleInputChange}
            disabled={isLoadingRemembered}
          />
        </div>
        
        <Link
          to="/forgot-password"
          className="text-sm text-teal-600 hover:text-teal-500 transition-colors"
        >
          Forgot Password?
        </Link>
      </div>

      <Button
        type="submit"
        variant="default"
        fullWidth
        loading={isLoading}
        className="w-full bg-teal-600 hover:bg-teal-700 text-white py-3 rounded-lg font-medium transition-all duration-300 hover:scale-[1.02] hover:shadow-lg transform disabled:scale-100"
      >
        {isLoading ? 'Signing in...' : 'Sign In'}
      </Button>
    </form>
  );
};

export default LoginForm;