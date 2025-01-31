"use client"

import { LayoutDashboard, Users, Settings, HeadphonesIcon, ChevronRight, HelpCircle, Bell, AlertTriangle, UserCircle } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

export function Navigation() {
  const pathname = usePathname()
  
  const getPageInfo = () => {
    const paths = pathname.split("/").filter(Boolean)
    const currentPage = paths[0]?.toLowerCase()
    
    switch(currentPage) {
      case "dashboard":
        return {
          icon: <LayoutDashboard className="w-8 h-8 text-purple-600" />,
          title: "Dashboard"
        }
      case "users":
        return {
          icon: <Users className="w-8 h-8 text-purple-600" />,
          title: "Users"
        }
      case "service":
        return {
          icon: <Settings className="w-8 h-8 text-purple-600" />,
          title: "Service"
        }
      case "cs":
        return {
          icon: <HeadphonesIcon className="w-8 h-8 text-purple-600" />,
          title: "CS"
        }
      case "help":
        return {
          icon: <HelpCircle className="w-8 h-8 text-purple-600" />,
          title: "Help"
        }
      case "alarm":
        return {
          icon: <Bell className="w-8 h-8 text-purple-600" />,
          title: "Alarm"
        }
      case "setup":
        return {
          icon: <Settings className="w-8 h-8 text-purple-600" />,
          title: "Setup"
        }
      case "error":
        return {
          icon: <AlertTriangle className="w-8 h-8 text-purple-600" />,
          title: "Error"
        }
      case "account-setting":
        return {
          icon: <UserCircle className="w-8 h-8 text-purple-600" />,
          title: "Account Setting"
        }
      default:
        return {
          icon: <LayoutDashboard className="w-8 h-8 text-purple-600" />,
          title: "Dashboard"
        }
    }
  }

  const pageInfo = getPageInfo()

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        {pageInfo.icon}
        <h1 className="text-2xl font-semibold text-gray-900">{pageInfo.title}</h1>
      </div>
      
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link href="/dashboard" className="hover:text-gray-700">
          1Team Football Service Manager
        </Link>
        <ChevronRight className="w-4 h-4 text-gray-400" />
        <span className="text-purple-600 font-bold">{pageInfo.title}</span>
      </div>
    </div>
  )
} 