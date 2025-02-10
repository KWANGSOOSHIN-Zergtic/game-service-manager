import { NextResponse } from 'next/server';
import { saveDBCollection } from './db-infomation';
import { DB_COLLECTION } from './db-collection';

export async function GET() {
    try {
        console.log('\n========== DB 정보 조회 시작 ==========');
        console.log('환경 변수 확인:', {
            DEV_DB_HOST: process.env.DEV_DB_HOST,
            DB_PORT: process.env.DB_PORT,
            DB_USERNAME: process.env.DB_USERNAME,
            DB_NAME: process.env.DB_NAME,
            hasPassword: !!process.env.DB_PASSWORD
        });

        console.log('1. 현재 DB Collection 상태:', {
            keys: Object.keys(DB_COLLECTION),
            collection: DB_COLLECTION
        });

        console.log('2. DB 정보 조회 시작');
        const result = await saveDBCollection();
        console.log('3. DB 정보 조회 결과:', result);

        if (result.success) {
            console.log('4. DB Collection 업데이트 후 상태:', {
                count: Object.keys(DB_COLLECTION).length,
                names: Object.keys(DB_COLLECTION),
                collection: DB_COLLECTION
            });
        } else {
            console.error('4. DB Collection 업데이트 실패:', {
                error: result.error,
                message: result.message
            });
        }

        console.log('========== DB 정보 조회 완료 ==========\n');
        return NextResponse.json(result);
    } catch (error) {
        console.error('DB 정보 조회 중 예외 발생:', error);
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.'
        }, { status: 500 });
    }
} 