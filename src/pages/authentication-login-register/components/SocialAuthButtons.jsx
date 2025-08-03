import React from 'react';

import Icon from '../../../components/AppIcon';

const SocialAuthButtons = ({ onSocialLogin, isLoading }) => {
  const socialProviders = [
    {
      id: 'google',
      name: 'Google',
      icon: 'Chrome',
      color: 'bg-red-500 hover:bg-red-600',
      textColor: 'text-white'
    },
    {
      id: 'facebook',
      name: 'Facebook',
      icon: 'Facebook',
      color: 'bg-blue-600 hover:bg-blue-700',
      textColor: 'text-white'
    }
  ];

  const handleSocialLogin = (provider) => {
    if (onSocialLogin) {
      onSocialLogin(provider);
    }
  };

  return (
    <div className="space-y-3">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-card text-text-secondary">Or continue with</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {socialProviders.map((provider) => (
          <button
            key={provider.id}
            onClick={() => handleSocialLogin(provider.id)}
            disabled={isLoading}
            className={`flex items-center justify-center px-4 py-3 rounded-md font-medium marketplace-transition ${provider.color} ${provider.textColor} disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <Icon name={provider.icon} size={18} className="mr-2" />
            <span className="text-sm">Continue with {provider.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default SocialAuthButtons;