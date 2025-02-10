import { NextResponse } from 'next/server';
import { saveDBCollection } from './db-information';
import { DB_COLLECTION } from './db-collection';

export async function GET() {
    try {
        console.log('\n========== DB 정보 조회 시작 ==========');
        
        // 환경 변수 유효성 검사
        if (!process.env.DEV_DB_HOST || !process.env.DB_PORT || !process.env.DB_USERNAME || !process.env.DB_PASSWORD || !process.env.DB_NAME) {
            console.error('필수 환경 변수가 누락되었습니다.');
            return NextResponse.json({
                success: false,
                error: '데이터베이스 연결 정보가 올바르게 설정되지 않았습니다.'
            }, { status: 500 });
        }

        console.log('환경 변수 확인:', {
            DEV_DB_HOST: process.env.DEV_DB_HOST,
            DB_PORT: process.env.DB_PORT,
            DB_USERNAME: process.env.DB_USERNAME,
            DB_NAME: process.env.DB_NAME,
            hasPassword: !!process.env.DB_PASSWORD
        });

        console.log('1. 현재 DB Collection 상태:', {
            keys: Object.keys(DB_COLLECTION),
            size: Object.keys(DB_COLLECTION).length
        });

        console.log('2. DB 정보 조회 시작');
        const result = await saveDBCollection();
        console.log('3. DB 정보 조회 결과:', {
            success: result.success,
            message: result.message,
            error: result.error,
            tablesCount: result.tables?.length
        });

        if (!result.success) {
            console.error('4. DB Collection 업데이트 실패:', {
                error: result.error,
                message: result.message
            });
            return NextResponse.json({
                success: false,
                error: result.error || '데이터베이스 정보 조회에 실패했습니다.'
            }, { status: 500 });
        }

        console.log('4. DB Collection 업데이트 후 상태:', {
            count: Object.keys(DB_COLLECTION).length,
            names: Object.keys(DB_COLLECTION)
        });

        console.log('========== DB 정보 조회 완료 ==========\n');
        
        // 성공 응답에는 tables 배열이 반드시 포함되어야 함
        return NextResponse.json({
            success: true,
            message: 'DB 정보가 성공적으로 조회되었습니다.',
            tables: result.tables || []
        });
    } catch (error) {
        console.error('DB 정보 조회 중 예외 발생:', error);
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.'
        }, { status: 500 });
    }
} 