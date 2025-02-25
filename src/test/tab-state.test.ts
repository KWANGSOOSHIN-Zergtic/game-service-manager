import { saveTabState, getTabState, clearTabState } from '@/lib/tab-state';

// 테스트 환경을 위한 sessionStorage 모킹
const mockSessionStorage = (() => {
  let store: Record<string, string> = {};
  
  return {
    getItem: jest.fn((key: string) => {
      return store[key] || null;
    }),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    })
  };
})();

// 실제 sessionStorage를 모의 구현으로 교체
Object.defineProperty(window, 'sessionStorage', {
  value: mockSessionStorage
});

describe('탭 상태 관리 기능 테스트', () => {
  beforeEach(() => {
    // 각 테스트 전에 모의 sessionStorage 초기화
    mockSessionStorage.clear();
    jest.clearAllMocks();
  });
  
  test('탭 상태를 저장하고 불러올 수 있어야 함', () => {
    const userId = '12345';
    const tabId = 'multiplay';
    
    // 탭 상태 저장
    saveTabState(userId, tabId);
    
    // sessionStorage.setItem이 올바른 키와 값으로 호출되었는지 확인
    expect(mockSessionStorage.setItem).toHaveBeenCalledWith(`tabState_${userId}`, tabId);
    
    // 저장된 탭 상태 불러오기
    const retrievedTabId = getTabState(userId);
    
    // sessionStorage.getItem이 올바른 키로 호출되었는지 확인
    expect(mockSessionStorage.getItem).toHaveBeenCalledWith(`tabState_${userId}`);
    
    // 불러온 탭 상태가 올바른지 확인
    expect(retrievedTabId).toBe(tabId);
  });
  
  test('사용자별로 다른 탭 상태를 저장하고 불러올 수 있어야 함', () => {
    const userId1 = '12345';
    const userId2 = '67890';
    const tabId1 = 'multiplay';
    const tabId2 = 'story';
    
    // 사용자 1의 탭 상태 저장
    saveTabState(userId1, tabId1);
    
    // 사용자 2의 탭 상태 저장
    saveTabState(userId2, tabId2);
    
    // 각 사용자의 탭 상태 불러오기
    const retrievedTabId1 = getTabState(userId1);
    const retrievedTabId2 = getTabState(userId2);
    
    // 사용자별로 올바른 탭 상태가 불러와지는지 확인
    expect(retrievedTabId1).toBe(tabId1);
    expect(retrievedTabId2).toBe(tabId2);
  });
  
  test('탭 상태를 초기화할 수 있어야 함', () => {
    const userId = '12345';
    const tabId = 'multiplay';
    
    // 탭 상태 저장
    saveTabState(userId, tabId);
    
    // 탭 상태 초기화
    clearTabState(userId);
    
    // sessionStorage.removeItem이 올바른 키로 호출되었는지 확인
    expect(mockSessionStorage.removeItem).toHaveBeenCalledWith(`tabState_${userId}`);
    
    // 탭 상태가 초기화되었는지 확인
    const retrievedTabId = getTabState(userId);
    expect(retrievedTabId).toBeNull();
  });
}); 