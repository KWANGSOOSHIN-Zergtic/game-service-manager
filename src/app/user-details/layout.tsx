import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '사용자 상세 정보',
  description: '선택한 사용자에 대한 자세한 정보를 표시합니다.',
}

export default function UserDetailsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="user-details-layout min-h-screen bg-white">
      {children}
    </div>
  )
} 