# DB 연결 프로세스 룰북

## 1. 개요

이 문서는 게임 서비스 매니저의 데이터베이스 연결 및 쿼리 수행 프로세스에 대한 가이드라인을 제공합니다. 이 문서는 개발자가 DB 관련 기능을 개발하거나 사용할 때 참조할 수 있는 룰북입니다.

## 2. DB 연결 과정 (데이터 흐름)

```
[요청] → [DB 정보 조회] → [연결 풀 초기화] → [DB 연결 풀에서 클라이언트 획득] → [쿼리 실행] → [클라이언트 반환] → [응답]
```

## 3. 핵심 컴포넌트

### 3.1. DB 정보 관리
- **DB_COLLECTION**: 서비스에서 사용 가능한 DB 정보가 저장된 전역 객체 (`src/app/api/db-information/db-collection.ts`)
- **saveDBCollection()**: DB 정보를 조회하여 `DB_COLLECTION`에 저장하는 함수 (`src/app/api/db-information/db-information.ts`)

### 3.2. DB 연결 관리
- **DBConnectionManager**: 데이터베이스 연결 풀을 관리하는 싱글톤 클래스 (`src/lib/db/db-connection-manager.ts`)
- **getConnection()**: 특정 DB에 대한 연결 풀을 가져오는 함수 (`src/lib/init/database-initializer.ts`)

### 3.3. 쿼리 정의 및 실행
- **DB_QUERIES**: 미리 정의된 쿼리들을 저장하는 객체 (`src/app/api/db-query/queries.ts`)
- **쿼리 함수들**: 각 도메인별로 필요한 쿼리들을 정의한 파일들
  - `queries-service.ts`: 서비스 관련 쿼리
  - `queries-users.ts`: 사용자 관련 쿼리
  - `queries-users-currency.ts`: 사용자 통화 관련 쿼리

## 4. DB 연결 초기화 프로세스

### 4.1. 서버 시작 시 초기화 과정

1. 서버 시작 시 `databaseInitializer.initialize()` 함수 호출
2. `DBConnectionManager.getInstance()` 호출하여 싱글톤 인스턴스 획득
3. `DBConnectionManager.initialize()` 호출
   - DB 정보 업데이트: `updateDBInformation()` 호출
     - `saveDBCollection()` 호출하여 DB 정보 조회
     - DB 정보를 `DB_COLLECTION`에 저장
   - 각 DB에 대한 연결 풀 초기화: `initializePool()` 호출
     - 연결 풀 생성 및 최적화 설정 적용
     - 연결 테스트
     - 이벤트 핸들러 등록

### 4.2. 연결 풀 초기화 규칙

1. 기존 연결이 있다면 종료
2. 연결 풀 생성 (최적화 설정 적용)
   - 최대 클라이언트 수: 20
   - 유휴 연결 타임아웃: 30초
   - 연결 타임아웃: 2초
   - 연결당 최대 재사용 횟수: 7500
   - TCP Keepalive 활성화
   - 모든 연결이 유휴 상태일 때 풀 종료 허용
3. 쿼리 타임아웃 설정 (10초)
4. 연결 풀 저장 (`DB_CONNECT_ARRAY`에 추가)
5. 연결 테스트 (간단한 쿼리 실행)
6. 이벤트 핸들러 등록
   - `connect` 이벤트: 연결 시 로깅
   - `error` 이벤트: 오류 처리 및 재초기화 시도

## 5. DB 쿼리 실행 프로세스

### 5.1. API 호출을 통한 쿼리 실행

1. API 엔드포인트 호출 (예: `GET /api/db-query?dbName=football_service`)
2. DB 정보 조회 (`saveDBCollection()` 호출)
3. 요청된 DB 설정 검색 (`DB_COLLECTION[dbName]`)
4. 연결 풀에서 연결 획득 (`getConnection(dbName)`)
5. 쿼리 실행 (`pool.query(query)`)
6. 결과 반환 및 로깅

### 5.2. 서비스 코드에서의 쿼리 실행

1. `getConnection(dbName)` 호출하여 연결 풀 획득
2. 쿼리 실행 (`pool.query(query)`)
3. 결과 처리

### 5.3. 트랜잭션 처리

트랜잭션이 필요한 경우 `withTransaction` 함수 사용:
```typescript
const result = await withTransaction('dbName', async (client) => {
  // 트랜잭션 내에서 쿼리 실행
  const result1 = await client.query('...');
  const result2 = await client.query('...');
  return { result1, result2 };
});
```

## 6. 오류 처리 및 재시도 메커니즘

### 6.1. 연결 오류 처리

1. 최대 재시도 횟수: 3회
2. 재시도 간격: 1초 (연결) / 5초 (풀 초기화)
3. 오류 발생 시 로깅 및 재시도
4. 최대 재시도 횟수 초과 시 오류 반환

### 6.2. 풀 오류 처리

1. 오류 로깅
2. 연결 풀 재초기화 시도
3. 재초기화 실패 시 오류 로깅

## 7. DB 쿼리 작성 규칙

### 7.1. 쿼리 정의

1. 쿼리는 도메인별로 분리된 파일에 정의
2. 각 쿼리는 다음 형식을 따름:
```typescript
{
  name: 'QUERY_NAME',
  description: '쿼리 설명',
  query: `SQL 쿼리`
}
```

### 7.2. 쿼리 사용

1. `DB_QUERIES` 객체에서 필요한 쿼리 참조
2. 연결 풀에서 연결 획득 후 쿼리 실행
3. 결과 처리 및 오류 처리

## 8. 성능 최적화 가이드라인

### 8.1. 연결 풀 최적화

- 최대 클라이언트 수는 워크로드에 맞게 조정 (기본값: 20)
- 유휴 연결 타임아웃은 30초로 설정
- 연결당 최대 재사용 횟수는 7500으로 설정
- TCP Keepalive를 활성화하여 연결 유지

### 8.2. 쿼리 최적화

- 모든 쿼리에 10초 타임아웃 설정
- 조회 결과가 많은 쿼리는 페이징 처리
- 자주 사용되는 쿼리는 인덱스 활용

## 9. 보안 고려사항

- DB 인증 정보는 환경 변수로 관리
- 클라이언트 코드에서 직접 DB 연결 시도 방지
- 쿼리 파라미터는 항상 파라미터화된 쿼리로 처리하여 SQL 인젝션 방지

## 10. 모니터링 및 로깅

- 모든 DB 연결 시도 및 결과 로깅
- 연결 풀 상태 주기적으로 모니터링
- 오류 발생 시 상세 정보 로깅

## 11. 확장성 고려사항

- `DBConnectionManager`의 싱글톤 패턴을 통해 여러 DB 연결 관리
- 도메인별로 쿼리 파일 분리하여 확장성 확보
- DB 종류에 따라 다른 연결 설정 적용 가능

## 12. 참고 자료

### 12.1. 주요 파일 경로
- 데이터베이스 연결 관리: `src/lib/db/db-connection-manager.ts`
- DB 정보 관리: `src/app/api/db-information/db-collection.ts`, `src/app/api/db-information/db-information.ts`
- 쿼리 정의: `src/app/api/db-query/queries.ts`, `src/app/api/db-query/queries-*.ts`
- DB 초기화: `src/lib/init/database-initializer.ts`

### 12.2. 관련 API 엔드포인트
- DB 연결 테스트: `GET /api/db-connection?dbName={dbName}`
- DB 쿼리 실행: `GET /api/db-query?dbName={dbName}`
- DB 리스트 조회: `GET /api/db-list-load` 