import { AlertTriangle } from "lucide-react"
import { Navigation } from "@/components/dashboard/navigation"

export default function TestSub2Page() {
  return (
    <div className="p-8 flex flex-col gap-6">
      <Navigation />
      <div className="flex items-center gap-3 p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
        <AlertTriangle className="w-6 h-6 text-yellow-600" />
        <span className="text-yellow-800 font-medium">Test Sub2 페이지 입니다.</span>
      </div>
    </div>
  )
} 