'use client';

interface DBConnectionOptions {
  retryCount?: number;
  timeout?: number;
}

interface DBConnectionResult {
  success: boolean;
  message: string;
  error?: string;
  dbInfo?: {
    host?: string;
    database?: string;
  };
}

export const DBConnection = async (options: DBConnectionOptions = {}): Promise<DBConnectionResult> => {
  const { retryCount = 3, timeout = 5000 } = options;
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    for (let i = 0; i < retryCount; i++) {
      try {
        const response = await fetch('/api/db-connection', {
          signal: controller.signal
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success) {
          return data;
        }
        
        // 서버에서 명시적인 실패를 반환한 경우 바로 실패 처리
        if (data.error) {
          throw new Error(data.error);
        }
        
        // 마지막 시도가 아니면 잠시 대기 후 재시도
        if (i < retryCount - 1) {
          console.log(`DB 연결 시도 ${i + 1}/${retryCount} 실패, 재시도 중...`);
          await new Promise(resolve => setTimeout(resolve, Math.min(1000 * Math.pow(2, i), 5000))); // 지수 백오프
        }
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          throw new Error('요청 시간이 초과되었습니다.');
        }
        if (i === retryCount - 1) throw error;
        console.error(`시도 ${i + 1}/${retryCount} 실패:`, error);
      }
    }
    
    throw new Error('최대 재시도 횟수를 초과했습니다.');
  } catch (error) {
    return {
      success: false,
      message: 'DB 연결 실패',
      error: error instanceof Error ? error.message : '알 수 없는 오류'
    };
  } finally {
    clearTimeout(timeoutId);
  }
};

// DB 목록 조회 함수
export const fetchDBList = async (options: DBConnectionOptions = {}): Promise<Record<string, unknown>> => {
  const { retryCount = 3, timeout = 5000 } = options;
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    for (let i = 0; i < retryCount; i++) {
      try {
        const response = await fetch('/api/db-list-load', {
          signal: controller.signal
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success && Array.isArray(data.tables)) {
          return data;
        }
        
        // 서버에서 명시적인 실패를 반환한 경우 바로 실패 처리
        if (data.error) {
          throw new Error(data.error);
        }
        
        if (i < retryCount - 1) {
          console.log(`DB 목록 조회 시도 ${i + 1}/${retryCount} 실패, 재시도 중...`);
          await new Promise(resolve => setTimeout(resolve, Math.min(1000 * Math.pow(2, i), 5000))); // 지수 백오프
        }
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          throw new Error('요청 시간이 초과되었습니다.');
        }
        if (i === retryCount - 1) throw error;
        console.error(`시도 ${i + 1}/${retryCount} 실패:`, error);
      }
    }
    
    throw new Error('최대 재시도 횟수를 초과했습니다.');
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '알 수 없는 오류'
    };
  } finally {
    clearTimeout(timeoutId);
  }
};

export const executeQuery = async (dbName: string, query: string, params: unknown[] = []): Promise<Record<string, unknown>[]> => {
  // 임시 구현: 실제 구현은 DB 연결 및 쿼리 실행 로직이 필요합니다
  console.log(`Executing query on ${dbName}: ${query} with params:`, params);
  return []; // 빈 배열 반환
}; 