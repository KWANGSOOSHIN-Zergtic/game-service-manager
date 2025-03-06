export interface DBQueryResult {
  status: 'success' | 'error' | null;
  message: string;
  error?: string;
  type?: 'default' | 'warning' | 'error';
}

export interface DBQueryBase {
  queryResult: DBQueryResult;
  isLoading: boolean;
}

export interface DBQueryFunction<T = unknown> {
  (dbName: string, ...args: unknown[]): Promise<boolean>;
  data?: T;
}

export interface UseDBQueryConfig {
  onSuccess?: (data: unknown) => void;
  onError?: (error: Error) => void;
} 