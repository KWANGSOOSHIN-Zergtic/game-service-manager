import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { DynamicTabs } from '@/components/ui/dynamic-tabs';
import { TabItem, TabContent } from '@/types/tab-structure';

// 테스트용 탭 아이템 데이터
const mockTabItems: TabItem[] = [
  {
    id: 'tab1',
    label: '탭 1',
    content: {
      type: 'dataTable',
      props: { 
        endpoint: '/test/endpoint1',
        mockValue: '탭 1 내용입니다.' // 추가 데이터는 props에 넣음
      }
    }
  },
  {
    id: 'tab2',
    label: '탭 2',
    content: {
      type: 'dataTable',
      props: { 
        endpoint: '/test/endpoint2',
        mockValue: '탭 2 내용입니다.'
      }
    }
  },
  {
    id: 'tab3',
    label: '탭 3',
    content: {
      type: 'dataTable',
      props: { 
        endpoint: '/test/endpoint3',
        mockValue: '탭 3 내용입니다.'
      }
    }
  }
];

// 탭 컨텐츠 렌더러 모듈 모킹
jest.mock('@/components/ui/tab-content-renderer', () => ({
  TabContentRenderer: ({ content }: { content: TabContent, className?: string }) => {
    // 테스트용 내용 추출
    const mockValue = content.props?.mockValue as string;
    return <div data-testid={`content-${content.type}`}>{mockValue || 'Content'}</div>;
  }
}));

describe('DynamicTabs 컴포넌트 테스트', () => {
  test('탭 클릭 시 onValueChange 콜백이 호출되어야 함', () => {
    // 모의 콜백 함수
    const handleValueChange = jest.fn();
    
    render(
      <DynamicTabs
        items={mockTabItems}
        onValueChange={handleValueChange}
      />
    );
    
    // 첫 번째 탭은 기본적으로 활성화되어 있으므로 두 번째 탭 클릭
    const secondTab = screen.getByText('탭 2');
    fireEvent.click(secondTab);
    
    // onValueChange 콜백이 올바른 탭 ID로 호출되었는지 확인
    expect(handleValueChange).toHaveBeenCalledWith('tab2');
  });
  
  test('defaultValue로 지정된 탭이 초기에 선택되어야 함', () => {
    render(
      <DynamicTabs
        items={mockTabItems}
        defaultValue="tab2"
      />
    );
    
    // 두 번째 탭이 활성화되어 있는지 확인
    const secondTab = screen.getByText('탭 2');
    expect(secondTab).toHaveAttribute('data-state', 'active');
    
    // 두 번째 탭의 내용이 표시되어 있는지 확인
    expect(screen.getByText('탭 2 내용입니다.')).toBeInTheDocument();
  });
  
  test('자식 탭을 포함하는 경우 부모 탭의 ID가 자식 탭 ID와 함께 전달되어야 함', () => {
    // 자식 탭을 포함하는 테스트용 탭 아이템 데이터
    const mockNestedTabItems: TabItem[] = [
      {
        id: 'parent1',
        label: '부모 탭 1',
        children: [
          {
            id: 'child1',
            label: '자식 탭 1',
            content: {
              type: 'dataTable',
              props: { 
                endpoint: '/test/child1',
                mockValue: '자식 탭 1 내용입니다.'
              }
            }
          },
          {
            id: 'child2',
            label: '자식 탭 2',
            content: {
              type: 'dataTable',
              props: { 
                endpoint: '/test/child2',
                mockValue: '자식 탭 2 내용입니다.'
              }
            }
          }
        ]
      }
    ];
    
    // 모의 콜백 함수
    const handleValueChange = jest.fn();
    
    render(
      <DynamicTabs
        items={mockNestedTabItems}
        onValueChange={handleValueChange}
      />
    );
    
    // 부모 탭을 통해 자식 탭에 접근
    // 렌더링 후 자식 탭 1이 기본적으로 활성화됨
    // 자식 탭 2를 클릭
    const childTab2 = screen.getByText('자식 탭 2');
    fireEvent.click(childTab2);
    
    // onValueChange 콜백이 'parent1-child2' 형식의 ID로 호출되었는지 확인
    expect(handleValueChange).toHaveBeenCalledWith('parent1-child2');
  });
}); 