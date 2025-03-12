"use client"

import { useRouter } from "next/navigation"
import { toast } from "react-hot-toast"

interface LoginData {
  email: string
  password: string
  autoLogin?: boolean  // 자동 로그인 옵션 추가
}

// DB 정보 타입 정의
interface DBInfo {
  index: number
  name: string
  type?: string
  host?: string
  port?: number
  data_base?: string
  description?: string
}

// 초기화 정보 타입 정의
interface InitializationInfo {
  dbCollection: DBInfo[]
  dbList: DBInfo[]
}

export function useAuth() {
  const router = useRouter()

  const getInitializationInfo = async (retries = 2): Promise<InitializationInfo> => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('인증 토큰이 없습니다.')
      }

      console.log('초기화 정보 조회 시작 - 토큰:', token.substring(0, 10) + '...')
      
      // DB Collection 정보 가져오기 - 먼저 요청의 성공 여부 확인
      const collectionResponse = await fetch('/api/db-information', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        cache: 'no-store'  // 캐시 비활성화
      })

      // 요청 실패 시 로그 확인
      if (!collectionResponse.ok) {
        console.error('DB Collection 요청 실패:', {
          status: collectionResponse.status,
          statusText: collectionResponse.statusText
        })
      }

      let collectionData
      try {
        collectionData = await collectionResponse.json()
      } catch (error) {
        console.error('DB Collection 응답 파싱 실패:', error)
        throw new Error('DB Collection 응답 형식이 올바르지 않습니다.')
      }

      if (!collectionResponse.ok || !collectionData.success) {
        if (retries > 0 && collectionResponse.status === 401) {
          // 인증 오류면 재시도 - 지연 시간 늘림
          console.log('인증 오류로 DB Collection 정보 조회 재시도...')
          await new Promise(resolve => setTimeout(resolve, 1000))  // 1초 대기로 증가
          return getInitializationInfo(retries - 1)
        }
        throw new Error(collectionData.message || 'DB Collection 정보 조회에 실패했습니다.')
      }

      // DB 리스트 정보 가져오기
      const listResponse = await fetch('/api/db-tables', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        cache: 'no-store'  // 캐시 비활성화
      })

      // 요청 실패 시 로그 확인
      if (!listResponse.ok) {
        console.error('DB 리스트 요청 실패:', {
          status: listResponse.status,
          statusText: listResponse.statusText
        })
      }

      let listData
      try {
        listData = await listResponse.json()
      } catch (error) {
        console.error('DB 리스트 응답 파싱 실패:', error)
        throw new Error('DB 리스트 응답 형식이 올바르지 않습니다.')
      }

      if (!listResponse.ok || !listData.success) {
        if (retries > 0 && listResponse.status === 401) {
          // 인증 오류면 재시도 - 지연 시간 늘림
          console.log('인증 오류로 DB 리스트 정보 조회 재시도...')
          await new Promise(resolve => setTimeout(resolve, 1000))  // 1초 대기로 증가
          return getInitializationInfo(retries - 1)
        }
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

  const login = async (loginData: LoginData): Promise<boolean> => {
    try {
      // 이전에 저장된 인증 정보 제거 (로그인 전 클린 상태로 시작)
      localStorage.removeItem('token')
      localStorage.removeItem('admin')
      sessionStorage.removeItem('isLoggedIn')
      sessionStorage.removeItem('adminType')
      sessionStorage.removeItem('dbInitInfo')

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
        cache: 'no-store'  // 캐시 비활성화
      })

      // 응답 파싱
      let data;
      try {
        data = await response.json();
      } catch {
        throw new Error('서버 응답을 처리할 수 없습니다.');
      }

      if (!response.ok || !data.success) {
        throw new Error(data.message || data.error || '로그인에 실패했습니다.')
      }

      // 2. 토큰 저장 - 여기서 먼저 localStorage와 sessionStorage에 필요한 정보 설정
      localStorage.setItem('token', data.token)
      localStorage.setItem('admin', JSON.stringify(data.admin))
      sessionStorage.setItem('isLoggedIn', 'true')
      
      if (data.admin.type) {
        sessionStorage.setItem('adminType', data.admin.type)
      }
      
      // 지연 시간을 1초로 증가 - 토큰이 제대로 저장되고 브라우저에 반영될 시간 확보
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      try {
        console.log('초기화 정보 조회 시작...')
        const initInfo = await getInitializationInfo(3) // 재시도 횟수 3회로 증가
        console.log('초기화 정보 조회 완료')
        
        // 초기화 정보를 sessionStorage에 저장
        sessionStorage.setItem('dbInitInfo', JSON.stringify(initInfo))
        
        // 자동 로그인 설정
        if (loginData.autoLogin) {
          localStorage.setItem('autoLogin', 'true')
          localStorage.setItem('autoLoginEmail', loginData.email)
          localStorage.setItem('autoLoginPassword', btoa(loginData.password))
        }

        return true
      } catch (error) {
        console.error('초기화 정보 조회 실패:', error)
        
        // 초기화 정보 조회 실패의 경우에도 로그인은 유지하고 차후에 다시 시도하도록 변경
        // 실패 시에도 로그인 상태 유지, 오류 메시지만 표시
        toast.error('초기화 정보를 불러오는데 실패했습니다. 일부 기능이 제한될 수 있습니다.')
        
        // 로그인은 성공으로 간주
        return true
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
      router.push('/')
      toast.error('로그아웃 되었습니다.')
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

    // 이미 로그인 되어 있는지 확인
    const isLoggedIn = sessionStorage.getItem('isLoggedIn') === 'true'
    const token = localStorage.getItem('token')
    
    // 이미 로그인되어 있다면 추가 작업 없이 성공 반환
    if (isLoggedIn && !!token) {
      return true
    }

    // 자동 로그인 설정 확인
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