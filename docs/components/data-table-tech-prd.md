# **📌 Tech PRD - 고성능 데이터 테이블 컴포넌트 (필터링, 정렬, 페이지네이션 등 다양한 기능 포함)**  

---

## **📌 1. 개요**
### **1.1 프로젝트 개요**  
본 프로젝트는 **Next.js 기반의 관리 페이지**에서 **다양한 데이터 소스로부터 테이블 형태의 데이터를 효과적으로 표시하고 관리**할 수 있는 **고성능 데이터 테이블 컴포넌트**를 제공하는 것을 목표로 합니다.  
이 컴포넌트는 **데이터 필터링, 정렬, 페이지네이션, 선택 관리, 커스텀 포맷팅**과 같은 다양한 기능을 제공하며, **UI/UX 측면에서도 최적화된 사용자 경험**을 제공합니다.  

### **1.2 주요 기술 스택**
✅ **Next.js (App Router)** - 클라이언트 컴포넌트 개발  
✅ **TypeScript** - 정적 타입 시스템 및 인터페이스 정의  
✅ **React Hooks** - 상태 관리 및 라이프사이클 관리  
✅ **TailwindCSS** - UI 스타일링  
✅ **ShadCN UI** - 기본 UI 컴포넌트 (테이블, 체크박스, 버튼 등)  
✅ **Lucide React** - 아이콘 라이브러리  

---

## **📌 2. 컴포넌트 아키텍처**
```plaintext
+----------------------+      +-------------------------+
| 상위 컴포넌트 (Parent) | <--> | DataTable 컴포넌트      |
+----------------------+      +-------------------------+
                                |
                                v
+------------------+  +------------------+  +------------------+
| 테이블 헤더/컬럼   |  | 테이블 바디/행    |  | 페이지네이션      |
+------------------+  +------------------+  +------------------+
         |                     |                    |
         v                     v                    v
+------------------+  +------------------+  +------------------+
| 정렬/필터링 로직  |  | 선택/포맷팅 로직  |  | 페이지 계산 로직  |
+------------------+  +------------------+  +------------------+
```
✅ **컴포넌트 기반 설계로 재사용성 및 확장성 보장**  
✅ **React Hooks를 활용한 상태 관리 및 데이터 처리**  
✅ **이벤트 핸들러를 통한 상위 컴포넌트와 통신**  

---

## **📌 3. 주요 기능 및 상세 구현**
### **3.1 데이터 테이블 렌더링 및 관리**
💡 **기능 설명:**  
- **다양한 데이터 소스의 정보를 테이블 형태로 표시**  
- **동적 컬럼 생성 및 관리**  
- **테이블 UI 사용자 정의 (스타일링, 클래스명 등)**  

| 기능명 | 구현 방식 | 기술적 고려사항 |
|--------|----------|----------------|
| **데이터 검증 및 처리** | `validateData()` 함수를 통해 입력 데이터 유효성 검사 | 데이터 구조 일관성 확인, ID 필드 존재 확인 |
| **동적 컬럼 생성** | 데이터의 첫 항목을 분석하여 `TableColumn[]` 타입으로 컬럼 구조 생성 | 데이터 타입 자동 감지(string, number, object 등) |
| **사용자 정의 스타일링** | 테이블, 헤더, 행, 셀별 클래스명 지정 가능 | TailwindCSS 클래스 적용, 커스텀 스타일 가능 |
| **순번 컬럼 자동 생성** | 페이지네이션을 고려한 `displayIndex` 필드 생성 | 페이지별 순번 계산 및 표시 |
| **빈 데이터 및 로딩 상태 처리** | 조건부 렌더링을 통한 다양한 상태 UI 제공 | 스켈레톤 로딩 UI, 빈 데이터 메시지 표시 |

---

### **3.2 정렬 및 필터링 기능**
💡 **기능 설명:**  
- **컬럼별 정렬 (오름차순/내림차순) 및 정렬 초기화**  
- **데이터 검색 및 필터링**  
- **컬럼 표시/숨김 설정**  

| 기능명 | 구현 방식 | 기술적 고려사항 |
|--------|----------|----------------|
| **컬럼별 정렬** | `handleSort()` 함수를 통한 정렬 상태 관리, `sortConfig` 상태 사용 | 다양한 데이터 타입(문자열, 숫자, 날짜 등)에 대한 정렬 로직 |
| **정렬 방향 토글** | 동일 컬럼 연속 클릭 시 asc → desc → null 순으로 토글 | 3단계 정렬 상태 관리 및 UI 표시 |
| **데이터 검색** | `handleSearch()` 함수를 통한 전체 컬럼 대상 검색 | 대소문자 무시 검색, 다중 필드 검색 |
| **컬럼 필터링** | `toggleColumn()` 및 `toggleAllColumns()` 함수를 통한 컬럼 표시 제어 | Set 자료구조를 활용한 가시성 관리 |
| **필터링된 데이터 관리** | `filteredData` 상태를 통한 검색/정렬 결과 관리 | 원본 데이터 보존 및 필터링된 뷰 제공 |

---

### **3.3 페이지네이션 및 데이터 분할**
💡 **기능 설명:**  
- **페이지 단위 데이터 표시**  
- **페이지 이동 및 페이지당 항목 수 설정**  
- **전체 데이터 표시 옵션**  

| 기능명 | 구현 방식 | 기술적 고려사항 |
|--------|----------|----------------|
| **페이지 데이터 계산** | `currentData` 계산을 위한 `useMemo` 훅 사용 | 불필요한 재계산 방지, 성능 최적화 |
| **페이지 이동 핸들링** | `handlePageChange()` 함수 및 `currentPage` 상태 관리 | 페이지 범위 검증, 페이지 이동 콜백 |
| **페이지당 항목 수 설정** | `handleItemsPerPageChange()` 함수 및 `itemsPerPage` 상태 관리 | 'all' 옵션 지원, 페이지 리셋 처리 |
| **페이지네이션 UI 통합** | 외부 `Pagination` 컴포넌트와 통합 | 현재 페이지, 총 항목 수, 페이지당 항목 수 전달 |

---

### **3.4 행 선택 및 이벤트 처리**
💡 **기능 설명:**  
- **체크박스를 통한 개별 행 또는 전체 행 선택**  
- **선택된 행 데이터 상위 컴포넌트에 전달**  
- **행 클릭 이벤트 처리**  

| 기능명 | 구현 방식 | 기술적 고려사항 |
|--------|----------|----------------|
| **행 선택 상태 관리** | `selectedRows` 상태를 통한 선택된 행 ID 추적 | 문자열 배열로 ID 관리, 선택 상태 유지 |
| **전체 선택/해제** | `handleSelectAll()` 함수 통한 일괄 처리 | 현재 페이지 또는 전체 데이터 대상 선택 |
| **개별 행 선택** | `handleSelectRow()` 함수를 통한 토글 기능 | ID 기반 토글, 상태 업데이트 최적화 |
| **선택 변경 이벤트** | `onSelectionChange` 콜백을 통한 상위 컴포넌트 통지 | 선택된 전체 행 객체 배열 전달 |
| **행 클릭 이벤트** | `onRowClick` 콜백을 통한 행 선택 시 처리 | 행 데이터 객체 전달 |

---

### **3.5 데이터 형식화 및 표시**
💡 **기능 설명:**  
- **다양한 데이터 타입에 대한 자동 감지 및 형식화**  
- **커스텀 형식 지정 기능**  
- **복잡한 객체 데이터 표시**  

| 기능명 | 구현 방식 | 기술적 고려사항 |
|--------|----------|----------------|
| **데이터 타입 감지** | 값 분석을 통한 타입 추론 (숫자, 통화, 백분율 등) | 정규식 패턴 매칭, 키 이름 기반 타입 추론 |
| **기본 포맷팅** | `formatValue()` 유틸리티 함수를 통한 데이터 형식화 | null/undefined 처리, 타입별 형식화 |
| **커스텀 포맷터 지원** | `customFormatters` props를 통한 사용자 정의 포맷팅 함수 | 컬럼별 포맷팅 함수 매핑 |
| **객체 데이터 표시** | `ObjectDisplay` 컴포넌트를 통한 객체 시각화 | 중첩 객체 구조 표시, 클릭 확장 기능 |
| **카테고리 스타일링** | 카테고리 필드 자동 감지 및 특별 스타일 적용 | 배지 스타일, 색상 구분 등 |

---

### **3.6 추가 기능 통합**
💡 **기능 설명:**  
- **화폐 관리 패널 통합**  
- **디버그 정보 표시**  
- **데이터베이스 정보 표시**  

| 기능명 | 구현 방식 | 기술적 고려사항 |
|--------|----------|----------------|
| **화폐 관리 패널** | `CurrencyControlPanel` 컴포넌트 조건부 렌더링 | 상태에 따른 표시/숨김, 이벤트 핸들러 연결 |
| **고급 화폐 관리** | `AdvancedCurrencyControlPanel` 컴포넌트 통합 | 아이템 사용/획득/전송 기능 |
| **디버그 정보** | 디버그 모드 토글 버튼 및 이벤트 발생 | CustomEvent 디스패치로 외부 디버그 패널 제어 |
| **DB 정보 표시** | 다양한 소스(props, sessionStorage)에서 DB 정보 가져오기 | 우선순위에 따른 정보 소스 선택 |
| **에러 상태 표시** | API 응답 상태에 따른 UI 변경 | sessionStorage에서 상태 정보 확인 |

---

## **📌 4. 인터페이스 정의**
### **4.1 Props 인터페이스**
```typescript
interface DataTableProps {
  tableName?: string;
  data?: TableData[];
  isLoading?: boolean;
  className?: string;
  headerClassName?: string;
  rowClassName?: string;
  cellClassName?: string;
  customFormatters?: {
    [key: string]: (value: string | number | null | object) => string | number | React.ReactNode;
  };
  onRowClick?: (item: TableData) => void;
  onSelectionChange?: (selectedItems: TableData[]) => void;
  onSort?: (key: string, direction: 'asc' | 'desc' | null) => void;
  onPageChange?: (page: number) => void;
  showActions?: boolean;
  onSelectRows?: () => void;
  dbName?: string;
  showCurrencyControls?: boolean;
  onCreateCurrency?: () => void;
  onUpdateCurrency?: () => void;
  onDeleteCurrency?: () => void;
  showAdvancedCurrencyControls?: boolean;
  onUseItem?: () => void;
  onGetItem?: () => void;
  onSendItem?: () => void;
}
```
✅ **선택적 props를 통한 유연한 구성**  
✅ **이벤트 핸들러를 통한 상위 컴포넌트와 통신**  
✅ **커스터마이징 옵션을 통한 다양한 사용 시나리오 지원**  

---

### **4.2 데이터 및 컬럼 인터페이스**
```typescript
// 테이블 데이터 인터페이스
interface IUITableData {
  id: string | number;
  [key: string]: any;
}

// 테이블 컬럼 인터페이스
interface ITableColumn {
  key: string;
  label: string;
  width?: string;
  type?: 'string' | 'number' | 'currency' | 'percentage' | 'date' | 'object' | 'boolean';
  sortable?: boolean;
  align?: 'left' | 'center' | 'right';
  format?: (value: string | number | boolean | object | null | undefined) => string | number | React.ReactNode;
}

// 이전 타입과의 호환성을 위한 타입 별칭
export type TableData = IUITableData;
export type TableColumn = ITableColumn;
```
✅ **명확한 타입 정의로 개발 시 타입 안정성 확보**  
✅ **다양한 데이터 타입 및 포맷팅 옵션 지원**  
✅ **확장 가능한 인터페이스 설계**  

---

## **📌 5. 성능 최적화**
### **5.1 주요 최적화 기법**
✅ **`useMemo` 및 `useCallback` Hooks 활용**: 불필요한 재계산 및 함수 재생성 방지  
✅ **조건부 렌더링 최적화**: 상태에 따른 효율적인 UI 렌더링  
✅ **리스트 렌더링 최적화**: `key` prop을 통한 효율적인 DOM 업데이트  
✅ **지연 로딩**: 필요한 경우에만 데이터 처리 및 컴포넌트 렌더링  

| 최적화 영역 | 구현 방법 | 기대 효과 |
|------------|----------|----------|
| **데이터 처리** | `useMemo`를 활용한 계산값 캐싱 | 불필요한 데이터 재처리 방지, 렌더링 성능 향상 |
| **이벤트 핸들러** | `useCallback`을 통한 함수 메모이제이션 | 불필요한 렌더링 방지, 이벤트 핸들링 최적화 |
| **컬럼 필터링** | Set 자료구조를 활용한 컬럼 가시성 관리 | 빠른 조회 및 업데이트 성능 |
| **페이지네이션** | 현재 페이지 데이터만 계산하여 렌더링 | 대용량 데이터 처리 시 성능 향상 |
| **조건부 렌더링** | 상태별 최적화된 UI 컴포넌트 렌더링 | 불필요한 DOM 조작 최소화 |

---

### **5.2 대용량 데이터 처리**
✅ **페이지네이션을 통한 데이터 분할 처리**  
✅ **필터링 및 검색 시 최적화된 알고리즘 적용**  
✅ **가상화(Virtualization) 고려 (대규모 데이터셋 대응)**  

---

## **📌 6. 사용 예시**
### **6.1 기본 사용법**
```jsx
import { DataTable } from "@/components/ui/data-table";

export default function UserList() {
  const userData = [
    { id: 1, name: "홍길동", email: "hong@example.com", role: "관리자" },
    { id: 2, name: "김영희", email: "kim@example.com", role: "사용자" }
  ];

  return (
    <DataTable
      tableName="사용자 목록"
      data={userData}
      onRowClick={(user) => console.log("선택된 사용자:", user)}
    />
  );
}
```

### **6.2 고급 옵션 활용**
```jsx
import { DataTable } from "@/components/ui/data-table";
import { formatDate, formatCurrency } from "@/utils/formatters";

export default function ProductList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProducts, setSelectedProducts] = useState([]);

  // 데이터 로드 로직...

  const customFormatters = {
    price: (value) => formatCurrency(value, 'KRW'),
    created_at: (value) => formatDate(value, 'YYYY-MM-DD')
  };

  const handleSort = (key, direction) => {
    console.log(`Sorting by ${key} in ${direction} order`);
    // 정렬 로직...
  };

  return (
    <DataTable
      tableName="제품 목록"
      data={products}
      isLoading={loading}
      customFormatters={customFormatters}
      onSelectionChange={setSelectedProducts}
      onSort={handleSort}
      className="shadow-lg"
      headerClassName="bg-blue-50"
      dbName="ProductDB"
      showCurrencyControls={true}
      onCreateCurrency={() => handleCreateProduct()}
    />
  );
}
```

---

이 문서는 데이터 테이블 컴포넌트의 기술적 설계와 구현 세부사항을 정의하며, 개발 팀이 요구사항을 이해하고 효율적으로 구현하기 위한 가이드로 활용될 수 있습니다. 