import winston from 'winston';
import 'winston-daily-rotate-file';
import path from 'path';
import fs from 'fs';

const logDir = 'logs';

// 로그 디렉토리가 없으면 생성
try {
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }
} catch (error) {
  console.error('로그 디렉토리 생성 중 오류:', error);
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

// 안전한 트랜스포트 생성 함수
const createSafeTransport = (config: DailyRotateFileTransportOptions) => {
  try {
    return new winston.transports.DailyRotateFile(config);
  } catch (error) {
    console.error('로그 트랜스포트 생성 오류:', error);
    // 오류 발생 시 콘솔만 사용하도록 null 반환
    return null;
  }
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
  dailyRotateFile: createSafeTransport({
    filename: path.join(logDir, '%DATE%-combined.log'),
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    ),
    // 현재 날짜로만 로그 파일 생성하도록 설정
    createSymlink: true,
    symlinkName: 'current-combined.log',
    utc: true,
    // 백업 상태 확인
    frequency: '24h',
    // 파일 이름 변경 (현재 날짜 사용)
    dirname: logDir,
    date: currentDate  
  }),
  errorFile: createSafeTransport({
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
    // 현재 날짜로만 로그 파일 생성하도록 설정
    createSymlink: true,
    symlinkName: 'current-error.log',
    utc: true,
    // 백업 상태 확인
    frequency: '24h',
    // 파일 이름 변경 (현재 날짜 사용)
    dirname: logDir,
    date: currentDate
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