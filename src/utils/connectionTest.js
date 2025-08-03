/**
 * Simple utility to test backend connection
 */

const API_BASE_URL = 'http://localhost:8000';

export const testBackendConnection = async () => {
  try {
    console.log('Testing backend connection...');
    
    // Try a simple health check with shorter timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000); // Reduced to 2 seconds
    
    const response = await fetch(`${API_BASE_URL}/docs`, {
      method: 'HEAD',
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (response.ok) {
      console.log('✅ Backend is running and accessible');
      return { status: 'success', message: 'Backend is running' };
    } else {
      console.warn('⚠️ Backend responded but with error:', response.status);
      return { status: 'warning', message: `Backend responded with ${response.status}` };
    }
  } catch (error) {
    if (error.name === 'AbortError') {
      console.error('❌ Backend connection timeout');
      return { status: 'error', message: 'Backend connection timeout' };
    }
    
    console.error('❌ Backend connection failed:', error.message);
    return { status: 'error', message: 'Backend is not running or not accessible' };
  }
};

export const testWebSocketConnection = async () => {
  return new Promise((resolve) => {
    try {
      const ws = new WebSocket(`ws://localhost:8000/ws/online-status`);
      
      const timeout = setTimeout(() => {
        ws.close();
        resolve({ status: 'error', message: 'WebSocket connection timeout' });
      }, 2000); // Reduced to 2 seconds
      
      ws.onopen = () => {
        clearTimeout(timeout);
        ws.close();
        resolve({ status: 'success', message: 'WebSocket is working' });
      };
      
      ws.onerror = (error) => {
        clearTimeout(timeout);
        resolve({ status: 'error', message: 'WebSocket connection failed' });
      };
      
    } catch (error) {
      resolve({ status: 'error', message: `WebSocket error: ${error.message}` });
    }
  });
};

// Run connection tests
export const runConnectionTests = async () => {
  console.log('🔍 Running connection diagnostics...');
  
  const results = {
    backend: await testBackendConnection(),
    websocket: await testWebSocketConnection()
  };
  
  console.log('📊 Connection Test Results:', results);
  return results;
};