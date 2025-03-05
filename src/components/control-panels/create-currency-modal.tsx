'use client';

import { useState } from "react";
import { Plus, AlertCircle } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { RefreshCw } from "lucide-react";

// CreateCurrencyModal 인터페이스 정의
export interface CreateCurrencyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (newCurrency: { excelItemIndex: number; count: number }) => void;
  isCreating: boolean;
}

export function CreateCurrencyModal({
  open,
  onOpenChange,
  onConfirm,
  isCreating,
}: CreateCurrencyModalProps) {
  const [excelItemIndex, setExcelItemIndex] = useState<number | ''>('');
  const [count, setCount] = useState<number | ''>('');
  const [error, setError] = useState<string | null>(null);

  const handleClose = () => {
    // 폼 초기화
    setExcelItemIndex('');
    setCount('');
    setError(null);
    onOpenChange(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // 폼 유효성 검사
    if (excelItemIndex === '') {
      setError('아이템 인덱스를 입력해주세요.');
      return;
    }
    
    if (count === '') {
      setError('수량을 입력해주세요.');
      return;
    }
    
    // 확인 함수 호출
    onConfirm({
      excelItemIndex: Number(excelItemIndex),
      count: Number(count),
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[900px] max-h-[85vh] flex flex-col p-0 overflow-hidden border-none rounded-lg shadow-2xl">
        {/* 모달 헤더 - 현대적인 디자인 */}
        <div className="bg-gradient-to-r from-green-600 to-teal-600 p-6 text-white">
          <DialogTitle className="flex items-center text-2xl font-light tracking-wide mb-2">
            <Plus className="mr-3 h-6 w-6 text-green-200" />
            화폐 생성
          </DialogTitle>
          <DialogDescription className="text-green-100 opacity-90 text-sm">
            새로운 화폐를 생성합니다. 아이템 인덱스와 수량을 입력해주세요.
          </DialogDescription>
        </div>
        
        {/* 모달 내용 */}
        <div className="flex-1 overflow-hidden p-6 bg-gray-50">
          {error && (
            <Alert variant="destructive" className="my-2 mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>오류</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {/* 테이블 영역 */}
          <div className="border rounded-lg overflow-hidden shadow-sm bg-white mb-4">
            <Table>
              <TableHeader className="bg-gray-50">
                <TableRow className="border-b border-gray-200">
                  <TableHead className="w-1/2 p-3 text-xs uppercase tracking-wider text-gray-600 font-semibold">필드</TableHead>
                  <TableHead className="w-1/2 p-3 text-xs uppercase tracking-wider text-gray-600 font-semibold">값</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <TableCell className="p-3 font-medium text-gray-700">아이템 인덱스</TableCell>
                  <TableCell className="p-2">
                    <div className="relative">
                      <Input
                        id="excel-item-index"
                        type="number"
                        min="1"
                        placeholder="예: 10001"
                        value={excelItemIndex}
                        onChange={(e) => setExcelItemIndex(e.target.value ? Number(e.target.value) : '')}
                        disabled={isCreating}
                        required
                        className="bg-white border-green-200 focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all shadow-sm"
                      />
                    </div>
                  </TableCell>
                </TableRow>
                <TableRow className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <TableCell className="p-3 font-medium text-gray-700">수량</TableCell>
                  <TableCell className="p-2">
                    <div className="relative">
                      <Input
                        id="count"
                        type="number"
                        min="1"
                        placeholder="예: 100"
                        value={count}
                        onChange={(e) => setCount(e.target.value ? Number(e.target.value) : '')}
                        disabled={isCreating}
                        required
                        className="bg-white border-green-200 focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all shadow-sm"
                      />
                    </div>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
          
          <div className="text-sm text-gray-500 p-2">
            <p className="bg-white px-3 py-2 rounded-md border border-gray-100 shadow-sm">
              <span className="font-medium text-gray-700">참고:</span> 아이템 인덱스는 엑셀 시트에 정의된 고유 ID입니다. 생성할 아이템의 정확한 인덱스를 입력해주세요.
            </p>
          </div>
        </div>
        
        {/* 모달 푸터 */}
        <div className="p-4 bg-white border-t border-gray-100 flex justify-end gap-2 items-center">
          <Button 
            type="button"
            variant="outline" 
            onClick={handleClose} 
            disabled={isCreating}
            className="border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors"
          >
            취소
          </Button>
          <Button 
            type="submit"
            onClick={handleSubmit} 
            disabled={isCreating} 
            className={`
              py-2 px-4 flex items-center gap-2 transition-all rounded-md
              ${isCreating 
                ? "bg-green-400" 
                : "bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 shadow-md hover:shadow"
              }
            `}
          >
            {isCreating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>생성 중...</span>
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                <span>생성</span>
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 