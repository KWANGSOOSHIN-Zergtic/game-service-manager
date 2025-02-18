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
import { Search, MoreVertical, Plus, ListOrdered } from "lucide-react";
import { Pagination } from "@/components/ui/pagination";
import { ObjectDisplay } from "@/components/ui/object-display";
import { ColumnFilter } from "@/components/ui/column-filter";
import { Skeleton } from '@/components/ui/skeleton';

// 동적 컬럼 정의
export interface TableColumn {
  key: string;
  label: string;
  width?: string;
  format?: (value: string | number | null | object) => string | number | React.ReactNode;
  type?: 'string' | 'number' | 'currency' | 'percentage' | 'object';
  sortable?: boolean;
  align?: 'left' | 'center' | 'right';
}

// 동적 데이터 타입
export interface TableData {
  id: number;
  [key: string]: string | number | boolean | null | object;
}

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
  onCreateNew?: () => void;
}

// 값 포맷팅을 위한 유틸리티 함수
const formatValue = (value: string | number | null | object, type?: string) => {
  if (value === null || value === undefined) return '-';
  
  // Object 타입 체크 추가
  if (typeof value === 'object') {
    return <ObjectDisplay value={value} />;
  }
  
  switch (type) {
    case 'currency':
      return `$${Number(value).toFixed(2)}`;
    case 'percentage':
      return `${value}%`;
    case 'number':
      return Number(value).toString();
    default:
      return value.toString();
  }
};

const formatCellValue = (value: unknown): string => {
  if (value === null || value === undefined) return '';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
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
  onCreateNew
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

  // 데이터 유효성 검사
  const validateData = (data: TableData[]): boolean => {
    return data.every(item => 
      typeof item === 'object' && 
      item !== null && 
      'id' in item
    );
  };

  // 컬럼 정보 생성
  useEffect(() => {
    try {
      if (data.length > 0 && !validateData(data)) {
        console.error('Invalid data format: Each item must have an id property');
        return;
      }

      if (data.length > 0) {
        const firstItem = data[0];
        const extractedColumns: TableColumn[] = Object.keys(firstItem).map(key => {
          const value = firstItem[key];
          let type: TableColumn['type'] = 'string';
          
          if (typeof value === 'number') {
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
            label: key === 'id' ? 'ID' : key.toUpperCase().replace(/_/g, ' '),
            type,
            sortable: true,
            format: (value) => customFormatters?.[key]?.(value) ?? formatValue(value, type)
          };
        });

        setColumns(extractedColumns);
      }
    } catch (error) {
      console.error('Error processing table data:', error);
    }
  }, [data, customFormatters]);

  // 컬럼 정보 생성 시 visibleColumns 초기화
  useEffect(() => {
    if (data.length > 0) {
      const columnKeys = Object.keys(data[0]);
      setVisibleColumns(new Set(columnKeys));
    }
  }, [data]);

  // 검색 처리
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    if (!value.trim()) {
      setFilteredData(data);
      return;
    }

    const filtered = data.filter(item => 
      Object.entries(item).some(([, val]) => 
        val?.toString().toLowerCase().includes(value.toLowerCase())
      )
    );
    setFilteredData(filtered);
    setCurrentPage(1);
  };

  // 정렬 처리
  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' | null = 'asc';
    
    if (sortConfig.key === key) {
      if (sortConfig.direction === 'asc') direction = 'desc';
      else if (sortConfig.direction === 'desc') direction = null;
    }

    setSortConfig({ key, direction });
    if (onSort) onSort(key, direction);
  };

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
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    onPageChange?.(newPage);
  };

  // 페이지당 항목 수 변경 처리
  const handleItemsPerPageChange = (value: string) => {
    const newItemsPerPage = value === 'all' ? 'all' : Number(value);
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // 페이지 수가 변경되면 첫 페이지로 이동
  };

  // 현재 페이지 데이터 계산 로직 수정
  const currentData = useMemo(() => {
    if (itemsPerPage === 'all') {
      return filteredData;
    }
    const startIndex = (currentPage - 1) * (itemsPerPage as number);
    return filteredData.slice(startIndex, startIndex + (itemsPerPage as number));
  }, [filteredData, currentPage, itemsPerPage]);

  const totalItems = filteredData.length;

  // 데이터 변경 시 필터된 데이터 초기화
  useEffect(() => {
    setFilteredData(data);
  }, [data]);

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

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">{tableName}</h2>
          {onCreateNew && (
            <Button onClick={onCreateNew} className="bg-green-500 hover:bg-green-600">
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
          {onCreateNew && (
            <Button onClick={onCreateNew} className="bg-green-500 hover:bg-green-600">
              <Plus className="w-4 h-4 mr-2" />
              Create New
            </Button>
          )}
        </div>
        <div className="border rounded-md p-4 text-center text-gray-500">
          No data available
        </div>
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
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-purple-400" />
              <Input
                placeholder={`Search ${tableName || 'items'}...`}
                className="pl-8 w-[250px] bg-purple-50/50 border-purple-100 text-purple-900 placeholder:text-purple-400"
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>
          </div>
          {onCreateNew && (
            <Button 
              className="bg-purple-600 hover:bg-purple-700 text-white"
              onClick={onCreateNew}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create New Row
            </Button>
          )}
        </div>
      )}

      <div className="rounded-md border border-gray-200 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className={`bg-purple-50/80 ${headerClassName}`}>
              <TableHead className="w-12 h-10 py-2 border-r border-gray-200 text-center">
                <div className="flex justify-center items-center">
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
                      column.sortable ? 'cursor-pointer select-none' : ''
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
                      {column.sortable && sortConfig.key === column.key && (
                        <span className="text-gray-400">
                          {sortConfig.direction === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </TableHead>
                ))
              )}
              <TableHead className="w-12 h-10 py-2 border-r border-gray-200">
                <div className="flex items-center justify-center">
                  <MoreVertical className="h-4 w-4 text-gray-400" />
                </div>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentData.length === 0 ? (
              <TableRow>
                <TableCell className="w-12 border-r border-gray-200 text-center">-</TableCell>
                {idColumn && <TableCell className="w-16 border-r border-gray-200 text-center">-</TableCell>}
                <TableCell colSpan={filteredColumns.length || 1} className="text-center py-4">
                  데이터가 없습니다.
                </TableCell>
                <TableCell className="w-12 border-r border-gray-200 text-center">-</TableCell>
              </TableRow>
            ) : (
              currentData.map((item) => (
                <TableRow 
                  key={item.id} 
                  className={`hover:bg-purple-50/30 ${rowClassName}`}
                  onClick={() => onRowClick?.(item)}
                >
                  <TableCell className={`w-12 py-3 ${cellClassName} border-r border-gray-200 text-center`}>
                    <div className="flex justify-center items-center">
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
                  <TableCell className={`w-12 py-3 text-right ${cellClassName} border-r border-gray-200`}>
                    <Button variant="ghost" size="icon" className="hover:bg-purple-50">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
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
    </div>
  );
} 