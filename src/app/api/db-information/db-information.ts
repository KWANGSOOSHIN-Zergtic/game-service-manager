import { DataSource } from 'typeorm';
import { DB_QUERIES } from '../db-query/queries';
import { updateDBCollection, DB_COLLECTION } from './db-collection';

// Service DB 설정 인터페이스
export interface ServiceDBConfig {
    user: string;
    password: string;
}

// DB 설정 정보 인터페이스
export interface DBConfig {
    index: number;
    name: string;
    type: string;
    host: string;
    port: number;
    data_base: string;
    config: {
        service_db: ServiceDBConfig;
    };
}

// DB 정보 저장 결과 인터페이스
interface CollectionResult {
    success: boolean;
    message?: string;
    error?: string;
    tables?: DBConfig[];
}

// DB 리스트 인터페이스
export interface DBListInfo {
    index: number;
    name: string;
    description: string;
}

// DB 리스트 조회 결과 인터페이스
interface DBListResult {
    success: boolean;
    message?: string;
    error?: string;
    dbList?: DBListInfo[];
}

// DB 리스트 조회 함수
export const loadDBList = async (): Promise<DBListResult> => {
    console.log('\n========== DB 리스트 조회 시작 ==========');
    
    // football_service 데이터베이스를 기본으로 사용
    const dbConfig = DB_COLLECTION['football_service'];
    if (!dbConfig) {
        console.error('football_service DB 설정을 찾을 수 없음');
        return {
            success: false,
            message: 'DB 리스트 조회 실패',
            error: 'football_service DB 설정을 찾을 수 없습니다.'
        };
    }

    const AppDataSource = new DataSource({
        type: 'postgres',
        host: dbConfig.host,
        port: Number(dbConfig.port || '5432'),
        username: dbConfig.config.service_db.user,
        password: dbConfig.config.service_db.password,
        database: dbConfig.data_base,
        synchronize: false,
        logging: true,
    });

    try {
        await AppDataSource.initialize();
        console.log('1. DB 연결 성공');
        
        // DB 리스트 조회
        const dbList = await AppDataSource.query(DB_QUERIES.SELECT_DB_LIST.query);
        console.log('2. DB 리스트 조회 결과:', dbList);
        
        await AppDataSource.destroy();
        console.log('3. DB 연결 종료');
        
        console.log('========== DB 리스트 조회 완료 ==========\n');
        return {
            success: true,
            message: 'DB 리스트가 성공적으로 조회되었습니다.',
            dbList
        };
    } catch (error) {
        console.error('DB 리스트 조회 실패:', error);
        return {
            success: false,
            message: 'DB 리스트 조회 실패',
            error: error instanceof Error ? error.message : '알 수 없는 오류'
        };
    }
};

// DB 정보를 가져오고 저장하는 함수
export const saveDBCollection = async (): Promise<CollectionResult> => {
    console.log('\n========== DB Collection 저장 시작 ==========');
    
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
        console.log('1. DB 연결 정보:', {
            host: process.env.DEV_DB_HOST,
            port: process.env.DB_PORT,
            database: process.env.DB_NAME
        });

        await AppDataSource.initialize();
        console.log('2. DB 연결 성공');
        
        // DB 정보 조회
        console.log('3. DB 정보 조회 쿼리:', DB_QUERIES.SELECT_SERVICE_DB_COLLECTION.query);
        const dbConfigs = await AppDataSource.query(DB_QUERIES.SELECT_SERVICE_DB_COLLECTION.query);
        console.log('4. DB 정보 조회 결과:', JSON.stringify(dbConfigs, null, 2));
        
        // DB 정보를 TypeScript 변수로 저장
        console.log('5. DB Collection 업데이트 시작');
        updateDBCollection(dbConfigs);
        
        await AppDataSource.destroy();
        console.log('6. DB 연결 종료');
        
        console.log('========== DB Collection 저장 완료 ==========\n');
        return {
            success: true,
            message: 'DB 정보가 성공적으로 저장되었습니다.',
            tables: dbConfigs
        };
    } catch (error) {
        console.error('DB Collection 저장 실패:', error);
        return {
            success: false,
            message: 'DB 정보 저장 실패',
            error: error instanceof Error ? error.message : '알 수 없는 오류'
        };
    }
}; 