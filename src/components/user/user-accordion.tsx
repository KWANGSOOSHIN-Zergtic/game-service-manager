import React, { useState } from 'react';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface SelectedUserInfo {
  user: TableData;
  dbName: string;
}

interface UserAccordionProps {
  selectedUsers: SelectedUserInfo[];
  onRemoveUser: (uid: string) => void;
}

export function UserAccordion({ selectedUsers, onRemoveUser }: UserAccordionProps) {
  const [openPopup, setOpenPopup] = useState(false);
  const [selectedPopupUser, setSelectedPopupUser] = useState<SelectedUserInfo | null>(null);

  const handleOpenPopup = (userInfo: SelectedUserInfo) => {
    setSelectedPopupUser(userInfo);
    setOpenPopup(true);
  };

  const handleClosePopup = () => {
    setOpenPopup(false);
    setSelectedPopupUser(null);
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

      {/* 유저 정보 팝업 */}
      <Dialog open={openPopup} onOpenChange={setOpenPopup}>
        <DialogContent className="max-w-4xl overflow-y-auto max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-purple-700 flex items-center gap-2">
              {selectedPopupUser && (
                <>
                  <span className="bg-purple-100 px-3 py-1 rounded-full text-sm">
                    {String(selectedPopupUser.user.nickname || selectedPopupUser.user.login_id)}
                  </span>
                  <span className="text-sm font-normal text-gray-500">
                    ( UID: {String(selectedPopupUser.user.uid)} | DB: {selectedPopupUser.dbName} )
                  </span>
                </>
              )}
            </DialogTitle>
          </DialogHeader>
          
          {selectedPopupUser && (
            <div className="py-4">
              {/* 유저 정보 테이블 */}
              <div className="rounded-md border border-gray-200 overflow-hidden mb-6">
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
                      <TableCell className="py-3 text-center border-r border-gray-200">{String(selectedPopupUser.user.uid)}</TableCell>
                      <TableCell className="py-3 text-center border-r border-gray-200">{String(selectedPopupUser.user.uuid)}</TableCell>
                      <TableCell className="py-3 text-center border-r border-gray-200">{String(selectedPopupUser.user.login_id)}</TableCell>
                      <TableCell className="py-3 text-center border-r border-gray-200">{String(selectedPopupUser.user.display_id)}</TableCell>
                      <TableCell className="py-3 text-center border-r border-gray-200">
                        <div className="flex justify-center">
                          <span className="text-purple-600 font-medium bg-purple-50 px-3 py-1 rounded-full">
                            {String(selectedPopupUser.user.nickname)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="py-3 text-center border-r border-gray-200">{String(selectedPopupUser.user.role)}</TableCell>
                      <TableCell className="py-3 text-center border-r border-gray-200">{String(selectedPopupUser.user.nation_index)}</TableCell>
                      <TableCell className="py-3 text-center border-r border-gray-200">{String(selectedPopupUser.user.create_at)}</TableCell>
                      <TableCell className="py-3 text-center border-r border-gray-200">{String(selectedPopupUser.user.update_at)}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
              
              {/* 탭 콘텐츠 */}
              <DynamicTabs 
                items={userTabsStructure.tabs} 
                className="w-full"
                triggerClassName="data-[state=active]:bg-purple-400 data-[state=active]:text-white h-8 rounded-none font-bold text-sm"
                contentClassName="mt-0"
                equalTabs={true}
              />
            </div>
          )}
          
          <DialogFooter>
            <Button 
              onClick={handleClosePopup}
              className="bg-gray-500 hover:bg-gray-600 text-white"
            >
              닫기
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
} 