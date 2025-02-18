import { useState } from 'react';
import type { DBQueryBase } from './types/db-query.types';

interface TableInfo {
  columnName: string;
  dataType: string;
  isNullable: boolean;
  columnDefault: string | null;
}

interface UseDBTableInfoReturn extends DBQueryBase {
  tableInfo: TableInfo[];
  fetchTableInfo: (dbName: string, tableName: string) => Promise<boolean>;
}

export const useDBTableInfo = (): UseDBTableInfoReturn => {
  const [queryResult, setQueryResult] = useState<DBQueryBase['queryResult']>({
    status: null,
    message: '',
  });
  const [tableInfo, setTableInfo] = useState<TableInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchTableInfo = async (dbName: string, tableName: string): Promise<boolean> => {
    if (!dbName || !tableName) return false;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/db-table-info?dbName=${dbName}&tableName=${tableName}`);
      const result = await response.json();

      if (result.success) {
        setTableInfo(result.columns);
        setQueryResult({
          status: 'success',
          message: '테이블 정보를 성공적으로 불러왔습니다.',
        });
        return true;
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      setQueryResult({
        status: 'error',
        message: '테이블 정보 조회 중 오류가 발생했습니다.',
        error: error instanceof Error ? error.message : '알 수 없는 오류'
      });
      setTableInfo([]);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    queryResult,
    tableInfo,
    isLoading,
    fetchTableInfo,
  };
}; 