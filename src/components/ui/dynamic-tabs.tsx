import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TabItem } from '@/types/tab-structure';
import { TabContentRenderer } from './tab-content-renderer';

interface DynamicTabsProps {
  items: TabItem[];
  defaultValue?: string;
  className?: string;
  triggerClassName?: string;
  contentClassName?: string;
  orientation?: 'horizontal' | 'vertical';
  equalTabs?: boolean; // 탭을 균등하게 분할할지 여부
  onValueChange?: (value: string) => void; // 탭 변경 이벤트 콜백 추가
}

export function DynamicTabs({
  items,
  defaultValue,
  className = '',
  triggerClassName = '',
  contentClassName = '',
  orientation = 'horizontal',
  equalTabs = true, // 기본값은 균등 분할
  onValueChange
}: DynamicTabsProps) {
  // 기본 선택값이 없으면 첫 번째 항목을 기본값으로 설정
  const firstTabId = items.length > 0 ? items[0].id : '';
  const activeTab = defaultValue || firstTabId;

  return (
    <Tabs 
      defaultValue={activeTab} 
      className={className}
      onValueChange={onValueChange}
    >
      <TabsList className={`w-full ${orientation === 'vertical' ? 'flex-col' : 'flex'}`}>
        {items.map(item => (
          <TabsTrigger
            key={item.id}
            value={item.id}
            className={`${triggerClassName} ${equalTabs ? 'flex-1' : ''}`}
            style={equalTabs ? { minWidth: `${100 / items.length}%` } : undefined}
          >
            {item.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {items.map(item => (
        <TabsContent key={item.id} value={item.id} className={contentClassName}>
          {item.children && item.children.length > 0 ? (
            <DynamicTabs
              items={item.children}
              className="w-full"
              triggerClassName={triggerClassName}
              contentClassName={contentClassName}
              equalTabs={equalTabs}
              onValueChange={onValueChange ? (value) => onValueChange(`${item.id}-${value}`) : undefined}
            />
          ) : item.content ? (
            <TabContentRenderer content={item.content} className="" />
          ) : (
            <div className="p-4 border rounded-md">
              <p className="text-sm text-gray-500">컨텐츠가 없습니다.</p>
            </div>
          )}
        </TabsContent>
      ))}
    </Tabs>
  );
} 