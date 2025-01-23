"use client"

import { Card } from "@/components/ui/card"

export function WorkingFormat() {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Working Format</h3>
      
      <div className="relative w-48 h-48 mx-auto">
        {/* 도넛 차트 배경 */}
        <div className="absolute inset-0 rounded-full border-8 border-gray-100"></div>
        
        {/* 도넛 차트 데이터 */}
        <div 
          className="absolute inset-0 rounded-full border-8 border-blue-600"
          style={{ 
            clipPath: "polygon(50% 50%, 100% 50%, 100% 100%, 50% 100%)",
            transform: "rotate(45deg)"
          }}
        ></div>
        
        {/* 중앙 텍스트 */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg font-semibold">Total</span>
          <span className="text-2xl font-bold">236</span>
        </div>
      </div>

      <div className="mt-6 space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-600"></div>
          <span className="text-sm text-gray-600">Remote</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-gray-100"></div>
          <span className="text-sm text-gray-600">On Site</span>
        </div>
      </div>
    </Card>
  )
} 