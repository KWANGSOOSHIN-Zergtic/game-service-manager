export interface InitializationResult {
    success: boolean;
    message: string;
    error?: Error;
}

export interface InitializerFunction {
    name: string;
    priority: number;
    initialize: () => Promise<InitializationResult>;
}

export interface InitializationStatus {
    isInitialized: boolean;
    results: Map<string, InitializationResult>;
    timestamp: Date;
} 