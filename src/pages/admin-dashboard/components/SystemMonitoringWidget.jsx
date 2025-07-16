import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const SystemMonitoringWidget = () => {
  const [systemStatus, setSystemStatus] = useState({
    uptime: 99.8,
    responseTime: 1.2,
    activeUsers: 2847,
    serverLoad: 68,
    memoryUsage: 72,
    diskUsage: 45
  });

  const [alerts, setAlerts] = useState([
    {
      id: 1,
      type: 'warning',
      message: 'High memory usage detected on server-02',
      timestamp: '2025-01-16 16:45:23',
      severity: 'Medium'
    },
    {
      id: 2,
      type: 'info',
      message: 'Scheduled maintenance completed successfully',
      timestamp: '2025-01-16 15:30:12',
      severity: 'Low'
    },
    {
      id: 3,
      type: 'error',
      message: 'Payment gateway timeout - resolved',
      timestamp: '2025-01-16 14:22:45',
      severity: 'High'
    }
  ]);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setSystemStatus(prev => ({
        ...prev,
        activeUsers: prev.activeUsers + Math.floor(Math.random() * 10) - 5,
        responseTime: Math.max(0.8, prev.responseTime + (Math.random() - 0.5) * 0.2),
        serverLoad: Math.max(0, Math.min(100, prev.serverLoad + Math.floor(Math.random() * 6) - 3)),
        memoryUsage: Math.max(0, Math.min(100, prev.memoryUsage + Math.floor(Math.random() * 4) - 2))
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (value, thresholds) => {
    if (value >= thresholds.danger) return 'text-error';
    if (value >= thresholds.warning) return 'text-warning';
    return 'text-success';
  };

  const getAlertIcon = (type) => {
    switch (type) {
      case 'error': return 'AlertCircle';
      case 'warning': return 'AlertTriangle';
      case 'info': return 'Info';
      default: return 'Bell';
    }
  };

  const getAlertColor = (type) => {
    switch (type) {
      case 'error': return 'text-error bg-error/10';
      case 'warning': return 'text-warning bg-warning/10';
      case 'info': return 'text-primary bg-primary/10';
      default: return 'text-text-secondary bg-muted';
    }
  };

  return (
    <div className="bg-card rounded-lg border border-border p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-text-primary">System Monitoring</h3>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
          <span className="text-sm text-success font-medium">Live</span>
        </div>
      </div>

      {/* System Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <div className="text-center p-4 bg-muted rounded-lg">
          <div className="w-12 h-12 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-2">
            <Icon name="Activity" size={20} className="text-success" />
          </div>
          <p className="text-xl font-bold text-text-primary">{systemStatus.uptime}%</p>
          <p className="text-sm text-text-secondary">Uptime</p>
        </div>

        <div className="text-center p-4 bg-muted rounded-lg">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
            <Icon name="Zap" size={20} className="text-primary" />
          </div>
          <p className="text-xl font-bold text-text-primary">{systemStatus.responseTime.toFixed(1)}s</p>
          <p className="text-sm text-text-secondary">Response Time</p>
        </div>

        <div className="text-center p-4 bg-muted rounded-lg">
          <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-2">
            <Icon name="Users" size={20} className="text-secondary" />
          </div>
          <p className="text-xl font-bold text-text-primary">{systemStatus.activeUsers.toLocaleString()}</p>
          <p className="text-sm text-text-secondary">Active Users</p>
        </div>
      </div>

      {/* Resource Usage */}
      <div className="space-y-4 mb-6">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-text-primary">Server Load</span>
            <span className={`text-sm font-medium ${getStatusColor(systemStatus.serverLoad, { warning: 70, danger: 90 })}`}>
              {systemStatus.serverLoad}%
            </span>
          </div>
          <div className="w-full bg-border rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${
                systemStatus.serverLoad >= 90 ? 'bg-error' :
                systemStatus.serverLoad >= 70 ? 'bg-warning' : 'bg-success'
              }`}
              style={{ width: `${systemStatus.serverLoad}%` }}
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-text-primary">Memory Usage</span>
            <span className={`text-sm font-medium ${getStatusColor(systemStatus.memoryUsage, { warning: 75, danger: 90 })}`}>
              {systemStatus.memoryUsage}%
            </span>
          </div>
          <div className="w-full bg-border rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${
                systemStatus.memoryUsage >= 90 ? 'bg-error' :
                systemStatus.memoryUsage >= 75 ? 'bg-warning' : 'bg-success'
              }`}
              style={{ width: `${systemStatus.memoryUsage}%` }}
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-text-primary">Disk Usage</span>
            <span className={`text-sm font-medium ${getStatusColor(systemStatus.diskUsage, { warning: 80, danger: 95 })}`}>
              {systemStatus.diskUsage}%
            </span>
          </div>
          <div className="w-full bg-border rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${
                systemStatus.diskUsage >= 95 ? 'bg-error' :
                systemStatus.diskUsage >= 80 ? 'bg-warning' : 'bg-success'
              }`}
              style={{ width: `${systemStatus.diskUsage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Recent Alerts */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-medium text-text-primary">Recent Alerts</h4>
          <Button variant="ghost" size="sm" iconName="Bell">
            View All
          </Button>
        </div>
        <div className="space-y-3">
          {alerts.slice(0, 3).map((alert) => (
            <div key={alert.id} className="flex items-start space-x-3 p-3 bg-muted rounded-lg">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${getAlertColor(alert.type)}`}>
                <Icon name={getAlertIcon(alert.type)} size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-primary">{alert.message}</p>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-xs text-text-secondary">{alert.timestamp}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    alert.severity === 'High' ? 'bg-error/10 text-error' :
                    alert.severity === 'Medium'? 'bg-warning/10 text-warning' : 'bg-success/10 text-success'
                  }`}>
                    {alert.severity}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SystemMonitoringWidget;