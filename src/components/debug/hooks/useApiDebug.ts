import { useState } from 'react';
import { useDebugContext } from '../DebugContext';
import { ApiResponse, ApiDebugInfo, ApiRequestInfo } from '../types';

/**
 * API 호출과 디버그 정보를 관리하는 커스텀 훅
 * 디버그 컨텍스트와 통합되어 API 요청 정보를 자동으로 수집합니다
 */
export const useApiDebug = () => {
  const { 
    setDebugInfo, 
    setRequestInfo, 
    setApiDebugInfo, 
    clearDebugData,
    updateApiResponseStatus
  } = useDebugContext();
  
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // URL에서 쿼리 파라미터 추출
  const extractQueryParams = (url: string): Record<string, unknown> => {
    try {
      const params: Record<string, unknown> = {};
      const urlObj = new URL(url, window.location.origin);
      
      urlObj.searchParams.forEach((value, key) => {
        // 숫자 변환 시도
        if (/^\d+$/.test(value)) {
          params[key] = parseInt(value, 10);
        } else {
          params[key] = value;
        }
      });
      
      return params;
    } catch (e) {
      console.error('[useApiDebug] URL 파라미터 추출 오류:', e);
      return {};
    }
  };
  
  // API 호출 및 디버그 정보 설정 함수
  const fetchWithDebug = async <T = ApiResponse>(
    url: string, 
    options: RequestInit = {}
  ): Promise<T> => {
    setIsLoading(true);
    clearDebugData();
    setError(null);
    
    // 요청 정보 기록
    const requestMethod = options.method || 'GET';
    const requestUrl = url;
    const requestHeaders = options.headers || { 'Content-Type': 'application/json' };
    const requestBody = options.body;
    const params = extractQueryParams(url);
    
    // API 요청 정보 설정
    const requestInfo: ApiRequestInfo = {
      url: requestUrl,
      params,
      headers: requestHeaders as Record<string, string>,
      method: requestMethod,
      timestamp: new Date()
    };
    
    setRequestInfo(requestInfo);
    
    // API 디버그 정보 설정
    const apiDebugInfo: ApiDebugInfo = {
      requestUrl,
      requestMethod,
      requestHeaders: requestHeaders as Record<string, string>,
      requestBody: requestBody as string,
      timestamp: new Date().toISOString()
    };
    
    setApiDebugInfo(apiDebugInfo);
    
    try {
      console.log(`[useApiDebug] ${requestMethod} 요청 시작:`, requestUrl);
      const response = await fetch(url, options);
      
      if (!response.ok) {
        const statusText = response.statusText || '알 수 없는 오류';
        const errorText = await response.text();
        
        // HTTP 상태 코드별 특별 메시지
        let statusMessage = '';
        switch (response.status) {
          case 404:
            statusMessage = '요청한 API 경로를 찾을 수 없습니다.';
            break;
          case 400:
            statusMessage = '잘못된 요청 형식입니다.';
            break;
          case 401:
            statusMessage = '인증이 필요합니다.';
            break;
          case 403:
            statusMessage = '접근 권한이 없습니다.';
            break;
          case 500:
            statusMessage = '서버 내부 오류가 발생했습니다.';
            break;
          default:
            statusMessage = '오류가 발생했습니다.';
        }
        
        const errorMessage = `API 오류 (${response.status}): ${statusMessage} - ${errorText || statusText}`;
        throw new Error(errorMessage);
      }
      
      const responseText = await response.text();
      if (!responseText || responseText.trim() === '') {
        throw new Error('API 응답이 비어있습니다');
      }
      
      let result: ApiResponse;
      try {
        result = JSON.parse(responseText);
      } catch (parseError) {
        throw new Error(`응답 데이터가 올바른 JSON 형식이 아닙니다: ${parseError}`);
      }
      
      // 응답 타임스탬프 추가
      if (!result.timestamp) {
        result.timestamp = new Date().toISOString();
      }
      
      // 디버그 정보 설정
      setDebugInfo(result);
      
      // API 응답이 성공이 아닌 경우 에러 처리
      if (result.success === false) {
        const errorMsg = result.error || result.message || '알 수 없는 API 오류';
        setError(errorMsg);
        updateApiResponseStatus('failure');
        setIsLoading(false);
        return result as unknown as T; // 에러가 있더라도 원본 응답 반환
      }
      
      updateApiResponseStatus('success');
      setIsLoading(false);
      return result as unknown as T;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '알 수 없는 오류';
      console.error('[useApiDebug] API 호출 오류:', errorMessage);
      setError(errorMessage);
      
      // 오류 정보 설정
      setDebugInfo({
        success: false,
        error: errorMessage,
        message: '데이터를 불러오는 중 오류가 발생했습니다.',
        timestamp: new Date().toISOString()
      });
      
      updateApiResponseStatus('error');
      setIsLoading(false);
      throw err;
    }
  };
  
  return {
    fetchWithDebug,
    error,
    setError,
    isLoading,
    clearDebugData
  };
}; 