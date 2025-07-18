import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { Checkbox } from '../../../components/ui/Checkbox';
import Icon from '../../../components/AppIcon';
import apiService from '../../../services/api';

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

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      // Call real API
      const response = await apiService.login(formData.email, formData.password);
      
      // Save to localStorage
      localStorage.setItem('user', JSON.stringify(response.user));
      localStorage.setItem('authToken', response.access_token);
      
      if (onLogin) {
        onLogin(response.user);
      }
    } catch (error) {
      setErrors({
        email: 'Invalid email or password.',
        password: 'Invalid email or password.'
      });
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

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