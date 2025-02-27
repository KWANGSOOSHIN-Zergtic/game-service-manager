import winston from 'winston';
import 'winston-daily-rotate-file';
import path from 'path';
import fs from 'fs';

// 환경 확인
const isServer = typeof window === 'undefined';
const logDir = 'logs';

// 서버 사이드에서만 로그 디렉토리 생성 시도
if (isServer) {
  try {
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
  } catch (error) {
    console.error('로그 디렉토리 생성 중 오류:', error);
  }
}

// 현재 날짜 포맷 생성 (YYYY-MM-DD)
const currentDate = new Date().toISOString().split('T')[0];

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

// DailyRotateFile 트랜스포트 타입 정의
interface DailyRotateFileTransportOptions {
  filename: string;
  datePattern: string;
  zippedArchive?: boolean;
  maxSize?: string;
  maxFiles?: string;
  level?: string;
  format?: winston.Logform.Format;
  createSymlink?: boolean;
  symlinkName?: string;
  utc?: boolean;
  frequency?: string;
  dirname?: string;
  date?: string;
}

// 안전한 트랜스포트 생성 함수 - 서버 사이드에서만 실제 트랜스포트 생성
const createSafeTransport = (config: DailyRotateFileTransportOptions) => {
  if (!isServer) {
    return null;
  }
  
  try {
    return new winston.transports.DailyRotateFile(config);
  } catch (error) {
    console.error('로그 트랜스포트 생성 오류:', error);
    // 오류 발생 시 콘솔만 사용하도록 null 반환
    return null;
  }
};

// 콘솔 트랜스포트는 브라우저/서버 모두에서 동작
const consoleTransport = new winston.transports.Console({
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.colorize(),
    winston.format.printf(
      (info) => `${info.timestamp} ${info.level}: ${info.message}`
    )
  ),
});

// 파일 관련 트랜스포트는 서버 사이드에서만 생성
const dailyRotateFileTransport = isServer ? createSafeTransport({
  filename: path.join(logDir, '%DATE%-combined.log'),
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '14d',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  createSymlink: true,
  symlinkName: 'current-combined.log',
  utc: true,
  frequency: '24h',
  dirname: logDir,
  date: currentDate  
}) : null;

const errorFileTransport = isServer ? createSafeTransport({
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
  createSymlink: true,
  symlinkName: 'current-error.log',
  utc: true,
  frequency: '24h',
  dirname: logDir,
  date: currentDate
}) : null;

export const transports = {
  console: consoleTransport,
  dailyRotateFile: dailyRotateFileTransport,
  errorFile: errorFileTransport,
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