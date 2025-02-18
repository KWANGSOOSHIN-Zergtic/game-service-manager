import { useDBConnection } from './useDBConnection';
import { useDBTables, type TableData } from './useDBTables';
import type { DBQueryResult, UseDBQueryConfig } from './types/db-query.types';

interface UseDBQueryReturn {
  connectResult: DBQueryResult;
  tableData: TableData[];
  isLoading: boolean;
  connectDB: (dbName: string) => Promise<void>;
  executeQuery: <T>(
    dbName: string,
    queryFn: (dbName: string) => Promise<boolean>,
    config?: UseDBQueryConfig
  ) => Promise<void>;
}

export const useDBQuery = (): UseDBQueryReturn => {
  const { connectionResult, isConnecting, connectToDatabase } = useDBConnection();
  const { tablesResult: _, tableData, isLoading: isTableLoading, fetchTables } = useDBTables();

  const executeQuery = async <T>(
    dbName: string,
    queryFn: (dbName: string) => Promise<boolean>,
    config?: UseDBQueryConfig
  ): Promise<void> => {
    if (!dbName) return;

    try {
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
    connectDB,
    executeQuery,
  };
}; 