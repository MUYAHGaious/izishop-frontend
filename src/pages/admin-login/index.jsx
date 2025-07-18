import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Header from '../../components/ui/Header';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';

const AdminLogin = () => {
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login, user } = useAuth();

  // Check if already logged in as admin
  React.useEffect(() => {
    if (user && user.role === 'ADMIN') {
      navigate('/admin-dashboard');
    }
  }, [user, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Use the auth context login function
      const response = await login(credentials);
      
      // Check if user is admin
      if (response.user.role !== 'ADMIN') {
        setError('Access denied. Admin credentials required.');
        return;
      }
      
      // Redirect to admin dashboard
      navigate('/admin-dashboard');
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="pt-16 min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="bg-card rounded-lg border border-border p-8 shadow-lg">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon name="Shield" size={32} className="text-primary" />
              </div>
              <h1 className="text-2xl font-bold text-foreground">Admin Access</h1>
              <p className="text-muted-foreground mt-2">
                Enter your admin credentials to continue
              </p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
                  <div className="flex items-center space-x-2">
                    <Icon name="AlertCircle" size={16} className="text-destructive" />
                    <span className="text-sm text-destructive">{error}</span>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                    Admin Email
                  </label>
                  <div className="relative">
                    <Icon 
                      name="Mail" 
                      size={20} 
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" 
                    />
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={credentials.email}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Enter admin email"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Icon 
                      name="Lock" 
                      size={20} 
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" 
                    />
                    <input
                      type="password"
                      id="password"
                      name="password"
                      value={credentials.password}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Enter admin password"
                      required
                    />
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                fullWidth
                disabled={isLoading}
                className="py-3"
              >
                {isLoading ? (
                  <>
                    <Icon name="Loader2" size={20} className="animate-spin mr-2" />
                    Authenticating...
                  </>
                ) : (
                  <>
                    <Icon name="LogIn" size={20} className="mr-2" />
                    Sign In
                  </>
                )}
              </Button>
            </form>

            {/* Footer */}
            <div className="mt-8 text-center">
              <p className="text-xs text-muted-foreground">
                Admin access is restricted to authorized personnel only
              </p>
              <button
                onClick={() => navigate('/')}
                className="text-primary hover:text-primary/80 text-sm mt-2 transition-colors"
              >
                ← Back to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;

