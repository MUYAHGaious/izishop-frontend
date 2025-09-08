/**
 * Health Check Service
 * Monitors API endpoint health, response times, and availability
 * Implements circuit breaker pattern for automatic failover
 */

class HealthCheckService {
  constructor() {
    this.endpoints = new Map();
    this.circuitBreakers = new Map();
    this.checkInterval = 30000; // 30 seconds
    this.timeout = 5000; // 5 seconds
    this.maxRetries = 3;
    this.healthHistory = new Map();
    this.isMonitoring = false;
    this.monitoringInterval = null;
  }

  async checkEndpoint(url, options = {}) {
    const startTime = Date.now();
    const config = {
      timeout: this.timeout,
      retries: 0,
      ...options
    };

    console.log(`🏥 Health checking endpoint: ${url}`);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
      }, config.timeout);

      const response = await fetch(`${url}/health`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache',
          'X-Health-Check': 'true'
        },
        signal: controller.signal,
        // Disable caching for health checks
        cache: 'no-store'
      });

      clearTimeout(timeoutId);

      const responseTime = Date.now() - startTime;
      const isHealthy = response.ok;
      let healthData = null;

      // Try to parse health response
      try {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          healthData = await response.json();
        }
      } catch (parseError) {
        console.warn(`⚠️ Failed to parse health response from ${url}:`, parseError.message);
      }

      const status = {
        url,
        healthy: isHealthy,
        responseTime,
        statusCode: response.status,
        lastCheck: new Date().toISOString(),
        error: null,
        healthData: healthData || { status: isHealthy ? 'healthy' : 'unhealthy' },
        timestamp: Date.now()
      };

      // Store status and update circuit breaker
      this.endpoints.set(url, status);
      this.updateCircuitBreaker(url, isHealthy, responseTime);
      this.recordHealthHistory(url, status);

      console.log(`${isHealthy ? '✅' : '❌'} Health check ${url}: ${responseTime}ms (${response.status})`);
      return status;

    } catch (error) {
      const responseTime = Date.now() - startTime;
      const status = {
        url,
        healthy: false,
        responseTime,
        statusCode: 0,
        lastCheck: new Date().toISOString(),
        error: error.message,
        healthData: { status: 'error', error: error.message },
        timestamp: Date.now()
      };

      this.endpoints.set(url, status);
      this.updateCircuitBreaker(url, false, responseTime);
      this.recordHealthHistory(url, status);

      console.log(`❌ Health check ${url} failed: ${error.message} (${responseTime}ms)`);
      return status;
    }
  }

  updateCircuitBreaker(url, success, responseTime) {
    const current = this.circuitBreakers.get(url) || {
      failures: 0,
      successes: 0,
      state: 'CLOSED', // CLOSED, OPEN, HALF_OPEN
      lastFailure: null,
      lastSuccess: null,
      avgResponseTime: 0,
      totalChecks: 0
    };

    current.totalChecks += 1;

    if (success) {
      current.successes += 1;
      current.lastSuccess = Date.now();
      current.avgResponseTime = ((current.avgResponseTime * (current.totalChecks - 1)) + responseTime) / current.totalChecks;
      
      // Reset failures on success
      if (current.state === 'HALF_OPEN' || current.failures > 0) {
        current.failures = 0;
        current.state = 'CLOSED';
        console.log(`🔓 Circuit breaker for ${url} reset to CLOSED`);
      }
    } else {
      current.failures += 1;
      current.lastFailure = Date.now();
      
      // Open circuit after 3 consecutive failures
      if (current.failures >= 3 && current.state === 'CLOSED') {
        current.state = 'OPEN';
        console.log(`🔒 Circuit breaker for ${url} opened after ${current.failures} failures`);
      }
    }

    this.circuitBreakers.set(url, current);
  }

  recordHealthHistory(url, status) {
    if (!this.healthHistory.has(url)) {
      this.healthHistory.set(url, []);
    }
    
    const history = this.healthHistory.get(url);
    history.push({
      timestamp: status.timestamp,
      healthy: status.healthy,
      responseTime: status.responseTime,
      statusCode: status.statusCode
    });
    
    // Keep only last 100 entries per endpoint
    if (history.length > 100) {
      history.splice(0, history.length - 100);
    }
  }

  isCircuitOpen(url) {
    const circuit = this.circuitBreakers.get(url);
    if (!circuit || circuit.state !== 'OPEN') return false;

    // Auto-recovery after 60 seconds (attempt half-open)
    const timeSinceFailure = Date.now() - circuit.lastFailure;
    if (timeSinceFailure > 60000) { // 60 seconds
      circuit.state = 'HALF_OPEN';
      this.circuitBreakers.set(url, circuit);
      console.log(`🔄 Circuit breaker for ${url} switched to HALF_OPEN`);
      return false;
    }

    return true;
  }

  getHealthyEndpoints(endpoints = []) {
    if (endpoints.length === 0) {
      endpoints = Array.from(this.endpoints.keys());
    }

    return endpoints
      .map(url => this.endpoints.get(url))
      .filter(endpoint => 
        endpoint && 
        endpoint.healthy && 
        !this.isCircuitOpen(endpoint.url)
      )
      .sort((a, b) => {
        // Sort by response time, then by recency
        if (a.responseTime !== b.responseTime) {
          return a.responseTime - b.responseTime;
        }
        return b.timestamp - a.timestamp;
      });
  }

  getBestEndpoint(endpoints = []) {
    const healthy = this.getHealthyEndpoints(endpoints);
    
    if (healthy.length === 0) {
      console.warn('⚠️ No healthy endpoints available');
      return null;
    }

    const best = healthy[0];
    console.log(`🏆 Best endpoint: ${best.url} (${best.responseTime}ms)`);
    return best;
  }

  async checkMultipleEndpoints(urls, options = {}) {
    console.log(`🔄 Checking ${urls.length} endpoints concurrently...`);
    
    const checks = urls.map(url => 
      this.checkEndpoint(url, options).catch(error => ({
        url,
        healthy: false,
        error: error.message,
        timestamp: Date.now()
      }))
    );

    const results = await Promise.allSettled(checks);
    const statuses = results.map(result => 
      result.status === 'fulfilled' ? result.value : result.reason
    );

    console.log(`✅ Health check completed for ${urls.length} endpoints`);
    return statuses;
  }

  startMonitoring(urls = []) {
    if (this.isMonitoring) {
      console.log('🔄 Health monitoring already running');
      return;
    }

    if (urls.length === 0) {
      console.warn('⚠️ No URLs provided for monitoring');
      return;
    }

    console.log(`🚀 Starting health monitoring for ${urls.length} endpoints...`);
    this.isMonitoring = true;

    // Initial check
    this.checkMultipleEndpoints(urls);

    // Set up periodic monitoring
    this.monitoringInterval = setInterval(() => {
      console.log('🔄 Periodic health check...');
      this.checkMultipleEndpoints(urls);
    }, this.checkInterval);

    // Monitor page visibility to pause/resume monitoring
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        console.log('⏸️ Page hidden - pausing health monitoring');
        this.pauseMonitoring();
      } else {
        console.log('▶️ Page visible - resuming health monitoring');
        this.resumeMonitoring(urls);
      }
    });
  }

  stopMonitoring() {
    if (!this.isMonitoring) return;

    console.log('⏹️ Stopping health monitoring');
    this.isMonitoring = false;
    
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
  }

  pauseMonitoring() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
  }

  resumeMonitoring(urls) {
    if (!this.isMonitoring || this.monitoringInterval) return;

    this.monitoringInterval = setInterval(() => {
      this.checkMultipleEndpoints(urls);
    }, this.checkInterval);
  }

  // Get health statistics for monitoring dashboard
  getHealthStats(url) {
    const endpoint = this.endpoints.get(url);
    const circuit = this.circuitBreakers.get(url);
    const history = this.healthHistory.get(url) || [];

    if (!endpoint) {
      return null;
    }

    // Calculate uptime from history
    const healthyCount = history.filter(h => h.healthy).length;
    const uptime = history.length > 0 ? (healthyCount / history.length) * 100 : 0;

    // Calculate average response time
    const responseTimes = history.map(h => h.responseTime).filter(rt => rt > 0);
    const avgResponseTime = responseTimes.length > 0 
      ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length 
      : 0;

    return {
      url,
      currentStatus: endpoint.healthy ? 'healthy' : 'unhealthy',
      lastCheck: endpoint.lastCheck,
      responseTime: endpoint.responseTime,
      uptime: uptime.toFixed(2),
      avgResponseTime: avgResponseTime.toFixed(0),
      circuitState: circuit?.state || 'UNKNOWN',
      totalChecks: circuit?.totalChecks || 0,
      failures: circuit?.failures || 0,
      successes: circuit?.successes || 0,
      error: endpoint.error,
      healthData: endpoint.healthData
    };
  }

  getAllHealthStats() {
    const stats = {};
    for (const url of this.endpoints.keys()) {
      stats[url] = this.getHealthStats(url);
    }
    return stats;
  }

  // Reset circuit breaker manually (for admin/debug purposes)
  resetCircuitBreaker(url) {
    const circuit = this.circuitBreakers.get(url);
    if (circuit) {
      circuit.failures = 0;
      circuit.state = 'CLOSED';
      this.circuitBreakers.set(url, circuit);
      console.log(`🔧 Circuit breaker for ${url} manually reset`);
    }
  }

  // Clear all health data (for testing/cleanup)
  clearHealthData() {
    this.endpoints.clear();
    this.circuitBreakers.clear();
    this.healthHistory.clear();
    console.log('🧹 Health data cleared');
  }
}

export default HealthCheckService;