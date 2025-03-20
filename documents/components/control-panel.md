# 컨트롤 패널 컴포넌트

컨트롤 패널 컴포넌트는 게임 서비스 관리자 도구에서 데이터를 관리하기 위한 통일된 인터페이스를 제공합니다. 이 문서에서는 게임 서비스 관리자에서 사용되는 다양한 컨트롤 패널에 대해 설명합니다.

## 목차

1. [개요](#개요)
2. [컨트롤 패널 종류](#컨트롤-패널-종류)
   - [통화(CURRENCY) 컨트롤 패널](#통화-컨트롤-패널)
   - [PUB 좌석 상태 컨트롤 패널](#pub-좌석-상태-컨트롤-패널)
   - [BALLER 컨트롤 패널](#baller-컨트롤-패널)
3. [컨트롤 패널 사용 방법](#컨트롤-패널-사용-방법)
4. [모달 컴포넌트](#모달-컴포넌트)
5. [개발자 가이드](#개발자-가이드)

## 개요

컨트롤 패널은 데이터 테이블과 함께 사용되며, 데이터의 생성(CREATE), 수정(UPDATE), 삭제(DELETE) 등의 기본 작업을 수행할 수 있는 통일된 인터페이스를 제공합니다. 또한, 각 데이터 유형에 따라 특화된 관리 기능을 포함할 수 있습니다.

### 주요 기능

- **CREATE**: 새 데이터 항목 생성
- **UPDATE**: 선택한 데이터 항목 수정
- **DELETE**: 선택한 데이터 항목 삭제
- **특화 기능**: 각 데이터 유형별 특화된 관리 기능

## 컨트롤 패널 종류

### 통화 컨트롤 패널

통화(CURRENCY) 컨트롤 패널은 게임 내 화폐 아이템을 관리하기 위한 인터페이스를 제공합니다.

**위치**: `src/components/control-panels/currency-control-panel.tsx`

**기능**:
- 화폐 아이템 생성
- 화폐 아이템 수정
- 화폐 아이템 삭제

**스크린샷**:

```
+-------------------+   +-------------------+   +-------------------+
|      CREATE       |   |      UPDATE       |   |      DELETE       |
+-------------------+   +-------------------+   +-------------------+
```

### PUB 좌석 상태 컨트롤 패널

PUB 좌석 상태 컨트롤 패널은 게임 내 PUB의 좌석 상태, 대화 상태, 모집 상태를 관리하기 위한 인터페이스를 제공합니다.

**위치**: `src/components/control-panels/pub-seat-control-panel.tsx`

**기능**:
- 좌석 상태 생성
- 좌석 상태 수정
- 좌석 상태 삭제
- 좌석 상태 관리 (좌석별 상태 변경)
- 대화 상태 관리 (채팅 활성화/비활성화)
- 모집 상태 관리 (모집 활성화/비활성화)

**스크린샷**:

```
+----------+   +----------+   +----------+   +---------------+   +---------------+   +---------------+
|  CREATE  |   |  UPDATE  |   |  DELETE  |   |  좌석 관리     |   |  대화 관리     |   |  모집 관리     |
+----------+   +----------+   +----------+   +---------------+   +---------------+   +---------------+
```

### BALLER 컨트롤 패널

BALLER 컨트롤 패널은 게임 내 BALLER 캐릭터를 관리하기 위한 인터페이스를 제공합니다.

**위치**: `src/components/control-panels/baller-control-panel.tsx`

**기능**:
- BALLER 생성
- BALLER 수정
- BALLER 삭제
- BALLER 레벨 업
- BALLER 상태 변경

**스크린샷**:

```
+----------+   +----------+   +----------+   +---------------+   +---------------+
|  CREATE  |   |  UPDATE  |   |  DELETE  |   |   레벨 업      |   |  상태 변경     |
+----------+   +----------+   +----------+   +---------------+   +---------------+
```

## 컨트롤 패널 사용 방법

1. **데이터 선택**: 테이블에서 관리할 데이터를 선택합니다(복수 선택 가능).
2. **작업 선택**: 컨트롤 패널에서 수행할 작업 버튼을 클릭합니다.
3. **모달 작업**: CREATE나 UPDATE 작업의 경우 모달 창이 열리고, 해당 모달에서 데이터를 입력/수정합니다.
4. **특화 기능**: 특화 기능 버튼을 클릭하면 해당 기능을 위한 모달이나 작업이 실행됩니다.

## 모달 컴포넌트

컨트롤 패널과 함께 사용되는 주요 모달 컴포넌트는 다음과 같습니다:

1. **CreateCurrencyModal**: 화폐 아이템 생성 모달
   - 위치: `src/components/control-panels/create-currency-modal.tsx`

2. **CreatePubSeatModal**: PUB 좌석 상태 생성 모달
   - 위치: `src/components/control-panels/create-pub-seat-modal.tsx`
   - 기능: 좌석 수 조정, 좌석 상태 설정, 대화/모집 상태 설정

3. **CreateBallerModal**: BALLER 생성 모달
   - 위치: `src/components/control-panels/create-baller-modal.tsx`

## 개발자 가이드

### 새 컨트롤 패널 추가하기

새로운 컨트롤 패널을 추가하려면 다음 단계를 따르세요:

1. `src/components/control-panels/` 디렉토리에 새 컨트롤 패널 컴포넌트 파일 생성
2. 기존 컨트롤 패널 구조를 참고하여 기본 CRUD 기능 구현
3. 필요한 특화 기능 추가
4. 연관된 모달 컴포넌트 생성
5. 데이터 처리를 위한 API 엔드포인트 구현
6. 탭 컴포넌트에서 컨트롤 패널 연결

### 컨트롤 패널 Props

컨트롤 패널 컴포넌트는 다음과 같은 공통 Props를 가집니다:

```typescript
interface ControlPanelProps {
  selectedItems: IUITableData[]; // 선택된 데이터 항목
  onCreateItem: () => void;      // 생성 핸들러
  onUpdateItem: () => void;      // 수정 핸들러
  onDeleteItem: () => void;      // 삭제 핸들러
  // 특화 기능 핸들러
  [key: string]: any;
}
```

### 모달 컴포넌트 Props

모달 컴포넌트는 다음과 같은 공통 Props를 가집니다:

```typescript
interface ModalProps {
  open: boolean;                 // 모달 열림 상태
  onOpenChange: (open: boolean) => void; // 모달 상태 변경 핸들러
  onSubmit: (data: any) => void; // 제출 핸들러
  isSubmitting?: boolean;        // 제출 중 상태
  // 기타 필요한 데이터
  [key: string]: any;
}
```

### 예제 코드

**컨트롤 패널 사용 예시**:

```tsx
<PubSeatControlPanel 
  selectedItems={selectedItems}
  onCreateItem={handleCreatePubSeat}
  onUpdateItem={handleUpdatePubSeat}
  onDeleteItem={handleDeletePubSeat}
  onManageSeatStatus={handleManageSeatStatus}
  onManageTalkStatus={handleManageTalkStatus}
  onManageRecruitStatus={handleManageRecruitStatus}
/>
```

**모달 사용 예시**:

```tsx
<CreatePubSeatModal 
  open={isCreateModalOpen}
  onOpenChange={setIsCreateModalOpen}
  onSubmit={handleCreateSubmit}
  isSubmitting={isSubmitting}
/>
```
