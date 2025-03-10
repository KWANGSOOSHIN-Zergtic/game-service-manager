# API 디버그 정보 컴포넌트 수동 테스트 지침

이 문서는 `ApiDebugInfo` 컴포넌트에 대한 수동 테스트 절차를 설명합니다. 자동화된 테스트 실행에 문제가 있어, 수동 테스트를 통해 기능을 확인할 수 있습니다.

## 테스트 환경 준비

1. 어플리케이션 실행: `npm run dev`
2. 브라우저에서 `http://localhost:3000/users` 페이지 접속

## 테스트 항목

### 1. 기본 렌더링 확인

- 페이지 로드 시 사용자 검색 기능을 사용하기 전에는 디버그 정보가 표시되지 않아야 함
- 검색 결과가 없는 경우에도 API 요청 정보가 표시되어야 함

### 2. 접기/펼치기 기능 테스트

- 초기 렌더링 시 디버그 정보는 접힌 상태여야 함
- 타이틀 클릭 시 디버그 정보가 펼쳐져야 함
- 타이틀 다시 클릭 시 디버그 정보가 접혀야 함

### 3. 메소드별 색상 확인

- GET 요청 시 파란색 배경의 요청 메소드 표시 확인
- POST/PUT/DELETE 등 다른 메소드 요청 시 해당 색상 표시 확인

### 4. 민감한 정보 마스킹 확인

- Authorization 헤더와 같은 민감한 정보는 마스킹 처리되어야 함
- 마스킹된 정보 옆의 눈 아이콘 클릭 시 원본 정보 표시 확인
- 다시 클릭 시 마스킹 복원 확인

### 5. 커스텀 타이틀 표시 확인

- 타이틀이 "사용자 검색 API 요청 정보"로 표시되는지 확인

## 테스트 시나리오

1. 사용자 페이지에서 DB 선택
2. 검색어 입력하고 검색 버튼 클릭
3. 검색 결과와 함께 API 디버그 정보 표시 확인
4. 접기/펼치기 기능 테스트
5. 민감한 정보 마스킹 및 표시 기능 테스트

## 예상 결과

- 디버그 정보가 접힌 상태로 초기 렌더링
- 타이틀 클릭 시 정보가 펼쳐짐
- 요청 메소드에 따라 색상이 다르게 표시
- 민감한 헤더는 마스킹 처리됨
- 마스킹 토글 버튼으로 민감한 정보 표시/숨김 가능
- 커스텀 타이틀 "사용자 검색 API 요청 정보" 표시

## 버그 또는 개선점 발견 시

버그나 개선이 필요한 부분 발견 시 다음 정보를 기록:

1. 발견된 문제점 설명
2. 재현 경로
3. 예상되는 동작과 실제 동작의 차이
4. 스크린샷 또는 동영상 (가능한 경우) 