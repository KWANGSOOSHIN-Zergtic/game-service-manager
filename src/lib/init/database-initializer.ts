import { InitializerFunction, InitializationResult } from './types';
import { DB_COLLECTION } from '@/app/api/db-information/db-collection';
import { saveDBCollection, loadDBList } from '@/app/api/db-information/db-information';
import { logger } from '@/lib/logger';
import { Pool } from 'pg';

const pools: { [key: string]: Pool } = {};

export const databaseInitializer: InitializerFunction = {
    name: 'Database Initialization',
    priority: 1,
    initialize: async (): Promise<InitializationResult> => {
        try {
            logger.info('=== Database Collection Initialization Start ===');
            
            // DB Collection 초기화를 먼저 수행
            logger.info('\n[DB Init] Initializing DB Collection...');
            logger.info('Current DB Collection size:', Object.keys(DB_COLLECTION).length);
            
            // DB Collection이 비어있으면 먼저 초기화
            if (Object.keys(DB_COLLECTION).length === 0) {
                logger.info('[DB Init] Collection is empty, starting database load process...');
                const result = await saveDBCollection();
                
                if (!result.success) {
                    logger.error('[DB Init] Failed to save DB Collection:', result.error || result.message);
                    throw new Error(result.error || result.message);
                }

                logger.info('[DB Init] Database load completed successfully');
                logger.info('[DB Init] Loaded databases:', result.tables?.length || 0);
                if (result.tables && result.tables.length > 0) {
                    logger.info('[DB Init] Database configurations:');
                    result.tables.forEach(db => {
                        logger.info(`  - [${db.index}] ${db.name} (${db.type}): ${db.host}:${db.port}`);
                    });
                }
            }

            // DB Collection이 초기화된 후 DB 리스트 조회
            logger.info('[DB Init] Loading database list...');
            const dbListResult = await loadDBList();
            
            if (!dbListResult.success) {
                logger.error('[DB Init] Failed to load DB list:', dbListResult.error);
                throw new Error(dbListResult.error || dbListResult.message);
            }

            logger.info('[DB Init] DB List loaded successfully');
            logger.info('[DB Init] Found databases:', dbListResult.dbList?.length || 0);
            if (dbListResult.dbList && dbListResult.dbList.length > 0) {
                logger.info('[DB Init] Database list:');
                dbListResult.dbList.forEach(db => {
                    logger.info(`  - [${db.index}] ${db.name}: ${db.description}`);
                });
            }

            logger.info('[DB Init] Verifying final DB Collection state...');
            const finalCollectionSize = Object.keys(DB_COLLECTION).length;
            logger.info('[DB Init] Final DB Collection size:', finalCollectionSize);
            
            if (finalCollectionSize === 0) {
                logger.warn('[DB Init] Warning: DB Collection is still empty after initialization');
                throw new Error('DB Collection initialization failed: Collection is empty');
            }

            return {
                success: true,
                message: `Database initialization completed successfully with ${finalCollectionSize} databases`
            };

        } catch (error) {
            logger.error('=== Database Collection Initialization Failed ===');
            logger.error('Error details:', error instanceof Error ? error.message : error);
            logger.error('Current DB Collection state:', {
                size: Object.keys(DB_COLLECTION).length,
                isEmpty: Object.keys(DB_COLLECTION).length === 0
            });
            return {
                success: false,
                message: 'Failed to initialize database collection',
                error: error as Error
            };
        } finally {
            logger.info('=== Database Collection Initialization End ===');
        }
    }
};

export async function initializeDatabase(dbName: string, config: any) {
  try {
    if (pools[dbName]) {
      await pools[dbName].end();
    }

    const pool = new Pool(config);
    pools[dbName] = pool;

    // Test connection
    const client = await pool.connect();
    await client.query('SELECT NOW()');
    client.release();

    logger.info(`Successfully connected to database: ${dbName}`);
    return true;
  } catch (error) {
    logger.error(`Failed to initialize database ${dbName}:`, error);
    if (pools[dbName]) {
      delete pools[dbName];
    }
    throw error;
  }
}

export async function getConnection(dbName: string): Promise<Pool> {
  const pool = pools[dbName];
  if (!pool) {
    throw new Error(`No connection pool found for database: ${dbName}`);
  }
  return pool;
}

export async function closeAllConnections() {
  for (const dbName in pools) {
    try {
      await pools[dbName].end();
      delete pools[dbName];
    } catch (error) {
      logger.error(`Error closing connection for ${dbName}:`, error);
    }
  }
} 