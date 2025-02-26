import { useState, useEffect } from 'react';

type StorageType = 'local' | 'session';

/**
 * 브라우저 스토리지(localStorage 또는 sessionStorage)에 상태를 저장하고 관리하는 커스텀 훅
 * @param key 스토리지에 저장할 키
 * @param initialValue 초기값
 * @param storageType 'local' 또는 'session' 스토리지 타입
 * @returns [storedValue, setValue] - 현재 값과 값을 업데이트하는 함수
 */
export function useStorageState<T>(
  key: string,
  initialValue: T,
  storageType: StorageType = 'local'
): [T, (value: T | ((val: T) => T)) => void] {
  // 스토리지에서 값 로드
  const getStoredValue = (): T => {
    try {
      const storage = storageType === 'local' ? localStorage : sessionStorage;
      const item = storage.getItem(key);
      
      if (item === null) {
        return initialValue;
      }
      
      return JSON.parse(item);
    } catch (error) {
      console.error(`[useStorageState] Error loading ${storageType} storage value for key "${key}":`, error);
      return initialValue;
    }
  };
  
  const [storedValue, setStoredValue] = useState<T>(getStoredValue);
  
  // 값 변경 시 스토리지 업데이트
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      
      setStoredValue(valueToStore);
      
      const storage = storageType === 'local' ? localStorage : sessionStorage;
      storage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`[useStorageState] Error saving to ${storageType} storage for key "${key}":`, error);
    }
  };
  
  // 외부 스토리지 변경 감지 (다른 탭/창)
  useEffect(() => {
    if (storageType === 'local') {
      const handleStorageChange = (e: StorageEvent) => {
        if (e.key === key && e.storageArea === localStorage) {
          try {
            const newValue = e.newValue ? JSON.parse(e.newValue) : initialValue;
            setStoredValue(newValue);
          } catch (error) {
            console.error(`[useStorageState] Error parsing storage change for key "${key}":`, error);
          }
        }
      };
      
      window.addEventListener('storage', handleStorageChange);
      return () => window.removeEventListener('storage', handleStorageChange);
    }
  }, [key, initialValue, storageType]);
  
  return [storedValue, setValue];
} 