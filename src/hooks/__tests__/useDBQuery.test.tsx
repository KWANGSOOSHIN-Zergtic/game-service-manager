import { renderHook, act } from '@testing-library/react';
import { useDBQuery } from '../useDBQuery';

// 전역 fetch 모킹
global.fetch = jest.fn();

describe('useDBQuery', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('초기 상태가 올바르게 설정되어야 합니다', () => {
    const { result } = renderHook(() => useDBQuery());

    expect(result.current.connectResult).toEqual({
      status: null,
      message: '',
    });
    expect(result.current.tableData).toEqual([]);
    expect(result.current.isLoading).toBe(false);
  });

  it('DB 연결 성공 시 테이블 데이터를 올바르게 로드해야 합니다', async () => {
    const mockDBResponse = {
      success: true,
      message: 'DB 연결 성공',
    };

    const mockTableResponse = {
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

    (global.fetch as jest.Mock)
      .mockImplementationOnce(() => Promise.resolve({
        json: () => Promise.resolve(mockDBResponse),
      }))
      .mockImplementationOnce(() => Promise.resolve({
        json: () => Promise.resolve(mockTableResponse),
      }));

    const { result } = renderHook(() => useDBQuery());

    await act(async () => {
      await result.current.connectDB('test_db');
    });

    expect(result.current.connectResult).toEqual({
      status: 'success',
      message: 'DB 연결 성공',
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
  });

  it('DB 연결 실패 시 테이블 데이터를 로드하지 않아야 합니다', async () => {
    const mockErrorResponse = {
      success: false,
      message: 'DB 연결 실패',
      error: '연결 오류',
    };

    (global.fetch as jest.Mock).mockImplementationOnce(() => Promise.resolve({
      json: () => Promise.resolve(mockErrorResponse),
    }));

    const { result } = renderHook(() => useDBQuery());

    await act(async () => {
      await result.current.connectDB('test_db');
    });

    expect(result.current.connectResult).toEqual({
      status: 'error',
      message: 'DB 연결 실패',
      error: '연결 오류',
    });

    expect(result.current.tableData).toEqual([]);
    expect(global.fetch).toHaveBeenCalledTimes(1); // 테이블 데이터 로드 API가 호출되지 않아야 함
  });

  it('테이블 데이터 로드 실패 시 에러 상태를 올바르게 설정해야 합니다', async () => {
    const mockDBResponse = {
      success: true,
      message: 'DB 연결 성공',
    };

    const mockTableErrorResponse = {
      success: false,
      error: '테이블 로드 실패',
    };

    (global.fetch as jest.Mock)
      .mockImplementationOnce(() => Promise.resolve({
        json: () => Promise.resolve(mockDBResponse),
      }))
      .mockImplementationOnce(() => Promise.resolve({
        json: () => Promise.resolve(mockTableErrorResponse),
      }));

    const { result } = renderHook(() => useDBQuery());

    await act(async () => {
      await result.current.connectDB('test_db');
    });

    expect(result.current.tableData).toEqual([]);
  });
}); 