"use client"

import { useEffect, useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { DataTable, TableData } from "@/components/ui/data-table"
import { PageContainer } from "@/components/layout/page-container"
import { ResultAlert, ResultData } from "@/components/ui/result-alert"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { 
  Database, 
  Table, 
  FileSpreadsheet, 
  Search, 
  Eye, 
  Filter,
  Trash2,
  MoreVertical
} from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// 목 데이터 가져오기
import { 
  mockDatabases, 
  mockTables,
  searchTables, 
  getTableColumns, 
  getTableData 
} from '@/test/test-data/db-tables-mock-data'

// 타입 가져오기
import { 
  TableInfo, 
  Column, 
  TableRow
} from '@/types/service.types'

export default function ServicePage() {
  const [dbData, setDbData] = useState<TableData[]>([])
  const [tableData, setTableData] = useState<TableInfo[]>([])
  const [isLoadingDb, setIsLoadingDb] = useState(true)
  const [isLoadingTables, setIsLoadingTables] = useState(false)
  const [selectedDB, setSelectedDB] = useState<string>("")
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [columns, setColumns] = useState<Column[]>([])
  const [tableRows, setTableRows] = useState<TableRow[]>([])
  const [onlyExcelTables, setOnlyExcelTables] = useState<boolean>(false)
  const [matchType, setMatchType] = useState<string>("contains")
  const [searchResult, setSearchResult] = useState<ResultData>({ 
    status: null,
    message: ""
  })
  const [isTablePopoverOpen, setIsTablePopoverOpen] = useState(false)
  const [checkedTables, setCheckedTables] = useState<TableInfo[]>([]) // 체크된 테이블 목록
  const [checkedTableData, setCheckedTableData] = useState<{
    [key: string]: {
      columns: Column[];
      rows: TableRow[];
    }
  }>({}); // 체크된 테이블 데이터

  useEffect(() => {
    // 목 데이터를 사용하여 DB 리스트 설정
    const loadInitialData = () => {
      try {
        // 목 데이터 사용
        const formattedData: TableData[] = mockDatabases.map((dbUnit, index) => ({
          id: dbUnit.index,
          displayIndex: index + 1,
          index: dbUnit.index,
          name: dbUnit.name,
          description: dbUnit.description
        }))
        setDbData(formattedData)
        
        // localStorage에서 저장된 DB 이름 가져오기
        const savedDBName = localStorage.getItem('serviceSearchDBName')
        if (savedDBName) {
          console.log('[Service] 저장된 DB 이름 불러옴 (localStorage):', savedDBName)
          setSelectedDB(savedDBName)
        }
      } catch (error) {
        console.error('DB 리스트 초기화 실패:', error)
      } finally {
        setIsLoadingDb(false)
      }
    }

    loadInitialData()
  }, [])

  const handleRowClick = useCallback((row: TableData) => {
    console.log('Selected row:', row)
  }, [])

  // DB 리스트 선택 처리
  const handleDBListSelectionChange = useCallback(() => {
    // DB 리스트는 선택 처리하지 않음
  }, []);

  const handleSort = useCallback((key: string, direction: 'asc' | 'desc' | null) => {
    console.log('Sort changed:', { key, direction })
  }, [])

  const handlePageChange = useCallback((page: number) => {
    console.log('Page changed:', page)
  }, [])

  const toggleExcelTablesOnly = useCallback(() => {
    setOnlyExcelTables(!onlyExcelTables)
    // 토글 변경 시 검색 쿼리 자동 설정
    if (!onlyExcelTables) {
      setSearchQuery("excel_")
      setMatchType("prefix")
    } else {
      setSearchQuery("")
      setMatchType("contains")
    }
  }, [onlyExcelTables])

  const handleTableSelect = useCallback((tableName: string) => {
    setSearchQuery(tableName);
    setIsTablePopoverOpen(false);
    // 테이블 이름 선택 시 자동으로 단어검색 모드로 변경
    setMatchType("contains");
    // onlyExcelTables가 true인 경우 false로 변경
    if (onlyExcelTables) {
      setOnlyExcelTables(false);
    }
  }, [onlyExcelTables]);

  // 현재 선택된 DB의 테이블 목록 가져오기
  const getAvailableTables = useCallback(() => {
    if (!selectedDB || !mockTables[selectedDB]) {
      return [];
    }
    return mockTables[selectedDB];
  }, [selectedDB]);

  // DB 테이블 검색 함수 (목 데이터 사용)
  const handleSearch = useCallback(async () => {
    if (!selectedDB) {
      return;
    }

    // 검색어 공백 제거
    const trimmedQuery = searchQuery.trim();
    const finalQuery = onlyExcelTables ? "excel_" : trimmedQuery;

    try {
      setIsLoadingTables(true);
      setTableData([]); // 검색 시도 시 기존 결과 초기화
      
      // 실제 API 호출 대신 목 데이터에서 검색
      setTimeout(() => {
        const tables = searchTables(selectedDB, finalQuery, matchType);
        
        if (tables.length > 0) {
          setTableData(tables);
          setSearchResult({
            status: 'success',
            message: `${tables.length}개의 테이블을 찾았습니다.`
          });
        } else {
          setTableData([]);
          setSearchResult({
            status: 'success',
            message: '테이블이 없거나 검색 조건에 일치하는 테이블이 없습니다.'
          });
        }
        setIsLoadingTables(false);
      }, 500); // 0.5초 지연으로 로딩 효과 추가
      
    } catch (error) {
      console.error('테이블 검색 중 오류:', error);
      setSearchResult({
        status: 'error',
        message: '테이블 검색 중 오류가 발생했습니다.',
        error: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.'
      });
      setIsLoadingTables(false);
    }
  }, [selectedDB, searchQuery, onlyExcelTables, matchType]);

  const handleDBChange = useCallback((value: string) => {
    setSelectedDB(value)
    setTableData([])
    setSearchResult({ status: null, message: "" })
    
    // DB 이름을 localStorage에 저장
    localStorage.setItem('serviceSearchDBName', value)
    console.log('[Service] DB 이름 저장됨 (localStorage):', value)
  }, [])

  const handleViewTableData = useCallback((table: TableInfo | TableData) => {
    // TableInfo 타입으로 변환
    const tableInfo = 'table_name' in table 
      ? table as TableInfo 
      : null;
    
    if (!tableInfo || !selectedDB) return;
    
    console.log(`테이블 데이터 조회: ${selectedDB}.${tableInfo.table_name}`);
    
    // 목 데이터에서 테이블 컬럼 정보 조회
    const columnData = getTableColumns(tableInfo.table_name);
    setColumns(columnData.length > 0 ? columnData : [
      { column_name: 'id', data_type: 'integer', is_nullable: 'NO' },
      { column_name: 'name', data_type: 'character varying', is_nullable: 'NO' },
      { column_name: 'description', data_type: 'text', is_nullable: 'YES' },
      { column_name: 'created_at', data_type: 'timestamp', is_nullable: 'NO' },
      { column_name: 'updated_at', data_type: 'timestamp', is_nullable: 'YES' }
    ]);
    
    // 목 데이터에서 테이블 데이터 조회
    const rowData = getTableData(tableInfo.table_name);
    setTableRows(rowData.length > 0 ? rowData : [
      { id: 1, name: 'Item 1', description: 'Description for item 1', created_at: '2023-01-01', updated_at: '2023-01-02' },
      { id: 2, name: 'Item 2', description: 'Description for item 2', created_at: '2023-01-03', updated_at: '2023-01-04' },
      { id: 3, name: 'Item 3', description: 'Description for item 3', created_at: '2023-01-05', updated_at: '2023-01-06' }
    ]);
  }, [selectedDB]);

  // 테이블 체크박스 토글 처리
  const handleTableCheckToggle = useCallback((table: TableInfo, isChecked: boolean) => {
    if (isChecked) {
      // 체크된 테이블 목록에 추가
      setCheckedTables(prev => [...prev, table]);
      
      // 테이블 데이터 로드
      const columns = getTableColumns(table.table_name);
      const rows = getTableData(table.table_name);
      
      setCheckedTableData(prev => ({
        ...prev,
        [table.table_name]: {
          columns: columns.length > 0 ? columns : [
            { column_name: 'id', data_type: 'integer', is_nullable: 'NO' },
            { column_name: 'name', data_type: 'character varying', is_nullable: 'NO' },
            { column_name: 'description', data_type: 'text', is_nullable: 'YES' }
          ],
          rows: rows.length > 0 ? rows : [
            { id: 1, name: 'Sample 1', description: 'Sample description 1' },
            { id: 2, name: 'Sample 2', description: 'Sample description 2' }
          ]
        }
      }));
    } else {
      // 체크된 테이블 목록에서 제거
      setCheckedTables(prev => prev.filter(t => t.table_name !== table.table_name));
      
      // 테이블 데이터도 제거
      setCheckedTableData(prev => {
        const newData = { ...prev };
        delete newData[table.table_name];
        return newData;
      });
    }
  }, []);

  // 테이블이 체크되었는지 확인
  const isTableChecked = useCallback((tableName: string) => {
    return checkedTables.some(table => table.table_name === tableName);
  }, [checkedTables]);

  return (
    <PageContainer path="service">
      <div className="flex flex-col gap-4">
        <Card>
          <CardHeader className="py-4 bg-gray-50">
            <CardTitle className="text-lg font-semibold text-gray-900">
              <div className="flex justify-between items-center">
                <span>DB List</span>
                <Badge variant="secondary" className="ml-2">
                  {dbData.length} Databases
                </Badge>
              </div>
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
              <div className="flex flex-wrap items-center gap-2">
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
                        <SelectItem key={dbUnit.id} value={String(dbUnit.name)}>
                          {String(dbUnit.name)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-blue-400" />
                  <Input
                    type="text"
                    placeholder="테이블 이름 검색..."
                    className="pl-8 pr-10 w-full bg-blue-50/50 border-blue-100 text-blue-900 placeholder:text-blue-400"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onBlur={(e) => setSearchQuery(e.target.value.trim())}
                    disabled={onlyExcelTables}
                  />
                  <Popover open={isTablePopoverOpen} onOpenChange={setIsTablePopoverOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 top-1 h-8 w-8 p-0 text-blue-400 hover:bg-blue-100 hover:text-blue-600"
                        disabled={!selectedDB}
                      >
                        <Table className="h-4 w-4" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-72 p-0 max-h-72 overflow-auto">
                      <div className="p-2 bg-blue-50">
                        <h4 className="font-medium text-sm text-blue-700">테이블 목록 ({selectedDB})</h4>
                      </div>
                      {getAvailableTables().length > 0 ? (
                        <div className="py-1">
                          {getAvailableTables().map((table) => (
                            <Button
                              key={table.id}
                              variant="ghost"
                              className="w-full justify-start px-2 py-1.5 text-left text-sm hover:bg-blue-50"
                              onClick={() => handleTableSelect(table.table_name)}
                            >
                              <div className="flex items-center gap-2">
                                <Table className="h-3.5 w-3.5 text-blue-500" />
                                <span className="truncate">{table.table_name}</span>
                              </div>
                            </Button>
                          ))}
                        </div>
                      ) : (
                        <div className="p-4 text-center text-sm text-gray-500">
                          사용 가능한 테이블이 없습니다
                        </div>
                      )}
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="w-[150px]">
                  <Select 
                    value={matchType}
                    onValueChange={setMatchType}
                    disabled={onlyExcelTables}
                  >
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="검색 방식" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="prefix">접두어 (Prefix)</SelectItem>
                      <SelectItem value="suffix">접미어 (Suffix)</SelectItem>
                      <SelectItem value="contains">단어검색 (Contains)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button  
                  className="w-[150px] bg-blue-500 hover:bg-blue-600 text-white" 
                  disabled={!selectedDB || isLoadingTables}
                  onClick={handleSearch}
                >
                  {isLoadingTables ? 
                    <div className="flex items-center gap-2">
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                      <span>검색 중...</span>
                    </div> : 
                    <div className="flex items-center gap-2">
                      <Filter className="w-4 h-4" />
                      <span>테이블 검색</span>
                    </div>
                  }
                </Button>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch 
                  id="excel-tables-only" 
                  checked={onlyExcelTables}
                  onCheckedChange={toggleExcelTablesOnly}
                />
                <Label htmlFor="excel-tables-only" className="flex items-center gap-2">
                  <FileSpreadsheet className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium">Excel 접두어 테이블만 표시 (excel_*)</span>
                </Label>
              </div>
            </div>
          </CardContent>
        </Card>

        {searchResult.status && (
          <ResultAlert 
            result={searchResult}
            successTitle="테이블 검색 성공"
            errorTitle="테이블 검색 실패"
          />
        )}

        {tableData.length > 0 && (
          <Card>
            <CardHeader className="py-4 bg-gray-50">
              <CardTitle className="text-lg font-semibold text-gray-900">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Table className="w-5 h-5" />
                    <span>테이블 정보</span>
                  </div>
                  <Badge className="bg-blue-500">{tableData.length} Tables</Badge>
                </div>
              </CardTitle>
            </CardHeader>
            <Separator className="bg-gray-200" />
            <CardContent className="py-6">
              <div className="rounded-lg border overflow-x-auto max-h-[60vh]">
                <table className="w-full whitespace-nowrap">
                  <thead className="bg-gray-100 sticky top-0 z-10">
                    <tr>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-600 w-12">선택</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-600 min-w-[150px]">테이블명</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-600 min-w-[100px]">유형</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-600 min-w-[100px]">행 수</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-600 min-w-[100px]">크기</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-600 min-w-[150px]">최종 업데이트</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-600 sticky right-0 bg-gray-100 min-w-[150px]">작업</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tableData.map((table, index) => (
                      <tr key={table.table_name} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-4 py-2 text-sm">
                          <input 
                            type="checkbox" 
                            className="h-4 w-4 rounded border-gray-300 text-blue-600"
                            checked={isTableChecked(table.table_name)}
                            onChange={(e) => handleTableCheckToggle(table, e.target.checked)}
                          />
                        </td>
                        <td className="px-4 py-2 text-sm font-medium truncate max-w-[300px]">{table.table_name}</td>
                        <td className="px-4 py-2 text-sm truncate">{table.table_type}</td>
                        <td className="px-4 py-2 text-sm truncate">{table.rows_count?.toLocaleString() || '0'}</td>
                        <td className="px-4 py-2 text-sm truncate">{table.size || '-'}</td>
                        <td className="px-4 py-2 text-sm truncate">{table.last_updated || '-'}</td>
                        <td className="px-4 py-2 text-sm sticky right-0 bg-inherit">
                          <div className="flex justify-end">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 p-0 text-gray-500 hover:text-blue-600 hover:bg-blue-50"
                                >
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-[180px]">
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <DropdownMenuItem
                                      className="cursor-pointer flex items-center gap-2 py-2 text-blue-600 hover:bg-blue-50"
                                      onSelect={(e) => e.preventDefault()}
                                      onClick={() => handleViewTableData(table)}
                                    >
                                      <Eye className="h-4 w-4" />
                                      <span>테이블 보기</span>
                                    </DropdownMenuItem>
                                  </DialogTrigger>
                                  <DialogContent className="max-w-[90vw] w-auto max-h-[90vh] overflow-hidden">
                                    <DialogHeader>
                                      <DialogTitle>
                                        <div className="flex items-center gap-2">
                                          <Table className="h-5 w-5" />
                                          <span>{table.table_name} ({selectedDB})</span>
                                        </div>
                                      </DialogTitle>
                                      <DialogDescription>
                                        {table.rows_count?.toLocaleString() || '0'} rows, {table.size || '0 KB'}
                                      </DialogDescription>
                                    </DialogHeader>
                                    <div className="overflow-hidden">
                                      <Tabs defaultValue="data" className="w-full">
                                        <TabsList className="mb-4 w-full">
                                          <TabsTrigger value="data" className="flex-1" style={{ minWidth: '50%' }}>테이블 데이터</TabsTrigger>
                                          <TabsTrigger value="schema" className="flex-1" style={{ minWidth: '50%' }}>테이블 구조</TabsTrigger>
                                        </TabsList>
                                        
                                        <TabsContent value="schema" className="mt-0 overflow-hidden">
                                          <DataTable
                                            tableName="테이블 구조"
                                            data={columns.map((column, index) => ({
                                              id: index,
                                              displayIndex: index + 1,
                                              column_name: column.column_name,
                                              data_type: column.data_type,
                                              is_nullable: column.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'
                                            }))}
                                            isLoading={false}
                                            className="rounded-lg overflow-hidden"
                                            dbName={selectedDB}
                                            showActions={false}
                                          />
                                        </TabsContent>
                                        
                                        <TabsContent value="data" className="mt-0 overflow-hidden">
                                          <DataTable
                                            tableName="테이블 데이터"
                                            data={tableRows.map((row, index) => ({
                                              id: index,
                                              displayIndex: index + 1,
                                              ...row
                                            }))}
                                            isLoading={false}
                                            className="rounded-lg overflow-hidden"
                                            dbName={selectedDB}
                                            showActions={false}
                                          />
                                        </TabsContent>
                                      </Tabs>
                                    </div>
                                    <DialogFooter>
                                      <Button variant="outline">닫기</Button>
                                    </DialogFooter>
                                  </DialogContent>
                                </Dialog>
                                <DropdownMenuItem
                                  className="cursor-pointer flex items-center gap-2 py-2 text-red-600 hover:bg-red-50"
                                  onClick={() => handleTableCheckToggle(table, false)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                  <span>테이블 제거</span>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 선택된 테이블 데이터 표시 */}
        {checkedTables.length > 0 && (
          <Card className="mt-4">
            <CardHeader className="py-4 bg-gray-50">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg font-semibold text-gray-900">
                  <div className="flex items-center gap-2">
                    <Table className="w-5 h-5" />
                    <span>선택된 테이블 데이터</span>
                  </div>
                </CardTitle>
                <div className="text-sm text-blue-500">
                  선택된 테이블: <span className="font-bold">{checkedTables.length}</span>개
                </div>
              </div>
            </CardHeader>
            <Separator className="bg-gray-200" />
            <CardContent className="py-6">
              <Accordion type="multiple" className="w-full space-y-2">
                {checkedTables.map((table) => (
                  <AccordionItem key={table.table_name} value={table.table_name} className="border rounded-none first:rounded-t-lg last:rounded-b-lg bg-white overflow-hidden">
                    <AccordionTrigger className="bg-blue-400 hover:bg-blue-600 px-4 py-3 [&[data-state=open]]:bg-blue-700 transition-colors [&>svg]:text-white [&>svg]:stroke-[3] [&>svg]:h-4 [&>svg]:w-4">
                      <div className="flex items-center gap-4">
                        <span className="text-sm font-bold text-white">[ {selectedDB} ]</span>
                        <span className="text-sm font-bold text-white">&gt;</span>
                        <span className="text-sm font-bold text-white">{table.table_name}</span>
                        <span className="text-sm text-white/80">( {table.rows_count?.toLocaleString() || '0'} rows )</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="border-t">
                      <div className="p-4 bg-gray-50/50">
                        {checkedTableData[table.table_name] ? (
                          <div className="rounded-md border border-gray-200 overflow-x-auto max-h-[50vh]">
                            <table className="w-full whitespace-nowrap">
                              <thead className="bg-gray-100 sticky top-0 z-10">
                                <tr>
                                  {checkedTableData[table.table_name].columns.map((column) => (
                                    <th key={column.column_name} className="px-4 py-2 text-left text-sm font-medium text-gray-600 min-w-[150px] max-w-[300px]">
                                      {column.column_name}
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {checkedTableData[table.table_name].rows.slice(0, 5).map((row, rowIndex) => (
                                  <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                    {checkedTableData[table.table_name].columns.map((column) => (
                                      <td key={`${rowIndex}-${column.column_name}`} className="px-4 py-2 text-sm truncate max-w-[300px]">
                                        {row[column.column_name] !== undefined ? String(row[column.column_name]) : '-'}
                                      </td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <div className="p-4 text-center text-gray-500">데이터를 불러오는 중입니다...</div>
                        )}
                        <div className="flex justify-end mt-2">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 p-0 text-gray-500 hover:text-blue-600 hover:bg-blue-50"
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-[180px]">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <DropdownMenuItem
                                    className="cursor-pointer flex items-center gap-2 py-2 text-blue-600 hover:bg-blue-50"
                                    onSelect={(e) => e.preventDefault()}
                                    onClick={() => handleViewTableData(table)}
                                  >
                                    <Eye className="h-4 w-4" />
                                    <span>테이블 보기</span>
                                  </DropdownMenuItem>
                                </DialogTrigger>
                                <DialogContent className="max-w-[90vw] w-auto max-h-[90vh] overflow-hidden">
                                  <DialogHeader>
                                    <DialogTitle>
                                      <div className="flex items-center gap-2">
                                        <Table className="h-5 w-5" />
                                        <span>{table.table_name} ({selectedDB})</span>
                                      </div>
                                    </DialogTitle>
                                    <DialogDescription>
                                      {table.rows_count?.toLocaleString() || '0'} rows, {table.size || '0 KB'}
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="overflow-hidden">
                                    <Tabs defaultValue="data" className="w-full">
                                      <TabsList className="mb-4 w-full">
                                        <TabsTrigger value="data" className="flex-1" style={{ minWidth: '50%' }}>테이블 데이터</TabsTrigger>
                                        <TabsTrigger value="schema" className="flex-1" style={{ minWidth: '50%' }}>테이블 구조</TabsTrigger>
                                      </TabsList>
                                      
                                      <TabsContent value="schema" className="mt-0 overflow-hidden">
                                        <DataTable
                                          tableName="테이블 구조"
                                          data={checkedTableData[table.table_name].columns.map((column, index) => ({
                                            id: index,
                                            displayIndex: index + 1,
                                            column_name: column.column_name,
                                            data_type: column.data_type,
                                            is_nullable: column.is_nullable || 'NULL'
                                          }))}
                                          isLoading={false}
                                          className="rounded-lg overflow-hidden"
                                          dbName={selectedDB}
                                          showActions={false}
                                        />
                                      </TabsContent>
                                      
                                      <TabsContent value="data" className="mt-0 overflow-hidden">
                                        <DataTable
                                          tableName="테이블 데이터"
                                          data={checkedTableData[table.table_name].rows.map((row, index) => ({
                                            id: index,
                                            displayIndex: index + 1,
                                            ...row
                                          }))}
                                          isLoading={false}
                                          className="rounded-lg overflow-hidden"
                                          dbName={selectedDB}
                                          showActions={false}
                                        />
                                      </TabsContent>
                                    </Tabs>
                                  </div>
                                  <DialogFooter>
                                    <Button variant="outline">닫기</Button>
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>
                              <DropdownMenuItem
                                className="cursor-pointer flex items-center gap-2 py-2 text-red-600 hover:bg-red-50"
                                onClick={() => handleTableCheckToggle(table, false)}
                              >
                                <Trash2 className="h-4 w-4" />
                                <span>테이블 제거</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        )}
      </div>
    </PageContainer>
  )
} 