/**
 * Environment Detection Service
 * Automatically detects development, staging, or production environment
 * Based on hostname, port, URL patterns, and environment variables
 */

class EnvironmentDetector {
  constructor() {
    this.environments = new Map();
    this.currentEnvironment = null;
    this.detectionStrategies = [
      this.detectByEnvironmentVars,
      this.detectByHostname,
      this.detectByPort,
      this.detectByUrlPattern
    ];
    
    // Initialize environment configurations
    this.initEnvironmentConfigs();
  }

  initEnvironmentConfigs() {
    // Development environment
    this.environments.set('development', {
      type: 'development',
      priority: 1,
      backends: [
        'http://127.0.0.1:8000',
        'http://localhost:8000',
        'http://localhost:3001'
      ],
      features: {
        debugging: true,
        hotReload: true,
        mockData: true
      }
    });

    // Staging environment
    this.environments.set('staging', {
      type: 'staging',
      priority: 2,
      backends: [
        'https://staging-api.izishopin.com',
        'https://izishop-backend-staging.onrender.com',
        'http://localhost:8000'
      ],
      features: {
        debugging: true,
        hotReload: false,
        mockData: false
      }
    });

    // Preview environment (for Vercel/Netlify preview deployments)
    this.environments.set('preview', {
      type: 'preview', 
      priority: 2,
      backends: [
        'https://staging-api.izishopin.com',
        'http://localhost:8000'
      ],
      features: {
        debugging: false,
        hotReload: false,
        mockData: false
      }
    });

    // Production environment
    this.environments.set('production', {
      type: 'production',
      priority: 3,
      backends: [
        'https://izishop-backend.onrender.com',
        'https://api.izishopin.com'
      ],
      features: {
        debugging: false,
        hotReload: false,
        mockData: false
      }
    });
  }

  async detectEnvironment() {
    console.log('🔍 Starting environment detection...');
    
    let bestMatch = null;
    let highestConfidence = 0;
    
    // Run all detection strategies
    for (const strategy of this.detectionStrategies) {
      try {
        const result = await strategy.call(this);
        console.log(`📊 ${strategy.name} result:`, result);
        
        if (result && result.confidence > highestConfidence) {
          highestConfidence = result.confidence;
          bestMatch = result;
        }
      } catch (error) {
        console.warn(`⚠️ Detection strategy ${strategy.name} failed:`, error);
      }
    }
    
    // If no strategy was confident enough, use default
    if (!bestMatch || highestConfidence < 0.6) {
      console.log('🎯 Using default production environment');
      bestMatch = {
        type: 'production',
        confidence: 0.5,
        source: 'default'
      };
    }
    
    // Merge with environment configuration
    const envConfig = this.environments.get(bestMatch.type);
    this.currentEnvironment = {
      ...envConfig,
      ...bestMatch,
      detectedAt: new Date().toISOString()
    };
    
    console.log('✅ Environment detected:', this.currentEnvironment);
    return this.currentEnvironment;
  }

  detectByEnvironmentVars() {
    // Check Vite environment variables
    const viteEnv = import.meta.env?.MODE;
    const nodeEnv = import.meta.env?.NODE_ENV;
    const forceEnv = import.meta.env?.VITE_FORCE_ENVIRONMENT;
    
    console.log('🔧 Environment variables:', { viteEnv, nodeEnv, forceEnv });
    
    // Forced environment (highest priority)
    if (forceEnv && this.environments.has(forceEnv)) {
      return {
        type: forceEnv,
        confidence: 1.0,
        source: 'VITE_FORCE_ENVIRONMENT',
        details: { forceEnv }
      };
    }
    
    // Vite MODE detection
    if (viteEnv) {
      switch (viteEnv.toLowerCase()) {
        case 'development':
        case 'dev':
          return {
            type: 'development',
            confidence: 0.9,
            source: 'VITE_MODE',
            details: { viteEnv }
          };
        case 'staging':
        case 'stage':
          return {
            type: 'staging',
            confidence: 0.9,
            source: 'VITE_MODE',
            details: { viteEnv }
          };
        case 'production':
        case 'prod':
          return {
            type: 'production',
            confidence: 0.9,
            source: 'VITE_MODE',
            details: { viteEnv }
          };
      }
    }
    
    // Node environment fallback
    if (nodeEnv) {
      if (nodeEnv === 'development') {
        return {
          type: 'development',
          confidence: 0.7,
          source: 'NODE_ENV',
          details: { nodeEnv }
        };
      }
      if (nodeEnv === 'production') {
        return {
          type: 'production',
          confidence: 0.6,
          source: 'NODE_ENV',
          details: { nodeEnv }
        };
      }
    }
    
    return null;
  }

  detectByHostname() {
    const hostname = window.location.hostname;
    const origin = window.location.origin;
    
    console.log('🌐 Hostname detection:', { hostname, origin });
    
    // Local development
    if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname.endsWith('.local')) {
      return {
        type: 'development',
        confidence: 0.95,
        source: 'hostname',
        details: { hostname, pattern: 'localhost' }
      };
    }
    
    // IP address patterns (local network)
    if (this.isPrivateIP(hostname)) {
      return {
        type: 'development',
        confidence: 0.85,
        source: 'hostname',
        details: { hostname, pattern: 'private_ip' }
      };
    }
    
    // Vercel preview deployments
    if (hostname.includes('vercel.app') && !hostname.startsWith('www.')) {
      return {
        type: 'preview',
        confidence: 0.9,
        source: 'hostname',
        details: { hostname, pattern: 'vercel_preview' }
      };
    }
    
    // Netlify preview deployments
    if (hostname.includes('netlify.app') && (hostname.includes('deploy-preview') || hostname.includes('branch'))) {
      return {
        type: 'preview',
        confidence: 0.9,
        source: 'hostname',
        details: { hostname, pattern: 'netlify_preview' }
      };
    }
    
    // Staging patterns
    if (hostname.includes('staging') || hostname.includes('stage') || hostname.includes('dev-')) {
      return {
        type: 'staging',
        confidence: 0.85,
        source: 'hostname', 
        details: { hostname, pattern: 'staging_subdomain' }
      };
    }
    
    // Production domains
    const productionDomains = ['izishopin.com', 'www.izishopin.com'];
    if (productionDomains.includes(hostname)) {
      return {
        type: 'production',
        confidence: 0.95,
        source: 'hostname',
        details: { hostname, pattern: 'production_domain' }
      };
    }
    
    // Default to production for unknown domains
    return {
      type: 'production',
      confidence: 0.6,
      source: 'hostname',
      details: { hostname, pattern: 'unknown_domain' }
    };
  }

  detectByPort() {
    const port = window.location.port;
    
    if (!port) {
      // No port = standard HTTP/HTTPS = likely production
      return {
        type: 'production',
        confidence: 0.7,
        source: 'port',
        details: { port: 'default', protocol: window.location.protocol }
      };
    }
    
    console.log('🔌 Port detection:', { port });
    
    // Common development ports
    const devPorts = ['3000', '4028', '5173', '8080', '3001', '4000', '5000'];
    if (devPorts.includes(port)) {
      return {
        type: 'development',
        confidence: 0.8,
        source: 'port',
        details: { port, pattern: 'dev_port' }
      };
    }
    
    // Less common ports might be staging
    if (parseInt(port) > 1024 && parseInt(port) < 9000) {
      return {
        type: 'staging',
        confidence: 0.6,
        source: 'port',
        details: { port, pattern: 'high_port' }
      };
    }
    
    return null;
  }

  detectByUrlPattern() {
    const url = window.location.href;
    const pathname = window.location.pathname;
    
    console.log('🔗 URL pattern detection:', { url, pathname });
    
    // Check for preview/branch URLs
    if (url.includes('deploy-preview') || url.includes('branch-deploy')) {
      return {
        type: 'preview',
        confidence: 0.9,
        source: 'url_pattern',
        details: { url, pattern: 'deploy_preview' }
      };
    }
    
    // Check for staging indicators in URL
    if (url.includes('staging') || url.includes('dev.') || url.includes('test.')) {
      return {
        type: 'staging',
        confidence: 0.8,
        source: 'url_pattern',
        details: { url, pattern: 'staging_url' }
      };
    }
    
    // Development indicators
    if (url.includes('localhost') || url.includes('127.0.0.1')) {
      return {
        type: 'development',
        confidence: 0.9,
        source: 'url_pattern',
        details: { url, pattern: 'localhost_url' }
      };
    }
    
    return null;
  }

  isPrivateIP(hostname) {
    // Check for private IP ranges
    const ipPattern = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
    const match = hostname.match(ipPattern);
    
    if (!match) return false;
    
    const [, a, b, c, d] = match.map(Number);
    
    // Private IP ranges:
    // 10.0.0.0/8
    // 172.16.0.0/12
    // 192.168.0.0/16
    return (
      (a === 10) ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168) ||
      (a === 127) // Loopback
    );
  }

  getCurrentEnvironment() {
    return this.currentEnvironment;
  }

  getEnvironmentConfig(type) {
    return this.environments.get(type);
  }

  isDevelopment() {
    return this.currentEnvironment?.type === 'development';
  }

  isStaging() {
    return this.currentEnvironment?.type === 'staging';
  }

  isProduction() {
    return this.currentEnvironment?.type === 'production';
  }

  isPreview() {
    return this.currentEnvironment?.type === 'preview';
  }

  // Force environment for testing
  forceEnvironment(type) {
    if (this.environments.has(type)) {
      const envConfig = this.environments.get(type);
      this.currentEnvironment = {
        ...envConfig,
        confidence: 1.0,
        source: 'forced',
        detectedAt: new Date().toISOString()
      };
      console.log('🔧 Forced environment:', this.currentEnvironment);
      return this.currentEnvironment;
    }
    throw new Error(`Unknown environment type: ${type}`);
  }
}

export default EnvironmentDetector;