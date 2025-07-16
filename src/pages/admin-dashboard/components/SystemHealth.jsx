import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const SystemHealth = () => {
  const [systemStatus, setSystemStatus] = useState('operational');
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Simulate real-time system monitoring
  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdate(new Date());
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const systemMetrics = {
    serverUptime: "99.98%",
    responseTime: "145ms",
    activeUsers: "2,847",
    errorRate: "0.02%",
    databaseHealth: "Excellent",
    storageUsage: "67%"
  };

  const serviceStatus = [
    { name: "Web Application", status: "Operational", uptime: "99.99%", color: "text-success" },
    { name: "Payment Gateway", status: "Operational", uptime: "99.95%", color: "text-success" },
    { name: "Database", status: "Operational", uptime: "99.98%", color: "text-success" },
    { name: "File Storage", status: "Operational", uptime: "99.97%", color: "text-success" },
    { name: "Email Service", status: "Degraded", uptime: "98.45%", color: "text-warning" },
    { name: "SMS Gateway", status: "Operational", uptime: "99.92%", color: "text-success" }
  ];

  const recentAlerts = [
    {
      id: 1,
      type: "Warning",
      message: "High memory usage detected on server-02",
      timestamp: "2025-01-16 14:25",
      severity: "Medium",
      resolved: false
    },
    {
      id: 2,
      type: "Info",
      message: "Database backup completed successfully",
      timestamp: "2025-01-16 12:00",
      severity: "Low",
      resolved: true
    },
    {
      id: 3,
      type: "Error",
      message: "Email service experiencing delays",
      timestamp: "2025-01-16 11:30",
      severity: "High",
      resolved: false
    }
  ];

  const performanceData = [
    { metric: "CPU Usage", value: 45, threshold: 80, status: "good" },
    { metric: "Memory Usage", value: 67, threshold: 85, status: "warning" },
    { metric: "Disk Usage", value: 34, threshold: 90, status: "good" },
    { metric: "Network I/O", value: 23, threshold: 70, status: "good" }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Operational': return 'text-success bg-success/10';
      case 'Degraded': return 'text-warning bg-warning/10';
      case 'Outage': return 'text-error bg-error/10';
      default: return 'text-muted-foreground bg-muted/10';
    }
  };

  const getAlertColor = (type) => {
    switch (type) {
      case 'Error': return 'text-error bg-error/10 border-error/20';
      case 'Warning': return 'text-warning bg-warning/10 border-warning/20';
      case 'Info': return 'text-primary bg-primary/10 border-primary/20';
      default: return 'text-muted-foreground bg-muted/10 border-border';
    }
  };

  const getPerformanceColor = (status) => {
    switch (status) {
      case 'good': return 'bg-success';
      case 'warning': return 'bg-warning';
      case 'critical': return 'bg-error';
      default: return 'bg-muted';
    }
  };

  return (
    <div className="bg-surface rounded-lg border border-border p-6 elevation-1">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <h2 className="text-xl font-semibold text-foreground">System Health</h2>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
            <span className="text-sm text-success font-medium">Operational</span>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted-foreground">
            Last updated: {lastUpdate.toLocaleTimeString()}
          </span>
          <Button variant="outline" size="sm" iconName="RefreshCw">
            Refresh
          </Button>
        </div>
      </div>

      {/* System Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
        <div className="text-center p-4 bg-success/10 rounded-lg">
          <div className="text-xl font-bold text-success">{systemMetrics.serverUptime}</div>
          <div className="text-xs text-muted-foreground">Server Uptime</div>
        </div>
        <div className="text-center p-4 bg-primary/10 rounded-lg">
          <div className="text-xl font-bold text-primary">{systemMetrics.responseTime}</div>
          <div className="text-xs text-muted-foreground">Response Time</div>
        </div>
        <div className="text-center p-4 bg-secondary/10 rounded-lg">
          <div className="text-xl font-bold text-secondary">{systemMetrics.activeUsers}</div>
          <div className="text-xs text-muted-foreground">Active Users</div>
        </div>
        <div className="text-center p-4 bg-success/10 rounded-lg">
          <div className="text-xl font-bold text-success">{systemMetrics.errorRate}</div>
          <div className="text-xs text-muted-foreground">Error Rate</div>
        </div>
        <div className="text-center p-4 bg-primary/10 rounded-lg">
          <div className="text-xl font-bold text-primary">{systemMetrics.databaseHealth}</div>
          <div className="text-xs text-muted-foreground">Database</div>
        </div>
        <div className="text-center p-4 bg-warning/10 rounded-lg">
          <div className="text-xl font-bold text-warning">{systemMetrics.storageUsage}</div>
          <div className="text-xs text-muted-foreground">Storage Usage</div>
        </div>
      </div>

      {/* Service Status */}
      <div className="mb-8">
        <h3 className="text-lg font-medium text-foreground mb-4">Service Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {serviceStatus.map((service, index) => (
            <div key={index} className="p-4 bg-muted/30 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-foreground">{service.name}</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(service.status)}`}>
                  {service.status}
                </span>
              </div>
              <div className="text-sm text-muted-foreground">
                Uptime: {service.uptime}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="mb-8">
        <h3 className="text-lg font-medium text-foreground mb-4">Performance Metrics</h3>
        <div className="space-y-4">
          {performanceData.map((item, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="font-medium text-foreground w-24">{item.metric}</span>
                <div className="w-48 bg-muted rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${getPerformanceColor(item.status)}`}
                    style={{ width: `${item.value}%` }}
                  ></div>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-foreground">{item.value}%</span>
                <span className="text-sm text-muted-foreground">/ {item.threshold}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Alerts */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-foreground">Recent Alerts</h3>
          <Button variant="outline" size="sm" iconName="ExternalLink" iconPosition="right">
            View All
          </Button>
        </div>
        
        <div className="space-y-3">
          {recentAlerts.map((alert) => (
            <div key={alert.id} className={`p-4 rounded-lg border ${getAlertColor(alert.type)}`}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <Icon 
                      name={alert.type === 'Error' ? 'AlertCircle' : alert.type === 'Warning' ? 'AlertTriangle' : 'Info'} 
                      size={16} 
                    />
                    <span className="font-medium">{alert.type}</span>
                    <span className="text-sm text-muted-foreground">{alert.timestamp}</span>
                  </div>
                  <p className="text-sm">{alert.message}</p>
                </div>
                <div className="flex items-center space-x-2">
                  {!alert.resolved && (
                    <Button variant="outline" size="sm" iconName="CheckCircle">
                      Resolve
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" iconName="MoreHorizontal" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SystemHealth;