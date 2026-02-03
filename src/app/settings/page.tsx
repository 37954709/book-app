'use client'

import { useState, useEffect } from 'react'
import { User, Settings, Save } from 'lucide-react'
import { Input } from '@/components/Input'
import { Button } from '@/components/Button'

interface Profile {
  id: string
  name: string | null
  email: string
  avatarUrl: string | null
  createdAt: string
}

export default function SettingsPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [name, setName] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/profile')
      if (res.ok) {
        const data = await res.json()
        setProfile(data)
        setName(data.name || '')
      }
    } catch (error) {
      console.error('Fetch profile error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setMessage(null)

    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      })

      if (res.ok) {
        const data = await res.json()
        setProfile(data)
        setMessage({ type: 'success', text: 'プロフィールを更新しました' })
      } else {
        const error = await res.json()
        setMessage({ type: 'error', text: error.error || '更新に失敗しました' })
      }
    } catch (error) {
      console.error('Update profile error:', error)
      setMessage({ type: 'error', text: '更新に失敗しました' })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-32"></div>
          <div className="h-32 bg-gray-200 rounded-2xl"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-2 mb-6">
        <Settings size={28} className="text-primary-600" />
        設定
      </h1>

      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-soft p-6 border border-gray-100/50">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <User size={20} />
          プロフィール
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* アバター */}
          <div className="flex items-center gap-4">
            {profile?.avatarUrl ? (
              <img
                src={profile.avatarUrl}
                alt={profile.name || 'User'}
                className="w-16 h-16 rounded-full object-cover"
              />
            ) : (
              <div className="w-16 h-16 bg-gradient-to-br from-primary-100 to-purple-100 rounded-full flex items-center justify-center">
                <User size={28} className="text-primary-500" />
              </div>
            )}
            <div>
              <p className="text-sm text-gray-500">メールアドレス</p>
              <p className="text-gray-800">{profile?.email}</p>
            </div>
          </div>

          {/* ユーザーネーム */}
          <Input
            label="ユーザーネーム"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="表示名を入力"
            maxLength={30}
          />
          <p className="text-sm text-gray-500 -mt-2">
            他のユーザーに表示される名前です。検索にも使用されます。
          </p>

          {/* メッセージ */}
          {message && (
            <div
              className={`p-3 rounded-lg text-sm ${
                message.type === 'success'
                  ? 'bg-green-50 text-green-700'
                  : 'bg-red-50 text-red-700'
              }`}
            >
              {message.text}
            </div>
          )}

          {/* 保存ボタン */}
          <div className="flex justify-end">
            <Button type="submit" isLoading={isSaving}>
              <Save size={18} className="mr-2" />
              保存
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
