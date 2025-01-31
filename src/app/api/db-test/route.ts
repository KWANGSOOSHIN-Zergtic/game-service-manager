import { DataSource } from 'typeorm';
import { NextResponse } from 'next/server';

const testDBConnection = async () => {
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
        await AppDataSource.destroy();
        return { success: true, message: '데이터베이스 연결 성공' };
    } catch (error) {
        return {
            success: false,
            message: '데이터베이스 연결 실패',
            error: error instanceof Error ? error.message : '알 수 없는 오류'
        };
    }
};

export async function GET() {
    const result = await testDBConnection();
    return NextResponse.json(result);
} 