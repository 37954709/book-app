import type { Metadata } from 'next'
import { Navbar } from '@/components/Navbar'
import { AuthProvider } from '@/components/AuthProvider'
import './globals.css'

export const metadata: Metadata = {
  title: 'Book App - 本管理アプリ',
  description: '本管理アプリケーション',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body className="min-h-screen bg-gray-50">
        <AuthProvider>
          <Navbar />
          <main className="max-w-7xl mx-auto px-4 py-6 pb-20 sm:pb-6">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  )
}
