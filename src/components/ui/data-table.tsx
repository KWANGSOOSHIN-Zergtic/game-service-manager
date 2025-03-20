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

  // 행 선택 처리 개선 - 체크박스 선택 처리 강화
  const handleSelectRow = useCallback(
    (id: React.Key, checked: boolean) => {
      setSelectedRows((prev) => {
        // 체크박스 상태에 따라 selectedRows 업데이트
        const newSelectedRows = checked 
          ? [...prev, id.toString()] 
          : prev.filter((rowId) => rowId !== id.toString());
        
        console.log('[DataTable] 행 선택 상태 변경:', {
          id,
          checked,
          selectedCount: newSelectedRows.length
        });
        
        // 선택된 항목 데이터 처리
        try {
          // 세션 스토리지에서 전체 테이블 데이터 가져오기
          const tableDataStr = sessionStorage.getItem('tableData');
          if (tableDataStr) {
            const tableData = JSON.parse(tableDataStr);
            
            // 이전 선택 정보 완전히 제거
            sessionStorage.removeItem('selectedCurrency');
            sessionStorage.removeItem('selectedCurrencies');
            
            // 현재 선택된 항목의 전체 데이터 찾기
            if (newSelectedRows.length === 1) {
              // 단일 선택 - selectedCurrency에 저장
              const selectedItem = tableData.find((item: Record<string, unknown>) => 
                String(item.id) === String(newSelectedRows[0]));
              
              if (selectedItem) {
                // 선택된 항목 저장
                sessionStorage.setItem('selectedCurrency', JSON.stringify(selectedItem));
                sessionStorage.setItem('selectedCurrencies', JSON.stringify([selectedItem]));
                console.log('[DataTable] 단일 항목 선택 저장 완료:', selectedItem);
              } else {
                console.warn('[DataTable] 선택된 항목을 테이블 데이터에서 찾을 수 없음:', newSelectedRows[0]);
              }
            } else if (newSelectedRows.length > 1) {
              // 다중 선택 - selectedCurrencies에 저장
              const selectedItems = tableData.filter((item: Record<string, unknown>) => 
                newSelectedRows.includes(String(item.id)));
              
              if (selectedItems.length > 0) {
                // 선택된 모든 항목 저장
                sessionStorage.setItem('selectedCurrencies', JSON.stringify(selectedItems));
                // 첫 번째 항목도 selectedCurrency에 저장 (이전 코드와 호환성 유지)
                sessionStorage.setItem('selectedCurrency', JSON.stringify(selectedItems[0]));
                console.log('[DataTable] 다중 항목 선택 저장 완료:', selectedItems.length, '개 항목');
              } else {
                console.warn('[DataTable] 선택된 항목들을 테이블 데이터에서 찾을 수 없음');
              }
            } else {
              // 선택 해제 - 세션 스토리지에서 제거 (이미 위에서 제거했음)
              console.log('[DataTable] 모든 선택 해제됨, 세션 스토리지 선택 정보 제거');
            }
          } else {
            console.warn('[DataTable] 테이블 데이터를 세션 스토리지에서 찾을 수 없음');
          }
        } catch (error) {
          console.error('[DataTable] 선택 데이터 처리 중 오류 발생:', error);
        }
        
        // 선택 변경 이벤트 발생
        const selectionChangedEvent = new CustomEvent('row-selection-changed', {
          detail: { 
            selectedRows: newSelectedRows,
            count: newSelectedRows.length
          }
        });
        window.dispatchEvent(selectionChangedEvent);
        
        // 콜백 함수 호출 (있는 경우)
        if (onSelectionChange) {
          // 선택된 행 ID에 해당하는 완전한 데이터 객체 찾기
          const selectedRowsData = newSelectedRows
            .map(rowId => data.find(item => String(item.id) === rowId))
            .filter(item => item !== undefined) as TableData[];
          
          onSelectionChange(selectedRowsData);
        }
        
        return newSelectedRows;
      });
    },
    [data, onSelectionChange]
  );

  // 일괄 선택 처리 개선
  const handleSelectAll = useCallback(
    (checked: boolean) => {
      // 전체 선택 또는 전체 해제
      const newSelectedRows = checked 
        ? data.map((row) => row.id.toString())
        : [];
      
      setSelectedRows(newSelectedRows);
      console.log('[DataTable] 전체 행 선택 상태 변경:', {
        checked,
        selectedCount: newSelectedRows.length
      });
      
      // 선택된 항목 데이터 처리
      try {
        // 이전 선택 정보 완전히 제거
        sessionStorage.removeItem('selectedCurrency');
        sessionStorage.removeItem('selectedCurrencies');
        
        if (checked && newSelectedRows.length > 0) {
          // 전체 선택 시 모든 데이터 저장
          const tableDataStr = sessionStorage.getItem('tableData');
          if (tableDataStr) {
            const tableData = JSON.parse(tableDataStr);
            
            if (newSelectedRows.length === 1) {
              // 항목이 1개만 있는 경우 단일 선택으로 처리
              const selectedItem = tableData[0];
              sessionStorage.setItem('selectedCurrency', JSON.stringify(selectedItem));
              sessionStorage.setItem('selectedCurrencies', JSON.stringify([selectedItem]));
              console.log('[DataTable] 단일 항목 전체 선택 저장 완료');
            } else {
              // 다중 선택 처리
              sessionStorage.setItem('selectedCurrencies', JSON.stringify(tableData));
              sessionStorage.setItem('selectedCurrency', JSON.stringify(tableData[0]));
              console.log('[DataTable] 다중 항목 전체 선택 저장 완료:', tableData.length, '개 항목');
            }
          }
        } else {
          // 전체 해제 시 세션 스토리지에서 제거 (이미 위에서 제거했음)
          console.log('[DataTable] 전체 선택 해제됨, 세션 스토리지 선택 정보 제거');
        }
      } catch (error) {
        console.error('[DataTable] 전체 선택 데이터 처리 중 오류 발생:', error);
      }
      
      // 선택 변경 이벤트 발생
      const selectionChangedEvent = new CustomEvent('row-selection-changed', {
        detail: { 
          selectedRows: newSelectedRows,
          count: newSelectedRows.length
        }
      });
      window.dispatchEvent(selectionChangedEvent);
      
      // 콜백 함수 호출 (있는 경우)
      if (onSelectionChange) {
        if (checked) {
          // 전체 선택시에는 데이터 전체를 전달
          onSelectionChange(data);
        } else {
          // 전체 해제시에는 빈 배열 전달
          onSelectionChange([]);
        }
      }
    },
    [data, onSelectionChange]
  );

  // 컴포넌트 마운트/업데이트 시 체크박스 상태와 세션 스토리지 동기화
  useEffect(() => {
    // 컴포넌트 마운트 시 이전 선택 정보 초기화
    setSelectedRows([]);
    sessionStorage.removeItem('selectedCurrency');
    sessionStorage.removeItem('selectedCurrencies');
    
    console.log('[DataTable] 컴포넌트 마운트/업데이트 - 선택 상태 초기화');
    
    // 컴포넌트 언마운트 시 클린업 함수
    return () => {
      console.log('[DataTable] 컴포넌트 언마운트 - 정리 작업');
    };
  }, [tableName]); // tableName이 변경될 때마다 (탭이 변경될 때) 실행

  // 선택 상태 동기화 이벤트 리스너 추가
  useEffect(() => {
    const handleSyncSelection = () => {
      console.log('[DataTable] 선택 상태 동기화 요청 수신');
      
      if (selectedRows.length > 0) {
        // 선택된 항목의 완전한 데이터 객체 가져오기
        const selectedRowsData = selectedRows
          .map(rowId => filteredData.find(item => String(item.id) === rowId))
          .filter(item => item !== undefined) as TableData[];
        
        // 선택된 모든 항목 저장
        if (selectedRowsData.length > 0) {
          console.log('[DataTable] 선택 상태 동기화 중:', selectedRowsData.length, '개 항목');
          sessionStorage.setItem('selectedCurrencies', JSON.stringify(selectedRowsData));
          sessionStorage.setItem('selectedCurrency', JSON.stringify(selectedRowsData[0]));
          
          // 상위 컴포넌트의 콜백 함수 호출
          if (onSelectionChange) {
            onSelectionChange(selectedRowsData);
          }
        }
      }
    };
    
    // 이벤트 리스너 등록
    window.addEventListener('sync-table-selection', handleSyncSelection);
    
    // 컴포넌트 언마운트 시 이벤트 리스너 제거
    return () => {
      window.removeEventListener('sync-table-selection', handleSyncSelection);
    };
  }, [selectedRows, filteredData, onSelectionChange]);

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

  // DB 출처 정보 확인 함수 - 컴포넌트 외부로 분리하여 재사용성 향상
  const getDataSourceInfo = useCallback(() => {
    // 카드 이름을 가져오는 함수
    const getCardName = () => {
      try {
        const employerInfo = sessionStorage.getItem('employerStorage');
        if (employerInfo) {
          const parsedEmployerInfo = JSON.parse(employerInfo);
          // name 또는 employer_name 필드에서 카드 이름 가져오기
          return parsedEmployerInfo.name || 
                parsedEmployerInfo.employer_name || 
                parsedEmployerInfo.user_name || 
                '카드';
        }
      } catch (error) {
        console.error('[DataTable] 카드 이름 가져오기 실패:', error);
      }
      return '카드';
    };

    // DB List 테이블인 경우 특별 처리
    if (dbName === 'DB List' || tableName === 'DB List') {
      // dbInitInfo는 로그인 시 sessionStorage에 저장됨
      try {
        // 디버깅 로그 추가
        console.log('[DataTable] DB List 출처 확인 중');
        
        // 1. dbInitInfo의 존재 여부 확인
        const dbInitInfoStr = sessionStorage.getItem('dbInitInfo');
        if (dbInitInfoStr) {
          console.log('[DataTable] dbInitInfo가 sessionStorage에 존재함');
          return `sessionStorage: DB List`;
        }
        
        // 2. dbListSource 키 확인 (명시적으로 출처를 저장했을 경우)
        const dbListSource = sessionStorage.getItem('dbListSource');
        if (dbListSource) {
          if (dbListSource.toLowerCase().includes('localstorage')) {
            return `Local Storage: DB List`;
          } else if (dbListSource.toLowerCase().includes('sessionstorage')) {
            return `sessionStorage: DB List`;
          } else {
            return dbListSource; // 직접 저장된 출처 값 사용
          }
        }
        
        // 3. DB List 데이터가 어디서 왔는지 추가 확인
        // 데이터 패턴 확인 (특정 필드가 있는지 등)
        if (data && data.length > 0) {
          // DB List 데이터 로그
          console.log('[DataTable] DB List 데이터 샘플:', data[0]);
          
          // 첫 번째 데이터 항목에 source 필드가 있는지 확인
          if (data[0].source) {
            const source = String(data[0].source).toLowerCase();
            if (source.includes('localstorage')) {
              return `Local Storage: DB List`;
            } else if (source.includes('sessionstorage')) {
              return `sessionStorage: DB List`;
            }
          }
        }
        
        // 기본적으로 DB List는 sessionStorage에 저장된 dbInitInfo에서 가져옴
        return `sessionStorage: DB List`;
      } catch (error) {
        console.error('[DataTable] DB List 출처 확인 중 오류:', error);
        return 'DB List';
      }
    }

    // 현재 테이블에서 사용하는 데이터가 어디서 왔는지 확인
    // 1. dataTable prop의 tableName에 'localStorage', 'sessionStorage' 등의 키워드가 있는지 확인
    const isFromLocalStorageKeyword = tableName.toLowerCase().includes('localstorage') || 
                                     tableName.toLowerCase().includes('local storage');
    
    const isFromSessionStorageKeyword = tableName.toLowerCase().includes('sessionstorage') ||
                                       tableName.toLowerCase().includes('session storage');

    // 2. 데이터의 내용 자체로 판단 (data 객체 내에 출처 정보가 있는지)
    let hasLocalStorageDataHint = false;
    let hasSessionStorageDataHint = false;

    if (data && data.length > 0) {
      // 데이터 샘플을 최대 5개까지만 확인
      const sampleSize = Math.min(5, data.length);
      for (let i = 0; i < sampleSize; i++) {
        const item = data[i];
        
        // 데이터 항목에 출처 정보가 있는지 확인
        if (item.source && (
            item.source.toString().toLowerCase().includes('localstorage') ||
            item.source.toString().toLowerCase().includes('local storage')
        )) {
          hasLocalStorageDataHint = true;
          break;
        }
        
        if (item.source && (
            item.source.toString().toLowerCase().includes('sessionstorage') ||
            item.source.toString().toLowerCase().includes('session storage')
        )) {
          hasSessionStorageDataHint = true;
          break;
        }
        
        // table_name 필드에 출처 정보가 있는지 확인 (DB List의 경우)
        if (item.table_name && (
            item.table_name.toString().toLowerCase().includes('localstorage') ||
            item.table_name.toString().toLowerCase().includes('local storage')
        )) {
          hasLocalStorageDataHint = true;
          break;
        }
        
        if (item.table_name && (
            item.table_name.toString().toLowerCase().includes('sessionstorage') ||
            item.table_name.toString().toLowerCase().includes('session storage')
        )) {
          hasSessionStorageDataHint = true;
          break;
        }
      }
    }

    // 3. sessionStorage에서 출처 정보 확인
    let isLocalStorageFromStorage = false;
    let isSessionStorageFromStorage = false;
    
    try {
      // 여러 키 확인
      const storageKeys = ['dataSource', 'dbSource', 'dataOrigin', 'tableSource'];
      
      for (const key of storageKeys) {
        const source = sessionStorage.getItem(key);
        if (source) {
          const sourceLower = source.toLowerCase();
          if (sourceLower.includes('localstorage') || sourceLower.includes('local storage')) {
            isLocalStorageFromStorage = true;
            break;
          }
          if (sourceLower.includes('sessionstorage') || sourceLower.includes('session storage')) {
            isSessionStorageFromStorage = true;
            break;
          }
        }
      }
      
      // DB 이름이 localStorage/sessionStorage인 경우
      const employerInfo = sessionStorage.getItem('employerStorage');
      if (employerInfo) {
        const parsedEmployerInfo = JSON.parse(employerInfo);
        if (parsedEmployerInfo.db_name) {
          const dbNameLower = parsedEmployerInfo.db_name.toLowerCase();
          if (dbNameLower === 'localstorage' || dbNameLower === 'local storage') {
            isLocalStorageFromStorage = true;
          } else if (dbNameLower === 'sessionstorage' || dbNameLower === 'session storage') {
            isSessionStorageFromStorage = true;
          }
        }
      }
      
      // lastUsedDbName 확인
      const lastUsedDbName = sessionStorage.getItem('lastUsedDbName');
      if (lastUsedDbName) {
        const lastUsedDbNameLower = lastUsedDbName.toLowerCase();
        if (lastUsedDbNameLower === 'localstorage' || lastUsedDbNameLower === 'local storage') {
          isLocalStorageFromStorage = true;
        } else if (lastUsedDbNameLower === 'sessionstorage' || lastUsedDbNameLower === 'session storage') {
          isSessionStorageFromStorage = true;
        }
      }
      
      // DB List 관련 특수 키 확인
      const dbListSource = sessionStorage.getItem('dbListSource');
      if (dbListSource) {
        const dbListSourceLower = dbListSource.toLowerCase();
        if (dbListSourceLower === 'localstorage' || dbListSourceLower === 'local storage') {
          isLocalStorageFromStorage = true;
        } else if (dbListSourceLower === 'sessionstorage' || dbListSourceLower === 'session storage') {
          isSessionStorageFromStorage = true;
        }
      }
    } catch (error) {
      console.error('[DataTable] 스토리지 확인 중 오류:', error);
    }

    // 4. props의 dbName 확인
    const isLocalStorageFromProps = dbName && 
                                   (dbName.toLowerCase() === 'localstorage' || 
                                    dbName.toLowerCase() === 'local storage');
    
    const isSessionStorageFromProps = dbName && 
                                     (dbName.toLowerCase() === 'sessionstorage' || 
                                      dbName.toLowerCase() === 'session storage');

    // 모든 출처를 종합적으로 판단
    if (isFromLocalStorageKeyword || hasLocalStorageDataHint || isLocalStorageFromStorage || isLocalStorageFromProps) {
      const cardName = getCardName();
      return `Local Storage: ${cardName}`;
    }
    
    if (isFromSessionStorageKeyword || hasSessionStorageDataHint || isSessionStorageFromStorage || isSessionStorageFromProps) {
      const cardName = getCardName();
      return `sessionStorage: ${cardName}`;
    }
    
    // 5. 그 외의 경우 dbName을 우선적으로 사용
    if (dbName) {
      return dbName;
    }
    
    // 6. employerStorage에서 db_name 가져오기
    try {
      const employerInfo = sessionStorage.getItem('employerStorage');
      if (employerInfo) {
        const parsedEmployerInfo = JSON.parse(employerInfo);
        if (parsedEmployerInfo.db_name) {
          return parsedEmployerInfo.db_name;
        }
      }
    } catch (error) {
      console.error('[DataTable] employerStorage 파싱 실패:', error);
    }
    
    // 7. lastUsedDbName 사용
    const lastUsedDbName = sessionStorage.getItem('lastUsedDbName');
    if (lastUsedDbName) {
      return lastUsedDbName;
    }
    
    // 8. 기본값
    return 'Database';
  }, [tableName, data, dbName]);

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
              {getDataSourceInfo()}
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
                        onCheckedChange={(checked) => handleSelectRow(item.id, !!checked)}
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
                                  // 중요: 원본 데이터 그대로 저장 (필드 이름이 다양할 수 있음)
                                  // Baller의 경우 excel_baller_index, excelBallerIndex 등의 필드,
                                  // Currency의 경우 excel_item_index 등의 필드가 있을 수 있음
                                  sessionStorage.setItem('selectedCurrency', JSON.stringify(selectedItem));
                                  sessionStorage.setItem('selectedCurrencies', JSON.stringify([selectedItem]));
                                  
                                  console.log('[DataTable] Delete 선택: 단일 항목 저장됨', {
                                    id: selectedItem.id,
                                    // 디버깅: 관련 필드 로깅
                                    excel_item_index: selectedItem.excel_item_index,
                                    excelBallerIndex: selectedItem.excelBallerIndex,
                                    excel_baller_index: selectedItem.excel_baller_index
                                  });
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
            {getDataSourceInfo()}
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