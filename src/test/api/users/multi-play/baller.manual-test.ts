/**
 * Baller API 테스트 스크립트
 * 
 * 이 파일은 Baller API에 대한 CRUD 작업을 테스트합니다.
 * 테스트 파라미터:
 * - employerUid: 619
 * - dbName: develop_db
 * - excelBallerIndex: 1~18
 */

import fetch from 'node-fetch';

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

// 이 테스트 파일은 수동 테스트용입니다. 
// 아래 코드를 실행하려면 다음 명령어로 실행하세요:
// node -r ts-node/register src/test/api/users/multi-play/baller.manual-test.ts

// 결과 출력 함수
const logResponse = async (response: any) => {
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    const data = await response.json();
    console.log('상태 코드:', response.status);
    console.log('응답 데이터:', JSON.stringify(data, null, 2));
  } else {
    const text = await response.text();
    console.log('상태 코드:', response.status);
    console.log('응답 텍스트:', text);
  }
};

// 1. 모든 Baller 조회 테스트
const getAllBallers = async () => {
  console.log('\n===== 모든 Baller 조회 테스트 =====');
  try {
    const url = `${BASE_URL}?employerUid=${TEST_PARAMS.employerUid}&dbName=${TEST_PARAMS.dbName}`;
    console.log('요청 URL:', url);
    
    const response = await fetch(url);
    await logResponse(response);
  } catch (error) {
    console.error('오류 발생:', error);
  }
};

// 2. 특정 Baller 조회 테스트
const getBallerById = async (excelBallerIndex: number) => {
  console.log(`\n===== Baller ID ${excelBallerIndex} 조회 테스트 =====`);
  try {
    const url = `${BASE_URL}?employerUid=${TEST_PARAMS.employerUid}&dbName=${TEST_PARAMS.dbName}&excelBallerIndex=${excelBallerIndex}`;
    console.log('요청 URL:', url);
    
    const response = await fetch(url);
    await logResponse(response);
  } catch (error) {
    console.error('오류 발생:', error);
  }
};

// 3. Baller 생성 테스트
const createBaller = async () => {
  console.log('\n===== Baller 생성 테스트 =====');
  try {
    const url = BASE_URL;
    console.log('요청 URL:', url);
    
    const requestBody = {
      ...TEST_PARAMS,
      ...testBallerInfo
    };
    console.log('요청 바디:', JSON.stringify(requestBody, null, 2));
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });
    
    await logResponse(response);
  } catch (error) {
    console.error('오류 발생:', error);
  }
};

// 4. Baller 업데이트 테스트
const updateBaller = async () => {
  console.log('\n===== Baller 업데이트 테스트 =====');
  try {
    const url = BASE_URL;
    console.log('요청 URL:', url);
    
    const requestBody = {
      ...TEST_PARAMS,
      ...testBallerInfo,
      trainingPoint: 200,  // 업데이트된 값
      characterLevel: 10   // 업데이트된 값
    };
    console.log('요청 바디:', JSON.stringify(requestBody, null, 2));
    
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });
    
    await logResponse(response);
  } catch (error) {
    console.error('오류 발생:', error);
  }
};

// 5. Baller 삭제 테스트
const deleteBaller = async (excelBallerIndex: number) => {
  console.log(`\n===== Baller ID ${excelBallerIndex} 삭제 테스트 =====`);
  try {
    const url = `${BASE_URL}?employerUid=${TEST_PARAMS.employerUid}&dbName=${TEST_PARAMS.dbName}&excelBallerIndex=${excelBallerIndex}`;
    console.log('요청 URL:', url);
    
    const response = await fetch(url, {
      method: 'DELETE'
    });
    
    await logResponse(response);
  } catch (error) {
    console.error('오류 발생:', error);
  }
};

// 테스트 실행 함수
const runTests = async () => {
  console.log('===== Baller API 테스트 시작 =====');
  
  // 1. 초기 상태 확인
  await getAllBallers();
  
  // 2. Baller 생성
  await createBaller();
  
  // 3. 생성 후 전체 목록 확인
  await getAllBallers();
  
  // 4. 특정 Baller 조회
  await getBallerById(testBallerInfo.excelBallerIndex);
  
  // 5. Baller 업데이트
  await updateBaller();
  
  // 6. 업데이트 후 확인
  await getBallerById(testBallerInfo.excelBallerIndex);
  
  // 7. Baller 삭제
  await deleteBaller(testBallerInfo.excelBallerIndex);
  
  // 8. 삭제 후 확인
  await getAllBallers();
  
  console.log('===== Baller API 테스트 완료 =====');
};

// 이 스크립트를 직접 실행한 경우에만 테스트 실행
if (require.main === module) {
  runTests();
}

// 외부에서 사용할 수 있도록 함수 내보내기
export {
  getAllBallers,
  getBallerById,
  createBaller,
  updateBaller,
  deleteBaller,
  runTests
}; 