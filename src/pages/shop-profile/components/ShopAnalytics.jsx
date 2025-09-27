import React from 'react';
import { TrendingUp, TrendingDown, Users, Package, Star, Clock, Truck, ThumbsUp, Eye, Heart, MessageSquare, Award } from 'lucide-react';

const ShopAnalytics = ({ shop, products, reviews }) => {
  const formatNumber = (num) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num?.toString() || '0';
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-CM', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0,
    }).format(price || 0);
  };

  // Calculate metrics
  const totalProducts = products?.length || 0;
  const totalReviews = reviews?.length || 0;
  const averageRating = shop?.average_rating || 0;
  const totalSales = shop?.total_sales || 0;
  const monthlyGrowth = 15.3; // Mock data - would come from backend
  const responseTime = "< 2 hours";
  const satisfactionRate = Math.round(averageRating * 20);
  const totalViews = shop?.total_views || 0;
  const totalFavorites = shop?.total_favorites || 0;

  // Performance indicators
  const performanceMetrics = [
    {
      label: 'Total Revenue',
      value: formatPrice(totalSales),
      icon: TrendingUp,
      trend: '+12.5%',
      trendPositive: true,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      description: 'Last 30 days'
    },
    {
      label: 'Products Listed',
      value: totalProducts,
      icon: Package,
      trend: '+3 this week',
      trendPositive: true,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      description: 'Active listings'
    },
    {
      label: 'Customer Reviews',
      value: totalReviews,
      icon: Star,
      trend: averageRating.toFixed(1) + ' avg rating',
      trendPositive: averageRating >= 4,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      description: 'All time'
    },
    {
      label: 'Response Time',
      value: responseTime,
      icon: Clock,
      trend: 'Excellent',
      trendPositive: true,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      description: 'Average response'
    }
  ];

  // Customer metrics
  const customerMetrics = [
    {
      label: 'Shop Views',
      value: formatNumber(totalViews),
      icon: Eye,
      change: '+8.2%',
      positive: true
    },
    {
      label: 'Favorites',
      value: formatNumber(totalFavorites),
      icon: Heart,
      change: '+12.1%',
      positive: true
    },
    {
      label: 'Satisfaction',
      value: `${satisfactionRate}%`,
      icon: ThumbsUp,
      change: '+2.3%',
      positive: true
    },
    {
      label: 'Inquiries',
      value: formatNumber(shop?.total_inquiries || 0),
      icon: MessageSquare,
      change: '+5.7%',
      positive: true
    }
  ];

  // Recent achievements
  const achievements = [
    {
      title: 'Top Rated Seller',
      description: 'Maintained 4.5+ rating',
      icon: Award,
      color: 'text-yellow-500',
      earned: true
    },
    {
      title: 'Quick Responder',
      description: 'Responds within 2 hours',
      icon: Clock,
      color: 'text-green-500',
      earned: true
    },
    {
      title: 'Trusted Seller',
      description: '100+ successful sales',
      icon: Users,
      color: 'text-blue-500',
      earned: totalSales > 100000
    },
    {
      title: 'Premium Quality',
      description: 'High customer satisfaction',
      icon: ThumbsUp,
      color: 'text-purple-500',
      earned: satisfactionRate >= 80
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-500 to-blue-600 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Shop Performance</h2>
            <p className="text-teal-100">Track your shop's growth and customer satisfaction</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{formatPrice(totalSales)}</div>
            <div className="text-sm text-teal-100">Total Revenue</div>
          </div>
        </div>
      </div>

      {/* Main Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {performanceMetrics.map((metric, index) => {
          const IconComponent = metric.icon;
          return (
            <div key={index} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-lg ${metric.bgColor}`}>
                  <IconComponent size={24} className={metric.color} />
                </div>
                <div className={`flex items-center text-sm ${
                  metric.trendPositive ? 'text-green-600' : 'text-red-600'
                }`}>
                  {metric.trendPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                  <span className="ml-1">{metric.trend}</span>
                </div>
              </div>
              <div className="mb-2">
                <div className="text-2xl font-bold text-gray-900">{metric.value}</div>
                <div className="text-sm font-medium text-gray-700">{metric.label}</div>
              </div>
              <div className="text-xs text-gray-500">{metric.description}</div>
            </div>
          );
        })}
      </div>

      {/* Customer Engagement Metrics */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Customer Engagement</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {customerMetrics.map((metric, index) => {
            const IconComponent = metric.icon;
            return (
              <div key={index} className="text-center">
                <div className="flex justify-center mb-3">
                  <div className="p-3 bg-gray-50 rounded-full">
                    <IconComponent size={24} className="text-gray-600" />
                  </div>
                </div>
                <div className="text-xl font-bold text-gray-900 mb-1">{metric.value}</div>
                <div className="text-sm text-gray-600 mb-2">{metric.label}</div>
                <div className={`text-xs flex items-center justify-center ${
                  metric.positive ? 'text-green-600' : 'text-red-600'
                }`}>
                  {metric.positive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                  <span className="ml-1">{metric.change}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Achievements & Badges */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Achievements & Badges</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {achievements.map((achievement, index) => {
            const IconComponent = achievement.icon;
            return (
              <div key={index} className={`flex items-center p-4 rounded-lg border-2 transition-all ${
                achievement.earned
                  ? 'border-teal-200 bg-teal-50'
                  : 'border-gray-200 bg-gray-50 opacity-60'
              }`}>
                <div className={`p-3 rounded-full ${
                  achievement.earned ? 'bg-white' : 'bg-gray-100'
                }`}>
                  <IconComponent size={20} className={
                    achievement.earned ? achievement.color : 'text-gray-400'
                  } />
                </div>
                <div className="ml-4 flex-1">
                  <div className={`font-semibold ${
                    achievement.earned ? 'text-gray-900' : 'text-gray-500'
                  }`}>
                    {achievement.title}
                  </div>
                  <div className={`text-sm ${
                    achievement.earned ? 'text-gray-600' : 'text-gray-400'
                  }`}>
                    {achievement.description}
                  </div>
                </div>
                {achievement.earned && (
                  <div className="ml-2">
                    <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Shop Health Score */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Shop Health Score</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Overall Health</span>
            <span className="text-sm font-bold text-gray-900">85/100</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div className="bg-gradient-to-r from-teal-500 to-green-500 h-3 rounded-full" style={{width: '85%'}}></div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="text-center">
              <div className="text-lg font-bold text-green-600">92</div>
              <div className="text-xs text-gray-600">Customer Service</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-blue-600">88</div>
              <div className="text-xs text-gray-600">Product Quality</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-yellow-600">78</div>
              <div className="text-xs text-gray-600">Delivery Speed</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-purple-600">82</div>
              <div className="text-xs text-gray-600">Communication</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopAnalytics;