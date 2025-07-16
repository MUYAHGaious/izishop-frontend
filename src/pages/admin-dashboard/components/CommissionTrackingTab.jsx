import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const CommissionTrackingTab = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [timeRange, setTimeRange] = useState('30d');

  const commissionData = [
    { month: 'Jan', commission: 1250000, transactions: 2340 },
    { month: 'Feb', commission: 1420000, transactions: 2680 },
    { month: 'Mar', commission: 1680000, transactions: 3120 },
    { month: 'Apr', commission: 1540000, transactions: 2890 },
    { month: 'May', commission: 1890000, transactions: 3450 },
    { month: 'Jun', commission: 2150000, transactions: 3890 },
    { month: 'Jul', commission: 1980000, transactions: 3560 }
  ];

  const payouts = [
    {
      id: "PAY-2025-001",
      shop: "TechHub Electronics",
      owner: "Marie Dubois",
      amount: "245,000 XAF",
      commission: "24,500 XAF",
      status: "Completed",
      date: "2025-01-15",
      transactionId: "TXN-789456123",
      avatar: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=40&h=40&fit=crop"
    },
    {
      id: "PAY-2025-002",
      shop: "Fashion Forward",
      owner: "Sarah Johnson",
      amount: "156,000 XAF",
      commission: "15,600 XAF",
      status: "Pending",
      date: "2025-01-16",
      transactionId: "TXN-789456124",
      avatar: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=40&h=40&fit=crop"
    },
    {
      id: "PAY-2025-003",
      shop: "Home & Garden Plus",
      owner: "Michael Brown",
      amount: "389,000 XAF",
      commission: "38,900 XAF",
      status: "Processing",
      date: "2025-01-16",
      transactionId: "TXN-789456125",
      avatar: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=40&h=40&fit=crop"
    },
    {
      id: "PAY-2025-004",
      shop: "BookWorm Library",
      owner: "David Wilson",
      amount: "78,000 XAF",
      commission: "7,800 XAF",
      status: "Failed",
      date: "2025-01-14",
      transactionId: "TXN-789456126",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop"
    }
  ];

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'completed', label: 'Completed' },
    { value: 'pending', label: 'Pending' },
    { value: 'processing', label: 'Processing' },
    { value: 'failed', label: 'Failed' }
  ];

  const timeRangeOptions = [
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
    { value: '90d', label: 'Last 3 Months' },
    { value: '1y', label: 'Last Year' }
  ];

  const filteredPayouts = payouts.filter(payout => {
    const matchesSearch = payout.shop.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         payout.owner.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || payout.status.toLowerCase() === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'completed': return 'text-success bg-success/10';
      case 'pending': return 'text-warning bg-warning/10';
      case 'processing': return 'text-primary bg-primary/10';
      case 'failed': return 'text-error bg-error/10';
      default: return 'text-text-secondary bg-muted';
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('fr-CM', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0
    }).format(value);
  };

  const handleProcessPayout = (payoutId) => {
    console.log('Processing payout:', payoutId);
  };

  const handleRetryPayout = (payoutId) => {
    console.log('Retrying payout:', payoutId);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-text-primary">Commission Tracking</h2>
          <p className="text-text-secondary">Monitor earnings and payout schedules</p>
        </div>
        <div className="flex items-center gap-3">
          <Select
            options={timeRangeOptions}
            value={timeRange}
            onChange={setTimeRange}
            className="w-40"
          />
          <Button variant="outline" iconName="Download" iconPosition="left">
            Export Report
          </Button>
          <Button variant="default" iconName="DollarSign" iconPosition="left">
            Process Payouts
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-card rounded-lg border border-border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-secondary text-sm">Total Commission</p>
              <p className="text-2xl font-bold text-text-primary">12.4M XAF</p>
            </div>
            <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center">
              <Icon name="DollarSign" size={24} className="text-success" />
            </div>
          </div>
          <div className="flex items-center mt-4 text-sm">
            <Icon name="TrendingUp" size={16} className="text-success mr-1" />
            <span className="text-success">+15.2%</span>
            <span className="text-text-secondary ml-1">from last month</span>
          </div>
        </div>

        <div className="bg-card rounded-lg border border-border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-secondary text-sm">Pending Payouts</p>
              <p className="text-2xl font-bold text-text-primary">2.8M XAF</p>
            </div>
            <div className="w-12 h-12 bg-warning/10 rounded-lg flex items-center justify-center">
              <Icon name="Clock" size={24} className="text-warning" />
            </div>
          </div>
          <div className="flex items-center mt-4 text-sm">
            <Icon name="AlertCircle" size={16} className="text-warning mr-1" />
            <span className="text-warning">23 shops waiting</span>
          </div>
        </div>

        <div className="bg-card rounded-lg border border-border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-secondary text-sm">Avg Commission Rate</p>
              <p className="text-2xl font-bold text-text-primary">8.5%</p>
            </div>
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <Icon name="Percent" size={24} className="text-primary" />
            </div>
          </div>
          <div className="flex items-center mt-4 text-sm">
            <Icon name="TrendingUp" size={16} className="text-success mr-1" />
            <span className="text-success">+0.3%</span>
            <span className="text-text-secondary ml-1">from last month</span>
          </div>
        </div>

        <div className="bg-card rounded-lg border border-border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-secondary text-sm">Monthly Growth</p>
              <p className="text-2xl font-bold text-text-primary">18.2%</p>
            </div>
            <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
              <Icon name="TrendingUp" size={24} className="text-accent" />
            </div>
          </div>
          <div className="flex items-center mt-4 text-sm">
            <span className="text-text-secondary">commission growth</span>
          </div>
        </div>
      </div>

      {/* Commission Chart */}
      <div className="bg-card rounded-lg border border-border p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-text-primary">Commission Trends</h3>
          <Button variant="ghost" size="sm" iconName="MoreHorizontal" />
        </div>
        <div className="w-full h-80" aria-label="Commission Trends Chart">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={commissionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="month" stroke="#6B7280" />
              <YAxis stroke="#6B7280" tickFormatter={(value) => `${value / 1000000}M`} />
              <Tooltip 
                formatter={(value, name) => [
                  name === 'commission' ? formatCurrency(value) : value,
                  name === 'commission' ? 'Commission' : 'Transactions'
                ]}
                labelStyle={{ color: '#1F2937' }}
                contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB' }}
              />
              <Bar dataKey="commission" fill="#1E40AF" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card rounded-lg border border-border p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            type="search"
            placeholder="Search shops or owners..."
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
        </div>
      </div>

      {/* Payouts Table */}
      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h3 className="text-lg font-semibold text-text-primary">Recent Payouts</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted border-b border-border">
              <tr>
                <th className="text-left p-4 font-semibold text-text-primary">Shop</th>
                <th className="text-left p-4 font-semibold text-text-primary">Amount</th>
                <th className="text-left p-4 font-semibold text-text-primary">Commission</th>
                <th className="text-left p-4 font-semibold text-text-primary">Status</th>
                <th className="text-left p-4 font-semibold text-text-primary">Date</th>
                <th className="text-left p-4 font-semibold text-text-primary">Transaction ID</th>
                <th className="text-left p-4 font-semibold text-text-primary">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayouts.map((payout) => (
                <tr key={payout.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center space-x-3">
                      <img
                        src={payout.avatar}
                        alt={payout.shop}
                        className="w-10 h-10 rounded-lg object-cover"
                      />
                      <div>
                        <div className="font-medium text-text-primary">{payout.shop}</div>
                        <div className="text-sm text-text-secondary">{payout.owner}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-text-primary font-medium">{payout.amount}</td>
                  <td className="p-4 text-text-primary font-medium">{payout.commission}</td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(payout.status)}`}>
                      {payout.status}
                    </span>
                  </td>
                  <td className="p-4 text-text-secondary">{payout.date}</td>
                  <td className="p-4 text-text-secondary font-mono text-sm">{payout.transactionId}</td>
                  <td className="p-4">
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm" iconName="Eye">
                        View
                      </Button>
                      {payout.status === 'Pending' && (
                        <Button 
                          variant="default" 
                          size="sm" 
                          iconName="Play"
                          onClick={() => handleProcessPayout(payout.id)}
                        >
                          Process
                        </Button>
                      )}
                      {payout.status === 'Failed' && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          iconName="RotateCcw"
                          onClick={() => handleRetryPayout(payout.id)}
                        >
                          Retry
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Commission Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-lg border border-border p-6">
          <h3 className="text-lg font-semibold text-text-primary mb-4">Top Earning Categories</h3>
          <div className="space-y-4">
            {[
              { category: 'Electronics', commission: '3.2M XAF', percentage: 85 },
              { category: 'Fashion', commission: '2.8M XAF', percentage: 72 },
              { category: 'Home & Garden', commission: '1.9M XAF', percentage: 58 },
              { category: 'Books', commission: '1.2M XAF', percentage: 42 },
              { category: 'Sports', commission: '0.8M XAF', percentage: 28 }
            ].map((item, index) => (
              <div key={item.category} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-semibold text-sm">
                    {index + 1}
                  </div>
                  <span className="font-medium text-text-primary">{item.category}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-text-primary font-medium">{item.commission}</span>
                  <div className="w-20 bg-border rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full" 
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card rounded-lg border border-border p-6">
          <h3 className="text-lg font-semibold text-text-primary mb-4">Payout Schedule</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
                  <Icon name="Calendar" size={20} className="text-success" />
                </div>
                <div>
                  <p className="font-medium text-text-primary">Next Payout</p>
                  <p className="text-sm text-text-secondary">January 20, 2025</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-text-primary">2.8M XAF</p>
                <p className="text-sm text-text-secondary">23 shops</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-warning/10 rounded-lg flex items-center justify-center">
                  <Icon name="Clock" size={20} className="text-warning" />
                </div>
                <div>
                  <p className="font-medium text-text-primary">Processing</p>
                  <p className="text-sm text-text-secondary">In progress</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-text-primary">1.2M XAF</p>
                <p className="text-sm text-text-secondary">8 shops</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Icon name="CheckCircle" size={20} className="text-primary" />
                </div>
                <div>
                  <p className="font-medium text-text-primary">Last Payout</p>
                  <p className="text-sm text-text-secondary">January 15, 2025</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-text-primary">3.4M XAF</p>
                <p className="text-sm text-text-secondary">31 shops</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommissionTrackingTab;