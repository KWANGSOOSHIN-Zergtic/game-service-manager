import { DBConnectionManager } from '@/lib/db/db-connection-manager';
import { TEST_DB_CONFIGS, TEST_DB_QUERIES } from './test-data/db-connection-pool-test.data';
import { DB_COLLECTION } from '@/app/api/db-information/db-collection';

describe('DBConnectionManager', () => {
    let dbManager: DBConnectionManager;

    beforeAll(() => {
        // 테스트용 DB 설정으로 DB_COLLECTION 초기화
        Object.assign(DB_COLLECTION, TEST_DB_CONFIGS);
    });

    beforeEach(() => {
        dbManager = DBConnectionManager.getInstance();
        dbManager.reset(); // 각 테스트 전에 상태 초기화
    });

    afterEach(async () => {
        await dbManager.closeAllPools(); // 각 테스트 후 모든 연결 풀 정리
    });

    describe('초기화 및 연결 풀 관리', () => {
        it('싱글톤 인스턴스가 정상적으로 생성되어야 함', () => {
            const instance1 = DBConnectionManager.getInstance();
            const instance2 = DBConnectionManager.getInstance();
            expect(instance1).toBe(instance2);
        });

        it('초기화가 성공적으로 수행되어야 함', async () => {
            const result = await dbManager.initialize();
            expect(result).toBe(true);
            expect(dbManager.isDBInitialized()).toBe(true);
        });

        it('이미 초기화된 경우 true를 반환해야 함', async () => {
            await dbManager.initialize();
            const result = await dbManager.initialize();
            expect(result).toBe(true);
        });

        it('초기화 중에는 false를 반환해야 함', async () => {
            // 초기화 프로세스 시작
            const initPromise = dbManager.initialize();
            // 동시에 다른 초기화 시도
            const result = await dbManager.initialize();
            expect(result).toBe(false);
            // 첫 번째 초기화 완료 대기
            await initPromise;
        });
    });

    describe('연결 풀 작업', () => {
        beforeEach(async () => {
            await dbManager.initialize();
        });

        it('존재하는 DB에 대한 연결 풀을 가져올 수 있어야 함', async () => {
            const pool = dbManager.getPool('test_football_service');
            expect(pool).toBeDefined();
            
            // 연결 테스트
            const client = await pool.connect();
            const result = await client.query('SELECT NOW()');
            expect(result.rows).toBeDefined();
            client.release();
        });

        it('존재하지 않는 DB에 대해 에러를 발생시켜야 함', () => {
            expect(() => {
                dbManager.getPool('non_existent_db');
            }).toThrow();
        });

        it('테이블 생성 및 쿼리 실행이 정상적으로 동작해야 함', async () => {
            const pool = dbManager.getPool('test_football_service');
            const testName = 'test_entry';

            try {
                // 테스트 테이블 생성
                await pool.query(TEST_DB_QUERIES.createTestTable);
                
                // 데이터 삽입
                const insertResult = await pool.query(TEST_DB_QUERIES.insertTestData, [testName]);
                expect(insertResult.rows[0].name).toBe(testName);
                
                // 데이터 조회
                const selectResult = await pool.query(TEST_DB_QUERIES.selectTestData, [testName]);
                expect(selectResult.rows[0].name).toBe(testName);
            } finally {
                // 테스트 테이블 삭제
                await pool.query(TEST_DB_QUERIES.dropTestTable);
            }
        });

        it('동일한 DB에 대해 같은 연결 풀을 재사용해야 함', () => {
            const pool1 = dbManager.getPool('test_football_service');
            const pool2 = dbManager.getPool('test_football_service');
            expect(pool1).toBe(pool2);
        });

        it('여러 연결에서 동시에 쿼리를 실행할 수 있어야 함', async () => {
            const pool = dbManager.getPool('test_football_service');
            const numberOfQueries = 5;
            
            // 여러 쿼리를 동시에 실행
            const queries = Array(numberOfQueries).fill(null).map(() => 
                pool.query('SELECT NOW()')
            );
            
            const results = await Promise.all(queries);
            
            // 모든 쿼리가 성공적으로 실행되었는지 확인
            results.forEach(result => {
                expect(result.rows).toBeDefined();
                expect(result.rows.length).toBeGreaterThan(0);
            });
        });

        it('트랜잭션이 정상적으로 동작해야 함', async () => {
            const pool = dbManager.getPool('test_football_service');
            const client = await pool.connect();
            
            try {
                await client.query('BEGIN');
                
                // 테스트 테이블 생성
                await client.query(TEST_DB_QUERIES.createTestTable);
                
                // 데이터 삽입
                const testName = 'transaction_test';
                await client.query(TEST_DB_QUERIES.insertTestData, [testName]);
                
                // 의도적으로 에러 발생
                await client.query('SELECT invalid_column FROM non_existent_table');
                
                await client.query('COMMIT');
            } catch {
                await client.query('ROLLBACK');
                
                // 롤백 후 데이터가 없는지 확인
                const result = await client.query(TEST_DB_QUERIES.selectTestData, ['transaction_test']);
                expect(result.rows.length).toBe(0);
            } finally {
                await client.query(TEST_DB_QUERIES.dropTestTable);
                client.release();
            }
        });
    });

    describe('연결 풀 종료', () => {
        beforeEach(async () => {
            await dbManager.initialize();
        });

        it('모든 연결 풀이 정상적으로 종료되어야 함', async () => {
            // 먼저 몇 개의 연결을 생성
            const pool1 = dbManager.getPool('test_football_service');
            const pool2 = dbManager.getPool('test_game_service');
            
            // 연결이 활성화되어 있는지 확인
            expect(pool1).toBeDefined();
            expect(pool2).toBeDefined();
            
            // 모든 연결 종료
            await dbManager.closeAllPools();
            
            // 연결 풀이 정리되었는지 확인
            expect(() => {
                dbManager.getPool('test_football_service');
            }).toThrow();
            expect(() => {
                dbManager.getPool('test_game_service');
            }).toThrow();
        });

        it('연결 풀 종료 후 초기화 상태가 리셋되어야 함', async () => {
            await dbManager.closeAllPools();
            expect(dbManager.isDBInitialized()).toBe(false);
        });

        it('연결 풀 종료 후 재초기화가 가능해야 함', async () => {
            await dbManager.closeAllPools();
            expect(dbManager.isDBInitialized()).toBe(false);
            
            const result = await dbManager.initialize();
            expect(result).toBe(true);
            expect(dbManager.isDBInitialized()).toBe(true);
            
            const pool = dbManager.getPool('test_football_service');
            expect(pool).toBeDefined();
        });
    });
}); 