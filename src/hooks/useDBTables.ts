import { useState } from 'react';

export interface TableData {
  id: number;
  name: string;
  type: string;
  size: string;
  rows: number;
  [key: string]: any;
}

interface DBTablesResult {
  status: 'success' | 'error' | null;
  message: string;
  error?: string;
}

interface UseDBTablesReturn {
  tablesResult: DBTablesResult;
  tableData: TableData[];
  isLoading: boolean;
  fetchTables: (dbName: string) => Promise<boolean>;
}

export const useDBTables = (): UseDBTablesReturn => {
  const [tablesResult, setTablesResult] = useState<DBTablesResult>({
    status: null,
    message: '',
  });
  const [tableData, setTableData] = useState<TableData[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchTables = async (dbName: string): Promise<boolean> => {
    if (!dbName) return false;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/db-query?dbName=${dbName}`);
      const result = await response.json();

      if (result.success) {
        const formattedTableData: TableData[] = result.tables.map((table: any, index: number) => ({
          id: index + 1,
          ...table
        }));
        setTableData(formattedTableData);
        setTablesResult({
          status: 'success',
          message: '테이블 목록을 성공적으로 불러왔습니다.',
        });
        return true;
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      setTablesResult({
        status: 'error',
        message: '테이블 목록 조회 중 오류가 발생했습니다.',
        error: error instanceof Error ? error.message : '알 수 없는 오류'
      });
      setTableData([]);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    tablesResult,
    tableData,
    isLoading,
    fetchTables,
  };
}; 