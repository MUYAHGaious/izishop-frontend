import React from 'react';

import Icon from '../../../components/AppIcon';

const ContactOptions = ({ activeTab, onTabChange, onCall, shop }) => {
  const tabs = [
    { id: 'chat', label: 'Chat', icon: 'MessageCircle' },
    { id: 'email', label: 'Email', icon: 'Mail' },
    { id: 'call', label: 'Call', icon: 'Phone' }
  ];

  const handleTabClick = (tabId) => {
    if (tabId === 'call') {
      onCall();
    } else {
      onTabChange(tabId);
    }
  };

  return (
    <div className="flex border-b border-border">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => handleTabClick(tab.id)}
          className={`flex-1 flex items-center justify-center gap-2 p-3 text-sm font-medium transition-colors ${
            activeTab === tab.id
              ? 'text-primary border-b-2 border-primary bg-primary/5' :'text-text-secondary hover:text-text-primary hover:bg-muted/50'
          }`}
        >
          <Icon name={tab.icon} size={16} />
          <span>{tab.label}</span>
        </button>
      ))}
    </div>
  );
};

export default ContactOptions;