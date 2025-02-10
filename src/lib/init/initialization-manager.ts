import { InitializerFunction, InitializationResult, InitializationStatus } from './types';
import { getGlobalInitState } from './global-init-state';

class InitializationManager {
    private static instance: InitializationManager;
    private initializers: InitializerFunction[] = [];
    private status: InitializationStatus = {
        isInitialized: false,
        results: new Map(),
        timestamp: new Date()
    };

    private constructor() {}

    public static getInstance(): InitializationManager {
        if (!InitializationManager.instance) {
            InitializationManager.instance = new InitializationManager();
        }
        return InitializationManager.instance;
    }

    public registerInitializer(initializer: InitializerFunction): void {
        this.initializers.push(initializer);
        this.initializers.sort((a, b) => a.priority - b.priority);
    }

    public async initialize(): Promise<InitializationStatus> {
        const globalState = getGlobalInitState();

        // 이미 초기화가 완료된 경우
        if (globalState.isInitialized) {
            return this.status;
        }

        // 초기화가 진행 중인 경우
        if (globalState.isInitializing && globalState.promise) {
            return globalState.promise;
        }

        // 새로운 초기화 시작
        globalState.isInitializing = true;
        globalState.promise = (async () => {
            try {
                console.log('Starting server initialization...');
                
                for (const initializer of this.initializers) {
                    try {
                        const result = await initializer.initialize();
                        this.status.results.set(initializer.name, result);
                        
                        if (!result.success) {
                            console.error(`Initialization failed at ${initializer.name}:`, result.error);
                            return this.status;
                        }
                    } catch (error) {
                        const result: InitializationResult = {
                            success: false,
                            message: `Unexpected error in ${initializer.name}`,
                            error: error as Error
                        };
                        this.status.results.set(initializer.name, result);
                        return this.status;
                    }
                }

                this.status.isInitialized = true;
                this.status.timestamp = new Date();
                globalState.isInitialized = true;
                console.log('Server initialization completed successfully');
                
                return this.status;
            } finally {
                globalState.isInitializing = false;
                globalState.promise = null;
            }
        })();

        return globalState.promise;
    }

    public getStatus(): InitializationStatus {
        return { ...this.status };
    }

    public reset(): void {
        const globalState = getGlobalInitState();
        this.status = {
            isInitialized: false,
            results: new Map(),
            timestamp: new Date()
        };
        globalState.isInitialized = false;
        globalState.isInitializing = false;
        globalState.promise = null;
        console.log('Initialization status has been reset');
    }
}

export const initializationManager = InitializationManager.getInstance(); 