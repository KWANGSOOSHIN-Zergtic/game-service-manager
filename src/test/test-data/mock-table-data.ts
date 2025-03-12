/**
 * DataTable 컴포넌트 테스트를 위한 목 데이터
 */
import { IUITableData } from '@/types/table.types';

/**
 * 사용자 목록 데이터
 */
export const mockUserData: IUITableData[] = Array.from({ length: 100 }).map((_, index) => ({
  id: index + 1,
  name: `사용자 ${index + 1}`,
  email: `user${index + 1}@example.com`,
  age: Math.floor(Math.random() * 40) + 20,
  role: ['관리자', '사용자', '게스트'][Math.floor(Math.random() * 3)],
  status: ['활성', '비활성', '정지'][Math.floor(Math.random() * 3)],
  lastLogin: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString(),
  created_at: new Date(Date.now() - Math.floor(Math.random() * 365) * 24 * 60 * 60 * 1000).toISOString(),
}));

/**
 * 게임 아이템 목록 데이터
 */
export const mockItemData: IUITableData[] = Array.from({ length: 50 }).map((_, index) => ({
  id: index + 1,
  name: `아이템 ${index + 1}`,
  category: ['무기', '방어구', '소비품', '기타'][Math.floor(Math.random() * 4)],
  price: Math.floor(Math.random() * 10000) + 100,
  quantity: Math.floor(Math.random() * 100) + 1,
  rarity: ['일반', '고급', '희귀', '전설'][Math.floor(Math.random() * 4)],
  description: `이것은 아이템 ${index + 1}에 대한 설명입니다.`,
  is_tradable: Math.random() > 0.3,
}));

/**
 * 게임 통화 데이터
 */
export const mockCurrencyData: IUITableData[] = [
  { id: 1, name: '골드', code: 'GOLD', exchange_rate: 1.0, daily_limit: 100000, is_premium: false },
  { id: 2, name: '다이아몬드', code: 'DIAMOND', exchange_rate: 100.0, daily_limit: 1000, is_premium: true },
  { id: 3, name: '에너지', code: 'ENERGY', exchange_rate: 10.0, daily_limit: 200, is_premium: false },
  { id: 4, name: '명성', code: 'FAME', exchange_rate: 5.0, daily_limit: 500, is_premium: false },
  { id: 5, name: '프리미엄 포인트', code: 'PREMIUM', exchange_rate: 50.0, daily_limit: 100, is_premium: true },
  { id: 6, name: '이벤트 토큰', code: 'EVENT', exchange_rate: 20.0, daily_limit: 300, is_premium: false },
  { id: 7, name: '길드 포인트', code: 'GUILD', exchange_rate: 2.0, daily_limit: 5000, is_premium: false },
  { id: 8, name: 'VIP 포인트', code: 'VIP', exchange_rate: 200.0, daily_limit: 50, is_premium: true },
  { id: 9, name: '시즌 포인트', code: 'SEASON', exchange_rate: 15.0, daily_limit: 800, is_premium: false },
  { id: 10, name: '스킬 포인트', code: 'SKILL', exchange_rate: 25.0, daily_limit: 150, is_premium: false },
];

/**
 * 게임 로그 데이터
 */
export const mockGameLogData: IUITableData[] = Array.from({ length: 200 }).map((_, index) => ({
  id: index + 1,
  user_id: Math.floor(Math.random() * 100) + 1,
  action: ['로그인', '로그아웃', '아이템 구매', '아이템 사용', '레벨업', '퀘스트 완료', '거래'][Math.floor(Math.random() * 7)],
  timestamp: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000 - Math.floor(Math.random() * 24) * 60 * 60 * 1000).toISOString(),
  details: {
    ip: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
    device: ['모바일', 'PC', '태블릿'][Math.floor(Math.random() * 3)],
    os: ['Android', 'iOS', 'Windows', 'MacOS'][Math.floor(Math.random() * 4)],
  },
  status: ['성공', '실패', '진행중'][Math.floor(Math.random() * 3)],
}));

/**
 * 통계 데이터
 */
export const mockStatisticsData: IUITableData[] = Array.from({ length: 30 }).map((_, index) => ({
  id: index + 1,
  date: new Date(Date.now() - (30 - index) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  new_users: Math.floor(Math.random() * 500) + 100,
  active_users: Math.floor(Math.random() * 5000) + 1000,
  revenue: Math.floor(Math.random() * 50000) + 10000,
  transactions: Math.floor(Math.random() * 2000) + 500,
  average_session: Math.floor(Math.random() * 30) + 10,
  retention_rate: Math.floor(Math.random() * 30) + 70,
})); 