import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import { showToast } from '../../components/ui/Toast';
import LoadingScreen from '../../components/ui/LoadingScreen';
import api from '../../services/api';

const DeliveryAgentDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    total_deliveries: 0,
    pending_deliveries: 0,
    completed_today: 0,
    earnings_today: 0,
    rating: 0,
    total_distance: 0
  });
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Real-time data refresh interval
  const REFRESH_INTERVAL = 30000; // 30 seconds

  useEffect(() => {
    loadDashboardData();
    
    // Set up auto-refresh interval
    const interval = setInterval(() => {
      refreshData();
    }, REFRESH_INTERVAL);
    
    // Cleanup on unmount
    return () => {
      clearInterval(interval);
    };
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      console.log('Loading delivery agent dashboard data...');
      
      // Fetch data in parallel for better performance
      const [deliveriesData, statsData] = await Promise.all([
        api.getDeliveryAgentDeliveries({ limit: 20 }),
        api.getDeliveryAgentStats()
      ]);
      
      console.log('Delivery agent data loaded:', { deliveriesData, statsData });
      
      // Update state with fresh data
      setDeliveries(deliveriesData);
      setStats(statsData);
      setLastUpdated(new Date());
      
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      showToast({
        type: 'error',
        message: 'Failed to load dashboard data. Using demo data.',
        duration: 4000
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Refresh data without full loading screen
  const refreshData = useCallback(async () => {
    try {
      setRefreshing(true);
      
      const [deliveriesData, statsData] = await Promise.all([
        api.getDeliveryAgentDeliveries({ limit: 20 }),
        api.getDeliveryAgentStats()
      ]);
      
      setDeliveries(deliveriesData);
      setStats(statsData);
      setLastUpdated(new Date());
      
    } catch (error) {
      console.warn('Failed to refresh data:', error);
    } finally {
      setRefreshing(false);
    }
  }, []);

  const handleStatusUpdate = async (deliveryId, newStatus) => {
    try {
      console.log(`Updating delivery ${deliveryId} status to ${newStatus}`);
      
      // Optimistic update
      setDeliveries(prev => 
        prev.map(delivery => 
          delivery.id === deliveryId 
            ? { 
                ...delivery, 
                status: newStatus, 
                delivered_at: newStatus === 'delivered' ? new Date().toISOString() : delivery.delivered_at 
              }
            : delivery
        )
      );
      
      // Update via API
      const result = await api.updateDeliveryStatus(deliveryId, newStatus);
      
      showToast({
        type: 'success',
        message: `Delivery status updated to ${newStatus.replace('_', ' ')}`,
        duration: 3000
      });
      
      // Refresh data to get updated stats
      refreshData();
      
    } catch (error) {
      console.error('Failed to update delivery status:', error);
      showToast({
        type: 'error',
        message: 'Failed to update delivery status. Please try again.',
        duration: 4000
      });
      
      // Revert optimistic update on error
      refreshData();
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in_transit': return 'bg-blue-100 text-blue-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-600';
      case 'normal': return 'text-blue-600';
      case 'low': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-CM', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <LoadingScreen 
        message="Loading your delivery dashboard..."
        variant="default"
        showProgress={false}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Delivery Dashboard</h1>
              <p className="text-gray-600">Welcome back, {user?.first_name || 'Agent'}</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                {lastUpdated && (
                  <span>Updated: {lastUpdated.toLocaleTimeString()}</span>
                )}
                {refreshing && (
                  <div className="flex items-center space-x-1">
                    <div className="animate-spin rounded-full h-3 w-3 border border-blue-600 border-t-transparent"></div>
                    <span>Refreshing...</span>
                  </div>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                iconName="RefreshCw"
                iconPosition="left"
                onClick={refreshData}
                loading={refreshing}
              >
                Refresh
              </Button>
              <Button
                variant="outline"
                iconName="Settings"
                iconPosition="left"
                onClick={() => navigate('/user-profile')}
              >
                Settings
              </Button>
              <Button
                variant="ghost"
                iconName="LogOut"
                iconPosition="left"
                onClick={logout}
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Icon name="Package" size={20} className="text-blue-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Deliveries</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total_deliveries}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Icon name="Clock" size={20} className="text-yellow-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Pending</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pending_deliveries}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <Icon name="CheckCircle" size={20} className="text-green-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Completed Today</p>
                <p className="text-2xl font-bold text-gray-900">{stats.completed_today}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Icon name="Banknote" size={20} className="text-purple-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Today's Earnings</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.earnings_today)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Deliveries List */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Active Deliveries</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {deliveries.map((delivery) => (
              <div key={delivery.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <Icon name="Flag" size={16} className={getPriorityColor(delivery.priority)} />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="text-lg font-medium text-gray-900">{delivery.id}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(delivery.status)}`}>
                          {delivery.status.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">Order: {delivery.order_number}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">{formatCurrency(delivery.amount)}</p>
                    <p className="text-sm text-gray-500">{delivery.distance} • {delivery.estimatedTime}</p>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Customer</h4>
                    <p className="text-sm text-gray-900">{delivery.customer_name}</p>
                    <p className="text-sm text-gray-500">{delivery.customer_phone}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Items</h4>
                    <div className="text-sm text-gray-900">
                      {delivery.items.map((item, index) => (
                        <span key={index}>
                          {item.name} (x{item.quantity})
                          {index < delivery.items.length - 1 && ', '}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-1">Pickup Address</h4>
                    <p className="text-sm text-gray-900">{delivery.pickup_address}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-1">Delivery Address</h4>
                    <p className="text-sm text-gray-900">{delivery.delivery_address}</p>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    Assigned: {formatDate(delivery.assigned_at)}
                    {delivery.delivered_at && (
                      <span> • Delivered: {formatDate(delivery.delivered_at)}</span>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    {delivery.status === 'pending' && (
                      <Button
                        size="sm"
                        onClick={() => handleStatusUpdate(delivery.id, 'in_transit')}
                        iconName="Truck"
                        iconPosition="left"
                      >
                        Start Delivery
                      </Button>
                    )}
                    {delivery.status === 'in_transit' && (
                      <Button
                        size="sm"
                        onClick={() => handleStatusUpdate(delivery.id, 'delivered')}
                        iconName="CheckCircle"
                        iconPosition="left"
                      >
                        Mark Delivered
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      iconName="Phone"
                      iconPosition="left"
                    >
                      Call Customer
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      iconName="MapPin"
                      iconPosition="left"
                    >
                      View Map
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeliveryAgentDashboard;