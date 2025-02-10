import { DataSource } from 'typeorm';
import { NextResponse } from 'next/server';
import { DB_QUERIES } from '../db-query/queries';
import { DB_COLLECTION } from '../db-information/db-collection';

const getDBList = async () => {
    // football_service 데이터베이스를 기본으로 사용
    const dbConfig = DB_COLLECTION['football_service'];
    if (!dbConfig) {
        return {
            success: false,
            error: 'football_service DB 설정을 찾을 수 없습니다.'
        };
    }

    const serviceDBConfig = dbConfig.config?.service_db;
    if (!serviceDBConfig) {
        return {
            success: false,
            error: 'DB 인증 정보가 누락되었습니다.'
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
        await AppDataSource.initialize();
        
        // 쿼리 상수 사용
        const tables = await AppDataSource.query(DB_QUERIES.SELECT_DB_LIST.query);

        await AppDataSource.destroy();
        return { success: true, tables };
    } catch (error) {
        console.error('Error in getDBList:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : '알 수 없는 오류'
        };
    }
};

export async function GET() {
    const result = await getDBList();
    return NextResponse.json(result);
} 