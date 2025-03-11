/**
 * 테이블 검색 목 데이터 테스트
 */

import { 
  mockDatabases, 
  mockTables, 
  mockColumns, 
  mockTableData, 
  getGroupedTables, 
  searchTables, 
  getTableColumns, 
  getTableData 
} from './test-data/db-tables-mock-data';

describe('DB Tables Mock Data 테스트', () => {
  // 데이터베이스 목 데이터 테스트
  describe('데이터베이스 목 데이터', () => {
    test('mockDatabases는 배열이어야 함', () => {
      expect(Array.isArray(mockDatabases)).toBe(true);
    });

    test('mockDatabases는 7개의 항목을 포함해야 함', () => {
      expect(mockDatabases.length).toBe(7);
    });

    test('mockDatabases의 각 항목은 index, name, description 속성을 가져야 함', () => {
      mockDatabases.forEach(db => {
        expect(db).toHaveProperty('index');
        expect(db).toHaveProperty('name');
        expect(db).toHaveProperty('description');
      });
    });
  });

  // 테이블 목 데이터 테스트
  describe('테이블 목 데이터', () => {
    test('mockTables는 객체여야 함', () => {
      expect(typeof mockTables).toBe('object');
    });

    test('mockTables는 각 DB에 대한 테이블 배열을 포함해야 함', () => {
      expect(mockTables).toHaveProperty('football_service');
      expect(Array.isArray(mockTables['football_service'])).toBe(true);
    });

    test('각 테이블은 필요한 속성을 가져야 함', () => {
      Object.values(mockTables).forEach(tableList => {
        if (Array.isArray(tableList) && tableList.length > 0) {
          const firstTable = tableList[0];
          expect(firstTable).toHaveProperty('id');
          expect(firstTable).toHaveProperty('table_name');
          expect(firstTable).toHaveProperty('table_type');
          expect(firstTable).toHaveProperty('rows_count');
          expect(firstTable).toHaveProperty('size');
          expect(firstTable).toHaveProperty('last_updated');
        }
      });
    });
  });

  // 컬럼 목 데이터 테스트
  describe('컬럼 목 데이터', () => {
    test('mockColumns는 객체여야 함', () => {
      expect(typeof mockColumns).toBe('object');
    });

    test('각 테이블에 대한 컬럼 정보가 있어야 함', () => {
      expect(mockColumns).toHaveProperty('excel_player_info');
      expect(Array.isArray(mockColumns['excel_player_info'])).toBe(true);
    });

    test('각 컬럼은 필요한 속성을 가져야 함', () => {
      Object.values(mockColumns).forEach(columnList => {
        if (Array.isArray(columnList) && columnList.length > 0) {
          const firstColumn = columnList[0];
          expect(firstColumn).toHaveProperty('column_name');
          expect(firstColumn).toHaveProperty('data_type');
          expect(firstColumn).toHaveProperty('is_nullable');
        }
      });
    });
  });

  // 테이블 데이터 목 데이터 테스트
  describe('테이블 데이터 목 데이터', () => {
    test('mockTableData는 객체여야 함', () => {
      expect(typeof mockTableData).toBe('object');
    });

    test('각 테이블에 대한 행 데이터가 있어야 함', () => {
      expect(mockTableData).toHaveProperty('excel_player_info');
      expect(Array.isArray(mockTableData['excel_player_info'])).toBe(true);
    });

    test('각 행은 필요한 속성을 가져야 함', () => {
      const playerRows = mockTableData['excel_player_info'];
      expect(playerRows[0]).toHaveProperty('id');
      expect(playerRows[0]).toHaveProperty('player_name');
    });
  });

  // 유틸리티 함수 테스트
  describe('유틸리티 함수', () => {
    test('getGroupedTables 함수는 테이블을 그룹화해야 함', () => {
      const sampleTables = [
        { id: 1, table_name: 'excel_test1', table_type: 'BASE TABLE', rows_count: 10, size: '0.1 MB', last_updated: '2023-01-01' },
        { id: 2, table_name: 'user_test1', table_type: 'BASE TABLE', rows_count: 20, size: '0.2 MB', last_updated: '2023-01-02' },
        { id: 3, table_name: 'log_test1', table_type: 'BASE TABLE', rows_count: 30, size: '0.3 MB', last_updated: '2023-01-03' }
      ];

      const grouped = getGroupedTables(sampleTables);
      expect(grouped).toHaveProperty('Excel Tables');
      expect(grouped).toHaveProperty('User Tables');
      expect(grouped).toHaveProperty('Log Tables');
      expect(grouped['Excel Tables'].length).toBe(1);
      expect(grouped['User Tables'].length).toBe(1);
      expect(grouped['Log Tables'].length).toBe(1);
    });

    test('searchTables 함수는 테이블을 검색해야 함', () => {
      // excel_ 접두어로 검색
      const excelTables = searchTables('football_service', 'excel_', 'prefix');
      expect(excelTables.length).toBeGreaterThan(0);
      excelTables.forEach(table => {
        expect(table.table_name.startsWith('excel_')).toBe(true);
      });

      // user_ 접두어로 검색
      const userTables = searchTables('football_service', 'user_', 'prefix');
      expect(userTables.length).toBeGreaterThan(0);
      userTables.forEach(table => {
        expect(table.table_name.startsWith('user_')).toBe(true);
      });
    });

    test('getTableColumns 함수는 테이블 컬럼을 반환해야 함', () => {
      const columns = getTableColumns('excel_player_info');
      expect(columns.length).toBeGreaterThan(0);
      expect(columns[0]).toHaveProperty('column_name');
      expect(columns[0]).toHaveProperty('data_type');
    });

    test('getTableData 함수는 테이블 데이터를 반환해야 함', () => {
      const rows = getTableData('excel_player_info');
      expect(rows.length).toBeGreaterThan(0);
      expect(rows[0]).toHaveProperty('id');
      expect(rows[0]).toHaveProperty('player_name');
    });
  });
}); 