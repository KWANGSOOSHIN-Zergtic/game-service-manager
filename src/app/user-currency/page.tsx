"use client"

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";
import { AlertTriangle, Loader2, Trash2 } from "lucide-react";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motion } from "framer-motion";
import { logger } from "@/lib/logger";

// 삭제 확인 다이얼로그 컴포넌트
interface DeleteConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<void>;
  isDeleting: boolean;
  selectedCount: number;
  userUid?: number;
}

function DeleteConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  isDeleting,
  selectedCount,
  userUid,
}: DeleteConfirmDialogProps) {
  // 컴포넌트가 마운트될 때 로깅
  useEffect(() => {
    if (open) {
      logger.info('[DeleteConfirmDialog] 삭제 확인 다이얼로그 열림', {
        selectedCount,
        userUid,
        timestamp: new Date().toISOString(),
      });
    }
  }, [open, selectedCount, userUid]);

  // 확인 버튼 클릭 핸들러
  const handleConfirm = async () => {
    logger.info('[DeleteConfirmDialog] 삭제 확인 버튼 클릭', {
      selectedCount,
      userUid,
      timestamp: new Date().toISOString(),
    });
    await onConfirm();
  };

  // 취소 버튼 클릭 핸들러
  const handleCancel = () => {
    logger.info('[DeleteConfirmDialog] 삭제 취소 버튼 클릭', {
      selectedCount,
      userUid,
      timestamp: new Date().toISOString(),
    });
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-white border border-gray-200 text-gray-800 shadow-lg">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="w-full"
        >
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold text-purple-800 text-center">
              정말로 이 항목을 삭제하시겠습니까?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600 text-center">
              회원 ID: {userUid}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <Card className="border border-yellow-100 bg-yellow-50 shadow-sm mt-4 mb-6">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                <CardDescription className="text-gray-700 m-0 text-sm">
                  선택한 <span className="text-purple-700 font-semibold">{selectedCount}개</span>의 재화 항목이 영구적으로 삭제됩니다.
                </CardDescription>
              </div>
            </CardContent>
          </Card>
          
          <AlertDialogFooter className="sm:space-x-4">
            <AlertDialogCancel 
              className="bg-white border-gray-300 text-gray-700 hover:bg-gray-100 hover:text-gray-800" 
              disabled={isDeleting}
              onClick={handleCancel}
            >
              취소
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-purple-600 hover:bg-purple-700 text-white border-0"
              onClick={handleConfirm}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  삭제 중...
                </>
              ) : (
                "확인"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </motion.div>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// 사용자 재화 타입 정의
interface UserCurrency {
  id: number;
  create_at: string;
  update_at: string;
  employer_uid: number;
  excel_item_index: number;
  count: number;
  user_nickname?: string;
  user_display_id?: string;
}

// 사용자 정보 타입 정의
interface SelectedUserInfo {
  user: {
    uid: number;
    nickname: string;
    login_id: string;
  };
  dbName: string;
}

export default function UserCurrencyPage() {
  // 상태 관리
  const [userInfo, setUserInfo] = useState<SelectedUserInfo | null>(null);
  const [currencies, setCurrencies] = useState<UserCurrency[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [checkedItems, setCheckedItems] = useState<Record<number, boolean>>({});
  const [selectAll, setSelectAll] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [availableDBs, setAvailableDBs] = useState<string[]>([]);
  const [selectedDB, setSelectedDB] = useState<string>("");

  // 선택된 아이템 개수
  const selectedCount = Object.values(checkedItems).filter(Boolean).length;

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
          setSelectedDB(parsedInfo.dbName);
          
          // 페이지 타이틀 설정
          const nickname = parsedInfo.user.nickname || parsedInfo.user.login_id;
          document.title = `사용자 재화 관리: ${nickname} (${parsedInfo.user.uid})`;
          
          // 사용자 재화 데이터 로드
          loadUserCurrencies(parsedInfo.user.uid, parsedInfo.dbName);
        } else {
          setIsLoading(false);
        }
      } catch (error) {
        console.error("사용자 정보 로드 중 오류 발생:", error);
        setIsLoading(false);
      }
    };

    loadUserInfo();
  }, []);

  // 사용자 재화 데이터 로드 함수
  const loadUserCurrencies = async (employerUid: number, dbName: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/user/currency?employerUid=${employerUid}&dbName=${dbName}`);
      const data = await response.json();
      
      if (data.success) {
        setCurrencies(data.currencies || []);
        
        // 체크박스 상태 초기화
        const newCheckedItems: Record<number, boolean> = {};
        data.currencies?.forEach((item: UserCurrency) => {
          newCheckedItems[item.excel_item_index] = false;
        });
        setCheckedItems(newCheckedItems);
        setSelectAll(false);
        
        toast({
          title: "재화 정보 조회 완료",
          description: `${data.currencies.length}개의 재화 정보를 로드했습니다.`,
          variant: "purple",
        });
      } else {
        console.error("재화 데이터 로드 실패:", data.error || data.message);
        if (data.availableDBs) {
          setAvailableDBs(data.availableDBs);
        }
        toast({
          title: "재화 데이터 로드 실패",
          description: data.message || data.error || "알 수 없는 오류가 발생했습니다.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("재화 데이터 로드 중 오류:", error);
      toast({
        title: "재화 데이터 로드 실패",
        description: "서버 연결 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 데이터베이스 변경 핸들러
  const handleDBChange = (value: string) => {
    if (userInfo) {
      setSelectedDB(value);
      loadUserCurrencies(userInfo.user.uid, value);
    }
  };

  // 전체 선택/해제 핸들러
  const handleSelectAll = () => {
    const newCheckedState = !selectAll;
    setSelectAll(newCheckedState);
    
    const newCheckedItems = { ...checkedItems };
    currencies.forEach(item => {
      newCheckedItems[item.excel_item_index] = newCheckedState;
    });
    
    setCheckedItems(newCheckedItems);
  };

  // 개별 체크박스 핸들러
  const handleCheckboxChange = (excelItemIndex: number) => {
    const newCheckedItems = { ...checkedItems };
    newCheckedItems[excelItemIndex] = !newCheckedItems[excelItemIndex];
    setCheckedItems(newCheckedItems);
    
    // 모든 아이템이 선택되었는지 확인
    const allChecked = currencies.every(item => newCheckedItems[item.excel_item_index]);
    setSelectAll(allChecked);
  };

  // 삭제 확인 다이얼로그 표시
  const handleShowDeleteDialog = () => {
    if (selectedCount === 0) {
      toast({
        title: "선택된 항목 없음",
        description: "삭제할 항목을 선택해주세요.",
        variant: "destructive",
      });
      return;
    }
    
    // 삭제 버튼 클릭 로깅
    logger.info('[UserCurrencyPage] 삭제 버튼 클릭', {
      selectedCount,
      userUid: userInfo?.user.uid,
      timestamp: new Date().toISOString(),
    });
    
    setShowDeleteDialog(true);
  };

  // 선택된 항목 삭제 처리
  const handleDeleteSelected = async () => {
    if (!userInfo || selectedCount === 0) return;
    
    try {
      setIsDeleting(true);
      
      // 삭제 시작 로깅
      logger.info('[UserCurrencyPage] 삭제 프로세스 시작', {
        selectedCount,
        userUid: userInfo.user.uid,
        timestamp: new Date().toISOString(),
      });
      
      // 선택된 아이템 ID 배열 생성
      const selectedIndexes = Object.entries(checkedItems)
        .filter(([, checked]) => checked)
        .map(([excelItemIndex]) => parseInt(excelItemIndex));
      
      // 삭제할 아이템 로깅
      logger.info('[UserCurrencyPage] 삭제할 아이템', {
        selectedIndexes,
        userUid: userInfo.user.uid,
        timestamp: new Date().toISOString(),
      });
      
      // 선택된 모든 항목에 대해 삭제 요청 보내기
      const deletePromises = selectedIndexes.map(excelItemIndex => 
        fetch(`/api/user/currency?employerUid=${userInfo.user.uid}&excelItemIndex=${excelItemIndex}&dbName=${selectedDB}`, {
          method: 'DELETE',
        })
      );
      
      const results = await Promise.all(deletePromises);
      
      // 모든 응답 확인
      const responses = await Promise.all(results.map(res => res.json()));
      
      // 삭제 결과 로깅
      logger.info('[UserCurrencyPage] 삭제 응답 결과', {
        responses,
        userUid: userInfo.user.uid,
        timestamp: new Date().toISOString(),
      });
      
      // 실패한 삭제 요청이 있는지 확인
      const failedResponses = responses.filter(resp => !resp.success);
      
      if (failedResponses.length > 0) {
        console.error("일부 항목 삭제 실패:", failedResponses);
        toast({
          title: "삭제 부분 실패",
          description: `${responses.length - failedResponses.length}개 항목 삭제 성공, ${failedResponses.length}개 항목 삭제 실패`,
          variant: "warning",
        });
        
        // 실패한 항목 로깅
        logger.warn('[UserCurrencyPage] 일부 항목 삭제 실패', {
          failedCount: failedResponses.length,
          successCount: responses.length - failedResponses.length,
          failedResponses,
          userUid: userInfo.user.uid,
          timestamp: new Date().toISOString(),
        });
      } else {
        toast({
          title: "삭제 완료",
          description: `선택한 ${selectedCount}개 항목이 성공적으로 삭제되었습니다.`,
          variant: "success",
        });
        
        // 성공 로깅
        logger.info('[UserCurrencyPage] 삭제 성공', {
          deletedCount: responses.length,
          userUid: userInfo.user.uid,
          timestamp: new Date().toISOString(),
        });
      }
      
      // 데이터 다시 로드
      await loadUserCurrencies(userInfo.user.uid, selectedDB);
      
    } catch (error) {
      console.error("항목 삭제 중 오류:", error);
      toast({
        title: "삭제 실패",
        description: "재화 삭제 중 오류가 발생했습니다.",
        variant: "destructive",
      });
      
      // 오류 로깅
      logger.error('[UserCurrencyPage] 삭제 중 오류 발생', {
        error: error instanceof Error ? error.message : String(error),
        userUid: userInfo.user.uid,
        timestamp: new Date().toISOString(),
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  // 사용자 정보가 없는 경우
  if (!userInfo && !isLoading) {
    return (
      <div className="container p-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-10">
              <h2 className="text-xl font-bold mb-2">사용자 정보가 없습니다</h2>
              <p className="text-gray-500 mb-4">사용자 검색 페이지에서 사용자를 선택하세요.</p>
              <Button onClick={() => window.history.back()}>이전 페이지로 돌아가기</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container p-6">
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle>
              사용자 재화 관리
              {userInfo && (
                <span className="ml-2 text-sm font-normal text-gray-500">
                  {userInfo.user.nickname || userInfo.user.login_id} ({userInfo.user.uid})
                </span>
              )}
            </CardTitle>
            <div className="flex items-center gap-2">
              {availableDBs.length > 0 && (
                <Select value={selectedDB} onValueChange={handleDBChange}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="데이터베이스 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableDBs.map((db) => (
                      <SelectItem key={db} value={db}>
                        {db}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              <Button
                variant="destructive"
                size="sm"
                onClick={handleShowDeleteDialog}
                disabled={selectedCount === 0 || isDeleting}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                선택 삭제 ({selectedCount})
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              <span>로딩 중...</span>
            </div>
          ) : currencies.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectAll}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead>ID</TableHead>
                    <TableHead>아이템 인덱스</TableHead>
                    <TableHead>수량</TableHead>
                    <TableHead>생성일</TableHead>
                    <TableHead>수정일</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currencies.map((currency) => (
                    <TableRow key={currency.excel_item_index}>
                      <TableCell>
                        <Checkbox
                          checked={checkedItems[currency.excel_item_index] || false}
                          onCheckedChange={() => handleCheckboxChange(currency.excel_item_index)}
                        />
                      </TableCell>
                      <TableCell>{currency.id}</TableCell>
                      <TableCell>{currency.excel_item_index}</TableCell>
                      <TableCell>{currency.count.toLocaleString()}</TableCell>
                      <TableCell>{new Date(currency.create_at).toLocaleString()}</TableCell>
                      <TableCell>{new Date(currency.update_at).toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-gray-500">재화 데이터가 없습니다.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 삭제 확인 다이얼로그 컴포넌트 */}
      <DeleteConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleDeleteSelected}
        isDeleting={isDeleting}
        selectedCount={selectedCount}
        userUid={userInfo?.user.uid}
      />
    </div>
  );
} 