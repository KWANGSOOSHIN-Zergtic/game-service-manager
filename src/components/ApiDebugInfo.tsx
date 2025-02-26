import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Eye, EyeOff, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';

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
}

const DebugInfoToggleButton: React.FC<{
  isOpen: boolean;
  onClick: () => void;
  title?: string;
  timestamp: string;
}> = ({ isOpen, onClick, title = '요청데이터', timestamp }) => {
  return (
    <div
      className="flex items-center gap-2 p-3 cursor-pointer font-medium text-slate-700 hover:bg-slate-100"
      onClick={onClick}
    >
      {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
      <span>{title}</span>
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
  title = '요청데이터'
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

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className={cn("mb-4 bg-slate-50 border border-slate-200 rounded-md overflow-hidden", className)}
    >
      <CollapsibleTrigger asChild>
        <div className="w-full">
          <DebugInfoToggleButton 
            isOpen={isOpen} 
            onClick={toggleOpen} 
            title={title}
            timestamp={timestamp}
          />
        </div>
      </CollapsibleTrigger>

      <CollapsibleContent>
        <div className="p-3 border-t border-slate-200 text-sm">
          <div className="grid grid-cols-[120px_1fr] gap-2">
            <div className="font-medium text-slate-600">요청 URL:</div>
            <div className="font-mono text-xs break-all bg-slate-100 p-2 rounded">
              {requestUrl}
            </div>
            
            <div className="font-medium text-slate-600">요청 메소드:</div>
            <div>
              <span className={cn(
                "px-2 py-1 rounded text-xs font-medium",
                {
                  "bg-blue-100 text-blue-700": requestMethod === "GET",
                  "bg-green-100 text-green-700": requestMethod === "POST",
                  "bg-yellow-100 text-yellow-700": requestMethod === "PUT",
                  "bg-red-100 text-red-700": requestMethod === "DELETE",
                  "bg-purple-100 text-purple-700": !["GET", "POST", "PUT", "DELETE"].includes(requestMethod)
                }
              )}>
                {requestMethod}
              </span>
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
                <pre className="font-mono text-xs bg-slate-100 p-2 rounded break-all whitespace-pre-wrap">
                  {requestBody}
                </pre>
              </>
            )}
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}; 