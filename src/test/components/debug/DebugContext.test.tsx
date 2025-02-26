import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DebugProvider, useDebugContext } from '../../../components/debug';
import { successApiResponse, failureApiResponse, sampleRequestInfo } from '../../test-data/debug-test-data';

// 테스트를 위한 간단한 컴포넌트
const TestComponent: React.FC = () => {
  const { 
    isVisible, 
    debugInfo, 
    requestInfo, 
    toggleVisibility, 
    setDebugInfo, 
    setRequestInfo, 
    clearDebugData,
    copyToClipboard,
    copiedSection 
  } = useDebugContext();
  
  return (
    <div>
      <div data-testid="visibility-status">
        {isVisible ? 'Visible' : 'Hidden'}
      </div>
      
      <button onClick={toggleVisibility} data-testid="toggle-button">
        Toggle Visibility
      </button>
      
      <button 
        onClick={() => setDebugInfo(successApiResponse)} 
        data-testid="set-success-debug"
      >
        Set Success Debug
      </button>
      
      <button 
        onClick={() => setDebugInfo(failureApiResponse)} 
        data-testid="set-failure-debug"
      >
        Set Failure Debug
      </button>
      
      <button 
        onClick={() => setRequestInfo(sampleRequestInfo)}
        data-testid="set-request-info"
      >
        Set Request Info
      </button>
      
      <button 
        onClick={clearDebugData}
        data-testid="clear-debug"
      >
        Clear Debug Data
      </button>
      
      <button 
        onClick={() => copyToClipboard('텍스트가 복사되었습니다', 'all')}
        data-testid="copy-button"
      >
        Copy Text
      </button>
      
      {debugInfo && (
        <div data-testid="debug-info">
          {JSON.stringify(debugInfo)}
        </div>
      )}
      
      {requestInfo && (
        <div data-testid="request-info">
          {JSON.stringify(requestInfo)}
        </div>
      )}
      
      {copiedSection && (
        <div data-testid="copied-section">
          {copiedSection}
        </div>
      )}
    </div>
  );
};

describe('DebugContext Provider', () => {
  beforeAll(() => {
    // 클립보드 API 모킹
    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: jest.fn(() => Promise.resolve()),
      },
      writable: true,
    });
  });
  
  afterEach(() => {
    jest.clearAllMocks();
  });
  
  test('기본적으로 패널은 숨겨져 있어야 함', () => {
    render(
      <DebugProvider>
        <TestComponent />
      </DebugProvider>
    );
    
    expect(screen.getByTestId('visibility-status')).toHaveTextContent('Hidden');
  });
  
  test('토글 버튼 클릭 시 visibility가 변경되어야 함', () => {
    render(
      <DebugProvider>
        <TestComponent />
      </DebugProvider>
    );
    
    const toggleButton = screen.getByTestId('toggle-button');
    
    fireEvent.click(toggleButton);
    expect(screen.getByTestId('visibility-status')).toHaveTextContent('Visible');
    
    fireEvent.click(toggleButton);
    expect(screen.getByTestId('visibility-status')).toHaveTextContent('Hidden');
  });
  
  test('디버그 정보를 설정할 수 있어야 함', () => {
    render(
      <DebugProvider>
        <TestComponent />
      </DebugProvider>
    );
    
    const setSuccessButton = screen.getByTestId('set-success-debug');
    
    fireEvent.click(setSuccessButton);
    
    const debugInfoElement = screen.getByTestId('debug-info');
    expect(debugInfoElement).toBeInTheDocument();
    expect(debugInfoElement.textContent).toContain('사용자 정보를 성공적으로 불러왔습니다');
  });
  
  test('요청 정보를 설정할 수 있어야 함', () => {
    render(
      <DebugProvider>
        <TestComponent />
      </DebugProvider>
    );
    
    const setRequestButton = screen.getByTestId('set-request-info');
    
    fireEvent.click(setRequestButton);
    
    const requestInfoElement = screen.getByTestId('request-info');
    expect(requestInfoElement).toBeInTheDocument();
    expect(requestInfoElement.textContent).toContain('https://api.example.com/users');
  });
  
  test('디버그 데이터를 초기화할 수 있어야 함', () => {
    render(
      <DebugProvider>
        <TestComponent />
      </DebugProvider>
    );
    
    // 먼저 디버그 정보 설정
    fireEvent.click(screen.getByTestId('set-success-debug'));
    fireEvent.click(screen.getByTestId('set-request-info'));
    
    expect(screen.getByTestId('debug-info')).toBeInTheDocument();
    expect(screen.getByTestId('request-info')).toBeInTheDocument();
    
    // 데이터 초기화
    fireEvent.click(screen.getByTestId('clear-debug'));
    
    expect(screen.queryByTestId('debug-info')).not.toBeInTheDocument();
    expect(screen.queryByTestId('request-info')).not.toBeInTheDocument();
  });
  
  test('텍스트를 클립보드에 복사할 수 있어야 함', async () => {
    render(
      <DebugProvider>
        <TestComponent />
      </DebugProvider>
    );
    
    const copyButton = screen.getByTestId('copy-button');
    
    fireEvent.click(copyButton);
    
    // 클립보드 API가 호출되었는지 확인
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('텍스트가 복사되었습니다');
    
    // 복사된 섹션이 표시되는지 확인
    await waitFor(() => {
      expect(screen.getByTestId('copied-section')).toHaveTextContent('all');
    });
    
    // 잠시 후 복사 섹션 메시지가 사라져야 함
    await waitFor(() => {
      expect(screen.queryByTestId('copied-section')).not.toBeInTheDocument();
    }, { timeout: 2000 });
  });
}); 