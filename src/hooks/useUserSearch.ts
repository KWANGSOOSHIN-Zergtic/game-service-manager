import { useState } from 'react';
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

interface UseUserSearchReturn {
  queryResult: DBQueryBase['queryResult'];
  userInfoList: UserInfo[];
  isLoading: boolean;
  isExactMatch: boolean;
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

  const searchUser = async (dbName: string, userId: string): Promise<SearchUserResponse> => {
    if (!dbName || !userId) return { success: false, users: null };

    setIsLoading(true);
    try {
      const response = await fetch(`/api/user-search?dbName=${dbName}&userId=${userId}`);
      const result = await response.json();

      if (result.success) {
        const users = result.users;
        setUserInfoList(users);
        setIsExactMatch(result.isExactMatch);
        setQueryResult({
          status: 'success',
          message: result.message,
          type: result.isExactMatch ? 'default' : 'warning'
        });
        return { success: true, users, isExactMatch: result.isExactMatch };
      } else {
        throw new Error(result.error);
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
    searchUser,
  };
}; 