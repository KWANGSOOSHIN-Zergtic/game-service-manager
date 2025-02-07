interface QueryInfo {
    name: string;
    description: string;
    query: string;
}

interface DatabaseQueries {
    [key: string]: QueryInfo;
}

export const DB_QUERIES: DatabaseQueries = {
    //----------------------------------
    // 여기에 새로운 쿼리들을 추가할 수 있습니다
    // 예시:
    // SELECT_TABLE_COLUMNS: {
    //     name: 'SELECT_TABLE_COLUMNS',
    //     description: '특정 테이블의 컬럼 정보 조회',
    //     query: '...'
    // }
    //----------------------------------

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
    SELECT_SERVICE_DB_CONFIG: {
        name: 'SELECT_SERVICE_DB_CONFIG',
        description: 'service-db-config 테이블의 모든 데이터를(서비스 중인 DB 리스트) 조회',
        query: `
            SELECT 
                index,
                name,
                type,
                host,
                port,
                data_base,
                config
            FROM service_db_config
            ORDER BY index ASC
        `
    },
    SELECT_DB_LIST: {
        name: 'SELECT_DB_LIST',
        description: 'service-db-config 테이블 DB 목록 조회',
        query: `
            SELECT 
                index,
                name,
                description
            FROM service_db_config
            ORDER BY index ASC
        `
    },

}; 