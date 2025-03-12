'use client';

import React, { useState } from 'react';
import { PageContainer } from "@/components/layout/page-container";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from '@/components/ui/data-table';
import { 
  mockUserData, 
  mockItemData, 
  mockCurrencyData, 
  mockGameLogData, 
  mockStatisticsData 
} from '@/test/test-data/mock-table-data';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { 
  Users, 
  Package, 
  Coins, 
  ClipboardList, 
  BarChart3,
  FileJson,
  Database 
} from 'lucide-react';
import { IUITableData } from '@/types/table.types';

export default function DataTablePage() {
  // 상태 관리
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showDataControls, setShowDataControls] = useState<boolean>(false);
  const [showAdvancedDataControls, setShowAdvancedDataControls] = useState<boolean>(false);

  // 이벤트 핸들러
  const handleToggleLoading = () => {
    setIsLoading(prev => !prev);
  };

  const handleRowClick = (item: IUITableData) => {
    console.log('Row clicked:', item);
  };

  const handleSelectionChange = (selectedItems: IUITableData[]) => {
    console.log('Selected items:', selectedItems);
  };

  const handleSort = (key: string, direction: 'asc' | 'desc' | null) => {
    console.log(`Sort by ${key} in ${direction} order`);
  };

  const handlePageChange = (page: number) => {
    console.log(`Page changed to ${page}`);
  };

  // 데이터 컨트롤 핸들러
  const handleCreateCurrency = () => {
    console.log('Create currency clicked');
  };

  const handleUpdateCurrency = () => {
    console.log('Update currency clicked');
  };

  const handleDeleteCurrency = () => {
    console.log('Delete currency clicked');
  };

  // 고급 아이템 핸들러
  const handleUseItem = () => {
    console.log('Use item clicked');
  };

  const handleGetItem = () => {
    console.log('Get item clicked');
  };

  const handleSendItem = () => {
    console.log('Send item clicked');
  };

  return (
    <PageContainer path="lab/data-table">
      <div className="py-6">
        <h1 className="text-3xl font-bold mb-6">DataTable 컴포넌트 개발 페이지</h1>
        
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>DataTable 컴포넌트 옵션</CardTitle>
            <CardDescription>다양한 설정을 조정하여 DataTable의 동작을 테스트합니다.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-center space-x-2">
                <Switch 
                  id="loading-mode" 
                  checked={isLoading} 
                  onCheckedChange={handleToggleLoading} 
                />
                <Label htmlFor="loading-mode">로딩 모드</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch 
                  id="data-controls" 
                  checked={showDataControls} 
                  onCheckedChange={setShowDataControls} 
                />
                <Label htmlFor="data-controls">데이터 컨트롤 표시</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch 
                  id="advanced-data-controls" 
                  checked={showAdvancedDataControls} 
                  onCheckedChange={setShowAdvancedDataControls} 
                />
                <Label htmlFor="advanced-data-controls">고급 데이터 컨트롤 표시</Label>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="users" className="w-full">
          <TabsList className="grid grid-cols-5 mb-8">
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>사용자</span>
            </TabsTrigger>
            <TabsTrigger value="items" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              <span>아이템</span>
            </TabsTrigger>
            <TabsTrigger value="currency" className="flex items-center gap-2">
              <Coins className="h-4 w-4" />
              <span>통화</span>
            </TabsTrigger>
            <TabsTrigger value="logs" className="flex items-center gap-2">
              <ClipboardList className="h-4 w-4" />
              <span>로그</span>
            </TabsTrigger>
            <TabsTrigger value="statistics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              <span>통계</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="mt-0">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle className="text-lg">사용자 데이터</CardTitle>
                  <CardDescription>플랫폼에 등록된 모든 사용자 목록</CardDescription>
                </div>
                <div className="flex items-center gap-1 text-xs bg-gray-100 px-2 py-0.5 rounded">
                  <Database className="h-3 w-3 text-purple-500" />
                  <span className="text-purple-500 font-medium">UserDB</span>
                </div>
              </CardHeader>
              <CardContent>
                <DataTable
                  tableName="사용자"
                  data={mockUserData}
                  isLoading={isLoading}
                  onRowClick={handleRowClick}
                  onSelectionChange={handleSelectionChange}
                  onSort={handleSort}
                  onPageChange={handlePageChange}
                  dbName="UserDB"
                  showDataControls={showDataControls}
                  onCreateCurrency={handleCreateCurrency}
                  onUpdateCurrency={handleUpdateCurrency}
                  onDeleteCurrency={handleDeleteCurrency}
                  showAdvancedDataControls={showAdvancedDataControls}
                  onUseItem={handleUseItem}
                  onGetItem={handleGetItem}
                  onSendItem={handleSendItem}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="items" className="mt-0">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle className="text-lg">아이템 데이터</CardTitle>
                  <CardDescription>게임 내 모든 아이템 목록</CardDescription>
                </div>
                <div className="flex items-center gap-1 text-xs bg-gray-100 px-2 py-0.5 rounded">
                  <Database className="h-3 w-3 text-purple-500" />
                  <span className="text-purple-500 font-medium">ItemDB</span>
                </div>
              </CardHeader>
              <CardContent>
                <DataTable
                  tableName="아이템"
                  data={mockItemData}
                  isLoading={isLoading}
                  onRowClick={handleRowClick}
                  onSelectionChange={handleSelectionChange}
                  onSort={handleSort}
                  onPageChange={handlePageChange}
                  dbName="ItemDB"
                  showDataControls={showDataControls}
                  onCreateCurrency={handleCreateCurrency}
                  onUpdateCurrency={handleUpdateCurrency}
                  onDeleteCurrency={handleDeleteCurrency}
                  showAdvancedDataControls={showAdvancedDataControls}
                  onUseItem={handleUseItem}
                  onGetItem={handleGetItem}
                  onSendItem={handleSendItem}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="currency" className="mt-0">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle className="text-lg">통화 데이터</CardTitle>
                  <CardDescription>게임 내 모든 통화 유형 목록</CardDescription>
                </div>
                <div className="flex items-center gap-1 text-xs bg-gray-100 px-2 py-0.5 rounded">
                  <Database className="h-3 w-3 text-purple-500" />
                  <span className="text-purple-500 font-medium">CurrencyDB</span>
                </div>
              </CardHeader>
              <CardContent>
                <DataTable
                  tableName="통화"
                  data={mockCurrencyData}
                  isLoading={isLoading}
                  onRowClick={handleRowClick}
                  onSelectionChange={handleSelectionChange}
                  onSort={handleSort}
                  onPageChange={handlePageChange}
                  dbName="CurrencyDB"
                  showDataControls={showDataControls}
                  onCreateCurrency={handleCreateCurrency}
                  onUpdateCurrency={handleUpdateCurrency}
                  onDeleteCurrency={handleDeleteCurrency}
                  showAdvancedDataControls={showAdvancedDataControls}
                  onUseItem={handleUseItem}
                  onGetItem={handleGetItem}
                  onSendItem={handleSendItem}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="logs" className="mt-0">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle className="text-lg">게임 로그 데이터</CardTitle>
                  <CardDescription>플레이어 활동 및 시스템 로그</CardDescription>
                </div>
                <div className="flex items-center gap-1 text-xs bg-gray-100 px-2 py-0.5 rounded">
                  <Database className="h-3 w-3 text-purple-500" />
                  <span className="text-purple-500 font-medium">LogDB</span>
                </div>
              </CardHeader>
              <CardContent>
                <DataTable
                  tableName="게임 로그"
                  data={mockGameLogData}
                  isLoading={isLoading}
                  onRowClick={handleRowClick}
                  onSelectionChange={handleSelectionChange}
                  onSort={handleSort}
                  onPageChange={handlePageChange}
                  dbName="LogDB"
                  showDataControls={showDataControls}
                  onCreateCurrency={handleCreateCurrency}
                  onUpdateCurrency={handleUpdateCurrency}
                  onDeleteCurrency={handleDeleteCurrency}
                  showAdvancedDataControls={showAdvancedDataControls}
                  onUseItem={handleUseItem}
                  onGetItem={handleGetItem}
                  onSendItem={handleSendItem}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="statistics" className="mt-0">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle className="text-lg">통계 데이터</CardTitle>
                  <CardDescription>게임 플랫폼 성능 및 사용자 행동 통계</CardDescription>
                </div>
                <div className="flex items-center gap-1 text-xs bg-gray-100 px-2 py-0.5 rounded">
                  <Database className="h-3 w-3 text-purple-500" />
                  <span className="text-purple-500 font-medium">StatsDB</span>
                </div>
              </CardHeader>
              <CardContent>
                <DataTable
                  tableName="통계"
                  data={mockStatisticsData}
                  isLoading={isLoading}
                  onRowClick={handleRowClick}
                  onSelectionChange={handleSelectionChange}
                  onSort={handleSort}
                  onPageChange={handlePageChange}
                  dbName="StatsDB"
                  showDataControls={showDataControls}
                  onCreateCurrency={handleCreateCurrency}
                  onUpdateCurrency={handleUpdateCurrency}
                  onDeleteCurrency={handleDeleteCurrency}
                  showAdvancedDataControls={showAdvancedDataControls}
                  onUseItem={handleUseItem}
                  onGetItem={handleGetItem}
                  onSendItem={handleSendItem}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Separator className="my-8" />

        <Card className="mt-8">
          <CardHeader>
            <CardTitle>컴포넌트 구현 정보</CardTitle>
            <CardDescription>DataTable 컴포넌트의 기술적 정보</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-start gap-2">
              <FileJson className="h-5 w-5 text-purple-500 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium">컴포넌트 위치</h3>
                <p className="text-sm text-muted-foreground">src/components/ui/data-table.tsx</p>
              </div>
            </div>
            
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h3 className="text-sm font-medium">주요 기능</h3>
                <ul className="list-disc list-inside text-sm text-muted-foreground">
                  <li>페이지네이션</li>
                  <li>정렬 및 필터링</li>
                  <li>열 토글 가능</li>
                  <li>검색 기능</li>
                  <li>행 선택 기능</li>
                  <li>로딩 상태 표시</li>
                </ul>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-sm font-medium">컴포넌트 의존성</h3>
                <ul className="list-disc list-inside text-sm text-muted-foreground">
                  <li>Checkbox</li>
                  <li>Table</li>
                  <li>Button</li>
                  <li>Input</li>
                  <li>Pagination</li>
                  <li>ColumnFilter</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
