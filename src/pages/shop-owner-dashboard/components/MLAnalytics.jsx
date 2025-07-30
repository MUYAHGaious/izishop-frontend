import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ScatterChart, Scatter } from 'recharts';
import Icon from '../../../components/AppIcon';
import { SalesPredictor, CustomerAnalytics } from '../../../utils/mlAnalytics';
import api from '../../../services/api';
import notificationService from '../../../services/notificationService';

const MLAnalytics = ({ timeRange = '7d' }) => {
  const [loading, setLoading] = useState(true);
  const [predictions, setPredictions] = useState([]);
  const [insights, setInsights] = useState(null);
  const [customerSegments, setCustomerSegments] = useState([]);
  const [anomalies, setAnomalies] = useState([]);
  const [trendAnalysis, setTrendAnalysis] = useState(null);
  const [generatingNotifications, setGeneratingNotifications] = useState(false);

  useEffect(() => {
    const performMLAnalysis = async () => {
      try {
        setLoading(true);
        
        // Get sales data for ML analysis
        const salesData = await api.getShopOwnerSalesData(timeRange);
        const customersData = await api.getShopOwnerCustomers({ limit: 100 });
        
        // Check if we have real sales data (non-zero sales and realistic data)
        const hasRealSalesData = salesData && salesData.length > 0 && 
          salesData.some(data => data.sales > 0 && data.orders > 0);
        
        if (hasRealSalesData) {
          // Initialize ML models
          const salesPredictor = new SalesPredictor();
          const customerAnalytics = new CustomerAnalytics();
          
          // Set data and train models
          salesPredictor.setSalesData(salesData);
          
          // Generate predictions and insights
          const mlInsights = salesPredictor.generateInsights();
          const trendData = salesPredictor.calculateTrend();
          const salesPredictions = salesPredictor.predictSales(7);
          const detectedAnomalies = salesPredictor.detectAnomalies();
          
          // Customer analysis
          let segments = [];
          if (customersData.customers && customersData.customers.length > 0) {
            segments = customerAnalytics.rfmAnalysis(customersData.customers);
          }
          
          // Combine historical and predicted data for visualization
          const combinedData = [
            ...salesData.map(item => ({
              ...item,
              type: 'historical',
              predictedSales: null
            })),
            ...salesPredictions.map(item => ({
              ...item,
              sales: item.predictedSales,
              type: 'prediction'
            }))
          ];
          
          setPredictions(combinedData);
          setInsights(mlInsights);
          setCustomerSegments(segments);
          setAnomalies(detectedAnomalies);
          setTrendAnalysis(trendData);

          // Generate AI analytics notifications through the unified system
          const analyticsData = {
            salesHistory: salesData,
            customers: customersData.customers || [],
            daysActive: 30, // This should come from API
            todayStats: {
              today_sales: salesData[salesData.length - 1]?.sales || 0,
              today_orders: salesData[salesData.length - 1]?.orders || 0,
              sales_change: trendData?.trendStrength || 0
            },
            revenue: {
              current: salesData.reduce((sum, s) => sum + s.sales, 0)
            }
          };

          // Generate and send AI notifications to the main notification system
          setGeneratingNotifications(true);
          try {
            await notificationService.generateAndSendAINotifications(analyticsData);
            console.log('AI analytics notifications generated successfully');
          } catch (notificationError) {
            console.error('Failed to generate AI notifications:', notificationError);
          } finally {
            setGeneratingNotifications(false);
          }
        } else {
          // No real sales data available - reset all states to empty
          setPredictions([]);
          setInsights(null);
          setCustomerSegments([]);
          setAnomalies([]);
          setTrendAnalysis(null);
          console.log('No real sales data available for ML analysis');
        }
        
      } catch (error) {
        console.error('Error performing ML analysis:', error);
      } finally {
        setLoading(false);
      }
    };

    performMLAnalysis();
  }, [timeRange]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-CM', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat().format(num);
  };

  const getInsightIcon = (type) => {
    switch (type) {
      case 'opportunity': return 'TrendingUp';
      case 'warning': return 'AlertTriangle';
      case 'alert': return 'AlertCircle';
      default: return 'Info';
    }
  };

  const getInsightColor = (type) => {
    switch (type) {
      case 'opportunity': return 'text-green-600 bg-green-50 border-green-200';
      case 'warning': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'alert': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-lg">
          <p className="text-sm font-medium text-gray-900 mb-1">{label}</p>
          <p className="text-sm text-blue-600">
            Sales: {formatCurrency(data.sales || data.predictedSales)}
          </p>
          {data.type === 'prediction' && (
            <p className="text-xs text-gray-500">
              Confidence: {data.confidence}%
            </p>
          )}
          {data.orders && (
            <p className="text-sm text-green-600">
              Orders: {data.orders}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-48 mb-6"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded w-32"></div>
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded w-40"></div>
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Check if we have any meaningful data to show
  const hasData = predictions.length > 0 || insights || customerSegments.length > 0 || 
                  anomalies.length > 0 || trendAnalysis;

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200">
      <div className="flex items-center space-x-2 mb-6">
        <Icon name="Brain" size={20} className="text-purple-600" />
        <h3 className="text-lg font-semibold text-gray-900">AI-Powered Analytics</h3>
        <div className="px-2 py-1 bg-purple-100 text-purple-600 text-xs font-medium rounded-full">
          ML Insights
        </div>
        {generatingNotifications && (
          <div className="flex items-center space-x-1 px-2 py-1 bg-blue-100 text-blue-600 text-xs font-medium rounded-full">
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
            <span>Generating notifications...</span>
          </div>
        )}
      </div>

      {/* Empty state for new users */}
      {!loading && !hasData && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon name="TrendingUp" size={32} className="text-purple-600" />
          </div>
          <h4 className="text-lg font-medium text-gray-900 mb-2">No Sales Data Yet</h4>
          <p className="text-gray-600 mb-4 max-w-md mx-auto">
            Start making sales to unlock powerful AI insights about your business performance, 
            customer behavior, and sales predictions.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
            <h5 className="text-sm font-medium text-blue-800 mb-2">What you'll get:</h5>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Sales forecasting and trend analysis</li>
              <li>• Customer segmentation insights</li>
              <li>• Anomaly detection for unusual patterns</li>
              <li>• Personalized business recommendations</li>
            </ul>
          </div>
        </div>
      )}

      {/* Show analytics content only when we have data */}
      {!loading && hasData && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Predictions Chart */}
        <div className="space-y-4">
          <h4 className="text-md font-medium text-gray-900 flex items-center">
            <Icon name="TrendingUp" size={16} className="mr-2 text-blue-600" />
            Sales Forecast
          </h4>
          
          {predictions.length > 0 && (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={predictions}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12, fill: '#6B7280' }}
                    tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  />
                  <YAxis tick={{ fontSize: 12, fill: '#6B7280' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line 
                    type="monotone" 
                    dataKey="sales" 
                    stroke="#3B82F6" 
                    strokeWidth={2}
                    dot={(props) => {
                      const { payload } = props;
                      return payload.type === 'historical' ? 
                        <circle {...props} fill="#3B82F6" stroke="#3B82F6" strokeWidth={2} r={3} /> :
                        null;
                    }}
                    connectNulls={false}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="predictedSales" 
                    stroke="#10B981" 
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={(props) => {
                      const { payload } = props;
                      return payload.type === 'prediction' ? 
                        <circle {...props} fill="#10B981" stroke="#10B981" strokeWidth={2} r={3} /> :
                        null;
                    }}
                    connectNulls={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Trend Analysis */}
          {trendAnalysis && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h5 className="text-sm font-medium text-gray-900 mb-2">Trend Analysis</h5>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Direction:</span>
                  <span className={`ml-2 font-medium ${
                    trendAnalysis.direction === 'increasing' ? 'text-green-600' :
                    trendAnalysis.direction === 'decreasing' ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    {trendAnalysis.direction}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Strength:</span>
                  <span className="ml-2 font-medium text-gray-900">{trendAnalysis.strength}</span>
                </div>
                <div>
                  <span className="text-gray-600">Confidence:</span>
                  <span className="ml-2 font-medium text-blue-600">{Math.round(trendAnalysis.r2 * 100)}%</span>
                </div>
                <div>
                  <span className="text-gray-600">Growth Rate:</span>
                  <span className="ml-2 font-medium text-purple-600">{trendAnalysis.trendStrength}%</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Insights and Recommendations */}
        <div className="space-y-4">
          <h4 className="text-md font-medium text-gray-900 flex items-center">
            <Icon name="Lightbulb" size={16} className="mr-2 text-yellow-600" />
            AI Insights
          </h4>

          {/* Recommendations */}
          {insights?.recommendations && insights.recommendations.length > 0 && (
            <div className="space-y-3">
              {insights.recommendations.map((rec, index) => (
                <div key={index} className={`p-3 rounded-lg border ${getInsightColor(rec.type)}`}>
                  <div className="flex items-start space-x-2">
                    <Icon name={getInsightIcon(rec.type)} size={16} className="mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">{rec.message}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          rec.priority === 'high' ? 'bg-red-100 text-red-600' :
                          rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {rec.priority} priority
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Anomalies */}
          {anomalies.length > 0 && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <h5 className="text-sm font-medium text-orange-800 mb-2 flex items-center">
                <Icon name="AlertTriangle" size={14} className="mr-2" />
                Anomalies Detected
              </h5>
              <div className="space-y-2">
                {anomalies.slice(-3).map((anomaly, index) => (
                  <div key={index} className="text-sm text-orange-700">
                    <span className="font-medium">{new Date(anomaly.date).toLocaleDateString()}</span>
                    <span className="ml-2">
                      {anomaly.type === 'spike' ? '📈' : '📉'} 
                      {anomaly.type === 'spike' ? 'Sales spike' : 'Sales dip'} detected
                    </span>
                    <span className="ml-2 text-xs text-orange-600">
                      ({anomaly.severity} severity)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Customer Segments */}
          {customerSegments.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h5 className="text-sm font-medium text-blue-800 mb-3 flex items-center">
                <Icon name="Users" size={14} className="mr-2" />
                Customer Segments
              </h5>
              <div className="space-y-2">
                {Object.entries(
                  customerSegments.reduce((acc, customer) => {
                    acc[customer.segment] = (acc[customer.segment] || 0) + 1;
                    return acc;
                  }, {})
                ).slice(0, 4).map(([segment, count]) => (
                  <div key={segment} className="flex items-center justify-between text-sm">
                    <span className="text-blue-700">{segment}</span>
                    <span className="font-medium text-blue-800">{count} customers</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Prediction Summary */}
          {insights?.predictions && insights.predictions.length > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h5 className="text-sm font-medium text-green-800 mb-2 flex items-center">
                <Icon name="Target" size={14} className="mr-2" />
                7-Day Forecast
              </h5>
              <div className="text-sm text-green-700">
                <div className="flex justify-between">
                  <span>Predicted Revenue:</span>
                  <span className="font-medium">
                    {formatCurrency(insights.predictions.reduce((sum, p) => sum + p.predictedSales, 0))}
                  </span>
                </div>
                <div className="flex justify-between mt-1">
                  <span>Avg Confidence:</span>
                  <span className="font-medium">
                    {Math.round(insights.predictions.reduce((sum, p) => sum + p.confidence, 0) / insights.predictions.length)}%
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-center space-x-6 text-sm text-gray-500">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-0.5 bg-blue-500"></div>
            <span>Historical Data</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-0.5 bg-green-500 border-dashed"></div>
            <span>ML Predictions</span>
          </div>
          <div className="flex items-center space-x-2">
            <Icon name="Brain" size={12} className="text-purple-600" />
            <span>AI-Powered Insights</span>
          </div>
        </div>
      </div>
        </>
      )}
    </div>
  );
};

export default MLAnalytics;