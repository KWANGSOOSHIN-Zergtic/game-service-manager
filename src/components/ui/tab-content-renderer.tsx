import React, { useState, useEffect } from 'react';
import { TabContent } from '@/types/tab-structure';
import { DataTable, TableData } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { 
  RefreshCw, 
  AlertCircle, 
  Info, 
  UserX, 
  Database, 
  AlertTriangle, 
  CheckCircle2, 
  X,
  FileWarning, 
  ServerCrash,
  Bug,
  Search,
  Copy,
  Check
} from 'lucide-react';
import { JsonViewerCustom, JsonTheme } from '@/components/ui/json-viewer-custom';

interface TabContentRendererProps {
  content: TabContent;
  className?: string;
}

// API 응답 인터페이스 정의
interface ApiResponse {
  success: boolean;
  currencies?: Record<string, unknown>[];
  data?: Record<string, unknown>[];
  error?: string;
  message?: string;
  [key: string]: unknown;
}

// API 요청 정보를 저장하는 인터페이스 - useApiRequest.ts와 일치시킴
interface ApiRequestInfo {
  url: string;
  params: Record<string, unknown>;
  response?: unknown;
  method: string;
  timestamp: Date;
}

// API 디버그 정보 인터페이스 - useApiRequest.ts에서 사용하는 구조
interface ApiDebugInfo {
  requestUrl: string;
  requestMethod: string;
  requestHeaders: Record<string, string>;
  requestBody?: string;
  timestamp: string;
}

// 응답 정보 섹션을 컴포넌트로 분리
interface ResponseInfoSectionProps {
  debugInfo: ApiResponse | null;
  copyToClipboard: (text: string, section: string) => void;
  copiedSection: string | null;
}

const ResponseInfoSection: React.FC<ResponseInfoSectionProps> = ({ 
  debugInfo, 
  copyToClipboard, 
  copiedSection 
}) => {
  return (
    <div>
      <div className="px-3 py-2 bg-gray-100 font-medium text-gray-700 flex items-center">
        {debugInfo?.success === true ? (
          <CheckCircle2 className="w-5 h-5 mr-2 text-green-600" />
        ) : debugInfo?.success === false ? (
          <X className="w-5 h-5 mr-2 text-red-600" />
        ) : (
          <AlertTriangle className="w-5 h-5 mr-2 text-yellow-600" />
        )}
        <strong>[응답]</strong> 
        {debugInfo?.success !== undefined ? (
          debugInfo.success ? (
            <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-full flex items-center">
              <CheckCircle2 className="w-3 h-3 mr-1" />성공
            </span>
          ) : (
            <span className="ml-2 px-2 py-0.5 bg-red-100 text-red-800 text-xs rounded-full flex items-center">
              <X className="w-3 h-3 mr-1" />실패
            </span>
          )
        ) : (
          <span className="ml-2 px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs rounded-full flex items-center">
            <AlertTriangle className="w-3 h-3 mr-1" />처리 중
          </span>
        )}
      </div>
      <div className={`p-3 ${
        debugInfo?.success === true
          ? 'bg-green-50'
          : debugInfo?.success === false
            ? 'bg-red-50'
            : 'bg-yellow-50'
      }`}>
        {debugInfo?.message && (
          <div className="mb-2">
            <span className="font-semibold">메시지:</span>
            <span className={`ml-2 ${
              debugInfo.success ? 'text-green-700' : 'text-red-700'
            }`}>
              {debugInfo.message}
            </span>
          </div>
        )}
        
        {debugInfo?.error && (
          <div className="mb-2 flex items-start">
            <AlertCircle className="w-4 h-4 mt-0.5 mr-1 text-red-600 flex-shrink-0" />
            <span className="font-semibold">오류:</span>
            <span className="ml-2 text-red-600">{debugInfo.error}</span>
          </div>
        )}
        
        <div>
          <div className="flex items-center justify-between">
            <span className="font-semibold">응답 데이터:</span>
            <button
              onClick={() => copyToClipboard(JSON.stringify(debugInfo, null, 2), 'response')}
              className="flex items-center text-gray-500 hover:text-blue-600 transition-colors px-2 py-1 rounded hover:bg-gray-100"
              title="응답 데이터 클립보드에 복사"
            >
              {copiedSection === 'response' ? (
                <>
                  <Check className="w-3.5 h-3.5 mr-1 text-green-600" />
                  <span className="text-xs text-green-600">복사됨</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 mr-1" />
                  <span className="text-xs">복사</span>
                </>
              )}
            </button>
          </div>
          <JsonViewerCustom 
            data={debugInfo} 
            theme={JsonTheme.LIGHT}
            className="mt-1"
          />
        </div>
      </div>
    </div>
  );
};

// API 요청 정보 섹션을 컴포넌트로 분리 - ResponseInfoSection 위에 추가
interface RequestInfoSectionProps {
  apiDebugInfo: ApiDebugInfo | null;
  requestInfo: ApiRequestInfo | null;
  method: string | null | undefined;
  url: string | null | undefined;
  copyToClipboard: (text: string, section: string) => void;
  copiedSection: string | null;
  debugInfo?: ApiResponse | null; // debugInfo 추가
}

const RequestInfoSection: React.FC<RequestInfoSectionProps> = ({ 
  apiDebugInfo, 
  requestInfo, 
  method, 
  url,
  copyToClipboard, 
  copiedSection,
  debugInfo
}) => {
  // method나 url이 없지만 debugInfo가 있는 경우, debugInfo에서 정보 추출 시도
  if ((!method || !url) && debugInfo) {
    // API 엔드포인트가 응답에 있는 경우 사용
    if (!url && debugInfo.url) {
      url = debugInfo.url as string;
    }
    
    // 메소드는 기본으로 GET 설정
    if (!method) {
      method = 'GET';
    }
  }

  // HTTP 메소드에 따른 배경색 지정
  const getMethodBgColor = (method: string | null | undefined): string => {
    if (!method) return 'bg-gray-100 text-gray-700';
    
    const methodLower = method.toLowerCase();
    if (methodLower === 'get') return 'bg-blue-100 text-blue-700';
    if (methodLower === 'post') return 'bg-green-100 text-green-700';
    if (methodLower === 'put') return 'bg-yellow-100 text-yellow-700';
    if (methodLower === 'delete') return 'bg-red-100 text-red-700';
    return 'bg-gray-100 text-gray-700';
  };

  return (
    <div>
      <div className="px-3 py-2 bg-gray-100 font-medium text-gray-700 flex items-center">
        <strong>[요청]</strong>
        {method && (
          <span className={`ml-2 px-2 py-0.5 rounded text-xs font-medium ${getMethodBgColor(method)}`}>
            {method.toUpperCase()}
          </span>
        )}
        {url ? (
          <span className="ml-2 text-sm text-gray-600 truncate flex-1 font-mono">
            {url}
          </span>
        ) : (
          <span className="ml-2 text-sm text-gray-500 italic">URL 정보 없음</span>
        )}
        {url && (
          <button
            onClick={() => copyToClipboard(url || '', 'url')}
            className="flex items-center text-gray-500 hover:text-blue-600 transition-colors px-2 py-1 rounded hover:bg-gray-100 ml-2"
            title="URL 클립보드에 복사"
          >
            {copiedSection === 'url' ? (
              <>
                <Check className="w-3.5 h-3.5 mr-1 text-green-600" />
                <span className="text-xs text-green-600">복사됨</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 mr-1" />
                <span className="text-xs">복사</span>
              </>
            )}
          </button>
        )}
      </div>
      <div className="p-3 bg-white border-t border-gray-200">
        {/* 헤더 정보 표시 */}
        {apiDebugInfo?.requestHeaders && Object.keys(apiDebugInfo.requestHeaders).length > 0 && (
          <div className="mb-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-semibold">Headers:</span>
                <button
                  onClick={() => apiDebugInfo && copyToClipboard(JSON.stringify(apiDebugInfo.requestHeaders, null, 2), 'headers')}
                  className="flex items-center text-gray-500 hover:text-blue-600 transition-colors px-2 py-1 rounded hover:bg-gray-100"
                  title="헤더 정보 클립보드에 복사"
                >
                  {copiedSection === 'headers' ? (
                    <>
                      <Check className="w-3.5 h-3.5 mr-1 text-green-600" />
                      <span className="text-xs text-green-600">복사됨</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 mr-1" />
                      <span className="text-xs">복사</span>
                    </>
                  )}
                </button>
              </div>
            </div>
            <JsonViewerCustom 
              data={apiDebugInfo?.requestHeaders || {}} 
              theme={JsonTheme.LIGHT}
              className="mt-1"
            />
          </div>
        )}
        
        {/* 요청 바디 표시 */}
        {apiDebugInfo?.requestBody && (
          <div className="mb-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-semibold">Request Body:</span>
                <button
                  onClick={() => apiDebugInfo && copyToClipboard(apiDebugInfo.requestBody || '', 'body')}
                  className="flex items-center text-gray-500 hover:text-blue-600 transition-colors px-2 py-1 rounded hover:bg-gray-100"
                  title="요청 바디 클립보드에 복사"
                >
                  {copiedSection === 'body' ? (
                    <>
                      <Check className="w-3.5 h-3.5 mr-1 text-green-600" />
                      <span className="text-xs text-green-600">복사됨</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 mr-1" />
                      <span className="text-xs">복사</span>
                    </>
                  )}
                </button>
              </div>
            </div>
            <div className="mt-1 p-2 bg-gray-50 rounded border border-gray-200 font-mono text-xs overflow-auto">
              <pre>{apiDebugInfo?.requestBody || ''}</pre>
            </div>
          </div>
        )}
        
        {/* 파라미터 정보 표시 */}
        {requestInfo?.params && Object.keys(requestInfo.params).length > 0 && (
          <div className="mb-2">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-semibold">Parameters:</span>
                <button
                  onClick={() => copyToClipboard(JSON.stringify(requestInfo.params, null, 2), 'params')}
                  className="flex items-center text-gray-500 hover:text-blue-600 transition-colors px-2 py-1 rounded hover:bg-gray-100"
                  title="파라미터 정보 클립보드에 복사"
                >
                  {copiedSection === 'params' ? (
                    <>
                      <Check className="w-3.5 h-3.5 mr-1 text-green-600" />
                      <span className="text-xs text-green-600">복사됨</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 mr-1" />
                      <span className="text-xs">복사</span>
                    </>
                  )}
                </button>
              </div>
            </div>
            <JsonViewerCustom 
              data={requestInfo.params} 
              theme={JsonTheme.LIGHT}
              className="mt-1"
            />
          </div>
        )}
        
        {/* 파라미터가 없거나 요청 정보가 없는 경우 */}
        {(!requestInfo?.params || Object.keys(requestInfo.params).length === 0) && !apiDebugInfo?.requestBody && (
          <div className="bg-yellow-50 p-2 rounded text-yellow-700 text-xs flex items-center">
            <Info className="w-3.5 h-3.5 mr-1" />
            <span>요청 파라미터 정보가 없습니다.</span>
          </div>
        )}
      </div>
    </div>
  );
};

export function TabContentRenderer({ content, className = '' }: TabContentRendererProps) {
  const [data, setData] = useState<TableData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<ApiResponse | null>(null);
  const [requestInfo, setRequestInfo] = useState<ApiRequestInfo | null>(null);
  const [apiDebugInfo, setApiDebugInfo] = useState<ApiDebugInfo | null>(null); // API 디버그 정보 상태 추가
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [showDebugSection, setShowDebugSection] = useState<boolean>(true); // 디버그 섹션 표시 상태

  // 페이지 리로드 함수
  const reloadPage = () => {
    window.location.reload();
  };

  // 사용자 선택 페이지로 이동
  const goToUserSelection = () => {
    window.location.href = '/users';
  };

  // 클립보드 복사 함수
  const copyToClipboard = (text: string, section: string) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        setCopiedSection(section);
        // 1.5초 후 복사 상태 초기화
        setTimeout(() => {
          setCopiedSection(null);
        }, 1500);
      })
      .catch((err) => {
        console.error('클립보드 복사 실패:', err);
        alert('클립보드 복사에 실패했습니다.');
      });
  };

  // 디버그 섹션 토글 함수
  const toggleDebugSection = () => {
    setShowDebugSection(prev => !prev);
  };

  // 데이터 테이블 타입일 경우 API 호출
  useEffect(() => {
    const fetchData = async () => {
      if (content.type !== 'dataTable' || !content.props?.endpoint) return;
        
      setIsLoading(true);
      setError(null);
      setDebugInfo(null);
      setApiDebugInfo(null); // API 디버그 정보 초기화
      setRequestInfo(null); // 요청 정보 초기화
      
      try {
        console.log('[TabContentRenderer] 데이터 요청 시작:', {
          contentType: content.type,
          endpoint: content.props.endpoint
        });
        
        // API 엔드포인트 경로 가져오기 (앞에 슬래시(/)가 있는지 확인)
        let url = content.props.endpoint as string;
        url = url.startsWith('/') ? url : `/${url}`;
        
        // employerStorage에서 사용자 정보 가져오기
        const employerInfo = sessionStorage.getItem('employerStorage');
        
        // 개발 환경에서 사용자 정보가 없을 경우 테스트 데이터 사용 옵션 제공
        if (!employerInfo) {
          console.warn('[TabContentRenderer] 사용자 정보를 찾을 수 없음: sessionStorage에 employerStorage가 없습니다.');
          
          if (process.env.NODE_ENV === 'development') {
            const isDevelopmentMode = true;
            
            if (isDevelopmentMode && typeof content.props.endpoint === 'string' && content.props.endpoint.includes('/api/user/currency')) {
              console.info('[TabContentRenderer] 개발 환경에서 테스트 데이터를 사용합니다.');
              
              // API 엔드포인트 경로 가져오기
              const endpoint = content.props.endpoint.startsWith('/') 
                ? content.props.endpoint 
                : `/${content.props.endpoint}`;
              
              // 저장된 DB 이름 가져오기 (없으면 기본값 사용)
              const savedDbName = sessionStorage.getItem('lastUsedDbName') || 'football_develop';
              console.log('[TabContentRenderer] 저장된 DB 이름:', savedDbName);
              
              // 상대 경로로 API 호출
              const testUrl = `${endpoint}?employerUid=97&dbName=${savedDbName}`;
              console.log('[TabContentRenderer] 테스트 URL 호출:', testUrl);
              
              // 테스트 URL에 대한 요청 정보 설정
              setRequestInfo({
                url: testUrl,
                params: {
                  employerUid: 97,
                  dbName: savedDbName
                },
                method: 'GET',
                timestamp: new Date()
              });
              
              // API 디버그 정보 설정
              setApiDebugInfo({
                requestUrl: testUrl,
                requestMethod: 'GET',
                requestHeaders: { 'Content-Type': 'application/json' },
                timestamp: new Date().toISOString()
              });
              
              try {
                const response = await fetch(testUrl);
                
                // 응답 상태 확인 및 로깅
                console.log('[TabContentRenderer] 테스트 API 응답 상태:', response.status);
                
                const result = await response.json();
                setDebugInfo(result);
                
                if (result.success && result.currencies) {
                  const processedData = result.currencies.map((item: Record<string, unknown>, index: number) => ({
                    id: (item.id as number) || index + 1,
                    ...item
                  }));
                  
                  setData(processedData);
                  setIsLoading(false);
                  return;
                }
              } catch (testError) {
                console.error('[TabContentRenderer] 테스트 데이터 호출 실패:', testError);
              }
            }
          }
          
          setError(`사용자 정보를 찾을 수 없습니다. 사용자 목록 페이지에서 사용자를 선택해주세요.`);
          setIsLoading(false);
          return;
        }
        
        // employerStorage에서 사용자 정보 파싱
        const parsedEmployerInfo = JSON.parse(employerInfo);
        console.log('[TabContentRenderer] 아코디언 사용자 정보 파싱 완료:', parsedEmployerInfo);
        
        // 아코디언 테이블에서 선택된 UID 가져오기
        const employerUid = parsedEmployerInfo.uid;
        
        // db_name 필드가 있으면 사용
        let dbName = '';
        if (parsedEmployerInfo.db_name) {
          dbName = parsedEmployerInfo.db_name;
          console.log('[TabContentRenderer] employerStorage에서 DB 이름 가져옴:', dbName);
        } else {
          // 기존 popupUserInfo에서 DB 이름 가져오기 (이전 버전 호환성 유지)
          const storedInfo = sessionStorage.getItem('popupUserInfo');
          
          if (storedInfo) {
            const parsedInfo = JSON.parse(storedInfo);
            dbName = parsedInfo.dbName;
            console.log('[TabContentRenderer] popupUserInfo에서 DB 이름 가져옴:', dbName);
          } else {
            // 저장된 DB 이름 가져오기 (없으면 기본값 사용)
            dbName = sessionStorage.getItem('lastUsedDbName') || 'football_develop';
            console.log('[TabContentRenderer] 저장된 DB 이름 사용:', dbName);
          }
        }
        
        // DB 이름 저장 (다른 컴포넌트에서 재사용할 수 있도록)
        if (dbName) {
          console.log('[TabContentRenderer] DB 이름 저장:', dbName);
          sessionStorage.setItem('lastUsedDbName', dbName);
        }
        
        if (!employerUid || !dbName) {
          console.error('[TabContentRenderer] 필수 정보 누락:', { employerUid, dbName });
          setError('사용자 UID 또는 데이터베이스 정보가 누락되었습니다.');
          setIsLoading(false);
          return;
        }
        
        // endpoint에 따라 다른 파라미터 설정
        let finalUrl = '';
        
        if (url.includes('/api/user/currency')) {
          // CURRENCY 탭을 위한 API 호출
          finalUrl = `${url}?employerUid=${employerUid}&dbName=${dbName}`;
          console.log('[TabContentRenderer] CURRENCY API 호출 URL:', finalUrl);
          console.log('[TabContentRenderer] CURRENCY API 호출 파라미터:', {
            employerUid,
            dbName,
            parsedEmployerInfo
          });
          
          // 요청 정보 미리 설정
          setRequestInfo({
            url: finalUrl,
            params: {
              employerUid,
              dbName
            },
            method: 'GET',
            timestamp: new Date()
          });
          
          // API 디버그 정보도 미리 설정
          setApiDebugInfo({
            requestUrl: finalUrl,
            requestMethod: 'GET',
            requestHeaders: { 'Content-Type': 'application/json' },
            timestamp: new Date().toISOString()
          });
        } else {
          // 다른 탭들을 위한 기본 파라미터 설정
          finalUrl = `${url}?userId=${employerUid}&dbName=${dbName}`;
          console.log('[TabContentRenderer] 일반 API 호출 URL:', finalUrl);
          console.log('[TabContentRenderer] 일반 API 호출 파라미터:', {
            userId: employerUid,
            dbName
          });
          
          // 요청 정보 미리 설정
          setRequestInfo({
            url: finalUrl,
            params: {
              userId: employerUid,
              dbName
            },
            method: 'GET',
            timestamp: new Date()
          });
          
          // API 디버그 정보도 미리 설정
          setApiDebugInfo({
            requestUrl: finalUrl,
            requestMethod: 'GET',
            requestHeaders: { 'Content-Type': 'application/json' },
            timestamp: new Date().toISOString()
          });
        }
        
        console.log('[TabContentRenderer] API 요청 시작:', finalUrl);
        const response = await fetch(finalUrl);
        
        // 응답 상태 확인 및 로깅
        try {
          console.log('[TabContentRenderer] API 응답 상태:', response.status, '응답 URL:', response.url);
        } catch (e) {
          console.error('[TabContentRenderer] API 응답 상태 로깅 중 오류:', e);
        }
        
        if (!response.ok) {
          const errorText = await response.text();
          
          try {
            console.error('[TabContentRenderer] API 오류 응답:', {
              status: response.status,
              url: finalUrl,
              error: errorText || '내용 없음'
            });
          } catch (e) {
            console.error('[TabContentRenderer] API 오류 응답 로깅 중 오류:', e);
          }
          
          // HTTP 상태 코드별 특별 메시지
          let statusMessage = '';
          switch (response.status) {
            case 404:
              statusMessage = '요청한 API 경로를 찾을 수 없습니다.';
              break;
            case 400:
              statusMessage = '잘못된 요청 형식입니다.';
              break;
            case 401:
              statusMessage = '인증이 필요합니다.';
              break;
            case 403:
              statusMessage = '접근 권한이 없습니다.';
              break;
            case 500:
              statusMessage = '서버 내부 오류가 발생했습니다.';
              break;
            default:
              statusMessage = '오류가 발생했습니다.';
          }
          
          // 오류 메시지 표시를 위한 준비
          const displayErrorText = errorText && errorText.length > 200 
            ? errorText.substring(0, 200) + '...' 
            : errorText || '알 수 없는 오류';
          
          // HTML 응답 감지
          const isHtmlResponse = displayErrorText.trim().toLowerCase().startsWith('<!doctype html>') || 
                                displayErrorText.trim().toLowerCase().startsWith('<html');
          
          const finalErrorText = isHtmlResponse 
            ? '(HTML 응답이 반환되었습니다. 서버 구성을 확인하세요.)' 
            : `(${displayErrorText})`;
          
          setError(`API 오류: ${response.status} - ${statusMessage} ${finalErrorText} (URL: ${finalUrl})`);
          setIsLoading(false);
          return;
        }
        
        // 응답이 비어있는지 확인
        const responseText = await response.text();
        if (!responseText || responseText.trim() === '') {
          try {
            console.error('[TabContentRenderer] API 오류 응답: 응답이 비어있습니다.', {
              url: finalUrl
            });
          } catch (e) {
            console.error('[TabContentRenderer] 빈 응답 로깅 중 오류:', e);
          }
          setError(`API 오류: 응답이 비어있습니다. (URL: ${finalUrl})`);
          setIsLoading(false);
          return;
        }
        
        // JSON으로 파싱 시도
        let result;
        try {
          result = JSON.parse(responseText);
        } catch (parseError) {
          try {
            console.error('[TabContentRenderer] API 오류 응답: JSON 파싱 실패', {
              url: finalUrl,
              responseText: responseText ? (responseText.substring(0, 100) + (responseText.length > 100 ? '...' : '')) : '내용 없음',
              error: parseError
            });
          } catch (e) {
            console.error('[TabContentRenderer] JSON 파싱 실패 로깅 중 오류:', e);
          }
          setError(`API 오류: 응답 데이터가 올바른 JSON 형식이 아닙니다. (URL: ${finalUrl})`);
          setIsLoading(false);
          return;
        }
        
        try {
          console.log('[TabContentRenderer] API 응답 데이터:', result);
        } catch (e) {
          console.error('[TabContentRenderer] API 응답 데이터 로깅 중 오류:', e);
        }
        
        // 그 다음 API 디버그 정보 처리
        if (result && result.debugInfo) {
          try {
            console.log('[TabContentRenderer] API 디버그 정보 발견:', result.debugInfo);
          } catch (e) {
            console.error('[TabContentRenderer] API 디버그 정보 로깅 중 오류:', e);
          }
          
          setApiDebugInfo({
            requestUrl: result.debugInfo?.requestUrl || finalUrl,
            requestMethod: result.debugInfo?.requestMethod || 'GET',
            requestHeaders: result.debugInfo?.requestHeaders || {},
            requestBody: result.debugInfo?.requestBody,
            timestamp: result.debugInfo?.timestamp || new Date().toISOString()
          });
        } else {
          // 디버그 정보가 없는 경우 요청 정보로부터 만들기
          console.log('[TabContentRenderer] API 디버그 정보 없음, 요청 정보 사용');
          setApiDebugInfo({
            requestUrl: finalUrl,
            requestMethod: 'GET',
            requestHeaders: { 'Content-Type': 'application/json' },
            timestamp: new Date().toISOString()
          });
        }
        
        setDebugInfo(result);
        
        if (result.success) {
          // API 응답 형식에 따라 데이터 설정
          if (finalUrl.includes('/api/user/currency') && result.currencies) {
            console.log('[TabContentRenderer] 화폐 데이터 처리:', {
              count: result.currencies.length,
              sample: result.currencies[0] || null
            });
            
            // 데이터에 ID 필드가 없는 경우 추가
            const processedData = result.currencies.map((item: Record<string, unknown>, index: number) => ({
              id: (item.id as number) || index + 1,
              ...item
            }));
            
            setData(processedData);
            console.log('[TabContentRenderer] 처리된 화폐 데이터:', {
              count: processedData.length, 
              sample: processedData[0] || null
            });
          } else if (result.data) {
            console.log('[TabContentRenderer] 일반 데이터 처리:', {
              count: result.data.length,
              sample: result.data[0] || null
            });
            
            const isDataArray = Array.isArray(result.data);
            const processedData = isDataArray ? result.data.map((item: Record<string, unknown>, index: number) => ({
              id: (item.id as number) || index + 1,
              ...item
            })) : [];
            
            setData(processedData);
          } else {
            console.warn('[TabContentRenderer] 데이터가 없음:', result);
            setData([]);
          }
        } else {
          // 전체 결과 객체를 로깅하여 디버깅 용이하게 함
          try {
            console.error('[TabContentRenderer] API 응답 실패:', result);
          } catch (e) {
            console.error('[TabContentRenderer] API 응답 실패 로깅 중 오류:', e);
          }
          
          // 오류 메시지 생성 로직 개선
          let errorMessage = '데이터를 불러오는데 실패했습니다.';
          
          if (result.error && typeof result.error === 'string' && result.error.trim() !== '') {
            errorMessage = result.error;
          } else if (result.message && typeof result.message === 'string' && result.message.trim() !== '') {
            errorMessage = result.message;
          } else if (result.error && typeof result.error === 'object') {
            // 오류 객체가 비어있는지 확인
            const errorKeys = Object.keys(result.error || {});
            if (errorKeys.length > 0) {
              try {
                errorMessage = `오류: ${JSON.stringify(result.error)}`;
              } catch (e) {
                errorMessage = '알 수 없는 오류 형식';
                console.error('[TabContentRenderer] 오류 객체 직렬화 실패:', e);
              }
            } else {
              // 빈 오류 객체({}) 처리
              errorMessage = '서버에서 자세한 오류 정보가 제공되지 않았습니다.';
              console.warn('[TabContentRenderer] 빈 오류 객체 발견:', { url: finalUrl });
            }
          } else {
            // 오류 객체가 없는 경우 URL 정보 포함
            errorMessage = `데이터를 불러오는데 실패했습니다. (URL: ${finalUrl})`;
            console.warn('[TabContentRenderer] 오류 객체 없음:', { url: finalUrl });
          }
          
          setError(errorMessage);
        }
      } catch (err) {
        console.error('[TabContentRenderer] API 호출 오류:', err);
        setError('데이터를 불러오는 중 오류가 발생했습니다.');
        // 오류 발생 시에도 디버그 정보 설정
        setDebugInfo({
          success: false,
          error: err instanceof Error ? err.message : '알 수 없는 오류',
          message: '데이터를 불러오는 중 오류가 발생했습니다.'
        });
        
        // API 디버그 정보도 설정
        if (!apiDebugInfo) {
          setApiDebugInfo({
            requestUrl: content.props?.endpoint as string || '',
            requestMethod: 'GET',
            requestHeaders: { 'Content-Type': 'application/json' },
            timestamp: new Date().toISOString()
          });
        }
        
        // 요청 정보가 없을 경우 기본 정보 설정
        if (!requestInfo) {
          const employerUid = sessionStorage.getItem('employerStorage') 
            ? JSON.parse(sessionStorage.getItem('employerStorage') || '{}').uid 
            : null;
          const dbName = sessionStorage.getItem('lastUsedDbName') || 'football_develop';
          
          setRequestInfo({
            url: content.props?.endpoint as string || '',
            params: { employerUid, dbName },
            method: 'GET',
            timestamp: new Date()
          });
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [content.type, content.props]);

  // 상태별 아이콘 렌더링 함수
  const renderStateIcon = (errorMessage: string | null) => {
    if (!errorMessage) return null;
    
    if (errorMessage.includes('사용자 정보를 찾을 수 없습니다')) {
      return <UserX className="w-5 h-5 text-red-500 mr-2 flex-shrink-0" />;
    } else if (errorMessage.includes('사용자 UID 또는 데이터베이스 정보가 누락되었습니다')) {
      return <Database className="w-5 h-5 text-red-500 mr-2 flex-shrink-0" />;
    } else if (errorMessage.includes('API 오류')) {
      return <ServerCrash className="w-5 h-5 text-red-500 mr-2 flex-shrink-0" />;
    } else if (errorMessage.includes('데이터를 불러오는')) {
      return <FileWarning className="w-5 h-5 text-red-500 mr-2 flex-shrink-0" />;
    } else {
      return <AlertTriangle className="w-5 h-5 text-red-500 mr-2 flex-shrink-0" />;
    }
  };

  // 에러 상태의 UI에 디버그 정보 추가
  const renderErrorState = () => (
    <div className="bg-red-50 text-red-500 p-4 rounded-md">
      <div className="flex items-start">
        {renderStateIcon(error)}
        <p className="font-medium">{error}</p>
      </div>
      
      <div className="mt-4 flex flex-col sm:flex-row gap-2">
        <Button 
          onClick={reloadPage} 
          className="bg-blue-500 hover:bg-blue-600 text-white"
          size="sm"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          페이지 새로고침
        </Button>
        
        <Button 
          onClick={goToUserSelection} 
          className="bg-purple-500 hover:bg-purple-600 text-white"
          size="sm"
        >
          <Search className="w-4 h-4 mr-2" />
          사용자 선택 페이지로 이동
        </Button>
      </div>
      
      <div className="mt-4 bg-blue-50 text-blue-600 p-3 rounded-md text-sm">
        <div className="flex items-start">
          <Info className="w-4 h-4 mt-0.5 mr-2 flex-shrink-0" />
          <p className="font-medium">안내:</p>
        </div>
        <ul className="mt-1 list-disc list-inside">
          <li className="ml-2">아코디언 테이블에서 사용자를 선택해주세요.</li>
          <li className="ml-2">선택한 사용자의 UID가 API 요청에 사용됩니다.</li>
        </ul>
        <p className="mt-2 text-xs font-medium">사용 가능한 데이터베이스:</p>
        <ul className="mt-1 list-disc list-inside">
          <li className="ml-2">football_service</li>
          <li className="ml-2">football_release</li>
          <li className="ml-2">football_develop</li>
          <li className="ml-2">football_develop_backup</li>
        </ul>
      </div>
      
      {debugInfo && (
        <details className="mt-2 text-sm">
          <summary className="cursor-pointer flex items-center justify-between">
            <div className="flex items-center">
              <Bug className="w-4 h-4 mr-1 text-gray-600" />
              <span className="text-blue-600">API 디버그 정보</span>
              {debugInfo?.success && <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-full flex items-center"><CheckCircle2 className="w-3 h-3 mr-1" />성공</span>}
              {debugInfo?.success === false && <span className="ml-2 px-2 py-0.5 bg-red-100 text-red-800 text-xs rounded-full flex items-center"><X className="w-3 h-3 mr-1" />실패</span>}
            </div>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                // 모든 디버그 데이터 복사
                const allData = {
                  request: apiDebugInfo || requestInfo,
                  response: debugInfo,
                };
                copyToClipboard(JSON.stringify(allData, null, 2), 'all');
              }}
              className="flex items-center text-gray-500 hover:text-blue-600 transition-colors px-2 py-1 rounded hover:bg-gray-100"
              title="모든 디버그 정보 클립보드에 복사"
            >
              {copiedSection === 'all' ? (
                <>
                  <Check className="w-3.5 h-3.5 mr-1 text-green-600" />
                  <span className="text-xs text-green-600">복사됨</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 mr-1" />
                  <span className="text-xs">전체 복사</span>
                </>
              )}
            </button>
          </summary>
          
          <div className="mt-2 border border-gray-200 rounded-md overflow-hidden">
            {/* API 요청 정보 섹션 - 개선된 로직 */}
            {/* 디버그 정보 출력 */}
            {(() => { 
              try {
                console.log('디버그 정보 현황:', { 
                  requestInfo: requestInfo || null, 
                  apiDebugInfo: apiDebugInfo || null, 
                  debugInfo: debugInfo || null
                }); 
              } catch (e) {
                console.error('[TabContentRenderer] 디버그 정보 로깅 중 오류:', e);
              }
              return null; 
            })()}
            
            {/* 디버그 정보 표시 여부 */}
            <div className="bg-gray-100 p-2 text-xs">
              <span>디버그 정보 상태: </span>
              <span className="font-mono">requestInfo: {requestInfo ? '✅' : '❌'}, </span>
              <span className="font-mono">apiDebugInfo: {apiDebugInfo ? '✅' : '❌'}, </span>
              <span className="font-mono">debugInfo: {debugInfo ? '✅' : '❌'}</span>
            </div>
            
            {(requestInfo || apiDebugInfo) ? (
              <RequestInfoSection
                apiDebugInfo={apiDebugInfo}
                requestInfo={requestInfo}
                method={apiDebugInfo?.requestMethod || requestInfo?.method}
                url={apiDebugInfo?.requestUrl || requestInfo?.url}
                copyToClipboard={copyToClipboard}
                copiedSection={copiedSection}
                debugInfo={debugInfo}
              />
            ) : (
              <div className="p-3 bg-yellow-50 text-yellow-700">
                <AlertTriangle className="w-4 h-4 mr-1 inline-block" />
                API 요청 정보가 없습니다. API 호출이 아직 이루어지지 않았거나 요청 정보가 캡처되지 않았습니다.
              </div>
            )}
            
            {/* 응답 정보 섹션 */}
            {debugInfo ? (
              <ResponseInfoSection 
                debugInfo={debugInfo} 
                copyToClipboard={copyToClipboard}
                copiedSection={copiedSection}
              />
            ) : (
              <div className="p-3 bg-yellow-50 text-yellow-700">
                <AlertTriangle className="w-4 h-4 mr-1 inline-block" />
                API 응답 정보가 없습니다. API 호출이 아직 완료되지 않았거나 응답이 캡처되지 않았습니다.
              </div>
            )}
          </div>
        </details>
      )}
    </div>
  );

  // 컨텐츠 타입에 따라 적절한 컴포넌트 렌더링
  switch (content.type) {
    case 'dataTable':
      return (
        <div className={`p-4 ${className}`}>
          {error ? renderErrorState() : (
            <>
              <DataTable
                tableName={content.props?.tableName as string || '데이터 테이블'}
                data={data}
                isLoading={isLoading}
                className="w-full"
                customFormatters={content.props?.formatters as Record<string, (value: string | number | null | object) => string | number | React.ReactNode>}
              />
              {data.length === 0 && !isLoading && (
                <div className="mt-4 p-4 bg-blue-50 text-blue-600 rounded-md">
                  <div className="flex items-start">
                    <Database className="w-5 h-5 mr-2 flex-shrink-0" />
                    <p>데이터가 없습니다. API 응답은 성공했으나 표시할 데이터가 없습니다.</p>
                  </div>
                </div>
              )}
              
              {/* 항상 디버그 버튼 표시 (개발 환경에서만) */}
              {process.env.NODE_ENV === 'development' && (
                <div className="mt-4 flex justify-end">
                  <button 
                    onClick={toggleDebugSection}
                    className="flex items-center text-xs px-2 py-1 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded"
                  >
                    <Bug className="w-3.5 h-3.5 mr-1" />
                    {showDebugSection ? '디버그 정보 숨기기' : '디버그 정보 표시'}
                  </button>
                </div>
              )}

              {/* 디버그 정보 섹션 - 항상 렌더링되지만 상태에 따라 표시/숨김 */}
              {process.env.NODE_ENV === 'development' && showDebugSection && (
                <div className="mt-2 border rounded shadow-sm bg-gray-50">
                  <div className="p-3 bg-gray-100 font-medium text-sm border-b flex items-center justify-between">
                    <div className="flex items-center">
                      <Bug className="w-4 h-4 mr-2 text-blue-600" />
                      <span className="text-blue-700">API 디버그 정보</span>
                      {debugInfo?.success === true && 
                        <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-full flex items-center">
                          <CheckCircle2 className="w-3 h-3 mr-1" />성공
                        </span>
                      }
                      {debugInfo?.success === false && 
                        <span className="ml-2 px-2 py-0.5 bg-red-100 text-red-800 text-xs rounded-full flex items-center">
                          <X className="w-3 h-3 mr-1" />실패
                        </span>
                      }
                    </div>
                    <button
                      onClick={() => {
                        const allData = {
                          request: apiDebugInfo || requestInfo,
                          response: debugInfo,
                        };
                        copyToClipboard(JSON.stringify(allData, null, 2), 'all');
                      }}
                      className="flex items-center text-gray-500 hover:text-blue-600 transition-colors px-2 py-1 rounded hover:bg-gray-200"
                    >
                      {copiedSection === 'all' ? (
                        <>
                          <Check className="w-3.5 h-3.5 mr-1 text-green-600" />
                          <span className="text-xs text-green-600">복사됨</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 mr-1" />
                          <span className="text-xs">전체 복사</span>
                        </>
                      )}
                    </button>
                  </div>
                  
                  <div className="border-b border-gray-200">
                    {/* 디버그 정보 출력 */}
                    {(() => { 
                      try {
                        console.log('디버그 정보 현황:', { 
                          requestInfo: requestInfo || null, 
                          apiDebugInfo: apiDebugInfo || null, 
                          debugInfo: debugInfo || null
                        }); 
                      } catch (e) {
                        console.error('[TabContentRenderer] 디버그 정보 로깅 중 오류:', e);
                      }
                      return null; 
                    })()}
                    
                    {/* 디버그 정보 표시 여부 */}
                    <div className="bg-gray-100 p-2 text-xs">
                      <span>디버그 정보 상태: </span>
                      <span className="font-mono">requestInfo: {requestInfo ? '✅' : '❌'}, </span>
                      <span className="font-mono">apiDebugInfo: {apiDebugInfo ? '✅' : '❌'}, </span>
                      <span className="font-mono">debugInfo: {debugInfo ? '✅' : '❌'}</span>
                    </div>
                  </div>
                  
                  <div className="border-gray-200 overflow-hidden">  
                    {/* API 요청 정보 섹션 */}
                    {(requestInfo || apiDebugInfo) ? (
                      <RequestInfoSection
                        apiDebugInfo={apiDebugInfo}
                        requestInfo={requestInfo}
                        method={apiDebugInfo?.requestMethod || requestInfo?.method}
                        url={apiDebugInfo?.requestUrl || requestInfo?.url}
                        copyToClipboard={copyToClipboard}
                        copiedSection={copiedSection}
                        debugInfo={debugInfo}
                      />
                    ) : (
                      <div className="p-3 bg-yellow-50 text-yellow-700">
                        <div className="flex items-start">
                          <AlertTriangle className="w-4 h-4 mr-1 inline-block" />
                          <div>
                            <p className="font-medium">API 요청 정보가 없습니다.</p>
                            <p className="text-xs mt-1">API 호출이 아직 이루어지지 않았거나 요청 정보가 캡처되지 않았습니다.</p>
                            
                            {debugInfo && (
                              <div className="mt-2 p-2 bg-blue-50 rounded text-blue-700 text-xs">
                                <Info className="w-3.5 h-3.5 mr-1 inline-block" />
                                응답 데이터는 있지만 요청 정보가 없습니다. 이는 API 응답 처리 중에 요청 정보가 설정되지 않았을 수 있습니다.
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* 응답 정보 섹션 */}
                    {debugInfo ? (
                      <ResponseInfoSection 
                        debugInfo={debugInfo} 
                        copyToClipboard={copyToClipboard}
                        copiedSection={copiedSection}
                      />
                    ) : (
                      <div className="p-3 bg-yellow-50 text-yellow-700">
                        <div className="flex items-start">
                          <AlertTriangle className="w-4 h-4 mr-1 inline-block" />
                          <div>
                            <p className="font-medium">API 응답 정보가 없습니다.</p>
                            <p className="text-xs mt-1">API 호출이 아직 완료되지 않았거나 응답이 캡처되지 않았습니다.</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      );
      
    case 'controller':
      return (
        <div className={`p-4 border rounded-md ${className}`}>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-gray-700">컨트롤러</h3>
          </div>
          <div className="flex gap-2">
            <button className="bg-blue-500 text-white text-xs px-3 py-1 rounded">
              필터
            </button>
            <button className="bg-green-500 text-white text-xs px-3 py-1 rounded">
              추가
            </button>
            <button className="bg-red-500 text-white text-xs px-3 py-1 rounded">
              삭제
            </button>
          </div>
        </div>
      );
      
    case 'subTab':
      return (
        <div className={`p-4 border rounded-md ${className}`}>
          <h3 className="text-sm font-semibold text-gray-700 mb-2">서브 탭</h3>
          <div className="bg-gray-100 rounded p-3 text-xs">
            <p className="text-gray-500">서브 탭 컴포넌트는 하위 탭을 포함할 수 있습니다.</p>
          </div>
        </div>
      );
      
    case 'accordion':
      return (
        <div className={`p-4 border rounded-md ${className}`}>
          <h3 className="text-sm font-semibold text-gray-700 mb-2">아코디언</h3>
          <div className="bg-gray-100 rounded p-3 text-xs">
            <p className="text-gray-500">아코디언 컴포넌트는 접을 수 있는 컨텐츠를 포함합니다.</p>
          </div>
        </div>
      );
      
    default:
      return (
        <div className={`p-4 border rounded-md ${className}`}>
          <p className="text-sm text-gray-500">알 수 없는 컨텐츠 타입</p>
        </div>
      );
  }
}