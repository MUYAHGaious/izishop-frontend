import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const QuickActions = ({ onBrowseProducts, onTrackOrder, onContactSupport, onViewProfile }) => {
  const quickActions = [
    {
      label: 'Browse Products',
      icon: 'Search',
      action: onBrowseProducts,
      variant: 'default',
      description: 'Discover new items'
    },
    {
      label: 'Track Order',
      icon: 'MapPin',
      action: onTrackOrder,
      variant: 'outline',
      description: 'Check delivery status'
    },
    {
      label: 'Contact Support',
      icon: 'MessageCircle',
      action: onContactSupport,
      variant: 'secondary',
      description: 'Get help anytime'
    },
    {
      label: 'View Profile',
      icon: 'User',
      action: onViewProfile,
      variant: 'ghost',
      description: 'Manage account'
    }
  ];

  return (
    <div className="bg-surface rounded-lg border border-border p-6 elevation-1">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-foreground">Quick Actions</h2>
        <Icon name="Zap" size={20} className="text-accent" />
      </div>

      {/* Desktop Grid Layout */}
      <div className="hidden md:grid grid-cols-2 gap-3">
        {quickActions.map((action, index) => (
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
                <h3 className="text-sm font-medium text-foreground">{action.label}</h3>
                <p className="text-xs text-muted-foreground mt-1">{action.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Mobile Button Layout */}
      <div className="md:hidden space-y-2">
        {quickActions.slice(0, 3).map((action, index) => (
          <Button
            key={index}
            variant={action.variant}
            fullWidth
            onClick={action.action}
            iconName={action.icon}
            iconPosition="left"
            className="justify-start transition-micro"
          >
            {action.label}
          </Button>
        ))}
      </div>

      {/* Mobile Floating Action Button */}
      <div className="md:hidden fixed bottom-6 right-6 z-1100">
        <Button
          variant="default"
          size="lg"
          onClick={quickActions[0].action}
          iconName={quickActions[0].icon}
          className="rounded-full w-14 h-14 elevation-3 hover:elevation-4 transition-smooth"
        />
      </div>
    </div>
  );
};

export default QuickActions;