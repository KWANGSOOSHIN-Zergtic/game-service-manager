import { DBConfig } from './db-infomation';

// DB 서버 정보를 JSON 구조로 저장
export const DB_COLLECTION: { [key: string]: DBConfig } = {};

// DB 정보 업데이트 함수
export const updateDBCollection = (dbConfigs: DBConfig[]): void => {
    // 기존 컬렉션 초기화
    Object.keys(DB_COLLECTION).forEach(key => {
        delete DB_COLLECTION[key];
    });

    // 새로운 DB 정보 저장
    dbConfigs.forEach(config => {
        DB_COLLECTION[config.name] = {
            index: config.index,
            name: config.name,
            type: config.type,
            host: config.host,
            port: config.port,
            data_base: config.data_base,
            config: config.config || {}
        };
    });

    // DB 정보가 업데이트되었음을 콘솔에 로깅
    console.log('DB Collection updated:', Object.keys(DB_COLLECTION).length, 'databases');
}; 