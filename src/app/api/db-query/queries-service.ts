import { DatabaseQueries } from './queries-data-type';

export const SERVICE_QUERIES: DatabaseQueries = {
    SELECT_PUBLIC_TABLE_LIST: {
        name: 'SELECT_PUBLIC_TABLE_LIST',
        description: 'PostgreSQL의 information_schema에서 public 스키마의 테이블 목록을 조회',
        query: `
            SELECT 
                table_name,
                table_schema
            FROM 
                information_schema.tables 
            WHERE 
                table_schema = 'public'
            ORDER BY 
                table_name;
        `
    },
    SELECT_SERVICE_DB_COLLECTION: {
        name: 'SELECT_SERVICE_DB_COLLECTION',
        description: 'service-db-collection 테이블의 모든 데이터를(서비스 중인 DB 리스트) 조회',
        query: `
            SELECT 
                index,
                name,
                type,
                host,
                port,
                data_base,
                config
            FROM service_db_collection
            ORDER BY index ASC
        `
    },
    SELECT_DB_LIST: {
        name: 'SELECT_DB_LIST',
        description: 'service-db-collection 테이블 DB 목록 조회',
        query: `
            SELECT 
                index,
                name,
                description
            FROM service_db_collection
            ORDER BY index ASC
        `
    }
}; 