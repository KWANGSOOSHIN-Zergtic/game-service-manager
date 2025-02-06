import React, { useState } from "react";
import { Braces, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

// Object 내용을 문자열로 변환하는 유틸리티 함수
export const stringifyObject = (obj: object): string => {
  try {
    // JSON 형식인지 확인
    const jsonString = JSON.stringify(obj, null, 2);
    JSON.parse(jsonString); // 유효한 JSON인지 검증
    return jsonString;
  } catch {
    // JSON 형식이 아닌 경우 일반 문자열로 변환
    try {
      return obj.toString();
    } catch {
      return '[Object]';
    }
  }
};

interface ObjectDisplayProps {
  value: object;
  className?: string;
}

export const ObjectDisplay: React.FC<ObjectDisplayProps> = ({ value, className = '' }) => {
  const [isCopied, setIsCopied] = useState(false);
  const objectString = stringifyObject(value);
  const isJsonFormat = objectString.startsWith('{') || objectString.startsWith('[');

  const handleCopy = () => {
    navigator.clipboard.writeText(objectString).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  return (
    <div className={`flex justify-center ${className}`}>
      <Popover>
        <PopoverTrigger>
          <span className="inline-flex items-center gap-1 text-sky-600 font-medium bg-sky-100 px-3 py-1 rounded-full hover:bg-sky-200 cursor-pointer transition-colors">
            <Braces className="h-3 w-3" />
            {isJsonFormat ? 'JSON' : 'Object'}
          </span>
        </PopoverTrigger>
        <PopoverContent className="w-auto max-w-[300px] p-2">
          <div className="space-y-2">
            <div className="flex justify-between items-center pb-2 border-b border-gray-200">
              <span className="text-xs font-medium text-gray-600">
                {isJsonFormat ? 'JSON Content' : 'Object Content'}
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2 text-gray-600 hover:text-gray-900"
                onClick={handleCopy}
              >
                {isCopied ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            <pre className={`text-xs whitespace-pre-wrap break-words ${
              isJsonFormat ? 'text-sky-800' : 'text-gray-600'
            }`}>
              {objectString}
            </pre>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}; 