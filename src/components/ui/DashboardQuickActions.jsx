import React from 'react';
import { useLocation } from 'react-router-dom';
import Icon from '../AppIcon';
import Button from './Button';

const DashboardQuickActions = () => {
  const location = useLocation();

  // Determine user role and context
  const getUserRole = () => {
    const currentPath = location.pathname;
    if (currentPath.includes('admin')) return 'admin';
    if (currentPath.includes('shop-owner')) return 'shop-owner';
    return 'customer';
  };

  const userRole = getUserRole();

  // Role-specific quick actions
  const quickActionsConfig = {
    customer: [
      {
        label: 'Browse Products',
        icon: 'Search',
        action: () => console.log('Browse products'),
        variant: 'default',
        description: 'Discover new items'
      },
      {
        label: 'Track Order',
        icon: 'MapPin',
        action: () => console.log('Track order'),
        variant: 'outline',
        description: 'Check delivery status'
      },
      {
        label: 'Quick Reorder',
        icon: 'RotateCcw',
        action: () => console.log('Quick reorder'),
        variant: 'secondary',
        description: 'Reorder favorites'
      }
    ],
    'shop-owner': [
      {
        label: 'Add Product',
        icon: 'Plus',
        action: () => window.location.href = '/product-management',
        variant: 'default',
        description: 'List new item'
      },
      {
        label: 'Process Orders',
        icon: 'Package',
        action: () => window.location.href = '/order-management',
        variant: 'outline',
        description: 'Fulfill pending orders',
        badge: '5'
      },
      {
        label: 'View Analytics',
        icon: 'BarChart3',
        action: () => console.log('View analytics'),
        variant: 'secondary',
        description: 'Sales performance'
      },
      {
        label: 'Manage Inventory',
        icon: 'Package2',
        action: () => console.log('Manage inventory'),
        variant: 'ghost',
        description: 'Stock levels'
      }
    ],
    admin: [
      {
        label: 'User Management',
        icon: 'Users',
        action: () => console.log('User management'),
        variant: 'default',
        description: 'Manage platform users'
      },
      {
        label: 'System Reports',
        icon: 'FileText',
        action: () => console.log('System reports'),
        variant: 'outline',
        description: 'Platform analytics'
      },
      {
        label: 'Vendor Approval',
        icon: 'CheckCircle',
        action: () => console.log('Vendor approval'),
        variant: 'secondary',
        description: 'Review applications',
        badge: '3'
      },
      {
        label: 'Platform Settings',
        icon: 'Settings',
        action: () => console.log('Platform settings'),
        variant: 'ghost',
        description: 'System configuration'
      }
    ]
  };

  const currentActions = quickActionsConfig[userRole] || [];

  return (
    <div className="bg-surface rounded-lg border border-border p-6 elevation-1">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">Quick Actions</h3>
        <Icon name="Zap" size={20} className="text-accent" />
      </div>

      {/* Desktop Grid Layout */}
      <div className="hidden md:grid grid-cols-2 gap-3">
        {currentActions.map((action, index) => (
          <div
            key={index}
            className="group p-4 rounded-lg border border-border hover:border-primary/20 transition-micro hover-scale cursor-pointer"
            onClick={action.action}
          >
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-micro">
                  <Icon name={action.icon} size={20} className="text-primary" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <h4 className="text-sm font-medium text-foreground">{action.label}</h4>
                  {action.badge && (
                    <span className="bg-accent text-accent-foreground text-xs px-2 py-0.5 rounded-full">
                      {action.badge}
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">{action.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Mobile Button Layout */}
      <div className="md:hidden space-y-2">
        {currentActions.slice(0, 3).map((action, index) => (
          <Button
            key={index}
            variant={action.variant}
            fullWidth
            onClick={action.action}
            iconName={action.icon}
            iconPosition="left"
            className="justify-start transition-micro"
          >
            <span className="flex-1 text-left">{action.label}</span>
            {action.badge && (
              <span className="bg-accent text-accent-foreground text-xs px-2 py-0.5 rounded-full ml-2">
                {action.badge}
              </span>
            )}
          </Button>
        ))}
      </div>

      {/* Mobile Floating Action Button for Primary Action */}
      <div className="md:hidden fixed bottom-6 right-6 z-1100">
        <Button
          variant="default"
          size="lg"
          onClick={currentActions[0]?.action}
          iconName={currentActions[0]?.icon}
          className="rounded-full w-14 h-14 elevation-3 hover:elevation-4 transition-smooth"
        />
      </div>
    </div>
  );
};

export default DashboardQuickActions;