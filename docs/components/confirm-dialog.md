# ConfirmDialog 컴포넌트

`ConfirmDialog`는 다양한 확인 작업에 재사용할 수 있는 범용 확인 다이얼로그 컴포넌트입니다. 이 컴포넌트는 사용자 확인이 필요한 작업(삭제, 업데이트, 실행 등)에 일관된 UI를 제공하면서도 다양한 사용 사례에 맞게 커스터마이징이 가능합니다.

## 기능

- 아이콘, 제목, 설명, 버튼 등을 커스터마이징할 수 있는 유연한 인터페이스
- 로딩 상태 및 로딩 텍스트 지원
- 확인 및 취소 핸들러 함수 지원
- 다양한 색상 테마 설정 가능
- 모바일 및 데스크톱 화면에 적합한 반응형 디자인

## 설치

ConfirmDialog 컴포넌트는 ShadCN의 AlertDialog를 기반으로 하므로, 먼저 AlertDialog가 설치되어 있어야 합니다.

```bash
# AlertDialog 설치
npx shadcn@latest add alert-dialog

# ConfirmDialog 파일 복사
# src/components/ui/confirm-dialog.tsx
```

## 사용 방법

### 기본 사용법

```tsx
import { useState } from 'react';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { AlertCircle } from 'lucide-react';

function MyComponent() {
  const [open, setOpen] = useState(false);
  
  return (
    <>
      <button onClick={() => setOpen(true)}>
        삭제하기
      </button>
      
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title="삭제 확인"
        description="정말로 이 항목을 삭제하시겠습니까?"
        secondaryDescription="이 작업은 되돌릴 수 없습니다."
        icon={AlertCircle}
        cancelText="취소"
        confirmText="삭제"
        onCancel={() => console.log('취소됨')}
        onConfirm={() => {
          console.log('확인됨');
          setOpen(false);
        }}
      />
    </>
  );
}
```

### 로딩 상태 사용

```tsx
import { useState } from 'react';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Trash } from 'lucide-react';

function DeleteItem() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const handleConfirm = async () => {
    setLoading(true);
    try {
      // API 호출 등 비동기 작업 수행
      await new Promise(resolve => setTimeout(resolve, 1500));
      console.log('삭제 완료');
      setOpen(false);
    } catch (error) {
      console.error('오류 발생:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <ConfirmDialog
      open={open}
      onOpenChange={setOpen}
      title="항목 삭제"
      description="이 항목을 삭제하시겠습니까?"
      secondaryDescription="삭제된 항목은 복구할 수 없습니다."
      icon={Trash}
      iconBgColor="bg-red-100"
      iconColor="text-red-600"
      confirmBgColor="bg-red-600 hover:bg-red-700 focus:ring-red-300"
      cancelText="취소"
      confirmText="삭제"
      loadingText="삭제 중..."
      isLoading={loading}
      onCancel={() => setOpen(false)}
      onConfirm={handleConfirm}
    />
  );
}
```

## Props

| 속성 | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `open` | `boolean` | 필수 | 다이얼로그 열림 상태 |
| `onOpenChange` | `(open: boolean) => void` | 필수 | 다이얼로그 열림 상태 변경 핸들러 |
| `title` | `string` | 필수 | 다이얼로그 제목 |
| `description` | `React.ReactNode` | 필수 | 다이얼로그 설명 |
| `secondaryDescription` | `React.ReactNode` | - | 부가 설명 (작은 텍스트로 표시) |
| `icon` | `LucideIcon` | - | 다이얼로그 상단에 표시할 아이콘 컴포넌트 |
| `iconBgColor` | `string` | `'bg-purple-100'` | 아이콘 배경 색상 (Tailwind 클래스) |
| `iconColor` | `string` | `'text-purple-600'` | 아이콘 색상 (Tailwind 클래스) |
| `cancelText` | `string` | `'취소'` | 취소 버튼 텍스트 |
| `confirmText` | `string` | `'확인'` | 확인 버튼 텍스트 |
| `confirmBgColor` | `string` | `'bg-purple-600 hover:bg-purple-700 focus:ring-purple-300'` | 확인 버튼 색상 (Tailwind 클래스) |
| `onCancel` | `() => void` | - | 취소 버튼 클릭 핸들러 |
| `onConfirm` | `() => void \| Promise<void>` | - | 확인 버튼 클릭 핸들러 |
| `isLoading` | `boolean` | `false` | 로딩 상태 표시 여부 |
| `loadingText` | `string` | `'처리 중'` | 로딩 중 표시할 텍스트 |
| `className` | `string` | - | 추가 CSS 클래스 |

## 사용 예제

### 삭제 확인 다이얼로그

```tsx
<ConfirmDialog
  open={showDeleteDialog}
  onOpenChange={setShowDeleteDialog}
  title="항목 삭제"
  description="이 항목을 삭제하시겠습니까?"
  secondaryDescription="이 작업은 되돌릴 수 없습니다."
  icon={AlertCircle}
  iconBgColor="bg-red-100"
  iconColor="text-red-600"
  cancelText="취소"
  confirmText="삭제"
  confirmBgColor="bg-red-600 hover:bg-red-700 focus:ring-red-300"
  onCancel={handleCancelDelete}
  onConfirm={handleConfirmDelete}
  isLoading={isDeleting}
  loadingText="삭제 중"
/>
```

### 발행 확인 다이얼로그

```tsx
<ConfirmDialog
  open={showPublishDialog}
  onOpenChange={setShowPublishDialog}
  title="발행 확인"
  description="이 게시물을 발행하시겠습니까?"
  secondaryDescription="발행 후에는 모든 사용자에게 공개됩니다."
  icon={Send}
  iconBgColor="bg-green-100"
  iconColor="text-green-600"
  cancelText="취소"
  confirmText="발행하기"
  confirmBgColor="bg-green-600 hover:bg-green-700 focus:ring-green-300"
  onCancel={handleCancelPublish}
  onConfirm={handleConfirmPublish}
  isLoading={isPublishing}
  loadingText="발행 중"
/>
```

## 주의사항

- `onConfirm` 함수 내에서 오류가 발생할 경우 자동으로 다이얼로그를 닫지 않습니다. 성공 시에는 함수 내에서 직접 `onOpenChange(false)`를 호출해야 합니다.
- 아이콘 컴포넌트는 Lucide React의 아이콘을 사용합니다. 