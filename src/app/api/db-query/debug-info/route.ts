import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // 요청 URL에서 쿼리 파라미터 가져오기
    const searchParams = request.nextUrl.searchParams;
    const dbName = searchParams.get('dbName') || '';
    const query = searchParams.get('query') || '';

    // 헤더 정보 수집
    const headers: Record<string, string> = {};
    request.headers.forEach((value, key) => {
      headers[key] = value;
    });

    // 디버그 정보를 담은 응답 반환
    return NextResponse.json({
      success: true,
      message: '디버그 정보가 성공적으로 생성되었습니다.',
      debugInfo: {
        requestUrl: request.url,
        requestMethod: request.method,
        requestHeaders: headers,
        timestamp: new Date().toISOString(),
        params: {
          dbName,
          query
        }
      }
    });
  } catch (error) {
    console.error('디버그 정보 생성 중 오류 발생:', error);
    return NextResponse.json(
      {
        success: false,
        error: '디버그 정보 생성 중 오류가 발생했습니다.',
      },
      { status: 500 }
    );
  }
} 