import { getUserCurrency } from '@/app/api/user/currency/service';

// 모킹된 모듈들 설정
jest.mock('@/lib/db/db-connection-manager', () => {
  const mockPool = {
    query: jest.fn()
  };
  
  return {
    DBConnectionManager: {
      getInstance: jest.fn().mockReturnValue({
        initialize: jest.fn().mockResolvedValue(true),
        getPool: jest.fn().mockReturnValue(mockPool),
        withClient: jest.fn().mockImplementation(async (dbName, callback) => {
          return await callback({
            query: jest.fn().mockResolvedValue({
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
            })
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
}); 