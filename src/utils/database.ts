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

interface DBListResult {
  success: boolean;
  error?: string;
  message?: string;
  tables?: Array<{
    name: string;
    description?: string;
    [key: string]: string | number | boolean | null | undefined;
  }>;
}

export const DBConnection = async (options: DBConnectionOptions = {}): Promise<DBConnectionResult> => {
  const { retryCount = 3, timeout = 5000 } = options;
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    for (let i = 0; i < retryCount; i++) {
      try {
        const response = await fetch(`/api/db-connection?dbName=${process.env.DB_NAME || 'football_service'}`, {
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
        if (error instanceof Error && error.name === 'AbortError') {
          throw new Error('DB 연결 시간이 초과되었습니다.');
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
export const fetchDBList = async (options: DBConnectionOptions = {}): Promise<DBListResult> => {
  const { retryCount = 3, timeout = 5000 } = options;
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    for (let i = 0; i < retryCount; i++) {
      try {
        const response = await fetch('/api/db-information', {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          cache: 'no-store',
          signal: controller.signal
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('API 응답 오류:', {
            status: response.status,
            statusText: response.statusText,
            body: errorText
          });
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          const text = await response.text();
          console.error('잘못된 응답 형식:', {
            contentType,
            responseText: text
          });
          throw new Error('API가 JSON이 아닌 응답을 반환했습니다.');
        }

        const data = await response.json();
        console.log('API 응답 데이터:', data);
        
        if (data.success && Array.isArray(data.tables)) {
          return {
            success: true,
            tables: data.tables,
            message: data.message
          };
        }
        
        if (i < retryCount - 1) {
          console.log(`DB 목록 조회 시도 ${i + 1}/${retryCount} 실패, 재시도 중...`);
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          throw new Error('DB 목록 조회 시간이 초과되었습니다.');
        }
        if (i === retryCount - 1) throw error;
        console.error(`시도 ${i + 1}/${retryCount} 실패:`, error);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    throw new Error('최대 재시도 횟수를 초과했습니다.');
  } catch (error) {
    console.error('DB 목록 조회 최종 실패:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '알 수 없는 오류'
    };
  } finally {
    clearTimeout(timeoutId);
  }
}; 