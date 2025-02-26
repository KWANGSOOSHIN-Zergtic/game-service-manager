import React from 'react';
import { useDebugContext } from './DebugContext';
import { RequestSection } from './RequestSection';
import { ResponseSection } from './ResponseSection';
import { Button } from '@/components/ui/button';
import { X, Copy, AlertTriangle } from 'lucide-react';
import { ApiDebugInfo } from './types';

/**
 * 디버그 정보를 표시하는 패널 컴포넌트
 */
export const DebugPanel: React.FC = () => {
  const { 
    isVisible, 
    toggleVisibility, 
    debugInfo, 
    requestInfo, 
    apiDebugInfo, 
    clearDebugData 
  } = useDebugContext();
  
  // 패널이 비활성화 상태이면 렌더링하지 않음
  if (!isVisible) {
    return null;
  }
  
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50 p-4 max-h-[80vh] overflow-auto">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-lg font-semibold">API 디버그 정보</h2>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            className="h-8"
            onClick={clearDebugData}
          >
            초기화
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-8"
            onClick={toggleVisibility}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* 디버그 정보가 없는 경우 안내 메시지 표시 */}
      {!debugInfo && !requestInfo && !apiDebugInfo && (
        <div className="flex items-center justify-center p-8 text-gray-500">
          <AlertTriangle className="h-5 w-5 mr-2" />
          <p>API 호출이 발생하면 디버그 정보가 여기에 표시됩니다.</p>
        </div>
      )}
      
      {/* API 요청 정보 섹션 */}
      {requestInfo && <RequestSection requestInfo={requestInfo} />}
      
      {/* API 응답 정보 섹션 */}
      {debugInfo && <ResponseSection response={debugInfo} />}
      
      {/* API 디버그 정보 섹션 (추가 디버그 정보가 있는 경우) */}
      {apiDebugInfo && <ApiDebugInfoSection debugInfo={apiDebugInfo} />}
    </div>
  );
};

/**
 * API 디버그 정보를 표시하는 하위 섹션 컴포넌트
 */
const ApiDebugInfoSection: React.FC<{ debugInfo: ApiDebugInfo }> = ({ debugInfo }) => {
  const { copyToClipboard, copiedSection } = useDebugContext();
  
  const infoText = JSON.stringify(debugInfo, null, 2);
  
  return (
    <div className="border rounded-md p-3 mb-4 bg-gray-50">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-medium">추가 디버그 정보</h3>
        <Button
          size="sm"
          variant="ghost"
          className="h-6"
          onClick={() => copyToClipboard(infoText, 'all')}
        >
          <Copy className="h-3 w-3 mr-1" />
          {copiedSection === 'all' ? '복사됨!' : '복사'}
        </Button>
      </div>
      <div className="text-xs space-y-2">
        <div>
          <span className="font-semibold">요청 URL:</span> {debugInfo.requestUrl}
        </div>
        <div>
          <span className="font-semibold">요청 메소드:</span> {debugInfo.requestMethod}
        </div>
        <div>
          <span className="font-semibold">타임스탬프:</span> {debugInfo.timestamp}
        </div>
        {debugInfo.requestBody && (
          <div>
            <span className="font-semibold">요청 본문:</span>
            <pre className="bg-white p-2 rounded font-mono text-xs mt-1 whitespace-pre-wrap overflow-auto max-h-40">
              {debugInfo.requestBody}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}; 