import React, { useState, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import LoginEmailInput from '../../../components/ui/LoginEmailInput';
import { Checkbox } from '../../../components/ui/Checkbox';
import Icon from '../../../components/AppIcon';
import { showToast } from '../../../components/ui/Toast';

const LoginForm = ({ onLogin, isLoading, onSwitchToRegister }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [errors, setErrors] = useState({});
  const [loginError, setLoginError] = useState(''); // NEW: For specific login errors
  const [showPassword, setShowPassword] = useState(false);



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
        await onLogin(credentials);
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
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-foreground mb-2">Welcome Back</h2>
        <p className="text-text-secondary">Sign in to your IziShop account</p>
      </div>

      <LoginEmailInput
        label="Email Address"
        name="email"
        placeholder="Enter your email"
        value={formData.email}
        onChange={handleInputChange}
        debounceDelay={600}
        minLength={4}
        onSwitchToRegister={onSwitchToRegister}
        required
      />

      <div className="relative">
        <Input
          label="Password"
          type={showPassword ? 'text' : 'password'}
          name="password"
          placeholder="Enter your password"
          value={formData.password}
          onChange={handleInputChange}
          error={loginError || errors.password}
          required
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-9 text-text-secondary hover:text-foreground marketplace-transition"
        >
          <Icon name={showPassword ? 'EyeOff' : 'Eye'} size={16} />
        </button>
      </div>

      <div className="flex items-center justify-between">
        <Checkbox
          label="Remember me"
          name="rememberMe"
          checked={formData.rememberMe}
          onChange={handleInputChange}
        />
        
        <Link
          to="/forgot-password"
          className="text-sm text-primary hover:text-primary/80 marketplace-transition"
        >
          Forgot password?
        </Link>
      </div>


      <Button
        type="submit"
        variant="default"
        fullWidth
        loading={isLoading}
        iconName="LogIn"
        iconPosition="right"
      >
        Sign In
      </Button>

    </form>
  );
};

export default LoginForm;