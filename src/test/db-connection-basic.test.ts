/**
 * DB 연결 프로세스 기본 테스트
 */

import { DB_COLLECTION } from '@/app/api/db-information/db-collection';
import { 
  MASTER_DB_CONFIG, 
  SERVICE_DB_CONFIGS, 
  DB_LIST_INFO
} from './test-data/db-connection-test-data';

describe('DB 연결 기본 테스트', () => {
  beforeAll(() => {
    // 테스트용 DB 설정으로 DB_COLLECTION 초기화
    Object.assign(DB_COLLECTION, { ...MASTER_DB_CONFIG, ...SERVICE_DB_CONFIGS });
  });

  it('마스터 DB 정보가 올바르게 설정되어야 함', () => {
    expect(DB_COLLECTION).toHaveProperty('football_service');
    
    const masterDB = DB_COLLECTION['football_service'];
    expect(masterDB).toHaveProperty('name', 'football_service');
    expect(masterDB).toHaveProperty('type', 'postgres');
    expect(masterDB).toHaveProperty('data_base', 'football_service');
  });

  it('서비스 DB 정보가 올바르게 설정되어야 함', () => {
    expect(DB_COLLECTION).toHaveProperty('football_develop');
    expect(DB_COLLECTION).toHaveProperty('football_staging');
    expect(DB_COLLECTION).toHaveProperty('football_production');
    
    // 개발 DB 정보 확인
    const devDB = DB_COLLECTION['football_develop'];
    expect(devDB).toHaveProperty('name', 'football_develop');
    expect(devDB).toHaveProperty('index', 1);
    expect(devDB).toHaveProperty('type', 'postgres');
    
    // 스테이징 DB 정보 확인
    const stagingDB = DB_COLLECTION['football_staging'];
    expect(stagingDB).toHaveProperty('name', 'football_staging');
    expect(stagingDB).toHaveProperty('index', 2);
    
    // 운영 DB 정보 확인
    const prodDB = DB_COLLECTION['football_production'];
    expect(prodDB).toHaveProperty('name', 'football_production');
    expect(prodDB).toHaveProperty('index', 3);
  });

  it('DB 리스트 정보가 올바르게 정의되어야 함', () => {
    expect(DB_LIST_INFO).toHaveLength(3);
    
    // 각 DB 정보 확인
    expect(DB_LIST_INFO[0]).toHaveProperty('db_name', 'football_develop');
    expect(DB_LIST_INFO[0]).toHaveProperty('display_name', '개발 DB');
    
    expect(DB_LIST_INFO[1]).toHaveProperty('db_name', 'football_staging');
    expect(DB_LIST_INFO[1]).toHaveProperty('display_name', '스테이징 DB');
    
    expect(DB_LIST_INFO[2]).toHaveProperty('db_name', 'football_production');
    expect(DB_LIST_INFO[2]).toHaveProperty('display_name', '운영 DB');
  });
}); 