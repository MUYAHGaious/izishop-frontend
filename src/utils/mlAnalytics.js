// Machine Learning Analytics Utilities
// Simple ML models for sales prediction and trend analysis

export class SalesPredictor {
  constructor() {
    this.salesData = [];
    this.model = null;
  }

  // Set sales data for training
  setSalesData(data) {
    this.salesData = data.map((item, index) => ({
      x: index, // Day index
      y: item.sales, // Sales amount
      date: item.date,
      orders: item.orders
    }));
  }

  // Simple Linear Regression
  linearRegression() {
    if (this.salesData.length < 2) return null;

    const n = this.salesData.length;
    const sumX = this.salesData.reduce((sum, point) => sum + point.x, 0);
    const sumY = this.salesData.reduce((sum, point) => sum + point.y, 0);
    const sumXY = this.salesData.reduce((sum, point) => sum + (point.x * point.y), 0);
    const sumXX = this.salesData.reduce((sum, point) => sum + (point.x * point.x), 0);

    // Calculate slope (m) and intercept (b) for y = mx + b
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    this.model = { slope, intercept };
    return this.model;
  }

  // Predict future sales
  predictSales(daysAhead = 7) {
    if (!this.model) {
      this.linearRegression();
    }

    if (!this.model) return [];

    const predictions = [];
    const lastIndex = this.salesData.length - 1;
    const lastDate = new Date(this.salesData[lastIndex]?.date || new Date());

    for (let i = 1; i <= daysAhead; i++) {
      const futureX = lastIndex + i;
      const predictedSales = Math.max(0, this.model.slope * futureX + this.model.intercept);
      
      const futureDate = new Date(lastDate);
      futureDate.setDate(futureDate.getDate() + i);

      predictions.push({
        date: futureDate.toISOString().split('T')[0],
        predictedSales: Math.round(predictedSales),
        confidence: this.calculateConfidence(i),
        type: 'prediction'
      });
    }

    return predictions;
  }

  // Calculate prediction confidence (decreases with distance)
  calculateConfidence(daysAhead) {
    const baseConfidence = 85;
    const decayRate = 5;
    return Math.max(50, baseConfidence - (daysAhead * decayRate));
  }

  // Moving Average for trend smoothing
  movingAverage(windowSize = 3) {
    if (this.salesData.length < windowSize) return this.salesData;

    const smoothedData = [];
    
    for (let i = 0; i < this.salesData.length; i++) {
      if (i < windowSize - 1) {
        smoothedData.push(this.salesData[i]);
      } else {
        const start = i - windowSize + 1;
        const window = this.salesData.slice(start, i + 1);
        const average = window.reduce((sum, point) => sum + point.y, 0) / windowSize;
        
        smoothedData.push({
          ...this.salesData[i],
          smoothedSales: Math.round(average)
        });
      }
    }

    return smoothedData;
  }

  // Detect anomalies using standard deviation
  detectAnomalies(threshold = 2) {
    if (this.salesData.length < 3) return [];

    const sales = this.salesData.map(d => d.y);
    const mean = sales.reduce((sum, val) => sum + val, 0) / sales.length;
    const variance = sales.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / sales.length;
    const stdDev = Math.sqrt(variance);

    const anomalies = [];
    
    this.salesData.forEach((point, index) => {
      const zScore = Math.abs((point.y - mean) / stdDev);
      if (zScore > threshold) {
        anomalies.push({
          ...point,
          zScore,
          type: point.y > mean ? 'spike' : 'dip',
          severity: zScore > 3 ? 'high' : 'medium'
        });
      }
    });

    return anomalies;
  }

  // Calculate trend strength and direction
  calculateTrend() {
    if (!this.model) {
      this.linearRegression();
    }

    if (!this.model) return { direction: 'stable', strength: 0 };

    const slope = this.model.slope;
    const avgSales = this.salesData.reduce((sum, point) => sum + point.y, 0) / this.salesData.length;
    
    // Normalize slope by average sales to get relative trend strength
    const trendStrength = Math.abs(slope) / avgSales * 100;
    
    let direction = 'stable';
    if (slope > 0 && trendStrength > 5) direction = 'increasing';
    else if (slope < 0 && trendStrength > 5) direction = 'decreasing';

    let strength = 'weak';
    if (trendStrength > 15) strength = 'strong';
    else if (trendStrength > 8) strength = 'moderate';

    return {
      direction,
      strength,
      trendStrength: Math.round(trendStrength),
      slope: slope,
      r2: this.calculateR2()
    };
  }

  // Calculate R-squared (coefficient of determination)
  calculateR2() {
    if (!this.model || this.salesData.length < 2) return 0;

    const yMean = this.salesData.reduce((sum, point) => sum + point.y, 0) / this.salesData.length;
    
    let ssRes = 0; // Sum of squares of residuals
    let ssTot = 0; // Total sum of squares
    
    this.salesData.forEach(point => {
      const yPred = this.model.slope * point.x + this.model.intercept;
      ssRes += Math.pow(point.y - yPred, 2);
      ssTot += Math.pow(point.y - yMean, 2);
    });

    const r2 = 1 - (ssRes / ssTot);
    return Math.max(0, Math.min(1, r2)); // Clamp between 0 and 1
  }

  // Generate insights and recommendations
  generateInsights() {
    const trend = this.calculateTrend();
    const anomalies = this.detectAnomalies();
    const predictions = this.predictSales(7);
    
    const insights = {
      trend,
      anomalies,
      predictions,
      recommendations: []
    };

    // Generate recommendations based on analysis
    if (trend.direction === 'increasing' && trend.strength === 'strong') {
      insights.recommendations.push({
        type: 'opportunity',
        message: 'Strong upward trend detected. Consider increasing inventory and marketing efforts.',
        priority: 'high'
      });
    } else if (trend.direction === 'decreasing' && trend.strength === 'strong') {
      insights.recommendations.push({
        type: 'warning',
        message: 'Declining sales trend. Review pricing, marketing, or product offerings.',
        priority: 'high'
      });
    }

    if (anomalies.length > 0) {
      const recentAnomalies = anomalies.filter((_, index) => index >= anomalies.length - 3);
      if (recentAnomalies.length > 1) {
        insights.recommendations.push({
          type: 'alert',
          message: 'Unusual sales patterns detected. Investigate potential causes.',
          priority: 'medium'
        });
      }
    }

    const avgPredicted = predictions.reduce((sum, p) => sum + p.predictedSales, 0) / predictions.length;
    const avgHistorical = this.salesData.slice(-7).reduce((sum, d) => sum + d.y, 0) / Math.min(7, this.salesData.length);
    
    if (avgPredicted > avgHistorical * 1.1) {
      insights.recommendations.push({
        type: 'opportunity',
        message: 'Sales forecast shows potential growth. Prepare for increased demand.',
        priority: 'medium'
      });
    }

    return insights;
  }
}

// Customer behavior analysis
export class CustomerAnalytics {
  constructor() {
    this.customerData = [];
  }

  // Predict customer lifetime value
  predictCLV(customerMetrics) {
    const {
      averageOrderValue,
      purchaseFrequency,
      customerLifespan = 24 // months
    } = customerMetrics;

    // Simple CLV calculation: AOV × Purchase Frequency × Customer Lifespan
    const clv = averageOrderValue * purchaseFrequency * customerLifespan;
    
    return {
      estimatedCLV: clv,
      monthlyValue: clv / customerLifespan,
      confidence: this.calculateCLVConfidence(customerMetrics)
    };
  }

  calculateCLVConfidence(metrics) {
    let confidence = 70; // Base confidence
    
    // Increase confidence based on data quality
    if (metrics.orderHistory > 10) confidence += 15;
    if (metrics.retentionRate > 0.3) confidence += 10;
    if (metrics.dataQuality === 'high') confidence += 5;
    
    return Math.min(95, confidence);
  }

  // Segment customers based on RFM analysis
  rfmAnalysis(customers) {
    if (!customers || customers.length === 0) return [];

    // Calculate RFM scores
    const enrichedCustomers = customers.map(customer => {
      const recency = this.calculateRecency(customer.last_order_date);
      const frequency = customer.total_orders;
      const monetary = customer.total_spent;

      return {
        ...customer,
        recency,
        frequency,
        monetary,
        rfmScore: this.calculateRFMScore(recency, frequency, monetary, customers)
      };
    });

    // Segment customers
    return enrichedCustomers.map(customer => ({
      ...customer,
      segment: this.assignSegment(customer.rfmScore)
    }));
  }

  calculateRecency(lastOrderDate) {
    const now = new Date();
    const lastOrder = new Date(lastOrderDate);
    const diffDays = Math.floor((now - lastOrder) / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  calculateRFMScore(recency, frequency, monetary, allCustomers) {
    // Normalize scores to 1-5 scale
    const recencyScore = this.scoreToScale(recency, allCustomers.map(c => this.calculateRecency(c.last_order_date)), true);
    const frequencyScore = this.scoreToScale(frequency, allCustomers.map(c => c.total_orders), false);
    const monetaryScore = this.scoreToScale(monetary, allCustomers.map(c => c.total_spent), false);

    return {
      recency: recencyScore,
      frequency: frequencyScore,
      monetary: monetaryScore,
      overall: Math.round((recencyScore + frequencyScore + monetaryScore) / 3)
    };
  }

  scoreToScale(value, allValues, inverse = false) {
    const sorted = [...allValues].sort((a, b) => a - b);
    const quintiles = [
      sorted[Math.floor(sorted.length * 0.2)],
      sorted[Math.floor(sorted.length * 0.4)],
      sorted[Math.floor(sorted.length * 0.6)],
      sorted[Math.floor(sorted.length * 0.8)]
    ];

    let score = 1;
    for (let i = 0; i < quintiles.length; i++) {
      if (value > quintiles[i]) score = i + 2;
    }

    return inverse ? 6 - score : score; // Invert for recency (lower is better)
  }

  assignSegment(rfmScore) {
    const { recency, frequency, monetary, overall } = rfmScore;

    if (overall >= 4) return 'Champions';
    if (overall >= 3 && frequency >= 3) return 'Loyal Customers';
    if (overall >= 3 && recency >= 4) return 'Potential Loyalists';
    if (recency >= 4 && overall >= 3) return 'New Customers';
    if (frequency >= 3 && recency <= 2) return 'At Risk';
    if (monetary >= 4 && recency <= 2) return 'Cannot Lose Them';
    if (recency <= 2 && overall <= 2) return 'Hibernating';
    
    return 'Others';
  }
}

// Export utilities
export const mlUtils = {
  SalesPredictor,
  CustomerAnalytics
};