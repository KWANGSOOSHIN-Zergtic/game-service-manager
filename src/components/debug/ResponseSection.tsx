import React from 'react';
import { useDebugContext } from './DebugContext';
import { Button } from '@/components/ui/button';
import { Copy } from 'lucide-react';
import { ApiResponse } from './types';
import { StatusIndicator } from './StatusIndicator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ResponseSectionProps {
  response: ApiResponse;
}

/**
 * API 응답 정보를 표시하는 섹션 컴포넌트
 */
export const ResponseSection: React.FC<ResponseSectionProps> = ({ response }) => {
  const { copyToClipboard, copiedSection } = useDebugContext();
  
  if (!response) {
    return null;
  }
  
  // 응답 데이터 포맷팅
  const responseText = JSON.stringify(response, null, 2);
  const responseStatus = response.success === true ? '성공' : '실패';
  const statusClass = response.success === true ? 'text-green-600' : 'text-red-600';
  
  // 응답 헤더가 있는지 확인하고 안전하게 타입 변환
  const hasHeaders = response.headers !== undefined && response.headers !== null;
  
  const formattedHeaders = hasHeaders 
    ? Object.entries(response.headers as Record<string, string>)
        .map(([key, value]) => `${key}: ${value}`)
        .join('\n')
    : '헤더 정보 없음';
  
  return (
    <Card className="mb-4">
      <CardHeader className="py-3">
        <CardTitle className="text-sm flex items-center justify-between">
          <span className="flex items-center">
            응답 정보
            <span className={`ml-2 font-medium ${statusClass}`}>
              {responseStatus}
            </span>
            <StatusIndicator success={response.success} />
          </span>
          <Button
            size="sm" 
            variant="outline"
            className="h-7"
            onClick={() => copyToClipboard(responseText, 'response')}
          >
            <Copy className="h-3.5 w-3.5 mr-1" />
            {copiedSection === 'response' ? '복사됨!' : '전체 복사'}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="text-xs space-y-3 pt-0">
        {response.message && (
          <div>
            <p className="font-semibold mb-1">메시지:</p>
            <div className="bg-gray-50 p-2 rounded font-mono break-all">
              {String(response.message)}
            </div>
          </div>
        )}
        
        {response.error && (
          <div>
            <p className="font-semibold mb-1 text-red-600">오류:</p>
            <div className="bg-red-50 p-2 rounded font-mono break-all">
              {String(response.error)}
            </div>
          </div>
        )}
        
        {hasHeaders && (
          <div>
            <div className="flex justify-between items-center mb-1">
              <p className="font-semibold">헤더:</p>
              <Button
                size="sm"
                variant="ghost" 
                className="h-6"
                onClick={() => copyToClipboard(formattedHeaders, 'headers')}
              >
                <Copy className="h-3 w-3 mr-1" />
                {copiedSection === 'headers' ? '복사됨!' : '복사'}
              </Button>
            </div>
            <pre className="bg-gray-50 p-2 rounded font-mono text-xs whitespace-pre-wrap">
              {formattedHeaders}
            </pre>
          </div>
        )}
        
        <div>
          <div className="flex justify-between items-center mb-1">
            <p className="font-semibold">응답 본문:</p>
            <Button
              size="sm"
              variant="ghost" 
              className="h-6"
              onClick={() => copyToClipboard(responseText, 'body')}
            >
              <Copy className="h-3 w-3 mr-1" />
              {copiedSection === 'body' ? '복사됨!' : '복사'}
            </Button>
          </div>
          <pre className="bg-gray-50 p-2 rounded font-mono text-xs whitespace-pre-wrap overflow-auto max-h-80">
            {responseText}
          </pre>
        </div>
        
        {response.timestamp && (
          <div className="text-gray-500 text-xs flex justify-between">
            <span>타임스탬프: {String(response.timestamp)}</span>
            {response.responseTime && <span>응답 시간: {String(response.responseTime)}</span>}
          </div>
        )}
      </CardContent>
    </Card>
  );
}; 