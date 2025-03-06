/**
 * 환경 변수 관리 유틸리티
 * 
 * 이 모듈은 애플리케이션에서 사용하는 환경 변수를 관리하고 검증하는 기능을 제공합니다.
 * Next.js는 기본적으로 .env, .env.local, .env.development, .env.production 파일을 자동으로 로드하지만,
 * 이 모듈을 통해 추가적인 검증과 기본값 설정을 할 수 있습니다.
 */

import { logger } from './logger';

/**
 * 환경 변수 로드 및 검증
 * 
 * 애플리케이션 시작 시 필요한 환경 변수가 올바르게 설정되어 있는지 확인합니다.
 * 필수 환경 변수가 없는 경우 경고 로그를 출력합니다.
 */
export function validateEnv(): boolean {
    logger.info('[ENV] 환경 변수 검증 시작');
    
    const requiredEnvVars = [
        'DEV_DB_HOST',
        'DB_TYPE',
        'DB_PORT',
        'DB_USERNAME',
        'DB_PASSWORD',
        'DB_NAME'
    ];
    
    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
        logger.warn(`[ENV] 다음 환경 변수가 설정되지 않았습니다: ${missingVars.join(', ')}`);
        return false;
    }
    
    logger.info('[ENV] 모든 필수 환경 변수가 설정되었습니다');
    return true;
}

/**
 * 데이터베이스 환경 변수 가져오기
 * 
 * 데이터베이스 연결에 필요한 환경 변수를 객체로 반환합니다.
 * 환경 변수가 설정되지 않은 경우 기본값을 사용합니다.
 */
export function getDBEnv() {
    return {
        host: process.env.DEV_DB_HOST || 'localhost',
        type: process.env.DB_TYPE || 'postgres',
        port: parseInt(process.env.DB_PORT || '5432'),
        username: process.env.DB_USERNAME || 'postgres',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'football_service'
    };
}

/**
 * 환경 변수 로드 상태 로깅
 * 
 * 현재 설정된 환경 변수의 상태를 로그로 출력합니다.
 * 민감한 정보(비밀번호 등)는 마스킹 처리됩니다.
 */
export function logEnvStatus() {
    const dbEnv = getDBEnv();
    
    logger.info('[ENV] 현재 환경 변수 상태:', {
        NODE_ENV: process.env.NODE_ENV || 'development',
        DB_HOST: dbEnv.host,
        DB_TYPE: dbEnv.type,
        DB_PORT: dbEnv.port,
        DB_USERNAME: dbEnv.username,
        DB_PASSWORD: dbEnv.password ? '******' : '미설정',
        DB_NAME: dbEnv.database
    });
}

// 애플리케이션 시작 시 환경 변수 상태 로깅
logEnvStatus(); 