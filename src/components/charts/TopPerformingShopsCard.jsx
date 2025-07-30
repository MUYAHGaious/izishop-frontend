import React, { useState, useEffect } from 'react';
import Icon from '../AppIcon';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { useNavigate } from 'react-router-dom';

const TopPerformingShopsCard = ({ 
  data = [], 
  loading = false, 
  error = null, 
  timeRange = '30d',
  maxShops = 10,
  onShopClick = null,
  showChart = true,
  sortBy = 'revenue', // 'revenue', 'orders', 'growth'
  userRole = 'admin',
  realTimeEnabled = true,
  lastUpdated = new Date()
}) => {
  const navigate = useNavigate();
  const [selectedShop, setSelectedShop] = useState(null);
  const [sortCriteria, setSortCriteria] = useState(sortBy);
  const [viewMode, setViewMode] = useState('list'); // 'list', 'chart', 'grid'
  const [expandedView, setExpandedView] = useState(false);

  // Process and sort data - ONLY USE REAL API DATA
  const processedData = React.useMemo(() => {
    if (!data || data.length === 0) {
      return [];
    }
    
    // Filter out shops with no real data (all zeros)
    const realShopsData = data.filter(shop => 
      (shop.revenue && shop.revenue > 0) || 
      (shop.orders && shop.orders > 0) ||
      (shop.growth && shop.growth !== 0)
    );
    
    if (realShopsData.length === 0) {
      return [];
    }
    
    const sortedData = [...realShopsData].sort((a, b) => {
      switch (sortCriteria) {
        case 'revenue':
          return (b.revenue || 0) - (a.revenue || 0);
        case 'orders':
          return (b.orders || 0) - (a.orders || 0);
        case 'growth':
          return (b.growth || 0) - (a.growth || 0);
        default:
          return (b.revenue || 0) - (a.revenue || 0);
      }
    });
    
    return sortedData.slice(0, maxShops).map((shop, index) => ({
      ...shop,
      rank: index + 1,
      rankChange: shop.previousRank ? shop.previousRank - (index + 1) : 0
    }));
  }, [data, sortCriteria, maxShops]);

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

  // Format number
  const formatNumber = (num) => {
    if (num === null || num === undefined) return '0';
    if (num === 0) return '0';
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toLocaleString();
  };

  // Format percentage
  const formatPercentage = (value) => {
    if (value === 0 || value === null || value === undefined) return '-';
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  // Handle shop click
  const handleShopClick = (shop) => {
    setSelectedShop(selectedShop?.id === shop.id ? null : shop);
    onShopClick?.(shop);
    
    // Navigate to shop profile if admin
    if (userRole === 'admin' && shop.id) {
      navigate(`/admin/shops/${shop.id}`);
    }
  };

  // Get rank indicator
  const getRankIndicator = (rankChange) => {
    if (rankChange > 0) {
      return { icon: 'TrendingUp', color: 'text-green-500', text: `+${rankChange}` };
    } else if (rankChange < 0) {
      return { icon: 'TrendingDown', color: 'text-red-500', text: `${rankChange}` };
    }
    return { icon: 'Minus', color: 'text-gray-400', text: '-' };
  };

  // Get performance badge
  const getPerformanceBadge = (shop) => {
    const growth = shop.growth || 0;
    if (growth >= 20) {
      return { label: 'Excellent', color: 'bg-green-100 text-green-800' };
    } else if (growth >= 10) {
      return { label: 'Good', color: 'bg-blue-100 text-blue-800' };
    } else if (growth >= 0) {
      return { label: 'Stable', color: 'bg-yellow-100 text-yellow-800' };
    } else {
      return { label: 'Declining', color: 'bg-red-100 text-red-800' };
    }
  };

  // Custom tooltip for chart
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
          <div className="font-semibold text-gray-900 mb-2">{data.name}</div>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Revenue:</span>
              <span className="font-medium">{formatCurrency(data.revenue)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Orders:</span>
              <span className="font-medium">{formatNumber(data.orders)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Growth:</span>
              <span className={`font-medium ${
                data.growth >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {formatPercentage(data.growth)}
              </span>
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
          <h3 className="text-lg font-semibold text-gray-900">Top Performing Shops</h3>
          <div className="animate-pulse w-8 h-8 bg-gray-200 rounded"></div>
        </div>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="animate-pulse flex items-center space-x-4">
              <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
              <div className="w-20 h-4 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Top Performing Shops</h3>
          <Icon name="AlertTriangle" size={20} className="text-red-500" />
        </div>
        <div className="flex items-center justify-center h-64 text-center">
          <div>
            <Icon name="AlertTriangle" size={48} className="text-red-400 mx-auto mb-2" />
            <p className="text-red-600 font-medium">Error loading shops</p>
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
          <h3 className="text-lg font-semibold text-gray-900">Top Performing Shops</h3>
          <Icon name="Store" size={20} className="text-gray-400" />
        </div>
        <div className="flex items-center justify-center h-64 text-center">
          <div>
            <Icon name="Store" size={48} className="text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600 font-medium">No shop data available</p>
            <p className="text-gray-500 text-sm">Shop performance data will appear here</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Modern Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <Icon name="TrendingUp" size={20} className="text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Top Performing Shops</h3>
              <p className="text-sm text-gray-600">
                Ranked by {sortCriteria} • {timeRange.toUpperCase()}
              </p>
            </div>
          </div>
          
          {realTimeEnabled && (
            <div className="flex items-center space-x-2 bg-green-50 px-3 py-1.5 rounded-full">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-xs font-medium text-green-700">Live</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center justify-between mt-4">
          {/* Sort dropdown */}
          <select
            value={sortCriteria}
            onChange={(e) => setSortCriteria(e.target.value)}
            className="px-4 py-2 text-sm border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
          >
            <option value="revenue">💰 Revenue</option>
            <option value="orders">📦 Orders</option>
            <option value="growth">📈 Growth</option>
          </select>
          
          <div className="flex items-center space-x-2">
            {/* View mode toggle */}
            <div className="flex bg-white rounded-xl p-1 shadow-sm border border-gray-200">
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  viewMode === 'list'
                    ? 'bg-blue-100 text-blue-700 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
                title="List View"
              >
                <Icon name="List" size={16} />
              </button>
              <button
                onClick={() => setViewMode('chart')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  viewMode === 'chart'
                    ? 'bg-blue-100 text-blue-700 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
                title="Chart View"
              >
                <Icon name="BarChart" size={16} />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  viewMode === 'grid'
                    ? 'bg-blue-100 text-blue-700 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
                title="Grid View"
              >
                <Icon name="Grid" size={16} />
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
      </div>

      {/* Content */}
      <div className={`${expandedView ? 'min-h-96' : 'min-h-72'} p-6 transition-all duration-300`}>
        {viewMode === 'chart' && showChart ? (
          <div className="h-full">
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
                  tickFormatter={(value) => {
                    if (sortCriteria === 'revenue') {
                      return formatCurrency(value).replace('XAF', '').trim();
                    }
                    return formatNumber(value);
                  }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey={sortCriteria} 
                  fill="#3B82F6" 
                  radius={[4, 4, 0, 0]}
                  onClick={handleShopClick}
                  className="cursor-pointer"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="h-full overflow-y-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {processedData.map((shop, index) => {
                const performance = getPerformanceBadge(shop);
                const rankIndicator = getRankIndicator(shop.rankChange);
                
                return (
                  <div
                    key={shop.id}
                    onClick={() => handleShopClick(shop)}
                    className={`relative p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1 ${
                      selectedShop?.id === shop.id
                        ? 'border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-md'
                        : 'border-gray-100 hover:border-blue-200 bg-white'
                    }`}
                  >
                    {/* Real-time indicator */}
                    {realTimeEnabled && (
                      <div className="absolute top-3 right-3">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      </div>
                    )}
                    
                    {/* Header */}
                    <div className="flex items-center justify-between mb-3">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                        index < 3 
                          ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white' 
                          : 'bg-gradient-to-br from-gray-100 to-gray-200 text-gray-700'
                      }`}>
                        <span className="text-sm font-bold">#{shop.rank}</span>
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${performance.color}`}>
                        {performance.label}
                      </span>
                    </div>
                    
                    {/* Shop Name */}
                    <h4 className="font-bold text-gray-900 mb-3 text-base truncate" title={shop.name}>
                      {shop.name}
                    </h4>
                    
                    {/* Metrics */}
                    <div className="space-y-3">
                      <div className="bg-gray-50 p-3 rounded-xl">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-gray-600 text-sm">Revenue</span>
                          <Icon name="DollarSign" size={14} className="text-green-500" />
                        </div>
                        <span className="font-bold text-gray-900 font-mono text-lg">
                          {formatCurrency(shop.revenue)}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-blue-50 p-2 rounded-lg text-center">
                          <div className="text-xs text-blue-600 mb-1">Orders</div>
                          <div className="font-bold text-blue-700 font-mono">
                            {formatNumber(shop.orders)}
                          </div>
                        </div>
                        <div className={`p-2 rounded-lg text-center ${
                          shop.growth >= 0 ? 'bg-green-50' : 'bg-red-50'
                        }`}>
                          <div className={`text-xs mb-1 ${
                            shop.growth >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>Growth</div>
                          <div className={`font-bold font-mono ${
                            shop.growth >= 0 ? 'text-green-700' : 'text-red-700'
                          }`}>
                            {formatPercentage(shop.growth)}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Rank Change */}
                    <div className="flex items-center justify-center mt-3 pt-3 border-t border-gray-100">
                      <Icon name={rankIndicator.icon} size={14} className={rankIndicator.color} />
                      <span className={`ml-1 text-sm font-medium ${rankIndicator.color}`}>
                        {rankIndicator.text}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="h-full overflow-y-auto">
            <div className="space-y-3">
              {processedData.map((shop, index) => {
                const performance = getPerformanceBadge(shop);
                const rankIndicator = getRankIndicator(shop.rankChange);
                
                return (
                  <div
                    key={shop.id}
                    onClick={() => handleShopClick(shop)}
                    className={`group relative p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 ${
                      selectedShop?.id === shop.id
                        ? 'border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-md'
                        : 'border-gray-100 hover:border-blue-200 bg-white'
                    }`}
                  >
                    {/* Real-time indicator */}
                    {realTimeEnabled && (
                      <div className="absolute top-3 right-3 flex items-center space-x-1">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        <span className="text-xs text-green-600 font-medium">Live</span>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between">
                      {/* Left side - Rank and Shop Info */}
                      <div className="flex items-center space-x-4 flex-1 min-w-0">
                        {/* Rank Badge */}
                        <div className="flex flex-col items-center space-y-1">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                            index < 3 
                              ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white' 
                              : 'bg-gradient-to-br from-gray-100 to-gray-200 text-gray-700'
                          }`}>
                            <span className="text-lg font-bold">#{shop.rank}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Icon name={rankIndicator.icon} size={12} className={rankIndicator.color} />
                            <span className={`text-xs font-medium ${rankIndicator.color}`}>
                              {rankIndicator.text}
                            </span>
                          </div>
                        </div>
                        
                        {/* Shop Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className="font-bold text-gray-900 text-lg truncate" title={shop.name}>
                              {shop.name}
                            </h4>
                            <span className={`px-3 py-1 text-xs font-medium rounded-full ${performance.color}`}>
                              {performance.label}
                            </span>
                          </div>
                          
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <div className="flex items-center space-x-1">
                              <Icon name="Package" size={14} className="text-blue-500" />
                              <span>{formatNumber(shop.orders)} orders</span>
                            </div>
                            {shop.averageOrderValue && (
                              <div className="flex items-center space-x-1">
                                <Icon name="DollarSign" size={14} className="text-green-500" />
                                <span>AOV: {formatCurrency(shop.averageOrderValue)}</span>
                              </div>
                            )}
                            {shop.rating && (
                              <div className="flex items-center space-x-1">
                                <Icon name="Star" size={14} className="text-yellow-500" />
                                <span>{shop.rating.toFixed(1)}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {/* Right side - Metrics */}
                      <div className="text-right">
                        <div className="bg-gray-50 px-4 py-3 rounded-xl">
                          <p className="font-bold text-gray-900 text-xl font-mono mb-1">
                            {sortCriteria === 'revenue' ? formatCurrency(shop.revenue) : 
                             sortCriteria === 'orders' ? formatNumber(shop.orders) :
                             formatPercentage(shop.growth)}
                          </p>
                          <div className="flex items-center justify-end space-x-1">
                            <Icon 
                              name={shop.growth >= 0 ? 'TrendingUp' : 'TrendingDown'} 
                              size={16} 
                              className={shop.growth >= 0 ? 'text-green-500' : 'text-red-500'} 
                            />
                            <span className={`text-sm font-semibold ${
                              shop.growth >= 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {formatPercentage(shop.growth)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Selected Shop Details */}
      {selectedShop && (
        <div className="mt-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Icon name="Store" size={16} className="text-purple-600" />
              <h4 className="font-semibold text-purple-900">{selectedShop.name}</h4>
              <span className="text-sm text-purple-600">Rank #{selectedShop.rank}</span>
            </div>
            <button
              onClick={() => setSelectedShop(null)}
              className="text-purple-600 hover:text-purple-800"
            >
              <Icon name="X" size={16} />
            </button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-purple-700">Revenue:</span>
              <div className="font-medium text-purple-900">
                {formatCurrency(selectedShop.revenue)}
              </div>
            </div>
            <div>
              <span className="text-purple-700">Orders:</span>
              <div className="font-medium text-purple-900">
                {formatNumber(selectedShop.orders)}
              </div>
            </div>
            <div>
              <span className="text-purple-700">Growth:</span>
              <div className={`font-medium ${
                selectedShop.growth >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {formatPercentage(selectedShop.growth)}
              </div>
            </div>
            {selectedShop.rating && (
              <div>
                <span className="text-purple-700">Rating:</span>
                <div className="flex items-center space-x-1">
                  <Icon name="Star" size={14} className="text-yellow-400" />
                  <span className="font-medium text-purple-900">
                    {selectedShop.rating.toFixed(1)}
                  </span>
                </div>
              </div>
            )}
          </div>
          
          {userRole === 'admin' && (
            <div className="mt-3 pt-3 border-t border-purple-200">
              <button
                onClick={() => navigate(`/admin/shops/${selectedShop.id}`)}
                className="inline-flex items-center space-x-2 text-sm text-purple-600 hover:text-purple-800"
              >
                <Icon name="ExternalLink" size={14} />
                <span>View Shop Details</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TopPerformingShopsCard;