import { InitializerFunction, InitializationResult } from './types';
import { DB_COLLECTION } from '@/app/api/db-infomation/db-collection';
import { saveDBCollection, loadDBList } from '@/app/api/db-infomation/db-infomation';
import { logger } from '@/lib/logger';

export const databaseInitializer: InitializerFunction = {
    name: 'Database Initialization',
    priority: 1, // 데이터베이스는 가장 먼저 초기화되어야 함
    initialize: async (): Promise<InitializationResult> => {
        try {
            logger.info('=== Database Collection Initialization Start ===');
            
            // DB 리스트 조회
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

            // DB Collection 초기화
            logger.info('\n[DB Init] Initializing DB Collection...');
            logger.info('Current DB Collection size:', Object.keys(DB_COLLECTION).length);
            
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

                logger.info('[DB Init] Verifying DB Collection after load...');
                const finalCollectionSize = Object.keys(DB_COLLECTION).length;
                logger.info('[DB Init] Final DB Collection size:', finalCollectionSize);
                
                if (finalCollectionSize === 0) {
                    logger.warn('[DB Init] Warning: DB Collection is still empty after initialization');
                }

                return {
                    success: true,
                    message: `Database collection initialized successfully with ${finalCollectionSize} databases`
                };
            }

            logger.info('[DB Init] DB Collection already initialized');
            logger.info('[DB Init] Current databases:', Object.keys(DB_COLLECTION).join(', '));
            return {
                success: true,
                message: `Database collection already initialized with ${Object.keys(DB_COLLECTION).length} databases`
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