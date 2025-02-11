"use client"

import { useRouter } from "next/navigation"
import { toast } from "react-hot-toast"

interface LoginData {
  email: string
  password: string
  autoLogin?: boolean  // 자동 로그인 옵션 추가
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
      
      // 자동 로그인 설정 저장
      if (loginData.autoLogin) {
        localStorage.setItem('autoLogin', 'true')
        // 자동 로그인용 인증 정보 저장
        localStorage.setItem('autoLoginEmail', loginData.email)
        localStorage.setItem('autoLoginPassword', btoa(loginData.password)) // 간단한 인코딩
      }
      
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
      
      // 자동 로그인 정보 제거
      localStorage.removeItem('autoLogin')
      localStorage.removeItem('autoLoginEmail')
      localStorage.removeItem('autoLoginPassword')

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

  const autoLogin = async (): Promise<boolean> => {
    if (typeof window === 'undefined') return false

    const isAutoLogin = localStorage.getItem('autoLogin') === 'true'
    if (!isAutoLogin) return false

    const email = localStorage.getItem('autoLoginEmail')
    const encodedPassword = localStorage.getItem('autoLoginPassword')
    
    if (!email || !encodedPassword) return false

    try {
      const password = atob(encodedPassword) // 디코딩
      const success = await login({ email, password, autoLogin: true })
      return success
    } catch (error) {
      console.error('자동 로그인 실패:', error)
      return false
    }
  }

  return {
    login,
    logout,
    checkAuth,
    autoLogin,
  }
} 