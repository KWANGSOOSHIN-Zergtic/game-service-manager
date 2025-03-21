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
  Save,
  Trash2
} from 'lucide-react';
import { JsonViewerCustom, JsonTheme } from '@/components/ui/json-viewer-custom';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { toast } from "@/hooks/use-toast";
import { logger } from "@/lib/logger";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { CreateCurrencyModal } from "../control-panels/create-currency-modal";
import { CreateBallerModal } from "../control-panels/create-baller-modal";

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
          </div>
          <div className="flex items-center">
            {url && (
              <div
                onClick={(e) => {
                  e.stopPropagation(); // 아코디언 토글 방지
                  copyToClipboard(url || '', 'url');
                }}
                className="flex items-center text-gray-500 hover:text-blue-600 transition-colors px-2 py-1 rounded hover:bg-gray-100 ml-2 cursor-pointer"
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
              </div>
            )}
            <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform flex-shrink-0 ml-2 ${isOpen ? 'transform rotate-180' : ''}`} />
          </div>
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
const BulkUpdateModal = ({
  isOpen,
  onClose,
  selectedItems,
  onUpdate,
  isUpdating
}: BulkUpdateModalProps): React.ReactElement => {
  const [editableItems, setEditableItems] = useState<TableData[]>([]);
  const [selectedRows, setSelectedRows] = useState<Record<number, boolean>>({});
  const [isAllSelected, setIsAllSelected] = useState(false);

  useEffect(() => {
    if (selectedItems.length > 0) {
      setEditableItems([...selectedItems]);
      
      // 초기에 모든 행 선택
      const initialSelectedRows: Record<number, boolean> = {};
      selectedItems.forEach((_, index) => {
        initialSelectedRows[index] = true;
      });
      setSelectedRows(initialSelectedRows);
      setIsAllSelected(true);
    }
  }, [selectedItems]);

  // 개별 아이템 수정 핸들러
  const handleItemChange = (index: number, field: string, value: string | number) => {
    const updatedItems = [...editableItems];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    setEditableItems(updatedItems);
  };

  // 체크박스 선택 핸들러
  const handleRowSelect = (index: number, checked: boolean) => {
    setSelectedRows(prev => ({
      ...prev,
      [index]: checked
    }));
    
    // 모든 행이 선택되었는지 확인
    const updatedSelectedRows = {...selectedRows, [index]: checked};
    const allSelected = Object.values(updatedSelectedRows).every(value => value === true);
    setIsAllSelected(allSelected && Object.keys(updatedSelectedRows).length === editableItems.length);
  };

  // 전체 선택/해제 핸들러
  const handleSelectAll = (checked: boolean) => {
    const updatedSelectedRows: Record<number, boolean> = {};
    editableItems.forEach((_, index) => {
      updatedSelectedRows[index] = checked;
    });
    setSelectedRows(updatedSelectedRows);
    setIsAllSelected(checked);
  };

  // 수정 내용 저장 핸들러
  const handleSave = async () => {
    try {
      // 선택된 행만 업데이트하고, 필요한 필드(id, employer_uid, excel_item_index, count)만 포함
      const itemsToUpdate = editableItems
        .filter((_, index) => selectedRows[index])
        .map(item => {
          // 쿼리에 필요한 필드만 포함 (UPDATE_USER_CURRENCY 쿼리 파라미터에 맞춤)
          return {
            id: item.id,
            employer_uid: item.employer_uid,
            excel_item_index: item.excel_item_index,
            count: item.count
          };
        });
      
      await onUpdate(itemsToUpdate);
    } catch (error) {
      console.error('항목 업데이트 중 오류:', error);
    }
  };

  // 공통 필드 추출 (id와 excel_item_index 제외)
  const commonFields = editableItems.length > 0
    ? Object.keys(editableItems[0]).filter(key => key !== 'id' && key !== 'excel_item_index')
    : [];

  // 필드 레이블 가져오기 (snake_case를 사람이 읽기 쉬운 형태로 변환)
  const getFieldLabel = (field: string) => {
    // snake_case를 공백으로 구분하고 각 단어의 첫 글자를 대문자로 변환
    return field
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[900px] max-h-[85vh] flex flex-col p-0 overflow-hidden border-none rounded-lg shadow-2xl">
        {/* 모달 헤더 - 현대적인 디자인 */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
          <DialogTitle className="flex items-center text-2xl font-light tracking-wide mb-2">
            <Edit className="mr-3 h-6 w-6 text-indigo-200" />
            항목 일괄 수정
          </DialogTitle>
          <DialogDescription className="text-indigo-100 opacity-90 text-sm">
            데이터베이스 쿼리(UPDATE_USER_CURRENCY)에 따라 <span className="bg-indigo-500 px-2 py-0.5 rounded text-white font-medium">Count 필드만</span> 수정 가능합니다.
            선택된 항목만 저장됩니다.
          </DialogDescription>
        </div>

        {/* 모달 내용 */}
        <div className="flex-1 overflow-hidden p-6 bg-gray-50">
          {/* 전체 선택/해제 영역 */}
          <div className="flex justify-between mb-4 items-center">
            <div className="flex items-center">
              <Checkbox 
                id="select-all" 
                checked={isAllSelected}
                onCheckedChange={(checked) => handleSelectAll(checked === true)}
                className="h-4 w-4 rounded-sm border-indigo-300 data-[state=checked]:bg-indigo-600"
              />
              <Label htmlFor="select-all" className="ml-2 text-sm font-medium text-gray-700">전체 선택/해제</Label>
            </div>
            
            <div className="text-sm text-gray-500 bg-white px-3 py-1 rounded-full shadow-sm border border-gray-100">
              총 {editableItems.length}개 중 {Object.values(selectedRows).filter(value => value).length}개 선택됨
            </div>
          </div>

          {/* 테이블 영역 */}
          <div className="border rounded-lg overflow-hidden shadow-sm bg-white">
            <div className="overflow-auto max-h-[50vh]">
              <Table>
                <TableHeader className="sticky top-0 bg-gray-50 z-10">
                  <TableRow className="border-b border-gray-200">
                    <TableHead className="w-12 p-3 text-center">선택</TableHead>
                    <TableHead className="w-16 p-3 text-right text-xs uppercase tracking-wider text-gray-600 font-semibold">순번</TableHead>
                    <TableHead className="w-32 p-3 text-right text-xs uppercase tracking-wider text-gray-600 font-semibold">아이템 인덱스</TableHead>
                    {commonFields.map((field) => (
                      <TableHead key={field} className="min-w-[120px] p-3 text-right text-xs uppercase tracking-wider text-gray-600 font-semibold">
                        {getFieldLabel(field)}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {editableItems.map((item, index) => (
                    <TableRow 
                      key={index} 
                      className={`
                        border-b border-gray-100 hover:bg-gray-50 transition-colors
                        ${selectedRows[index] ? "bg-indigo-50/40" : ""}
                      `}
                    >
                      <TableCell className="text-center p-3">
                        <Checkbox 
                          checked={selectedRows[index] || false}
                          onCheckedChange={(checked) => handleRowSelect(index, checked === true)}
                          className="h-4 w-4 rounded-sm border-indigo-300 data-[state=checked]:bg-indigo-600"
                        />
                      </TableCell>
                      <TableCell className="text-right p-3 font-medium text-gray-700">{index + 1}</TableCell>
                      <TableCell className="text-right p-3 text-gray-700">
                        {item.excel_item_index !== undefined ? String(item.excel_item_index) : '-'}
                      </TableCell>
                      {commonFields.map((field) => (
                        <TableCell key={field} className="p-2">
                          {field === 'count' ? (
                            <div className={`relative ${selectedRows[index] ? 'animate-pulse-once' : ''}`}>
                              {selectedRows[index] && field === 'count' && (
                                <div className="absolute inset-y-0 -left-1 w-1 bg-indigo-500 rounded-full"></div>
                              )}
                              <Input
                                value={item[field] !== null && item[field] !== undefined ? String(item[field]) : ''}
                                onChange={field === 'count' ? (e) => handleItemChange(index, field, e.target.value) : undefined}
                                className={`
                                  border text-right py-1.5 rounded 
                                  ${field === 'count' 
                                    ? selectedRows[index] 
                                      ? "bg-white border-indigo-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all shadow-sm"
                                      : "bg-white border-gray-200" 
                                    : "bg-gray-50 border-gray-100 text-gray-600"
                                  }
                                `}
                                disabled={field !== 'count' || !selectedRows[index]}
                              />
                            </div>
                          ) : (
                            <div className="bg-gray-50 border border-gray-100 rounded py-1.5 px-3 text-right text-gray-600">
                              {item[field] !== null && item[field] !== undefined ? String(item[field]) : '-'}
                            </div>
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>

        {/* 모달 푸터 */}
        <div className="p-4 bg-white border-t border-gray-100 flex justify-end gap-2 items-center">
          <Button 
            variant="outline" 
            onClick={onClose} 
            disabled={isUpdating}
            className="border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors"
          >
            취소
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={isUpdating || Object.values(selectedRows).filter(value => value).length === 0} 
            className={`
              py-2 px-4 flex items-center gap-2 transition-all rounded-md
              ${isUpdating 
                ? "bg-indigo-400" 
                : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-md hover:shadow"
              }
            `}
          >
            {isUpdating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>저장 중...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>저장</span>
              </>
            )}
          </Button>
        </div>
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
  const [showWarningDialog, setShowWarningDialog] = useState(false);
  const [warningMessage, setWarningMessage] = useState('');
  const [warningTitle, setWarningTitle] = useState('');
  const [showCreateCurrencyModal, setShowCreateCurrencyModal] = useState<boolean>(false);
  const [isCreatingCurrency, setIsCreatingCurrency] = useState<boolean>(false);
  const [showCreateBallerModal, setShowCreateBallerModal] = useState<boolean>(false);
  const [isCreatingBaller, setIsCreatingBaller] = useState<boolean>(false);
  
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

  // API 응답 상태를 세션 스토리지에 저장하는 함수
  const updateApiResponseStatus = (status: 'success' | 'error' | 'failure' | null) => {
    try {
      if (status) {
        sessionStorage.setItem('apiResponseStatus', status);
      } else {
        sessionStorage.removeItem('apiResponseStatus');
      }
    } catch (e) {
      console.error('[TabContentRenderer] API 응답 상태 저장 중 오류:', e);
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
    setShowDebugSection(prevState => {
      const newState = !prevState;
      
      // 로컬 스토리지에 상태 저장
      try {
        localStorage.setItem('debugSectionVisible', String(newState));
      } catch (e) {
        console.error('[TabContentRenderer] 로컬 스토리지 저장 중 오류:', e);
      }
      
      return newState;
    });
  };
  
  // 데이터 가져오기 함수 개선
  const fetchData = useCallback(async () => {
    if (content.type !== 'dataTable' || (!content.props?.endpoint && !content.props?.data)) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // 데이터 가져오기 로직
      console.log('[TabContentRenderer] 데이터 가져오기 시작:', {
        endpoint: content.props?.endpoint,
        hasData: !!content.props?.data
      });

      let result: ApiResponse;

      if (content.props.data) {
        // 직접 데이터가 제공된 경우
        result = {
          success: true,
          data: content.props.data as Record<string, unknown>[]
        };
      } else {
        try {
          // employer_uid 가져오기
          const employerInfo = sessionStorage.getItem('employerStorage');
          if (!employerInfo) {
            throw new Error('사용자 정보를 찾을 수 없습니다. 사용자 목록 페이지에서 사용자를 선택해주세요.');
          }
          
          const parsedEmployerInfo = JSON.parse(employerInfo);
          const employerUid = parsedEmployerInfo.uid;
          
          // DB이름 가져오기
          let dbName = '';
          if (parsedEmployerInfo.db_name) {
            dbName = parsedEmployerInfo.db_name;
          } else {
            // 이전 방식으로 DB 이름 가져오기
            const storedInfo = sessionStorage.getItem('popupUserInfo');
            if (storedInfo) {
              const parsedInfo = JSON.parse(storedInfo);
              dbName = parsedInfo.dbName;
            } else {
              dbName = sessionStorage.getItem('lastUsedDbName') || 'shipping_dev_db';
            }
          }
          
          if (!employerUid || !dbName) {
            throw new Error('사용자 UID 또는 데이터베이스 정보가 누락되었습니다.');
          }
          
          // API 엔드포인트
          const endpoint = content.props.endpoint as string;
          
          // 쿼리 파라미터 구성
          const params = new URLSearchParams();
          params.append('employerUid', String(employerUid));
          params.append('dbName', dbName);
          
          const url = `${endpoint}?${params.toString()}`;
          console.log('[TabContentRenderer] API 요청 URL:', url);
          
          // API 요청 정보 저장
          setRequestInfo({
            url,
            params: { employerUid, dbName },
            method: 'GET',
            timestamp: new Date()
          });
          
          // API 요청
          const response = await fetch(url);
          result = await response.json();
          
          // 디버그 정보 저장
          setDebugInfo(result);
          
          // API 호출 결과 상태 업데이트
          if (result.success) {
            updateApiResponseStatus('success');
          } else {
            updateApiResponseStatus('error');
          }
        } catch (error) {
          console.error('[TabContentRenderer] API 호출 중 오류:', error);
          result = {
            success: false,
            error: error instanceof Error ? error.message : 'API 오류가 발생했습니다.'
          };
          updateApiResponseStatus('failure');
        }
      }

      // 응답 처리
      let newData: TableData[] = [];
      
      if (result.success) {
        try {
          // 데이터 형식 확인
          if (result.currencies) {
            // Currency 데이터 형식
            newData = result.currencies.map((item, index) => ({
              ...item,
              id: item.id || `item-${index}`,
              displayIndex: index + 1
            })) as TableData[];
          } else if (result.data) {
            // 일반 데이터 형식
            newData = result.data.map((item, index) => ({
              ...item,
              id: item.id || `item-${index}`,
              displayIndex: index + 1
            })) as TableData[];
          } else if (result.ballers) {
            // Baller 데이터 형식
            newData = (result.ballers as unknown[]).map((item, index) => ({
              ...(item as Record<string, unknown>),
              id: (item as Record<string, unknown>).id || `item-${index}`,
              displayIndex: index + 1
            })) as TableData[];
          } else {
            // 기타 데이터 형식 (필요에 따라 확장)
            console.warn('[TabContentRenderer] 알 수 없는 데이터 형식:', result);
          }
          
          // 테이블 데이터 세션 스토리지에 저장
          sessionStorage.setItem('tableData', JSON.stringify(newData));
          console.log('[TabContentRenderer] 테이블 데이터 세션 스토리지에 저장 완료:', newData.length, '개 항목');
          
          // 데이터 로드 시 선택 데이터 초기화
          sessionStorage.removeItem('selectedCurrency');
          sessionStorage.removeItem('selectedCurrencies');
          console.log('[TabContentRenderer] 데이터 로드 시 선택 데이터 초기화');
        } catch (error) {
          console.error('[TabContentRenderer] 데이터 처리 중 오류:', error);
          setError('데이터 처리 중 오류가 발생했습니다.');
        }
      } else {
        // 오류 메시지 설정
        setError(result.error || result.message || '데이터를 가져오는 중 오류가 발생했습니다.');
        
        // 데이터 초기화
        newData = [];
        
        // 에러 시에도 세션 스토리지 내용 초기화
        sessionStorage.removeItem('tableData');
        sessionStorage.removeItem('selectedCurrency');
        sessionStorage.removeItem('selectedCurrencies');
      }
      
      setData(newData);
    } catch (error) {
      console.error('[TabContentRenderer] 데이터 요청 중 오류 발생:', error);
      setError('데이터를 가져오는 중 오류가 발생했습니다.');
      setData([]);
    } finally {
      setIsLoading(false);
    }
  }, [content.type, content.props, content.props?.endpoint]);

  // 새로운 useEffect 추가 - 체크박스 선택 및 세션 스토리지 동기화 처리
  useEffect(() => {
    // row-selection-changed 이벤트 리스너 등록
    const handleRowSelectionChanged = (event: Event) => {
      const customEvent = event as CustomEvent;
      console.log('[TabContentRenderer] row-selection-changed 이벤트 감지:', 
        customEvent.detail?.count || 0, '개 항목 선택됨');
      
      // 이 시점에 selectedCurrency와 selectedCurrencies는 이미 업데이트되어 있음
    };
    
    window.addEventListener('row-selection-changed', handleRowSelectionChanged);
    
    return () => {
      window.removeEventListener('row-selection-changed', handleRowSelectionChanged);
    };
  }, []);

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
      
      // 현재 탭이 화폐 탭 또는 Baller 탭인지 확인
      const contentProps = content.props || {};
      const endpoint = contentProps.endpoint as string | undefined;
      if (endpoint && (endpoint.includes('/api/users/currency') || endpoint.includes('/api/users/multi-play/baller'))) {
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
  }, [content.props, fetchData]);

  // 일반 새로고침 이벤트 핸들러 등록 (모든 데이터 테이블에 적용)
  useEffect(() => {
    // 새로고침 이벤트 리스너 등록
    const handleRefreshData = () => {
      console.log('[TabContentRenderer] refresh-data 이벤트 감지, 데이터 새로고침 시작');
      
      // 데이터 테이블 타입인 경우만 새로고침 실행
      if (content.type === 'dataTable' && content.props?.endpoint) {
        console.log('[TabContentRenderer] 데이터 테이블 새로고침 실행');
        fetchData();
      }
    };

    // 이벤트 리스너 등록
    window.addEventListener('refresh-data', handleRefreshData);

    // 컴포넌트 언마운트 시 이벤트 리스너 제거
    return () => {
      window.removeEventListener('refresh-data', handleRefreshData);
    };
  }, [content.type, content.props, fetchData]);

  // 초기 데이터 로드 및 content.props.endpoint 변경 감지
  useEffect(() => {
    console.log('[TabContentRenderer] 데이터 로드 useEffect 실행:', {
      contentType: content.type,
      endpoint: content.props?.endpoint,
      hasData: !!content.props?.data
    });
    
    if (content.type === 'dataTable' && (content.props?.endpoint || content.props?.data)) {
      fetchData();
    }
  }, [fetchData, content.type, content.props?.endpoint, content.props?.data]);

  // Currency 관련 핸들러 함수
  const handleCreateCurrency = () => {
    console.log("handleCreateCurrency");
    
    // 사용자 정보 확인 - employerStorage에서 정보 가져오기
    const employerInfo = sessionStorage.getItem('employerStorage');
    if (!employerInfo) {
      console.warn("사용자 정보가 없습니다.");
      setWarningTitle('사용자 정보 없음');
      setWarningMessage('사용자 정보가 없습니다. 로그인 후 다시 시도해주세요.');
      setShowWarningDialog(true);
      return;
    }

    try {
      const parsedEmployerInfo = JSON.parse(employerInfo);
      const employerUid = parsedEmployerInfo.uid;
      const dbName = parsedEmployerInfo.db_name;
      
      console.log(`화폐 생성 시도: 사용자 ID ${employerUid}, DB: ${dbName}`);
      
      // CreateCurrencyModal 표시
      setShowCreateCurrencyModal(true);
    } catch (error) {
      console.error("데이터 파싱 오류:", error);
      setWarningTitle("오류 발생");
      setWarningMessage("데이터 처리 중 오류가 발생했습니다. 다시 시도해주세요.");
      setShowWarningDialog(true);
    }
  };

  // Baller 관련 핸들러 함수
  const handleCreateBaller = () => {
    console.log("handleCreateBaller");
    
    // 사용자 정보 확인 - employerStorage에서 정보 가져오기
    const employerInfo = sessionStorage.getItem('employerStorage');
    if (!employerInfo) {
      console.warn("사용자 정보가 없습니다.");
      setWarningTitle('사용자 정보 없음');
      setWarningMessage('사용자 정보가 없습니다. 로그인 후 다시 시도해주세요.');
      setShowWarningDialog(true);
      return;
    }

    try {
      const parsedEmployerInfo = JSON.parse(employerInfo);
      const employerUid = parsedEmployerInfo.uid;
      const dbName = parsedEmployerInfo.db_name;
      
      console.log(`Baller 생성 시도: 사용자 ID ${employerUid}, DB: ${dbName}`);
      
      // CreateBallerModal 표시
      setShowCreateBallerModal(true);
    } catch (error) {
      console.error("데이터 파싱 오류:", error);
      setWarningTitle("오류 발생");
      setWarningMessage("데이터 처리 중 오류가 발생했습니다. 다시 시도해주세요.");
      setShowWarningDialog(true);
    }
  };

  const handleUpdateBaller = () => {
    console.log("handleUpdateBaller");
    
    // 체크박스로 선택된 행 수 확인
    const tableCheckboxes = document.querySelectorAll('table input[type="checkbox"]:checked');
    console.log("[TabContentRenderer] 체크된 체크박스 수:", tableCheckboxes.length);
    
    // 세션 스토리지에서 선택된 항목 정보 가져오기
    const selectedCurrenciesStr = sessionStorage.getItem('selectedCurrencies');
    const selectedCurrencyStr = sessionStorage.getItem('selectedCurrency');
    
    console.log("[TabContentRenderer] 세션 스토리지 데이터 확인:", {
      selectedCurrency: selectedCurrencyStr ? "있음" : "없음",
      selectedCurrencies: selectedCurrenciesStr ? "있음" : "없음"
    });
    
    try {
      // 단일 항목 또는 다중 항목 처리
      let updateItems: TableData[] = [];
      
      if (selectedCurrenciesStr) {
        // 다중 선택된 항목 처리
        updateItems = JSON.parse(selectedCurrenciesStr);
      } else if (selectedCurrencyStr) {
        // 단일 선택된 항목 처리
        updateItems = [JSON.parse(selectedCurrencyStr)];
      } else if (tableCheckboxes.length > 0 && !selectedCurrenciesStr && !selectedCurrencyStr) {
        // 체크박스는 선택되었지만 세션 스토리지에 데이터가 없는 경우
        // 테이블 데이터에서 직접 선택된 항목 찾기
        const tableDataStr = sessionStorage.getItem('tableData');
        if (tableDataStr) {
          const tableData = JSON.parse(tableDataStr);
          const checkedIds = Array.from(tableCheckboxes).map(checkbox => {
            const row = (checkbox as HTMLElement).closest('tr');
            return row?.getAttribute('data-row-id');
          }).filter(Boolean);
          
          if (checkedIds.length > 0) {
            const items = tableData.filter((item: Record<string, unknown>) => 
              checkedIds.includes(String(item.id)));
            
            if (items.length > 0) {
              updateItems = items;
              console.log("[TabContentRenderer] 테이블 데이터에서 직접 찾은 선택 항목:", items.length);
              
              // 세션 스토리지에 저장
              sessionStorage.setItem('selectedCurrencies', JSON.stringify(items));
              sessionStorage.setItem('selectedCurrency', JSON.stringify(items[0]));
            }
          }
        }
      }
      
      // 업데이트 모달 표시 준비
      if (updateItems.length > 0) {
        setUpdatingItems(updateItems);
        setShowUpdateDialog(true);
      } else {
        // 체크박스 선택 없음 경고
        if (tableCheckboxes.length === 0) {
          console.warn("[TabContentRenderer] 선택된 Baller가 없습니다.");
          setWarningTitle('선택된 Baller 없음');
          setWarningMessage('Baller를 업데이트하려면 먼저 테이블에서 행을 선택해주세요.');
        } else {
          console.warn("[TabContentRenderer] 유효한 Baller 데이터가 없습니다.");
          setWarningTitle('유효하지 않은 데이터');
          setWarningMessage('선택된 Baller 데이터를 찾을 수 없습니다. 다시 선택해주세요.');
        }
        setShowWarningDialog(true);
      }
    } catch (error) {
      console.error("[TabContentRenderer] 선택된 Baller 처리 중 오류:", error);
      setWarningTitle("오류 발생");
      setWarningMessage("데이터 처리 중 오류가 발생했습니다. 다시 시도해주세요.");
      setShowWarningDialog(true);
    }
  };
  
  const handleDeleteBaller = () => {
    console.log("handleDeleteBaller");
    
    // 체크박스로 선택된 행 수 확인
    const tableCheckboxes = document.querySelectorAll('table input[type="checkbox"]:checked');
    console.log("[TabContentRenderer] 체크된 체크박스 수:", tableCheckboxes.length);
    
    // 세션 스토리지에서 선택된 항목 정보 가져오기
    const selectedCurrenciesStr = sessionStorage.getItem('selectedCurrencies');
    const selectedCurrencyStr = sessionStorage.getItem('selectedCurrency');
    
    console.log("[TabContentRenderer] 세션 스토리지 데이터 확인:", {
      selectedCurrency: selectedCurrencyStr ? "있음" : "없음",
      selectedCurrencies: selectedCurrenciesStr ? "있음" : "없음"
    });
    
    try {
      // 단일 항목 또는 다중 항목 처리
      let deleteItems: TableData[] = [];
      
      if (selectedCurrenciesStr) {
        // 다중 선택된 항목 처리
        deleteItems = JSON.parse(selectedCurrenciesStr);
      } else if (selectedCurrencyStr) {
        // 단일 선택된 항목 처리
        deleteItems = [JSON.parse(selectedCurrencyStr)];
      } else if (tableCheckboxes.length > 0 && !selectedCurrenciesStr && !selectedCurrencyStr) {
        // 체크박스는 선택되었지만 세션 스토리지에 데이터가 없는 경우
        // 테이블 데이터에서 직접 선택된 항목 찾기
        const tableDataStr = sessionStorage.getItem('tableData');
        if (tableDataStr) {
          const tableData = JSON.parse(tableDataStr);
          const checkedIds = Array.from(tableCheckboxes).map(checkbox => {
            const row = (checkbox as HTMLElement).closest('tr');
            return row?.getAttribute('data-row-id');
          }).filter(Boolean);
          
          if (checkedIds.length > 0) {
            const items = tableData.filter((item: Record<string, unknown>) => 
              checkedIds.includes(String(item.id)));
            
            if (items.length > 0) {
              deleteItems = items;
              console.log("[TabContentRenderer] 테이블 데이터에서 직접 찾은 선택 항목:", items.length);
              
              // 세션 스토리지에 저장
              sessionStorage.setItem('selectedCurrencies', JSON.stringify(items));
              sessionStorage.setItem('selectedCurrency', JSON.stringify(items[0]));
            }
          }
        }
      }
      
      // 삭제 다이얼로그 표시 준비
      if (deleteItems.length > 0) {
        setDeletingCurrencies(deleteItems);
        setShowDeleteDialog(true);
      } else {
        // 체크박스 선택 없음 경고
        if (tableCheckboxes.length === 0) {
          console.warn("[TabContentRenderer] 선택된 Baller가 없습니다.");
          setWarningTitle('선택된 Baller 없음');
          setWarningMessage('Baller를 삭제하려면 먼저 테이블에서 행을 선택해주세요.');
        } else {
          console.warn("[TabContentRenderer] 유효한 Baller 데이터가 없습니다.");
          setWarningTitle('유효하지 않은 데이터');
          setWarningMessage('선택된 Baller 데이터를 찾을 수 없습니다. 다시 선택해주세요.');
        }
        setShowWarningDialog(true);
      }
    } catch (error) {
      console.error("[TabContentRenderer] 선택된 Baller 처리 중 오류:", error);
      setWarningTitle("오류 발생");
      setWarningMessage("데이터 처리 중 오류가 발생했습니다. 다시 시도해주세요.");
      setShowWarningDialog(true);
    }
  };
  
  // 화폐 생성 확인 핸들러 수정
  const handleConfirmCreateCurrency = (newCurrency: { excelItemIndex: number; count: number }) => {
    try {
      setIsCreatingCurrency(true);
      
      // employerStorage에서 사용자 정보 가져오기
      const employerInfo = sessionStorage.getItem('employerStorage');
      if (!employerInfo) {
        throw new Error("사용자 정보가 없습니다.");
      }
      
      const parsedEmployerInfo = JSON.parse(employerInfo);
      const employerUid = parsedEmployerInfo.uid;
      const dbName = parsedEmployerInfo.db_name;
      
      // API 호출
      fetch("/api/users/currency", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          employerUid,
          dbName,
          excelItemIndex: newCurrency.excelItemIndex,
          count: newCurrency.count,
        }),
      })
      .then(response => {
        if (!response.ok) {
          return response.json().then(errorData => {
            throw new Error(errorData.message || "화폐 생성 중 오류가 발생했습니다.");
          });
        }
        return response.json();
      })
      .then(() => {
        // 성공 처리
        console.log("화폐가 성공적으로 생성되었습니다.");
        
        // 데이터 새로고침
        if (typeof fetchData === 'function') {
          fetchData();
        }
        
        // 모달 닫기
        setShowCreateCurrencyModal(false);
      })
      .catch(error => {
        console.error("화폐 생성 오류:", error);
        setWarningTitle("화폐 생성 실패");
        setWarningMessage(error instanceof Error ? error.message : "화폐 생성 중 오류가 발생했습니다.");
        setShowWarningDialog(true);
      })
      .finally(() => {
        setIsCreatingCurrency(false);
      });
    } catch (error) {
      console.error("화폐 생성 오류:", error);
      setWarningTitle("화폐 생성 실패");
      setWarningMessage(error instanceof Error ? error.message : "화폐 생성 중 오류가 발생했습니다.");
      setShowWarningDialog(true);
      setIsCreatingCurrency(false);
    }
  };
  
  // 화폐 업데이트 함수 개선
  const handleUpdateCurrency = () => {
    // 체크박스로 선택된 행 수 확인
    const tableCheckboxes = document.querySelectorAll('table input[type="checkbox"]:checked');
    console.log("[TabContentRenderer] 체크된 체크박스 수:", tableCheckboxes.length);
    
    // 세션 스토리지에서 선택된 항목 정보 가져오기
    const selectedCurrenciesStr = sessionStorage.getItem('selectedCurrencies');
    const selectedCurrencyStr = sessionStorage.getItem('selectedCurrency');
    
    try {
      let parsedItems: TableData[] = [];
      
      if (selectedCurrenciesStr) {
        // 다중 선택된 항목 처리
        parsedItems = JSON.parse(selectedCurrenciesStr) as TableData[];
      } else if (selectedCurrencyStr) {
        // 단일 선택된 항목 처리
        parsedItems = [JSON.parse(selectedCurrencyStr)];
      } else if (tableCheckboxes.length > 0 && !selectedCurrenciesStr && !selectedCurrencyStr) {
        // 체크박스는 선택되었지만 세션 스토리지에 데이터가 없는 경우
        // 테이블 데이터에서 직접 선택된 항목 찾기
        const tableDataStr = sessionStorage.getItem('tableData');
        if (tableDataStr) {
          const tableData = JSON.parse(tableDataStr);
          const checkedIds = Array.from(tableCheckboxes).map(checkbox => {
            const row = (checkbox as HTMLElement).closest('tr');
            return row?.getAttribute('data-row-id');
          }).filter(Boolean);
          
          if (checkedIds.length > 0) {
            const items = tableData.filter((item: Record<string, unknown>) => 
              checkedIds.includes(String(item.id)));
            
            if (items.length > 0) {
              parsedItems = items as TableData[];
              console.log("[TabContentRenderer] 테이블 데이터에서 직접 찾은 선택 항목:", items.length);
              
              // 세션 스토리지에 저장
              sessionStorage.setItem('selectedCurrencies', JSON.stringify(items));
              sessionStorage.setItem('selectedCurrency', JSON.stringify(items[0]));
            }
          }
        }
      }
      
      console.log('[TabContentRenderer] 화폐 수정 시도:', parsedItems);
      
      if (parsedItems.length > 0) {
        // 로깅
        try {
          logger.info('[TabContentRenderer] 화폐 수정 버튼 클릭', {
            currencyCount: parsedItems.length,
            currencyIds: parsedItems.map(item => item.id),
            timestamp: new Date().toISOString(),
          });
        } catch (error) {
          console.warn('[TabContentRenderer] 로깅 실패:', error);
        }
        
        // 수정할 화폐 정보 설정 및 다이얼로그 표시
        setUpdatingItems(parsedItems);
        setShowUpdateDialog(true);
      } else {
        // 체크박스 선택 없음 경고
        if (tableCheckboxes.length === 0) {
          console.warn('[TabContentRenderer] 수정할 화폐가 선택되지 않았습니다.');
          setWarningTitle('선택된 화폐 없음');
          setWarningMessage('수정할 화폐를 먼저 선택해주세요. 테이블에서 행을 클릭하여 화폐를 선택하세요.');
        } else {
          console.warn('[TabContentRenderer] 유효한 화폐 데이터가 없습니다.');
          setWarningTitle('유효하지 않은 데이터');
          setWarningMessage('선택된 화폐 데이터를 찾을 수 없습니다. 다시 선택해주세요.');
        }
        setShowWarningDialog(true);
      }
    } catch (error) {
      console.error('[TabContentRenderer] 화폐 데이터 처리 중 오류:', error);
      toast({
        title: "오류",
        description: "화폐 정보를 읽는 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };
  
  // 화폐 삭제 함수 개선
  const handleDeleteCurrency = () => {
    // 체크박스로 선택된 행 수 확인
    const tableCheckboxes = document.querySelectorAll('table input[type="checkbox"]:checked');
    console.log("[TabContentRenderer] 체크된 체크박스 수:", tableCheckboxes.length);
    
    // 세션 스토리지에서 선택된 항목 정보 가져오기
    const selectedCurrenciesStr = sessionStorage.getItem('selectedCurrencies');
    const selectedCurrencyStr = sessionStorage.getItem('selectedCurrency');
    
    try {
      let parsedItems: TableData[] = [];
      
      if (selectedCurrenciesStr) {
        // 다중 선택된 항목 처리
        parsedItems = JSON.parse(selectedCurrenciesStr) as TableData[];
      } else if (selectedCurrencyStr) {
        // 단일 선택된 항목 처리
        parsedItems = [JSON.parse(selectedCurrencyStr)];
      } else if (tableCheckboxes.length > 0 && !selectedCurrenciesStr && !selectedCurrencyStr) {
        // 체크박스는 선택되었지만 세션 스토리지에 데이터가 없는 경우
        // 테이블 데이터에서 직접 선택된 항목 찾기
        const tableDataStr = sessionStorage.getItem('tableData');
        if (tableDataStr) {
          const tableData = JSON.parse(tableDataStr);
          const checkedIds = Array.from(tableCheckboxes).map(checkbox => {
            const row = (checkbox as HTMLElement).closest('tr');
            return row?.getAttribute('data-row-id');
          }).filter(Boolean);
          
          if (checkedIds.length > 0) {
            const items = tableData.filter((item: Record<string, unknown>) => 
              checkedIds.includes(String(item.id)));
            
            if (items.length > 0) {
              parsedItems = items as TableData[];
              console.log("[TabContentRenderer] 테이블 데이터에서 직접 찾은 선택 항목:", items.length);
              
              // 세션 스토리지에 저장
              sessionStorage.setItem('selectedCurrencies', JSON.stringify(items));
              sessionStorage.setItem('selectedCurrency', JSON.stringify(items[0]));
            }
          }
        }
      }
      
      console.log('[TabContentRenderer] 화폐 삭제 시도:', parsedItems);
      
      if (parsedItems.length > 0) {
        // 모든 항목에 excel_item_index가 있는지 확인
        const invalidItems = parsedItems.filter(item => !item.excel_item_index);
        if (invalidItems.length > 0) {
          console.error('[TabContentRenderer] 일부 화폐에 excel_item_index가 없습니다:', invalidItems);
          toast({
            title: "삭제 불가",
            description: `${invalidItems.length}개 항목에 필요한 정보(excel_item_index)가 없습니다.`,
            variant: "destructive",
          });
          return;
        }
        
        // 로깅
        try {
          logger.info('[TabContentRenderer] 화폐 삭제 버튼 클릭', {
            currencyCount: parsedItems.length,
            currencyIds: parsedItems.map(item => item.id),
            timestamp: new Date().toISOString(),
          });
        } catch (error) {
          console.warn('[TabContentRenderer] 로깅 실패:', error);
        }
        
        // 삭제할 화폐 정보 설정 및 다이얼로그 표시
        setDeletingCurrencies(parsedItems);
        setShowDeleteDialog(true);
      } else {
        // 체크박스 선택 없음 경고
        if (tableCheckboxes.length === 0) {
          console.warn('[TabContentRenderer] 삭제할 화폐가 선택되지 않았습니다.');
          setWarningTitle('선택된 화폐 없음');
          setWarningMessage('삭제할 화폐를 먼저 선택해주세요. 테이블에서 행을 클릭하여 화폐를 선택하세요.');
        } else {
          console.warn('[TabContentRenderer] 유효한 화폐 데이터가 없습니다.');
          setWarningTitle('유효하지 않은 데이터');
          setWarningMessage('선택된 화폐 데이터를 찾을 수 없습니다. 다시 선택해주세요.');
        }
        setShowWarningDialog(true);
      }
    } catch (error) {
      console.error('[TabContentRenderer] 화폐 데이터 처리 중 오류:', error);
      toast({
        title: "오류",
        description: "화폐 정보를 읽는 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  // Advanced Currency 관련 핸들러 함수 추가
  const handleUseItem = () => {
    // 선택된 화폐가 있는지 확인
    const selectedCurrency = sessionStorage.getItem('selectedCurrency');
    
    if (selectedCurrency) {
      try {
        const parsedInfo = JSON.parse(selectedCurrency);
        console.log('[TabContentRenderer] 아이템 사용 시도:', parsedInfo);
        
        // 아이템 사용 다이얼로그 표시
        setUsingItem({ id: parsedInfo.id, info: parsedInfo });
        setShowUseItemDialog(true);
      } catch (error) {
        console.error('[TabContentRenderer] selectedCurrency 파싱 오류:', error);
        toast({
          title: "오류",
          description: "아이템 정보를 읽는 중 오류가 발생했습니다.",
          variant: "destructive",
        });
      }
    } else {
      console.warn('[TabContentRenderer] 사용할 아이템이 선택되지 않았습니다.');
      
      // 경고 모달 표시
      setWarningTitle('선택된 아이템 없음');
      setWarningMessage('사용할 아이템을 먼저 선택해주세요. 테이블에서 행을 클릭하여 아이템을 선택하세요.');
      setShowWarningDialog(true);
    }
  };
  
  const handleGetItem = () => {
    // 선택된 화폐가 있는지 확인
    const selectedCurrencies = sessionStorage.getItem('selectedCurrencies');
    
    if (selectedCurrencies) {
      try {
        const parsedItems = JSON.parse(selectedCurrencies) as TableData[];
        console.log('[TabContentRenderer] 아이템 획득 시도:', parsedItems);
        
        if (parsedItems.length === 0) {
          console.warn('[TabContentRenderer] 획득할 아이템이 선택되지 않았습니다.');
          
          // 경고 모달 표시
          setWarningTitle('선택된 아이템 없음');
          setWarningMessage('획득할 아이템을 먼저 선택해주세요. 테이블에서 행을 클릭하여 아이템을 선택하세요.');
          setShowWarningDialog(true);
          return;
        }
        
        // 아이템 획득 로직 구현...
        // 모달로 변경
        setWarningTitle('안내');
        setWarningMessage('아이템 획득 기능이 곧 추가될 예정입니다.');
        setShowWarningDialog(true);
      } catch (error) {
        console.error('[TabContentRenderer] selectedCurrencies 파싱 오류:', error);
        toast({
          title: "오류",
          description: "아이템 정보를 읽는 중 오류가 발생했습니다.",
          variant: "destructive",
        });
      }
    } else {
      console.warn('[TabContentRenderer] 획득할 아이템이 선택되지 않았습니다.');
      
      // 경고 모달 표시
      setWarningTitle('선택된 아이템 없음');
      setWarningMessage('획득할 아이템을 먼저 선택해주세요. 테이블에서 행을 클릭하여 아이템을 선택하세요.');
      setShowWarningDialog(true);
    }
  };
  
  const handleSendItem = () => {
    // 선택된 화폐가 있는지 확인
    const selectedCurrencies = sessionStorage.getItem('selectedCurrencies');
    
    if (selectedCurrencies) {
      try {
        const parsedItems = JSON.parse(selectedCurrencies) as TableData[];
        console.log('[TabContentRenderer] 아이템 전송 시도:', parsedItems);
        
        if (parsedItems.length === 0) {
          console.warn('[TabContentRenderer] 전송할 아이템이 선택되지 않았습니다.');
          
          // 경고 모달 표시
          setWarningTitle('선택된 아이템 없음');
          setWarningMessage('전송할 아이템을 먼저 선택해주세요. 테이블에서 행을 클릭하여 아이템을 선택하세요.');
          setShowWarningDialog(true);
          return;
        }
        
        // 아이템 전송 로직 구현...
        // 모달로 변경
        setWarningTitle('안내');
        setWarningMessage('아이템 전송 기능이 곧 추가될 예정입니다.');
        setShowWarningDialog(true);
      } catch (error) {
        console.error('[TabContentRenderer] selectedCurrencies 파싱 오류:', error);
        toast({
          title: "오류",
          description: "아이템 정보를 읽는 중 오류가 발생했습니다.",
          variant: "destructive",
        });
      }
    } else {
      console.warn('[TabContentRenderer] 전송할 아이템이 선택되지 않았습니다.');
      
      // 경고 모달 표시
      setWarningTitle('선택된 아이템 없음');
      setWarningMessage('전송할 아이템을 먼저 선택해주세요. 테이블에서 행을 클릭하여 아이템을 선택하세요.');
      setShowWarningDialog(true);
    }
  };

  // 탭 콘텐츠가 로드될 때 선택된 항목 정보 초기화
  useEffect(() => {
    // 컴포넌트 마운트 시 세션 스토리지에서 선택 항목 초기화
    console.log("[TabContentRenderer] 컴포넌트 마운트 - 선택 항목 초기화");
    sessionStorage.removeItem('selectedCurrency');
    sessionStorage.removeItem('selectedCurrencies');
    
    // 체크박스 상태 초기화 이벤트 등록
    window.addEventListener('reset-selection', () => {
      console.log("[TabContentRenderer] reset-selection 이벤트로 선택 항목 초기화");
      sessionStorage.removeItem('selectedCurrency');
      sessionStorage.removeItem('selectedCurrencies');
    });
    
    return () => {
      window.removeEventListener('reset-selection', () => {
        console.log("[TabContentRenderer] reset-selection 이벤트 리스너 제거");
      });
    };
  }, []);

  // 화폐 행 선택 처리 핸들러 추가: 이전 데이터를 완전히 초기화하고 새로 저장
  const handleCurrencyRowSelect = (selectedItems: TableData[]) => {
    console.log('[TabContentRenderer] 선택된 행 업데이트:', selectedItems.length, '개 항목');
    
    // 먼저 이전 선택 정보 초기화
    sessionStorage.removeItem('selectedCurrency');
    sessionStorage.removeItem('selectedCurrencies');
    
    // 선택된 행이 있으면 모든 항목을 저장
    if (selectedItems.length > 0) {
      sessionStorage.setItem('selectedCurrencies', JSON.stringify(selectedItems));
      // 이전 코드와의 호환성을 위해 첫 번째 항목도 별도로 저장
      sessionStorage.setItem('selectedCurrency', JSON.stringify(selectedItems[0]));
      console.log('[TabContentRenderer] 화폐 선택됨:', selectedItems);
    } else {
      console.log('[TabContentRenderer] 화폐 선택 취소됨');
    }
  };

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
          <li className="ml-2">shipping_product_db</li>
          <li className="ml-2">shipping_dev_db</li>
          <li className="ml-2">develop_db</li>
        </ul>
      </div>
      
      {debugInfo && (
        <details className="mt-2 text-sm">
          <summary className="cursor-pointer flex items-center justify-between">
            <div className="flex items-center">
              <Bug className="w-4 h-4 mr-1 text-gray-600" />
              <span className="text-blue-600">API 디버그 정보</span>
              {debugInfo?.success === true && <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-full flex items-center"><CheckCircle2 className="w-3 h-3 mr-1" />성공</span>}
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
              <span className="flex items-center">
                <Info className="w-3.5 h-3.5 mr-1 text-blue-600" />
                <span className="font-medium">디버그 정보 상태:</span>
              </span>
              <div className="mt-1 ml-2 flex flex-wrap gap-2">
                <span className="flex items-center bg-gray-50 px-2 py-1 rounded">
                  {requestInfo ? 
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-green-600" /> : 
                    <X className="w-3.5 h-3.5 mr-1 text-red-500" />
                  }
                  <span className="font-mono">requestInfo: {requestInfo ? '✅' : '❌'}</span>
                </span>
                <span className="flex items-center bg-gray-50 px-2 py-1 rounded">
                  {apiDebugInfo ? 
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-green-600" /> : 
                    <X className="w-3.5 h-3.5 mr-1 text-red-500" />
                  }
                  <span className="font-mono">apiDebugInfo: {apiDebugInfo ? '✅' : '❌'}</span>
                </span>
                <span className="flex items-center bg-gray-50 px-2 py-1 rounded">
                  {debugInfo ? 
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-green-600" /> : 
                    <X className="w-3.5 h-3.5 mr-1 text-red-500" />
                  }
                  <span className="font-mono">debugInfo: {debugInfo ? '✅' : '❌'}</span>
                </span>
              </div>
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

  // 삭제 확인 다이얼로그 컴포넌트
  const DeleteConfirmDialog = () => {
    // 삭제 확인 처리
    const handleConfirmDelete = async () => {
      if (!deletingCurrencies) return;
      
      setIsDeleting(true);
      
      try {
        try {
          logger.info('[TabContentRenderer] 항목 삭제 확인됨:', {
            itemIds: deletingCurrencies.map(item => item.id),
            timestamp: new Date().toISOString(),
          });
        } catch (error) {
          console.warn('[TabContentRenderer] 로깅 실패:', error);
        }
        
        // 사용자 정보 가져오기
        const employerInfo = sessionStorage.getItem('employerStorage');
        if (!employerInfo) {
          throw new Error('사용자 정보를 찾을 수 없습니다. 사용자 목록 페이지에서 사용자를 선택해주세요.');
        }
        
        // 사용자 정보 파싱
        const parsedEmployerInfo = JSON.parse(employerInfo);
        const employerUid = parsedEmployerInfo.uid;
        
        // DB 이름 가져오기
        let dbName = '';
        if (parsedEmployerInfo.db_name) {
          dbName = parsedEmployerInfo.db_name;
        } else {
          // 이전 방식으로 DB 이름 가져오기
          const storedInfo = sessionStorage.getItem('popupUserInfo');
          if (storedInfo) {
            const parsedInfo = JSON.parse(storedInfo);
            dbName = parsedInfo.dbName;
          } else {
            dbName = sessionStorage.getItem('lastUsedDbName') || 'shipping_dev_db';
          }
        }

        // 현재 탭 확인 - BALLER인지 CURRENCY인지 확인
        const currentTab = content?.props?.endpoint as string || '';
        const isBallerTab = currentTab.includes('/api/users/multi-play/baller');
        
        let apiEndpoint = '';
        let queryParams = '';
        
        if (isBallerTab) {
          console.log('[TabContentRenderer] Baller 삭제 처리');
          
          // Baller 탭인 경우: excelBallerIndex 필드 사용
          const excelBallerIndices = deletingCurrencies.map(item => {
            // Baller 삭제에 사용되는 필드는 excelBallerIndex 또는 excel_baller_index 일 수 있음
            return item.excelBallerIndex || item.excel_baller_index || item.excel_item_index;
          });
          
          if (!employerUid || !dbName || excelBallerIndices.some(index => !index)) {
            console.error('[DeleteDialog] 필요한 정보 누락:', {
              employerUid,
              dbName,
              items: deletingCurrencies,
              excelBallerIndices
            });
            throw new Error('삭제에 필요한 정보가 누락되었습니다.');
          }
          
          apiEndpoint = `/api/users/multi-play/baller`;
          queryParams = `employerUid=${employerUid}&excelBallerIndex=${excelBallerIndices.join(',')}&dbName=${dbName}`;
        } else {
          console.log('[TabContentRenderer] Currency 삭제 처리');
          
          // Currency 탭인 경우: excelItemIndex 필드 사용
          const excelItemIndices = deletingCurrencies.map(item => item.excel_item_index);
          
          if (!employerUid || !dbName || excelItemIndices.some(index => !index)) {
            console.error('[DeleteDialog] 필요한 정보 누락:', {
              employerUid,
              dbName,
              items: deletingCurrencies
            });
            throw new Error('삭제에 필요한 정보가 누락되었습니다.');
          }
          
          apiEndpoint = `/api/users/currency`;
          queryParams = `employerUid=${employerUid}&excelItemIndex=${excelItemIndices.join(',')}&dbName=${dbName}`;
        }
        
        console.log('[TabContentRenderer] 항목 삭제 API 호출:', {
          endpoint: apiEndpoint,
          query: queryParams
        });
        
        // API 호출
        const response = await fetch(`${apiEndpoint}?${queryParams}`, {
          method: 'DELETE',
        });
        
        // 응답 상태 확인 및 디버깅을 위한 로깅
        console.log('[TabContentRenderer] 삭제 응답 상태:', {
          status: response.status,
          statusText: response.statusText,
          contentType: response.headers.get('content-type')
        });
        
        // 응답이 JSON이 아닌 경우 처리
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          console.error('[TabContentRenderer] JSON이 아닌 응답:', {
            contentType,
            status: response.status
          });
          
          // HTML 응답 등이 있을 경우 text로 읽기
          const responseText = await response.text();
          console.error('[TabContentRenderer] 응답 내용:', responseText.substring(0, 200) + '...');
          
          throw new Error(`서버 오류가 발생했습니다 (${response.status}): ${response.statusText}`);
        }
        
        // JSON 응답 처리
        let result;
        try {
          result = await response.json() as {
            success: boolean;
            message: string;
            results?: Array<{
              success: boolean;
              message: string;
              [key: string]: unknown;
            }>;
          };
        } catch (parseError) {
          console.error('[TabContentRenderer] JSON 파싱 오류:', parseError);
          throw new Error('응답 데이터 처리 중 오류가 발생했습니다.');
        }
        
        if (!response.ok || !result.success) {
          console.error('[TabContentRenderer] 요청 실패:', {
            status: response.status,
            data: result
          });
          throw new Error(result.message || `삭제 처리 중 오류가 발생했습니다. (${response.status})`);
        }
        
        // 삭제 결과 요약
        const totalCount = deletingCurrencies.length;
        const successCount = result.results?.filter(r => r.success).length || totalCount;
        const failCount = totalCount - successCount;
        
        // 삭제된 항목의 이름 추출
        const itemNames = deletingCurrencies.map(item => {
          // Baller와 Currency 모두 지원
          const name = item.name || item.baller_name || item.item_name || '항목';
          const type = item.type || item.baller_type || item.item_type || '';
          return type ? `${name} (${type})` : name;
        }).join(', ');
        
        if (failCount > 0) {
          toast({
            title: "일부 삭제 성공",
            description: `${totalCount}개 중 ${successCount}개 항목 삭제 완료, ${failCount}개 실패`,
            variant: "default",
          });
        } else {
          toast({
            title: "삭제 성공",
            description: `${totalCount}개 항목 (${itemNames}) 삭제가 완료되었습니다.`,
            variant: "default",
          });
        }
        
        // 데이터 다시 로드
        fetchData();
        
      } catch (error) {
        console.error('[TabContentRenderer] 항목 삭제 중 오류:', error);
        toast({
          title: "삭제 실패",
          description: error instanceof Error ? error.message : "항목 삭제 중 오류가 발생했습니다.",
          variant: "destructive",
        });
      } finally {
        setIsDeleting(false);
        setShowDeleteDialog(false);
        setDeletingCurrencies(null);
      }
    };
    
    // 취소 처리
    const handleCancelDelete = () => {
      try {
        logger.info('[TabContentRenderer] 화폐 삭제 취소됨:', {
          currencyIds: deletingCurrencies?.map(item => item.id),
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        console.warn('[TabContentRenderer] 로깅 실패:', error);
      }
      setShowDeleteDialog(false);
      setDeletingCurrencies(null);
    };
    
    return (
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-[900px] max-h-[85vh] flex flex-col p-0 overflow-hidden border-none rounded-lg shadow-2xl">
          {/* 모달 헤더 - 현대적인 디자인 */}
          <div className="bg-gradient-to-r from-red-600 to-orange-600 p-6 text-white">
            <DialogTitle className="flex items-center text-2xl font-light tracking-wide mb-2">
              <AlertCircle className="mr-3 h-6 w-6 text-red-200" />
              화폐 삭제
            </DialogTitle>
            <DialogDescription className="text-red-100 opacity-90 text-sm">
              선택한 {deletingCurrencies?.length || 0}개 항목을 삭제합니다. 이 작업은 되돌릴 수 없습니다.
            </DialogDescription>
          </div>
          
          {/* 모달 내용 */}
          <div className="p-6 bg-white flex flex-col">
            <div className="mb-6">
              {deletingCurrencies && deletingCurrencies.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-lg font-medium text-gray-800 mb-2">삭제할 항목:</h3>
                  <div className="bg-gray-50 p-4 rounded-lg max-h-[20vh] overflow-auto border border-gray-100">
                    <div className="text-gray-700 mb-2">총 {deletingCurrencies.length}개 항목이 선택되었습니다.</div>
                    <div className="text-gray-600 text-sm">
                      이 항목들을 영구적으로 삭제하시겠습니까?
                    </div>
                  </div>
                </div>
              )}
              
              <div className="bg-red-50 p-4 rounded-lg border border-red-100">
                <p className="text-red-800 font-medium flex items-center">
                  <AlertCircle className="h-5 w-5 mr-2 text-red-600" />
                  경고
                </p>
                <p className="mt-2 text-red-700 text-sm">
                  이 작업은 되돌릴 수 없으며, 데이터베이스에서 항목이 영구적으로 삭제됩니다.
                </p>
              </div>
            </div>
          </div>

          {/* 모달 푸터 */}
          <div className="p-4 bg-white border-t border-gray-100 flex justify-end gap-2 items-center">
            <Button 
              variant="outline" 
              onClick={handleCancelDelete} 
              disabled={isDeleting}
              className="border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors"
            >
              취소
            </Button>
            <Button 
              onClick={handleConfirmDelete} 
              disabled={isDeleting}
              className={`
                py-2 px-4 flex items-center gap-2 transition-all rounded-md
                ${isDeleting 
                  ? "bg-red-400" 
                  : "bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 shadow-md hover:shadow"
                }
              `}
            >
              {isDeleting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>삭제 중...</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  <span>삭제</span>
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  // 아이템 사용 확인 다이얼로그 컴포넌트
  const UseItemConfirmDialog = () => {
    // 사용 확인 처리
    const handleConfirmUse = async () => {
      if (!usingItem) return;
      
      setIsUsingItem(true);
      
      try {
        // 로깅
        try {
          logger.info('[TabContentRenderer] 아이템 사용 확인됨:', {
            itemId: usingItem.id,
            timestamp: new Date().toISOString(),
          });
        } catch (error) {
          console.warn('[TabContentRenderer] 로깅 실패:', error);
        }
        
        // TODO: 여기에 실제 아이템 사용 API 호출 코드를 추가

        // 샘플 성공 메시지
        const itemName = usingItem.info.name || usingItem.info.item_name || '아이템';
        const displayName = typeof itemName === 'object' ? JSON.stringify(itemName) : String(itemName);
        
        toast({
          title: "사용 성공",
          description: `${displayName} 아이템을 성공적으로 사용했습니다.`,
          variant: "default",
        });
        
        // 데이터 다시 로드
        fetchData();
        
      } catch (error) {
        console.error('[TabContentRenderer] 아이템 사용 중 오류:', error);
        toast({
          title: "사용 실패",
          description: error instanceof Error ? error.message : "아이템 사용 중 오류가 발생했습니다.",
          variant: "destructive",
        });
      } finally {
        setIsUsingItem(false);
        setShowUseItemDialog(false);
        setUsingItem(null);
      }
    };
    
    // 취소 처리
    const handleCancelUse = () => {
      try {
        logger.info('[TabContentRenderer] 아이템 사용 취소됨:', {
          itemId: usingItem?.id,
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        console.warn('[TabContentRenderer] 로깅 실패:', error);
      }
      setShowUseItemDialog(false);
      setUsingItem(null);
    };
    
    // 아이템 이름 가져오기
    const itemName = usingItem?.info.name || usingItem?.info.item_name || '아이템';
    const displayName = typeof itemName === 'object' ? JSON.stringify(itemName) : String(itemName);
    
    return (
      <Dialog open={showUseItemDialog} onOpenChange={setShowUseItemDialog}>
        <DialogContent className="sm:max-w-[900px] max-h-[85vh] flex flex-col p-0 overflow-hidden border-none rounded-lg shadow-2xl">
          {/* 모달 헤더 - 현대적인 디자인 */}
          <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-6 text-white">
            <DialogTitle className="flex items-center text-2xl font-light tracking-wide mb-2">
              <CheckCircle2 className="mr-3 h-6 w-6 text-blue-200" />
              아이템 사용
            </DialogTitle>
            <DialogDescription className="text-blue-100 opacity-90 text-sm">
              선택한 아이템을 사용합니다. 이 작업은 되돌릴 수 없습니다.
            </DialogDescription>
          </div>
          
          {/* 모달 내용 */}
          <div className="p-6 bg-white flex flex-col">
            <div className="mb-6">
              {usingItem && (
                <div className="mb-4">
                  <h3 className="text-lg font-medium text-gray-800 mb-2">사용할 아이템:</h3>
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-blue-700">{displayName}</p>
                    </div>
                    <CheckCircle2 className="h-8 w-8 text-blue-500" />
                  </div>
                </div>
              )}
              
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                <p className="text-gray-700">
                  이 아이템을 사용하면 계정에서 소모되며, 아이템 효과가 적용됩니다. 이 작업은 되돌릴 수 없습니다.
                </p>
              </div>
            </div>
          </div>

          {/* 모달 푸터 */}
          <div className="p-4 bg-white border-t border-gray-100 flex justify-end gap-2 items-center">
            <Button 
              variant="outline" 
              onClick={handleCancelUse} 
              disabled={isUsingItem}
              className="border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors"
            >
              취소
            </Button>
            <Button 
              onClick={handleConfirmUse} 
              disabled={isUsingItem}
              className={`
                py-2 px-4 flex items-center gap-2 transition-all rounded-md
                ${isUsingItem 
                  ? "bg-blue-400" 
                  : "bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 shadow-md hover:shadow"
                }
              `}
            >
              {isUsingItem ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>사용 중...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>사용</span>
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  // 복수 항목 업데이트 핸들러 수정
  const handleConfirmUpdate = async (updatedItems: TableData[]) => {
    if (!updatedItems || updatedItems.length === 0) return;
    
    setIsUpdating(true);
    
    try {
      // 로깅
      try {
        logger.info('[TabContentRenderer] 화폐 수정 확인됨:', {
          itemCount: updatedItems.length,
          itemIds: updatedItems.map(item => item.id),
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        console.warn('[TabContentRenderer] 로깅 실패:', error);
      }
      
      // 사용자 정보 가져오기
      const employerInfo = sessionStorage.getItem('employerStorage');
      if (!employerInfo) {
        throw new Error('사용자 정보를 찾을 수 없습니다. 사용자 목록 페이지에서 사용자를 선택해주세요.');
      }
      
      // 사용자 정보 파싱
      const parsedEmployerInfo = JSON.parse(employerInfo);
      const employerUid = parsedEmployerInfo.uid;
      
      // DB 이름 가져오기
      let dbName = '';
      if (parsedEmployerInfo.db_name) {
        dbName = parsedEmployerInfo.db_name;
      } else {
        // 이전 방식으로 DB 이름 가져오기
        const storedInfo = sessionStorage.getItem('popupUserInfo');
        if (storedInfo) {
          const parsedInfo = JSON.parse(storedInfo);
          dbName = parsedInfo.dbName;
        } else {
          dbName = sessionStorage.getItem('lastUsedDbName') || 'shipping_dev_db';
        }
      }
      
      if (!employerUid || !dbName) {
        throw new Error('수정에 필요한 정보가 누락되었습니다.');
      }
      
      console.log('[TabContentRenderer] 화폐 수정 API 호출 준비:', {
        employerUid,
        dbName,
        itemsToUpdate: updatedItems
      });
      
      // 각 항목에 대해 PUT 요청 수행
      const updatePromises = updatedItems.map(async (item) => {
        const excelItemIndex = item.excel_item_index;
        if (!excelItemIndex) {
          return {
            success: false,
            message: `항목 ID ${item.id}: excel_item_index가 누락되었습니다.`
          };
        }
        
        // ID 필드를 제외한 업데이트 데이터 생성
        const { id } = item;
        
        try {
          const response = await fetch(`/api/users/currency`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              employerUid: employerUid, 
              excelItemIndex: excelItemIndex, 
              count: item.count || 0, 
              dbName: dbName
            })
          });
          
          const result = await response.json();
          return {
            ...result,
            itemId: id,
            excelItemIndex
          };
        } catch (error) {
          console.error(`[TabContentRenderer] 항목 ID ${item.id} 업데이트 중 오류:`, error);
          return {
            success: false,
            message: `항목 ID ${item.id}: ${error instanceof Error ? error.message : '알 수 없는 오류'}`,
            itemId: item.id,
            excelItemIndex
          };
        }
      });
      
      // 모든 업데이트 요청 완료 대기
      const results = await Promise.all(updatePromises);
      
      // 결과 처리
      const successCount = results.filter(r => r.success).length;
      const failCount = results.length - successCount;
      
      if (failCount > 0) {
        // 실패한 항목이 있을 경우
        toast({
          title: "일부 업데이트 성공",
          description: `${results.length}개 중 ${successCount}개 항목 업데이트 완료, ${failCount}개 실패`,
          variant: "default",
        });
        
        // 상세 오류 정보 로깅
        const failedItems = results.filter(r => !r.success);
        console.error('[TabContentRenderer] 업데이트 실패 항목:', failedItems);
      } else {
        // 모든 항목 업데이트 성공
        toast({
          title: "업데이트 성공",
          description: `${successCount}개 항목 업데이트가 완료되었습니다.`,
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
      // Currency 탭 또는 Baller 탭 확인
      const isCurrencyTab = endpoint ? endpoint.includes('/api/users/currency') : false;
      const isBallerTab = endpoint ? endpoint.includes('/api/users/multi-play/baller') : false;
      
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
            renderErrorState()
          ) : (
            <>
              <DataTable
                tableName={(contentProps.tableName as string) || '테이블'}
                data={contentProps.data as TableData[] || data}
                customFormatters={contentProps.formatters as Record<string, (value: string | number | null | object) => string | number | React.ReactNode> | undefined}
                onSelectionChange={isCurrencyTab ? handleCurrencyRowSelect : undefined}
                // Currency Tab 또는 Baller Tab일 경우 Control Panel을 표시하고 이벤트 핸들러를 연결
                showDataControls={contentProps.showDataControls === true || isCurrencyTab}
                onCreateCurrency={isCurrencyTab ? handleCreateCurrency : (contentProps.showDataControls === true && isBallerTab) ? handleCreateBaller : undefined}
                onUpdateCurrency={isCurrencyTab ? handleUpdateCurrency : (contentProps.showDataControls === true && isBallerTab) ? handleUpdateBaller : undefined}
                onDeleteCurrency={isCurrencyTab ? handleDeleteCurrency : (contentProps.showDataControls === true && isBallerTab) ? handleDeleteBaller : undefined}
                // Advanced Data Controls
                showAdvancedDataControls={isCurrencyTab}
                onUseItem={isCurrencyTab ? handleUseItem : undefined}
                onGetItem={isCurrencyTab ? handleGetItem : undefined}
                onSendItem={isCurrencyTab ? handleSendItem : undefined}
              />
              {showDebugSection && (
                <div className="mt-4 border rounded-md overflow-hidden">
                  {/* ... existing debug section code ... */}
                </div>
              )}
            </>
          )}
          
          {/* 삭제 확인 다이얼로그 */}
          <DeleteConfirmDialog />
          
          {/* 아이템 사용 확인 다이얼로그 */}
          <UseItemConfirmDialog />
          
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
          
          {/* 경고 모달 */}
          <Dialog open={showWarningDialog} onOpenChange={setShowWarningDialog}>
            <DialogContent className="sm:max-w-[900px] max-h-[85vh] flex flex-col p-0 overflow-hidden border-none rounded-lg shadow-2xl">
              {/* 모달 헤더 - 현대적인 디자인 */}
              <div className="bg-gradient-to-r from-yellow-500 to-amber-500 p-6 text-white">
                <DialogTitle className="flex items-center text-2xl font-light tracking-wide mb-2">
                  <AlertCircle className="mr-3 h-6 w-6 text-yellow-200" />
                  {warningTitle || '경고'}
                </DialogTitle>
                <DialogDescription className="text-yellow-100 opacity-90 text-sm">
                  확인이 필요한 정보가 있습니다.
                </DialogDescription>
              </div>
              
              {/* 모달 내용 */}
              <div className="p-6 bg-white flex flex-col">
                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
                  <p className="text-yellow-800">{warningMessage}</p>
                </div>
              </div>

              {/* 모달 푸터 */}
              <div className="p-4 bg-white border-t border-gray-100 flex justify-end gap-2 items-center">
                <Button 
                  onClick={() => setShowWarningDialog(false)} 
                  className="py-2 px-4 flex items-center gap-2 transition-all rounded-md bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 shadow-md hover:shadow text-white"
                >
                  <Check className="w-4 h-4" />
                  <span>확인</span>
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          {/* CreateCurrencyModal 추가 */}
          <CreateCurrencyModal
            open={showCreateCurrencyModal}
            onOpenChange={setShowCreateCurrencyModal}
            onConfirm={handleConfirmCreateCurrency}
            isCreating={isCreatingCurrency}
          />
          {/* CreateBallerModal 추가 */}
          <CreateBallerModal
            open={showCreateBallerModal}
            onOpenChange={setShowCreateBallerModal}
            onConfirm={(newBaller) => {
              // 생성 중 상태로 설정
              setIsCreatingBaller(true);
              
              // 사용자 정보 가져오기
              const employerInfo = sessionStorage.getItem('employerStorage');
              if (!employerInfo) {
                console.error("사용자 정보가 없습니다.");
                setWarningTitle('사용자 정보 없음');
                setWarningMessage('사용자 정보가 없습니다. 로그인 후 다시 시도해주세요.');
                setShowWarningDialog(true);
                setIsCreatingBaller(false);
                return;
              }
              
              try {
                const parsedEmployerInfo = JSON.parse(employerInfo);
                const employerUid = parsedEmployerInfo.uid;
                const dbName = parsedEmployerInfo.db_name;
                
                // API 요청 데이터 준비
                const requestData = {
                  employerUid,
                  dbName,
                  excelBallerIndex: newBaller.excel_baller_index,
                  trainingPoint: newBaller.training_point,
                  characterLevel: newBaller.character_level,
                  recruitProcess: newBaller.recruit_process,
                  characterStatus: newBaller.character_status,
                  talkGroupNo: 1, // 기본값
                  maxUpgradePoint: 0 // 기본값
                };
                
                // 로깅
                console.log('[TabContentRenderer] Baller 생성 요청:', requestData);
                
                // API 호출
                fetch('/api/users/multi-play/baller', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify(requestData),
                })
                .then(response => {
                  if (!response.ok) {
                    return response.json().then(data => {
                      throw new Error(data.error || data.message || '알 수 없는 오류가 발생했습니다.');
                    });
                  }
                  return response.json();
                })
                .then(data => {
                  // 성공 처리
                  console.log("베럴이 성공적으로 생성되었습니다:", data);
                  toast({
                    title: "생성 성공",
                    description: "베럴이 성공적으로 생성되었습니다.",
                    variant: "default",
                  });
                  
                  // 데이터 새로고침
                  fetchData();
                })
                .catch(error => {
                  console.error('[TabContentRenderer] Baller 생성 오류:', error);
                  toast({
                    title: "생성 실패",
                    description: error.message || "베럴 생성 중 오류가 발생했습니다.",
                    variant: "destructive",
                  });
                })
                .finally(() => {
                  // 모달 닫기
                  setShowCreateBallerModal(false);
                  setIsCreatingBaller(false);
                });
              } catch (error) {
                console.error('[TabContentRenderer] 데이터 처리 중 오류:', error);
                toast({
                  title: "오류 발생",
                  description: "데이터 처리 중 오류가 발생했습니다.",
                  variant: "destructive",
                });
                setIsCreatingBaller(false);
              }
            }}
            isCreating={isCreatingBaller}
          />
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