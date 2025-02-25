'use client';

import React from 'react';
import dynamic from 'next/dynamic';

// react-json-view를 서버 사이드에서는 로드하지 않도록 dynamic import 사용
const ReactJson = dynamic(() => import('react-json-view'), { ssr: false });

interface JsonViewerProps {
  data: any;
  className?: string;
  collapsed?: boolean;
  displayDataTypes?: boolean;
  displayObjectSize?: boolean;
  enableClipboard?: boolean;
  indentWidth?: number;
}

/**
 * JSON 데이터를 시각적으로 보기 좋게 표시하는 컴포넌트
 * react-json-view 라이브러리를 사용하여 구현
 */
export function JsonViewer({
  data,
  className = '',
  collapsed = false,
  displayDataTypes = true,
  displayObjectSize = true,
  enableClipboard = true,
  indentWidth = 4,
}: JsonViewerProps) {
  // 데이터가 없는 경우 처리
  if (!data) {
    return <div className={`text-sm p-2 ${className}`}>데이터가 없습니다.</div>;
  }

  // 문자열로 들어온 경우 파싱 시도
  let jsonData = data;
  if (typeof data === 'string') {
    try {
      jsonData = JSON.parse(data);
    } catch (e) {
      return (
        <div className={`text-sm p-2 text-red-500 ${className}`}>
          유효하지 않은 JSON 형식입니다: {data}
        </div>
      );
    }
  }

  return (
    <div className={`json-viewer p-2 text-sm ${className}`}>
      <ReactJson
        src={jsonData}
        theme="monokai"
        collapsed={collapsed}
        displayDataTypes={displayDataTypes}
        displayObjectSize={displayObjectSize}
        enableClipboard={enableClipboard}
        indentWidth={indentWidth}
        style={{ fontFamily: 'monospace' }}
      />
    </div>
  );
} 