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