/**
 * 타입 변환 유틸리티 함수
 */
import { IBaseTableData, IUITableData, IDBTableData } from '@/types/table.types';

/**
 * 알 수 없는 타입의 값을 UI 컴포넌트에서 사용 가능한 타입으로 변환
 * @param value 변환할 값
 * @returns UI 컴포넌트에서 사용 가능한 타입으로 변환된 값
 */
export function convertToUIValue(value: unknown): string | number | boolean | null | object | undefined {
  if (
    value === null || 
    value === undefined || 
    typeof value === 'string' || 
    typeof value === 'number' || 
    typeof value === 'boolean' || 
    typeof value === 'object'
  ) {
    return value as string | number | boolean | null | object | undefined;
  }
  
  // 다른 타입의 경우 문자열로 변환
  return String(value);
}

/**
 * 기본 테이블 데이터를 UI 테이블 데이터로 변환
 * @param data 변환할 기본 테이블 데이터
 * @returns UI 테이블 데이터
 */
export function convertToUITableData<T extends IBaseTableData>(data: T): IUITableData {
  const result: IUITableData = { id: data.id };
  
  Object.entries(data).forEach(([key, value]) => {
    result[key] = convertToUIValue(value);
  });
  
  return result;
}

/**
 * 기본 테이블 데이터 배열을 UI 테이블 데이터 배열로 변환
 * @param dataArray 변환할 기본 테이블 데이터 배열
 * @returns UI 테이블 데이터 배열
 */
export function convertToUITableDataArray<T extends IBaseTableData>(dataArray: T[]): IUITableData[] {
  return dataArray.map(item => convertToUITableData(item));
}

/**
 * DB 테이블 데이터를 UI 테이블 데이터로 변환
 * @param data 변환할 DB 테이블 데이터
 * @returns UI 테이블 데이터
 */
export function convertDBToUITableData(data: IDBTableData): IUITableData {
  return convertToUITableData(data);
}

/**
 * DB 테이블 데이터 배열을 UI 테이블 데이터 배열로 변환
 * @param dataArray 변환할 DB 테이블 데이터 배열
 * @returns UI 테이블 데이터 배열
 */
export function convertDBToUITableDataArray(dataArray: IDBTableData[]): IUITableData[] {
  return dataArray.map(item => convertDBToUITableData(item));
} 