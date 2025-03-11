/**
 * 테이블 검색 기능을 위한 목 데이터
 * Service 페이지에서 테이블 검색 기능을 테스트하기 위한 데이터입니다.
 */

import { TableInfo, Column, TableRow, GroupedTables } from '@/types/service.types';

/**
 * 데이터베이스 목록
 */
export interface DbInfo {
  index: number;
  name: string;
  description: string;
}

/**
 * 데이터베이스 목록 데이터
 */
export const mockDatabases: DbInfo[] = [
  { index: 1, name: 'football_service', description: '축구 게임 서비스 메인 DB' },
  { index: 2, name: 'football_log', description: '축구 게임 로그 데이터 DB' },
  { index: 3, name: 'football_game', description: '축구 게임 플레이 데이터 DB' },
  { index: 4, name: 'football_user', description: '축구 게임 유저 데이터 DB' },
  { index: 5, name: 'football_currency', description: '축구 게임 재화 데이터 DB' },
  { index: 6, name: 'football_event', description: '축구 게임 이벤트 데이터 DB' },
  { index: 7, name: 'test_db', description: '테스트용 DB' },
];

/**
 * 테이블 목록 데이터
 */
export const mockTables: { [key: string]: TableInfo[] } = {
  'football_service': [
    { id: 1, table_name: 'excel_player_info', table_type: 'BASE TABLE', rows_count: 12500, size: '15.2 MB', last_updated: '2023-05-15 09:30:22' },
    { id: 2, table_name: 'excel_team_info', table_type: 'BASE TABLE', rows_count: 350, size: '2.4 MB', last_updated: '2023-05-15 09:30:24' },
    { id: 3, table_name: 'excel_league_info', table_type: 'BASE TABLE', rows_count: 45, size: '1.2 MB', last_updated: '2023-05-15 09:30:26' },
    { id: 4, table_name: 'excel_stadium_info', table_type: 'BASE TABLE', rows_count: 175, size: '3.5 MB', last_updated: '2023-05-15 09:30:28' },
    { id: 5, table_name: 'excel_item_info', table_type: 'BASE TABLE', rows_count: 3200, size: '5.7 MB', last_updated: '2023-05-15 09:30:30' },
    { id: 6, table_name: 'user_session', table_type: 'BASE TABLE', rows_count: 15000, size: '10.2 MB', last_updated: '2023-05-20 14:25:30' },
    { id: 7, table_name: 'user_auth', table_type: 'BASE TABLE', rows_count: 52000, size: '8.5 MB', last_updated: '2023-05-20 14:25:32' },
    { id: 8, table_name: 'game_match', table_type: 'BASE TABLE', rows_count: 186000, size: '45.8 MB', last_updated: '2023-05-20 14:25:34' },
    { id: 9, table_name: 'system_config', table_type: 'BASE TABLE', rows_count: 120, size: '0.5 MB', last_updated: '2023-05-15 09:30:40' },
  ],
  'football_log': [
    { id: 10, table_name: 'log_user_login', table_type: 'BASE TABLE', rows_count: 450000, size: '65.3 MB', last_updated: '2023-05-20 14:30:00' },
    { id: 11, table_name: 'log_user_payment', table_type: 'BASE TABLE', rows_count: 125000, size: '35.6 MB', last_updated: '2023-05-20 14:30:02' },
    { id: 12, table_name: 'log_game_match', table_type: 'BASE TABLE', rows_count: 275000, size: '120.4 MB', last_updated: '2023-05-20 14:30:04' },
    { id: 13, table_name: 'log_item_usage', table_type: 'BASE TABLE', rows_count: 580000, size: '87.2 MB', last_updated: '2023-05-20 14:30:06' },
    { id: 14, table_name: 'log_error', table_type: 'BASE TABLE', rows_count: 12500, size: '25.1 MB', last_updated: '2023-05-20 14:30:08' },
  ],
  'football_game': [
    { id: 15, table_name: 'game_data', table_type: 'BASE TABLE', rows_count: 85000, size: '43.2 MB', last_updated: '2023-05-20 15:10:00' },
    { id: 16, table_name: 'game_result', table_type: 'BASE TABLE', rows_count: 65000, size: '32.5 MB', last_updated: '2023-05-20 15:10:02' },
    { id: 17, table_name: 'game_ranking', table_type: 'BASE TABLE', rows_count: 25000, size: '12.3 MB', last_updated: '2023-05-20 15:10:04' },
    { id: 18, table_name: 'excel_game_config', table_type: 'BASE TABLE', rows_count: 450, size: '1.8 MB', last_updated: '2023-05-15 09:35:10' },
    { id: 19, table_name: 'excel_skill_info', table_type: 'BASE TABLE', rows_count: 750, size: '2.3 MB', last_updated: '2023-05-15 09:35:12' },
  ],
  'football_user': [
    { id: 20, table_name: 'user_profile', table_type: 'BASE TABLE', rows_count: 52000, size: '28.5 MB', last_updated: '2023-05-20 16:15:00' },
    { id: 21, table_name: 'user_inventory', table_type: 'BASE TABLE', rows_count: 48000, size: '35.7 MB', last_updated: '2023-05-20 16:15:02' },
    { id: 22, table_name: 'user_team', table_type: 'BASE TABLE', rows_count: 47500, size: '26.8 MB', last_updated: '2023-05-20 16:15:04' },
    { id: 23, table_name: 'user_friend', table_type: 'BASE TABLE', rows_count: 185000, size: '15.3 MB', last_updated: '2023-05-20 16:15:06' },
    { id: 24, table_name: 'excel_user_level', table_type: 'BASE TABLE', rows_count: 100, size: '0.4 MB', last_updated: '2023-05-15 09:40:20' },
  ],
  'football_currency': [
    { id: 25, table_name: 'currency_gold', table_type: 'BASE TABLE', rows_count: 51000, size: '12.7 MB', last_updated: '2023-05-20 17:20:00' },
    { id: 26, table_name: 'currency_gem', table_type: 'BASE TABLE', rows_count: 50500, size: '12.5 MB', last_updated: '2023-05-20 17:20:02' },
    { id: 27, table_name: 'currency_point', table_type: 'BASE TABLE', rows_count: 49800, size: '11.9 MB', last_updated: '2023-05-20 17:20:04' },
    { id: 28, table_name: 'currency_ticket', table_type: 'BASE TABLE', rows_count: 48200, size: '10.8 MB', last_updated: '2023-05-20 17:20:06' },
    { id: 29, table_name: 'excel_shop_price', table_type: 'BASE TABLE', rows_count: 250, size: '0.8 MB', last_updated: '2023-05-15 09:45:30' },
  ],
  'football_event': [
    { id: 30, table_name: 'event_schedule', table_type: 'BASE TABLE', rows_count: 85, size: '0.5 MB', last_updated: '2023-05-15 10:10:00' },
    { id: 31, table_name: 'event_reward', table_type: 'BASE TABLE', rows_count: 520, size: '1.8 MB', last_updated: '2023-05-15 10:10:02' },
    { id: 32, table_name: 'event_user', table_type: 'BASE TABLE', rows_count: 42000, size: '15.3 MB', last_updated: '2023-05-20 18:30:00' },
    { id: 33, table_name: 'excel_event_config', table_type: 'BASE TABLE', rows_count: 65, size: '0.3 MB', last_updated: '2023-05-15 10:10:10' },
  ],
  'test_db': [
    { id: 34, table_name: 'test_table_1', table_type: 'BASE TABLE', rows_count: 10, size: '0.1 MB', last_updated: '2023-05-10 11:00:00' },
    { id: 35, table_name: 'test_table_2', table_type: 'BASE TABLE', rows_count: 20, size: '0.2 MB', last_updated: '2023-05-10 11:00:02' },
    { id: 36, table_name: 'excel_test_data', table_type: 'BASE TABLE', rows_count: 5, size: '0.1 MB', last_updated: '2023-05-10 11:00:04' },
  ],
};

/**
 * 테이블 컬럼 정보 데이터
 */
export const mockColumns: { [key: string]: Column[] } = {
  'excel_player_info': [
    { column_name: 'id', data_type: 'integer', is_nullable: 'NO' },
    { column_name: 'player_name', data_type: 'character varying', is_nullable: 'NO' },
    { column_name: 'position', data_type: 'character varying', is_nullable: 'NO' },
    { column_name: 'team_id', data_type: 'integer', is_nullable: 'NO' },
    { column_name: 'overall_rating', data_type: 'integer', is_nullable: 'NO' },
    { column_name: 'shooting', data_type: 'integer', is_nullable: 'NO' },
    { column_name: 'passing', data_type: 'integer', is_nullable: 'NO' },
    { column_name: 'dribbling', data_type: 'integer', is_nullable: 'NO' },
    { column_name: 'defense', data_type: 'integer', is_nullable: 'NO' },
    { column_name: 'physical', data_type: 'integer', is_nullable: 'NO' },
    { column_name: 'created_at', data_type: 'timestamp', is_nullable: 'NO' },
    { column_name: 'updated_at', data_type: 'timestamp', is_nullable: 'YES' },
  ],
  'excel_team_info': [
    { column_name: 'id', data_type: 'integer', is_nullable: 'NO' },
    { column_name: 'team_name', data_type: 'character varying', is_nullable: 'NO' },
    { column_name: 'league_id', data_type: 'integer', is_nullable: 'NO' },
    { column_name: 'stadium_id', data_type: 'integer', is_nullable: 'NO' },
    { column_name: 'team_rating', data_type: 'integer', is_nullable: 'NO' },
    { column_name: 'created_at', data_type: 'timestamp', is_nullable: 'NO' },
    { column_name: 'updated_at', data_type: 'timestamp', is_nullable: 'YES' },
  ],
  'user_profile': [
    { column_name: 'id', data_type: 'integer', is_nullable: 'NO' },
    { column_name: 'user_id', data_type: 'character varying', is_nullable: 'NO' },
    { column_name: 'nickname', data_type: 'character varying', is_nullable: 'NO' },
    { column_name: 'level', data_type: 'integer', is_nullable: 'NO' },
    { column_name: 'exp', data_type: 'integer', is_nullable: 'NO' },
    { column_name: 'created_at', data_type: 'timestamp', is_nullable: 'NO' },
    { column_name: 'last_login_at', data_type: 'timestamp', is_nullable: 'YES' },
    { column_name: 'status', data_type: 'character varying', is_nullable: 'NO' },
  ],
  'game_match': [
    { column_name: 'id', data_type: 'bigint', is_nullable: 'NO' },
    { column_name: 'match_type', data_type: 'character varying', is_nullable: 'NO' },
    { column_name: 'home_team_id', data_type: 'integer', is_nullable: 'NO' },
    { column_name: 'away_team_id', data_type: 'integer', is_nullable: 'NO' },
    { column_name: 'home_score', data_type: 'integer', is_nullable: 'NO' },
    { column_name: 'away_score', data_type: 'integer', is_nullable: 'NO' },
    { column_name: 'match_date', data_type: 'timestamp', is_nullable: 'NO' },
    { column_name: 'stadium_id', data_type: 'integer', is_nullable: 'NO' },
    { column_name: 'status', data_type: 'character varying', is_nullable: 'NO' },
  ],
};

/**
 * 테이블 데이터 샘플
 */
export const mockTableData: { [key: string]: TableRow[] } = {
  'excel_player_info': [
    { id: 1, player_name: '손흥민', position: 'FW', team_id: 10, overall_rating: 89, shooting: 90, passing: 85, dribbling: 87, defense: 45, physical: 79, created_at: '2023-01-15 10:00:00', updated_at: '2023-05-12 15:30:00' },
    { id: 2, player_name: '이강인', position: 'MF', team_id: 15, overall_rating: 85, shooting: 82, passing: 88, dribbling: 89, defense: 60, physical: 74, created_at: '2023-01-15 10:10:00', updated_at: '2023-05-12 15:35:00' },
    { id: 3, player_name: '김민재', position: 'DF', team_id: 20, overall_rating: 86, shooting: 40, passing: 72, dribbling: 68, defense: 87, physical: 90, created_at: '2023-01-15 10:20:00', updated_at: '2023-05-12 15:40:00' },
    { id: 4, player_name: '황희찬', position: 'FW', team_id: 25, overall_rating: 84, shooting: 85, passing: 80, dribbling: 83, defense: 42, physical: 78, created_at: '2023-01-15 10:30:00', updated_at: '2023-05-12 15:45:00' },
    { id: 5, player_name: '조규성', position: 'FW', team_id: 30, overall_rating: 82, shooting: 84, passing: 75, dribbling: 76, defense: 40, physical: 86, created_at: '2023-01-15 10:40:00', updated_at: '2023-05-12 15:50:00' },
  ],
  'excel_team_info': [
    { id: 10, team_name: '토트넘 홋스퍼', league_id: 1, stadium_id: 100, team_rating: 85, created_at: '2023-01-15 11:00:00', updated_at: '2023-05-12 16:00:00' },
    { id: 15, team_name: 'PSG', league_id: 2, stadium_id: 105, team_rating: 86, created_at: '2023-01-15 11:10:00', updated_at: '2023-05-12 16:10:00' },
    { id: 20, team_name: '바이에른 뮌헨', league_id: 3, stadium_id: 110, team_rating: 87, created_at: '2023-01-15 11:20:00', updated_at: '2023-05-12 16:20:00' },
    { id: 25, team_name: '울버햄튼', league_id: 1, stadium_id: 115, team_rating: 81, created_at: '2023-01-15 11:30:00', updated_at: '2023-05-12 16:30:00' },
    { id: 30, team_name: '마인츠', league_id: 3, stadium_id: 120, team_rating: 80, created_at: '2023-01-15 11:40:00', updated_at: '2023-05-12 16:40:00' },
  ],
  'user_profile': [
    { id: 1001, user_id: 'user001', nickname: '축구왕', level: 25, exp: 12500, created_at: '2023-02-10 09:15:00', last_login_at: '2023-05-20 14:30:00', status: 'ACTIVE' },
    { id: 1002, user_id: 'user002', nickname: '골넣자', level: 18, exp: 8200, created_at: '2023-02-15 10:20:00', last_login_at: '2023-05-19 18:45:00', status: 'ACTIVE' },
    { id: 1003, user_id: 'user003', nickname: '수비의신', level: 30, exp: 18500, created_at: '2023-01-20 14:30:00', last_login_at: '2023-05-20 08:15:00', status: 'ACTIVE' },
    { id: 1004, user_id: 'user004', nickname: '미드필더', level: 12, exp: 5800, created_at: '2023-03-05 16:40:00', last_login_at: '2023-05-15 20:10:00', status: 'INACTIVE' },
    { id: 1005, user_id: 'user005', nickname: '골키퍼', level: 22, exp: 10900, created_at: '2023-02-28 11:50:00', last_login_at: '2023-05-18 12:25:00', status: 'ACTIVE' },
  ],
  'game_match': [
    { id: 10001, match_type: 'LEAGUE', home_team_id: 10, away_team_id: 25, home_score: 3, away_score: 1, match_date: '2023-05-15 15:00:00', stadium_id: 100, status: 'COMPLETED' },
    { id: 10002, match_type: 'CUP', home_team_id: 15, away_team_id: 20, home_score: 2, away_score: 2, match_date: '2023-05-16 18:30:00', stadium_id: 105, status: 'COMPLETED' },
    { id: 10003, match_type: 'FRIENDLY', home_team_id: 30, away_team_id: 10, home_score: 0, away_score: 4, match_date: '2023-05-17 20:00:00', stadium_id: 120, status: 'COMPLETED' },
    { id: 10004, match_type: 'LEAGUE', home_team_id: 20, away_team_id: 30, home_score: 5, away_score: 0, match_date: '2023-05-18 19:15:00', stadium_id: 110, status: 'COMPLETED' },
    { id: 10005, match_type: 'CUP', home_team_id: 25, away_team_id: 15, home_score: 1, away_score: 3, match_date: '2023-05-19 16:45:00', stadium_id: 115, status: 'COMPLETED' },
  ],
};

/**
 * 모든 테이블을 그룹화하는 함수
 */
export function getGroupedTables(tables: TableInfo[]): GroupedTables {
  return tables.reduce((acc, table) => {
    // 테이블 이름의 첫 두 글자나 접두어로 그룹화
    let groupKey = "기타";
    
    if (table.table_name.startsWith('excel_')) {
      groupKey = 'Excel Tables';
    } else if (table.table_name.startsWith('log_')) {
      groupKey = 'Log Tables';
    } else if (table.table_name.startsWith('user_')) {
      groupKey = 'User Tables';
    } else if (table.table_name.startsWith('game_')) {
      groupKey = 'Game Tables';
    } else if (table.table_name.startsWith('config_')) {
      groupKey = 'Config Tables';
    } else {
      // 첫 두 글자로 그룹화
      groupKey = table.table_name.substring(0, 2).toUpperCase();
    }
    
    acc[groupKey] = acc[groupKey] || [];
    acc[groupKey].push(table);
    return acc;
  }, {} as GroupedTables);
}

/**
 * 테이블 검색 함수 (모의 API 응답을 생성)
 */
export function searchTables(dbName: string, filter: string = '', matchType: string = 'prefix'): TableInfo[] {
  const tables = mockTables[dbName] || [];
  
  if (!filter) {
    return tables;
  }
  
  return tables.filter(table => {
    switch (matchType) {
      case 'prefix':
        return table.table_name.startsWith(filter);
      case 'suffix':
        return table.table_name.endsWith(filter);
      case 'contains':
        return table.table_name.includes(filter);
      default:
        return true;
    }
  });
}

/**
 * 테이블 컬럼 정보 조회 함수
 */
export function getTableColumns(tableName: string): Column[] {
  return mockColumns[tableName] || [];
}

/**
 * 테이블 데이터 조회 함수
 */
export function getTableData(tableName: string): TableRow[] {
  return mockTableData[tableName] || [];
} 