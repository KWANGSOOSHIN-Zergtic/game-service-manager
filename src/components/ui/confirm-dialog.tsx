"use client"

import * as React from "react"
import { LucideIcon } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { cn } from "@/lib/utils"

export interface ConfirmDialogProps {
  /**
   * 다이얼로그 열림 상태
   */
  open: boolean
  /**
   * 다이얼로그 열림 상태 변경 핸들러
   */
  onOpenChange: (open: boolean) => void
  /**
   * 다이얼로그 제목
   */
  title: string
  /**
   * 제목 스타일 클래스
   */
  titleClassName?: string
  /**
   * 다이얼로그 설명
   */
  description: React.ReactNode
  /**
   * 아이콘 컴포넌트
   */
  icon?: LucideIcon
  /**
   * 아이콘 배경 색상
   */
  iconBgColor?: string
  /**
   * 아이콘 색상
   */
  iconColor?: string
  /**
   * 취소 버튼 텍스트
   */
  cancelText?: string
  /**
   * 확인 버튼 텍스트
   */
  confirmText?: string
  /**
   * 확인 버튼 색상
   */
  confirmBgColor?: string
  /**
   * 취소 버튼 핸들러
   */
  onCancel?: () => void
  /**
   * 확인 버튼 핸들러
   */
  onConfirm?: () => void | Promise<void>
  /**
   * 로딩 상태
   */
  isLoading?: boolean
  /**
   * 로딩 중 텍스트
   */
  loadingText?: string
  /**
   * 추가 클래스
   */
  className?: string
  /**
   * 설명에 추가 문구
   */
  secondaryDescription?: React.ReactNode
}

/**
 * 범용 확인 다이얼로그 컴포넌트
 * 
 * 다양한 확인/취소 작업에 재사용할 수 있습니다.
 */
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  titleClassName,
  description,
  secondaryDescription,
  icon: Icon,
  iconBgColor = "bg-purple-100",
  iconColor = "text-purple-600",
  cancelText = "취소",
  confirmText = "확인",
  confirmBgColor = "bg-purple-600 hover:bg-purple-700 focus:ring-purple-300",
  onCancel,
  onConfirm,
  isLoading = false,
  loadingText = "처리 중",
  className,
}: ConfirmDialogProps) {
  // 취소 핸들러
  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
    onOpenChange(false);
  };

  // 확인 핸들러
  const handleConfirm = async () => {
    if (onConfirm) {
      await onConfirm();
    }
    // 참고: onConfirm 내부에서 오류가 발생할 경우 대화상자를 닫지 않도록 하기 위해
    // 여기서는 onOpenChange를 호출하지 않습니다.
    // onConfirm 함수 내에서 성공 시 직접 onOpenChange(false)를 호출해야 합니다.
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className={cn("bg-white rounded-2xl shadow-xl max-w-md mx-auto p-6 border-0", className)}>
        <div className="flex flex-col items-center justify-center">
          {/* 중앙 아이콘 */}
          {Icon && (
            <div className={cn("w-16 h-16 rounded-full flex items-center justify-center mb-4", iconBgColor)}>
              <Icon className={cn("h-8 w-8", iconColor)} />
            </div>
          )}

          <AlertDialogHeader className="space-y-2">
            <AlertDialogTitle className={cn("text-xl font-bold text-gray-900 text-center", titleClassName)}>
              {title}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600 text-center">
              {description}
              {secondaryDescription && (
                <>
                  <br />
                  <span className="mt-1 text-sm block">{secondaryDescription}</span>
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <AlertDialogFooter className="flex justify-center space-x-4 w-full mt-6">
            <AlertDialogCancel 
              className="flex-1 bg-gray-100 text-gray-700 border-0 rounded-lg font-medium py-3 hover:bg-gray-200 transition-colors" 
              onClick={handleCancel}
              disabled={isLoading}
            >
              {cancelText}
            </AlertDialogCancel>
            <AlertDialogAction
              className={cn("flex-1 text-white rounded-lg font-medium py-3 transition-all focus:ring-2 focus:outline-none", confirmBgColor)}
              onClick={handleConfirm}
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {loadingText}
                </div>
              ) : (
                confirmText
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
} 