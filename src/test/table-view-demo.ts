/**
 * 테이블 상세 조회 데모 스크립트
 * 
 * 이 스크립트는 목 데이터를 사용하여 테이블 컬럼 정보와 데이터 조회 결과를 확인합니다.
 */

import { 
  getTableColumns, 
  getTableData 
} from './test-data/db-tables-mock-data';
import { Column, TableRow } from '@/types/service.types';

// 조회할 테이블 목록
const tableNames = [
  'excel_player_info',
  'excel_team_info',
  'user_session'
];

// 각 테이블에 대한 컬럼 정보와 샘플 데이터 조회
for (const tableName of tableNames) {
  console.log(`\n===== ${tableName} 테이블 정보 =====\n`);
  
  // 1. 컬럼 정보 조회
  console.log(`----- 컬럼 정보 -----`);
  const columns: Column[] = getTableColumns(tableName);
  
  if (columns.length === 0) {
    console.log(`컬럼 정보가 없습니다.`);
  } else {
    console.log('| 컬럼명 | 데이터 타입 | NULL 허용 |');
    console.log('|--------|------------|-----------|');
    columns.forEach(column => {
      console.log(`| ${column.column_name} | ${column.data_type} | ${column.is_nullable} |`);
    });
  }
  
  // 2. 테이블 데이터 조회
  console.log(`\n----- 데이터 샘플 (최대 3행) -----`);
  const rows: TableRow[] = getTableData(tableName);
  
  if (rows.length === 0) {
    console.log(`데이터가 없습니다.`);
  } else {
    // 최대 3행만 출력
    const sampleRows = rows.slice(0, 3);
    
    // 컬럼명 목록 가져오기 (첫 번째 행 기준)
    const columnNames = Object.keys(sampleRows[0]);
    
    // 헤더 출력
    console.log('| ' + columnNames.join(' | ') + ' |');
    console.log('| ' + columnNames.map(() => '---').join(' | ') + ' |');
    
    // 데이터 행 출력
    sampleRows.forEach(row => {
      const values = columnNames.map(col => {
        // 널 값이나 복잡한 객체 처리
        if (row[col] === null) return 'NULL';
        if (typeof row[col] === 'object') return JSON.stringify(row[col]);
        return row[col];
      });
      
      console.log('| ' + values.join(' | ') + ' |');
    });
    
    // 총 행 수
    console.log(`\n총 ${rows.length}개 행 중 ${sampleRows.length}개 행 표시됨`);
  }
}

// 조회 테스트: 존재하지 않는 테이블
console.log(`\n===== 존재하지 않는 테이블 조회 테스트 =====\n`);
const nonExistentTable = 'non_existent_table';
console.log(`----- ${nonExistentTable} 컬럼 조회 -----`);
const columns = getTableColumns(nonExistentTable);
console.log(`결과: ${columns.length === 0 ? '컬럼 정보 없음' : `${columns.length}개 컬럼 정보 있음`}`);

console.log(`\n----- ${nonExistentTable} 데이터 조회 -----`);
const rows = getTableData(nonExistentTable);
console.log(`결과: ${rows.length === 0 ? '데이터 없음' : `${rows.length}개 행 있음`}`); 