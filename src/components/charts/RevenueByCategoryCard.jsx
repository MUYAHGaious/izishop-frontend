import React, { useState, useEffect } from 'react';
import Icon from '../AppIcon';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

const RevenueByCategoryCard = ({ 
  data = [], 
  loading = false, 
  error = null, 
  timeRange = '30d',
  viewType = 'pie', // 'pie' or 'bar'
  onCategoryClick = null,
  showPercentages = true,
  showLegend = true,
  maxCategories = 8
}) => {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [chartType, setChartType] = useState(viewType);
  const [expandedView, setExpandedView] = useState(false);

  // Color palette for categories
  const colorPalette = [
    '#3B82F6', // Blue
    '#10B981', // Green
    '#F59E0B', // Amber
    '#EF4444', // Red
    '#8B5CF6', // Purple
    '#F97316', // Orange
    '#06B6D4', // Cyan
    '#84CC16', // Lime
    '#EC4899', // Pink
    '#6B7280'  // Gray
  ];

  // Process data for display - ONLY USE REAL API DATA
  const processedData = React.useMemo(() => {
    if (!data || data.length === 0) {
      return [];
    }
    
    // Filter out categories with no real revenue data
    const realCategoriesData = data.filter(category => 
      category.revenue && category.revenue > 0
    );
    
    if (realCategoriesData.length === 0) {
      return [];
    }
    
    // Sort by revenue descending
    const sortedData = [...realCategoriesData]
      .sort((a, b) => (b.revenue || 0) - (a.revenue || 0))
      .slice(0, maxCategories);
    
    // Calculate total for percentages
    const totalRevenue = sortedData.reduce((sum, item) => sum + (item.revenue || 0), 0);
    
    // Add colors and calculated percentages
    return sortedData.map((item, index) => ({
      ...item,
      color: item.color || colorPalette[index % colorPalette.length],
      calculatedPercentage: totalRevenue > 0 ? ((item.revenue || 0) / totalRevenue * 100) : 0,
      displayPercentage: item.percentage || (totalRevenue > 0 ? ((item.revenue || 0) / totalRevenue * 100) : 0)
    }));
  }, [data, maxCategories]);

  // Format currency
  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return 'XAF 0';
    return new Intl.NumberFormat('fr-CM', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Format percentage
  const formatPercentage = (value) => {
    if (value === null || value === undefined) return '0.0%';
    return `${value.toFixed(1)}%`;
  };

  // Handle category selection
  const handleCategoryClick = (category, index) => {
    setSelectedCategory(selectedCategory?.name === category.name ? null : category);
    onCategoryClick?.(category, index);
  };

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
          <div className="flex items-center space-x-2 mb-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: data.color }}
            ></div>
            <span className="font-semibold text-gray-900">{data.name}</span>
          </div>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Revenue:</span>
              <span className="font-medium">{formatCurrency(data.revenue)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Percentage:</span>
              <span className="font-medium">{formatPercentage(data.displayPercentage)}</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Revenue by Category</h3>
          <div className="animate-pulse w-8 h-8 bg-gray-200 rounded"></div>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Revenue by Category</h3>
          <Icon name="AlertTriangle" size={20} className="text-red-500" />
        </div>
        <div className="flex items-center justify-center h-64 text-center">
          <div>
            <Icon name="AlertTriangle" size={48} className="text-red-400 mx-auto mb-2" />
            <p className="text-red-600 font-medium">Error loading data</p>
            <p className="text-red-500 text-sm">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (processedData.length === 0) {
    return (
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Revenue by Category</h3>
          <Icon name="BarChart" size={20} className="text-gray-400" />
        </div>
        <div className="flex items-center justify-center h-64 text-center">
          <div>
            <Icon name="Package" size={48} className="text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600 font-medium">No category data available</p>
            <p className="text-gray-500 text-sm">Data will appear here once transactions are recorded</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Modern Header */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 px-6 py-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
              <Icon name="PieChart" size={20} className="text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Revenue by Category</h3>
              <p className="text-sm text-gray-600">Performance across product categories</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-between mt-4">
          {/* Chart type toggle */}
          <div className="flex bg-white rounded-xl p-1 shadow-sm border border-gray-200">
            <button
              onClick={() => setChartType('pie')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center space-x-2 ${
                chartType === 'pie'
                  ? 'bg-purple-100 text-purple-700 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Icon name="PieChart" size={16} />
              <span>Pie Chart</span>
            </button>
            <button
              onClick={() => setChartType('bar')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center space-x-2 ${
                chartType === 'bar'
                  ? 'bg-purple-100 text-purple-700 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Icon name="BarChart" size={16} />
              <span>Bar Chart</span>
            </button>
          </div>
          
          {/* Expand button */}
          <button
            onClick={() => setExpandedView(!expandedView)}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-white rounded-xl transition-all border border-gray-200 bg-gray-50"
            title={expandedView ? 'Collapse' : 'Expand'}
          >
            <Icon name={expandedView ? 'Minimize2' : 'Maximize2'} size={16} />
          </button>
        </div>
      </div>

      <div className={`${expandedView ? 'h-96' : 'h-72'} p-6 transition-all duration-300`}>
        {chartType === 'pie' ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={processedData}
                cx="50%"
                cy="50%"
                innerRadius={expandedView ? 60 : 40}
                outerRadius={expandedView ? 120 : 80}
                paddingAngle={2}
                dataKey="revenue"
                onClick={handleCategoryClick}
                className="cursor-pointer"
              >
                {processedData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.color}
                    stroke={selectedCategory?.name === entry.name ? '#374151' : 'none'}
                    strokeWidth={selectedCategory?.name === entry.name ? 2 : 0}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              {showLegend && (
                <Legend 
                  verticalAlign="bottom" 
                  height={36}
                  formatter={(value, entry) => (
                    <span className="text-sm text-gray-700">
                      {value} ({formatPercentage(entry.payload.displayPercentage)})
                    </span>
                  )}
                />
              )}
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={processedData}
              margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => formatCurrency(value).replace('XAF', '').trim()}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="revenue" 
                radius={[4, 4, 0, 0]}
                onClick={handleCategoryClick}
                className="cursor-pointer"
              >
                {processedData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.color}
                    stroke={selectedCategory?.name === entry.name ? '#374151' : 'none'}
                    strokeWidth={selectedCategory?.name === entry.name ? 2 : 0}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Modern Category List */}
      <div className="mt-6 bg-gray-50 rounded-2xl p-4">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-base font-bold text-gray-900 flex items-center space-x-2">
            <Icon name="List" size={16} className="text-purple-600" />
            <span>Category Breakdown</span>
          </h4>
          <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded-full">
            {processedData.length} of {data.length} categories
          </span>
        </div>
        
        <div className="space-y-3 max-h-40 overflow-y-auto">
          {processedData.map((category, index) => (
            <div
              key={category.name}
              onClick={() => handleCategoryClick(category, index)}
              className={`group relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:shadow-md ${
                selectedCategory?.name === category.name
                  ? 'border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50 shadow-sm'
                  : 'border-gray-200 hover:border-purple-200 bg-white'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <div 
                    className="w-5 h-5 rounded-xl flex-shrink-0 shadow-sm" 
                    style={{ backgroundColor: category.color }}
                  ></div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 text-sm truncate">{category.name}</p>
                    <p className="text-xs text-gray-600">
                      {formatPercentage(category.displayPercentage)} of total revenue
                    </p>
                  </div>
                </div>
                
                <div className="text-right ml-3">
                  <div className="bg-white px-3 py-2 rounded-lg shadow-sm">
                    <p className="font-bold text-gray-900 text-sm font-mono">
                      {formatCurrency(category.revenue)}
                    </p>
                    {category.growth !== undefined && (
                      <div className="flex items-center justify-end space-x-1 mt-1">
                        <Icon 
                          name={category.growth >= 0 ? 'TrendingUp' : 'TrendingDown'} 
                          size={12} 
                          className={category.growth >= 0 ? 'text-green-500' : 'text-red-500'} 
                        />
                        <span className={`text-xs font-medium ${
                          category.growth >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {category.growth >= 0 ? '+' : ''}{category.growth?.toFixed(1)}%
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Selected Category Details */}
      {selectedCategory && (
        <div className="mt-6 p-6 bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div 
                className="w-6 h-6 rounded-xl shadow-sm" 
                style={{ backgroundColor: selectedCategory.color }}
              ></div>
              <h4 className="font-bold text-purple-900 text-lg">{selectedCategory.name}</h4>
            </div>
            <button
              onClick={() => setSelectedCategory(null)}
              className="p-2 text-purple-600 hover:text-purple-800 hover:bg-purple-100 rounded-xl transition-all"
            >
              <Icon name="X" size={18} />
            </button>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-xl shadow-sm">
              <div className="flex items-center space-x-2 mb-2">
                <Icon name="DollarSign" size={16} className="text-green-500" />
                <span className="text-purple-700 font-medium">Revenue</span>
              </div>
              <span className="text-2xl font-bold text-purple-900 font-mono">
                {formatCurrency(selectedCategory.revenue)}
              </span>
            </div>
            
            <div className="bg-white p-4 rounded-xl shadow-sm">
              <div className="flex items-center space-x-2 mb-2">
                <Icon name="PieChart" size={16} className="text-blue-500" />
                <span className="text-purple-700 font-medium">Market Share</span>
              </div>
              <span className="text-2xl font-bold text-purple-900">
                {formatPercentage(selectedCategory.displayPercentage)}
              </span>
            </div>
            
            {selectedCategory.orders && (
              <div className="bg-white p-4 rounded-xl shadow-sm">
                <div className="flex items-center space-x-2 mb-2">
                  <Icon name="Package" size={16} className="text-orange-500" />
                  <span className="text-purple-700 font-medium">Orders</span>
                </div>
                <span className="text-2xl font-bold text-purple-900">
                  {selectedCategory.orders?.toLocaleString()}
                </span>
              </div>
            )}
            
            {selectedCategory.avgOrderValue && (
              <div className="bg-white p-4 rounded-xl shadow-sm">
                <div className="flex items-center space-x-2 mb-2">
                  <Icon name="TrendingUp" size={16} className="text-purple-500" />
                  <span className="text-purple-700 font-medium">Avg Order</span>
                </div>
                <span className="text-2xl font-bold text-purple-900 font-mono">
                  {formatCurrency(selectedCategory.avgOrderValue)}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default RevenueByCategoryCard;