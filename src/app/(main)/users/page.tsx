"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { DataTable, TableData } from "@/components/ui/data-table"
import { PageContainer } from "@/components/layout/page-container"

interface InitDBListItem {
  index: number
  name: string
  description: string
}

export default function UsersPage() {
  const [data, setData] = useState<TableData[]>([])
  const [isLoading, setIsLoading] = useState(true)

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
      </div>
    </PageContainer>
  )
} 