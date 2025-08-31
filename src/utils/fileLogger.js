// File-based error logging system for Izishop
// Automatically logs all errors to files that can be read later

class FileLogger {
    constructor() {
        this.logs = {
            errors: [],
            warnings: [],
            api: [],
            general: []
        };
        
        this.init();
        
        // Auto-save logs every 10 seconds
        setInterval(() => this.saveLogs(), 10000);
        
        // Save logs when page is about to close
        window.addEventListener('beforeunload', () => this.saveLogs());
    }
    
    init() {
        console.log('📁 File Logger Started - All errors will be saved automatically');
        
        this.interceptConsole();
        this.interceptFetch();
        this.setupGlobalErrorHandlers();
        this.logPageInfo();
    }
    
    interceptConsole() {
        const originalError = console.error;
        const originalWarn = console.warn;
        const originalLog = console.log;
        
        console.error = (...args) => {
            this.log('error', {
                type: 'CONSOLE_ERROR',
                message: args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : String(arg)).join(' '),
                timestamp: new Date().toISOString(),
                page: window.location.pathname,
                stack: new Error().stack
            });
            originalError.apply(console, args);
        };
        
        console.warn = (...args) => {
            this.log('warning', {
                type: 'CONSOLE_WARNING',
                message: args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : String(arg)).join(' '),
                timestamp: new Date().toISOString(),
                page: window.location.pathname
            });
            originalWarn.apply(console, args);
        };
    }
    
    interceptFetch() {
        const originalFetch = window.fetch;
        
        window.fetch = async (...args) => {
            const startTime = performance.now();
            const url = args[0];
            const options = args[1] || {};
            const requestId = Date.now() + Math.random();
            
            // Log request start
            this.log('api', {
                id: requestId,
                type: 'API_REQUEST',
                method: options.method || 'GET',
                url: url,
                timestamp: new Date().toISOString(),
                page: window.location.pathname,
                headers: options.headers || {}
            });
            
            try {
                const response = await originalFetch.apply(window, args);
                const duration = Math.round(performance.now() - startTime);
                
                // Log response
                this.log('api', {
                    id: requestId,
                    type: response.ok ? 'API_SUCCESS' : 'API_FAILED',
                    method: options.method || 'GET',
                    url: url,
                    status: response.status,
                    statusText: response.statusText,
                    duration: `${duration}ms`,
                    timestamp: new Date().toISOString(),
                    page: window.location.pathname,
                    success: response.ok
                });
                
                return response;
            } catch (error) {
                const duration = Math.round(performance.now() - startTime);
                
                // Log error
                this.log('api', {
                    id: requestId,
                    type: 'API_ERROR',
                    method: options.method || 'GET',
                    url: url,
                    error: error.message,
                    duration: `${duration}ms`,
                    timestamp: new Date().toISOString(),
                    page: window.location.pathname,
                    success: false
                });
                
                throw error;
            }
        };
    }
    
    setupGlobalErrorHandlers() {
        // Catch all unhandled errors
        window.addEventListener('error', (event) => {
            this.log('error', {
                type: 'GLOBAL_ERROR',
                message: event.message,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                timestamp: new Date().toISOString(),
                page: window.location.pathname,
                stack: event.error?.stack,
                userAgent: navigator.userAgent
            });
        });
        
        // Catch unhandled promise rejections
        window.addEventListener('unhandledrejection', (event) => {
            this.log('error', {
                type: 'UNHANDLED_PROMISE',
                message: event.reason?.message || String(event.reason),
                timestamp: new Date().toISOString(),
                page: window.location.pathname,
                stack: event.reason?.stack,
                reason: event.reason
            });
        });
        
        // Log route changes
        const originalPushState = history.pushState;
        const originalReplaceState = history.replaceState;
        
        history.pushState = function(...args) {
            setTimeout(() => {
                window.fileLogger?.logPageInfo();
            }, 100);
            return originalPushState.apply(this, args);
        };
        
        history.replaceState = function(...args) {
            setTimeout(() => {
                window.fileLogger?.logPageInfo();
            }, 100);
            return originalReplaceState.apply(this, args);
        };
        
        // Also listen for popstate (back/forward buttons)
        window.addEventListener('popstate', () => {
            setTimeout(() => {
                this.logPageInfo();
            }, 100);
        });
    }
    
    logPageInfo() {
        this.log('general', {
            type: 'PAGE_VISIT',
            url: window.location.href,
            pathname: window.location.pathname,
            search: window.location.search,
            hash: window.location.hash,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            referrer: document.referrer,
            title: document.title
        });
    }
    
    log(category, data) {
        if (this.logs[category]) {
            this.logs[category].push(data);
            
            // Also log to console with color coding
            const colors = {
                error: 'color: #f44336; background: #ffebee; padding: 2px 6px; border-radius: 3px;',
                warning: 'color: #ff9800; background: #fff3e0; padding: 2px 6px; border-radius: 3px;',
                api: 'color: #2196f3; background: #e3f2fd; padding: 2px 6px; border-radius: 3px;',
                general: 'color: #4caf50; background: #e8f5e8; padding: 2px 6px; border-radius: 3px;'
            };
            
            console.log(`%c${category.toUpperCase()}: ${data.type}`, colors[category], data.message || data.url);
        }
    }
    
    async saveLogs() {
        const timestamp = new Date().toISOString().split('T')[0];
        const session = Date.now();
        
        // Create summary
        const summary = {
            sessionStart: this.sessionStart || new Date().toISOString(),
            sessionId: this.sessionId || session,
            totalErrors: this.logs.errors.length,
            totalWarnings: this.logs.warnings.length,
            totalApiCalls: this.logs.api.length,
            failedApiCalls: this.logs.api.filter(call => !call.success).length,
            pagesVisited: [...new Set(this.logs.general.filter(log => log.type === 'PAGE_VISIT').map(log => log.pathname))],
            timestamp: new Date().toISOString(),
            browser: navigator.userAgent
        };
        
        // Combine all logs
        const allLogs = {
            summary: summary,
            errors: this.logs.errors,
            warnings: this.logs.warnings,
            apiCalls: this.logs.api,
            pageVisits: this.logs.general,
            metadata: {
                exportTime: new Date().toISOString(),
                totalLogEntries: Object.values(this.logs).reduce((sum, arr) => sum + arr.length, 0)
            }
        };
        
        // Save to downloadable file
        try {
            const blob = new Blob([JSON.stringify(allLogs, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            // Auto-download if there are errors
            if (this.logs.errors.length > 0 || this.logs.api.filter(c => !c.success).length > 0) {
                const a = document.createElement('a');
                a.href = url;
                a.download = `izishop-logs-${timestamp}-${session}.json`;
                a.style.display = 'none';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                
                console.log(`📥 Error logs auto-saved: izishop-logs-${timestamp}-${session}.json`);
            }
            
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Failed to save logs:', error);
        }
    }
    
    // Manual save function
    saveNow() {
        this.saveLogs();
    }
    
    // Get current status
    getStatus() {
        const status = {
            errors: this.logs.errors.length,
            warnings: this.logs.warnings.length,
            apiCalls: this.logs.api.length,
            failedApis: this.logs.api.filter(call => !call.success).length,
            lastError: this.logs.errors[this.logs.errors.length - 1],
            lastFailedApi: this.logs.api.filter(call => !call.success).slice(-1)[0]
        };
        
        console.table(status);
        return status;
    }
}

// Auto-start only in development
if (process.env.NODE_ENV === 'development') {
    window.fileLogger = new FileLogger();
    window.fileLogger.sessionStart = new Date().toISOString();
    window.fileLogger.sessionId = Date.now();
    
    // Add global commands
    window.getLogStatus = () => window.fileLogger.getStatus();
    window.saveLogsNow = () => window.fileLogger.saveNow();
    
    console.log('🚀 File Logger Active! Use getLogStatus() or saveLogsNow() in console');
}

export default window.fileLogger;