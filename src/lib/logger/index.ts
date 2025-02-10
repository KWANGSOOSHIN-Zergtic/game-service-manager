import { LogLevel, LogConfig, defaultLogConfig, LogColors } from './config';

class Logger {
    private static instance: Logger;
    private config: LogConfig;

    private constructor() {
        this.config = defaultLogConfig;
    }

    public static getInstance(): Logger {
        if (!Logger.instance) {
            Logger.instance = new Logger();
        }
        return Logger.instance;
    }

    private getTimestamp(): string {
        return new Date().toISOString();
    }

    private formatMessage(level: LogLevel, message: string, ...args: any[]): string {
        const parts: string[] = [];
        
        // 타임스탬프 추가
        if (this.config.timestamp) {
            parts.push(`${LogColors.timestamp}[${this.getTimestamp()}]${LogColors.reset}`);
        }

        // 로그 레벨 추가
        parts.push(`${LogColors[level]}[${level.toUpperCase()}]${LogColors.reset}`);

        // 프리픽스 추가
        if (this.config.prefix) {
            parts.push(this.config.prefix);
        }

        // 메시지와 인자들 추가
        const formattedMessage = args.length > 0 ? 
            `${message} ${args.map(arg => 
                typeof arg === 'object' ? JSON.stringify(arg, null, 2) : arg
            ).join(' ')}` : message;

        parts.push(formattedMessage);

        return parts.join(' ');
    }

    public debug(message: string, ...args: any[]): void {
        if (process.env.NODE_ENV !== 'production') {
            console.debug(this.formatMessage('debug', message, ...args));
        }
    }

    public info(message: string, ...args: any[]): void {
        console.info(this.formatMessage('info', message, ...args));
    }

    public warn(message: string, ...args: any[]): void {
        console.warn(this.formatMessage('warn', message, ...args));
    }

    public error(message: string, ...args: any[]): void {
        console.error(this.formatMessage('error', message, ...args));
    }

    public setConfig(config: Partial<LogConfig>): void {
        this.config = { ...this.config, ...config };
    }
}

export const logger = Logger.getInstance(); 