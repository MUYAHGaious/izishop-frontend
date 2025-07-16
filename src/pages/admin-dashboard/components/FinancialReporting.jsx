import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const FinancialReporting = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  const financialStats = {
    totalRevenue: "125,847,000",
    commissionEarned: "8,750,000",
    pendingPayouts: "2,340,000",
    processedPayouts: "6,410,000",
    averageCommissionRate: "6.95%",
    topEarningShop: "TechStore Yaoundé"
  };

  const revenueBreakdown = [
    { category: "Electronics", amount: "45,230,000", percentage: 35.9, color: "bg-primary" },
    { category: "Fashion", amount: "32,150,000", percentage: 25.5, color: "bg-secondary" },
    { category: "Home & Garden", amount: "28,890,000", percentage: 22.9, color: "bg-success" },
    { category: "Sports", amount: "12,340,000", percentage: 9.8, color: "bg-warning" },
    { category: "Books", amount: "7,237,000", percentage: 5.9, color: "bg-accent" }
  ];

  const recentPayouts = [
    {
      id: "PAY-2025-001",
      shop: "TechStore Yaoundé",
      owner: "Jean Baptiste",
      amount: "450,000",
      commission: "31,500",
      method: "Bank Transfer",
      status: "Completed",
      date: "2025-01-15"
    },
    {
      id: "PAY-2025-002",
      shop: "Fashion Hub",
      owner: "Marie Claire",
      amount: "280,000",
      commission: "19,600",
      method: "MTN MoMo",
      status: "Processing",
      date: "2025-01-16"
    },
    {
      id: "PAY-2025-003",
      shop: "Electronics Plus",
      owner: "Paul Ngono",
      amount: "620,000",
      commission: "43,400",
      method: "Orange Money",
      status: "Pending",
      date: "2025-01-16"
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return 'text-success bg-success/10';
      case 'Processing': return 'text-primary bg-primary/10';
      case 'Pending': return 'text-warning bg-warning/10';
      case 'Failed': return 'text-error bg-error/10';
      default: return 'text-muted-foreground bg-muted/10';
    }
  };

  const getPaymentMethodIcon = (method) => {
    switch (method) {
      case 'Bank Transfer': return 'Building2';
      case 'MTN MoMo': return 'Smartphone';
      case 'Orange Money': return 'Phone';
      default: return 'DollarSign';
    }
  };

  const handleExportReport = () => {
    console.log('Exporting financial report...');
  };

  const handleProcessPayout = (payoutId) => {
    console.log(`Processing payout: ${payoutId}`);
  };

  return (
    <div className="bg-surface rounded-lg border border-border p-6 elevation-1">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-foreground">Financial Reporting</h2>
        <div className="flex items-center space-x-2">
          <Button 
            variant={selectedPeriod === 'week' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setSelectedPeriod('week')}
          >
            Week
          </Button>
          <Button 
            variant={selectedPeriod === 'month' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setSelectedPeriod('month')}
          >
            Month
          </Button>
          <Button 
            variant={selectedPeriod === 'year' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setSelectedPeriod('year')}
          >
            Year
          </Button>
          <Button variant="outline" size="sm" iconName="Download" onClick={handleExportReport}>
            Export
          </Button>
        </div>
      </div>

      {/* Financial Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="p-6 bg-success/10 rounded-lg border border-success/20">
          <div className="flex items-center justify-between mb-4">
            <Icon name="TrendingUp" size={24} className="text-success" />
            <span className="text-sm text-success">+18.5%</span>
          </div>
          <div className="text-2xl font-bold text-foreground mb-1">{financialStats.totalRevenue} XAF</div>
          <div className="text-sm text-muted-foreground">Total Revenue</div>
        </div>

        <div className="p-6 bg-primary/10 rounded-lg border border-primary/20">
          <div className="flex items-center justify-between mb-4">
            <Icon name="DollarSign" size={24} className="text-primary" />
            <span className="text-sm text-primary">{financialStats.averageCommissionRate}</span>
          </div>
          <div className="text-2xl font-bold text-foreground mb-1">{financialStats.commissionEarned} XAF</div>
          <div className="text-sm text-muted-foreground">Commission Earned</div>
        </div>

        <div className="p-6 bg-warning/10 rounded-lg border border-warning/20">
          <div className="flex items-center justify-between mb-4">
            <Icon name="Clock" size={24} className="text-warning" />
            <span className="text-sm text-warning">12 pending</span>
          </div>
          <div className="text-2xl font-bold text-foreground mb-1">{financialStats.pendingPayouts} XAF</div>
          <div className="text-sm text-muted-foreground">Pending Payouts</div>
        </div>
      </div>

      {/* Revenue Breakdown */}
      <div className="mb-8">
        <h3 className="text-lg font-medium text-foreground mb-4">Revenue by Category</h3>
        <div className="space-y-4">
          {revenueBreakdown.map((category, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-4 h-4 rounded ${category.color}`}></div>
                <span className="font-medium text-foreground">{category.category}</span>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-32 bg-muted rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${category.color}`}
                    style={{ width: `${category.percentage}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-foreground w-24 text-right">
                  {category.amount} XAF
                </span>
                <span className="text-sm text-muted-foreground w-12 text-right">
                  {category.percentage}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Payouts */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-foreground">Recent Payouts</h3>
          <Button variant="outline" size="sm" iconName="ExternalLink" iconPosition="right">
            View All
          </Button>
        </div>
        
        <div className="space-y-3">
          {recentPayouts.map((payout) => (
            <div key={payout.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
              <div className="flex-1">
                <div className="flex items-center space-x-4 mb-2">
                  <span className="font-medium text-foreground">{payout.id}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(payout.status)}`}>
                    {payout.status}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground">
                  <div>{payout.shop} • {payout.owner}</div>
                  <div className="flex items-center space-x-1">
                    <Icon name={getPaymentMethodIcon(payout.method)} size={12} />
                    <span>{payout.method}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <div className="font-medium text-foreground">{payout.amount} XAF</div>
                  <div className="text-sm text-muted-foreground">Commission: {payout.commission} XAF</div>
                </div>
                {payout.status === 'Pending' && (
                  <Button 
                    variant="default" 
                    size="sm" 
                    iconName="CheckCircle"
                    onClick={() => handleProcessPayout(payout.id)}
                  >
                    Process
                  </Button>
                )}
                <Button variant="ghost" size="sm" iconName="MoreHorizontal" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FinancialReporting;