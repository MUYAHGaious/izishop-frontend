import React, { useState } from 'react';

import Button from '../../../components/ui/Button';

const UserManagement = () => {
  const [selectedTimeframe, setSelectedTimeframe] = useState('week');

  const userStats = {
    totalUsers: 12847,
    newRegistrations: 234,
    activeUsers: 8945,
    suspendedUsers: 45,
    pendingVerifications: 67
  };

  const roleDistribution = [
    { role: 'Customers', count: 10234, percentage: 79.6, color: 'bg-primary' },
    { role: 'Shop Owners', count: 1234, percentage: 9.6, color: 'bg-secondary' },
    { role: 'Casual Sellers', count: 1289, percentage: 10.0, color: 'bg-success' },
    { role: 'Delivery Agents', count: 90, percentage: 0.7, color: 'bg-warning' }
  ];

  const recentUsers = [
    {
      id: 1,
      name: "Marie Dubois",
      email: "marie.dubois@email.com",
      role: "Customer",
      status: "Active",
      joinDate: "2025-01-15",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b9c8c8b0?w=150"
    },
    {
      id: 2,
      name: "Jean Kamga",
      email: "jean.kamga@shop.cm",
      role: "Shop Owner",
      status: "Pending",
      joinDate: "2025-01-14",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150"
    },
    {
      id: 3,
      name: "Fatima Nkomo",
      email: "fatima.nkomo@email.com",
      role: "Casual Seller",
      status: "Active",
      joinDate: "2025-01-13",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150"
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'text-success bg-success/10';
      case 'Pending': return 'text-warning bg-warning/10';
      case 'Suspended': return 'text-error bg-error/10';
      default: return 'text-muted-foreground bg-muted/10';
    }
  };

  return (
    <div className="bg-surface rounded-lg border border-border p-6 elevation-1">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-foreground">User Management</h2>
        <Button variant="outline" iconName="UserPlus" iconPosition="left">
          Add User
        </Button>
      </div>

      {/* User Statistics */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <div className="text-center p-4 bg-muted/50 rounded-lg">
          <div className="text-2xl font-bold text-foreground">{userStats.totalUsers.toLocaleString()}</div>
          <div className="text-sm text-muted-foreground">Total Users</div>
        </div>
        <div className="text-center p-4 bg-success/10 rounded-lg">
          <div className="text-2xl font-bold text-success">{userStats.newRegistrations}</div>
          <div className="text-sm text-muted-foreground">New This Week</div>
        </div>
        <div className="text-center p-4 bg-primary/10 rounded-lg">
          <div className="text-2xl font-bold text-primary">{userStats.activeUsers.toLocaleString()}</div>
          <div className="text-sm text-muted-foreground">Active Users</div>
        </div>
        <div className="text-center p-4 bg-error/10 rounded-lg">
          <div className="text-2xl font-bold text-error">{userStats.suspendedUsers}</div>
          <div className="text-sm text-muted-foreground">Suspended</div>
        </div>
        <div className="text-center p-4 bg-warning/10 rounded-lg">
          <div className="text-2xl font-bold text-warning">{userStats.pendingVerifications}</div>
          <div className="text-sm text-muted-foreground">Pending</div>
        </div>
      </div>

      {/* Role Distribution */}
      <div className="mb-6">
        <h3 className="text-lg font-medium text-foreground mb-4">Role Distribution</h3>
        <div className="space-y-3">
          {roleDistribution.map((role, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${role.color}`}></div>
                <span className="text-sm font-medium text-foreground">{role.role}</span>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-32 bg-muted rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${role.color}`}
                    style={{ width: `${role.percentage}%` }}
                  ></div>
                </div>
                <span className="text-sm text-muted-foreground w-16 text-right">
                  {role.count.toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Users */}
      <div>
        <h3 className="text-lg font-medium text-foreground mb-4">Recent Registrations</h3>
        <div className="space-y-3">
          {recentUsers.map((user) => (
            <div key={user.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <div className="flex items-center space-x-3">
                <img 
                  src={user.avatar} 
                  alt={user.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <div className="font-medium text-foreground">{user.name}</div>
                  <div className="text-sm text-muted-foreground">{user.email}</div>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-muted-foreground">{user.role}</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                  {user.status}
                </span>
                <Button variant="ghost" size="sm" iconName="MoreHorizontal" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UserManagement;