import React from 'react';
import Icon from '../../../components/AppIcon';

const ShopStats = ({ stats }) => {
  const statItems = [
    {
      icon: "TrendingUp",
      label: "Sales Volume",
      value: stats.salesVolume,
      change: stats.salesChange,
      changeType: stats.salesChange > 0 ? "positive" : "negative"
    },
    {
      icon: "Clock",
      label: "Response Time",
      value: stats.responseTime,
      subtitle: "Average response"
    },
    {
      icon: "Truck",
      label: "Shipping",
      value: stats.shippingTime,
      subtitle: "Processing time"
    },
    {
      icon: "Shield",
      label: "Satisfaction",
      value: `${stats.satisfactionRate}%`,
      subtitle: "Customer satisfaction"
    }
  ];

  return (
    <div className="bg-surface rounded-xl border border-border p-6 mb-6">
      <h3 className="text-lg font-semibold text-text-primary mb-4">Shop Statistics</h3>
      
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statItems.map((item, index) => (
          <div key={index} className="text-center">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Icon name={item.icon} size={20} className="text-primary" />
            </div>
            
            <div className="space-y-1">
              <div className="text-xl font-bold text-text-primary">{item.value}</div>
              <div className="text-sm text-text-secondary">{item.label}</div>
              
              {item.change && (
                <div className={`text-xs flex items-center justify-center gap-1 ${
                  item.changeType === 'positive' ? 'text-success' : 'text-error'
                }`}>
                  <Icon 
                    name={item.changeType === 'positive' ? "TrendingUp" : "TrendingDown"} 
                    size={12} 
                  />
                  <span>{Math.abs(item.change)}%</span>
                </div>
              )}
              
              {item.subtitle && (
                <div className="text-xs text-text-secondary">{item.subtitle}</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ShopStats;