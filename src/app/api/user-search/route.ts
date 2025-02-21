import { NextRequest, NextResponse } from 'next/server';
import { DBConnectionManager } from '@/lib/db/db-connection-manager';
import { logger } from '@/lib/logger';
import { DB_QUERIES } from '../db-query/queries';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const dbName = searchParams.get('dbName');

    if (!userId || !dbName) {
        return NextResponse.json({ 
            success: false,
            error: '사용자 ID와 데이터베이스 이름이 필요합니다.' 
        }, { status: 400 });
    }

    try {
        const dbManager = DBConnectionManager.getInstance();
        
        const result = await dbManager.withClient(dbName, async (client) => {
            return await client.query(DB_QUERIES.SELECT_USER_INFO.query, [userId]);
        });

        if (result.rows.length === 0) {
            return NextResponse.json({
                success: true,
                message: '사용자를 찾을 수 없습니다.',
                user: null
            });
        }

        return NextResponse.json({
            success: true,
            message: '사용자를 찾았습니다.',
            user: result.rows[0]
        });
    } catch (error) {
        logger.error('[User Search] 검색 중 오류 발생:', error);
        return NextResponse.json({
            success: false,
            error: '사용자 검색 중 오류가 발생했습니다.'
        }, { status: 500 });
    }
} 