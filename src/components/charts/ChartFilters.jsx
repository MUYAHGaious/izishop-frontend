import React, { useState, useEffect } from 'react';
import Icon from '../AppIcon';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';

const ChartFilters = ({
  onFiltersChange,
  initialFilters = {},
  showTimeRange = true,
  showMetricType = true,
  showShopFilter = false,
  showCategoryFilter = true,
  showRegionFilter = true,
  showGranularity = true,
  availableShops = [],
  availableCategories = [],
  availableRegions = [],
  userRole = 'admin'
}) => {
  const [filters, setFilters] = useState({
    timeRange: '24h',
    metricType: 'revenue',
    granularity: 'auto',
    shopId: null,
    categoryId: null,
    region: null,
    customStartDate: null,
    customEndDate: null,
    ...initialFilters
  });
  
  const [showCustomDateRange, setShowCustomDateRange] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const timeRangeOptions = [
    { value: '1h', label: 'Last Hour', icon: 'Clock' },
    { value: '24h', label: 'Last 24 Hours', icon: 'Calendar' },
    { value: '7d', label: 'Last 7 Days', icon: 'Calendar' },
    { value: '30d', label: 'Last 30 Days', icon: 'Calendar' },
    { value: '90d', label: 'Last 3 Months', icon: 'Calendar' },
    { value: 'custom', label: 'Custom Range', icon: 'Settings' }
  ];

  const metricTypeOptions = [
    { value: 'revenue', label: 'Revenue', icon: 'DollarSign', color: 'text-green-600' },
    { value: 'orders', label: 'Orders', icon: 'ShoppingBag', color: 'text-blue-600' },
    { value: 'users', label: 'Users', icon: 'Users', color: 'text-purple-600' },
    { value: 'sessions', label: 'Sessions', icon: 'Activity', color: 'text-orange-600' },
    { value: 'conversion', label: 'Conversion Rate', icon: 'TrendingUp', color: 'text-indigo-600' },
    { value: 'average_order_value', label: 'Avg Order Value', icon: 'Target', color: 'text-pink-600' }
  ];

  const granularityOptions = [
    { value: 'auto', label: 'Auto' },
    { value: 'hourly', label: 'Hourly' },
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' }
  ];

  // Filter metric types based on user role
  const availableMetricTypes = metricTypeOptions.filter(option => {
    if (userRole === 'shop_owner') {
      return ['revenue', 'orders', 'conversion', 'average_order_value'].includes(option.value);
    }
    return true; // Admin can see all metrics
  });

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    
    // Handle special cases
    if (key === 'timeRange') {
      if (value === 'custom') {
        setShowCustomDateRange(true);
      } else {
        setShowCustomDateRange(false);
        newFilters.customStartDate = null;
        newFilters.customEndDate = null;
      }
      
      // Auto-adjust granularity based on time range
      if (newFilters.granularity === 'auto') {
        if (['1h', '24h'].includes(value)) {
          newFilters.granularity = 'hourly';
        } else if (['7d', '30d'].includes(value)) {
          newFilters.granularity = 'daily';
        } else if (value === '90d') {
          newFilters.granularity = 'weekly';
        }
      }
    }
    
    setFilters(newFilters);
    onFiltersChange?.(newFilters);
  };

  // Handle custom date range
  const handleCustomDateChange = (type, date) => {
    const newFilters = { ...filters, [type]: date };
    setFilters(newFilters);
    onFiltersChange?.(newFilters);
  };

  // Reset filters
  const resetFilters = () => {
    const defaultFilters = {
      timeRange: '24h',
      metricType: 'revenue',
      granularity: 'auto',
      shopId: null,
      categoryId: null,
      region: null,
      customStartDate: null,
      customEndDate: null
    };
    setFilters(defaultFilters);
    setShowCustomDateRange(false);
    onFiltersChange?.(defaultFilters);
  };

  // Quick time range buttons
  const quickTimeRanges = [
    { label: 'Today', getValue: () => 'custom', startDate: startOfDay(new Date()), endDate: endOfDay(new Date()) },
    { label: 'Yesterday', getValue: () => 'custom', startDate: startOfDay(subDays(new Date(), 1)), endDate: endOfDay(subDays(new Date(), 1)) },
    { label: 'This Week', getValue: () => '7d' },
    { label: 'This Month', getValue: () => '30d' }
  ];

  // Get current filter summary
  const getFilterSummary = () => {
    const parts = [];
    
    if (filters.timeRange !== '24h') {
      const timeOption = timeRangeOptions.find(opt => opt.value === filters.timeRange);
      parts.push(timeOption?.label || filters.timeRange);
    }
    
    if (filters.shopId && availableShops.length > 0) {
      const shop = availableShops.find(s => s.id === parseInt(filters.shopId));
      parts.push(`Shop: ${shop?.name || filters.shopId}`);
    }
    
    if (filters.categoryId && availableCategories.length > 0) {
      const category = availableCategories.find(c => c.id === parseInt(filters.categoryId));
      parts.push(`Category: ${category?.name || filters.categoryId}`);
    }
    
    if (filters.region) {
      parts.push(`Region: ${filters.region}`);
    }
    
    return parts.length > 0 ? parts.join(' • ') : 'Default filters';
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
      {/* Filter Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <Icon name="Filter" size={20} className="text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Chart Filters</h3>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 text-gray-500 hover:text-gray-700 transition-colors"
          >
            <Icon name={isExpanded ? 'ChevronUp' : 'ChevronDown'} size={16} />
          </button>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">{getFilterSummary()}</span>
          <button
            onClick={resetFilters}
            className="px-3 py-1 text-sm bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition-colors"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        {quickTimeRanges.map((range, index) => (
          <button
            key={index}
            onClick={() => {
              if (range.startDate && range.endDate) {
                handleFilterChange('timeRange', 'custom');
                handleCustomDateChange('customStartDate', format(range.startDate, 'yyyy-MM-dd'));
                handleCustomDateChange('customEndDate', format(range.endDate, 'yyyy-MM-dd'));
              } else {
                handleFilterChange('timeRange', range.getValue());
              }
            }}
            className="px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition-colors"
          >
            {range.label}
          </button>
        ))}
      </div>

      {/* Expanded Filters */}
      {isExpanded && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {/* Time Range */}
            {showTimeRange && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Time Range
                </label>
                <select
                  value={filters.timeRange}
                  onChange={(e) => handleFilterChange('timeRange', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {timeRangeOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Metric Type */}
            {showMetricType && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Metric Type
                </label>
                <select
                  value={filters.metricType}
                  onChange={(e) => handleFilterChange('metricType', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {availableMetricTypes.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Granularity */}
            {showGranularity && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Granularity
                </label>
                <select
                  value={filters.granularity}
                  onChange={(e) => handleFilterChange('granularity', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {granularityOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Shop Filter */}
            {showShopFilter && availableShops.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Shop
                </label>
                <select
                  value={filters.shopId || ''}
                  onChange={(e) => handleFilterChange('shopId', e.target.value || null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Shops</option>
                  {availableShops.map(shop => (
                    <option key={shop.id} value={shop.id}>
                      {shop.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Category Filter */}
            {showCategoryFilter && availableCategories.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={filters.categoryId || ''}
                  onChange={(e) => handleFilterChange('categoryId', e.target.value || null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Categories</option>
                  {availableCategories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Region Filter */}
            {showRegionFilter && availableRegions.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Region
                </label>
                <select
                  value={filters.region || ''}
                  onChange={(e) => handleFilterChange('region', e.target.value || null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Regions</option>
                  {availableRegions.map(region => (
                    <option key={region} value={region}>
                      {region}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Custom Date Range */}
          {showCustomDateRange && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  value={filters.customStartDate || ''}
                  onChange={(e) => handleCustomDateChange('customStartDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  value={filters.customEndDate || ''}
                  onChange={(e) => handleCustomDateChange('customEndDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Active Filters Display */}
      <div className="flex flex-wrap items-center gap-2 mt-4">
        {Object.entries(filters).map(([key, value]) => {
          if (!value || value === 'auto' || (key === 'timeRange' && value === '24h')) return null;
          
          let displayValue = value;
          let displayKey = key;
          
          // Format display values
          if (key === 'timeRange') {
            const timeOption = timeRangeOptions.find(opt => opt.value === value);
            displayValue = timeOption?.label || value;
            displayKey = 'Time';
          } else if (key === 'metricType') {
            const metricOption = availableMetricTypes.find(opt => opt.value === value);
            displayValue = metricOption?.label || value;
            displayKey = 'Metric';
          } else if (key === 'shopId' && availableShops.length > 0) {
            const shop = availableShops.find(s => s.id === parseInt(value));
            displayValue = shop?.name || value;
            displayKey = 'Shop';
          } else if (key === 'categoryId' && availableCategories.length > 0) {
            const category = availableCategories.find(c => c.id === parseInt(value));
            displayValue = category?.name || value;
            displayKey = 'Category';
          }
          
          return (
            <span
              key={key}
              className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
            >
              <span className="font-medium">{displayKey}:</span>
              <span className="ml-1">{displayValue}</span>
              <button
                onClick={() => handleFilterChange(key, key === 'timeRange' ? '24h' : null)}
                className="ml-1 text-blue-600 hover:text-blue-800"
              >
                <Icon name="X" size={12} />
              </button>
            </span>
          );
        })}
      </div>
    </div>
  );
};

export default ChartFilters;