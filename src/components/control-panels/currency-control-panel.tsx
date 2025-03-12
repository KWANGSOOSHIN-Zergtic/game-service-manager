'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Database, RefreshCw, PlusCircle, Edit, Trash2, Info, ShoppingBag, Download, Send } from "lucide-react";

// 컨트롤 패널 버튼 정의 인터페이스
export interface ControlPanelButton {
  id: string;
  label: string;
  icon: React.ReactNode;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  bgColorClass?: string;
  onClick: () => void;
  disabled?: boolean;
}

// Data Control Panel 속성 정의
export interface DataControlsPanelProps {
  onCreateClick?: () => void;
  onUpdateClick?: () => void;
  onDeleteClick?: () => void;
  onRefreshClick?: () => void;
  className?: string;
  title?: string;
  showRefreshButton?: boolean;
  showInfoMessage?: boolean;
  infoMessage?: string;
  customButtons?: ControlPanelButton[];
}

export function DataControlsPanel({
  onCreateClick,
  onUpdateClick,
  onDeleteClick,
  onRefreshClick,
  className = '',
  title = 'Data Control Panel',
  showRefreshButton = true,
  showInfoMessage = true,
  infoMessage = '데이터를 수정하거나 삭제하려면 먼저 행을 선택하세요.',
  customButtons
}: DataControlsPanelProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  // 새로고침 처리 함수
  const handleRefresh = () => {
    setIsRefreshing(true);
    console.log('[DataControlsPanel] 데이터 새로고침 요청');
    
    // 커스텀 새로고침 핸들러가 제공된 경우 호출
    if (onRefreshClick) {
      onRefreshClick();
    }
    
    // 새로고침 시뮬레이션
    setTimeout(() => {
      // 페이지 새로고침 이벤트 발생
      window.dispatchEvent(new CustomEvent('refresh-data'));
      setIsRefreshing(false);
      console.log('[DataControlsPanel] 데이터 새로고침 완료');
    }, 1000);
  };

  // 기본 버튼 구성
  const defaultButtons: ControlPanelButton[] = [
    {
      id: 'create',
      label: 'CREATE',
      icon: <PlusCircle className="h-3.5 w-3.5 mr-1.5" />,
      bgColorClass: 'bg-green-500 hover:bg-green-600 text-white',
      variant: 'default',
      onClick: onCreateClick || (() => console.log('[DataControlsPanel] CREATE 버튼 클릭됨')),
      disabled: false
    },
    {
      id: 'update',
      label: 'UPDATE',
      icon: <Edit className="h-3.5 w-3.5 mr-1.5" />,
      bgColorClass: 'bg-blue-500 hover:bg-blue-600 text-white',
      variant: 'default',
      onClick: onUpdateClick || (() => console.log('[DataControlsPanel] UPDATE 버튼 클릭됨')),
      disabled: false
    },
    {
      id: 'delete',
      label: 'DELETE',
      icon: <Trash2 className="h-3.5 w-3.5 mr-1.5" />,
      bgColorClass: 'bg-red-500 hover:bg-red-600 text-white',
      variant: 'default',
      onClick: onDeleteClick || (() => console.log('[DataControlsPanel] DELETE 버튼 클릭됨')),
      disabled: false
    }
  ];

  // 사용할 버튼 배열 결정 (커스텀 버튼이 있으면 커스텀 버튼을, 없으면 기본 버튼을 사용)
  const buttonsToRender = customButtons || defaultButtons;

  return (
    <div className={`bg-gray-100 rounded-md p-3 shadow-sm ${className}`}>
      <div className="flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-purple-900 flex items-center">
            <Database className="h-4 w-4 mr-1.5 text-purple-700" />
            {title}
          </h3>
          {showRefreshButton && (
            <Button 
              variant="outline" 
              size="sm" 
              className="h-7 bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-200 hover:text-purple-900"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-3.5 w-3.5 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} /> 
              {isRefreshing ? '새로고침 중...' : '새로고침'}
            </Button>
          )}
        </div>
        
        {/* 버튼 그리드 */}
        <div className="grid grid-cols-3 gap-2">
          {buttonsToRender.map((button) => (
            <Button 
              key={button.id}
              onClick={button.onClick}
              className={`text-xs h-8 shadow-sm ${button.bgColorClass || ''}`}
              variant={button.variant || 'default'}
              disabled={button.disabled}
            >
              {button.icon}
              {button.label}
            </Button>
          ))}
        </div>
        
        {/* 정보 메시지 */}
        {showInfoMessage && (
          <div className="mt-2 text-xs text-purple-800 bg-purple-50 p-1.5 rounded">
            <div className="flex items-center">
              <Info className="h-3.5 w-3.5 mr-1 text-purple-600" />
              <span>{infoMessage}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Advanced Data Control Panel 속성 정의
export interface AdvancedDataControlsPanelProps {
  onUseItemClick?: () => void;
  onGetItemClick?: () => void;
  onSendItemClick?: () => void;
  onRefreshClick?: () => void;
  className?: string;
  title?: string;
  showRefreshButton?: boolean;
  showInfoMessage?: boolean;
  infoMessage?: string;
  customButtons?: ControlPanelButton[];
}

export function AdvancedDataControlsPanel({
  onUseItemClick,
  onGetItemClick,
  onSendItemClick,
  onRefreshClick,
  className = '',
  title = 'Advanced Data Control Panel',
  showRefreshButton = true,
  showInfoMessage = true,
  infoMessage = '아이템을 사용하거나 전송하려면 먼저 행을 선택하세요.',
  customButtons
}: AdvancedDataControlsPanelProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  // 새로고침 처리 함수
  const handleRefresh = () => {
    setIsRefreshing(true);
    console.log('[AdvancedDataControlsPanel] 데이터 새로고침 요청');
    
    // 커스텀 새로고침 핸들러가 제공된 경우 호출
    if (onRefreshClick) {
      onRefreshClick();
    }
    
    // 새로고침 시뮬레이션
    setTimeout(() => {
      // 페이지 새로고침 이벤트 발생
      window.dispatchEvent(new CustomEvent('refresh-data'));
      setIsRefreshing(false);
      console.log('[AdvancedDataControlsPanel] 데이터 새로고침 완료');
    }, 1000);
  };

  // 기본 버튼 구성
  const defaultButtons: ControlPanelButton[] = [
    {
      id: 'use-item',
      label: 'USE ITEM',
      icon: <ShoppingBag className="h-3.5 w-3.5 mr-1.5" />,
      bgColorClass: 'bg-indigo-500 hover:bg-indigo-600 text-white',
      variant: 'default',
      onClick: onUseItemClick || (() => console.log('[AdvancedDataControlsPanel] USE ITEM 버튼 클릭됨')),
      disabled: false
    },
    {
      id: 'get-item',
      label: 'GET ITEM',
      icon: <Download className="h-3.5 w-3.5 mr-1.5" />,
      bgColorClass: 'bg-amber-500 hover:bg-amber-600 text-white',
      variant: 'default',
      onClick: onGetItemClick || (() => console.log('[AdvancedDataControlsPanel] GET ITEM 버튼 클릭됨')),
      disabled: false
    },
    {
      id: 'send-item',
      label: 'SEND ITEM',
      icon: <Send className="h-3.5 w-3.5 mr-1.5" />,
      bgColorClass: 'bg-cyan-500 hover:bg-cyan-600 text-white',
      variant: 'default',
      onClick: onSendItemClick || (() => console.log('[AdvancedDataControlsPanel] SEND ITEM 버튼 클릭됨')),
      disabled: false
    }
  ];

  // 사용할 버튼 배열 결정 (커스텀 버튼이 있으면 커스텀 버튼을, 없으면 기본 버튼을 사용)
  const buttonsToRender = customButtons || defaultButtons;

  return (
    <div className={`bg-gray-100 rounded-md p-3 shadow-sm ${className}`}>
      <div className="flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-purple-900 flex items-center">
            <Database className="h-4 w-4 mr-1.5 text-purple-700" />
            {title}
          </h3>
          {showRefreshButton && (
            <Button 
              variant="outline" 
              size="sm" 
              className="h-7 bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-200 hover:text-purple-900"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-3.5 w-3.5 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} /> 
              {isRefreshing ? '새로고침 중...' : '새로고침'}
            </Button>
          )}
        </div>
        
        {/* 버튼 그리드 */}
        <div className="grid grid-cols-3 gap-2">
          {buttonsToRender.map((button) => (
            <Button 
              key={button.id}
              onClick={button.onClick}
              className={`text-xs h-8 shadow-sm ${button.bgColorClass || ''}`}
              variant={button.variant || 'default'}
              disabled={button.disabled}
            >
              {button.icon}
              {button.label}
            </Button>
          ))}
        </div>
        
        {/* 정보 메시지 */}
        {showInfoMessage && (
          <div className="mt-2 text-xs text-purple-800 bg-purple-50 p-1.5 rounded">
            <div className="flex items-center">
              <Info className="h-3.5 w-3.5 mr-1 text-purple-600" />
              <span>{infoMessage}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 