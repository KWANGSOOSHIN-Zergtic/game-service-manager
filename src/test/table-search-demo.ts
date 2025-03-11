/**
 * 테이블 검색 데모 스크립트
 * 
 * 이 스크립트는 목 데이터를 사용하여 다양한 테이블 검색 조건의 결과를 확인합니다.
 */

import { 
  mockDatabases, 
  mockTables, 
  searchTables, 
  getGroupedTables 
} from './test-data/db-tables-mock-data';
import { TableInfo, GroupedTables } from '@/types/service.types';

// 사용 가능한 모든 데이터베이스 출력
console.log('=== 사용 가능한 데이터베이스 ===');
mockDatabases.forEach(db => {
  console.log(`${db.index}. ${db.name} - ${db.description}`);
});
console.log('\n');

// 첫 번째 데이터베이스 선택
const selectedDb = mockDatabases[0].name;
console.log(`선택된 데이터베이스: ${selectedDb}`);

// 1. 접두어(prefix) 검색 - 'excel_' 접두어로 시작하는 테이블 검색
console.log('\n=== "excel_" 접두어 검색 결과 ===');
const excelPrefixTables: TableInfo[] = searchTables(selectedDb, 'excel_', 'prefix');
excelPrefixTables.forEach(table => {
  console.log(`${table.table_name} (${table.rows_count}행, ${table.size})`);
});

// 2. 접미어(suffix) 검색 - '_info' 접미어로 끝나는 테이블 검색
console.log('\n=== "_info" 접미어 검색 결과 ===');
const infoSuffixTables: TableInfo[] = searchTables(selectedDb, '_info', 'suffix');
infoSuffixTables.forEach(table => {
  console.log(`${table.table_name} (${table.rows_count}행, ${table.size})`);
});

// 3. 포함(contains) 검색 - 'player' 문자열을 포함하는 테이블 검색
console.log('\n=== "player" 포함 검색 결과 ===');
const playerContainsTables: TableInfo[] = searchTables(selectedDb, 'player', 'contains');
playerContainsTables.forEach(table => {
  console.log(`${table.table_name} (${table.rows_count}행, ${table.size})`);
});

// 4. 빈 필터 - 모든 테이블 검색
console.log('\n=== 필터 없음(모든 테이블) 검색 결과 ===');
const allTables: TableInfo[] = searchTables(selectedDb, '', 'prefix');
console.log(`총 ${allTables.length}개의 테이블이 있습니다.`);

// 5. 그룹화된 테이블 출력
console.log('\n=== 그룹화된 테이블 ===');
const groupedTables: GroupedTables = getGroupedTables(allTables);
for (const prefix in groupedTables) {
  console.log(`\n[${prefix}] 그룹 (${groupedTables[prefix].length}개):`);
  groupedTables[prefix].forEach((table: TableInfo) => {
    console.log(`  - ${table.table_name}`);
  });
}

// 6. 전체 DB의 테이블 개수 출력
console.log('\n=== 전체 데이터베이스의 테이블 개수 ===');
for (const dbName in mockTables) {
  console.log(`${dbName}: ${mockTables[dbName].length}개 테이블`);
} 