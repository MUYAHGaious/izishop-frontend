import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const DashboardHeader = ({ shopData, notifications }) => {
  return (
    <div className="bg-surface border-b border-border p-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* Shop Info */}
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center overflow-hidden">
            <Icon name="Store" size={32} className="text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-text-primary">{shopData.name}</h1>
            <p className="text-text-secondary">{shopData.category} • {shopData.location}</p>
            <div className="flex items-center space-x-4 mt-1">
              <div className="flex items-center space-x-1">
                <Icon name="Star" size={16} className="text-warning fill-current" />
                <span className="text-sm font-medium">{shopData.rating}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Icon name="Users" size={16} className="text-text-secondary" />
                <span className="text-sm text-text-secondary">{shopData.followers} followers</span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Button variant="ghost" size="icon">
              <Icon name="Bell" size={20} />
            </Button>
            {notifications.unread > 0 && (
              <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs font-medium rounded-full w-5 h-5 flex items-center justify-center">
                {notifications.unread}
              </span>
            )}
          </div>
          <Button variant="outline" iconName="Settings" iconPosition="left">
            Shop Settings
          </Button>
          <Button variant="default" iconName="Plus" iconPosition="left">
            Add Product
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;