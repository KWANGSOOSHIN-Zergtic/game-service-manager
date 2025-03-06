import { useState } from 'react';
import { useApiRequest } from './useApiRequest';
import { useDBConnection } from './useDBConnection';
import { useDBTables, type TableData } from './useDBTables';
import type { DBQueryResult, UseDBQueryConfig } from './types/db-query.types';

interface ApiDebugInfo {
  requestUrl: string;
  requestMethod: string;
  requestHeaders: Record<string, string>;
  requestBody?: string;
  timestamp: string;
}

interface UseDBQueryReturn {
  connectResult: DBQueryResult;
  tableData: TableData[];
  isLoading: boolean;
  isTableLoading: boolean;
  debugInfo: ApiDebugInfo | null;
  connectDB: (dbName: string) => Promise<void>;
  executeQuery: (
    dbName: string,
    queryFn: (dbName: string) => Promise<boolean>,
    config?: UseDBQueryConfig
  ) => Promise<void>;
}

export const useDBQuery = (): UseDBQueryReturn => {
  const { connectionResult, isConnecting, connectToDatabase } = useDBConnection();
  const { tableData, isLoading: isTableLoading, fetchTables } = useDBTables();
  const [debugInfo, setDebugInfo] = useState<ApiDebugInfo | null>(null);
  const apiRequest = useApiRequest();

  const executeQuery = async (
    dbName: string,
    queryFn: (dbName: string) => Promise<boolean>,
    config?: UseDBQueryConfig
  ): Promise<void> => {
    if (!dbName) return;

    try {
      // API 요청을 위한 URL과 데이터 준비
      const queryInfo = {
        dbName,
        query: 'debug-info-query',
      };

      // 디버그 정보 저장을 위한 API 요청 수행
      // 실제 쿼리 실행은 원래 함수를 사용하되, 디버그 정보 기록을 위해 추가 요청
      const debugResponse = await apiRequest.get('/api/db-query/debug-info', {
        params: queryInfo
      });

      if (debugResponse.debugInfo) {
        setDebugInfo(debugResponse.debugInfo);
      }

      const success = await queryFn(dbName);
      if (success && config?.onSuccess) {
        config.onSuccess(tableData);
      }
    } catch (error) {
      if (config?.onError) {
        config.onError(error instanceof Error ? error : new Error('Unknown error'));
      }
    }
  };

  const connectDB = async (dbName: string) => {
    if (!dbName) return;

    const connected = await connectToDatabase(dbName);
    if (connected) {
      await executeQuery(dbName, fetchTables);
    }
  };

  return {
    connectResult: connectionResult,
    tableData,
    isLoading: isConnecting || isTableLoading,
    isTableLoading,
    debugInfo,
    connectDB,
    executeQuery,
  };
}; 