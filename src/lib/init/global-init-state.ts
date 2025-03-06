import { InitializationStatus } from './types';

// Node.js 프로세스 레벨의 전역 상태
declare global {
    // eslint-disable-next-line no-var
    var __SERVER_INITIALIZATION__: {
        isInitializing: boolean;
        isInitialized: boolean;
        promise: Promise<InitializationStatus> | null;
    };
}

// 전역 상태 초기화
if (!global.__SERVER_INITIALIZATION__) {
    global.__SERVER_INITIALIZATION__ = {
        isInitializing: false,
        isInitialized: false,
        promise: null,
    };
}

export const getGlobalInitState = () => global.__SERVER_INITIALIZATION__; 