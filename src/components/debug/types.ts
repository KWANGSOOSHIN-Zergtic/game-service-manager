// API 응답 인터페이스 정의
export interface ApiResponse {
  success: boolean;
  currencies?: Record<string, unknown>[];
  data?: Record<string, unknown>[];
  error?: string;
  message?: string;
  url?: string;
  timestamp?: string;
  responseTime?: string;
  [key: string]: unknown;
}

// API 요청 정보를 저장하는 인터페이스
export interface ApiRequestInfo {
  url: string;
  params: Record<string, unknown>;
  headers: Record<string, string>;
  data?: Record<string, unknown>;
  response?: unknown;
  method: string;
  timestamp: Date;
}

// API 디버그 정보 인터페이스
export interface ApiDebugInfo {
  requestUrl: string;
  requestMethod: string;
  requestHeaders: Record<string, string>;
  requestBody?: string;
  timestamp: string;
}

// 복사 섹션 타입
export type CopiedSection = 'all' | 'response' | 'request' | 'requestHeaders' | 'requestBody' | 'headers' | 'body' | 'params' | 'url' | null;

// 상태 표시 타입
export type StatusType = 'requestInfo' | 'apiDebugInfo' | 'debugInfo';

// API 응답 상태 타입
export type ApiResponseStatus = 'success' | 'error' | 'failure' | null; 