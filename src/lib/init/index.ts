export * from './types';
export * from './initialization-manager';
export * from './database-initializer';

import { initializationManager } from './initialization-manager';
import { databaseInitializer } from './database-initializer';

export async function initializeServer() {
    // 초기화 함수들을 등록
    initializationManager.registerInitializer(databaseInitializer);
    
    // 추가적인 초기화 함수들은 여기에 등록

    // 초기화 실행
    const status = await initializationManager.initialize();
    
    if (!status.isInitialized) {
        console.error('Server initialization failed');
        // 초기화 실패 시 처리할 로직 추가
    }

    return status;
} 