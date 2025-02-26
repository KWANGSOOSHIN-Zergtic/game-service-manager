import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ApiDebugInfo } from '@/components/ApiDebugInfo';

// 테스트용 디버그 정보
const mockDebugInfo = {
  requestUrl: 'https://api.example.com/users?id=123',
  requestMethod: 'GET',
  requestHeaders: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer token123456',
    'Accept': 'application/json',
  },
  requestBody: JSON.stringify({ query: 'test' }),
  timestamp: '2023-07-15T12:30:45.000Z',
};

describe('ApiDebugInfo 컴포넌트', () => {
  it('접힌 상태로 초기 렌더링', () => {
    render(
      <ApiDebugInfo
        requestUrl={mockDebugInfo.requestUrl}
        requestMethod={mockDebugInfo.requestMethod}
        requestHeaders={mockDebugInfo.requestHeaders}
        requestBody={mockDebugInfo.requestBody}
        timestamp={mockDebugInfo.timestamp}
      />
    );

    // 타이틀은 보이지만 내용은 접혀있어야 함
    expect(screen.getByText('요청데이터')).toBeInTheDocument();
    expect(screen.queryByText('요청 URL:')).not.toBeVisible();
  });

  it('클릭 시 내용이 펼쳐져야 함', () => {
    render(
      <ApiDebugInfo
        requestUrl={mockDebugInfo.requestUrl}
        requestMethod={mockDebugInfo.requestMethod}
        requestHeaders={mockDebugInfo.requestHeaders}
        requestBody={mockDebugInfo.requestBody}
        timestamp={mockDebugInfo.timestamp}
      />
    );

    // 타이틀 클릭
    fireEvent.click(screen.getByText('요청데이터'));

    // 내용이 보여야 함
    expect(screen.getByText('요청 URL:')).toBeVisible();
    expect(screen.getByText(mockDebugInfo.requestUrl)).toBeInTheDocument();
    expect(screen.getByText('GET')).toBeInTheDocument();
  });

  it('요청 메소드에 따른 색상이 적용되어야 함', () => {
    const { rerender } = render(
      <ApiDebugInfo
        requestUrl={mockDebugInfo.requestUrl}
        requestMethod="GET"
        requestHeaders={mockDebugInfo.requestHeaders}
        requestBody={mockDebugInfo.requestBody}
        timestamp={mockDebugInfo.timestamp}
      />
    );

    // 타이틀 클릭하여 펼치기
    fireEvent.click(screen.getByText('요청데이터'));
    
    // GET 메소드의 스타일 클래스 확인
    const getMethod = screen.getByText('GET');
    expect(getMethod).toHaveClass('bg-blue-100');
    expect(getMethod).toHaveClass('text-blue-700');

    // POST 메소드로 변경하여 다시 렌더링
    rerender(
      <ApiDebugInfo
        requestUrl={mockDebugInfo.requestUrl}
        requestMethod="POST"
        requestHeaders={mockDebugInfo.requestHeaders}
        requestBody={mockDebugInfo.requestBody}
        timestamp={mockDebugInfo.timestamp}
      />
    );

    // POST 메소드의 스타일 클래스 확인
    const postMethod = screen.getByText('POST');
    expect(postMethod).toHaveClass('bg-green-100');
    expect(postMethod).toHaveClass('text-green-700');
  });

  it('민감한 헤더가 마스킹 처리되어야 함', () => {
    render(
      <ApiDebugInfo
        requestUrl={mockDebugInfo.requestUrl}
        requestMethod={mockDebugInfo.requestMethod}
        requestHeaders={mockDebugInfo.requestHeaders}
        requestBody={mockDebugInfo.requestBody}
        timestamp={mockDebugInfo.timestamp}
      />
    );

    // 타이틀 클릭하여 펼치기
    fireEvent.click(screen.getByText('요청데이터'));
    
    // 일반 헤더는 그대로 표시
    expect(screen.getByText('Content-Type')).toBeInTheDocument();
    expect(screen.getByText('application/json')).toBeInTheDocument();
    
    // 민감한 헤더는 마스킹 처리
    expect(screen.getByText('Authorization')).toBeInTheDocument();
    expect(screen.queryByText('Bearer token123456')).not.toBeInTheDocument();
    
    // 마스킹 토글 버튼 클릭
    const toggleButtons = screen.getAllByRole('button');
    const authToggleButton = toggleButtons.find(button => 
      button.parentElement && 
      button.parentElement.textContent?.includes('Authorization')
    );
    
    // 토글 버튼 클릭
    if (authToggleButton) {
      fireEvent.click(authToggleButton);
      
      // 마스킹 해제 후 민감 정보가 보여야 함
      expect(screen.getByText('Bearer token123456')).toBeInTheDocument();
    }
  });

  it('커스텀 타이틀이 적용되어야 함', () => {
    render(
      <ApiDebugInfo
        requestUrl={mockDebugInfo.requestUrl}
        requestMethod={mockDebugInfo.requestMethod}
        requestHeaders={mockDebugInfo.requestHeaders}
        requestBody={mockDebugInfo.requestBody}
        timestamp={mockDebugInfo.timestamp}
        title="커스텀 API 정보"
      />
    );

    expect(screen.getByText('커스텀 API 정보')).toBeInTheDocument();
  });
}); 