'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/Button'
import { Input } from '@/components/Input'
import { BookOpen, Mail, CheckCircle } from 'lucide-react'

export default function SignupPage() {
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    if (password !== confirmPassword) {
      setError('パスワードが一致しません')
      setIsLoading(false)
      return
    }

    if (password.length < 6) {
      setError('パスワードは6文字以上で入力してください')
      setIsLoading(false)
      return
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      setError(error.message)
      setIsLoading(false)
      return
    }

    setIsSuccess(true)
    setIsLoading(false)
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-white rounded-lg shadow p-8">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
            <h2 className="mt-4 text-2xl font-bold text-gray-900">
              確認メールを送信しました
            </h2>
            <p className="mt-2 text-gray-600">
              {email} に確認メールを送信しました。
              メール内のリンクをクリックして登録を完了してください。
            </p>
            <Link href="/login">
              <Button className="mt-6">ログインページへ</Button>
            </Link>
          </div>
        </div>
      </div>
    )
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
          <p className="mt-2 text-gray-600">新規アカウントを作成</p>
        </div>

        {/* フォーム */}
        <div className="bg-white rounded-lg shadow p-8">
          <form onSubmit={handleSignup} className="space-y-6">
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
              label="パスワード（6文字以上）"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
            />

            <Input
              id="confirmPassword"
              type="password"
              label="パスワード（確認）"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              autoComplete="new-password"
            />

            <Button
              type="submit"
              className="w-full"
              isLoading={isLoading}
            >
              <Mail className="w-4 h-4 mr-2" />
              メールで登録
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            既にアカウントをお持ちの方は{' '}
            <Link href="/login" className="text-primary-600 hover:text-primary-500 font-medium">
              ログイン
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
