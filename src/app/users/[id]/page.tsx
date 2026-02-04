'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { User, BookOpen, Users, UserPlus, UserMinus, ArrowLeft, Calendar } from 'lucide-react'
import { Button } from '@/components/Button'
import { BookCard } from '@/components/BookCard'
import { Select } from '@/components/Select'
import { UserProfile } from '@/types/user'
import { Book, statusLabels, categoryLabels } from '@/types/book'
import { formatDateJa } from '@/lib/utils'

export default function UserProfilePage() {
  const params = useParams()
  const id = params.id as string
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [books, setBooks] = useState<Book[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isFollowLoading, setIsFollowLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // フィルタ
  const [status, setStatus] = useState('ALL')
  const [category, setCategory] = useState('ALL')

  useEffect(() => {
    fetchProfile()
  }, [id])

  useEffect(() => {
    if (profile && (profile.isFollowing || profile.isMe)) {
      fetchBooks()
    }
  }, [profile, status, category])

  const fetchProfile = async () => {
    try {
      const res = await fetch(`/api/users/${id}`)
      if (!res.ok) {
        if (res.status === 404) {
          setError('ユーザーが見つかりません')
        } else {
          setError('エラーが発生しました')
        }
        return
      }
      const data = await res.json()
      setProfile(data)
    } catch (error) {
      console.error('Fetch profile error:', error)
      setError('エラーが発生しました')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchBooks = async () => {
    try {
      const searchParams = new URLSearchParams()
      if (status !== 'ALL') searchParams.set('status', status)
      if (category !== 'ALL') searchParams.set('category', category)

      const res = await fetch(`/api/users/${id}/lists?${searchParams.toString()}`)
      if (res.ok) {
        const data = await res.json()
        setBooks(data.books || [])
      }
    } catch (error) {
      console.error('Fetch books error:', error)
    }
  }

  const handleFollow = async () => {
    if (!profile) return
    setIsFollowLoading(true)
    try {
      const res = await fetch('/api/follows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: id }),
      })

      if (res.ok) {
        const data = await res.json()
        setProfile((prev) =>
          prev ? { ...prev, isFollowing: true, followId: data.id, followerCount: prev.followerCount + 1 } : null
        )
      }
    } catch (error) {
      console.error('Follow error:', error)
    } finally {
      setIsFollowLoading(false)
    }
  }

  const handleUnfollow = async () => {
    if (!profile || !profile.followId) return
    setIsFollowLoading(true)
    try {
      const res = await fetch(`/api/follows/${profile.followId}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        setProfile((prev) =>
          prev ? { ...prev, isFollowing: false, followId: null, followerCount: prev.followerCount - 1 } : null
        )
        setBooks([])
      }
    } catch (error) {
      console.error('Unfollow error:', error)
    } finally {
      setIsFollowLoading(false)
    }
  }

  const statusOptions = [
    { value: 'ALL', label: 'すべて' },
    ...Object.entries(statusLabels).map(([value, label]) => ({ value, label })),
  ]

  const categoryOptions = [
    { value: 'ALL', label: 'すべて' },
    ...Object.entries(categoryLabels).map(([value, label]) => ({ value, label })),
  ]

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="animate-pulse">
          <div className="h-32 bg-gray-200 rounded-2xl mb-6"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-48 bg-gray-200 rounded-2xl"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <User size={48} className="mx-auto text-gray-300 mb-4" />
        <p className="text-gray-500 mb-4">{error}</p>
        <Link href="/following">
          <Button variant="secondary">
            <ArrowLeft size={18} className="mr-2" />
            戻る
          </Button>
        </Link>
      </div>
    )
  }

  if (!profile) return null

  const canViewBooks = profile.isFollowing || profile.isMe

  return (
    <div className="max-w-4xl mx-auto">
      {/* 戻るリンク */}
      <Link
        href="/following"
        className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-4 transition-colors"
      >
        <ArrowLeft size={18} />
        フォロー一覧に戻る
      </Link>

      {/* プロフィールカード */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-soft p-6 mb-6 border border-gray-100/50">
        <div className="flex items-start gap-6">
          {/* アバター */}
          {profile.avatarUrl ? (
            <img
              src={profile.avatarUrl}
              alt={profile.name || 'User'}
              className="w-20 h-20 rounded-full object-cover"
            />
          ) : (
            <div className="w-20 h-20 bg-gradient-to-br from-primary-100 to-purple-100 rounded-full flex items-center justify-center">
              <User size={36} className="text-primary-500" />
            </div>
          )}

          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  {profile.name || 'Unknown User'}
                </h1>
                <p className="text-sm text-gray-400 mt-1 flex items-center gap-1">
                  <Calendar size={14} />
                  {formatDateJa(profile.createdAt)}から利用
                </p>
              </div>

              {!profile.isMe && (
                <div>
                  {profile.isFollowing ? (
                    <Button
                      variant="secondary"
                      onClick={handleUnfollow}
                      isLoading={isFollowLoading}
                    >
                      <UserMinus size={18} className="mr-2" />
                      フォロー中
                    </Button>
                  ) : (
                    <Button onClick={handleFollow} isLoading={isFollowLoading}>
                      <UserPlus size={18} className="mr-2" />
                      フォロー
                    </Button>
                  )}
                </div>
              )}
            </div>

            {/* 統計 */}
            <div className="flex items-center gap-6 mt-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary-600">{profile.bookCount}</div>
                <div className="text-sm text-gray-500 flex items-center gap-1 justify-center">
                  <BookOpen size={14} />
                  冊
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary-600">{profile.followerCount}</div>
                <div className="text-sm text-gray-500 flex items-center gap-1 justify-center">
                  <Users size={14} />
                  フォロワー
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary-600">{profile.followingCount}</div>
                <div className="text-sm text-gray-500 flex items-center gap-1 justify-center">
                  <Users size={14} />
                  フォロー中
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 本棚 */}
      {canViewBooks ? (
        <>
          {/* フィルタ */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-soft p-4 mb-6 border border-gray-100/50">
            <div className="flex flex-wrap gap-4">
              <div className="w-40">
                <Select
                  label="状態"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  options={statusOptions}
                />
              </div>
              <div className="w-48">
                <Select
                  label="カテゴリ"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  options={categoryOptions}
                />
              </div>
            </div>
          </div>

          {/* 本一覧 */}
          {books.length === 0 ? (
            <div className="text-center py-12 bg-white/50 rounded-2xl">
              <BookOpen size={48} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500">本が見つかりません</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {books.map((book) => (
                <BookCard key={book.id} book={book} viewMode="grid" />
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12 bg-gradient-to-br from-primary-50 to-purple-50 rounded-2xl">
          <BookOpen size={48} className="mx-auto text-primary-300 mb-3" />
          <p className="text-gray-600 mb-4">
            このユーザーの本棚を見るにはフォローしてください
          </p>
          <Button onClick={handleFollow} isLoading={isFollowLoading}>
            <UserPlus size={18} className="mr-2" />
            フォロー
          </Button>
        </div>
      )}
    </div>
  )
}
