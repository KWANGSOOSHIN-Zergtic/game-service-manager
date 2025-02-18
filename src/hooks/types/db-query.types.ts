export interface DBQueryResult {
  status: 'success' | 'error' | null;
  message: string;
  error?: string;
}

export interface DBQueryBase {
  queryResult: DBQueryResult;
  isLoading: boolean;
}

export interface DBQueryFunction<T = any> {
  (dbName: string, ...args: any[]): Promise<boolean>;
  data?: T;
}

export interface UseDBQueryConfig {
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
} 