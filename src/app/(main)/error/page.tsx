import { PageContainer } from "@/components/layout/page-container"
import { AlertTriangle } from "lucide-react"

export default function ErrorPage() {
  return (
    <PageContainer path="error">
    <div className="p-8 flex flex-col gap-6">
      <div className="flex items-center gap-3 p-6 bg-red-50 border border-red-200 rounded-lg">
        <AlertTriangle className="w-12 h-12 text-red-600" />
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-red-600">404:</span>
          <span className="text-red-600 font-semibold">Error 가 발생 하였습니다.</span>
        </div>
      </div>
    </div>
    </PageContainer>
  )
} 