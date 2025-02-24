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
  initInfo?: {
    dbList?: Array<{
      index: number
      name: string
      description: string
    }>
    dbCollection?: Array<{
      index: number
      name: string
      type: string
      host: string
      port: number
      data_base: string
    }>
  }
}

export function useAuth() {
  const router = useRouter()

  const getInitializationInfo = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('인증 토큰이 없습니다.')
      }

      // DB Collection 정보 가져오기
      const collectionResponse = await fetch('/api/db-information', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      })

      let collectionData
      try {
        collectionData = await collectionResponse.json()
      } catch (parseError) {
        throw new Error('DB Collection 응답 형식이 올바르지 않습니다.')
      }

      if (!collectionResponse.ok || !collectionData.success) {
        throw new Error(collectionData.message || 'DB Collection 정보 조회에 실패했습니다.')
      }

      // DB 리스트 정보 가져오기
      const listResponse = await fetch('/api/db-tables', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      })

      let listData
      try {
        listData = await listResponse.json()
      } catch (parseError) {
        throw new Error('DB 리스트 응답 형식이 올바르지 않습니다.')
      }

      if (!listResponse.ok || !listData.success) {
        throw new Error(listData.message || 'DB 리스트 정보 조회에 실패했습니다.')
      }

      return {
        dbCollection: collectionData.tables,
        dbList: listData.tables
      }
    } catch (error) {
      console.error('초기화 정보 조회 실패:', error)
      throw error
    }
  }

  const login = async (loginData: LoginData) => {
    try {
      // 1. 로그인 API 호출
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

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.message || '로그인에 실패했습니다.')
      }

      // 2. 토큰 저장 및 초기화 정보 조회
      localStorage.setItem('token', data.token)
      
      try {
        const initInfo = await getInitializationInfo()
        
        // 3. 모든 정보 저장
        localStorage.setItem('admin', JSON.stringify(data.admin))
        sessionStorage.setItem('isLoggedIn', 'true')
        sessionStorage.setItem('dbInitInfo', JSON.stringify(initInfo))
        
        if (data.admin.type) {
          sessionStorage.setItem('adminType', data.admin.type)
        }

        // 4. 자동 로그인 설정
        if (loginData.autoLogin) {
          localStorage.setItem('autoLogin', 'true')
          localStorage.setItem('autoLoginEmail', loginData.email)
          localStorage.setItem('autoLoginPassword', btoa(loginData.password))
        }

        toast.success('로그인에 성공했습니다!')
        return true
      } catch (error) {
        // 초기화 정보 조회 실패 시 모든 저장된 정보 제거
        localStorage.removeItem('token')
        localStorage.removeItem('admin')
        sessionStorage.removeItem('isLoggedIn')
        sessionStorage.removeItem('adminType')
        sessionStorage.removeItem('dbInitInfo')
        throw error
      }
    } catch (error) {
      console.error('로그인 에러:', error)
      toast.error(error instanceof Error ? error.message : '로그인 처리 중 오류가 발생했습니다.')
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
      sessionStorage.removeItem('dbInitInfo')  // 초기화 정보 제거
      
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