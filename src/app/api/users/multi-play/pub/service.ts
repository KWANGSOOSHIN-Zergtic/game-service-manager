import { DBConnectionManager } from '@/lib/db/db-connection-manager';
import { logger } from '@/lib/logger';
import { USER_PUB_SEAT_QUERIES } from '@/app/api/db-query/queries-users-pub';
import { DB_COLLECTION } from '@/app/api/db-information/db-collection';
import { saveDBCollection } from '@/app/api/db-information/db-information';

// 파라미터가 포함된 실제 쿼리 문자열 생성 유틸리티 함수
function formatQueryWithParams(query: string, params: (string | number | boolean | Date | null | undefined | (number|boolean)[])[]): string {
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
    } else if (Array.isArray(param)) {
      // 배열 파라미터 처리
      paramValue = `ARRAY[${param.map(item => typeof item === 'boolean' ? item : item)}]`;
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

// 파라미터 인터페이스 정의
export interface UserPubSeatParams {
  employerUid: string | null;
  dbName: string | null;
}

export interface UserPubSeatItemParams extends UserPubSeatParams {
  id?: number | null;
}

export interface CreateUpdateUserPubSeatParams extends UserPubSeatParams {
  id?: number | null;
  seatStatus: number[];
  talkStatus: boolean[];
  recruitStatus: boolean[];
}

export interface DeleteUserPubSeatParams extends UserPubSeatParams {
  id?: number;
}

// 사용자 PUB 좌석 정보 타입 정의
export interface UserPubSeat {
  id: number;
  employer_uid: number;
  refresh_at: Date;
  seat_status: number[];
  talk_status: boolean[];
  recruit_status: boolean[];
  user_nickname?: string;
  user_display_id?: string;
}

// API 결과 타입 정의
export interface UserPubSeatResult {
  success: boolean;
  message?: string;
  error?: string;
  details?: string;
  pubSeats?: UserPubSeat[];
  pubSeat?: UserPubSeat;
  availableDBs?: string[];
  data?: UserPubSeat[];
  status: number;
}

// 모든 PUB 좌석 상태 조회
export async function getUserPubSeat(params: UserPubSeatParams): Promise<UserPubSeatResult> {
  const { employerUid, dbName } = params;

  logger.info('[User PUB Seat] 조회 시작:', { employerUid, dbName });

  if (!dbName) {
    logger.warn('[User PUB Seat] 필수 파라미터 누락:', { dbName });
    return {
      success: false,
      error: '데이터베이스 이름이 필요합니다.',
      status: 400,
      data: []
    };
  }

  try {
    // DB Collection 정보 업데이트
    logger.info('[User PUB Seat] DB Collection 정보 업데이트 시작');
    const dbCollectionResult = await saveDBCollection();
    if (!dbCollectionResult.success) {
      logger.error('[User PUB Seat] DB Collection 정보 업데이트 실패:', dbCollectionResult.error || '알 수 없는 오류');
      return {
        success: false,
        error: 'DB 정보를 불러오는데 실패했습니다.',
        status: 500,
        data: []
      };
    }

    // DB 존재 여부 확인
    if (!DB_COLLECTION[dbName]) {
      logger.error('[User PUB Seat] 존재하지 않는 DB:', { 
        requestedDB: dbName,
        availableDBs: Object.keys(DB_COLLECTION)
      });
      return {
        success: false,
        error: '요청한 데이터베이스를 찾을 수 없습니다.',
        availableDBs: Object.keys(DB_COLLECTION),
        status: 404,
        data: []
      };
    }

    const dbManager = DBConnectionManager.getInstance();
    
    try {
      // DB 연결 확인 및 사용
      dbManager.getPool(dbName);
      logger.info('[User PUB Seat] DB 연결 풀 획득 성공:', { dbName });
      
      // 쿼리 실행 정보 로깅
      logger.info('[User PUB Seat] 쿼리 실행 정보:', {
        database: dbName,
        searchValue: employerUid
      });

      // 실제 파라미터 값이 포함된 쿼리로 변환
      const queryName = employerUid ? 'SELECT_USER_PUB_SEAT_BY_EMPLOYER_UID' : 'SELECT_USER_PUB_SEAT';
      const queryParams = employerUid ? [employerUid] : [null];
      const query = USER_PUB_SEAT_QUERIES[queryName].query;
      
      const actualQuery = formatQueryWithParams(query, queryParams);
      
      logger.info('[User PUB Seat] 실행 쿼리:\n' + 
        '----------------------------------------\n' + 
        `    ${actualQuery}\n` +
        '----------------------------------------\n'
      );

      const startTime = Date.now();
      const result = await dbManager.withClient(dbName, async (client) => {
        return await client.query(query, queryParams);
      });
      logger.info(`[User PUB Seat] 쿼리 실행 완료: ${Date.now() - startTime}ms`);
      
      if (result.rows.length === 0) {
        logger.info('[User PUB Seat] 조회 결과 없음:', { employerUid });
        return {
          success: true,
          message: employerUid 
            ? '해당 사용자의 PUB 좌석 상태 정보가 없습니다.' 
            : 'PUB 좌석 상태 정보가 없습니다.',
          pubSeats: [],
          data: [],
          status: 200
        };
      }

      // 결과 반환
      logger.info('[User PUB Seat] 조회 성공:', { count: result.rows.length });
      return {
        success: true,
        message: '사용자 PUB 좌석 상태 정보를 성공적으로 조회했습니다.',
        pubSeats: result.rows,
        data: result.rows,
        status: 200
      };
    } catch (error) {
      logger.error('[User PUB Seat] 쿼리 실행 중 오류:', error as unknown as object);
      return {
        success: false,
        error: '쿼리 실행 중 오류가 발생했습니다.',
        details: error instanceof Error ? error.message : '알 수 없는 오류',
        status: 500,
        data: []
      };
    }
  } catch (error) {
    logger.error('[User PUB Seat] 조회 중 오류:', error as unknown as object);
    return {
      success: false,
      error: '조회 중 오류가 발생했습니다.',
      details: error instanceof Error ? error.message : '알 수 없는 오류',
      status: 500,
      data: []
    };
  }
}

// 특정 PUB 좌석 상태 조회
export async function getUserPubSeatItem(params: UserPubSeatItemParams): Promise<UserPubSeatResult> {
  const { employerUid, dbName, id } = params;

  logger.info('[User PUB Seat Item] 조회 시작:', { employerUid, dbName, id });

  if (!dbName) {
    logger.warn('[User PUB Seat Item] 필수 파라미터 누락:', { dbName });
    return {
      success: false,
      error: '데이터베이스 이름이 필요합니다.',
      status: 400,
      data: []
    };
  }

  if (!id && !employerUid) {
    logger.warn('[User PUB Seat Item] 필수 파라미터 누락:', { id, employerUid });
    return {
      success: false,
      error: 'PUB 좌석 ID 또는 사용자 UID가 필요합니다.',
      status: 400,
      data: []
    };
  }

  try {
    // DB Collection 정보 업데이트
    logger.info('[User PUB Seat Item] DB Collection 정보 업데이트 시작');
    const dbCollectionResult = await saveDBCollection();
    if (!dbCollectionResult.success) {
      logger.error('[User PUB Seat Item] DB Collection 정보 업데이트 실패:', dbCollectionResult.error || '알 수 없는 오류');
      return {
        success: false,
        error: 'DB 정보를 불러오는데 실패했습니다.',
        status: 500,
        data: []
      };
    }

    // DB 존재 여부 확인
    if (!DB_COLLECTION[dbName]) {
      logger.error('[User PUB Seat Item] 존재하지 않는 DB:', { 
        requestedDB: dbName,
        availableDBs: Object.keys(DB_COLLECTION)
      });
      return {
        success: false,
        error: '요청한 데이터베이스를 찾을 수 없습니다.',
        availableDBs: Object.keys(DB_COLLECTION),
        status: 404,
        data: []
      };
    }

    const dbManager = DBConnectionManager.getInstance();

    try {
      // DB 연결 확인 및 사용
      dbManager.getPool(dbName);
      logger.info('[User PUB Seat Item] DB 연결 풀 획득 성공:', { dbName });
      
      // 쿼리 선택 (ID로 조회 또는 고용자 UID로 조회)
      let queryName = 'SELECT_USER_PUB_SEAT_BY_ID';
      let queryParams = [id];
      
      if (!id && employerUid) {
        queryName = 'SELECT_USER_PUB_SEAT_BY_EMPLOYER_UID';
        queryParams = [employerUid];
      }
      
      const query = USER_PUB_SEAT_QUERIES[queryName].query;
      
      // 쿼리 로깅
      const actualQuery = formatQueryWithParams(query, queryParams);
      logger.info('[User PUB Seat Item] 실행 쿼리:\n' + 
        '----------------------------------------\n' + 
        `    ${actualQuery}\n` +
        '----------------------------------------\n'
      );

      const startTime = Date.now();
      const result = await dbManager.withClient(dbName, async (client) => {
        return await client.query(query, queryParams);
      });
      logger.info(`[User PUB Seat Item] 쿼리 실행 완료: ${Date.now() - startTime}ms`);
      
      if (result.rows.length === 0) {
        logger.info('[User PUB Seat Item] 조회 결과 없음:', { id, employerUid });
        return {
          success: false,
          message: '해당하는 PUB 좌석 상태 정보를 찾을 수 없습니다.',
          status: 404,
          data: []
        };
      }

      // 결과 반환
      logger.info('[User PUB Seat Item] 조회 성공:', { id: result.rows[0].id });
      return {
        success: true,
        message: 'PUB 좌석 상태 정보를 성공적으로 조회했습니다.',
        pubSeat: result.rows[0],
        data: [result.rows[0]],
        status: 200
      };
    } catch (error) {
      logger.error('[User PUB Seat Item] 쿼리 실행 중 오류:', error as unknown as object);
      return {
        success: false,
        error: '쿼리 실행 중 오류가 발생했습니다.',
        details: error instanceof Error ? error.message : '알 수 없는 오류',
        status: 500,
        data: []
      };
    }
  } catch (error) {
    logger.error('[User PUB Seat Item] 조회 중 오류:', error as unknown as object);
    return {
      success: false,
      error: '조회 중 오류가 발생했습니다.',
      details: error instanceof Error ? error.message : '알 수 없는 오류',
      status: 500,
      data: []
    };
  }
}

// PUB 좌석 상태 생성
export async function createUserPubSeat(params: CreateUpdateUserPubSeatParams): Promise<UserPubSeatResult> {
  const { employerUid, dbName, seatStatus, talkStatus, recruitStatus } = params;

  logger.info('[User PUB Seat] 생성 시작:', { 
    employerUid, 
    dbName, 
    seatStatus, 
    talkStatus, 
    recruitStatus 
  });

  if (!employerUid || !dbName) {
    logger.warn('[User PUB Seat] 필수 파라미터 누락:', { employerUid, dbName });
    return {
      success: false,
      error: '사용자 UID와 데이터베이스 이름이 필요합니다.',
      status: 400,
      data: []
    };
  }

  if (!seatStatus || !Array.isArray(seatStatus) || seatStatus.length === 0) {
    logger.warn('[User PUB Seat] 잘못된 좌석 상태 데이터:', { seatStatus });
    return {
      success: false,
      error: '좌석 상태는 배열 형태이며 최소 1개 이상의 상태를 포함해야 합니다.',
      status: 400,
      data: []
    };
  }

  if (!talkStatus || !Array.isArray(talkStatus)) {
    logger.warn('[User PUB Seat] 잘못된 대화 상태 데이터:', { talkStatus });
    return {
      success: false,
      error: '대화 상태는 배열 형태이어야 합니다.',
      status: 400,
      data: []
    };
  }

  if (!recruitStatus || !Array.isArray(recruitStatus)) {
    logger.warn('[User PUB Seat] 잘못된 모집 상태 데이터:', { recruitStatus });
    return {
      success: false,
      error: '모집 상태는 배열 형태이어야 합니다.',
      status: 400,
      data: []
    };
  }

  try {
    // DB Collection 정보 업데이트
    logger.info('[User PUB Seat] DB Collection 정보 업데이트 시작');
    const dbCollectionResult = await saveDBCollection();
    if (!dbCollectionResult.success) {
      logger.error('[User PUB Seat] DB Collection 정보 업데이트 실패:', dbCollectionResult.error || '알 수 없는 오류');
      return {
        success: false,
        error: 'DB 정보를 불러오는데 실패했습니다.',
        status: 500,
        data: []
      };
    }

    // DB 존재 여부 확인
    if (!DB_COLLECTION[dbName]) {
      logger.error('[User PUB Seat] 존재하지 않는 DB:', { 
        requestedDB: dbName,
        availableDBs: Object.keys(DB_COLLECTION)
      });
      return {
        success: false,
        error: '요청한 데이터베이스를 찾을 수 없습니다.',
        availableDBs: Object.keys(DB_COLLECTION),
        status: 404,
        data: []
      };
    }

    const dbManager = DBConnectionManager.getInstance();

    try {
      // DB 연결 확인 및 사용
      dbManager.getPool(dbName);
      logger.info('[User PUB Seat] DB 연결 풀 획득 성공:', { dbName });

      // 저장 전 해당 사용자가 이미 PUB 좌석 정보를 가지고 있는지 확인
      const existingResult = await getUserPubSeatItem({ employerUid, dbName });
      
      if (existingResult.success && existingResult.pubSeat) {
        logger.info('[User PUB Seat] 이미 존재하는 PUB 좌석 상태:', { 
          employerUid, 
          id: existingResult.pubSeat.id 
        });
        
        // 이미 존재하는 경우 업데이트로 처리
        return await updateUserPubSeat({
          employerUid,
          dbName, 
          id: existingResult.pubSeat.id,
          seatStatus,
          talkStatus,
          recruitStatus
        });
      }
      
      // 새로운 PUB 좌석 상태 생성
      const query = USER_PUB_SEAT_QUERIES.INSERT_USER_PUB_SEAT.query;
      const queryParams = [employerUid, seatStatus, talkStatus, recruitStatus];
      
      // 쿼리 로깅
      const actualQuery = formatQueryWithParams(query, queryParams);
      logger.info('[User PUB Seat] 실행 쿼리:\n' + 
        '----------------------------------------\n' + 
        `    ${actualQuery}\n` +
        '----------------------------------------\n'
      );

      const startTime = Date.now();
      const result = await dbManager.withClient(dbName, async (client) => {
        return await client.query(query, queryParams);
      });
      logger.info(`[User PUB Seat] 쿼리 실행 완료: ${Date.now() - startTime}ms`);
      
      if (result.rows.length === 0) {
        logger.error('[User PUB Seat] 생성 실패: 반환된 데이터 없음');
        return {
          success: false,
          error: 'PUB 좌석 상태 생성에 실패했습니다.',
          status: 500,
          data: []
        };
      }

      // 결과 반환
      logger.info('[User PUB Seat] 생성 성공:', { id: result.rows[0].id });
      return {
        success: true,
        message: 'PUB 좌석 상태를 성공적으로 생성했습니다.',
        pubSeat: result.rows[0],
        data: [result.rows[0]],
        status: 201
      };
    } catch (error) {
      logger.error('[User PUB Seat] 쿼리 실행 중 오류:', error as unknown as object);
      return {
        success: false,
        error: '쿼리 실행 중 오류가 발생했습니다.',
        details: error instanceof Error ? error.message : '알 수 없는 오류',
        status: 500,
        data: []
      };
    }
  } catch (error) {
    logger.error('[User PUB Seat] 생성 중 오류:', error as unknown as object);
    return {
      success: false,
      error: '생성 중 오류가 발생했습니다.',
      details: error instanceof Error ? error.message : '알 수 없는 오류',
      status: 500,
      data: []
    };
  }
}

// PUB 좌석 상태 업데이트
export async function updateUserPubSeat(params: CreateUpdateUserPubSeatParams): Promise<UserPubSeatResult> {
  const { employerUid, dbName, id, seatStatus, talkStatus, recruitStatus } = params;

  logger.info('[User PUB Seat] 업데이트 시작:', { 
    employerUid, 
    dbName, 
    id,
    seatStatus, 
    talkStatus, 
    recruitStatus 
  });

  if (!dbName) {
    logger.warn('[User PUB Seat] 필수 파라미터 누락:', { dbName });
    return {
      success: false,
      error: '데이터베이스 이름이 필요합니다.',
      status: 400,
      data: []
    };
  }

  if (!id && !employerUid) {
    logger.warn('[User PUB Seat] 필수 파라미터 누락:', { id, employerUid });
    return {
      success: false,
      error: 'PUB 좌석 ID 또는 사용자 UID가 필요합니다.',
      status: 400,
      data: []
    };
  }

  if (!seatStatus || !Array.isArray(seatStatus) || seatStatus.length === 0) {
    logger.warn('[User PUB Seat] 잘못된 좌석 상태 데이터:', { seatStatus });
    return {
      success: false,
      error: '좌석 상태는 배열 형태이며 최소 1개 이상의 상태를 포함해야 합니다.',
      status: 400,
      data: []
    };
  }

  if (!talkStatus || !Array.isArray(talkStatus)) {
    logger.warn('[User PUB Seat] 잘못된 대화 상태 데이터:', { talkStatus });
    return {
      success: false,
      error: '대화 상태는 배열 형태이어야 합니다.',
      status: 400,
      data: []
    };
  }

  if (!recruitStatus || !Array.isArray(recruitStatus)) {
    logger.warn('[User PUB Seat] 잘못된 모집 상태 데이터:', { recruitStatus });
    return {
      success: false,
      error: '모집 상태는 배열 형태이어야 합니다.',
      status: 400,
      data: []
    };
  }

  try {
    // DB Collection 정보 업데이트
    logger.info('[User PUB Seat] DB Collection 정보 업데이트 시작');
    const dbCollectionResult = await saveDBCollection();
    if (!dbCollectionResult.success) {
      logger.error('[User PUB Seat] DB Collection 정보 업데이트 실패:', dbCollectionResult.error || '알 수 없는 오류');
      return {
        success: false,
        error: 'DB 정보를 불러오는데 실패했습니다.',
        status: 500,
        data: []
      };
    }

    // DB 존재 여부 확인
    if (!DB_COLLECTION[dbName]) {
      logger.error('[User PUB Seat] 존재하지 않는 DB:', { 
        requestedDB: dbName,
        availableDBs: Object.keys(DB_COLLECTION)
      });
      return {
        success: false,
        error: '요청한 데이터베이스를 찾을 수 없습니다.',
        availableDBs: Object.keys(DB_COLLECTION),
        status: 404,
        data: []
      };
    }

    const dbManager = DBConnectionManager.getInstance();

    try {
      // DB 연결 확인 및 사용
      dbManager.getPool(dbName);
      logger.info('[User PUB Seat] DB 연결 풀 획득 성공:', { dbName });

      // 쿼리 선택 (ID로 업데이트 또는 고용자 UID로 업데이트)
      let queryName = 'UPDATE_USER_PUB_SEAT';
      let queryParams = [id, seatStatus, talkStatus, recruitStatus];
      
      if (!id && employerUid) {
        queryName = 'UPDATE_USER_PUB_SEAT_BY_EMPLOYER';
        queryParams = [employerUid, seatStatus, talkStatus, recruitStatus];
      }
      
      const query = USER_PUB_SEAT_QUERIES[queryName].query;
      
      // 쿼리 로깅
      const actualQuery = formatQueryWithParams(query, queryParams);
      logger.info('[User PUB Seat] 실행 쿼리:\n' + 
        '----------------------------------------\n' + 
        `    ${actualQuery}\n` +
        '----------------------------------------\n'
      );

      const startTime = Date.now();
      const result = await dbManager.withClient(dbName, async (client) => {
        return await client.query(query, queryParams);
      });
      logger.info(`[User PUB Seat] 쿼리 실행 완료: ${Date.now() - startTime}ms`);
      
      if (result.rows.length === 0) {
        logger.warn('[User PUB Seat] 업데이트 실패: 해당 데이터 없음', { id, employerUid });
        return {
          success: false,
          message: '업데이트할 PUB 좌석 상태를 찾을 수 없습니다.',
          status: 404,
          data: []
        };
      }

      // 결과 반환
      logger.info('[User PUB Seat] 업데이트 성공:', { id: result.rows[0].id });
      return {
        success: true,
        message: 'PUB 좌석 상태를 성공적으로 업데이트했습니다.',
        pubSeat: result.rows[0],
        data: [result.rows[0]],
        status: 200
      };
    } catch (error) {
      logger.error('[User PUB Seat] 쿼리 실행 중 오류:', error as unknown as object);
      return {
        success: false,
        error: '쿼리 실행 중 오류가 발생했습니다.',
        details: error instanceof Error ? error.message : '알 수 없는 오류',
        status: 500,
        data: []
      };
    }
  } catch (error) {
    logger.error('[User PUB Seat] 업데이트 중 오류:', error as unknown as object);
    return {
      success: false,
      error: '업데이트 중 오류가 발생했습니다.',
      details: error instanceof Error ? error.message : '알 수 없는 오류',
      status: 500,
      data: []
    };
  }
}

// PUB 좌석 상태 삭제
export async function deleteUserPubSeat(params: DeleteUserPubSeatParams): Promise<UserPubSeatResult> {
  const { employerUid, dbName, id } = params;

  logger.info('[User PUB Seat] 삭제 시작:', { employerUid, dbName, id });

  if (!dbName) {
    logger.warn('[User PUB Seat] 필수 파라미터 누락:', { dbName });
    return {
      success: false,
      error: '데이터베이스 이름이 필요합니다.',
      status: 400,
      data: []
    };
  }

  if (!id && !employerUid) {
    logger.warn('[User PUB Seat] 필수 파라미터 누락:', { id, employerUid });
    return {
      success: false,
      error: 'PUB 좌석 ID 또는 사용자 UID가 필요합니다.',
      status: 400,
      data: []
    };
  }

  try {
    // DB Collection 정보 업데이트
    logger.info('[User PUB Seat] DB Collection 정보 업데이트 시작');
    const dbCollectionResult = await saveDBCollection();
    if (!dbCollectionResult.success) {
      logger.error('[User PUB Seat] DB Collection 정보 업데이트 실패:', dbCollectionResult.error || '알 수 없는 오류');
      return {
        success: false,
        error: 'DB 정보를 불러오는데 실패했습니다.',
        status: 500,
        data: []
      };
    }

    // DB 존재 여부 확인
    if (!DB_COLLECTION[dbName]) {
      logger.error('[User PUB Seat] 존재하지 않는 DB:', { 
        requestedDB: dbName,
        availableDBs: Object.keys(DB_COLLECTION)
      });
      return {
        success: false,
        error: '요청한 데이터베이스를 찾을 수 없습니다.',
        availableDBs: Object.keys(DB_COLLECTION),
        status: 404,
        data: []
      };
    }

    const dbManager = DBConnectionManager.getInstance();

    try {
      // DB 연결 확인 및 사용
      dbManager.getPool(dbName);
      logger.info('[User PUB Seat] DB 연결 풀 획득 성공:', { dbName });

      // 쿼리 선택 (ID로 삭제 또는 고용자 UID로 삭제)
      let queryName = 'DELETE_USER_PUB_SEAT';
      let queryParams = [id];
      
      if (!id && employerUid) {
        queryName = 'DELETE_USER_PUB_SEAT_BY_EMPLOYER';
        queryParams = [employerUid];
      }
      
      const query = USER_PUB_SEAT_QUERIES[queryName].query;
      
      // 쿼리 로깅
      const actualQuery = formatQueryWithParams(query, queryParams);
      logger.info('[User PUB Seat] 실행 쿼리:\n' + 
        '----------------------------------------\n' + 
        `    ${actualQuery}\n` +
        '----------------------------------------\n'
      );

      const startTime = Date.now();
      const result = await dbManager.withClient(dbName, async (client) => {
        return await client.query(query, queryParams);
      });
      logger.info(`[User PUB Seat] 쿼리 실행 완료: ${Date.now() - startTime}ms`);
      
      if (result.rows.length === 0) {
        logger.warn('[User PUB Seat] 삭제 실패: 해당 데이터 없음', { id, employerUid });
        return {
          success: false,
          message: '삭제할 PUB 좌석 상태를 찾을 수 없습니다.',
          status: 404,
          data: []
        };
      }

      // 결과 반환
      logger.info('[User PUB Seat] 삭제 성공:', { id: result.rows[0].id });
      return {
        success: true,
        message: 'PUB 좌석 상태를 성공적으로 삭제했습니다.',
        pubSeat: result.rows[0],
        data: [result.rows[0]],
        status: 200
      };
    } catch (error) {
      logger.error('[User PUB Seat] 쿼리 실행 중 오류:', error as unknown as object);
      return {
        success: false,
        error: '쿼리 실행 중 오류가 발생했습니다.',
        details: error instanceof Error ? error.message : '알 수 없는 오류',
        status: 500,
        data: []
      };
    }
  } catch (error) {
    logger.error('[User PUB Seat] 삭제 중 오류:', error as unknown as object);
    return {
      success: false,
      error: '삭제 중 오류가 발생했습니다.',
      details: error instanceof Error ? error.message : '알 수 없는 오류',
      status: 500,
      data: []
    };
  }
} 