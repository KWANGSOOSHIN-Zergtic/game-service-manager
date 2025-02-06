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
import { Filter, Search, MoreVertical, Plus, Braces, Copy, Check } from "lucide-react";
import { Pagination } from "@/components/ui/pagination";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

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
  [key: string]: string | number | null | object;
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
    [key: string]: (value: string | number | null | object) => string | number | React.ReactNode;
  };
  onRowClick?: (item: TableData) => void;
  onSelectionChange?: (selectedItems: TableData[]) => void;
  onSort?: (key: string, direction: 'asc' | 'desc' | null) => void;
  onPageChange?: (page: number) => void;
  showActions?: boolean;
  onCreateNew?: () => void;
}

// Object 내용을 문자열로 변환하는 함수 수정
const stringifyObject = (obj: object): string => {
  try {
    // JSON 형식인지 확인
    const jsonString = JSON.stringify(obj, null, 2);
    JSON.parse(jsonString); // 유효한 JSON인지 검증
    return jsonString;
  } catch {
    // JSON 형식이 아닌 경우 일반 문자열로 변환
    try {
      return obj.toString();
    } catch {
      return '[Object]';
    }
  }
};

// Object 표시를 위한 컴포넌트
const ObjectDisplay = ({ value }: { value: object }) => {
  const [isCopied, setIsCopied] = useState(false);
  const objectString = stringifyObject(value);
  const isJsonFormat = objectString.startsWith('{') || objectString.startsWith('[');

  const handleCopy = () => {
    navigator.clipboard.writeText(objectString).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  return (
    <div className="flex justify-center">
      <Popover>
        <PopoverTrigger>
          <span className="inline-flex items-center gap-1 text-sky-600 font-medium bg-sky-100 px-3 py-1 rounded-full hover:bg-sky-200 cursor-pointer transition-colors">
            <Braces className="h-3 w-3" />
            {isJsonFormat ? 'JSON' : 'Object'}
          </span>
        </PopoverTrigger>
        <PopoverContent className="w-auto max-w-[300px] p-2">
          <div className="space-y-2">
            <div className="flex justify-between items-center pb-2 border-b border-gray-200">
              <span className="text-xs font-medium text-gray-600">
                {isJsonFormat ? 'JSON Content' : 'Object Content'}
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2 text-gray-600 hover:text-gray-900"
                onClick={handleCopy}
              >
                {isCopied ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            <pre className={`text-xs whitespace-pre-wrap break-words ${
              isJsonFormat ? 'text-sky-800' : 'text-gray-600'
            }`}>
              {objectString}
            </pre>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

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
            label: key.toUpperCase().replace(/_/g, ' '),
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
    columns.filter(column => visibleColumns.has(column.key))
  , [columns, visibleColumns]);

  return (
    <div className={`space-y-4 ${className}`}>
      {showActions && (
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="text-purple-700 border-purple-200 hover:bg-purple-50 hover:text-purple-800 w-[100px]"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[100px] p-2">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={isAllColumnsVisible}
                      onCheckedChange={toggleAllColumns}
                      id="all-columns"
                      className="data-[state=checked]:border-gray-600 data-[state=checked]:bg-gray-600"
                    />
                    <label 
                      htmlFor="all-columns"
                      className={`text-[10px] cursor-pointer ${
                        isAllColumnsVisible ? 'font-bold text-purple-600' : ''
                      }`}
                    >
                      All
                    </label>
                  </div>
                  <div className="space-y-2">
                    {columns.map((column) => (
                      <div key={column.key} className="flex items-center space-x-2">
                        <Checkbox
                          checked={visibleColumns.has(column.key)}
                          onCheckedChange={() => toggleColumn(column.key)}
                          id={`column-${column.key}`}
                          className="data-[state=checked]:border-gray-600 data-[state=checked]:bg-gray-600"
                        />
                        <label 
                          htmlFor={`column-${column.key}`}
                          className={`text-[10px] cursor-pointer ${
                            visibleColumns.has(column.key) ? 'font-bold text-purple-600' : ''
                          }`}
                        >
                          {column.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </PopoverContent>
            </Popover>
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
              {filteredColumns.map((column) => (
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
              ))}
              <TableHead className="w-12 h-10 py-2"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={filteredColumns.length + 2} className="text-center py-4">
                  데이터를 불러오는 중...
                </TableCell>
              </TableRow>
            ) : currentData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={filteredColumns.length + 2} className="text-center py-4">
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
                  <TableCell className={`py-3 ${cellClassName} border-r border-gray-200 text-center`}>
                    <div className="flex justify-center items-center">
                      <Checkbox
                        checked={selectedRows.includes(item.id?.toString())}
                        onCheckedChange={() => handleSelectRow(item.id?.toString())}
                      />
                    </div>
                  </TableCell>
                  {filteredColumns.map((column) => (
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
                  ))}
                  <TableCell className={`py-3 w-12 text-right ${cellClassName} border-r border-gray-200`}>
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
              <td colSpan={filteredColumns.length + 2}>
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