import { useState } from 'react';

interface ApiRequestOptions extends RequestInit {
  baseUrl?: string;
  params?: Record<string, string | number | boolean | undefined>;
}

type ApiRequestBody = BodyInit | Record<string, unknown> | null;

interface ApiResponse<T> {
  data: T | null;
  debugInfo: {
    requestUrl: string;
    requestMethod: string;
    requestHeaders: Record<string, string>;
    requestBody?: string;
    timestamp: string;
  };
  error: Error | null;
  isLoading: boolean;
}

export const useApiRequest = <T>() => {
  const [state, setState] = useState<ApiResponse<T>>({
    data: null,
    debugInfo: {
      requestUrl: '',
      requestMethod: '',
      requestHeaders: {},
      timestamp: '',
    },
    error: null,
    isLoading: false,
  });

  const request = async (url: string, options: ApiRequestOptions = {}): Promise<ApiResponse<T>> => {
    const {
      baseUrl = '',
      params = {},
      method = 'GET',
      headers = {},
      body,
      ...restOptions
    } = options;

    setState((prev) => ({ ...prev, isLoading: true }));

    // URL 파라미터 처리
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, String(value));
      }
    });

    const queryString = queryParams.toString();
    const fullUrl = `${baseUrl}${url}${queryString ? `?${queryString}` : ''}`;

    const requestHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      ...Object.fromEntries(
        Object.entries(headers).map(([key, value]) => [key, String(value)])
      ),
    };

    let requestBodyStr: string | undefined;
    if (body && typeof body === 'object') {
      requestBodyStr = JSON.stringify(body);
    } else if (typeof body === 'string') {
      requestBodyStr = body;
    }

    // 디버그 정보 생성
    const debugInfo = {
      requestUrl: fullUrl,
      requestMethod: method,
      requestHeaders: requestHeaders,
      requestBody: requestBodyStr,
      timestamp: new Date().toISOString(),
    };

    try {
      const response = await fetch(fullUrl, {
        method,
        headers: requestHeaders,
        body: requestBodyStr,
        ...restOptions,
      });

      if (!response.ok) {
        throw new Error(`API 요청 실패: ${response.status} ${response.statusText}`);
      }

      const responseData = await response.json();

      const result = {
        data: responseData,
        debugInfo,
        error: null,
        isLoading: false,
      };

      setState(result);
      return result;
    } catch (error) {
      const errorResult = {
        data: null,
        debugInfo,
        error: error instanceof Error ? error : new Error('알 수 없는 오류'),
        isLoading: false,
      };

      setState(errorResult);
      return errorResult;
    }
  };

  const get = (url: string, options: Omit<ApiRequestOptions, 'method' | 'body'> = {}) => {
    return request(url, { ...options, method: 'GET' });
  };

  const post = (url: string, data?: ApiRequestBody, options: Omit<ApiRequestOptions, 'method'> = {}) => {
    return request(url, { ...options, method: 'POST', body: data as BodyInit });
  };

  const put = (url: string, data?: ApiRequestBody, options: Omit<ApiRequestOptions, 'method'> = {}) => {
    return request(url, { ...options, method: 'PUT', body: data as BodyInit });
  };

  const del = (url: string, options: Omit<ApiRequestOptions, 'method'> = {}) => {
    return request(url, { ...options, method: 'DELETE' });
  };

  return {
    ...state,
    request,
    get,
    post,
    put,
    delete: del,
  };
}; 