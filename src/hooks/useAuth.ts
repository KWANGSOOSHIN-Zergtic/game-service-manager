"use client"

import { useRouter } from "next/navigation"
import { toast } from "react-hot-toast"

interface LoginData {
  email: string
  password: string
}

interface AdminResponse {
  success: boolean
  message: string
  token: string
  admin: {
    index: number
    id: string
    name: string
    type: string
    description: string
  }
}

export function useAuth() {
  const router = useRouter()

  const login = async (loginData: LoginData) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: loginData.email,
          password: loginData.password,
        }),
      })

      const data: AdminResponse = await response.json()

      if (!response.ok) {
        toast.error(data.message || '로그인에 실패했습니다.')
        return false
      }

      // 로그인 성공 시 토큰과 관리자 정보 저장
      localStorage.setItem('token', data.token)
      localStorage.setItem('admin', JSON.stringify(data.admin))
      sessionStorage.setItem('isLoggedIn', 'true')
      
      // 관리자 타입에 따른 추가 정보 저장
      if (data.admin.type) {
        sessionStorage.setItem('adminType', data.admin.type)
      }

      toast.success('로그인에 성공했습니다!')
      return true
    } catch (error) {
      console.error('로그인 에러:', error)
      toast.error('로그인 처리 중 오류가 발생했습니다.')
      return false
    }
  }

  const logout = () => {
    try {
      // 저장된 인증 정보 제거
      localStorage.removeItem('token')
      localStorage.removeItem('admin')
      sessionStorage.removeItem('isLoggedIn')
      sessionStorage.removeItem('adminType')

      // 로그인 페이지로 리다이렉트
      router.push('/login')
      toast.success('로그아웃되었습니다.')
    } catch (error) {
      console.error('로그아웃 에러:', error)
      toast.error('로그아웃 처리 중 오류가 발생했습니다.')
    }
  }

  const checkAuth = (): boolean => {
    if (typeof window === 'undefined') return false
    
    const isLoggedIn = sessionStorage.getItem('isLoggedIn') === 'true'
    const token = localStorage.getItem('token')
    
    return isLoggedIn && !!token
  }

  return {
    login,
    logout,
    checkAuth,
  }
} 