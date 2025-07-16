import React, { useState } from 'react';

import Button from '../../../components/ui/Button';

const DisputeResolution = () => {
  const [selectedFilter, setSelectedFilter] = useState('all');

  const disputeStats = {
    totalDisputes: 23,
    highPriority: 5,
    mediumPriority: 12,
    lowPriority: 6,
    resolved: 145,
    averageResolutionTime: "2.3 days"
  };

  const activeDisputes = [
    {
      id: "DSP-2025-001",
      orderId: "ORD-2025-001234",
      customer: "Marie Dubois",
      shop: "TechStore Yaoundé",
      issue: "Product not as described",
      priority: "High",
      status: "Under Review",
      amount: "125,000",
      createdDate: "2025-01-15",
      lastUpdate: "2025-01-16 10:30",
      description: `Customer claims the smartphone received does not match the specifications listed. The device appears to be a different model with lower specifications than advertised.`
    },
    {
      id: "DSP-2025-002",
      orderId: "ORD-2025-001198",
      customer: "Jean Kamga",
      shop: "Fashion Hub",
      issue: "Delivery delay",
      priority: "Medium",
      status: "Awaiting Response",
      amount: "89,500",
      createdDate: "2025-01-14",
      lastUpdate: "2025-01-15 16:45",
      description: `Order was supposed to be delivered within 3 days but has been delayed for over a week. Customer requesting refund or immediate delivery.`
    },
    {
      id: "DSP-2025-003",
      orderId: "ORD-2025-001156",
      customer: "Fatima Nkomo",
      shop: "Electronics Plus",
      issue: "Damaged item",
      priority: "High",
      status: "Escalated",
      amount: "234,000",
      createdDate: "2025-01-13",
      lastUpdate: "2025-01-16 09:15",
      description: `Laptop arrived with cracked screen and damaged packaging. Customer has provided photos as evidence and is requesting full refund.`
    }
  ];

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'text-error bg-error/10 border-error/20';
      case 'Medium': return 'text-warning bg-warning/10 border-warning/20';
      case 'Low': return 'text-success bg-success/10 border-success/20';
      default: return 'text-muted-foreground bg-muted/10 border-border';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Under Review': return 'text-primary bg-primary/10';
      case 'Awaiting Response': return 'text-warning bg-warning/10';
      case 'Escalated': return 'text-error bg-error/10';
      case 'Resolved': return 'text-success bg-success/10';
      default: return 'text-muted-foreground bg-muted/10';
    }
  };

  const handleResolveDispute = (disputeId) => {
    console.log(`Resolving dispute: ${disputeId}`);
  };

  const handleEscalateDispute = (disputeId) => {
    console.log(`Escalating dispute: ${disputeId}`);
  };

  return (
    <div className="bg-surface rounded-lg border border-border p-6 elevation-1">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-foreground">Dispute Resolution Center</h2>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" iconName="Filter">
            Filter
          </Button>
          <Button variant="default" size="sm" iconName="Plus" iconPosition="left">
            New Case
          </Button>
        </div>
      </div>

      {/* Dispute Statistics */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
        <div className="text-center p-4 bg-muted/50 rounded-lg">
          <div className="text-xl font-bold text-foreground">{disputeStats.totalDisputes}</div>
          <div className="text-xs text-muted-foreground">Active Disputes</div>
        </div>
        <div className="text-center p-4 bg-error/10 rounded-lg">
          <div className="text-xl font-bold text-error">{disputeStats.highPriority}</div>
          <div className="text-xs text-muted-foreground">High Priority</div>
        </div>
        <div className="text-center p-4 bg-warning/10 rounded-lg">
          <div className="text-xl font-bold text-warning">{disputeStats.mediumPriority}</div>
          <div className="text-xs text-muted-foreground">Medium Priority</div>
        </div>
        <div className="text-center p-4 bg-success/10 rounded-lg">
          <div className="text-xl font-bold text-success">{disputeStats.lowPriority}</div>
          <div className="text-xs text-muted-foreground">Low Priority</div>
        </div>
        <div className="text-center p-4 bg-primary/10 rounded-lg">
          <div className="text-xl font-bold text-primary">{disputeStats.resolved}</div>
          <div className="text-xs text-muted-foreground">Resolved</div>
        </div>
        <div className="text-center p-4 bg-secondary/10 rounded-lg">
          <div className="text-xl font-bold text-secondary">{disputeStats.averageResolutionTime}</div>
          <div className="text-xs text-muted-foreground">Avg Resolution</div>
        </div>
      </div>

      {/* Priority Filter */}
      <div className="flex items-center space-x-2 mb-6">
        <span className="text-sm font-medium text-foreground">Filter by Priority:</span>
        <Button 
          variant={selectedFilter === 'all' ? 'default' : 'outline'} 
          size="sm"
          onClick={() => setSelectedFilter('all')}
        >
          All
        </Button>
        <Button 
          variant={selectedFilter === 'high' ? 'default' : 'outline'} 
          size="sm"
          onClick={() => setSelectedFilter('high')}
        >
          High
        </Button>
        <Button 
          variant={selectedFilter === 'medium' ? 'default' : 'outline'} 
          size="sm"
          onClick={() => setSelectedFilter('medium')}
        >
          Medium
        </Button>
        <Button 
          variant={selectedFilter === 'low' ? 'default' : 'outline'} 
          size="sm"
          onClick={() => setSelectedFilter('low')}
        >
          Low
        </Button>
      </div>

      {/* Active Disputes */}
      <div className="space-y-4">
        {activeDisputes.map((dispute) => (
          <div key={dispute.id} className="border border-border rounded-lg p-4 bg-muted/20">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <span className="font-medium text-foreground">{dispute.id}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(dispute.priority)}`}>
                    {dispute.priority} Priority
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(dispute.status)}`}>
                    {dispute.status}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                  <div>
                    <div className="text-sm text-muted-foreground">Customer</div>
                    <div className="font-medium text-foreground">{dispute.customer}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Shop</div>
                    <div className="font-medium text-foreground">{dispute.shop}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Issue</div>
                    <div className="font-medium text-foreground">{dispute.issue}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Amount</div>
                    <div className="font-medium text-foreground">{dispute.amount} XAF</div>
                  </div>
                </div>
                
                <div className="text-sm text-muted-foreground mb-3">
                  <strong>Description:</strong> {dispute.description}
                </div>
                
                <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                  <span>Created: {dispute.createdDate}</span>
                  <span>Last Update: {dispute.lastUpdate}</span>
                  <span>Order: {dispute.orderId}</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between pt-4 border-t border-border">
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" iconName="MessageSquare" iconPosition="left">
                  Message
                </Button>
                <Button variant="outline" size="sm" iconName="FileText" iconPosition="left">
                  View Details
                </Button>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button 
                  variant="secondary" 
                  size="sm" 
                  iconName="AlertTriangle" 
                  iconPosition="left"
                  onClick={() => handleEscalateDispute(dispute.id)}
                >
                  Escalate
                </Button>
                <Button 
                  variant="success" 
                  size="sm" 
                  iconName="CheckCircle" 
                  iconPosition="left"
                  onClick={() => handleResolveDispute(dispute.id)}
                >
                  Resolve
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DisputeResolution;