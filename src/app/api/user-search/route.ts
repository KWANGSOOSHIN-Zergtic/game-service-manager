import { NextRequest } from 'next/server';
import { getConnection, initializeDatabase } from '@/lib/init/database-initializer';
import { DB_QUERIES } from '@/app/api/db-query/queries';
import { DB_COLLECTION } from '@/app/api/db-information/db-collection';
import { saveDBCollection, loadDBList } from '@/app/api/db-information/db-information';
import { logger } from '@/lib/logger';
import type { DBConfig } from '@/app/api/db-information/db-information';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const dbName = searchParams.get('dbName');
    const userId = searchParams.get('userId');

    if (!dbName || !userId) {
      logger.warn('Missing required parameters:', { dbName, userId });
      return Response.json({
        success: false,
        error: 'Database name and user ID are required',
      });
    }

    // DB Collection이 비어있는 경우 초기화
    if (Object.keys(DB_COLLECTION).length === 0) {
      logger.info('Initializing DB Collection...');
      const initResult = await saveDBCollection();
      if (!initResult.success) {
        logger.error('Failed to initialize DB Collection:', initResult.error);
        return Response.json({
          success: false,
          error: 'Failed to initialize database configuration',
        });
      }
    }

    // DB 설정 정보 가져오기
    let currentDBConfig: DBConfig | undefined = DB_COLLECTION[dbName];
    
    if (!currentDBConfig) {
      // DB 리스트 다시 로드 시도
      logger.info('DB config not found, trying to reload DB list...');
      const loadResult = await loadDBList();
      if (!loadResult.success || !loadResult.dbList) {
        logger.error('Failed to reload DB list:', loadResult.error);
        return Response.json({
          success: false,
          error: `Database configuration not found for: ${dbName}`,
        });
      }

      // DB Collection 업데이트 후 다시 확인
      const reloadResult = await saveDBCollection();
      if (!reloadResult.success) {
        logger.error('Failed to update DB Collection:', reloadResult.error);
        return Response.json({
          success: false,
          error: 'Failed to update database configuration',
        });
      }

      // 다시 DB 설정 확인
      currentDBConfig = DB_COLLECTION[dbName];
      if (!currentDBConfig) {
        logger.error('DB config still not found after reload:', { dbName });
        return Response.json({
          success: false,
          error: `Database configuration not found for: ${dbName} after reload`,
        });
      }
    }

    // DB 설정 유효성 검사
    if (!currentDBConfig.config?.service_db?.user || !currentDBConfig.config?.service_db?.password) {
      logger.error('Invalid database configuration - missing credentials:', { 
        dbName,
        hasUser: !!currentDBConfig.config?.service_db?.user,
        hasPassword: !!currentDBConfig.config?.service_db?.password
      });
      return Response.json({
        success: false,
        error: 'Invalid database configuration',
      });
    }

    let connection;
    try {
      // 기존 연결 확인 및 초기화
      try {
        connection = await getConnection(dbName);
        // 연결 테스트
        await connection.query('SELECT NOW()');
      } catch (_) {
        logger.info('Connection not found or invalid, initializing new connection:', { dbName });
        // 연결이 없거나 유효하지 않은 경우 새로 초기화
        const connectionConfig = {
          type: currentDBConfig.type,
          host: currentDBConfig.host,
          port: currentDBConfig.port,
          database: currentDBConfig.data_base,
          user: currentDBConfig.config.service_db.user,
          password: currentDBConfig.config.service_db.password
        };

        logger.info('Initializing database with config:', {
          dbName,
          host: connectionConfig.host,
          port: connectionConfig.port,
          database: connectionConfig.database,
          user: connectionConfig.user,
          hasPassword: !!connectionConfig.password
        });

        await initializeDatabase(dbName, connectionConfig);
        connection = await getConnection(dbName);
      }

      // 사용자 정보 조회
      const query = DB_QUERIES.SELECT_USER_INFO.query;
      const result = await connection.query(query, [userId]);

      if (result.rows.length === 0) {
        logger.info('User not found:', { dbName, userId });
        return Response.json({
          success: false,
          error: 'User not found',
        });
      }

      logger.info('User found successfully:', { dbName, userId });
      return Response.json({
        success: true,
        user: result.rows[0],
      });

    } catch (error) {
      logger.error('Database operation failed:', { 
        dbName, 
        userId, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
      
      return Response.json({
        success: false,
        error: 'Database operation failed. Please try again.',
      });
    }
  } catch (error) {
    logger.error('Unexpected error in user search:', error);
    return Response.json({
      success: false,
      error: 'An unexpected error occurred',
    });
  }
} 