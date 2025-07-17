import React, { useState, useEffect } from 'react';
import Header from '../../components/ui/Header';
import RoleBasedNavigation from '../../components/ui/RoleBasedNavigation';
import OrderStatusSummary from './components/OrderStatusSummary';
import RecentOrdersList from './components/RecentOrdersList';
import WishlistSection from './components/WishlistSection';
import AccountSummary from './components/AccountSummary';
import DeliveryTracking from './components/DeliveryTracking';
import LoyaltyProgram from './components/LoyaltyProgram';
import QuickActions from './components/QuickActions';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';

const CustomerDashboard = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  // Mock data for customer dashboard
  const orderStats = {
    active: 3,
    delivered: 12,
    pending: 1
  };

  const recentOrders = [
    {
      id: "ORD-2025-001",
      orderNumber: "ORD-2025-001",
      status: "Processing",
      items: 3,
      date: "2025-01-15",
      total: 45000
    },
    {
      id: "ORD-2025-002",
      orderNumber: "ORD-2025-002",
      status: "Shipped",
      items: 1,
      date: "2025-01-14",
      total: 25000
    },
    {
      id: "ORD-2025-003",
      orderNumber: "ORD-2025-003",
      status: "Delivered",
      items: 2,
      date: "2025-01-12",
      total: 35000
    }
  ];

  const wishlistItems = [
    {
      id: 1,
      name: "Samsung Galaxy S24 Ultra",
      shop: "TechHub Cameroon",
      image: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=400",
      currentPrice: 850000,
      originalPrice: 900000,
      priceChange: -5.6,
      inStock: true
    },
    {
      id: 2,
      name: "Nike Air Max 270",
      shop: "SportZone Douala",
      image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400",
      currentPrice: 125000,
      originalPrice: 120000,
      priceChange: 4.2,
      inStock: false
    },
    {
      id: 3,
      name: "MacBook Pro 14-inch",
      shop: "Apple Store Yaoundé",
      image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400",
      currentPrice: 1200000,
      originalPrice: 1200000,
      priceChange: 0,
      inStock: true
    }
  ];

  const profileData = {
    name: "Jean-Baptiste Mbarga",
    email: "jean.mbarga@email.com",
    completionPercentage: 85,
    savedAddresses: 2,
    paymentMethods: 3
  };

  const activeDeliveries = [
    {
      id: "DEL-001",
      orderNumber: "ORD-2025-001",
      status: "in_transit",
      items: 3,
      currentLocation: "Douala Distribution Center",
      estimatedDelivery: "2025-01-17T14:00:00Z",
      agent: {
        name: "Paul Nkomo",
        phone: "+237 6XX XXX XXX"
      }
    },
    {
      id: "DEL-002",
      orderNumber: "ORD-2025-002",
      status: "out_for_delivery",
      items: 1,
      currentLocation: "Yaoundé - Final Mile",
      estimatedDelivery: "2025-01-16T16:30:00Z",
      agent: {
        name: "Marie Fotso",
        phone: "+237 6XX XXX XXX"
      }
    }
  ];

  const loyaltyData = {
    currentTier: "gold",
    nextTier: "platinum",
    totalPoints: 2450,
    pointsThisYear: 1200,
    nextTierRequirement: 2000,
    availableRewards: 5,
    recentRewards: [
      {
        id: 1,
        title: "10% Off Electronics",
        points: 500,
        expiryDate: "2025-02-15"
      },
      {
        id: 2,
        title: "Free Shipping Voucher",
        points: 200,
        expiryDate: "2025-01-30"
      },
      {
        id: 3,
        title: "5000 XAF Discount",
        points: 1000,
        expiryDate: "2025-03-01"
      }
    ]
  };

  // Event handlers
  const handleStatusClick = (status) => {
    console.log(`Filter orders by status: ${status}`);
    window.location.href = '/order-management';
  };

  const handleTrackOrder = (orderId) => {
    console.log(`Track order: ${orderId}`);
    window.location.href = '/order-management';
  };

  const handleContactSupport = (orderId) => {
    console.log(`Contact support for order: ${orderId}`);
  };

  const handleRemoveFromWishlist = (itemId) => {
    console.log(`Remove item ${itemId} from wishlist`);
  };

  const handleAddToCart = (itemId) => {
    console.log(`Add item ${itemId} to cart`);
  };

  const handleEditProfile = () => {
    console.log('Edit profile');
  };

  const handleManageAddresses = () => {
    console.log('Manage addresses');
  };

  const handleManagePayments = () => {
    console.log('Manage payment methods');
  };

  const handleViewFullTracking = (deliveryId) => {
    console.log(`View full tracking for delivery: ${deliveryId}`);
  };

  const handleViewRewards = () => {
    console.log('View all rewards');
  };

  const handleRedeemPoints = (rewardId) => {
    console.log(`Redeem reward: ${rewardId}`);
  };

  const handleBrowseProducts = () => {
    console.log('Browse products');
  };

  const handleViewProfile = () => {
    console.log('View profile');
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="flex">
        <RoleBasedNavigation />
        
        <main className="flex-1 lg:ml-64 pt-16">
          <div className="p-4 lg:p-6">
            {/* Welcome Section */}
            <div className="mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-foreground">
                    Welcome back, {profileData.name.split(' ')[0]}!
                  </h1>
                  <p className="text-muted-foreground">
                    {currentTime.toLocaleDateString('en-GB', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
                <div className="hidden md:flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.location.href = '/admin-login'}
                    className="text-xs"
                  >
                    <Icon name="Shield" size={16} className="mr-1" />
                    Admin Access
                  </Button>
                  <Icon name="Bell" size={20} className="text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {currentTime.toLocaleTimeString('en-GB', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              </div>
            </div>

            {/* Dashboard Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Main Content */}
              <div className="lg:col-span-2 space-y-6">
                <OrderStatusSummary 
                  orderStats={orderStats}
                  onStatusClick={handleStatusClick}
                />
                
                <RecentOrdersList
                  orders={recentOrders}
                  onTrackOrder={handleTrackOrder}
                  onContactSupport={handleContactSupport}
                />
                
                <DeliveryTracking
                  activeDeliveries={activeDeliveries}
                  onViewFullTracking={handleViewFullTracking}
                />
                
                <WishlistSection
                  wishlistItems={wishlistItems}
                  onRemoveFromWishlist={handleRemoveFromWishlist}
                  onAddToCart={handleAddToCart}
                />
              </div>

              {/* Right Column - Sidebar */}
              <div className="space-y-6">
                <AccountSummary
                  profileData={profileData}
                  onEditProfile={handleEditProfile}
                  onManageAddresses={handleManageAddresses}
                  onManagePayments={handleManagePayments}
                />
                
                <LoyaltyProgram
                  loyaltyData={loyaltyData}
                  onViewRewards={handleViewRewards}
                  onRedeemPoints={handleRedeemPoints}
                />
                
                <QuickActions
                  onBrowseProducts={handleBrowseProducts}
                  onTrackOrder={() => handleTrackOrder('latest')}
                  onContactSupport={() => handleContactSupport('general')}
                  onViewProfile={handleViewProfile}
                />
              </div>
            </div>

            {/* Mobile-specific bottom spacing */}
            <div className="h-20 md:hidden"></div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default CustomerDashboard;