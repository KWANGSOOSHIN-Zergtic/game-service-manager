import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Eye, EyeOff, Clock, Database, Code } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';

// 민감한 헤더 키 목록 (마스킹 처리 대상)
const SENSITIVE_HEADERS = [
  'authorization',
  'x-api-key',
  'token',
  'api-key',
  'password',
  'secret',
  'x-auth-token'
];

export interface ApiDebugInfoProps {
  requestUrl: string;
  requestMethod: string;
  requestHeaders: Record<string, string>;
  requestBody?: string;
  timestamp: string;
  className?: string;
  title?: string;
  compact?: boolean;
}

const DebugInfoToggleButton: React.FC<{
  isOpen: boolean;
  onClick: () => void;
  title?: string;
  timestamp: string;
  method: string;
}> = ({ isOpen, onClick, title = '요청데이터', timestamp, method }) => {
  return (
    <div
      className="flex items-center gap-2 p-3 cursor-pointer font-medium text-slate-700 hover:bg-slate-100 transition-colors"
      onClick={onClick}
    >
      {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
      <Database size={16} className="text-purple-500" />
      <span>{title}</span>
      
      <Badge className={cn(
        "ml-3 px-2 py-0.5 text-xs",
        {
          "bg-blue-100 text-blue-700 hover:bg-blue-200": method === "GET",
          "bg-green-100 text-green-700 hover:bg-green-200": method === "POST", 
          "bg-yellow-100 text-yellow-700 hover:bg-yellow-200": method === "PUT",
          "bg-red-100 text-red-700 hover:bg-red-200": method === "DELETE",
          "bg-purple-100 text-purple-700 hover:bg-purple-200": !["GET", "POST", "PUT", "DELETE"].includes(method)
        }
      )}>
        {method}
      </Badge>
      
      <span className="text-xs text-slate-500 ml-auto flex items-center gap-1">
        <Clock size={12} />
        {new Date(timestamp).toLocaleString()}
      </span>
    </div>
  );
};

export const ApiDebugInfo: React.FC<ApiDebugInfoProps> = ({
  requestUrl,
  requestMethod,
  requestHeaders,
  requestBody,
  timestamp,
  className,
  title = '요청데이터',
  compact = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showMaskedValues, setShowMaskedValues] = useState<Record<string, boolean>>({});

  const toggleOpen = () => setIsOpen(!isOpen);
  
  const toggleMaskedValue = (key: string) => {
    setShowMaskedValues(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };
  
  // 민감한 헤더 값을 마스킹 처리하는 함수
  const renderHeaderValue = (key: string, value: string) => {
    const isSensitive = SENSITIVE_HEADERS.includes(key.toLowerCase());
    
    // 민감하지 않은 정보는 그대로 표시
    if (!isSensitive) return value;
    
    // 민감한 정보는 마스킹 처리하되, 토글 버튼으로 표시/숨김 가능
    return (
      <div className="flex items-center gap-2">
        {showMaskedValues[key] ? value : '••••••••••••••••'}
        <Button
          variant="ghost" 
          size="icon" 
          className="h-4 w-4 p-0" 
          onClick={(e) => {
            e.stopPropagation();
            toggleMaskedValue(key);
          }}
        >
          {showMaskedValues[key] ? <EyeOff size={12} /> : <Eye size={12} />}
        </Button>
      </div>
    );
  };

  // 커스텀 디버그 헤더 찾기
  const customDebugAPI = requestHeaders['X-Debug-Api'] || '';

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className={cn(
        "mb-4 bg-slate-50 border border-slate-200 rounded-md overflow-hidden shadow-sm",
        compact ? "text-xs" : "text-sm",
        className
      )}
    >
      <CollapsibleTrigger asChild>
        <div className="w-full">
          <DebugInfoToggleButton 
            isOpen={isOpen} 
            onClick={toggleOpen} 
            title={customDebugAPI ? `${title} - ${customDebugAPI}` : title}
            timestamp={timestamp}
            method={requestMethod}
          />
        </div>
      </CollapsibleTrigger>

      <CollapsibleContent>
        <div className="p-3 border-t border-slate-200">
          <div className="grid grid-cols-[120px_1fr] gap-2">
            <div className="font-medium text-slate-600">요청 URL:</div>
            <div className="font-mono text-xs break-all bg-slate-100 p-2 rounded">
              {requestUrl}
            </div>
            
            <div className="font-medium text-slate-600">요청 메소드:</div>
            <div>
              <Badge className={cn(
                "px-2 py-1 text-xs font-medium",
                {
                  "bg-blue-100 text-blue-700 hover:bg-blue-200": requestMethod === "GET",
                  "bg-green-100 text-green-700 hover:bg-green-200": requestMethod === "POST", 
                  "bg-yellow-100 text-yellow-700 hover:bg-yellow-200": requestMethod === "PUT",
                  "bg-red-100 text-red-700 hover:bg-red-200": requestMethod === "DELETE",
                  "bg-purple-100 text-purple-700 hover:bg-purple-200": !["GET", "POST", "PUT", "DELETE"].includes(requestMethod)
                }
              )}>
                {requestMethod}
              </Badge>
              
              {customDebugAPI && (
                <Badge variant="outline" className="ml-2 px-2 py-1 text-xs font-medium border-purple-200 text-purple-700">
                  <Code size={12} className="mr-1" />
                  {customDebugAPI}
                </Badge>
              )}
            </div>
            
            <div className="font-medium text-slate-600">요청 헤더:</div>
            <div className="font-mono text-xs bg-slate-100 p-2 rounded">
              {Object.entries(requestHeaders).map(([key, value]) => (
                <div key={key} className="mb-1">
                  <span className="text-emerald-600">{key}</span>: {renderHeaderValue(key, value)}
                </div>
              ))}
            </div>
            
            {requestBody && (
              <>
                <div className="font-medium text-slate-600">요청 바디:</div>
                <pre className="font-mono text-xs bg-slate-100 p-2 rounded break-all whitespace-pre-wrap overflow-auto max-h-60">
                  {requestBody}
                </pre>
              </>
            )}
            
            <div className="font-medium text-slate-600">타임스탬프:</div>
            <div className="font-mono text-xs">
              {new Date(timestamp).toLocaleString()} 
              ({Math.floor((Date.now() - new Date(timestamp).getTime()) / 1000)}초 전)
            </div>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}; 