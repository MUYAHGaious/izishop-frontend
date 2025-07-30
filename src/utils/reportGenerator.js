// Report Generation Utility
// Handles PDF and Excel export functionality for analytics reports
// 
// Required dependencies (add to package.json):
// npm install jspdf jspdf-autotable xlsx
//
// Usage:
// import { generateShopAnalyticsPDF, generateAdminSystemPDF, ReportGenerator } from './reportGenerator';

import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

export class ReportGenerator {
  constructor() {
    this.doc = null;
    this.currentY = 20;
  }

  // Initialize PDF document
  initializePDF(title = 'Analytics Report') {
    this.doc = new jsPDF();
    this.currentY = 20;
    
    // Add title
    this.doc.setFontSize(20);
    this.doc.setTextColor(51, 51, 51);
    this.doc.text(title, 20, this.currentY);
    this.currentY += 15;
    
    // Add generation date
    this.doc.setFontSize(10);
    this.doc.setTextColor(128, 128, 128);
    this.doc.text(`Generated on: ${new Date().toLocaleString()}`, 20, this.currentY);
    this.currentY += 20;
    
    return this;
  }

  // Add section header
  addSectionHeader(title) {
    if (this.currentY > 250) {
      this.doc.addPage();
      this.currentY = 20;
    }
    
    this.doc.setFontSize(14);
    this.doc.setTextColor(51, 51, 51);
    this.doc.text(title, 20, this.currentY);
    this.currentY += 10;
    
    return this;
  }

  // Add key metrics summary
  addMetricsSummary(metrics) {
    const tableData = [];
    
    Object.entries(metrics).forEach(([key, value]) => {
      if (typeof value === 'object' && value !== null) {
        const current = this.formatValue(value.current, key);
        const change = value.change ? `${value.change > 0 ? '+' : ''}${value.change.toFixed(1)}%` : 'N/A';
        tableData.push([this.formatLabel(key), current, change]);
      }
    });

    if (tableData.length > 0) {
      this.doc.autoTable({
        startY: this.currentY,
        head: [['Metric', 'Current Value', 'Change %']],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: [59, 130, 246] },
        margin: { left: 20, right: 20 },
        didDrawPage: (data) => {
          this.currentY = data.cursor.y + 10;
        }
      });
    }
    
    return this;
  }

  // Add sales chart data
  addSalesData(salesData, title = 'Sales Performance') {
    this.addSectionHeader(title);
    
    if (!salesData || salesData.length === 0) {
      this.doc.setFontSize(10);
      this.doc.setTextColor(128, 128, 128);
      this.doc.text('No sales data available for the selected period.', 20, this.currentY);
      this.currentY += 15;
      return this;
    }

    const tableData = salesData.map(item => [
      item.date,
      this.formatCurrency(item.sales || 0),
      (item.orders || 0).toString()
    ]);

    this.doc.autoTable({
      startY: this.currentY,
      head: [['Date', 'Sales Revenue', 'Orders']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [16, 185, 129] },
      margin: { left: 20, right: 20 },
      didDrawPage: (data) => {
        this.currentY = data.cursor.y + 10;
      }
    });
    
    return this;
  }

  // Add top products
  addTopProducts(products, title = 'Top Performing Products') {
    this.addSectionHeader(title);
    
    if (!products || products.length === 0) {
      this.doc.setFontSize(10);
      this.doc.setTextColor(128, 128, 128);
      this.doc.text('No product data available.', 20, this.currentY);
      this.currentY += 15;
      return this;
    }

    const tableData = products.map((product, index) => [
      (index + 1).toString(),
      product.name,
      (product.sales || 0).toString(),
      this.formatCurrency(product.revenue || 0),
      `${product.growth > 0 ? '+' : ''}${(product.growth || 0).toFixed(1)}%`
    ]);

    this.doc.autoTable({
      startY: this.currentY,
      head: [['Rank', 'Product Name', 'Sales', 'Revenue', 'Growth']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [147, 51, 234] },
      margin: { left: 20, right: 20 },
      didDrawPage: (data) => {
        this.currentY = data.cursor.y + 10;
      }
    });
    
    return this;
  }

  // Add customer insights
  addCustomerInsights(customerData, title = 'Customer Analytics') {
    this.addSectionHeader(title);
    
    const insights = [
      ['New Customers', (customerData.newCustomers || 0).toString()],
      ['Returning Customers', (customerData.returningCustomers || 0).toString()],
      ['Retention Rate', `${(customerData.customerRetentionRate || 0).toFixed(1)}%`],
      ['Average Order Value', this.formatCurrency(customerData.averageOrderValue || 0)],
      ['Customer Lifetime Value', this.formatCurrency(customerData.customerLifetimeValue || 0)]
    ];

    this.doc.autoTable({
      startY: this.currentY,
      head: [['Metric', 'Value']],
      body: insights,
      theme: 'grid',
      headStyles: { fillColor: [245, 101, 101] },
      margin: { left: 20, right: 20 },
      didDrawPage: (data) => {
        this.currentY = data.cursor.y + 10;
      }
    });
    
    return this;
  }

  // Add traffic sources
  addTrafficSources(trafficData, title = 'Traffic Sources') {
    this.addSectionHeader(title);
    
    if (!trafficData || trafficData.length === 0) {
      this.doc.setFontSize(10);
      this.doc.setTextColor(128, 128, 128);
      this.doc.text('No traffic data available.', 20, this.currentY);
      this.currentY += 15;
      return this;
    }

    const tableData = trafficData.map(source => [
      source.source,
      (source.visitors || 0).toLocaleString(),
      `${(source.percentage || 0)}%`,
      source.conversion_rate ? `${source.conversion_rate}%` : 'N/A'
    ]);

    this.doc.autoTable({
      startY: this.currentY,
      head: [['Source', 'Visitors', 'Percentage', 'Conversion Rate']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [59, 130, 246] },
      margin: { left: 20, right: 20 },
      didDrawPage: (data) => {
        this.currentY = data.cursor.y + 10;
      }
    });
    
    return this;
  }

  // Generate and download PDF
  downloadPDF(filename = 'analytics-report') {
    if (!this.doc) {
      throw new Error('PDF document not initialized');
    }
    
    const timestamp = new Date().toISOString().split('T')[0];
    this.doc.save(`${filename}-${timestamp}.pdf`);
    
    return this;
  }

  // Generate Excel report
  generateExcel(data) {
    const workbook = XLSX.utils.book_new();
    
    // Summary sheet
    const summaryData = [
      ['Metric', 'Current Value', 'Previous Value', 'Change %'],
      ...Object.entries(data.analytics || {}).map(([key, value]) => [
        this.formatLabel(key),
        this.formatValue(value.current, key),
        this.formatValue(value.previous, key),
        value.change ? `${value.change.toFixed(1)}%` : 'N/A'
      ])
    ];
    
    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

    // Sales data sheet
    if (data.salesData && data.salesData.length > 0) {
      const salesData = [
        ['Date', 'Sales Revenue', 'Orders'],
        ...data.salesData.map(item => [
          item.date,
          item.sales || 0,
          item.orders || 0
        ])
      ];
      
      const salesSheet = XLSX.utils.aoa_to_sheet(salesData);
      XLSX.utils.book_append_sheet(workbook, salesSheet, 'Sales Data');
    }

    // Top products sheet
    if (data.topProducts && data.topProducts.length > 0) {
      const productsData = [
        ['Rank', 'Product Name', 'Sales', 'Revenue', 'Growth %'],
        ...data.topProducts.map((product, index) => [
          index + 1,
          product.name,
          product.sales || 0,
          product.revenue || 0,
          (product.growth || 0).toFixed(1)
        ])
      ];
      
      const productsSheet = XLSX.utils.aoa_to_sheet(productsData);
      XLSX.utils.book_append_sheet(workbook, productsSheet, 'Top Products');
    }

    // Traffic sources sheet
    if (data.trafficSources && data.trafficSources.length > 0) {
      const trafficData = [
        ['Source', 'Visitors', 'Percentage', 'Conversion Rate'],
        ...data.trafficSources.map(source => [
          source.source,
          source.visitors || 0,
          source.percentage || 0,
          source.conversion_rate || 'N/A'
        ])
      ];
      
      const trafficSheet = XLSX.utils.aoa_to_sheet(trafficData);
      XLSX.utils.book_append_sheet(workbook, trafficSheet, 'Traffic Sources');
    }

    return workbook;
  }

  // Download Excel file
  downloadExcel(data, filename = 'analytics-report') {
    const workbook = this.generateExcel(data);
    const timestamp = new Date().toISOString().split('T')[0];
    XLSX.writeFile(workbook, `${filename}-${timestamp}.xlsx`);
    
    return this;
  }

  // Utility methods
  formatCurrency(amount) {
    if (!amount || amount === 0) return 'XAF 0';
    
    return new Intl.NumberFormat('fr-CM', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0
    }).format(amount);
  }

  formatValue(value, key) {
    if (typeof value === 'number') {
      if (key.toLowerCase().includes('revenue') || key.toLowerCase().includes('value')) {
        return this.formatCurrency(value);
      }
      return value.toLocaleString();
    }
    return value || 'N/A';
  }

  formatLabel(key) {
    return key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1');
  }
}

// Export convenience functions
export const generateShopAnalyticsPDF = (data) => {
  const generator = new ReportGenerator();
  
  generator
    .initializePDF('Shop Analytics Report')
    .addMetricsSummary(data.analytics)
    .addSalesData(data.salesData)
    .addTopProducts(data.topProducts)
    .addCustomerInsights(data.customerInsights)
    .addTrafficSources(data.trafficSources)
    .downloadPDF('shop-analytics-report');
    
  return generator;
};

export const generateAdminSystemPDF = (data) => {
  const generator = new ReportGenerator();
  
  generator
    .initializePDF('System Analytics Report')
    .addSectionHeader('Executive Summary');
    
  if (data.executive_summary) {
    const summaryData = [
      ['Total Users', (data.executive_summary.total_users || 0).toLocaleString()],
      ['Active Users', (data.executive_summary.active_users || 0).toLocaleString()],
      ['System Health Score', `${(data.executive_summary.system_health_score || 0)}%`],
      ['Monthly Growth', `${(data.executive_summary.monthly_growth?.current || 0).toFixed(1)}%`]
    ];
    
    generator.doc.autoTable({
      startY: generator.currentY,
      head: [['Metric', 'Value']],
      body: summaryData,
      theme: 'grid',
      headStyles: { fillColor: [59, 130, 246] },
      margin: { left: 20, right: 20 },
      didDrawPage: (tableData) => {
        generator.currentY = tableData.cursor.y + 10;
      }
    });
  }
  
  generator.downloadPDF('system-analytics-report');
  return generator;
};

export default ReportGenerator;