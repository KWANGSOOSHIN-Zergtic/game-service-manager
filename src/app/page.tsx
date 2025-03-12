"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Mail, Lock, LogIn, LockKeyhole } from "lucide-react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { useAuth } from "@/hooks/useAuth"
import { toast } from "react-hot-toast"

export default function LoginPage() {
  const router = useRouter()
  const { login, autoLogin } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [isAutoLoginAttempted, setIsAutoLoginAttempted] = useState(false)
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
    autoLogin: false
  })

  // 자동 로그인 시도
  useEffect(() => {
    const attemptAutoLogin = async () => {
      if (isAutoLoginAttempted) return; // 이미 시도했다면 중복 실행 방지
      
      setIsAutoLoginAttempted(true);
      setIsLoading(true);
      
      try {
        console.log('자동 로그인 시도 중...');
        const success = await autoLogin();
        
        if (success) {
          console.log('자동 로그인 성공, 대시보드로 이동합니다.');
          router.push('/dashboard');
        } else {
          console.log('자동 로그인 실패, 수동 로그인이 필요합니다.');
          setIsLoading(false);
        }
      } catch (error) {
        console.error('자동 로그인 처리 중 오류:', error);
        setIsLoading(false);
      }
    };

    // 페이지 로드 시 자동 로그인 시도
    attemptAutoLogin();
  }, [autoLogin, router, isAutoLoginAttempted]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // 이미 로딩 중인 경우 중복 실행 방지
    if (isLoading) return;
    
    setIsLoading(true)
    
    try {
      console.log('로그인 시도 중...', { email: loginData.email, autoLogin: loginData.autoLogin })
      const success = await login({
        email: loginData.email,
        password: loginData.password,
        autoLogin: loginData.autoLogin
      })
      
      console.log('로그인 결과:', success)
      if (success) {
        toast.success('로그인에 성공했습니다');
        router.push("/dashboard")
      }
    } catch (error) {
      console.error("로그인 처리 중 오류:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-[800px] flex rounded-xl bg-white shadow-lg overflow-hidden">
        {/* Left side - Purple section with logo and 1Team Football */}
        <div className="w-1/2 bg-purple-100 p-8 flex flex-col items-center justify-center">
          <div className="flex flex-col items-center justify-center space-y-6">
            <div className="relative">
              <Image 
                src="/resource/ci/ci_1tf.png" 
                alt="1Team Football Logo" 
                width={180}
                height={180}
                className="object-contain relative z-10"
                priority
                style={{
                  filter: 'drop-shadow(2px 2px 2px rgba(0, 0, 0, 0.3))'
                }}
              />
            </div>
            <div>
              <div className="text-lg font-semibold tracking-wide text-purple-500/80 uppercase text-center">
                Game Service Manager
              </div>
              <div className="mt-1 h-1 w-[120%] -ml-[10%] mx-auto bg-gradient-to-r from-transparent via-purple-500 to-transparent rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Right side - Login form */}
        <div className="w-1/2 p-8">
          <div className="flex flex-col items-center space-y-8">
            <Image 
              src="/resource/ci/ci_woore.webp" 
              alt="Woore Logo" 
              width={80}
              height={30}
              className="h-8"
              priority
            />

            <form onSubmit={handleSubmit} className="w-full space-y-4">
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="E-mail ( id@woore.co.kr )"
                  value={loginData.email}
                  onChange={(e) => setLoginData({ ...loginData, email: e.target.value.toLowerCase() })}
                  className="w-full pl-10"
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="password"
                  placeholder="Password"
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                  className="w-full pl-10"
                  required
                  disabled={isLoading}
                />
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="mr-2"
                    checked={loginData.autoLogin}
                    onChange={(e) => setLoginData({ ...loginData, autoLogin: e.target.checked })}
                    disabled={isLoading}
                  />
                  Auto sign in
                </label>
                <span 
                  className="text-purple-600 hover:underline cursor-pointer"
                  onClick={() => toast.error("관리자에게 문의하세요.")}
                >
                  Forgot password?
                </span>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-purple-500 hover:bg-purple-600"
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : (
                  <>
                    <LogIn className="mr-2 h-4 w-4" />
                    Sign In
                  </>
                )}
              </Button>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Sign in with</span>
                </div>
              </div>

              <div className="flex gap-4 justify-center">
                <Button variant="outline" size="icon" className="w-10 h-10">
                  <LockKeyhole className="w-6 h-6" />
                </Button>
              </div>

              <div className="text-center text-sm text-gray-600">
                No account yet? <span className="text-purple-600 hover:underline font-bold cursor-pointer" onClick={() => toast.error("관리자에게 문의하세요.")}>Sign up</span>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
