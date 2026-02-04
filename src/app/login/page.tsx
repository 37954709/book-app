'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/Button'
import { Input } from '@/components/Input'
import { BookOpen, Mail } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
      setIsLoading(false)
      return
    }

    router.push('/')
    router.refresh()
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full space-y-8">
        {/* ロゴ */}
        <div className="text-center">
          <div className="flex justify-center">
            <BookOpen className="w-12 h-12 text-primary-600" />
          </div>
          <h1 className="mt-4 text-3xl font-bold text-gray-900">Book App</h1>
          <p className="mt-2 text-gray-600">ログインしてください</p>
        </div>

        {/* フォーム */}
        <div className="bg-white rounded-lg shadow p-8">
          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="p-3 rounded-lg bg-red-50 text-red-700 text-sm">
                {error}
              </div>
            )}

            <Input
              id="email"
              type="email"
              label="メールアドレス"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />

            <Input
              id="password"
              type="password"
              label="パスワード"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />

            <Button
              type="submit"
              className="w-full"
              isLoading={isLoading}
            >
              <Mail className="w-4 h-4 mr-2" />
              メールでログイン
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            アカウントをお持ちでない方は{' '}
            <Link href="/signup" className="text-primary-600 hover:text-primary-500 font-medium">
              新規登録
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
