"use client"

import { Card } from "@/components/ui/card"

const data = [
  { day: "Sun", project: 50, bench: 30 },
  { day: "Mon", project: 60, bench: 40 },
  { day: "Tue", project: 120, bench: 60 },
  { day: "Wed", project: 150, bench: 70 },
  { day: "Thu", project: 120, bench: 50 },
  { day: "Fri", project: 160, bench: 80 },
  { day: "Sat", project: 180, bench: 90 },
]

export function ProjectEmployment() {
  const maxValue = Math.max(...data.map(d => d.project + d.bench))
  
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Project employment</h3>
      
      <div className="h-[200px] flex items-end gap-2">
        {data.map((item) => (
          <div key={item.day} className="flex-1 flex flex-col items-center gap-1">
            <div className="w-full flex flex-col gap-1" style={{ height: `${(item.project + item.bench) / maxValue * 100}%` }}>
              <div 
                className="w-full bg-blue-200 rounded-sm" 
                style={{ height: `${item.bench / (item.project + item.bench) * 100}%` }}
              ></div>
              <div 
                className="w-full bg-blue-600 rounded-sm" 
                style={{ height: `${item.project / (item.project + item.bench) * 100}%` }}
              ></div>
            </div>
            <span className="text-xs text-gray-600">{item.day}</span>
          </div>
        ))}
      </div>

      <div className="mt-6 flex gap-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-600"></div>
          <span className="text-sm text-gray-600">Project</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-200"></div>
          <span className="text-sm text-gray-600">Bench</span>
        </div>
      </div>
    </Card>
  )
} 