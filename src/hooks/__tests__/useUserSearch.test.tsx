import { renderHook, act } from '@testing-library/react';
import { useUserSearch } from '../useUserSearch';

// 전역 fetch 모킹
global.fetch = jest.fn();

describe('useUserSearch', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('초기 상태가 올바르게 설정되어야 합니다', () => {
    const { result } = renderHook(() => useUserSearch());

    expect(result.current.queryResult).toEqual({
      status: null,
      message: '',
    });
    expect(result.current.userInfo).toBeNull();
    expect(result.current.isLoading).toBe(false);
  });

  it('사용자 검색 성공 시 상태가 올바르게 업데이트되어야 합니다', async () => {
    const mockResponse = {
      success: true,
      user: {
        id: 'test001',
        name: 'Test User',
        email: 'test@example.com',
        role: 'user',
        created_at: '2024-02-18T00:00:00Z',
        updated_at: '2024-02-18T00:00:00Z',
      },
    };

    (global.fetch as jest.Mock).mockImplementationOnce(() => Promise.resolve({
      json: () => Promise.resolve(mockResponse),
    }));

    const { result } = renderHook(() => useUserSearch());

    await act(async () => {
      const success = await result.current.searchUser('test_db', 'test001');
      expect(success).toBe(true);
    });

    expect(result.current.queryResult).toEqual({
      status: 'success',
      message: '사용자 정보를 성공적으로 조회했습니다.',
    });
    expect(result.current.userInfo).toEqual(mockResponse.user);
    expect(result.current.isLoading).toBe(false);
  });

  it('사용자 검색 실패 시 상태가 올바르게 업데이트되어야 합니다', async () => {
    const mockResponse = {
      success: false,
      error: '사용자를 찾을 수 없습니다.',
    };

    (global.fetch as jest.Mock).mockImplementationOnce(() => Promise.resolve({
      json: () => Promise.resolve(mockResponse),
    }));

    const { result } = renderHook(() => useUserSearch());

    await act(async () => {
      const success = await result.current.searchUser('test_db', 'nonexistent');
      expect(success).toBe(false);
    });

    expect(result.current.queryResult).toEqual({
      status: 'error',
      message: '사용자 정보 조회 중 오류가 발생했습니다.',
      error: '사용자를 찾을 수 없습니다.',
    });
    expect(result.current.userInfo).toBeNull();
    expect(result.current.isLoading).toBe(false);
  });

  it('네트워크 오류 발생 시 상태가 올바르게 업데이트되어야 합니다', async () => {
    (global.fetch as jest.Mock).mockImplementationOnce(() => Promise.reject(new Error('Network error')));

    const { result } = renderHook(() => useUserSearch());

    await act(async () => {
      const success = await result.current.searchUser('test_db', 'test001');
      expect(success).toBe(false);
    });

    expect(result.current.queryResult).toEqual({
      status: 'error',
      message: '사용자 정보 조회 중 오류가 발생했습니다.',
      error: 'Network error',
    });
    expect(result.current.userInfo).toBeNull();
    expect(result.current.isLoading).toBe(false);
  });

  it('필수 파라미터가 없을 경우 API를 호출하지 않아야 합니다', async () => {
    const { result } = renderHook(() => useUserSearch());

    await act(async () => {
      const success1 = await result.current.searchUser('', 'test001');
      expect(success1).toBe(false);

      const success2 = await result.current.searchUser('test_db', '');
      expect(success2).toBe(false);
    });

    expect(global.fetch).not.toHaveBeenCalled();
    expect(result.current.isLoading).toBe(false);
  });
}); 