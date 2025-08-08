// Frontend configuration
window.APP_CONFIG = {
  SKIP_VALIDATION: true, // Set to true to skip real-time validation when backend is not accessible
  API_TIMEOUT: 5000,      // API timeout in milliseconds 
  ENABLE_DEBUG: true,     // Enable debug logging
  API_BASE_URL: 'http://localhost:8001/api', // Explicit API base URL
  VALIDATION_RETRY_COUNT: 1, // Number of retries for validation
  GRACEFUL_DEGRADATION: true // Allow proceeding when validation fails
};