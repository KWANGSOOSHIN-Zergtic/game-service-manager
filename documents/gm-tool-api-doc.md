# GM Tool API 문서

## 1. 사용자 Baller API

### 1.1. API 개요

- **기능**: 사용자의 Baller 정보를 관리하는 API
- **기본 URL**: `/api/users/multi-play/baller`
- **데이터베이스 테이블**: `user_baller`

### 1.2. API 엔드포인트

#### 1.2.1. 모든 Baller 조회

- **HTTP 메서드**: `GET`
- **URL**: `/api/users/multi-play/baller?employerUid={사용자UID}&dbName={데이터베이스명}`
- **기능**: 특정 사용자의 모든 Baller 정보를 조회합니다.
- **필수 파라미터**:
  - `employerUid`: 사용자 UID (예: "619")
  - `dbName`: 데이터베이스 이름 (예: "develop_db")
- **응답 예시**:
```json
{
  "success": true,
  "message": "사용자 Baller 정보를 성공적으로 조회했습니다.",
  "ballers": [
    {
      "id": "1941",
      "excel_baller_index": "3",
      "employer_uid": "619",
      "training_point": 0,
      "character_level": 1,
      "recruit_process": 0,
      "character_status": 2,
      "talk_group_no": -1,
      "etc": null,
      "max_upgrade_point": 0,
      "created_at": "2025-03-06T04:35:17.714Z",
      "updated_at": "2025-03-06T04:35:17.714Z",
      "user_nickname": "sks_001",
      "user_display_id": "21443885"
    },
    // ... 더 많은 Baller 정보
  ]
}
```

#### 1.2.2. 특정 Baller 조회

- **HTTP 메서드**: `GET`
- **URL**: `/api/users/multi-play/baller?employerUid={사용자UID}&dbName={데이터베이스명}&excelBallerIndex={ballerIndex}`
- **기능**: 특정 사용자의 특정 Baller 정보를 조회합니다.
- **필수 파라미터**:
  - `employerUid`: 사용자 UID
  - `dbName`: 데이터베이스 이름
  - `excelBallerIndex`: Baller 인덱스
- **응답 예시**:
```json
{
  "success": true,
  "message": "Baller 정보를 성공적으로 조회했습니다.",
  "baller": {
    "id": "2385",
    "excel_baller_index": "1",
    "employer_uid": "619",
    "training_point": 100,
    "character_level": 5,
    "recruit_process": 2,
    "character_status": 1,
    "talk_group_no": 3,
    "etc": "테스트 데이터",
    "max_upgrade_point": 500,
    "created_at": "2025-03-19T09:06:22.564Z",
    "updated_at": "2025-03-19T09:06:22.564Z",
    "user_nickname": "sks_001",
    "user_display_id": "21443885"
  }
}
```

#### 1.2.3. Baller 생성

- **HTTP 메서드**: `POST`
- **URL**: `/api/users/multi-play/baller`
- **기능**: 사용자의 Baller 정보를 생성하거나 이미 존재하는 경우 업데이트합니다.
- **요청 본문 예시**:
```json
{
  "employerUid": "619",
  "dbName": "develop_db",
  "excelBallerIndex": 1,
  "trainingPoint": 100,
  "characterLevel": 5,
  "recruitProcess": 2,
  "characterStatus": 1,
  "talkGroupNo": 3,
  "etc": "테스트 데이터",
  "maxUpgradePoint": 500
}
```
- **응답 예시**:
```json
{
  "success": true,
  "message": "Baller 정보를 성공적으로 생성했습니다.",
  "baller": {
    "id": "2385",
    "excel_baller_index": "1",
    "employer_uid": "619",
    "training_point": 100,
    "character_level": 5,
    "recruit_process": 2,
    "character_status": 1,
    "talk_group_no": 3,
    "etc": "테스트 데이터",
    "max_upgrade_point": 500,
    "created_at": "2025-03-19T09:06:22.564Z",
    "updated_at": "2025-03-19T09:06:22.564Z"
  }
}
```

#### 1.2.4. Baller 업데이트

- **HTTP 메서드**: `PUT`
- **URL**: `/api/users/multi-play/baller`
- **기능**: 사용자의 특정 Baller 정보를 업데이트합니다.
- **요청 본문 예시**:
```json
{
  "employerUid": "619",
  "dbName": "develop_db",
  "excelBallerIndex": 1,
  "trainingPoint": 200,
  "characterLevel": 10,
  "recruitProcess": 2,
  "characterStatus": 1,
  "talkGroupNo": 3,
  "etc": "테스트 데이터",
  "maxUpgradePoint": 500
}
```
- **응답 예시**:
```json
{
  "success": true,
  "message": "Baller 정보를 성공적으로 업데이트했습니다.",
  "baller": {
    "id": "2385",
    "excel_baller_index": "1",
    "employer_uid": "619",
    "training_point": 200,
    "character_level": 10,
    "recruit_process": 2,
    "character_status": 1,
    "talk_group_no": 3,
    "etc": "테스트 데이터",
    "max_upgrade_point": 500,
    "created_at": "2025-03-19T09:06:22.564Z",
    "updated_at": "2025-03-19T09:06:25.051Z"
  }
}
```

#### 1.2.5. Baller 삭제

- **HTTP 메서드**: `DELETE`
- **URL**: `/api/users/multi-play/baller?employerUid={사용자UID}&dbName={데이터베이스명}&excelBallerIndex={ballerIndex}`
- **기능**: 사용자의 특정 Baller 정보를 삭제합니다.
- **필수 파라미터**:
  - `employerUid`: 사용자 UID
  - `dbName`: 데이터베이스 이름
  - `excelBallerIndex`: Baller 인덱스 (쉼표로 구분하여 여러 인덱스 가능)
- **응답 예시**:
```json
{
  "success": true,
  "message": "1개 항목이 성공적으로 삭제되었습니다.",
  "results": [
    {
      "excelBallerIndex": 1,
      "success": true,
      "message": "Baller 정보를 성공적으로 삭제했습니다."
    }
  ]
}
```

### 1.3. 데이터베이스 스키마

```sql
create table public.user_baller
(
    uid                bigserial
        constraint "PK_e81490afbbc4287f2eea866696d"
            primary key,
    create_at          timestamp with time zone default now()         not null,
    update_at          timestamp with time zone default now()         not null,
    excel_baller_index bigint                                         not null,
    employer_uid       bigint,
    training_point     integer                  default 0             not null,
    character_level    integer                  default 1             not null,
    recruit_process    integer                  default 0             not null,
    character_status   smallint                 default '0'::smallint not null,
    talk_group_no      integer                  default 1             not null,
    etc                varchar,
    max_upgrade_point  integer                  default 0             not null,
    constraint "UQ_4fadb1dae8f589fbda45358e154"
        unique (excel_baller_index, employer_uid)
);

alter table public.user_baller
    owner to postgres;
```

### 1.4. 주요 구현 파일

- **API 라우트**: `src/app/api/users/multi-play/baller/route.ts`
- **서비스 로직**: `src/app/api/users/multi-play/baller/service.ts`
- **DB 쿼리**: `src/app/api/db-query/queries-users-baller.ts`
- **테스트 파일**: `src/test/api/users/multi-play/baller.test.ts`
- **통합 테스트**: `src/test/api/users/multi-play/baller-api.test.ts`

### 1.5. 오류 처리

- **오류 코드**:
  - `400`: 필수 파라미터 누락 또는 잘못된 형식
  - `404`: 요청한 데이터베이스 또는 Baller 정보를 찾을 수 없음
  - `500`: 서버 내부 오류
- **오류 응답 예시**:
```json
{
  "success": false,
  "error": "요청한 데이터베이스를 찾을 수 없습니다.",
  "availableDBs": ["football_service", "shipping_product_db", "shipping_dev_db", "develop_db"]
}
```

### 1.6. 주의사항

- 모든 API 요청에는 **반드시** `dbName` 파라미터가 포함되어야 합니다.
- POST/PUT 요청 시 요청 본문의 필드 이름은 캐멀케이스(camelCase)를 사용합니다.
- DB 테이블 컬럼과 응답 데이터 필드 이름은 스네이크케이스(snake_case)를 사용합니다.
- 응답의 `created_at`과 `updated_at` 필드는 실제로는 DB의 `create_at`과 `update_at` 컬럼입니다.

## 2. 버그 수정 및 개선 사항

### 2.1. 데이터 테이블 선택 기능 개선

#### 2.1.1. 체크박스 선택 인식 문제 수정
- **문제**: 데이터 테이블에서 체크박스를 선택했을 때 DELETE 및 UPDATE 버튼 클릭 시 "선택된 항목 없음" 오류 발생
- **원인**: 체크박스 선택 시 세션 스토리지에 선택 정보가 올바르게 저장되지 않음
- **해결 방법**:
  - 체크박스 선택 시 세션 스토리지에 선택 항목 정보를 즉시 저장하도록 개선
  - 세션 스토리지에 저장 시 `selectedCurrency`와 `selectedCurrencies` 키 모두 사용하여 호환성 유지
  - 탭 전환 시 이전 선택 정보 초기화하여 잔여 데이터 문제 해결

#### 2.1.2. 행 메뉴 DELETE 버튼 수정
- **문제**: 데이터 테이블의 더보기 메뉴에서 DELETE 버튼 클릭 시 "삭제에 필요한 정보가 누락되었습니다" 오류 발생
- **원인**: 
  - BALLER와 CURRENCY 탭에서 각각 다른 필드명을 사용하여 삭제 처리 시 필요 정보가 누락됨
  - BALLER는 `excelBallerIndex`, CURRENCY는 `excel_item_index` 필드 사용
- **해결 방법**:
  - 현재 선택된 탭에 따라 적절한 필드명과 API 엔드포인트를 사용하도록 분기 처리
  - 여러 가능한 필드명(`excelBallerIndex`, `excel_baller_index`, `excel_item_index`)을 확인하여 데이터 유실 방지
  - 디버그 로깅 강화로 삭제 실패 시 원인 파악 용이

### 2.2. 응답 처리 개선

#### 2.2.1. JSON 파싱 오류 처리
- **문제**: 서버에서 HTML 오류 페이지 반환 시 "Unexpected token '<', "<!DOCTYPE "... is not valid JSON" 오류 발생
- **원인**: 서버 오류 발생 시 HTML 형식의 오류 페이지가 반환되지만, 코드에서는 JSON으로 파싱 시도
- **해결 방법**:
  - 응답 헤더의 Content-Type 확인하여 JSON이 아닌 응답 별도 처리
  - 응답 상태 코드 확인 및 오류 상황에 대한 상세 로깅 추가
  - try-catch 블록으로 JSON 파싱 오류 안전하게 처리

### 2.3. 타입 안전성 강화

#### 2.3.1. TypeScript 타입 개선
- `any` 타입 사용 줄이고 `unknown` 또는 구체적인 타입으로 교체
- 데이터 타입 검사 강화로 런타임 오류 방지
- 필드 접근 시 타입 안전성 확보를 위한 타입 가드 및 캐스팅 적용

#### 2.3.2. 에러 로깅 개선
- 오류 발생 시 상세 정보 로깅
- 사용자에게 더 명확한 오류 메시지 제공
- 개발자 디버깅을 위한 추가 정보 콘솔 출력
