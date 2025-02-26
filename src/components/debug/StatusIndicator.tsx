import React from 'react';
import { CheckCircle2, X, AlertTriangle } from 'lucide-react';
import { StatusType } from './types';

interface StatusIndicatorProps {
  success?: boolean;
  value?: unknown;
  type?: StatusType;
  label?: string;
}

/**
 * 성공, 실패, 경고 등의 상태를 아이콘으로 표시하는 컴포넌트
 */
export const StatusIndicator: React.FC<StatusIndicatorProps> = ({ 
  success, 
  value, 
  type,
  label
}) => {
  if (type && label) {
    // 디버그 정보 상태 표시 (requestInfo, apiDebugInfo, debugInfo)
    return (
      <span className="flex items-center bg-gray-50 px-2 py-1 rounded">
        {value ? 
          <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-green-600" /> : 
          <X className="w-3.5 h-3.5 mr-1 text-red-500" />
        }
        <span className="font-mono">{label}: {value ? '✅' : '❌'}</span>
      </span>
    );
  }
  
  // 기본 성공/실패 상태 표시
  if (success === undefined) {
    return null;
  }
  
  if (success === true) {
    return (
      <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-full flex items-center">
        <CheckCircle2 className="w-3 h-3 mr-1" />성공
      </span>
    );
  }
  
  if (success === false) {
    return (
      <span className="ml-2 px-2 py-0.5 bg-red-100 text-red-800 text-xs rounded-full flex items-center">
        <X className="w-3 h-3 mr-1" />실패
      </span>
    );
  }
  
  // 미정 상태
  return (
    <span className="ml-2 px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs rounded-full flex items-center">
      <AlertTriangle className="w-3 h-3 mr-1" />처리 중
    </span>
  );
}; 