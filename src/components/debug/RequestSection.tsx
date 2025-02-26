import React from 'react';
import { useDebugContext } from './DebugContext';
import { Button } from '@/components/ui/button';
import { Copy } from 'lucide-react';
import { ApiRequestInfo } from './types';
import { StatusIndicator } from './StatusIndicator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface RequestSectionProps {
  requestInfo: ApiRequestInfo;
}

/**
 * API 요청 정보를 표시하는 섹션 컴포넌트
 */
export const RequestSection: React.FC<RequestSectionProps> = ({ requestInfo }) => {
  const { copyToClipboard, copiedSection } = useDebugContext();
  
  if (!requestInfo) {
    return null;
  }
  
  const { url, method, headers, data } = requestInfo;
  
  // 요청 본문을 문자열로 변환
  const bodyText = data ? JSON.stringify(data, null, 2) : '데이터 없음';
  
  // 헤더 포맷팅
  const headersText = headers 
    ? Object.entries(headers)
        .map(([key, value]) => `${key}: ${value}`)
        .join('\n')
    : '헤더 없음';
  
  return (
    <Card className="mb-4">
      <CardHeader className="py-3">
        <CardTitle className="text-sm flex items-center justify-between">
          <span>
            요청 정보
            <StatusIndicator value={!!requestInfo} type="requestInfo" label="RequestInfo" />
          </span>
          <Button
            size="sm" 
            variant="outline"
            className="h-7"
            onClick={() => copyToClipboard(JSON.stringify(requestInfo, null, 2), 'request')}
          >
            <Copy className="h-3.5 w-3.5 mr-1" />
            {copiedSection === 'request' ? '복사됨!' : '전체 복사'}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="text-xs space-y-3 pt-0">
        <div>
          <p className="font-semibold mb-1">URL:</p>
          <div className="bg-gray-50 p-2 rounded font-mono break-all">
            <span className="text-blue-600 font-bold">{method}</span> {url}
          </div>
        </div>
        
        <div>
          <div className="flex justify-between items-center mb-1">
            <p className="font-semibold">헤더:</p>
            <Button
              size="sm"
              variant="ghost" 
              className="h-6"
              onClick={() => copyToClipboard(headersText, 'requestHeaders')}
            >
              <Copy className="h-3 w-3 mr-1" />
              {copiedSection === 'requestHeaders' ? '복사됨!' : '복사'}
            </Button>
          </div>
          <pre className="bg-gray-50 p-2 rounded font-mono text-xs whitespace-pre-wrap">
            {headersText}
          </pre>
        </div>
        
        {data && (
          <div>
            <div className="flex justify-between items-center mb-1">
              <p className="font-semibold">요청 본문:</p>
              <Button
                size="sm"
                variant="ghost" 
                className="h-6"
                onClick={() => copyToClipboard(bodyText, 'requestBody')}
              >
                <Copy className="h-3 w-3 mr-1" />
                {copiedSection === 'requestBody' ? '복사됨!' : '복사'}
              </Button>
            </div>
            <pre className="bg-gray-50 p-2 rounded font-mono text-xs whitespace-pre-wrap overflow-auto max-h-60">
              {bodyText}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
}; 