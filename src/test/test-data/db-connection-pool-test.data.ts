export const TEST_DB_CONFIGS = {
    'test_football_service': {
        index: 1,
        name: 'test_football_service',
        type: 'postgres',
        host: process.env.TEST_DB_HOST || 'localhost',
        port: Number(process.env.TEST_DB_PORT) || 5432,
        data_base: 'test_football_service',
        config: {
            service_db: {
                user: process.env.TEST_DB_USER || 'test_user',
                password: process.env.TEST_DB_PASSWORD || 'test_password'
            }
        }
    },
    'test_game_service': {
        index: 2,
        name: 'test_game_service',
        type: 'postgres',
        host: process.env.TEST_DB_HOST || 'localhost',
        port: Number(process.env.TEST_DB_PORT) || 5432,
        data_base: 'test_game_service',
        config: {
            service_db: {
                user: process.env.TEST_DB_USER || 'test_user',
                password: process.env.TEST_DB_PASSWORD || 'test_password'
            }
        }
    }
};

export const TEST_USER_DATA = {
    uid: 1,
    create_at: new Date(),
    update_at: new Date(),
    uuid: 'test-uuid',
    login_id: 'test_user',
    display_id: 'test_display',
    nickname: 'Test User',
    role: 'user',
    nation_index: 1
};

export const TEST_DB_QUERIES = {
    createTestTable: `
        CREATE TABLE IF NOT EXISTS test_table (
            id SERIAL PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `,
    dropTestTable: `
        DROP TABLE IF EXISTS test_table;
    `,
    insertTestData: `
        INSERT INTO test_table (name) VALUES ($1) RETURNING *;
    `,
    selectTestData: `
        SELECT * FROM test_table WHERE name = $1;
    `
}; 