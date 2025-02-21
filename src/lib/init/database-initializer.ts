import { InitializerFunction } from './types';
import { DBConnectionManager } from '@/lib/db/db-connection-manager';
import { logger } from '@/lib/logger';

// 서버 시작 시 자동으로 실행되는 초기화 함수
console.log('\n=== 서버 시작: DB 초기화 프로세스 시작 ===');
console.log('시작 시간:', new Date().toLocaleString(), '\n');

export const databaseInitializer: InitializerFunction = {
    name: 'Database Initialization',
    priority: 1,
    initialize: async () => {
        try {
            // DB 연결 매니저 인스턴스 가져오기
            const dbManager = DBConnectionManager.getInstance();
            
            // DB 초기화 수행
            const initialized = await dbManager.initialize();
            
            if (!initialized) {
                const errorMsg = 'Database initialization failed';
                logger.error(`[Server Startup] ${errorMsg}`);
                console.error('\n=== 서버 시작: DB 초기화 실패 ===');
                console.error('실패 시간:', new Date().toLocaleString());
                console.error('원인: DB 초기화 프로세스 실패');
                console.error('===============================\n');
                
                return {
                    success: false,
                    message: errorMsg
                };
            }
            
            return {
                success: true,
                message: 'Database initialization completed successfully'
            };
        } catch (error) {
            const errorMsg = error instanceof Error ? error.message : 'Unknown database initialization error';
            logger.error('[Server Startup] Database initialization error:', error);
            console.error('\n=== 서버 시작: DB 초기화 중 오류 발생 ===');
            console.error('오류 시간:', new Date().toLocaleString());
            console.error('오류 내용:', errorMsg);
            console.error('====================================\n');
            
            return {
                success: false,
                message: errorMsg,
                error: error instanceof Error ? error : new Error(errorMsg)
            };
        }
    }
};

// DB 연결 관련 헬퍼 함수들
export async function getConnection(dbName: string) {
    return DBConnectionManager.getInstance().getPool(dbName);
}

export async function closeAllConnections() {
    await DBConnectionManager.getInstance().closeAllPools();
} 