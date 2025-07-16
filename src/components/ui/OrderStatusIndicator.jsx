import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Icon from '../AppIcon';

const OrderStatusIndicator = () => {
  const [orderStats, setOrderStats] = useState({
    pending: 0,
    processing: 0,
    shipped: 0,
    delivered: 0
  });
  const location = useLocation();

  // Simulate real-time order status updates
  useEffect(() => {
    const updateOrderStats = () => {
      const currentPath = location.pathname;
      
      // Role-based order statistics
      if (currentPath.includes('admin')) {
        setOrderStats({
          pending: 12,
          processing: 8,
          shipped: 15,
          delivered: 45
        });
      } else if (currentPath.includes('shop-owner')) {
        setOrderStats({
          pending: 3,
          processing: 2,
          shipped: 5,
          delivered: 18
        });
      } else {
        setOrderStats({
          pending: 1,
          processing: 0,
          shipped: 2,
          delivered: 8
        });
      }
    };

    updateOrderStats();
    
    // Simulate real-time updates
    const interval = setInterval(updateOrderStats, 30000);
    return () => clearInterval(interval);
  }, [location.pathname]);

  const statusConfig = [
    {
      key: 'pending',
      label: 'Pending',
      icon: 'Clock',
      color: 'text-warning',
      bgColor: 'bg-warning/10',
      borderColor: 'border-warning/20'
    },
    {
      key: 'processing',
      label: 'Processing',
      icon: 'Package',
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      borderColor: 'border-primary/20'
    },
    {
      key: 'shipped',
      label: 'Shipped',
      icon: 'Truck',
      color: 'text-secondary',
      bgColor: 'bg-secondary/10',
      borderColor: 'border-secondary/20'
    },
    {
      key: 'delivered',
      label: 'Delivered',
      icon: 'CheckCircle',
      color: 'text-success',
      bgColor: 'bg-success/10',
      borderColor: 'border-success/20'
    }
  ];

  const getTotalOrders = () => {
    return Object.values(orderStats).reduce((sum, count) => sum + count, 0);
  };

  const handleStatusClick = (status) => {
    console.log(`Navigate to ${status} orders`);
    // In a real app, this would filter orders by status
  };

  return (
    <div className="bg-surface rounded-lg border border-border p-4 elevation-1">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-foreground">Order Status</h3>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
          <span className="text-xs text-muted-foreground">Live</span>
        </div>
      </div>

      {/* Status Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {statusConfig.map((status) => {
          const count = orderStats[status.key];
          const isActive = count > 0;
          
          return (
            <div
              key={status.key}
              className={`p-3 rounded-lg border transition-micro cursor-pointer hover-scale ${
                isActive 
                  ? `${status.bgColor} ${status.borderColor}` 
                  : 'bg-muted/50 border-border'
              }`}
              onClick={() => handleStatusClick(status.key)}
            >
              <div className="flex items-center space-x-2 mb-2">
                <Icon 
                  name={status.icon} 
                  size={16} 
                  className={isActive ? status.color : 'text-muted-foreground'} 
                />
                <span className={`text-xs font-medium ${
                  isActive ? 'text-foreground' : 'text-muted-foreground'
                }`}>
                  {status.label}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className={`text-lg font-semibold ${
                  isActive ? 'text-foreground' : 'text-muted-foreground'
                }`}>
                  {count}
                </span>
                {count > 0 && (
                  <div className={`w-2 h-2 rounded-full ${
                    status.key === 'pending' ? 'bg-warning' :
                    status.key === 'processing' ? 'bg-primary' :
                    status.key === 'shipped' ? 'bg-secondary' : 'bg-success'
                  }`}></div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="mt-4 pt-4 border-t border-border">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Total Orders</span>
          <span className="text-sm font-medium text-foreground">{getTotalOrders()}</span>
        </div>
      </div>

      {/* Mobile Notification Badge */}
      <div className="md:hidden fixed top-20 right-4 z-1100">
        {orderStats.pending > 0 && (
          <div className="bg-warning text-warning-foreground text-xs px-2 py-1 rounded-full elevation-2">
            {orderStats.pending} pending
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderStatusIndicator;