import React from 'react';
import Icon from '../../../components/AppIcon';

const OrderMetrics = ({ metrics }) => {
  const metricCards = [
    {
      title: 'Total Orders',
      value: metrics.totalOrders,
      change: metrics.ordersChange,
      icon: 'ShoppingCart',
      color: 'text-primary',
      bgColor: 'bg-primary/10'
    },
    {
      title: 'Pending Orders',
      value: metrics.pendingOrders,
      change: metrics.pendingChange,
      icon: 'Clock',
      color: 'text-warning',
      bgColor: 'bg-warning/10'
    },
    {
      title: 'Completed Orders',
      value: metrics.completedOrders,
      change: metrics.completedChange,
      icon: 'CheckCircle',
      color: 'text-success',
      bgColor: 'bg-success/10'
    },
    {
      title: 'Revenue',
      value: new Intl.NumberFormat('fr-CM', {
        style: 'currency',
        currency: 'XAF',
        minimumFractionDigits: 0
      }).format(metrics.revenue),
      change: metrics.revenueChange,
      icon: 'DollarSign',
      color: 'text-accent',
      bgColor: 'bg-accent/10'
    }
  ];

  const getChangeIcon = (change) => {
    if (change > 0) return 'TrendingUp';
    if (change < 0) return 'TrendingDown';
    return 'Minus';
  };

  const getChangeColor = (change) => {
    if (change > 0) return 'text-success';
    if (change < 0) return 'text-error';
    return 'text-muted-foreground';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {metricCards.map((metric, index) => (
        <div key={index} className="bg-surface rounded-lg border border-border p-6 hover-scale transition-micro">
          <div className="flex items-center justify-between mb-4">
            <div className={`w-12 h-12 rounded-lg ${metric.bgColor} flex items-center justify-center`}>
              <Icon name={metric.icon} size={24} className={metric.color} />
            </div>
            <div className={`flex items-center space-x-1 ${getChangeColor(metric.change)}`}>
              <Icon name={getChangeIcon(metric.change)} size={16} />
              <span className="text-sm font-medium">
                {Math.abs(metric.change)}%
              </span>
            </div>
          </div>
          
          <div>
            <h3 className="text-2xl font-bold text-foreground mb-1">{metric.value}</h3>
            <p className="text-sm text-muted-foreground">{metric.title}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default OrderMetrics;