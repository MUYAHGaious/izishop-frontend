import React, { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { Checkbox } from '../../../components/ui/Checkbox';
import Icon from '../../../components/AppIcon';
import { showToast } from '../../../components/ui/Toast';

const LoginForm = ({ onLogin, isLoading }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  // Mock credentials for different user types
  const mockCredentials = {
    customer: { email: 'customer@izishopin.com', password: 'Customer123!' },
    shop_owner: { email: 'shop@izishopin.com', password: 'Shop123!' },
    casual_seller: { email: 'seller@izishopin.com', password: 'Seller123!' },
    delivery_agent: { email: 'delivery@izishopin.com', password: 'Delivery123!' },
    admin: { email: 'admin@izishopin.com', password: 'Admin123!' }
  };

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
      // Clear any previous errors
      setErrors({});
      
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
      console.error('Login error:', error);
      
      let errorMessage = 'Invalid email or password. Please try again.';
      
      // Enhanced error parsing
      if (error.message) {
        if (error.message.includes('Invalid credentials') || 
            error.message.includes('Unauthorized') ||
            error.message.includes('401')) {
          errorMessage = 'Invalid email or password. Please check your credentials.';
        } else if (error.message.includes('Account not found')) {
          errorMessage = 'No account found with this email address.';
        } else if (error.message.includes('Account disabled') || 
                   error.message.includes('Account suspended')) {
          errorMessage = 'Your account has been disabled. Please contact support.';
        } else if (error.message.includes('Too many attempts')) {
          errorMessage = 'Too many login attempts. Please try again later.';
        } else if (error.message.includes('Network') || 
                   error.message.includes('fetch')) {
          errorMessage = 'Network error. Please check your connection and try again.';
        } else {
          errorMessage = error.message;
        }
      }
      
      // Show error toast
      showToast({
        type: 'error',
        message: errorMessage,
        duration: 5000
      });
      
      // Set form errors for visual feedback
      setErrors({
        submit: errorMessage
      });
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
    
    // Real-time validation for email
    if (name === 'email' && newValue) {
      const emailError = validateEmail(newValue);
      if (emailError) {
        setErrors(prev => ({ ...prev, [name]: emailError }));
      } else {
        setErrors(prev => ({ ...prev, [name]: '' }));
      }
    } else if (errors[name]) {
      // Clear error when user starts typing
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    
    // Clear submit error when user makes changes
    if (errors.submit) {
      setErrors(prev => ({ ...prev, submit: '' }));
    }
  }, [errors]);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-foreground mb-2">Welcome Back</h2>
        <p className="text-text-secondary">Sign in to your IziShop account</p>
      </div>

      <Input
        label="Email Address"
        type="email"
        name="email"
        placeholder="Enter your email"
        value={formData.email}
        onChange={handleInputChange}
        error={errors.email}
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
          error={errors.password}
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

      {/* Display general error message */}
      {errors.submit && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start">
            <Icon name="AlertCircle" size={16} className="text-red-600 mt-0.5 mr-2" />
            <p className="text-sm text-red-700">{errors.submit}</p>
          </div>
        </div>
      )}

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

      {/* Mock Credentials Helper */}
      <div className="mt-4 p-3 bg-muted/50 rounded-lg">
        <p className="text-xs text-text-secondary mb-2">Demo Credentials:</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-xs">
          <div>Customer: customer@izishopin.com</div>
          <div>Shop: shop@izishopin.com</div>
          <div>Seller: seller@izishopin.com</div>
          <div>Delivery: delivery@izishopin.com</div>
        </div>
        <p className="text-xs text-text-secondary mt-1">Password for all: [Role]123!</p>
      </div>
    </form>
  );
};

export default LoginForm;