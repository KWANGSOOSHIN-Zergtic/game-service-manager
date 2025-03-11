# **📌 Tech PRD - Next.js (TypeScript) + `node-shared-memory` 기반 다중 DB 테이블 캐싱 시스템 (초기 버전)**  

---

## **📌 1. 개요**
### **1.1 프로젝트 개요**  
본 프로젝트는 **Next.js 기반의 API 시스템**에서 **다중 PostgreSQL 데이터베이스의 특정 테이블을 SHM(Shared Memory)에 캐싱**하여,  
데이터 검색 및 조회 속도를 최적화하고 API 응답 속도를 향상하는 것이 목표입니다.  

### **1.2 주요 기술적 요구사항**
✅ **Next.js 기반의 API 서버 개발**  
✅ **다중 PostgreSQL DB 연결 및 테이블 검색 지원**  
✅ **SHM(Shared Memory) 기반 데이터 캐싱**  
✅ **SHM 크기 동적 조정 기능 제공**  
✅ **테이블 검색 필터 기능 (Prefix, Suffix, Contains) 지원**  
✅ **SHM 데이터 자동 재로딩 (서버 재시작 시 초기화 후 다시 캐싱)**  
✅ **Redis Pub/Sub을 통한 실시간 데이터 변경 반영**  
✅ **API를 통한 테이블 조회 및 관리 기능 제공**  
✅ **관리 UI를 통한 테이블 관리 및 SHM 리로드 기능 제공**  

---

## **📌 2. 시스템 아키텍처**
```plaintext
+------------------------+       +--------------------------+
| PostgreSQL (Multi-DB)  | <---> | Next.js API (DB Queries) |
+------------------------+       +--------------------------+
                                       |
                                       v
                          +------------------------+
                          |  SHM (Shared Memory)   |
                          |  + Cached Data         |
                          |  + Table Structures    |
                          +------------------------+
                                       |
                      +---------------------------------+
                      | Next.js API (Data Management)  |
                      +---------------------------------+
                                       |
                      +---------------------------------+
                      | Redis Pub/Sub (Sync Changes)   |
                      +---------------------------------+
```
✅ **다중 PostgreSQL DB에서 데이터를 가져와 SHM에 캐싱하는 구조**  
✅ **Redis Pub/Sub을 활용하여 데이터 변경 시 SHM 자동 업데이트**  
✅ **Next.js API를 통해 캐싱된 데이터를 제공하며, 필요 시 재로딩 가능**  

---

## **📌 3. 주요 기능 상세**
### **3.1 다중 DB 테이블 검색 및 관리**
💡 **기능 설명:**  
- 연결된 모든 PostgreSQL DB에서 특정 키워드를 포함하는 테이블 목록을 조회  
- 검색 필터 옵션 제공 (Prefix, Suffix, Contains)  
- 기본적으로 `excel_` 키워드를 사용하며, 필요 시 변경 가능  

| 기능명 | 설명 | 구현 상태 |
|--------|--------|----------|
| **모든 DB의 특정 테이블 목록 조회** | 특정 키워드를 포함하는 테이블 리스트 조회 | ✅ 완료 |
| **특정 DB 선택 필터링** | 특정 DB만 선택하여 테이블을 조회 가능 | ✅ 완료 |
| **테이블명 검색 기능 (Prefix/Suffix/Contains)** | 특정 키워드를 포함하는 테이블 검색 가능 | ✅ 완료 |
| **테이블 컬럼 구조 조회** | 선택한 테이블의 컬럼 정보를 조회 가능 | ✅ 완료 |
| **테이블 데이터 미리보기** | 선택한 테이블의 일부 데이터를 미리보기 가능 | ✅ 완료 |

---

### **3.2 SHM 데이터 처리 및 자동 재로딩**
💡 **기능 설명:**  
- 서버 시작 시 **SHM을 초기화한 후, 다시 모든 DB에서 데이터를 로드하여 캐싱**  
- **SHM 크기가 자동으로 조정되며, 데이터가 증가할 경우 크기를 확장**  
- **Redis Pub/Sub을 통해 변경 사항이 발생하면 SHM을 실시간으로 업데이트**  

| 기능명 | 설명 | 구현 상태 |
|--------|--------|----------|
| **SHM 데이터 초기화 및 재로딩** | 서버 시작 시 모든 DB 데이터를 다시 캐싱 | ✅ 완료 |
| **SHM 크기 자동 조정** | 데이터 증가에 따라 SHM 크기를 확장 | ✅ 완료 |
| **Redis Pub/Sub 동기화** | 실시간 데이터 변경 감지 및 SHM 업데이트 | ✅ 완료 |
| **SHM 수동 리로드 기능** | 관리자가 강제적으로 SHM을 리로드 가능 | ✅ 완료 |

---

### **3.3 API 설계**
#### **📌 테이블 목록 조회 API**
```http
GET /api/tables
```
#### **📌 요청 파라미터**
| 파라미터 | 설명 | 필수 여부 | 기본값 |
|--------|--------|------|------|
| `db` | 특정 DB를 선택하여 검색 | ❌ | - |
| `search` | 특정 키워드(포함 검색) | ❌ | `excel_` |
| `matchType` | `prefix`, `suffix`, `contains` 중 선택 | ❌ | `prefix` |

#### **📌 응답 예시**
```json
{
    "success": true,
    "tables": [
        { "db": "db1", "table": "excel_users" },
        { "db": "db2", "table": "monthly_excel_data" },
        { "db": "db3", "table": "sales_excel_report" }
    ]
}
```

---

#### **📌 SHM 데이터 리로드 API**
```http
POST /api/shm/reload
```
#### **📌 응답 예시**
```json
{
    "success": true,
    "message": "SHM 데이터 초기화 및 재로딩 완료"
}
```

---

## **📌 4. UI 기능**
💡 **관리자가 직접 SHM 데이터를 리로드할 수 있도록 UI 제공**  

#### **📌 SHM 수동 리로드 버튼 (`SHMReloadButton.tsx`)**
```tsx
import { useState } from 'react';

export default function SHMReloadButton() {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const reloadData = async () => {
        setLoading(true);
        setMessage('');
        try {
            const response = await fetch('/api/shm/reload', { method: 'POST' });
            const data = await response.json();
            setMessage(data.message);
        } catch (error) {
            setMessage("❌ 데이터 재로딩 실패");
        }
        setLoading(false);
    };

    return (
        <div>
            <button 
                onClick={reloadData} 
                disabled={loading} 
                className="bg-blue-500 text-white px-4 py-2 rounded"
            >
                {loading ? "로딩 중..." : "SHM 데이터 재로딩"}
            </button>
            {message && <p className="mt-2">{message}</p>}
        </div>
    );
}
```

✅ **관리 UI에서 SHM 데이터를 수동으로 리로드 가능**  

---

## **📌 5. 테스트 및 검증**
| 테스트 항목 | 목표 | 예상 결과 |
|------------|------|----------|
| **서버 재시작 후 SHM 데이터 초기화 확인** | SHM이 초기화된 후 다시 캐싱되는지 확인 | ✅ 초기화 후 새로운 데이터 로드 |
| **SHM 크기 동적 조정 검증** | 데이터 증가 시 SHM 크기가 자동 조정되는지 확인 | ✅ SHM 크기 증가 |
| **Redis Pub/Sub 변경 사항 반영 확인** | 데이터가 변경될 때 SHM이 최신 상태로 유지되는지 확인 | ✅ 실시간 데이터 반영 |
| **UI에서 SHM 리로드 테스트** | 수동으로 데이터 리로드 시 새로운 데이터가 적용되는지 확인 | ✅ 관리자가 즉시 반영 가능 |

---