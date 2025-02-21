import { Pool } from 'pg';

export interface ServiceDBConfig {
    user: string;
    password: string;
}

export interface DBConfig {
    index: number;
    name: string;
    type: string;
    host: string;
    port: number;
    data_base: string;
    config: {
        service_db: ServiceDBConfig;
    };
}

export interface DBConnectionConfig {
    [key: string]: DBConfig;
}

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

export interface PoolManager {
    [key: string]: Pool;
} 