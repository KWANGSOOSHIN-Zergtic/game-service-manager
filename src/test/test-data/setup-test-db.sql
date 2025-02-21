-- 테스트 DB 생성
CREATE DATABASE test_football_service;
CREATE DATABASE test_game_service;

-- 테스트 유저 생성 및 권한 부여
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_user WHERE usename = 'test_user') THEN
        CREATE USER test_user WITH PASSWORD 'test_password';
    END IF;
END
$$;

-- 테스트 유저에게 DB 권한 부여
GRANT ALL PRIVILEGES ON DATABASE test_football_service TO test_user;
GRANT ALL PRIVILEGES ON DATABASE test_game_service TO test_user;

-- test_football_service DB에 연결
\c test_football_service;

-- service_db_collection 테이블 생성
CREATE TABLE IF NOT EXISTS service_db_collection (
    index INTEGER PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL,
    host VARCHAR(255) NOT NULL,
    port INTEGER NOT NULL,
    data_base VARCHAR(100) NOT NULL,
    config JSONB NOT NULL,
    description TEXT
);

-- employer 테이블 생성 (사용자 정보 테스트용)
CREATE TABLE IF NOT EXISTS employer (
    uid SERIAL PRIMARY KEY,
    create_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    update_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    uuid VARCHAR(100) NOT NULL,
    login_id VARCHAR(100) NOT NULL,
    display_id VARCHAR(100) NOT NULL,
    nickname VARCHAR(100) NOT NULL,
    role VARCHAR(50) NOT NULL,
    nation_index INTEGER NOT NULL
);

-- 테스트 데이터 삽입
INSERT INTO service_db_collection (index, name, type, host, port, data_base, config, description)
VALUES 
    (1, 'test_football_service', 'postgres', 'localhost', 5432, 'test_football_service', 
    '{"service_db": {"user": "test_user", "password": "test_password"}}', 'Test Football Service DB'),
    (2, 'test_game_service', 'postgres', 'localhost', 5432, 'test_game_service',
    '{"service_db": {"user": "test_user", "password": "test_password"}}', 'Test Game Service DB');

-- test_game_service DB에도 동일한 테이블 생성
\c test_game_service;

CREATE TABLE IF NOT EXISTS service_db_collection (
    index INTEGER PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL,
    host VARCHAR(255) NOT NULL,
    port INTEGER NOT NULL,
    data_base VARCHAR(100) NOT NULL,
    config JSONB NOT NULL,
    description TEXT
);

CREATE TABLE IF NOT EXISTS employer (
    uid SERIAL PRIMARY KEY,
    create_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    update_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    uuid VARCHAR(100) NOT NULL,
    login_id VARCHAR(100) NOT NULL,
    display_id VARCHAR(100) NOT NULL,
    nickname VARCHAR(100) NOT NULL,
    role VARCHAR(50) NOT NULL,
    nation_index INTEGER NOT NULL
); 