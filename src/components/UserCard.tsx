'use client'

import Link from 'next/link'
import { User, BookOpen, Users, UserPlus, UserMinus } from 'lucide-react'
import { Button } from './Button'

interface UserCardProps {
  id: string
  name: string | null
  email: string
  avatarUrl: string | null
  bookCount: number
  followerCount: number
  isFollowing: boolean
  followId?: number
  onFollow?: () => void
  onUnfollow?: () => void
  isLoading?: boolean
}

export function UserCard({
  id,
  name,
  email,
  avatarUrl,
  bookCount,
  followerCount,
  isFollowing,
  onFollow,
  onUnfollow,
  isLoading,
}: UserCardProps) {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-soft p-4 border border-gray-100/50 hover:shadow-soft-lg transition-all duration-300">
      <div className="flex items-center gap-4">
        <Link href={`/users/${id}`} className="flex-shrink-0">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={name || 'User'}
              className="w-14 h-14 rounded-full object-cover"
            />
          ) : (
            <div className="w-14 h-14 bg-gradient-to-br from-primary-100 to-purple-100 rounded-full flex items-center justify-center">
              <User size={24} className="text-primary-500" />
            </div>
          )}
        </Link>

        <div className="flex-1 min-w-0">
          <Link href={`/users/${id}`} className="block group">
            <h3 className="font-semibold text-gray-800 truncate group-hover:text-primary-600 transition-colors">
              {name || 'Unknown User'}
            </h3>
            <p className="text-sm text-gray-500 truncate">{email}</p>
          </Link>

          <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <BookOpen size={14} />
              {bookCount}冊
            </span>
            <span className="flex items-center gap-1">
              <Users size={14} />
              {followerCount}人
            </span>
          </div>
        </div>

        <div className="flex-shrink-0">
          {isFollowing ? (
            <Button
              variant="secondary"
              size="sm"
              onClick={onUnfollow}
              isLoading={isLoading}
              className="!text-gray-600"
            >
              <UserMinus size={16} className="mr-1" />
              フォロー中
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={onFollow}
              isLoading={isLoading}
            >
              <UserPlus size={16} className="mr-1" />
              フォロー
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
