"use client"

import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Search } from "lucide-react"

const birthdayData = [
  {
    name: "Edwards Mclanz",
    position: "Chief Financial Officer (CFO)",
    initials: "EM"
  },
  {
    name: "Doby Wilson",
    position: "Financial Analyst",
    initials: "DW"
  },
  {
    name: "Bianca Anderson",
    position: "Finance Analyst",
    initials: "BA"
  },
  {
    name: "Laurent Perrier",
    position: "Finance Assistant",
    initials: "LP"
  },
  {
    name: "Nunez Faulkner",
    position: "Budget Analyst",
    initials: "NF"
  }
]

export function Birthdays() {
  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold">Birthdays</h3>
        <div className="text-sm text-purple-600">January 2023</div>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <input
          type="text"
          placeholder="Search user name"
          className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
      </div>

      <div className="space-y-4">
        {birthdayData.map((person) => (
          <div key={person.name} className="flex items-center gap-4">
            <Avatar className="h-10 w-10">
              <AvatarFallback>{person.initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h4 className="text-sm font-medium">{person.name}</h4>
              <p className="text-xs text-gray-500">{person.position}</p>
            </div>
            <button className="text-purple-600 hover:text-purple-800">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 6V18M18 12H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
        ))}
      </div>
    </Card>
  )
} 