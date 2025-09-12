import React from 'react';
import Icon from '../../../components/AppIcon';

const PlatformMetrics = () => {
  const metrics = [
    {
      title: "Total Users",
      value: "12,847",
      change: "+8.2%",
      changeType: "increase",
      icon: "Users",
      color: "text-primary",
      bgColor: "bg-primary/10"
    },
    {
      title: "Active Shops",
      value: "1,234",
      change: "+12.5%",
      changeType: "increase",
      icon: "Store",
      color: "text-secondary",
      bgColor: "bg-secondary/10"
    },
    {
      title: "Total Orders",
      value: "45,892",
      change: "+15.3%",
      changeType: "increase",
      icon: "Package",
      color: "text-success",
      bgColor: "bg-success/10"
    },
    {
      title: "Revenue (XAF)",
      value: "125,847,000",
      change: "+22.1%",
      changeType: "increase",
      icon: "DollarSign",
      color: "text-warning",
      bgColor: "bg-warning/10"
    },
    {
      title: "Commission Earned",
      value: "8,750,000",
      change: "+18.7%",
      changeType: "increase",
      icon: "TrendingUp",
      color: "text-accent",
      bgColor: "bg-accent/10"
    },
    {
      title: "Disputes",
      value: "23",
      change: "-12.3%",
      changeType: "decrease",
      icon: "AlertTriangle",
      color: "text-error",
      bgColor: "bg-error/10"
    }
  ];

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      {metrics.map((metric, index) => (
        <div key={index} className="bg-surface rounded-lg border border-border p-6 elevation-1 hover-scale transition-micro">
          <div className="flex items-center justify-between mb-4">
            <div className={`w-12 h-12 rounded-lg ${metric.bgColor} flex items-center justify-center`}>
              <Icon name={metric.icon} size={24} className={metric.color} />
            </div>
            <div className={`flex items-center space-x-1 text-sm ${
              metric.changeType === 'increase' ? 'text-success' : 'text-error'
            }`}>
              <Icon 
                name={metric.changeType === 'increase' ? 'TrendingUp' : 'TrendingDown'} 
                size={16} 
              />
              <span>{metric.change}</span>
            </div>
          </div>
          
          <div>
            <h3 className="text-2xl font-bold text-foreground mb-1">
              {metric.value}
            </h3>
            <p className="text-sm text-muted-foreground">{metric.title}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PlatformMetrics;