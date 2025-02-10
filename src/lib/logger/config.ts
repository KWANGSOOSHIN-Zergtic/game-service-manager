import winston from 'winston';
import 'winston-daily-rotate-file';
import path from 'path';

const logDir = 'logs';

export const loggerConfig = {
  levels: {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4,
  },
  colors: {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    http: 'magenta',
    debug: 'blue',
  },
};

export const transports = {
  console: new winston.transports.Console({
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.colorize(),
      winston.format.printf(
        (info) => `${info.timestamp} ${info.level}: ${info.message}`
      )
    ),
  }),
  dailyRotateFile: new winston.transports.DailyRotateFile({
    filename: path.join(logDir, '%DATE%-combined.log'),
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    ),
  }),
  errorFile: new winston.transports.DailyRotateFile({
    filename: path.join(logDir, '%DATE%-error.log'),
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d',
    level: 'error',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    ),
  }),
};

// 로그 레벨 정의
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

// 로그 설정 인터페이스
export interface LogConfig {
    level: LogLevel;
    timestamp: boolean;
    prefix?: string;
}

// 기본 로그 설정
export const defaultLogConfig: LogConfig = {
    level: 'info',
    timestamp: true,
    prefix: '[Server]'
};

// 로그 색상 설정
export const LogColors = {
    reset: '\x1b[0m',
    debug: '\x1b[36m',    // Cyan
    info: '\x1b[32m',     // Green
    warn: '\x1b[33m',     // Yellow
    error: '\x1b[31m',    // Red
    timestamp: '\x1b[90m' // Gray
}; 