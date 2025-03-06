/**
 * 테이블 데이터 관련 공통 타입 정의
 */

/**
 * 기본 테이블 데이터 인터페이스
 * 모든 테이블 데이터 타입의 기본이 되는 인터페이스
 */
export interface IBaseTableData {
  id: number;
  [key: string]: unknown;
}

/**
 * UI 컴포넌트용 테이블 데이터 인터페이스
 * UI 컴포넌트에서 사용되는 테이블 데이터 타입
 */
export interface IUITableData {
  id: number;
  displayIndex?: number;
  [key: string]: string | number | boolean | null | object | undefined;
}

/**
 * DB 테이블 정보 인터페이스
 * 데이터베이스 테이블 정보를 나타내는 타입
 */
export interface IDBTableData {
  id: number;
  name: string;
  type: string;
  size: string;
  rows: number;
  [key: string]: unknown;
}

/**
 * 테이블 컬럼 정의 인터페이스
 */
export interface ITableColumn {
  key: string;
  label: string;
  width?: string;
  format?: (value: string | number | boolean | object | null | undefined) => string | number | React.ReactNode;
  type?: 'string' | 'number' | 'currency' | 'percentage' | 'object';
  sortable?: boolean;
  align?: 'left' | 'center' | 'right';
} 