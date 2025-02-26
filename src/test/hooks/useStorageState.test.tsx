import { renderHook, act } from '@testing-library/react';
import { useStorageState } from '../../components/debug/hooks/useStorageState';

// localStorage 모킹
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

// sessionStorage 모킹
const sessionStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

describe('useStorageState 훅', () => {
  beforeAll(() => {
    // 원래 localStorage와 sessionStorage 백업
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
    });
    
    Object.defineProperty(window, 'sessionStorage', {
      value: sessionStorageMock,
      writable: true,
    });
  });

  beforeEach(() => {
    // 스토리지 초기화
    window.localStorage.clear();
    window.sessionStorage.clear();
    
    // localStorage에 이벤트 디스패치 함수 추가
    window.dispatchEvent = jest.fn();
  });

  test('초기값을 올바르게 로드해야 함', () => {
    const { result } = renderHook(() => 
      useStorageState('testKey', 'initialValue'));
    
    const [value] = result.current;
    expect(value).toBe('initialValue');
  });

  test('localStorage에 값을 저장해야 함', () => {
    const { result } = renderHook(() => 
      useStorageState('testKey', 'initialValue'));
    
    act(() => {
      const setValue = result.current[1];
      setValue('updatedValue');
    });
    
    const storedValue = window.localStorage.getItem('testKey');
    expect(storedValue).toBe(JSON.stringify('updatedValue'));
    
    const [value] = result.current;
    expect(value).toBe('updatedValue');
  });

  test('복잡한 객체를 저장하고 불러올 수 있어야 함', () => {
    const complexObject = { 
      name: 'Test', 
      items: [1, 2, 3], 
      nested: { key: 'value' } 
    };
    
    const { result } = renderHook(() => 
      useStorageState('complexKey', complexObject));
    
    const [initialValue] = result.current;
    expect(initialValue).toEqual(complexObject);
    
    act(() => {
      const setValue = result.current[1];
      setValue({
        ...complexObject,
        name: 'Updated'
      });
    });
    
    const [updatedValue] = result.current;
    expect(updatedValue.name).toBe('Updated');
    
    const storedValue = JSON.parse(window.localStorage.getItem('complexKey') || '{}');
    expect(storedValue.name).toBe('Updated');
  });

  test('세션 스토리지 사용 시 sessionStorage에 값을 저장해야 함', () => {
    const { result } = renderHook(() => 
      useStorageState('sessionKey', 'sessionValue', 'session'));
    
    act(() => {
      const setValue = result.current[1];
      setValue('updatedSessionValue');
    });
    
    const storedValue = window.sessionStorage.getItem('sessionKey');
    expect(storedValue).toBe(JSON.stringify('updatedSessionValue'));
    
    const [value] = result.current;
    expect(value).toBe('updatedSessionValue');
  });

  test('함수 업데이터를 사용할 수 있어야 함', () => {
    const { result } = renderHook(() => 
      useStorageState<number>('counterKey', 0));
    
    act(() => {
      const setValue = result.current[1];
      setValue((prev) => prev + 1);
    });
    
    const [value] = result.current;
    expect(value).toBe(1);
    
    act(() => {
      const setValue = result.current[1];
      setValue((prev) => prev + 5);
    });
    
    const [newValue] = result.current;
    expect(newValue).toBe(6);
    
    const storedValue = JSON.parse(window.localStorage.getItem('counterKey') || '0');
    expect(storedValue).toBe(6);
  });
}); 