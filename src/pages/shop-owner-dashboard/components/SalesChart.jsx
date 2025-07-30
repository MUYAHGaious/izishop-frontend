import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area } from 'recharts';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import api from '../../../services/api';
import { showToast } from '../../../components/ui/Toast';

const SalesChart = ({ timeRange = '7d' }) => {
  const [chartType, setChartType] = useState('revenue');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [salesData, setSalesData] = useState([]);

  // Load sales data from API
  useEffect(() => {
    const loadSalesData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const data = await api.getShopOwnerSalesData(timeRange);
        console.log('Sales chart data:', data);
        
        // Process data for chart display
        const processedData = data.map(item => ({
          name: new Date(item.date).toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric' 
          }),
          value: item.sales,
          orders: item.orders,
          date: item.date
        }));
        
        setSalesData(processedData);
        
      } catch (error) {
        console.error('Error loading sales data:', error);
        setError(error.message || 'Failed to load sales data');
        showToast({
          type: 'error',
          message: 'Failed to load sales chart data',
          duration: 3000
        });
      } finally {
        setLoading(false);
      }
    };

    loadSalesData();
  }, [timeRange]);

  const getCurrentData = () => {
    return salesData;
  };

  const formatValue = (value) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(0)}K`;
    }
    return value.toString();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-CM', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-lg">
          <p className="text-sm font-medium text-gray-900 mb-1">{label}</p>
          <p className="text-sm text-blue-600">
            Revenue: {formatCurrency(payload[0].value)}
          </p>
          <p className="text-sm text-green-600">
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

  // Loading state
  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 animate-pulse">
          <div className="flex items-center justify-between mb-6">
            <div className="h-6 bg-gray-200 rounded w-32"></div>
            <div className="h-8 bg-gray-200 rounded w-24"></div>
          </div>
          <div className="h-80 bg-gray-200 rounded mb-4"></div>
          <div className="flex justify-between">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="text-center">
                <div className="h-4 bg-gray-200 rounded w-16 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-12"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 text-center">
          <Icon name="AlertTriangle" size={48} className="text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-800 mb-2">Failed to Load Sales Chart</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-2">
            <Icon name={chartConfig[chartType].icon} size={20} className="text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">{chartConfig[chartType].title}</h3>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Chart Type Selector */}
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
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
        {salesData.length > 0 && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-lg font-bold text-blue-600 mb-1">
                {formatCurrency(getCurrentData().reduce((sum, item) => sum + item.value, 0))}
              </div>
              <div className="text-xs text-gray-600">Total Revenue</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-lg font-bold text-green-600 mb-1">
                {getCurrentData().reduce((sum, item) => sum + item.orders, 0)}
              </div>
              <div className="text-xs text-gray-600">Total Orders</div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="text-lg font-bold text-purple-600 mb-1">
                {formatCurrency(getCurrentData().reduce((sum, item) => sum + item.value, 0) / getCurrentData().length)}
              </div>
              <div className="text-xs text-gray-600">Avg Daily</div>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <div className="text-lg font-bold text-orange-600 mb-1">
                {Math.round(getCurrentData().reduce((sum, item) => sum + item.orders, 0) / getCurrentData().length)}
              </div>
              <div className="text-xs text-gray-600">Avg Orders</div>
            </div>
          </div>
        )}

        {/* Chart */}
        <div className="h-80 w-full">
          {salesData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'revenue' ? (
                <BarChart data={getCurrentData()} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
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
                    fill="#3B82F6"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              ) : (
                <LineChart data={getCurrentData()} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
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
                    stroke="#7C3AED"
                    strokeWidth={3}
                    dot={{ fill: "#7C3AED", strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: "#7C3AED", strokeWidth: 2 }}
                  />
                </LineChart>
              )}
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center bg-gray-50 rounded-lg h-full">
              <div className="text-center">
                <Icon name="BarChart3" size={48} className="text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">No sales data available for the selected period</p>
              </div>
            </div>
          )}
        </div>

        {/* Chart Actions */}
        {salesData.length > 0 && (
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="outline"
                fullWidth
                onClick={() => {
                  const data = {
                    timeRange,
                    salesData: getCurrentData(),
                    exportDate: new Date().toISOString()
                  };
                  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `sales-chart-${timeRange}-${new Date().toISOString().split('T')[0]}.json`;
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                  URL.revokeObjectURL(url);
                  showToast({
                    type: 'success',
                    message: 'Sales chart data exported successfully',
                    duration: 3000
                  });
                }}
                iconName="Download"
                iconPosition="left"
                iconSize={16}
              >
                Export Data
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SalesChart;