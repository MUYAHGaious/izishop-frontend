# Dynamic API Endpoint System Implementation Plan

## Table of Contents
1. [Executive Summary](#executive-summary)
2. [Research Findings](#research-findings)
3. [Tech Giants' Approaches](#tech-giants-approaches)
4. [System Architecture Design](#system-architecture-design)
5. [Implementation Phases](#implementation-phases)
6. [Technical Implementation](#technical-implementation)
7. [Testing Strategy](#testing-strategy)
8. [Deployment Strategy](#deployment-strategy)
9. [Monitoring & Observability](#monitoring--observability)
10. [Security Considerations](#security-considerations)

## Executive Summary

Based on extensive research into how tech giants like Netflix, Google, Amazon, and Meta handle dynamic API endpoint configuration, this document outlines a comprehensive plan to implement an intelligent, self-adapting API discovery system for the IziShop frontend-backend architecture.

### Key Objectives
- **Zero Configuration**: Automatic detection of development vs production environments
- **Resilient Communication**: Automatic failover between local and remote backends
- **Health-Aware Routing**: Dynamic endpoint selection based on service health
- **Deployment Agnostic**: Same codebase works across all environments
- **Performance Optimized**: Intelligent caching and connection pooling

## Research Findings

### Industry Standards & Patterns

#### 1. Service Discovery Patterns (Netflix/AWS Model)
- **Client-Side Discovery**: Services query a registry to find available instances
- **Server-Side Discovery**: Load balancer/API gateway handles service location
- **Hybrid Model**: Combination of both approaches for maximum resilience

#### 2. Runtime Configuration Injection
- **Environment-Agnostic Builds**: Single artifact deployed across environments
- **Config Endpoint Pattern**: Dedicated configuration service provides runtime settings
- **Health Check Integration**: Continuous service availability monitoring

#### 3. Modern Frontend Deployment (Vercel/Netlify 2025)
- **Edge Function Integration**: API detection at edge locations
- **Build-Time vs Runtime**: Hybrid approach for optimal performance
- **Automatic Environment Detection**: Platform-aware configuration

### Tech Giants' Approaches

#### Netflix Architecture
```javascript
// Netflix's Zuul Pattern
const serviceDiscovery = {
  registry: 'Eureka',
  gateway: 'Zuul',
  routing: 'Dynamic',
  fallback: 'Hystrix Circuit Breaker'
}
```

#### Amazon's Service Mesh
```yaml
# AWS App Mesh Pattern
service_discovery:
  type: "DNS-based"
  health_checks: "continuous"
  routing: "weighted"
  failover: "automatic"
```

#### Google's Service Infrastructure
```javascript
// Google's Service Directory Pattern
const discovery = {
  method: 'DNS + Health Checks',
  caching: 'Multi-tier',
  fallback: 'Circuit Breaker',
  observability: 'Full tracing'
}
```

## System Architecture Design

### 1. Multi-Tier Discovery System

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │  Discovery      │    │   Backends      │
│   Application   │◄──►│  Service        │◄──►│                 │
└─────────────────┘    └─────────────────┘    │ • Local:8000    │
         │                       │             │ • Production    │
         │                       │             │ • Staging       │
         ▼                       ▼             │ • Edge APIs     │
┌─────────────────┐    ┌─────────────────┐    └─────────────────┘
│  Health Check   │    │  Config Cache   │
│  Monitor        │    │  & Registry     │
└─────────────────┘    └─────────────────┘
```

### 2. Decision Tree Logic

```
Start Application
      │
      ▼
Check Environment
      │
   ┌──┴──┐
   │     │
   ▼     ▼
Local?  Prod?
   │     │
   ▼     ▼
Ping    Use
Local   Remote
   │     │
   ▼     │
Available? ◄──┘
   │
┌──┴──┐
│     │
▼     ▼
Yes   No
│     │
▼     ▼
Use   Fallback
Local to Remote
```

### 3. Core Components

#### A. Environment Detector
- **Host Analysis**: `localhost`, `127.0.0.1`, dev domains
- **Port Detection**: Development server ports (3000, 4028, 5173)
- **URL Pattern Matching**: Preview URLs, staging domains
- **Environment Variables**: Override mechanisms

#### B. Health Check Service
- **Endpoint Monitoring**: Continuous health validation
- **Response Time Tracking**: Performance-based routing
- **Circuit Breaker**: Automatic failover on failures
- **Recovery Detection**: Automatic restoration

#### C. Configuration Registry
- **Service Catalog**: Available endpoints and capabilities
- **Routing Rules**: Priority and fallback logic
- **Cache Management**: Intelligent configuration caching
- **Hot Reloading**: Runtime configuration updates

## Implementation Phases

### Phase 1: Foundation (Week 1-2)
1. **Environment Detection Service**
   - Implement smart environment detection
   - Create configuration registry
   - Build basic health checking

2. **API Service Refactoring**
   - Extract endpoint configuration
   - Implement dynamic base URL selection
   - Add connection pooling

### Phase 2: Intelligence (Week 3-4)
1. **Health Monitoring System**
   - Continuous endpoint health checks
   - Performance metrics collection
   - Automatic failover logic

2. **Circuit Breaker Pattern**
   - Failure detection and isolation
   - Automatic recovery mechanisms
   - Graceful degradation

### Phase 3: Optimization (Week 5-6)
1. **Advanced Routing**
   - Weighted routing based on performance
   - Geographic routing for edge cases
   - Load balancing across multiple backends

2. **Caching & Performance**
   - Configuration caching with TTL
   - Connection pooling optimization
   - Response caching strategies

### Phase 4: Observability (Week 7-8)
1. **Monitoring & Alerting**
   - Service discovery metrics
   - Health check dashboards
   - Automatic alerting on failures

2. **Debug & Analytics**
   - Route decision logging
   - Performance analytics
   - Error tracking and reporting

## Technical Implementation

### 1. Environment Detection Service

```javascript
// src/services/environment.js
class EnvironmentDetector {
  constructor() {
    this.environments = new Map();
    this.currentEnvironment = null;
    this.detectionStrategies = [
      this.detectByHostname,
      this.detectByPort,
      this.detectByUrlPattern,
      this.detectByEnvironmentVars
    ];
  }

  async detectEnvironment() {
    // Multi-strategy environment detection
    for (const strategy of this.detectionStrategies) {
      const result = await strategy.call(this);
      if (result.confidence > 0.8) {
        this.currentEnvironment = result;
        break;
      }
    }
    
    return this.currentEnvironment || this.getDefaultEnvironment();
  }

  detectByHostname() {
    const hostname = window.location.hostname;
    
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return {
        type: 'development',
        confidence: 0.95,
        backends: ['http://127.0.0.1:8000', 'http://localhost:8000']
      };
    }
    
    if (hostname.includes('preview') || hostname.includes('deploy-preview')) {
      return {
        type: 'preview',
        confidence: 0.9,
        backends: ['https://staging-api.izishopin.com', 'https://izishop-backend.onrender.com']
      };
    }
    
    if (hostname.includes('staging')) {
      return {
        type: 'staging',
        confidence: 0.9,
        backends: ['https://staging-api.izishopin.com']
      };
    }
    
    return {
      type: 'production',
      confidence: 0.85,
      backends: ['https://izishop-backend.onrender.com']
    };
  }
  
  // Additional detection strategies...
}
```

### 2. Health Check Service

```javascript
// src/services/healthCheck.js
class HealthCheckService {
  constructor() {
    this.endpoints = new Map();
    this.checkInterval = 30000; // 30 seconds
    this.timeout = 5000; // 5 seconds
    this.circuitBreaker = new Map();
  }

  async checkEndpoint(url) {
    const startTime = Date.now();
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);
      
      const response = await fetch(`${url}/health`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      const responseTime = Date.now() - startTime;
      const isHealthy = response.ok;
      
      const status = {
        url,
        healthy: isHealthy,
        responseTime,
        statusCode: response.status,
        lastCheck: new Date().toISOString(),
        error: null
      };
      
      this.endpoints.set(url, status);
      this.updateCircuitBreaker(url, isHealthy);
      
      return status;
      
    } catch (error) {
      const status = {
        url,
        healthy: false,
        responseTime: Date.now() - startTime,
        statusCode: 0,
        lastCheck: new Date().toISOString(),
        error: error.message
      };
      
      this.endpoints.set(url, status);
      this.updateCircuitBreaker(url, false);
      
      return status;
    }
  }

  updateCircuitBreaker(url, success) {
    const current = this.circuitBreaker.get(url) || {
      failures: 0,
      state: 'CLOSED', // CLOSED, OPEN, HALF_OPEN
      lastFailure: null
    };

    if (success) {
      current.failures = 0;
      current.state = 'CLOSED';
    } else {
      current.failures += 1;
      current.lastFailure = Date.now();
      
      if (current.failures >= 3) {
        current.state = 'OPEN';
      }
    }

    this.circuitBreaker.set(url, current);
  }

  isCircuitOpen(url) {
    const circuit = this.circuitBreaker.get(url);
    if (!circuit || circuit.state !== 'OPEN') return false;
    
    // Auto-recovery after 60 seconds
    const timeSinceFailure = Date.now() - circuit.lastFailure;
    if (timeSinceFailure > 60000) {
      circuit.state = 'HALF_OPEN';
      this.circuitBreaker.set(url, circuit);
      return false;
    }
    
    return true;
  }
  
  getHealthyEndpoints() {
    return Array.from(this.endpoints.values())
      .filter(endpoint => endpoint.healthy && !this.isCircuitOpen(endpoint.url))
      .sort((a, b) => a.responseTime - b.responseTime); // Sort by response time
  }
}
```

### 3. Dynamic API Service

```javascript
// src/services/dynamicApi.js
class DynamicApiService {
  constructor() {
    this.environmentDetector = new EnvironmentDetector();
    this.healthCheck = new HealthCheckService();
    this.configRegistry = new ConfigRegistry();
    this.currentEndpoint = null;
    this.fallbackEndpoints = [];
    
    this.init();
  }

  async init() {
    // Detect environment and get potential endpoints
    const environment = await this.environmentDetector.detectEnvironment();
    console.log('🌍 Detected environment:', environment);
    
    // Get all potential backends for this environment
    this.fallbackEndpoints = environment.backends || [];
    
    // Start health monitoring
    this.startHealthMonitoring();
    
    // Select best endpoint
    await this.selectBestEndpoint();
  }

  async selectBestEndpoint() {
    console.log('🔍 Selecting best endpoint from:', this.fallbackEndpoints);
    
    // Check all endpoints concurrently
    const healthChecks = this.fallbackEndpoints.map(url => 
      this.healthCheck.checkEndpoint(url)
    );
    
    const results = await Promise.allSettled(healthChecks);
    
    // Get healthy endpoints sorted by response time
    const healthyEndpoints = this.healthCheck.getHealthyEndpoints();
    
    if (healthyEndpoints.length > 0) {
      this.currentEndpoint = healthyEndpoints[0].url;
      console.log('✅ Selected endpoint:', this.currentEndpoint);
    } else {
      // Fallback to first endpoint even if unhealthy
      this.currentEndpoint = this.fallbackEndpoints[0];
      console.warn('⚠️ No healthy endpoints, using fallback:', this.currentEndpoint);
    }
    
    // Cache the decision
    this.configRegistry.setActiveEndpoint(this.currentEndpoint);
  }

  async request(endpoint, options = {}, requireAuth = true) {
    const maxRetries = this.fallbackEndpoints.length;
    let lastError = null;
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        // Get current best endpoint
        if (!this.currentEndpoint) {
          await this.selectBestEndpoint();
        }
        
        const url = `${this.currentEndpoint}${endpoint}`;
        console.log(`📡 API Request (attempt ${attempt + 1}):`, url);
        
        const response = await fetch(url, {
          ...options,
          headers: {
            'Content-Type': 'application/json',
            ...(requireAuth && { 'Authorization': `Bearer ${this.getAccessToken()}` }),
            ...options.headers
          }
        });
        
        if (response.ok) {
          // Request successful, update health status
          this.healthCheck.updateCircuitBreaker(this.currentEndpoint, true);
          return await response.json();
        }
        
        // Handle specific error codes
        if (response.status >= 400 && response.status < 500) {
          // Client errors shouldn't trigger fallback
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        // Server errors trigger fallback
        throw new Error(`Server error: ${response.status}`);
        
      } catch (error) {
        lastError = error;
        console.warn(`❌ Request failed on ${this.currentEndpoint}:`, error.message);
        
        // Update circuit breaker
        this.healthCheck.updateCircuitBreaker(this.currentEndpoint, false);
        
        // Try next endpoint
        const currentIndex = this.fallbackEndpoints.indexOf(this.currentEndpoint);
        const nextIndex = (currentIndex + 1) % this.fallbackEndpoints.length;
        this.currentEndpoint = this.fallbackEndpoints[nextIndex];
        
        console.log(`🔄 Switching to fallback endpoint: ${this.currentEndpoint}`);
      }
    }
    
    // All endpoints failed
    throw new Error(`All endpoints failed. Last error: ${lastError?.message}`);
  }
  
  startHealthMonitoring() {
    setInterval(() => {
      this.fallbackEndpoints.forEach(url => {
        this.healthCheck.checkEndpoint(url);
      });
      
      // Re-evaluate best endpoint every minute
      this.selectBestEndpoint();
    }, 30000); // 30 seconds
  }
  
  // API methods with automatic failover
  async register(userData) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    }, false);
  }
  
  async login(credentials) {
    return this.request('/auth/login', {
      method: 'POST', 
      body: JSON.stringify(credentials)
    }, false);
  }
  
  // ... other API methods
}
```

### 4. Configuration Registry

```javascript
// src/services/configRegistry.js
class ConfigRegistry {
  constructor() {
    this.config = new Map();
    this.cache = new Map();
    this.observers = new Set();
    this.loadFromStorage();
  }

  setActiveEndpoint(endpoint) {
    this.config.set('activeEndpoint', {
      url: endpoint,
      timestamp: Date.now(),
      ttl: 300000 // 5 minutes
    });
    
    this.saveToStorage();
    this.notifyObservers('activeEndpoint', endpoint);
  }

  getActiveEndpoint() {
    const entry = this.config.get('activeEndpoint');
    
    if (!entry) return null;
    
    // Check TTL
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.config.delete('activeEndpoint');
      return null;
    }
    
    return entry.url;
  }

  subscribe(callback) {
    this.observers.add(callback);
    return () => this.observers.delete(callback);
  }

  notifyObservers(key, value) {
    this.observers.forEach(callback => {
      try {
        callback(key, value);
      } catch (error) {
        console.error('Observer notification error:', error);
      }
    });
  }

  saveToStorage() {
    try {
      const data = Object.fromEntries(this.config);
      localStorage.setItem('apiConfig', JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to save config to storage:', error);
    }
  }

  loadFromStorage() {
    try {
      const stored = localStorage.getItem('apiConfig');
      if (stored) {
        const data = JSON.parse(stored);
        Object.entries(data).forEach(([key, value]) => {
          this.config.set(key, value);
        });
      }
    } catch (error) {
      console.warn('Failed to load config from storage:', error);
    }
  }
}
```

## Testing Strategy

### 1. Unit Testing
```javascript
// Test environment detection
describe('EnvironmentDetector', () => {
  test('detects localhost development environment', () => {
    Object.defineProperty(window, 'location', {
      value: { hostname: 'localhost', port: '4028' }
    });
    
    const detector = new EnvironmentDetector();
    const result = detector.detectByHostname();
    
    expect(result.type).toBe('development');
    expect(result.confidence).toBeGreaterThan(0.9);
  });
});

// Test health checking
describe('HealthCheckService', () => {
  test('correctly identifies healthy endpoint', async () => {
    const healthCheck = new HealthCheckService();
    // Mock successful response
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ status: 'healthy' })
      })
    );
    
    const result = await healthCheck.checkEndpoint('http://test-api.com');
    expect(result.healthy).toBe(true);
  });
});
```

### 2. Integration Testing
```javascript
// Test full API discovery flow
describe('Dynamic API Integration', () => {
  test('automatically selects best endpoint', async () => {
    const api = new DynamicApiService();
    
    // Mock multiple endpoints with different response times
    mockEndpoints([
      { url: 'http://local:8000', responseTime: 50, healthy: true },
      { url: 'https://remote.com', responseTime: 200, healthy: true }
    ]);
    
    await api.init();
    
    expect(api.currentEndpoint).toBe('http://local:8000');
  });
  
  test('fails over to secondary endpoint when primary fails', async () => {
    const api = new DynamicApiService();
    
    // Simulate primary endpoint failure
    mockEndpointFailure('http://local:8000');
    
    const response = await api.request('/test');
    
    expect(api.currentEndpoint).toBe('https://remote.com');
    expect(response).toBeDefined();
  });
});
```

### 3. E2E Testing with Playwright
```javascript
// Test real-world scenarios
test('development environment auto-detection', async ({ page }) => {
  await page.goto('http://localhost:4028');
  
  // Check that local API is being used
  const apiCalls = await page.evaluate(() => {
    return window.__API_CALLS__ || [];
  });
  
  expect(apiCalls.some(call => call.includes('127.0.0.1:8000'))).toBe(true);
});

test('production deployment uses correct endpoint', async ({ page }) => {
  await page.goto('https://izishopin.com');
  
  const apiCalls = await page.evaluate(() => {
    return window.__API_CALLS__ || [];
  });
  
  expect(apiCalls.some(call => call.includes('izishop-backend.onrender.com'))).toBe(true);
});
```

## Deployment Strategy

### 1. Development Workflow
```bash
# 1. Local development - no configuration needed
npm run dev
# ✅ Automatically detects and uses http://127.0.0.1:8000

# 2. Staging deployment
npm run build
# ✅ Automatically detects staging environment and uses staging API

# 3. Production deployment  
npm run deploy
# ✅ Automatically detects production and uses production API
```

### 2. Environment Variables (Optional Override)
```bash
# .env.local (development override)
VITE_API_ENDPOINTS=["http://127.0.0.1:8000","http://localhost:3001"]
VITE_FORCE_ENVIRONMENT=development

# .env.staging
VITE_API_ENDPOINTS=["https://staging-api.izishopin.com"]
VITE_FORCE_ENVIRONMENT=staging

# .env.production
VITE_API_ENDPOINTS=["https://izishop-backend.onrender.com"]
VITE_FORCE_ENVIRONMENT=production
```

### 3. Docker Configuration
```dockerfile
# Multi-stage build with environment detection
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
# No environment-specific builds needed
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

# Runtime configuration injection
COPY docker-entrypoint.sh /
RUN chmod +x /docker-entrypoint.sh
ENTRYPOINT ["/docker-entrypoint.sh"]
```

### 4. Kubernetes Deployment
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: izishop-frontend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: izishop-frontend
  template:
    spec:
      containers:
      - name: frontend
        image: izishop/frontend:latest
        env:
        - name: ENVIRONMENT
          value: "auto-detect"
        - name: API_ENDPOINTS
          value: "auto-discover"
        ports:
        - containerPort: 80
        livenessProbe:
          httpGet:
            path: /health
            port: 80
          initialDelaySeconds: 30
          periodSeconds: 10
---
apiVersion: v1
kind: Service
metadata:
  name: izishop-frontend-service
spec:
  selector:
    app: izishop-frontend
  ports:
  - port: 80
    targetPort: 80
  type: LoadBalancer
```

## Monitoring & Observability

### 1. Metrics Collection
```javascript
// Metrics service for monitoring API discovery
class ApiMetricsService {
  constructor() {
    this.metrics = {
      endpointSelections: new Map(),
      responseMetrics: new Map(),
      failoverEvents: [],
      healthCheckResults: new Map()
    };
  }

  recordEndpointSelection(endpoint, reason) {
    const key = `${endpoint}-${reason}`;
    const current = this.metrics.endpointSelections.get(key) || 0;
    this.metrics.endpointSelections.set(key, current + 1);
    
    // Send to analytics
    this.sendMetric('endpoint_selection', {
      endpoint,
      reason,
      timestamp: Date.now()
    });
  }

  recordApiCall(endpoint, duration, success) {
    const key = endpoint;
    const current = this.metrics.responseMetrics.get(key) || {
      totalCalls: 0,
      totalDuration: 0,
      successCount: 0,
      errorCount: 0
    };
    
    current.totalCalls += 1;
    current.totalDuration += duration;
    
    if (success) {
      current.successCount += 1;
    } else {
      current.errorCount += 1;
    }
    
    this.metrics.responseMetrics.set(key, current);
  }

  getHealthDashboard() {
    return {
      endpoints: Array.from(this.metrics.responseMetrics.entries()).map(([endpoint, stats]) => ({
        endpoint,
        avgResponseTime: stats.totalDuration / stats.totalCalls,
        successRate: (stats.successCount / stats.totalCalls) * 100,
        totalCalls: stats.totalCalls
      })),
      failovers: this.metrics.failoverEvents.slice(-10), // Last 10 failovers
      currentEndpoint: this.getCurrentEndpoint()
    };
  }
}
```

### 2. Dashboard Integration
```javascript
// React component for API health monitoring
const ApiHealthDashboard = () => {
  const [health, setHealth] = useState(null);
  const metricsService = useApiMetrics();

  useEffect(() => {
    const interval = setInterval(() => {
      setHealth(metricsService.getHealthDashboard());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  if (!health) return <div>Loading health data...</div>;

  return (
    <div className="api-health-dashboard">
      <h3>API Health Status</h3>
      
      <div className="current-endpoint">
        <strong>Active Endpoint:</strong> {health.currentEndpoint}
      </div>
      
      <div className="endpoints-grid">
        {health.endpoints.map(endpoint => (
          <div key={endpoint.endpoint} className="endpoint-card">
            <h4>{endpoint.endpoint}</h4>
            <div>Avg Response: {endpoint.avgResponseTime.toFixed(0)}ms</div>
            <div>Success Rate: {endpoint.successRate.toFixed(1)}%</div>
            <div>Total Calls: {endpoint.totalCalls}</div>
          </div>
        ))}
      </div>
      
      {health.failovers.length > 0 && (
        <div className="recent-failovers">
          <h4>Recent Failovers</h4>
          <ul>
            {health.failovers.map((event, i) => (
              <li key={i}>{event.timestamp}: {event.from} → {event.to}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
```

## Security Considerations

### 1. Endpoint Validation
```javascript
// Whitelist allowed endpoints
const ALLOWED_ENDPOINTS = {
  development: [
    'http://127.0.0.1:8000',
    'http://localhost:8000',
    'http://localhost:3001'
  ],
  staging: [
    'https://staging-api.izishopin.com',
    'https://izishop-backend-staging.onrender.com'
  ],
  production: [
    'https://izishop-backend.onrender.com',
    'https://api.izishopin.com'
  ]
};

class SecurityValidator {
  static validateEndpoint(url, environment) {
    const allowed = ALLOWED_ENDPOINTS[environment] || ALLOWED_ENDPOINTS.production;
    
    try {
      const parsedUrl = new URL(url);
      
      // Check against whitelist
      const isAllowed = allowed.some(allowedUrl => {
        const allowedParsed = new URL(allowedUrl);
        return allowedParsed.origin === parsedUrl.origin;
      });
      
      if (!isAllowed) {
        console.error(`Security: Endpoint ${url} not in whitelist for ${environment}`);
        return false;
      }
      
      // Additional security checks
      if (parsedUrl.protocol !== 'https:' && !this.isLocalhost(parsedUrl.hostname)) {
        console.error(`Security: Non-HTTPS endpoint ${url} not allowed in production`);
        return false;
      }
      
      return true;
      
    } catch (error) {
      console.error(`Security: Invalid URL ${url}:`, error);
      return false;
    }
  }
  
  static isLocalhost(hostname) {
    return hostname === 'localhost' || 
           hostname === '127.0.0.1' || 
           hostname.startsWith('192.168.') ||
           hostname.startsWith('10.') ||
           hostname.endsWith('.local');
  }
}
```

### 2. Rate Limiting & Circuit Breaker Security
```javascript
// Enhanced circuit breaker with security features
class SecureCircuitBreaker {
  constructor(endpoint) {
    this.endpoint = endpoint;
    this.failures = 0;
    this.lastFailure = null;
    this.state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
    this.rateLimiter = new Map(); // IP-based rate limiting
    this.suspiciousActivity = [];
  }

  async makeRequest(request, clientId = 'anonymous') {
    // Rate limiting check
    if (!this.checkRateLimit(clientId)) {
      throw new Error('Rate limit exceeded');
    }
    
    // Circuit breaker check
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailure < 60000) { // 1 minute timeout
        throw new Error('Circuit breaker is OPEN');
      } else {
        this.state = 'HALF_OPEN';
      }
    }
    
    try {
      const response = await fetch(request);
      
      if (response.ok) {
        this.onSuccess();
      } else {
        this.onFailure(`HTTP ${response.status}`, clientId);
      }
      
      return response;
      
    } catch (error) {
      this.onFailure(error.message, clientId);
      throw error;
    }
  }
  
  checkRateLimit(clientId) {
    const now = Date.now();
    const windowStart = now - 60000; // 1 minute window
    
    const clientRequests = this.rateLimiter.get(clientId) || [];
    const recentRequests = clientRequests.filter(timestamp => timestamp > windowStart);
    
    if (recentRequests.length >= 100) { // Max 100 requests per minute
      this.recordSuspiciousActivity(clientId, 'RATE_LIMIT_EXCEEDED');
      return false;
    }
    
    recentRequests.push(now);
    this.rateLimiter.set(clientId, recentRequests);
    return true;
  }
  
  recordSuspiciousActivity(clientId, type) {
    this.suspiciousActivity.push({
      clientId,
      type,
      timestamp: Date.now(),
      endpoint: this.endpoint
    });
    
    // Keep only last 100 entries
    if (this.suspiciousActivity.length > 100) {
      this.suspiciousActivity = this.suspiciousActivity.slice(-100);
    }
  }
}
```

## Conclusion

This comprehensive plan provides a robust, intelligent API discovery system that matches the sophistication of tech giants' architectures while being tailored to IziShop's specific needs. The implementation will provide:

- **Zero-configuration deployment** across all environments
- **Intelligent failover** with health-based routing  
- **Performance optimization** through response time monitoring
- **Security-first approach** with endpoint validation and rate limiting
- **Full observability** with metrics, monitoring, and alerting
- **Future-proof architecture** that can scale with growing requirements

The phased implementation approach ensures minimal disruption to current development while progressively adding intelligence and resilience to the API communication layer.

---

**Next Steps**: Review this plan and approve the implementation phases. The system can be built incrementally while maintaining backward compatibility with the current API service.