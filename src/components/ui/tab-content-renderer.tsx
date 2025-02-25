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
import { JsonViewer } from '@/components/ui/json-viewer';
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

// API 요청 정보를 저장하는 인터페이스
interface ApiRequestInfo {
  url: string;
  params: Record<string, unknown>;
  response?: unknown;
  method: string;
  timestamp: Date;
}

export function TabContentRenderer({ content, className = '' }: TabContentRendererProps) {
  const [data, setData] = useState<TableData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<ApiResponse | null>(null);
  const [requestInfo, setRequestInfo] = useState<ApiRequestInfo | null>(null);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

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

  // 데이터 테이블 타입일 경우 API 호출
  useEffect(() => {
    const fetchData = async () => {
      if (content.type !== 'dataTable' || !content.props?.endpoint) return;
        
      setIsLoading(true);
      setError(null);
      setDebugInfo(null);
      
      try {
        console.log('[TabContentRenderer] 데이터 요청 시작:', {
          contentType: content.type,
          endpoint: content.props.endpoint
        });
        
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
              
              try {
                const response = await fetch(testUrl);
                
                // 응답 상태 확인 및 로깅
                console.log('[TabContentRenderer] 테스트 API 응답 상태:', response.status);
                
                if (!response.ok) {
                  // 오류 응답일 경우 상세 내용 로깅
                  const errorText = await response.text();
                  console.error('[TabContentRenderer] 테스트 API 오류 응답:', {
                    status: response.status,
                    url: testUrl,
                    error: errorText
                  });
                  
                  // 개발 환경에서는 오류 메시지에 더 자세한 정보 제공
                  setError(`
                    테스트 데이터를 불러올 수 없습니다. 
                    - 현재 API URL: ${testUrl}
                    - 데이터베이스 이름: ${savedDbName}
                    - 사용 가능한 DB 목록: football_service, football_release, football_develop, football_develop_backup
                    - 서버가 실행 중인지 확인해주세요.
                    - API 경로가 올바른지 확인해주세요.
                  `.trim().replace(/\s+/g, ' '));
                  
                  // 디버그 정보가 없을 경우 설정
                  if (!debugInfo) {
                    setDebugInfo({
                      success: false,
                      error: `API 응답 오류: ${response.status}`,
                      url: testUrl,
                      dbName: savedDbName,
                      availableDBs: ['football_service', 'football_release', 'football_develop', 'football_develop_backup'],
                      locationInfo: {
                        origin: window.location.origin,
                        port: window.location.port,
                        host: window.location.host
                      }
                    });
                  }
                  
                  throw new Error(`API 응답 오류: ${response.status} - URL: ${testUrl}`);
                }
                
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
        
        // 기존 popupUserInfo에서 DB 이름 가져오기
        const storedInfo = sessionStorage.getItem('popupUserInfo');
        let dbName = '';
        
        if (storedInfo) {
          const parsedInfo = JSON.parse(storedInfo);
          dbName = parsedInfo.dbName;
          console.log('[TabContentRenderer] popupUserInfo에서 DB 이름 가져옴:', dbName);
        } else {
          // 저장된 DB 이름 가져오기 (없으면 기본값 사용)
          dbName = sessionStorage.getItem('lastUsedDbName') || 'football_develop';
          console.log('[TabContentRenderer] 저장된 DB 이름 사용:', dbName);
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
        let url = content.props.endpoint as string;
        
        // API 엔드포인트 경로 가져오기 (앞에 슬래시(/)가 있는지 확인)
        url = url.startsWith('/') ? url : `/${url}`;
        
        if (url.includes('/api/user/currency')) {
          // CURRENCY 탭을 위한 API 호출
          url = `${url}?employerUid=${employerUid}&dbName=${dbName}`;
          console.log('[TabContentRenderer] CURRENCY API 호출 URL:', url);
          console.log('[TabContentRenderer] CURRENCY API 호출 파라미터:', {
            employerUid,
            dbName,
            parsedEmployerInfo
          });
          
          // 요청 정보 저장
          setRequestInfo({
            url,
            params: {
              employerUid,
              dbName
            },
            method: 'GET',
            timestamp: new Date()
          });
        } else {
          // 다른 탭들을 위한 기본 파라미터 설정
          url = `${url}?userId=${employerUid}&dbName=${dbName}`;
          console.log('[TabContentRenderer] 일반 API 호출 URL:', url);
          console.log('[TabContentRenderer] 일반 API 호출 파라미터:', {
            userId: employerUid,
            dbName
          });
          
          // 요청 정보 저장
          setRequestInfo({
            url,
            params: {
              userId: employerUid,
              dbName
            },
            method: 'GET',
            timestamp: new Date()
          });
        }
        
        console.log('[TabContentRenderer] API 요청 시작:', url);
        const response = await fetch(url);
        
        // 응답 상태 확인 및 로깅
        console.log('[TabContentRenderer] API 응답 상태:', response.status, '응답 URL:', response.url);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('[TabContentRenderer] API 오류 응답:', {
            status: response.status,
            url: url,
            error: errorText
          });
          setError(`API 오류: ${response.status} - ${errorText || '알 수 없는 오류'} (URL: ${url})`);
          setIsLoading(false);
          return;
        }
        
        const result = await response.json();
        console.log('[TabContentRenderer] API 응답 데이터:', result);
        setDebugInfo(result); // 디버깅을 위해 전체 응답 저장
        
        if (result.success) {
          // API 응답 형식에 따라 데이터 설정
          if (url.includes('/api/user/currency') && result.currencies) {
            console.log('[TabContentRenderer] 화폐 데이터 처리:', {
              count: result.currencies.length,
              sample: result.currencies[0] || null
            });
            
            // 데이터에 ID 필드가 없는 경우 추가
            const processedData = result.currencies.map((item: Record<string, unknown>, index: number) => ({
              id: (item.id as number) || index + 1, // ID가 없으면 index 기반으로 생성
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
            
            // 데이터에 ID 필드가 없는 경우 추가
            const processedData = result.data.map((item: Record<string, unknown>, index: number) => ({
              id: (item.id as number) || index + 1, // ID가 없으면 index 기반으로 생성
              ...item
            }));
            
            setData(processedData);
          } else {
            console.warn('[TabContentRenderer] 데이터가 없음:', result);
            setData([]);
          }
        } else {
          console.error('[TabContentRenderer] API 응답 실패:', {
            error: result.error
          });
          setError(result.error || '데이터를 불러오는데 실패했습니다.');
        }
      } catch (err) {
        console.error('[TabContentRenderer] API 호출 오류:', err);
        setError('데이터를 불러오는 중 오류가 발생했습니다.');
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

  // API 요청 디버그 정보를 표시하는 함수
  const renderDebugInfo = () => {
    if (!requestInfo) return null;
    
    return (
      <div className="bg-slate-100 p-4 my-4 rounded-md text-sm">
        <h3 className="font-semibold mb-2 text-slate-700">API 디버그 정보</h3>
        <div className="mb-3">
          <p className="font-medium text-slate-600">요청 URL:</p>
          <code className="bg-slate-200 p-1 rounded text-xs block whitespace-pre-wrap">
            {requestInfo.url}
          </code>
        </div>
        
        <div className="mb-3">
          <p className="font-medium text-slate-600">요청 파라미터:</p>
          <div className="bg-slate-200 p-2 rounded text-xs">
            <JsonViewerCustom 
              data={requestInfo.params} 
              theme={JsonTheme.LIGHT}
              copyable
            />
          </div>
        </div>
        
        {requestInfo.response && (
          <div>
            <p className="font-medium text-slate-600">응답 데이터:</p>
            <div className="bg-slate-200 p-2 rounded text-xs max-h-96 overflow-auto">
              <JsonViewerCustom 
                data={requestInfo.response} 
                theme={JsonTheme.LIGHT}
                copyable
              />
            </div>
          </div>
        )}
      </div>
    );
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
          <summary className="cursor-pointer flex items-center">
            <Bug className="w-4 h-4 mr-1 text-gray-600" />
            <span>디버그 정보</span>
            {requestInfo && (
              <span className="ml-2 text-xs text-gray-500">
                (URL: {requestInfo.url})
              </span>
            )}
          </summary>
          <div className="mt-2 space-y-2">
            {requestInfo && (
              <div className="bg-gray-100 p-2 rounded">
                <h4 className="font-medium">API 요청 정보</h4>
                <div className="mt-1 text-xs">
                  <div><strong>URL:</strong> {requestInfo.url}</div>
                  <div><strong>Method:</strong> {requestInfo.method}</div>
                  <div><strong>Params:</strong> <JsonViewer data={requestInfo.params} className="mt-1 inline-block" /></div>
                  <div><strong>Timestamp:</strong> {requestInfo.timestamp.toISOString()}</div>
                </div>
              </div>
            )}
            <JsonViewer data={debugInfo} className="rounded" />
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
              {process.env.NODE_ENV === 'development' && (debugInfo || requestInfo) && (
                <details className="mt-4 text-xs text-gray-700 border-t pt-2">
                  <summary className="cursor-pointer font-semibold flex items-center justify-between">
                    <div className="flex items-center">
                      <Info className="w-4 h-4 mr-1" />
                      <span className="text-blue-600">API 디버그 정보</span>
                      {debugInfo?.success && <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-full flex items-center"><CheckCircle2 className="w-3 h-3 mr-1" />성공</span>}
                      {debugInfo?.success === false && <span className="ml-2 px-2 py-0.5 bg-red-100 text-red-800 text-xs rounded-full flex items-center"><X className="w-3 h-3 mr-1" />실패</span>}
                    </div>
                    <button
                      onClick={(e) => {
                        e.preventDefault(); // details가 토글되는 것을 방지
                        const allData = {
                          request: requestInfo,
                          response: debugInfo
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
                    {/* 요청 정보 섹션 */}
                    {requestInfo && (
                      <div className="border-b">
                        <div className="px-3 py-2 bg-gray-100 font-medium text-gray-700 flex items-center">
                          <AlertTriangle className="w-4 h-4 mr-2 text-blue-600" />
                          <strong>[요청]</strong> <span className="ml-1">{requestInfo.timestamp.toLocaleTimeString()}</span>
                        </div>
                        <div className="p-3 bg-white">
                          <div className="mb-2">
                            <div className="flex items-center justify-between">
                              <div>
                                <span className="font-semibold">URL:</span> 
                                <span className="ml-2 text-blue-600">{requestInfo.url}</span>
                              </div>
                              <button
                                onClick={() => copyToClipboard(requestInfo.url, 'url')}
                                className="flex items-center text-gray-500 hover:text-blue-600 transition-colors px-2 py-1 rounded hover:bg-gray-100"
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
                            </div>
                          </div>
                          <div className="mb-2">
                            <span className="font-semibold">Method:</span> 
                            <span className="ml-2 text-purple-600">{requestInfo.method}</span>
                          </div>
                          <div>
                            <div className="flex items-center justify-between">
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
                            <JsonViewerCustom 
                              data={requestInfo.params} 
                              theme={JsonTheme.LIGHT}
                              className="mt-1"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* 응답 정보 섹션 */}
                    {debugInfo && (
                      <div>
                        <div className="px-3 py-2 bg-gray-100 font-medium text-gray-700 flex items-center">
                          {debugInfo.success === true ? (
                            <CheckCircle2 className="w-5 h-5 mr-2 text-green-600" />
                          ) : debugInfo.success === false ? (
                            <X className="w-5 h-5 mr-2 text-red-600" />
                          ) : (
                            <AlertTriangle className="w-5 h-5 mr-2 text-yellow-600" />
                          )}
                          <strong>[결과]</strong> 
                          {debugInfo.success !== undefined ? (
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
                          debugInfo.success === true
                            ? 'bg-green-50'
                            : debugInfo.success === false
                              ? 'bg-red-50'
                              : 'bg-yellow-50'
                        }`}>
                          {debugInfo.message && (
                            <div className="mb-2">
                              <span className="font-semibold">메시지:</span>
                              <span className={`ml-2 ${
                                debugInfo.success ? 'text-green-700' : 'text-red-700'
                              }`}>
                                {debugInfo.message}
                              </span>
                            </div>
                          )}
                          
                          {debugInfo.error && (
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
                    )}
                  </div>
                </details>
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