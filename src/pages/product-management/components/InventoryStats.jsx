import React from 'react';
import Icon from '../../../components/AppIcon';

const InventoryStats = ({ stats }) => {
  const statCards = [
    {
      title: 'Total Products',
      value: stats.totalProducts,
      icon: 'Package',
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      change: '+12%',
      changeType: 'positive'
    },
    {
      title: 'Active Products',
      value: stats.activeProducts,
      icon: 'Eye',
      color: 'text-success',
      bgColor: 'bg-success/10',
      change: '+8%',
      changeType: 'positive'
    },
    {
      title: 'Low Stock Items',
      value: stats.lowStockItems,
      icon: 'AlertTriangle',
      color: 'text-warning',
      bgColor: 'bg-warning/10',
      change: '-3%',
      changeType: 'negative'
    },
    {
      title: 'Out of Stock',
      value: stats.outOfStockItems,
      icon: 'XCircle',
      color: 'text-error',
      bgColor: 'bg-error/10',
      change: '+2%',
      changeType: 'negative'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      {statCards.map((stat, index) => (
        <div key={index} className="bg-surface rounded-lg border border-border p-6 hover-scale transition-micro">
          <div className="flex items-center justify-between mb-4">
            <div className={`w-12 h-12 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
              <Icon name={stat.icon} size={24} className={stat.color} />
            </div>
            <div className={`text-xs font-medium px-2 py-1 rounded-full ${
              stat.changeType === 'positive' ?'bg-success/10 text-success' :'bg-error/10 text-error'
            }`}>
              {stat.change}
            </div>
          </div>
          
          <div>
            <h3 className="text-2xl font-bold text-foreground mb-1">{stat.value}</h3>
            <p className="text-sm text-muted-foreground">{stat.title}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default InventoryStats;