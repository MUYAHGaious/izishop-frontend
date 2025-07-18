import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';
import api from '../../services/api';

const AdminSetup = () => {
  const [status, setStatus] = useState({ loading: true, adminExists: false });
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    checkAdminStatus();
  }, []);

  const checkAdminStatus = async () => {
    try {
      const response = await api.checkAdminStatus();
      setStatus({
        loading: false,
        adminExists: response.admin_exists,
        adminCount: response.admin_count,
        setupRequired: response.setup_required
      });
    } catch (error) {
      setStatus({ loading: false, adminExists: false });
      setError('Failed to check admin status');
    }
  };

  const createDefaultAdmin = async () => {
    setCreating(true);
    setError('');
    setSuccess('');

    try {
      const response = await api.createDefaultAdmin();
      setSuccess('Default admin user created successfully!');
      setStatus(prev => ({ ...prev, adminExists: true, setupRequired: false }));
      
      // Show success message for 2 seconds, then redirect
      setTimeout(() => {
        navigate('/admin-login');
      }, 2000);
    } catch (error) {
      setError(error.message || 'Failed to create admin user');
    } finally {
      setCreating(false);
    }
  };

  if (status.loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Checking admin status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Icon name="Settings" size={32} className="text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Setup</h1>
            <p className="text-gray-600 mt-2">
              {status.adminExists 
                ? 'Admin user already exists' 
                : 'Create your first admin user'
              }
            </p>
          </div>

          {/* Status Messages */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <Icon name="AlertCircle" size={16} className="text-red-600" />
                <span className="text-sm text-red-700">{error}</span>
              </div>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <Icon name="CheckCircle" size={16} className="text-green-600" />
                <span className="text-sm text-green-700">{success}</span>
              </div>
            </div>
          )}

          {/* Content */}
          {status.adminExists ? (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icon name="CheckCircle" size={32} className="text-green-600" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900 mb-2">
                  Admin User Exists
                </h2>
                <p className="text-gray-600 text-sm">
                  Admin users are already set up in the system.
                  You can proceed to login.
                </p>
              </div>

              <div className="flex flex-col space-y-3">
                <Button
                  onClick={() => navigate('/admin-login')}
                  fullWidth
                  className="py-3"
                >
                  <Icon name="LogIn" size={20} className="mr-2" />
                  Go to Admin Login
                </Button>
                
                <Button
                  onClick={() => navigate('/')}
                  variant="outline"
                  fullWidth
                  className="py-3"
                >
                  <Icon name="Home" size={20} className="mr-2" />
                  Back to Home
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icon name="UserPlus" size={32} className="text-blue-600" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900 mb-2">
                  Create Default Admin
                </h2>
                <p className="text-gray-600 text-sm mb-4">
                  No admin users found. Create a default admin user to get started.
                </p>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
                  <h3 className="font-medium text-blue-900 mb-2">Default Credentials:</h3>
                  <div className="text-sm text-blue-800 space-y-1">
                    <p><strong>Email:</strong> admin@izishop.com</p>
                    <p><strong>Password:</strong> Admin123!</p>
                  </div>
                  <p className="text-xs text-blue-600 mt-2">
                    You can change these credentials after login.
                  </p>
                </div>
              </div>

              <div className="flex flex-col space-y-3">
                <Button
                  onClick={createDefaultAdmin}
                  disabled={creating}
                  fullWidth
                  className="py-3"
                >
                  {creating ? (
                    <>
                      <Icon name="Loader2" size={20} className="animate-spin mr-2" />
                      Creating Admin...
                    </>
                  ) : (
                    <>
                      <Icon name="UserPlus" size={20} className="mr-2" />
                      Create Default Admin
                    </>
                  )}
                </Button>
                
                <Button
                  onClick={() => navigate('/')}
                  variant="outline"
                  fullWidth
                  className="py-3"
                >
                  <Icon name="Home" size={20} className="mr-2" />
                  Back to Home
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminSetup;