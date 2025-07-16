import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Icon from '../AppIcon';
import Button from './Button';

const UserMenu = ({ 
  user, 
  isAuthenticated, 
  onLogin, 
  onLogout, 
  onRegister,
  className = "" 
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [mockUser, setMockUser] = useState(null);
  const [mockIsAuthenticated, setMockIsAuthenticated] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check for existing user in localStorage
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      setMockUser(userData);
      setMockIsAuthenticated(true);
    }

    // Use provided props if available
    if (user) setMockUser(user);
    if (typeof isAuthenticated === 'boolean') setMockIsAuthenticated(isAuthenticated);
  }, [user, isAuthenticated]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  const handleLogin = () => {
    if (onLogin) {
      onLogin();
    } else {
      navigate('/authentication-login-register');
    }
  };

  const handleRegister = () => {
    if (onRegister) {
      onRegister();
    } else {
      navigate('/authentication-login-register');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('authToken');
    setMockUser(null);
    setMockIsAuthenticated(false);
    setIsMenuOpen(false);
    
    if (onLogout) {
      onLogout();
    } else {
      navigate('/landing-page');
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const getUserInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const menuItems = [
    {
      label: 'Profile',
      icon: 'User',
      path: '/profile',
      description: 'Manage your account'
    },
    {
      label: 'Orders',
      icon: 'Package',
      path: '/orders',
      description: 'Track your purchases'
    },
    {
      label: 'Wishlist',
      icon: 'Heart',
      path: '/wishlist',
      description: 'Saved items'
    },
    {
      label: 'Addresses',
      icon: 'MapPin',
      path: '/addresses',
      description: 'Delivery addresses'
    },
    {
      label: 'Payment Methods',
      icon: 'CreditCard',
      path: '/payment-methods',
      description: 'Manage payments'
    },
    {
      label: 'Settings',
      icon: 'Settings',
      path: '/settings',
      description: 'Account preferences'
    }
  ];

  const quickActions = [
    {
      label: 'Sell on IziShop',
      icon: 'Store',
      path: '/seller-dashboard',
      description: 'Start selling',
      highlight: true
    },
    {
      label: 'Help & Support',
      icon: 'HelpCircle',
      path: '/support',
      description: 'Get assistance'
    }
  ];

  if (!mockIsAuthenticated) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <Button variant="ghost" size="sm" onClick={handleLogin}>
          Login
        </Button>
        <Button variant="default" size="sm" onClick={handleRegister}>
          Sign Up
        </Button>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`} ref={menuRef}>
      {/* User Avatar Button */}
      <button
        onClick={toggleMenu}
        className="flex items-center space-x-2 p-2 rounded-md text-text-secondary hover:text-primary hover:bg-muted marketplace-transition"
      >
        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
          <span className="text-sm font-medium text-primary-foreground">
            {getUserInitials(mockUser?.name)}
          </span>
        </div>
        <div className="hidden md:block text-left">
          <p className="text-sm font-medium text-foreground">
            {mockUser?.name || 'User'}
          </p>
        </div>
        <Icon 
          name="ChevronDown" 
          size={16} 
          className={`marketplace-transition ${isMenuOpen ? 'rotate-180' : ''}`} 
        />
      </button>

      {/* Dropdown Menu */}
      {isMenuOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-popover border border-border rounded-md shadow-modal z-1010">
          {/* User Info Header */}
          <div className="px-4 py-3 border-b border-border">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                <span className="text-lg font-medium text-primary-foreground">
                  {getUserInitials(mockUser?.name)}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">
                  {mockUser?.name || 'User Name'}
                </p>
                <p className="text-xs text-text-secondary truncate">
                  {mockUser?.email || 'user@example.com'}
                </p>
                {mockUser?.role && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary mt-1">
                    {mockUser.role}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center px-4 py-2 text-sm text-foreground hover:bg-muted marketplace-transition"
              >
                <Icon name={item.icon} size={16} className="mr-3 text-text-secondary" />
                <div className="flex-1">
                  <div className="font-medium">{item.label}</div>
                  <div className="text-xs text-text-secondary">{item.description}</div>
                </div>
              </Link>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="py-2 border-t border-border">
            {quickActions.map((action) => (
              <Link
                key={action.path}
                to={action.path}
                onClick={() => setIsMenuOpen(false)}
                className={`flex items-center px-4 py-2 text-sm marketplace-transition ${
                  action.highlight
                    ? 'text-accent hover:bg-accent/10' :'text-foreground hover:bg-muted'
                }`}
              >
                <Icon 
                  name={action.icon} 
                  size={16} 
                  className={`mr-3 ${action.highlight ? 'text-accent' : 'text-text-secondary'}`} 
                />
                <div className="flex-1">
                  <div className="font-medium">{action.label}</div>
                  <div className="text-xs text-text-secondary">{action.description}</div>
                </div>
                {action.highlight && (
                  <span className="text-xs bg-accent text-accent-foreground px-2 py-0.5 rounded-full font-medium">
                    New
                  </span>
                )}
              </Link>
            ))}
          </div>

          {/* Logout */}
          <div className="py-2 border-t border-border">
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-2 text-sm text-foreground hover:bg-muted marketplace-transition"
            >
              <Icon name="LogOut" size={16} className="mr-3 text-text-secondary" />
              <div className="flex-1 text-left">
                <div className="font-medium">Logout</div>
                <div className="text-xs text-text-secondary">Sign out of your account</div>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserMenu;