'use client'

import { useState, useCallback } from 'react'
import { Search, Users } from 'lucide-react'
import { UserCard } from '@/components/UserCard'
import { UserSearchResult } from '@/types/user'
import { debounce } from '@/lib/utils'

export default function FriendsPage() {
  const [query, setQuery] = useState('')
  const [users, setUsers] = useState<UserSearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [hasSearched, setHasSearched] = useState(false)

  const searchUsers = useCallback(
    debounce(async (q: string) => {
      if (q.trim().length < 2) {
        setUsers([])
        setHasSearched(false)
        return
      }

      setIsSearching(true)
      try {
        const res = await fetch(`/api/users/search?q=${encodeURIComponent(q)}`)
        const data = await res.json()
        setUsers(data.users || [])
        setHasSearched(true)
      } catch (error) {
        console.error('Search error:', error)
      } finally {
        setIsSearching(false)
      }
    }, 300),
    []
  )

  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)
    searchUsers(value)
  }

  const handleFollow = async (userId: string) => {
    setLoadingId(userId)
    try {
      const res = await fetch('/api/follows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      })

      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, isFollowing: true } : u))
        )
      }
    } catch (error) {
      console.error('Follow error:', error)
    } finally {
      setLoadingId(null)
    }
  }

  const handleUnfollow = async (userId: string) => {
    setLoadingId(userId)
    try {
      // まずフォローIDを取得
      const followRes = await fetch('/api/follows')
      const followData = await followRes.json()
      const follow = followData.following?.find((f: { id: string }) => f.id === userId)

      if (follow) {
        const res = await fetch(`/api/follows/${follow.followId}`, {
          method: 'DELETE',
        })

        if (res.ok) {
          setUsers((prev) =>
            prev.map((u) => (u.id === userId ? { ...u, isFollowing: false } : u))
          )
        }
      }
    } catch (error) {
      console.error('Unfollow error:', error)
    } finally {
      setLoadingId(null)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-2">
          <Users size={28} className="text-primary-600" />
          ユーザーを探す
        </h1>
        <p className="text-gray-500 mt-1">
          フォローしたユーザーの本棚を見ることができます
        </p>
      </div>

      {/* 検索バー */}
      <div className="relative mb-6">
        <Search
          size={20}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          type="text"
          value={query}
          onChange={handleQueryChange}
          placeholder="ユーザーネームで検索..."
          className="w-full pl-12 pr-4 py-3 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
        />
      </div>

      {/* 検索中 */}
      {isSearching && (
        <div className="text-center py-8">
          <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full mx-auto"></div>
          <p className="text-gray-500 mt-2">検索中...</p>
        </div>
      )}

      {/* 検索結果 */}
      {!isSearching && hasSearched && users.length === 0 && (
        <div className="text-center py-12 bg-white/50 rounded-2xl">
          <Users size={48} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500">ユーザーが見つかりませんでした</p>
        </div>
      )}

      {!isSearching && users.length > 0 && (
        <div className="space-y-3">
          {users.map((user) => (
            <UserCard
              key={user.id}
              id={user.id}
              name={user.name}
              avatarUrl={user.avatarUrl}
              bookCount={user.bookCount}
              followerCount={user.followerCount}
              isFollowing={user.isFollowing}
              onFollow={() => handleFollow(user.id)}
              onUnfollow={() => handleUnfollow(user.id)}
              isLoading={loadingId === user.id}
            />
          ))}
        </div>
      )}

      {/* 検索前の説明 */}
      {!hasSearched && !isSearching && (
        <div className="text-center py-12 bg-gradient-to-br from-primary-50 to-purple-50 rounded-2xl">
          <Search size={48} className="mx-auto text-primary-300 mb-3" />
          <p className="text-gray-600">2文字以上入力して検索してください</p>
        </div>
      )}
    </div>
  )
}
