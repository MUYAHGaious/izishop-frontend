import React from 'react';
import Icon from '../../../components/AppIcon';

const TabNavigation = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'overview', label: 'Overview', icon: 'LayoutDashboard', count: null },
    { id: 'products', label: 'Products', icon: 'Package', count: null },
    { id: 'orders', label: 'Orders', icon: 'ShoppingCart', count: null },
    { id: 'inventory', label: 'Inventory', icon: 'Warehouse', count: null },
    { id: 'analytics', label: 'Analytics', icon: 'BarChart3', count: null },
    { id: 'earnings', label: 'Earnings', icon: 'DollarSign', count: null }
  ];

  return (
    <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 relative overflow-hidden">
      {/* Subtle blur decoration */}
      <div className="absolute top-0 left-1/2 w-64 h-8 bg-teal-400/5 rounded-full -translate-x-32 -translate-y-4 pointer-events-none"></div>
      
      <div className="flex overflow-x-auto scrollbar-hide">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex items-center space-x-3 px-6 py-4 text-sm font-semibold transition-all duration-300 whitespace-nowrap relative group ${
              activeTab === tab.id
                ? 'text-teal-600 bg-teal-50/50' 
                : 'text-gray-600 hover:text-teal-600 hover:bg-gray-50/50'
            }`}
          >
            {/* Active tab indicator */}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-500 to-teal-600 rounded-t-full"></div>
            )}
            
            {/* Icon with modern styling */}
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-300 ${
              activeTab === tab.id
                ? 'bg-gradient-to-br from-teal-500 to-teal-600 text-white shadow-lg'
                : 'bg-gray-100 text-gray-500 group-hover:bg-teal-100 group-hover:text-teal-600'
            }`}>
              <Icon name={tab.icon} size={16} />
            </div>
            
            <span className="font-medium">{tab.label}</span>
            
            {tab.count !== null && (
              <span className={`px-2.5 py-1 rounded-full text-xs font-bold shadow-sm transition-all duration-300 ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-teal-500 to-teal-600 text-white'
                  : 'bg-gray-200 text-gray-600 group-hover:bg-teal-100 group-hover:text-teal-700'
              }`}>
                {tab.count}
              </span>
            )}
            
            {/* Hover effect background */}
            <div className={`absolute inset-0 rounded-t-lg transition-all duration-300 ${
              activeTab === tab.id
                ? 'bg-gradient-to-b from-teal-50/80 to-teal-50/20'
                : 'bg-transparent group-hover:bg-gradient-to-b group-hover:from-gray-50/80 group-hover:to-gray-50/20'
            }`}></div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default TabNavigation;