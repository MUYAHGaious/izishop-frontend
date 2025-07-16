import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const OrdersTab = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const orders = [
    {
      id: "ORD-2025-001",
      customer: {
        name: "Marie Dubois",
        email: "marie.dubois@email.com",
        avatar: "https://randomuser.me/api/portraits/women/1.jpg"
      },
      items: [
        { name: "Premium Wireless Headphones", quantity: 1, price: 45000 },
        { name: "Phone Case", quantity: 2, price: 5000 }
      ],
      total: 55000,
      status: "pending",
      paymentStatus: "paid",
      orderDate: "2025-01-16T10:30:00",
      deliveryAddress: "123 Rue de la Paix, Douala, Cameroon",
      trackingNumber: "TRK123456789"
    },
    {
      id: "ORD-2025-002",
      customer: {
        name: "Jean Baptiste",
        email: "jean.baptiste@email.com",
        avatar: "https://randomuser.me/api/portraits/men/2.jpg"
      },
      items: [
        { name: "Organic Cotton T-Shirt", quantity: 3, price: 8500 }
      ],
      total: 25500,
      status: "processing",
      paymentStatus: "paid",
      orderDate: "2025-01-16T09:15:00",
      deliveryAddress: "456 Avenue du Cameroun, Yaoundé, Cameroon",
      trackingNumber: "TRK123456790"
    },
    {
      id: "ORD-2025-003",
      customer: {
        name: "Aminata Sow",
        email: "aminata.sow@email.com",
        avatar: "https://randomuser.me/api/portraits/women/3.jpg"
      },
      items: [
        { name: "Artisan Coffee Beans", quantity: 2, price: 12000 },
        { name: "Coffee Mug", quantity: 1, price: 3500 }
      ],
      total: 27500,
      status: "shipped",
      paymentStatus: "paid",
      orderDate: "2025-01-15T14:20:00",
      deliveryAddress: "789 Boulevard de la Liberté, Bafoussam, Cameroon",
      trackingNumber: "TRK123456791"
    },
    {
      id: "ORD-2025-004",
      customer: {
        name: "Paul Mbarga",
        email: "paul.mbarga@email.com",
        avatar: "https://randomuser.me/api/portraits/men/4.jpg"
      },
      items: [
        { name: "Smart Fitness Tracker", quantity: 1, price: 32000 }
      ],
      total: 32000,
      status: "delivered",
      paymentStatus: "paid",
      orderDate: "2025-01-14T16:45:00",
      deliveryAddress: "321 Rue des Palmiers, Garoua, Cameroon",
      trackingNumber: "TRK123456792"
    },
    {
      id: "ORD-2025-005",
      customer: {
        name: "Fatima Hassan",
        email: "fatima.hassan@email.com",
        avatar: "https://randomuser.me/api/portraits/women/5.jpg"
      },
      items: [
        { name: "Handmade Leather Wallet", quantity: 1, price: 18500 }
      ],
      total: 18500,
      status: "cancelled",
      paymentStatus: "refunded",
      orderDate: "2025-01-13T11:30:00",
      deliveryAddress: "654 Avenue de l'Indépendance, Bamenda, Cameroon",
      trackingNumber: null
    }
  ];

  const statusOptions = [
    { value: '', label: 'All Orders' },
    { value: 'pending', label: 'Pending' },
    { value: 'processing', label: 'Processing' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { label: 'Pending', color: 'text-warning bg-warning/10' },
      processing: { label: 'Processing', color: 'text-primary bg-primary/10' },
      shipped: { label: 'Shipped', color: 'text-secondary bg-secondary/10' },
      delivered: { label: 'Delivered', color: 'text-success bg-success/10' },
      cancelled: { label: 'Cancelled', color: 'text-destructive bg-destructive/10' }
    };

    const config = statusConfig[status] || { label: status, color: 'text-text-secondary bg-muted' };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const getPaymentBadge = (status) => {
    const config = {
      paid: { label: 'Paid', color: 'text-success bg-success/10' },
      pending: { label: 'Pending', color: 'text-warning bg-warning/10' },
      refunded: { label: 'Refunded', color: 'text-destructive bg-destructive/10' }
    };

    const paymentConfig = config[status] || { label: status, color: 'text-text-secondary bg-muted' };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${paymentConfig.color}`}>
        {paymentConfig.label}
      </span>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.customer.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = !statusFilter || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6">
      {/* Header Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          <div className="flex-1 max-w-md">
            <Input
              type="search"
              placeholder="Search orders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select
            options={statusOptions}
            value={statusFilter}
            onChange={setStatusFilter}
            placeholder="Filter by status"
            className="w-full sm:w-48"
          />
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" iconName="Download" iconPosition="left">
            Export Orders
          </Button>
          <Button variant="outline" iconName="RefreshCw" iconPosition="left">
            Refresh
          </Button>
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.map((order) => (
          <div key={order.id} className="bg-surface border border-border rounded-xl p-6 hover:shadow-moderate transition-shadow">
            {/* Order Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-muted">
                  <img
                    src={order.customer.avatar}
                    alt={order.customer.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = '/assets/images/no_image.png';
                    }}
                  />
                </div>
                <div>
                  <h3 className="font-semibold text-text-primary">{order.id}</h3>
                  <p className="text-sm text-text-secondary">{order.customer.name}</p>
                  <p className="text-xs text-text-secondary">{formatDate(order.orderDate)}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                {getStatusBadge(order.status)}
                {getPaymentBadge(order.paymentStatus)}
                <span className="font-semibold text-text-primary">
                  {order.total.toLocaleString()} XAF
                </span>
              </div>
            </div>

            {/* Order Items */}
            <div className="bg-muted/50 rounded-lg p-4 mb-4">
              <h4 className="text-sm font-medium text-text-primary mb-2">Order Items:</h4>
              <div className="space-y-2">
                {order.items.map((item, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <span className="text-text-secondary">
                      {item.name} × {item.quantity}
                    </span>
                    <span className="font-medium text-text-primary">
                      {(item.price * item.quantity).toLocaleString()} XAF
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery Info */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
              <div className="flex-1">
                <div className="flex items-start space-x-2">
                  <Icon name="MapPin" size={16} className="text-text-secondary mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-text-primary">Delivery Address:</p>
                    <p className="text-sm text-text-secondary">{order.deliveryAddress}</p>
                  </div>
                </div>
              </div>
              {order.trackingNumber && (
                <div className="flex items-center space-x-2">
                  <Icon name="Truck" size={16} className="text-text-secondary" />
                  <span className="text-sm text-text-secondary">
                    Tracking: {order.trackingNumber}
                  </span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-border">
              {order.status === 'pending' && (
                <>
                  <Button variant="default" size="sm" iconName="Check" iconPosition="left">
                    Accept Order
                  </Button>
                  <Button variant="destructive" size="sm" iconName="X" iconPosition="left">
                    Decline
                  </Button>
                </>
              )}
              {order.status === 'processing' && (
                <Button variant="default" size="sm" iconName="Truck" iconPosition="left">
                  Mark as Shipped
                </Button>
              )}
              {order.status === 'shipped' && (
                <Button variant="default" size="sm" iconName="Package" iconPosition="left">
                  Mark as Delivered
                </Button>
              )}
              <Button variant="outline" size="sm" iconName="MessageCircle" iconPosition="left">
                Contact Customer
              </Button>
              <Button variant="outline" size="sm" iconName="Eye" iconPosition="left">
                View Details
              </Button>
              <Button variant="ghost" size="sm" iconName="MoreHorizontal">
                More
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-6">
        <div className="text-sm text-text-secondary">
          Showing {filteredOrders.length} of {orders.length} orders
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" iconName="ChevronLeft" iconPosition="left">
            Previous
          </Button>
          <Button variant="default" size="sm">1</Button>
          <Button variant="outline" size="sm">2</Button>
          <Button variant="outline" size="sm">3</Button>
          <Button variant="outline" size="sm" iconName="ChevronRight" iconPosition="right">
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OrdersTab;