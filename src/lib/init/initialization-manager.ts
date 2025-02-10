import { InitializerFunction, InitializationResult, InitializationStatus } from './types';

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
        // 우선순위에 따라 정렬
        this.initializers.sort((a, b) => a.priority - b.priority);
    }

    public async initialize(): Promise<InitializationStatus> {
        if (this.status.isInitialized) {
            console.warn('Server has already been initialized');
            return this.status;
        }

        console.log('Starting server initialization...');
        
        for (const initializer of this.initializers) {
            try {
                console.log(`Running initializer: ${initializer.name}`);
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
        console.log('Server initialization completed successfully');
        
        return this.status;
    }

    public getStatus(): InitializationStatus {
        return { ...this.status };
    }

    public reset(): void {
        this.status = {
            isInitialized: false,
            results: new Map(),
            timestamp: new Date()
        };
        console.log('Initialization status has been reset');
    }
}

export const initializationManager = InitializationManager.getInstance(); 