"use client"

import { useEffect, useState, useCallback, useRef } from "react"
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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface InitDBListInfo {
  index: number
  name: string
  description: string
}

interface SelectedUserInfo {
  user: TableData;
  dbName: string;
}

export default function UsersPage() {
  const [data, setData] = useState<TableData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedDB, setSelectedDB] = useState<string>("")
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [tableData, setTableData] = useState<TableData[]>([])
  const [selectedUsers, setSelectedUsers] = useState<SelectedUserInfo[]>([])
  const { queryResult: userSearchResult, isLoading: isSearching, searchUser } = useUserSearch()
  const selectedRowsRef = useRef<TableData[]>([]);

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

  const handleRowClick = useCallback((row: TableData) => {
    console.log('Selected row:', row)
  }, [])

  const handleSelectionChange = useCallback((rows: TableData[]) => {
    selectedRowsRef.current = rows;
    
    setSelectedUsers(prev => {
      const selectedUids = new Set(rows.map(row => row.uid));
      const filteredUsers = prev.filter(userInfo => selectedUids.has(userInfo.user.uid));
      
      const existingIds = new Set(filteredUsers.map(userInfo => userInfo.user.uid));
      const newUsers = rows
        .filter(row => !existingIds.has(row.uid))
        .map(user => ({
          user,
          dbName: selectedDB
        }));
      
      return [...filteredUsers, ...newUsers];
    });
  }, [selectedDB]);

  const handleSort = useCallback((key: string, direction: 'asc' | 'desc' | null) => {
    console.log('Sort changed:', { key, direction })
  }, [])

  const handlePageChange = useCallback((page: number) => {
    console.log('Page changed:', page)
  }, [])

  const handleSearch = useCallback(async () => {
    if (!selectedDB || !searchQuery) {
      return;
    }

    try {
      setTableData([]); // 검색 시도 시 기존 결과 초기화
      const { success, users } = await searchUser(selectedDB, searchQuery);
      
      if (success && users) {
        const formattedData = users.map(user => ({
          id: Number(user.uid),
          uid: user.uid,
          create_at: user.create_at,
          update_at: user.update_at,
          uuid: user.uuid,
          login_id: user.login_id,
          display_id: user.display_id,
          nickname: user.nickname,
          role: user.role,
          nation_index: user.nation_index
        }));
        setTableData(formattedData);
      }
    } catch (error) {
      console.error('사용자 검색 중 오류:', error);
      setTableData([]);
    }
  }, [selectedDB, searchQuery, searchUser]);

  const handleSelectRows = useCallback(() => {
    console.log('Rows selected')
  }, [])

  const handleDBChange = useCallback((value: string) => {
    setSelectedDB(value)
    setTableData([])
  }, [])

  const handleSelectedUsersChange = useCallback((users: SelectedUserInfo[]) => {
    setSelectedUsers(users.filter(Boolean));
  }, []);

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
                  placeholder="Search User Infomation [ uid / login_id / display_id / nickname ]..."
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

        <Card>
          <CardHeader className="py-4 bg-gray-50">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg font-semibold text-gray-900">
                Select Users
              </CardTitle>
              <div className="text-sm text-purple-500">
                선택된 사용자: <span className="font-bold">{selectedUsers.length}</span>명
              </div>
            </div>
          </CardHeader>
          <Separator className="bg-gray-200" />
          <CardContent className="py-6">
            <Accordion type="multiple" className="w-full space-y-2">
              {selectedUsers.map((userInfo, index) => (
                <AccordionItem 
                  key={String(userInfo.user.uid)} 
                  value={String(userInfo.user.uid)}
                  className="border rounded-none first:rounded-t-lg last:rounded-b-lg bg-white overflow-hidden"
                >
                  <AccordionTrigger 
                    className="bg-purple-400 hover:bg-purple-600 px-4 py-3 [&[data-state=open]]:bg-purple-700 transition-colors [&>svg]:text-white [&>svg]:stroke-[3] [&>svg]:h-4 [&>svg]:w-4"
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-bold text-white">#{index + 1}</span>
                      <span className="text-sm text-white">[ {userInfo.dbName} ]</span>
                      <span className="text-sm font-bold text-white">&gt;</span>
                      <span className="text-sm font-bold text-white">{String(userInfo.user.nickname || userInfo.user.login_id)}</span>
                      <span className="text-sm text-white/80">( uid : {String(userInfo.user.uid)} )</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="border-t">
                    <div className="p-4 bg-gray-50/50">
                      <div className="rounded-md border border-gray-200 overflow-hidden">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-purple-50/80">
                              <TableHead className="text-xs font-bold text-gray-600 h-10 py-2 border-r border-gray-200 text-center">UID</TableHead>
                              <TableHead className="text-xs font-bold text-gray-600 h-10 py-2 border-r border-gray-200 text-center">UUID</TableHead>
                              <TableHead className="text-xs font-bold text-gray-600 h-10 py-2 border-r border-gray-200 text-center">Login ID</TableHead>
                              <TableHead className="text-xs font-bold text-gray-600 h-10 py-2 border-r border-gray-200 text-center">Display ID</TableHead>
                              <TableHead className="text-xs font-bold text-gray-600 h-10 py-2 border-r border-gray-200 text-center">Nickname</TableHead>
                              <TableHead className="text-xs font-bold text-gray-600 h-10 py-2 border-r border-gray-200 text-center">Role</TableHead>
                              <TableHead className="text-xs font-bold text-gray-600 h-10 py-2 border-r border-gray-200 text-center">Nation Index</TableHead>
                              <TableHead className="text-xs font-bold text-gray-600 h-10 py-2 border-r border-gray-200 text-center">Created At</TableHead>
                              <TableHead className="text-xs font-bold text-gray-600 h-10 py-2 border-r border-gray-200 text-center">Updated At</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            <TableRow className="hover:bg-purple-50/30">
                              <TableCell className="py-3 text-center border-r border-gray-200">{String(userInfo.user.uid)}</TableCell>
                              <TableCell className="py-3 text-center border-r border-gray-200">{String(userInfo.user.uuid)}</TableCell>
                              <TableCell className="py-3 text-center border-r border-gray-200">{String(userInfo.user.login_id)}</TableCell>
                              <TableCell className="py-3 text-center border-r border-gray-200">{String(userInfo.user.display_id)}</TableCell>
                              <TableCell className="py-3 text-center border-r border-gray-200">
                                <div className="flex justify-center">
                                  <span className="text-purple-600 font-medium bg-purple-50 px-3 py-1 rounded-full">
                                    {String(userInfo.user.nickname)}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell className="py-3 text-center border-r border-gray-200">{String(userInfo.user.role)}</TableCell>
                              <TableCell className="py-3 text-center border-r border-gray-200">{String(userInfo.user.nation_index)}</TableCell>
                              <TableCell className="py-3 text-center border-r border-gray-200">{String(userInfo.user.create_at)}</TableCell>
                              <TableCell className="py-3 text-center border-r border-gray-200">{String(userInfo.user.update_at)}</TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </div>
                      <div className="flex justify-end mt-4">
                        <Button
                          variant="destructive"
                          size="sm"
                          className="bg-red-500 hover:bg-red-600 text-white font-bold"
                          onClick={() => handleSelectedUsersChange(selectedUsers.filter(u => u.user.uid !== userInfo.user.uid))}
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  )
} 