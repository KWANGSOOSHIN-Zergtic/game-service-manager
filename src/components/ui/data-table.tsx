'use client';

import React, { useState, useEffect, useMemo, useCallback } from "react";
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
import { Search, MoreVertical, Plus, ListOrdered, Database, Bug, RefreshCw, Edit, Trash2 } from "lucide-react";
import { Pagination } from "@/components/ui/pagination";
import { ObjectDisplay } from "@/components/ui/object-display";
import { ColumnFilter } from "@/components/ui/column-filter";
import { Skeleton } from '@/components/ui/skeleton';
import { DataControlsPanel, AdvancedDataControlsPanel } from "@/components/control-panels/currency-control-panel";
import { IUITableData, ITableColumn } from '@/types/table.types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

// 이전 타입과의 호환성을 위한 타입 별칭
export type TableData = IUITableData;
export type TableColumn = ITableColumn;

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
  showDataControls?: boolean; // Currency Controls 표시 여부
  onCreateCurrency?: () => void;
  onUpdateCurrency?: () => void;
  onDeleteCurrency?: () => void;
  // Advanced Currency Controls 추가
  showAdvancedDataControls?: boolean;
  onUseItem?: () => void;
  onGetItem?: () => void;
  onSendItem?: () => void;
}

// 값 포맷팅을 위한 유틸리티 함수
const formatValue = (value: string | number | boolean | object | null | undefined, type?: string) => {
  if (value === null || value === undefined) return '-';
  
  // Object 타입 체크 추가
  if (typeof value === 'object') {
    return <ObjectDisplay value={value} />;
  }
  
  // boolean 타입 처리 추가
  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
  }
  
  switch (type) {
    case 'currency':
      return `$${Number(value).toFixed(2)}`;
    case 'percentage':
      return `${value}%`;
    case 'number':
      return Number(value).toString();
    default:
      return String(value);
  }
};

export function DataTable({ 
  tableName = '', 
  data = [], 
  isLoading = false,
  className = '',
  headerClassName = '',
  rowClassName = '',
  cellClassName = '',
  customFormatters,
  onRowClick,
  onSelectionChange,
  onSort,
  onPageChange,
  showActions = true,
  onSelectRows,
  dbName,
  showDataControls = false,
  onCreateCurrency,
  onUpdateCurrency,
  onDeleteCurrency,
  showAdvancedDataControls = false,
  onUseItem,
  onGetItem,
  onSendItem
}: DataTableProps) {
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [columns, setColumns] = useState<TableColumn[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredData, setFilteredData] = useState<TableData[]>([]);
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: 'asc' | 'desc' | null;
  }>({ key: '', direction: null });
  const [itemsPerPage, setItemsPerPage] = useState<number | 'all'>(20);
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(new Set());
  const [isAllColumnsVisible, setIsAllColumnsVisible] = useState(true);
  // 드롭다운 메뉴 상태 관리 추가
  const [headerMenuOpen, setHeaderMenuOpen] = useState(false);
  const [rowMenuOpenMap, setRowMenuOpenMap] = useState<Record<string, boolean>>({});

  // 순번 컬럼 정의
  const indexColumn = useMemo(() => ({
    key: 'displayIndex',
    label: '#',
    width: 'w-16',
    type: 'number' as const,
    sortable: false,
    format: (value: string | number | boolean | object | null | undefined) => {
      if (value === null || value === undefined) return '-';
      return String(value);
    }
  }), []);

  // 데이터 유효성 검사
  const validateData = (data: TableData[]): boolean => {
    return data.every(item => 
      typeof item === 'object' && 
      item !== null && 
      'id' in item
    );
  };

  // 데이터 처리 함수
  const processTableData = useCallback((inputData: TableData[]) => {
    return inputData.map((item, index) => ({
      ...item,
      displayIndex: itemsPerPage === 'all' 
        ? index + 1 
        : ((currentPage - 1) * (itemsPerPage as number)) + index + 1
    }));
  }, [currentPage, itemsPerPage]);

  // 초기 데이터 설정
  useEffect(() => {
    if (data.length > 0) {
      const processedData = processTableData(data);
      setFilteredData(processedData);

      if (!validateData(data)) {
        console.error('Invalid data format: Each item must have an id property');
        return;
      }

      const firstItem = data[0];
      const extractedColumns: TableColumn[] = [
        indexColumn,
        ...Object.keys(firstItem)
          .filter(key => key !== 'id' && key !== 'displayIndex')
          .map(key => {
            const value = firstItem[key];
            let type: TableColumn['type'] = 'string';
            
            // 타입 감지 로직 개선
            if (typeof value === 'number' || (typeof value === 'string' && !isNaN(Number(value)))) {
              if (key.toLowerCase().includes('price') || key.toLowerCase().includes('total')) {
                type = 'currency';
              } else if (key.toLowerCase().includes('rate')) {
                type = 'percentage';
              } else {
                type = 'number';
              }
            } else if (typeof value === 'object' && value !== null) {
              type = 'object';
            }

            return {
              key,
              label: key.toUpperCase().replace(/_/g, ' '),
              type,
              sortable: true,
              format: (value: string | number | boolean | object | null | undefined) => 
                customFormatters?.[key]?.(value as string | number | object | null) ?? formatValue(value, type)
            };
          })
      ];

      setColumns(extractedColumns);
      setVisibleColumns(new Set(['displayIndex', ...Object.keys(firstItem).filter(key => key !== 'id')]));
    } else {
      setFilteredData([]);
      setColumns([indexColumn]);
      setVisibleColumns(new Set(['displayIndex']));
    }
  }, [data, indexColumn, customFormatters, processTableData]);

  // 검색 처리
  const handleSearch = useCallback((value: string) => {
    setSearchTerm(value);
    if (!value.trim()) {
      setFilteredData(processTableData(data));
      return;
    }

    const filtered = data.filter(item => 
      Object.entries(item).some(([, val]) => 
        val?.toString().toLowerCase().includes(value.toLowerCase())
      )
    );
    setFilteredData(processTableData(filtered));
    setCurrentPage(1);
  }, [data, processTableData]);

  // 정렬 처리
  const handleSort = useCallback((key: string) => {
    let direction: 'asc' | 'desc' | null = 'asc';
    
    if (sortConfig.key === key) {
      if (sortConfig.direction === 'asc') direction = 'desc';
      else if (sortConfig.direction === 'desc') direction = null;
    }

    setSortConfig({ key, direction });

    if (direction === null) {
      setFilteredData(processTableData(data));
    } else {
      const sortedData = [...filteredData].sort((a, b) => {
        const aValue = a[key];
        const bValue = b[key];

        // null/undefined 처리
        if (aValue === null || aValue === undefined) return direction === 'asc' ? -1 : 1;
        if (bValue === null || bValue === undefined) return direction === 'asc' ? 1 : -1;

        // 숫자 정렬 처리 개선
        if (
          (typeof aValue === 'number' && typeof bValue === 'number') ||
          (typeof aValue === 'string' && typeof bValue === 'string' && !isNaN(Number(aValue)) && !isNaN(Number(bValue)))
        ) {
          const aNum = Number(aValue);
          const bNum = Number(bValue);
          return direction === 'asc' ? aNum - bNum : bNum - aNum;
        }

        // 문자열 정렬
        const aString = String(aValue).toLowerCase();
        const bString = String(bValue).toLowerCase();
        return direction === 'asc' 
          ? aString.localeCompare(bString)
          : bString.localeCompare(aString);
      });

      setFilteredData(sortedData);
    }

    if (onSort) onSort(key, direction);
  }, [sortConfig, filteredData, data, processTableData, onSort]);

  // 선택 처리
  const handleSelectAll = (checked: boolean) => {
    const newSelected = checked ? data.map(item => item.id?.toString() || '') : [];
    setSelectedRows(newSelected);
    onSelectionChange?.(checked ? data : []);
  };

  const handleSelectRow = (id: string) => {
    setSelectedRows(prev => {
      const newSelected = prev.includes(id)
        ? prev.filter(rowId => rowId !== id)
        : [...prev, id];
      
      const selectedItems = data.filter(item => 
        newSelected.includes(item.id?.toString() || '')
      );
      onSelectionChange?.(selectedItems);
      
      return newSelected;
    });
  };

  // 페이지네이션 처리
  const handlePageChange = useCallback((newPage: number) => {
    setCurrentPage(newPage);
    const newData = processTableData(data);
    setFilteredData(newData);
    onPageChange?.(newPage);
  }, [data, processTableData, onPageChange]);

  // 페이지당 항목 수 변경 처리
  const handleItemsPerPageChange = (value: string) => {
    const newItemsPerPage = value === 'all' ? 'all' : Number(value);
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // 페이지 수가 변경되면 첫 페이지로 이동
  };

  // 현재 페이지 데이터 계산
  const currentData = useMemo(() => {
    if (itemsPerPage === 'all') {
      return filteredData;
    }
    const startIndex = (currentPage - 1) * (itemsPerPage as number);
    return filteredData.slice(startIndex, startIndex + (itemsPerPage as number));
  }, [filteredData, currentPage, itemsPerPage]);

  const totalItems = filteredData.length;

  // 컬럼 표시/숨김 토글
  const toggleColumn = (columnKey: string) => {
    setVisibleColumns(prev => {
      const newSet = new Set(prev);
      if (newSet.has(columnKey)) {
        newSet.delete(columnKey);
      } else {
        newSet.add(columnKey);
      }
      setIsAllColumnsVisible(newSet.size === columns.length);
      return newSet;
    });
  };

  // 모든 컬럼 토글
  const toggleAllColumns = () => {
    if (isAllColumnsVisible) {
      setVisibleColumns(new Set());
      setIsAllColumnsVisible(false);
    } else {
      setVisibleColumns(new Set(columns.map(col => col.key)));
      setIsAllColumnsVisible(true);
    }
  };

  // 필터링된 컬럼
  const filteredColumns = useMemo(() => 
    columns.filter(column => visibleColumns.has(column.key) && column.key !== 'id')
  , [columns, visibleColumns]);

  // ID 컬럼 찾기
  const idColumn = useMemo(() => 
    columns.find(column => column.key === 'id')
  , [columns]);

  // 전체 컬럼 수 계산을 위한 함수 추가
  const getTotalColumnCount = () => {
    let count = 0;
    // 체크박스 컬럼
    count += 1;
    // ID 컬럼
    if (idColumn) count += 1;
    // 필터링된 컬럼들
    count += filteredColumns.length || 1; // 필터링된 컬럼이 없어도 최소 1개의 컬럼은 존재
    // 액션 컬럼
    count += 1;
    return count;
  };

  // 기본 핸들러 함수 (버튼 이벤트 처리용)
  const handleCreateCurrency = () => {
    console.log('[DataTable] CREATE 버튼 클릭됨');
    if (onCreateCurrency) {
      onCreateCurrency();
    } else {
      console.warn('[DataTable] onCreateCurrency handler가 정의되지 않았습니다.');
    }
  };

  const handleUpdateCurrency = () => {
    console.log('[DataTable] UPDATE 버튼 클릭됨');
    if (onUpdateCurrency) {
      onUpdateCurrency();
    } else {
      console.warn('[DataTable] onUpdateCurrency handler가 정의되지 않았습니다.');
    }
  };

  const handleDeleteCurrency = () => {
    console.log('[DataTable] DELETE 버튼 클릭됨');
    if (onDeleteCurrency) {
      onDeleteCurrency();
    } else {
      console.warn('[DataTable] onDeleteCurrency handler가 정의되지 않았습니다.');
    }
  };

  // Advanced Currency 패널 핸들러 함수 추가
  const handleUseItem = () => {
    console.log('[DataTable] USE ITEM 버튼 클릭됨');
    if (onUseItem) {
      onUseItem();
    } else {
      console.warn('[DataTable] onUseItem handler가 정의되지 않았습니다.');
    }
  };

  const handleGetItem = () => {
    console.log('[DataTable] GET ITEM 버튼 클릭됨');
    if (onGetItem) {
      onGetItem();
    } else {
      console.warn('[DataTable] onGetItem handler가 정의되지 않았습니다.');
    }
  };

  const handleSendItem = () => {
    console.log('[DataTable] SEND ITEM 버튼 클릭됨');
    if (onSendItem) {
      onSendItem();
    } else {
      console.warn('[DataTable] onSendItem handler가 정의되지 않았습니다.');
    }
  };

  // 행 메뉴 열기/닫기 핸들러 개선
  const handleRowMenuOpenChange = (id: string, isOpen: boolean) => {
    try {
      console.log(`[DataTable] 행 메뉴 상태 변경: id=${id}, isOpen=${isOpen}`);
      setRowMenuOpenMap(prev => ({
        ...prev,
        [id]: isOpen
      }));
    } catch (error) {
      console.error('[DataTable] 행 메뉴 상태 변경 중 오류:', error);
    }
  };

  // 헤더 메뉴 열기/닫기 핸들러 추가
  const handleHeaderMenuOpenChange = (isOpen: boolean) => {
    try {
      console.log(`[DataTable] 헤더 메뉴 상태 변경: isOpen=${isOpen}`);
      setHeaderMenuOpen(isOpen);
    } catch (error) {
      console.error('[DataTable] 헤더 메뉴 상태 변경 중 오류:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">{tableName}</h2>
          {onSelectRows && (
            <Button onClick={onSelectRows} className="bg-green-500 hover:bg-green-600">
              <Plus className="w-4 h-4 mr-2" />
              Create New
            </Button>
          )}
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

  if (!data.length) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">{tableName}</h2>
          {onSelectRows && (
            <Button onClick={onSelectRows} className="bg-green-500 hover:bg-green-600">
              <Plus className="w-4 h-4 mr-2" />
              Create New
            </Button>
          )}
        </div>
        <div className="border rounded-md p-4 text-center text-gray-500">
          No data available
        </div>
        {/* 디버그 정보 */}
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
        
        {/* Currency Control Panel - showDataControls가 true일 때만 표시되며, 디버그 정보 다음에 위치 */}
        {showDataControls && (
          <DataControlsPanel
            onCreateClick={handleCreateCurrency}
            onUpdateClick={handleUpdateCurrency}
            onDeleteClick={handleDeleteCurrency}
            className="mt-4" // 디버그 정보와의 간격을 위한 margin-top 추가
          />
        )}

        {/* Advanced Currency Control Panel - showAdvancedDataControls가 true일 때만 표시 */}
        {showAdvancedDataControls && (
          <AdvancedDataControlsPanel
            onUseItemClick={handleUseItem}
            onGetItemClick={handleGetItem}
            onSendItemClick={handleSendItem}
            className="mt-4" // Currency Control Panel과의 간격을 위한 margin-top 추가
          />
        )}
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {showActions && (
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ColumnFilter
              columns={columns.filter(col => col.key !== 'id')} // ID 컬럼은 필터 목록에서 제외
              visibleColumns={visibleColumns}
              isAllColumnsVisible={isAllColumnsVisible}
              onToggleColumn={toggleColumn}
              onToggleAllColumns={toggleAllColumns}
            />
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-purple-400" />
              <Input
                placeholder={`Search ${tableName || 'items'}...`}
                className="pl-8 h-9 w-[250px] bg-purple-50/50 border-purple-100 text-purple-900 placeholder:text-purple-400"
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>
          </div>
          {onSelectRows && (
            <Button 
              className="bg-purple-500 hover:bg-purple-600 text-white h-9"
              onClick={onSelectRows}
            >
              <Plus className="h-4 w-4 mr-2" />
              Select Rows
            </Button>
          )}
        </div>
      )}
      
      <div className="rounded-md border border-gray-200 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className={`bg-purple-50/80 ${headerClassName}`}>
              <TableHead className="w-10 h-10 py-2 px-0 border-r border-gray-200 text-center">
                <div className="flex justify-center items-center w-full px-2">
                  <Checkbox
                    checked={data.length > 0 && selectedRows.length === data.length}
                    onCheckedChange={handleSelectAll}
                  />
                </div>
              </TableHead>
              {/* ID 컬럼 - 항상 표시 */}
              {idColumn && (
                <TableHead
                  className="text-xs font-bold text-gray-600 h-10 py-2 border-r border-gray-200 text-center w-16"
                  onClick={() => idColumn.sortable && handleSort('id')}
                  role={idColumn.sortable ? 'button' : undefined}
                  tabIndex={idColumn.sortable ? 0 : undefined}
                  aria-sort={
                    sortConfig.key === 'id'
                      ? sortConfig.direction === 'asc'
                        ? 'ascending'
                        : 'descending'
                      : undefined
                  }
                >
                  <div className="flex items-center justify-center gap-1">
                    <ListOrdered className="h-4 w-4 text-gray-400" />
                    {idColumn.sortable && sortConfig.key === 'id' && (
                      <span className="text-gray-400">
                        {sortConfig.direction === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </TableHead>
              )}
              {/* 나머지 필터링 가능한 컬럼들 */}
              {filteredColumns.length === 0 ? (
                <TableHead className="h-10 py-2 border-r border-gray-200 text-center">
                  <div className="flex items-center justify-center">-</div>
                </TableHead>
              ) : (
                filteredColumns.map((column) => (
                  <TableHead
                    key={column.key}
                    className={`text-xs font-bold text-gray-600 h-10 py-2 ${
                      column.sortable ? 'cursor-pointer select-none hover:bg-purple-100/50' : ''
                    } border-r border-gray-200 text-center`}
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
                ))
              )}
              <TableHead className="w-10 h-10 py-2 px-0 border-r border-gray-200">
                <div className="flex items-center justify-center w-full px-2">
                  <DropdownMenu open={headerMenuOpen} onOpenChange={handleHeaderMenuOpenChange}>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-6 w-6 p-0 hover:bg-purple-50">
                        <MoreVertical className="h-4 w-4 text-gray-400" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem 
                        className="cursor-default text-gray-400"
                        disabled
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Create
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="cursor-default text-gray-400"
                        disabled
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Update
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="cursor-default text-gray-400"
                        disabled
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          
                          try {
                            // 데이터 새로고침 이벤트 발생
                            window.dispatchEvent(new CustomEvent('refresh-data'));
                            console.log('[DataTable] 헤더 새로고침 요청');
                            // 메뉴 닫기
                            setHeaderMenuOpen(false);
                          } catch (error) {
                            console.error('[DataTable] 새로고침 처리 중 오류:', error);
                          }
                        }}
                        className="cursor-pointer text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Refresh
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentData.length === 0 ? (
              <TableRow>
                <TableCell className="w-10 px-0 border-r border-gray-200 text-center">
                  <div className="flex justify-center items-center w-full px-2">-</div>
                </TableCell>
                {idColumn && <TableCell className="w-16 border-r border-gray-200 text-center">-</TableCell>}
                <TableCell colSpan={filteredColumns.length || 1} className="text-center py-4">
                  데이터가 없습니다.
                </TableCell>
                <TableCell className="w-10 border-r border-gray-200 text-center">-</TableCell>
              </TableRow>
            ) : (
              currentData.map((item) => (
                <TableRow 
                  key={item.id} 
                  className={`hover:bg-purple-50/30 ${rowClassName}`}
                  onClick={() => onRowClick?.(item)}
                >
                  <TableCell className={`w-10 py-3 px-0 ${cellClassName} border-r border-gray-200 text-center`}>
                    <div className="flex justify-center items-center w-full px-2">
                      <Checkbox
                        checked={selectedRows.includes(item.id?.toString())}
                        onCheckedChange={() => handleSelectRow(item.id?.toString())}
                      />
                    </div>
                  </TableCell>
                  {/* ID 컬럼 데이터 - 항상 표시 */}
                  {idColumn && (
                    <TableCell 
                      className={`w-16 py-3 ${cellClassName} text-center border-r border-gray-200 text-gray-400`}
                    >
                      {idColumn.format?.(item[idColumn.key]) ?? formatValue(item[idColumn.key], idColumn.type)}
                    </TableCell>
                  )}
                  {/* 나머지 필터링된 컬럼 데이터 */}
                  {filteredColumns.length === 0 ? (
                    <TableCell className="py-3 border-r border-gray-200 text-center">-</TableCell>
                  ) : (
                    filteredColumns.map((column) => (
                      <TableCell 
                        key={column.key} 
                        className={`py-3 ${cellClassName} ${
                          column.align ? `text-${column.align}` : 'text-center'
                        } border-r border-gray-200`}
                      >
                        {column.key === 'category' ? (
                          <div className="flex justify-center">
                            <span className="text-purple-600 font-medium bg-purple-50 px-3 py-1 rounded-full">
                              {column.format?.(item[column.key]) ?? formatValue(item[column.key], column.type)}
                            </span>
                          </div>
                        ) : (
                          column.format?.(item[column.key]) ?? formatValue(item[column.key], column.type)
                        )}
                      </TableCell>
                    ))
                  )}
                  <TableCell className={`w-10 py-3 px-0 text-center ${cellClassName} border-r border-gray-200`}>
                    <div className="flex justify-center items-center w-full px-2">
                      <DropdownMenu 
                        open={rowMenuOpenMap[item.id?.toString()] || false}
                        onOpenChange={(isOpen) => handleRowMenuOpenChange(item.id?.toString(), isOpen)}
                      >
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-6 w-6 p-0 hover:bg-purple-50">
                            <MoreVertical className="h-4 w-4 text-gray-400" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem 
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              
                              try {
                                // Create는 특정 항목이 필요 없지만, 현재 컨텍스트에서 작업을 위해 필요하면 적용
                                if (onCreateCurrency) {
                                  onCreateCurrency();
                                }
                                // 메뉴 닫기
                                handleRowMenuOpenChange(item.id?.toString(), false);
                              } catch (error) {
                                console.error('[DataTable] Create 처리 중 오류:', error);
                              }
                            }}
                            className="cursor-pointer text-green-600 hover:text-green-700 hover:bg-green-50"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Create
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              
                              try {
                                // 체크박스 선택 없이 해당 행의 데이터만 직접 sessionStorage에 저장
                                const selectedItem = data.find(d => d.id?.toString() === item.id?.toString());
                                if (selectedItem) {
                                  // 단일 항목 직접 저장 - 체크박스 선택 상태 변경 없음
                                  sessionStorage.setItem('selectedCurrency', JSON.stringify(selectedItem));
                                  sessionStorage.setItem('selectedCurrencies', JSON.stringify([selectedItem]));
                                  console.log('[DataTable] Update 선택: 단일 항목 저장됨', selectedItem);
                                }
                                
                                if (onUpdateCurrency) {
                                  onUpdateCurrency();
                                }
                                // 메뉴 닫기
                                handleRowMenuOpenChange(item.id?.toString(), false);
                              } catch (error) {
                                console.error('[DataTable] Update 처리 중 오류:', error);
                              }
                            }}
                            className="cursor-pointer text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Update
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              
                              try {
                                // 체크박스 선택 없이 해당 행의 데이터만 직접 sessionStorage에 저장
                                const selectedItem = data.find(d => d.id?.toString() === item.id?.toString());
                                if (selectedItem) {
                                  // 단일 항목 직접 저장 - 체크박스 선택 상태 변경 없음
                                  sessionStorage.setItem('selectedCurrency', JSON.stringify(selectedItem));
                                  sessionStorage.setItem('selectedCurrencies', JSON.stringify([selectedItem]));
                                  console.log('[DataTable] Delete 선택: 단일 항목 저장됨', selectedItem);
                                }
                                
                                if (onDeleteCurrency) {
                                  onDeleteCurrency();
                                }
                                // 메뉴 닫기
                                handleRowMenuOpenChange(item.id?.toString(), false);
                              } catch (error) {
                                console.error('[DataTable] Delete 처리 중 오류:', error);
                              }
                            }}
                            className="cursor-pointer text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              
                              try {
                                // 데이터 새로고침 이벤트 발생
                                window.dispatchEvent(new CustomEvent('refresh-data'));
                                console.log('[DataTable] 행 데이터 새로고침 요청');
                                // 메뉴 닫기
                                handleRowMenuOpenChange(item.id?.toString(), false);
                              } catch (error) {
                                console.error('[DataTable] 새로고침 처리 중 오류:', error);
                              }
                            }}
                            className="cursor-pointer text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                          >
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Refresh
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
          <tfoot className="border-t border-gray-100">
            <tr>
              <td colSpan={getTotalColumnCount()} className="p-0">
                <Pagination
                  currentPage={currentPage}
                  totalItems={totalItems}
                  itemsPerPage={itemsPerPage}
                  onPageChange={handlePageChange}
                  onItemsPerPageChange={handleItemsPerPageChange}
                />
              </td>
            </tr>
          </tfoot>
        </Table>
      </div>

      {/* 디버그 정보 */}
      <div className="flex justify-between items-center mt-2">
        <div className="flex items-center gap-2">
          <button 
            onClick={() => window.dispatchEvent(new CustomEvent('toggle-debug-section'))}
            className={`flex items-center text-xs px-2 py-1 rounded ${
              (() => {
                // API 응답 상태 확인하기 (성공/실패)
                try {
                  const apiResponseStatus = sessionStorage.getItem('apiResponseStatus');
                  if (apiResponseStatus === 'error' || apiResponseStatus === 'failure') {
                    return 'bg-red-100 text-red-700 hover:bg-red-200';
                  }
                } catch (e) {
                  console.error('[DataTable] 세션 스토리지 접근 중 오류:', e);
                }
                return 'bg-gray-100 text-gray-700 hover:bg-gray-200';
              })()
            }`}
          >
            <Bug className={`w-3.5 h-3.5 mr-1 ${
              (() => {
                try {
                  const apiResponseStatus = sessionStorage.getItem('apiResponseStatus');
                  if (apiResponseStatus === 'error' || apiResponseStatus === 'failure') {
                    return 'text-red-600';
                  }
                } catch (e) {
                  console.error('[DataTable] 세션 스토리지 접근 중 오류:', e);
                }
                return '';
              })()
            }`} />
            디버그 정보
          </button>
        </div>
        <div className="flex items-center gap-1 text-xs bg-gray-100 px-2 py-0.5 rounded">
          <Database className="h-3 w-3 text-purple-500" />
          <span className="text-purple-500 font-medium">
            {(() => {
              // 우선 props의 dbName 사용
              if (dbName) {
                return dbName === 'LocalStorage' ? 'Local Storage' : dbName;
              }
              
              // props의 dbName이 없으면 employerStorage에서 db_name 가져오기
              try {
                const employerInfo = sessionStorage.getItem('employerStorage');
                if (employerInfo) {
                  const parsedEmployerInfo = JSON.parse(employerInfo);
                  if (parsedEmployerInfo.db_name) {
                    return parsedEmployerInfo.db_name === 'LocalStorage' 
                      ? 'Local Storage' 
                      : parsedEmployerInfo.db_name;
                  }
                }
              } catch (error) {
                console.error('[DataTable] employerStorage 파싱 실패:', error);
              }
              
              // 모두 없으면 lastUsedDbName 사용
              const lastUsedDbName = sessionStorage.getItem('lastUsedDbName');
              if (lastUsedDbName) {
                return lastUsedDbName === 'LocalStorage' ? 'Local Storage' : lastUsedDbName;
              }
              
              // 기본값
              return 'Database';
            })()}
          </span>
        </div>
      </div>
      
      {/* Currency Control Panel - showDataControls가 true일 때만 표시되며, 디버그 정보 다음에 위치 */}
      {showDataControls && (
        <DataControlsPanel
          onCreateClick={handleCreateCurrency}
          onUpdateClick={handleUpdateCurrency}
          onDeleteClick={handleDeleteCurrency}
          className="mt-4" // 디버그 정보와의 간격을 위한 margin-top 추가
        />
      )}

      {/* Advanced Currency Control Panel - showAdvancedDataControls가 true일 때만 표시 */}
      {showAdvancedDataControls && (
        <AdvancedDataControlsPanel
          onUseItemClick={handleUseItem}
          onGetItemClick={handleGetItem}
          onSendItemClick={handleSendItem}
          className="mt-4" // Currency Control Panel과의 간격을 위한 margin-top 추가
        />
      )}
    </div>
  );
} 