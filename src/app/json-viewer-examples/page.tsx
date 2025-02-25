'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { JsonViewer } from '@/components/ui/json-viewer';
import { JsonViewerCustom, JsonTheme } from '@/components/ui/json-viewer-custom';

// 샘플 JSON 데이터
const exampleJSON = {
  name: "Football Service API",
  version: "1.0.0",
  success: true,
  status: 200,
  timestamp: "2023-02-25T12:00:00Z",
  user: {
    id: 97,
    name: "테스트 사용자",
    email: "test@example.com",
    isActive: true,
    roles: ["ADMIN", "USER"]
  },
  stats: {
    gamesPlayed: 42,
    wins: 28,
    losses: 10,
    draws: 4,
    points: 88
  },
  settings: {
    notifications: {
      email: true,
      push: false,
      sms: null
    }
  },
  recentActivity: [
    {
      id: 1,
      type: "LOGIN",
      date: "2023-02-24T11:32:00Z"
    },
    {
      id: 2,
      type: "PURCHASE",
      date: "2023-02-23T09:15:00Z",
      amount: 1500
    }
  ]
};

/**
 * JSON Viewer 컴포넌트의 다양한 테마를 보여주는 예제 페이지
 */
export default function JsonViewerExamplesPage() {
  const [selectedTheme, setSelectedTheme] = useState<JsonTheme>(JsonTheme.MONOKAI);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">JSON Viewer 컴포넌트 예제</h1>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">기본 JSON Viewer</h2>
        <div className="border rounded-md overflow-hidden">
          <JsonViewer data={exampleJSON} />
        </div>
      </div>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">커스텀 테마 JSON Viewer</h2>
        <div className="mb-4">
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => setSelectedTheme(JsonTheme.MONOKAI)}
              variant={selectedTheme === JsonTheme.MONOKAI ? "default" : "outline"}
            >
              Monokai
            </Button>
            <Button
              onClick={() => setSelectedTheme(JsonTheme.DARK)}
              variant={selectedTheme === JsonTheme.DARK ? "default" : "outline"}
            >
              Dark
            </Button>
            <Button
              onClick={() => setSelectedTheme(JsonTheme.LIGHT)}
              variant={selectedTheme === JsonTheme.LIGHT ? "default" : "outline"}
            >
              Light
            </Button>
            <Button
              onClick={() => setSelectedTheme(JsonTheme.CUSTOM)}
              variant={selectedTheme === JsonTheme.CUSTOM ? "default" : "outline"}
            >
              Custom
            </Button>
          </div>
        </div>
        <div className="border rounded-md overflow-hidden">
          <JsonViewerCustom 
            data={exampleJSON} 
            theme={selectedTheme} 
            copyable
            onCopy={handleCopy}
          />
          {copied && (
            <div className="bg-green-100 text-green-700 text-center py-2">
              JSON이 클립보드에 복사되었습니다!
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 