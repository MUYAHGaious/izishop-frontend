import React from 'react';
import Icon from '../../../components/AppIcon';

const OrderStatusSummary = ({ orderStats, onStatusClick }) => {
  const statusConfig = [
    {
      key: 'active',
      label: 'Active Orders',
      icon: 'Package',
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      borderColor: 'border-primary/20'
    },
    {
      key: 'delivered',
      label: 'Delivered',
      icon: 'CheckCircle',
      color: 'text-success',
      bgColor: 'bg-success/10',
      borderColor: 'border-success/20'
    },
    {
      key: 'pending',
      label: 'Pending',
      icon: 'Clock',
      color: 'text-warning',
      bgColor: 'bg-warning/10',
      borderColor: 'border-warning/20'
    }
  ];

  return (
    <div className="bg-surface rounded-lg border border-border p-6 elevation-1">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-foreground">Order Overview</h2>
        <Icon name="ShoppingBag" size={20} className="text-primary" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {statusConfig.map((status) => {
          const count = orderStats[status.key] || 0;
          
          return (
            <div
              key={status.key}
              className={`p-4 rounded-lg border transition-micro cursor-pointer hover-scale ${
                count > 0 
                  ? `${status.bgColor} ${status.borderColor}` 
                  : 'bg-muted/50 border-border'
              }`}
              onClick={() => onStatusClick(status.key)}
            >
              <div className="flex items-center justify-between mb-2">
                <Icon 
                  name={status.icon} 
                  size={20} 
                  className={count > 0 ? status.color : 'text-muted-foreground'} 
                />
                {count > 0 && (
                  <span className="bg-accent text-accent-foreground text-xs px-2 py-0.5 rounded-full">
                    {count}
                  </span>
                )}
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-1">{count}</h3>
              <p className="text-sm text-muted-foreground">{status.label}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OrderStatusSummary;