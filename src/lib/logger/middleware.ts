import { NextRequest, NextResponse } from 'next/server';
import Logger from './index';

export async function loggerMiddleware(
  request: NextRequest,
  next: () => Promise<NextResponse>
) {
  const startTime = Date.now();
  const requestId = crypto.randomUUID();
  
  // 요청 로깅
  Logger.http(`Incoming ${request.method} request to ${request.url}`, {
    requestId,
    headers: Object.fromEntries(request.headers),
    query: Object.fromEntries(new URL(request.url).searchParams),
  });

  try {
    // 요청 처리
    const response = await next();
    
    // 응답 시간 계산
    const duration = Date.now() - startTime;
    
    // 성공 응답 로깅
    Logger.info(`Request completed`, {
      requestId,
      status: response.status,
      duration: `${duration}ms`,
    });

    return response;
  } catch (error) {
    // 응답 시간 계산
    const duration = Date.now() - startTime;
    
    // 에러 로깅
    Logger.error(`Request failed`, {
      requestId,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      duration: `${duration}ms`,
    });

    throw error;
  }
} 