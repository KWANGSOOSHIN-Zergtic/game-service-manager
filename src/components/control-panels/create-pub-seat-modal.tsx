'use client';

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Check, Minus, Plus } from "lucide-react";

interface CreatePubSeatModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: {
    employer_uid: string;
    seat_status: number[];
    talk_status: boolean[];
    recruit_status: boolean[];
  }) => void;
  isSubmitting?: boolean;
}

export function CreatePubSeatModal({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting = false
}: CreatePubSeatModalProps) {
  const { toast } = useToast();
  const [employerUid, setEmployerUid] = useState<string>("");
  const [seatCount, setSeatCount] = useState<number>(3);
  const [seatStatus, setSeatStatus] = useState<number[]>([0, 0, 0]);
  const [talkStatus, setTalkStatus] = useState<boolean[]>([false, false, false]);
  const [recruitStatus, setRecruitStatus] = useState<boolean[]>([false, false, false]);

  // 좌석 상태 변경 핸들러
  const handleSeatStatusChange = (index: number, value: number) => {
    const newState = [...seatStatus];
    newState[index] = value;
    setSeatStatus(newState);
  };

  // 대화 상태 변경 핸들러
  const handleTalkStatusChange = (index: number, value: boolean) => {
    const newState = [...talkStatus];
    newState[index] = value;
    setTalkStatus(newState);
  };

  // 모집 상태 변경 핸들러
  const handleRecruitStatusChange = (index: number, value: boolean) => {
    const newState = [...recruitStatus];
    newState[index] = value;
    setRecruitStatus(newState);
  };

  // 좌석 수 증가 핸들러
  const handleIncreaseSeatCount = () => {
    if (seatCount >= 5) return; // 최대 5개
    
    setSeatCount(prev => {
      const newCount = prev + 1;
      setSeatStatus(current => [...current, 0]);
      return newCount;
    });
  };

  // 좌석 수 감소 핸들러
  const handleDecreaseSeatCount = () => {
    if (seatCount <= 3) return; // 최소 3개
    
    setSeatCount(prev => {
      const newCount = prev - 1;
      setSeatStatus(current => current.slice(0, newCount));
      return newCount;
    });
  };

  // 폼 제출 핸들러
  const handleSubmit = () => {
    if (!employerUid) {
      toast({
        title: "입력 오류",
        description: "사용자 UID를 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    try {
      onSubmit({
        employer_uid: employerUid,
        seat_status: seatStatus,
        talk_status: talkStatus,
        recruit_status: recruitStatus,
      });
    } catch (error) {
      console.error("PUB 좌석 상태 생성 중 오류:", error);
      toast({
        title: "오류 발생",
        description: "좌석 상태 생성 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  // 모달이 닫힐 때 폼 초기화
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      // 폼 초기화
      setEmployerUid("");
      setSeatCount(3);
      setSeatStatus([0, 0, 0]);
      setTalkStatus([false, false, false]);
      setRecruitStatus([false, false, false]);
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>PUB 좌석 상태 생성</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="employer_uid" className="text-right">
              사용자 UID
            </Label>
            <Input
              id="employer_uid"
              value={employerUid}
              onChange={(e) => setEmployerUid(e.target.value)}
              placeholder="예: 1000000"
              className="col-span-3"
              type="text"
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">좌석 수</Label>
            <div className="flex items-center space-x-2 col-span-3">
              <Button 
                type="button" 
                variant="outline" 
                size="icon" 
                onClick={handleDecreaseSeatCount}
                disabled={seatCount <= 3}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="px-2">{seatCount}개</span>
              <Button 
                type="button" 
                variant="outline" 
                size="icon"
                onClick={handleIncreaseSeatCount}
                disabled={seatCount >= 5}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">좌석 상태</Label>
            <div className="col-span-3 grid grid-cols-5 gap-2">
              {seatStatus.map((status, index) => (
                <div key={`seat-${index}`} className="flex flex-col items-center">
                  <span className="text-xs text-gray-500 mb-1">좌석 {index + 1}</span>
                  <div className="flex border rounded h-8 overflow-hidden">
                    <button
                      type="button"
                      className={`px-2 ${status === 0 ? 'bg-green-100' : 'bg-gray-50'}`}
                      onClick={() => handleSeatStatusChange(index, 0)}
                      title="비어있음"
                    >
                      {status === 0 && <Check className="h-3 w-3" />}
                    </button>
                    <button
                      type="button"
                      className={`px-2 ${status === 1 ? 'bg-blue-100' : 'bg-gray-50'}`}
                      onClick={() => handleSeatStatusChange(index, 1)}
                      title="사용 중"
                    >
                      {status === 1 && <Check className="h-3 w-3" />}
                    </button>
                    <button
                      type="button"
                      className={`px-2 ${status === 2 ? 'bg-red-100' : 'bg-gray-50'}`}
                      onClick={() => handleSeatStatusChange(index, 2)}
                      title="예약됨"
                    >
                      {status === 2 && <Check className="h-3 w-3" />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">대화 상태</Label>
            <div className="col-span-3 grid grid-cols-3 gap-2">
              {talkStatus.map((status, index) => (
                <div key={`talk-${index}`} className="flex items-center space-x-2">
                  <button
                    type="button"
                    className={`w-8 h-8 rounded-md flex items-center justify-center ${
                      status ? 'bg-green-100' : 'bg-gray-100'
                    }`}
                    onClick={() => handleTalkStatusChange(index, !status)}
                  >
                    {status && <Check className="h-4 w-4 text-green-700" />}
                  </button>
                  <span className="text-sm">{index + 1}번</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">모집 상태</Label>
            <div className="col-span-3 grid grid-cols-3 gap-2">
              {recruitStatus.map((status, index) => (
                <div key={`recruit-${index}`} className="flex items-center space-x-2">
                  <button
                    type="button"
                    className={`w-8 h-8 rounded-md flex items-center justify-center ${
                      status ? 'bg-green-100' : 'bg-gray-100'
                    }`}
                    onClick={() => handleRecruitStatusChange(index, !status)}
                  >
                    {status && <Check className="h-4 w-4 text-green-700" />}
                  </button>
                  <span className="text-sm">{index + 1}번</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            취소
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? "처리 중..." : "생성"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 