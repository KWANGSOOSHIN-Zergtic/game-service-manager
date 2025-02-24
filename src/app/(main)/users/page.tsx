"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { DataTable, TableData } from "@/components/ui/data-table"
import { PageContainer } from "@/components/layout/page-container"
import { ResultAlert } from "@/components/ui/result-alert"
//import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { User } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useUserSearch } from "@/hooks/useUserSearch"

interface InitDBListInfo {
  index: number
  name: string
  description: string
}

export default function UsersPage() {
  const [data, setData] = useState<TableData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedDB, setSelectedDB] = useState<string>("")
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [tableData, setTableData] = useState<TableData[]>([])
  const { queryResult: userSearchResult, isLoading: isSearching, searchUser } = useUserSearch()

  useEffect(() => {
    // 초기화 정보에서 DB 리스트 가져오기
    const loadInitialData = () => {
      try {
        const dbInitInfo = JSON.parse(sessionStorage.getItem('dbInitInfo') || '{}')
        if (dbInitInfo.dbList) {
          const formattedData: TableData[] = dbInitInfo.dbList.map((dbUnit: InitDBListInfo) => ({
            id: dbUnit.index,
            index: dbUnit.index,
            name: dbUnit.name,
            description: dbUnit.description
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

  const handleRowClick = (row: TableData) => {
    console.log('Selected row:', row)
  }

  const handleSelectionChange = (selectedRows: TableData[]) => {
    console.log('Selection changed:', selectedRows)
  }

  const handleSort = (key: string, direction: 'asc' | 'desc' | null) => {
    console.log('Sort changed:', { key, direction })
  }

  const handlePageChange = (page: number) => {
    console.log('Page changed:', page)
  }

  const handleSearch = async () => {
    if (!selectedDB || !searchQuery) {
      return;
    }

    try {
      setTableData([]); // 검색 시도 시 기존 결과 초기화
      const { success, user } = await searchUser(selectedDB, searchQuery);
      
      if (success && user) {
        const formattedData = [{
          id: 1,
          uid: user.uid,
          create_at: user.create_at,
          update_at: user.update_at,
          uuid: user.uuid,
          login_id: user.login_id,
          display_id: user.display_id,
          nickname: user.nickname,
          role: user.role,
          nation_index: user.nation_index
        }];
        setTableData(formattedData);
      }
    } catch (error) {
      console.error('사용자 검색 중 오류:', error);
      setTableData([]);
    }
  };

  const handleSelectRows = () => {
    console.log('Create new table')
  }

  // DB 선택 변경 시 상태 초기화
  const handleDBChange = (value: string) => {
    setSelectedDB(value)
    setTableData([])
    setSearchQuery('')
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
              User Search
            </CardTitle>
          </CardHeader>
          <Separator className="bg-gray-200" />
          <CardContent className="py-6">
            <div className="flex items-center gap-2">
              <div className="w-[200px]">
                <Select 
                  value={selectedDB}
                  onValueChange={handleDBChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="DB 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {data.filter(dbUnit => dbUnit.name !== "football_service").map((dbUnit) => (
                      <SelectItem key={dbUnit.id} value={String(dbUnit.name)}>
                        {String(dbUnit.name)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="relative flex-1">
                <User className="absolute left-2 top-2.5 h-4 w-4 text-purple-400" />
                <Input
                  type="text"
                  placeholder="Search User ID here..."
                  className="pl-8 w-full bg-purple-50/50 border-purple-100 text-purple-900 placeholder:text-purple-400"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button  
                className="w-[200px] bg-purple-500 hover:bg-purple-600 text-white" 
                disabled={!selectedDB || !searchQuery || isSearching}
                onClick={handleSearch}
              >
                {isSearching ? '검색 중...' : 'Search User'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {userSearchResult.status && (
          <ResultAlert 
            result={userSearchResult}
            successTitle="사용자 검색 성공"
            errorTitle="사용자 검색 실패"
          />
        )}

        {tableData.length > 0 && (
          <Card>
            <CardHeader className="py-4 bg-gray-50">
              <CardTitle className="text-lg font-semibold text-gray-900">
                User Information
              </CardTitle>
            </CardHeader>
            <Separator className="bg-gray-200" />
            <CardContent className="py-6">
              <DataTable
                tableName="User Information"
                data={tableData}
                isLoading={isSearching}
                onSelectRows={handleSelectRows}
                onRowClick={handleRowClick}
                onSelectionChange={handleSelectionChange}
                onSort={handleSort}
                onPageChange={handlePageChange}
              />
            </CardContent>
          </Card>
        )}
      </div>
    </PageContainer>
  )
} 