'use client';

import React, { useState } from 'react';
import JSONPretty from 'react-json-pretty';
import 'react-json-pretty/themes/monikai.css';
import { ClipboardCopy, Check } from 'lucide-react';
import { Button } from './button';

/**
 * JsonViewer 컴포넌트에서 사용할 테마 옵션
 */
export enum JsonTheme {
  MONOKAI = 'monokai',
  DARK = 'dark',
  LIGHT = 'light',
  CUSTOM = 'custom',
}

export interface JsonViewerCustomProps {
  data: unknown;
  className?: string;
  theme?: JsonTheme;
  copyable?: boolean;
  onCopy?: () => void;
}

/**
 * 다양한 테마를 지원하는 JSON 데이터 뷰어 컴포넌트
 */
export function JsonViewerCustom({ 
  data, 
  className = '', 
  theme = JsonTheme.MONOKAI,
  copyable = false,
  onCopy
}: JsonViewerCustomProps) {
  const [copied, setCopied] = useState(false);

  // 테마 스타일 정의
  const themes = {
    [JsonTheme.MONOKAI]: {
      main: 'line-height:1.3;color:#66d9ef;background:#272822;overflow:auto;padding:1em;',
      error: 'line-height:1.3;color:#f92672;background:#272822;overflow:auto;padding:1em;',
      key: 'color:#f92672;',
      string: 'color:#a6e22e;',
      value: 'color:#fd971f;',
      boolean: 'color:#ac81fe;',
    },
    [JsonTheme.DARK]: {
      main: 'line-height:1.3;color:#c1c1c1;background:#1e1e1e;overflow:auto;padding:1em;',
      error: 'line-height:1.3;color:#e57373;background:#1e1e1e;overflow:auto;padding:1em;',
      key: 'color:#569cd6;',
      string: 'color:#ce9178;',
      value: 'color:#dcdcaa;',
      boolean: 'color:#4fc1ff;',
    },
    [JsonTheme.LIGHT]: {
      main: 'line-height:1.3;color:#333;background:#f7f7f7;overflow:auto;padding:1em;',
      error: 'line-height:1.3;color:#e51c23;background:#f7f7f7;overflow:auto;padding:1em;',
      key: 'color:#0070c1;',
      string: 'color:#008000;',
      value: 'color:#ca8500;',
      boolean: 'color:#0451a5;',
    },
    [JsonTheme.CUSTOM]: {
      main: 'line-height:1.3;color:#e0e0e0;background:#2d2d2d;overflow:auto;padding:1em;',
      error: 'line-height:1.3;color:#ff6e6e;background:#2d2d2d;overflow:auto;padding:1em;',
      key: 'color:#ff9cac;',
      string: 'color:#7ec699;',
      value: 'color:#f8c555;',
      boolean: 'color:#569cd6;',
    },
  };

  // 클립보드에 복사하는 함수
  const handleCopy = () => {
    if (typeof data === 'object') {
      navigator.clipboard.writeText(JSON.stringify(data, null, 2))
        .then(() => {
          setCopied(true);
          if (onCopy) onCopy();
          setTimeout(() => setCopied(false), 1500);
        })
        .catch((err) => {
          console.error('복사에 실패했습니다:', err);
        });
    } else if (typeof data === 'string') {
      navigator.clipboard.writeText(data)
        .then(() => {
          setCopied(true);
          if (onCopy) onCopy();
          setTimeout(() => setCopied(false), 1500);
        })
        .catch((err) => {
          console.error('복사에 실패했습니다:', err);
        });
    }
  };

  return (
    <div className={`relative font-mono text-xs ${className}`}>
      {copyable && (
        <Button
          variant="ghost"
          size="sm"
          className="absolute right-2 top-2 h-8 w-8 p-0"
          onClick={handleCopy}
          title={copied ? '복사됨' : 'JSON 복사'}
        >
          {copied ? (
            <Check className="h-4 w-4 text-green-500" />
          ) : (
            <ClipboardCopy className="h-4 w-4" />
          )}
        </Button>
      )}
      <JSONPretty 
        id="json-pretty"
        data={data}
        theme={themes[theme]}
      />
    </div>
  );
} 