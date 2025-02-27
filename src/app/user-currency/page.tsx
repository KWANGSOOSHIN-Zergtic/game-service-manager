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
import { ApiDebugInfo } from "@/components/ApiDebugInfo";
import { useCurrencyData } from "@/hooks/useCurrencyData";
import { ResultAlert } from "@/components/ui/result-alert";

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
  const [checkedItems, setCheckedItems] = useState<Record<number, boolean>>({});
  const [selectAll, setSelectAll] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [availableDBs, setAvailableDBs] = useState<string[]>([]);
  const [selectedDB, setSelectedDB] = useState<string>("");
  const [queryResult, setQueryResult] = useState<{ status: 'success' | 'error' | null; message: string; error?: string; }>({
    status: null,
    message: ''
  });

  // 새로운 useCurrencyData 훅 사용
  const { 
    currencies, 
    isLoading, 
    debugInfo, 
    fetchCurrencies, 
    deleteCurrency 
  } = useCurrencyData();

  // 선택된 아이템 개수
  const selectedCount = Object.values(checkedItems).filter(Boolean).length;

  // 컴포넌트 마운트 시 사용자 정보 로드
  useEffect(() => {
    const loadUserInfo = () => {
      try {
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
          fetchUserCurrencies(parsedInfo.user.uid, parsedInfo.dbName);
        }
      } catch (error) {
        console.error("사용자 정보 로드 중 오류 발생:", error);
        setQueryResult({
          status: 'error',
          message: '사용자 정보 로드 중 오류가 발생했습니다.'
        });
      }
    };

    loadUserInfo();
  }, []);

  // 사용자 재화 데이터 로드 함수
  const fetchUserCurrencies = async (employerUid: number, dbName: string) => {
    try {
      const result = await fetchCurrencies(employerUid, dbName);
      
      if (result.success) {
        // 체크박스 상태 초기화
        const newCheckedItems: Record<number, boolean> = {};
        result.currencies?.forEach((item: UserCurrency) => {
          newCheckedItems[item.excel_item_index] = false;
        });
        setCheckedItems(newCheckedItems);
        setSelectAll(false);
        
        setQueryResult({
          status: 'success',
          message: `${result.currencies?.length || 0}개의 재화 정보를 로드했습니다.`
        });
      } else {
        console.error("재화 데이터 로드 실패:", result.error || result.message);
        if (result.availableDBs) {
          setAvailableDBs(result.availableDBs);
        }
        
        setQueryResult({
          status: 'error',
          message: result.message || result.error || "알 수 없는 오류가 발생했습니다."
        });
      }
    } catch (err) {
      console.error("재화 데이터 로드 중 오류:", err);
      
      setQueryResult({
        status: 'error',
        message: "서버 연결 중 오류가 발생했습니다."
      });
    }
  };

  const handleDBChange = (value: string) => {
    setSelectedDB(value);
    if (userInfo && userInfo.user.uid) {
      fetchUserCurrencies(userInfo.user.uid, value);
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

  // 삭제 확인 다이얼로그 관리
  const handleShowDeleteDialog = () => {
    if (selectedCount === 0) {
      toast({
        title: "선택된 항목 없음",
        description: "삭제할 항목을 먼저 선택해주세요.",
        variant: "destructive",
      });
      return;
    }
    
    // 삭제 확인 다이얼로그 표시
    setShowDeleteDialog(true);
    
    // 로깅
    logger.info('[UserCurrencyPage] 삭제 확인 다이얼로그 열림', {
      selectedCount,
      userInfo: userInfo ? {
        uid: userInfo.user.uid,
        nickname: userInfo.user.nickname
      } : null,
      timestamp: new Date().toISOString(),
    });
  };

  // 삭제 처리 함수
  const handleDeleteSelected = async () => {
    if (!userInfo || !selectedCount) return;
    
    setIsDeleting(true);
    
    try {
      // 'isChecked' 대신 사용하지 않는 변수를 언더스코어(_)가 아닌 의미있는 이름으로 변경
      const selectedIndices = Object.entries(checkedItems)
        .filter(([, isChecked]) => isChecked)
        .map(([index]) => parseInt(index));
      
      // 삭제 API 호출
      const result = await deleteCurrency(
        userInfo.user.uid,
        selectedIndices,
        selectedDB || userInfo.dbName
      );
      
      setShowDeleteDialog(false);
      
      if (result.success) {
        setQueryResult({
          status: 'success',
          message: `${selectedCount}개 항목이 성공적으로 삭제되었습니다.`
        });
      } else {
        setQueryResult({
          status: 'error',
          message: result.message || '삭제 중 오류가 발생했습니다.'
        });
      }
    } catch (error) {
      console.error("삭제 중 오류:", error);
      setQueryResult({
        status: 'error',
        message: error instanceof Error ? error.message : '삭제 중 오류가 발생했습니다.'
      });
    } finally {
      setIsDeleting(false);
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
    <div className="container mx-auto p-4 max-w-6xl">
      <h1 className="text-2xl font-bold mb-6 text-purple-800">
        사용자 재화 관리
        {userInfo && (
          <span className="ml-2 text-gray-600 text-lg">
            {userInfo.user.nickname || userInfo.user.login_id} ({userInfo.user.uid})
          </span>
        )}
      </h1>
      
      {/* API 디버그 정보 */}
      {debugInfo && (
        <ApiDebugInfo
          requestUrl={debugInfo.requestUrl}
          requestMethod={debugInfo.requestMethod}
          requestHeaders={debugInfo.requestHeaders}
          requestBody={debugInfo.requestBody}
          timestamp={debugInfo.timestamp}
          title="재화 관리 API 요청 정보"
          className="mb-4"
        />
      )}
      
      {/* 결과 알림 */}
      {queryResult.status && (
        <ResultAlert 
          result={queryResult}
          successTitle="요청 성공"
          errorTitle="요청 실패"
          className="mb-4"
        />
      )}
      
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle>사용자 재화 관리</CardTitle>
          {availableDBs.length > 0 && (
            <div className="mt-2">
              <Select value={selectedDB} onValueChange={handleDBChange}>
                <SelectTrigger className="w-[300px]">
                  <SelectValue placeholder="DB 선택" />
                </SelectTrigger>
                <SelectContent>
                  {availableDBs.map((db) => (
                    <SelectItem key={db} value={db}>
                      {db}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
              <span className="ml-2 text-lg text-purple-500">데이터 로딩 중...</span>
            </div>
          ) : currencies.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p>재화 데이터가 없습니다</p>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="selectAll"
                    checked={selectAll}
                    onCheckedChange={handleSelectAll}
                  />
                  <label htmlFor="selectAll" className="text-sm font-medium text-gray-700">
                    전체 선택 ({currencies.length}개 항목)
                  </label>
                </div>
                
                <Button
                  variant="destructive"
                  size="sm"
                  disabled={selectedCount === 0}
                  onClick={handleShowDeleteDialog}
                  className="flex items-center"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  선택 삭제 ({selectedCount})
                </Button>
              </div>
              
              <div className="border rounded-md overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="w-[50px]">선택</TableHead>
                      <TableHead className="w-[180px]">생성일</TableHead>
                      <TableHead className="w-[180px]">수정일</TableHead>
                      <TableHead className="w-[100px]">아이템 ID</TableHead>
                      <TableHead>수량</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currencies.map((item) => (
                      <TableRow key={item.excel_item_index}>
                        <TableCell className="py-2">
                          <Checkbox
                            checked={!!checkedItems[item.excel_item_index]}
                            onCheckedChange={() => handleCheckboxChange(item.excel_item_index)}
                          />
                        </TableCell>
                        <TableCell className="py-2 text-xs">
                          {new Date(item.create_at).toLocaleString()}
                        </TableCell>
                        <TableCell className="py-2 text-xs">
                          {new Date(item.update_at).toLocaleString()}
                        </TableCell>
                        <TableCell className="py-2 font-medium">{item.excel_item_index}</TableCell>
                        <TableCell className="py-2">{item.count.toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </CardContent>
      </Card>
      
      {/* 삭제 확인 다이얼로그 */}
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