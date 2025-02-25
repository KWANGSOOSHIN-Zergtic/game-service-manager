import { DBConnectionManager } from '@/lib/db/db-connection-manager';
import { logger } from '@/lib/logger';
import { USER_CURRENCY_QUERIES } from '@/app/api/db-query/queries-users-currency';
import { DB_COLLECTION } from '@/app/api/db-information/db-collection';
import { saveDBCollection } from '@/app/api/db-information/db-information';

export interface UserCurrencyParams {
  employerUid: string | null;
  dbName: string | null;
}

// 사용자 화폐 정보 타입 정의
export interface UserCurrency {
  id: number;
  create_at: Date;
  update_at: Date;
  employer_uid: number;
  excel_item_index: number;
  count: number;
  user_nickname?: string;
  user_display_id?: string;
}

export interface UserCurrencyResult {
  success: boolean;
  message?: string;
  error?: string;
  details?: string;
  currencies?: UserCurrency[];
  availableDBs?: string[];
  status: number;
}

// 사용자 화폐 정보 조회 서비스
export async function getUserCurrency(params: UserCurrencyParams): Promise<UserCurrencyResult> {
  const { employerUid, dbName } = params;

  logger.info('[User Currency] 조회 시작:', { employerUid, dbName });

  if (!employerUid || !dbName) {
      logger.warn('[User Currency] 필수 파라미터 누락:', { employerUid, dbName });
      return {
          success: false,
          error: '사용자 UID와 데이터베이스 이름이 필요합니다.',
          status: 400
      };
  }

  try {
      // DB Collection 정보 업데이트
      logger.info('[User Currency] DB Collection 정보 업데이트 시작');
      const dbCollectionResult = await saveDBCollection();
      if (!dbCollectionResult.success) {
          logger.error('[User Currency] DB Collection 정보 업데이트 실패:', dbCollectionResult.error);
          return {
              success: false,
              error: 'DB 정보를 불러오는데 실패했습니다.',
              status: 500
          };
      }

      // DB 존재 여부 확인
      if (!DB_COLLECTION[dbName]) {
          logger.error('[User Currency] 존재하지 않는 DB:', { 
              requestedDB: dbName,
              availableDBs: Object.keys(DB_COLLECTION)
          });
          return {
              success: false,
              error: '요청한 데이터베이스를 찾을 수 없습니다.',
              availableDBs: Object.keys(DB_COLLECTION),
              status: 404
          };
      }

      const dbManager = DBConnectionManager.getInstance();
      
      try {
          // DB 연결 확인 및 사용
          dbManager.getPool(dbName);
          logger.info('[User Currency] DB 연결 풀 획득 성공:', { dbName });
          
          // 쿼리 실행 정보 로깅
          logger.info('[User Currency] 쿼리 실행 정보:', {
              database: dbName,
              searchValue: employerUid
          });

          // 실제 쿼리 로깅 (포맷팅된 형태)
          const formattedQuery = USER_CURRENCY_QUERIES.SELECT_USER_CURRENCY.query
              .split('\n')
              .map(line => line.trim())
              .filter(line => line)
              .join('\n    ');
          
          logger.info('[User Currency] 실행 쿼리:\n' + 
              '----------------------------------------\n' + 
              `    ${formattedQuery}\n` +
              '----------------------------------------\n' +
              `파라미터: [${employerUid}]`
          );

          const startTime = Date.now();
          const result = await dbManager.withClient(dbName, async (client) => {
              return await client.query(USER_CURRENCY_QUERIES.SELECT_USER_CURRENCY.query, [employerUid]);
          });

          // 쿼리 실행 결과 로깅
          logger.info('[User Currency] 쿼리 실행 결과:', {
              rowCount: result.rows.length,
              executionTime: `${Date.now() - startTime}ms`
          });

          if (result.rows.length === 0) {
              logger.info('[User Currency] 사용자 화폐 정보를 찾을 수 없음:', { employerUid });
              return {
                  success: true,
                  message: '사용자의 화폐 정보가 없습니다.',
                  currencies: [],
                  status: 200
              };
          }

          logger.info('[User Currency] 사용자 화폐 정보 조회 성공:', { 
              employerUid, 
              count: result.rows.length
          });

          return {
              success: true,
              message: `${result.rows.length}개의 화폐 정보를 조회했습니다.`,
              currencies: result.rows as UserCurrency[],
              status: 200
          };
      } catch (error) {
          if (error instanceof Error && error.message.includes('연결을 찾을 수 없습니다')) {
              logger.error('[User Currency] DB 연결 풀이 존재하지 않음. 재초기화 시도');
              const initialized = await dbManager.initialize();
              if (!initialized) {
                  throw new Error('데이터베이스 초기화에 실패했습니다.');
              }
              // 재귀적으로 다시 시도
              return getUserCurrency(params);
          }
          throw error;
      }
  } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
      const errorStack = error instanceof Error ? error.stack : undefined;
      
      logger.error('[User Currency] 조회 중 오류 발생:', {
          error: errorMessage,
          stack: errorStack,
          employerUid,
          dbName,
          availableDBs: Object.keys(DB_COLLECTION),
          query: USER_CURRENCY_QUERIES.SELECT_USER_CURRENCY.query
      });

      return {
          success: false,
          error: '사용자 화폐 정보 조회 중 오류가 발생했습니다.',
          details: errorMessage,
          status: 500
      };
  }
} 