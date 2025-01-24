"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  LayoutDashboard, 
  Users, 
  ScrollText, 
  Truck, 
  FileText, 
  StickyNote, 
  Wallet, 
  BarChart3,
  ChevronDown
} from "lucide-react"
import { cn } from "@/lib/utils"

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: Users, label: "Staff List", href: "/staff" },
  { icon: ScrollText, label: "Payroll List", href: "/payroll" },
  { icon: Truck, label: "Logistics", href: "/logistics" },
  { icon: FileText, label: "User Circulars", href: "/circulars" },
  { icon: StickyNote, label: "Notes", href: "/notes" },
  { icon: Wallet, label: "Budget", href: "/budget" },
  { icon: BarChart3, label: "Bonds and Stocks", href: "/bonds" },
  { icon: FileText, label: "Docs Management", href: "/docs" },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="w-64 bg-white border-r flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b">
        <h1 className="text-xl font-bold text-purple-600">1Team Fooball Service Manager</h1>
        <p className="text-xs text-gray-500">v1.0</p>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg group transition-colors",
                    isActive 
                      ? "bg-purple-100 text-purple-700 font-semibold" 
                      : "text-gray-700 hover:bg-gray-100"
                  )}
                >
                  <item.icon className={cn(
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