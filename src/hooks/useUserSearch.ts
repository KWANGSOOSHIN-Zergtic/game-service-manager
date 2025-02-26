import { useState } from 'react';
import { useApiRequest } from './useApiRequest';
import type { DBQueryBase } from './types/db-query.types';

interface UserInfo {
  uid: string;
  create_at: string;
  update_at: string;
  uuid: string;
  login_id: string;
  display_id: string;
  nickname: string;
  role: string;
  nation_index: number;
}

interface SearchUserResponse {
  success: boolean;
  users: UserInfo[] | null;
  isExactMatch?: boolean;
  message?: string;
}

interface ApiDebugInfo {
  requestUrl: string;
  requestMethod: string;
  requestHeaders: Record<string, string>;
  requestBody?: string;
  timestamp: string;
}

interface UseUserSearchReturn {
  queryResult: DBQueryBase['queryResult'];
  userInfoList: UserInfo[];
  isLoading: boolean;
  isExactMatch: boolean;
  debugInfo: ApiDebugInfo | null;
  searchUser: (dbName: string, userId: string) => Promise<SearchUserResponse>;
}

export const useUserSearch = (): UseUserSearchReturn => {
  const [queryResult, setQueryResult] = useState<DBQueryBase['queryResult']>({
    status: null,
    message: '',
  });
  const [userInfoList, setUserInfoList] = useState<UserInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isExactMatch, setIsExactMatch] = useState(false);
  const [debugInfo, setDebugInfo] = useState<ApiDebugInfo | null>(null);
  
  const apiRequest = useApiRequest<SearchUserResponse>();

  const searchUser = async (dbName: string, userId: string): Promise<SearchUserResponse> => {
    if (!dbName || !userId) return { success: false, users: null };

    setIsLoading(true);
    try {
      const response = await apiRequest.get('/api/user-search', {
        params: { dbName, userId }
      });
      
      if (!response.data) {
        throw new Error('API 응답 데이터가 없습니다.');
      }
      
      // 디버그 정보 저장
      setDebugInfo(response.debugInfo);

      const result = response.data;

      if (result.success) {
        const users = result.users || [];
        setUserInfoList(users);
        setIsExactMatch(!!result.isExactMatch);
        setQueryResult({
          status: 'success',
          message: result.message || '사용자 정보를 조회했습니다.',
          type: result.isExactMatch ? 'default' : 'warning'
        });
        return { success: true, users, isExactMatch: result.isExactMatch };
      } else {
        throw new Error(result.message || '사용자 정보 조회에 실패했습니다.');
      }
    } catch (error) {
      setQueryResult({
        status: 'error',
        message: '사용자 정보 조회 중 오류가 발생했습니다.',
        error: error instanceof Error ? error.message : '알 수 없는 오류'
      });
      setUserInfoList([]);
      setIsExactMatch(false);
      return { success: false, users: null };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    queryResult,
    userInfoList,
    isLoading,
    isExactMatch,
    debugInfo,
    searchUser,
  };
}; 