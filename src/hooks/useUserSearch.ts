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
  user: UserInfo | null;
}

interface UseUserSearchReturn extends DBQueryBase {
  userInfo: UserInfo | null;
  searchUser: (dbName: string, userId: string) => Promise<SearchUserResponse>;
  isLoading: boolean;
}

export const useUserSearch = (): UseUserSearchReturn => {
  const [queryResult, setQueryResult] = useState<DBQueryBase['queryResult']>({
    status: null,
    message: '',
  });
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const searchUser = async (dbName: string, userId: string): Promise<SearchUserResponse> => {
    if (!dbName || !userId) return { success: false, user: null };

    setIsLoading(true);
    try {
      const response = await fetch(`/api/user-search?dbName=${dbName}&userId=${userId}`);
      const result = await response.json();

      if (result.success) {
        const user = result.user;
        setUserInfo(user);
        setQueryResult({
          status: 'success',
          message: '사용자 정보를 성공적으로 조회했습니다.',
        });
        return { success: true, user };
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      setQueryResult({
        status: 'error',
        message: '사용자 정보 조회 중 오류가 발생했습니다.',
        error: error instanceof Error ? error.message : '알 수 없는 오류'
      });
      setUserInfo(null);
      return { success: false, user: null };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    queryResult,
    userInfo,
    isLoading,
    searchUser,
  };
}; 