import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const RecentOrdersTable = () => {
  const recentOrders = [
    {
      id: "ORD-2025-001",
      customer: "Marie Dubois",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b9c5e8b3?w=150",
      items: 3,
      total: "45,500 XAF",
      status: "pending",
      date: "2025-01-16",
      time: "14:30"
    },
    {
      id: "ORD-2025-002", 
      customer: "Jean Baptiste",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
      items: 1,
      total: "12,000 XAF",
      status: "processing",
      date: "2025-01-16",
      time: "13:45"
    },
    {
      id: "ORD-2025-003",
      customer: "Fatima Hassan",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150",
      items: 2,
      total: "28,750 XAF",
      status: "shipped",
      date: "2025-01-16",
      time: "12:15"
    },
    {
      id: "ORD-2025-004",
      customer: "Paul Mbarga",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150",
      items: 5,
      total: "67,200 XAF",
      status: "delivered",
      date: "2025-01-15",
      time: "16:20"
    }
  ];

  const getStatusConfig = (status) => {
    switch (status) {
      case 'pending':
        return { color: 'text-warning', bg: 'bg-warning/10', label: 'Pending', icon: 'Clock' };
      case 'processing':
        return { color: 'text-primary', bg: 'bg-primary/10', label: 'Processing', icon: 'Package' };
      case 'shipped':
        return { color: 'text-secondary', bg: 'bg-secondary/10', label: 'Shipped', icon: 'Truck' };
      case 'delivered':
        return { color: 'text-success', bg: 'bg-success/10', label: 'Delivered', icon: 'CheckCircle' };
      default:
        return { color: 'text-muted-foreground', bg: 'bg-muted', label: 'Unknown', icon: 'AlertCircle' };
    }
  };

  const handleOrderAction = (orderId, action) => {
    console.log(`${action} order ${orderId}`);
  };

  return (
    <div className="bg-surface rounded-lg border border-border elevation-1">
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">Recent Orders</h3>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => window.location.href = '/order-management'}
            iconName="ExternalLink"
            iconPosition="right"
            iconSize={16}
          >
            View All
          </Button>
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground">Order</th>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground">Customer</th>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground">Items</th>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground">Total</th>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {recentOrders.map((order) => {
              const statusConfig = getStatusConfig(order.status);
              return (
                <tr key={order.id} className="border-b border-border hover:bg-muted/30 transition-micro">
                  <td className="p-4">
                    <div>
                      <p className="font-medium text-foreground">{order.id}</p>
                      <p className="text-sm text-muted-foreground">{order.date} at {order.time}</p>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center space-x-3">
                      <img 
                        src={order.avatar} 
                        alt={order.customer}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <span className="font-medium text-foreground">{order.customer}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="text-foreground">{order.items} items</span>
                  </td>
                  <td className="p-4">
                    <span className="font-semibold text-foreground">{order.total}</span>
                  </td>
                  <td className="p-4">
                    <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full ${statusConfig.bg}`}>
                      <Icon name={statusConfig.icon} size={14} className={statusConfig.color} />
                      <span className={`text-xs font-medium ${statusConfig.color}`}>
                        {statusConfig.label}
                      </span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOrderAction(order.id, 'view')}
                        iconName="Eye"
                        iconSize={16}
                      />
                      {order.status === 'pending' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOrderAction(order.id, 'process')}
                          iconName="Play"
                          iconSize={16}
                        />
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden p-4 space-y-4">
        {recentOrders.map((order) => {
          const statusConfig = getStatusConfig(order.status);
          return (
            <div key={order.id} className="border border-border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="font-medium text-foreground">{order.id}</p>
                  <p className="text-sm text-muted-foreground">{order.date} at {order.time}</p>
                </div>
                <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full ${statusConfig.bg}`}>
                  <Icon name={statusConfig.icon} size={14} className={statusConfig.color} />
                  <span className={`text-xs font-medium ${statusConfig.color}`}>
                    {statusConfig.label}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 mb-3">
                <img 
                  src={order.avatar} 
                  alt={order.customer}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div className="flex-1">
                  <p className="font-medium text-foreground">{order.customer}</p>
                  <p className="text-sm text-muted-foreground">{order.items} items • {order.total}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  fullWidth
                  onClick={() => handleOrderAction(order.id, 'view')}
                  iconName="Eye"
                  iconPosition="left"
                  iconSize={16}
                >
                  View Details
                </Button>
                {order.status === 'pending' && (
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => handleOrderAction(order.id, 'process')}
                    iconName="Play"
                    iconSize={16}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RecentOrdersTable;