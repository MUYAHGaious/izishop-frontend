import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Icon from '../../components/AppIcon';
import { showToast } from '../../components/ui/Toast';

const AdminLogin = () => {
  const [credentials, setCredentials] = useState({
    email: '',
    password: '',
    adminCode: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showAdminCode, setShowAdminCode] = useState(false);
  const [errors, setErrors] = useState({});
  const [sessionTerminated, setSessionTerminated] = useState(false);
  
  const { adminLogin, isAuthenticated, forceLogout, user } = useAuth();
  const navigate = useNavigate();

  // Check for existing session and terminate it
  useEffect(() => {
    const terminateExistingSession = async () => {
      if (isAuthenticated() && user) {
        console.log('Existing session detected, terminating for admin login...');
        setSessionTerminated(true);
        
        try {
          await forceLogout('Admin login requested - terminating existing session');
          
          showToast({
            type: 'warning',
            message: `Previous ${user.role} session terminated for admin access`,
            duration: 4000
          });
          
          // Small delay to ensure cleanup is complete
          setTimeout(() => {
            setSessionTerminated(false);
          }, 1000);
          
        } catch (error) {
          console.error('Error terminating existing session:', error);
          setSessionTerminated(false);
        }
      }
    };

    terminateExistingSession();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!credentials.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(credentials.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!credentials.password) {
      newErrors.password = 'Password is required';
    } else if (credentials.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    
    if (!credentials.adminCode) {
      newErrors.adminCode = 'Admin access code is required';
    } else if (credentials.adminCode.length < 6) {
      newErrors.adminCode = 'Admin access code must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    setErrors({});

    try {
      const response = await adminLogin(
        { email: credentials.email, password: credentials.password },
        credentials.adminCode
      );
      
      console.log('Admin login successful:', response.user.role);
      
      showToast({
        type: 'success',
        message: 'Admin login successful',
        duration: 3000
      });
      
      // Redirect to admin dashboard
      setTimeout(() => {
        navigate('/admin-dashboard');
      }, 1500);
      
    } catch (error) {
      console.error('Admin login error:', error);
      
      // Handle different types of errors
      if (error.message.includes('admin access code')) {
        setErrors({ adminCode: 'Invalid admin access code' });
      } else if (error.message.includes('not authorized for admin')) {
        setErrors({ submit: 'This account is not authorized for admin access' });
      } else if (error.message.includes('Invalid credentials')) {
        setErrors({ submit: 'Invalid email or password' });
      } else {
        setErrors({ submit: error.message || 'Admin login failed. Please try again.' });
      }
      
      showToast({
        type: 'error',
        message: error.message || 'Admin login failed',
        duration: 4000
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (sessionTerminated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
        <div className="bg-white/95 backdrop-blur-xl border border-white/30 rounded-2xl p-8 max-w-md w-full text-center shadow-2xl">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Icon name="Shield" size={24} className="text-yellow-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Terminating Session
          </h2>
          <p className="text-gray-600 mb-6">
            Existing session is being terminated for secure admin access...
          </p>
          <div className="flex items-center justify-center space-x-2 text-blue-600">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
            <span className="text-sm">Please wait...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="relative z-10 bg-white/95 backdrop-blur-xl border border-white/30 rounded-2xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="text-center pt-8 pb-6 px-8 border-b border-gray-200">
          <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Icon name="Shield" size={24} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Admin Access</h1>
          <p className="text-sm text-gray-600">
            Secure administrative login
          </p>
        </div>

        {/* Security Notice */}
        <div className="px-8 pt-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <Icon name="AlertTriangle" size={16} className="text-red-600 mt-0.5 mr-2 flex-shrink-0" />
              <div className="text-sm">
                <p className="text-red-800 font-medium mb-1">Security Notice</p>
                <p className="text-red-700">
                  Admin access requires elevated credentials. Any existing session will be terminated.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="px-8 pb-8 space-y-6">
          <Input
            label="Email Address"
            type="email"
            name="email"
            placeholder="Enter admin email"
            value={credentials.email}
            onChange={handleInputChange}
            error={errors.email}
            required
            autoComplete="email"
          />

          <div className="relative">
            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              name="password"
              placeholder="Enter admin password"
              value={credentials.password}
              onChange={handleInputChange}
              error={errors.password}
              required
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-9 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <Icon name={showPassword ? 'EyeOff' : 'Eye'} size={16} />
            </button>
          </div>

          <div className="relative">
            <Input
              label="Admin Access Code"
              type={showAdminCode ? 'text' : 'password'}
              name="adminCode"
              placeholder="Enter admin access code"
              value={credentials.adminCode}
              onChange={handleInputChange}
              error={errors.adminCode}
              required
              autoComplete="off"
              description="Required for administrative access"
            />
            <button
              type="button"
              onClick={() => setShowAdminCode(!showAdminCode)}
              className="absolute right-3 top-9 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <Icon name={showAdminCode ? 'EyeOff' : 'Eye'} size={16} />
            </button>
          </div>

          {/* Error Message */}
          {errors.submit && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex items-start">
                <Icon name="AlertCircle" size={16} className="text-red-600 mt-0.5 mr-2 flex-shrink-0" />
                <p className="text-sm text-red-700">{errors.submit}</p>
              </div>
            </div>
          )}

          <Button
            type="submit"
            variant="default"
            loading={isLoading}
            disabled={isLoading}
            className="w-full py-3 bg-red-600 hover:bg-red-700 focus:ring-red-500"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Authenticating...
              </>
            ) : (
              <>
                <Icon name="Shield" size={16} className="mr-2" />
                Admin Login
              </>
            )}
          </Button>

          {/* Back to Regular Login */}
          <div className="text-center pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Not an admin?{' '}
              <Link
                to="/authentication-login-register"
                className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
              >
                Regular Login
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;

