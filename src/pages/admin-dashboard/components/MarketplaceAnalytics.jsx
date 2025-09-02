import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import api from '../../../services/api';

const MarketplaceAnalytics = () => {
  const [marketplaceData, setMarketplaceData] = useState({
    totalListings: 0,
    activeListings: 0,
    totalTransactions: 0,
    transactionVolume: 0,
    casualSellers: 0,
    shopOwners: 0,
    deliveryAgents: 0
  });
  
  const [recentActivity, setRecentActivity] = useState([]);
  const [topCategories, setTopCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('30d');

  useEffect(() => {
    fetchMarketplaceData();
  }, [selectedPeriod]);

  const fetchMarketplaceData = async () => {
    try {
      setLoading(true);
      
      // Fetch marketplace metrics
      const metricsResponse = await api.get(`/admin/marketplace-metrics?period=${selectedPeriod}`);
      setMarketplaceData(metricsResponse.data || marketplaceData);
      
      // Fetch recent activity
      const activityResponse = await api.get('/admin/recent-marketplace-activity');
      setRecentActivity(activityResponse.data || []);
      
      // Fetch top categories
      const categoriesResponse = await api.get('/admin/top-categories');
      setTopCategories(categoriesResponse.data || []);
      
    } catch (error) {
      console.error('Error fetching marketplace data:', error);
      // Use mock data for development
      setMarketplaceData({
        totalListings: 1247,
        activeListings: 892,
        totalTransactions: 2156,
        transactionVolume: 45678.92,
        casualSellers: 234,
        shopOwners: 45,
        deliveryAgents: 18
      });
      
      setRecentActivity(generateMockActivity());
      setTopCategories(generateMockCategories());
    } finally {
      setLoading(false);
    }
  };

  const generateMockActivity = () => {
    const activities = [
      'new_listing', 'transaction_completed', 'user_upgraded', 'listing_sold',
      'shop_created', 'delivery_completed', 'user_registered'
    ];
    
    const activityLabels = {
      'new_listing': 'New casual listing posted',
      'transaction_completed': 'Transaction completed',
      'user_upgraded': 'User upgraded to Shop Owner',
      'listing_sold': 'Casual listing sold',
      'shop_created': 'New shop created',
      'delivery_completed': 'Delivery completed',
      'user_registered': 'New user registered'
    };
    
    return Array.from({ length: 15 }, (_, i) => {
      const activity = activities[Math.floor(Math.random() * activities.length)];
      return {
        id: i + 1,
        type: activity,
        description: activityLabels[activity],
        user: `User ${i + 1}`,
        amount: activity.includes('transaction') || activity.includes('sold') 
          ? Math.random() * 500 + 10 
          : null,
        timestamp: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000),
        metadata: {
          item: activity.includes('listing') ? `Item ${i + 1}` : null,
          location: 'Douala, CM'
        }
      };
    });
  };

  const generateMockCategories = () => {
    const categories = [
      'Electronics', 'Fashion', 'Home & Garden', 'Sports', 'Books',
      'Automotive', 'Health & Beauty', 'Toys', 'Jewelry', 'Art'
    ];
    
    return categories.map((category, i) => ({
      name: category,
      listings: Math.floor(Math.random() * 200) + 50,
      transactions: Math.floor(Math.random() * 100) + 10,
      volume: Math.random() * 5000 + 1000,
      growth: (Math.random() - 0.5) * 50
    })).sort((a, b) => b.volume - a.volume).slice(0, 8);
  };

  const getActivityIcon = (type) => {
    const icons = {
      'new_listing': 'Plus',
      'transaction_completed': 'DollarSign',
      'user_upgraded': 'TrendingUp',
      'listing_sold': 'ShoppingCart',
      'shop_created': 'Store',
      'delivery_completed': 'Truck',
      'user_registered': 'UserPlus'
    };
    return icons[type] || 'Activity';
  };

  const getActivityColor = (type) => {
    const colors = {
      'new_listing': 'text-blue-600',
      'transaction_completed': 'text-green-600',
      'user_upgraded': 'text-purple-600',
      'listing_sold': 'text-orange-600',
      'shop_created': 'text-indigo-600',
      'delivery_completed': 'text-teal-600',
      'user_registered': 'text-pink-600'
    };
    return colors[type] || 'text-gray-600';
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatTime = (date) => {
    const now = new Date();
    const diff = now - new Date(date);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Marketplace Analytics</h2>
          <p className="text-sm text-gray-600 mt-1">Track casual listings, transactions, and marketplace growth</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="1y">Last Year</option>
          </select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Listings</p>
              <p className="text-2xl font-bold text-gray-900">{marketplaceData.totalListings.toLocaleString()}</p>
              <p className="text-sm text-green-600 mt-1">↗ {marketplaceData.activeListings} active</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Icon name="Package" size={24} className="text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Transactions</p>
              <p className="text-2xl font-bold text-gray-900">{marketplaceData.totalTransactions.toLocaleString()}</p>
              <p className="text-sm text-gray-500 mt-1">This period</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <Icon name="TrendingUp" size={24} className="text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Transaction Volume</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(marketplaceData.transactionVolume)}</p>
              <p className="text-sm text-purple-600 mt-1">Revenue generated</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <Icon name="DollarSign" size={24} className="text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Users</p>
              <p className="text-2xl font-bold text-gray-900">{(marketplaceData.casualSellers + marketplaceData.shopOwners).toLocaleString()}</p>
              <p className="text-sm text-indigo-600 mt-1">{marketplaceData.deliveryAgents} delivery agents</p>
            </div>
            <div className="p-3 bg-indigo-100 rounded-full">
              <Icon name="Users" size={24} className="text-indigo-600" />
            </div>
          </div>
        </div>
      </div>

      {/* User Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Roles Distribution */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">User Distribution</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                <span className="text-sm text-gray-700">Casual Sellers</span>
              </div>
              <div className="text-right">
                <div className="text-lg font-medium">{marketplaceData.casualSellers}</div>
                <div className="text-xs text-gray-500">Free plan</div>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-purple-500 rounded-full mr-3"></div>
                <span className="text-sm text-gray-700">Shop Owners</span>
              </div>
              <div className="text-right">
                <div className="text-lg font-medium">{marketplaceData.shopOwners}</div>
                <div className="text-xs text-gray-500">$29.99/month</div>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-teal-500 rounded-full mr-3"></div>
                <span className="text-sm text-gray-700">Delivery Agents</span>
              </div>
              <div className="text-right">
                <div className="text-lg font-medium">{marketplaceData.deliveryAgents}</div>
                <div className="text-xs text-gray-500">Commission based</div>
              </div>
            </div>
          </div>
        </div>

        {/* Top Categories */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Top Categories</h3>
          <div className="space-y-3">
            {topCategories.slice(0, 6).map((category, index) => (
              <div key={category.name} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-3">
                    <span className="text-white text-xs font-medium">{index + 1}</span>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">{category.name}</div>
                    <div className="text-xs text-gray-500">{category.listings} listings</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">{formatCurrency(category.volume)}</div>
                  <div className={`text-xs ${category.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {category.growth >= 0 ? '↗' : '↘'} {Math.abs(category.growth).toFixed(1)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Recent Marketplace Activity</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {recentActivity.slice(0, 10).map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3">
                <div className={`p-2 rounded-full ${getActivityColor(activity.type).replace('text-', 'bg-').replace('-600', '-100')}`}>
                  <Icon name={getActivityIcon(activity.type)} size={16} className={getActivityColor(activity.type)} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-900">{activity.description}</p>
                    <p className="text-xs text-gray-500">{formatTime(activity.timestamp)}</p>
                  </div>
                  <div className="mt-1 flex items-center space-x-4 text-xs text-gray-500">
                    <span>by {activity.user}</span>
                    {activity.amount && <span>{formatCurrency(activity.amount)}</span>}
                    {activity.metadata.item && <span>{activity.metadata.item}</span>}
                    <span>{activity.metadata.location}</span>
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

export default MarketplaceAnalytics;