import React, { useState, useRef, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import api from '../../../services/api';
import { showToast } from '../../../components/ui/Toast';

const SystemReportModal = ({ isOpen, onClose }) => {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const exportMenuRef = useRef(null);

  // Close export menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target)) {
        setShowExportMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const generateReport = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await api.generateSystemReport();
      setReportData(data);
    } catch (err) {
      setError(err.message || 'Failed to generate system report');
      console.error('System report generation error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Enhanced export functionality
  const handleExportReport = async (format = 'json') => {
    if (!reportData) return;

    try {
      setIsExporting(true);
      setShowExportMenu(false);

      switch (format) {
        case 'pdf':
          const { generateAdminSystemPDF } = await import('../../../utils/reportGenerator');
          generateAdminSystemPDF(reportData);
          showToast({
            type: 'success',
            message: 'PDF report downloaded successfully',
            duration: 3000
          });
          break;

        case 'excel':
          const { ReportGenerator } = await import('../../../utils/reportGenerator');
          const generator = new ReportGenerator();
          
          // Prepare admin-specific data for Excel
          const adminData = {
            analytics: {
              totalUsers: { current: reportData.executive_summary?.total_users || 0 },
              activeUsers: { current: reportData.executive_summary?.active_users || 0 },
              systemHealth: { current: reportData.executive_summary?.system_health_score || 0 },
              monthlyGrowth: { current: reportData.executive_summary?.monthly_growth?.current || 0 }
            },
            exportInfo: {
              exportedBy: 'System Administrator',
              generatedAt: new Date().toLocaleString(),
              reportType: 'System Analytics'
            }
          };
          
          generator.downloadExcel(adminData, 'system-analytics-report');
          showToast({
            type: 'success',
            message: 'Excel report downloaded successfully',
            duration: 3000
          });
          break;

        case 'json':
        default:
          const jsonString = JSON.stringify(reportData, null, 2);
          const blob = new Blob([jsonString], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          
          const link = document.createElement('a');
          link.href = url;
          link.download = `system-report-${new Date().toISOString().split('T')[0]}.json`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
          
          showToast({
            type: 'success',
            message: 'JSON report downloaded successfully',
            duration: 3000
          });
          break;
      }
    } catch (error) {
      console.error('Export error:', error);
      showToast({
        type: 'error',
        message: `Failed to export ${format.toUpperCase()} report: ${error.message}`,
        duration: 4000
      });
    } finally {
      setIsExporting(false);
    }
  };

  const downloadCSV = () => {
    if (!reportData) return;

    const csvData = [
      ['Metric', 'Value', 'Previous', 'Change %', 'Direction'],
      ['Total Users', reportData.executive_summary?.total_users || 0, '', '', ''],
      ['Active Users', reportData.executive_summary?.active_users || 0, '', '', ''],
      ['System Health', reportData.executive_summary?.system_health_score || 0, '', '', ''],
      ['Monthly Growth', reportData.executive_summary?.monthly_growth?.current || 0, 
       reportData.executive_summary?.monthly_growth?.previous || 0,
       reportData.executive_summary?.monthly_growth?.percentage || 0,
       reportData.executive_summary?.monthly_growth?.direction || ''],
      ['Verification Rate', reportData.executive_summary?.key_metrics?.user_verification_rate || 0, '', '', ''],
      ['Total Shops', reportData.executive_summary?.key_metrics?.total_shops || 0, '', '', ''],
      ['Total Orders', reportData.executive_summary?.key_metrics?.total_orders || 0, '', '', ''],
      ['Monthly Revenue', reportData.executive_summary?.key_metrics?.monthly_revenue || 0, '', '', '']
    ];

    const csvString = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `system-report-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat().format(num);
  };

  const getTrendIcon = (direction) => {
    switch (direction) {
      case 'up': return 'TrendingUp';
      case 'down': return 'TrendingDown';
      default: return 'Minus';
    }
  };

  const getTrendColor = (direction) => {
    switch (direction) {
      case 'up': return 'text-green-500';
      case 'down': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">System Report</h2>
              <p className="text-blue-100 mt-1">Comprehensive platform analytics and insights</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <Icon name="X" size={24} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {!reportData && !loading && !error && (
            <div className="text-center py-12">
              <Icon name="FileText" size={48} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Generate System Report</h3>
              <p className="text-gray-600 mb-6">Create a comprehensive report with real-time system analytics, user metrics, and trend analysis.</p>
              <Button onClick={generateReport} iconName="Download" className="mx-auto">
                Generate Report
              </Button>
            </div>
          )}

          {loading && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Generating Report...</h3>
              <p className="text-gray-600">Analyzing system data and compiling metrics...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
              <Icon name="AlertCircle" size={32} className="mx-auto text-red-600 mb-4" />
              <h3 className="text-lg font-semibold text-red-900 mb-2">Error Generating Report</h3>
              <p className="text-red-700 mb-4">{error}</p>
              <Button onClick={generateReport} variant="outline" iconName="RefreshCw">
                Try Again
              </Button>
            </div>
          )}

          {reportData && (
            <div className="space-y-6">
              {/* Download Actions */}
              <div className="flex items-center justify-between bg-gray-50 rounded-lg p-4">
                <div>
                  <h3 className="font-semibold text-gray-900">Report Generated Successfully</h3>
                  <p className="text-sm text-gray-600">
                    Generated on {new Date(reportData.metadata?.generated_at).toLocaleString()}
                  </p>
                </div>
                <div className="flex space-x-2">
                  {/* Enhanced Export Dropdown */}
                  <div className="relative" ref={exportMenuRef}>
                    <Button 
                      onClick={() => setShowExportMenu(!showExportMenu)}
                      disabled={isExporting}
                      size="sm"
                      className="flex items-center space-x-2"
                    >
                      {isExporting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>Exporting...</span>
                        </>
                      ) : (
                        <>
                          <Icon name="Download" size={16} />
                          <span>Export Report</span>
                          <Icon name="ChevronDown" size={16} />
                        </>
                      )}
                    </Button>
                    
                    {showExportMenu && !isExporting && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                        <div className="py-1">
                          <button
                            onClick={() => handleExportReport('pdf')}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                          >
                            <Icon name="FileText" size={16} className="text-red-600" />
                            <span>Download as PDF</span>
                          </button>
                          <button
                            onClick={() => handleExportReport('excel')}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                          >
                            <Icon name="Table" size={16} className="text-green-600" />
                            <span>Download as Excel</span>
                          </button>
                          <button
                            onClick={downloadCSV}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                          >
                            <Icon name="FileSpreadsheet" size={16} className="text-orange-600" />
                            <span>Download as CSV</span>
                          </button>
                          <button
                            onClick={() => handleExportReport('json')}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                          >
                            <Icon name="Code" size={16} className="text-blue-600" />
                            <span>Download as JSON</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Executive Summary */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Icon name="TrendingUp" size={20} className="mr-2 text-blue-600" />
                  Executive Summary
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {formatNumber(reportData.executive_summary?.total_users || 0)}
                    </div>
                    <div className="text-sm text-gray-600">Total Users</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {formatNumber(reportData.executive_summary?.active_users || 0)}
                    </div>
                    <div className="text-sm text-gray-600">Active Users</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {reportData.executive_summary?.system_health_score || 0}%
                    </div>
                    <div className="text-sm text-gray-600">System Health</div>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">
                      {formatCurrency(reportData.executive_summary?.key_metrics?.monthly_revenue || 0)}
                    </div>
                    <div className="text-sm text-gray-600">Monthly Revenue</div>
                  </div>
                </div>
              </div>

              {/* Monthly Growth Trend */}
              {reportData.executive_summary?.monthly_growth && (
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Icon name="Calendar" size={20} className="mr-2 text-green-600" />
                    Monthly Growth Analysis
                  </h3>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-gray-600">User Growth Trend</div>
                      <div className="text-lg font-semibold text-gray-900">
                        {reportData.executive_summary.monthly_growth.current} users this month
                      </div>
                      <div className="text-sm text-gray-500">
                        vs {reportData.executive_summary.monthly_growth.previous} last month
                      </div>
                    </div>
                    <div className={`flex items-center ${getTrendColor(reportData.executive_summary.monthly_growth.direction)}`}>
                      <Icon name={getTrendIcon(reportData.executive_summary.monthly_growth.direction)} size={24} className="mr-2" />
                      <span className="text-xl font-bold">
                        {reportData.executive_summary.monthly_growth.percentage}%
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* User Analytics */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Icon name="Users" size={20} className="mr-2 text-indigo-600" />
                  User Analytics
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">User Distribution</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Customers</span>
                        <span className="font-medium">
                          {formatNumber(reportData.user_analytics?.user_distribution?.customers || 0)} 
                          ({reportData.user_analytics?.percentages?.customers_pct || 0}%)
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Shop Owners</span>
                        <span className="font-medium">
                          {formatNumber(reportData.user_analytics?.user_distribution?.shop_owners || 0)} 
                          ({reportData.user_analytics?.percentages?.shop_owners_pct || 0}%)
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Delivery Agents</span>
                        <span className="font-medium">
                          {formatNumber(reportData.user_analytics?.user_distribution?.delivery_agents || 0)} 
                          ({reportData.user_analytics?.percentages?.delivery_agents_pct || 0}%)
                        </span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">User Status</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Active Users</span>
                        <span className="font-medium text-green-600">
                          {formatNumber(reportData.user_analytics?.overview?.active_users || 0)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Inactive Users</span>
                        <span className="font-medium text-red-600">
                          {formatNumber(reportData.user_analytics?.overview?.inactive_users || 0)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Verified Users</span>
                        <span className="font-medium text-blue-600">
                          {formatNumber(reportData.user_analytics?.overview?.verified_users || 0)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* System Health */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Icon name="Activity" size={20} className="mr-2 text-red-600" />
                  System Health Analysis
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {reportData.system_health?.components && Object.entries(reportData.system_health.components).map(([key, component]) => (
                    <div key={key} className="text-center p-4 border border-gray-200 rounded-lg">
                      <div className={`text-2xl font-bold mb-2 ${
                        component.status === 'healthy' ? 'text-green-600' :
                        component.status === 'warning' ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {component.score}%
                      </div>
                      <div className="text-sm text-gray-600 capitalize">{key.replace('_', ' ')}</div>
                      <div className={`text-xs mt-1 px-2 py-1 rounded-full ${
                        component.status === 'healthy' ? 'bg-green-100 text-green-800' :
                        component.status === 'warning' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {component.status}
                      </div>
                    </div>
                  ))}
                </div>
                
                {reportData.system_health?.recommendations?.length > 0 && (
                  <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <h4 className="font-medium text-yellow-900 mb-2">Recommendations</h4>
                    <ul className="text-sm text-yellow-800 space-y-1">
                      {reportData.system_health.recommendations.map((rec, index) => (
                        <li key={index} className="flex items-start">
                          <Icon name="AlertTriangle" size={14} className="mr-2 mt-0.5 flex-shrink-0" />
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Period Comparison */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Icon name="BarChart3" size={20} className="mr-2 text-purple-600" />
                  Period Comparison
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Current Period</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">New Users</span>
                        <span className="font-medium">{formatNumber(reportData.period_comparison?.current_period?.users || 0)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Orders</span>
                        <span className="font-medium">{formatNumber(reportData.period_comparison?.current_period?.orders || 0)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Revenue</span>
                        <span className="font-medium">{formatCurrency(reportData.period_comparison?.current_period?.revenue || 0)}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Previous Period</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">New Users</span>
                        <span className="font-medium">{formatNumber(reportData.period_comparison?.previous_period?.users || 0)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Orders</span>
                        <span className="font-medium">{formatNumber(reportData.period_comparison?.previous_period?.orders || 0)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Revenue</span>
                        <span className="font-medium">{formatCurrency(reportData.period_comparison?.previous_period?.revenue || 0)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4 flex justify-end space-x-3">
          <Button onClick={onClose} variant="outline">
            Close
          </Button>
          {reportData && (
            <Button onClick={generateReport} iconName="RefreshCw" disabled={loading}>
              Refresh Report
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SystemReportModal;