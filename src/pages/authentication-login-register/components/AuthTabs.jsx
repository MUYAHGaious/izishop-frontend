import React from 'react';

const AuthTabs = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'login', label: 'Login', description: 'Access your account' },
    { id: 'register', label: 'Register', description: 'Create new account' }
  ];

  return (
    <div className="flex bg-muted rounded-lg p-1 mb-6">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`flex-1 px-4 py-3 rounded-md text-sm font-medium marketplace-transition ${
            activeTab === tab.id
              ? 'bg-card text-primary shadow-sm'
              : 'text-text-secondary hover:text-foreground hover:bg-card/50'
          }`}
        >
          <div className="text-center">
            <div className="font-semibold">{tab.label}</div>
            <div className="text-xs opacity-70 mt-0.5">{tab.description}</div>
          </div>
        </button>
      ))}
    </div>
  );
};

export default AuthTabs;