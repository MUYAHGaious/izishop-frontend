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
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 relative overflow-hidden">
      {/* Subtle blur effect */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-teal-400/5 rounded-full -translate-y-16 translate-x-16 pointer-events-none"></div>
      
      <div className="p-6 border-b border-gray-200/50">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
            <Icon name="Zap" size={20} className="text-white" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">
            Quick Actions
          </h3>
        </div>
      </div>

      <div className="p-6">
        {/* Desktop Grid Layout */}
        <div className="hidden md:grid grid-cols-2 lg:grid-cols-3 gap-6">
          {quickActions.map((action, index) => {
            const gradients = [
              'bg-gradient-to-br from-teal-400 to-teal-600',
              'bg-gradient-to-br from-blue-500 to-blue-700',
              'bg-gradient-to-br from-purple-500 to-purple-700',
              'bg-gradient-to-br from-orange-500 to-orange-700',
              'bg-gradient-to-br from-green-500 to-green-700',
              'bg-gradient-to-br from-gray-600 to-gray-800'
            ];
            
            return (
              <div
                key={action.id}
                className={`${gradients[index]} text-white rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer relative overflow-hidden group`}
                onClick={action.action}
              >
                {/* Blur effects */}
                <div className="absolute top-0 left-0 w-20 h-20 bg-white/15 rounded-full -translate-y-10 -translate-x-10 pointer-events-none group-hover:scale-110 transition-transform duration-300"></div>
                
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                      <Icon name={action.icon} size={24} className="text-white" />
                    </div>
                    {action.badge && (
                      <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-semibold shadow-lg">
                        {action.badge}
                      </span>
                    )}
                  </div>
                  
                  <div>
                    <h4 className="font-bold text-lg text-white mb-2">{action.title}</h4>
                    <p className="text-sm text-white/80 leading-relaxed">{action.description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Mobile List Layout */}
        <div className="md:hidden space-y-4">
          {quickActions.slice(0, 4).map((action, index) => {
            const gradients = [
              'bg-gradient-to-r from-teal-400 to-teal-600',
              'bg-gradient-to-r from-blue-500 to-blue-700',
              'bg-gradient-to-r from-purple-500 to-purple-700',
              'bg-gradient-to-r from-orange-500 to-orange-700'
            ];
            
            return (
              <div
                key={action.id}
                className={`${gradients[index]} text-white rounded-xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer relative overflow-hidden group`}
                onClick={action.action}
              >
                {/* Blur effect */}
                <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -translate-y-8 translate-x-8 pointer-events-none group-hover:scale-110 transition-transform duration-300"></div>
                
                <div className="flex items-center space-x-4 relative z-10">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                    <Icon name={action.icon} size={20} className="text-white" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-bold text-white">{action.title}</h4>
                      {action.badge && (
                        <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-semibold shadow-lg">
                          {action.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-white/80 truncate">{action.description}</p>
                  </div>
                  
                  <Icon name="ChevronRight" size={16} className="text-white/60" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Priority Actions for Mobile */}
        <div className="md:hidden mt-6 pt-4 border-t border-gray-200/50">
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={quickActions[0].action}
              className="bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-xl px-4 py-3 font-semibold hover:from-teal-600 hover:to-teal-700 transition-all duration-300 hover:scale-105 shadow-lg flex items-center justify-center space-x-2"
            >
              <Icon name={quickActions[0].icon} size={16} />
              <span>Add Product</span>
            </button>
            <button
              onClick={quickActions[1].action}
              className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl px-4 py-3 font-semibold hover:from-blue-600 hover:to-blue-700 transition-all duration-300 hover:scale-105 shadow-lg flex items-center justify-center space-x-2 relative"
            >
              <Icon name={quickActions[1].icon} size={16} />
              <span>Orders</span>
              {quickActions[1].badge && (
                <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-semibold ml-1">
                  {quickActions[1].badge}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickActionsPanel;