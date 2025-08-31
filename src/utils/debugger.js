// Auto-loading debugger for Izishop
// This loads automatically when the app starts

class IzishopDebugger {
    constructor() {
        this.errors = [];
        this.warnings = [];
        this.apiCalls = [];
        this.isActive = false;
        
        // Only run in development
        if (process.env.NODE_ENV === 'development') {
            this.init();
        }
    }
    
    init() {
        console.log('🔍 Izishop Auto-Debugger Starting...');
        this.isActive = true;
        
        this.interceptConsole();
        this.interceptFetch();
        this.setupGlobalErrorHandlers();
        this.setupWindowCommands();
        
        console.log('✅ Auto-Debugger Active! Use window.debug.* commands');
    }
    
    interceptConsole() {
        const originalError = console.error;
        const originalWarn = console.warn;
        
        console.error = (...args) => {
            this.logError('CONSOLE_ERROR', args.join(' '));
            originalError.apply(console, args);
        };
        
        console.warn = (...args) => {
            this.logWarning('CONSOLE_WARNING', args.join(' '));
            originalWarn.apply(console, args);
        };
    }
    
    interceptFetch() {
        const originalFetch = window.fetch;
        
        window.fetch = async (...args) => {
            const startTime = performance.now();
            const url = args[0];
            const options = args[1] || {};
            
            try {
                const response = await originalFetch.apply(window, args);
                const duration = Math.round(performance.now() - startTime);
                
                this.logApiCall({
                    method: options.method || 'GET',
                    url,
                    status: response.status,
                    success: response.ok,
                    duration
                });
                
                if (!response.ok) {
                    console.log(`🔴 API Failed: ${options.method || 'GET'} ${url} - ${response.status}`);
                }
                
                return response;
            } catch (error) {
                const duration = Math.round(performance.now() - startTime);
                
                this.logApiCall({
                    method: options.method || 'GET',
                    url,
                    error: error.message,
                    success: false,
                    duration
                });
                
                console.log(`💥 API Error: ${error.message}`);
                throw error;
            }
        };
    }
    
    setupGlobalErrorHandlers() {
        window.addEventListener('error', (event) => {
            this.logError('GLOBAL_ERROR', `${event.message} at ${event.filename}:${event.lineno}`);
        });
        
        window.addEventListener('unhandledrejection', (event) => {
            this.logError('UNHANDLED_PROMISE', event.reason?.message || String(event.reason));
        });
    }
    
    setupWindowCommands() {
        window.debug = {
            // Get error summary
            errors: () => {
                console.table(this.errors);
                return this.errors;
            },
            
            // Get API calls
            api: () => {
                console.table(this.apiCalls);
                return this.apiCalls;
            },
            
            // Get failed APIs only
            failed: () => {
                const failed = this.apiCalls.filter(call => !call.success);
                console.table(failed);
                return failed;
            },
            
            // Clear logs
            clear: () => {
                this.errors = [];
                this.warnings = [];
                this.apiCalls = [];
                console.clear();
                console.log('🧹 Debug logs cleared');
            },
            
            // Get summary
            summary: () => {
                const summary = {
                    totalErrors: this.errors.length,
                    totalWarnings: this.warnings.length,
                    totalApiCalls: this.apiCalls.length,
                    failedApiCalls: this.apiCalls.filter(c => !c.success).length
                };
                console.table(summary);
                return summary;
            },
            
            // Export logs
            export: () => {
                const data = {
                    errors: this.errors,
                    warnings: this.warnings,
                    apiCalls: this.apiCalls,
                    timestamp: new Date().toISOString()
                };
                
                const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `izishop-debug-${Date.now()}.json`;
                a.click();
                URL.revokeObjectURL(url);
                
                console.log('📥 Debug logs exported');
            }
        };
    }
    
    logError(type, message) {
        this.errors.push({
            type,
            message,
            timestamp: new Date().toISOString(),
            url: window.location.href
        });
        
        // Show in console immediately
        console.log(`🔴 ${type}: ${message}`);
    }
    
    logWarning(type, message) {
        this.warnings.push({
            type,
            message,
            timestamp: new Date().toISOString()
        });
    }
    
    logApiCall(callData) {
        this.apiCalls.push({
            ...callData,
            timestamp: new Date().toISOString()
        });
    }
}

// Auto-start the debugger
const debugger = new IzishopDebugger();

export default debugger;