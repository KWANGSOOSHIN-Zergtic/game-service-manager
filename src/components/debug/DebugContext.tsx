import React, { createContext, useContext, useState, useEffect } from 'react';
import { ApiResponse, ApiDebugInfo, ApiRequestInfo, CopiedSection, ApiResponseStatus } from './types';
import { useStorageState } from './hooks/useStorageState';

interface DebugContextType {
  // 상태
  isVisible: boolean;
  isDebugMode: boolean;
  debugInfo: ApiResponse | null;
  requestInfo: ApiRequestInfo | null;
  apiDebugInfo: ApiDebugInfo | null;
  copiedSection: CopiedSection;
  
  // 액션
  toggleVisibility: () => void;
  toggleDebugMode: () => void;
  setDebugInfo: (info: ApiResponse | null) => void;
  setRequestInfo: (info: ApiRequestInfo | null) => void;
  setApiDebugInfo: (info: ApiDebugInfo | null) => void;
  copyToClipboard: (text: string, section: CopiedSection) => void;
  clearDebugData: () => void;
  updateApiResponseStatus: (status: ApiResponseStatus) => void;
}

const DebugContext = createContext<DebugContextType | undefined>(undefined);

/**
 * 디버그 컨텍스트를 사용하기 위한 커스텀 훅
 * 컨텍스트 프로바이더 내부에서만 사용 가능
 */
export const useDebugContext = () => {
  const context = useContext(DebugContext);
  if (context === undefined) {
    throw new Error('useDebugContext must be used within a DebugProvider');
  }
  return context;
};

export const DebugProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // localStorage에서 디버그 패널 표시 상태 관리
  const [isVisible, setIsVisible] = useStorageState('debugSectionVisible', false);
  
  // localStorage에서 디버그 모드 상태 관리
  const [isDebugMode, setIsDebugMode] = useStorageState('debugModeEnabled', false);
  
  // 디버그 데이터 상태
  const [debugInfo, setDebugInfo] = useState<ApiResponse | null>(null);
  const [requestInfo, setRequestInfo] = useState<ApiRequestInfo | null>(null);
  const [apiDebugInfo, setApiDebugInfo] = useState<ApiDebugInfo | null>(null);
  const [copiedSection, setCopiedSection] = useState<CopiedSection>(null);
  
  // API 응답 상태 관리
  const updateApiResponseStatus = (status: ApiResponseStatus) => {
    try {
      if (status) {
        sessionStorage.setItem('apiResponseStatus', status);
      } else {
        sessionStorage.removeItem('apiResponseStatus');
      }
    } catch (e) {
      console.error('[DebugProvider] API 응답 상태 저장 중 오류:', e);
    }
  };
  
  // debugInfo 상태가 변경될 때마다 API 응답 상태 업데이트
  useEffect(() => {
    if (debugInfo) {
      if (debugInfo.error) {
        updateApiResponseStatus('error');
      } else if (debugInfo.success === true) {
        updateApiResponseStatus('success');
      } else if (debugInfo.success === false) {
        updateApiResponseStatus('failure');
      } else {
        // 상태가 명확하지 않은 경우 상태 제거
        updateApiResponseStatus(null);
      }
    } else {
      // debugInfo가 없는 경우 상태 제거
      updateApiResponseStatus(null);
    }
  }, [debugInfo]);
  
  // 디버그 섹션 토글 함수
  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };
  
  // 디버그 모드 토글 함수
  const toggleDebugMode = () => {
    setIsDebugMode(!isDebugMode);
  };
  
  // 클립보드 복사 함수
  const copyToClipboard = (text: string, section: CopiedSection) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        setCopiedSection(section);
        setTimeout(() => setCopiedSection(null), 1500);
      })
      .catch((err) => {
        console.error('클립보드 복사 실패:', err);
        alert('클립보드 복사에 실패했습니다.');
      });
  };
  
  // 디버그 데이터 초기화
  const clearDebugData = () => {
    setDebugInfo(null);
    setRequestInfo(null);
    setApiDebugInfo(null);
  };
  
  // 커스텀 이벤트 리스너 등록
  useEffect(() => {
    const handleToggleDebugSection = () => {
      console.log('[DebugProvider] toggle-debug-section 이벤트 수신됨');
      toggleVisibility();
    };
    
    window.addEventListener('toggle-debug-section', handleToggleDebugSection);
    return () => {
      window.removeEventListener('toggle-debug-section', handleToggleDebugSection);
    };
  }, []);
  
  const value = {
    isVisible,
    isDebugMode,
    debugInfo,
    requestInfo,
    apiDebugInfo,
    copiedSection,
    toggleVisibility,
    toggleDebugMode,
    setDebugInfo,
    setRequestInfo,
    setApiDebugInfo,
    copyToClipboard,
    clearDebugData,
    updateApiResponseStatus
  };
  
  return (
    <DebugContext.Provider value={value}>
      {children}
    </DebugContext.Provider>
  );
}; 