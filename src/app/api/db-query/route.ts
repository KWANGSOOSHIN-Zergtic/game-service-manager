import { NextResponse } from 'next/server';
import { DataSource } from 'typeorm';
import { DB_QUERIES } from './queries';
import { DB_COLLECTION } from '../db-infomation/db-collection';
import { saveDBCollection } from '../db-infomation/db-infomation';

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

    console.log('5. DB 설정 정보:', {
        name: dbConfig.name,
        type: dbConfig.type,
        host: dbConfig.host,
        port: dbConfig.port,
        database: dbConfig.data_base,
        hasConfig: !!dbConfig.config,
        hasServiceDB: !!dbConfig.config?.service_db
    });

    const serviceDBConfig = dbConfig.config?.service_db;
    if (!serviceDBConfig) {
        console.error('DB 인증 정보가 누락됨:', {
            name: dbConfig.name,
            config: dbConfig.config
        });
        return NextResponse.json({
            success: false,
            error: 'DB 인증 정보가 누락되었습니다.'
        });
    }

    const AppDataSource = new DataSource({
        type: 'postgres',
        host: dbConfig.host,
        port: Number(dbConfig.port || '5432'),
        username: serviceDBConfig.user,
        password: serviceDBConfig.password,
        database: dbConfig.data_base,
        synchronize: false,
        logging: true,
    });

    try {
        console.log('6. DB 연결 시도:', {
            host: dbConfig.host,
            port: dbConfig.port,
            database: dbConfig.data_base,
            username: serviceDBConfig.user
        });

        await AppDataSource.initialize();
        console.log('7. DB 연결 성공');

        // DB 버전 및 스키마 정보 조회
        const version = await AppDataSource.query('SELECT version()');
        const schema = await AppDataSource.query('SELECT current_schema()');
        console.log('8. DB 정보:', {
            version: version[0].version,
            schema: schema[0].current_schema
        });

        // 테이블 목록 조회
        console.log('9. 테이블 목록 조회 시작');
        const tables = await AppDataSource.query(DB_QUERIES.SELECT_PUBLIC_TABLE_LIST.query);
        console.log('10. 테이블 목록 조회 완료:', tables);
        
        await AppDataSource.destroy();
        console.log('11. DB 연결 종료');

        console.log('========== DB 테이블 목록 조회 완료 ==========\n');
        return NextResponse.json({
            success: true,
            dbInfo: {
                host: dbConfig.host,
                port: dbConfig.port,
                database: dbConfig.data_base,
                user: serviceDBConfig.user,
                version: version[0].version,
                schema: schema[0].current_schema,
                type: dbConfig.type
            },
            tables: tables
        });
    } catch (error) {
        console.error('테이블 목록 조회 실패:', error);
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : '알 수 없는 오류',
            dbInfo: {
                host: dbConfig.host,
                port: dbConfig.port,
                database: dbConfig.data_base,
                user: serviceDBConfig.user,
                type: dbConfig.type
            }
        });
    }
} 