import { DataSource } from 'typeorm';
import { DB_QUERIES } from '../db-query/queries';
import { updateDBCollection } from './db_collection';

// DB 설정 정보 인터페이스
export interface DBConfig {
    index: number;
    name: string;
    type: string;
    host: string;
    port: number;
    data_base: string;
    config: Record<string, unknown>;
}

// DB 정보 저장 결과 인터페이스
interface CollectionResult {
    success: boolean;
    message?: string;
    error?: string;
    tables?: DBConfig[];
}

// DB 정보를 가져오고 저장하는 함수
export const saveDBCollection = async (): Promise<CollectionResult> => {
    const AppDataSource = new DataSource({
        type: 'postgres',
        host: process.env.DEV_DB_HOST,
        port: parseInt(process.env.DB_PORT || '5432'),
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        synchronize: false,
        logging: true,
    });

    try {
        await AppDataSource.initialize();
        
        // DB 정보 조회
        const dbConfigs = await AppDataSource.query(DB_QUERIES.SELECT_SERVICE_DB_COLLECTION.query);
        
        // DB 정보를 TypeScript 변수로 저장
        updateDBCollection(dbConfigs);
        
        await AppDataSource.destroy();
        
        return {
            success: true,
            message: 'DB 정보가 성공적으로 저장되었습니다.',
            tables: dbConfigs
        };
    } catch (error) {
        console.error('Error in saveDBCollection:', error);
        return {
            success: false,
            message: 'DB 정보 저장 실패',
            error: error instanceof Error ? error.message : '알 수 없는 오류'
        };
    }
}; 