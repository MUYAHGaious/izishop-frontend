import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';

const ShopManagement = () => {
  const [shops, setShops] = useState([]);
  const [filteredShops, setFilteredShops] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedShops, setSelectedShops] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [shopsPerPage] = useState(8);

  // Mock shop data
  useEffect(() => {
    const mockShops = [
      { 
        id: 1, 
        name: 'Tech Store Pro', 
        owner: 'John Doe', 
        email: 'john@techstore.com',
        category: 'Electronics', 
        status: 'active', 
        joinDate: '2024-01-15',
        products: 145,
        orders: 234,
        revenue: 5600000,
        rating: 4.8,
        location: 'Douala, Cameroon'
      },
      { 
        id: 2, 
        name: 'Fashion Hub', 
        owner: 'Jane Smith', 
        email: 'jane@fashionhub.com',
        category: 'Fashion', 
        status: 'pending', 
        joinDate: '2024-07-15',
        products: 67,
        orders: 12,
        revenue: 890000,
        rating: 4.2,
        location: 'Yaoundé, Cameroon'
      },
      { 
        id: 3, 
        name: 'Home & Garden', 
        owner: 'Mike Johnson', 
        email: 'mike@homeandgarden.com',
        category: 'Home & Garden', 
        status: 'active', 
        joinDate: '2024-03-10',
        products: 89,
        orders: 156,
        revenue: 3200000,
        rating: 4.6,
        location: 'Bamenda, Cameroon'
      },
      { 
        id: 4, 
        name: 'Sports Central', 
        owner: 'Sarah Wilson', 
        email: 'sarah@sportscentral.com',
        category: 'Sports', 
        status: 'suspended', 
        joinDate: '2024-02-20',
        products: 78,
        orders: 89,
        revenue: 1800000,
        rating: 3.9,
        location: 'Garoua, Cameroon'
      },
      { 
        id: 5, 
        name: 'Book World', 
        owner: 'David Brown', 
        email: 'david@bookworld.com',
        category: 'Books', 
        status: 'active', 
        joinDate: '2024-04-05',
        products: 234,
        orders: 345,
        revenue: 2100000,
        rating: 4.7,
        location: 'Douala, Cameroon'
      },
      { 
        id: 6, 
        name: 'Beauty Corner', 
        owner: 'Lisa Garcia', 
        email: 'lisa@beautycorner.com',
        category: 'Beauty', 
        status: 'active', 
        joinDate: '2024-05-12',
        products: 156,
        orders: 278,
        revenue: 4200000,
        rating: 4.9,
        location: 'Yaoundé, Cameroon'
      }
    ];
    setShops(mockShops);
    setFilteredShops(mockShops);
  }, []);

  // Filter shops
  useEffect(() => {
    let filtered = shops.filter(shop => {
      const matchesSearch = shop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           shop.owner.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           shop.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = selectedStatus === 'all' || shop.status === selectedStatus;
      const matchesCategory = selectedCategory === 'all' || shop.category === selectedCategory;
      
      return matchesSearch && matchesStatus && matchesCategory;
    });
    
    setFilteredShops(filtered);
    setCurrentPage(1);
  }, [searchTerm, selectedStatus, selectedCategory, shops]);

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'Electronics', label: 'Electronics' },
    { value: 'Fashion', label: 'Fashion' },
    { value: 'Home & Garden', label: 'Home & Garden' },
    { value: 'Sports', label: 'Sports' },
    { value: 'Books', label: 'Books' },
    { value: 'Beauty', label: 'Beauty' }
  ];

  const statuses = [
    { value: 'all', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'pending', label: 'Pending' },
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

  const handleShopAction = (action, shopId) => {
    console.log(`${action} shop ${shopId}`);
    // Implement shop actions here
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

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Shop Management</h2>
          <p className="text-gray-600">Monitor and manage all shops on the platform</p>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
          <Icon name="Plus" size={16} />
          <span>Add Shop</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center space-x-2">
            <Icon name="Store" size={20} className="text-purple-600" />
            <span className="text-sm text-gray-600">Total Shops</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-1">{shops.length}</p>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center space-x-2">
            <Icon name="CheckCircle" size={20} className="text-green-600" />
            <span className="text-sm text-gray-600">Active</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {shops.filter(s => s.status === 'active').length}
          </p>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center space-x-2">
            <Icon name="Clock" size={20} className="text-yellow-600" />
            <span className="text-sm text-gray-600">Pending</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {shops.filter(s => s.status === 'pending').length}
          </p>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center space-x-2">
            <Icon name="DollarSign" size={20} className="text-blue-600" />
            <span className="text-sm text-gray-600">Total Revenue</span>
          </div>
          <p className="text-lg font-bold text-gray-900 mt-1">
            {formatCurrency(shops.reduce((sum, shop) => sum + shop.revenue, 0))}
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
          
          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {categories.map(category => (
              <option key={category.value} value={category.value}>{category.label}</option>
            ))}
          </select>
          
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
                <p className="text-sm text-gray-500 truncate">{shop.owner}</p>
                <p className="text-xs text-gray-400 truncate">{shop.email}</p>
              </div>
            </div>

            {/* Shop Stats */}
            <div className="p-4">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-xs text-gray-500">Products</p>
                  <p className="font-semibold text-gray-900">{shop.products}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Orders</p>
                  <p className="font-semibold text-gray-900">{shop.orders}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Revenue</p>
                  <p className="font-semibold text-gray-900 text-sm">{formatCurrency(shop.revenue)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Rating</p>
                  <div className="flex items-center space-x-1">
                    <Icon name="Star" size={12} className="text-yellow-400 fill-current" />
                    <span className="font-semibold text-gray-900 text-sm">{shop.rating}</span>
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-xs text-gray-500">Category</p>
                <span className="inline-block px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs font-medium">
                  {shop.category}
                </span>
              </div>

              <div className="mb-4">
                <p className="text-xs text-gray-500">Location</p>
                <p className="text-sm text-gray-900">{shop.location}</p>
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
                <button
                  onClick={() => handleShopAction('edit', shop.id)}
                  className="flex items-center space-x-1 text-gray-600 hover:text-gray-700 text-sm"
                >
                  <Icon name="Edit" size={14} />
                  <span>Edit</span>
                </button>
                {shop.status === 'pending' && (
                  <button
                    onClick={() => handleShopAction('approve', shop.id)}
                    className="flex items-center space-x-1 text-green-600 hover:text-green-700 text-sm"
                  >
                    <Icon name="CheckCircle" size={14} />
                    <span>Approve</span>
                  </button>
                )}
                {shop.status === 'active' && (
                  <button
                    onClick={() => handleShopAction('suspend', shop.id)}
                    className="flex items-center space-x-1 text-red-600 hover:text-red-700 text-sm"
                  >
                    <Icon name="XCircle" size={14} />
                    <span>Suspend</span>
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
    </div>
  );
};

export default ShopManagement;

