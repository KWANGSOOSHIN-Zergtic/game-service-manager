'use client';

import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { testConnection } from '@/utils/database';
import { DataTable, TableData } from '@/components/ui/data-table';
import { PageContainer } from "@/components/layout/page-container"
import { ResultAlert, type ResultData } from "@/components/ui/result-alert"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { paymentVoucherData } from "@/test-data/test-data-table";
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

export default function DbTestBoardPage() {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({});
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ResultData>({ status: null, message: '' });
  const [data, setData] = useState<TableData[]>([]);

  const handleTestConnection = async () => {
    setIsLoading(true);
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
    } finally {
      setIsLoading(false);
    }
  };

  // 데이터 로딩 시뮬레이션
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        // 실제 API 호출을 시뮬레이션하기 위한 지연
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // 테스트 데이터 설정
        setData(paymentVoucherData);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

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
    <PageContainer path="test/db-test-board">
      <div className="flex flex-col gap-4">
        <Button 
          className="bg-green-500 hover:bg-green-600 w-full font-bold"
          onClick={handleTestConnection} 
          disabled={isLoading}
        >
          <Plus className="w-4 h-4 mr-2 " />
          {isLoading ? "연결 테스트 중..." : "데이터베이스 연결 테스트"}
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
                <CardTitle className="text-lg font-semibold text-gray-900">Database Table List</CardTitle>
              </CardHeader>
              <Separator className="bg-gray-200" />
              <CardContent className="py-6">
                <DataTable
                  tableName="Payment Voucher"
                  data={data}
                  isLoading={isLoading}
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