'use client';

import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { DBConnection, fetchDBList } from '@/utils/database';
import { DataTable, TableData } from '@/components/ui/data-table';
import { PageContainer } from "@/components/layout/page-container"
import { ResultAlert, type ResultData } from "@/components/ui/result-alert"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Plus } from "lucide-react";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"

interface ConnectionStatus {
  success?: boolean;
  message?: string;
  error?: string;
  dbInfo?: {
    host?: string;
    database?: string;
  };
}

interface DBListResponse {
  name: string;
  [key: string]: string | number | null | object;
}

interface TableListResponse {
  table_name: string;
  table_schema: string;
}

export default function DbListLoadPage() {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(false);
  const [result, setResult] = useState<ResultData>({ status: null, message: '' });
  const [connectResult, setConnectResult] = useState<ResultData>({ status: null, message: '' });
  const [data, setData] = useState<TableData[]>([]);
  const [selectedDB, setSelectedDB] = useState<string>('');
  const [tableData, setTableData] = useState<TableData[]>([]);
  const [isTableLoading, setIsTableLoading] = useState(false);

  // 데이터 로딩 함수
  const loadData = async () => {
    setIsDataLoading(true);
    try {
      const responseData = await fetchDBList({
        retryCount: 3,
        timeout: 5000
      });
      
      if (responseData.success && Array.isArray(responseData.tables)) {
        // API 응답 데이터를 TableData 형식으로 변환
        const formattedData: TableData[] = responseData.tables.map((table: DBListResponse, index: number) => ({
          id: index + 1,
          ...table
        }));
        setData(formattedData);
      } else {
        throw new Error(responseData.error || '데이터를 불러오는데 실패했습니다.');
      }
    } catch (error) {
      console.error('Error loading data:', error);
      setResult({
        status: 'error',
        message: '데이터 로딩 중 오류가 발생했습니다.',
        error: error instanceof Error ? error.message : '알 수 없는 오류'
      });
      setData([]);
    } finally {
      setIsDataLoading(false);
    }
  };

  const handleDBConnection = async () => {
    setIsLoading(true);
    setData([]); // DB 연결 시 기존 데이터 초기화
    try {
      const response = await DBConnection({
        retryCount: 3,
        timeout: 5000
      });
      setConnectionStatus(response);
      
      const dbInfoText = response.dbInfo 
        ? `[${response.dbInfo.host} - ${response.dbInfo.database}]`
        : '';

      setResult({
        status: response.success ? 'success' : 'error',
        message: dbInfoText ? `${dbInfoText} > ${response.message}` : response.message,
        error: response.error
      });

      // DB 연결 성공 시 데이터 로드
      if (response.success) {
        await loadData();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateNew = () => {
    console.log('Create new item clicked');
  };

  const handleRowClick = (item: TableData) => {
    console.log('Row clicked:', item);
  };

  const handleSelectionChange = (selectedItems: TableData[]) => {
    console.log('Selection changed:', selectedItems);
  };

  const handleSort = (key: string, direction: 'asc' | 'desc' | null) => {
    console.log('Sort:', key, direction);
  };

  const handlePageChange = (page: number) => {
    console.log('Page changed:', page);
  };

  const handleConnectDB = async () => {
    if (!selectedDB) return;

    try {
      // DB 연결 시도
      const response = await fetch(`/api/db-connection?dbName=${selectedDB}`, {
        method: 'GET',
      });
      
      const result = await response.json();
      
      setConnectResult({
        status: result.success ? 'success' : 'error',
        message: result.message,
        error: result.error
      });

      // DB 연결 성공 시 테이블 목록 조회
      if (result.success) {
        setIsTableLoading(true);
        try {
          const tableResponse = await fetch(`/api/db-query?dbName=${selectedDB}`);
          const tableResult = await tableResponse.json();

          if (tableResult.success) {
            const formattedTableData: TableData[] = tableResult.tables.map((table: TableListResponse, index: number) => ({
              id: index + 1,
              ...table
            }));
            setTableData(formattedTableData);
          } else {
            throw new Error(tableResult.error);
          }
        } catch (error) {
          setConnectResult({
            status: 'error',
            message: '테이블 목록 조회 중 오류가 발생했습니다.',
            error: error instanceof Error ? error.message : '알 수 없는 오류'
          });
        } finally {
          setIsTableLoading(false);
        }
      }
    } catch (error) {
      setConnectResult({
        status: 'error',
        message: 'DB 연결 중 오류가 발생했습니다.',
        error: error instanceof Error ? error.message : '알 수 없는 오류'
      });
    }
  };

  return (
    <PageContainer path="test/db-list-load">
      <div className="flex flex-col gap-4">
        <Button 
          className="bg-green-500 hover:bg-green-600 w-full font-bold"
          onClick={handleDBConnection} 
          disabled={isLoading || isDataLoading}
        >
          <Plus className="w-4 h-4 mr-2" />
          {isLoading ? "DB 연결 중..." : 
           isDataLoading ? "데이터 로딩 중..." : 
           "DB List Load"}
        </Button>

        <ResultAlert 
          result={result}
          successTitle="Service DB 연결 성공"
          errorTitle="Service DB 연결 실패"
        />

        {connectionStatus.success && (
          <div className="mt-6">
            <Card>
              <CardHeader className="py-4 bg-gray-50">
                <CardTitle className="text-lg font-semibold text-gray-900">
                  DB Collection
                </CardTitle>
              </CardHeader>
              <Separator className="bg-gray-200" />
              <CardContent className="py-6">
                <DataTable
                  tableName="DB Collection List"
                  data={data}
                  isLoading={isDataLoading}
                  onCreateNew={handleCreateNew}
                  onRowClick={handleRowClick}
                  onSelectionChange={handleSelectionChange}
                  onSort={handleSort}
                  onPageChange={handlePageChange}
                />
              </CardContent>
            </Card>
          </div>
        )}

        <Card>
          <CardHeader className="py-4 bg-gray-50">
            <CardTitle className="text-lg font-semibold text-gray-900">Connect DB</CardTitle>
          </CardHeader>
          <Separator className="bg-gray-200" />
          <CardContent className="py-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-2">
                <label className="text-sm font-midium font-bold">DB Collection</label>
                <Select value={selectedDB} onValueChange={setSelectedDB}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Connect DB" />
                  </SelectTrigger>
                  <SelectContent>
                    {data.map((item: TableData) => (
                      <SelectItem key={item.id} value={String(item.name)}>
                        {String(item.name)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>              
              <div className="space-y-2">
                <label className="text-sm font-midium font-bold opacity-0">Action</label>
                <Button 
                  className="bg-green-500 hover:bg-green-600 w-full" 
                  disabled={!selectedDB}
                  onClick={handleConnectDB}
                >
                  Connect DB
                </Button>
              </div>
            </div>
          </CardContent>
          <Separator className="bg-gray-200" />
        </Card>

        <ResultAlert 
          result={connectResult}
          successTitle={`${selectedDB || 'DB'} 연결 성공`}
          errorTitle={`${selectedDB || 'DB'} 연결 실패`}
        />

        <Card>
          <CardHeader className="py-4 bg-gray-50">
            <CardTitle className="text-lg font-semibold text-gray-900">
              DB Table List
            </CardTitle>
          </CardHeader>
          <Separator className="bg-gray-200" />
          <CardContent className="py-6">
            <DataTable
              tableName="DB Table List"
              data={tableData}
              isLoading={isTableLoading}
              onCreateNew={handleCreateNew}
              onRowClick={handleRowClick}
              onSelectionChange={handleSelectionChange}
              onSort={handleSort}
              onPageChange={handlePageChange}
            />
          </CardContent>
        </Card>

      </div>
    </PageContainer>
  );
} 