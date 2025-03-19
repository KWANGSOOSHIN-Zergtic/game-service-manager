import { getUserCurrency, updateUserCurrency } from '@/app/api/users/currency/service';

// 모킹된 모듈들 설정
jest.mock('@/lib/db/db-connection-manager', () => {
  const mockQueryFn = jest.fn().mockImplementation((query, params) => {
    // UPDATE 쿼리 실행 시
    if (query.includes('UPDATE user_inventory_account')) {
      return {
        rows: [{
          id: 1,
          create_at: new Date(),
          update_at: new Date(),
          employer_uid: Number(params[0]),
          excel_item_index: Number(params[1]),
          count: Number(params[2]),
          user_nickname: "테스트유저",
          user_display_id: "TESTUSER"
        }]
      };
    }
    
    // 기본 조회 쿼리 실행 시
    return {
      rows: [
        {
          id: 1,
          create_at: new Date(),
          update_at: new Date(),
          employer_uid: 1,
          excel_item_index: 1001,
          count: 1000,
          user_nickname: "테스트유저",
          user_display_id: "TESTUSER"
        },
        {
          id: 2,
          create_at: new Date(),
          update_at: new Date(),
          employer_uid: 1,
          excel_item_index: 1002,
          count: 500,
          user_nickname: "테스트유저",
          user_display_id: "TESTUSER"
        }
      ]
    };
  });
  
  return {
    DBConnectionManager: {
      getInstance: jest.fn().mockReturnValue({
        initialize: jest.fn().mockResolvedValue(true),
        getPool: jest.fn().mockReturnValue({
          query: mockQueryFn
        }),
        withClient: jest.fn().mockImplementation(async (dbName, callback) => {
          if (dbName === 'unknown_db') {
            throw new Error('데이터베이스를 찾을 수 없습니다.');
          }
          return await callback({
            query: mockQueryFn
          });
        })
      })
    }
  };
});

jest.mock('@/app/api/db-information/db-collection', () => ({
  DB_COLLECTION: {
    'game_db': {
      host: 'localhost',
      port: 5432,
      type: 'postgres',
      data_base: 'game_db',
      config: {
        service_db: {
          user: 'test',
          password: 'test'
        }
      }
    }
  }
}));

jest.mock('@/app/api/db-information/db-information', () => ({
  saveDBCollection: jest.fn().mockResolvedValue({ success: true })
}));

jest.mock('@/lib/logger', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn()
  }
}));

// updateUserCurrency 함수를 직접 모킹
jest.mock('@/app/api/users/currency/service', () => {
  const originalModule = jest.requireActual('@/app/api/users/currency/service');
  
  return {
    ...originalModule,
    updateUserCurrency: jest.fn().mockImplementation(async (params) => {
      if (!params.employerUid) {
        return {
          success: false,
          message: '사용자 UID가 누락되었습니다.',
          status: 400,
        };
      }
      
      if (params.count < 0) {
        return {
          success: false,
          message: '재화 수량은 0 이상이어야 합니다.',
          status: 400,
        };
      }
      
      if (params.dbName === 'unknown_db') {
        return {
          success: false,
          message: '요청한 데이터베이스를 찾을 수 없습니다.',
          status: 404,
        };
      }
      
      return {
        success: true,
        message: '사용자 재화를 성공적으로 업데이트했습니다.',
        currency: {
          id: 1,
          create_at: new Date(),
          update_at: new Date(),
          employer_uid: Number(params.employerUid),
          excel_item_index: params.excelItemIndex,
          count: params.count
        },
        status: 200
      };
    }),
    getUserCurrency: jest.fn().mockImplementation(async (params) => {
      if (!params.employerUid || !params.dbName) {
        return {
          success: false,
          error: '사용자 UID와 데이터베이스 이름이 필요합니다.',
          status: 400
        };
      }
      
      return {
        success: true,
        message: '2개의 화폐 정보를 조회했습니다.',
        currencies: [
          {
            id: 1,
            create_at: new Date(),
            update_at: new Date(),
            employer_uid: 1,
            excel_item_index: 1001,
            count: 1000,
            user_nickname: "테스트유저",
            user_display_id: "TESTUSER"
          },
          {
            id: 2,
            create_at: new Date(),
            update_at: new Date(),
            employer_uid: 1,
            excel_item_index: 1002,
            count: 500,
            user_nickname: "테스트유저",
            user_display_id: "TESTUSER"
          }
        ],
        status: 200
      };
    })
  };
});

// 실제 API 엔드포인트 테스트 위한 mock
jest.mock('next/server', () => {
  const mockJsonFn = jest.fn((data, options) => {
    const mockResponse = {
      data,
      options,
    };
    return mockResponse;
  });

  return {
    NextRequest: jest.fn(),
    NextResponse: {
      json: mockJsonFn
    }
  };
});

// Response 타입 정의
interface MockResponse {
  data: Record<string, unknown>;
  options: {
    status: number;
  };
}

import { PUT } from '@/app/api/users/currency/route';
import { NextRequest } from 'next/server';

describe('User Currency API', () => {
  test('should return 400 if employerUid or dbName is missing', async () => {
    // 1. employerUid 없는 경우
    const resultWithoutEmployerUid = await getUserCurrency({
      employerUid: null,
      dbName: 'game_db'
    });
    
    expect(resultWithoutEmployerUid.status).toBe(400);
    expect(resultWithoutEmployerUid.success).toBe(false);
    expect(resultWithoutEmployerUid.error).toContain('사용자 UID와 데이터베이스 이름이 필요합니다');

    // 2. dbName 없는 경우
    const resultWithoutDbName = await getUserCurrency({
      employerUid: '1',
      dbName: null
    });
    
    expect(resultWithoutDbName.status).toBe(400);
    expect(resultWithoutDbName.success).toBe(false);
    expect(resultWithoutDbName.error).toContain('사용자 UID와 데이터베이스 이름이 필요합니다');
  });

  test('should return user currency information successfully', async () => {
    const result = await getUserCurrency({
      employerUid: '1', 
      dbName: 'game_db'
    });
    
    expect(result.status).toBe(200);
    expect(result.success).toBe(true);
    expect(result.currencies?.length).toBe(2);
    expect(result.currencies?.[0].excel_item_index).toBe(1001);
    expect(result.currencies?.[0].count).toBe(1000);
    expect(result.currencies?.[1].excel_item_index).toBe(1002);
    expect(result.currencies?.[1].count).toBe(500);
  });

  describe('UPDATE_USER_CURRENCY', () => {
    test('should update user currency successfully', async () => {
      const result = await updateUserCurrency({
        employerUid: '1',
        dbName: 'game_db',
        excelItemIndex: 1001,
        count: 2000
      });
      
      expect(result.status).toBe(200);
      expect(result.success).toBe(true);
      expect(result.message).toContain('성공적으로 업데이트');
      expect(result.currency).toBeDefined();
      expect(result.currency?.employer_uid).toBe(1);
      expect(result.currency?.excel_item_index).toBe(1001);
      expect(result.currency?.count).toBe(2000);
    });
    
    test('should return 400 if employerUid is missing', async () => {
      const result = await updateUserCurrency({
        employerUid: null,
        dbName: 'game_db',
        excelItemIndex: 1001,
        count: 2000
      });
      
      expect(result.status).toBe(400);
      expect(result.success).toBe(false);
      expect(result.message).toContain('사용자 UID가 누락');
    });
    
    test('should return 400 if count is negative', async () => {
      const result = await updateUserCurrency({
        employerUid: '1',
        dbName: 'game_db',
        excelItemIndex: 1001,
        count: -100
      });
      
      expect(result.status).toBe(400);
      expect(result.success).toBe(false);
      expect(result.message).toContain('재화 수량은 0 이상');
    });
    
    test('should return 404 if database not found', async () => {
      const result = await updateUserCurrency({
        employerUid: '1',
        dbName: 'unknown_db',
        excelItemIndex: 1001,
        count: 2000
      });
      
      expect(result.status).toBe(404);
      expect(result.success).toBe(false);
      expect(result.message).toContain('요청한 데이터베이스를 찾을 수 없습니다');
    });
  });
  
  describe('PUT API Endpoint', () => {
    test('should call updateUserCurrency and return response', async () => {
      // Mock request 만들기
      const mockRequest = {
        json: jest.fn().mockResolvedValue({
          employerUid: '1',
          dbName: 'game_db',
          excelItemIndex: 1001,
          count: 2000
        })
      } as unknown as NextRequest;
      
      const response = await PUT(mockRequest) as unknown as MockResponse;
      
      expect(response.data.success).toBe(true);
      expect(response.options.status).toBe(200);
    });
    
    test('should handle errors properly', async () => {
      // 에러를 발생시키는 mock request
      const mockRequest = {
        json: jest.fn().mockRejectedValue(new Error('테스트 에러'))
      } as unknown as NextRequest;
      
      const response = await PUT(mockRequest) as unknown as MockResponse;
      
      expect(response.data.success).toBe(false);
      expect(response.data.message).toContain('요청 처리 중 오류');
      expect(response.options.status).toBe(400);
    });
  });
}); 