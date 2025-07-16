import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const CommissionTracker = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('current');

  const commissionData = {
    current: {
      totalSales: 3450000,
      platformFee: 172500, // 5% commission
      netEarnings: 3277500,
      pendingPayout: 1250000,
      nextPayoutDate: '2025-01-20',
      transactionCount: 234
    },
    previous: {
      totalSales: 2890000,
      platformFee: 144500,
      netEarnings: 2745500,
      pendingPayout: 0,
      nextPayoutDate: '2025-01-05',
      transactionCount: 189
    }
  };

  const recentTransactions = [
    {
      id: 'TXN-2025-001',
      orderId: 'ORD-2025-001',
      amount: 45500,
      commission: 2275,
      netAmount: 43225,
      date: '2025-01-16',
      status: 'pending'
    },
    {
      id: 'TXN-2025-002',
      orderId: 'ORD-2025-002',
      amount: 12000,
      commission: 600,
      netAmount: 11400,
      date: '2025-01-16',
      status: 'processed'
    },
    {
      id: 'TXN-2025-003',
      orderId: 'ORD-2025-003',
      amount: 28750,
      commission: 1437,
      netAmount: 27313,
      date: '2025-01-15',
      status: 'processed'
    },
    {
      id: 'TXN-2025-004',
      orderId: 'ORD-2025-004',
      amount: 67200,
      commission: 3360,
      netAmount: 63840,
      date: '2025-01-15',
      status: 'paid'
    }
  ];

  const currentData = commissionData[selectedPeriod];

  const getStatusConfig = (status) => {
    switch (status) {
      case 'pending':
        return { color: 'text-warning', bg: 'bg-warning/10', label: 'Pending', icon: 'Clock' };
      case 'processed':
        return { color: 'text-primary', bg: 'bg-primary/10', label: 'Processed', icon: 'Package' };
      case 'paid':
        return { color: 'text-success', bg: 'bg-success/10', label: 'Paid', icon: 'CheckCircle' };
      default:
        return { color: 'text-muted-foreground', bg: 'bg-muted', label: 'Unknown', icon: 'AlertCircle' };
    }
  };

  const formatCurrency = (amount) => {
    return `${amount.toLocaleString()} XAF`;
  };

  const calculateCommissionRate = () => {
    return ((currentData.platformFee / currentData.totalSales) * 100).toFixed(1);
  };

  const handleRequestPayout = () => {
    console.log('Request payout');
  };

  const handleViewStatement = () => {
    console.log('View earnings statement');
  };

  return (
    <div className="bg-surface rounded-lg border border-border elevation-1">
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Icon name="DollarSign" size={20} className="text-success" />
            <h3 className="text-lg font-semibold text-foreground">Commission Tracker</h3>
          </div>
          
          <div className="flex items-center bg-muted rounded-lg p-1">
            <Button
              variant={selectedPeriod === 'current' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setSelectedPeriod('current')}
              className="text-xs"
            >
              Current Month
            </Button>
            <Button
              variant={selectedPeriod === 'previous' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setSelectedPeriod('previous')}
              className="text-xs"
            >
              Previous Month
            </Button>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Commission Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
            <div className="flex items-center space-x-2 mb-2">
              <Icon name="TrendingUp" size={16} className="text-primary" />
              <span className="text-sm font-medium text-primary">Total Sales</span>
            </div>
            <div className="text-xl font-bold text-foreground">
              {formatCurrency(currentData.totalSales)}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {currentData.transactionCount} transactions
            </div>
          </div>

          <div className="p-4 bg-warning/10 rounded-lg border border-warning/20">
            <div className="flex items-center space-x-2 mb-2">
              <Icon name="Percent" size={16} className="text-warning" />
              <span className="text-sm font-medium text-warning">Platform Fee</span>
            </div>
            <div className="text-xl font-bold text-foreground">
              {formatCurrency(currentData.platformFee)}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {calculateCommissionRate()}% commission rate
            </div>
          </div>

          <div className="p-4 bg-success/10 rounded-lg border border-success/20">
            <div className="flex items-center space-x-2 mb-2">
              <Icon name="Wallet" size={16} className="text-success" />
              <span className="text-sm font-medium text-success">Net Earnings</span>
            </div>
            <div className="text-xl font-bold text-foreground">
              {formatCurrency(currentData.netEarnings)}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              After platform fees
            </div>
          </div>

          <div className="p-4 bg-secondary/10 rounded-lg border border-secondary/20">
            <div className="flex items-center space-x-2 mb-2">
              <Icon name="Clock" size={16} className="text-secondary" />
              <span className="text-sm font-medium text-secondary">Pending Payout</span>
            </div>
            <div className="text-xl font-bold text-foreground">
              {formatCurrency(currentData.pendingPayout)}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Next: {currentData.nextPayoutDate}
            </div>
          </div>
        </div>

        {/* Payout Actions */}
        {currentData.pendingPayout > 0 && (
          <div className="mb-6 p-4 bg-accent/10 rounded-lg border border-accent/20">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-foreground mb-1">Payout Available</h4>
                <p className="text-sm text-muted-foreground">
                  You have {formatCurrency(currentData.pendingPayout)} ready for payout
                </p>
              </div>
              <Button
                variant="default"
                onClick={handleRequestPayout}
                iconName="Download"
                iconPosition="left"
                iconSize={16}
              >
                Request Payout
              </Button>
            </div>
          </div>
        )}

        {/* Recent Transactions */}
        <div className="mb-6">
          <h4 className="font-medium text-foreground mb-4">Recent Transactions</h4>
          
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-3 text-sm font-medium text-muted-foreground">Transaction</th>
                  <th className="text-left p-3 text-sm font-medium text-muted-foreground">Order</th>
                  <th className="text-left p-3 text-sm font-medium text-muted-foreground">Amount</th>
                  <th className="text-left p-3 text-sm font-medium text-muted-foreground">Commission</th>
                  <th className="text-left p-3 text-sm font-medium text-muted-foreground">Net Amount</th>
                  <th className="text-left p-3 text-sm font-medium text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentTransactions.map((transaction) => {
                  const statusConfig = getStatusConfig(transaction.status);
                  return (
                    <tr key={transaction.id} className="border-b border-border hover:bg-muted/30 transition-micro">
                      <td className="p-3">
                        <div>
                          <p className="font-medium text-foreground">{transaction.id}</p>
                          <p className="text-sm text-muted-foreground">{transaction.date}</p>
                        </div>
                      </td>
                      <td className="p-3">
                        <span className="text-primary font-medium">{transaction.orderId}</span>
                      </td>
                      <td className="p-3">
                        <span className="font-medium text-foreground">{formatCurrency(transaction.amount)}</span>
                      </td>
                      <td className="p-3">
                        <span className="text-warning font-medium">-{formatCurrency(transaction.commission)}</span>
                      </td>
                      <td className="p-3">
                        <span className="text-success font-semibold">{formatCurrency(transaction.netAmount)}</span>
                      </td>
                      <td className="p-3">
                        <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full ${statusConfig.bg}`}>
                          <Icon name={statusConfig.icon} size={14} className={statusConfig.color} />
                          <span className={`text-xs font-medium ${statusConfig.color}`}>
                            {statusConfig.label}
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            {recentTransactions.map((transaction) => {
              const statusConfig = getStatusConfig(transaction.status);
              return (
                <div key={transaction.id} className="border border-border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-medium text-foreground">{transaction.id}</p>
                      <p className="text-sm text-muted-foreground">{transaction.date}</p>
                    </div>
                    <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full ${statusConfig.bg}`}>
                      <Icon name={statusConfig.icon} size={14} className={statusConfig.color} />
                      <span className={`text-xs font-medium ${statusConfig.color}`}>
                        {statusConfig.label}
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Order:</span>
                      <span className="text-sm text-primary font-medium">{transaction.orderId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Amount:</span>
                      <span className="text-sm font-medium text-foreground">{formatCurrency(transaction.amount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Commission:</span>
                      <span className="text-sm text-warning font-medium">-{formatCurrency(transaction.commission)}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-border">
                      <span className="text-sm font-medium text-foreground">Net Amount:</span>
                      <span className="text-sm text-success font-semibold">{formatCurrency(transaction.netAmount)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            variant="outline"
            fullWidth
            onClick={handleViewStatement}
            iconName="FileText"
            iconPosition="left"
            iconSize={16}
          >
            View Statement
          </Button>
          <Button
            variant="secondary"
            fullWidth
            onClick={() => console.log('Export commission data')}
            iconName="Download"
            iconPosition="left"
            iconSize={16}
          >
            Export Data
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CommissionTracker;