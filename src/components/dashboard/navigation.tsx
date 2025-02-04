"use client"

import { ChevronRight } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { MENU_ITEMS, DEFAULT_MENU_ITEM } from "@/config/menu"

export function Navigation() {
  const pathname = usePathname()
  
  const getPageInfo = () => {
    const paths = pathname.split("/").filter(Boolean)
    const currentPath = paths.join('/')
    
    // 먼저 서브메뉴에서 찾기
    for (const item of MENU_ITEMS) {
      if (item.subItems) {
        const subItem = item.subItems.find(sub => sub.path === currentPath)
        if (subItem) {
          const Icon = subItem.icon
          return {
            icon: <Icon className="w-8 h-8 text-purple-600" />,
            title: subItem.label,
            parentLabel: item.label // 부모 메뉴 레이블 추가
          }
        }
      }
    }

    // 메인 메뉴에서 찾기
    const menuItem = MENU_ITEMS.find(item => item.path === currentPath) || DEFAULT_MENU_ITEM
    const Icon = menuItem.icon

    return {
      icon: <Icon className="w-8 h-8 text-purple-600" />,
      title: menuItem.label
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
        {pageInfo.parentLabel && (
          <>
            <span className="text-gray-500">{pageInfo.parentLabel}</span>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </>
        )}
        <span className="text-purple-600 font-bold">{pageInfo.title}</span>
      </div>
    </div>
  )
} 