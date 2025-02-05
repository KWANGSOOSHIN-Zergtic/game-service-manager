import { useState, useEffect, useMemo } from "react";
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
import { Filter, Search, MoreVertical, Plus, ChevronLeft, ChevronRight } from "lucide-react";

// 동적 컬럼 정의
export interface TableColumn {
  key: string;
  label: string;
  width?: string;
  format?: (value: string | number | null) => string | number;
  type?: 'string' | 'number' | 'currency' | 'percentage';
  sortable?: boolean;
  align?: 'left' | 'center' | 'right';
}

// 동적 데이터 타입
export interface TableData {
  [key: string]: string | number | null;
  id: string | number;
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
    [key: string]: (value: string | number | null) => string | number;
  };
  onRowClick?: (item: TableData) => void;
  onSelectionChange?: (selectedItems: TableData[]) => void;
  onSort?: (key: string, direction: 'asc' | 'desc' | null) => void;
  onPageChange?: (page: number) => void;
  showActions?: boolean;
  onCreateNew?: () => void;
}

// 값 포맷팅을 위한 유틸리티 함수
const formatValue = (value: string | number | null, type?: string) => {
  if (value === null || value === undefined) return '-';
  
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

  const itemsPerPage = 4;

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
          }

          return {
            key,
            label: key.toUpperCase().replace(/_/g, ' '),
            type,
            width: key === 'id' ? 'w-12' : undefined,
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

  // 검색 처리
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    if (!value.trim()) {
      setFilteredData(data);
      return;
    }

    const filtered = data.filter(item => 
      Object.entries(item).some(([_, val]) => 
        val?.toString().toLowerCase().includes(value.toLowerCase())
      )
    );
    setFilteredData(filtered);
    setCurrentPage(1);
  };

  // 정렬 처리
  const handleSort = (columnKey: string) => {
    let direction: 'asc' | 'desc' | null = 'asc';
    
    if (sortConfig.key === columnKey) {
      if (sortConfig.direction === 'asc') direction = 'desc';
      else if (sortConfig.direction === 'desc') direction = null;
    }

    setSortConfig({ key: columnKey, direction });
    onSort?.(columnKey, direction);
    
    if (!direction) {
      setFilteredData([...data]);
      return;
    }

    const sorted = [...filteredData].sort((a, b) => {
      const aVal = a[columnKey];
      const bVal = b[columnKey];

      if (aVal === null) return direction === 'asc' ? 1 : -1;
      if (bVal === null) return direction === 'asc' ? -1 : 1;

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return direction === 'asc' ? aVal - bVal : bVal - aVal;
      }

      return direction === 'asc' 
        ? aVal.toString().localeCompare(bVal.toString())
        : bVal.toString().localeCompare(aVal.toString());
    });

    setFilteredData(sorted);
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

  // 메모이제이션된 현재 페이지 데이터
  const currentData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredData.slice(startIndex, endIndex);
  }, [filteredData, currentPage]);

  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);

  // 데이터 변경 시 필터된 데이터 초기화
  useEffect(() => {
    setFilteredData(data);
  }, [data]);

  return (
    <div className={`space-y-4 ${className}`}>
      {showActions && (
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              size="sm"
              className="text-purple-700 border-purple-200 hover:bg-purple-50 hover:text-purple-800"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
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
              Create New {tableName || 'Item'}
            </Button>
          )}
        </div>
      )}

      <div className="rounded-md border border-gray-200 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className={`bg-purple-50/80 ${headerClassName}`}>
              <TableHead className="w-12 h-10 py-2">
                <Checkbox
                  checked={data.length > 0 && selectedRows.length === data.length}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              {columns.map((column) => (
                <TableHead
                  key={column.key}
                  className={`text-xs font-bold text-gray-600 h-10 py-2 ${column.width || ''} ${
                    column.sortable ? 'cursor-pointer select-none' : ''
                  }`}
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
                  <div className="flex items-center gap-1">
                    {column.label}
                    {column.sortable && sortConfig.key === column.key && (
                      <span className="text-gray-400">
                        {sortConfig.direction === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </TableHead>
              ))}
              <TableHead className="w-12 h-10 py-2"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={columns.length + 2} className="text-center py-4">
                  데이터를 불러오는 중...
                </TableCell>
              </TableRow>
            ) : currentData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length + 2} className="text-center py-4">
                  데이터가 없습니다.
                </TableCell>
              </TableRow>
            ) : (
              currentData.map((item) => (
                <TableRow 
                  key={item.id} 
                  className={`hover:bg-purple-50/30 ${rowClassName}`}
                  onClick={() => onRowClick?.(item)}
                >
                  <TableCell className={`py-3 ${cellClassName}`}>
                    <Checkbox
                      checked={selectedRows.includes(item.id?.toString())}
                      onCheckedChange={() => handleSelectRow(item.id?.toString())}
                    />
                  </TableCell>
                  {columns.map((column) => (
                    <TableCell 
                      key={column.key} 
                      className={`py-3 ${cellClassName} ${
                        column.align ? `text-${column.align}` : ''
                      }`}
                    >
                      {column.key === 'category' ? (
                        <span className="text-purple-600 font-medium bg-purple-50 px-3 py-1 rounded-full">
                          {column.format?.(item[column.key]) ?? formatValue(item[column.key], column.type)}
                        </span>
                      ) : (
                        column.format?.(item[column.key]) ?? formatValue(item[column.key], column.type)
                      )}
                    </TableCell>
                  ))}
                  <TableCell className={`py-3 ${cellClassName}`}>
                    <Button variant="ghost" size="icon" className="hover:bg-purple-50">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
          <tfoot className="border-t border-gray-100 bg-white">
            <tr>
              <td colSpan={columns.length + 2}>
                <div className="bg-purple-50/80 flex items-center justify-between px-4 h-10">
                  <div className="text-xs text-gray-500 font-bold">
                    Rows per page: {itemsPerPage}
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-xs text-gray-500">
                      {totalItems > 0 ? `${startIndex + 1}-${endIndex} of ${totalItems}` : '0-0 of 0'}
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className={`h-6 w-6 ${
                          currentPage === 1 
                            ? 'text-gray-600' 
                            : 'text-purple-700 hover:text-purple-800 hover:bg-purple-50'
                        }`}
                        disabled={currentPage === 1}
                        onClick={() => handlePageChange(currentPage - 1)}
                      >
                        <ChevronLeft className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className={`h-6 w-6 ${
                          currentPage === totalPages 
                            ? 'text-gray-600' 
                            : 'text-purple-700 hover:text-purple-800 hover:bg-purple-50'
                        }`}
                        disabled={currentPage === totalPages}
                        onClick={() => handlePageChange(currentPage + 1)}
                      >
                        <ChevronRight className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </td>
            </tr>
          </tfoot>
        </Table>
      </div>
    </div>
  );
} 