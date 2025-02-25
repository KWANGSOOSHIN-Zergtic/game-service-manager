import React from 'react';
import { TabContent } from '@/types/tab-structure';

interface TabContentRendererProps {
  content: TabContent;
  className?: string;
}

export function TabContentRenderer({ content, className = '' }: TabContentRendererProps) {
  // 컨텐츠 타입에 따라 적절한 컴포넌트 렌더링
  switch (content.type) {
    case 'dataTable':
      return (
        <div className={`p-4 border rounded-md ${className}`}>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-gray-700">데이터 테이블</h3>
            <span className="text-xs text-gray-500">
              {content.props?.endpoint as string}
            </span>
          </div>
          <div className="bg-gray-100 rounded p-3 text-xs">
            <p>데이터 엔드포인트: {content.props?.endpoint as string}</p>
            <p className="text-gray-500 mt-1">
              데이터 테이블 컴포넌트는 추후 실제 API 연동하여 구현될 예정입니다.
            </p>
          </div>
        </div>
      );
      
    case 'controller':
      return (
        <div className={`p-4 border rounded-md ${className}`}>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-gray-700">컨트롤러</h3>
          </div>
          <div className="flex gap-2">
            <button className="bg-blue-500 text-white text-xs px-3 py-1 rounded">
              필터
            </button>
            <button className="bg-green-500 text-white text-xs px-3 py-1 rounded">
              추가
            </button>
            <button className="bg-red-500 text-white text-xs px-3 py-1 rounded">
              삭제
            </button>
          </div>
        </div>
      );
      
    case 'subTab':
      return (
        <div className={`p-4 border rounded-md ${className}`}>
          <h3 className="text-sm font-semibold text-gray-700 mb-2">서브 탭</h3>
          <div className="bg-gray-100 rounded p-3 text-xs">
            <p className="text-gray-500">서브 탭 컴포넌트는 하위 탭을 포함할 수 있습니다.</p>
          </div>
        </div>
      );
      
    case 'accordion':
      return (
        <div className={`p-4 border rounded-md ${className}`}>
          <h3 className="text-sm font-semibold text-gray-700 mb-2">아코디언</h3>
          <div className="bg-gray-100 rounded p-3 text-xs">
            <p className="text-gray-500">아코디언 컴포넌트는 접을 수 있는 컨텐츠를 포함합니다.</p>
          </div>
        </div>
      );
      
    default:
      return (
        <div className={`p-4 border rounded-md ${className}`}>
          <p className="text-sm text-gray-500">알 수 없는 컨텐츠 타입</p>
        </div>
      );
  }
} 