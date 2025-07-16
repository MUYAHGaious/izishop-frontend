import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const ShopOversightTab = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const shops = [
    {
      id: 1,
      name: "TechHub Electronics",
      owner: "Marie Dubois",
      email: "marie@techhub.cm",
      status: "Active",
      category: "Electronics",
      products: 245,
      orders: 1234,
      revenue: "15,450,000 XAF",
      rating: 4.8,
      joinDate: "2024-01-15",
      lastActivity: "2025-01-16",
      image: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=80&h=80&fit=crop"
    },
    {
      id: 2,
      name: "Fashion Forward",
      owner: "Sarah Johnson",
      email: "sarah@fashionforward.cm",
      status: "Pending",
      category: "Fashion",
      products: 89,
      orders: 156,
      revenue: "2,340,000 XAF",
      rating: 4.2,
      joinDate: "2025-01-10",
      lastActivity: "2025-01-15",
      image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=80&h=80&fit=crop"
    },
    {
      id: 3,
      name: "Home & Garden Plus",
      owner: "Michael Brown",
      email: "michael@homegardenplus.cm",
      status: "Suspended",
      category: "Home & Garden",
      products: 156,
      orders: 567,
      revenue: "8,920,000 XAF",
      rating: 3.9,
      joinDate: "2024-03-22",
      lastActivity: "2025-01-12",
      image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=80&h=80&fit=crop"
    },
    {
      id: 4,
      name: "BookWorm Library",
      owner: "David Wilson",
      email: "david@bookworm.cm",
      status: "Active",
      category: "Books",
      products: 1200,
      orders: 890,
      revenue: "5,670,000 XAF",
      rating: 4.6,
      joinDate: "2024-02-08",
      lastActivity: "2025-01-16",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop"
    }
  ];

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'pending', label: 'Pending Review' },
    { value: 'suspended', label: 'Suspended' }
  ];

  const categoryOptions = [
    { value: 'all', label: 'All Categories' },
    { value: 'electronics', label: 'Electronics' },
    { value: 'fashion', label: 'Fashion' },
    { value: 'home_garden', label: 'Home & Garden' },
    { value: 'books', label: 'Books' }
  ];

  const filteredShops = shops.filter(shop => {
    const matchesSearch = shop.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         shop.owner.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || shop.status.toLowerCase() === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'active': return 'text-success bg-success/10';
      case 'pending': return 'text-warning bg-warning/10';
      case 'suspended': return 'text-error bg-error/10';
      default: return 'text-text-secondary bg-muted';
    }
  };

  const handleApproveShop = (shopId) => {
    console.log('Approving shop:', shopId);
  };

  const handleSuspendShop = (shopId) => {
    console.log('Suspending shop:', shopId);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-text-primary">Shop Oversight</h2>
          <p className="text-text-secondary">Monitor and manage shop performance</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" iconName="Download" iconPosition="left">
            Export Report
          </Button>
          <Button variant="default" iconName="Plus" iconPosition="left">
            Add Shop
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-card rounded-lg border border-border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-secondary text-sm">Total Shops</p>
              <p className="text-2xl font-bold text-text-primary">1,247</p>
            </div>
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <Icon name="Store" size={24} className="text-primary" />
            </div>
          </div>
          <div className="flex items-center mt-4 text-sm">
            <Icon name="TrendingUp" size={16} className="text-success mr-1" />
            <span className="text-success">+12%</span>
            <span className="text-text-secondary ml-1">from last month</span>
          </div>
        </div>

        <div className="bg-card rounded-lg border border-border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-secondary text-sm">Pending Approval</p>
              <p className="text-2xl font-bold text-text-primary">23</p>
            </div>
            <div className="w-12 h-12 bg-warning/10 rounded-lg flex items-center justify-center">
              <Icon name="Clock" size={24} className="text-warning" />
            </div>
          </div>
          <div className="flex items-center mt-4 text-sm">
            <Icon name="AlertCircle" size={16} className="text-warning mr-1" />
            <span className="text-warning">Requires attention</span>
          </div>
        </div>

        <div className="bg-card rounded-lg border border-border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-secondary text-sm">Active Shops</p>
              <p className="text-2xl font-bold text-text-primary">1,198</p>
            </div>
            <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center">
              <Icon name="CheckCircle" size={24} className="text-success" />
            </div>
          </div>
          <div className="flex items-center mt-4 text-sm">
            <Icon name="TrendingUp" size={16} className="text-success mr-1" />
            <span className="text-success">96.1%</span>
            <span className="text-text-secondary ml-1">approval rate</span>
          </div>
        </div>

        <div className="bg-card rounded-lg border border-border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-secondary text-sm">Suspended</p>
              <p className="text-2xl font-bold text-text-primary">26</p>
            </div>
            <div className="w-12 h-12 bg-error/10 rounded-lg flex items-center justify-center">
              <Icon name="XCircle" size={24} className="text-error" />
            </div>
          </div>
          <div className="flex items-center mt-4 text-sm">
            <Icon name="TrendingDown" size={16} className="text-error mr-1" />
            <span className="text-error">-8%</span>
            <span className="text-text-secondary ml-1">from last month</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card rounded-lg border border-border p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            type="search"
            placeholder="Search shops..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
          <Select
            placeholder="Filter by status"
            options={statusOptions}
            value={statusFilter}
            onChange={setStatusFilter}
          />
          <Select
            placeholder="Filter by category"
            options={categoryOptions}
            value="all"
            onChange={() => {}}
          />
        </div>
      </div>

      {/* Shops Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredShops.map((shop) => (
          <div key={shop.id} className="bg-card rounded-lg border border-border p-6 hover:shadow-moderate transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <img
                  src={shop.image}
                  alt={shop.name}
                  className="w-12 h-12 rounded-lg object-cover"
                />
                <div>
                  <h3 className="font-semibold text-text-primary">{shop.name}</h3>
                  <p className="text-sm text-text-secondary">{shop.owner}</p>
                </div>
              </div>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(shop.status)}`}>
                {shop.status}
              </span>
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-text-secondary">Category:</span>
                <span className="text-text-primary font-medium">{shop.category}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-text-secondary">Products:</span>
                <span className="text-text-primary font-medium">{shop.products}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-text-secondary">Orders:</span>
                <span className="text-text-primary font-medium">{shop.orders}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-text-secondary">Revenue:</span>
                <span className="text-text-primary font-medium">{shop.revenue}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-text-secondary">Rating:</span>
                <div className="flex items-center">
                  <Icon name="Star" size={16} className="text-accent fill-current mr-1" />
                  <span className="text-text-primary font-medium">{shop.rating}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-border">
              <div className="text-xs text-text-secondary">
                Joined {shop.joinDate}
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm" iconName="Eye">
                  View
                </Button>
                {shop.status === 'Pending' && (
                  <Button 
                    variant="default" 
                    size="sm" 
                    iconName="Check"
                    onClick={() => handleApproveShop(shop.id)}
                  >
                    Approve
                  </Button>
                )}
                {shop.status === 'Active' && (
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    iconName="Ban"
                    onClick={() => handleSuspendShop(shop.id)}
                  >
                    Suspend
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

export default ShopOversightTab;