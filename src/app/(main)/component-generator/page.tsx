'use client';

import { AlertTriangle } from "lucide-react"
import { Navigation } from "@/components/dashboard/navigation"
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { testConnection } from '@/utils/database';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { TableList } from "@/components/database/table-list";

interface ConnectionStatus {
  success?: boolean;
  message?: string;
  error?: string;
  dbInfo?: {
    host?: string;
    database?: string;
  };
}

export default function ComponentGeneratorPage() {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleTestConnection = async () => {
    setIsLoading(true);
    try {
      const result = await testConnection();
      setConnectionStatus(result);
    } finally {
      setIsLoading(false);
    }
  };

  const getConnectionMessage = () => {
    if (!connectionStatus.message) return null;

    const dbInfoText = connectionStatus.dbInfo 
      ? `[${connectionStatus.dbInfo.host} - ${connectionStatus.dbInfo.database}]`
      : '';

    const messageClassName = connectionStatus.success 
      ? "text-green-600 font-bold"
      : "text-red-600 font-bold";

    return (
      <Alert variant={connectionStatus.success ? "default" : "destructive"}>
        <AlertDescription>
          <div className="font-medium">
            {dbInfoText && (
              <span className="text-blue-600 font-bold">{dbInfoText}</span>
            )}
            {" > "}<span className={messageClassName}>{connectionStatus.message}</span>
          </div>
          {connectionStatus.error && (
            <div className="mt-2 text-sm">
              오류 상세: {connectionStatus.error}
            </div>
          )}
        </AlertDescription>
      </Alert>
    );
  };

  return (
    <div className="p-8 flex flex-col gap-6">
      <Navigation />
      <div className="flex items-center gap-3 p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
        <AlertTriangle className="w-6 h-6 text-yellow-600" />
        <span className="text-yellow-800 font-medium">Component Generator 페이지 입니다.</span>
      </div>
      
      <div className="flex flex-col gap-4">
        <Button onClick={handleTestConnection} disabled={isLoading}>
          {isLoading ? '연결 테스트 중...' : '데이터베이스 연결 테스트'}
        </Button>

        {getConnectionMessage()}

        {connectionStatus.success && (
          <div className="mt-4">
            <h2 className="text-lg font-semibold mb-4">데이터베이스 테이블 목록</h2>
            <TableList />
          </div>
        )}
      </div>
    </div>
  );
} 