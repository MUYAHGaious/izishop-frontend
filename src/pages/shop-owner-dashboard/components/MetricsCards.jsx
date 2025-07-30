import React, { useEffect, useState } from 'react';
import Icon from '../../../components/AppIcon';
import api from '../../../services/api';

const MetricsCards = ({ metrics }) => {
  const [animatedValues, setAnimatedValues] = useState({
    totalSales: 0,
    pendingOrders: 0,
    inventoryValue: 0,
    monthlyRevenue: 0
  });
  const [realTimeStats, setRealTimeStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);

  // Fetch real-time stats with percentage calculations
  useEffect(() => {
    const fetchRealTimeStats = async () => {
      try {
        setLoadingStats(true);
        const response = await api.getShopOwnerTodayStats();
        setRealTimeStats(response);
      } catch (error) {
        console.error('Failed to fetch real-time stats:', error);
        setRealTimeStats(null);
      } finally {
        setLoadingStats(false);
      }
    };

    fetchRealTimeStats();
    // Refresh every 5 minutes
    const interval = setInterval(fetchRealTimeStats, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

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

  // Generate cards with real-time data or fallback to static data
  const cards = [
    {
      title: 'Total Sales',
      value: realTimeStats ? `${realTimeStats.sales.toLocaleString()} XAF` : animatedValues.totalSales,
      change: realTimeStats 
        ? `${realTimeStats.sales_change >= 0 ? '+' : ''}${realTimeStats.sales_change}%`
        : '+12.5%',
      changeType: realTimeStats 
        ? (realTimeStats.sales_change > 0 ? 'positive' : realTimeStats.sales_change < 0 ? 'negative' : 'neutral')
        : 'positive',
      icon: 'TrendingUp',
      color: 'text-success',
      bgColor: 'bg-success/10'
    },
    {
      title: 'Today\'s Orders',
      value: realTimeStats ? realTimeStats.orders : animatedValues.pendingOrders,
      change: realTimeStats 
        ? `${realTimeStats.orders_change >= 0 ? '+' : ''}${realTimeStats.orders_change}%`
        : '+3',
      changeType: realTimeStats 
        ? (realTimeStats.orders_change > 0 ? 'positive' : realTimeStats.orders_change < 0 ? 'negative' : 'neutral')
        : 'neutral',
      icon: 'Clock',
      color: 'text-warning',
      bgColor: 'bg-warning/10'
    },
    {
      title: 'Monthly Revenue',
      value: realTimeStats 
        ? `${realTimeStats.monthly_sales.toLocaleString()} XAF`
        : `${animatedValues.inventoryValue.toLocaleString()} XAF`,
      change: realTimeStats 
        ? `${realTimeStats.monthly_sales_change >= 0 ? '+' : ''}${realTimeStats.monthly_sales_change}%`
        : '+8.2%',
      changeType: realTimeStats 
        ? (realTimeStats.monthly_sales_change > 0 ? 'positive' : realTimeStats.monthly_sales_change < 0 ? 'negative' : 'neutral')
        : 'positive',
      icon: 'Package',
      color: 'text-primary',
      bgColor: 'bg-primary/10'
    },
    {
      title: 'Trend Analysis',
      value: realTimeStats 
        ? `${realTimeStats.trend_direction.charAt(0).toUpperCase() + realTimeStats.trend_direction.slice(1)}`
        : `${animatedValues.monthlyRevenue.toLocaleString()} XAF`,
      change: realTimeStats 
        ? `${realTimeStats.monthly_orders_change >= 0 ? '+' : ''}${realTimeStats.monthly_orders_change}% orders`
        : '+15.3%',
      changeType: realTimeStats 
        ? (realTimeStats.trend_direction === 'up' ? 'positive' : realTimeStats.trend_direction === 'down' ? 'negative' : 'neutral')
        : 'positive',
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
            {loadingStats ? (
              <div className="w-16 h-5 bg-gray-200 rounded animate-pulse"></div>
            ) : (
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
            )}
          </div>
          <div>
            {loadingStats ? (
              <>
                <div className="w-24 h-8 bg-gray-200 rounded animate-pulse mb-1"></div>
                <div className="w-20 h-4 bg-gray-200 rounded animate-pulse"></div>
              </>
            ) : (
              <>
                <h3 className="text-2xl font-bold text-text-primary mb-1">
                  {typeof card.value === 'string' ? card.value : card.value.toLocaleString()}
                </h3>
                <p className="text-text-secondary text-sm">{card.title}</p>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default MetricsCards;