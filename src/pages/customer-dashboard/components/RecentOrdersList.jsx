import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const RecentOrdersList = ({ orders, onTrackOrder, onContactSupport }) => {
  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'processing':
        return 'bg-primary text-primary-foreground';
      case 'shipped':
        return 'bg-secondary text-secondary-foreground';
      case 'delivered':
        return 'bg-success text-success-foreground';
      case 'cancelled':
        return 'bg-error text-error-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-CM', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="bg-surface rounded-lg border border-border p-6 elevation-1">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-foreground">Recent Orders</h2>
        <Button
          variant="ghost"
          size="sm"
          iconName="ExternalLink"
          iconPosition="right"
          onClick={() => window.location.href = '/order-management'}
        >
          View All
        </Button>
      </div>

      <div className="space-y-4">
        {orders.map((order) => (
          <div
            key={order.id}
            className="flex items-center justify-between p-4 border border-border rounded-lg hover:border-primary/20 transition-micro"
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                <Icon name="Package" size={20} className="text-muted-foreground" />
              </div>
              
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <h3 className="font-medium text-foreground">#{order.orderNumber}</h3>
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {order.items} items • {formatDate(order.date)}
                </p>
                <p className="text-sm font-medium text-foreground">
                  {formatCurrency(order.total)}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                iconName="MapPin"
                onClick={() => onTrackOrder(order.id)}
              >
                Track
              </Button>
              <Button
                variant="ghost"
                size="sm"
                iconName="MessageCircle"
                onClick={() => onContactSupport(order.id)}
              >
                Support
              </Button>
            </div>
          </div>
        ))}
      </div>

      {orders.length === 0 && (
        <div className="text-center py-8">
          <Icon name="ShoppingBag" size={48} className="text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">No orders yet</h3>
          <p className="text-muted-foreground mb-4">Start shopping to see your orders here</p>
          <Button
            variant="default"
            iconName="Search"
            iconPosition="left"
            onClick={() => console.log('Browse products')}
          >
            Browse Products
          </Button>
        </div>
      )}
    </div>
  );
};

export default RecentOrdersList;