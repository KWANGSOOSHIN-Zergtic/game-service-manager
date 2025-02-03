import { DataSource } from 'typeorm';
import { NextResponse } from 'next/server';

const getDBTables = async () => {
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
        
        // PostgreSQL의 information_schema에서 테이블 목록 조회
        const tables = await AppDataSource.query(`
            SELECT 
                table_name,
                table_schema
            FROM 
                information_schema.tables 
            WHERE 
                table_schema = 'public'
            ORDER BY 
                table_name;
        `);

        await AppDataSource.destroy();
        return { success: true, tables };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : '알 수 없는 오류'
        };
    }
};

export async function GET() {
    const result = await getDBTables();
    return NextResponse.json(result);
} 