import { NextResponse } from 'next/server';
import { DataSource } from 'typeorm';
import { DB_QUERIES } from './queries';
import { DB_COLLECTION } from '../db-infomation/db-collection';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const dbName = searchParams.get('dbName');

    if (!dbName) {
        return NextResponse.json({
            success: false,
            error: 'DB 이름이 필요합니다.'
        });
    }

    const dbConfig = DB_COLLECTION[dbName];
    if (!dbConfig) {
        return NextResponse.json({
            success: false,
            error: '해당 DB 설정을 찾을 수 없습니다.'
        });
    }

    const AppDataSource = new DataSource({
        type: 'postgres',
        host: dbConfig.host,
        port: Number(dbConfig.port || '5432'),
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: dbConfig.data_base,
        synchronize: false,
        logging: true,
    });

    try {
        await AppDataSource.initialize();
        
        const result = await AppDataSource.query(DB_QUERIES.SELECT_PUBLIC_TABLE_LIST.query);
        
        await AppDataSource.destroy();

        return NextResponse.json({
            success: true,
            tables: result
        });
    } catch (error) {
        console.error('Error executing query:', error);
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : '알 수 없는 오류'
        });
    }
} 