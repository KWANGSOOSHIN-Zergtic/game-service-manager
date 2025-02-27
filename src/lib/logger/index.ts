import winston from 'winston';
import { LogLevel, LogConfig, defaultLogConfig, LogColors, transports } from './config';

// 환경 확인
const isServer = typeof window === 'undefined';
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
            
            // 서버 사이드에서만 파일 로깅 시도
            if (isServer && process.env.NODE_ENV !== 'test') {
                try {
                    if (transports.dailyRotateFile) {
                        this.winstonLogger.add(transports.dailyRotateFile);
                    }
                    if (transports.errorFile) {
                        this.winstonLogger.add(transports.errorFile);
                    }
                } catch (err) {
                    console.error('로그 파일 트랜스포트 추가 중 오류:', err);
                    // 파일 로깅에 실패해도 콘솔 로깅은 계속 진행
                }
            } else if (!isServer) {
                // 클라이언트 측 로그 레벨 조정
                console.log('[Logger] 클라이언트 측 로거가 초기화되었습니다.');
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

        // 프리픽스 추가 - 클라이언트/서버 구분
        const envPrefix = isServer ? '[Server]' : '[Client]';
        parts.push(envPrefix);

        // 사용자 정의 프리픽스 추가
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

    // 클라이언트 측에서는 console만 사용하도록 안전하게 구현
    private safeLog(winstonLevel: string, consoleMethod: 'debug' | 'info' | 'warn' | 'error', 
                  level: LogLevel, message: string, ...args: LogArgs): void {
        // 서버 사이드에서는 winston 로깅 시도
        if (isServer) {
            try {
                // @ts-expect-error - winston 타입은 동적 문자열 키를 지원하지 않음
                this.winstonLogger[winstonLevel](message, ...args);
            } catch (error) {
                console.error('Winston 로깅 실패:', error);
            }
        }
        
        // 콘솔 로깅은 항상 실행
        try {
            console[consoleMethod](this.formatMessage(level, message, ...args));
        } catch {
            // 최후의 수단으로 기본 콘솔 로깅
            console[consoleMethod](`[${level.toUpperCase()}] ${message}`);
        }
    }

    public debug(message: string, ...args: LogArgs): void {
        this.safeLog('debug', 'debug', 'debug', message, ...args);
    }

    public info(message: string, ...args: LogArgs): void {
        this.safeLog('info', 'info', 'info', message, ...args);
    }

    public warn(message: string, ...args: LogArgs): void {
        this.safeLog('warn', 'warn', 'warn', message, ...args);
    }

    public error(message: string, ...args: LogArgs): void {
        this.safeLog('error', 'error', 'error', message, ...args);
    }

    public setConfig(config: Partial<LogConfig>): void {
        this.config = { ...this.config, ...config };
    }
}

export const logger = Logger.getInstance(); 