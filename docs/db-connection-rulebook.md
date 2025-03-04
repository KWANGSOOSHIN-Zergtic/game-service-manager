# DB 연결 프로세스 룰북

## 1. 개요

이 문서는 게임 서비스 매니저의 데이터베이스 연결 및 쿼리 수행 프로세스에 대한 가이드라인을 제공합니다. 이 문서는 개발자가 DB 관련 기능을 개발하거나 사용할 때 참조할 수 있는 룰북입니다.

## 1.1. 용어 사전

본 문서에서 사용되는 주요 용어들의 정의입니다:

| 용어 | 정의 |
|------|------|
| **football_service DB** | 마스터 DB로서 모든 서비스 DB의 연결 정보와 클라이언트용 DB 리스트를 관리하는 메인 데이터베이스입니다. 서버 초기화 시 최초로 연결되는 DB입니다. |
| **DB_COLLECTION** | 서비스에서 사용 가능한 DB 정보가 저장된 전역 객체입니다. 이 객체는 `src/app/api/db-information/db-collection.ts`에서 관리됩니다. |
| **DB_NAME** | 서버로의 요청에서 사용될 특정 데이터베이스를 지정하는 파라미터입니다. 변수로는 `dbName`으로 표기됩니다. |
| **DBConnectionManager** | 데이터베이스 연결 풀을 관리하는 싱글톤 클래스입니다. 이 클래스는 `src/lib/db/db-connection-manager.ts`에 정의되어 있습니다. |
| **DB_CONNECT_ARRAY** | 초기화된 DB 연결 풀들을 저장하는 배열입니다. 이 배열을 통해 dbName으로 특정 DB의 연결 풀에 액세스합니다. |
| **SELECT_SERVICE_DB_COLLECTION** | football_service DB에서 모든 서비스 DB 정보를 조회하는 쿼리입니다. |
| **SELECT_DB_LIST** | football_service DB에서 클라이언트에 제공할 간략한 DB 정보를 조회하는 쿼리입니다. |
| **DB_QUERIES** | 미리 정의된 쿼리들을 저장하는 객체입니다. 이 객체는 `src/app/api/db-query/queries.ts`에서 관리됩니다. |

## 2. 핵심 워크플로우 (클라이언트-서버 데이터 흐름)

```
[서버 초기화]
↓
[환경변수에 지정된 기본 DB (football_service DB) 연결 후 SELECT_SERVICE_DB_COLLECTION 쿼리를 사용한 연결 풀 DB 정보 획득]
↓ 
[환경변수에 지정된 기본 DB (football_service DB) 에서 클라이언트에 제공하게 될 간략한 DB COLLECTION 정보를 SELECT_DB_LIST 쿼리를 사용하여 획득]
↓ 
[서버 내부에 연결 풀을 구성하기 위한 DB 연결 정보 캐싱 (SELECT_SERVICE_DB_COLLECTION 응답 요소)]
↓
[서버 내부에 클라이언트에 제공할 DB 정보 구성을 위한 DB 연결 정보 캐싱 (SELECT_DB_LIST 응답 요소)]
↓
[서버 연결 풀 초기화 및 유지]
↓
[클라이언트 로그인 → DB 리스트 간략 정보 수신 및 로컬 저장(SELECT_DB_LIST 정보에 해당)]
↓
[클라이언트의 API 프로토콜 요청 (처리할 연결 풀 DB_NAME 항상 포함)]
↓
[서버 API 수신 → 지정된 DB_NAME의 연결 풀 사용]
↓
[쿼리 실행]
↓
[결과 반환]
```

### 2.1. 워크플로우 다이어그램

다음은 클라이언트-서버 간 DB 연결 및 요청 처리 프로세스를 시각화한 다이어그램입니다:

```
┌────────────────────────────────────────────────────────────────┐
│                           서버                                  │
│                                                                │
│  ┌─────────────────┐       ┌───────────────────────────────┐  │
│  │                 │       │                               │  │
│  │ 초기화 프로세스(1) │───────▶│ football_service DB 연결(2)    │  │
│  │                 │       │                               │  │
│  └─────────────────┘       └───────────────┬───────────────┘  │
│                                            │                  │
│                                            ▼                  │
│  ┌─────────────────┐       ┌───────────────────────────────┐  │
│  │                 │       │                               │  │
│  │ DB 정보 캐싱(4,5) │◀──────│ 서비스 DB 정보 조회(3)           │  │
│  │                 │       │                               │  │
│  └────────┬────────┘       └───────────────────────────────┘  │
│           │                                                   │
│           ▼                                                   │
│  ┌────────────────────┐                                       │
│  │                    │                                       │
│  │ 연결 풀 초기화(6)    │                                       │
│  │                    │                                       │
│  └────────┬───────────┘                                       │
│           │                                                   │
│           │              ┌───────────────────────────────┐    │
│           │              │                               │    │
│           └─────────────▶│ 요청 처리 준비 완료              │    │
│                          │                               │    │
│                          └──────────────┬────────────────┘    │
└───────────────────────────────────────┬─┴────────────────────┬┘
                                        │                      │
                                        │                      │
┌───────────────────────────────────────▼──────────────────────▼┐
│                         클라이언트                              │
│                                                                │
│  ┌─────────────────┐       ┌───────────────────────────────┐  │
│  │                 │       │                               │  │
│  │ 로그인 요청(7)    │───────▶│ DB 리스트 정보 수신(7)           │  │
│  │                 │       │                               │  │
│  └─────────────────┘       └───────────────┬───────────────┘  │
│                                            │                  │
│                                            ▼                  │
│  ┌─────────────────┐       ┌───────────────────────────────┐  │
│  │                 │       │                               │  │
│  │ API 요청(8)      │───────▶│ dbName 포함한 요청 전송(8)       │  │
│  │                 │       │                               │  │
│  └─────────────────┘       └───────────────────────────────┘  │
└────────────────────────────────────────────────────────────────┘
                                        │
                                        │
┌───────────────────────────────────────▼──────────────────────┐
│                           서버                                │
│                                                              │
│  ┌─────────────────┐       ┌───────────────────────────────┐ │
│  │                 │       │                               │ │
│  │ 요청 수신(9)      │───────▶│ dbName 검증(9)                 │ │
│  │                 │       │                               │ │
│  └─────────────────┘       └───────────────┬───────────────┘ │
│                                            │                 │
│                                            ▼                 │
│  ┌─────────────────┐       ┌───────────────────────────────┐ │
│  │                 │       │                               │ │
│  │ 쿼리 실행(10)     │◀──────│ DB 연결 풀 사용(9)              │ │
│  │                 │       │                               │ │
│  └────────┬────────┘       └───────────────────────────────┘ │
│           │                                                  │
│           ▼                                                  │
│  ┌────────────────────┐                                      │
│  │                    │                                      │
│  │ 결과 반환(11)        │                                      │
│  │                    │                                      │
│  └────────┬───────────┘                                      │
│           │                                                  │
└───────────┼──────────────────────────────────────────────────┘
            │
            ▼
┌───────────────────────┐
│      클라이언트        │
│    (결과 수신 및 처리)   │
└───────────────────────┘
```

괄호 안의 숫자는 위의 워크플로우 단계와 일치합니다.

### 2.2. 세부 워크플로우 설명

1. **서버 초기화 단계**: 
   - 서버는 환경 변수(env)에 정의된 football_service DB 정보를 사용하여 초기 연결을 설정합니다.
   - 이 연결을 통해 사용 가능한 모든 데이터베이스 목록 및 연결 정보를 로드합니다.
   
   > **중요**: football_service DB는 마스터 DB로서 모든 서비스 DB의 연결 정보와 클라이언트용 DB 리스트를 관리합니다.

2. **DB 정보 캐싱 및 연결 풀 초기화**: 
   - 로드된 DB 정보는 서버 메모리에 캐싱됩니다(DB_COLLECTION).
   - 각 DB 정보에 대해 연결 풀을 초기화하고 관리합니다.
   - 서버는 이 연결 풀들을 서버 생명주기 동안 유지합니다.
   
   > **최적화**: 미리 초기화된 연결 풀을 통해 요청 처리 시간을 최소화합니다.

3. **클라이언트 로그인 및 DB 정보 수신**: 
   - 클라이언트가 로그인 시 `/api/db-list-load` 엔드포인트에서 사용 가능한 DB 목록 정보 수신
   - 수신된 정보는 클라이언트 세션 스토리지에 저장 (예: `sessionStorage.setItem('dbList', JSON.stringify(dbListData))`)
   
   > **사용자 경험**: 이 정보는 UI에서 DB 선택 드롭다운 등으로 표시될 수 있습니다.

4. **DB 요청 처리**: 
   - 클라이언트는 API 요청 시 항상 사용할 DB_NAME을 파라미터로 포함시킵니다.
   - 서버는 요청된 DB_NAME에 해당하는 연결 풀을 사용하여 요청을 처리합니다.
   - 요청 처리 후 결과를 클라이언트에 반환합니다.
   
   > **필수 요소**: DB_NAME은 모든 DB 관련 API 요청에 필수적으로 포함되어야 합니다.

## 3. 핵심 컴포넌트

### 3.1. DB 정보 관리
- **DB_COLLECTION**: 서비스에서 사용 가능한 DB 정보가 저장된 전역 객체 (`src/app/api/db-information/db-collection.ts`)
- **saveDBCollection()**: football_service DB에 접속하여 모든 서비스 DB 정보를 조회하고 `DB_COLLECTION`에 저장하는 함수 (`src/app/api/db-information/db-information.ts`)
  
  > **주의**: 이 함수는 서버 초기화 시점에 호출되어 전체 DB 정보를 로드합니다. football_service DB는 마스터 DB 역할을 하여 모든 서비스 DB 정보를 관리합니다.

### 3.2. DB 연결 관리
- **DBConnectionManager**: 데이터베이스 연결 풀을 관리하는 싱글톤 클래스 (`src/lib/db/db-connection-manager.ts`)
  
  > **중요**: 이 클래스는 초기화 시 모든 DB에 대한 연결 풀을 생성하고 관리합니다. 클라이언트 요청에 따라 적절한 연결 풀을 제공합니다.

- **getConnection(dbName)**: 특정 DB에 대한 연결 풀을 가져오는 함수 (`src/lib/init/database-initializer.ts`)
  
  > **사용 패턴**: 모든 API 요청 처리 시 클라이언트가 제공한 `dbName`을 사용하여 이 함수를 호출해야 합니다.

### 3.3. 쿼리 정의 및 실행
- **DB_QUERIES**: 미리 정의된 쿼리들을 저장하는 객체 (`src/app/api/db-query/queries.ts`)
  
  > **쿼리 관리**: 모든 쿼리는 이 객체에 정의되어 있으며, 도메인별로 분리되어 있습니다. 쿼리 자체를 API에 직접 작성하지 않아야 합니다.

- **쿼리 함수들**: 각 도메인별로 필요한 쿼리들을 정의한 파일들
  - `queries-service.ts`: 서비스 관련 쿼리
  - `queries-users.ts`: 사용자 관련 쿼리
  - `queries-users-currency.ts`: 사용자 통화 관련 쿼리

## 4. 서버 초기화 및 DB 연결 프로세스

### 4.1. 서버 시작 시 초기화 과정

1. **서버 시작**: `databaseInitializer.initialize()` 함수 호출
   
   > **목적**: 서버 시작 시 DB 연결 초기화를 수행합니다. 이 단계는 서버 구동에 필수적입니다.

2. **DB 연결 매니저 초기화**: `DBConnectionManager.getInstance()` 호출하여 싱글톤 인스턴스 획득
   
   > **주의**: 서버 전체에서 하나의 DBConnectionManager 인스턴스만 사용되어야 합니다.

3. **DB 정보 로드 및 연결 풀 초기화**:
   
   a. **DB 정보 업데이트**: `updateDBInformation()` 호출
      - `saveDBCollection()` 호출하여 football_service DB에서 모든 서비스 DB 정보 조회
      - DB 정보를 `DB_COLLECTION`에 저장
      
      > **중요**: football_service DB는 마스터 DB로, 모든 서비스 DB 정보를 관리합니다.
   
   b. **연결 풀 초기화**: `initializePool()` 호출로 각 DB에 대한 연결 풀 생성
      - 연결 풀 생성 및 최적화 설정 적용
      - 연결 테스트 수행
      - 이벤트 핸들러 등록
      
      > **성능 고려사항**: 각 DB별로 별도의 연결 풀을 유지하여 요청 처리 성능을 최적화합니다.

### 4.2. 연결 풀 초기화 및 관리 규칙

1. **기존 연결 정리**: 기존 연결이 있다면 종료
   
   > **리소스 관리**: 재초기화 시 메모리 누수를 방지하기 위해 기존 연결을 정리합니다.

2. **연결 풀 생성 및 최적화 설정**:
   - 최대 클라이언트 수: 20
   - 유휴 연결 타임아웃: 30초
   - 연결 타임아웃: 2초
   - 연결당 최대 재사용 횟수: 7500
   - TCP Keepalive 활성화
   - 모든 연결이 유휴 상태일 때 풀 종료 허용
   
   > **최적화**: 이러한 설정은 연결 풀의 효율성과 안정성을 보장합니다.

3. **쿼리 타임아웃 설정**: 모든 쿼리에 10초 타임아웃 설정
   
   > **안정성**: 장시간 실행되는 쿼리로 인한 서버 부하를 방지합니다.

4. **연결 풀 저장**: 초기화된 연결 풀을 `DB_CONNECT_ARRAY[dbName]`에 저장
   
   > **접근 패턴**: 이 배열을 통해 dbName으로 특정 DB의 연결 풀에 빠르게 액세스할 수 있습니다.

5. **연결 테스트**: 간단한 쿼리 실행으로 연결 확인
   
   > **유효성 검증**: 초기화 단계에서 연결 문제를 조기에 발견하기 위한 테스트입니다.

## 5. 클라이언트 요청 및 DB 쿼리 실행 프로세스

### 5.1. 클라이언트의 DB 정보 수신 및 저장

1. **로그인 및 DB 정보 수신**:
   - 클라이언트가 로그인 시 `/api/db-list-load` 엔드포인트에서 사용 가능한 DB 목록 정보 수신
   - 수신된 정보는 클라이언트 세션 스토리지에 저장 (예: `sessionStorage.setItem('dbList', JSON.stringify(dbListData))`)
   
   > **사용자 경험**: 이 정보는 UI에서 DB 선택 드롭다운 등으로 표시될 수 있습니다.

   ```typescript
   // 클라이언트 로그인 및 DB 리스트 획득 예시 코드
   async function handleLogin(credentials: LoginCredentials) {
     try {
       // 1. 로그인 요청
       const loginResponse = await fetch('/api/auth/login', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify(credentials)
       });
       
       if (!loginResponse.ok) {
         throw new Error('로그인 실패');
       }
       
       const loginData = await loginResponse.json();
       // 로그인 정보 저장
       sessionStorage.setItem('token', loginData.token);
       sessionStorage.setItem('userInfo', JSON.stringify(loginData.user));
       
       // 2. DB 리스트 획득
       const dbListResponse = await fetch('/api/db-list-load', {
         headers: { 'Authorization': `Bearer ${loginData.token}` }
       });
       
       if (!dbListResponse.ok) {
         throw new Error('DB 리스트 로드 실패');
       }
       
       const dbListData = await dbListResponse.json();
       
       // 3. DB 리스트 정보 저장
       sessionStorage.setItem('dbList', JSON.stringify(dbListData.dbList));
       
       // 4. 사용자 정보에 기본 DB 정보가 있으면 그것을 사용
       if (loginData.user.db_name) {
         sessionStorage.setItem('lastUsedDbName', loginData.user.db_name);
       } else if (dbListData.dbList.length > 0) {
         // 5. 없으면 첫 번째 DB를 기본으로 사용
         sessionStorage.setItem('lastUsedDbName', dbListData.dbList[0].db_name);
       }
       
       return { success: true };
     } catch (error) {
       console.error('로그인 프로세스 오류:', error);
       return { success: false, error: error.message };
     }
   }
   ```

2. **DB 선택 및 저장**:
   - 사용자가 특정 DB를 선택하면 해당 정보를 세션 스토리지에 저장 (예: `sessionStorage.setItem('lastUsedDbName', selectedDbName)`)
   
   > **기본값**: 사용자가 명시적으로 선택하지 않은 경우 기본 DB(일반적으로 'football_develop')를 사용합니다.

   ```typescript
   // DB 선택 컴포넌트 예시
   function DbSelector() {
     const [selectedDb, setSelectedDb] = useState('');
     const [dbList, setDbList] = useState([]);
     
     useEffect(() => {
       // 세션 스토리지에서 DB 리스트 및 마지막 사용 DB 로드
       const storedDbList = JSON.parse(sessionStorage.getItem('dbList') || '[]');
       const lastUsedDb = sessionStorage.getItem('lastUsedDbName') || '';
       
       setDbList(storedDbList);
       setSelectedDb(lastUsedDb || (storedDbList.length > 0 ? storedDbList[0].db_name : ''));
     }, []);
     
     const handleDbChange = (e) => {
       const newDbName = e.target.value;
       setSelectedDb(newDbName);
       sessionStorage.setItem('lastUsedDbName', newDbName);
       
       // 선택된 DB 변경 이벤트 발생 (다른 컴포넌트에서 구독 가능)
       window.dispatchEvent(new CustomEvent('dbChanged', { detail: { dbName: newDbName } }));
     };
     
     return (
       <div className="db-selector">
         <label htmlFor="db-select">데이터베이스 선택:</label>
         <select 
           id="db-select" 
           value={selectedDb} 
           onChange={handleDbChange}
         >
           {dbList.map(db => (
             <option key={db.db_name} value={db.db_name}>
               {db.display_name || db.db_name}
             </option>
           ))}
         </select>
       </div>
     );
   }
   ```

3. **API 요청을 위한 공통 함수 구현**:

   ```typescript
   // API 요청에 자동으로 DB_NAME을 포함시키는 공통 함수
   async function apiRequest(endpoint: string, options: RequestOptions = {}) {
     try {
       // 현재 선택된 DB 이름 가져오기
       const dbName = options.dbName || sessionStorage.getItem('lastUsedDbName');
       
       if (!dbName) {
         throw new Error('DB 이름이 없습니다. 먼저 DB를 선택하거나 로그인하세요.');
       }
       
       // URL 구성 (쿼리 파라미터에 dbName 추가)
       const url = new URL(endpoint, window.location.origin);
       url.searchParams.append('dbName', dbName);
       
       // 기존 쿼리 파라미터 추가
       if (options.params) {
         Object.entries(options.params).forEach(([key, value]) => {
           url.searchParams.append(key, value);
         });
       }
       
       // 요청 옵션 구성
       const requestOptions = {
         method: options.method || 'GET',
         headers: {
           'Content-Type': 'application/json',
           'Authorization': `Bearer ${sessionStorage.getItem('token')}`,
           ...(options.headers || {})
         },
         body: options.body ? JSON.stringify(options.body) : undefined
       };
       
       // API 요청 수행
       const response = await fetch(url.toString(), requestOptions);
       
       // 응답 처리
       if (!response.ok) {
         const errorData = await response.json().catch(() => ({}));
         throw new Error(errorData.message || `API 요청 실패: ${response.status}`);
       }
       
       return await response.json();
     } catch (error) {
       console.error('API 요청 오류:', error);
       throw error;
     }
   }
   
   // 사용 예시
   async function getUserCurrencyList(employerUid: string) {
     return await apiRequest('/api/user/currency', {
       params: { employerUid }
       // dbName은 자동으로 추가됨
     });
   }
   ```

### 5.2. API 요청 시 DB_NAME 포함

1. **API 요청 형식**:
   ```typescript
   // 예시: DB_NAME을 쿼리 파라미터로 포함
   fetch(`/api/user/currency?employerUid=${employerUid}&excelItemIndex=${excelItemIndex}&dbName=${dbName}`, {
     method: 'DELETE'
   });
   ```
   
   > **핵심 규칙**: 모든 DB 접근 API 요청에는 반드시 dbName 파라미터가 포함되어야 합니다. 이는 워크플로우에서 가장 중요한 규칙 중 하나입니다.

2. **DB_NAME 소스**:
   - sessionStorage에서 획득 (예: `sessionStorage.getItem('lastUsedDbName')`)
   - 또는 사용자 정보에서 획득 (예: `parsedEmployerInfo.db_name`)
   
   > **우선순위**: 사용자 정보에 포함된 DB 이름이 있다면 그것을 우선 사용하고, 없다면 마지막으로 사용된 DB 이름을 사용합니다.
   
3. **DB_NAME 누락 시 처리**:
   - 클라이언트는 항상 DB_NAME을 포함해야 함
   - 서버는 DB_NAME이 누락된 요청을 400 Bad Request로 처리해야 함
   
   > **검증 중요성**: DB_NAME 검증은 서버의 모든 API 엔드포인트에서 최우선으로 수행해야 합니다.

### 5.3. 서버의 요청 처리 및 DB 연결 사용

1. **API 엔드포인트 처리**:
   ```typescript
   // API 라우트 예시
   export async function DELETE(request: NextRequest) {
     const searchParams = request.nextUrl.searchParams;
     const dbName = searchParams.get('dbName'); // 클라이언트에서 전송한 DB_NAME 획득
     
     // DB_NAME 검증은 모든 API 처리의 첫 단계로 수행되어야 함
     if (!dbName) {
       return NextResponse.json({
         success: false,
         error: 'DB 이름이 필요합니다.',
         message: '모든 DB 관련 요청에는 dbName 파라미터가 포함되어야 합니다.'
       }, { status: 400 });
     }
     
     // DB 존재 여부 확인
     if (!DB_COLLECTION[dbName]) {
       return NextResponse.json({
         success: false,
         error: '지원되지 않는 DB 이름입니다.',
         availableDBs: Object.keys(DB_COLLECTION)
       }, { status: 404 });
     }
     
     // 서비스 함수 호출 시 dbName 전달
     const result = await deleteUserCurrency({ 
       employerUid, 
       excelItemIndex, 
       dbName  // DB_NAME을 서비스 함수에 전달
     });
     
     return NextResponse.json(result, { status: result.status || 500 });
   }
   ```
   
   > **입력 검증**: dbName이 없거나 유효하지 않으면 즉시 요청을 거부해야 합니다. 이는 핵심 워크플로우의 필수 요소입니다.

2. **서비스 함수에서의 DB 연결 획득 및 사용**:
   ```typescript
   export async function deleteUserCurrency(params: DeleteCurrencyParams): Promise<UserCurrencyResult> {
     const { employerUid, dbName, excelItemIndex } = params;
     
     // DB 정보 업데이트 (필요시)
     await saveDBCollection();
     
     // DB 존재 여부 확인
     if (!dbName || !DB_COLLECTION[dbName]) {
       return {
         success: false,
         message: '요청한 데이터베이스를 찾을 수 없습니다.',
         availableDBs: Object.keys(DB_COLLECTION),
         status: 404,
       };
     }
     
     // DB 연결 매니저 획득 및 지정된 DB 연결 풀 사용
     const dbManager = DBConnectionManager.getInstance();
     
     // withClient 메서드로 지정된 DB의 연결 풀에서 클라이언트 획득 및 자동 반환
     const result = await dbManager.withClient(dbName, async (client) => {
       return await client.query(USER_CURRENCY_QUERIES.DELETE_USER_CURRENCY.query, [employerUid, excelItemIndex]);
     });
     
     // 결과 반환
     return {
       success: true,
       message: '사용자 재화를 성공적으로 삭제했습니다.',
       currency: result.rows[0],
       status: 200,
     };
   }
   ```
   
   > **연결 관리**: `withClient` 메서드는 DB 연결을 자동으로 획득하고 반환하므로, 개발자가 직접 연결 관리를 신경 쓸 필요가 없습니다.

### 5.4. 트랜잭션 처리

여러 쿼리를 하나의 트랜잭션으로 처리해야 하는 경우 `withTransaction` 메서드를 사용합니다:

```typescript
const result = await dbManager.withTransaction(dbName, async (client) => {
  // 첫 번째 쿼리 실행
  const result1 = await client.query(USER_CURRENCY_QUERIES.DELETE_USER_CURRENCY.query, [employerUid, excelItemIndex1]);
  
  // 두 번째 쿼리 실행
  const result2 = await client.query(USER_CURRENCY_QUERIES.DELETE_USER_CURRENCY.query, [employerUid, excelItemIndex2]);
  
  // 결과 반환
  return { result1, result2 };
});
```

> **트랜잭션의 중요성**: 여러 관련 작업이 모두 성공하거나 모두 실패해야 하는 경우에는 반드시 트랜잭션을 사용해야 합니다.

## 6. 오류 처리 및 재시도 메커니즘

### 6.1. 연결 오류 처리

1. **최대 재시도 횟수**: 3회
2. **재시도 간격**: 1초 (연결) / 5초 (풀 초기화)
3. **오류 발생 시 로깅 및 재시도**
4. **최대 재시도 횟수 초과 시 오류 반환**

> **점진적 백오프**: 재시도할 때마다 대기 시간을 늘려 시스템에 과부하가 걸리지 않도록 합니다.

### 6.2. 풀 오류 처리

1. **오류 로깅**: 발생한 모든 오류를 상세히 로깅
2. **연결 풀 재초기화 시도**: 오류 발생 시 해당 DB의 연결 풀 재초기화
3. **재초기화 실패 시 오류 로깅 및 관리자에게 알림**

> **자동 복구**: 시스템은 가능한 한 자동으로 오류에서 복구를 시도해야 합니다.

### 6.3. 예외 상황 시나리오 및 대응

#### 6.3.1. football_service DB 연결 실패 시나리오

```typescript
// football_service DB 연결 실패 처리 예시
try {
  // football_service DB 연결 시도
  const footballServiceConnection = await createConnection(footballServiceConfig);
  // DB 정보 로드 및 캐싱
  await saveDBCollection(footballServiceConnection);
} catch (error) {
  logger.error('마스터 DB(football_service) 연결 실패', error);
  
  // 1. 로컬 캐시 확인
  if (fs.existsSync('./db-collection-cache.json')) {
    try {
      const cachedData = JSON.parse(fs.readFileSync('./db-collection-cache.json', 'utf-8'));
      global.DB_COLLECTION = cachedData;
      logger.warn('마스터 DB 연결 실패, 로컬 캐시에서 DB 정보 복구 시도');
      
      // 2. 백업 마스터 DB 시도 (구성된 경우)
      if (process.env.BACKUP_FOOTBALL_SERVICE_HOST) {
        try {
          const backupConfig = {
            host: process.env.BACKUP_FOOTBALL_SERVICE_HOST,
            port: process.env.BACKUP_FOOTBALL_SERVICE_PORT,
            // 기타 연결 정보...
          };
          await retryConnection(backupConfig);
          logger.info('백업 마스터 DB 연결 성공');
        } catch (backupError) {
          logger.error('백업 마스터 DB 연결 실패', backupError);
        }
      }
    } catch (cacheError) {
      logger.error('로컬 캐시 로드 실패', cacheError);
      // 서버 시작 실패 처리
      process.exit(1);
    }
  } else {
    // 캐시도 없고 백업 DB도 실패한 경우
    logger.fatal('마스터 DB 연결 실패 및 복구 불가, 서버 시작 불가');
    process.exit(1);
  }
}
```

> **중요**: football_service DB는 시스템의 핵심 DB로, 연결 실패 시 복구 메커니즘이 반드시 필요합니다. 최후의 수단으로 로컬 캐시를 사용할 수 있지만, 이는 임시 조치이며 가능한 한 빨리 마스터 DB 연결을 복구해야 합니다.

#### 6.3.2. DB 정보 불일치 시나리오

요청된 DB가 DB_COLLECTION에 존재하지만 실제 연결이 불가능한 경우:

```typescript
// DB 연결 불일치 처리 예시
export async function executeQuery(params: QueryParams): Promise<QueryResult> {
  const { dbName, query, queryParams } = params;
  
  try {
    if (!DB_COLLECTION[dbName]) {
      return {
        success: false,
        message: '요청한 데이터베이스 정보가 없습니다.',
        status: 404
      };
    }
    
    // DB 연결 시도
    return await DBConnectionManager.getInstance().withClient(dbName, async (client) => {
      return await client.query(query, queryParams);
    });
  } catch (error) {
    // 연결 풀 오류 발생 (DB 정보는 있으나 연결 불가)
    if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
      logger.error(`DB '${dbName}' 연결 실패: ${error.message}`);
      
      // DB 정보 재동기화 시도
      try {
        await saveDBCollection(); // DB 정보 새로고침
        logger.info(`DB 정보 재동기화 완료`);
        
        // 재시도
        return await DBConnectionManager.getInstance().withClient(dbName, async (client) => {
          return await client.query(query, queryParams);
        });
      } catch (refreshError) {
        logger.error(`DB 정보 재동기화 실패: ${refreshError.message}`);
        return {
          success: false,
          message: '데이터베이스 연결 실패 및 정보 갱신 실패',
          error: error.message,
          status: 503
        };
      }
    }
    
    // 기타 오류
    logger.error(`쿼리 실행 중 오류: ${error.message}`);
    return {
      success: false,
      message: '쿼리 실행 중 오류가 발생했습니다.',
      error: error.message,
      status: 500
    };
  }
}
```

> **지속적 동기화**: 시스템은 주기적으로(예: 1시간마다) DB 정보를 재동기화하여 캐싱된 정보와 실제 DB 상태의 불일치를 최소화해야 합니다.

## 7. DB 쿼리 작성 및 사용 규칙

### 7.1. 쿼리 정의

1. **쿼리 위치**: 모든 쿼리는 도메인별로 분리된 파일에 정의되어야 함
   
   > **조직화**: 쿼리를 도메인별로 분리하면 코드 관리가 용이해집니다.

2. **쿼리 형식**: 각 쿼리는 다음 형식을 따름
   ```typescript
   {
     name: 'QUERY_NAME',
     description: '쿼리 설명',
     query: `SQL 쿼리`
   }
   ```
   
   > **설명 필수**: 모든 쿼리에는 그 목적을 명확히 설명하는 description이 포함되어야 합니다.

3. **쿼리 집중화**: 모든 쿼리는 `queries-*.ts` 파일에 정의하고 `DB_QUERIES` 객체를 통해 접근
   
   > **유지보수**: 이 패턴을 통해 쿼리 변경이 필요할 때 한 곳에서만 수정하면 됩니다.

### 7.2. 쿼리 사용

1. **쿼리 참조**: `DB_QUERIES` 객체에서 필요한 쿼리 참조
   ```typescript
   const query = USER_CURRENCY_QUERIES.DELETE_USER_CURRENCY.query;
   ```
   
   > **명명 규칙**: 쿼리 이름은 UPPER_SNAKE_CASE로 작성하고 동작과 엔터티를 명확히 표현해야 합니다.

2. **파라미터 사용**: 모든 쿼리는 파라미터화된 형태로 사용
   ```typescript
   await client.query(query, [employerUid, excelItemIndex]);
   ```
   
   > **SQL 인젝션 방지**: 직접 문자열 연결로 쿼리를 작성하지 말고 항상 파라미터화된 쿼리를 사용해야 합니다.

3. **로깅**: 쿼리 실행 전후로 충분한 로깅 추가
   ```typescript
   logger.info(`Executing query: ${queryName}`);
   const result = await client.query(query, params);
   logger.info(`Query executed with ${result.rowCount} rows affected`);
   ```
   
   > **트러블슈팅**: 충분한 로깅은 문제 해결에 중요한 역할을 합니다.

## 8. 성능 최적화 가이드라인

### 8.1. 연결 풀 최적화

- **풀 크기 조정**: 최대 클라이언트 수는 워크로드에 맞게 조정 (기본값: 20)
- **연결 수명 관리**: 유휴 연결 타임아웃은 30초, 연결당 최대 재사용 횟수는 7500으로 설정
- **TCP 설정**: TCP Keepalive를 활성화하여 연결 유지
- **자원 관리**: 모든 연결이 유휴 상태일 때 풀 종료 허용

> **서버 자원**: 연결 풀은 귀중한 서버 자원을 사용하므로 최적의 크기로 설정해야 합니다.

### 8.2. 쿼리 최적화

- **타임아웃 설정**: 모든 쿼리에 10초 타임아웃 설정
- **페이징 처리**: 조회 결과가 많은 쿼리는 페이징 처리
- **인덱스 활용**: 자주 사용되는 쿼리는 인덱스 활용

> **실행 계획**: 중요한 쿼리는 EXPLAIN을 사용하여 실행 계획을 분석하고 최적화해야 합니다.

## 9. 보안 고려사항

- **환경 변수 사용**: DB 인증 정보는 환경 변수로 관리
- **클라이언트 제한**: 클라이언트 코드에서 직접 DB 연결 시도 방지
- **파라미터화된 쿼리**: 쿼리 파라미터는 항상 파라미터화된 쿼리로 처리하여 SQL 인젝션 방지
- **최소 권한 원칙**: 각 서비스에 필요한 최소한의 DB 권한만 부여

> **보안 우선**: 데이터베이스 보안은 최우선으로 고려해야 합니다.

### 9.1. DB 접근 제어 정책

1. **역할 기반 접근 제어**:
   - 개발자 역할: 개발/테스트 DB에만 완전한 접근 권한
   - 운영자 역할: 운영 DB에 읽기 권한 및 제한된 쓰기 권한
   - 관리자 역할: 모든 DB에 완전한 접근 권한
   
   > **최소 권한 원칙**: 각 역할은 필요한 최소한의 권한만 부여받아야 합니다.

2. **DB 사용자 및 권한 관리**:
   ```sql
   -- 서비스 별 사용자 생성 예시
   CREATE USER football_service_user WITH PASSWORD 'complex_password';
   
   -- 권한 부여 예시
   GRANT SELECT, INSERT, UPDATE ON football_users TO football_service_user;
   GRANT SELECT ON football_service_db_info TO football_service_user;
   
   -- 권한 제한 예시 (특정 테이블 접근 제한)
   REVOKE ALL ON football_admin_logs FROM football_service_user;
   ```

3. **IP 기반 접근 제한**:
   - 서버 환경에서만 football_service DB 접근 가능
   - 개발 DB는 개발 네트워크에서만 접근 가능
   - 운영 DB는 운영 네트워크 및 VPN을 통해서만 접근 가능

### 9.2. 인증 정보 관리

1. **환경 변수 관리**:
   ```
   # .env.development (개발 환경)
   DB_HOST=dev-db.example.com
   DB_PORT=5432
   DB_USER=football_dev_user
   DB_PASSWORD=dev_password
   
   # .env.production (운영 환경)
   DB_HOST=prod-db.example.com
   DB_PORT=5432
   DB_USER=football_prod_user
   DB_PASSWORD=prod_complex_password
   ```
   
   > **주의**: `.env` 파일은 버전 관리 시스템에 포함하지 않습니다. 대신 `.env.example` 파일을 제공하여 필요한 변수를 문서화합니다.

2. **비밀 교체 정책**:
   - 모든 DB 비밀번호는 90일마다 교체
   - 개발자 퇴사 시 즉시 비밀번호 교체
   - 비밀번호 교체 시 롤링 업데이트 적용 (서비스 중단 최소화)

## 10. 모니터링 및 로깅

- **연결 시도 로깅**: 모든 DB 연결 시도 및 결과 로깅
- **풀 상태 모니터링**: 연결 풀 상태 주기적으로 모니터링
- **오류 상세 로깅**: 오류 발생 시 상세 정보 로깅 (단, 민감한 정보는 제외)
- **성능 지표 수집**: 쿼리 실행 시간, 연결 획득 시간 등 성능 지표 수집

> **문제 해결**: 효과적인 모니터링과 로깅은 문제를 신속하게 식별하고 해결하는 데 필수적입니다.

### 10.1. 성능 모니터링 및 문제 해결 가이드

#### 10.1.1. 성능 지표 수집

```typescript
// 쿼리 실행 시간 측정 예시
export async function executeQueryWithMetrics(params: QueryParams): Promise<QueryResult> {
  const { dbName, query, queryParams } = params;
  const startTime = performance.now();
  const queryName = params.queryName || 'unknown_query';
  
  try {
    // 연결 획득 시작 시간 기록
    const connectionStartTime = performance.now();
    
    const result = await DBConnectionManager.getInstance().withClient(dbName, async (client) => {
      // 연결 획득 소요 시간 계산
      const connectionTime = performance.now() - connectionStartTime;
      
      // 연결 획득 시간 메트릭 기록
      metrics.recordDbConnectionTime(dbName, connectionTime);
      
      // 쿼리 실행 시작 시간 기록
      const queryStartTime = performance.now();
      
      // 쿼리 실행
      const queryResult = await client.query(query, queryParams);
      
      // 쿼리 실행 시간 계산
      const queryExecutionTime = performance.now() - queryStartTime;
      
      // 쿼리 실행 시간 메트릭 기록
      metrics.recordQueryExecutionTime(dbName, queryName, queryExecutionTime);
      
      return queryResult;
    });
    
    // 전체 작업 소요 시간 계산
    const totalTime = performance.now() - startTime;
    
    // 전체 작업 시간 메트릭 기록
    metrics.recordTotalQueryOperationTime(dbName, queryName, totalTime);
    
    logger.debug(`쿼리 [${queryName}]가 성공적으로 실행됨 - DB: ${dbName}, 총 소요 시간: ${totalTime.toFixed(2)}ms`);
    
    return result;
  } catch (error) {
    // 오류 처리 및 메트릭 기록
    metrics.recordQueryError(dbName, queryName);
    logger.error(`쿼리 [${queryName}] 실행 중 오류 발생 - DB: ${dbName}, 오류: ${error.message}`);
    throw error;
  }
}
```

#### 10.1.2. 모니터링 대시보드 구성

모니터링 대시보드는 다음과 같은 지표를 표시해야 합니다:

1. **연결 풀 상태**:
   - 활성 연결 수 / 최대 연결 수
   - 대기 중인 연결 요청 수
   - 유휴 연결 수

2. **성능 지표**:
   - 평균 쿼리 실행 시간 (DB별, 쿼리별)
   - 연결 획득 평균 시간
   - 초당 쿼리 수 (DB별)

3. **오류 지표**:
   - 연결 실패 횟수
   - 쿼리 오류 횟수
   - 재시도 횟수

#### 10.1.3. 일반적인 문제 해결 가이드

| 문제 | 가능한 원인 | 해결 방법 |
|------|------------|----------|
| 연결 풀 고갈 | 1. 너무 많은 동시 요청<br>2. 연결이 반환되지 않음<br>3. 연결 풀 크기가 너무 작음 | 1. 요청 수 제한 검토<br>2. withClient 패턴 사용 확인<br>3. 연결 풀 크기 증가 |
| 느린 쿼리 | 1. 인덱스 누락<br>2. 비효율적인 쿼리<br>3. DB 서버 부하 | 1. 인덱스 추가<br>2. 쿼리 최적화<br>3. DB 서버 리소스 증가 |
| 간헐적 연결 오류 | 1. 네트워크 문제<br>2. DB 서버 재시작<br>3. 연결 타임아웃 | 1. 네트워크 안정성 검토<br>2. 재시도 메커니즘 확인<br>3. 연결 타임아웃 증가 |

## 11. 배포 환경별 설정

시스템은 개발(Development), 테스트(Test), 스테이징(Staging), 운영(Production) 환경에 따라 다른 설정을 적용해야 합니다.

### 11.1. 환경별 설정 차이

| 설정 | 개발 | 테스트 | 스테이징 | 운영 |
|------|-----|-------|---------|-----|
| **연결 풀 크기** | 5 | 10 | 15 | 20 |
| **연결 타임아웃** | 5초 | 3초 | 2초 | 2초 |
| **쿼리 타임아웃** | 30초 | 20초 | 15초 | 10초 |
| **로깅 레벨** | debug | debug | info | warn |
| **재시도 횟수** | 2 | 2 | 3 | 3 |
| **DB 동기화 주기** | 필요 시 | 1시간 | 1시간 | 1시간 |

### 11.2. 환경 변수 설정 예시

```dotenv
# 공통 설정
NODE_ENV=production  # development, test, staging, production

# football_service DB 정보 (마스터 DB)
FOOTBALL_SERVICE_HOST=db.football-service.com
FOOTBALL_SERVICE_PORT=5432
FOOTBALL_SERVICE_USER=football_service_user
FOOTBALL_SERVICE_PASSWORD=xxxx
FOOTBALL_SERVICE_DB=football_service

# 백업 football_service DB 정보
BACKUP_FOOTBALL_SERVICE_HOST=backup-db.football-service.com
BACKUP_FOOTBALL_SERVICE_PORT=5432
BACKUP_FOOTBALL_SERVICE_USER=football_service_user
BACKUP_FOOTBALL_SERVICE_PASSWORD=xxxx

# 연결 풀 설정
DB_POOL_MAX=20
DB_POOL_IDLE_TIMEOUT=30000
DB_POOL_CONNECTION_TIMEOUT=2000
DB_QUERY_TIMEOUT=10000
DB_MAX_REUSE=7500

# 재시도 설정
DB_CONNECT_RETRY_COUNT=3
DB_CONNECT_RETRY_DELAY=1000
DB_POOL_INIT_RETRY_DELAY=5000

# 캐싱 설정
DB_REFRESH_INTERVAL=3600000  # 1시간마다 DB 정보 갱신 (밀리초)
DB_CACHE_LOCAL_BACKUP=true
```

### 11.3. 환경 전환 체크리스트

새로운 환경으로 배포 시 다음 항목을 확인해야 합니다:

1. **환경 변수 설정 확인**:
   - 모든 필수 환경 변수가 설정되었는지 확인
   - 환경에 맞는 값이 설정되었는지 확인

2. **DB 연결 테스트**:
   - football_service DB 연결 테스트
   - 백업 DB 연결 테스트
   - 주요 서비스 DB 연결 테스트

3. **권한 확인**:
   - DB 사용자가 필요한 모든 권한을 가지고 있는지 확인
   - 해당 환경에 맞는 제한된 권한이 적용되었는지 확인

## 12. 확장성 고려사항

- **싱글톤 패턴**: `DBConnectionManager`의 싱글톤 패턴을 통해 여러 DB 연결 관리
- **도메인 분리**: 도메인별로 쿼리 파일 분리하여 확장성 확보
- **DB 타입 지원**: DB 종류에 따라 다른 연결 설정 적용 가능

> **미래 대비**: 시스템이 성장함에 따라 더 많은 데이터베이스를 관리할 수 있도록 설계되었습니다.

### 12.1. 새 DB 타입 지원 추가

새로운 데이터베이스 타입(예: MySQL, MongoDB 등)을 지원해야 하는 경우:

```typescript
// DBConnectionManager 클래스에 새 DB 타입 지원 추가 예시
export class DBConnectionManager {
  // ... 기존 코드 ...
  
  // 데이터베이스 타입에 따른 연결 풀 생성 메서드
  private createPool(dbInfo: DBInfo): any {
    const { db_type, host, port, user, password, database } = dbInfo;
    
    switch (db_type.toLowerCase()) {
      case 'postgres':
        return new Pool({
          host,
          port,
          user,
          password,
          database,
          max: parseInt(process.env.DB_POOL_MAX || '20'),
          idleTimeoutMillis: parseInt(process.env.DB_POOL_IDLE_TIMEOUT || '30000'),
          connectionTimeoutMillis: parseInt(process.env.DB_POOL_CONNECTION_TIMEOUT || '2000'),
          maxUses: parseInt(process.env.DB_MAX_REUSE || '7500'),
        });
        
      case 'mysql':
        return mysql.createPool({
          host,
          port,
          user,
          password,
          database,
          connectionLimit: parseInt(process.env.DB_POOL_MAX || '20'),
          connectTimeout: parseInt(process.env.DB_POOL_CONNECTION_TIMEOUT || '2000'),
          waitForConnections: true,
          queueLimit: 0,
        });
        
      case 'mongodb':
        return new MongoClient(`mongodb://${user}:${password}@${host}:${port}/${database}`, {
          useNewUrlParser: true,
          useUnifiedTopology: true,
          maxPoolSize: parseInt(process.env.DB_POOL_MAX || '20'),
          serverSelectionTimeoutMS: parseInt(process.env.DB_POOL_CONNECTION_TIMEOUT || '2000'),
        });
        
      default:
        throw new Error(`지원되지 않는 데이터베이스 타입: ${db_type}`);
    }
  }
  
  // 데이터베이스 타입에 따른 쿼리 실행 메서드 (예시)
  public async withClient(dbName: string, callback: any): Promise<any> {
    const dbInfo = DB_COLLECTION[dbName];
    if (!dbInfo) {
      throw new Error(`DB 정보를 찾을 수 없음: ${dbName}`);
    }
    
    const pool = DB_CONNECT_ARRAY[dbName];
    if (!pool) {
      throw new Error(`DB 연결 풀을 찾을 수 없음: ${dbName}`);
    }
    
    const db_type = dbInfo.db_type.toLowerCase();
    
    switch (db_type) {
      case 'postgres':
        const client = await pool.connect();
        try {
          return await callback(client);
        } finally {
          client.release();
        }
        
      case 'mysql':
        return new Promise((resolve, reject) => {
          pool.getConnection((err, connection) => {
            if (err) {
              return reject(err);
            }
            
            const wrappedConnection = {
              query: (sql, params) => {
                return new Promise((innerRes, innerRej) => {
                  connection.query(sql, params, (queryErr, results) => {
                    if (queryErr) {
                      return innerRej(queryErr);
                    }
                    innerRes({ rows: results });
                  });
                });
              }
            };
            
            callback(wrappedConnection)
              .then(result => {
                connection.release();
                resolve(result);
              })
              .catch(error => {
                connection.release();
                reject(error);
              });
          });
        });
        
      case 'mongodb':
        try {
          await pool.connect();
          const db = pool.db();
          return await callback(db);
        } finally {
          // MongoDB 연결 풀은 자체 관리됨
        }
        
      default:
        throw new Error(`지원되지 않는 데이터베이스 타입: ${db_type}`);
    }
  }
  
  // ... 기존 코드 ...
}
```

### 12.2. 확장을 위한 구조 설계 원칙

1. **기능 확장성**:
   - 새로운 DB 유형을 쉽게 추가할 수 있는 설계
   - DB 접근 메서드를 표준화하여 상위 레벨 코드가 DB 유형에 의존하지 않도록 함

2. **성능 확장성**:
   - 부하 증가에 따라 연결 풀 설정을 조정할 수 있는 구조
   - 필요 시 개별 DB에 대한 연결 풀 크기를 독립적으로 조정 가능

3. **코드 확장성**:
   - 각 도메인 영역별로 분리된 쿼리 파일 구조
   - 새로운 쿼리 유형 추가가 쉬운 모듈화된 구조

## 13. 데이터베이스 관리자 가이드

### 13.1. 새 DB 추가 절차

1. **football_service DB에 새 DB 정보 추가**:
   ```sql
   INSERT INTO service_db_collection (
     db_name, display_name, db_type, host, port,
     user, password, database, description, is_active
   ) VALUES (
     'football_newdb', 'New Football DB', 'postgres',
     'db-new.example.com', 5432, 'football_user', 'secure_password',
     'football_db', '새로운 풋볼 서비스용 DB', true
   );
   ```

2. **DB 연결 정보 갱신 트리거**:
   - 관리자 API를 통해 DB 정보 갱신 트리거
   ```
   GET /api/admin/refresh-db-info
   ```
   - 또는 서버 재시작

3. **접근 권한 설정**:
   - 새 DB에 대한 사용자 권한 설정
   - 접근 권한이 필요한 사용자 역할 확인

### 13.2. DB 정보 변경 절차

1. **변경 내용 검토**:
   - 변경이 필요한 DB 연결 정보 확인
   - 변경의 영향 범위 분석

2. **변경 적용**:
   - football_service DB에서 정보 업데이트
   ```sql
   UPDATE service_db_collection
   SET host = 'new-host.example.com', port = 5433
   WHERE db_name = 'football_targetdb';
   ```

3. **변경 적용 및 검증**:
   - DB 정보 갱신 API 호출
   - 새 연결로 테스트 쿼리 실행하여 검증

4. **롤백 계획**:
   - 문제 발생 시 이전 설정으로 롤백할 수 있는 계획 수립

### 13.3. DB 상태 모니터링

1. **상태 확인 API**:
   ```
   GET /api/admin/db-status?dbName=football_develop
   ```
   
   응답 예시:
   ```json
   {
     "status": "healthy",
     "connectionPool": {
       "total": 20,
       "active": 3,
       "idle": 17,
       "waiting": 0
     },
     "metrics": {
       "avgQueryTime": 5.2,
       "queriesPerMinute": 120,
       "errorRate": 0.01
     },
     "lastRefresh": "2023-10-15T08:30:15Z"
   }
   ```

2. **모니터링 대시보드**:
   - 모든 DB의 상태를 한눈에 볼 수 있는 대시보드 제공
   - 연결 풀 상태, 쿼리 성능, 오류율 등 주요 지표 표시

3. **알림 설정**:
   - 특정 임계값 초과 시 알림 발생
   - 예: 연결 풀 사용률 80% 초과, 쿼리 오류율 5% 초과 등

## 14. 참고 자료

### 14.1. 주요 파일 경로
- **데이터베이스 연결 관리**: `src/lib/db/db-connection-manager.ts`
- **DB 정보 관리**: `src/app/api/db-information/db-collection.ts`, `src/app/api/db-information/db-information.ts`
- **쿼리 정의**: `src/app/api/db-query/queries.ts`, `src/app/api/db-query/queries-*.ts`
- **DB 초기화**: `src/lib/init/database-initializer.ts`

### 14.2. 관련 API 엔드포인트
- **DB 연결 테스트**: `GET /api/db-connection?dbName={dbName}`
- **DB 쿼리 실행**: `GET /api/db-query?dbName={dbName}`
- **DB 리스트 조회**: `GET /api/db-list-load`
- **DB 정보 갱신**: `GET /api/admin/refresh-db-info` (관리자 전용)
- **DB 상태 확인**: `GET /api/admin/db-status?dbName={dbName}` (관리자 전용)

### 14.3. 개발자 참고 사항
- **새 쿼리 추가**: 새로운 쿼리를 추가할 때는 적절한 도메인 파일에 추가하고 `DB_QUERIES` 객체를 통해 노출해야 합니다.
- **새 DB 타입 지원**: 새로운 DB 타입을 지원하려면 `DBConnectionManager` 클래스에 해당 타입을 처리하는 로직을 추가해야 합니다.
- **DB 문제 디버깅**: DB 연결 문제를 디버깅할 때는 로그를 확인하고, 필요하다면 `/api/db-connection` 엔드포인트를 사용하여 연결을 테스트할 수 있습니다.

## 15. 요약: 핵심 워크플로우와 DB_NAME의 중요성

### 15.1. 워크플로우 핵심 요약

1. **서버 초기화**: football_service DB 연결 및 전체 DB 정보 로드
2. **캐싱 및 풀 관리**: DB 정보 캐싱 및 각 DB별 연결 풀 초기화
3. **클라이언트 상호작용**: 클라이언트 로그인 → DB 리스트 수신 → API 요청 시 DB_NAME 포함
4. **요청 처리**: 서버는 요청된 DB_NAME에 해당하는 연결 풀을 사용하여 요청 처리

### 15.2. 개발자가 항상 기억해야 할 핵심 규칙

1. **DB_NAME의 필수성**:
   - 모든 DB 관련 API 요청에는 DB_NAME이 반드시 포함되어야 함
   - DB_NAME 검증은 모든 API 엔드포인트에서 최우선으로 수행해야 함
   - DB_NAME이 없거나 유효하지 않은 요청은 즉시 거부해야 함

2. **연결 풀 관리**:
   - DB 연결은 항상 연결 풀을 통해 관리되어야 함
   - `withClient` 또는 `withTransaction` 메서드를 사용하여 연결 자동 관리
   - 수동으로 연결을 획득하거나 반환하는 코드는 작성하지 말아야 함

3. **쿼리 관리**:
   - 모든 쿼리는 `queries-*.ts` 파일에 정의하고 `DB_QUERIES` 객체를 통해 접근
   - 직접 SQL 문자열을 API 코드에 작성하지 말 것
   - 파라미터화된 쿼리를 사용하여 SQL 인젝션 방지

클라이언트-서버 워크플로우와 DB_NAME 파라미터의 일관된 사용은 시스템 안정성과 보안의 핵심입니다. 모든 개발자는 이 프로세스를 철저히 준수해야 합니다. 