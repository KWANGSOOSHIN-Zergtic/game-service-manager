import { NextRequest, NextResponse } from 'next/server';
import { DBConnectionManager } from '@/lib/db/db-connection-manager';
import { logger } from '@/lib/logger';
import { DB_QUERIES } from '../db-query/queries';
import { DB_COLLECTION } from '../db-information/db-collection';
import { saveDBCollection } from '../db-information/db-information';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const dbName = searchParams.get('dbName');

    logger.info('[User Search] 검색 시작:', { userId, dbName });

    if (!userId || !dbName) {
        logger.warn('[User Search] 필수 파라미터 누락:', { userId, dbName });
        return NextResponse.json({ 
            success: false,
            error: '사용자 ID와 데이터베이스 이름이 필요합니다.' 
        }, { status: 400 });
    }

    try {
        // DB Collection 정보 업데이트
        logger.info('[User Search] DB Collection 정보 업데이트 시작');
        const dbCollectionResult = await saveDBCollection();
        if (!dbCollectionResult.success) {
            logger.error('[User Search] DB Collection 정보 업데이트 실패:', dbCollectionResult.error);
            return NextResponse.json({
                success: false,
                error: 'DB 정보를 불러오는데 실패했습니다.'
            }, { status: 500 });
        }

        // DB 존재 여부 확인
        if (!DB_COLLECTION[dbName]) {
            logger.error('[User Search] 존재하지 않는 DB:', { 
                requestedDB: dbName,
                availableDBs: Object.keys(DB_COLLECTION)
            });
            return NextResponse.json({
                success: false,
                error: '요청한 데이터베이스를 찾을 수 없습니다.',
                availableDBs: Object.keys(DB_COLLECTION)
            }, { status: 404 });
        }

        const dbManager = DBConnectionManager.getInstance();
        
        try {
            // DB 연결 확인 및 사용
            dbManager.getPool(dbName);
            logger.info('[User Search] DB 연결 풀 획득 성공:', { dbName });
            
            const userIdType = userId.match(/^[0-9]+$/) ? 'uid' : 
                             userId.match(/^[0-9a-fA-F-]+$/) ? 'uuid' : 'login_id';

            // 쿼리 실행 정보 로깅
            logger.info('[User Search] 쿼리 실행 정보:', {
                database: dbName,
                searchType: userIdType,
                searchValue: userId
            });

            // 실제 쿼리 로깅 (포맷팅된 형태)
            const formattedQuery = DB_QUERIES.SELECT_USER_INFO.query
                .split('\n')
                .map(line => line.trim())
                .filter(line => line)
                .join('\n    ');
            
            logger.info('[User Search] 실행 쿼리:\n' + 
                '----------------------------------------\n' + 
                `    ${formattedQuery}\n` +
                '----------------------------------------\n' +
                `파라미터: [${userId}]`
            );

            const startTime = Date.now();
            const result = await dbManager.withClient(dbName, async (client) => {
                return await client.query(DB_QUERIES.SELECT_USER_INFO.query, [userId]);
            });

            // 쿼리 실행 결과 로깅
            logger.info('[User Search] 쿼리 실행 결과:', {
                rowCount: result.rows.length,
                executionTime: `${Date.now() - startTime}ms`
            });

            if (result.rows.length === 0) {
                logger.info('[User Search] 사용자를 찾을 수 없음:', { userId });
                return NextResponse.json({
                    success: false,
                    error: '사용자를 찾을 수 없습니다.',
                    users: []
                });
            }

            // exact_match 결과만 있는지 확인
            const hasExactMatch = result.rows.some(row => 
                row.uid.toString() === userId || 
                row.uuid === userId || 
                row.login_id === userId || 
                row.display_id === userId || 
                row.nickname === userId
            );

            logger.info('[User Search] 사용자 검색 성공:', { 
                userId, 
                count: result.rows.length,
                isExactMatch: hasExactMatch 
            });

            return NextResponse.json({
                success: true,
                isExactMatch: hasExactMatch,
                message: hasExactMatch 
                    ? `검색에 일치하는 ${result.rows.length}명의 사용자를 찾았습니다.`
                    : `일치하는 검색어가 존재하지 않아 유사 검색어를 검색하였습니다\n검색에 일치하는 ${result.rows.length}명의 사용자를 찾았습니다.`,
                users: result.rows
            });
        } catch (error) {
            if (error instanceof Error && error.message.includes('연결을 찾을 수 없습니다')) {
                logger.error('[User Search] DB 연결 풀이 존재하지 않음. 재초기화 시도');
                const initialized = await dbManager.initialize();
                if (!initialized) {
                    throw new Error('데이터베이스 초기화에 실패했습니다.');
                }
                // 재귀적으로 다시 시도
                return GET(request);
            }
            throw error;
        }
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
        const errorStack = error instanceof Error ? error.stack : undefined;
        
        logger.error('[User Search] 검색 중 오류 발생:', {
            error: errorMessage,
            stack: errorStack,
            userId,
            userIdType: userId.match(/^[0-9]+$/) ? 'uid' : 
                       userId.match(/^[0-9a-fA-F-]+$/) ? 'uuid' : 'login_id',
            dbName,
            availableDBs: Object.keys(DB_COLLECTION),
            query: DB_QUERIES.SELECT_USER_INFO.query
        });

        return NextResponse.json({
            success: false,
            error: '사용자 검색 중 오류가 발생했습니다.',
            details: errorMessage
        }, { status: 500 });
    }
} 