'use client';

import React, { useState, useEffect } from 'react';
import { DataTable } from '@/components/ui/data-table';
import { 
  getStatusVisual
} from '@/test/test-data/pub-seat-status-mock';
import { IUITableData } from '@/types/table.types';
import { useToast } from '@/hooks/use-toast';
import { PubSeatControlPanel } from '@/components/control-panels/pub-seat-control-panel';
import { CreatePubSeatModal } from '@/components/control-panels/create-pub-seat-modal';
import { IPubSeatData } from '@/interfaces/pub-seat-status.interface';
import { pubSeatColumns } from '@/data/user-pub-seat-table-columns';
import { useUserTab } from '@/providers/user-tab-provider';
import { formatISO } from 'date-fns';
import { AlertCircle, CheckCircle } from 'lucide-react';

// PUB 좌석 상태 인터페이스 정의
interface IPubSeatData extends IUITableData {
  employer_uid: string;
  seat_status: number;
  talk_status: boolean;
  recruit_status: boolean;
  created_at?: string;
  updated_at?: string;
}

// 임시 컬럼 정의
const pubSeatColumns = [
  {
    key: 'id',
    label: 'ID',
    align: 'center' as const,
  },
  {
    key: 'employer_uid',
    label: '고용주 UID',
    align: 'center' as const,
  },
  {
    key: 'seat_status',
    label: '좌석 상태',
    align: 'center' as const,
    format: (value: number) => value === 1 ? '활성' : '비활성',
  },
  {
    key: 'talk_status',
    label: '대화 상태',
    align: 'center' as const,
    format: (value: boolean) => value ? '활성' : '비활성',
  },
  {
    key: 'recruit_status',
    label: '모집 상태',
    align: 'center' as const,
    format: (value: boolean) => value ? '활성' : '비활성',
  },
  {
    key: 'created_at',
    label: '생성일',
    align: 'center' as const,
  },
  {
    key: 'updated_at',
    label: '수정일',
    align: 'center' as const,
  }
];

const PubTab = () => {
  const { toast } = useToast();
  const { selectedUserId, dbName, refreshUserInfo } = useUserTab();
  
  const [loading, setLoading] = useState<boolean>(false);
  const [pubSeatData, setPubSeatData] = useState<IPubSeatData[]>([]);
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [selectedItems, setSelectedItems] = useState<IPubSeatData[]>([]);

  // PUB 좌석 데이터 새로고침 함수
  const refreshPubSeatData = async () => {
    if (!selectedUserId || !dbName) {
      console.warn('사용자 ID 또는 DB 이름이 선택되지 않았습니다.');
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch(`/api/users/multi-play/pub?employerUid=${selectedUserId}&dbName=${dbName}`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || `API 요청 실패: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        console.log('PUB 좌석 데이터 조회 성공:', data.data);
        setPubSeatData(data.data || []);
        
        // 데이터를 세션 스토리지에 저장 (컨트롤 패널에서 사용)
        sessionStorage.setItem('tableData', JSON.stringify(data.data || []));
      } else {
        throw new Error(data.message || '데이터 조회 실패');
      }
    } catch (error) {
      console.error('PUB 좌석 데이터 조회 오류:', error);
      toast({
        variant: 'destructive',
        title: '데이터 조회 실패',
        description: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.'
      });
      setPubSeatData([]);
    } finally {
      setLoading(false);
    }
  };
  
  // 최초 로드 및 선택된 사용자 ID 변경 시 데이터 조회
  useEffect(() => {
    refreshPubSeatData();
  }, [selectedUserId, dbName]);
  
  // 데이터 선택 핸들러
  const handleSelectionChange = (items: IPubSeatData[]) => {
    setSelectedItems(items);
  };
  
  // PUB 좌석 생성
  const handleCreatePubSeat = async (data: Omit<IPubSeatData, 'id' | 'created_at' | 'updated_at'>) => {
    if (!selectedUserId || !dbName) {
      toast({
        variant: 'destructive',
        title: '데이터 생성 실패',
        description: '사용자 ID 또는 DB 이름이 선택되지 않았습니다.'
      });
      return;
    }
    
    try {
      const response = await fetch('/api/users/multi-play/pub', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          employer_uid: selectedUserId,
          dbName,
          seat_status: data.seat_status,
          talk_status: data.talk_status,
          recruit_status: data.recruit_status,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || `API 요청 실패: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        toast({
          title: 'PUB 좌석 생성 성공',
          description: '새로운 PUB 좌석 상태가 생성되었습니다.'
        });
        setShowCreateModal(false);
        refreshPubSeatData();
      } else {
        throw new Error(result.message || '데이터 생성 실패');
      }
    } catch (error) {
      console.error('PUB 좌석 생성 오류:', error);
      toast({
        variant: 'destructive',
        title: 'PUB 좌석 생성 실패',
        description: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.'
      });
    }
  };
  
  // PUB 좌석 업데이트
  const handleUpdatePubSeat = async () => {
    if (selectedItems.length === 0) {
      toast({
        variant: 'destructive',
        title: '선택 오류',
        description: '업데이트할 항목을 선택해주세요.'
      });
      return;
    }
    
    if (!selectedUserId || !dbName) {
      toast({
        variant: 'destructive',
        title: '데이터 업데이트 실패',
        description: '사용자 ID 또는 DB 이름이 선택되지 않았습니다.'
      });
      return;
    }
    
    try {
      const selectedItem = selectedItems[0];
      
      const response = await fetch('/api/users/multi-play/pub', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: selectedItem.id,
          employer_uid: selectedUserId,
          dbName,
          seat_status: selectedItem.seat_status,
          talk_status: selectedItem.talk_status,
          recruit_status: selectedItem.recruit_status,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || `API 요청 실패: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        toast({
          title: 'PUB 좌석 업데이트 성공',
          description: 'PUB 좌석 상태가 업데이트되었습니다.'
        });
        refreshPubSeatData();
      } else {
        throw new Error(result.message || '데이터 업데이트 실패');
      }
    } catch (error) {
      console.error('PUB 좌석 업데이트 오류:', error);
      toast({
        variant: 'destructive',
        title: 'PUB 좌석 업데이트 실패',
        description: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.'
      });
    }
  };
  
  // PUB 좌석 삭제
  const handleDeletePubSeat = async () => {
    if (selectedItems.length === 0) {
      toast({
        variant: 'destructive',
        title: '선택 오류',
        description: '삭제할 항목을 선택해주세요.'
      });
      return;
    }
    
    if (!dbName) {
      toast({
        variant: 'destructive',
        title: '데이터 삭제 실패',
        description: 'DB 이름이 선택되지 않았습니다.'
      });
      return;
    }
    
    try {
      const selectedItem = selectedItems[0];
      
      const response = await fetch(`/api/users/multi-play/pub?id=${selectedItem.id}&dbName=${dbName}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || `API 요청 실패: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        toast({
          title: 'PUB 좌석 삭제 성공',
          description: 'PUB 좌석 상태가 삭제되었습니다.'
        });
        refreshPubSeatData();
        // 선택 초기화
        setSelectedItems([]);
      } else {
        throw new Error(result.message || '데이터 삭제 실패');
      }
    } catch (error) {
      console.error('PUB 좌석 삭제 오류:', error);
      toast({
        variant: 'destructive',
        title: 'PUB 좌석 삭제 실패',
        description: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.'
      });
    }
  };
  
  // 통신 상태 관리
  const handleManageTalkStatus = () => {
    if (selectedItems.length === 0) return;
    
    toast({
      title: '대화 상태 관리',
      description: `${selectedItems.length}개 항목의 대화 상태를 관리합니다.`,
    });
    // 여기에 대화 상태 관리 로직 구현
  };

  // 모집 상태 관리
  const handleManageRecruitStatus = () => {
    if (selectedItems.length === 0) return;
    
    toast({
      title: '모집 상태 관리',
      description: `${selectedItems.length}개 항목의 모집 상태를 관리합니다.`,
    });
    // 여기에 모집 상태 관리 로직 구현
  };

  // 좌석 상태 관리
  const handleManageSeatStatus = () => {
    if (selectedItems.length === 0) return;
    
    toast({
      title: '좌석 상태 관리',
      description: `${selectedItems.length}개 항목의 좌석 상태를 관리합니다.`,
    });
    // 여기에 좌석 상태 관리 로직 구현
  };
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {loading ? (
            <AlertCircle className="h-5 w-5 text-yellow-500" />
          ) : (
            <CheckCircle className="h-5 w-5 text-green-500" />
          )}
          <h3 className="text-lg font-medium">
            PUB 좌석 상태 {loading ? '로딩 중...' : `(${pubSeatData.length}개)`}
          </h3>
        </div>
        
        <button
          onClick={() => setShowCreateModal(true)}
          className="rounded-md bg-primary px-4 py-2 text-white hover:bg-primary/90"
          disabled={!selectedUserId}
        >
          새 PUB 좌석 추가
        </button>
      </div>
      
      <DataTable
        tableName="유저 PUB 좌석 상태"
        data={pubSeatData}
        isLoading={loading}
        customFormatters={{}}
        onSelectionChange={handleSelectionChange}
        showActions={true}
      />
      
      <PubSeatControlPanel 
        selectedItems={selectedItems}
        onCreateItem={() => setShowCreateModal(true)}
        onUpdateItem={handleUpdatePubSeat}
        onDeleteItem={handleDeletePubSeat}
        onManageSeatStatus={handleManageSeatStatus}
        onManageTalkStatus={handleManageTalkStatus}
        onManageRecruitStatus={handleManageRecruitStatus}
      />
      
      {showCreateModal && (
        <CreatePubSeatModal
          open={showCreateModal}
          onOpenChange={setShowCreateModal}
          onSubmit={handleCreatePubSeat}
          isSubmitting={false}
        />
      )}
    </div>
  );
};

export default PubTab; 