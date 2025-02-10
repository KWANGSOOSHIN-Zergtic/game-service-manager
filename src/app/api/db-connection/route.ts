import { DataSource } from 'typeorm';
import { NextResponse } from 'next/server';

const DBConnection = async (dbName?: string) => {
    const dbConfig = {
        host: process.env.DEV_DB_HOST,
        database: dbName || process.env.DB_NAME,
    };

    const AppDataSource = new DataSource({
        type: 'postgres',
        host: dbConfig.host,
        port: parseInt(process.env.DB_PORT || '5432'),
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: dbConfig.database,
        synchronize: false,
        logging: true,
    });

    try {
        await AppDataSource.initialize();
        await AppDataSource.destroy();
        return { 
            success: true, 
            message: 'Service DB 연결 성공',
            dbInfo: {
                host: dbConfig.host,
                database: dbConfig.database
            }
        };
    } catch (error) {
        return {
            success: false,
            message: 'Service DB 연결 실패',
            error: error instanceof Error ? error.message : '알 수 없는 오류',
            dbInfo: {
                host: dbConfig.host,
                database: dbConfig.database
            }
        };
    }
};

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const dbName = searchParams.get('dbName');
    const result = await DBConnection(dbName || undefined);
    return NextResponse.json(result);
} 