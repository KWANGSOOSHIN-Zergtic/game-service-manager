# **📌 Next.js 기반 고성능 데이터 테이블 컴포넌트 디자인 구현**  
_(다양한 기능을 포함한 확장 가능한 데이터 테이블 컴포넌트)_  

---

## **📌 1. 구현 개요**  
이 프로젝트는 **Next.js 기반으로 다양한 데이터 소스로부터 테이블 형태의 데이터를 효과적으로 표시하고 관리할 수 있는 고성능 데이터 테이블 컴포넌트를 구현**하는 것이 목표입니다.  
✅ **다양한 데이터 타입 및 형식 지원**  
✅ **정렬, 필터링, 검색, 페이지네이션 기능 제공**  
✅ **행 선택 및 관리 기능**  
✅ **UI/UX 최적화 및 다양한 상태 처리**  
✅ **화폐 관리 기능 통합**  

---

## **📌 2. UI 컴포넌트 구현 (Next.js + TypeScript + TailwindCSS + ShadCN)**  

### **2.1 필요한 라이브러리 및 의존성**
```bash
# 기본 의존성
npm install @radix-ui/react-checkbox @radix-ui/react-dropdown-menu
npm install lucide-react
npm install tailwindcss

# ShadCN UI 컴포넌트
npx shadcn-ui@latest add table checkbox input button pagination skeleton
```

---

### **2.2 데이터 테이블 기본 레이아웃 및 주요 컴포넌트**
```tsx
'use client';

import React, { useState, useEffect, useMemo } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, MoreVertical, Plus } from "lucide-react";
import { Pagination } from "@/components/ui/pagination";

export function DataTable({ 
  tableName = '',
  data = [],
  isLoading = false,
  onRowClick,
  onSelectionChange,
  // 기타 props...
}) {
  // 상태 관리
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  // 기타 상태...

  return (
    <div className="space-y-4">
      {/* 검색 및 필터 영역 */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          {/* 컬럼 필터 */}
          <ColumnFilter />
          
          {/* 검색 입력 필드 */}
          <div className="relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-purple-400" />
            <Input
              placeholder={`검색...`}
              className="pl-8 h-9 w-[250px] bg-purple-50/50 border-purple-100"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* 액션 버튼 */}
        <Button className="bg-purple-500 hover:bg-purple-600 text-white">
          <Plus className="h-4 w-4 mr-2" />
          추가
        </Button>
      </div>

      {/* 테이블 영역 */}
      <div className="rounded-md border border-gray-200 overflow-hidden">
        <Table>
          {/* 테이블 헤더 */}
          <TableHeader>
            <TableRow className="bg-purple-50/80">
              <TableHead className="w-10 text-center">
                <Checkbox />
              </TableHead>
              
              {/* 동적 컬럼 헤더 */}
              {columns.map((column) => (
                <TableHead key={column.key} className="text-center">
                  {column.label}
                </TableHead>
              ))}
              
              <TableHead className="w-10 text-center">
                <MoreVertical className="h-4 w-4 mx-auto" />
              </TableHead>
            </TableRow>
          </TableHeader>

          {/* 테이블 바디 */}
          <TableBody>
            {currentData.map((item) => (
              <TableRow key={item.id} className="hover:bg-purple-50/30">
                <TableCell className="text-center">
                  <Checkbox checked={selectedRows.includes(item.id)} />
                </TableCell>
                
                {/* 동적 컬럼 데이터 */}
                {columns.map((column) => (
                  <TableCell key={column.key} className="text-center">
                    {formatValue(item[column.key], column.type)}
                  </TableCell>
                ))}
                
                <TableCell className="text-center">
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* 페이지네이션 */}
      <Pagination
        currentPage={currentPage}
        totalItems={filteredData.length}
        itemsPerPage={itemsPerPage}
        onPageChange={handlePageChange}
      />
      
      {/* 디버그 정보 및 화폐 관리 패널 */}
      <DebugInfo />
      <DataControlsPanel />
    </div>
  );
}
```
✅ **레이아웃 구조: 검색/필터 영역, 테이블 영역, 페이지네이션, 추가 기능**  
✅ **반응형 디자인 및 TailwindCSS를 활용한 스타일링**  
✅ **ShadCN UI 컴포넌트 활용**  

---

### **2.3 컬럼 필터링 UI (`ColumnFilter.tsx`)**
```tsx
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ListFilter } from "lucide-react";

export function ColumnFilter({ 
  columns, 
  visibleColumns, 
  isAllColumnsVisible,
  onToggleColumn, 
  onToggleAllColumns 
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-9 border-purple-100 bg-purple-50/50">
          <ListFilter className="h-4 w-4 text-purple-500 mr-2" />
          컬럼 필터
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>표시할 컬럼 선택</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuCheckboxItem
          checked={isAllColumnsVisible}
          onCheckedChange={onToggleAllColumns}
        >
          모든 컬럼 표시
        </DropdownMenuCheckboxItem>
        <DropdownMenuSeparator />
        {columns.map((column) => (
          <DropdownMenuCheckboxItem
            key={column.key}
            checked={visibleColumns.has(column.key)}
            onCheckedChange={() => onToggleColumn(column.key)}
          >
            {column.label}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```
✅ **드롭다운 메뉴를 통한 컬럼 표시/숨김 선택**  
✅ **체크박스 아이템을 통한 직관적인 선택 UI**  
✅ **모든 컬럼 토글 기능**  

---

### **2.4 데이터 검색 및 정렬 UI**
```tsx
// 검색 입력 필드
<div className="relative">
  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-purple-400" />
  <Input
    placeholder={`${tableName || 'items'} 검색...`}
    className="pl-8 h-9 w-[250px] bg-purple-50/50 border-purple-100 text-purple-900 placeholder:text-purple-400"
    value={searchTerm}
    onChange={(e) => handleSearch(e.target.value)}
  />
</div>

// 정렬 가능한 컬럼 헤더
<TableHead
  className={`text-xs font-bold text-gray-600 h-10 py-2 ${
    column.sortable ? 'cursor-pointer select-none hover:bg-purple-100/50' : ''
  } border-r border-gray-200 text-center`}
  onClick={() => column.sortable && handleSort(column.key)}
  aria-sort={
    sortConfig.key === column.key 
      ? sortConfig.direction === 'asc' 
        ? 'ascending' 
        : 'descending'
      : undefined
  }
>
  <div className="flex items-center justify-center gap-1">
    {column.label}
    {column.sortable && (
      <span className="text-gray-400">
        {sortConfig.key === column.key
          ? sortConfig.direction === 'asc'
            ? '▲'
            : sortConfig.direction === 'desc'
              ? '▼'
              : '↕'
          : '↕'}
      </span>
    )}
  </div>
</TableHead>
```
✅ **검색 필드와 아이콘을 활용한 직관적인 검색 UI**  
✅ **정렬 방향을 시각적으로 표시하는 컬럼 헤더**  
✅ **정렬 가능 컬럼에 대한 시각적 힌트**  

---

### **2.5 페이지네이션 UI (`Pagination.tsx`)**
```tsx
export function Pagination({
  currentPage,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange
}) {
  const totalPages = itemsPerPage === 'all' ? 1 : Math.ceil(totalItems / Number(itemsPerPage));
  
  return (
    <div className="flex items-center justify-between px-4 py-3 bg-purple-50/30">
      <div className="flex items-center space-x-2">
        <span className="text-sm text-gray-600">표시할 항목 수:</span>
        <select
          className="text-sm border-gray-200 rounded h-8 w-20 focus:border-purple-300 focus:ring focus:ring-purple-200 focus:ring-opacity-50"
          value={itemsPerPage}
          onChange={(e) => onItemsPerPageChange(e.target.value)}
        >
          <option value="10">10</option>
          <option value="20">20</option>
          <option value="50">50</option>
          <option value="100">100</option>
          <option value="all">전체</option>
        </select>
        <span className="text-sm text-gray-600">
          총 {totalItems}개 항목 중 {itemsPerPage === 'all' ? totalItems : Math.min(totalItems, currentPage * Number(itemsPerPage))}개 표시
        </span>
      </div>
      
      <div className="flex items-center space-x-1">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1 || totalPages === 0}
          className="h-8 w-8 p-0 border-gray-200"
        >
          {'<<'}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1 || totalPages === 0}
          className="h-8 w-8 p-0 border-gray-200"
        >
          {'<'}
        </Button>
        
        {/* 페이지 번호 버튼 렌더링 */}
        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
          let pageNum;
          if (totalPages <= 5) {
            pageNum = i + 1;
          } else if (currentPage <= 3) {
            pageNum = i + 1;
          } else if (currentPage >= totalPages - 2) {
            pageNum = totalPages - 4 + i;
          } else {
            pageNum = currentPage - 2 + i;
          }
          
          return (
            <Button
              key={pageNum}
              variant={currentPage === pageNum ? "default" : "outline"}
              size="sm"
              onClick={() => onPageChange(pageNum)}
              className={`h-8 w-8 p-0 ${currentPage === pageNum ? 'bg-purple-500 text-white' : 'border-gray-200'}`}
            >
              {pageNum}
            </Button>
          );
        })}
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages || totalPages === 0}
          className="h-8 w-8 p-0 border-gray-200"
        >
          {'>'}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages || totalPages === 0}
          className="h-8 w-8 p-0 border-gray-200"
        >
          {'>>'}
        </Button>
      </div>
    </div>
  );
}
```
✅ **페이지 이동 버튼 및 현재 페이지 표시**  
✅ **페이지당 항목 수 선택 드롭다운**  
✅ **전체 항목 및 현재 표시 항목 정보**  
✅ **적응형 페이지 버튼 (현재 페이지 기준 일부 표시)**  

---

### **2.6 로딩 및 빈 데이터 상태 UI**
```tsx
// 로딩 상태 UI
if (isLoading) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">{tableName}</h2>
        <Button className="bg-green-500 hover:bg-green-600">
          <Plus className="w-4 h-4 mr-2" />
          추가
        </Button>
      </div>
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              {[1, 2, 3, 4].map((n) => (
                <TableHead key={n}>
                  <Skeleton className="h-4 w-[100px]" />
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {[1, 2, 3].map((row) => (
              <TableRow key={row}>
                {[1, 2, 3, 4].map((cell) => (
                  <TableCell key={cell}>
                    <Skeleton className="h-4 w-[100px]" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

// 빈 데이터 상태 UI
if (!data.length) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">{tableName}</h2>
        <Button className="bg-green-500 hover:bg-green-600">
          <Plus className="w-4 h-4 mr-2" />
          추가
        </Button>
      </div>
      <div className="border rounded-md p-4 text-center text-gray-500">
        데이터가 없습니다.
      </div>
      {/* 디버그 정보 및 화폐 관리 패널 */}
    </div>
  );
}
```
✅ **스켈레톤 UI를 활용한 로딩 상태 표시**  
✅ **빈 데이터 메시지 및 액션 버튼 유지**  
✅ **직관적인 시각적 상태 표현**  

---

### **2.7 화폐 관리 패널 UI**
```tsx
export function DataControlsPanel({
  onCreateClick,
  onUpdateClick,
  onDeleteClick,
  className
}) {
  return (
    <div className={`bg-purple-50 rounded-md p-4 ${className}`}>
      <h3 className="text-sm font-medium text-purple-900 mb-3">화폐 관리</h3>
      <div className="flex flex-wrap gap-2">
        <Button 
          variant="outline" 
          size="sm"
          onClick={onCreateClick}
          className="bg-white border-purple-200 text-purple-700 hover:bg-purple-100"
        >
          <Plus className="h-4 w-4 mr-2" />
          생성
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          onClick={onUpdateClick}
          className="bg-white border-purple-200 text-purple-700 hover:bg-purple-100"
        >
          <Edit className="h-4 w-4 mr-2" />
          수정
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          onClick={onDeleteClick}
          className="bg-white border-purple-200 text-purple-700 hover:bg-purple-100"
        >
          <Trash className="h-4 w-4 mr-2" />
          삭제
        </Button>
      </div>
    </div>
  );
}

export function AdvancedDataControlsPanel({
  onUseItemClick,
  onGetItemClick,
  onSendItemClick,
  className
}) {
  return (
    <div className={`bg-purple-50 rounded-md p-4 ${className}`}>
      <h3 className="text-sm font-medium text-purple-900 mb-3">고급 화폐 관리</h3>
      <div className="flex flex-wrap gap-2">
        <Button 
          variant="outline" 
          size="sm"
          onClick={onUseItemClick}
          className="bg-white border-purple-200 text-purple-700 hover:bg-purple-100"
        >
          <BadgeMinus className="h-4 w-4 mr-2" />
          아이템 사용
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          onClick={onGetItemClick}
          className="bg-white border-purple-200 text-purple-700 hover:bg-purple-100"
        >
          <BadgePlus className="h-4 w-4 mr-2" />
          아이템 획득
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          onClick={onSendItemClick}
          className="bg-white border-purple-200 text-purple-700 hover:bg-purple-100"
        >
          <Send className="h-4 w-4 mr-2" />
          아이템 전송
        </Button>
      </div>
    </div>
  );
}
```
✅ **패널 형태의 화폐 관리 UI**  
✅ **아이콘을 활용한 직관적인 버튼**  
✅ **통일된 디자인 언어 및 색상 스키마**  

---

### **2.8 디버그 정보 UI**
```tsx
function DebugInfo({ dbName }) {
  return (
    <div className="flex justify-between items-center mt-2">
      <div className="flex items-center gap-2">
        <button 
          onClick={() => window.dispatchEvent(new CustomEvent('toggle-debug-section'))}
          className="flex items-center text-xs px-2 py-1 rounded bg-gray-100 text-gray-700 hover:bg-gray-200"
        >
          <Bug className="w-3.5 h-3.5 mr-1" />
          디버그 정보
        </button>
      </div>
      <div className="flex items-center gap-1 text-xs bg-gray-100 px-2 py-0.5 rounded">
        <Database className="h-3 w-3 text-purple-500" />
        <span className="text-purple-500 font-medium">
          {dbName || 'Database'}
        </span>
      </div>
    </div>
  );
}
```
✅ **디버그 정보 토글 버튼**  
✅ **데이터베이스 정보 표시**  
✅ **아이콘과 배경을 활용한 시각적 구분**  

---

## **📌 3. UI 상태 및 테마**
### **3.1 색상 테마 및 디자인 시스템**
```tsx
// 주요 색상 변수 (tailwind.config.js에 정의)
const colors = {
  purple: {
    50: '#f5f3ff',
    100: '#ede9fe',
    200: '#ddd6fe',
    300: '#c4b5fd',
    400: '#a78bfa',
    500: '#8b5cf6',
    600: '#7c3aed',
    700: '#6d28d9',
    800: '#5b21b6',
    900: '#4c1d95',
  },
  // 기타 색상...
};

// 컴포넌트별 기본 스타일
const componentStyles = {
  table: {
    header: 'bg-purple-50/80 text-xs font-bold text-gray-600',
    row: 'hover:bg-purple-50/30',
    cell: 'py-3 border-r border-gray-200 text-center',
  },
  button: {
    primary: 'bg-purple-500 hover:bg-purple-600 text-white',
    outline: 'border-purple-200 text-purple-700 hover:bg-purple-100',
  },
  input: {
    search: 'pl-8 h-9 w-[250px] bg-purple-50/50 border-purple-100 text-purple-900 placeholder:text-purple-400',
  },
  // 기타 컴포넌트 스타일...
};
```
✅ **일관된 색상 시스템 및 디자인 언어**  
✅ **재사용 가능한 컴포넌트 스타일**  
✅ **TailwindCSS를 활용한 유연한 스타일링**  

---

### **3.2 반응형 디자인**
```tsx
// 반응형 레이아웃
<div className="space-y-4">
  {/* 작은 화면에서 스택 구조로 변경 */}
  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0">
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
      <ColumnFilter />
      <div className="relative w-full sm:w-auto">
        <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-purple-400" />
        <Input
          placeholder="검색..."
          className="pl-8 h-9 w-full sm:w-[250px] bg-purple-50/50 border-purple-100"
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
        />
      </div>
    </div>
    <Button className="w-full sm:w-auto mt-2 sm:mt-0 bg-purple-500 hover:bg-purple-600 text-white">
      <Plus className="h-4 w-4 mr-2" />
      추가
    </Button>
  </div>
  
  {/* 테이블 컨테이너 - 작은 화면에서 가로 스크롤 */}
  <div className="overflow-x-auto rounded-md border border-gray-200">
    <Table>
      {/* 테이블 내용 */}
    </Table>
  </div>
  
  {/* 페이지네이션 - 작은 화면에서 레이아웃 조정 */}
  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-4 py-3 bg-purple-50/30 gap-2 sm:gap-0">
    {/* 페이지네이션 내용 */}
  </div>
</div>
```
✅ **다양한 화면 크기에 최적화된 레이아웃**  
✅ **모바일 우선 접근법**  
✅ **작은 화면에서의 스크롤 및 스택 레이아웃 지원**  

---

### **3.3 접근성 및 사용자 경험**
```tsx
// 접근성을 고려한 테이블 헤더
<TableHead
  className="text-xs font-bold text-gray-600"
  onClick={() => column.sortable && handleSort(column.key)}
  role={column.sortable ? 'button' : undefined}
  tabIndex={column.sortable ? 0 : undefined}
  aria-sort={
    sortConfig.key === column.key 
      ? sortConfig.direction === 'asc' 
        ? 'ascending' 
        : 'descending'
      : undefined
  }
>
  {column.label}
</TableHead>

// 키보드 접근성
<Button
  variant="outline"
  size="sm"
  onClick={() => onPageChange(currentPage - 1)}
  disabled={currentPage === 1}
  aria-label="이전 페이지"
  className="h-8 w-8 p-0"
>
  {'<'}
</Button>

// 로딩 상태 스크린 리더 지원
{isLoading && (
  <div aria-live="polite" aria-busy="true">
    <Skeleton />
  </div>
)}

// 빈 데이터 상태 메시지
{!data.length && !isLoading && (
  <div role="status" aria-live="polite" className="text-center p-4">
    데이터가 없습니다.
  </div>
)}
```
✅ **ARIA 속성을 활용한 접근성 지원**  
✅ **키보드 네비게이션 지원**  
✅ **스크린 리더 호환성**  
✅ **상태 변화에 대한 적절한 피드백**  

---

## **📌 4. 컴포넌트 통합 및 사용 가이드**
### **4.1 기본 사용법**
```tsx
import { DataTable } from "@/components/ui/data-table";

export default function UserManagement() {
  const userData = [
    { id: 1, name: "홍길동", email: "hong@example.com", role: "관리자" },
    { id: 2, name: "김영희", email: "kim@example.com", role: "사용자" }
  ];

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">사용자 관리</h1>
      
      <DataTable
        tableName="사용자 목록"
        data={userData}
        onRowClick={(user) => console.log("선택된 사용자:", user)}
      />
    </div>
  );
}
```

### **4.2 고급 옵션 활용**
```tsx
import { DataTable } from "@/components/ui/data-table";
import { useState, useEffect } from "react";

export default function ProductManagement() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProducts, setSelectedProducts] = useState([]);

  useEffect(() => {
    // 데이터 로딩 로직
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        setLoading(false);
      });
  }, []);

  const handleCreateProduct = () => {
    console.log("새 제품 생성");
    // 생성 로직...
  };

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">제품 관리</h1>
      
      <DataTable
        tableName="제품 목록"
        data={products}
        isLoading={loading}
        onSelectionChange={setSelectedProducts}
        onSort={(key, direction) => console.log(`${key} ${direction} 정렬`)}
        className="shadow-lg"
        headerClassName="bg-blue-50"
        rowClassName="hover:bg-blue-50/20"
        cellClassName="py-2"
        customFormatters={{
          price: (value) => `₩${Number(value).toLocaleString()}`
        }}
        showDataControls={true}
        onCreateCurrency={handleCreateProduct}
        dbName="ProductDB"
      />
      
      {selectedProducts.length > 0 && (
        <div className="mt-4 p-4 bg-blue-50 rounded">
          <p className="font-medium">{selectedProducts.length}개 항목 선택됨</p>
          <div className="flex gap-2 mt-2">
            <button className="px-3 py-1 bg-blue-500 text-white rounded">
              일괄 편집
            </button>
            <button className="px-3 py-1 bg-red-500 text-white rounded">
              일괄 삭제
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
```

---

이 디자인 PRD 문서는 데이터 테이블 컴포넌트의 UI/UX 설계와 구현 가이드라인을 정의하며, 디자인 팀과 개발 팀이 일관되고 사용자 친화적인 인터페이스를 구현하는 데 활용될 수 있습니다. 