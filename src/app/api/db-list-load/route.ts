import { DataSource } from 'typeorm';
import { NextResponse } from 'next/server';
import { DB_QUERIES } from '../db-query/queries';

const getDBList = async () => {
    const AppDataSource = new DataSource({
        type: 'postgres',
        host: process.env.DEV_DB_HOST,
        port: parseInt(process.env.DB_PORT || '5432'),
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
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