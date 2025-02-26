import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface ApiDebugInfoProps {
  requestUrl: string;
  requestMethod: string;
  requestHeaders: Record<string, string>;
  requestBody?: string;
  timestamp: string;
}

export const ApiDebugInfo: React.FC<ApiDebugInfoProps> = ({
  requestUrl,
  requestMethod,
  requestHeaders,
  requestBody,
  timestamp,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleOpen = () => setIsOpen(!isOpen);

  return (
    <div className="mb-4 bg-slate-50 border border-slate-200 rounded-md overflow-hidden">
      <div
        className="flex items-center gap-2 p-3 cursor-pointer font-medium text-slate-700 hover:bg-slate-100"
        onClick={toggleOpen}
      >
        {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        <span>요청데이터</span>
        <span className="text-xs text-slate-500 ml-auto">
          {new Date(timestamp).toLocaleString()}
        </span>
      </div>

      {isOpen && (
        <div className="p-3 border-t border-slate-200 text-sm">
          <div className="grid grid-cols-[120px_1fr] gap-2">
            <div className="font-medium text-slate-600">요청 URL:</div>
            <div className="font-mono text-xs break-all bg-slate-100 p-2 rounded">
              {requestUrl}
            </div>
            
            <div className="font-medium text-slate-600">요청 메소드:</div>
            <div>
              <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-medium">
                {requestMethod}
              </span>
            </div>
            
            <div className="font-medium text-slate-600">요청 헤더:</div>
            <div className="font-mono text-xs bg-slate-100 p-2 rounded">
              {Object.entries(requestHeaders).map(([key, value]) => (
                <div key={key} className="mb-1">
                  <span className="text-emerald-600">{key}</span>: {value}
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
      )}
    </div>
  );
}; 