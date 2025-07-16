import React from 'react';
import Icon from '../../../components/AppIcon';

const TabNavigation = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'products', label: 'Products', icon: 'Package', count: 156 },
    { id: 'orders', label: 'Orders', icon: 'ShoppingCart', count: 23 },
    { id: 'inventory', label: 'Inventory', icon: 'Warehouse', count: 12 },
    { id: 'analytics', label: 'Analytics', icon: 'BarChart3', count: null },
    { id: 'earnings', label: 'Earnings', icon: 'DollarSign', count: null }
  ];

  return (
    <div className="bg-surface border-b border-border">
      <div className="flex overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex items-center space-x-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? 'text-primary border-primary bg-primary/5' :'text-text-secondary border-transparent hover:text-text-primary hover:border-border'
            }`}
          >
            <Icon name={tab.icon} size={18} />
            <span>{tab.label}</span>
            {tab.count !== null && (
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                activeTab === tab.id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-text-secondary'
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TabNavigation;