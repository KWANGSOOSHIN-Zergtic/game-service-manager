'use client';

import { useState } from 'react';
import { useDBQuery } from '@/hooks/useDBQuery';
import { useUserSearch } from '@/hooks/useUserSearch';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { ResultAlert } from "@/components/ui/result-alert";
import { DataTable } from '@/components/ui/data-table';

export default function UserSearchPage() {
  const [selectedDB, setSelectedDB] = useState<string>('');
  const [userId, setUserId] = useState<string>('');
  const { connectResult, tableData, isLoading, connectDB } = useDBQuery();
  const { queryResult: userSearchResult, userInfo, isLoading: isSearching, searchUser } = useUserSearch();

  const handleConnectDB = async () => {
    if (!selectedDB) return;
    await connectDB(selectedDB);
  };

  const handleSearch = async () => {
    if (!selectedDB || !userId) return;
    await searchUser(selectedDB, userId);
  };

  const userInfoData = userInfo ? [{ id: 1, ...userInfo }] : [];

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
                  {tableData.map((item) => (
                    <SelectItem key={item.id} value={String(item.name)}>
                      {String(item.name)}
                    </SelectItem>
                  ))}
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

      {connectResult.status === 'success' && (
        <Card>
          <CardHeader className="py-4 bg-gray-50">
            <CardTitle className="text-lg font-semibold text-gray-900">
              사용자 검색
            </CardTitle>
          </CardHeader>
          <Separator className="bg-gray-200" />
          <CardContent className="py-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-2">
                <label className="text-sm font-medium font-bold">사용자 ID</label>
                <Input
                  placeholder="사용자 ID를 입력하세요"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium font-bold opacity-0">Action</label>
                <Button
                  className="bg-green-500 hover:bg-green-600 w-full"
                  disabled={!userId || isSearching}
                  onClick={handleSearch}
                >
                  {isSearching ? '검색 중...' : '사용자 검색'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <ResultAlert
        result={userSearchResult}
        successTitle="사용자 검색 성공"
        errorTitle="사용자 검색 실패"
      />

      {userInfo && (
        <Card>
          <CardHeader className="py-4 bg-gray-50">
            <CardTitle className="text-lg font-semibold text-gray-900">
              사용자 정보
            </CardTitle>
          </CardHeader>
          <Separator className="bg-gray-200" />
          <CardContent className="py-6">
            <DataTable
              tableName="User Information"
              data={userInfoData}
              isLoading={isSearching}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
} 