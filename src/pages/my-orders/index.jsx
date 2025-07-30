import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import { useAuth } from '../../contexts/AuthContext';

const MyOrders = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/authentication-login-register');
      return;
    }
    
    // Simulate loading orders
    setTimeout(() => {
      setOrders(mockOrders);
      setIsLoading(false);
    }, 1000);
  }, [isAuthenticated, navigate]);

  const mockOrders = [
    {
      id: 'ORD-1704123456-ABC12',
      date: '2025-01-20',
      status: 'delivered',
      total: 850000,
      items: [
        {
          id: 1,
          name: 'iPhone 14 Pro Max 256GB',
          image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400',
          price: 850000,
          quantity: 1,
          seller: 'TechStore Cameroun'
        }
      ],
      deliveryDate: '2025-01-18',
      trackingNumber: 'TRK123456789'
    },
    {
      id: 'ORD-1703123456-DEF34',
      date: '2025-01-15',
      status: 'shipped',
      total: 275000,
      items: [
        {
          id: 2,
          name: 'Samsung Galaxy Buds Pro',
          image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400',
          price: 125000,
          quantity: 2,
          seller: 'AudioWorld CM'
        }
      ],
      estimatedDelivery: '2025-01-22',
      trackingNumber: 'TRK987654321'
    },
    {
      id: 'ORD-1702123456-GHI56',
      date: '2025-01-10',
      status: 'processing',
      total: 450000,
      items: [
        {
          id: 3,
          name: 'MacBook Air M2',
          image: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=400',
          price: 450000,
          quantity: 1,
          seller: 'SecondHand Tech'
        }
      ]
    }
  ];

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-CM', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered': return 'text-success bg-success/10 border-success/20';
      case 'shipped': return 'text-primary bg-primary/10 border-primary/20';
      case 'processing': return 'text-warning bg-warning/10 border-warning/20';
      case 'cancelled': return 'text-error bg-error/10 border-error/20';
      default: return 'text-muted-foreground bg-muted/10 border-border';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'delivered': return 'Delivered';
      case 'shipped': return 'Shipped';
      case 'processing': return 'Processing';
      case 'cancelled': return 'Cancelled';
      default: return 'Unknown';
    }
  };

  const filteredOrders = orders.filter(order => {
    if (activeTab === 'all') return true;
    return order.status === activeTab;
  });

  const tabs = [
    { id: 'all', label: 'All Orders', count: orders.length },
    { id: 'processing', label: 'Processing', count: orders.filter(o => o.status === 'processing').length },
    { id: 'shipped', label: 'Shipped', count: orders.filter(o => o.status === 'shipped').length },
    { id: 'delivered', label: 'Delivered', count: orders.filter(o => o.status === 'delivered').length }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="pt-16">
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-2 border-primary border-t-transparent mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading your orders...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>My Orders - IziShop</title>
        <meta name="description" content="Track and manage your orders on IziShop marketplace" />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Header />
        
        <div className="pt-16 pb-4 sm:pb-8">
          <div className="max-w-7xl mx-auto px-4 py-4 sm:py-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8">
              <div className="mb-4 sm:mb-0">
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                  My Orders
                </h1>
                <p className="text-muted-foreground mt-1">
                  Track and manage your orders
                </p>
              </div>
              
              <Button
                variant="outline"
                onClick={() => navigate('/product-catalog')}
                iconName="ShoppingBag"
                iconPosition="left"
                className="w-full sm:w-auto"
              >
                Continue Shopping
              </Button>
            </div>

            {/* Tabs */}
            <div className="mb-6 sm:mb-8">
              <div className="flex overflow-x-auto pb-2 sm:pb-0">
                <div className="flex space-x-1 min-w-full sm:min-w-0">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-micro whitespace-nowrap ${
                        activeTab === tab.id
                          ? 'bg-primary text-white'
                          : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                      }`}
                    >
                      {tab.label} ({tab.count})
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Orders List */}
            {filteredOrders.length > 0 ? (
              <div className="space-y-4 sm:space-y-6">
                {filteredOrders.map((order) => (
                  <div key={order.id} className="bg-surface rounded-lg border border-border p-4 sm:p-6 elevation-1">
                    {/* Order Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 pb-4 border-b border-border">
                      <div className="mb-3 sm:mb-0">
                        <h3 className="font-semibold text-foreground mb-1">
                          Order #{order.id}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Placed on {new Date(order.date).toLocaleDateString('en-GB')}
                        </p>
                      </div>
                      
                      <div className="flex flex-col sm:items-end">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border mb-2 ${getStatusColor(order.status)}`}>
                          {getStatusText(order.status)}
                        </span>
                        <p className="text-lg font-semibold text-foreground">
                          {formatCurrency(order.total)}
                        </p>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="space-y-3 mb-4">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex items-start space-x-3 p-3 bg-muted/30 rounded-lg">
                          <div className="w-12 h-12 sm:w-16 sm:h-16 flex-shrink-0 overflow-hidden rounded-lg">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-foreground text-sm sm:text-base mb-1">
                              {item.name}
                            </h4>
                            <div className="flex flex-col sm:flex-row sm:items-center text-xs sm:text-sm text-muted-foreground space-y-1 sm:space-y-0 sm:space-x-4">
                              <span className="flex items-center space-x-1">
                                <Icon name="Store" size={12} />
                                <span>{item.seller}</span>
                              </span>
                              <span>Qty: {item.quantity}</span>
                              <span className="font-medium text-foreground">
                                {formatCurrency(item.price)}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Order Actions */}
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                      {order.status === 'shipped' && (
                        <Button
                          variant="outline"
                          size="sm"
                          iconName="Truck"
                          iconPosition="left"
                          className="w-full sm:w-auto"
                        >
                          Track Package
                        </Button>
                      )}
                      
                      {order.status === 'delivered' && (
                        <Button
                          variant="outline"
                          size="sm"
                          iconName="Star"
                          iconPosition="left"
                          className="w-full sm:w-auto"
                        >
                          Leave Review
                        </Button>
                      )}
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        iconName="Eye"
                        iconPosition="left"
                        className="w-full sm:w-auto"
                      >
                        View Details
                      </Button>
                      
                      {order.status === 'processing' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          iconName="X"
                          iconPosition="left"
                          className="w-full sm:w-auto text-error hover:text-error"
                        >
                          Cancel Order
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Icon name="Package" size={40} className="text-muted-foreground" />
                </div>
                
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  No orders found
                </h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  {activeTab === 'all' 
                    ? "You haven't placed any orders yet. Start shopping to see your orders here."
                    : `No ${activeTab} orders found.`
                  }
                </p>
                
                <Button
                  variant="default"
                  onClick={() => navigate('/product-catalog')}
                  iconName="ShoppingBag"
                  iconPosition="left"
                >
                  Start Shopping
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default MyOrders;