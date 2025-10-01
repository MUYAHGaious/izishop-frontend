/**
 * Frontend Logger - Sends logs to backend for debugging
 */

class FrontendLogger {
  constructor() {
    this.enabled = true;
    this.backendUrl = 'http://127.0.0.1:8000/api/debug/log';
    this.buffer = [];
    this.flushInterval = 2000; // Flush every 2 seconds
    this.maxBufferSize = 50;

    // Start auto-flush
    setInterval(() => this.flush(), this.flushInterval);

    // Flush on page unload
    window.addEventListener('beforeunload', () => this.flush());
  }

  log(level, message, data = null) {
    if (!this.enabled) return;

    const logEntry = {
      timestamp: new Date().toISOString(),
      level: level,
      message: message,
      data: data,
      url: window.location.href,
      userAgent: navigator.userAgent.substring(0, 100) // Truncate
    };

    // Add to buffer
    this.buffer.push(logEntry);

    // Also log to console
    const consoleMethod = level === 'error' ? 'error' : level === 'warn' ? 'warn' : 'log';
    console[consoleMethod](`[${level.toUpperCase()}]`, message, data || '');

    // Flush if buffer is full
    if (this.buffer.length >= this.maxBufferSize) {
      this.flush();
    }
  }

  async flush() {
    if (this.buffer.length === 0) return;

    const logsToSend = [...this.buffer];
    this.buffer = [];

    try {
      await fetch(this.backendUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          logs: logsToSend,
          page: window.location.pathname
        })
      });
    } catch (error) {
      // Silent fail - don't want logging to break the app
      console.error('Failed to send logs to backend:', error.message);
    }
  }

  info(message, data) {
    this.log('info', message, data);
  }

  warn(message, data) {
    this.log('warn', message, data);
  }

  error(message, data) {
    this.log('error', message, data);
  }

  debug(message, data) {
    this.log('debug', message, data);
  }
}

// Create singleton instance
const logger = new FrontendLogger();

export default logger;
