# API 디버그 정보 기능

## 개요

API 디버그 정보 기능은 REST API 요청 시 사용된 원문 정보를 사용자에게 보여주는 기능입니다. 이 기능을 통해 개발자는 API 호출의 세부 정보를 쉽게 확인할 수 있어 디버깅 및 문제 해결에 도움이 됩니다.

## 주요 기능

- API 요청 URL 표시
- 요청 메소드 (GET, POST, PUT, DELETE 등) 표시
- 요청 헤더 정보 표시
- 요청 본문(Body) 데이터 표시 (POST, PUT 요청의 경우)
- 요청 시간 표시

## 구성 요소

### 1. API 요청 모듈 (useApiRequest 훅)

`src/hooks/useApiRequest.ts` 파일은 API 요청을 보내고 그 결과와 함께 디버그 정보를 반환하는 React 훅입니다.

```typescript
import { useState } from 'react';

interface ApiRequestOptions extends RequestInit {
  baseUrl?: string;
  params?: Record<string, string | number | boolean | undefined>;
}

type ApiRequestBody = BodyInit | Record<string, unknown> | null;

interface ApiResponse<T> {
  data: T | null;
  debugInfo: {
    requestUrl: string;
    requestMethod: string;
    requestHeaders: Record<string, string>;
    requestBody?: string;
    timestamp: string;
  };
  error: Error | null;
  isLoading: boolean;
}

export const useApiRequest = <T>() => {
  // 구현 내용...
};
```

### 2. 디버그 정보 표시 컴포넌트 (ApiDebugInfo)

`src/components/ApiDebugInfo.tsx` 파일은 API 디버그 정보를 표시하는 React 컴포넌트입니다.

```typescript
import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface ApiDebugInfoProps {
  requestUrl: string;
  requestMethod: string;
  requestHeaders: Record<string, string>;
  requestBody?: string;
  timestamp: string;
}

export const ApiDebugInfo: React.FC<ApiDebugInfoProps> = ({
  // props...
}) => {
  // 구현 내용...
};
```

## 사용 방법

### 1. API 요청 모듈 사용하기

```typescript
import { useApiRequest } from '@/hooks/useApiRequest';

// 컴포넌트 내부
const apiRequest = useApiRequest<YourResponseType>();

// API 요청 보내기
const response = await apiRequest.get('/api/your-endpoint', {
  params: { id: 123 }
});

// 디버그 정보 접근하기
console.log(response.debugInfo);
```

### 2. 디버그 정보 표시 컴포넌트 사용하기

```tsx
import { ApiDebugInfo } from '@/components/ApiDebugInfo';

// 컴포넌트 내부 렌더링 코드
{debugInfo && (
  <ApiDebugInfo
    requestUrl={debugInfo.requestUrl}
    requestMethod={debugInfo.requestMethod}
    requestHeaders={debugInfo.requestHeaders}
    requestBody={debugInfo.requestBody}
    timestamp={debugInfo.timestamp}
  />
)}
```

## 예제

사용자 검색 페이지에서 사용자를 검색할 때 API 디버그 정보가 표시됩니다. `src/app/(main)/users/page.tsx` 파일에서 그 예를 확인할 수 있습니다.

## 확장 방법

1. 새로운 API 호출을 작성할 때 `useApiRequest` 훅을 사용합니다.
2. API 호출 결과를 처리하는 컴포넌트에서 `debugInfo` 상태를 관리합니다.
3. 디버그 정보를 표시할 위치에 `ApiDebugInfo` 컴포넌트를 추가합니다.

## 주의사항

- 디버그 정보는 민감한 정보를 포함할 수 있으므로 프로덕션 환경에서는 주의해서 사용해야 합니다.
- Authorization 토큰과 같은 민감한 정보는 디버그 정보에서 마스킹 처리하는 것이 좋습니다. 