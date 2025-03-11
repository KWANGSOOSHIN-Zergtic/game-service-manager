/**
 * 서비스 페이지에서 사용되는 타입 정의
 */

/**
 * 테이블 정보 인터페이스
 */
export interface TableInfo {
  id: number;
  table_name: string;
  table_type: string;
  rows_count: number;
  size: string;
  last_updated: string;
}

/**
 * 테이블 데이터 인터페이스
 */
export interface TableData {
  id: number;
  table_name: string;
  columns: Column[];
  rows: TableRow[];
}

/**
 * 컬럼 정보 인터페이스
 */
export interface Column {
  column_name: string;
  data_type: string;
  is_nullable: string;
}

/**
 * 테이블 행 인터페이스 - 동적 속성을 가진 객체
 * eslint-disable-next-line @typescript-eslint/no-explicit-any
 */
export interface TableRow {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

/**
 * 그룹화된 테이블 인터페이스
 */
export interface GroupedTables {
  [key: string]: TableInfo[];
}

/**
 * 검색 결과 인터페이스
 */
export interface SearchResult {
  status: 'success' | 'error' | null;
  message: string;
  tables?: TableInfo[];
}

/**
 * 테이블 조회 결과 인터페이스
 */
export interface TableViewResult {
  status: 'success' | 'error';
  message: string;
  data?: TableData;
}

/**
 * 데이터베이스 연결 정보 인터페이스
 */
export interface DbConnection {
  id: number;
  name: string;
  host: string;
  port: number;
  database: string;
  username: string;
}

/**
 * 검색 필터 옵션 타입
 */
export type SearchMatchType = 'prefix' | 'suffix' | 'contains'; 