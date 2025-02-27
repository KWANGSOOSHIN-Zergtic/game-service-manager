"use client"

import { Search, Bell, HelpCircle, Settings, LogOut, UserCircle } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/useAuth"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export function Header() {
  const { logout } = useAuth()
  const [adminInfo, setAdminInfo] = useState<{ name: string; type: string } | null>(null)

  useEffect(() => {
    // 관리자 정보 로드
    const loadAdminInfo = () => {
      try {
        const adminData = localStorage.getItem('admin')
        if (adminData) {
          const admin = JSON.parse(adminData)
          setAdminInfo({
            name: admin.name || 'Unknown',
            type: admin.type || 'User'
          })
        }
      } catch (error) {
        console.error('관리자 정보 로드 실패:', error)
        setAdminInfo({ name: 'Unknown', type: 'User' })
      }
    }

    loadAdminInfo()
  }, [])

  const handleLogout = () => {
    console.log('로그아웃 처리 중...')
    logout()
  }

  // 관리자 이름에서 이니셜 추출
  const getInitials = () => {
    if (!adminInfo?.name) return 'UN'
    
    const nameParts = adminInfo.name.split(' ')
    if (nameParts.length > 1) {
      return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase()
    }
    
    return adminInfo.name.substring(0, 2).toUpperCase()
  }

  return (
    <header className="h-16 border-b bg-white px-6 flex items-center justify-between">
      {/* Search */}
      <div className="flex-1 max-w-xl relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <input
          type="text"
          placeholder="Search here..."
          className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-4">
        {/* Help */}
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link href="/help" className="p-2 text-gray-500 hover:text-gray-700">
                <HelpCircle className="h-5 w-5" />
              </Link>
            </TooltipTrigger>
            <TooltipContent className="bg-gray-100 border-gray-200">
              <p className="text-purple-600 font-bold">Help</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Notifications */}
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link href="/alarm" className="p-2 text-gray-500 hover:text-gray-700 relative">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
              </Link>
            </TooltipTrigger>
            <TooltipContent className="bg-gray-100 border-gray-200">
              <p className="text-purple-600 font-bold">Alarm</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Setup */}
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link href="/setup" className="p-2 text-gray-500 hover:text-gray-700">
                <Settings className="h-5 w-5" />
              </Link>
            </TooltipTrigger>
            <TooltipContent className="bg-gray-100 border-gray-200">
              <p className="text-purple-600 font-bold">Setup</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Profile */}
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-3 hover:cursor-pointer">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>{getInitials()}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-purple-600">{adminInfo?.name || 'Loading...'}</span>
                    <span className="text-xs text-gray-500">{adminInfo?.type || 'User'}</span>
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>계정</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/account-setting">
                      <UserCircle className="mr-2 h-4 w-4" />
                      <span>Account Setting</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-red-600 font-bold" onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TooltipTrigger>
            <TooltipContent className="bg-gray-100 border-gray-200">
              <p className="text-purple-600 font-bold">Account</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </header>
  )
} 