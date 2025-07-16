import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import Header from '../../components/ui/Header';
import RoleBasedNavigation from '../../components/ui/RoleBasedNavigation';
import BreadcrumbNavigation from '../../components/ui/BreadcrumbNavigation';
import OrdersTable from './components/OrdersTable';
import OrderFilters from './components/OrderFilters';
import OrderDetailsModal from './components/OrderDetailsModal';
import OrderMetrics from './components/OrderMetrics';
import DeliveryTracker from './components/DeliveryTracker';

const OrderManagement = () => {
  const location = useLocation();
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [activeView, setActiveView] = useState('orders');
  const [filters, setFilters] = useState({});
  const [currentLanguage, setCurrentLanguage] = useState('en');

  // Determine user role based on current path
  const getUserRole = () => {
    const currentPath = location.pathname;
    if (currentPath.includes('admin')) return 'admin';
    if (currentPath.includes('shop-owner')) return 'shop-owner';
    return 'customer';
  };

  const userRole = getUserRole();

  // Load language preference
  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') || 'en';
    setCurrentLanguage(savedLanguage);
  }, []);

  // Mock data for orders
  const mockOrders = [
    {
      id: 'ORD001',
      orderNumber: 'IZS-2025-001',
      customer: {
        name: 'Jean Baptiste Mballa',
        email: 'jean.mballa@email.com',
        phone: '+237 677 123 456',
        joinDate: '2024-03-15T10:00:00Z'
      },
      date: '2025-01-16T08:30:00Z',
      status: 'pending',
      total: 45000,
      subtotal: 40000,
      deliveryFee: 5000,
      paymentMethod: 'MTN MoMo',
      paymentStatus: 'paid',
      transactionId: 'TXN-MTN-789456123',
      deliveryAddress: {
        street: '123 Rue de la Paix',
        city: 'Douala',
        region: 'Littoral',
        postalCode: '1234',
        phone: '+237 677 123 456'
      },
      items: [
        {
          name: 'Samsung Galaxy A54',
          description: 'Smartphone Android 128GB',
          quantity: 1,
          price: 35000,
          image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400'
        },
        {
          name: 'Phone Case',
          description: 'Protective silicone case',
          quantity: 1,
          price: 5000,
          image: 'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=400'
        }
      ],
      assignedAgent: null,
      lastUpdated: '2025-01-16T09:15:00Z',
      messages: [
        {
          sender: 'customer',
          content: 'Bonjour, quand est-ce que ma commande sera expédiée?',
          timestamp: '2025-01-16T09:00:00Z'
        }
      ]
    },
    {
      id: 'ORD002',
      orderNumber: 'IZS-2025-002',
      customer: {
        name: 'Marie Claire Fouda',
        email: 'marie.fouda@email.com',
        phone: '+237 655 987 654',
        joinDate: '2024-01-20T14:30:00Z'
      },
      date: '2025-01-15T14:20:00Z',
      status: 'processing',
      total: 28500,
      subtotal: 25000,
      deliveryFee: 3500,
      paymentMethod: 'Orange Money',
      paymentStatus: 'paid',
      transactionId: 'TXN-ORG-456789321',
      deliveryAddress: {
        street: '456 Avenue Kennedy',
        city: 'Yaoundé',
        region: 'Centre',
        postalCode: '5678',
        phone: '+237 655 987 654'
      },
      items: [
        {
          name: 'Nike Air Max',
          description: 'Chaussures de sport taille 42',
          quantity: 1,
          price: 25000,
          image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400'
        }
      ],
      assignedAgent: 'Jean Mballa',
      lastUpdated: '2025-01-15T16:45:00Z',
      messages: []
    },
    {
      id: 'ORD003',
      orderNumber: 'IZS-2025-003',
      customer: {
        name: 'Paul Nkomo',
        email: 'paul.nkomo@email.com',
        phone: '+237 699 555 777',
        joinDate: '2024-06-10T11:15:00Z'
      },
      date: '2025-01-14T16:45:00Z',
      status: 'shipped',
      total: 67500,
      subtotal: 60000,
      deliveryFee: 7500,
      paymentMethod: 'Visa Card',
      paymentStatus: 'paid',
      transactionId: 'TXN-VSA-987654321',
      deliveryAddress: {
        street: '789 Commercial Avenue',
        city: 'Bamenda',
        region: 'Nord-Ouest',
        postalCode: '9012',
        phone: '+237 699 555 777'
      },
      items: [
        {
          name: 'MacBook Air M2',
          description: 'Ordinateur portable 256GB',
          quantity: 1,
          price: 60000,
          image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400'
        }
      ],
      assignedAgent: 'Marie Fouda',
      lastUpdated: '2025-01-14T18:30:00Z',
      messages: [
        {
          sender: 'shop',
          content: 'Votre commande a été expédiée avec le numéro de suivi TRK123456',
          timestamp: '2025-01-14T18:00:00Z'
        }
      ]
    },
    {
      id: 'ORD004',
      orderNumber: 'IZS-2025-004',
      customer: {
        name: 'Grace Tabi',
        email: 'grace.tabi@email.com',
        phone: '+237 677 888 999',
        joinDate: '2024-09-05T09:20:00Z'
      },
      date: '2025-01-13T11:10:00Z',
      status: 'delivered',
      total: 15750,
      subtotal: 12500,
      deliveryFee: 3250,
      paymentMethod: 'MTN MoMo',
      paymentStatus: 'paid',
      transactionId: 'TXN-MTN-147258369',
      deliveryAddress: {
        street: '321 Rue du Commerce',
        city: 'Bafoussam',
        region: 'Ouest',
        postalCode: '3456',
        phone: '+237 677 888 999'
      },
      items: [
        {
          name: 'Robe Africaine',
          description: 'Robe traditionnelle en wax',
          quantity: 1,
          price: 12500,
          image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400'
        }
      ],
      assignedAgent: 'Paul Nkomo',
      lastUpdated: '2025-01-13T15:45:00Z',
      messages: [
        {
          sender: 'customer',
          content: 'Merci beaucoup! La robe est magnifique.',
          timestamp: '2025-01-13T15:30:00Z'
        }
      ]
    }
  ];

  // Mock metrics data
  const mockMetrics = {
    totalOrders: 156,
    ordersChange: 12.5,
    pendingOrders: 23,
    pendingChange: -5.2,
    completedOrders: 133,
    completedChange: 18.7,
    revenue: 2450000,
    revenueChange: 15.3
  };

  // Mock delivery data
  const mockDeliveries = [
    {
      id: 'DEL001',
      orderNumber: 'IZS-2025-002',
      customerName: 'Marie Claire Fouda',
      destination: 'Yaoundé, Centre',
      agentName: 'Jean Mballa',
      status: 'in_transit',
      eta: '2 hours',
      statusHistory: [
        {
          message: 'Package picked up from warehouse',
          timestamp: '2025-01-16T08:00:00Z'
        },
        {
          message: 'Out for delivery',
          timestamp: '2025-01-16T10:30:00Z'
        }
      ]
    },
    {
      id: 'DEL002',
      orderNumber: 'IZS-2025-005',
      customerName: 'Samuel Biya',
      destination: 'Douala, Littoral',
      agentName: null,
      status: 'assigned',
      eta: '4 hours',
      statusHistory: [
        {
          message: 'Order ready for pickup',
          timestamp: '2025-01-16T07:30:00Z'
        }
      ]
    }
  ];

  const handleOrderSelect = (order) => {
    setSelectedOrder(order);
    setIsDetailsModalOpen(true);
  };

  const handleStatusUpdate = (orderId, newStatus) => {
    console.log(`Updating order ${orderId} to status: ${newStatus}`);
    // In a real app, this would make an API call
  };

  const handleBulkAction = (action, orderIds) => {
    console.log(`Performing bulk action ${action} on orders:`, orderIds);
    // In a real app, this would make an API call
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    console.log('Filters updated:', newFilters);
    // In a real app, this would trigger a new API call
  };

  const handleAssignDelivery = (orderId, agentId) => {
    console.log(`Assigning order ${orderId} to agent ${agentId}`);
    // In a real app, this would make an API call
  };

  const handleSendMessage = (orderId, message) => {
    console.log(`Sending message to order ${orderId}:`, message);
    // In a real app, this would make an API call
  };

  const handleUpdateDelivery = (deliveryId, status, data) => {
    console.log(`Updating delivery ${deliveryId} to status ${status}:`, data);
    // In a real app, this would make an API call
  };

  const handleAssignAgent = (deliveryId, agentId) => {
    console.log(`Assigning delivery ${deliveryId} to agent ${agentId}`);
    // In a real app, this would make an API call
  };

  const viewTabs = [
    { id: 'orders', label: 'Orders', icon: 'ShoppingCart' },
    { id: 'delivery', label: 'Delivery', icon: 'Truck' },
    { id: 'analytics', label: 'Analytics', icon: 'BarChart3' }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="flex">
        <RoleBasedNavigation />
        
        <main className="flex-1 lg:ml-64 pt-16">
          <div className="p-4 lg:p-6">
            <BreadcrumbNavigation />
            
            {/* Page Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">
                  Order Management
                </h1>
                <p className="text-muted-foreground">
                  {userRole === 'admin' ?'Manage all platform orders and deliveries'
                    : userRole === 'shop-owner' ?'Process your shop orders and track deliveries' :'View and track your orders'
                  }
                </p>
              </div>
              
              <div className="flex items-center space-x-2 mt-4 lg:mt-0">
                <Button
                  variant="outline"
                  iconName="Download"
                  iconPosition="left"
                  onClick={() => console.log('Export orders')}
                >
                  Export
                </Button>
                
                {userRole !== 'customer' && (
                  <Button
                    variant="default"
                    iconName="Plus"
                    iconPosition="left"
                    onClick={() => console.log('Create order')}
                  >
                    New Order
                  </Button>
                )}
              </div>
            </div>

            {/* Metrics */}
            <OrderMetrics metrics={mockMetrics} />

            {/* View Tabs */}
            <div className="flex space-x-1 mb-6 border-b border-border">
              {viewTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveView(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium border-b-2 transition-micro ${
                    activeView === tab.id
                      ? 'border-primary text-primary' :'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Icon name={tab.icon} size={16} />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Content based on active view */}
            {activeView === 'orders' && (
              <>
                <OrderFilters 
                  onFilterChange={handleFilterChange}
                  activeFilters={filters}
                />
                
                <OrdersTable
                  orders={mockOrders}
                  onOrderSelect={handleOrderSelect}
                  onStatusUpdate={handleStatusUpdate}
                  onBulkAction={handleBulkAction}
                  selectedOrders={selectedOrders}
                  onOrderSelection={setSelectedOrders}
                />
              </>
            )}

            {activeView === 'delivery' && (
              <DeliveryTracker
                deliveries={mockDeliveries}
                onUpdateDelivery={handleUpdateDelivery}
                onAssignAgent={handleAssignAgent}
              />
            )}

            {activeView === 'analytics' && (
              <div className="bg-surface rounded-lg border border-border p-6">
                <div className="text-center py-12">
                  <Icon name="BarChart3" size={48} className="text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">Analytics Dashboard</h3>
                  <p className="text-muted-foreground">
                    Detailed analytics and reporting features coming soon
                  </p>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Order Details Modal */}
      <OrderDetailsModal
        order={selectedOrder}
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedOrder(null);
        }}
        onStatusUpdate={handleStatusUpdate}
        onAssignDelivery={handleAssignDelivery}
        onSendMessage={handleSendMessage}
      />
    </div>
  );
};

export default OrderManagement;