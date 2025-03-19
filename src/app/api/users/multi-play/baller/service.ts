import { DBConnectionManager } from '@/lib/db/db-connection-manager';
import { logger } from '@/lib/logger';
import { USER_BALLER_QUERIES } from '@/app/api/db-query/queries-users-baller';
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

export interface UserBallerParams {
  employerUid: string | null;
  dbName: string | null;
}

export interface UserBallerItemParams extends UserBallerParams {
  excelBallerIndex: number | null;
}

export interface CreateUpdateUserBallerParams extends UserBallerParams {
  excelBallerIndex: number;
  trainingPoint: number;
  characterLevel: number;
  recruitProcess: number;
  characterStatus: number;
  talkGroupNo: number;
  etc?: string;
  maxUpgradePoint: number;
}

export interface DeleteUserBallerParams extends UserBallerParams {
  excelBallerIndex: number;
}

// 사용자 Baller 정보 타입 정의
export interface UserBaller {
  id: number;
  excel_baller_index: number;
  employer_uid: number;
  training_point: number;
  character_level: number;
  recruit_process: number;
  character_status: number;
  talk_group_no: number;
  etc?: string;
  max_upgrade_point: number;
  created_at?: Date;
  updated_at?: Date;
  user_nickname?: string;
  user_display_id?: string;
}

// API 결과 타입 정의
export interface UserBallerResult {
  success: boolean;
  message?: string;
  error?: string;
  details?: string;
  ballers?: UserBaller[];
  baller?: UserBaller;
  availableDBs?: string[];
  status: number;
}

// 사용자 Baller 정보 전체 조회
export async function getUserBaller(params: UserBallerParams): Promise<UserBallerResult> {
  const { employerUid, dbName } = params;

  logger.info('[User Baller] 조회 시작:', { employerUid, dbName });

  if (!employerUid || !dbName) {
    logger.warn('[User Baller] 필수 파라미터 누락:', { employerUid, dbName });
    return {
      success: false,
      error: '사용자 UID와 데이터베이스 이름이 필요합니다.',
      status: 400
    };
  }

  try {
    // DB Collection 정보 업데이트
    logger.info('[User Baller] DB Collection 정보 업데이트 시작');
    const dbCollectionResult = await saveDBCollection();
    if (!dbCollectionResult.success) {
      logger.error('[User Baller] DB Collection 정보 업데이트 실패:', dbCollectionResult.error || '알 수 없는 오류');
      return {
        success: false,
        error: 'DB 정보를 불러오는데 실패했습니다.',
        status: 500
      };
    }

    // DB 존재 여부 확인
    if (!DB_COLLECTION[dbName]) {
      logger.error('[User Baller] 존재하지 않는 DB:', { 
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
      logger.info('[User Baller] DB 연결 풀 획득 성공:', { dbName });
      
      // 쿼리 실행 정보 로깅
      logger.info('[User Baller] 쿼리 실행 정보:', {
        database: dbName,
        searchValue: employerUid
      });

      // 실제 파라미터 값이 포함된 쿼리로 변환
      const actualQuery = formatQueryWithParams(USER_BALLER_QUERIES.SELECT_USER_BALLER.query, [employerUid]);
      
      logger.info('[User Baller] 실행 쿼리:\n' + 
        '----------------------------------------\n' + 
        `    ${actualQuery}\n` +
        '----------------------------------------\n'
      );

      const startTime = Date.now();
      const result = await dbManager.withClient(dbName, async (client) => {
        return await client.query(USER_BALLER_QUERIES.SELECT_USER_BALLER.query, [employerUid]);
      });
      logger.info(`[User Baller] 쿼리 실행 완료: ${Date.now() - startTime}ms`);
      
      if (result.rows.length === 0) {
        logger.info('[User Baller] 조회 결과 없음:', { employerUid });
        return {
          success: true,
          message: '해당 사용자의 Baller 정보가 없습니다.',
          ballers: [],
          status: 200
        };
      }

      // 결과 반환
      logger.info('[User Baller] 조회 성공:', { count: result.rows.length });
      return {
        success: true,
        message: '사용자 Baller 정보를 성공적으로 조회했습니다.',
        ballers: result.rows,
        status: 200
      };
    } catch (error) {
      logger.error('[User Baller] 쿼리 실행 중 오류:', error as unknown as object);
      return {
        success: false,
        error: '쿼리 실행 중 오류가 발생했습니다.',
        details: error instanceof Error ? error.message : '알 수 없는 오류',
        status: 500
      };
    }
  } catch (error) {
    logger.error('[User Baller] 조회 중 오류:', error as unknown as object);
    return {
      success: false,
      error: '조회 중 오류가 발생했습니다.',
      details: error instanceof Error ? error.message : '알 수 없는 오류',
      status: 500
    };
  }
}

// 사용자의 특정 Baller 정보 조회
export async function getUserBallerItem(params: UserBallerItemParams): Promise<UserBallerResult> {
  const { employerUid, dbName, excelBallerIndex } = params;

  logger.info('[User Baller Item] 조회 시작:', { employerUid, dbName, excelBallerIndex });

  if (!employerUid || !dbName || excelBallerIndex === null) {
    logger.warn('[User Baller Item] 필수 파라미터 누락:', { employerUid, dbName, excelBallerIndex });
    return {
      success: false,
      error: '사용자 UID, 데이터베이스 이름, 및 Baller 인덱스가 필요합니다.',
      status: 400
    };
  }

  try {
    // DB Collection 정보 업데이트
    logger.info('[User Baller Item] DB Collection 정보 업데이트 시작');
    const dbCollectionResult = await saveDBCollection();
    if (!dbCollectionResult.success) {
      logger.error('[User Baller Item] DB Collection 정보 업데이트 실패:', dbCollectionResult.error || '알 수 없는 오류');
      return {
        success: false,
        error: 'DB 정보를 불러오는데 실패했습니다.',
        status: 500
      };
    }

    // DB 존재 여부 확인
    if (!DB_COLLECTION[dbName]) {
      logger.error('[User Baller Item] 존재하지 않는 DB:', { 
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
      logger.info('[User Baller Item] DB 연결 풀 획득 성공:', { dbName });

      // 쿼리 실행 정보 로깅
      logger.info('[User Baller Item] 쿼리 실행 정보:', {
        database: dbName,
        employerUid,
        excelBallerIndex
      });

      // 실제 파라미터 값이 포함된 쿼리로 변환
      const actualQuery = formatQueryWithParams(USER_BALLER_QUERIES.SELECT_USER_BALLER_BY_ID.query, [employerUid, excelBallerIndex]);
      
      logger.info('[User Baller Item] 실행 쿼리:\n' + 
        '----------------------------------------\n' + 
        `    ${actualQuery}\n` +
        '----------------------------------------\n'
      );

      const startTime = Date.now();
      const result = await dbManager.withClient(dbName, async (client) => {
        return await client.query(USER_BALLER_QUERIES.SELECT_USER_BALLER_BY_ID.query, [employerUid, excelBallerIndex]);
      });
      logger.info(`[User Baller Item] 쿼리 실행 완료: ${Date.now() - startTime}ms`);

      if (result.rows.length === 0) {
        logger.info('[User Baller Item] 조회 결과 없음:', { employerUid, excelBallerIndex });
        return {
          success: false,
          message: '해당 Baller 정보를 찾을 수 없습니다.',
          status: 404
        };
      }

      // 결과 반환
      logger.info('[User Baller Item] 조회 성공');
      return {
        success: true,
        message: 'Baller 정보를 성공적으로 조회했습니다.',
        baller: result.rows[0],
        status: 200
      };
    } catch (error) {
      logger.error('[User Baller Item] 쿼리 실행 중 오류:', error as unknown as object);
      return {
        success: false,
        error: '쿼리 실행 중 오류가 발생했습니다.',
        details: error instanceof Error ? error.message : '알 수 없는 오류',
        status: 500
      };
    }
  } catch (error) {
    logger.error('[User Baller Item] 조회 중 오류:', error as unknown as object);
    return {
      success: false,
      error: '조회 중 오류가 발생했습니다.',
      details: error instanceof Error ? error.message : '알 수 없는 오류',
      status: 500
    };
  }
}

// 사용자 Baller 생성/추가
export async function createUserBaller(params: CreateUpdateUserBallerParams): Promise<UserBallerResult> {
  const { 
    employerUid, 
    dbName, 
    excelBallerIndex, 
    trainingPoint, 
    characterLevel, 
    recruitProcess, 
    characterStatus, 
    talkGroupNo, 
    etc,
    maxUpgradePoint
  } = params;

  logger.info('[User Baller Create] 시작:', { 
    employerUid, 
    dbName, 
    excelBallerIndex 
  });

  if (!employerUid || !dbName || !excelBallerIndex) {
    logger.warn('[User Baller Create] 필수 파라미터 누락:', { 
      employerUid, 
      dbName, 
      excelBallerIndex 
    });
    return {
      success: false,
      error: '사용자 UID, 데이터베이스 이름, 및 Baller 인덱스가 필요합니다.',
      status: 400
    };
  }

  try {
    // DB Collection 정보 업데이트
    logger.info('[User Baller Create] DB Collection 정보 업데이트 시작');
    const dbCollectionResult = await saveDBCollection();
    if (!dbCollectionResult.success) {
      logger.error('[User Baller Create] DB Collection 정보 업데이트 실패:', dbCollectionResult.error || '알 수 없는 오류');
      return {
        success: false,
        error: 'DB 정보를 불러오는데 실패했습니다.',
        status: 500
      };
    }

    // DB 존재 여부 확인
    if (!DB_COLLECTION[dbName]) {
      logger.error('[User Baller Create] 존재하지 않는 DB:', { 
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
      logger.info('[User Baller Create] DB 연결 풀 획득 성공:', { dbName });

      // 쿼리 실행 정보 로깅
      logger.info('[User Baller Create] 쿼리 실행 정보:', {
        database: dbName,
        employerUid,
        excelBallerIndex,
        trainingPoint,
        characterLevel,
        recruitProcess,
        characterStatus,
        talkGroupNo,
        etc,
        maxUpgradePoint
      });

      // 쿼리 파라미터 준비
      const queryParams = [
        excelBallerIndex,
        employerUid,
        trainingPoint,
        characterLevel,
        recruitProcess,
        characterStatus,
        talkGroupNo,
        etc,
        maxUpgradePoint
      ];

      // 실제 파라미터 값이 포함된 쿼리로 변환
      const actualQuery = formatQueryWithParams(USER_BALLER_QUERIES.INSERT_USER_BALLER.query, queryParams);
      
      logger.info('[User Baller Create] 실행 쿼리:\n' + 
        '----------------------------------------\n' + 
        `    ${actualQuery}\n` +
        '----------------------------------------\n'
      );

      const startTime = Date.now();
      const result = await dbManager.withClient(dbName, async (client) => {
        return await client.query(USER_BALLER_QUERIES.INSERT_USER_BALLER.query, queryParams);
      });
      logger.info(`[User Baller Create] 쿼리 실행 완료: ${Date.now() - startTime}ms`);

      if (result.rows.length === 0) {
        logger.error('[User Baller Create] 생성 실패');
        return {
          success: false,
          error: 'Baller 정보 생성에 실패했습니다.',
          status: 500
        };
      }

      // 결과 반환
      logger.info('[User Baller Create] 생성 성공');
      return {
        success: true,
        message: 'Baller 정보를 성공적으로 생성했습니다.',
        baller: result.rows[0],
        status: 201
      };
    } catch (error) {
      logger.error('[User Baller Create] 쿼리 실행 중 오류:', error as unknown as object);
      return {
        success: false,
        error: '쿼리 실행 중 오류가 발생했습니다.',
        details: error instanceof Error ? error.message : '알 수 없는 오류',
        status: 500
      };
    }
  } catch (error) {
    logger.error('[User Baller Create] 생성 중 오류:', error as unknown as object);
    return {
      success: false,
      error: '생성 중 오류가 발생했습니다.',
      details: error instanceof Error ? error.message : '알 수 없는 오류',
      status: 500
    };
  }
}

// 사용자 Baller 업데이트
export async function updateUserBaller(params: CreateUpdateUserBallerParams): Promise<UserBallerResult> {
  const { 
    employerUid, 
    dbName, 
    excelBallerIndex, 
    trainingPoint, 
    characterLevel, 
    recruitProcess, 
    characterStatus, 
    talkGroupNo, 
    etc,
    maxUpgradePoint
  } = params;

  logger.info('[User Baller Update] 시작:', { 
    employerUid, 
    dbName, 
    excelBallerIndex 
  });

  if (!employerUid || !dbName || !excelBallerIndex) {
    logger.warn('[User Baller Update] 필수 파라미터 누락:', { 
      employerUid, 
      dbName, 
      excelBallerIndex 
    });
    return {
      success: false,
      error: '사용자 UID, 데이터베이스 이름, 및 Baller 인덱스가 필요합니다.',
      status: 400
    };
  }

  try {
    // DB Collection 정보 업데이트
    logger.info('[User Baller Update] DB Collection 정보 업데이트 시작');
    const dbCollectionResult = await saveDBCollection();
    if (!dbCollectionResult.success) {
      logger.error('[User Baller Update] DB Collection 정보 업데이트 실패:', dbCollectionResult.error || '알 수 없는 오류');
      return {
        success: false,
        error: 'DB 정보를 불러오는데 실패했습니다.',
        status: 500
      };
    }

    // DB 존재 여부 확인
    if (!DB_COLLECTION[dbName]) {
      logger.error('[User Baller Update] 존재하지 않는 DB:', { 
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
      logger.info('[User Baller Update] DB 연결 풀 획득 성공:', { dbName });

      // 쿼리 실행 정보 로깅
      logger.info('[User Baller Update] 쿼리 실행 정보:', {
        database: dbName,
        employerUid,
        excelBallerIndex,
        trainingPoint,
        characterLevel,
        recruitProcess,
        characterStatus,
        talkGroupNo,
        etc,
        maxUpgradePoint
      });

      // 쿼리 파라미터 준비
      const queryParams = [
        employerUid,
        excelBallerIndex,
        trainingPoint,
        characterLevel,
        recruitProcess,
        characterStatus,
        talkGroupNo,
        etc,
        maxUpgradePoint
      ];

      // 실제 파라미터 값이 포함된 쿼리로 변환
      const actualQuery = formatQueryWithParams(USER_BALLER_QUERIES.UPDATE_USER_BALLER.query, queryParams);
      
      logger.info('[User Baller Update] 실행 쿼리:\n' + 
        '----------------------------------------\n' + 
        `    ${actualQuery}\n` +
        '----------------------------------------\n'
      );

      const startTime = Date.now();
      const result = await dbManager.withClient(dbName, async (client) => {
        return await client.query(USER_BALLER_QUERIES.UPDATE_USER_BALLER.query, queryParams);
      });
      logger.info(`[User Baller Update] 쿼리 실행 완료: ${Date.now() - startTime}ms`);

      if (result.rows.length === 0) {
        logger.error('[User Baller Update] 업데이트 실패: 해당 항목을 찾을 수 없음');
        return {
          success: false,
          error: '해당 Baller 정보를 찾을 수 없습니다.',
          status: 404
        };
      }

      // 결과 반환
      logger.info('[User Baller Update] 업데이트 성공');
      return {
        success: true,
        message: 'Baller 정보를 성공적으로 업데이트했습니다.',
        baller: result.rows[0],
        status: 200
      };
    } catch (error) {
      logger.error('[User Baller Update] 쿼리 실행 중 오류:', error as unknown as object);
      return {
        success: false,
        error: '쿼리 실행 중 오류가 발생했습니다.',
        details: error instanceof Error ? error.message : '알 수 없는 오류',
        status: 500
      };
    }
  } catch (error) {
    logger.error('[User Baller Update] 업데이트 중 오류:', error as unknown as object);
    return {
      success: false,
      error: '업데이트 중 오류가 발생했습니다.',
      details: error instanceof Error ? error.message : '알 수 없는 오류',
      status: 500
    };
  }
}

// 사용자 Baller 삭제
export async function deleteUserBaller(params: DeleteUserBallerParams): Promise<UserBallerResult> {
  const { employerUid, dbName, excelBallerIndex } = params;

  logger.info('[User Baller Delete] 시작:', { 
    employerUid, 
    dbName, 
    excelBallerIndex 
  });

  if (!employerUid || !dbName || !excelBallerIndex) {
    logger.warn('[User Baller Delete] 필수 파라미터 누락:', { 
      employerUid, 
      dbName, 
      excelBallerIndex 
    });
    return {
      success: false,
      error: '사용자 UID, 데이터베이스 이름, 및 Baller 인덱스가 필요합니다.',
      status: 400
    };
  }

  try {
    // DB Collection 정보 업데이트
    logger.info('[User Baller Delete] DB Collection 정보 업데이트 시작');
    const dbCollectionResult = await saveDBCollection();
    if (!dbCollectionResult.success) {
      logger.error('[User Baller Delete] DB Collection 정보 업데이트 실패:', dbCollectionResult.error || '알 수 없는 오류');
      return {
        success: false,
        error: 'DB 정보를 불러오는데 실패했습니다.',
        status: 500
      };
    }

    // DB 존재 여부 확인
    if (!DB_COLLECTION[dbName]) {
      logger.error('[User Baller Delete] 존재하지 않는 DB:', { 
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
      logger.info('[User Baller Delete] DB 연결 풀 획득 성공:', { dbName });

      // 쿼리 실행 정보 로깅
      logger.info('[User Baller Delete] 쿼리 실행 정보:', {
        database: dbName,
        employerUid,
        excelBallerIndex
      });

      // 실제 파라미터 값이 포함된 쿼리로 변환
      const actualQuery = formatQueryWithParams(USER_BALLER_QUERIES.DELETE_USER_BALLER.query, [employerUid, excelBallerIndex]);
      
      logger.info('[User Baller Delete] 실행 쿼리:\n' + 
        '----------------------------------------\n' + 
        `    ${actualQuery}\n` +
        '----------------------------------------\n'
      );

      const startTime = Date.now();
      const result = await dbManager.withClient(dbName, async (client) => {
        return await client.query(USER_BALLER_QUERIES.DELETE_USER_BALLER.query, [employerUid, excelBallerIndex]);
      });
      logger.info(`[User Baller Delete] 쿼리 실행 완료: ${Date.now() - startTime}ms`);

      if (result.rows.length === 0) {
        logger.error('[User Baller Delete] 삭제 실패: 해당 항목을 찾을 수 없음');
        return {
          success: false,
          error: '해당 Baller 정보를 찾을 수 없습니다.',
          status: 404
        };
      }

      // 결과 반환
      logger.info('[User Baller Delete] 삭제 성공');
      return {
        success: true,
        message: 'Baller 정보를 성공적으로 삭제했습니다.',
        baller: result.rows[0],
        status: 200
      };
    } catch (error) {
      logger.error('[User Baller Delete] 쿼리 실행 중 오류:', error as unknown as object);
      return {
        success: false,
        error: '쿼리 실행 중 오류가 발생했습니다.',
        details: error instanceof Error ? error.message : '알 수 없는 오류',
        status: 500
      };
    }
  } catch (error) {
    logger.error('[User Baller Delete] 삭제 중 오류:', error as unknown as object);
    return {
      success: false,
      error: '삭제 중 오류가 발생했습니다.',
      details: error instanceof Error ? error.message : '알 수 없는 오류',
      status: 500
    };
  }
} 