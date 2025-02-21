import { NextRequest } from 'next/server';
import { GET as getDBQuery } from '@/app/api/db-query/route';
import { GET as getDBList } from '@/app/api/db-list-load/route';
import { GET as getUserSearch } from '@/app/api/user-search/route';
import { TEST_DB_CONFIGS, TEST_DB_QUERIES, TEST_USER_DATA } from './test-data/db-connection-pool-test.data';
import { DB_COLLECTION } from '@/app/api/db-information/db-collection';
import { DBConnectionManager } from '@/lib/db/db-connection-manager';

describe('API Routes Tests', () => {
    let dbManager: DBConnectionManager;
    let originalDBConfigs: typeof DB_COLLECTION;

    beforeAll(() => {
        // 원본 DB 설정 백업
        originalDBConfigs = { ...DB_COLLECTION };
        // 테스트용 DB 설정으로 DB_COLLECTION 초기화
        Object.assign(DB_COLLECTION, TEST_DB_CONFIGS);
        dbManager = DBConnectionManager.getInstance();
    });

    afterAll(() => {
        // 원본 DB 설정 복원
        Object.assign(DB_COLLECTION, originalDBConfigs);
    });

    beforeEach(async () => {
        await dbManager.initialize();
    });

    afterEach(async () => {
        await dbManager.closeAllPools();
        dbManager.reset();
    });

    describe('DB Query Route', () => {
        it('DB 테이블 목록을 정상적으로 조회해야 함', async () => {
            const url = new URL('http://localhost/api/db-query?dbName=test_football_service');
            const request = new Request(url);
            const response = await getDBQuery(request);
            const data = await response.json();

            expect(data.success).toBe(true);
            expect(data.tables).toBeDefined();
            expect(Array.isArray(data.tables)).toBe(true);
        });

        it('DB 이름이 없는 경우 에러를 반환해야 함', async () => {
            const url = new URL('http://localhost/api/db-query');
            const request = new Request(url);
            const response = await getDBQuery(request);
            const data = await response.json();

            expect(data.success).toBe(false);
            expect(data.error).toBe('DB 이름이 필요합니다.');
        });

        it('잘못된 DB 설정으로 연결 시도 시 에러를 반환해야 함', async () => {
            // 잘못된 DB 설정 추가
            Object.assign(DB_COLLECTION, {
                'invalid_db': {
                    ...TEST_DB_CONFIGS.test_football_service,
                    name: 'invalid_db',
                    host: 'non_existent_host',
                }
            });

            const url = new URL('http://localhost/api/db-query?dbName=invalid_db');
            const request = new Request(url);
            const response = await getDBQuery(request);
            const data = await response.json();

            expect(data.success).toBe(false);
            expect(data.error).toBeDefined();
        });
    });

    describe('DB List Load Route', () => {
        it('DB 목록을 정상적으로 조회해야 함', async () => {
            const response = await getDBList();
            const data = await response.json();

            expect(data.success).toBe(true);
            expect(data.tables).toBeDefined();
            expect(Array.isArray(data.tables)).toBe(true);
        });

        it('DB 연결 실패 시 적절한 에러 메시지를 반환해야 함', async () => {
            // DB 설정 임시 변경
            const originalConfig = { ...DB_COLLECTION['football_service'] };
            Object.assign(DB_COLLECTION['football_service'], {
                host: 'invalid_host'
            });

            const response = await getDBList();
            const data = await response.json();

            expect(data.success).toBe(false);
            expect(data.error).toContain('연결');

            // DB 설정 복원
            Object.assign(DB_COLLECTION['football_service'], originalConfig);
        });
    });

    describe('User Search Route', () => {
        beforeEach(async () => {
            // 테스트 테이블 및 사용자 데이터 생성
            const pool = dbManager.getPool('test_football_service');
            await pool.query(TEST_DB_QUERIES.createTestTable);
            await pool.query(TEST_DB_QUERIES.insertTestData, [TEST_USER_DATA.login_id]);
        });

        afterEach(async () => {
            // 테스트 테이블 정리
            const pool = dbManager.getPool('test_football_service');
            await pool.query(TEST_DB_QUERIES.dropTestTable);
        });

        it('사용자 정보를 정상적으로 조회해야 함', async () => {
            const url = new URL('http://localhost/api/user-search');
            url.searchParams.set('dbName', 'test_football_service');
            url.searchParams.set('userId', TEST_USER_DATA.login_id);
            
            const request = new NextRequest(url);
            const response = await getUserSearch(request);
            const data = await response.json();

            expect(data.success).toBe(true);
            expect(data.data).toBeDefined();
        });

        it('필수 파라미터가 없는 경우 에러를 반환해야 함', async () => {
            const url = new URL('http://localhost/api/user-search');
            const request = new NextRequest(url);
            const response = await getUserSearch(request);
            const data = await response.json();

            expect(data.success).toBe(false);
            expect(data.error).toBe('Database name and user ID are required');
        });

        it('트랜잭션 롤백이 정상적으로 동작해야 함', async () => {
            const pool = dbManager.getPool('test_football_service');
            const client = await pool.connect();
            
            try {
                await client.query('BEGIN');
                
                // 잘못된 쿼리 실행
                await client.query('INSERT INTO non_existent_table VALUES ($1)', [TEST_USER_DATA.login_id]);
                
                await client.query('COMMIT');
                throw new Error('트랜잭션이 실패해야 함');
            } catch (error) {
                await client.query('ROLLBACK');
                
                // 원본 데이터가 그대로 있는지 확인
                const result = await client.query(TEST_DB_QUERIES.selectTestData, [TEST_USER_DATA.login_id]);
                expect(result.rows.length).toBe(1);
            } finally {
                client.release();
            }
        });

        it('동시 요청 처리가 정상적으로 동작해야 함', async () => {
            const numberOfRequests = 5;
            const requests = Array(numberOfRequests).fill(null).map(() => {
                const url = new URL('http://localhost/api/user-search');
                url.searchParams.set('dbName', 'test_football_service');
                url.searchParams.set('userId', TEST_USER_DATA.login_id);
                return getUserSearch(new NextRequest(url));
            });

            const responses = await Promise.all(requests);
            const results = await Promise.all(responses.map(r => r.json()));

            results.forEach(data => {
                expect(data.success).toBe(true);
                expect(data.data).toBeDefined();
            });
        });
    });
}); 