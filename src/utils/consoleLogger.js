// Console Logger - Captures everything from Chrome DevTools Console
// Saves to project files every 10 seconds automatically

class ConsoleLogger {
    constructor() {
        this.logs = [];
        this.sessionId = this.generateSessionId();
        this.isActive = false;
        
        // Always run - we want to capture all console activity
        this.init();
    }
    
    init() {
        console.log('📝 Console Logger Started - All console output will be saved to files');
        this.isActive = true;
        
        this.logSessionStart();
        this.interceptAllConsoleMethods();
        this.setupAutoSave();
        this.setupShutdownHandlers();
        this.cleanupOldLogs();
        
        // Force immediate save to capture startup logs
        setTimeout(() => {
            this.saveToFile(true);
        }, 2000);
        
        console.log('✅ Console logging active - Files will be downloaded every 10 seconds!');
        console.log('🚨 CAPTURING EVERYTHING - Even single errors will be saved!');
    }
    
    generateSessionId() {
        const now = new Date();
        const date = now.toISOString().split('T')[0];
        const time = now.toTimeString().split(' ')[0].replace(/:/g, '-');
        return `${date}_${time}_${Math.random().toString(36).substr(2, 6)}`;
    }
    
    logSessionStart() {
        this.addLog('SYSTEM', '='.repeat(80));
        this.addLog('SYSTEM', `NEW SESSION STARTED: ${this.sessionId}`);
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
            group: console.group,
            groupEnd: console.groupEnd,
            dir: console.dir,
            assert: console.assert,
            count: console.count,
            time: console.time,
            timeEnd: console.timeEnd
        };
        
        // Intercept console.log
        console.log = (...args) => {
            this.addLog('LOG', this.formatArgs(args));
            originalMethods.log.apply(console, args);
        };
        
        // Intercept console.error
        console.error = (...args) => {
            this.addLog('ERROR', this.formatArgs(args));
            originalMethods.error.apply(console, args);
        };
        
        // Intercept console.warn
        console.warn = (...args) => {
            this.addLog('WARN', this.formatArgs(args));
            originalMethods.warn.apply(console, args);
        };
        
        // Intercept console.info
        console.info = (...args) => {
            this.addLog('INFO', this.formatArgs(args));
            originalMethods.info.apply(console, args);
        };
        
        // Intercept console.debug
        console.debug = (...args) => {
            this.addLog('DEBUG', this.formatArgs(args));
            originalMethods.debug.apply(console, args);
        };
        
        // Intercept console.table
        console.table = (...args) => {
            this.addLog('TABLE', this.formatArgs(args));
            originalMethods.table.apply(console, args);
        };
        
        // Intercept console.dir
        console.dir = (...args) => {
            this.addLog('DIR', this.formatArgs(args));
            originalMethods.dir.apply(console, args);
        };
        
        // Intercept console.assert
        console.assert = (condition, ...args) => {
            if (!condition) {
                this.addLog('ASSERT', this.formatArgs(args));
            }
            originalMethods.assert.apply(console, [condition, ...args]);
        };
        
        // Intercept console.trace
        console.trace = (...args) => {
            this.addLog('TRACE', this.formatArgs(args));
            originalMethods.trace.apply(console, args);
        };
        
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
            timestamp,
            timeStr,
            level,
            page,
            message,
            raw: `[${timeStr}] ${level.padEnd(6)} | ${page.padEnd(15)} | ${message}`
        };
        
        this.logs.push(logEntry);
        
        // Keep only last 1000 logs in memory to prevent memory issues
        if (this.logs.length > 1000) {
            this.logs = this.logs.slice(-800); // Keep last 800
        }
    }
    
    setupAutoSave() {
        // Save every 10 seconds - ALWAYS capture everything, even if just 1 log entry
        setInterval(() => {
            // Force save even with just 1 entry - we want to capture everything!
            this.saveToFile();
        }, 10000);
        
        // Also save when navigating between pages
        let lastPath = window.location.pathname;
        setInterval(() => {
            if (window.location.pathname !== lastPath) {
                this.addLog('NAVIGATION', `Changed from ${lastPath} to ${window.location.pathname}`);
                lastPath = window.location.pathname;
                this.saveToFile();
            }
        }, 1000);
    }
    
    setupShutdownHandlers() {
        // Save immediately before page unload
        window.addEventListener('beforeunload', () => {
            this.addLog('SYSTEM', 'SESSION ENDING - Page unload detected');
            this.saveToFile(true); // Force immediate save
        });
        
        // Save on visibility change (tab switching)
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.addLog('SYSTEM', 'Tab hidden - saving logs');
                this.saveToFile();
            }
        });
    }
    
    saveToFile(immediate = false) {
        if (!this.logs.length) return;
        
        try {
            const today = new Date().toISOString().split('T')[0];
            const timeNow = new Date().toTimeString().split(' ')[0].replace(/:/g, '-');
            const filename = `console-logs-${today}-${timeNow}.log`;
            
            // Prepare log content
            const logContent = this.logs.map(log => log.raw).join('\n') + '\n';
            
            // Create blob and download
            const blob = new Blob([logContent], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            
            // Create invisible download link
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            a.style.display = 'none';
            
            // ALWAYS auto-download every 10 seconds - capture everything!
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            
            console.log(`📁 Logs saved: ${filename} (${this.logs.length} entries)`);
            
            // Clear logs after saving to prevent duplicates
            this.logs = [];
            
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Failed to save logs:', error);
        }
    }
    
    cleanupOldLogs() {
        // This runs in browser, so we can't actually delete files
        // But we can log a reminder
        this.addLog('SYSTEM', 'Note: Manually cleanup log files older than 7 days if needed');
    }
    
    // Manual commands
    saveNow() {
        this.addLog('SYSTEM', 'Manual save requested');
        this.saveToFile(true);
    }
    
    getStatus() {
        const status = {
            sessionId: this.sessionId,
            totalLogs: this.logs.length,
            errors: this.logs.filter(log => ['ERROR', 'GLOBAL_ERROR'].includes(log.level)).length,
            warnings: this.logs.filter(log => log.level === 'WARN').length,
            lastLog: this.logs[this.logs.length - 1]?.raw || 'No logs yet'
        };
        
        console.table(status);
        return status;
    }
}

// Auto-start the logger - ALWAYS active to capture everything
if (typeof window !== 'undefined') {
    window.consoleLogger = new ConsoleLogger();
    
    // Add global commands
    window.saveLogsNow = () => window.consoleLogger.saveNow();
    window.getLogStatus = () => window.consoleLogger.getStatus();
    
    console.log('🔧 Commands available: saveLogsNow() and getLogStatus()');
}

export default typeof window !== 'undefined' ? window.consoleLogger : null;