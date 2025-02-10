import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "sonner"
import { initializeServer } from '@/lib/init'
import { logger } from '@/lib/logger'

const inter = Inter({ subsets: ["latin"] })

// 서버 초기화 실행
logger.info('Starting server initialization from root layout...')
initializeServer().then((status) => {
  if (status.isInitialized) {
    logger.info('Server initialization completed successfully')
  } else {
    logger.error('Server initialization failed')
  }
}).catch((error) => {
  logger.error('Error during server initialization:', error)
})

export const metadata = {
  title: "1Team Football Game Service Manager",
  description: "1Team Football Game Service Manager",
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
    <html lang="en">
      <body className={inter.className}>
        {children}
        <Toaster position="top-center" />
      </body>
    </html>
  )
}
