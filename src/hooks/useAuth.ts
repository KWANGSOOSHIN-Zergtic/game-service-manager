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
      // 토큰이 없으면 초기화 정보 조회 불가
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('인증 토큰이 없습니다.')
      }

      console.log('초기화 정보 조회 시작')

      // DB Collection 정보 가져오기
      console.log('DB Collection 정보 요청 중...')
      const collectionResponse = await fetch('/api/db-information', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      })

      console.log('DB Collection 응답 상태:', collectionResponse.status)
      
      let collectionData
      try {
        const text = await collectionResponse.text()
        console.log('DB Collection 응답 데이터:', text)
        collectionData = JSON.parse(text)
      } catch (parseError) {
        console.error('DB Collection 응답 파싱 실패:', parseError)
        throw new Error('DB Collection 응답 형식이 올바르지 않습니다.')
      }

      if (!collectionResponse.ok) {
        throw new Error(collectionData.message || 'DB Collection 정보 조회에 실패했습니다.')
      }

      // DB 리스트 정보 가져오기
      console.log('DB 리스트 정보 요청 중...')
      const listResponse = await fetch('/api/db-tables', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      })

      console.log('DB 리스트 응답 상태:', listResponse.status)
      
      let listData
      try {
        const text = await listResponse.text()
        console.log('DB 리스트 응답 데이터:', text)
        listData = JSON.parse(text)
      } catch (parseError) {
        console.error('DB 리스트 응답 파싱 실패:', parseError)
        throw new Error('DB 리스트 응답 형식이 올바르지 않습니다.')
      }

      if (!listResponse.ok) {
        throw new Error(listData.message || 'DB 리스트 정보 조회에 실패했습니다.')
      }

      // 응답 데이터 유효성 검사
      console.log('응답 데이터 검증 중...')
      console.log('Collection 데이터:', collectionData)
      console.log('리스트 데이터:', listData)

      if (!collectionData.success) {
        throw new Error(collectionData.message || 'DB Collection 데이터 조회에 실패했습니다.')
      }

      if (!listData.success) {
        throw new Error(listData.message || 'DB 리스트 데이터 조회에 실패했습니다.')
      }

      if (!Array.isArray(collectionData.tables)) {
        console.error('Collection 데이터 형식 오류:', collectionData)
        throw new Error('DB Collection 데이터가 배열 형식이 아닙니다.')
      }

      if (!Array.isArray(listData.tables)) {
        console.error('리스트 데이터 형식 오류:', listData)
        throw new Error('DB 리스트 데이터가 배열 형식이 아닙니다.')
      }

      console.log('초기화 정보 조회 완료')
      return {
        dbCollection: collectionData.tables,
        dbList: listData.tables
      }
    } catch (error) {
      console.error('초기화 정보 조회 실패:', error)
      if (error instanceof Error) {
        console.error('에러 메시지:', error.message)
        console.error('에러 스택:', error.stack)
      }
      toast.error(error instanceof Error ? error.message : '초기화 정보 조회에 실패했습니다.')
      return null
    }
  }

  const login = async (loginData: LoginData) => {
    try {
      console.log('로그인 시도 중...')
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

      console.log('로그인 응답 상태:', response.status)
      
      let data
      try {
        const text = await response.text()
        console.log('로그인 응답 데이터:', text)
        data = JSON.parse(text)
      } catch (parseError) {
        console.error('로그인 응답 파싱 실패:', parseError)
        throw new Error('로그인 응답 형식이 올바르지 않습니다.')
      }

      if (!response.ok || !data.success) {
        throw new Error(data.message || '로그인에 실패했습니다.')
      }

      console.log('로그인 성공, 정보 저장 중...')

      // 로그인 성공 시 토큰과 관리자 정보 저장
      localStorage.setItem('token', data.token)
      localStorage.setItem('admin', JSON.stringify(data.admin))
      sessionStorage.setItem('isLoggedIn', 'true')
      
      // 관리자 타입에 따른 추가 정보 저장
      if (data.admin.type) {
        sessionStorage.setItem('adminType', data.admin.type)
      }

      // 자동 로그인 설정 저장
      if (loginData.autoLogin) {
        localStorage.setItem('autoLogin', 'true')
        localStorage.setItem('autoLoginEmail', loginData.email)
        localStorage.setItem('autoLoginPassword', btoa(loginData.password))
      }

      // 초기화 정보 가져오기 (토큰 저장 후)
      console.log('초기화 정보 조회 시작...')
      const initInfo = await getInitializationInfo()
      
      // 초기화 정보 저장
      if (initInfo) {
        console.log('초기화 정보 저장:', initInfo)
        sessionStorage.setItem('dbInitInfo', JSON.stringify(initInfo))
      } else {
        console.warn('초기화 정보가 없습니다.')
      }

      toast.success('로그인에 성공했습니다!')
      return true
    } catch (error) {
      console.error('로그인 에러:', error)
      if (error instanceof Error) {
        console.error('에러 메시지:', error.message)
        console.error('에러 스택:', error.stack)
      }
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