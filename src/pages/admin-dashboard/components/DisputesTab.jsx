import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const DisputesTab = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const disputes = [
    {
      id: "DSP-2025-001",
      title: "Product not as described",
      customer: "John Doe",
      shop: "TechHub Electronics",
      priority: "High",
      status: "Open",
      amount: "45,000 XAF",
      createdDate: "2025-01-15",
      lastUpdate: "2025-01-16",
      description: "Customer claims the smartphone received doesn't match the specifications listed on the product page.",
      customerAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face",
      shopAvatar: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=40&h=40&fit=crop"
    },
    {
      id: "DSP-2025-002",
      title: "Delivery delay compensation",
      customer: "Marie Dubois",
      shop: "Fashion Forward",
      priority: "Medium",
      status: "In Progress",
      amount: "12,000 XAF",
      createdDate: "2025-01-14",
      lastUpdate: "2025-01-16",
      description: "Customer requesting compensation for delayed delivery that caused inconvenience for a special event.",
      customerAvatar: "https://images.unsplash.com/photo-1494790108755-2616b332c3c7?w=40&h=40&fit=crop&crop=face",
      shopAvatar: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=40&h=40&fit=crop"
    },
    {
      id: "DSP-2025-003",
      title: "Damaged item received",
      customer: "David Wilson",
      shop: "Home & Garden Plus",
      priority: "High",
      status: "Resolved",
      amount: "78,000 XAF",
      createdDate: "2025-01-12",
      lastUpdate: "2025-01-15",
      description: "Garden furniture arrived with significant damage. Customer provided photos as evidence.",
      customerAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face",
      shopAvatar: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=40&h=40&fit=crop"
    },
    {
      id: "DSP-2025-004",
      title: "Refund request processing",
      customer: "Sarah Johnson",
      shop: "BookWorm Library",
      priority: "Low",
      status: "Open",
      amount: "25,000 XAF",
      createdDate: "2025-01-13",
      lastUpdate: "2025-01-14",
      description: "Customer wants to return books due to duplicate purchase. Requesting full refund.",
      customerAvatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face",
      shopAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop"
    }
  ];

  const priorityOptions = [
    { value: 'all', label: 'All Priorities' },
    { value: 'high', label: 'High Priority' },
    { value: 'medium', label: 'Medium Priority' },
    { value: 'low', label: 'Low Priority' }
  ];

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'open', label: 'Open' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'resolved', label: 'Resolved' },
    { value: 'closed', label: 'Closed' }
  ];

  const filteredDisputes = disputes.filter(dispute => {
    const matchesSearch = dispute.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         dispute.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         dispute.shop.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPriority = priorityFilter === 'all' || dispute.priority.toLowerCase() === priorityFilter;
    const matchesStatus = statusFilter === 'all' || dispute.status.toLowerCase().replace(' ', '_') === statusFilter;
    return matchesSearch && matchesPriority && matchesStatus;
  });

  const getPriorityColor = (priority) => {
    switch (priority.toLowerCase()) {
      case 'high': return 'text-error bg-error/10';
      case 'medium': return 'text-warning bg-warning/10';
      case 'low': return 'text-success bg-success/10';
      default: return 'text-text-secondary bg-muted';
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'open': return 'text-error bg-error/10';
      case 'in progress': return 'text-warning bg-warning/10';
      case 'resolved': return 'text-success bg-success/10';
      case 'closed': return 'text-text-secondary bg-muted';
      default: return 'text-text-secondary bg-muted';
    }
  };

  const handleResolveDispute = (disputeId) => {
    console.log('Resolving dispute:', disputeId);
  };

  const handleAssignDispute = (disputeId) => {
    console.log('Assigning dispute:', disputeId);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-text-primary">Dispute Resolution</h2>
          <p className="text-text-secondary">Manage customer disputes and resolutions</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" iconName="Download" iconPosition="left">
            Export Report
          </Button>
          <Button variant="default" iconName="MessageSquare" iconPosition="left">
            Contact Support
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-card rounded-lg border border-border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-secondary text-sm">Total Disputes</p>
              <p className="text-2xl font-bold text-text-primary">156</p>
            </div>
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <Icon name="AlertTriangle" size={24} className="text-primary" />
            </div>
          </div>
          <div className="flex items-center mt-4 text-sm">
            <Icon name="TrendingDown" size={16} className="text-success mr-1" />
            <span className="text-success">-5%</span>
            <span className="text-text-secondary ml-1">from last month</span>
          </div>
        </div>

        <div className="bg-card rounded-lg border border-border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-secondary text-sm">Open Cases</p>
              <p className="text-2xl font-bold text-text-primary">23</p>
            </div>
            <div className="w-12 h-12 bg-error/10 rounded-lg flex items-center justify-center">
              <Icon name="Clock" size={24} className="text-error" />
            </div>
          </div>
          <div className="flex items-center mt-4 text-sm">
            <Icon name="AlertCircle" size={16} className="text-error mr-1" />
            <span className="text-error">Requires attention</span>
          </div>
        </div>

        <div className="bg-card rounded-lg border border-border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-secondary text-sm">Resolved Today</p>
              <p className="text-2xl font-bold text-text-primary">8</p>
            </div>
            <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center">
              <Icon name="CheckCircle" size={24} className="text-success" />
            </div>
          </div>
          <div className="flex items-center mt-4 text-sm">
            <Icon name="TrendingUp" size={16} className="text-success mr-1" />
            <span className="text-success">+12%</span>
            <span className="text-text-secondary ml-1">resolution rate</span>
          </div>
        </div>

        <div className="bg-card rounded-lg border border-border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-secondary text-sm">Avg Resolution</p>
              <p className="text-2xl font-bold text-text-primary">2.4</p>
            </div>
            <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
              <Icon name="Timer" size={24} className="text-accent" />
            </div>
          </div>
          <div className="flex items-center mt-4 text-sm">
            <span className="text-text-secondary">days to resolve</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card rounded-lg border border-border p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            type="search"
            placeholder="Search disputes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
          <Select
            placeholder="Filter by priority"
            options={priorityOptions}
            value={priorityFilter}
            onChange={setPriorityFilter}
          />
          <Select
            placeholder="Filter by status"
            options={statusOptions}
            value={statusFilter}
            onChange={setStatusFilter}
          />
        </div>
      </div>

      {/* Disputes List */}
      <div className="space-y-4">
        {filteredDisputes.map((dispute) => (
          <div key={dispute.id} className="bg-card rounded-lg border border-border p-6 hover:shadow-moderate transition-shadow">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-text-primary text-lg">{dispute.title}</h3>
                    <p className="text-sm text-text-secondary">Case ID: {dispute.id}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(dispute.priority)}`}>
                      {dispute.priority} Priority
                    </span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(dispute.status)}`}>
                      {dispute.status}
                    </span>
                  </div>
                </div>

                <p className="text-text-secondary mb-4">{dispute.description}</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center space-x-3">
                    <img
                      src={dispute.customerAvatar}
                      alt={dispute.customer}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <div>
                      <p className="text-sm font-medium text-text-primary">Customer</p>
                      <p className="text-sm text-text-secondary">{dispute.customer}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <img
                      src={dispute.shopAvatar}
                      alt={dispute.shop}
                      className="w-8 h-8 rounded-lg object-cover"
                    />
                    <div>
                      <p className="text-sm font-medium text-text-primary">Shop</p>
                      <p className="text-sm text-text-secondary">{dispute.shop}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm text-text-secondary">
                  <div className="flex items-center space-x-4">
                    <span>Amount: <span className="font-medium text-text-primary">{dispute.amount}</span></span>
                    <span>Created: {dispute.createdDate}</span>
                    <span>Updated: {dispute.lastUpdate}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2 lg:flex-col lg:space-x-0 lg:space-y-2">
                <Button variant="outline" size="sm" iconName="MessageSquare">
                  Chat
                </Button>
                <Button variant="outline" size="sm" iconName="Eye">
                  View Details
                </Button>
                {dispute.status === 'Open' && (
                  <Button 
                    variant="default" 
                    size="sm" 
                    iconName="UserCheck"
                    onClick={() => handleAssignDispute(dispute.id)}
                  >
                    Assign
                  </Button>
                )}
                {dispute.status === 'In Progress' && (
                  <Button 
                    variant="success" 
                    size="sm" 
                    iconName="Check"
                    onClick={() => handleResolveDispute(dispute.id)}
                  >
                    Resolve
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DisputesTab;