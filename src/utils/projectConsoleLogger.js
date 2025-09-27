// Project-based Console Logger - Sends logs to backend for organized storage
// Captures everything from Chrome DevTools Console and saves to project debug-logs folder

class ProjectConsoleLogger {
    constructor() {
        this.logs = [];
        this.sessionId = this.generateSessionId();
        this.isActive = false;
        this.logQueue = [];
        this.isUploading = false;
        
        // Always run - we want to capture all console activity
        this.init();
    }
    
    init() {
        console.log('📝 Project Console Logger Started - Saving to backend/debug-logs/');
        this.isActive = true;
        
        this.logSessionStart();
        this.interceptAllConsoleMethods();
        this.setupAutoSave();
        this.setupShutdownHandlers();
        
        // Force immediate save to capture startup logs
        setTimeout(() => {
            this.sendLogsToBackend(true);
        }, 3000);
        
        console.log('✅ Console logging active - Files saved to backend/debug-logs/ every 10 seconds!');
        console.log('🚨 CAPTURING EVERYTHING - All console activity organized in project folder!');
    }
    
    generateSessionId() {
        const now = new Date();
        const date = now.toISOString().split('T')[0];
        const time = now.toTimeString().split(' ')[0].replace(/:/g, '-');
        return `frontend_${date}_${time}_${Math.random().toString(36).substr(2, 6)}`;
    }
    
    logSessionStart() {
        this.addLog('SYSTEM', '='.repeat(80));
        this.addLog('SYSTEM', `NEW FRONTEND SESSION STARTED: ${this.sessionId}`);
        this.addLog('SYSTEM', `Browser: ${navigator.userAgent}`);
        this.addLog('SYSTEM', `URL: ${window.location.href}`);
        this.addLog('SYSTEM', `Time: ${new Date().toISOString()}`);
        this.addLog('SYSTEM', '='.repeat(80));
    }
    
    interceptAllConsoleMethods() {
        // Store original console methods
        const originalMethods = {
            log: console.log,
            error: console.error,
            warn: console.warn,
            info: console.info,
            debug: console.debug,
            trace: console.trace,
            table: console.table,
            dir: console.dir,
            assert: console.assert
        };
        
        // Intercept all console methods
        Object.keys(originalMethods).forEach(method => {
            console[method] = (...args) => {
                this.addLog(method.toUpperCase(), this.formatArgs(args));
                originalMethods[method].apply(console, args);
            };
        });
        
        // Global error handlers
        window.addEventListener('error', (event) => {
            this.addLog('GLOBAL_ERROR', `${event.message} at ${event.filename}:${event.lineno}:${event.colno}`);
            if (event.error && event.error.stack) {
                this.addLog('STACK', event.error.stack);
            }
        });
        
        window.addEventListener('unhandledrejection', (event) => {
            this.addLog('PROMISE_REJECT', event.reason?.message || String(event.reason));
            if (event.reason && event.reason.stack) {
                this.addLog('STACK', event.reason.stack);
            }
        });
    }
    
    formatArgs(args) {
        return args.map(arg => {
            if (typeof arg === 'object' && arg !== null) {
                try {
                    return JSON.stringify(arg, null, 2);
                } catch (e) {
                    return String(arg);
                }
            }
            return String(arg);
        }).join(' ');
    }
    
    addLog(level, message) {
        const timestamp = new Date();
        const timeStr = timestamp.toTimeString().split(' ')[0];
        const page = window.location.pathname;
        
        const logEntry = {
            timestamp: timestamp.toISOString(),
            timeStr,
            level,
            page,
            message,
            sessionId: this.sessionId,
            raw: `[${timeStr}] ${level.padEnd(6)} | ${page.padEnd(15)} | ${message}`
        };
        
        this.logs.push(logEntry);
        this.logQueue.push(logEntry);
        
        // Keep only last 1000 logs in memory to prevent memory issues
        if (this.logs.length > 1000) {
            this.logs = this.logs.slice(-800);
        }
    }
    
    setupAutoSave() {
        // Send logs to backend every 10 seconds
        setInterval(() => {
            if (this.logQueue.length > 0) {
                this.sendLogsToBackend();
            }
        }, 10000);
        
        // Also save when navigating between pages
        let lastPath = window.location.pathname;
        setInterval(() => {
            if (window.location.pathname !== lastPath) {
                this.addLog('NAVIGATION', `Changed from ${lastPath} to ${window.location.pathname}`);
                lastPath = window.location.pathname;
                this.sendLogsToBackend();
            }
        }, 1000);
    }
    
    setupShutdownHandlers() {
        // Save immediately before page unload
        window.addEventListener('beforeunload', () => {
            this.addLog('SYSTEM', 'SESSION ENDING - Page unload detected');
            this.sendLogsToBackend(true, true); // Force synchronous save
        });
        
        // Save on visibility change (tab switching)
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.addLog('SYSTEM', 'Tab hidden - saving logs');
                this.sendLogsToBackend();
            }
        });
    }
    
    async sendLogsToBackend(immediate = false, synchronous = false) {
        if (this.isUploading || this.logQueue.length === 0) return;
        
        this.isUploading = true;
        
        try {
            const logsToSend = [...this.logQueue];
            this.logQueue = []; // Clear queue
            
            const payload = {
                sessionId: this.sessionId,
                logs: logsToSend,
                timestamp: new Date().toISOString(),
                immediate: immediate
            };
            
            // Environment-aware URL similar to api.js
            const getApiBaseUrl = () => {
                const hostname = window.location.hostname;
                const port = window.location.port;

                // Check for local development
                if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname.endsWith('.local')) {
                    return 'http://127.0.0.1:8000';
                }

                // Check for development ports
                if (port && ['3000', '4028', '5173', '8080', '3001', '4000', '5000'].includes(port)) {
                    return 'http://127.0.0.1:8000';
                }

                // Default to production
                return 'https://izishop-backend.onrender.com';
            };

            const url = `${getApiBaseUrl()}/api/debug/frontend-logs`;
            
            if (synchronous) {
                // Use sendBeacon for page unload (fire-and-forget)
                const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
                navigator.sendBeacon(url, blob);
            } else {
                // Regular fetch request
                const response = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(payload)
                });
                
                if (response.ok) {
                    console.log(`📁 Frontend logs sent to backend (${logsToSend.length} entries)`);
                } else {
                    // If backend is down, fall back to local storage
                    this.fallbackToLocalStorage(logsToSend);
                }
            }
            
        } catch (error) {
            // If backend is down, store in localStorage as backup
            this.fallbackToLocalStorage(this.logQueue);
            console.warn('Backend logging failed, using localStorage backup:', error.message);
        } finally {
            this.isUploading = false;
        }
    }
    
    fallbackToLocalStorage(logs) {
        try {
            const existingLogs = JSON.parse(localStorage.getItem('izishop_debug_logs') || '[]');
            existingLogs.push(...logs);
            
            // Keep only last 500 logs to prevent localStorage overflow
            const trimmedLogs = existingLogs.slice(-500);
            localStorage.setItem('izishop_debug_logs', JSON.stringify(trimmedLogs));
            
            console.log('📦 Logs saved to localStorage as backup');
        } catch (e) {
            console.error('Failed to save logs to localStorage:', e);
        }
    }
    
    // Manual commands
    saveNow() {
        this.addLog('SYSTEM', 'Manual save requested');
        this.sendLogsToBackend(true);
    }
    
    getStatus() {
        const status = {
            sessionId: this.sessionId,
            totalLogs: this.logs.length,
            queuedLogs: this.logQueue.length,
            errors: this.logs.filter(log => ['ERROR', 'GLOBAL_ERROR'].includes(log.level)).length,
            warnings: this.logs.filter(log => log.level === 'WARN').length,
            lastLog: this.logs[this.logs.length - 1]?.raw || 'No logs yet'
        };
        
        console.table(status);
        return status;
    }
    
    clearLocalBackup() {
        localStorage.removeItem('izishop_debug_logs');
        console.log('🧹 Cleared localStorage backup logs');
    }
}

// Auto-start the logger - ALWAYS active to capture everything
if (typeof window !== 'undefined') {
    window.projectConsoleLogger = new ProjectConsoleLogger();
    
    // Add global commands
    window.saveLogsNow = () => window.projectConsoleLogger.saveNow();
    window.getLogStatus = () => window.projectConsoleLogger.getStatus();
    window.clearLogBackup = () => window.projectConsoleLogger.clearLocalBackup();
    
    console.log('🔧 Commands: saveLogsNow(), getLogStatus(), clearLogBackup()');
}

export default typeof window !== 'undefined' ? window.projectConsoleLogger : null;