import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import api from '../../../services/api';
import { showToast } from '../../../components/ui/Toast';

const CustomerManagement = () => {
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSegment, setSelectedSegment] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [customersPerPage] = useState(10);
  const [loading, setLoading] = useState(true);

  // Load customers from API
  useEffect(() => {
    const loadCustomers = async () => {
      try {
        setLoading(true);
        const response = await api.getShopOwnerCustomers({
          page: currentPage,
          limit: customersPerPage,
          search: searchTerm || undefined,
          segment: selectedSegment !== 'all' ? selectedSegment : undefined,
          status: selectedStatus !== 'all' ? selectedStatus : undefined
        });
        
        // Transform API response to match component structure
        const transformedCustomers = (response.customers || response || []).map(customer => ({
          id: customer.id || Math.random().toString(36).substr(2, 9),
          name: customer.name || customer.user?.name || 'Unknown Customer',
          email: customer.email || customer.user?.email || 'unknown@email.com',
          phone: customer.phone || customer.user?.phone || '+237 6XX XXX XXX',
          totalOrders: customer.total_orders || 0,
          totalSpent: parseFloat(customer.total_spent || 0),
          averageOrderValue: parseFloat(customer.average_order_value || 0),
          lastOrderDate: customer.last_order_date || new Date().toISOString().split('T')[0],
          joinDate: customer.join_date || customer.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
          status: customer.status || (customer.total_orders > 0 ? 'active' : 'inactive'),
          segment: customer.segment || (
            customer.total_spent > 1000000 ? 'vip' :
            customer.total_orders > 5 ? 'regular' : 'new'
          ),
          location: customer.location || customer.city || 'Cameroon',
          rating: customer.rating || (4.0 + Math.random() * 1.0), // Simulate rating
          notes: customer.notes || ''
        }));
        
        setCustomers(transformedCustomers);
        setFilteredCustomers(transformedCustomers);
      } catch (error) {
        console.error('Error loading customers:', error);
        showToast({
          type: 'error',
          message: 'Failed to load customers. Using sample data.',
          duration: 3000
        });
        
        // Fallback to sample data if API fails
        const mockCustomers = [
      {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+237 6XX XXX XXX',
        totalOrders: 12,
        totalSpent: 2450000,
        averageOrderValue: 204167,
        lastOrderDate: '2024-07-18',
        joinDate: '2024-01-15',
        status: 'active',
        segment: 'vip',
        location: 'Douala, Cameroon',
        rating: 4.8,
        notes: 'Frequent buyer, prefers electronics'
      },
      {
        id: 2,
        name: 'Jane Smith',
        email: 'jane@example.com',
        phone: '+237 6XX XXX XXX',
        totalOrders: 8,
        totalSpent: 1200000,
        averageOrderValue: 150000,
        lastOrderDate: '2024-07-16',
        joinDate: '2024-02-20',
        status: 'active',
        segment: 'regular',
        location: 'Yaoundé, Cameroon',
        rating: 4.5,
        notes: 'Interested in fashion items'
      },
      {
        id: 3,
        name: 'Mike Johnson',
        email: 'mike@example.com',
        phone: '+237 6XX XXX XXX',
        totalOrders: 3,
        totalSpent: 450000,
        averageOrderValue: 150000,
        lastOrderDate: '2024-07-10',
        joinDate: '2024-05-10',
        status: 'active',
        segment: 'new',
        location: 'Bamenda, Cameroon',
        rating: 4.2,
        notes: ''
      },
      {
        id: 4,
        name: 'Sarah Wilson',
        email: 'sarah@example.com',
        phone: '+237 6XX XXX XXX',
        totalOrders: 1,
        totalSpent: 89000,
        averageOrderValue: 89000,
        lastOrderDate: '2024-06-25',
        joinDate: '2024-06-20',
        status: 'inactive',
        segment: 'new',
        location: 'Garoua, Cameroon',
        rating: 4.0,
        notes: 'Single purchase, no follow-up'
      },
      {
        id: 5,
        name: 'David Brown',
        email: 'david@example.com',
        phone: '+237 6XX XXX XXX',
        totalOrders: 25,
        totalSpent: 5600000,
        averageOrderValue: 224000,
        lastOrderDate: '2024-07-17',
        joinDate: '2023-12-05',
        status: 'active',
        segment: 'vip',
        location: 'Douala, Cameroon',
        rating: 4.9,
        notes: 'Top customer, bulk orders'
      },
      {
        id: 6,
        name: 'Lisa Garcia',
        email: 'lisa@example.com',
        phone: '+237 6XX XXX XXX',
        totalOrders: 6,
        totalSpent: 890000,
        averageOrderValue: 148333,
        lastOrderDate: '2024-07-12',
        joinDate: '2024-03-15',
        status: 'active',
        segment: 'regular',
        location: 'Yaoundé, Cameroon',
        rating: 4.6,
        notes: 'Prefers home & garden products'
      }
        ];
        setCustomers(mockCustomers);
        setFilteredCustomers(mockCustomers);
      } finally {
        setLoading(false);
      }
    };

    loadCustomers();
  }, [currentPage, searchTerm, selectedSegment, selectedStatus]);

  // Filter customers
  useEffect(() => {
    let filtered = customers.filter(customer => {
      const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           customer.phone.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSegment = selectedSegment === 'all' || customer.segment === selectedSegment;
      const matchesStatus = selectedStatus === 'all' || customer.status === selectedStatus;
      
      return matchesSearch && matchesSegment && matchesStatus;
    });
    
    setFilteredCustomers(filtered);
    setCurrentPage(1);
  }, [searchTerm, selectedSegment, selectedStatus, customers]);

  const segments = [
    { value: 'all', label: 'All Segments' },
    { value: 'vip', label: 'VIP Customers' },
    { value: 'regular', label: 'Regular Customers' },
    { value: 'new', label: 'New Customers' },
    { value: 'at_risk', label: 'At Risk' }
  ];

  const statuses = [
    { value: 'all', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'blocked', label: 'Blocked' }
  ];

  const getSegmentColor = (segment) => {
    switch (segment) {
      case 'vip': return 'bg-purple-100 text-purple-800';
      case 'regular': return 'bg-blue-100 text-blue-800';
      case 'new': return 'bg-green-100 text-green-800';
      case 'at_risk': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-yellow-100 text-yellow-800';
      case 'blocked': return 'bg-red-100 text-red-800';
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleCustomerAction = (action, customerId) => {
    console.log(`${action} customer ${customerId}`);
    // Implement customer actions here
  };

  const getCurrentPageCustomers = () => {
    const indexOfLastCustomer = currentPage * customersPerPage;
    const indexOfFirstCustomer = indexOfLastCustomer - customersPerPage;
    return filteredCustomers.slice(indexOfFirstCustomer, indexOfLastCustomer);
  };

  const totalPages = Math.ceil(filteredCustomers.length / customersPerPage);

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Customer Management</h2>
          <p className="text-gray-600">Manage your customer relationships and insights</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center space-x-2">
            <Icon name="Users" size={20} className="text-blue-600" />
            <span className="text-sm text-gray-600">Total Customers</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-1">{customers.length}</p>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center space-x-2">
            <Icon name="Crown" size={20} className="text-purple-600" />
            <span className="text-sm text-gray-600">VIP Customers</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {customers.filter(c => c.segment === 'vip').length}
          </p>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center space-x-2">
            <Icon name="UserCheck" size={20} className="text-green-600" />
            <span className="text-sm text-gray-600">Active</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {customers.filter(c => c.status === 'active').length}
          </p>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center space-x-2">
            <Icon name="DollarSign" size={20} className="text-green-600" />
            <span className="text-sm text-gray-600">Avg. Order Value</span>
          </div>
          <p className="text-lg font-bold text-gray-900 mt-1">
            {formatCurrency(customers.reduce((sum, c) => sum + c.averageOrderValue, 0) / customers.length)}
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
                placeholder="Search customers by name, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          {/* Segment Filter */}
          <select
            value={selectedSegment}
            onChange={(e) => setSelectedSegment(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {segments.map(segment => (
              <option key={segment.value} value={segment.value}>{segment.label}</option>
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
      </div>

      {/* Customer List */}
      <div className="space-y-4">
        {loading ? (
          // Loading skeleton
          Array.from({ length: customersPerPage }).map((_, index) => (
            <div key={index} className="bg-white rounded-lg border border-gray-200 p-4 lg:p-6 animate-pulse">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                  <div className="space-y-2">
                    <div className="w-32 h-4 bg-gray-200 rounded"></div>
                    <div className="w-24 h-3 bg-gray-200 rounded"></div>
                    <div className="w-28 h-3 bg-gray-200 rounded"></div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-12 h-6 bg-gray-200 rounded-full"></div>
                  <div className="w-16 h-6 bg-gray-200 rounded-full"></div>
                </div>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="w-12 h-4 bg-gray-200 rounded mx-auto mb-2"></div>
                    <div className="w-16 h-3 bg-gray-200 rounded mx-auto"></div>
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : getCurrentPageCustomers().length > 0 ? (
          getCurrentPageCustomers().map((customer) => (
          <div key={customer.id} className="bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
            <div className="p-4 lg:p-6">
              {/* Customer Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                    <Icon name="User" size={24} className="text-gray-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{customer.name}</h3>
                    <p className="text-sm text-gray-500">{customer.email}</p>
                    <p className="text-sm text-gray-500">{customer.phone}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSegmentColor(customer.segment)}`}>
                      {customer.segment.toUpperCase()}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(customer.status)}`}>
                      {customer.status}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center space-x-1">
                    <Icon name="Star" size={16} className="text-yellow-400 fill-current" />
                    <span className="text-sm font-medium text-gray-900">{customer.rating}</span>
                  </div>
                  <p className="text-xs text-gray-500">Customer Rating</p>
                </div>
              </div>

              {/* Customer Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-lg font-bold text-gray-900">{customer.totalOrders}</p>
                  <p className="text-xs text-gray-500">Total Orders</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-lg font-bold text-gray-900">{formatCurrency(customer.totalSpent)}</p>
                  <p className="text-xs text-gray-500">Total Spent</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-lg font-bold text-gray-900">{formatCurrency(customer.averageOrderValue)}</p>
                  <p className="text-xs text-gray-500">Avg. Order Value</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm font-bold text-gray-900">{formatDate(customer.lastOrderDate)}</p>
                  <p className="text-xs text-gray-500">Last Order</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm font-bold text-gray-900">{formatDate(customer.joinDate)}</p>
                  <p className="text-xs text-gray-500">Customer Since</p>
                </div>
              </div>

              {/* Customer Details */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Location</h4>
                  <p className="text-sm text-gray-900">{customer.location}</p>
                </div>
                {customer.notes && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Notes</h4>
                    <p className="text-sm text-gray-600">{customer.notes}</p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => handleCustomerAction('view', customer.id)}
                    className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 text-sm"
                  >
                    <Icon name="Eye" size={14} />
                    <span>View Profile</span>
                  </button>
                  <button
                    onClick={() => handleCustomerAction('orders', customer.id)}
                    className="flex items-center space-x-1 text-green-600 hover:text-green-700 text-sm"
                  >
                    <Icon name="ShoppingBag" size={14} />
                    <span>View Orders</span>
                  </button>
                  <button
                    onClick={() => handleCustomerAction('contact', customer.id)}
                    className="flex items-center space-x-1 text-purple-600 hover:text-purple-700 text-sm"
                  >
                    <Icon name="MessageCircle" size={14} />
                    <span>Contact</span>
                  </button>
                  <button
                    onClick={() => handleCustomerAction('email', customer.id)}
                    className="flex items-center space-x-1 text-orange-600 hover:text-orange-700 text-sm"
                  >
                    <Icon name="Mail" size={14} />
                    <span>Send Email</span>
                  </button>
                </div>
                <div className="flex items-center space-x-2">
                  {customer.segment !== 'vip' && customer.totalSpent > 1000000 && (
                    <button
                      onClick={() => handleCustomerAction('promote', customer.id)}
                      className="px-3 py-1 bg-purple-600 text-white rounded text-sm hover:bg-purple-700 transition-colors"
                    >
                      Promote to VIP
                    </button>
                  )}
                  <button
                    onClick={() => handleCustomerAction('edit', customer.id)}
                    className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700 transition-colors"
                  >
                    Edit
                  </button>
                </div>
              </div>
            </div>
          </div>
          ))
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
            <div className="flex flex-col items-center space-y-4">
              <Icon name="Users" size={48} className="text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900">No customers found</h3>
              <p className="text-gray-500">
                {searchTerm || selectedSegment !== 'all' || selectedStatus !== 'all'
                  ? "Try adjusting your search or filter criteria"
                  : "Customers will appear here when they make purchases from your shop"
                }
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Showing {((currentPage - 1) * customersPerPage) + 1} to {Math.min(currentPage * customersPerPage, filteredCustomers.length)} of {filteredCustomers.length} customers
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

export default CustomerManagement;

