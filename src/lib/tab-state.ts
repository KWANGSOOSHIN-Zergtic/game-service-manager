/**
 * 사용자별 탭 상태 관리 유틸리티
 * 사용자 ID와 선택한 탭 ID를 기반으로 sessionStorage에 탭 상태를 저장하고 불러옵니다.
 */

/**
 * 사용자의 탭 선택 상태를 sessionStorage에 저장합니다.
 * @param userId 사용자 ID
 * @param tabId 선택한 탭 ID
 */
export const saveTabState = (userId: string, tabId: string): void => {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem(`tabState_${userId}`, tabId);
  }
};

/**
 * 사용자의 저장된 탭 선택 상태를 불러옵니다.
 * @param userId 사용자 ID
 * @returns 저장된 탭 ID 또는 null
 */
export const getTabState = (userId: string): string | null => {
  if (typeof window !== 'undefined') {
    return sessionStorage.getItem(`tabState_${userId}`);
  }
  return null;
};

/**
 * 사용자의 탭 선택 상태를 초기화합니다.
 * @param userId 사용자 ID
 */
export const clearTabState = (userId: string): void => {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem(`tabState_${userId}`);
  }
}; 