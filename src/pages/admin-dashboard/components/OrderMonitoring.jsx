import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const OrderMonitoring = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('today');

  const orderStats = {
    totalOrders: 1247,
    pendingOrders: 89,
    processingOrders: 156,
    shippedOrders: 234,
    deliveredOrders: 768,
    cancelledOrders: 23
  };

  const paymentStats = {
    totalProcessed: "45,892,000",
    mtnMomo: "28,450,000",
    orangeMoney: "12,340,000",
    visa: "5,102,000",
    pendingPayments: 45,
    failedPayments: 12
  };

  const recentOrders = [
    {
      id: "ORD-2025-001234",
      customer: "Marie Dubois",
      shop: "TechStore Yaoundé",
      amount: "125,000",
      status: "Processing",
      paymentMethod: "MTN MoMo",
      date: "2025-01-16 14:30"
    },
    {
      id: "ORD-2025-001235",
      customer: "Jean Kamga",
      shop: "Fashion Hub",
      amount: "89,500",
      status: "Shipped",
      paymentMethod: "Orange Money",
      date: "2025-01-16 13:45"
    },
    {
      id: "ORD-2025-001236",
      customer: "Fatima Nkomo",
      shop: "Electronics Plus",
      amount: "234,000",
      status: "Delivered",
      paymentMethod: "Visa",
      date: "2025-01-16 12:15"
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'text-warning bg-warning/10';
      case 'Processing': return 'text-primary bg-primary/10';
      case 'Shipped': return 'text-secondary bg-secondary/10';
      case 'Delivered': return 'text-success bg-success/10';
      case 'Cancelled': return 'text-error bg-error/10';
      default: return 'text-muted-foreground bg-muted/10';
    }
  };

  const getPaymentMethodIcon = (method) => {
    switch (method) {
      case 'MTN MoMo': return 'Smartphone';
      case 'Orange Money': return 'Phone';
      case 'Visa': return 'CreditCard';
      default: return 'DollarSign';
    }
  };

  return (
    <div className="bg-surface rounded-lg border border-border p-6 elevation-1">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-foreground">Order Monitoring</h2>
        <div className="flex items-center space-x-2">
          <Button 
            variant={selectedPeriod === 'today' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setSelectedPeriod('today')}
          >
            Today
          </Button>
          <Button 
            variant={selectedPeriod === 'week' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setSelectedPeriod('week')}
          >
            Week
          </Button>
          <Button 
            variant={selectedPeriod === 'month' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setSelectedPeriod('month')}
          >
            Month
          </Button>
        </div>
      </div>

      {/* Order Status Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
        <div className="text-center p-4 bg-muted/50 rounded-lg">
          <div className="text-xl font-bold text-foreground">{orderStats.totalOrders}</div>
          <div className="text-xs text-muted-foreground">Total Orders</div>
        </div>
        <div className="text-center p-4 bg-warning/10 rounded-lg">
          <div className="text-xl font-bold text-warning">{orderStats.pendingOrders}</div>
          <div className="text-xs text-muted-foreground">Pending</div>
        </div>
        <div className="text-center p-4 bg-primary/10 rounded-lg">
          <div className="text-xl font-bold text-primary">{orderStats.processingOrders}</div>
          <div className="text-xs text-muted-foreground">Processing</div>
        </div>
        <div className="text-center p-4 bg-secondary/10 rounded-lg">
          <div className="text-xl font-bold text-secondary">{orderStats.shippedOrders}</div>
          <div className="text-xs text-muted-foreground">Shipped</div>
        </div>
        <div className="text-center p-4 bg-success/10 rounded-lg">
          <div className="text-xl font-bold text-success">{orderStats.deliveredOrders}</div>
          <div className="text-xs text-muted-foreground">Delivered</div>
        </div>
        <div className="text-center p-4 bg-error/10 rounded-lg">
          <div className="text-xl font-bold text-error">{orderStats.cancelledOrders}</div>
          <div className="text-xs text-muted-foreground">Cancelled</div>
        </div>
      </div>

      {/* Payment Processing Stats */}
      <div className="mb-6">
        <h3 className="text-lg font-medium text-foreground mb-4">Payment Processing</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-4 bg-success/10 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <Icon name="DollarSign" size={20} className="text-success" />
              <span className="text-xs text-success">+15.2%</span>
            </div>
            <div className="text-lg font-bold text-foreground">{paymentStats.totalProcessed} XAF</div>
            <div className="text-sm text-muted-foreground">Total Processed</div>
          </div>
          
          <div className="p-4 bg-primary/10 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <Icon name="Smartphone" size={20} className="text-primary" />
              <span className="text-xs text-primary">62%</span>
            </div>
            <div className="text-lg font-bold text-foreground">{paymentStats.mtnMomo} XAF</div>
            <div className="text-sm text-muted-foreground">MTN MoMo</div>
          </div>
          
          <div className="p-4 bg-warning/10 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <Icon name="Phone" size={20} className="text-warning" />
              <span className="text-xs text-warning">27%</span>
            </div>
            <div className="text-lg font-bold text-foreground">{paymentStats.orangeMoney} XAF</div>
            <div className="text-sm text-muted-foreground">Orange Money</div>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-foreground">Recent Orders</h3>
          <Button variant="outline" size="sm" iconName="ExternalLink" iconPosition="right">
            View All
          </Button>
        </div>
        
        <div className="space-y-3">
          {recentOrders.map((order) => (
            <div key={order.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
              <div className="flex-1">
                <div className="flex items-center space-x-4 mb-2">
                  <span className="font-medium text-foreground">{order.id}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </div>
                <div className="text-sm text-muted-foreground">
                  {order.customer} • {order.shop}
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <div className="font-medium text-foreground">{order.amount} XAF</div>
                  <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                    <Icon name={getPaymentMethodIcon(order.paymentMethod)} size={12} />
                    <span>{order.paymentMethod}</span>
                  </div>
                </div>
                <Button variant="ghost" size="sm" iconName="MoreHorizontal" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OrderMonitoring;