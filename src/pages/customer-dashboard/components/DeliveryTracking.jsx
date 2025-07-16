import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const DeliveryTracking = ({ activeDeliveries, onViewFullTracking }) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case 'picked_up':
        return { icon: 'Package', color: 'text-primary' };
      case 'in_transit':
        return { icon: 'Truck', color: 'text-secondary' };
      case 'out_for_delivery':
        return { icon: 'MapPin', color: 'text-warning' };
      case 'delivered':
        return { icon: 'CheckCircle', color: 'text-success' };
      default:
        return { icon: 'Clock', color: 'text-muted-foreground' };
    }
  };

  const formatEstimatedTime = (estimatedDelivery) => {
    const deliveryTime = new Date(estimatedDelivery);
    const timeDiff = deliveryTime - currentTime;
    const hoursLeft = Math.ceil(timeDiff / (1000 * 60 * 60));
    
    if (hoursLeft <= 0) return 'Arriving soon';
    if (hoursLeft < 24) return `${hoursLeft}h remaining`;
    
    const daysLeft = Math.ceil(hoursLeft / 24);
    return `${daysLeft} day${daysLeft > 1 ? 's' : ''} remaining`;
  };

  const getProgressPercentage = (status) => {
    switch (status.toLowerCase()) {
      case 'picked_up':
        return 25;
      case 'in_transit':
        return 50;
      case 'out_for_delivery':
        return 75;
      case 'delivered':
        return 100;
      default:
        return 0;
    }
  };

  return (
    <div className="bg-surface rounded-lg border border-border p-6 elevation-1">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-foreground">Active Deliveries</h2>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
          <span className="text-xs text-muted-foreground">Live tracking</span>
        </div>
      </div>

      <div className="space-y-4">
        {activeDeliveries.map((delivery) => {
          const statusInfo = getStatusIcon(delivery.status);
          const progress = getProgressPercentage(delivery.status);
          
          return (
            <div
              key={delivery.id}
              className="p-4 border border-border rounded-lg hover:border-primary/20 transition-micro"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Icon name={statusInfo.icon} size={20} className={statusInfo.color} />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground">#{delivery.orderNumber}</h3>
                    <p className="text-sm text-muted-foreground">{delivery.items} items</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  iconName="ExternalLink"
                  onClick={() => onViewFullTracking(delivery.id)}
                >
                  Track
                </Button>
              </div>

              {/* Progress Bar */}
              <div className="mb-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-foreground capitalize">
                    {delivery.status.replace('_', ' ')}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatEstimatedTime(delivery.estimatedDelivery)}
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-smooth"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>

              {/* Location Info */}
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Icon name="MapPin" size={14} />
                <span>{delivery.currentLocation}</span>
              </div>

              {/* Delivery Agent */}
              {delivery.agent && (
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-accent/10 rounded-full flex items-center justify-center">
                      <Icon name="User" size={12} className="text-accent" />
                    </div>
                    <span className="text-sm text-foreground">{delivery.agent.name}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    iconName="Phone"
                    onClick={() => console.log(`Call ${delivery.agent.phone}`)}
                  >
                    Call
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {activeDeliveries.length === 0 && (
        <div className="text-center py-8">
          <Icon name="Truck" size={48} className="text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">No active deliveries</h3>
          <p className="text-muted-foreground">Your recent orders will appear here for tracking</p>
        </div>
      )}
    </div>
  );
};

export default DeliveryTracking;