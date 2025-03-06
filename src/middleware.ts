import { NextResponse } from 'next/server';

export const config = {
    matcher: '/api/:path*'
}

export function middleware() {
    const response = NextResponse.next();
    
    // CORS 헤더 추가
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    return response;
} 