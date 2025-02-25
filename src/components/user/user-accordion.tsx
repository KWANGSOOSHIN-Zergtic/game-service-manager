import React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { DynamicTabs } from '@/components/ui/dynamic-tabs';
import { userTabsStructure } from '@/data/user-tabs-structure';
import { TableData } from '@/components/ui/data-table';

interface SelectedUserInfo {
  user: TableData;
  dbName: string;
}

interface UserAccordionProps {
  selectedUsers: SelectedUserInfo[];
  onRemoveUser: (uid: string) => void;
}

export function UserAccordion({ selectedUsers, onRemoveUser }: UserAccordionProps) {
  const handleOpenPopup = (userInfo: SelectedUserInfo) => {
    // 사용자 정보를 sessionStorage에 저장
    sessionStorage.setItem('popupUserInfo', JSON.stringify(userInfo));
    
    // 새 창 열기
    // 크기 및 위치 옵션 설정
    const width = 1000;
    const height = 800;
    const left = (window.screen.width - width) / 2;
    const top = (window.screen.height - height) / 2;
    
    const popup = window.open(
      `/user-details?uid=${encodeURIComponent(String(userInfo.user.uid))}&dbName=${encodeURIComponent(userInfo.dbName)}`, 
      `userDetails_${userInfo.user.uid}`,
      `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes,status=yes`
    );
    
    // 팝업 창에 포커스
    if (popup) {
      popup.focus();
    }
  };

  return (
    <>
      <Accordion type="multiple" className="w-full space-y-2">
        {selectedUsers.map((userInfo, index) => (
          <AccordionItem 
            key={String(userInfo.user.uid)} 
            value={String(userInfo.user.uid)}
            className="border rounded-none first:rounded-t-lg last:rounded-b-lg bg-white overflow-hidden"
          >
            <AccordionTrigger 
              className="bg-purple-400 hover:bg-purple-600 px-4 py-3 [&[data-state=open]]:bg-purple-700 transition-colors [&>svg]:text-white [&>svg]:stroke-[3] [&>svg]:h-4 [&>svg]:w-4"
            >
              <div className="flex items-center gap-4">
                <span className="text-sm font-bold text-white">#{index + 1}</span>
                <span className="text-sm text-white">[ {userInfo.dbName} ]</span>
                <span className="text-sm font-bold text-white">&gt;</span>
                <span className="text-sm font-bold text-white">{String(userInfo.user.nickname || userInfo.user.login_id)}</span>
                <span className="text-sm text-white/80">( uid : {String(userInfo.user.uid)} )</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="border-t">
              <div className="p-4 bg-gray-50/50">
                <div className="rounded-md border border-gray-200 overflow-hidden">
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
                        <TableCell className="py-3 text-center border-r border-gray-200">{String(userInfo.user.uid)}</TableCell>
                        <TableCell className="py-3 text-center border-r border-gray-200">{String(userInfo.user.uuid)}</TableCell>
                        <TableCell className="py-3 text-center border-r border-gray-200">{String(userInfo.user.login_id)}</TableCell>
                        <TableCell className="py-3 text-center border-r border-gray-200">{String(userInfo.user.display_id)}</TableCell>
                        <TableCell className="py-3 text-center border-r border-gray-200">
                          <div className="flex justify-center">
                            <span className="text-purple-600 font-medium bg-purple-50 px-3 py-1 rounded-full">
                              {String(userInfo.user.nickname)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="py-3 text-center border-r border-gray-200">{String(userInfo.user.role)}</TableCell>
                        <TableCell className="py-3 text-center border-r border-gray-200">{String(userInfo.user.nation_index)}</TableCell>
                        <TableCell className="py-3 text-center border-r border-gray-200">{String(userInfo.user.create_at)}</TableCell>
                        <TableCell className="py-3 text-center border-r border-gray-200">{String(userInfo.user.update_at)}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
                <div className="flex flex-col gap-2 mt-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Button
                      variant="default"
                      size="sm"
                      className="bg-blue-500 hover:bg-blue-600 text-white font-bold text-xs h-6 px-2"
                    >
                      Filter
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      className="bg-green-500 hover:bg-green-600 text-white font-bold text-xs h-6 px-2"
                      onClick={() => handleOpenPopup(userInfo)}
                    >
                      PopUp
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="bg-red-500 hover:bg-red-600 text-white font-bold text-xs h-6 px-2"
                      onClick={() => onRemoveUser(String(userInfo.user.uid))}
                    >
                      Remove
                    </Button>
                  </div>
                  <DynamicTabs 
                    items={userTabsStructure.tabs} 
                    className="w-full"
                    triggerClassName="data-[state=active]:bg-purple-400 data-[state=active]:text-white h-8 rounded-none font-bold text-sm"
                    contentClassName="mt-0"
                    equalTabs={true}
                  />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </>
  );
} 