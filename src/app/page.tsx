"use client"

import Link from "next/link"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Github } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import Image from "next/image"

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      if (loginData.email === "admin@woore.co.kr" && loginData.password === "Enter1234!!") {
        // 로그인 성공 시 세션 스토리지에 로그인 상태 저장
        sessionStorage.setItem("isLoggedIn", "true")
        sessionStorage.setItem("userEmail", loginData.email)
        
        // 로그인 성공 메시지 표시
        toast.success("Login successful!")
        
        // 약간의 지연 후 리다이렉션 (토스트 메시지가 보이도록)
        setTimeout(() => {
          router.push("/dashboard")
        }, 1000)
      } else {
        toast.error("Invalid email or password")
      }
    } catch (error) {
      console.error("Login error:", error)
      toast.error("An error occurred during login")
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
              <div>
                <Input
                  type="email"
                  placeholder="E-mail"
                  value={loginData.email}
                  onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                  className="w-full"
                  required
                  disabled={isLoading}
                />
              </div>
              <div>
                <Input
                  type="password"
                  placeholder="Password"
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                  className="w-full"
                  required
                  disabled={isLoading}
                />
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  Auto sign in
                </label>
                <Link href="/forgot-password" className="text-purple-600 hover:underline">
                  Forgot password?
                </Link>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-purple-600 hover:bg-purple-700"
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Sign In"}
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
                  <Github className="w-6 h-6" />
                </Button>
              </div>

              <div className="text-center text-sm text-gray-600">
                No account yet? <Link href="/register" className="text-purple-600 hover:underline">Sign up</Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
