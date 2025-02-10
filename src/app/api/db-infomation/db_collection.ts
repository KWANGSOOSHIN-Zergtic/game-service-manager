import { DBConfig } from './db_infomation';

// DB 서버 정보를 개별 변수로 저장
export const DB_COLLECTION: { [key: string]: DBConfig } = {};

// DB 정보 업데이트 함수
export const updateDBCollection = (dbConfigs: DBConfig[]): void => {
    dbConfigs.forEach(config => {
        DB_COLLECTION[config.name] = config;
    });
}; 