import { NextResponse } from 'next/server';
import { DB_QUERIES } from '../db-query/queries';
import { getConnection } from '@/lib/init/database-initializer';
import { logger } from '@/lib/logger';

const getDBList = async () => {
    try {
        // football_service DB에서 연결 풀 가져오기
        const pool = await getConnection('football_service');
        logger.info('[DB List] football_service 연결 풀에서 연결 획득 성공');
        
        // DB 목록 조회
        logger.info('[DB List] DB 목록 조회 시작');
        const result = await pool.query(DB_QUERIES.SELECT_DB_LIST.query);
        logger.info('[DB List] DB 목록 조회 완료');

        return { 
            success: true, 
            tables: result.rows 
        };
    } catch (error) {
        logger.error('[DB List] DB 목록 조회 실패:', error);
        let errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
        
        // 에러 메시지 상세화
        if (error instanceof Error) {
            if (error.message.includes('connect ETIMEDOUT')) {
                errorMessage = 'DB 연결 시간 초과. 네트워크 연결을 확인해주세요.';
            } else if (error.message.includes('password authentication failed')) {
                errorMessage = 'DB 인증 실패. 사용자 이름과 비밀번호를 확인해주세요.';
            }
        }
        
        return {
            success: false,
            error: errorMessage
        };
    }
};

export async function GET() {
    const result = await getDBList();
    return NextResponse.json(result);
} 