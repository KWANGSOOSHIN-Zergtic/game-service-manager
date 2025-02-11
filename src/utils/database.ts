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
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success) {
          return data;
        }
        
        // 마지막 시도가 아니면 잠시 대기 후 재시도
        if (i < retryCount - 1) {
          console.log(`DB 연결 시도 ${i + 1}/${retryCount} 실패, 재시도 중...`);
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      } catch (error) {
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
export const fetchDBList = async (options: DBConnectionOptions = {}): Promise<any> => {
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
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success && Array.isArray(data.tables)) {
          return data;
        }
        
        if (i < retryCount - 1) {
          console.log(`DB 목록 조회 시도 ${i + 1}/${retryCount} 실패, 재시도 중...`);
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      } catch (error) {
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