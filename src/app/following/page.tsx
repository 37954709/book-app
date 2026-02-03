'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Users, UserPlus } from 'lucide-react'
import { UserCard } from '@/components/UserCard'
import { Button } from '@/components/Button'
import { FollowingUser } from '@/types/user'

export default function FollowingPage() {
  const [following, setFollowing] = useState<FollowingUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadingId, setLoadingId] = useState<string | null>(null)

  useEffect(() => {
    fetchFollowing()
  }, [])

  const fetchFollowing = async () => {
    try {
      const res = await fetch('/api/follows')
      const data = await res.json()
      setFollowing(data.following || [])
    } catch (error) {
      console.error('Fetch error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleUnfollow = async (followId: number, userId: string) => {
    setLoadingId(userId)
    try {
      const res = await fetch(`/api/follows/${followId}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        setFollowing((prev) => prev.filter((f) => f.followId !== followId))
      }
    } catch (error) {
      console.error('Unfollow error:', error)
    } finally {
      setLoadingId(null)
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-48"></div>
          <div className="h-24 bg-gray-200 rounded-2xl"></div>
          <div className="h-24 bg-gray-200 rounded-2xl"></div>
          <div className="h-24 bg-gray-200 rounded-2xl"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-2">
            <Users size={28} className="text-primary-600" />
            フォロー中
          </h1>
          <p className="text-gray-500 mt-1">
            {following.length}人をフォロー中
          </p>
        </div>
        <Link href="/friends">
          <Button variant="secondary">
            <UserPlus size={18} className="mr-2" />
            ユーザーを探す
          </Button>
        </Link>
      </div>

      {following.length === 0 ? (
        <div className="text-center py-12 bg-gradient-to-br from-primary-50 to-purple-50 rounded-2xl">
          <Users size={48} className="mx-auto text-primary-300 mb-3" />
          <p className="text-gray-600 mb-4">まだ誰もフォローしていません</p>
          <Link href="/friends">
            <Button>
              <UserPlus size={18} className="mr-2" />
              ユーザーを探す
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {following.map((user) => (
            <UserCard
              key={user.id}
              id={user.id}
              name={user.name}
              avatarUrl={user.avatarUrl}
              bookCount={user.bookCount}
              followerCount={user.followerCount}
              isFollowing={true}
              followId={user.followId}
              onUnfollow={() => handleUnfollow(user.followId, user.id)}
              isLoading={loadingId === user.id}
            />
          ))}
        </div>
      )}
    </div>
  )
}
