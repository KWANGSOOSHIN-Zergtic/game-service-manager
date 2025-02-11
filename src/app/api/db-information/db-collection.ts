import { DBConfig, ServiceDBConfig } from './db-information';

interface ParsedConfig extends Record<string, unknown> {
    service_db: ServiceDBConfig;
}

// DB 서버 정보를 JSON 구조로 저장
export const DB_COLLECTION: { [key: string]: DBConfig } = {
  'football_service': {
    index: 1,
    name: 'football_service',
    type: process.env.DB_TYPE || 'postgres',
    host: process.env.DEV_DB_HOST || '',
    port: Number(process.env.DB_PORT) || 5432,
    data_base: process.env.DB_NAME || 'football_service',
    config: {
      service_db: {
        user: process.env.DB_USERNAME || '',
        password: process.env.DB_PASSWORD || ''
      }
    }
  }
};

// DB 정보 업데이트 함수
export const updateDBCollection = (dbConfigs: DBConfig[]): void => {
    console.log('\n========== DB Collection 업데이트 시작 ==========');
    console.log('1. 현재 DB Collection 상태:', JSON.stringify({
        keys: Object.keys(DB_COLLECTION),
        collection: DB_COLLECTION
    }, null, 2));

    if (!Array.isArray(dbConfigs)) {
        console.error('dbConfigs가 배열이 아님:', dbConfigs);
        return;
    }

    console.log('2. 업데이트할 DB 개수:', dbConfigs.length);
    console.log('3. 업데이트할 DB 목록:', dbConfigs.map(db => ({
        name: db.name,
        type: db.type,
        configType: typeof db.config
    })));

    // 기존 컬렉션 초기화
    Object.keys(DB_COLLECTION).forEach(key => {
        delete DB_COLLECTION[key];
    });
    console.log('4. DB Collection 초기화 완료');

    // 새로운 DB 정보 저장
    dbConfigs.forEach((config, index) => {
        console.log(`\n----- DB ${index + 1}/${dbConfigs.length} (${config.name}) 처리 시작 -----`);
        
        if (!config.name) {
            console.error('DB 이름이 없음:', config);
            return;
        }

        console.log('1) DB 기본 정보:', {
            name: config.name,
            type: config.type,
            host: config.host,
            port: config.port,
            database: config.data_base
        });

        const configType = typeof config.config;
        console.log('2) 원본 config 정보:', {
            type: configType,
            isNull: config.config === null,
            isUndefined: config.config === undefined,
            value: configType === 'string' ? config.config : JSON.stringify(config.config)
        });

        let parsedConfig: ParsedConfig | null = null;

        try {
            // config 파싱
            if (typeof config.config === 'string') {
                console.log('3) config 문자열 파싱 시도:', config.config);
                try {
                    parsedConfig = JSON.parse(config.config);
                    console.log('   파싱 성공:', JSON.stringify(parsedConfig, null, 2));
                } catch (parseError) {
                    console.error('   파싱 실패:', parseError);
                    return;
                }
            } else if (typeof config.config === 'object' && config.config !== null) {
                console.log('3) config 객체 사용:', JSON.stringify(config.config, null, 2));
                parsedConfig = config.config as ParsedConfig;
            } else {
                console.error('3) 지원하지 않는 config 타입:', typeof config.config);
                return;
            }

            // service_db 확인
            if (!parsedConfig) {
                console.error('4) config 파싱 결과 없음');
                return;
            }

            console.log('4) 파싱된 config:', JSON.stringify(parsedConfig, null, 2));

            const serviceDB = parsedConfig.service_db;
            if (!serviceDB) {
                console.error('5) service_db가 없음:', parsedConfig);
                return;
            }

            console.log('5) service_db 확인:', JSON.stringify(serviceDB, null, 2));

            if (typeof serviceDB !== 'object' || !serviceDB.user || !serviceDB.password) {
                console.error('6) 잘못된 service_db 형식:', serviceDB);
                return;
            }

            console.log('6) 인증 정보 확인 완료:', {
                user: serviceDB.user,
                password: serviceDB.password
            });

            // DB Collection에 저장
            DB_COLLECTION[config.name] = {
                index: config.index,
                name: config.name,
                type: config.type,
                host: config.host,
                port: config.port,
                data_base: config.data_base,
                config: parsedConfig
            };

            console.log(`7) ${config.name} 저장 완료`);

        } catch (error) {
            console.error(`[오류] ${config.name} 처리 중 예외 발생:`, error);
            console.error('상세 정보:', {
                config: config,
                parsedConfig: parsedConfig
            });
        }
    });

    console.log('\n========== DB Collection 업데이트 완료 ==========');
    console.log('최종 상태:', JSON.stringify({
        count: Object.keys(DB_COLLECTION).length,
        names: Object.keys(DB_COLLECTION),
        collection: DB_COLLECTION
    }, null, 2));
};

// config가 올바른 service_db 구조를 가지고 있는지 확인하는 함수
function isValidServiceDBConfig(config: unknown): config is { service_db: ServiceDBConfig } {
    if (!config || typeof config !== 'object') return false;
    
    const configRecord = config as Record<string, unknown>;
    const service_db = configRecord.service_db;
    if (!service_db || typeof service_db !== 'object') return false;
    
    const serviceDBRecord = service_db as Record<string, unknown>;
    const { user, password } = serviceDBRecord;
    return typeof user === 'string' && typeof password === 'string';
} 