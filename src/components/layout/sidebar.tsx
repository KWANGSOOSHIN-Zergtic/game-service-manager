"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { MENU_ITEMS } from "@/config/menu"

export function Sidebar() {
  const pathname = usePathname()
  const sidebarItems = MENU_ITEMS.filter(item => item.showInSidebar)

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
          {sidebarItems.map((item) => {
            const isActive = pathname === `/${item.path}`
            const Icon = item.icon
            
            return (
              <li key={item.path}>
                <Link
                  href={`/${item.path}`}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg group transition-colors",
                    isActive 
                      ? "bg-purple-100 text-purple-700 font-semibold" 
                      : "text-gray-700 hover:bg-gray-100"
                  )}
                >
                  <Icon className={cn(
                    "h-5 w-5",
                    isActive && "text-purple-700"
                  )} />
                  <span className="flex-1 text-sm">{item.label}</span>
                  {item.label !== "Dashboard" && (
                    <ChevronDown className={cn(
                      "h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity",
                      isActive && "text-purple-700"
                    )} />
                  )}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
    </div>
  )
} 