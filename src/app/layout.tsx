import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "react-hot-toast"
import { initializeServer } from '@/lib/init'
import { logger } from '@/lib/logger'
import { getGlobalInitState } from '@/lib/init/global-init-state'

const inter = Inter({ subsets: ["latin"] })

// 서버 초기화 함수
async function initServer() {
  const globalState = getGlobalInitState();
  
  // 이미 초기화가 완료되었거나 진행 중인 경우 스킵
  if (globalState.isInitialized || globalState.isInitializing) {
    return;
  }

  try {
    logger.info('Starting server initialization from root layout...')
    const status = await initializeServer()
    if (!status.isInitialized) {
      logger.error('Server initialization failed')
    }
  } catch (error) {
    logger.error('Error during server initialization:', error instanceof Error ? error.message : String(error))
  }
}

// 서버 사이드에서만 초기화 실행
if (typeof window === 'undefined') {
  initServer();
}

export const metadata: Metadata = {
  title: "Football Service Manager",
  description: "Football Service Manager",
  icons: {
    icon: "/resource/ci/1tf.ico",
  },  
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body className={inter.className}>
        {children}
        <Toaster
          position="top-center"
          reverseOrder={false}
          gutter={8}
          toastOptions={{
            duration: 3000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#22c55e',
                secondary: '#fff',
              },
            },
            error: {
              duration: 3000,
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </body>
    </html>
  )
}
