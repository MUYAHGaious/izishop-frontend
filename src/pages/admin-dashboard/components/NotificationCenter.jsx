import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import api from '../../../services/api';

const NotificationCenter = () => {
  const { user } = useAuth();
  
  // Check if user has admin privileges - early return if not
  if (!user || (user.role !== 'ADMIN' && user.role !== 'admin')) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 text-center">
        <div className="text-red-500 mb-4">
          <Icon name="AlertTriangle" size={48} />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Access Denied</h3>
        <p className="text-gray-600">
          You need administrator privileges to access the notification center.
        </p>
        <p className="text-sm text-gray-500 mt-2">
          Current role: {user?.role || 'Unknown'}
        </p>
      </div>
    );
  }

  const [activeTab, setActiveTab] = useState('send');
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [notificationTypes, setNotificationTypes] = useState({ types: [], priorities: [], icons: [] });
  
  const [notificationForm, setNotificationForm] = useState({
    title: '',
    message: '',
    type: 'system',
    priority: 'medium',
    icon: 'Bell',
    action_url: '',
    action_label: '',
    expires_in_hours: 24,
    tags: [],
    category: 'general'
  });

  const [filters, setFilters] = useState({
    search: '',
    role: '',
    limit: 20,
    offset: 0
  });

  const [alert, setAlert] = useState({ show: false, type: '', message: '' });
  const [tagInput, setTagInput] = useState('');

  // Predefined categories and tags
  const categories = [
    { value: 'general', label: 'General', color: 'bg-gray-100 text-gray-800' },
    { value: 'urgent', label: 'Urgent', color: 'bg-red-100 text-red-800' },
    { value: 'promotional', label: 'Promotional', color: 'bg-blue-100 text-blue-800' },
    { value: 'system_update', label: 'System Update', color: 'bg-purple-100 text-purple-800' },
    { value: 'policy_change', label: 'Policy Change', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'maintenance', label: 'Maintenance', color: 'bg-orange-100 text-orange-800' },
    { value: 'security', label: 'Security', color: 'bg-red-100 text-red-800' },
    { value: 'feature_update', label: 'Feature Update', color: 'bg-green-100 text-green-800' }
  ];

  const suggestedTags = [
    'important', 'action-required', 'reminder', 'update', 'new-feature',
    'maintenance', 'urgent', 'promotional', 'seasonal', 'limited-time',
    'shop-owners', 'customers', 'delivery-agents', 'payment-related',
    'order-related', 'account', 'security', 'performance', 'bug-fix'
  ];

  useEffect(() => {
    fetchUsers();
    fetchNotificationTypes();
  }, [filters]);

  const fetchUsers = async () => {
    // Check if user has admin privileges
    if (!user || (user.role !== 'ADMIN' && user.role !== 'admin')) {
      showAlert('error', 'Admin access required to fetch users');
      return;
    }

    try {
      setLoading(true);
      console.log('NotificationCenter: Fetching users with filters:', filters);
      const response = await api.getUsersForNotifications(filters);
      console.log('NotificationCenter: Users fetched:', response);
      
      if (Array.isArray(response)) {
        setUsers(response);
      } else {
        console.warn('NotificationCenter: Invalid response format:', response);
        setUsers([]);
        showAlert('warning', 'No users found with current filters');
      }
    } catch (error) {
      console.error('NotificationCenter: Error fetching users:', error);
      setUsers([]);
      
      if (error.message.includes('403') || error.message.includes('Forbidden')) {
        showAlert('error', 'Access denied. Admin privileges required.');
      } else if (error.message.includes('Network Error') || error.message.includes('fetch')) {
        showAlert('error', 'Network error. Please check your connection and try again.');
      } else {
        showAlert('error', 'Failed to fetch users: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchNotificationTypes = async () => {
    // Check if user has admin privileges
    if (!user || (user.role !== 'ADMIN' && user.role !== 'admin')) {
      // Set default notification types for non-admin users
      setNotificationTypes({
        types: [
          { value: 'system', label: 'System' },
          { value: 'order', label: 'Order' },
          { value: 'info', label: 'Info' }
        ],
        priorities: [
          { value: 'low', label: 'Low' },
          { value: 'medium', label: 'Medium' },
          { value: 'high', label: 'High' }
        ],
        icons: ['Bell', 'Info', 'AlertTriangle', 'CheckCircle', 'Package']
      });
      return;
    }

    try {
      const response = await api.getNotificationTypes();
      setNotificationTypes(response);
    } catch (error) {
      console.error('Failed to fetch notification types:', error);
      // Fallback to default types
      setNotificationTypes({
        types: [
          { value: 'system', label: 'System' },
          { value: 'order', label: 'Order' },
          { value: 'info', label: 'Info' }
        ],
        priorities: [
          { value: 'low', label: 'Low' },
          { value: 'medium', label: 'Medium' },
          { value: 'high', label: 'High' }
        ],
        icons: ['Bell', 'Info', 'AlertTriangle', 'CheckCircle', 'Package']
      });
    }
  };

  const showAlert = (type, message) => {
    setAlert({ show: true, type, message });
    setTimeout(() => setAlert({ show: false, type: '', message: '' }), 5000);
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
    // Debounce the search to avoid too many API calls
    clearTimeout(window.searchTimeout);
    window.searchTimeout = setTimeout(() => {
      setFilters(prev => ({ ...prev, search: value, offset: 0 }));
    }, 300);
  };

  const handleRoleFilter = (role) => {
    setRoleFilter(role);
    setFilters(prev => ({ ...prev, role, offset: 0 }));
  };

  const handleUserSelection = (userId) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const selectAllUsers = () => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(users.map(user => user.id));
    }
  };

  const validateForm = () => {
    if (!notificationForm.title.trim()) {
      showAlert('error', 'Title is required');
      return false;
    }
    if (!notificationForm.message.trim()) {
      showAlert('error', 'Message is required');
      return false;
    }
    if (selectedUsers.length === 0) {
      showAlert('error', 'Please select at least one recipient');
      return false;
    }
    return true;
  };

  const sendNotification = async () => {
    if (!validateForm()) return;

    try {
      setSending(true);
      
      if (selectedUsers.length === 1) {
        // Send single notification
        await api.sendNotificationToUser({
          user_id: selectedUsers[0],
          ...notificationForm
        });
        showAlert('success', 'Notification sent successfully!');
      } else {
        // Send bulk notifications
        const response = await api.sendBulkNotifications({
          user_ids: selectedUsers,
          ...notificationForm
        });
        showAlert('success', `Sent ${response.successful} notifications successfully`);
        if (response.failed > 0) {
          showAlert('warning', `${response.failed} notifications failed to send`);
        }
      }

      // Reset form
      setNotificationForm({
        title: '',
        message: '',
        type: 'system',
        priority: 'medium',
        icon: 'Bell',
        action_url: '',
        action_label: '',
        expires_in_hours: 24,
        tags: [],
        category: 'general'
      });
      setSelectedUsers([]);
      setTagInput('');
      
    } catch (error) {
      showAlert('error', 'Failed to send notification: ' + error.message);
    } finally {
      setSending(false);
    }
  };

  const getRoleColor = (role) => {
    const colors = {
      admin: 'bg-red-100 text-red-800',
      shop_owner: 'bg-blue-100 text-blue-800',
      customer: 'bg-green-100 text-green-800',
      delivery_agent: 'bg-purple-100 text-purple-800'
    };
    return colors[role] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'text-green-600',
      medium: 'text-yellow-600',
      high: 'text-orange-600',
      urgent: 'text-red-600'
    };
    return colors[priority] || 'text-gray-600';
  };

  const getTypeColor = (type) => {
    const colors = {
      order: 'bg-blue-50 text-blue-700',
      payment: 'bg-green-50 text-green-700',
      system: 'bg-purple-50 text-purple-700',
      marketing: 'bg-pink-50 text-pink-700',
      shop: 'bg-orange-50 text-orange-700',
      security: 'bg-red-50 text-red-700',
      customer: 'bg-indigo-50 text-indigo-700'
    };
    return colors[type] || 'bg-gray-50 text-gray-700';
  };

  const addTag = (tag) => {
    if (tag && !notificationForm.tags.includes(tag)) {
      setNotificationForm(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
    }
    setTagInput('');
  };

  const removeTag = (tagToRemove) => {
    setNotificationForm(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleTagInputKeyPress = (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      addTag(tagInput.trim());
    }
  };

  const getCategoryColor = (categoryValue) => {
    const category = categories.find(cat => cat.value === categoryValue);
    return category ? category.color : 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-4 lg:p-6 space-y-6">
        {/* Alert */}
        {alert.show && (
          <div className={`p-4 rounded-lg border-l-4 ${
            alert.type === 'success' ? 'bg-green-50 border-green-400 text-green-700' :
            alert.type === 'warning' ? 'bg-yellow-50 border-yellow-400 text-yellow-700' :
            'bg-red-50 border-red-400 text-red-700'
          }`}>
            <div className="flex items-center">
              <Icon 
                name={alert.type === 'success' ? 'CheckCircle' : alert.type === 'warning' ? 'AlertTriangle' : 'XCircle'} 
                className="h-5 w-5 mr-2" 
              />
              <span>{alert.message}</span>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Icon name="Send" size={24} className="text-white" />
                </div>
                <span>Notification Center</span>
              </h1>
              <p className="text-gray-600 mt-1">Send targeted notifications to users across the platform</p>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span>Live System</span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* User Selection Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                  <Icon name="Users" size={20} />
                  <span>Select Recipients</span>
                </h3>
                
                {/* Search and Filters */}
                <div className="mt-4 space-y-3">
                  <div className="relative">
                    <Icon name="Search" size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search users..."
                      value={searchTerm}
                      onChange={(e) => handleSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <select
                    value={roleFilter}
                    onChange={(e) => handleRoleFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All Roles</option>
                    <option value="CUSTOMER">Customers</option>
                    <option value="SHOP_OWNER">Shop Owners</option>
                    <option value="DELIVERY_AGENT">Delivery Agents</option>
                    <option value="ADMIN">Admins</option>
                  </select>
                </div>
              </div>

              {/* User List */}
              <div className="max-h-96 overflow-y-auto">
                {/* Select All */}
                <div className="p-3 border-b border-gray-100 bg-gray-50">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedUsers.length === users.length && users.length > 0}
                      onChange={selectAllUsers}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Select All ({users.length} users)
                    </span>
                  </label>
                </div>

                {loading ? (
                  <div className="p-6 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-gray-500 mt-2">Loading users...</p>
                  </div>
                ) : users.length === 0 ? (
                  <div className="p-6 text-center">
                    <Icon name="Users" size={48} className="text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">No users found</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {users.map((user) => (
                      <label key={user.id} className="flex items-center space-x-3 p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100">
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(user.id)}
                          onChange={() => handleUserSelection(user.id)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{user.full_name}</p>
                          <p className="text-xs text-gray-500 truncate">{user.email}</p>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                            {user.role.replace('_', ' ')}
                          </span>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {selectedUsers.length > 0 && (
                <div className="p-4 bg-blue-50 border-t border-gray-200">
                  <p className="text-sm font-medium text-blue-900">
                    {selectedUsers.length} user{selectedUsers.length !== 1 ? 's' : ''} selected
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Notification Composer */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                  <Icon name="Edit3" size={20} />
                  <span>Compose Notification</span>
                </h3>
              </div>

              <div className="p-6 space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Notification Type
                    </label>
                    <select
                      value={notificationForm.type}
                      onChange={(e) => setNotificationForm(prev => ({ ...prev, type: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {notificationTypes.types.map(type => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Priority
                    </label>
                    <select
                      value={notificationForm.priority}
                      onChange={(e) => setNotificationForm(prev => ({ ...prev, priority: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {notificationTypes.priorities.map(priority => (
                        <option key={priority.value} value={priority.value}>{priority.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category
                    </label>
                    <select
                      value={notificationForm.category}
                      onChange={(e) => setNotificationForm(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {categories.map(category => (
                        <option key={category.value} value={category.value}>{category.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={notificationForm.title}
                    onChange={(e) => setNotificationForm(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter notification title..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Message */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={4}
                    value={notificationForm.message}
                    onChange={(e) => setNotificationForm(prev => ({ ...prev, message: e.target.value }))}
                    placeholder="Enter your notification message..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tags (Optional)
                  </label>
                  <div className="space-y-3">
                    {/* Current Tags */}
                    {notificationForm.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {notificationForm.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                          >
                            #{tag}
                            <button
                              type="button"
                              onClick={() => removeTag(tag)}
                              className="ml-2 text-blue-600 hover:text-blue-800"
                            >
                              <Icon name="X" size={14} />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                    
                    {/* Tag Input */}
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyPress={handleTagInputKeyPress}
                        placeholder="Add a tag..."
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <button
                        type="button"
                        onClick={() => addTag(tagInput.trim())}
                        disabled={!tagInput.trim()}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Add
                      </button>
                    </div>
                    
                    {/* Suggested Tags */}
                    <div>
                      <p className="text-xs text-gray-500 mb-2">Suggested tags:</p>
                      <div className="flex flex-wrap gap-1">
                        {suggestedTags
                          .filter(tag => !notificationForm.tags.includes(tag))
                          .slice(0, 8)
                          .map(tag => (
                            <button
                              key={tag}
                              type="button"
                              onClick={() => addTag(tag)}
                              className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                            >
                              #{tag}
                            </button>
                          ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Advanced Options */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Icon
                    </label>
                    <select
                      value={notificationForm.icon}
                      onChange={(e) => setNotificationForm(prev => ({ ...prev, icon: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {notificationTypes.icons.map(icon => (
                        <option key={icon} value={icon}>{icon}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Action URL (Optional)
                    </label>
                    <input
                      type="url"
                      value={notificationForm.action_url}
                      onChange={(e) => setNotificationForm(prev => ({ ...prev, action_url: e.target.value }))}
                      placeholder="/path/to/action"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Action Label (Optional)
                    </label>
                    <input
                      type="text"
                      value={notificationForm.action_label}
                      onChange={(e) => setNotificationForm(prev => ({ ...prev, action_label: e.target.value }))}
                      placeholder="View Details"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Expires In (Hours)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="720"
                    value={notificationForm.expires_in_hours}
                    onChange={(e) => setNotificationForm(prev => ({ ...prev, expires_in_hours: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Preview */}
                <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Preview</h4>
                  <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                    <div className="flex items-start space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getTypeColor(notificationForm.type)}`}>
                        <Icon name={notificationForm.icon} size={16} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h5 className="font-medium text-gray-900">
                            {notificationForm.title || 'Notification Title'}
                          </h5>
                          <div className="flex items-center space-x-2">
                            <span className={`text-xs px-2 py-1 rounded-full ${getCategoryColor(notificationForm.category)}`}>
                              {categories.find(cat => cat.value === notificationForm.category)?.label || 'General'}
                            </span>
                            <span className={`text-xs font-medium ${getPriorityColor(notificationForm.priority)}`}>
                              {notificationForm.priority}
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {notificationForm.message || 'Your notification message will appear here...'}
                        </p>
                        
                        {/* Tags in preview */}
                        {notificationForm.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {notificationForm.tags.map((tag, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-700"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}
                        
                        {notificationForm.action_label && (
                          <button className="mt-3 text-xs text-blue-600 hover:text-blue-800 font-medium">
                            {notificationForm.action_label}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Send Button */}
                <div className="flex justify-end">
                  <Button
                    onClick={sendNotification}
                    disabled={sending || selectedUsers.length === 0 || !notificationForm.title || !notificationForm.message}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    {sending ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Sending...
                      </>
                    ) : (
                      <>
                        <Icon name="Send" size={16} className="mr-2" />
                        Send to {selectedUsers.length} user{selectedUsers.length !== 1 ? 's' : ''}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationCenter;