import { IUITableData } from '@/types/table.types';
import React from 'react';

// 현재 시간 생성 함수
const generateRandomDate = () => {
  const now = new Date();
  const pastDays = Math.floor(Math.random() * 7); // 0-7일 이전
  const past = new Date(now.setDate(now.getDate() - pastDays));
  return past.toISOString();
};

// 목 데이터 생성
export const mockPubSeatStatus: IUITableData[] = Array.from({ length: 20 }, (_, i) => {
  const seatCount = 3 + Math.floor(Math.random() * 3); // 3-5개 좌석 랜덤 생성
  
  return {
    id: i + 1,
    employer_uid: (1000000 + i).toString(),
    refresh_at: generateRandomDate(),
    seat_status: Array.from({ length: seatCount }, () => Math.floor(Math.random() * 3)), // 0, 1, 2 중 랜덤 상태
    talk_status: Array.from({ length: 3 }, () => Math.random() > 0.5), // true/false 랜덤
    recruit_status: Array.from({ length: 3 }, () => Math.random() > 0.5), // true/false 랜덤
    _raw: {} // 원시 데이터
  };
});

// 좌석 상태 텍스트 변환 함수
export const getSeatStatusText = (status: number): string => {
  switch(status) {
    case 0: return '비어있음';
    case 1: return '사용 중';
    case 2: return '예약됨';
    default: return '알 수 없음';
  }
};

// 배열 데이터 포맷팅 함수
export const formatArrayData = (arr: (number | boolean)[] | undefined): string => {
  if (!arr || !Array.isArray(arr)) return '[]';
  return JSON.stringify(arr);
};

// 상태 배열 시각화 함수 (컴포넌트에서 직접 호출될 함수)
export const getStatusVisual = (arr: (number | boolean)[] | undefined, type: 'seat' | 'talk' | 'recruit'): { bgColor: string, text: string }[] => {
  if (!arr || !Array.isArray(arr)) return [];
  
  return arr.map((status) => {
    let bgColor = 'bg-gray-200';
    let text = '';
    
    if (type === 'seat') {
      // 좌석 상태
      switch(status as number) {
        case 0: bgColor = 'bg-green-200'; text = '빈 좌석'; break;
        case 1: bgColor = 'bg-blue-200'; text = '사용중'; break;
        case 2: bgColor = 'bg-red-200'; text = '예약됨'; break;
      }
    } else {
      // 대화 또는 모집 상태
      bgColor = status ? 'bg-green-200' : 'bg-gray-200';
      text = status ? '활성' : '비활성';
    }
    
    return { bgColor, text };
  });
}; 