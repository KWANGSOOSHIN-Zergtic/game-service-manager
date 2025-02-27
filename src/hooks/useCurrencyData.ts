import { useState } from 'react';
import { useApiRequest } from './useApiRequest';

interface UserCurrency {
  id: number;
  create_at: string;
  update_at: string;
  employer_uid: number;
  excel_item_index: number;
  count: number;
  user_nickname?: string;
  user_display_id?: string;
}

interface CurrencyApiResponse {
  success: boolean;
  currencies?: UserCurrency[];
  currency?: UserCurrency;
  message?: string;
  error?: string;
  availableDBs?: string[];
}

interface ApiDebugInfo {
  requestUrl: string;
  requestMethod: string;
  requestHeaders: Record<string, string>;
  requestBody?: string;
  timestamp: string;
}

interface UseCurrencyDataReturn {
  currencies: UserCurrency[];
  isLoading: boolean;
  error: string | null;
  debugInfo: ApiDebugInfo | null;
  fetchCurrencies: (employerUid: number, dbName: string) => Promise<CurrencyApiResponse>;
  addCurrency: (params: { employerUid: number; excelItemIndex: number; count: number; dbName: string }) => Promise<CurrencyApiResponse>;
  updateCurrency: (params: { employerUid: number; excelItemIndex: number; count: number; dbName: string }) => Promise<CurrencyApiResponse>;
  deleteCurrency: (employerUid: number, excelItemIndices: number[], dbName: string) => Promise<CurrencyApiResponse>;
}

export const useCurrencyData = (): UseCurrencyDataReturn => {
  const [currencies, setCurrencies] = useState<UserCurrency[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<ApiDebugInfo | null>(null);
  
  const apiRequest = useApiRequest<CurrencyApiResponse>();

  const fetchCurrencies = async (employerUid: number, dbName: string): Promise<CurrencyApiResponse> => {
    if (!employerUid || !dbName) {
      return { success: false, message: '필수 파라미터가 누락되었습니다' };
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiRequest.get('/api/user/currency', {
        params: { employerUid, dbName }
      });
      
      // 디버그 정보 강화
      setDebugInfo({
        ...response.debugInfo,
        requestUrl: response.debugInfo.requestUrl,
        requestMethod: response.debugInfo.requestMethod,
        requestHeaders: {
          ...response.debugInfo.requestHeaders,
          'X-Debug-Api': 'useCurrencyData/fetchCurrencies'
        },
        timestamp: new Date().toISOString()
      });
      
      if (response.error) {
        throw new Error(response.error.message);
      }
      
      const result = response.data;
      
      if (!result) {
        throw new Error('API 응답 데이터가 없습니다');
      }
      
      if (result.success && result.currencies) {
        setCurrencies(result.currencies);
      } else {
        setCurrencies([]);
      }
      
      return result;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : '재화 정보를 가져오는 중 오류가 발생했습니다';
      setError(errorMsg);
      return { 
        success: false, 
        message: errorMsg 
      };
    } finally {
      setIsLoading(false);
    }
  };

  const addCurrency = async (params: { 
    employerUid: number; 
    excelItemIndex: number; 
    count: number; 
    dbName: string 
  }): Promise<CurrencyApiResponse> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiRequest.post('/api/user/currency', params);
      
      // 디버그 정보 강화
      setDebugInfo({
        ...response.debugInfo,
        requestUrl: response.debugInfo.requestUrl,
        requestMethod: response.debugInfo.requestMethod,
        requestHeaders: {
          ...response.debugInfo.requestHeaders,
          'X-Debug-Api': 'useCurrencyData/addCurrency'
        },
        timestamp: new Date().toISOString()
      });
      
      if (response.error) {
        throw new Error(response.error.message);
      }
      
      const result = response.data;
      
      if (!result) {
        throw new Error('API 응답 데이터가 없습니다');
      }
      
      // 성공적으로 추가되었다면 목록 새로고침
      if (result.success) {
        await fetchCurrencies(params.employerUid, params.dbName);
      }
      
      return result;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : '재화를 추가하는 중 오류가 발생했습니다';
      setError(errorMsg);
      return { 
        success: false, 
        message: errorMsg 
      };
    } finally {
      setIsLoading(false);
    }
  };

  const updateCurrency = async (params: { 
    employerUid: number; 
    excelItemIndex: number; 
    count: number; 
    dbName: string 
  }): Promise<CurrencyApiResponse> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiRequest.put('/api/user/currency', params);
      
      // 디버그 정보 강화
      setDebugInfo({
        ...response.debugInfo,
        requestUrl: response.debugInfo.requestUrl,
        requestMethod: response.debugInfo.requestMethod,
        requestHeaders: {
          ...response.debugInfo.requestHeaders,
          'X-Debug-Api': 'useCurrencyData/updateCurrency'
        },
        timestamp: new Date().toISOString()
      });
      
      if (response.error) {
        throw new Error(response.error.message);
      }
      
      const result = response.data;
      
      if (!result) {
        throw new Error('API 응답 데이터가 없습니다');
      }
      
      // 성공적으로 업데이트되었다면 목록 새로고침
      if (result.success) {
        await fetchCurrencies(params.employerUid, params.dbName);
      }
      
      return result;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : '재화를 업데이트하는 중 오류가 발생했습니다';
      setError(errorMsg);
      return { 
        success: false, 
        message: errorMsg 
      };
    } finally {
      setIsLoading(false);
    }
  };

  const deleteCurrency = async (
    employerUid: number, 
    excelItemIndices: number[], 
    dbName: string
  ): Promise<CurrencyApiResponse> => {
    if (!employerUid || !excelItemIndices.length || !dbName) {
      return { success: false, message: '필수 파라미터가 누락되었습니다' };
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiRequest.delete('/api/user/currency', {
        params: { 
          employerUid, 
          excelItemIndex: excelItemIndices.join(','),
          dbName 
        }
      });
      
      // 디버그 정보 강화
      setDebugInfo({
        ...response.debugInfo,
        requestUrl: response.debugInfo.requestUrl,
        requestMethod: response.debugInfo.requestMethod,
        requestHeaders: {
          ...response.debugInfo.requestHeaders,
          'X-Debug-Api': 'useCurrencyData/deleteCurrency',
          'X-Selected-Items-Count': String(excelItemIndices.length)
        },
        timestamp: new Date().toISOString()
      });
      
      if (response.error) {
        throw new Error(response.error.message);
      }
      
      const result = response.data;
      
      if (!result) {
        throw new Error('API 응답 데이터가 없습니다');
      }
      
      // 성공적으로 삭제되었다면 목록 새로고침
      if (result.success) {
        await fetchCurrencies(employerUid, dbName);
      }
      
      return result;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : '재화를 삭제하는 중 오류가 발생했습니다';
      setError(errorMsg);
      return { 
        success: false, 
        message: errorMsg 
      };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    currencies,
    isLoading,
    error,
    debugInfo,
    fetchCurrencies,
    addCurrency,
    updateCurrency,
    deleteCurrency
  };
}; 