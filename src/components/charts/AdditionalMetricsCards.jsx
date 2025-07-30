import React, { useState, useEffect } from 'react';
import Icon from '../AppIcon';

const AdditionalMetricsCards = ({ 
  analyticsData = {},
  loading = false,
  error = null,
  timeRange = '30d',
  onMetricClick = null,
  userRole = 'admin'
}) => {
  const [hoveredMetric, setHoveredMetric] = useState(null);
  const [expandedMetric, setExpandedMetric] = useState(null);

  // Calculate additional metrics from analytics data - ONLY USE REAL API DATA
  const calculateMetrics = () => {
    const { revenue, orders, users, shops } = analyticsData;
    
    // Check if we have any real data at all
    const hasRealData = (
      (revenue?.current > 0) || 
      (orders?.current > 0) || 
      (users?.current > 0) || 
      (shops?.current > 0)
    );
    
    if (!hasRealData) {
      return {
        conversionRate: { value: 0, growth: 0, format: 'percentage', icon: 'TrendingUp', color: 'blue', description: 'Orders to visitors ratio' },
        avgOrderValue: { value: 0, growth: 0, format: 'currency', icon: 'DollarSign', color: 'green', description: 'Average revenue per order' },
        retentionRate: { value: 0, growth: 0, format: 'percentage', icon: 'Users', color: 'purple', description: 'Customer return rate' },
        revenuePerUser: { value: 0, growth: 0, format: 'currency', icon: 'UserCheck', color: 'indigo', description: 'Revenue generated per user' },
        shopPerformance: { value: 0, growth: 0, format: 'score', icon: 'Star', color: 'yellow', description: 'Average shop performance score' },
        marketPenetration: { value: 0, growth: 0, format: 'percentage', icon: 'Target', color: 'pink', description: 'Market reach and adoption' }
      };
    }
    
    // ONLY calculate metrics if we have real API data provided explicitly
    // Conversion Rate: Use API data if available, otherwise 0
    const conversionRate = analyticsData?.conversion_rate?.current || 0;
    const conversionGrowth = analyticsData?.conversion_rate?.growth || 0;

    // Average Order Value: Use API data if available, otherwise calculate only if we have real data
    const avgOrderValue = analyticsData?.avg_order_value?.current || 
      (orders?.current > 0 && revenue?.current > 0 ? revenue.current / orders.current : 0);
    const aovGrowth = analyticsData?.avg_order_value?.growth || 0;

    // Customer Retention Rate: Use API data only
    const retentionRate = analyticsData?.retention_rate?.current || 0;
    const retentionGrowth = analyticsData?.retention_rate?.growth || 0;

    // Revenue per User: Use API data if available, otherwise calculate only if we have real data
    const revenuePerUser = analyticsData?.revenue_per_user?.current ||
      (users?.current > 0 && revenue?.current > 0 ? revenue.current / users.current : 0);
    const rpuGrowth = analyticsData?.revenue_per_user?.growth || 0;

    // Shop Performance Score: Use API data only
    const shopPerformanceScore = analyticsData?.shop_performance?.current || 0;
    const shopPerfGrowth = analyticsData?.shop_performance?.growth || 0;

    // Market Penetration: Use API data only
    const marketPenetration = analyticsData?.market_penetration?.current || 0;
    const marketPenGrowth = analyticsData?.market_penetration?.growth || 0;

    return {
      conversionRate: {
        value: conversionRate,
        growth: conversionGrowth,
        format: 'percentage',
        icon: 'TrendingUp',
        color: 'blue',
        description: 'Orders to visitors ratio'
      },
      avgOrderValue: {
        value: avgOrderValue,
        growth: aovGrowth,
        format: 'currency',
        icon: 'DollarSign',
        color: 'green',
        description: 'Average revenue per order'
      },
      retentionRate: {
        value: retentionRate,
        growth: retentionGrowth,
        format: 'percentage',
        icon: 'Users',
        color: 'purple',
        description: 'Customer return rate'
      },
      revenuePerUser: {
        value: revenuePerUser,
        growth: rpuGrowth,
        format: 'currency',
        icon: 'UserCheck',
        color: 'indigo',
        description: 'Revenue generated per user'
      },
      shopPerformance: {
        value: shopPerformanceScore,
        growth: shopPerfGrowth,
        format: 'score',
        icon: 'Star',
        color: 'yellow',
        description: 'Average shop performance score'
      },
      marketPenetration: {
        value: marketPenetration,
        growth: marketPenGrowth,
        format: 'percentage',
        icon: 'Target',
        color: 'pink',
        description: 'Market reach and adoption'
      }
    };
  };

  const metrics = calculateMetrics();

  // Format value based on type
  const formatValue = (value, format) => {
    if (value === null || value === undefined || typeof value !== 'number') {
      switch (format) {
        case 'currency':
          return 'XAF 0';
        case 'percentage':
          return '0.0%';
        case 'score':
          return '0.0/100';
        default:
          return '0';
      }
    }
    
    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('fr-CM', {
          style: 'currency',
          currency: 'XAF',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0
        }).format(value);
      case 'percentage':
        return `${value.toFixed(1)}%`;
      case 'score':
        return `${value.toFixed(1)}/100`;
      default:
        return value.toLocaleString();
    }
  };

  // Format growth
  const formatGrowth = (growth) => {
    if (growth === 0 || growth === null || growth === undefined || typeof growth !== 'number') return '-';
    return `${growth >= 0 ? '+' : ''}${growth.toFixed(1)}%`;
  };

  // Get color classes
  const getColorClasses = (color, isBackground = false) => {
    const colorMap = {
      blue: isBackground ? 'bg-blue-100' : 'text-blue-600',
      green: isBackground ? 'bg-green-100' : 'text-green-600',
      purple: isBackground ? 'bg-purple-100' : 'text-purple-600',
      indigo: isBackground ? 'bg-indigo-100' : 'text-indigo-600',
      yellow: isBackground ? 'bg-yellow-100' : 'text-yellow-600',
      pink: isBackground ? 'bg-pink-100' : 'text-pink-600'
    };
    return colorMap[color] || (isBackground ? 'bg-gray-100' : 'text-gray-600');
  };

  // Get growth color
  const getGrowthColor = (growth) => {
    if (growth > 0) return 'text-green-600';
    if (growth < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  // Get growth icon
  const getGrowthIcon = (growth) => {
    if (growth > 0) return 'TrendingUp';
    if (growth < 0) return 'TrendingDown';
    return 'Minus';
  };

  // Handle metric click
  const handleMetricClick = (metricKey, metric) => {
    setExpandedMetric(expandedMetric === metricKey ? null : metricKey);
    onMetricClick?.(metricKey, metric);
  };

  // Get metric insights
  const getMetricInsight = (metricKey, metric) => {
    const insights = {
      conversionRate: {
        good: metric.value >= 3,
        insight: metric.value >= 3 
          ? 'Excellent conversion rate! Your platform is effectively converting visitors to customers.'
          : metric.value >= 1.5
          ? 'Good conversion rate with room for improvement. Consider optimizing the checkout process.'
          : 'Low conversion rate. Focus on user experience and product presentation improvements.'
      },
      avgOrderValue: {
        good: metric.value >= 100000,
        insight: metric.value >= 100000
          ? 'Strong average order value indicates customers are purchasing higher-value items.'
          : metric.value >= 50000
          ? 'Moderate order value. Consider upselling and cross-selling strategies.'
          : 'Low order value. Focus on promoting higher-value products and bundles.'
      },
      retentionRate: {
        good: metric.value >= 70,
        insight: metric.value >= 70
          ? 'Great customer retention! Your customers are highly satisfied and returning.'
          : metric.value >= 60
          ? 'Good retention rate. Implement loyalty programs to improve further.'
          : 'Focus on customer satisfaction and retention strategies to reduce churn.'
      },
      revenuePerUser: {
        good: metric.value >= 25000,
        insight: metric.value >= 25000
          ? 'High revenue per user shows strong monetization and customer value.'
          : metric.value >= 10000
          ? 'Moderate revenue per user. Explore personalization to increase spending.'
          : 'Low revenue per user. Focus on engagement and value proposition improvements.'
      },
      shopPerformance: {
        good: metric.value >= 70,
        insight: metric.value >= 70
          ? 'Shops are performing excellently with strong sales and customer satisfaction.'
          : metric.value >= 50
          ? 'Good shop performance overall. Support underperforming shops with resources.'
          : 'Shop performance needs attention. Consider training and support programs.'
      },
      marketPenetration: {
        good: metric.value >= 20,
        insight: metric.value >= 20
          ? 'Strong market penetration indicates effective reach and brand awareness.'
          : metric.value >= 15
          ? 'Growing market presence. Continue marketing efforts to expand reach.'
          : 'Low market penetration. Invest in marketing and customer acquisition strategies.'
      }
    };
    
    return insights[metricKey] || { good: true, insight: 'Metric is being tracked.' };
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="animate-pulse">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
              <div className="h-3 bg-gray-200 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6">
        <div className="flex items-center space-x-3">
          <Icon name="AlertTriangle" size={24} className="text-red-600" />
          <div>
            <h3 className="text-lg font-semibold text-red-900">Error Loading Metrics</h3>
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.entries(metrics).map(([key, metric]) => {
          const insight = getMetricInsight(key, metric);
          const isExpanded = expandedMetric === key;
          
          return (
            <div
              key={key}
              className={`bg-white rounded-xl p-6 border transition-all duration-200 cursor-pointer ${
                isExpanded 
                  ? 'border-blue-300 shadow-lg' 
                  : hoveredMetric === key
                  ? 'border-gray-300 shadow-md'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onMouseEnter={() => setHoveredMetric(key)}
              onMouseLeave={() => setHoveredMetric(null)}
              onClick={() => handleMetricClick(key, metric)}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getColorClasses(metric.color, true)}`}>
                    <Icon name={metric.icon} size={20} className={getColorClasses(metric.color)} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatValue(metric.value, metric.format)}
                    </p>
                  </div>
                </div>
                
                {/* Growth Indicator */}
                <div className="flex items-center space-x-1">
                  <Icon 
                    name={getGrowthIcon(metric.growth)} 
                    size={16} 
                    className={getGrowthColor(metric.growth)} 
                  />
                  <span className={`text-sm font-medium ${getGrowthColor(metric.growth)}`}>
                    {formatGrowth(metric.growth)}
                  </span>
                </div>
              </div>
              
              {/* Description */}
              <p className="text-sm text-gray-500 mb-3">{metric.description}</p>
              
              {/* Performance Indicator */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${
                    insight.good ? 'bg-green-400' : 'bg-yellow-400'
                  }`}></div>
                  <span className={`text-xs font-medium ${
                    insight.good ? 'text-green-600' : 'text-yellow-600'
                  }`}>
                    {insight.good ? 'Performing Well' : 'Needs Attention'}
                  </span>
                </div>
                
                <Icon 
                  name={isExpanded ? 'ChevronUp' : 'ChevronDown'} 
                  size={16} 
                  className="text-gray-400" 
                />
              </div>
              
              {/* Expanded Content */}
              {isExpanded && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="space-y-3">
                    {/* Insight */}
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <h5 className="text-sm font-medium text-gray-900 mb-1">Insight</h5>
                      <p className="text-xs text-gray-600">{insight.insight}</p>
                    </div>
                    
                    {/* Time Range Info */}
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Time Range:</span>
                      <span className="font-medium">{timeRange.toUpperCase()}</span>
                    </div>
                    
                    {/* Comparison */}
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>vs Previous Period:</span>
                      <span className={`font-medium ${getGrowthColor(metric.growth)}`}>
                        {formatGrowth(metric.growth)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {/* Summary Card */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <Icon name="BarChart3" size={24} className="text-blue-600" />
          </div>
          
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">Performance Summary</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="bg-white/60 rounded-lg p-3">
                <h4 className="text-sm font-medium text-blue-800 mb-1">Top Performing</h4>
                <p className="text-xs text-blue-700">
                  {Object.entries(metrics)
                    .sort(([,a], [,b]) => b.growth - a.growth)[0]?.[0]
                    ?.replace(/([A-Z])/g, ' $1').trim() || 'N/A'}
                </p>
              </div>
              
              <div className="bg-white/60 rounded-lg p-3">
                <h4 className="text-sm font-medium text-blue-800 mb-1">Needs Focus</h4>
                <p className="text-xs text-blue-700">
                  {Object.entries(metrics)
                    .sort(([,a], [,b]) => a.growth - b.growth)[0]?.[0]
                    ?.replace(/([A-Z])/g, ' $1').trim() || 'N/A'}
                </p>
              </div>
              
              <div className="bg-white/60 rounded-lg p-3">
                <h4 className="text-sm font-medium text-blue-800 mb-1">Overall Health</h4>
                <p className="text-xs text-blue-700">
                  {Object.values(metrics).filter(m => getMetricInsight('', m).good).length} of {Object.keys(metrics).length} metrics healthy
                </p>
              </div>
            </div>
            
            <p className="text-sm text-blue-800">
              📊 Your platform is showing {Object.values(metrics).filter(m => m.growth > 0).length} positive growth trends out of {Object.keys(metrics).length} key metrics. 
              {Object.values(metrics).every(m => m.growth >= 0) 
                ? 'Excellent performance across all areas!' 
                : 'Focus on underperforming areas for balanced growth.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdditionalMetricsCards;