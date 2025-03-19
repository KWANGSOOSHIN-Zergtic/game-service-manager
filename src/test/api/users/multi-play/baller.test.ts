import { NextRequest } from 'next/server';
import { GET, POST, PUT, DELETE } from '@/app/api/users/multi-play/baller/route';
import * as service from '@/app/api/users/multi-play/baller/service';

// 모킹
jest.mock('@/app/api/users/multi-play/baller/service');

// 모의 NextRequest 생성 유틸리티 함수
const createMockRequest = (params: Record<string, string>, method: string = 'GET', body?: Record<string, unknown>): NextRequest => {
  const url = new URL('http://localhost');
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, value);
  });

  const request = {
    nextUrl: url,
    json: jest.fn().mockResolvedValue(body),
    method
  } as unknown as NextRequest;

  return request;
};

describe('UserBaller API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/users/multi-play/baller', () => {
    it('should get all Baller for a user', async () => {
      // 서비스 모킹
      const mockResponse = {
        success: true,
        message: '사용자 Baller 정보를 성공적으로 조회했습니다.',
        ballers: [{ id: 1, excel_baller_index: 1001, employer_uid: 123 }],
        status: 200
      };
      (service.getUserBaller as jest.Mock).mockResolvedValue(mockResponse);

      // 요청 생성
      const request = createMockRequest({ employerUid: '123', dbName: 'test_db' });
      
      // API 호출
      const response = await GET(request);
      const responseData = await response.json();
      
      // 어설션
      expect(response.status).toBe(200);
      expect(responseData).toEqual({
        success: true,
        message: '사용자 Baller 정보를 성공적으로 조회했습니다.',
        ballers: [{ id: 1, excel_baller_index: 1001, employer_uid: 123 }]
      });
      expect(service.getUserBaller).toHaveBeenCalledWith({ employerUid: '123', dbName: 'test_db' });
    });

    it('should get a specific Baller for a user', async () => {
      // 서비스 모킹
      const mockResponse = {
        success: true,
        message: 'Baller 정보를 성공적으로 조회했습니다.',
        baller: { id: 1, excel_baller_index: 1001, employer_uid: 123 },
        status: 200
      };
      (service.getUserBallerItem as jest.Mock).mockResolvedValue(mockResponse);

      // 요청 생성
      const request = createMockRequest({ 
        employerUid: '123', 
        dbName: 'test_db', 
        excelBallerIndex: '1001' 
      });
      
      // API 호출
      const response = await GET(request);
      const responseData = await response.json();
      
      // 어설션
      expect(response.status).toBe(200);
      expect(responseData).toEqual({
        success: true,
        message: 'Baller 정보를 성공적으로 조회했습니다.',
        baller: { id: 1, excel_baller_index: 1001, employer_uid: 123 }
      });
      expect(service.getUserBallerItem).toHaveBeenCalledWith({ 
        employerUid: '123', 
        dbName: 'test_db', 
        excelBallerIndex: 1001 
      });
    });
  });

  describe('POST /api/users/multi-play/baller', () => {
    it('should create a new Baller', async () => {
      // 서비스 모킹
      const mockResponse = {
        success: true,
        message: 'Baller 정보를 성공적으로 생성했습니다.',
        baller: { 
          id: 1, 
          excel_baller_index: 1001, 
          employer_uid: 123,
          training_point: 100,
          character_level: 2,
          recruit_process: 1,
          character_status: 1,
          talk_group_no: 2,
          etc: '테스트',
          max_upgrade_point: 500
        },
        status: 201
      };
      (service.createUserBaller as jest.Mock).mockResolvedValue(mockResponse);

      // 요청 본문
      const requestBody = {
        employerUid: '123',
        dbName: 'test_db',
        excelBallerIndex: 1001,
        trainingPoint: 100,
        characterLevel: 2,
        recruitProcess: 1,
        characterStatus: 1,
        talkGroupNo: 2,
        etc: '테스트',
        maxUpgradePoint: 500
      };
      
      // 요청 생성
      const request = createMockRequest({}, 'POST', requestBody);
      
      // API 호출
      const response = await POST(request);
      const responseData = await response.json();
      
      // 어설션
      expect(response.status).toBe(201);
      expect(responseData).toEqual({
        success: true,
        message: 'Baller 정보를 성공적으로 생성했습니다.',
        baller: { 
          id: 1, 
          excel_baller_index: 1001, 
          employer_uid: 123,
          training_point: 100,
          character_level: 2,
          recruit_process: 1,
          character_status: 1,
          talk_group_no: 2,
          etc: '테스트',
          max_upgrade_point: 500
        }
      });
      expect(service.createUserBaller).toHaveBeenCalledWith(requestBody);
    });
  });

  describe('PUT /api/users/multi-play/baller', () => {
    it('should update an existing Baller', async () => {
      // 서비스 모킹
      const mockResponse = {
        success: true,
        message: 'Baller 정보를 성공적으로 업데이트했습니다.',
        baller: { 
          id: 1, 
          excel_baller_index: 1001, 
          employer_uid: 123,
          training_point: 200,
          character_level: 3,
          recruit_process: 2,
          character_status: 0,
          talk_group_no: 3,
          etc: '업데이트',
          max_upgrade_point: 1000
        },
        status: 200
      };
      (service.updateUserBaller as jest.Mock).mockResolvedValue(mockResponse);

      // 요청 본문
      const requestBody = {
        employerUid: '123',
        dbName: 'test_db',
        excelBallerIndex: 1001,
        trainingPoint: 200,
        characterLevel: 3,
        recruitProcess: 2,
        characterStatus: 0,
        talkGroupNo: 3,
        etc: '업데이트',
        maxUpgradePoint: 1000
      };
      
      // 요청 생성
      const request = createMockRequest({}, 'PUT', requestBody);
      
      // API 호출
      const response = await PUT(request);
      const responseData = await response.json();
      
      // 어설션
      expect(response.status).toBe(200);
      expect(responseData).toEqual({
        success: true,
        message: 'Baller 정보를 성공적으로 업데이트했습니다.',
        baller: { 
          id: 1, 
          excel_baller_index: 1001, 
          employer_uid: 123,
          training_point: 200,
          character_level: 3,
          recruit_process: 2,
          character_status: 0,
          talk_group_no: 3,
          etc: '업데이트',
          max_upgrade_point: 1000
        }
      });
      expect(service.updateUserBaller).toHaveBeenCalledWith(requestBody);
    });
  });

  describe('DELETE /api/users/multi-play/baller', () => {
    it('should delete a Baller', async () => {
      // 서비스 모킹
      const mockResponse = {
        success: true,
        message: 'Baller 정보를 성공적으로 삭제했습니다.',
        baller: { id: 1, excel_baller_index: 1001, employer_uid: 123 },
        status: 200
      };
      (service.deleteUserBaller as jest.Mock).mockResolvedValue(mockResponse);

      // 요청 생성
      const request = createMockRequest({ 
        employerUid: '123', 
        dbName: 'test_db', 
        excelBallerIndex: '1001' 
      }, 'DELETE');
      
      // API 호출
      const response = await DELETE(request);
      const responseData = await response.json();
      
      // 어설션
      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);
      expect(responseData.message).toBe("1개 항목이 성공적으로 삭제되었습니다.");
      expect(service.deleteUserBaller).toHaveBeenCalledWith({ 
        employerUid: '123', 
        dbName: 'test_db', 
        excelBallerIndex: 1001 
      });
    });

    it('should handle multiple Baller deletions', async () => {
      // 서비스 모킹
      const mockResponse1 = {
        success: true,
        message: 'Baller 정보를 성공적으로 삭제했습니다.',
        baller: { id: 1, excel_baller_index: 1001, employer_uid: 123 },
        status: 200
      };
      const mockResponse2 = {
        success: true,
        message: 'Baller 정보를 성공적으로 삭제했습니다.',
        baller: { id: 2, excel_baller_index: 1002, employer_uid: 123 },
        status: 200
      };
      
      (service.deleteUserBaller as jest.Mock)
        .mockResolvedValueOnce(mockResponse1)
        .mockResolvedValueOnce(mockResponse2);

      // 요청 생성
      const request = createMockRequest({ 
        employerUid: '123', 
        dbName: 'test_db', 
        excelBallerIndex: '1001,1002' 
      }, 'DELETE');
      
      // API 호출
      const response = await DELETE(request);
      const responseData = await response.json();
      
      // 어설션
      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);
      expect(responseData.message).toBe("2개 항목이 성공적으로 삭제되었습니다.");
      expect(service.deleteUserBaller).toHaveBeenCalledTimes(2);
      expect(service.deleteUserBaller).toHaveBeenNthCalledWith(1, { 
        employerUid: '123', 
        dbName: 'test_db', 
        excelBallerIndex: 1001 
      });
      expect(service.deleteUserBaller).toHaveBeenNthCalledWith(2, { 
        employerUid: '123', 
        dbName: 'test_db', 
        excelBallerIndex: 1002
      });
    });
  });
}); 