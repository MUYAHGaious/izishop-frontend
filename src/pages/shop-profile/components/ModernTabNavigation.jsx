import React from 'react';
import { Package, Star, MessageCircle, Info, Users, TrendingUp } from 'lucide-react';

const ModernTabNavigation = ({ activeTab, onTabChange, tabs }) => {
  const getTabIcon = (tabId) => {
    switch (tabId) {
      case 'products':
        return <Package size={18} />;
      case 'reviews':
        return <Star size={18} />;
      case 'about':
        return <Info size={18} />;
      case 'contact':
        return <MessageCircle size={18} />;
      case 'followers':
        return <Users size={18} />;
      case 'analytics':
        return <TrendingUp size={18} />;
      default:
        return <Package size={18} />;
    }
  };

  return (
    <div className="sticky top-16 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center gap-2 px-6 py-4 font-semibold text-sm transition-all duration-200 whitespace-nowrap border-b-2 ${
                activeTab === tab.id
                  ? 'text-teal-600 border-teal-600 bg-teal-50/50'
                  : 'text-gray-600 border-transparent hover:text-gray-900 hover:border-gray-300'
              }`}
            >
              {getTabIcon(tab.id)}
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                  activeTab === tab.id
                    ? 'bg-teal-100 text-teal-700'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ModernTabNavigation;
