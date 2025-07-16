import React from 'react';
import Icon from '../../../components/AppIcon';

const ShopNavigation = ({ activeTab, onTabChange, productCount, reviewCount }) => {
  const tabs = [
    {
      id: 'products',
      label: 'Products',
      icon: 'Package',
      count: productCount
    },
    {
      id: 'about',
      label: 'About',
      icon: 'Info'
    },
    {
      id: 'reviews',
      label: 'Reviews',
      icon: 'Star',
      count: reviewCount
    },
    {
      id: 'policies',
      label: 'Policies',
      icon: 'FileText'
    }
  ];

  return (
    <div className="bg-surface border-b border-border sticky top-16 z-40">
      <div className="max-w-7xl mx-auto">
        <nav className="flex overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 marketplace-transition ${
                activeTab === tab.id
                  ? 'text-primary border-primary' :'text-text-secondary border-transparent hover:text-foreground hover:border-border'
              }`}
            >
              <Icon name={tab.icon} size={16} />
              <span>{tab.label}</span>
              {tab.count && (
                <span className="bg-muted text-text-secondary px-2 py-0.5 rounded-full text-xs">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default ShopNavigation;