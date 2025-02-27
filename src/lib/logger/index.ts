import winston from 'winston';
import { LogLevel, LogConfig, defaultLogConfig, LogColors, transports } from './config';

type LogArgs = (string | number | boolean | object)[];

class Logger {
    private static instance: Logger;
    private config: LogConfig;
    private winstonLogger: winston.Logger;

    private constructor() {
        this.config = defaultLogConfig;
        
        try {
            // Winston 로거 초기화
            this.winstonLogger = winston.createLogger({
                levels: {
                    error: 0,
                    warn: 1,
                    info: 2,
                    http: 3,
                    debug: 4,
                },
                format: winston.format.combine(
                    winston.format.timestamp(),
                    winston.format.json()
                ),
                transports: [
                    transports.console
                ]
            });
            
            // 프로덕션 환경이 아닌 경우에만 파일 로깅 활성화
            if (process.env.NODE_ENV !== 'test') {
                try {
                    this.winstonLogger.add(transports.dailyRotateFile);
                    this.winstonLogger.add(transports.errorFile);
                } catch (err) {
                    console.error('로그 파일 트랜스포트 추가 중 오류:', err);
                    // 파일 로깅에 실패해도 콘솔 로깅은 계속 진행
                }
            }
        } catch (err) {
            console.error('Winston 로거 초기화 중 오류:', err);
            // Winston 로거 초기화 실패 시 기본 콘솔만 사용
            this.winstonLogger = winston.createLogger({
                transports: [new winston.transports.Console()]
            });
        }
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

    private formatMessage(level: LogLevel, message: string, ...args: LogArgs): string {
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

    public debug(message: string, ...args: LogArgs): void {
        try {
            this.winstonLogger.debug(message, ...args);
            if (process.env.NODE_ENV !== 'production') {
                console.debug(this.formatMessage('debug', message, ...args));
            }
        } catch {
            console.debug(this.formatMessage('debug', message, ...args));
        }
    }

    public info(message: string, ...args: LogArgs): void {
        try {
            this.winstonLogger.info(message, ...args);
            console.info(this.formatMessage('info', message, ...args));
        } catch {
            console.info(this.formatMessage('info', message, ...args));
        }
    }

    public warn(message: string, ...args: LogArgs): void {
        try {
            this.winstonLogger.warn(message, ...args);
            console.warn(this.formatMessage('warn', message, ...args));
        } catch {
            console.warn(this.formatMessage('warn', message, ...args));
        }
    }

    public error(message: string, ...args: LogArgs): void {
        try {
            this.winstonLogger.error(message, ...args);
            console.error(this.formatMessage('error', message, ...args));
        } catch {
            console.error(this.formatMessage('error', message, ...args));
        }
    }

    public setConfig(config: Partial<LogConfig>): void {
        this.config = { ...this.config, ...config };
    }
}

export const logger = Logger.getInstance(); 