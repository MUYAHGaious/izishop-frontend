import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import Icon from '../AppIcon';
import { format, parseISO, subDays, isWithinInterval } from 'date-fns';

const RealTimeChart = ({ 
  data = [], 
  type = 'line', 
  metric = 'value',
  title = 'Chart',
  color = '#3B82F6',
  height = 300,
  showForecast = false,
  forecastData = [],
  showAnomalies = false,
  anomalies = [],
  onDataPointClick = null,
  onAnomalyClick = null,
  timeRange = '24h',
  filters = {},
  loading = false,
  error = null,
  enableZoom = true,
  enableTooltips = true,
  showGrid = true,
  animated = true
}) => {
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 800, height });
  const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0, data: null });
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(0);

  // Handle container resize
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const { width } = containerRef.current.getBoundingClientRect();
        setDimensions({ width: width - 40, height });
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [height]);

  // Process and filter data
  const processedData = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    // Filter data based on time range and filters
    let filteredData = [...data];
    
    // Apply time range filter
    if (timeRange !== 'all') {
      const now = new Date();
      let startDate;
      
      switch (timeRange) {
        case '1h':
          startDate = new Date(now.getTime() - 60 * 60 * 1000);
          break;
        case '24h':
          startDate = subDays(now, 1);
          break;
        case '7d':
          startDate = subDays(now, 7);
          break;
        case '30d':
          startDate = subDays(now, 30);
          break;
        case '90d':
          startDate = subDays(now, 90);
          break;
        default:
          startDate = subDays(now, 1);
      }
      
      filteredData = filteredData.filter(point => {
        const pointDate = typeof point.timestamp === 'string' 
          ? parseISO(point.timestamp) 
          : point.date 
          ? parseISO(point.date)
          : new Date(point.timestamp || point.date);
        return isWithinInterval(pointDate, { start: startDate, end: now });
      });
    }
    
    // Sort by timestamp
    filteredData.sort((a, b) => {
      const dateA = new Date(a.timestamp || a.date);
      const dateB = new Date(b.timestamp || b.date);
      return dateA - dateB;
    });
    
    return filteredData;
  }, [data, timeRange, filters]);

  // Calculate chart dimensions and scales
  const chartDimensions = useMemo(() => {
    const margin = { top: 20, right: 30, bottom: 40, left: 60 };
    const chartWidth = dimensions.width - margin.left - margin.right;
    const chartHeight = dimensions.height - margin.top - margin.bottom;
    
    return { margin, chartWidth, chartHeight };
  }, [dimensions]);

  const scales = useMemo(() => {
    if (processedData.length === 0) {
      return { xScale: () => 0, yScale: () => 0, minValue: 0, maxValue: 0 };
    }

    const values = processedData.map(d => d[metric] || d.value || 0);
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    const valueRange = maxValue - minValue;
    
    // Add padding to y-scale
    const paddedMin = minValue - valueRange * 0.1;
    const paddedMax = maxValue + valueRange * 0.1;
    
    // Create scales
    const xScale = (index) => {
      const baseX = (index / (processedData.length - 1)) * chartDimensions.chartWidth;
      return (baseX + panOffset) * zoomLevel;
    };
    
    const yScale = (value) => {
      const normalizedValue = (value - paddedMin) / (paddedMax - paddedMin);
      return chartDimensions.chartHeight - (normalizedValue * chartDimensions.chartHeight);
    };
    
    return { xScale, yScale, minValue: paddedMin, maxValue: paddedMax };
  }, [processedData, metric, chartDimensions, zoomLevel, panOffset]);

  // Generate path for line chart
  const generatePath = useCallback(() => {
    if (processedData.length === 0) return '';
    
    const pathData = processedData.map((point, index) => {
      const x = scales.xScale(index);
      const y = scales.yScale(point[metric] || point.value || 0);
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');
    
    return pathData;
  }, [processedData, scales, metric]);

  // Generate forecast path
  const generateForecastPath = useCallback(() => {
    if (!showForecast || forecastData.length === 0) return '';
    
    const lastDataPoint = processedData[processedData.length - 1];
    if (!lastDataPoint) return '';
    
    const startX = scales.xScale(processedData.length - 1);
    const startY = scales.yScale(lastDataPoint[metric] || lastDataPoint.value || 0);
    
    let pathData = `M ${startX} ${startY}`;
    
    forecastData.forEach((point, index) => {
      const x = scales.xScale(processedData.length + index);
      const y = scales.yScale(point.predicted_value || point.value || 0);
      pathData += ` L ${x} ${y}`;
    });
    
    return pathData;
  }, [showForecast, forecastData, processedData, scales, metric]);

  // Handle mouse events
  const handleMouseMove = useCallback((event) => {
    if (!enableTooltips) return;
    
    const svgRect = svgRef.current.getBoundingClientRect();
    const x = event.clientX - svgRect.left - chartDimensions.margin.left;
    const y = event.clientY - svgRect.top - chartDimensions.margin.top;
    
    // Find closest data point
    let closestIndex = -1;
    let closestDistance = Infinity;
    
    processedData.forEach((point, index) => {
      const pointX = scales.xScale(index);
      const pointY = scales.yScale(point[metric] || point.value || 0);
      const distance = Math.sqrt(Math.pow(x - pointX, 2) + Math.pow(y - pointY, 2));
      
      if (distance < closestDistance && distance < 20) {
        closestDistance = distance;
        closestIndex = index;
      }
    });
    
    if (closestIndex >= 0) {
      setTooltip({
        visible: true,
        x: event.clientX,
        y: event.clientY,
        data: processedData[closestIndex]
      });
    } else {
      setTooltip({ visible: false, x: 0, y: 0, data: null });
    }
  }, [enableTooltips, processedData, scales, metric, chartDimensions]);

  const handleMouseLeave = useCallback(() => {
    setTooltip({ visible: false, x: 0, y: 0, data: null });
  }, []);

  // Handle zoom and pan
  const handleWheel = useCallback((event) => {
    if (!enableZoom) return;
    event.preventDefault();
    
    const delta = event.deltaY * -0.01;
    const newZoomLevel = Math.max(0.5, Math.min(5, zoomLevel + delta));
    setZoomLevel(newZoomLevel);
  }, [enableZoom, zoomLevel]);

  const handleMouseDown = useCallback((event) => {
    if (!enableZoom) return;
    setIsDragging(true);
    setDragStart(event.clientX);
  }, [enableZoom]);

  const handleMouseDrag = useCallback((event) => {
    if (!isDragging || !enableZoom) return;
    
    const deltaX = event.clientX - dragStart;
    setPanOffset(prev => prev + deltaX * 0.5);
    setDragStart(event.clientX);
  }, [isDragging, dragStart, enableZoom]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Add event listeners for drag
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseDrag);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseDrag);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseDrag, handleMouseUp]);

  // Format value for display
  const formatValue = useCallback((value) => {
    if (value === null || value === undefined || typeof value !== 'number') return '0';
    
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toFixed(0);
  }, []);

  // Format date for display
  const formatDate = useCallback((dateString) => {
    try {
      const date = typeof dateString === 'string' ? parseISO(dateString) : new Date(dateString);
      
      if (timeRange === '1h') {
        return format(date, 'HH:mm');
      } else if (timeRange === '24h') {
        return format(date, 'HH:mm');
      } else if (timeRange === '7d') {
        return format(date, 'MMM dd');
      } else {
        return format(date, 'MMM dd');
      }
    } catch {
      return dateString;
    }
  }, [timeRange]);

  // Reset zoom
  const resetZoom = useCallback(() => {
    setZoomLevel(1);
    setPanOffset(0);
  }, []);

  if (loading) {
    return (
      <div className="w-full" style={{ height }} ref={containerRef}>
        <div className="flex items-center justify-center h-full bg-gray-50 rounded-lg">
          <div className="flex flex-col items-center space-y-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="text-sm text-gray-600">Loading chart data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full" style={{ height }} ref={containerRef}>
        <div className="flex items-center justify-center h-full bg-red-50 rounded-lg border border-red-200">
          <div className="flex flex-col items-center space-y-2 text-center">
            <Icon name="AlertTriangle" size={24} className="text-red-600" />
            <p className="text-sm text-red-600">Error loading chart</p>
            <p className="text-xs text-red-500">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (processedData.length === 0) {
    return (
      <div className="w-full" style={{ height }} ref={containerRef}>
        <div className="flex items-center justify-center h-full bg-gray-50 rounded-lg">
          <div className="flex flex-col items-center space-y-2">
            <Icon name="BarChart" size={48} className="text-gray-400" />
            <p className="text-sm text-gray-600">No data available</p>
            <p className="text-xs text-gray-500">Try adjusting your filters or time range</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full relative" ref={containerRef}>
      {/* Chart Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <div className="flex items-center space-x-2">
          {enableZoom && (
            <button
              onClick={resetZoom}
              className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition-colors"
              title="Reset Zoom"
            >
              <Icon name="RotateCcw" size={14} />
            </button>
          )}
          <div className="flex items-center space-x-1 text-xs text-gray-500">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }}></div>
            <span>{title}</span>
          </div>
        </div>
      </div>

      {/* Chart Container */}
      <div className="relative bg-white border border-gray-200 rounded-lg">
        <svg
          ref={svgRef}
          width={dimensions.width}
          height={dimensions.height}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          className="cursor-crosshair"
        >
          <defs>
            {/* Gradient definitions */}
            <linearGradient id={`gradient-${color.replace('#', '')}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={color} stopOpacity="0.3" />
              <stop offset="100%" stopColor={color} stopOpacity="0.05" />
            </linearGradient>
            
            {/* Forecast gradient */}
            <linearGradient id={`forecast-gradient-${color.replace('#', '')}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={color} stopOpacity="0.15" />
              <stop offset="100%" stopColor={color} stopOpacity="0.02" />
            </linearGradient>
          </defs>
          
          <g transform={`translate(${chartDimensions.margin.left}, ${chartDimensions.margin.top})`}>
            {/* Grid lines */}
            {showGrid && (
              <g className="grid">
                {/* Horizontal grid lines */}
                {[0, 0.25, 0.5, 0.75, 1].map(ratio => {
                  const y = chartDimensions.chartHeight * ratio;
                  return (
                    <line
                      key={`h-grid-${ratio}`}
                      x1="0"
                      y1={y}
                      x2={chartDimensions.chartWidth}
                      y2={y}
                      stroke="#E5E7EB"
                      strokeWidth="1"
                      strokeDasharray="3,3"
                    />
                  );
                })}
                
                {/* Vertical grid lines */}
                {processedData.map((_, index) => {
                  if (index % Math.ceil(processedData.length / 6) === 0) {
                    const x = scales.xScale(index);
                    return (
                      <line
                        key={`v-grid-${index}`}
                        x1={x}
                        y1="0"
                        x2={x}
                        y2={chartDimensions.chartHeight}
                        stroke="#E5E7EB"
                        strokeWidth="1"
                        strokeDasharray="3,3"
                      />
                    );
                  }
                  return null;
                })}
              </g>
            )}
            
            {/* Main chart area */}
            {type === 'line' && (
              <>
                {/* Area fill */}
                <path
                  d={`${generatePath()} L ${scales.xScale(processedData.length - 1)} ${chartDimensions.chartHeight} L ${scales.xScale(0)} ${chartDimensions.chartHeight} Z`}
                  fill={`url(#gradient-${color.replace('#', '')})`}
                  className={animated ? 'transition-all duration-300' : ''}
                />
                
                {/* Main line */}
                <path
                  d={generatePath()}
                  fill="none"
                  stroke={color}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={animated ? 'transition-all duration-300' : ''}
                />
                
                {/* Forecast line */}
                {showForecast && forecastData.length > 0 && (
                  <path
                    d={generateForecastPath()}
                    fill="none"
                    stroke={color}
                    strokeWidth="2"
                    strokeDasharray="5,5"
                    strokeOpacity="0.7"
                    className={animated ? 'transition-all duration-300' : ''}
                  />
                )}
              </>
            )}
            
            {/* Data points */}
            {processedData.map((point, index) => {
              const x = scales.xScale(index);
              const y = scales.yScale(point[metric] || point.value || 0);
              
              return (
                <circle
                  key={`point-${index}`}
                  cx={x}
                  cy={y}
                  r="3"
                  fill={color}
                  stroke="white"
                  strokeWidth="2"
                  className="hover:r-5 cursor-pointer transition-all"
                  onClick={() => onDataPointClick?.(point, index)}
                />
              );
            })}
            
            {/* Anomaly markers */}
            {showAnomalies && anomalies.map((anomaly, index) => {
              // Find corresponding data point
              const dataIndex = processedData.findIndex(point => {
                const pointDate = new Date(point.timestamp || point.date);
                const anomalyDate = new Date(anomaly.timestamp);
                return Math.abs(pointDate - anomalyDate) < 60000; // Within 1 minute
              });
              
              if (dataIndex >= 0) {
                const x = scales.xScale(dataIndex);
                const y = scales.yScale(anomaly.actual_value);
                
                const severityColors = {
                  low: '#FED7AA',
                  medium: '#FDE68A',
                  high: '#FCA5A5',
                  critical: '#F87171'
                };
                
                return (
                  <g key={`anomaly-${index}`}>
                    <circle
                      cx={x}
                      cy={y}
                      r="6"
                      fill={severityColors[anomaly.severity] || '#FCA5A5'}
                      stroke="#DC2626"
                      strokeWidth="2"
                      className="cursor-pointer animate-pulse"
                      onClick={() => onAnomalyClick?.(anomaly, dataIndex)}
                    />
                    <text
                      x={x}
                      y={y - 10}
                      textAnchor="middle"
                      className="text-xs font-bold fill-red-600"
                    >
                      !
                    </text>
                  </g>
                );
              }
              return null;
            })}
          </g>
          
          {/* X-axis */}
          <g transform={`translate(${chartDimensions.margin.left}, ${dimensions.height - chartDimensions.margin.bottom})`}>
            {processedData.map((point, index) => {
              if (index % Math.ceil(processedData.length / 6) === 0) {
                const x = scales.xScale(index);
                return (
                  <g key={`x-label-${index}`}>
                    <text
                      x={x}
                      y="20"
                      textAnchor="middle"
                      className="text-xs fill-gray-600"
                    >
                      {formatDate(point.timestamp || point.date)}
                    </text>
                  </g>
                );
              }
              return null;
            })}
          </g>
          
          {/* Y-axis */}
          <g transform={`translate(${chartDimensions.margin.left}, ${chartDimensions.margin.top})`}>
            {[0, 0.25, 0.5, 0.75, 1].map(ratio => {
              const y = chartDimensions.chartHeight * ratio;
              const value = scales.maxValue - (ratio * (scales.maxValue - scales.minValue));
              
              return (
                <g key={`y-label-${ratio}`}>
                  <text
                    x="-10"
                    y={y + 4}
                    textAnchor="end"
                    className="text-xs fill-gray-600"
                  >
                    {formatValue(value)}
                  </text>
                </g>
              );
            })}
          </g>
        </svg>
        
        {/* Tooltip */}
        {tooltip.visible && tooltip.data && (
          <div
            className="fixed z-50 bg-gray-900 text-white text-xs rounded-lg px-3 py-2 pointer-events-none"
            style={{
              left: tooltip.x + 10,
              top: tooltip.y - 30,
              transform: 'translateY(-100%)'
            }}
          >
            <div className="font-semibold">
              {formatValue(tooltip.data[metric] || tooltip.data.value || 0)}
            </div>
            <div className="text-gray-300">
              {formatDate(tooltip.data.timestamp || tooltip.data.date)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RealTimeChart;