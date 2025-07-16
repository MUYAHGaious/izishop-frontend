import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const FloatingContact = ({ shop, onContact }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const contactOptions = [
    {
      label: 'Chat',
      icon: 'MessageCircle',
      action: () => onContact('chat'),
      color: 'bg-primary'
    },
    {
      label: 'Call',
      icon: 'Phone',
      action: () => onContact('call'),
      color: 'bg-success'
    },
    {
      label: 'Email',
      icon: 'Mail',
      action: () => onContact('email'),
      color: 'bg-secondary'
    }
  ];

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="fixed bottom-20 lg:bottom-6 right-4 lg:right-6 z-50">
      {/* Contact Options */}
      <div className={`flex flex-col gap-3 mb-3 transition-all duration-300 ${
        isExpanded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
      }`}>
        {contactOptions.map((option, index) => (
          <div
            key={option.label}
            className="flex items-center gap-3 animate-slide-up"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <span className="bg-surface text-text-primary px-3 py-2 rounded-lg shadow-elevated text-sm font-medium whitespace-nowrap">
              {option.label}
            </span>
            <button
              onClick={option.action}
              className={`w-12 h-12 ${option.color} rounded-full flex items-center justify-center shadow-elevated hover:scale-110 transition-transform`}
            >
              <Icon name={option.icon} size={20} color="white" />
            </button>
          </div>
        ))}
      </div>

      {/* Main Contact Button */}
      <button
        onClick={toggleExpanded}
        className={`w-14 h-14 bg-primary rounded-full flex items-center justify-center shadow-elevated hover:scale-110 transition-all duration-300 ${
          isExpanded ? 'rotate-45' : 'rotate-0'
        }`}
      >
        <Icon 
          name={isExpanded ? "X" : "MessageCircle"} 
          size={24} 
          color="white" 
        />
      </button>

      {/* Shop Status Indicator */}
      <div className="absolute -top-2 -left-2">
        <div className={`w-4 h-4 rounded-full border-2 border-white ${
          shop.isOnline ? 'bg-success' : 'bg-error'
        }`} />
      </div>
    </div>
  );
};

export default FloatingContact;