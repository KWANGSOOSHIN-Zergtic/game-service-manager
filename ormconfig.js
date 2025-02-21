module.exports = {
    type: 'postgres',
    synchronize: false,
    logging: true,
    entities: [],
    migrations: [],
    subscribers: [],
    cache: false,
    extra: {
        max: 5,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000
    },
    // 불필요한 드라이버 로딩 방지
    driverDependencies: {
        mysql: false,
        mariadb: false,
        sqlite: false,
        'better-sqlite3': false,
        oracle: false,
        mssql: false,
        mongodb: false,
        'react-native': false,
        'sql.js': false,
        sap: false,
        expo: false
    },
    // 추가 설정
    supportedDrivers: ['postgres'],
    skipDriverResolving: true,
    skipSchemaSync: true,
    skipMigrations: true,
    skipEntityMetadataLoad: true
}; 