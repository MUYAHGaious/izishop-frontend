import React, { useState, useEffect } from 'react';
import apiService from '../services/api';

const ApiTestPage = () => {
  const [status, setStatus] = useState({
    environment: null,
    currentEndpoint: null,
    healthStats: null,
    testResult: null,
    loading: true
  });

  useEffect(() => {
    const testDynamicApi = async () => {
      try {
        console.log('🧪 Starting Dynamic API Test...');
        
        // Test environment detection
        const environment = apiService.dynamicApi.getEnvironment();
        
        // Test current endpoint
        const currentEndpoint = apiService.dynamicApi.getCurrentEndpoint();
        
        // Test service status
        const serviceStatus = await apiService.dynamicApi.getServiceStatus();
        
        // Test health status
        const healthStats = await apiService.dynamicApi.getHealthStatus();
        
        // Test actual API call
        let testResult = null;
        try {
          testResult = await apiService.testConnection();
        } catch (error) {
          testResult = { error: error.message };
        }
        
        setStatus({
          environment,
          currentEndpoint,
          healthStats,
          testResult,
          serviceStatus,
          loading: false
        });
        
        console.log('🧪 Dynamic API Test Results:', {
          environment,
          currentEndpoint,
          serviceStatus,
          healthStats,
          testResult
        });
        
      } catch (error) {
        console.error('❌ Dynamic API Test Failed:', error);
        setStatus(prev => ({ ...prev, loading: false, error: error.message }));
      }
    };

    testDynamicApi();
  }, []);

  const handleForceEndpoint = async (endpoint) => {
    try {
      await apiService.dynamicApi.forceEndpoint(endpoint);
      setStatus(prev => ({ ...prev, currentEndpoint: endpoint }));
      console.log(`🔧 Forced endpoint to: ${endpoint}`);
    } catch (error) {
      console.error('❌ Failed to force endpoint:', error);
    }
  };

  const handleManualHealthTest = async () => {
    try {
      console.log('🧪 Manual health test started...');
      
      // Test direct fetch to health endpoint
      const response = await fetch('http://127.0.0.1:8000/health', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      console.log('✅ Manual health test successful:', { status: response.status, data });
      
      // Refresh the test results
      window.location.reload();
      
    } catch (error) {
      console.error('❌ Manual health test failed:', error);
    }
  };

  const handleResetCircuitBreakers = () => {
    try {
      console.log('🔧 Resetting all circuit breakers...');
      
      // Reset circuit breakers for all endpoints
      const endpoints = ['http://127.0.0.1:8000', 'http://localhost:8000', 'http://localhost:3001'];
      endpoints.forEach(endpoint => {
        apiService.dynamicApi.healthService.resetCircuitBreaker(endpoint);
      });
      
      // Clear health data to start fresh
      apiService.dynamicApi.healthService.clearHealthData();
      
      console.log('✅ All circuit breakers reset successfully');
      
      // Trigger a fresh health check
      setTimeout(() => {
        console.log('🔄 Triggering fresh health checks...');
        window.location.reload();
      }, 500);
      
    } catch (error) {
      console.error('❌ Failed to reset circuit breakers:', error);
    }
  };

  if (status.loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Dynamic API System Test</h1>
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Initializing Dynamic API System...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Dynamic API System Test</h1>
        
        {/* Environment Detection */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">🌍 Environment Detection</h2>
          {status.environment ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p><strong>Type:</strong> {status.environment.type}</p>
                <p><strong>Confidence:</strong> {(status.environment.confidence * 100).toFixed(1)}%</p>
                <p><strong>Source:</strong> {status.environment.source}</p>
                <p><strong>Detected At:</strong> {new Date(status.environment.detectedAt).toLocaleString()}</p>
              </div>
              <div>
                <p><strong>Available Backends:</strong></p>
                <ul className="list-disc ml-5">
                  {status.environment.backends?.map((backend, index) => (
                    <li key={index} className="text-sm text-gray-600">{backend}</li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <p className="text-red-600">Environment not detected</p>
          )}
        </div>

        {/* Current Endpoint */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">🎯 Current Endpoint</h2>
          <p className="text-lg font-mono bg-gray-100 p-3 rounded">
            {status.currentEndpoint || 'Not initialized'}
          </p>
          <div className="mt-4 flex gap-2 flex-wrap">
            <button 
              onClick={() => handleForceEndpoint('http://127.0.0.1:8000')}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Force Local
            </button>
            <button 
              onClick={() => handleForceEndpoint('https://izishop-backend.onrender.com')}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Force Production
            </button>
            <button 
              onClick={handleManualHealthTest}
              className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
            >
              🧪 Test Health (Manual)
            </button>
            <button 
              onClick={handleResetCircuitBreakers}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              🔧 Reset Circuit Breakers
            </button>
          </div>
        </div>

        {/* Service Status */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">📊 Service Status</h2>
          {status.serviceStatus ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p><strong>Initialized:</strong> 
                  <span className={`ml-2 px-2 py-1 rounded text-sm ${
                    status.serviceStatus.initialized ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {status.serviceStatus.initialized ? 'Yes' : 'No'}
                  </span>
                </p>
                <p><strong>Request Count:</strong> {status.serviceStatus.requestCount}</p>
                <p><strong>Error Count:</strong> {status.serviceStatus.errorCount}</p>
              </div>
              <div>
                <p><strong>Environment:</strong> {status.serviceStatus.environment}</p>
                <p><strong>Available Endpoints:</strong> {status.serviceStatus.availableEndpoints?.length || 0}</p>
                <p><strong>Last Request:</strong> {
                  status.serviceStatus.lastRequestTime 
                    ? new Date(status.serviceStatus.lastRequestTime).toLocaleString()
                    : 'None'
                }</p>
              </div>
            </div>
          ) : (
            <p className="text-red-600">Service status not available</p>
          )}
        </div>

        {/* Health Statistics */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">🏥 Health Statistics</h2>
          {status.healthStats && Object.keys(status.healthStats).length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {Object.entries(status.healthStats).map(([endpoint, stats]) => (
                <div key={endpoint} className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">{endpoint}</h3>
                  {stats ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p><strong>Status:</strong></p>
                        <span className={`px-2 py-1 rounded text-xs ${
                          stats.currentStatus === 'healthy' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {stats.currentStatus}
                        </span>
                      </div>
                      <div>
                        <p><strong>Response Time:</strong></p>
                        <p>{stats.responseTime}ms</p>
                      </div>
                      <div>
                        <p><strong>Uptime:</strong></p>
                        <p>{stats.uptime}%</p>
                      </div>
                      <div>
                        <p><strong>Circuit:</strong></p>
                        <span className={`px-2 py-1 rounded text-xs ${
                          stats.circuitState === 'CLOSED' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {stats.circuitState}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-500">No health data available</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No health statistics available yet</p>
          )}
        </div>

        {/* Connection Test */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">🔌 Connection Test</h2>
          {status.testResult ? (
            <div>
              {status.testResult.error ? (
                <div className="bg-red-50 border border-red-200 rounded p-4">
                  <p className="text-red-800"><strong>Error:</strong> {status.testResult.error}</p>
                </div>
              ) : (
                <div className="bg-green-50 border border-green-200 rounded p-4">
                  <p className="text-green-800"><strong>Connection:</strong> {status.testResult ? 'Success' : 'Failed'}</p>
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-500">No test results yet</p>
          )}
        </div>

        <div className="mt-8 text-center">
          <p className="text-gray-600">Check the browser console for detailed logs</p>
        </div>
      </div>
    </div>
  );
};

export default ApiTestPage;