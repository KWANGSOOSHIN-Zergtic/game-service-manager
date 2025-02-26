# 프로젝트 설정 가이드

## 프로젝트 개요

1Team Football Game Service Manager는 게임 서비스 관리를 위한 웹 기반 관리자 도구입니다.

### 주요 기능
- 서비스 현황 모니터링
- 서버 관리
- 게임 서비스 관리
- 유저 관리
- 어드민 관리

## 기술 스택 설정

### 1. 프레임워크 설정
```bash
# Next.js 프로젝트 생성
npx create-next-app@latest gm-tool --typescript --tailwind --eslint

# 기본 설정
- TypeScript 사용
- Tailwind CSS 사용
- ESLint 사용
- src/ 디렉토리 사용
- App Router 사용
```

### 2. 상태 관리 설정
```bash
# 서버 상태 관리
npm install @tanstack/react-query

# 전역 상태 관리
npm install zustand
```

### 3. UI 라이브러리 설정
```bash
# ShadCN 초기화
npx shadcn@latest init

# 필수 UI 컴포넌트 설치
npx shadcn@latest add button card form input label select table tabs toast dialog dropdown-menu separator sheet sidebar avatar badge calendar checkbox radio-group switch alert progress skeleton

# 아이콘 라이브러리
npm install lucide-react @radix-ui/react-icons
```

### 4. 폼 관리 설정
```bash
# 폼 유효성 검증
npm install @hookform/resolvers zod
```

### 5. 테스트 환경 설정
```bash
# Jest 설정
npm install -D jest @testing-library/react @testing-library/jest-dom

# Cypress 설정
npm install -D cypress
```

## 프로젝트 구조 설정

```bash
mkdir -p src/{app,components,lib,styles,types}
mkdir -p src/components/ui
mkdir -p public/resource
mkdir -p docs
mkdir -p tests/{unit,e2e}
```

## 환경 설정 파일

### 1. TypeScript 설정 (tsconfig.json)
```json
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules"]
}
```

### 2. ESLint 설정 (.eslintrc.json)
```json
{
  "extends": [
    "next/core-web-vitals",
    "prettier"
  ],
  "plugins": [
    "@typescript-eslint"
  ],
  "rules": {
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/no-explicit-any": "warn"
  }
}
```

### 3. Prettier 설정 (.prettierrc)
```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "tabWidth": 2,
  "useTabs": false
}
```

## 개발 환경 설정

### 1. VSCode 추천 확장 프로그램
- ESLint
- Prettier
- Tailwind CSS IntelliSense
- PostCSS Language Support
- Jest Runner
- Error Lens

### 2. Git 설정
```bash
# .gitignore 파일
node_modules/
.next/
coverage/
.env*
!.env.example
.vercel
*.log
.DS_Store
```

## 스크립트 설정 (package.json)
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "format": "prettier --write .",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:e2e": "cypress open",
    "prepare": "husky install"
  }
}
```

## 개발 가이드라인

### 1. 코드 스타일
- 파일명:
  - 컴포넌트: PascalCase (예: UserProfile.tsx)
  - 유틸리티: camelCase (예: formatDate.ts)
  - 페이지: page.tsx
  - 레이아웃: layout.tsx

- 변수/함수명:
  - 변수: camelCase
  - 상수: UPPER_SNAKE_CASE
  - 컴포넌트: PascalCase
  - 타입/인터페이스: PascalCase

### 2. 컴포넌트 개발
- Atomic Design 원칙 준수
- Props 타입 명시적 정의
- 재사용성 고려
- 성능 최적화 (useMemo, useCallback 적절히 사용)

### 3. 상태 관리
- 서버 상태: React Query
  - 캐싱 전략 수립
  - 에러 핸들링
  - 로딩 상태 관리

- 클라이언트 상태: Zustand
  - 스토어 모듈화
  - 타입 안정성 확보
  - 불변성 유지

### 4. 테스트
- 단위 테스트
  - 컴포넌트 렌더링 테스트
  - 이벤트 핸들링 테스트
  - 상태 변화 테스트

- E2E 테스트
  - 주요 사용자 시나리오 테스트
  - API 통합 테스트
  - 에러 케이스 테스트

### 5. 성능 최적화
- 이미지 최적화
- 코드 스플리팅
- 레이지 로딩
- 메모이제이션

### 6. 보안
- API 키 환경변수 관리
- XSS 방지
- CSRF 토큰 사용
- 입력값 검증

## 배포 가이드

### 1. 개발 환경
```bash
npm run dev
```

### 2. 프로덕션 빌드
```bash
npm run build
npm start
```

### 3. 환경변수 설정
```env
# .env.example
NEXT_PUBLIC_API_URL=
DATABASE_URL=
JWT_SECRET=
```

## 문제 해결

### 1. 일반적인 이슈
- node_modules 캐시 삭제: `rm -rf node_modules/.cache`
- Next.js 캐시 삭제: `rm -rf .next`
- 의존성 재설치: `rm -rf node_modules && npm install`

### 2. 타입스크립트 이슈
- 타입 체크: `tsc --noEmit`
- 타입 정의 확인: `npm run dev`

### 3. 린트 이슈
- 린트 실행: `npm run lint`
- 자동 수정: `npm run lint -- --fix`

## JSON Viewer 컴포넌트

### 설치된 패키지
- `react-json-pretty`: JSON 데이터를 시각적으로 표현하기 위한 라이브러리
- `react-json-view`: 트리 형태로 JSON 데이터를 시각화하고 조작할 수 있는 라이브러리

```bash
npm install react-json-pretty react-json-view --force
```

> **참고**: React 19와의 호환성 문제로 `--force` 옵션을 사용하여 설치해야 합니다.

### 컴포넌트 구성

1. **JsonViewer** (`src/components/ui/json-viewer.tsx`)
   - 기본 JSON 뷰어 컴포넌트
   - `react-json-view` 라이브러리 사용
   - 다음 속성을 지원:
     - `data`: 표시할 JSON 데이터
     - `className`: 추가 CSS 클래스
     - `collapsed`: 초기에 접혀있는 상태 여부
     - `displayDataTypes`: 데이터 타입 표시 여부
     - `displayObjectSize`: 객체 크기 표시 여부
     - `enableClipboard`: 클립보드 복사 기능 활성화 여부
     - `indentWidth`: 들여쓰기 너비

2. **JsonViewerCustom** (`src/components/ui/json-viewer-custom.tsx`)
   - 커스텀 테마를 지원하는 JSON 뷰어 컴포넌트
   - `react-json-pretty` 라이브러리 사용
   - 지원하는 테마: 
     - `MONOKAI`
     - `DARK`
     - `LIGHT` 
     - `CUSTOM`
   - 다음 속성을 지원:
     - `data`: 표시할 JSON 데이터
     - `className`: 추가 CSS 클래스
     - `theme`: 사용할 테마 (기본값: MONOKAI)
     - `copyable`: 클립보드 복사 버튼 표시 여부
     - `onCopy`: 복사 후 호출될 콜백 함수

### 사용 예시

```tsx
// 기본 JsonViewer 사용
<JsonViewer data={apiResponse} />

// 커스텀 테마 JsonViewer 사용
<JsonViewerCustom 
  data={apiResponse} 
  theme={JsonTheme.DARK}
  copyable
  onCopy={() => console.log('JSON이 복사되었습니다')}
/>
```

### 예제 페이지

`/json-viewer-examples` 경로에서 다양한 테마와 옵션을 적용한 JSON Viewer 예제를 확인할 수 있습니다.

## API Debug 정보 기능

### 목적
- API 요청 시 사용한 REST API 원문을 디버그 정보로 표시하여 개발과 디버깅을 용이하게 함
- 사용자 인터페이스에 통합된 디버그 정보를 통해 API 호출의 세부 정보를 쉽게 확인 가능

### 구성 요소
1. **useApiRequest 훅**: API 요청을 보내고 디버그 정보를 함께 반환하는 커스텀 훅
2. **ApiDebugInfo 컴포넌트**: 디버그 정보를 표시하는 UI 컴포넌트
3. **API 엔드포인트**: 디버그 정보 제공을 위한 백엔드 API

### 설치 방법
- 추가 패키지 설치 없이 기존 프로젝트 구조에 통합됨

### 사용법
1. API 요청 시 `useApiRequest` 훅 사용
2. 응답에서 `debugInfo` 객체 추출
3. 컴포넌트 렌더링 시 `ApiDebugInfo` 컴포넌트에 디버그 정보 전달

### 관련 파일
- `src/hooks/useApiRequest.ts`: API 요청 및 디버그 정보 수집 훅
- `src/components/ApiDebugInfo.tsx`: 디버그 정보 표시 컴포넌트
- `src/app/api/db-query/debug-info/route.ts`: 디버그 정보 API 엔드포인트
- `docs/api-debug-info.md`: 기능 상세 문서

# 프로젝트 설정 정보

## 설치된 ShadCN 컴포넌트

디버그 정보 컴포넌트 시스템을 구현하기 위해 다음 ShadCN 컴포넌트를 설치했습니다:

1. **Toggle 컴포넌트**
   - 설치 명령어: `npx shadcn@latest add toggle`
   - 목적: 디버그 모드를 토글하는 버튼 구현에 사용

2. **Button 컴포넌트**
   - 설치 명령어: `npx shadcn@latest add button`
   - 목적: 디버그 정보 패널의 버튼 및 복사 기능에 사용

3. **Card 컴포넌트**
   - 설치 명령어: `npx shadcn@latest add card`
   - 목적: 디버그 정보 패널의 섹션 구분에 사용

## 디버그 정보 컴포넌트 시스템

디버그 정보 표시를 위한 컴포넌트 시스템이 `/src/components/debug` 디렉토리에 구현되었습니다.

### 주요 컴포넌트:

1. **DebugProvider**: 
   - 디버그 상태를 관리하는 컨텍스트 프로바이더

2. **DebugToggleButton**: 
   - 디버그 모드를 켜고 끄는 토글 버튼 컴포넌트

3. **DebugPanel**: 
   - 디버그 정보를 표시하는 패널 컴포넌트

4. **RequestSection**: 
   - API 요청 정보를 표시하는 컴포넌트

5. **ResponseSection**: 
   - API 응답 정보를 표시하는 컴포넌트

6. **StatusIndicator**: 
   - 성공/실패 상태를 시각적으로 표시하는 컴포넌트

### 테스트 코드:

디버그 정보 컴포넌트 시스템에 대한 테스트 코드가 `/src/test` 디렉토리에 구현되었습니다:

1. **컴포넌트 테스트**:
   - `StatusIndicator.test.tsx`: 상태 표시 컴포넌트 테스트
   - `DebugContext.test.tsx`: 디버그 컨텍스트 프로바이더 테스트

2. **훅 테스트**:
   - `useStorageState.test.tsx`: 로컬 스토리지 상태 관리 훅 테스트

3. **테스트 데이터**:
   - `debug-test-data.ts`: 테스트에 사용되는 예제 데이터

### 사용 방법:

1. 앱 최상위 레벨에 `DebugProvider`를 포함시킵니다:
   ```tsx
   <DebugProvider>
     <App />
   </DebugProvider>
   ```

2. 디버그 토글 버튼을 원하는 위치에 추가합니다:
   ```tsx
   <DebugToggleButton />
   ```

3. 디버그 패널을 추가합니다:
   ```tsx
   <DebugPanel />
   ```

4. API 호출 시 `useApiDebug` 훅을 사용합니다:
   ```tsx
   const { fetchWithDebug } = useApiDebug();
   
   // API 호출
   const response = await fetchWithDebug('/api/endpoint', {
     method: 'POST',
     headers: {
       'Content-Type': 'application/json'
     },
     body: JSON.stringify({ key: 'value' })
   });
   ```

### 테스트 실행 방법:

테스트를 실행하려면 다음 명령어를 사용합니다:

```bash
# 모든 테스트 실행
npm test

# 특정 테스트 파일 실행
npm test -- src/test/components/debug/StatusIndicator.test.tsx

# 테스트 감시 모드로 실행
npm test -- --watch
```