'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BookOpen, PlusCircle, LayoutDashboard, Download, Upload, LogOut, User, Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useRef, useState } from 'react'
import { useAuth } from './AuthProvider'

export function Navbar() {
  const pathname = usePathname()
  const importInputRef = useRef<HTMLInputElement>(null)
  const { user, loading, signOut } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // ログインページでは表示しない
  if (pathname === '/login' || pathname === '/signup') {
    return null
  }

  const handleExport = async () => {
    try {
      const res = await fetch('/api/export')
      const data = await res.json()
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `book-app-export-${new Date().toISOString().split('T')[0]}.json`
      a.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Export error:', error)
      alert('エクスポートに失敗しました')
    }
  }

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const text = await file.text()
      const data = JSON.parse(text)

      const res = await fetch('/api/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        throw new Error('Import failed')
      }

      const result = await res.json()
      alert(`インポート完了: ${result.importedBooks}冊の本、${result.importedTags}個のタグ`)
      window.location.reload()
    } catch (error) {
      console.error('Import error:', error)
      alert('インポートに失敗しました。正しいJSONファイルか確認してください。')
    } finally {
      if (importInputRef.current) {
        importInputRef.current.value = ''
      }
    }
  }

  const navItems = [
    { href: '/', icon: BookOpen, label: '本一覧' },
    { href: '/books/new', icon: PlusCircle, label: '本を追加' },
    { href: '/dashboard', icon: LayoutDashboard, label: 'ダッシュボード' },
  ]

  return (
    <>
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* ロゴ */}
            <Link href="/" className="flex items-center gap-2 text-xl font-bold text-primary-600">
              <BookOpen size={28} />
              <span className="hidden sm:inline">Book App</span>
            </Link>

            {/* デスクトップナビゲーション */}
            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2 rounded-lg transition-colors',
                    pathname === item.href
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  )}
                >
                  <item.icon size={20} />
                  <span>{item.label}</span>
                </Link>
              ))}

              {/* インポート/エクスポート */}
              <div className="ml-2 pl-2 border-l border-gray-200 flex items-center gap-1">
                <button
                  onClick={handleExport}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
                  title="エクスポート"
                >
                  <Download size={20} />
                  <span className="hidden lg:inline">エクスポート</span>
                </button>
                <label className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer">
                  <Upload size={20} />
                  <span className="hidden lg:inline">インポート</span>
                  <input
                    ref={importInputRef}
                    type="file"
                    accept=".json"
                    onChange={handleImport}
                    className="hidden"
                  />
                </label>
              </div>

              {/* ユーザーメニュー */}
              {!loading && user && (
                <div className="ml-2 pl-2 border-l border-gray-200 flex items-center gap-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <User size={18} />
                    <span className="hidden lg:inline max-w-32 truncate">{user.email}</span>
                  </div>
                  <button
                    onClick={signOut}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors"
                    title="ログアウト"
                  >
                    <LogOut size={20} />
                  </button>
                </div>
              )}
            </div>

            {/* モバイルメニューボタン */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* モバイルメニュー */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white">
            <div className="px-4 py-3 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-3 py-3 rounded-lg transition-colors',
                    pathname === item.href
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  )}
                >
                  <item.icon size={20} />
                  <span>{item.label}</span>
                </Link>
              ))}

              <div className="border-t border-gray-200 pt-2 mt-2">
                <button
                  onClick={() => { handleExport(); setMobileMenuOpen(false); }}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-gray-600 hover:bg-gray-100"
                >
                  <Download size={20} />
                  <span>エクスポート</span>
                </button>
                <label className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-gray-600 hover:bg-gray-100 cursor-pointer">
                  <Upload size={20} />
                  <span>インポート</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={(e) => { handleImport(e); setMobileMenuOpen(false); }}
                    className="hidden"
                  />
                </label>
              </div>

              {!loading && user && (
                <div className="border-t border-gray-200 pt-2 mt-2">
                  <div className="flex items-center gap-3 px-3 py-2 text-sm text-gray-600">
                    <User size={18} />
                    <span className="truncate">{user.email}</span>
                  </div>
                  <button
                    onClick={() => { signOut(); setMobileMenuOpen(false); }}
                    className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-red-600 hover:bg-red-50"
                  >
                    <LogOut size={20} />
                    <span>ログアウト</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* モバイル用ボトムナビゲーション */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
        <div className="flex items-center justify-around h-16">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors',
                pathname === item.href
                  ? 'text-primary-600'
                  : 'text-gray-500'
              )}
            >
              <item.icon size={22} />
              <span className="text-xs">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </>
  )
}
