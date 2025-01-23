# 1 Team Football Game Service Manager

## 디자인 참조
- 주 참조: [HR ERP System UI Case Study](https://www.behance.net/gallery/198326177/HR-ERP-System-UI-Case-Study)

## 제작 목표

- 게임(1 Team Football) 서비스 관리 툴 제작
- 회사의 이름은 우레 (Woore) 입니다

## 기술 스택

### 주석
- JSDoc

### Frontend
- Framework: Next.js, TypeScript
- UI Components: ShadCN UI
  - 설치된 컴포넌트: button, card, form, input, label, select, table, tabs, toast, dialog, dropdown-menu, separator, sheet, sidebar, avatar, badge, calendar, checkbox, radio-group, switch, alert, progress, skeleton
- Icons: Lucide React, Radix UI Icons
- 유틸리티: class-variance-authority, clsx, tailwind-merge

### 상태 관리
- Global State: Zustand
- Server State: @tanstack/react-query
- Form Validation: Zod, @hookform/resolvers

### 테스트
- Unit Testing: Jest + React Testing Library
- E2E Testing: Cypress

### 코드 품질
- Linting: ESLint
  - @typescript-eslint/eslint-plugin
  - @typescript-eslint/parser
- Formatting: Prettier
  - eslint-config-prettier
- Type Checking: TypeScript
  - @types/node
  - @types/react
  - @types/react-dom

### 문서화
- Code Documentation: JSDoc

## 명명 규칙
- **파일명**: 
  - 컴포넌트: PascalCase (예: UserProfile.tsx)
  - 유틸리티: camelCase (예: formatDate.ts)
  - 타입: PascalCase (예: UserTypes.ts)
  - 테스트: *.test.ts 또는 *.spec.ts
  - 파일명: kebab-case (예: user-profile.tsx)
  - DB 관련: snake_case (예: user_profile)

- **변수/함수명**:
  - 변수: camelCase
  - 상수: UPPER_SNAKE_CASE
  - 타입/인터페이스: PascalCase
  - 컴포넌트: PascalCase

## 페이지 구조 및 기능

### 2. 콘텐츠 페이지

#### 대시보드 (`/dashboard`)
- **주요 기능**
  - 서비스 현황 요약
  - 실시간 모니터링 차트
  - 주요 지표 카드 뷰
  - 최근 활동 로그
  - 알림 센터

#### 서버 관리자 (`/server`)
- **기능 구성**
  - 서버 목록 테이블
  - 서버 상태 모니터링
  - 서버 설정 관리
  - 로그 뷰어

#### 게임 관리자 (`/game`)
- **서비스 관리** (`/game/service`)
  - 서비스 설정
  - 이벤트 관리
  - 공지사항 관리
  - 패치 노트 관리

- **유저 관리** (`/game/users`)
  - 유저 목록
  - 유저 검색
  - 계정 상태 관리
  - 제재 관리

## UI/UX 구성요소

### 공통 레이아웃
- **헤더**
  - 로고
  - 메인 네비게이션
  - 프로필 드롭다운
  - 알림 센터

- **사이드바**
  - 메뉴 아이템
  - 접기/펼치기 기능
  - 활성 메뉴 하이라이트

### 데이터 표시 컴포넌트
- 테이블 컴포넌트
- 차트 컴포넌트
- 카드 컴포넌트
- 모달/다이얼로그
- 알림 토스트

## 디자인 시스템

### 색상 시스템
- **메인 컬러**
  - Primary Blue: #2D5BFF
  - Secondary Blue: #6284FF
  - Dark Blue: #1E2875
- **보조 컬러**
  - Success Green: #00C851
  - Warning Yellow: #FFB400
  - Error Red: #FF4444
- **중성 컬러**
  - Dark Gray: #2C3E50
  - Medium Gray: #95A5A6
  - Light Gray: #ECF0F1
  - White: #FFFFFF

### 타이포그래피
- **헤딩**
  - H1: Pretendard Bold, 32px
  - H2: Pretendard Bold, 24px
  - H3: Pretendard Bold, 20px
- **본문**
  - Body: Pretendard Regular, 16px
  - Small: Pretendard Regular, 14px
  - Caption: Pretendard Regular, 12px

### 그리드 시스템
- 12 컬럼 그리드
- Gutter: 24px
- Margin: 32px
- Container Max-width: 1440px

## UI 컴포넌트

### 1. 네비게이션
- **사이드바**
  - 접힘/펼침 기능
  - 아이콘 + 텍스트 메뉴
  - 활성 상태 표시
  - 서브메뉴 드롭다운

- **톱바**
  - 검색바
  - 알림 센터
  - 프로필 드롭다운
  - 퀵 액션 버튼

### 2. 대시보드 요소
- **카드 컴포넌트**
  - 정보 카드
  - 통계 카드
  - 차트 카드
  - 액션 카드

- **데이터 시각화**
  - 라인 차트
  - 바 차트
  - 파이 차트
  - 게이지 차트

### 3. 데이터 테이블
- **테이블 기능**
  - 정렬
  - 필터링
  - 페이지네이션
  - 행 선택
  - 일괄 작업

### 4. 폼 요소
- **입력 필드**
  - 텍스트 입력
  - 드롭다운
  - 날짜 선택기
  - 파일 업로드
  - 체크박스/라디오

### 5. 모달 & 다이얼로그
- **유형**
  - 정보 모달
  - 확인 다이얼로그
  - 작업 모달
  - 사이드 패널

## 인터랙션 디자인

### 1. 애니메이션
- 페이지 전환: Fade + Slide
- 모달: Scale + Fade
- 버튼: Hover Effect
- 로딩: Skeleton + Spinner

### 2. 마이크로 인터랙션
- 호버 상태
- 포커스 상태
- 로딩 상태
- 에러 상태
- 성공 상태

## 반응형 전략

### 브레이크포인트
- Desktop: 1440px +
  - 풀 레이아웃
  - 사이드바 확장
- Tablet: 768px - 1439px
  - 축소된 사이드바
  - 그리드 재배치
- Mobile: < 768px
  - 스택 레이아웃
  - 햄버거 메뉴

## 성능 최적화

### 이미지 최적화
- WebP 포맷 사용
- 레이지 로딩
- 반응형 이미지

### 코드 최적화
- 코드 스플리팅
- 트리 쉐이킹
- 번들 최적화

## 접근성

### WCAG 2.1 준수
- 키보드 네비게이션
- 스크린 리더 지원
- 고대비 모드
- 포커스 관리

## 구현 우선순위

1. 핵심 레이아웃 및 네비게이션
2. 대시보드 및 데이터 시각화
3. 데이터 테이블 및 관리 기능
4. 세부 기능 및 설정
5. 최적화 및 성능 개선

## 에러 처리
- 404 페이지
- 에러 바운더리
- 로딩 상태 표시
- 오류 메시지 디자인