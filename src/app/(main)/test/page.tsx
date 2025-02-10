'use client';

import { Plus } from "lucide-react"
import { PageContainer } from "@/components/layout/page-container"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { ResultAlert, type ResultData } from "@/components/ui/result-alert"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { MENU_ITEMS } from "@/config/menu"
import { useState } from "react"
import { useRouter } from "next/navigation"

export default function TestPage() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [pageName, setPageName] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [result, setResult] = useState<ResultData>({ status: null, message: '' });

  // showInSidebar가 true인 메인 메뉴 항목만 필터링
  const mainCategories = MENU_ITEMS.filter(item => item.showInSidebar);

  const handleCreatePage = async () => {
    try {
      setIsLoading(true);
      setResult({ status: null, message: '' });

      if (!selectedCategory) {
        setResult({
          status: 'error',
          message: '카테고리를 선택해주세요.',
        });
        return;
      }

      if (!pageName) {
        setResult({
          status: 'error',
          message: '페이지 이름을 입력해주세요.',
        });
        return;
      }

      // 페이지 이름을 하이픈 케이스로 변환하는 함수
      const toHyphenCase = (str: string) => {
        return str
          // 대문자 앞에 하이픈을 추가하되, 문자열 시작은 제외
          .replace(/([A-Z])/g, (match, letter, offset) => {
            return offset > 0 ? `-${letter}` : letter;
          })
          // 연속된 대문자 처리 (예: TestAPI -> test-api)
          .replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2')
          // 공백을 하이픈으로 변환
          .replace(/\s+/g, '-')
          // 연속된 하이픈을 단일 하이픈으로 변환
          .replace(/-+/g, '-')
          // 소문자로 변환
          .toLowerCase();
      };

      const formattedPageName = toHyphenCase(pageName);
      
      // API 호출하여 페이지 생성
      const response = await fetch('/api/create-page', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          category: selectedCategory,
          pageName: formattedPageName,
        }),
      });

      if (!response.ok) {
        throw new Error('페이지 생성에 실패했습니다.');
      }

      setResult({
        status: 'success',
        message: `페이지가 성공적으로 생성되었습니다: ${selectedCategory}/${formattedPageName}`,
      });

      // 입력 필드 초기화
      setSelectedCategory("");
      setPageName("");
      
      // 새로 생성된 페이지로 이동
      router.push(`/${selectedCategory}/${formattedPageName}`);

    } catch (error) {
      setResult({
        status: 'error',
        message: '페이지 생성 실패',
        error: error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageContainer path="test">
      <div className="space-y-6">
        <Card>
          <CardHeader className="py-4 bg-gray-50">
            <CardTitle className="text-lg font-semibold text-gray-900">Page Create</CardTitle>
          </CardHeader>
          <Separator className="bg-gray-200" />
          <CardContent className="py-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-2">
                <label className="text-sm font-midium font-bold">Main Category</label>
                <Select
                  value={selectedCategory}
                  onValueChange={setSelectedCategory}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Main Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {mainCategories.map((item) => (
                      <SelectItem key={item.path} value={item.path}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>              
              <div className="space-y-2">
                <label className="text-sm font-midium font-bold">Page Name</label>
                <Input 
                  placeholder="Enter new 'PageName' here..." 
                  value={pageName}
                  onChange={(e) => setPageName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-midium font-bold opacity-0">Action</label>
                <Button 
                  className="bg-green-500 hover:bg-green-600 w-full"
                  onClick={handleCreatePage}
                  disabled={isLoading}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {isLoading ? "Creating..." : "Create New Page"}
                </Button>
              </div>
            </div>
            
            <ResultAlert 
              result={result} 
              className="mt-8"
              successTitle="페이지 생성 완료"
              errorTitle="페이지 생성 실패"
            />
          </CardContent>
          <Separator className="bg-gray-200" />
        </Card>
      </div>
    </PageContainer>
  )
} 