import { Navigation } from "@/components/dashboard/navigation"
import { UserCircle, Mail, Key, Building } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export default function AccountSettingPage() {
  return (
    <div className="p-8 flex flex-col gap-6">
      <Navigation />
      
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">계정 설정</h2>
          <p className="text-sm text-gray-500 mt-1">프로필 및 계정 정보를 관리합니다.</p>
        </div>

        <div className="p-6 space-y-6">
          {/* Profile Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="h-20 w-20 rounded-full bg-purple-100 flex items-center justify-center">
                <UserCircle className="h-12 w-12 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">프로필 이미지</h3>
                <p className="text-sm text-gray-500">JPG, GIF, PNG. 최대 크기 1MB</p>
                <Button variant="outline" size="sm" className="mt-2">
                  이미지 변경
                </Button>
              </div>
            </div>
          </div>

          {/* Account Information */}
          <div className="grid gap-6 pt-6 border-t">
            <div className="grid gap-2">
              <label className="text-sm font-medium text-gray-900 flex items-center gap-2">
                <UserCircle className="h-4 w-4" />
                이름
              </label>
              <Input defaultValue="KwangSoo Shin" />
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium text-gray-900 flex items-center gap-2">
                <Mail className="h-4 w-4" />
                이메일
              </label>
              <Input defaultValue="example@1teamfootball.com" type="email" />
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium text-gray-900 flex items-center gap-2">
                <Building className="h-4 w-4" />
                직책
              </label>
              <Input defaultValue="Developer" />
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium text-gray-900 flex items-center gap-2">
                <Key className="h-4 w-4" />
                비밀번호
              </label>
              <Input type="password" defaultValue="********" />
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-6 border-t">
            <Button className="bg-purple-600 hover:bg-purple-700 text-white">
              변경사항 저장
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}