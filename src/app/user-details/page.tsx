"use client"

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DynamicTabs } from '@/components/ui/dynamic-tabs';
import { userTabsStructure } from '@/data/user-tabs-structure';
import { TableData } from '@/components/ui/data-table';
import { getTabState, saveTabState } from '@/lib/tab-state';
import { Button } from "@/components/ui/button";

interface SelectedUserInfo {
  user: TableData;
  dbName: string;
}

export default function UserDetailsPage() {
  const [userInfo, setUserInfo] = useState<SelectedUserInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string | undefined>(undefined);
  
  // 컴포넌트 마운트 시 사용자 정보 로드
  useEffect(() => {
    const loadUserInfo = () => {
      try {
        setIsLoading(true);
        // sessionStorage에서 사용자 정보 가져오기
        const storedInfo = sessionStorage.getItem('popupUserInfo');
        if (storedInfo) {
          const parsedInfo = JSON.parse(storedInfo);
          setUserInfo(parsedInfo);
          
          // 저장된 탭 상태 불러오기
          const savedTabState = getTabState(String(parsedInfo.user.uid));
          if (savedTabState) {
            setActiveTab(savedTabState);
          }
          
          // 페이지 타이틀 설정
          const nickname = parsedInfo.user.nickname || parsedInfo.user.login_id;
          document.title = `사용자 정보: ${nickname} (${parsedInfo.user.uid})`;
        }
      } catch (error) {
        console.error('사용자 정보 로드 중 오류:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadUserInfo();
    
    // 창이 닫힐 때 이벤트
    const handleBeforeUnload = () => {
      // 필요한 정리 작업 수행
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);
  
  // 탭 변경 핸들러
  const handleTabChange = (tabId: string) => {
    if (userInfo) {
      saveTabState(String(userInfo.user.uid), tabId);
      setActiveTab(tabId);
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="text-lg font-medium text-gray-500">사용자 정보 로딩 중...</div>
      </div>
    );
  }
  
  if (!userInfo) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="text-lg font-medium text-red-500">사용자 정보를 찾을 수 없습니다.</div>
      </div>
    );
  }
  
  const user = userInfo.user;
  
  return (
    <div className="p-4 overflow-auto">
      <div className="text-sm text-purple-700 font-medium mb-4 flex items-center justify-between">
        <div>
          <span className="bg-purple-100 px-3 py-1.5 rounded-full">
            {String(user.nickname || user.login_id)}
          </span>
          <span className="ml-2 text-gray-500">
            UID: {String(user.uid)} | DB: {userInfo.dbName}
          </span>
        </div>
      </div>
      
      <div className="space-y-6">
        <Card className="shadow-sm mb-6">
          <CardHeader className="py-3 bg-gray-50">
            <div className="flex justify-between items-center">
              <CardTitle className="text-base font-semibold text-gray-900">
                기본 정보
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  // 현재 사용자 정보를 세션에 저장하고(이미 저장되어 있음)
                  // 화폐 관리 페이지로 이동
                  window.open('/user-currency', '_blank');
                }}
              >
                재화 관리
              </Button>
            </div>
          </CardHeader>
          <Separator className="bg-gray-200" />
          <CardContent className="py-4">
            <div className="rounded-md border border-gray-200 overflow-hidden">
              <div className="max-w-full overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-purple-50/80">
                      <TableHead className="text-xs font-bold text-gray-600 h-10 py-2 border-r border-gray-200 text-center">UID</TableHead>
                      <TableHead className="text-xs font-bold text-gray-600 h-10 py-2 border-r border-gray-200 text-center">UUID</TableHead>
                      <TableHead className="text-xs font-bold text-gray-600 h-10 py-2 border-r border-gray-200 text-center">Login ID</TableHead>
                      <TableHead className="text-xs font-bold text-gray-600 h-10 py-2 border-r border-gray-200 text-center">Display ID</TableHead>
                      <TableHead className="text-xs font-bold text-gray-600 h-10 py-2 border-r border-gray-200 text-center">Nickname</TableHead>
                      <TableHead className="text-xs font-bold text-gray-600 h-10 py-2 border-r border-gray-200 text-center">Role</TableHead>
                      <TableHead className="text-xs font-bold text-gray-600 h-10 py-2 border-r border-gray-200 text-center">Nation Index</TableHead>
                      <TableHead className="text-xs font-bold text-gray-600 h-10 py-2 border-r border-gray-200 text-center">Created At</TableHead>
                      <TableHead className="text-xs font-bold text-gray-600 h-10 py-2 border-r border-gray-200 text-center">Updated At</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow className="hover:bg-purple-50/30">
                      <TableCell className="py-3 text-center border-r border-gray-200">{String(user.uid)}</TableCell>
                      <TableCell className="py-3 text-center border-r border-gray-200">{String(user.uuid)}</TableCell>
                      <TableCell className="py-3 text-center border-r border-gray-200">{String(user.login_id)}</TableCell>
                      <TableCell className="py-3 text-center border-r border-gray-200">{String(user.display_id)}</TableCell>
                      <TableCell className="py-3 text-center border-r border-gray-200">
                        <div className="flex justify-center">
                          <span className="text-purple-600 font-medium bg-purple-50 px-3 py-1 rounded-full">
                            {String(user.nickname)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="py-3 text-center border-r border-gray-200">{String(user.role)}</TableCell>
                      <TableCell className="py-3 text-center border-r border-gray-200">{String(user.nation_index)}</TableCell>
                      <TableCell className="py-3 text-center border-r border-gray-200">{String(user.create_at)}</TableCell>
                      <TableCell className="py-3 text-center border-r border-gray-200">{String(user.update_at)}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm">
          <CardHeader className="py-3 bg-gray-50">
            <CardTitle className="text-base font-semibold text-gray-900">
              상세 정보
            </CardTitle>
          </CardHeader>
          <Separator className="bg-gray-200" />
          <CardContent className="py-4">
            <DynamicTabs
              items={userTabsStructure.tabs}
              className="w-full"
              triggerClassName="data-[state=active]:bg-purple-400 data-[state=active]:text-white h-8 rounded-none font-bold text-sm"
              contentClassName="mt-0"
              equalTabs={true}
              defaultValue={activeTab}
              onValueChange={handleTabChange}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 