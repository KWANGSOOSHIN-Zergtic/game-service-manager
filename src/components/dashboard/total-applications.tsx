"use client"

import { Card } from "@/components/ui/card"

const data = [
  { label: "Applications", value: 39, color: "bg-blue-600" },
  { label: "Shortlisted", value: 22, color: "bg-green-500" },
  { label: "On-Hold", value: 12, color: "bg-yellow-500" },
  { label: "Rejected", value: 16, color: "bg-red-500" },
]

export function TotalApplications() {
  const total = data.reduce((acc, item) => acc + item.value, 0)
  
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Total Applications</h3>
      
      <div className="space-y-4">
        {data.map((item) => (
          <div key={item.label} className="space-y-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                <span className="text-sm text-gray-600">{item.label}</span>
              </div>
              <span className="text-sm font-medium">{Math.round(item.value / total * 100)}%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${item.color}`}
                style={{ width: `${(item.value / total) * 100}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
} 