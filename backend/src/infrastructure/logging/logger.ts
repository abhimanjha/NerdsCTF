export class Logger {
    static info(message: string, context?: string) {
        console.log(`[INFO] [${new Date().toISOString()}]${context ? ` [${context}]` : ''}: ${message}`);
    }

    static warn(message: string, context?: string) {
        console.warn(`[WARN] [${new Date().toISOString()}]${context ? ` [${context}]` : ''}: ${message}`);
    }

    static error(message: string, trace?: string, context?: string) {
        console.error(`[ERROR] [${new Date().toISOString()}]${context ? ` [${context}]` : ''}: ${message}`);
        if (trace) console.error(trace);
    }
}
