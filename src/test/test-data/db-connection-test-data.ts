/**
 * DB 연결 프로세스 테스트를 위한 테스트 데이터
 * 룰북에 따른 테스트를 위해 구성된 데이터
 */

// 마스터 DB (football_service DB) 설정
export const MASTER_DB_CONFIG = {
  'football_service': {
    index: 0,
    name: 'football_service',
    type: 'postgres',
    host: process.env.TEST_DB_HOST || 'localhost',
    port: Number(process.env.TEST_DB_PORT) || 5432,
    data_base: 'football_service',
    config: {
      service_db: {
        user: process.env.TEST_DB_USER || 'test_user',
        password: process.env.TEST_DB_PASSWORD || 'test_password'
      }
    }
  }
};

// 서비스 DB 설정
export const SERVICE_DB_CONFIGS = {
  'football_develop': {
    index: 1,
    name: 'football_develop',
    type: 'postgres',
    host: process.env.TEST_DB_HOST || 'localhost',
    port: Number(process.env.TEST_DB_PORT) || 5432,
    data_base: 'football_develop',
    config: {
      service_db: {
        user: process.env.TEST_DB_USER || 'test_user',
        password: process.env.TEST_DB_PASSWORD || 'test_password'
      }
    }
  },
  'football_staging': {
    index: 2,
    name: 'football_staging',
    type: 'postgres',
    host: process.env.TEST_DB_HOST || 'localhost',
    port: Number(process.env.TEST_DB_PORT) || 5432,
    data_base: 'football_staging',
    config: {
      service_db: {
        user: process.env.TEST_DB_USER || 'test_user',
        password: process.env.TEST_DB_PASSWORD || 'test_password'
      }
    }
  },
  'football_production': {
    index: 3,
    name: 'football_production',
    type: 'postgres',
    host: process.env.TEST_DB_HOST || 'localhost',
    port: Number(process.env.TEST_DB_PORT) || 5432,
    data_base: 'football_production',
    config: {
      service_db: {
        user: process.env.TEST_DB_USER || 'test_user',
        password: process.env.TEST_DB_PASSWORD || 'test_password'
      }
    }
  }
};

// DB 리스트 정보 (클라이언트에 제공되는 간략한 정보)
export const DB_LIST_INFO = [
  {
    db_name: 'football_develop',
    display_name: '개발 DB',
    description: '개발 환경 데이터베이스'
  },
  {
    db_name: 'football_staging',
    display_name: '스테이징 DB',
    description: '테스트 환경 데이터베이스'
  },
  {
    db_name: 'football_production',
    display_name: '운영 DB',
    description: '운영 환경 데이터베이스'
  }
];

// 테스트 쿼리 모음
export const TEST_DB_QUERIES = {
  // 기본 테이블 쿼리
  CREATE_TEST_TABLE: `
    CREATE TABLE IF NOT EXISTS test_connection_table (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      value VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `,
  DROP_TEST_TABLE: `
    DROP TABLE IF EXISTS test_connection_table;
  `,
  INSERT_TEST_DATA: `
    INSERT INTO test_connection_table (name, value) VALUES ($1, $2) RETURNING *;
  `,
  SELECT_TEST_DATA: `
    SELECT * FROM test_connection_table WHERE name = $1;
  `,
  UPDATE_TEST_DATA: `
    UPDATE test_connection_table SET value = $2 WHERE name = $1 RETURNING *;
  `,
  DELETE_TEST_DATA: `
    DELETE FROM test_connection_table WHERE name = $1 RETURNING *;
  `,
  
  // 룰북에 명시된 쿼리
  SELECT_SERVICE_DB_COLLECTION: `
    SELECT * FROM service_db_collection WHERE is_active = true ORDER BY index;
  `,
  SELECT_DB_LIST: `
    SELECT db_name, display_name, description FROM service_db_collection WHERE is_active = true ORDER BY index;
  `
};

// 트랜잭션 테스트 데이터
export const TRANSACTION_TEST_DATA = {
  item1: {
    name: 'transaction_item1',
    value: 'item1_value'
  },
  item2: {
    name: 'transaction_item2',
    value: 'item2_value'
  },
  updated: {
    value: 'updated_value'
  }
};

// 오류 시나리오 테스트를 위한 잘못된 DB 설정
export const INVALID_DB_CONFIG = {
  'invalid_db': {
    index: 99,
    name: 'invalid_db',
    type: 'postgres',
    host: 'non-existent-host',
    port: 5432,
    data_base: 'invalid_db',
    config: {
      service_db: {
        user: 'invalid_user',
        password: 'invalid_password'
      }
    }
  }
};

// 테스트 사용자 데이터
export const TEST_USER_INFO = {
  uid: 'test-uid-123',
  db_name: 'football_develop',
  role: 'developer'
}; 