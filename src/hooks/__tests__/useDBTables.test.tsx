import { renderHook, act } from '@testing-library/react';
import { useDBTables } from '../useDBTables';

// 전역 fetch 모킹
global.fetch = jest.fn();

describe('useDBTables', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('초기 상태가 올바르게 설정되어야 합니다', () => {
    const { result } = renderHook(() => useDBTables());

    expect(result.current.tablesResult).toEqual({
      status: null,
      message: '',
    });
    expect(result.current.tableData).toEqual([]);
    expect(result.current.isLoading).toBe(false);
  });

  it('테이블 목록 조회 성공 시 상태가 올바르게 업데이트되어야 합니다', async () => {
    const mockResponse = {
      success: true,
      tables: [
        {
          name: 'test_table',
          type: 'table',
          size: '1MB',
          rows: 100,
        },
      ],
    };

    (global.fetch as jest.Mock).mockImplementationOnce(() => Promise.resolve({
      json: () => Promise.resolve(mockResponse),
    }));

    const { result } = renderHook(() => useDBTables());

    await act(async () => {
      const success = await result.current.fetchTables('test_db');
      expect(success).toBe(true);
    });

    expect(result.current.tablesResult).toEqual({
      status: 'success',
      message: '테이블 목록을 성공적으로 불러왔습니다.',
    });
    expect(result.current.tableData).toEqual([
      {
        id: 1,
        name: 'test_table',
        type: 'table',
        size: '1MB',
        rows: 100,
      },
    ]);
    expect(result.current.isLoading).toBe(false);
  });

  it('테이블 목록 조회 실패 시 상태가 올바르게 업데이트되어야 합니다', async () => {
    const mockResponse = {
      success: false,
      error: '테이블 조회 실패',
    };

    (global.fetch as jest.Mock).mockImplementationOnce(() => Promise.resolve({
      json: () => Promise.resolve(mockResponse),
    }));

    const { result } = renderHook(() => useDBTables());

    await act(async () => {
      const success = await result.current.fetchTables('test_db');
      expect(success).toBe(false);
    });

    expect(result.current.tablesResult).toEqual({
      status: 'error',
      message: '테이블 목록 조회 중 오류가 발생했습니다.',
      error: '테이블 조회 실패',
    });
    expect(result.current.tableData).toEqual([]);
    expect(result.current.isLoading).toBe(false);
  });

  it('네트워크 오류 발생 시 상태가 올바르게 업데이트되어야 합니다', async () => {
    (global.fetch as jest.Mock).mockImplementationOnce(() => Promise.reject(new Error('Network error')));

    const { result } = renderHook(() => useDBTables());

    await act(async () => {
      const success = await result.current.fetchTables('test_db');
      expect(success).toBe(false);
    });

    expect(result.current.tablesResult).toEqual({
      status: 'error',
      message: '테이블 목록 조회 중 오류가 발생했습니다.',
      error: 'Network error',
    });
    expect(result.current.tableData).toEqual([]);
    expect(result.current.isLoading).toBe(false);
  });

  it('dbName이 없을 경우 API를 호출하지 않아야 합니다', async () => {
    const { result } = renderHook(() => useDBTables());

    await act(async () => {
      const success = await result.current.fetchTables('');
      expect(success).toBe(false);
    });

    expect(global.fetch).not.toHaveBeenCalled();
    expect(result.current.isLoading).toBe(false);
  });
}); 