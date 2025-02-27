import React, { useState, useEffect, useCallback } from 'react';
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
  Check,
  Clock,
  ChevronDown,
  Edit,
  Save
} from 'lucide-react';
import { JsonViewerCustom, JsonTheme } from '@/components/ui/json-viewer-custom';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { toast } from "@/hooks/use-toast";
import { logger } from "@/lib/logger";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
// 스크롤 영역을 직접 구현
const ScrollArea = ({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={`overflow-auto ${className || ''}`}
      {...props}
    >
      {children}
    </div>
  );
};
import { Checkbox } from "@/components/ui/checkbox";

// 임시 컴포넌트 정의 (오류 해결용)
const DeleteConfirmDialog = () => null;
const UseItemConfirmDialog = () => null;

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
  const [isOpen, setIsOpen] = useState<boolean>(true);
  
  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="border-t border-gray-200">
      <CollapsibleTrigger className="w-full">
        <div className="px-3 py-2 bg-blue-50 font-medium text-gray-700 flex items-center justify-between cursor-pointer hover:bg-blue-200 transition-colors">
          <div className="flex items-center">
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
          <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'transform rotate-180' : ''}`} />
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className={`p-3 ${
          debugInfo?.success === true
            ? 'bg-green-50'
            : debugInfo?.success === false
              ? 'bg-red-50'
              : 'bg-yellow-50'
        }`}>
          {/* 응답 시간 표시 - 본문 첫 부분 좌측 상단에 배치 */}
          {debugInfo && (
            <div className="mb-4 text-xs text-gray-700 flex items-center">
              <Clock className="w-3.5 h-3.5 mr-1 text-gray-600" />
              <span className="font-semibold">응답 시간:</span>
              <span className="ml-2">
                {debugInfo.timestamp 
                  ? new Date(debugInfo.timestamp as string).toLocaleString()
                  : debugInfo.responseTime
                    ? new Date(debugInfo.responseTime as string).toLocaleString()
                    : new Date().toLocaleString()}
              </span>
            </div>
          )}
          
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
      </CollapsibleContent>
    </Collapsible>
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
  const [isOpen, setIsOpen] = useState<boolean>(true);
  
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
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="border-b border-gray-200">
      <CollapsibleTrigger className="w-full">
        <div className="px-3 py-2 bg-blue-50 font-medium text-gray-700 flex items-center justify-between cursor-pointer hover:bg-blue-100 transition-colors">
          <div className="flex items-center flex-1 overflow-hidden">
            {debugInfo?.success === true ? (
              <CheckCircle2 className="w-5 h-5 mr-2 text-green-600 flex-shrink-0" />
            ) : debugInfo?.success === false ? (
              <X className="w-5 h-5 mr-2 text-red-600 flex-shrink-0" />
            ) : (
              <AlertTriangle className="w-5 h-5 mr-2 text-yellow-600 flex-shrink-0" />
            )}
            <strong className="flex-shrink-0">[요청]</strong>
            {method && (
              <span className={`ml-2 px-2 py-0.5 rounded text-xs font-medium flex-shrink-0 ${getMethodBgColor(method)}`}>
                {method.toUpperCase()}
              </span>
            )}
            {debugInfo?.success !== undefined && (
              debugInfo.success ? (
                <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-full flex items-center flex-shrink-0">
                  <CheckCircle2 className="w-3 h-3 mr-1" />성공
                </span>
              ) : (
                <span className="ml-2 px-2 py-0.5 bg-red-100 text-red-800 text-xs rounded-full flex items-center flex-shrink-0">
                  <X className="w-3 h-3 mr-1" />실패
                </span>
              )
            )}
            {url ? (
              <span className="ml-2 text-sm text-gray-600 truncate font-mono flex-1">
                {url}
              </span>
            ) : (
              <span className="ml-2 text-sm text-gray-500 italic">URL 정보 없음</span>
            )}
            {url && (
              <button
                onClick={(e) => {
                  e.stopPropagation(); // 아코디언 토글 방지
                  copyToClipboard(url || '', 'url');
                }}
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
          <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform flex-shrink-0 ml-2 ${isOpen ? 'transform rotate-180' : ''}`} />
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="p-3 bg-white border-t border-gray-200">
          {/* 요청 시간 표시 - 본문 첫 부분 좌측 상단에 배치 */}
          {(apiDebugInfo?.timestamp || requestInfo?.timestamp) && (
            <div className="mb-4 text-xs text-gray-700 flex items-center">
              <Clock className="w-3.5 h-3.5 mr-1 text-gray-600" />
              <span className="font-semibold">요청 시간:</span>
              <span className="ml-2">
                {apiDebugInfo?.timestamp 
                  ? new Date(apiDebugInfo.timestamp).toLocaleString() 
                  : requestInfo?.timestamp ? requestInfo.timestamp.toLocaleString() : ''}
              </span>
            </div>
          )}
          
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
      </CollapsibleContent>
    </Collapsible>
  );
};

// 복수 행 수정을 위한 모달 인터페이스
interface BulkUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedItems: TableData[];
  onUpdate: (updatedItems: TableData[]) => Promise<void>;
  isUpdating: boolean;
}

// 복수 행 수정을 위한 모달 컴포넌트
const BulkUpdateModal: React.FC<BulkUpdateModalProps> = ({
  isOpen,
  onClose,
  selectedItems,
  onUpdate,
  isUpdating
}) => {
  const [editableItems, setEditableItems] = useState<TableData[]>([]);
  const [activeTab, setActiveTab] = useState<string>("individual"); // "individual" 또는 "batch"
  const [batchValues, setBatchValues] = useState<Record<string, string | number>>({});
  const [fieldsToUpdate, setFieldsToUpdate] = useState<Record<string, boolean>>({});
  const [selectedItem, setSelectedItem] = useState<number>(0); // 선택된 아이템 인덱스

  useEffect(() => {
    if (selectedItems && selectedItems.length > 0) {
      setEditableItems([...selectedItems]);
      
      // 필드 업데이트 체크박스 초기화
      const fields: Record<string, boolean> = {};
      
      // 첫 번째 아이템의 모든 필드를 가져옴 (id 필드 제외)
      const firstItem = selectedItems[0];
      if (firstItem) {
        Object.keys(firstItem).forEach(key => {
          if (key !== 'id' && key !== 'excel_item_index') {
            fields[key] = false;
          }
        });
      }
      
      setFieldsToUpdate(fields);
    } else {
      // 선택된 항목이 없는 경우 빈 배열 설정
      setEditableItems([]);
      setFieldsToUpdate({});
    }
  }, [selectedItems]);

  // 개별 아이템 수정 핸들러
  const handleIndividualItemChange = (index: number, field: string, value: string | number) => {
    const updatedItems = [...editableItems];
    
    // count 필드는 숫자만 허용
    if (field === 'count') {
      // 입력된 값이 유효한 숫자인지 확인
      const numericValue = Number(value);
      
      // 숫자가 아니거나 음수인 경우
      if (isNaN(numericValue) || numericValue < 0) {
        toast({
          title: "유효하지 않은 값",
          description: "수량은 0 이상의 숫자여야 합니다.",
          variant: "destructive",
        });
        // 이전 값 유지 또는 기본값(0)으로 설정
        updatedItems[index] = { 
          ...updatedItems[index], 
          [field]: isNaN(numericValue) ? 0 : Math.max(0, numericValue) 
        };
      } else {
        // 유효한 숫자이면 적용
        updatedItems[index] = { ...updatedItems[index], [field]: numericValue };
      }
    } 
    // excel_item_index 필드는 읽기 전용으로 취급
    else if (field === 'excel_item_index') {
      toast({
        title: "읽기 전용 필드",
        description: "아이템 인덱스는 수정할 수 없습니다.",
        variant: "destructive",
      });
    }
    // 다른 모든 필드는 그대로 적용
    else {
      updatedItems[index] = { ...updatedItems[index], [field]: value };
    }
    
    setEditableItems(updatedItems);
  };

  // 일괄 수정 값 변경 핸들러
  const handleBatchValueChange = (field: string, value: string | number) => {
    // count 필드는 숫자만 허용
    if (field === 'count') {
      const numericValue = Number(value);
      
      // 숫자가 아니거나 음수인 경우
      if (isNaN(numericValue) || numericValue < 0) {
        toast({
          title: "유효하지 않은 값",
          description: "수량은 0 이상의 숫자여야 합니다.",
          variant: "destructive",
        });
        // 유효한 값을 설정 (0 또는 최소 0)
        setBatchValues({ 
          ...batchValues, 
          [field]: isNaN(numericValue) ? 0 : Math.max(0, numericValue) 
        });
      } else {
        // 유효한 숫자이면 적용
        setBatchValues({ ...batchValues, [field]: numericValue });
      }
    }
    // excel_item_index 필드는 일괄 수정 불가
    else if (field === 'excel_item_index') {
      toast({
        title: "수정 불가능한 필드",
        description: "아이템 인덱스는 일괄 수정할 수 없습니다.",
        variant: "destructive",
      });
    }
    // 다른 모든 필드는 그대로 적용
    else {
      setBatchValues({ ...batchValues, [field]: value });
    }
  };

  // 필드 업데이트 체크박스 변경 핸들러
  const handleFieldToggle = (field: string, checked: boolean | "indeterminate") => {
    setFieldsToUpdate({ ...fieldsToUpdate, [field]: checked === true });
  };

  // 일괄 수정 적용 핸들러
  const applyBatchUpdate = () => {
    const updatedItems = [...editableItems];
    
    // 선택된 필드만 일괄 업데이트
    Object.keys(fieldsToUpdate).forEach(field => {
      if (fieldsToUpdate[field] && batchValues[field] !== undefined) {
        // count 필드는 숫자로 변환 확인
        if (field === 'count') {
          const numericValue = Number(batchValues[field]);
          if (!isNaN(numericValue) && numericValue >= 0) {
            updatedItems.forEach((item, index) => {
              updatedItems[index] = { ...updatedItems[index], [field]: numericValue };
            });
          }
        }
        // excel_item_index 필드는 건너뜀
        else if (field !== 'excel_item_index') {
          updatedItems.forEach((item, index) => {
            updatedItems[index] = { ...updatedItems[index], [field]: batchValues[field] };
          });
        }
      }
    });
    
    setEditableItems(updatedItems);
    // 일괄 수정 후 개별 탭으로 전환
    setActiveTab("individual");
    toast({
      title: "일괄 수정 적용됨",
      description: "선택한 필드에 대한 일괄 수정이 적용되었습니다.",
    });
  };

  // 수정 내용 저장 핸들러
  const handleSave = async () => {
    try {
      await onUpdate(editableItems);
    } catch (error) {
      console.error('항목 업데이트 중 오류:', error);
    }
  };

  // 공통 필드 추출 (id와 excel_item_index 제외)
  const commonFields = editableItems.length > 0 && editableItems[0]
    ? Object.keys(editableItems[0]).filter(key => key !== 'id')
    : [];

  // count 필드가 항상 표시되도록 우선순위 부여
  const prioritizeFields = (fields: string[]): string[] => {
    // count 필드가 존재하는지 확인
    const hasCount = fields.includes('count');
    
    // count 필드가 있으면 맨 앞으로 가져오기
    if (hasCount) {
      return [
        'count', 
        ...fields.filter(field => field !== 'count' && field !== 'excel_item_index'),
        'excel_item_index'
      ];
    }
    
    // count 필드가 없으면 다른 필드들만 반환
    return [...fields.filter(field => field !== 'excel_item_index'), 'excel_item_index'];
  };

  // 안전하게 필드 접근이 가능한지 확인
  const orderedFields = editableItems.length > 0 && editableItems[0] 
    ? prioritizeFields(commonFields) 
    : [];

  // 필드 레이블 가져오기 (snake_case를 사람이 읽기 쉬운 형태로 변환)
  const getFieldLabel = (field: string) => {
    // 특별한 필드에 대해 더 명확한 레이블 제공
    if (field === 'count') {
      return '수량';
    }
    if (field === 'excel_item_index') {
      return '아이템 인덱스';
    }
    
    // snake_case를 공백으로 구분하고 각 단어의 첫 글자를 대문자로 변환
    return field
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[900px] max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center text-xl">
            <Edit className="mr-2 h-5 w-5 text-blue-500" />
            {selectedItems && selectedItems.length > 0 ? `${selectedItems.length}개 항목 일괄 수정` : '항목 일괄 수정'}
          </DialogTitle>
          <DialogDescription>
            선택한 항목들을 개별적으로 또는 일괄적으로 수정할 수 있습니다.
            변경 후 저장 버튼을 클릭하면 모든 변경사항이 적용됩니다.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="individual" className="flex-1">개별 수정</TabsTrigger>
            <TabsTrigger value="batch" className="flex-1">일괄 수정</TabsTrigger>
          </TabsList>
          
          <TabsContent value="individual" className="border rounded-md p-4 mt-4">
            {editableItems.length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                편집할 항목이 없습니다. 선택된 항목을 확인해주세요.
              </div>
            ) : (
              <>
                <div className="flex mb-3">
                  <div className="flex space-x-2 items-center">
                    <span className="text-sm font-medium">항목 선택:</span>
                    <select 
                      className="border rounded px-2 py-1 text-sm"
                      value={selectedItem}
                      onChange={(e) => setSelectedItem(Number(e.target.value))}
                    >
                      {editableItems.map((item, index) => {
                        // 항목이 유효한지 확인
                        if (!item) {
                          return (
                            <option key={index} value={index}>
                              항목 {index + 1} (유효하지 않음)
                            </option>
                          );
                        }
                        
                        // 항목 이름과 인덱스를 안전하게 접근
                        const itemName = item.name || item.item_name || `항목 ${index + 1}`;
                        const hasExcelItemIndex = typeof item.excel_item_index !== 'undefined' && item.excel_item_index !== null;
                        
                        return (
                          <option key={index} value={index}>
                            {itemName as string} {hasExcelItemIndex ? `(${item.excel_item_index})` : ''}
                          </option>
                        );
                      })}
                    </select>
                    <span className="text-xs text-gray-500">
                      {selectedItem + 1} / {editableItems.length}
                    </span>
                  </div>
                </div>
                
                <ScrollArea className="h-[350px] pr-4">
                  <div className="space-y-4">
                    {orderedFields.map((field) => {
                      // 항목이 존재하는지 확인하고 안전하게 접근
                      const currentItem = editableItems[selectedItem] || {};
                      const currentValue = currentItem[field];
                      return (
                        <div key={field} className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor={`item-${selectedItem}-${field}`} className="text-right col-span-1">
                            {getFieldLabel(field)}
                          </Label>
                          <Input
                            id={`item-${selectedItem}-${field}`}
                            value={currentValue !== null && currentValue !== undefined ? String(currentValue) : ''}
                            onChange={(e) => handleIndividualItemChange(
                              selectedItem,
                              field,
                              e.target.value
                            )}
                            className="col-span-3"
                          />
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              </>
            )}
          </TabsContent>
          
          <TabsContent value="batch" className="border rounded-md p-4 mt-4">
            <p className="text-sm text-blue-600 mb-4 bg-blue-50 p-2 rounded-md flex items-start">
              <Info className="w-4 h-4 mt-0.5 mr-2 flex-shrink-0" />
              여러 항목에 대해 동일한 값을 설정할 필드를 선택하고 값을 입력하세요.
              선택한 필드만 모든 항목에 일괄 적용됩니다.
            </p>
            
            <ScrollArea className="h-[350px] pr-4">
              <div className="space-y-4">
                {/* 항목이 없는 경우 메시지 표시 */}
                {orderedFields.length === 0 ? (
                  <div className="text-center py-4 text-gray-500">
                    편집할 수 있는 필드가 없습니다. 선택된 항목을 확인해주세요.
                  </div>
                ) : (
                  orderedFields.map((field) => (
                    <div key={field} className="grid grid-cols-[auto_1fr_3fr] items-center gap-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id={`check-${field}`}
                          checked={fieldsToUpdate[field] || false}
                          onCheckedChange={(checked) => handleFieldToggle(field, checked)}
                        />
                      </div>
                      <Label htmlFor={`check-${field}`} className="text-right font-medium">
                        {getFieldLabel(field)}
                      </Label>
                      <Input
                        value={batchValues[field] || ''}
                        onChange={(e) => handleBatchValueChange(field, e.target.value)}
                        placeholder={`모든 항목의 ${getFieldLabel(field)} 값`}
                        disabled={!fieldsToUpdate[field]}
                      />
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
            
            <div className="mt-4 flex justify-end">
              <Button 
                onClick={applyBatchUpdate} 
                className="bg-blue-500 hover:bg-blue-600 text-white"
              >
                <Check className="w-4 h-4 mr-2" />
                일괄 수정 적용
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="mt-6">
          <div className="flex justify-between w-full">
            <div className="text-sm text-gray-500">
              총 {editableItems.length}개 항목 수정 중
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose} disabled={isUpdating}>
                취소
              </Button>
              <Button 
                onClick={handleSave} 
                disabled={isUpdating || editableItems.length === 0} 
                className="bg-green-600 hover:bg-green-700"
              >
                {isUpdating ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    저장 중...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    저장
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export function TabContentRenderer({ content, className = '' }: TabContentRendererProps) {
  const [data, setData] = useState<TableData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<ApiResponse | null>(null);
  const [requestInfo, setRequestInfo] = useState<ApiRequestInfo | null>(null);
  const [apiDebugInfo, setApiDebugInfo] = useState<ApiDebugInfo | null>(null);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState<boolean>(false);
  const [deletingCurrencies, setDeletingCurrencies] = useState<TableData[] | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [showUseItemDialog, setShowUseItemDialog] = useState<boolean>(false);
  const [usingItem, setUsingItem] = useState<{ id: number; info: Record<string, unknown> } | null>(null);
  const [isUsingItem, setIsUsingItem] = useState<boolean>(false);
  const [showUpdateDialog, setShowUpdateDialog] = useState<boolean>(false);
  const [updatingItems, setUpdatingItems] = useState<TableData[] | null>(null);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [apiResponseStatus, setApiResponseStatus] = useState<'success' | 'error' | 'failure' | null>(null);
  const [apiStatusTimestamp, setApiStatusTimestamp] = useState<Date | null>(null);
  
  // 로컬 스토리지에서 디버그 섹션 표시 상태 불러오기
  const getDebugSectionState = (): boolean => {
    try {
      const savedState = localStorage.getItem('debugSectionVisible');
      // 저장된 값이 없으면 기본값으로 false 반환 (접힌 상태로 시작)
      return savedState !== null ? savedState === 'true' : false;
    } catch (e) {
      console.error('[TabContentRenderer] 로컬 스토리지 접근 중 오류:', e);
      return false; // 오류 발생 시 기본값으로 false 반환
    }
  };
  
  const [showDebugSection, setShowDebugSection] = useState<boolean>(getDebugSectionState());

  const updateApiResponseStatus = (status: 'success' | 'error' | 'failure' | null) => {
    setApiResponseStatus(status);
    if (status) {
      setApiStatusTimestamp(new Date());
    }
  };

  // debugInfo 상태가 변경될 때마다 API 응답 상태 업데이트
  useEffect(() => {
    if (debugInfo) {
      // debugInfo.success가 true면 'success', false면 'failure'
      // error 상태가 있으면 'error'로 설정
      if (error) {
        updateApiResponseStatus('error');
      } else if (debugInfo.success === true) {
        updateApiResponseStatus('success');
      } else if (debugInfo.success === false) {
        updateApiResponseStatus('failure');
      } else {
        // 상태가 명확하지 않은 경우 상태 제거
        updateApiResponseStatus(null);
      }
    } else if (error) {
      updateApiResponseStatus('error');
    } else {
      // debugInfo가 없는 경우 상태 제거
      updateApiResponseStatus(null);
    }
  }, [debugInfo, error]);

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
        setTimeout(() => setCopiedSection(null), 2000);
      })
      .catch(err => {
        console.error('[TabContentRenderer] 클립보드 복사 오류:', err);
        toast({
          title: "클립보드 복사 실패",
          description: "텍스트를 클립보드에 복사하는데 실패했습니다.",
          variant: "destructive",
        });
      });
  };

  // 디버그 섹션 토글 함수 - 로컬 스토리지에 상태 저장 기능 추가
  const toggleDebugSection = () => {
    setShowDebugSection(prev => {
      const newState = !prev;
      try {
        // 로컬 스토리지에 상태 저장
        localStorage.setItem('debugSectionVisible', newState.toString());
      } catch (e) {
        console.error('[TabContentRenderer] 로컬 스토리지 저장 중 오류:', e);
      }
      return newState;
    });
  };
  
  // toggle-debug-section 이벤트 리스너 설정
  useEffect(() => {
    const handleToggleDebugSection = () => {
      console.log('[TabContentRenderer] toggle-debug-section 이벤트 수신됨');
      toggleDebugSection();
    };
    
    // 커스텀 이벤트 리스너 등록
    window.addEventListener('toggle-debug-section', handleToggleDebugSection);
    
    // 컴포넌트 언마운트 시 이벤트 리스너 제거
    return () => {
      window.removeEventListener('toggle-debug-section', handleToggleDebugSection);
    };
  }, []);

  // 화폐 데이터 새로고침 이벤트 핸들러 등록
  useEffect(() => {
    // 화폐 데이터 새로고침 이벤트 리스너 등록
    const handleRefreshCurrencyData = () => {
      console.log('[TabContentRenderer] refresh-currency-data 이벤트 감지, 데이터 새로고침 시작');
      
      // 현재 탭이 화폐 탭인지 확인
      const contentProps = content.props || {};
      const endpoint = contentProps.endpoint as string | undefined;
      if (endpoint && endpoint.includes('/api/user/currency')) {
        // 새로고침 실행
        fetchData();
      }
    };

    // 이벤트 리스너 등록
    window.addEventListener('refresh-currency-data', handleRefreshCurrencyData);

    // 컴포넌트 언마운트 시 이벤트 리스너 제거
    return () => {
      window.removeEventListener('refresh-currency-data', handleRefreshCurrencyData);
    };
  }, [content.props]);

  // 데이터 테이블 타입일 경우 API 호출
  const fetchData = useCallback(async () => {
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
  }, [content.props, content.type]);

  // 초기 데이터 로드
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Currency 관련 핸들러 함수
  const handleCreateCurrency = () => {
    // 사용자 ID와 DB 이름 가져오기
    const employerInfo = sessionStorage.getItem('employerStorage');
    let employerUid = null;
    let dbName = null;
    
    if (employerInfo) {
      try {
        const parsedInfo = JSON.parse(employerInfo);
        employerUid = parsedInfo.uid;
        dbName = parsedInfo.db_name;
        
        console.log('[TabContentRenderer] 화폐 생성 시도:', {
          employerUid,
          dbName
        });
        
        // TODO: 화폐 생성 모달 또는 다이얼로그 표시
        alert('화폐 생성 기능을 시작합니다.\n사용자 ID: ' + employerUid + '\nDB: ' + dbName);
      } catch (error) {
        console.error('[TabContentRenderer] employerStorage 파싱 오류:', error);
      }
    } else {
      console.warn('[TabContentRenderer] 사용자 정보가 없습니다. 화폐를 생성할 수 없습니다.');
      alert('사용자 정보를 찾을 수 없습니다. 먼저 사용자를 선택해주세요.');
    }
  };
  
  const handleUpdateCurrency = async () => {
    // 선택된 화폐들이 있는지 확인
    const selectedCurrencies = sessionStorage.getItem('selectedCurrencies');
    
    if (!selectedCurrencies) {
      toast({
        title: "선택된 화폐 없음",
        description: "수정할 화폐를 먼저 선택해주세요. 테이블에서 행을 클릭하여 화폐를 선택하세요.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // 선택된 화폐 파싱
      const parsedCurrencies = JSON.parse(selectedCurrencies);
      
      if (!Array.isArray(parsedCurrencies) || parsedCurrencies.length === 0) {
        toast({
          title: "선택된 화폐 없음",
          description: "수정할 화폐를 먼저 선택해주세요.",
          variant: "destructive",
        });
        return;
      }
      
      // 수정할 아이템 설정
      setUpdatingItems(parsedCurrencies);
      setShowUpdateDialog(true);
      
    } catch (error) {
      console.error('화폐 업데이트 준비 중 오류:', error);
      toast({
        title: "오류",
        description: "선택된 화폐 정보를 처리하는 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };
  
  // 복수 항목 업데이트 실행 함수
  const handleConfirmUpdate = async (updatedItems: TableData[]) => {
    if (!updatedItems || updatedItems.length === 0) return;
    
    setIsUpdating(true);
    
    try {
      // 사용자 정보 가져오기
      const employerInfo = sessionStorage.getItem('employerStorage');
      if (!employerInfo) {
        setIsUpdating(false);
        toast({
          title: "오류",
          description: "사용자 정보를 찾을 수 없습니다. 사용자 목록 페이지에서 사용자를 선택해주세요.",
          variant: "destructive",
        });
        return;
      }
      
      // 사용자 정보 파싱
      const parsedEmployerInfo = JSON.parse(employerInfo);
      const employerUid = parsedEmployerInfo.uid;
      
      if (!employerUid) {
        setIsUpdating(false);
        toast({
          title: "오류",
          description: "사용자 UID가 누락되었습니다. 사용자 목록 페이지에서 사용자를 다시 선택해주세요.",
          variant: "destructive",
        });
        return;
      }
      
      // DB 이름 가져오기
      const dbName = parsedEmployerInfo.db_name || 'football_develop';
      
      // 로깅
      console.log('[TabContentRenderer] 화폐 업데이트 요청:', {
        employerUid,
        dbName,
        itemsCount: updatedItems.length
      });
      
      // 각 항목에 대해 PUT 요청 수행
      const updatePromises = updatedItems.map(async (item: TableData) => {
        const excelItemIndex = item.excel_item_index;
        
        if (!excelItemIndex) {
          return {
            success: false,
            message: `항목 ID ${item.id}: excel_item_index가 누락되었습니다.`,
            itemId: item.id
          };
        }
        
        // ID 필드를 제외한 업데이트 데이터 생성
        const { id, ...updateData } = item;
        
        // 사용자 UID가 비어 있지 않은지 다시 확인
        if (!employerUid) {
          return {
            success: false,
            message: `항목 ID ${id}: 사용자 UID가 누락되었습니다.`,
            itemId: id,
            excelItemIndex
          };
        }
        
        try {
          // API 서비스 요구사항에 맞게 페이로드 구성
          // excelItemIndex를 숫자로 변환
          const numericExcelItemIndex = Number(excelItemIndex);
          
          // 클라이언트에서 데이터 상태 확인 로깅
          console.log(`[TabContentRenderer] 업데이트할 항목 데이터 (ID ${id}):`, updateData);
          
          // count 필드는 필수이므로 기본값을 가져옴 (없으면 기본값 1 설정)
          const itemCount = typeof updateData.count !== 'undefined' ? Number(updateData.count) : 1;
          
          const apiPayload = {
            uid: employerUid,  // uid 파라미터명 사용 (API 요구사항)
            excelItemIndex: numericExcelItemIndex,
            count: itemCount,
            dbName: dbName
          };
          
          // 로깅을 추가하여 API 호출 파라미터 디버깅
          console.log(`[TabContentRenderer] API 호출 파라미터 (항목 ID ${id}):`, apiPayload);
          
          // 백엔드 API 요구사항에 맞게 호출 방식 변경 - 본문으로 모든 필요 데이터 전송
          const response = await fetch(`/api/user/currency`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(apiPayload)
          });
          
          if (!response.ok) {
            const errorText = await response.text();
            
            // 응답 오류 전체를 로깅
            console.error(`[TabContentRenderer] API 오류 응답 (항목 ID ${id}):`, errorText);
            
            try {
              // JSON 파싱 시도
              const errorJson = JSON.parse(errorText);
              console.log('[TabContentRenderer] 파싱된 오류 응답:', errorJson);
            } catch (parseError) {
              console.log('[TabContentRenderer] 오류 응답을 JSON으로 파싱할 수 없음:', parseError);
            }
            
            return {
              success: false,
              message: `항목 ID ${id}: API 응답 오류 (${response.status}) - ${errorText.substring(0, 100)}`,
              itemId: id,
              excelItemIndex,
              statusCode: response.status
            };
          }
          
          let result;
          try {
            result = await response.json();
          } catch (error) {
            return {
              success: false,
              message: `항목 ID ${id}: 응답 JSON 파싱 오류 - ${error instanceof Error ? error.message : '알 수 없는 오류'}`,
              itemId: id,
              excelItemIndex
            };
          }
          
          return {
            ...result,
            success: true,
            itemId: id,
            excelItemIndex
          };
        } catch (error) {
          console.error(`[TabContentRenderer] 항목 ID ${id} 업데이트 중 오류:`, error);
          return {
            success: false,
            message: `항목 ID ${id}: ${error instanceof Error ? error.message : '알 수 없는 오류'}`,
            itemId: id,
            excelItemIndex
          };
        }
      });
      
      // 모든 업데이트 요청 완료 대기
      const results = await Promise.all(updatePromises);
      
      // 결과 처리
      const successCount = results.filter((r: {success: boolean}) => r.success).length;
      const failCount = results.length - successCount;
      
      if (failCount > 0) {
        const failedDetails = results
          .filter((r: {success: boolean}) => !r.success)
          .map((r: {message: string}) => r.message).join('\n');
        
        console.error('[TabContentRenderer] 일부 항목 업데이트 실패:', failedDetails);
        
        toast({
          title: "일부 업데이트 실패",
          description: `${results.length}개 항목 중 ${successCount}개 업데이트됨, ${failCount}개 실패`,
          variant: "destructive",
        });
        
        // 상세 오류 정보 로깅
        const failedItems = results.filter((r: {success: boolean}) => !r.success);
        
        try {
          logger.error('[TabContentRenderer] 항목 업데이트 실패 세부 정보:', {
            failedCount: failCount,
            failedItems: failedItems.map((item: any) => ({
              itemId: item.itemId,
              excelItemIndex: item.excelItemIndex,
              message: item.message,
              statusCode: item.statusCode || 'N/A'
            })),
            timestamp: new Date().toISOString()
          });
        } catch (error) {
          console.warn('[TabContentRenderer] 로깅 실패:', error);
        }
      } else {
        console.log('[TabContentRenderer] 모든 항목 업데이트 성공:', {
          totalItems: results.length
        });
        
        toast({
          title: "업데이트 성공",
          description: `${results.length}개 항목이 성공적으로 업데이트되었습니다.`,
          variant: "default",
        });
      }
      
      // 데이터 다시 로드
      fetchData();
      
    } catch (error) {
      console.error('[TabContentRenderer] 화폐 업데이트 중 오류:', error);
      toast({
        title: "업데이트 실패",
        description: error instanceof Error ? error.message : "화폐 업데이트 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
      setShowUpdateDialog(false);
      setUpdatingItems(null);
    }
  };

  // 컨텐츠 타입에 따라 적절한 컴포넌트 렌더링
  switch (content.type) {
    case 'dataTable':
      // 데이터 테이블 표시 여부
      const contentProps = content.props || {};
      const endpoint = contentProps.endpoint as string | undefined;
      const isCurrencyTab = endpoint ? endpoint.includes('/api/user/currency') : false;

      return (
        <div className={`p-4 ${className}`}>
          {isLoading ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="h-5 w-32 bg-gray-200 rounded animate-pulse mb-2" />
              </div>
              <div className="rounded-md border p-2">
                <div className="h-60 bg-gray-100 animate-pulse flex items-center justify-center">
                  <RefreshCw className="h-8 w-8 text-gray-300 animate-spin" />
                </div>
              </div>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center p-8 bg-red-50 border border-red-200 rounded-md">
              <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
              <h3 className="text-xl font-semibold text-red-700 mb-2">데이터 로드 오류</h3>
              <p className="text-red-600 text-center mb-4">
                {typeof error === 'string' ? error : '데이터를 불러오는 중 오류가 발생했습니다.'}
              </p>
              <Button 
                variant="outline" 
                onClick={() => window.location.reload()}
                className="bg-white hover:bg-red-50"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                다시 시도
              </Button>
            </div>
          ) : (
            <>
              <DataTable
                tableName={(contentProps.tableName as string) || '테이블'}
                data={data}
                customFormatters={contentProps.formatters as Record<string, (value: string | number | null | object) => string | number | React.ReactNode> | undefined}
                onSelectionChange={isCurrencyTab ? handleCurrencyRowSelect : undefined}
                // Currency Tab일 경우 Control Panel을 표시하고 이벤트 핸들러를 연결
                showCurrencyControls={isCurrencyTab}
                onCreateCurrency={isCurrencyTab ? handleCreateCurrency : undefined}
                onUpdateCurrency={isCurrencyTab ? handleUpdateCurrency : undefined}
                onDeleteCurrency={undefined}
                // Advanced Currency Controls
                showAdvancedCurrencyControls={isCurrencyTab}
                onUseItem={undefined}
                onGetItem={undefined}
                onSendItem={undefined}
              />
              {showDebugSection && (
                <div className="mt-4 border rounded-md overflow-hidden">
                  {/* ... existing debug section code ... */}
                </div>
              )}
            </>
          )}
          
          {/* 삭제 확인 다이얼로그 - 구현 필요 */}
          {/* <DeleteConfirmDialog /> */}
          
          {/* 아이템 사용 확인 다이얼로그 - 구현 필요 */}
          {/* <UseItemConfirmDialog /> */}
          
          {/* 복수 항목 업데이트 모달 */}
          {updatingItems && (
            <BulkUpdateModal
              isOpen={showUpdateDialog}
              onClose={() => {
                setShowUpdateDialog(false);
                setUpdatingItems(null);
              }}
              selectedItems={updatingItems}
              onUpdate={handleConfirmUpdate}
              isUpdating={isUpdating}
            />
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

  // 오류 상태 렌더링 함수
  const renderErrorState = () => {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-red-50 border border-red-200 rounded-md">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h3 className="text-xl font-semibold text-red-700 mb-2">데이터 로드 오류</h3>
        <p className="text-red-600 text-center mb-4">
          {typeof error === 'string' ? error : '데이터를 불러오는 중 오류가 발생했습니다.'}
        </p>
        <Button 
          variant="outline" 
          onClick={() => window.location.reload()}
          className="bg-white hover:bg-red-50"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          다시 시도
        </Button>
      </div>
    );
  };

  // 미구현 핸들러 함수들 - 향후 필요시 구현
  const handleCurrencyRowSelect = (selectedRows: TableData[]) => {
    console.log('선택된 화폐 행:', selectedRows);
    // 선택된 행 데이터를 세션 스토리지에 저장
    try {
      sessionStorage.setItem('selectedCurrencies', JSON.stringify(selectedRows));
    } catch (error) {
      console.error('선택된 화폐 저장 중 오류:', error);
    }
  };
  
  const handleDeleteCurrency = () => {
    toast({
      title: "미구현 기능",
      description: "화폐 삭제 기능은 아직 구현되지 않았습니다.",
      variant: "warning",
    });
  };
  
  const handleUseItem = () => {
    toast({
      title: "미구현 기능",
      description: "아이템 사용 기능은 아직 구현되지 않았습니다.",
      variant: "warning",
    });
  };
  
  const handleGetItem = () => {
    toast({
      title: "미구현 기능",
      description: "아이템 획득 기능은 아직 구현되지 않았습니다.",
      variant: "warning",
    });
  };
  
  const handleSendItem = () => {
    toast({
      title: "미구현 기능",
      description: "아이템 전송 기능은 아직 구현되지 않았습니다.",
      variant: "warning",
    });
  };
  
  // useEffect로 초기 데이터 로드
}