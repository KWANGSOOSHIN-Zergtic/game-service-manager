import { NextResponse } from 'next/server';
import { DB_QUERIES } from './queries';
import { DB_COLLECTION } from '../db-information/db-collection';
import { saveDBCollection } from '../db-information/db-information';
import { getConnection } from '@/lib/init/database-initializer';
import { logger } from '@/lib/logger';

export async function GET(request: Request) {
    console.log('\n========== DB 테이블 목록 조회 시작 ==========');
    const { searchParams } = new URL(request.url);
    const dbName = searchParams.get('dbName');

    if (!dbName) {
        console.error('DB 이름이 제공되지 않음');
        return NextResponse.json({
            success: false,
            error: 'DB 이름이 필요합니다.'
        });
    }

    console.log('1. 요청된 DB 이름:', dbName);

    // DB 정보 조회
    console.log('2. DB 정보 조회 시작');
    const result = await saveDBCollection();
    if (!result.success) {
        console.error('DB 정보 조회 실패:', result.error);
        return NextResponse.json({
            success: false,
            message: 'DB 정보 조회에 실패했습니다.',
            error: result.error
        });
    }
    console.log('3. DB 정보 조회 완료');

    console.log('4. 현재 DB Collection 상태:', {
        keys: Object.keys(DB_COLLECTION),
        hasRequestedDB: dbName in DB_COLLECTION
    });

    const dbConfig = DB_COLLECTION[dbName];
    if (!dbConfig) {
        console.error('DB 설정을 찾을 수 없음:', {
            requestedDB: dbName,
            availableDBs: Object.keys(DB_COLLECTION)
        });
        return NextResponse.json({
            success: false,
            error: '해당 DB 설정을 찾을 수 없습니다.'
        });
    }

    try {
        // 연결 풀에서 연결 가져오기
        const pool = await getConnection(dbName);
        logger.info(`[DB Query] ${dbName} 연결 풀에서 연결 획득 성공`);

        // DB 버전 및 스키마 정보 조회
        const version = await pool.query('SELECT version()');
        const schema = await pool.query('SELECT current_schema()');
        logger.info('[DB Query] DB 정보 조회:', {
            version: version.rows[0].version,
            schema: schema.rows[0].current_schema
        });

        // 테이블 목록 조회
        logger.info('[DB Query] 테이블 목록 조회 시작');
        const tables = await pool.query(DB_QUERIES.SELECT_PUBLIC_TABLE_LIST.query);
        logger.info('[DB Query] 테이블 목록 조회 완료');

        console.log('========== DB 테이블 목록 조회 완료 ==========\n');
        return NextResponse.json({
            success: true,
            dbInfo: {
                host: dbConfig.host,
                port: dbConfig.port,
                database: dbConfig.data_base,
                user: dbConfig.config.service_db.user,
                version: version.rows[0].version,
                schema: schema.rows[0].current_schema,
                type: dbConfig.type
            },
            tables: tables.rows
        });
    } catch (error) {
        logger.error('[DB Query] 테이블 목록 조회 실패:', error instanceof Error ? error.message : String(error));
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : '알 수 없는 오류',
            dbInfo: {
                host: dbConfig.host,
                port: dbConfig.port,
                database: dbConfig.data_base,
                user: dbConfig.config.service_db.user,
                type: dbConfig.type
            }
        });
    }
} 