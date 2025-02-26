import { ApiResponse, ApiRequestInfo, ApiDebugInfo } from '../../components/debug/types';

// 성공한 API 응답 예시
export const successApiResponse: ApiResponse = {
  success: true,
  data: [
    { id: 1, name: '김철수', age: 30 },
    { id: 2, name: '박영희', age: 25 }
  ],
  timestamp: '2023-10-20T12:34:56.789Z',
  responseTime: '120ms',
  message: '사용자 정보를 성공적으로 불러왔습니다.'
};

// 실패한 API 응답 예시
export const failureApiResponse: ApiResponse = {
  success: false,
  error: '데이터를 찾을 수 없습니다.',
  message: '요청한 리소스가 서버에 존재하지 않습니다.',
  timestamp: '2023-10-20T12:45:22.123Z',
  responseTime: '84ms'
};

// API 오류 응답 예시
export const errorApiResponse: ApiResponse = {
  success: false,
  error: '서버 내부 오류가 발생했습니다.',
  message: '데이터베이스 연결에 실패했습니다.',
  timestamp: '2023-10-20T13:01:45.627Z',
  responseTime: '245ms'
};

// API 요청 정보 예시
export const sampleRequestInfo: ApiRequestInfo = {
  url: 'https://api.example.com/users?page=1&limit=10',
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer sample-token-12345'
  },
  params: {
    page: 1,
    limit: 10
  },
  timestamp: new Date('2023-10-20T12:34:50.000Z')
};

// POST 요청 정보 예시
export const postRequestInfo: ApiRequestInfo = {
  url: 'https://api.example.com/users',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer sample-token-12345'
  },
  params: {},
  data: {
    name: '새로운 사용자',
    email: 'new@example.com',
    age: 28
  },
  timestamp: new Date('2023-10-20T13:45:12.000Z')
};

// API 디버그 정보 예시
export const sampleApiDebugInfo: ApiDebugInfo = {
  requestUrl: 'https://api.example.com/users?page=1&limit=10',
  requestMethod: 'GET',
  requestHeaders: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer sample-token-12345'
  },
  timestamp: '2023-10-20T12:34:50.000Z'
};

// POST 요청 디버그 정보 예시
export const postApiDebugInfo: ApiDebugInfo = {
  requestUrl: 'https://api.example.com/users',
  requestMethod: 'POST',
  requestHeaders: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer sample-token-12345'
  },
  requestBody: JSON.stringify({
    name: '새로운 사용자',
    email: 'new@example.com',
    age: 28
  }),
  timestamp: '2023-10-20T13:45:12.000Z'
}; 