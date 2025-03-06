import { NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { initializeServer } from '@/lib/init/server-initializer';

/**
 * 서버 초기화 API 엔드포인트
 * 
 * 서버 시작 시 필요한 초기화 작업을 수행합니다.
 * 데이터베이스 연결, 캐시 초기화 등의 작업이 포함됩니다.
 */
export async function GET() {
    try {
        // 서버 초기화 실행
        const result = await initializeServer();
        
        if (!result.success) {
            return NextResponse.json({
                success: false,
                message: result.message,
                timestamp: new Date().toISOString()
            }, { status: 500 });
        }
        
        return NextResponse.json({
            success: true,
            message: 'Server initialized successfully',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        logger.error('Error during server initialization:', error instanceof Error ? error.message : String(error));
        throw error;
    }
} 