'use client';

import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { testConnection } from '@/utils/database';
import { DataTable, TableData } from '@/components/ui/data-table';
import { PageContainer } from "@/components/layout/page-container"
import { ResultAlert, type ResultData } from "@/components/ui/result-alert"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Plus } from "lucide-react";

interface ConnectionStatus {
  success?: boolean;
  message?: string;
  error?: string;
  dbInfo?: {
    host?: string;
    database?: string;
  };
}

export default function DbMonitoringPage() {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(false);
  const [result, setResult] = useState<ResultData>({ status: null, message: '' });
  const [data, setData] = useState<TableData[]>([]);

  // 데이터 로딩 함수
  const loadData = async () => {
    setIsDataLoading(true);
    try {
      const response = await fetch('/api/db-tables');
      const responseData = await response.json();
      
      if (responseData.success) {
        // API 응답 데이터를 TableData 형식으로 변환
        const formattedData: TableData[] = responseData.tables.map((table: any, index: number) => ({
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
    } finally {
      setIsDataLoading(false);
    }
  };

  const handleTestConnection = async () => {
    setIsLoading(true);
    setData([]); // 연결 테스트 시 기존 데이터 초기화
    try {
      const response = await testConnection();
      setConnectionStatus(response);
      
      const dbInfoText = response.dbInfo 
        ? `[${response.dbInfo.host} - ${response.dbInfo.database}]`
        : '';

      setResult({
        status: response.success ? 'success' : 'error',
        message: dbInfoText ? `${dbInfoText} > ${response.message}` : response.message,
        error: response.error
      });

      // 연결 성공 시 데이터 로드
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

  return (
    <PageContainer path="test/db-monitoring">
      <div className="flex flex-col gap-4">
        <Button 
          className="bg-green-500 hover:bg-green-600 w-full font-bold"
          onClick={handleTestConnection} 
          disabled={isLoading || isDataLoading}
        >
          <Plus className="w-4 h-4 mr-2" />
          {isLoading ? "연결 테스트 중..." : 
           isDataLoading ? "데이터 로딩 중..." : 
           "데이터베이스 연결 테스트"}
        </Button>

        <ResultAlert 
          result={result}
          successTitle="연결 성공"
          errorTitle="연결 실패"
        />

        {connectionStatus.success && (
          <div className="mt-6">
            <Card>
              <CardHeader className="py-4 bg-gray-50">
                <CardTitle className="text-lg font-semibold text-gray-900">
                  DbMonitoring
                </CardTitle>
              </CardHeader>
              <Separator className="bg-gray-200" />
              <CardContent className="py-6">
                <DataTable
                  tableName="Database Tables"
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
      </div>
    </PageContainer>
  );
} 