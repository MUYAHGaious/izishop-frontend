import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import api from '../../../services/api';
import ShopSuspensionModal from './ShopSuspensionModal';

const ShopManagement = () => {
  const [shops, setShops] = useState([]);
  const [filteredShops, setFilteredShops] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedShops, setSelectedShops] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [shopsPerPage] = useState(8);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    total_shops: 0,
    active_shops: 0,
    suspended_shops: 0,
    total_revenue: 0
  });
  const [showSuspensionModal, setShowSuspensionModal] = useState(false);
  const [selectedShop, setSelectedShop] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Fetch real shop data
  useEffect(() => {
    fetchShops();
    
    // Set up auto-refresh every 30 seconds
    const interval = setInterval(fetchShops, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchShops = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await api.getDashboardShops();
      
      setStats(data.statistics);
      setShops(data.shops);
      setFilteredShops(data.shops);
    } catch (err) {
      setError(err.message || 'Failed to fetch shops data');
      console.error('Shops data fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filter shops
  useEffect(() => {
    let filtered = shops.filter(shop => {
      const matchesSearch = shop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           shop.owner_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           shop.owner_email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = selectedStatus === 'all' || shop.status === selectedStatus;
      
      return matchesSearch && matchesStatus;
    });
    
    setFilteredShops(filtered);
    setCurrentPage(1);
  }, [searchTerm, selectedStatus, shops]);


  const statuses = [
    { value: 'all', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'suspended', label: 'Suspended' }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-CM', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const handleShopAction = async (action, shopId) => {
    const shop = shops.find(s => s.id === shopId);
    
    switch (action) {
      case 'view':
        // TODO: Implement view shop details modal
        console.log(`Viewing shop ${shopId}`);
        break;
        
      case 'suspend':
        // Open suspension modal
        setSelectedShop(shop);
        setShowSuspensionModal(true);
        break;
        
      case 'unsuspend':
        await handleUnsuspendShop(shopId);
        break;
        
      default:
        console.log(`Unknown action: ${action}`);
    }
  };

  const handleSuspendShop = async (reason, notifyOwner) => {
    if (!selectedShop) return;
    
    try {
      setActionLoading(true);
      
      await api.suspendShop(selectedShop.id, reason, notifyOwner);
      
      // Update local state optimistically
      setShops(prev => prev.map(shop => 
        shop.id === selectedShop.id ? { ...shop, status: 'suspended' } : shop
      ));
      setFilteredShops(prev => prev.map(shop => 
        shop.id === selectedShop.id ? { ...shop, status: 'suspended' } : shop
      ));
      
      // Close modal
      setShowSuspensionModal(false);
      setSelectedShop(null);
      
      // Refresh data
      setTimeout(fetchShops, 1000);
      
    } catch (error) {
      console.error('Error suspending shop:', error);
      setError('Failed to suspend shop. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnsuspendShop = async (shopId) => {
    try {
      setActionLoading(true);
      
      await api.unsuspendShop(shopId);
      
      // Update local state optimistically
      setShops(prev => prev.map(shop => 
        shop.id === shopId ? { ...shop, status: 'active' } : shop
      ));
      setFilteredShops(prev => prev.map(shop => 
        shop.id === shopId ? { ...shop, status: 'active' } : shop
      ));
      
      // Refresh data
      setTimeout(fetchShops, 1000);
      
    } catch (error) {
      console.error('Error unsuspending shop:', error);
      setError('Failed to reactivate shop. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleBulkAction = (action) => {
    console.log(`${action} shops:`, selectedShops);
    // Implement bulk actions here
  };

  const toggleShopSelection = (shopId) => {
    setSelectedShops(prev => 
      prev.includes(shopId) 
        ? prev.filter(id => id !== shopId)
        : [...prev, shopId]
    );
  };

  const getCurrentPageShops = () => {
    const indexOfLastShop = currentPage * shopsPerPage;
    const indexOfFirstShop = indexOfLastShop - shopsPerPage;
    return filteredShops.slice(indexOfFirstShop, indexOfLastShop);
  };

  const totalPages = Math.ceil(filteredShops.length / shopsPerPage);

  if (loading) {
    return (
      <div className="p-4 lg:p-6 space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading shops data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 lg:p-6 space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <Icon name="AlertCircle" size={20} className="text-red-600 mr-2" />
            <div>
              <h3 className="text-red-800 font-medium">Error loading shops</h3>
              <p className="text-red-600 text-sm mt-1">{error}</p>
            </div>
          </div>
          <button
            onClick={fetchShops}
            className="mt-3 bg-red-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Shop Management</h2>
          <p className="text-gray-600">Monitor and manage all shops on the platform</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center space-x-2">
            <Icon name="Store" size={20} className="text-purple-600" />
            <span className="text-sm text-gray-600">Total Shops</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total_shops}</p>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center space-x-2">
            <Icon name="CheckCircle" size={20} className="text-green-600" />
            <span className="text-sm text-gray-600">Active Shops</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-1">{stats.active_shops}</p>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center space-x-2">
            <Icon name="DollarSign" size={20} className="text-blue-600" />
            <span className="text-sm text-gray-600">Total Revenue</span>
          </div>
          <p className="text-lg font-bold text-gray-900 mt-1">
            {formatCurrency(stats.total_revenue)}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg p-4 border border-gray-200">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Icon name="Search" size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search shops by name, owner, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {statuses.map(status => (
              <option key={status.value} value={status.value}>{status.label}</option>
            ))}
          </select>
        </div>

        {/* Bulk Actions */}
        {selectedShops.length > 0 && (
          <div className="mt-4 flex items-center space-x-2">
            <span className="text-sm text-gray-600">{selectedShops.length} selected</span>
            <button
              onClick={() => handleBulkAction('approve')}
              className="px-3 py-1 bg-green-100 text-green-800 rounded text-sm hover:bg-green-200 transition-colors"
            >
              Approve
            </button>
            <button
              onClick={() => handleBulkAction('suspend')}
              className="px-3 py-1 bg-red-100 text-red-800 rounded text-sm hover:bg-red-200 transition-colors"
            >
              Suspend
            </button>
            <button
              onClick={() => handleBulkAction('delete')}
              className="px-3 py-1 bg-gray-100 text-gray-800 rounded text-sm hover:bg-gray-200 transition-colors"
            >
              Delete
            </button>
          </div>
        )}
      </div>

      {/* Shops Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {getCurrentPageShops().map((shop) => (
          <div key={shop.id} className="bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
            {/* Shop Header */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={selectedShops.includes(shop.id)}
                    onChange={() => toggleShopSelection(shop.id)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Icon name="Store" size={20} className="text-purple-600" />
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(shop.status)}`}>
                  {shop.status}
                </span>
              </div>
              <div className="mt-3">
                <h3 className="font-semibold text-gray-900 truncate">{shop.name}</h3>
                <p className="text-sm text-gray-500 truncate">{shop.owner_name}</p>
                <p className="text-xs text-gray-400 truncate">{shop.owner_email}</p>
              </div>
            </div>

            {/* Shop Stats */}
            <div className="p-4">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-xs text-gray-500">Products</p>
                  <p className="font-semibold text-gray-900">{shop.products_count}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Orders</p>
                  <p className="font-semibold text-gray-900">{shop.orders_count}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Revenue</p>
                  <p className="font-semibold text-gray-900 text-sm">{formatCurrency(shop.revenue)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Rating</p>
                  <div className="flex items-center space-x-1">
                    <Icon name="Star" size={12} className="text-yellow-400 fill-current" />
                    <span className="font-semibold text-gray-900 text-sm">{shop.average_rating.toFixed(1)}</span>
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-xs text-gray-500">Address</p>
                <p className="text-sm text-gray-900">{shop.address || 'No address provided'}</p>
              </div>

              <div className="mb-4">
                <p className="text-xs text-gray-500">Verification Status</p>
                <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                  shop.is_verified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {shop.is_verified ? 'Verified' : 'Unverified'}
                </span>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <button
                  onClick={() => handleShopAction('view', shop.id)}
                  className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 text-sm"
                >
                  <Icon name="Eye" size={14} />
                  <span>View</span>
                </button>
                
                {shop.status === 'active' ? (
                  <button
                    onClick={() => handleShopAction('suspend', shop.id)}
                    className="flex items-center space-x-1 text-red-600 hover:text-red-700 text-sm"
                  >
                    <Icon name="XCircle" size={14} />
                    <span>Suspend</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleShopAction('unsuspend', shop.id)}
                    className="flex items-center space-x-1 text-green-600 hover:text-green-700 text-sm"
                  >
                    <Icon name="CheckCircle" size={14} />
                    <span>Unsuspend</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Showing {((currentPage - 1) * shopsPerPage) + 1} to {Math.min(currentPage * shopsPerPage, filteredShops.length)} of {filteredShops.length} shops
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Previous
            </button>
            <span className="text-sm text-gray-500">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Suspension Modal */}
      <ShopSuspensionModal
        isOpen={showSuspensionModal}
        onClose={() => {
          setShowSuspensionModal(false);
          setSelectedShop(null);
        }}
        shop={selectedShop}
        onConfirm={handleSuspendShop}
        loading={actionLoading}
      />
    </div>
  );
};

export default ShopManagement;

