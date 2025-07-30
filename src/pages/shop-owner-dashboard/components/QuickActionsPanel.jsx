import React from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const QuickActionsPanel = () => {
  const navigate = useNavigate();
  
  const quickActions = [
    {
      id: 'add-product',
      title: 'Add New Product',
      description: 'List a new item in your shop',
      icon: 'Plus',
      color: 'primary',
      action: () => navigate('/add-product'),
      badge: null
    },
    {
      id: 'process-orders',
      title: 'Process Orders',
      description: 'Handle pending customer orders',
      icon: 'Package',
      color: 'warning',
      action: () => {
        // Switch to orders tab in current dashboard
        const event = new CustomEvent('switchDashboardTab', { detail: 'orders' });
        window.dispatchEvent(event);
      },
      badge: '5'
    },
    {
      id: 'customer-messages',
      title: 'Customer Messages',
      description: 'Respond to customer inquiries',
      icon: 'MessageCircle',
      color: 'secondary',
      action: () => navigate('/chat-interface-modal'),
      badge: '3'
    },
    {
      id: 'inventory-check',
      title: 'Inventory Check',
      description: 'Review stock levels and alerts',
      icon: 'Package2',
      color: 'success',
      action: () => navigate('/my-products'),
      badge: null
    },
    {
      id: 'sales-report',
      title: 'Sales Report',
      description: 'Generate performance reports',
      icon: 'BarChart3',
      color: 'accent',
      action: () => {
        // Switch to analytics tab in current dashboard
        const event = new CustomEvent('switchDashboardTab', { detail: 'analytics' });
        window.dispatchEvent(event);
      },
      badge: null
    },
    {
      id: 'shop-settings',
      title: 'Shop Settings',
      description: 'Update shop information',
      icon: 'Settings',
      color: 'muted',
      action: () => navigate('/my-shop-profile'),
      badge: null
    }
  ];

  const getColorClasses = (color) => {
    switch (color) {
      case 'primary':
        return 'bg-primary/10 text-primary border-primary/20 hover:bg-primary/20';
      case 'secondary':
        return 'bg-secondary/10 text-secondary border-secondary/20 hover:bg-secondary/20';
      case 'success':
        return 'bg-success/10 text-success border-success/20 hover:bg-success/20';
      case 'warning':
        return 'bg-warning/10 text-warning border-warning/20 hover:bg-warning/20';
      case 'accent':
        return 'bg-accent/10 text-accent border-accent/20 hover:bg-accent/20';
      default:
        return 'bg-muted/50 text-muted-foreground border-border hover:bg-muted';
    }
  };

  return (
    <div className="bg-surface rounded-lg border border-border elevation-1">
      <div className="p-6 border-b border-border">
        <div className="flex items-center space-x-2">
          <Icon name="Zap" size={20} className="text-accent" />
          <h3 className="text-lg font-semibold text-foreground">Quick Actions</h3>
        </div>
      </div>

      <div className="p-6">
        {/* Desktop Grid Layout */}
        <div className="hidden md:grid grid-cols-2 lg:grid-cols-3 gap-4">
          {quickActions.map((action) => (
            <div
              key={action.id}
              className={`group p-4 rounded-lg border transition-micro cursor-pointer hover-scale ${getColorClasses(action.color)}`}
              onClick={action.action}
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getColorClasses(action.color)}`}>
                  <Icon name={action.icon} size={20} />
                </div>
                {action.badge && (
                  <span className="bg-error text-error-foreground text-xs px-2 py-1 rounded-full font-medium">
                    {action.badge}
                  </span>
                )}
              </div>
              
              <div>
                <h4 className="font-medium text-foreground mb-1">{action.title}</h4>
                <p className="text-sm text-muted-foreground">{action.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Mobile List Layout */}
        <div className="md:hidden space-y-3">
          {quickActions.slice(0, 4).map((action) => (
            <div
              key={action.id}
              className="flex items-center space-x-4 p-4 rounded-lg border border-border hover:bg-muted/30 transition-micro cursor-pointer"
              onClick={action.action}
            >
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getColorClasses(action.color)}`}>
                <Icon name={action.icon} size={20} />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <h4 className="font-medium text-foreground">{action.title}</h4>
                  {action.badge && (
                    <span className="bg-error text-error-foreground text-xs px-2 py-1 rounded-full font-medium">
                      {action.badge}
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground truncate">{action.description}</p>
              </div>
              
              <Icon name="ChevronRight" size={16} className="text-muted-foreground" />
            </div>
          ))}
        </div>

        {/* Priority Actions for Mobile */}
        <div className="md:hidden mt-6 pt-4 border-t border-border">
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="default"
              fullWidth
              onClick={quickActions[0].action}
              iconName={quickActions[0].icon}
              iconPosition="left"
              iconSize={16}
            >
              {quickActions[0].title}
            </Button>
            <Button
              variant="outline"
              fullWidth
              onClick={quickActions[1].action}
              iconName={quickActions[1].icon}
              iconPosition="left"
              iconSize={16}
            >
              Process Orders
              {quickActions[1].badge && (
                <span className="ml-2 bg-warning text-warning-foreground text-xs px-2 py-0.5 rounded-full">
                  {quickActions[1].badge}
                </span>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickActionsPanel;