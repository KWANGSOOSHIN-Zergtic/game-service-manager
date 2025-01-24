"use client"

import { useRouter } from "next/navigation"
import { toast } from "sonner"

interface LoginData {
  email: string
  password: string
}

export function useAuth() {
  const router = useRouter()

  const login = async (loginData: LoginData) => {
    try {
      if (loginData.email === "admin@woore.co.kr" && loginData.password === "1234") {
        sessionStorage.setItem("isLoggedIn", "true")
        sessionStorage.setItem("userEmail", loginData.email)
        toast.success("Login successful!")
        return true
      } else {
        toast.error("Invalid email or password")
        return false
      }
    } catch (error) {
      console.error("Login error:", error)
      toast.error("An error occurred during login")
      return false
    }
  }

  const checkAuth = () => {
    const isLoggedIn = sessionStorage.getItem("isLoggedIn")
    if (!isLoggedIn) {
      router.push("/")
      return false
    }
    return true
  }

  const logout = () => {
    sessionStorage.removeItem("isLoggedIn")
    sessionStorage.removeItem("userEmail")
    router.push("/")
  }

  return {
    login,
    checkAuth,
    logout,
  }
} 