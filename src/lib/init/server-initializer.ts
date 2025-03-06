import { InitializerFunction } from './types';
import { databaseInitializer } from './database-initializer';
import { logger } from '@/lib/logger';
import { validateEnv, logEnvStatus } from '@/lib/env';

// 서버 초기화 함수 목록
const initializers: InitializerFunction[] = [
    databaseInitializer,
    // 추가 초기화 함수들...
];

// 서버 초기화 실행
export async function initializeServer() {
    console.log('\nStarting server initialization...');
    logger.info('Starting server initialization...');
    
    // 환경 변수 검증
    const isEnvValid = validateEnv();
    if (!isEnvValid) {
        logger.error('[Server] 환경 변수가 올바르게 설정되지 않았습니다. 서버 초기화를 중단합니다.');
        console.error('\n=== 서버 시작: 환경 변수 오류 ===');
        console.error('오류 시간:', new Date().toLocaleString());
        console.error('원인: 필수 환경 변수가 설정되지 않았습니다.');
        console.error('===============================\n');
        return {
            success: false,
            message: '환경 변수 설정 오류'
        };
    }
    
    // 환경 변수 상태 로깅
    logEnvStatus();
    
    // 우선순위에 따라 초기화 함수 정렬
    const sortedInitializers = [...initializers].sort((a, b) => a.priority - b.priority);
    
    // 초기화 함수 순차 실행
    for (const initializer of sortedInitializers) {
        try {
            logger.info(`[Server] Running initializer: ${initializer.name}`);
            const result = await initializer.initialize();
            
            if (!result.success) {
                logger.error(`[Server] Initializer ${initializer.name} failed: ${result.message}`);
                return {
                    success: false,
                    message: `Initialization failed at ${initializer.name}: ${result.message}`,
                    error: result.error
                };
            }
            
            logger.info(`[Server] Initializer ${initializer.name} completed successfully`);
        } catch (error) {
            logger.error(`[Server] Unexpected error in initializer ${initializer.name}:`, error instanceof Error ? error.message : String(error));
            return {
                success: false,
                message: `Unexpected error in initializer ${initializer.name}`,
                error: error instanceof Error ? error : new Error(String(error))
            };
        }
    }
    
    return {
        success: true,
        message: 'Server initialization completed successfully'
    };
} 