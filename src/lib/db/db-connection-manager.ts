import { Pool, PoolClient } from 'pg';
import { logger } from '@/lib/logger';
import { DBConfig } from './types';
import { DB_COLLECTION } from '@/app/api/db-information/db-collection';
import { saveDBCollection } from '@/app/api/db-information/db-information';
import { validateEnv, getDBEnv } from '@/lib/env';

declare global {
    // eslint-disable-next-line no-var
    var __DB_MANAGER__: DBConnectionManager;
}

export interface DBConnectionConfig {
    [key: string]: DBConfig;
}

interface PoolStats {
    totalCount: number;
    idleCount: number;
    waitingCount: number;
    name: string;
}

interface PoolHealthStatus {
    [key: string]: boolean;
}

interface PoolStatsMap {
    [key: string]: PoolStats;
}

export class DBConnectionManager {
    private DB_CONNECT_ARRAY: { [key: string]: Pool } = {};
    private isInitialized: boolean = false;
    private isInitializing: boolean = false;
    private readonly MAX_RETRY_ATTEMPTS = 3;
    private readonly RETRY_DELAY_MS = 5000;

    private constructor() {
        // 싱글톤 인스턴스 생성 시 로깅
        logger.info('[DB Manager] New instance created');
    }

    public static getInstance(): DBConnectionManager {
        if (!global.__DB_MANAGER__) {
            global.__DB_MANAGER__ = new DBConnectionManager();
            logger.info('[DB Manager] Global instance initialized');
        }
        return global.__DB_MANAGER__;
    }

    private async delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    private logDBDetails(): void {
        console.log('\n=== DB 연결 풀 상태 ===');
        console.log('현재 시간:', new Date().toLocaleString());
        
        const connectedDbs = Object.keys(this.DB_CONNECT_ARRAY);
        
        logger.info('[DB Manager] Connected Database Pools:');
        console.log('\n[연결된 DB 풀 목록]');
        
        connectedDbs.forEach(dbName => {
            const config = DB_COLLECTION[dbName];
            logger.info(`  - DB Name: ${dbName}`);
            logger.info(`    Host: ${config.host}`);
            logger.info(`    Port: ${config.port}`);
            logger.info(`    Type: ${config.type}`);
            logger.info(`    Database: ${config.data_base}`);
            logger.info('    ----------------------');

            console.log(`\n▶ DB 이름: ${dbName}`);
            console.log(`  ├ 호스트: ${config.host}`);
            console.log(`  ├ 포트: ${config.port}`);
            console.log(`  ├ 타입: ${config.type}`);
            console.log(`  └ 데이터베이스: ${config.data_base}`);
        });
        console.log('\n=== DB 연결 풀 상태 완료 ===\n');
    }

    // 1. DB 정보 업데이트
    private async updateDBInformation(): Promise<boolean> {
        try {
            logger.info('[DB Manager] DB 정보 업데이트 시작');
            
            // 환경 변수 검증
            const isEnvValid = validateEnv();
            if (!isEnvValid) {
                logger.error('[DB Manager] 환경 변수가 올바르게 설정되지 않았습니다.');
                return false;
            }
            
            // 환경 변수 상태 로깅
            const dbEnv = getDBEnv();
            logger.info('[DB Manager] DB 연결 정보:', {
                host: dbEnv.host,
                port: dbEnv.port,
                database: dbEnv.database
            });
            
            const result = await saveDBCollection();
            
            if (!result.success) {
                logger.error('[DB Manager] DB 정보 업데이트 실패:', {
                    error: result.error,
                    timestamp: new Date().toISOString(),
                    details: 'DB Collection 정보를 저장하는데 실패했습니다.'
                });
                return false;
            }
            
            // DB Collection이 비어있는지 확인
            if (Object.keys(DB_COLLECTION).length === 0) {
                logger.error('[DB Manager] DB 정보 업데이트 실패: DB Collection이 비어있습니다.');
                return false;
            }
            
            logger.info('[DB Manager] DB 정보 업데이트 성공', {
                dbCount: Object.keys(DB_COLLECTION).length,
                dbList: Object.keys(DB_COLLECTION)
            });
            return true;
        } catch (error) {
            logger.error('[DB Manager] DB 정보 업데이트 중 예외 발생:', {
                error: error instanceof Error ? error.message : 'Unknown error',
                stack: error instanceof Error ? error.stack : undefined,
                timestamp: new Date().toISOString()
            });
            logger.error('[DB Manager] DB 정보 업데이트 중 오류:', error instanceof Error ? error.message : String(error));
            return false;
        }
    }

    // 2. 단일 DB 연결 풀 초기화
    private async initializePool(dbName: string, config: DBConfig): Promise<boolean> {
        try {
            // 설정 유효성 검사
            if (!config.config?.service_db?.user || !config.config?.service_db?.password) {
                logger.error(`[DB Manager] ${dbName} 설정 오류: DB 인증 정보가 누락되었습니다.`);
                return false;
            }

            // 기존 연결이 있다면 종료
            if (this.DB_CONNECT_ARRAY[dbName]) {
                logger.info(`[DB Manager] ${dbName}의 기존 연결 풀 종료`);
                try {
                    await this.DB_CONNECT_ARRAY[dbName].end();
                } catch (error) {
                    logger.warn(`[DB Manager] ${dbName}의 기존 연결 풀 종료 중 오류:`, error instanceof Error ? error.message : String(error));
                }
            }

            // 새로운 연결 풀 생성 with 최적화 설정
            const pool = new Pool({
                user: config.config.service_db.user,
                host: config.host,
                database: config.data_base,
                password: config.config.service_db.password,
                port: config.port,
                // 연결 풀 최적화 설정
                max: 20,                        // 최대 클라이언트 수
                idleTimeoutMillis: 30000,       // 유휴 연결 타임아웃
                connectionTimeoutMillis: 2000,   // 연결 타임아웃
                maxUses: 7500,                  // 연결당 최대 재사용 횟수
                keepAlive: true,                // TCP Keepalive 활성화
                allowExitOnIdle: true           // 모든 연결이 유휴 상태일 때 풀 종료 허용
            });

            // 쿼리 타임아웃 설정
            pool.on('connect', (client) => {
                client.query('SET statement_timeout = 10000');  // 10초 타임아웃
            });

            // 먼저 연결 풀을 저장
            this.DB_CONNECT_ARRAY[dbName] = pool;

            // 연결 테스트
            logger.info(`[DB Manager] ${dbName} 연결 테스트 시작`);
            const client = await pool.connect();
            const testResult = await client.query('SELECT NOW()');
            client.release();

            if (!testResult.rows[0]) {
                throw new Error('연결 테스트 쿼리 실행 실패');
            }

            // 연결 풀 이벤트 핸들러 등록
            pool.on('connect', () => {
                try {
                    const stats = this.getPoolStats(dbName);
                    logger.debug(`[DB Pool] New client connected to ${dbName}`, {
                        timestamp: new Date().toISOString(),
                        poolStats: stats
                    });
                } catch (error) {
                    logger.warn(`[DB Pool] Failed to get pool stats for ${dbName}:`, error instanceof Error ? error.message : String(error));
                }
            });

            pool.on('error', (err) => {
                try {
                    const stats = this.getPoolStats(dbName);
                    logger.info(`[DB Pool] ${dbName} pool error:`, {
                        error: err.message,
                        stack: err.stack,
                        timestamp: new Date().toISOString(),
                        poolStats: stats
                    });
                } catch (error) {
                    logger.error(`[DB Pool] Error in ${dbName} pool:`, {
                        error: error instanceof Error ? error.message : String(error),
                        timestamp: new Date().toISOString()
                    });
                }
                this.handlePoolError(dbName, err);
            });

            logger.info(`[DB Manager] ${dbName} 연결 풀 초기화 성공`, {
                timestamp: new Date().toISOString(),
                poolStats: this.getPoolStats(dbName)
            });
            return true;

        } catch (error) {
            logger.error(`[DB Manager] ${dbName} 연결 풀 초기화 실패:`, {
                error: error instanceof Error ? error.message : 'Unknown error',
                stack: error instanceof Error ? error.stack : undefined,
                config: {
                    host: config.host,
                    port: config.port,
                    database: config.data_base,
                    user: config.config.service_db.user
                },
                timestamp: new Date().toISOString()
            });
            
            if (this.DB_CONNECT_ARRAY[dbName]) {
                try {
                    await this.DB_CONNECT_ARRAY[dbName].end();
                } catch (endError) {
                    logger.warn(`[DB Manager] ${dbName} 연결 풀 정리 중 오류:`, endError instanceof Error ? endError.message : String(endError));
                }
                delete this.DB_CONNECT_ARRAY[dbName];
            }
            
            throw error;
        }
    }

    private async handlePoolError(dbName: string, error: Error): Promise<void> {
        logger.error(`[DB Pool] Handling error for ${dbName}:`, {
            error: error instanceof Error ? error.message : String(error),
            timestamp: new Date().toISOString()
        });

        try {
            // 연결 풀 재초기화 시도
            const config = DB_COLLECTION[dbName];
            if (config) {
                await this.initializePool(dbName, config);
                logger.info(`[DB Pool] Successfully reinitialized pool for ${dbName}`);
            }
        } catch (reinitError) {
            logger.error(`[DB Pool] Failed to reinitialize pool for ${dbName}:`, {
                error: reinitError instanceof Error ? reinitError.message : String(reinitError),
                timestamp: new Date().toISOString()
            });
        }
    }

    // 3. 전체 초기화 프로세스
    public async initialize(): Promise<boolean> {
        // 이미 초기화된 경우 즉시 반환
        if (this.isInitialized && Object.keys(this.DB_CONNECT_ARRAY).length > 0) {
            logger.info('[DB Manager] Already initialized');
            return true;
        }

        // 초기화 중인 경우 대기
        if (this.isInitializing) {
            logger.info('[DB Manager] Initialization in progress');
            return false;
        }

        this.isInitializing = true;
        let retryCount = 0;

        try {
            while (retryCount < this.MAX_RETRY_ATTEMPTS) {
                try {
                    const updated = await this.updateDBInformation();
                    if (!updated) {
                        throw new Error('DB 정보 업데이트 실패');
                    }

                    for (const [dbName, config] of Object.entries(DB_COLLECTION)) {
                        await this.initializePool(dbName, config);
                    }

                    this.logDBDetails();
                    this.isInitialized = true;
                    this.isInitializing = false;
                    return true;
                } catch (error) {
                    retryCount++;
                    logger.error(`[DB Manager] 초기화 시도 ${retryCount} 실패:`, error instanceof Error ? error.message : String(error));
                    if (retryCount === this.MAX_RETRY_ATTEMPTS) {
                        throw error;
                    }
                    await this.delay(this.RETRY_DELAY_MS);
                }
            }
            return false;
        } catch (error) {
            this.isInitializing = false;
            throw error;
        }
    }

    public getPool(dbName: string): Pool {
        const pool = this.DB_CONNECT_ARRAY[dbName];
        if (!pool) {
            logger.error(`[DB Manager] DB ${dbName}에 대한 연결 풀을 찾을 수 없음`);
            throw new Error(`데이터베이스 ${dbName}에 대한 연결을 찾을 수 없습니다.`);
        }
        return pool;
    }

    public async closeAllPools(): Promise<void> {
        logger.info('[DB Manager] 모든 DB 연결 풀 종료 시작');

        for (const [dbName, pool] of Object.entries(this.DB_CONNECT_ARRAY)) {
            try {
                await pool.end();
                delete this.DB_CONNECT_ARRAY[dbName];
                logger.info(`[DB Manager] ${dbName} 연결 풀 종료 성공`);
            } catch (error) {
                logger.error(`[DB Manager] ${dbName} 연결 풀 종료 중 오류:`, error instanceof Error ? error.message : String(error));
            }
        }

        this.isInitialized = false;
        logger.info('[DB Manager] 모든 DB 연결 풀 종료 완료');
    }

    public isDBInitialized(): boolean {
        return this.isInitialized && Object.keys(this.DB_CONNECT_ARRAY).length > 0;
    }

    public reset(): void {
        this.isInitialized = false;
        this.isInitializing = false;
    }

    public async getClient(dbName: string): Promise<PoolClient> {
        const pool = this.getPool(dbName);
        const client = await pool.connect();
        
        const release = client.release;
        client.release = () => {
            client.release = release;
            logger.debug(`[DB Pool] Client released back to ${dbName} pool`);
            return release.apply(client);
        };
        
        return client;
    }

    public async withClient<T>(dbName: string, callback: (client: PoolClient) => Promise<T>): Promise<T> {
        const client = await this.getClient(dbName);
        try {
            return await callback(client);
        } finally {
            client.release();
        }
    }

    public async withTransaction<T>(dbName: string, callback: (client: PoolClient) => Promise<T>): Promise<T> {
        const client = await this.getClient(dbName);
        try {
            await client.query('BEGIN');
            const result = await callback(client);
            await client.query('COMMIT');
            return result;
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    public getPoolStats(dbName: string): PoolStats {
        const pool = this.getPool(dbName);
        return {
            totalCount: pool.totalCount,
            idleCount: pool.idleCount,
            waitingCount: pool.waitingCount,
            name: dbName
        };
    }

    public getAllPoolStats(): PoolStatsMap {
        const stats: PoolStatsMap = {};
        for (const dbName of Object.keys(this.DB_CONNECT_ARRAY)) {
            stats[dbName] = this.getPoolStats(dbName);
        }
        return stats;
    }

    private async checkPoolHealth(dbName: string): Promise<boolean> {
        try {
            const client = await this.getClient(dbName);
            await client.query('SELECT 1');
            client.release();
            return true;
        } catch (error) {
            logger.error(`[DB Pool] Health check failed for ${dbName}:`, error instanceof Error ? error.message : String(error));
            return false;
        }
    }

    public async checkAllPoolsHealth(): Promise<PoolHealthStatus> {
        const healthStatus: PoolHealthStatus = {};
        for (const dbName of Object.keys(this.DB_CONNECT_ARRAY)) {
            healthStatus[dbName] = await this.checkPoolHealth(dbName);
        }
        return healthStatus;
    }
}
