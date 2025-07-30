import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';

const EarningsTab = () => {
  const [timeRange, setTimeRange] = useState('30d');
  
  // Check if user is new (no transactions/earnings)
  const isNewUser = () => {
    // In a real implementation, this would check actual earnings data from API
    // For now, we can assume new users have no completed transactions
    const completedTransactions = transactions.filter(t => t.status === 'completed' && t.type === 'sale');
    return completedTransactions.length === 0;
  };

  const timeRangeOptions = [
    { value: '7d', label: 'Last 7 days' },
    { value: '30d', label: 'Last 30 days' },
    { value: '90d', label: 'Last 3 months' },
    { value: '1y', label: 'Last year' }
  ];

  const earningsData = [
    { name: 'Week 1', gross: 450000, commission: 45000, net: 405000 },
    { name: 'Week 2', gross: 520000, commission: 52000, net: 468000 },
    { name: 'Week 3', gross: 380000, commission: 38000, net: 342000 },
    { name: 'Week 4', gross: 620000, commission: 62000, net: 558000 }
  ];

  const monthlyEarnings = [
    { month: 'Jan', earnings: 1250000 },
    { month: 'Feb', earnings: 1450000 },
    { month: 'Mar', earnings: 1320000 },
    { month: 'Apr', earnings: 1680000 },
    { month: 'May', earnings: 1890000 },
    { month: 'Jun', earnings: 1773000 }
  ];

  const transactions = [
    {
      id: "TXN-2025-001",
      type: "sale",
      description: "Order #ORD-2025-001 - Premium Wireless Headphones",
      amount: 45000,
      commission: 4500,
      net: 40500,
      date: "2025-01-16T10:30:00",
      status: "completed"
    },
    {
      id: "TXN-2025-002",
      type: "sale",
      description: "Order #ORD-2025-002 - Organic Cotton T-Shirt (x3)",
      amount: 25500,
      commission: 2550,
      net: 22950,
      date: "2025-01-16T09:15:00",
      status: "completed"
    },
    {
      id: "TXN-2025-003",
      type: "payout",
      description: "Weekly payout to MTN MoMo",
      amount: 125000,
      commission: 0,
      net: 125000,
      date: "2025-01-15T14:20:00",
      status: "completed"
    },
    {
      id: "TXN-2025-004",
      type: "refund",
      description: "Refund for Order #ORD-2025-005",
      amount: -18500,
      commission: 1850,
      net: -16650,
      date: "2025-01-15T11:30:00",
      status: "completed"
    },
    {
      id: "TXN-2025-005",
      type: "sale",
      description: "Order #ORD-2025-003 - Artisan Coffee Beans (x2)",
      amount: 24000,
      commission: 2400,
      net: 21600,
      date: "2025-01-14T16:45:00",
      status: "pending"
    }
  ];

  const payoutMethods = [
    {
      id: 1,
      type: "MTN MoMo",
      account: "***-***-6789",
      isDefault: true,
      icon: "Smartphone"
    },
    {
      id: 2,
      type: "Orange Money",
      account: "***-***-1234",
      isDefault: false,
      icon: "Smartphone"
    },
    {
      id: 3,
      type: "Bank Transfer",
      account: "***-***-5678",
      isDefault: false,
      icon: "CreditCard"
    }
  ];

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'sale':
        return { icon: 'ArrowUp', color: 'text-success' };
      case 'refund':
        return { icon: 'ArrowDown', color: 'text-destructive' };
      case 'payout':
        return { icon: 'ArrowRight', color: 'text-primary' };
      default:
        return { icon: 'Circle', color: 'text-text-secondary' };
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      completed: { label: 'Completed', color: 'text-success bg-success/10' },
      pending: { label: 'Pending', color: 'text-warning bg-warning/10' },
      failed: { label: 'Failed', color: 'text-destructive bg-destructive/10' }
    };

    const config = statusConfig[status] || { label: status, color: 'text-text-secondary bg-muted' };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getEarningsCards = () => {
    const newUser = isNewUser();
    
    return [
      {
        title: 'Total Earnings',
        value: newUser ? '0 XAF' : '1,773,000 XAF',
        change: newUser ? 'No data yet' : '+15.3%',
        changeType: newUser ? 'neutral' : 'positive',
        icon: 'DollarSign',
        color: 'text-success',
        bgColor: 'bg-success/10'
      },
      {
        title: 'Pending Payouts',
        value: newUser ? '0 XAF' : '125,400 XAF',
        change: newUser ? 'No data yet' : '+8.2%',
        changeType: newUser ? 'neutral' : 'positive',
        icon: 'Clock',
        color: 'text-warning',
        bgColor: 'bg-warning/10'
      },
      {
        title: 'Commission Paid',
        value: newUser ? '0 XAF' : '177,300 XAF',
        change: newUser ? 'No data yet' : '+12.1%',
        changeType: newUser ? 'neutral' : 'positive',
        icon: 'Percent',
        color: 'text-primary',
        bgColor: 'bg-primary/10'
      },
      {
        title: 'Net Profit',
        value: newUser ? '0 XAF' : '1,595,700 XAF',
        change: newUser ? 'No data yet' : '+18.7%',
        changeType: newUser ? 'neutral' : 'positive',
        icon: 'TrendingUp',
        color: 'text-success',
        bgColor: 'bg-success/10'
      }
    ];
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-text-primary">Earnings Overview</h2>
          <p className="text-text-secondary">Track your revenue and payouts</p>
        </div>
        <div className="flex items-center space-x-3">
          <Select
            options={timeRangeOptions}
            value={timeRange}
            onChange={setTimeRange}
            className="w-40"
          />
          <Button variant="default" iconName="CreditCard" iconPosition="left">
            Request Payout
          </Button>
        </div>
      </div>

      {/* Earnings Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        {getEarningsCards().map((card, index) => (
          <div key={index} className="bg-surface border border-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 ${card.bgColor} rounded-lg flex items-center justify-center`}>
                <Icon name={card.icon} size={24} className={card.color} />
              </div>
              <div className={`flex items-center space-x-1 text-sm ${
                card.changeType === 'positive' ? 'text-success' : 
                card.changeType === 'negative' ? 'text-destructive' : 'text-gray-500'
              }`}>
                <Icon 
                  name={
                    card.changeType === 'positive' ? 'ArrowUp' : 
                    card.changeType === 'negative' ? 'ArrowDown' : 'Minus'
                  } 
                  size={16} 
                />
                <span>{card.change}</span>
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-text-primary mb-1">{card.value}</h3>
              <p className="text-text-secondary text-sm">{card.title}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
        {/* Earnings Breakdown */}
        <div className="bg-surface border border-border rounded-xl p-6">
          <h3 className="text-lg font-semibold text-text-primary mb-6">Earnings Breakdown</h3>
          <div className="w-full h-80" aria-label="Earnings Breakdown Chart">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={earningsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="name" stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <Tooltip 
                  formatter={(value) => [`${value.toLocaleString()} XAF`, '']}
                  contentStyle={{ 
                    backgroundColor: '#FFFFFF', 
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="gross" fill="#1E40AF" name="Gross Revenue" />
                <Bar dataKey="commission" fill="#EF4444" name="Commission" />
                <Bar dataKey="net" fill="#10B981" name="Net Earnings" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly Trend */}
        <div className="bg-surface border border-border rounded-xl p-6">
          <h3 className="text-lg font-semibold text-text-primary mb-6">Monthly Earnings Trend</h3>
          <div className="w-full h-80" aria-label="Monthly Earnings Trend Chart">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyEarnings}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="month" stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <Tooltip 
                  formatter={(value) => [`${value.toLocaleString()} XAF`, 'Earnings']}
                  contentStyle={{ 
                    backgroundColor: '#FFFFFF', 
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="earnings" 
                  stroke="#1E40AF" 
                  strokeWidth={3}
                  dot={{ fill: '#1E40AF', strokeWidth: 2, r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Payout Methods */}
      <div className="bg-surface border border-border rounded-xl p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-text-primary">Payout Methods</h3>
          <Button variant="outline" iconName="Plus" iconPosition="left">
            Add Method
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {payoutMethods.map((method) => (
            <div key={method.id} className={`p-4 rounded-lg border-2 transition-colors ${
              method.isDefault 
                ? 'border-primary bg-primary/5' :'border-border hover:border-primary/50'
            }`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    method.isDefault ? 'bg-primary text-primary-foreground' : 'bg-muted text-text-secondary'
                  }`}>
                    <Icon name={method.icon} size={20} />
                  </div>
                  <div>
                    <h4 className="font-medium text-text-primary">{method.type}</h4>
                    <p className="text-sm text-text-secondary">{method.account}</p>
                  </div>
                </div>
                {method.isDefault && (
                  <span className="px-2 py-1 bg-primary text-primary-foreground text-xs font-medium rounded-full">
                    Default
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" iconName="Edit" iconPosition="left">
                  Edit
                </Button>
                {!method.isDefault && (
                  <Button variant="ghost" size="sm">
                    Set Default
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Transaction History */}
      <div className="bg-surface border border-border rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-text-primary">Recent Transactions</h3>
          <Button variant="outline" size="sm" iconName="ArrowRight" iconPosition="right">
            View All
          </Button>
        </div>
        <div className="space-y-4">
          {transactions.map((transaction) => {
            const iconConfig = getTransactionIcon(transaction.type);
            return (
              <div key={transaction.id} className="flex items-center space-x-4 p-4 rounded-lg hover:bg-muted/50 transition-colors">
                <div className={`w-10 h-10 rounded-lg bg-muted flex items-center justify-center`}>
                  <Icon name={iconConfig.icon} size={20} className={iconConfig.color} />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-text-primary truncate">{transaction.description}</h4>
                  <div className="flex items-center space-x-4 mt-1">
                    <p className="text-sm text-text-secondary">{transaction.id}</p>
                    <p className="text-sm text-text-secondary">{formatDate(transaction.date)}</p>
                    {getStatusBadge(transaction.status)}
                  </div>
                </div>
                <div className="text-right">
                  <div className={`font-semibold ${
                    transaction.amount > 0 ? 'text-success' : 'text-destructive'
                  }`}>
                    {transaction.amount > 0 ? '+' : ''}{transaction.amount.toLocaleString()} XAF
                  </div>
                  {transaction.commission > 0 && (
                    <div className="text-sm text-text-secondary">
                      Commission: {transaction.commission.toLocaleString()} XAF
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default EarningsTab;