'use client';

import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useState } from 'react';
import { testConnection } from '@/utils/database';
import { TableList } from "@/components/database/table-list";
import { PageContainer } from "@/components/layout/page-container"

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
    <PageContainer path="component-generator">
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
    </PageContainer>
  );
} 