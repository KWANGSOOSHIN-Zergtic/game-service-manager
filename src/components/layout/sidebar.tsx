"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { MENU_ITEMS, MenuItem } from "@/config/menu"
import { useState } from "react"

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const sidebarItems = MENU_ITEMS.filter(item => item.showInSidebar)
  const [expandedItems, setExpandedItems] = useState<string[]>([])

  const toggleExpand = (path: string) => {
    setExpandedItems(prev => 
      prev.includes(path) 
        ? prev.filter(p => p !== path)
        : [...prev, path]
    )
  }

  const handleMenuClick = (e: React.MouseEvent, item: MenuItem) => {
    e.preventDefault()
    
    // 항상 해당 페이지로 이동
    router.push(`/${item.path}`)
    
    // 서브메뉴가 있는 경우 토글
    if (item.subItems?.length) {
      toggleExpand(item.path)
    }
  }

  const renderMenuItem = (item: MenuItem, isSubItem: boolean = false) => {
    const isActive = pathname === `/${item.path}`
    const hasSubItems = item.subItems && item.subItems.length > 0
    const isExpanded = expandedItems.includes(item.path)
    const Icon = item.icon
    
    // 현재 경로가 서브아이템 중 하나와 일치하는지 확인
    const isChildActive = hasSubItems && item.subItems?.some(
      subItem => pathname === `/${subItem.path}`
    )
    
    return (
      <li key={item.path}>
        <div className="flex flex-col">
          <Link
            href={`/${item.path}`}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg group transition-colors",
              !isSubItem && (isActive || isChildActive)
                ? "bg-purple-100 text-purple-700 font-semibold" 
                : "text-gray-700 hover:bg-gray-100",
              isSubItem && "ml-6 hover:bg-transparent",
              isSubItem && isActive && "text-purple-700 font-bold"
            )}
            onClick={(e) => handleMenuClick(e, item)}
          >
            <Icon className={cn(
              "h-5 w-5",
              (isActive || isChildActive) && "text-purple-700"
            )} />
            <span className="flex-1 text-sm">{item.label}</span>
            {hasSubItems && (
              <ChevronDown className={cn(
                "h-4 w-4 transition-transform duration-200",
                isExpanded && "transform rotate-180",
                (isActive || isChildActive) && "text-purple-700"
              )} />
            )}
          </Link>
          
          {hasSubItems && isExpanded && (
            <ul className="mt-1 space-y-1">
              {item.subItems?.map(subItem => renderMenuItem(subItem, true))}
            </ul>
          )}
        </div>
      </li>
    )
  }

  return (
    <div className="w-64 bg-white border-r flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b">
        <h1 className="text-xl font-bold text-purple-600">1Team Football Service Manager</h1>
        <p className="text-xs text-gray-500">v1.0</p>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {sidebarItems.map(item => renderMenuItem(item))}
        </ul>
      </nav>
    </div>
  )
} 