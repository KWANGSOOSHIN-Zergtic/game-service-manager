'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { IUITableData } from '@/types/table.types';
import { Armchair, MessageCircle, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PubSeatControlPanelProps {
  selectedItems: IUITableData[];
  onCreateItem: () => void;
  onUpdateItem: () => void;
  onDeleteItem: () => void;
  onManageSeatStatus: () => void;
  onManageTalkStatus: () => void;
  onManageRecruitStatus: () => void;
}

export function PubSeatControlPanel({
  selectedItems,
  onCreateItem,
  onUpdateItem,
  onDeleteItem,
  onManageSeatStatus,
  onManageTalkStatus,
  onManageRecruitStatus
}: PubSeatControlPanelProps) {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  // 아이템 생성 핸들러
  const handleCreate = () => {
    if (isProcessing) return;
    
    try {
      setIsProcessing(true);
      onCreateItem();
    } catch (error) {
      console.error('아이템 생성 중 오류:', error);
      toast({
        title: '오류',
        description: '좌석 상태 생성 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // 아이템 업데이트 핸들러
  const handleUpdate = () => {
    if (isProcessing || selectedItems.length === 0) return;
    
    try {
      setIsProcessing(true);
      onUpdateItem();
    } catch (error) {
      console.error('아이템 업데이트 중 오류:', error);
      toast({
        title: '오류',
        description: '좌석 상태 업데이트 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // 아이템 삭제 핸들러
  const handleDelete = () => {
    if (isProcessing || selectedItems.length === 0) return;
    
    try {
      setIsProcessing(true);
      onDeleteItem();
    } catch (error) {
      console.error('아이템 삭제 중 오류:', error);
      toast({
        title: '오류',
        description: '좌석 상태 삭제 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // 좌석 상태 관리 핸들러
  const handleManageSeatStatus = () => {
    if (isProcessing || selectedItems.length === 0) return;
    
    try {
      setIsProcessing(true);
      onManageSeatStatus();
    } catch (error) {
      console.error('좌석 상태 관리 중 오류:', error);
      toast({
        title: '오류',
        description: '좌석 상태 관리 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // 대화 상태 관리 핸들러
  const handleManageTalkStatus = () => {
    if (isProcessing || selectedItems.length === 0) return;
    
    try {
      setIsProcessing(true);
      onManageTalkStatus();
    } catch (error) {
      console.error('대화 상태 관리 중 오류:', error);
      toast({
        title: '오류',
        description: '대화 상태 관리 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // 모집 상태 관리 핸들러
  const handleManageRecruitStatus = () => {
    if (isProcessing || selectedItems.length === 0) return;
    
    try {
      setIsProcessing(true);
      onManageRecruitStatus();
    } catch (error) {
      console.error('모집 상태 관리 중 오류:', error);
      toast({
        title: '오류',
        description: '모집 상태 관리 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      <Button 
        size="sm" 
        onClick={handleCreate}
        className="bg-green-600 hover:bg-green-700"
        disabled={isProcessing}
      >
        CREATE
      </Button>
      <Button 
        size="sm" 
        onClick={handleUpdate}
        className="bg-blue-600 hover:bg-blue-700"
        disabled={selectedItems.length === 0 || isProcessing}
      >
        UPDATE
      </Button>
      <Button 
        size="sm" 
        onClick={handleDelete}
        className="bg-red-600 hover:bg-red-700"
        disabled={selectedItems.length === 0 || isProcessing}
      >
        DELETE
      </Button>
      <div className="w-px h-8 bg-gray-300 mx-1"></div>
      <Button 
        size="sm" 
        onClick={handleManageSeatStatus}
        disabled={selectedItems.length === 0 || isProcessing}
        className="bg-amber-600 hover:bg-amber-700"
      >
        <Armchair className="h-4 w-4 mr-1" /> 좌석 관리
      </Button>
      <Button 
        size="sm" 
        onClick={handleManageTalkStatus}
        disabled={selectedItems.length === 0 || isProcessing}
        className="bg-sky-600 hover:bg-sky-700"
      >
        <MessageCircle className="h-4 w-4 mr-1" /> 대화 관리
      </Button>
      <Button 
        size="sm" 
        onClick={handleManageRecruitStatus}
        disabled={selectedItems.length === 0 || isProcessing}
        className="bg-purple-600 hover:bg-purple-700"
      >
        <Users className="h-4 w-4 mr-1" /> 모집 관리
      </Button>
    </div>
  );
} 