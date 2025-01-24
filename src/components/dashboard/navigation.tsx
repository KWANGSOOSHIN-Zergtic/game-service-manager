import { ArrowLeft, LayoutDashboard } from "lucide-react"
import Link from "next/link"

export function Navigation() {
  return (
    <div className="flex flex-col gap-6">
      <Link href="/" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
        <ArrowLeft className="w-4 h-4" />
        <span>Back</span>
      </Link>
      
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-4">
          <LayoutDashboard className="w-8 h-8 text-purple-600" />
          <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        </div>
        
        <div className="flex items-center gap-2 text-sm">
          <Link href="/dashboard" className="text-gray-500 hover:text-gray-700">Dashboard</Link>
          <span className="text-gray-400">/</span>
          <Link href="/dashboard/staff" className="text-gray-500 hover:text-gray-700">Staff List</Link>
          <span className="text-gray-400">/</span>
          <Link href="/dashboard/staff/requests" className="text-gray-500 hover:text-gray-700">Requests</Link>
          <span className="text-gray-400">/</span>
          <span className="text-purple-600 font-semibold">Setup New Request</span>
        </div>
      </div>
    </div>
  )
} 