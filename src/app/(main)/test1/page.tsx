'use client';

import { AlertTriangle } from "lucide-react"
import { Navigation } from "@/components/dashboard/navigation"
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { testConnection } from '@/utils/database';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function Test1Page() {
  const [connectionStatus, setConnectionStatus] = useState<{
    success?: boolean;
    message?: string;
    error?: string;
  }>({});
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

  return (
    <div className="p-8 flex flex-col gap-6">
        <Navigation />
        <div className="flex items-center gap-3 p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
            <AlertTriangle className="w-6 h-6 text-yellow-600" />
            <span className="text-yellow-800 font-medium">테스트 페이지 1 입니다.</span>
        </div>
        
        <div className="flex flex-col gap-4">
          <Button onClick={handleTestConnection} disabled={isLoading}>
            {isLoading ? '연결 테스트 중...' : '데이터베이스 연결 테스트'}
          </Button>

          {connectionStatus.message && (
            <Alert variant={connectionStatus.success ? "default" : "destructive"}>
              <AlertDescription>
                {connectionStatus.message}
                {connectionStatus.error && (
                  <div className="mt-2 text-sm">
                    오류 상세: {connectionStatus.error}
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}
        </div>
    </div>
  )
} 