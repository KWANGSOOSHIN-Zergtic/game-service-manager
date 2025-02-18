'use client';

import { useState } from 'react';
import { useDBQuery } from '@/hooks/useDBQuery';
import { useDBTableInfo } from '@/hooks/useDBTableInfo';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { ResultAlert } from "@/components/ui/result-alert";
import { DataTable } from '@/components/ui/data-table';

export default function TableInfoPage() {
  const [selectedDB, setSelectedDB] = useState<string>('');
  const [selectedTable, setSelectedTable] = useState<string>('');
  const { connectResult, tableData, isLoading, connectDB, executeQuery } = useDBQuery();
  const { queryResult: tableInfoResult, tableInfo, isLoading: isTableInfoLoading, fetchTableInfo } = useDBTableInfo();

  const handleConnectDB = async () => {
    if (!selectedDB) return;
    await connectDB(selectedDB);
  };

  const handleFetchTableInfo = async () => {
    if (!selectedDB || !selectedTable) return;

    await executeQuery(
      selectedDB,
      () => fetchTableInfo(selectedDB, selectedTable),
      {
        onSuccess: (data) => {
          console.log('Table info loaded:', data);
        },
        onError: (error) => {
          console.error('Failed to load table info:', error);
        },
      }
    );
  };

  const tableInfoData = tableInfo.map((info, index) => ({
    id: index + 1,
    ...info,
  }));

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader className="py-4 bg-gray-50">
          <CardTitle className="text-lg font-semibold text-gray-900">
            DB 연결
          </CardTitle>
        </CardHeader>
        <Separator className="bg-gray-200" />
        <CardContent className="py-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-2">
              <label className="text-sm font-medium font-bold">DB 선택</label>
              <Select value={selectedDB} onValueChange={setSelectedDB}>
                <SelectTrigger>
                  <SelectValue placeholder="DB를 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  {/* DB 목록은 별도로 가져와야 합니다 */}
                  <SelectItem value="db1">Database 1</SelectItem>
                  <SelectItem value="db2">Database 2</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium font-bold opacity-0">Action</label>
              <Button
                className="bg-green-500 hover:bg-green-600 w-full"
                disabled={!selectedDB || isLoading}
                onClick={handleConnectDB}
              >
                {isLoading ? 'DB 연결 중...' : 'DB 연결'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <ResultAlert
        result={connectResult}
        successTitle={`${selectedDB} 연결 성공`}
        errorTitle={`${selectedDB} 연결 실패`}
      />

      {tableData.length > 0 && (
        <Card>
          <CardHeader className="py-4 bg-gray-50">
            <CardTitle className="text-lg font-semibold text-gray-900">
              테이블 정보 조회
            </CardTitle>
          </CardHeader>
          <Separator className="bg-gray-200" />
          <CardContent className="py-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-2">
                <label className="text-sm font-medium font-bold">테이블 선택</label>
                <Select value={selectedTable} onValueChange={setSelectedTable}>
                  <SelectTrigger>
                    <SelectValue placeholder="테이블을 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    {tableData.map((table) => (
                      <SelectItem key={table.id} value={table.name}>
                        {table.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium font-bold opacity-0">Action</label>
                <Button
                  className="bg-green-500 hover:bg-green-600 w-full"
                  disabled={!selectedTable || isTableInfoLoading}
                  onClick={handleFetchTableInfo}
                >
                  {isTableInfoLoading ? '테이블 정보 조회 중...' : '테이블 정보 조회'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <ResultAlert
        result={tableInfoResult}
        successTitle={`${selectedTable} 테이블 정보 조회 성공`}
        errorTitle={`${selectedTable} 테이블 정보 조회 실패`}
      />

      {tableInfo.length > 0 && (
        <Card>
          <CardHeader className="py-4 bg-gray-50">
            <CardTitle className="text-lg font-semibold text-gray-900">
              {selectedTable} 테이블 구조
            </CardTitle>
          </CardHeader>
          <Separator className="bg-gray-200" />
          <CardContent className="py-6">
            <DataTable
              tableName="Table Structure"
              data={tableInfoData}
              isLoading={isTableInfoLoading}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
} 