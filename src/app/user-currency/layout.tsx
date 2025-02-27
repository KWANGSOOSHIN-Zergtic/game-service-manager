import { ReactNode } from 'react';

interface UserCurrencyLayoutProps {
  children: ReactNode;
}

export default function UserCurrencyLayout({ children }: UserCurrencyLayoutProps) {
  return (
    <div className="w-full min-h-screen bg-gray-50">
      <div className="flex flex-col min-h-screen">
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}

export const metadata = {
  title: '사용자 재화 관리',
  description: '사용자 재화 정보를 관리합니다.',
}; 