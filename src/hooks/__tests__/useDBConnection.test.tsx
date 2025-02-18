import { renderHook, act } from '@testing-library/react';
import { useDBConnection } from '../useDBConnection';

// 전역 fetch 모킹
global.fetch = jest.fn();

describe('useDBConnection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('초기 상태가 올바르게 설정되어야 합니다', () => {
    const { result } = renderHook(() => useDBConnection());

    expect(result.current.connectionResult).toEqual({
      status: null,
      message: '',
    });
    expect(result.current.isConnecting).toBe(false);
  });

  it('DB 연결 성공 시 상태가 올바르게 업데이트되어야 합니다', async () => {
    const mockResponse = {
      success: true,
      message: 'DB 연결 성공',
    };

    (global.fetch as jest.Mock).mockImplementationOnce(() => Promise.resolve({
      json: () => Promise.resolve(mockResponse),
    }));

    const { result } = renderHook(() => useDBConnection());

    await act(async () => {
      const success = await result.current.connectToDatabase('test_db');
      expect(success).toBe(true);
    });

    expect(result.current.connectionResult).toEqual({
      status: 'success',
      message: 'DB 연결 성공',
    });
    expect(result.current.isConnecting).toBe(false);
  });

  it('DB 연결 실패 시 상태가 올바르게 업데이트되어야 합니다', async () => {
    const mockResponse = {
      success: false,
      message: 'DB 연결 실패',
      error: '연결 오류',
    };

    (global.fetch as jest.Mock).mockImplementationOnce(() => Promise.resolve({
      json: () => Promise.resolve(mockResponse),
    }));

    const { result } = renderHook(() => useDBConnection());

    await act(async () => {
      const success = await result.current.connectToDatabase('test_db');
      expect(success).toBe(false);
    });

    expect(result.current.connectionResult).toEqual({
      status: 'error',
      message: 'DB 연결 실패',
      error: '연결 오류',
    });
    expect(result.current.isConnecting).toBe(false);
  });

  it('네트워크 오류 발생 시 상태가 올바르게 업데이트되어야 합니다', async () => {
    (global.fetch as jest.Mock).mockImplementationOnce(() => Promise.reject(new Error('Network error')));

    const { result } = renderHook(() => useDBConnection());

    await act(async () => {
      const success = await result.current.connectToDatabase('test_db');
      expect(success).toBe(false);
    });

    expect(result.current.connectionResult).toEqual({
      status: 'error',
      message: 'DB 연결 중 오류가 발생했습니다.',
      error: 'Network error',
    });
    expect(result.current.isConnecting).toBe(false);
  });

  it('dbName이 없을 경우 API를 호출하지 않아야 합니다', async () => {
    const { result } = renderHook(() => useDBConnection());

    await act(async () => {
      const success = await result.current.connectToDatabase('');
      expect(success).toBe(false);
    });

    expect(global.fetch).not.toHaveBeenCalled();
    expect(result.current.isConnecting).toBe(false);
  });
}); 