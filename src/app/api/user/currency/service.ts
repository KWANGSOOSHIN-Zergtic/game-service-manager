import { DBConnectionManager } from '@/lib/db/db-connection-manager';
import { logger } from '@/lib/logger';
import { USER_CURRENCY_QUERIES } from '@/app/api/db-query/queries-users-currency';
import { DB_COLLECTION } from '@/app/api/db-information/db-collection';
import { saveDBCollection } from '@/app/api/db-information/db-information';

// 파라미터가 포함된 실제 쿼리 문자열 생성 유틸리티 함수
function formatQueryWithParams(query: string, params: (string | number | boolean | Date | null | undefined)[]): string {
  let formattedQuery = query;
  
  // 쿼리 문자열 포맷팅
  formattedQuery = formattedQuery
    .split('\n')
    .map(line => line.trim())
    .filter(line => line)
    .join('\n    ');
  
  // 각 파라미터를 적절한 형식으로 변환하여 쿼리에 삽입
  params.forEach((param, index) => {
    const placeholder = `$${index + 1}`;
    let paramValue: string;
    
    if (param === null) {
      paramValue = 'NULL';
    } else if (typeof param === 'string') {
      // 문자열 파라미터는 따옴표로 감싸기
      paramValue = `'${param}'`;
    } else if (param instanceof Date) {
      // 날짜 파라미터 처리
      paramValue = `'${param.toISOString()}'`;
    } else {
      // 숫자 등 다른 타입의 파라미터
      paramValue = String(param);
    }
    
    // 정규식을 사용하여 모든 $n 파라미터 교체
    const regex = new RegExp('\\' + placeholder, 'g');
    formattedQuery = formattedQuery.replace(regex, paramValue);
  });
  
  return formattedQuery;
}

export interface UserCurrencyParams {
  employerUid: string | null;
  dbName: string | null;
}

export interface UserCurrencyItemParams extends UserCurrencyParams {
  excelItemIndex: number | null;
}

export interface CreateUpdateCurrencyParams extends UserCurrencyParams {
  excelItemIndex: number;
  count: number;
}

export interface DeleteCurrencyParams extends UserCurrencyParams {
  excelItemIndex: number;
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

// API 결과 타입 정의
export interface UserCurrencyResult {
  success: boolean;
  message?: string;
  error?: string;
  details?: string;
  currencies?: UserCurrency[];
  currency?: UserCurrency;
  availableDBs?: string[];
  status: number;
}

// 사용자 재화 정보 전체 조회
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

          // 실제 파라미터 값이 포함된 쿼리로 변환
          const actualQuery = formatQueryWithParams(USER_CURRENCY_QUERIES.SELECT_USER_CURRENCY.query, [employerUid]);
          
          logger.info('[User Currency] 실행 쿼리:\n' + 
              '----------------------------------------\n' + 
              `    ${actualQuery}\n` +
              '----------------------------------------\n'
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

// 특정 재화 아이템 조회
export async function getUserCurrencyItem(params: UserCurrencyItemParams): Promise<UserCurrencyResult> {
  const { employerUid, dbName, excelItemIndex } = params;
  
  // 파라미터 검증
  if (!employerUid) {
    return {
      success: false,
      message: '사용자 UID가 누락되었습니다.',
      status: 400,
    };
  }

  if (excelItemIndex === null) {
    return {
      success: false,
      message: '아이템 인덱스가 누락되었습니다.',
      status: 400,
    };
  }

  try {
    // DB Collection 정보 업데이트
    logger.info('[User Currency Item] DB Collection 정보 업데이트 시작');
    const dbCollectionResult = await saveDBCollection();
    if (!dbCollectionResult.success) {
      logger.error('[User Currency Item] DB Collection 정보 업데이트 실패:', dbCollectionResult.error);
      return {
        success: false,
        error: 'DB 정보를 불러오는데 실패했습니다.',
        status: 500
      };
    }

    // DB 존재 여부 확인
    if (!dbName || !DB_COLLECTION[dbName]) {
      logger.error('[User Currency Item] 존재하지 않는 DB:', { 
        requestedDB: dbName || '지정되지 않음',
        availableDBs: Object.keys(DB_COLLECTION)
      });
      return {
        success: false,
        message: '요청한 데이터베이스를 찾을 수 없습니다.',
        availableDBs: Object.keys(DB_COLLECTION),
        status: 404,
      };
    }

    // DB 연결
    const dbManager = DBConnectionManager.getInstance();
    
    // 쿼리 실행
    const queryName = 'SELECT_USER_CURRENCY_ITEM';
    const query = USER_CURRENCY_QUERIES[queryName].query;
    const queryParams = [employerUid, excelItemIndex];

    // 디버깅을 위한 실제 쿼리 문자열 출력
    const formattedQuery = formatQueryWithParams(query, queryParams);
    logger.info(`Executing query: ${queryName}`);
    logger.debug(formattedQuery);

    const result = await dbManager.withClient(dbName as string, async (client) => {
      return await client.query(query, queryParams);
    });
    
    // 결과 반환
    if (result.rows.length === 0) {
      return {
        success: false,
        message: '해당 아이템을 찾을 수 없습니다.',
        status: 404,
      };
    }

    return {
      success: true,
      message: '재화 아이템 정보를 성공적으로 조회했습니다.',
      currency: result.rows[0],
      status: 200,
    };
  } catch (error) {
    logger.error('재화 아이템 정보 조회 중 오류 발생:', error);
    return {
      success: false,
      message: '재화 아이템 정보 조회 중 오류가 발생했습니다.',
      error: error instanceof Error ? error.message : String(error),
      status: 500,
    };
  }
}

// 사용자 재화 추가/생성
export async function createUserCurrency(params: CreateUpdateCurrencyParams): Promise<UserCurrencyResult> {
  const { employerUid, dbName, excelItemIndex, count } = params;
  
  // 파라미터 검증
  if (!employerUid) {
    return {
      success: false,
      message: '사용자 UID가 누락되었습니다.',
      status: 400,
    };
  }

  if (count < 0) {
    return {
      success: false,
      message: '재화 수량은 0 이상이어야 합니다.',
      status: 400,
    };
  }

  try {
    // DB Collection 정보 업데이트
    logger.info('[Create User Currency] DB Collection 정보 업데이트 시작');
    const dbCollectionResult = await saveDBCollection();
    if (!dbCollectionResult.success) {
      logger.error('[Create User Currency] DB Collection 정보 업데이트 실패:', dbCollectionResult.error);
      return {
        success: false,
        error: 'DB 정보를 불러오는데 실패했습니다.',
        status: 500
      };
    }

    // DB 존재 여부 확인
    if (!dbName || !DB_COLLECTION[dbName]) {
      logger.error('[Create User Currency] 존재하지 않는 DB:', { 
        requestedDB: dbName || '지정되지 않음',
        availableDBs: Object.keys(DB_COLLECTION)
      });
      return {
        success: false,
        message: '요청한 데이터베이스를 찾을 수 없습니다.',
        availableDBs: Object.keys(DB_COLLECTION),
        status: 404,
      };
    }

    // DB 연결
    const dbManager = DBConnectionManager.getInstance();
    
    // 쿼리 실행
    const queryName = 'INSERT_USER_CURRENCY';
    const query = USER_CURRENCY_QUERIES[queryName].query;
    const queryParams = [employerUid, excelItemIndex, count];

    // 디버깅을 위한 실제 쿼리 문자열 출력
    const formattedQuery = formatQueryWithParams(query, queryParams);
    logger.info(`Executing query: ${queryName}`);
    logger.debug(formattedQuery);

    const result = await dbManager.withClient(dbName as string, async (client) => {
      return await client.query(query, queryParams);
    });
    
    // 결과 반환
    return {
      success: true,
      message: '사용자 재화를 성공적으로 추가했습니다.',
      currency: result.rows[0],
      status: 201,
    };
  } catch (error) {
    logger.error('사용자 재화 추가 중 오류 발생:', error);
    return {
      success: false,
      message: '사용자 재화 추가 중 오류가 발생했습니다.',
      error: error instanceof Error ? error.message : String(error),
      status: 500,
    };
  }
}

// 사용자 재화 업데이트
export async function updateUserCurrency(params: CreateUpdateCurrencyParams): Promise<UserCurrencyResult> {
  const { employerUid, dbName, excelItemIndex, count } = params;
  
  // 파라미터 검증
  if (!employerUid) {
    return {
      success: false,
      message: '사용자 UID가 누락되었습니다.',
      status: 400,
    };
  }

  if (count < 0) {
    return {
      success: false,
      message: '재화 수량은 0 이상이어야 합니다.',
      status: 400,
    };
  }

  try {
    // DB Collection 정보 업데이트
    logger.info('[Update User Currency] DB Collection 정보 업데이트 시작');
    const dbCollectionResult = await saveDBCollection();
    if (!dbCollectionResult.success) {
      logger.error('[Update User Currency] DB Collection 정보 업데이트 실패:', dbCollectionResult.error);
      return {
        success: false,
        error: 'DB 정보를 불러오는데 실패했습니다.',
        status: 500
      };
    }

    // DB 존재 여부 확인
    if (!dbName || !DB_COLLECTION[dbName]) {
      logger.error('[Update User Currency] 존재하지 않는 DB:', { 
        requestedDB: dbName || '지정되지 않음',
        availableDBs: Object.keys(DB_COLLECTION)
      });
      return {
        success: false,
        message: '요청한 데이터베이스를 찾을 수 없습니다.',
        availableDBs: Object.keys(DB_COLLECTION),
        status: 404,
      };
    }

    // DB 연결
    const dbManager = DBConnectionManager.getInstance();
    
    // 쿼리 실행
    const queryName = 'UPDATE_USER_CURRENCY';
    const query = USER_CURRENCY_QUERIES[queryName].query;
    const queryParams = [employerUid, excelItemIndex, count];

    // 디버깅을 위한 실제 쿼리 문자열 출력
    const formattedQuery = formatQueryWithParams(query, queryParams);
    logger.info(`Executing query: ${queryName}`);
    logger.debug(formattedQuery);

    const result = await dbManager.withClient(dbName as string, async (client) => {
      return await client.query(query, queryParams);
    });
    
    // 결과 반환
    if (result.rows.length === 0) {
      return {
        success: false,
        message: '업데이트할 재화를 찾을 수 없습니다.',
        status: 404,
      };
    }

    return {
      success: true,
      message: '사용자 재화를 성공적으로 업데이트했습니다.',
      currency: result.rows[0],
      status: 200,
    };
  } catch (error) {
    logger.error('사용자 재화 업데이트 중 오류 발생:', error);
    return {
      success: false,
      message: '사용자 재화 업데이트 중 오류가 발생했습니다.',
      error: error instanceof Error ? error.message : String(error),
      status: 500,
    };
  }
}

// 사용자 재화 삭제
export async function deleteUserCurrency(params: DeleteCurrencyParams): Promise<UserCurrencyResult> {
  const { employerUid, dbName, excelItemIndex } = params;
  
  // 파라미터 검증
  if (!employerUid) {
    return {
      success: false,
      message: '사용자 UID가 누락되었습니다.',
      status: 400,
    };
  }

  try {
    // DB Collection 정보 업데이트
    logger.info('[Delete User Currency] DB Collection 정보 업데이트 시작');
    const dbCollectionResult = await saveDBCollection();
    if (!dbCollectionResult.success) {
      logger.error('[Delete User Currency] DB Collection 정보 업데이트 실패:', dbCollectionResult.error);
      return {
        success: false,
        error: 'DB 정보를 불러오는데 실패했습니다.',
        status: 500
      };
    }

    // DB 존재 여부 확인
    if (!dbName || !DB_COLLECTION[dbName]) {
      logger.error('[Delete User Currency] 존재하지 않는 DB:', { 
        requestedDB: dbName || '지정되지 않음',
        availableDBs: Object.keys(DB_COLLECTION)
      });
      return {
        success: false,
        message: '요청한 데이터베이스를 찾을 수 없습니다.',
        availableDBs: Object.keys(DB_COLLECTION),
        status: 404,
      };
    }

    // DB 연결
    const dbManager = DBConnectionManager.getInstance();
    
    // 쿼리 실행
    const queryName = 'DELETE_USER_CURRENCY';
    const query = USER_CURRENCY_QUERIES[queryName].query;
    const queryParams = [employerUid, excelItemIndex];

    // 디버깅을 위한 실제 쿼리 문자열 출력
    const formattedQuery = formatQueryWithParams(query, queryParams);
    logger.info(`Executing query: ${queryName}`);
    logger.debug(formattedQuery);

    const result = await dbManager.withClient(dbName as string, async (client) => {
      return await client.query(query, queryParams);
    });
    
    // 결과 반환
    if (result.rows.length === 0) {
      return {
        success: false,
        message: '삭제할 재화를 찾을 수 없습니다.',
        status: 404,
      };
    }

    return {
      success: true,
      message: '사용자 재화를 성공적으로 삭제했습니다.',
      currency: result.rows[0],
      status: 200,
    };
  } catch (error) {
    logger.error('사용자 재화 삭제 중 오류 발생:', error);
    return {
      success: false,
      message: '사용자 재화 삭제 중 오류가 발생했습니다.',
      error: error instanceof Error ? error.message : String(error),
      status: 500,
    };
  }
} 