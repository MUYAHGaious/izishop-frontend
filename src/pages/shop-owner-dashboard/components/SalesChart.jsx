import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const SalesChart = () => {
  const [chartType, setChartType] = useState('revenue');
  const [timeRange, setTimeRange] = useState('7days');

  const revenueData = [
    { name: 'Mon', value: 125000, orders: 8 },
    { name: 'Tue', value: 89000, orders: 6 },
    { name: 'Wed', value: 156000, orders: 12 },
    { name: 'Thu', value: 203000, orders: 15 },
    { name: 'Fri', value: 178000, orders: 11 },
    { name: 'Sat', value: 234000, orders: 18 },
    { name: 'Sun', value: 198000, orders: 14 }
  ];

  const monthlyData = [
    { name: 'Jan', value: 2450000, orders: 156 },
    { name: 'Feb', value: 2890000, orders: 189 },
    { name: 'Mar', value: 3120000, orders: 203 },
    { name: 'Apr', value: 2780000, orders: 178 },
    { name: 'May', value: 3450000, orders: 234 },
    { name: 'Jun', value: 3890000, orders: 267 },
    { name: 'Jul', value: 4120000, orders: 289 }
  ];

  const getCurrentData = () => {
    return timeRange === '7days' ? revenueData : monthlyData;
  };

  const formatValue = (value) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(0)}K`;
    }
    return value.toString();
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-surface border border-border rounded-lg p-3 elevation-2">
          <p className="text-sm font-medium text-foreground mb-1">{label}</p>
          <p className="text-sm text-primary">
            Revenue: {payload[0].value.toLocaleString()} XAF
          </p>
          <p className="text-sm text-secondary">
            Orders: {payload[0].payload.orders}
          </p>
        </div>
      );
    }
    return null;
  };

  const chartConfig = {
    revenue: {
      title: 'Revenue Trends',
      icon: 'TrendingUp',
      color: '#1E40AF'
    },
    orders: {
      title: 'Order Volume',
      icon: 'Package',
      color: '#7C3AED'
    }
  };

  return (
    <div className="bg-surface rounded-lg border border-border elevation-1">
      <div className="p-6 border-b border-border">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-2">
            <Icon name={chartConfig[chartType].icon} size={20} className="text-primary" />
            <h3 className="text-lg font-semibold text-foreground">{chartConfig[chartType].title}</h3>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Time Range Selector */}
            <div className="flex items-center bg-muted rounded-lg p-1">
              <Button
                variant={timeRange === '7days' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setTimeRange('7days')}
                className="text-xs"
              >
                7 Days
              </Button>
              <Button
                variant={timeRange === 'monthly' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setTimeRange('monthly')}
                className="text-xs"
              >
                Monthly
              </Button>
            </div>

            {/* Chart Type Selector */}
            <div className="flex items-center bg-muted rounded-lg p-1">
              <Button
                variant={chartType === 'revenue' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setChartType('revenue')}
                iconName="TrendingUp"
                iconSize={14}
                className="text-xs"
              />
              <Button
                variant={chartType === 'orders' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setChartType('orders')}
                iconName="Package"
                iconSize={14}
                className="text-xs"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Chart Summary */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-3 bg-primary/10 rounded-lg">
            <div className="text-lg font-bold text-primary mb-1">
              {formatValue(getCurrentData().reduce((sum, item) => sum + item.value, 0))} XAF
            </div>
            <div className="text-xs text-muted-foreground">Total Revenue</div>
          </div>
          <div className="text-center p-3 bg-secondary/10 rounded-lg">
            <div className="text-lg font-bold text-secondary mb-1">
              {getCurrentData().reduce((sum, item) => sum + item.orders, 0)}
            </div>
            <div className="text-xs text-muted-foreground">Total Orders</div>
          </div>
          <div className="text-center p-3 bg-success/10 rounded-lg">
            <div className="text-lg font-bold text-success mb-1">
              {formatValue(getCurrentData().reduce((sum, item) => sum + item.value, 0) / getCurrentData().length)} XAF
            </div>
            <div className="text-xs text-muted-foreground">Avg Daily</div>
          </div>
          <div className="text-center p-3 bg-warning/10 rounded-lg">
            <div className="text-lg font-bold text-warning mb-1">
              {Math.round(getCurrentData().reduce((sum, item) => sum + item.orders, 0) / getCurrentData().length)}
            </div>
            <div className="text-xs text-muted-foreground">Avg Orders</div>
          </div>
        </div>

        {/* Chart */}
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'revenue' ? (
              <BarChart data={getCurrentData()} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#6B7280' }}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#6B7280' }}
                  tickFormatter={formatValue}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="value" 
                  fill={chartConfig[chartType].color}
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            ) : (
              <LineChart data={getCurrentData()} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#6B7280' }}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#6B7280' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line 
                  type="monotone" 
                  dataKey="orders" 
                  stroke={chartConfig[chartType].color}
                  strokeWidth={3}
                  dot={{ fill: chartConfig[chartType].color, strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: chartConfig[chartType].color, strokeWidth: 2 }}
                />
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* Chart Actions */}
        <div className="mt-6 pt-4 border-t border-border">
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="outline"
              fullWidth
              onClick={() => console.log('Export chart data')}
              iconName="Download"
              iconPosition="left"
              iconSize={16}
            >
              Export Data
            </Button>
            <Button
              variant="secondary"
              fullWidth
              onClick={() => console.log('View detailed analytics')}
              iconName="BarChart3"
              iconPosition="left"
              iconSize={16}
            >
              Detailed Analytics
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesChart;