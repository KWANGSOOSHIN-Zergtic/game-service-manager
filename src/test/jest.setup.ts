import dotenv from 'dotenv';

// 테스트 환경변수 로드
dotenv.config({ path: '.env.test' });

// 테스트 타임아웃 설정
jest.setTimeout(10000);

// 전역 beforeAll
beforeAll(() => {
    // 테스트 환경 검증
    const requiredEnvVars = [
        'TEST_DB_HOST',
        'TEST_DB_PORT',
        'TEST_DB_USER',
        'TEST_DB_PASSWORD'
    ];

    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    if (missingVars.length > 0) {
        throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
    }
});

// 전역 afterAll
afterAll(async () => {
    // 필요한 경우 전역 정리 작업 수행
}); 