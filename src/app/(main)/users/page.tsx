"use client"

import { useEffect, useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { DataTable, TableData } from "@/components/ui/data-table"
import { PageContainer } from "@/components/layout/page-container"
import { ResultAlert } from "@/components/ui/result-alert"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { User } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useUserSearch } from "@/hooks/useUserSearch"
import { UserAccordion } from "@/components/user/user-accordion"

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
  const [selectedRowsTemp, setSelectedRowsTemp] = useState<TableData[]>([])
  const { queryResult: userSearchResult, isLoading: isSearching, searchUser } = useUserSearch()

  useEffect(() => {
    // 초기화 정보에서 DB 리스트 가져오기
    const loadInitialData = () => {
      try {
        const dbInitInfo = JSON.parse(sessionStorage.getItem('dbInitInfo') || '{}')
        if (dbInitInfo.dbList) {
          const formattedData: TableData[] = dbInitInfo.dbList.map((dbUnit: InitDBListInfo, index: number) => ({
            id: dbUnit.index,
            displayIndex: index + 1,
            index: dbUnit.index,
            name: dbUnit.name,
            description: dbUnit.description
          }))
          setData(formattedData)
          
          // localStorage에서 저장된 DB 이름 가져오기
          const savedDBName = localStorage.getItem('userSearchDBName')
          if (savedDBName) {
            console.log('[Users] 저장된 DB 이름 불러옴 (localStorage):', savedDBName)
            setSelectedDB(savedDBName)
          }
        }
      } catch (error) {
        console.error('DB 리스트 초기화 실패:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadInitialData()
  }, [])

  // 선택된 행이 변경될 때 사용자 정보 업데이트
  useEffect(() => {
    if (!selectedDB) return;
    
    const selectedUids = new Set(selectedRowsTemp.map(row => row.uid));
    
    setSelectedUsers(prev => {
      // 현재 체크된 행에 대응하는 uid가 있는 유저만 필터링
      const filteredUsers = prev.filter(userInfo => selectedUids.has(userInfo.user.uid));
      
      // 체크된 행이 없으면 필터링된 빈 배열만 반환
      if (!selectedRowsTemp.length) {
        return filteredUsers; // 이 시점에서 빈 배열임
      }
      
      // 신규 유저 추가 로직 (체크된 행이 있을 때만 실행)
      const existingIds = new Set(filteredUsers.map(userInfo => userInfo.user.uid));
      const newUsers = selectedRowsTemp
        .filter(row => !existingIds.has(row.uid))
        .map(user => ({
          user,
          dbName: selectedDB
        }));
      
      // 최종 업데이트된 사용자 목록 반환
      return [...filteredUsers, ...newUsers];
    });
  }, [selectedRowsTemp, selectedDB]);

  const handleRowClick = useCallback((row: TableData) => {
    console.log('Selected row:', row)
  }, [])

  // DB 리스트 선택 처리
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleDBListSelectionChange = useCallback((_: TableData[]) => {
    // DB 리스트는 선택 처리하지 않음
  }, []);

  // DataTable의 선택 변경 이벤트를 처리하는 함수
  const handleSelectionUpdate = useCallback((rows: TableData[]) => {
    // 이전 선택 상태를 기억하기 위한 변수
    const prevSelectedRows = selectedRowsTemp;
    
    // 이전에 선택된 행의 UID
    const prevSelectedUids = new Set(prevSelectedRows.map(row => row.uid));
    
    // 새로 추가된 행 (이전에 없었지만 현재 선택된 행)
    const newlyAddedRows = rows.filter(row => !prevSelectedUids.has(row.uid));
    
    // 새로 추가된 행이 있으면 마지막 행의 정보를 employerStorage에 저장
    if (newlyAddedRows.length > 0) {
      const lastAddedRow = newlyAddedRows[newlyAddedRows.length - 1];
      
      // employerStorage에 사용자 정보와 db_name 저장
      const employerData = {
        ...lastAddedRow,
        db_name: selectedDB // 현재 검색에 사용된 DB 이름
      };
      
      sessionStorage.setItem('employerStorage', JSON.stringify(employerData));
      console.log('[UsersPage] 신규 선택된 사용자 정보 저장 (employerStorage):', employerData);
    } 
    // 선택이 해제된 경우 (이전보다 선택된 행이 줄어든 경우)
    else if (rows.length < prevSelectedRows.length && rows.length > 0) {
      // 마지막으로 남아있는 선택된 행 정보 저장
      const lastRemainingRow = rows[rows.length - 1];
      
      const employerData = {
        ...lastRemainingRow,
        db_name: selectedDB
      };
      
      sessionStorage.setItem('employerStorage', JSON.stringify(employerData));
      console.log('[UsersPage] 남아있는 마지막 사용자 정보 저장 (employerStorage):', employerData);
    }
    // 모든 선택이 해제된 경우
    else if (rows.length === 0 && prevSelectedRows.length > 0) {
      // employerStorage 초기화 (선택 취소)
      sessionStorage.removeItem('employerStorage');
      console.log('[UsersPage] 모든 선택 해제, employerStorage 초기화');
    }
    
    // setTimeout을 사용하여 상태 업데이트를 다음 이벤트 루프로 지연
    setTimeout(() => {
      setSelectedRowsTemp(rows);
    }, 0);
  }, [selectedRowsTemp, selectedDB]);

  // 사용자 제거 처리
  const handleRemoveUser = useCallback((uid: string) => {
    const updatedUsers = selectedUsers.filter(u => String(u.user.uid) !== uid);
    setSelectedUsers(updatedUsers);
  }, [selectedUsers]);

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
        const formattedData = users.map((user, index) => ({
          id: Number(user.uid),
          displayIndex: index + 1,
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
    
    // DB 이름을 localStorage에 저장
    localStorage.setItem('userSearchDBName', value)
    console.log('[Users] DB 이름 저장됨 (localStorage):', value)
  }, [])

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
              onSelectionChange={handleDBListSelectionChange}
              onSort={handleSort}
              onPageChange={handlePageChange}
              dbName="DB List"
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
                {isSearching ? 'Now Searching...' : 'Search User'}
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
                onSelectionChange={handleSelectionUpdate}
                onSort={handleSort}
                onPageChange={handlePageChange}
                dbName={selectedDB}
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
            <UserAccordion 
              selectedUsers={selectedUsers} 
              onRemoveUser={handleRemoveUser}
            />
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  )
} 