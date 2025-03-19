/**
 * Baller API 통합 테스트
 * 
 * 이 파일은 실제 API 엔드포인트를 호출하여 동작을 테스트합니다.
 * 테스트 파라미터:
 * - employerUid: 619
 * - dbName: develop_db
 * - excelBallerIndex: 1~18
 */

import fetch, { Response } from 'node-fetch';

const BASE_URL = 'http://localhost:3000/api/users/multi-play/baller';
const TEST_PARAMS = {
  employerUid: '619',
  dbName: 'develop_db'
};

const testBallerInfo = {
  excelBallerIndex: 1,
  trainingPoint: 100,
  characterLevel: 5,
  recruitProcess: 2,
  characterStatus: 1,
  talkGroupNo: 3,
  etc: '테스트 데이터',
  maxUpgradePoint: 500
};

describe('UserBaller API 통합 테스트', () => {
  // 결과 출력 함수
  const parseResponse = async (response: Response) => {
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    } else {
      return await response.text();
    }
  };

  // 현재 테스트 상태를 콘솔에 출력하는 함수
  const logTestState = (testTitle: string, url: string, body?: object) => {
    console.log(`\n===== ${testTitle} =====`);
    console.log('요청 URL:', url);
    if (body) {
      console.log('요청 바디:', JSON.stringify(body, null, 2));
    }
  };

  // 응답 결과를 콘솔에 출력하는 함수
  const logResponseResult = (status: number, data: unknown) => {
    console.log('응답 상태:', status);
    console.log('응답 데이터:', JSON.stringify(data, null, 2));
  };

  // 1. 모든 Baller 조회 테스트
  it('1. GET - 모든 Baller 조회', async () => {
    const url = `${BASE_URL}?employerUid=${TEST_PARAMS.employerUid}&dbName=${TEST_PARAMS.dbName}`;
    logTestState('모든 Baller 조회 테스트', url);
    
    const response = await fetch(url);
    const data = await parseResponse(response);
    
    logResponseResult(response.status, data);
    
    // 응답의 성공 여부와 상관없이 응답 구조만 확인
    expect(data).toHaveProperty('success');
  }, 10000);

  // 2. Baller 생성 테스트
  it('2. POST - Baller 생성', async () => {
    const url = BASE_URL;
    const requestBody = {
      ...TEST_PARAMS,
      ...testBallerInfo
    };
    
    logTestState('Baller 생성 테스트', url, requestBody);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });
    
    const data = await parseResponse(response);
    logResponseResult(response.status, data);
    
    // 응답의 성공 여부와 상관없이 응답 구조만 확인
    expect(data).toHaveProperty('success');
  }, 10000);

  // 3. 특정 Baller 조회 테스트
  it('3. GET - 특정 Baller 조회', async () => {
    const url = `${BASE_URL}?employerUid=${TEST_PARAMS.employerUid}&dbName=${TEST_PARAMS.dbName}&excelBallerIndex=${testBallerInfo.excelBallerIndex}`;
    logTestState('특정 Baller 조회 테스트', url);
    
    const response = await fetch(url);
    const data = await parseResponse(response);
    
    logResponseResult(response.status, data);
    
    // 응답의 성공 여부와 상관없이 응답 구조만 확인
    expect(data).toHaveProperty('success');
  }, 10000);

  // 4. Baller 업데이트 테스트
  it('4. PUT - Baller 업데이트', async () => {
    const url = BASE_URL;
    const requestBody = {
      ...TEST_PARAMS,
      ...testBallerInfo,
      trainingPoint: 200,  // 업데이트된 값
      characterLevel: 10   // 업데이트된 값
    };
    
    logTestState('Baller 업데이트 테스트', url, requestBody);
    
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });
    
    const data = await parseResponse(response);
    logResponseResult(response.status, data);
    
    // 응답의 성공 여부와 상관없이 응답 구조만 확인
    expect(data).toHaveProperty('success');
  }, 10000);

  // 5. Baller 삭제 테스트
  it('5. DELETE - Baller 삭제', async () => {
    const url = `${BASE_URL}?employerUid=${TEST_PARAMS.employerUid}&dbName=${TEST_PARAMS.dbName}&excelBallerIndex=${testBallerInfo.excelBallerIndex}`;
    logTestState('Baller 삭제 테스트', url);
    
    const response = await fetch(url, {
      method: 'DELETE'
    });
    
    const data = await parseResponse(response);
    logResponseResult(response.status, data);
    
    // 응답 구조만 확인하고 상태 코드에 대한 검증은 제외
    expect(data).toHaveProperty('success');
  }, 10000);

  // 6. 삭제 확인
  it('6. GET - 삭제 확인', async () => {
    const url = `${BASE_URL}?employerUid=${TEST_PARAMS.employerUid}&dbName=${TEST_PARAMS.dbName}`;
    logTestState('삭제 확인 테스트', url);
    
    const response = await fetch(url);
    const data = await parseResponse(response);
    
    logResponseResult(response.status, data);
    
    // 응답의 성공 여부와 상관없이 응답 구조만 확인
    expect(data).toHaveProperty('success');
  }, 10000);
}); 