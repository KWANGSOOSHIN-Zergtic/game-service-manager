import { DataSource } from 'typeorm';
import { NextResponse } from 'next/server';
import { DB_COLLECTION } from '../db-infomation/db-collection';
import { saveDBCollection } from '../db-infomation/db-infomation';

const DBConnection = async (dbName?: string) => {
    console.log('\n========== DB 연결 시작 ==========');
    console.log('1. 요청된 DB 이름:', dbName);

    if (!dbName) {
        console.error('DB 이름이 제공되지 않음');
        return {
            success: false,
            message: 'DB 이름이 필요합니다.',
            error: 'DB name is required'
        };
    }

    // DB 정보 조회
    console.log('2. DB 정보 조회 시작');
    const result = await saveDBCollection();
    if (!result.success) {
        console.error('DB 정보 조회 실패:', result.error);
        return {
            success: false,
            message: 'DB 정보 조회에 실패했습니다.',
            error: result.error
        };
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
        return {
            success: false,
            message: '해당 DB 설정을 찾을 수 없습니다.',
            error: 'DB configuration not found'
        };
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
        return {
            success: false,
            message: 'DB 인증 정보가 누락되었습니다.',
            error: 'DB credentials missing'
        };
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
        
        await AppDataSource.destroy();
        console.log('9. DB 연결 종료');

        return { 
            success: true, 
            message: 'Service DB 연결 성공',
            dbInfo: {
                host: dbConfig.host,
                port: dbConfig.port,
                database: dbConfig.data_base,
                user: serviceDBConfig.user,
                version: version[0].version,
                schema: schema[0].current_schema,
                type: dbConfig.type
            }
        };
    } catch (error) {
        console.error('DB 연결 실패:', error);
        return {
            success: false,
            message: 'Service DB 연결 실패',
            error: error instanceof Error ? error.message : '알 수 없는 오류',
            dbInfo: {
                host: dbConfig.host,
                port: dbConfig.port,
                database: dbConfig.data_base,
                user: serviceDBConfig.user,
                type: dbConfig.type
            }
        };
    } finally {
        console.log('========== DB 연결 완료 ==========\n');
    }
};

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const dbName = searchParams.get('dbName');
    const result = await DBConnection(dbName || undefined);
    return NextResponse.json(result);
} 