"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { DataTable, TableData } from "@/components/ui/data-table"
import { PageContainer } from "@/components/layout/page-container"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, User } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface InitDBListItem {
  index: number
  name: string
  description: string
}

export default function UsersPage() {
  const [data, setData] = useState<TableData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("user-search")
  const [searchQuery, setSearchQuery] = useState<string>("")

  useEffect(() => {
    // 초기화 정보에서 DB 리스트 가져오기
    const loadInitialData = () => {
      try {
        const dbInitInfo = JSON.parse(sessionStorage.getItem('dbInitInfo') || '{}')
        if (dbInitInfo.dbList) {
          // DBListItem 형식에 맞게 데이터 변환
          const formattedData: TableData[] = dbInitInfo.dbList.map((item: InitDBListItem) => ({
            id: item.index,
            index: item.index,
            name: item.name,
            description: item.description
          }))
          setData(formattedData)
        }
      } catch (error) {
        console.error('DB 리스트 초기화 실패:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadInitialData()
  }, [])

  const handleRowClick = (item: TableData) => {
    console.log('Selected row:', item)
  }

  const handleSelectionChange = (selectedItems: TableData[]) => {
    console.log('Selection changed:', selectedItems)
  }

  const handleSort = (key: string, direction: 'asc' | 'desc' | null) => {
    console.log('Sort changed:', { key, direction })
  }

  const handlePageChange = (page: number) => {
    console.log('Page changed:', page)
  }

  return (
    <PageContainer path="users">
      <div className="flex flex-col gap-4">
        <Card>
          <CardHeader className="py-4 bg-gray-50">
            <CardTitle className="text-lg font-semibold text-gray-900">
              DB List
            </CardTitle>
          </CardHeader>
          <Separator className="bg-gray-200" />
          <CardContent className="py-6">
            <DataTable
              tableName="DB List"
              data={data}
              isLoading={isLoading}
              onRowClick={handleRowClick}
              onSelectionChange={handleSelectionChange}
              onSort={handleSort}
              onPageChange={handlePageChange}
            />
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader className="py-4 bg-gray-50">
            <CardTitle className="text-lg font-semibold text-gray-900">
              User 검색
            </CardTitle>
          </CardHeader>
          <Separator className="bg-gray-200" />
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="ml-2 mr-2">
                <Select defaultValue="All Database">
                  <SelectTrigger className="w-50">
                    <SelectValue placeholder="DB 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem key="all" value="All Database">
                      All Database
                    </SelectItem>
                    {data.filter(item => item.name !== "football_service").map((item) => (
                      <SelectItem key={item.id} value={String(item.name)}>
                        {String(item.name)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="relative w-full">
                <User className="absolute left-2 top-2.5 h-4 w-4 text-purple-400" />
                <Input
                  type="text"
                  placeholder="Search User ID here..."
                  //className="w-full rounded-md border border-purple-100 bg-purple-50 text-purple-900 pl-10 pr-3 py-2 placeholder-purple-500 focus:border-purple-600 focus:ring focus:ring-purple-200 focus:outline-none"
                  className="pl-8 w-full bg-purple-50/50 border-purple-100 text-purple-900 placeholder:text-purple-400"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button className="ml-2 bg-purple-600 hover:bg-purple-700 text-white">
                <Search className="w-4 h-4" />
                <span className="ml-1">Search User</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  )
} 