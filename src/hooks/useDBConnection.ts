import { useState } from 'react';

interface DBConnectionResult {
  status: 'success' | 'error' | null;
  message: string;
  error?: string;
}

interface UseDBConnectionReturn {
  connectionResult: DBConnectionResult;
  isConnecting: boolean;
  connectToDatabase: (dbName: string) => Promise<boolean>;
}

export const useDBConnection = (): UseDBConnectionReturn => {
  const [connectionResult, setConnectionResult] = useState<DBConnectionResult>({
    status: null,
    message: '',
  });
  const [isConnecting, setIsConnecting] = useState(false);

  const connectToDatabase = async (dbName: string): Promise<boolean> => {
    if (!dbName) return false;

    setIsConnecting(true);
    try {
      const response = await fetch(`/api/db-connection?dbName=${dbName}`, {
        method: 'GET',
      });
      
      const result = await response.json();
      
      setConnectionResult({
        status: result.success ? 'success' : 'error',
        message: result.message,
        error: result.error
      });

      return result.success;
    } catch (error) {
      setConnectionResult({
        status: 'error',
        message: 'DB 연결 중 오류가 발생했습니다.',
        error: error instanceof Error ? error.message : '알 수 없는 오류'
      });
      return false;
    } finally {
      setIsConnecting(false);
    }
  };

  return {
    connectionResult,
    isConnecting,
    connectToDatabase,
  };
}; 