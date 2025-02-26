import React from 'react';
import { render, screen } from '@testing-library/react';
import { StatusIndicator } from '../../../components/debug/StatusIndicator';

describe('StatusIndicator 컴포넌트', () => {
  test('성공 상태를 정확하게 렌더링해야 함', () => {
    render(<StatusIndicator success={true} />);
    
    // 성공 텍스트가 표시되는지 확인
    expect(screen.getByText('성공')).toBeInTheDocument();
    
    // 성공 아이콘 관련 클래스가 있는지 확인
    const indicator = screen.getByText('성공').closest('span');
    expect(indicator).toHaveClass('bg-green-100');
    expect(indicator).toHaveClass('text-green-800');
  });
  
  test('실패 상태를 정확하게 렌더링해야 함', () => {
    render(<StatusIndicator success={false} />);
    
    // 실패 텍스트가 표시되는지 확인
    expect(screen.getByText('실패')).toBeInTheDocument();
    
    // 실패 아이콘 관련 클래스가 있는지 확인
    const indicator = screen.getByText('실패').closest('span');
    expect(indicator).toHaveClass('bg-red-100');
    expect(indicator).toHaveClass('text-red-800');
  });
  
  test('미정 상태일 때 처리 중을 표시해야 함', () => {
    render(<StatusIndicator success={undefined} />);
    
    // undefined가 전달되면 아무것도 렌더링하지 않아야 함
    expect(screen.queryByText('처리 중')).not.toBeInTheDocument();
    expect(screen.queryByText('성공')).not.toBeInTheDocument();
    expect(screen.queryByText('실패')).not.toBeInTheDocument();
  });
  
  test('type과 label이 있을 때 디버그 정보 상태를 표시해야 함', () => {
    render(
      <StatusIndicator 
        value={true} 
        type="requestInfo" 
        label="RequestInfo" 
      />
    );
    
    // 라벨과 체크 마크가 표시되는지 확인
    expect(screen.getByText('RequestInfo: ✅')).toBeInTheDocument();
  });
  
  test('value가 false일 때 X 마크를 표시해야 함', () => {
    render(
      <StatusIndicator 
        value={false} 
        type="apiDebugInfo" 
        label="DebugInfo" 
      />
    );
    
    // 라벨과 X 표시가 있는지 확인
    expect(screen.getByText('DebugInfo: ❌')).toBeInTheDocument();
  });
}); 