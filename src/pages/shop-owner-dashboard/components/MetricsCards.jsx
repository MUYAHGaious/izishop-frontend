import React, { useEffect, useState } from 'react';
import Icon from '../../../components/AppIcon';

const MetricsCards = ({ metrics }) => {
  const [animatedValues, setAnimatedValues] = useState({
    totalSales: 0,
    pendingOrders: 0,
    inventoryValue: 0,
    monthlyRevenue: 0
  });

  useEffect(() => {
    const animateCounters = () => {
      const duration = 2000;
      const steps = 60;
      const stepDuration = duration / steps;

      let currentStep = 0;
      const interval = setInterval(() => {
        currentStep++;
        const progress = currentStep / steps;
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);

        setAnimatedValues({
          totalSales: Math.floor(metrics.totalSales * easeOutQuart),
          pendingOrders: Math.floor(metrics.pendingOrders * easeOutQuart),
          inventoryValue: Math.floor(metrics.inventoryValue * easeOutQuart),
          monthlyRevenue: Math.floor(metrics.monthlyRevenue * easeOutQuart)
        });

        if (currentStep >= steps) {
          clearInterval(interval);
          setAnimatedValues(metrics);
        }
      }, stepDuration);
    };

    animateCounters();
  }, [metrics]);

  const cards = [
    {
      title: 'Total Sales',
      value: animatedValues.totalSales,
      change: '+12.5%',
      changeType: 'positive',
      icon: 'TrendingUp',
      color: 'text-success',
      bgColor: 'bg-success/10'
    },
    {
      title: 'Pending Orders',
      value: animatedValues.pendingOrders,
      change: '+3',
      changeType: 'neutral',
      icon: 'Clock',
      color: 'text-warning',
      bgColor: 'bg-warning/10'
    },
    {
      title: 'Inventory Value',
      value: `${animatedValues.inventoryValue.toLocaleString()} XAF`,
      change: '+8.2%',
      changeType: 'positive',
      icon: 'Package',
      color: 'text-primary',
      bgColor: 'bg-primary/10'
    },
    {
      title: 'Monthly Revenue',
      value: `${animatedValues.monthlyRevenue.toLocaleString()} XAF`,
      change: '+15.3%',
      changeType: 'positive',
      icon: 'DollarSign',
      color: 'text-success',
      bgColor: 'bg-success/10'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
      {cards.map((card, index) => (
        <div key={index} className="bg-surface border border-border rounded-xl p-6 hover:shadow-moderate transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className={`w-12 h-12 ${card.bgColor} rounded-lg flex items-center justify-center`}>
              <Icon name={card.icon} size={24} className={card.color} />
            </div>
            <div className={`flex items-center space-x-1 text-sm ${
              card.changeType === 'positive' ? 'text-success' : 
              card.changeType === 'negative' ? 'text-destructive' : 'text-text-secondary'
            }`}>
              <Icon 
                name={card.changeType === 'positive' ? 'ArrowUp' : card.changeType === 'negative' ? 'ArrowDown' : 'Minus'} 
                size={16} 
              />
              <span>{card.change}</span>
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-text-primary mb-1">
              {typeof card.value === 'string' ? card.value : card.value.toLocaleString()}
            </h3>
            <p className="text-text-secondary text-sm">{card.title}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MetricsCards;