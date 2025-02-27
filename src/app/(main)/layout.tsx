"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { useAuth } from "@/hooks/useAuth"

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { checkAuth } = useAuth()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        setIsLoading(true)
        // 인증 상태 확인
        const isAuthenticated = checkAuth()
        console.log('인증 상태 확인:', isAuthenticated)
        
        if (!isAuthenticated) {
          console.log('인증되지 않음, 로그인 페이지로 이동...')
          router.push('/')
          return
        }
        
        // 인증된 상태면 원래 컨텐츠 표시
        setIsLoading(false)
      } catch (error) {
        console.error('인증 확인 중 오류:', error)
        // 오류 발생 시 로그인 페이지로 이동
        router.push('/')
      }
    }

    verifyAuth()
  }, [checkAuth, router])

  // 로딩 중이거나 인증 확인 중이면 로딩 UI 표시
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-purple-500 border-t-transparent mx-auto"></div>
          <p className="text-gray-600">인증 확인 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 overflow-auto bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  )
} 