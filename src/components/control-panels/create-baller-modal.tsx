'use client';

import { useState } from "react";
import { Plus, AlertCircle } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { RefreshCw } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// CreateBallerModal 인터페이스 정의
export interface CreateBallerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (newBaller: { 
    excel_baller_index: number; 
    character_level: number;
    training_point: number;
    recruit_process: number;
    character_status: number;
  }) => void;
  isCreating: boolean;
}

export function CreateBallerModal({
  open,
  onOpenChange,
  onConfirm,
  isCreating,
}: CreateBallerModalProps) {
  const [excel_baller_index, setExcelBallerIndex] = useState<number | ''>('');
  const [character_level, setCharacterLevel] = useState<number>(1);
  const [training_point, setTrainingPoint] = useState<number>(0);
  const [recruit_process, setRecruitProcess] = useState<number>(0);
  const [character_status, setCharacterStatus] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  const handleClose = () => {
    // 폼 초기화
    setExcelBallerIndex('');
    setCharacterLevel(1);
    setTrainingPoint(0);
    setRecruitProcess(0);
    setCharacterStatus(0);
    setError(null);
    onOpenChange(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // 폼 유효성 검사
    if (excel_baller_index === '') {
      setError('Baller 인덱스를 입력해주세요.');
      return;
    }
    
    // 확인 함수 호출
    onConfirm({
      excel_baller_index: Number(excel_baller_index),
      character_level,
      training_point,
      recruit_process,
      character_status
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[900px] max-h-[85vh] flex flex-col p-0 overflow-hidden border-none rounded-lg shadow-2xl">
        {/* 모달 헤더 - 현대적인 디자인 */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
          <DialogTitle className="flex items-center text-2xl font-light tracking-wide mb-2">
            <Plus className="mr-3 h-6 w-6 text-blue-200" />
            Baller 생성
          </DialogTitle>
          <DialogDescription className="text-blue-100 opacity-90 text-sm">
            새로운 Baller를 생성합니다. Baller 정보를 입력해주세요.
          </DialogDescription>
        </div>
        
        {/* 모달 내용 */}
        <div className="p-6 bg-white flex flex-col">
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
                  <TableCell className="p-3 font-medium text-gray-700">Baller 인덱스</TableCell>
                  <TableCell className="p-2">
                    <div className="relative">
                      <Input
                        id="excel-baller-index"
                        type="number"
                        min="1"
                        placeholder="예: 10001"
                        value={excel_baller_index}
                        onChange={(e) => setExcelBallerIndex(e.target.value ? Number(e.target.value) : '')}
                        disabled={isCreating}
                        required
                        className="bg-white border-purple-200 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all shadow-sm"
                      />
                    </div>
                  </TableCell>
                </TableRow>
                <TableRow className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <TableCell className="p-3 font-medium text-gray-700">캐릭터 레벨</TableCell>
                  <TableCell className="p-2">
                    <div className="relative">
                      <Input
                        id="character-level"
                        type="number"
                        min="1"
                        max="100"
                        placeholder="예: 1"
                        value={character_level}
                        onChange={(e) => setCharacterLevel(parseInt(e.target.value))}
                        disabled={isCreating}
                        required
                        className="bg-white border-purple-200 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all shadow-sm"
                      />
                    </div>
                  </TableCell>
                </TableRow>
                <TableRow className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <TableCell className="p-3 font-medium text-gray-700">훈련 포인트</TableCell>
                  <TableCell className="p-2">
                    <div className="relative">
                      <Input
                        id="training-point"
                        type="number"
                        min="0"
                        placeholder="예: 0"
                        value={training_point}
                        onChange={(e) => setTrainingPoint(parseInt(e.target.value))}
                        disabled={isCreating}
                        required
                        className="bg-white border-purple-200 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all shadow-sm"
                      />
                    </div>
                  </TableCell>
                </TableRow>
                <TableRow className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <TableCell className="p-3 font-medium text-gray-700">채용 단계</TableCell>
                  <TableCell className="p-2">
                    <div className="relative">
                      <Select 
                        value={recruit_process.toString()} 
                        onValueChange={(value) => setRecruitProcess(parseInt(value))}
                        disabled={isCreating}
                      >
                        <SelectTrigger className="bg-white border-purple-200 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all shadow-sm">
                          <SelectValue placeholder="채용 단계 선택" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">미채용</SelectItem>
                          <SelectItem value="1">접촉</SelectItem>
                          <SelectItem value="2">협상중</SelectItem>
                          <SelectItem value="3">계약</SelectItem>
                          <SelectItem value="4">완료</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </TableCell>
                </TableRow>
                <TableRow className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <TableCell className="p-3 font-medium text-gray-700">캐릭터 상태</TableCell>
                  <TableCell className="p-2">
                    <div className="relative">
                      <Select 
                        value={character_status.toString()} 
                        onValueChange={(value) => setCharacterStatus(parseInt(value))}
                        disabled={isCreating}
                      >
                        <SelectTrigger className="bg-white border-purple-200 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all shadow-sm">
                          <SelectValue placeholder="캐릭터 상태 선택" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">비활성</SelectItem>
                          <SelectItem value="1">활성</SelectItem>
                          <SelectItem value="2">훈련중</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
          
          <div className="text-sm text-gray-500 p-2">
            <p className="bg-white px-3 py-2 rounded-md border border-gray-100 shadow-sm">
              <span className="font-medium text-gray-700">참고:</span> Baller 인덱스는 엑셀 시트에 정의된 고유 ID입니다. 생성할 Baller의 정확한 인덱스를 입력해주세요.
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
                ? "bg-purple-400" 
                : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-md hover:shadow"
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