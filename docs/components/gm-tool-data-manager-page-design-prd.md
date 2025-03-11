# **📌 Next.js 기반 다중 DB 테이블 검색 및 관리 페이지 디자인**  
_(DB List -> Table Search -> Table Information -> Selected Tables 패턴으로 구현)_  

---

## **📌 1. 디자인 개요**  
이 문서는 **Next.js 기반으로 다중 PostgreSQL 데이터베이스의 특정 키워드를 포함한 테이블을 검색하고 CRUD 작업을 수행할 수 있는 UI 페이지 디자인**을 정의합니다. 

### **1.1 주요 디자인 요소**  
✅ **계층적 레이아웃**: DB List → Table Search → Table Information → Selected Tables  
✅ **아코디언(폴딩) 컴포넌트**: 선택된 테이블 그룹화 및 관리 기능  
✅ **반응형 디자인**: 데스크탑 및 태블릿 환경 최적화  
✅ **일관된 UI 패턴**: Card 기반 모듈식 레이아웃  
✅ **시각적 피드백**: 로딩 상태, 성공/실패 알림  

### **1.2 페이지 레이아웃 구조**
```
┌─────────────────────────────────────────────────────────┐
│ Navigation Bar                                          │
├─────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────┐ │
│ │ DB List (Card)                                      │ │
│ └─────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Table Search (Card)                                 │ │
│ └─────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Result Alert (성공/실패 메시지)                     │ │
│ └─────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Table Information (Card - 테이블 목록)              │ │
│ └─────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Selected Tables (Card - 아코디언)                   │ │
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

---

## **📌 2. UI 컴포넌트 디자인**

### **2.1 필요한 UI 라이브러리 및 컴포넌트**
```bash
# ShadCN 컴포넌트
npx shadcn@latest add card
npx shadcn@latest add separator
npx shadcn@latest add button
npx shadcn@latest add input
npx shadcn@latest add select
npx shadcn@latest add switch
npx shadcn@latest add accordion
npx shadcn@latest add alert
npx shadcn@latest add dialog
npx shadcn@latest add tabs
npx shadcn@latest add data-table

# 추가 패키지
npm install @tanstack/react-table lucide-react
```

### **2.2 DB List 컴포넌트 디자인**
```tsx
<Card>
  <CardHeader className="py-4 bg-gray-50">
    <CardTitle className="text-lg font-semibold text-gray-900">
      DB List
    </CardTitle>
  </CardHeader>
  <Separator className="bg-gray-200" />
  <CardContent className="py-6">
    <DataTable
      tableName="DB List"
      data={dbData}
      isLoading={isLoadingDb}
      onRowClick={handleRowClick}
      onSelectionChange={handleDBListSelectionChange}
      onSort={handleSort}
      onPageChange={handlePageChange}
      dbName="DB List"
    />
  </CardContent>
</Card>
```

### **2.3 Table Search 컴포넌트 디자인**
```tsx
<Card className="overflow-hidden">
  <CardHeader className="py-4 bg-gray-50">
    <CardTitle className="text-lg font-semibold text-gray-900">
      <div className="flex items-center gap-2">
        <Database className="w-5 h-5" />
        <span>Table Search</span>
      </div>
    </CardTitle>
  </CardHeader>
  <Separator className="bg-gray-200" />
  <CardContent className="py-6">
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        {/* DB 선택 드롭다운 */}
        <div className="w-[200px]">
          <Select 
            value={selectedDB}
            onValueChange={handleDBChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="DB 선택" />
            </SelectTrigger>
            <SelectContent>
              {dbData.map((dbUnit) => (
                <SelectItem key={dbUnit.id} value={dbUnit.name}>
                  {dbUnit.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {/* 검색 입력 필드 */}
        <div className="relative flex-1">
          <Database className="absolute left-2 top-2.5 h-4 w-4 text-blue-400" />
          <Input
            type="text"
            placeholder="테이블 이름 검색..."
            className="pl-8 w-full bg-blue-50/50 border-blue-100 text-blue-900 placeholder:text-blue-400"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            disabled={onlyExcelTables}
          />
        </div>
        
        {/* 검색 버튼 */}
        <Button  
          className="w-[200px] bg-blue-500 hover:bg-blue-600 text-white" 
          disabled={!selectedDB || isLoadingTables}
          onClick={handleSearch}
        >
          {isLoadingTables ? '검색 중...' : '테이블 검색'}
        </Button>
      </div>
      
      {/* 검색 옵션 필터 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Switch 
            id="excel-tables-only" 
            checked={onlyExcelTables}
            onCheckedChange={toggleExcelTablesOnly}
          />
          <Label htmlFor="excel-tables-only" className="flex items-center gap-2">
            <FileSpreadsheet className="h-4 w-4 text-green-500" />
            <span className="text-sm font-medium">Excel 테이블만 표시 (excel_*)</span>
          </Label>
        </div>
        
        <div className="flex items-center space-x-2">
          <Select value={matchType} onValueChange={setMatchType}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="검색 방식" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="prefix">접두어 (Prefix)</SelectItem>
              <SelectItem value="suffix">접미어 (Suffix)</SelectItem>
              <SelectItem value="contains">포함 (Contains)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  </CardContent>
</Card>
```

### **2.4 Table Information 컴포넌트 디자인**
```tsx
{tableData.length > 0 && (
  <Card>
    <CardHeader className="py-4 bg-gray-50">
      <CardTitle className="text-lg font-semibold text-gray-900">
        <div className="flex items-center gap-2">
          <Table className="w-5 h-5" />
          <span>테이블 정보</span>
        </div>
      </CardTitle>
    </CardHeader>
    <Separator className="bg-gray-200" />
    <CardContent className="py-6">
      <DataTable
        tableName="Table Information"
        data={tableData}
        isLoading={isLoadingTables}
        onRowClick={handleTableSelection}
        onSelectionChange={handleTableSelectionChange}
        onSort={handleSort}
        onPageChange={handlePageChange}
        dbName={selectedDB}
      />
    </CardContent>
  </Card>
)}
```

### **2.5 Selected Tables 아코디언 컴포넌트 디자인**
```tsx
<Card>
  <CardHeader className="py-4 bg-gray-50">
    <div className="flex justify-between items-center">
      <CardTitle className="text-lg font-semibold text-gray-900">
        선택된 테이블
      </CardTitle>
      <div className="text-sm text-blue-500">
        선택된 테이블: <span className="font-bold">{selectedTables.length}</span>개
      </div>
    </div>
  </CardHeader>
  <Separator className="bg-gray-200" />
  <CardContent className="py-6">
    <TableAccordion 
      selectedTables={selectedTables} 
      onRemoveTable={handleRemoveTable}
      onViewColumns={handleViewColumns}
      onEditTable={handleEditTable}
    />
  </CardContent>
</Card>
```

---

## **📌 3. 주요 컴포넌트 구현**

### **3.1 `TableAccordion.tsx` - 선택된 테이블 관리 아코디언**

```tsx
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Table, Edit, Trash2, Database, FileSpreadsheet, Columns } from "lucide-react";

interface TableInfo {
  id: string | number;
  db: string;
  table_name: string;
  table_type: string;
  rows_count: number;
  size: string;
  last_updated: string;
}

interface TableAccordionProps {
  selectedTables: TableInfo[];
  onRemoveTable: (id: string | number) => void;
  onViewColumns: (table: TableInfo) => void;
  onEditTable: (table: TableInfo) => void;
}

export function TableAccordion({ 
  selectedTables, 
  onRemoveTable,
  onViewColumns,
  onEditTable
}: TableAccordionProps) {
  // DB 별로 테이블 그룹화
  const tablesByDB = selectedTables.reduce((groups, table) => {
    const db = table.db;
    if (!groups[db]) {
      groups[db] = [];
    }
    groups[db].push(table);
    return groups;
  }, {} as Record<string, TableInfo[]>);
  
  return (
    <div className="space-y-4">
      {Object.keys(tablesByDB).length === 0 ? (
        <div className="text-center py-6 text-gray-500">
          <FileSpreadsheet className="w-12 h-12 mx-auto text-gray-300 mb-2" />
          <p>선택된 테이블이 없습니다.</p>
          <p className="text-sm mt-1">테이블 정보에서 테이블을 선택하세요.</p>
        </div>
      ) : (
        <Accordion type="multiple" className="w-full">
          {Object.entries(tablesByDB).map(([db, tables]) => (
            <AccordionItem key={db} value={db} className="border rounded-md mb-2">
              <AccordionTrigger className="px-4 py-3 hover:bg-gray-50 transition-all">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-blue-500" />
                  <span className="font-medium">{db}</span>
                  <span className="text-xs text-gray-500 bg-gray-100 rounded-full px-2 py-0.5 ml-2">
                    {tables.length}개
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-1 pb-3 px-4">
                <div className="space-y-3">
                  {tables.map((table) => (
                    <div 
                      key={table.id} 
                      className="bg-white border rounded-md p-3 shadow-sm"
                    >
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Table className="w-4 h-4 text-blue-500" />
                            <span className="font-medium text-blue-900">{table.table_name}</span>
                          </div>
                          <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs text-gray-500 mt-2">
                            <div>타입: <span className="font-medium">{table.table_type}</span></div>
                            <div>행 수: <span className="font-medium">{table.rows_count.toLocaleString()}</span></div>
                            <div>크기: <span className="font-medium">{table.size}</span></div>
                            <div>마지막 업데이트: <span className="font-medium">{table.last_updated}</span></div>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => onViewColumns(table)}
                            className="h-8 px-2"
                          >
                            <Columns className="w-4 h-4 mr-1" />
                            컬럼
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => onEditTable(table)}
                            className="h-8 px-2"
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            편집
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => onRemoveTable(table.id)}
                            className="h-8 px-2 text-red-500 hover:text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}
    </div>
  );
}
```

### **3.2 `TableColumnDialog.tsx` - 테이블 컬럼 관리 대화상자**

```tsx
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, PlusCircle, Trash2, Save } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Column {
  name: string;
  type: string;
}

interface TableInfo {
  db: string;
  table_name: string;
}

interface TableColumnDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tableInfo: TableInfo | null;
  onSaveColumns: (columns: Column[]) => Promise<boolean>;
}

const DATA_TYPES = [
  "INTEGER",
  "BIGINT",
  "SERIAL",
  "VARCHAR(255)",
  "TEXT",
  "BOOLEAN",
  "TIMESTAMP",
  "DATE",
  "REAL",
  "NUMERIC(10,2)",
  "JSONB",
  "UUID"
];

export function TableColumnDialog({ 
  open, 
  onOpenChange, 
  tableInfo, 
  onSaveColumns 
}: TableColumnDialogProps) {
  const [columns, setColumns] = useState<Column[]>([]);
  const [newColumn, setNewColumn] = useState<Column>({ name: "", type: "" });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (open && tableInfo) {
      fetchColumns();
    }
  }, [open, tableInfo]);

  const fetchColumns = async () => {
    if (!tableInfo) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`/api/tables/columns?db=${tableInfo.db}&table=${tableInfo.table_name}`);
      const data = await response.json();
      
      if (data.success) {
        setColumns(data.columns || []);
      }
    } catch (error) {
      console.error("컬럼 정보 로딩 중 오류:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const addColumn = () => {
    if (!newColumn.name || !newColumn.type) return;
    
    setColumns([...columns, newColumn]);
    setNewColumn({ name: "", type: "" });
  };

  const removeColumn = (index: number) => {
    const updatedColumns = [...columns];
    updatedColumns.splice(index, 1);
    setColumns(updatedColumns);
  };

  const handleSave = async () => {
    if (!tableInfo) return;
    
    setIsLoading(true);
    try {
      const success = await onSaveColumns(columns);
      if (success) {
        onOpenChange(false);
      }
    } catch (error) {
      console.error("컬럼 저장 중 오류:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Table className="w-5 h-5" />
            {tableInfo ? `${tableInfo.db}.${tableInfo.table_name} 컬럼 관리` : '컬럼 관리'}
          </DialogTitle>
          <DialogDescription>
            테이블의 컬럼을 추가, 수정, 삭제할 수 있습니다.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 my-2">
          {/* 새 컬럼 추가 섹션 */}
          <div className="flex gap-2 items-end">
            <div className="flex-1 space-y-1">
              <Label htmlFor="column-name">컬럼 이름</Label>
              <Input
                id="column-name"
                value={newColumn.name}
                onChange={(e) => setNewColumn({ ...newColumn, name: e.target.value })}
                placeholder="new_column"
              />
            </div>
            <div className="flex-1 space-y-1">
              <Label htmlFor="column-type">데이터 타입</Label>
              <Select 
                value={newColumn.type} 
                onValueChange={(value) => setNewColumn({ ...newColumn, type: value })}
              >
                <SelectTrigger id="column-type">
                  <SelectValue placeholder="데이터 타입 선택" />
                </SelectTrigger>
                <SelectContent>
                  {DATA_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={addColumn} 
              disabled={!newColumn.name || !newColumn.type}
              className="gap-1"
            >
              <PlusCircle className="w-4 h-4" />
              추가
            </Button>
          </div>
          
          {/* 컬럼 목록 */}
          <div className="border rounded-md overflow-hidden">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100 text-left">
                  <th className="px-4 py-3 font-medium">컬럼명</th>
                  <th className="px-4 py-3 font-medium">데이터 타입</th>
                  <th className="px-4 py-3 font-medium w-[80px]">작업</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {isLoading ? (
                  <tr>
                    <td colSpan={3} className="px-4 py-3 text-center text-gray-500">
                      컬럼 정보 로딩 중...
                    </td>
                  </tr>
                ) : columns.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-4 py-3 text-center text-gray-500">
                      컬럼이 없습니다
                    </td>
                  </tr>
                ) : (
                  columns.map((column, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-2">{column.name}</td>
                      <td className="px-4 py-2">{column.type}</td>
                      <td className="px-4 py-2">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => removeColumn(index)}
                          className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            취소
          </Button>
          <Button onClick={handleSave} disabled={isLoading} className="gap-1">
            <Save className="w-4 h-4" />
            저장
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

---

## **📌 4. 페이지 흐름 (User Flow)**

### **4.1 기본 사용자 흐름**

1. **DB List 확인**
   - 사용 가능한 데이터베이스 목록 확인

2. **DB 선택 및 테이블 검색**
   - 특정 DB 선택
   - 검색 필터 옵션 설정 (Excel 테이블만 표시, 검색 매치 타입 선택)
   - 검색 키워드 입력 및 검색 버튼 클릭

3. **테이블 정보 확인**
   - 검색 결과에서 테이블 목록 확인
   - 테이블 행 수, 크기, 마지막 업데이트 시간 등 확인
   - 관리할 테이블 선택 (체크박스)

4. **선택된 테이블 관리**
   - 선택된 테이블을 DB별로 그룹화하여 아코디언으로 표시
   - 각 테이블에 대한 상세 정보 확인
   - 테이블 컬럼 관리 (컬럼 추가, 수정, 삭제)
   - 테이블 편집 또는 삭제 작업 수행

### **4.2 테이블 컬럼 관리 흐름**

1. **테이블 선택 및 '컬럼' 버튼 클릭**
   - 선택된 테이블에서 컬럼 관리 버튼 클릭

2. **컬럼 관리 대화상자 표시**
   - 현재 테이블의 컬럼 목록 로드
   - 컬럼 추가, 수정, 삭제 작업 수행

3. **변경사항 저장 및 적용**
   - 변경사항 저장
   - 성공/실패 알림 표시

---

## **📌 5. 반응형 디자인 고려사항**

### **5.1 데스크탑 (1024px 이상)**
- 전체 레이아웃을 수평으로 표시
- DB List, Table Search, Table Information, Selected Tables 모두 전체 너비로 표시

### **5.2 태블릿 (768px ~ 1023px)**
- 수직 레이아웃으로 전환
- 검색 입력 필드와 버튼 레이아웃 조정
- 테이블 내용을 스크롤 가능하게 설정

### **5.3 모바일 (767px 이하)**
- 단일 컬럼 레이아웃으로 전환
- 선택적으로 일부 테이블 컬럼 숨김 처리
- 아코디언 내용을 간소화하여 중요 정보만 표시

---

## **📌 6. 주요 상호작용 및 시각적 피드백**

### **6.1 로딩 상태**
- DB 목록 로딩, 테이블 검색, 컬럼 정보 로딩 시 스켈레톤 UI 또는 로딩 인디케이터 표시
- 버튼에 로딩 상태 표시 (검색 중..., 저장 중...)

### **6.2 성공/실패 알림**
- ResultAlert 컴포넌트를 사용하여 작업 결과 표시
- 성공 시 녹색, 실패 시 빨간색 배경으로 시각적 구분

### **6.3 테이블 상호작용**
- 테이블 행 호버 시 배경색 변경
- 체크박스 선택 시 시각적 피드백
- 정렬, 페이지네이션 상태 표시

---

## **📌 7. 향후 개선 사항**

### **7.1 검색 기능 강화**
- 고급 검색 필터 추가 (테이블 크기, 행 수, 마지막 업데이트 등)
- 검색 기록 저장 및 자동 완성 기능

### **7.2 테이블 데이터 관리**
- 테이블 데이터 직접 편집 기능
- 데이터 시각화 도구 통합
- 대량 데이터 가져오기/내보내기 기능

### **7.3 권한 관리**
- 사용자 역할에 따른 권한 제어
- 테이블별 접근 권한 설정
- 작업 로그 및 감사 기능