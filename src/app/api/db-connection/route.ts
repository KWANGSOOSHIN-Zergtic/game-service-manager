import { DataSource } from 'typeorm';
import { NextResponse } from 'next/server';
import { DB_COLLECTION } from '../db-infomation/db-collection';
import { saveDBCollection } from '../db-infomation/db-infomation';

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1초

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const DBConnection = async (dbName?: string) => {
    console.log('\n========== DB 연결 시작 ==========');
    
    // .env.development 설정 사용
    const defaultDBConfig = {
        type: process.env.DB_TYPE || 'postgres',
        host: process.env.DEV_DB_HOST,
        port: parseInt(process.env.DB_PORT || '5432'),
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
    };

    console.log('1. 요청된 DB 이름:', dbName || defaultDBConfig.database);

    if (!dbName) {
        dbName = defaultDBConfig.database;
        console.log('DB 이름이 제공되지 않아 기본값 사용:', dbName);
    }

    if (!dbName) {
        console.error('DB 이름이 제공되지 않음');
        return {
            success: false,
            message: 'DB 이름이 필요합니다.',
            error: 'DB name is required'
        };
    }

    let retryCount = 0;
    while (retryCount < MAX_RETRIES) {
        try {
            // DB 정보 조회
            console.log('2. DB 정보 조회 시작');
            const result = await saveDBCollection();
            if (!result.success) {
                console.error('DB 정보 조회 실패:', result.error);
                throw new Error(result.error || 'DB 정보 조회 실패');
            }
            console.log('3. DB 정보 조회 완료');

            console.log('4. 현재 DB Collection 상태:', {
                keys: Object.keys(DB_COLLECTION),
                hasRequestedDB: dbName in DB_COLLECTION
            });

            let AppDataSource;
            
            // DB Collection에서 설정을 찾거나 기본 설정 사용
            if (dbName in DB_COLLECTION) {
                const dbConfig = DB_COLLECTION[dbName];
                const serviceDBConfig = dbConfig.config?.service_db;

                if (!serviceDBConfig) {
                    throw new Error('DB 인증 정보가 누락되었습니다.');
                }

                AppDataSource = new DataSource({
                    type: 'postgres',
                    host: dbConfig.host,
                    port: Number(dbConfig.port || '5432'),
                    username: serviceDBConfig.user,
                    password: serviceDBConfig.password,
                    database: dbConfig.data_base,
                    synchronize: false,
                    logging: true,
                });
            } else {
                console.log('DB Collection에서 설정을 찾을 수 없어 기본 설정 사용');
                AppDataSource = new DataSource({
                    type: defaultDBConfig.type as 'postgres',
                    host: defaultDBConfig.host,
                    port: defaultDBConfig.port,
                    username: defaultDBConfig.username,
                    password: defaultDBConfig.password,
                    database: defaultDBConfig.database,
                    synchronize: false,
                    logging: true,
                });
            }

            console.log('6. DB 연결 시도 (시도 횟수:', retryCount + 1, '/', MAX_RETRIES, ')');

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
                    host: defaultDBConfig.host,
                    port: defaultDBConfig.port,
                    database: defaultDBConfig.database,
                    user: defaultDBConfig.username,
                    version: version[0].version,
                    schema: schema[0].current_schema,
                    type: defaultDBConfig.type
                }
            };
        } catch (error) {
            console.error(`DB 연결 실패 (시도 ${retryCount + 1}/${MAX_RETRIES}):`, error);
            retryCount++;

            if (retryCount < MAX_RETRIES) {
                console.log(`${RETRY_DELAY/1000}초 후 재시도...`);
                await delay(RETRY_DELAY);
            } else {
                return {
                    success: false,
                    message: 'Service DB 연결 실패',
                    error: error instanceof Error ? error.message : '알 수 없는 오류',
                    dbInfo: {
                        host: defaultDBConfig.host,
                        port: defaultDBConfig.port,
                        database: defaultDBConfig.database,
                        user: defaultDBConfig.username,
                        type: defaultDBConfig.type
                    }
                };
            }
        }
    }

    return {
        success: false,
        message: 'Service DB 연결 실패',
        error: '최대 재시도 횟수를 초과했습니다.',
        dbInfo: {
            host: defaultDBConfig.host,
            port: defaultDBConfig.port,
            database: defaultDBConfig.database,
            user: defaultDBConfig.username,
            type: defaultDBConfig.type
        }
    };
};

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const dbName = searchParams.get('dbName');
    const result = await DBConnection(dbName || undefined);
    return NextResponse.json(result);
} 