"use client"

import { Card } from "@/components/ui/card"
import { MoreHorizontal } from "lucide-react"

export function Overview() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">236</h3>
          <button className="text-gray-500 hover:text-gray-700">
            <MoreHorizontal className="h-5 w-5" />
          </button>
        </div>
        <p className="text-gray-500 mb-4">Employees</p>
        
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Admin</span>
            <span className="text-sm text-gray-600">60</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-blue-600 h-2 rounded-full" style={{ width: "60%" }}></div>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Lab</span>
            <span className="text-sm text-gray-600">13</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-green-500 h-2 rounded-full" style={{ width: "13%" }}></div>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Media</span>
            <span className="text-sm text-gray-600">4</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-yellow-500 h-2 rounded-full" style={{ width: "4%" }}></div>
          </div>
        </div>

        <button className="mt-4 text-blue-600 text-sm font-medium hover:text-blue-800">
          View Employees
        </button>
      </Card>

      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">18</h3>
          <button className="text-gray-500 hover:text-gray-700">
            <MoreHorizontal className="h-5 w-5" />
          </button>
        </div>
        <p className="text-gray-500 mb-4">Departments</p>
        
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Human Resource</span>
            <span className="text-sm text-gray-600">2</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-purple-600 h-2 rounded-full" style={{ width: "20%" }}></div>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Entrepreneurship</span>
            <span className="text-sm text-gray-600">3</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-indigo-500 h-2 rounded-full" style={{ width: "30%" }}></div>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Operations</span>
            <span className="text-sm text-gray-600">5</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-pink-500 h-2 rounded-full" style={{ width: "50%" }}></div>
          </div>
        </div>

        <button className="mt-4 text-blue-600 text-sm font-medium hover:text-blue-800">
          View Departments
        </button>
      </Card>
    </div>
  )
} 