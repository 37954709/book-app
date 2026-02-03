'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Stats } from '@/types/book'
import { StarRating } from '@/components/StarRating'
import {
  Loader2,
  BookOpen,
  Heart,
  BookMarked,
  CheckCircle,
  Calendar,
  Star,
  AlertCircle,
} from 'lucide-react'

interface StatCardProps {
  title: string
  value: number | string
  icon: React.ReactNode
  color: string
  href?: string
}

function StatCard({ title, value, icon, color, href }: StatCardProps) {
  const content = (
    <div
      className={`p-6 rounded-lg shadow bg-white border-l-4 ${color} hover:shadow-md transition-shadow`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        <div className={`p-3 rounded-full bg-gray-100`}>{icon}</div>
      </div>
    </div>
  )

  if (href) {
    return <Link href={href}>{content}</Link>
  }

  return content
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/stats')
        const data = await res.json()
        setStats(data)
      } catch (error) {
        console.error('Error fetching stats:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">統計情報を取得できませんでした</p>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">ダッシュボード</h1>

      {/* 統計カード */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="総冊数"
          value={stats.total}
          icon={<BookOpen className="w-6 h-6 text-gray-600" />}
          color="border-gray-500"
        />
        <StatCard
          title="欲しい本"
          value={stats.wishlist}
          icon={<Heart className="w-6 h-6 text-pink-600" />}
          color="border-pink-500"
          href="/?status=WISHLIST"
        />
        <StatCard
          title="未読"
          value={stats.unread}
          icon={<BookMarked className="w-6 h-6 text-gray-600" />}
          color="border-gray-400"
          href="/?status=UNREAD"
        />
        <StatCard
          title="読書中"
          value={stats.reading}
          icon={<BookOpen className="w-6 h-6 text-blue-600" />}
          color="border-blue-500"
          href="/?status=READING"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="読了"
          value={stats.finished}
          icon={<CheckCircle className="w-6 h-6 text-green-600" />}
          color="border-green-500"
          href="/?status=FINISHED"
        />
        <StatCard
          title="今月の読了"
          value={stats.thisMonthFinished}
          icon={<Calendar className="w-6 h-6 text-purple-600" />}
          color="border-purple-500"
        />
        <StatCard
          title="優先度：高（欲しい本）"
          value={stats.highPriorityWishlist}
          icon={<AlertCircle className="w-6 h-6 text-red-600" />}
          color="border-red-500"
          href="/?status=WISHLIST&sort=priority&order=asc"
        />
        <div className="p-6 rounded-lg shadow bg-white border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">平均評価</p>
              <div className="mt-2">
                {stats.averageRating ? (
                  <div className="flex items-center gap-2">
                    <StarRating rating={Math.round(stats.averageRating)} readonly />
                    <span className="text-lg font-semibold text-gray-700">
                      {stats.averageRating}
                    </span>
                  </div>
                ) : (
                  <p className="text-gray-400">-</p>
                )}
              </div>
            </div>
            <div className="p-3 rounded-full bg-gray-100">
              <Star className="w-6 h-6 text-yellow-500" />
            </div>
          </div>
        </div>
      </div>

      {/* クイックリンク */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">クイックアクション</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            href="/books/new"
            className="flex flex-col items-center p-4 rounded-lg border border-gray-200 hover:border-primary-500 hover:bg-primary-50 transition-colors"
          >
            <BookOpen className="w-8 h-8 text-primary-600 mb-2" />
            <span className="text-sm text-gray-700">本を追加</span>
          </Link>
          <Link
            href="/?status=WISHLIST&sort=priority&order=asc"
            className="flex flex-col items-center p-4 rounded-lg border border-gray-200 hover:border-pink-500 hover:bg-pink-50 transition-colors"
          >
            <Heart className="w-8 h-8 text-pink-600 mb-2" />
            <span className="text-sm text-gray-700">欲しい本を見る</span>
          </Link>
          <Link
            href="/?status=READING"
            className="flex flex-col items-center p-4 rounded-lg border border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-colors"
          >
            <BookMarked className="w-8 h-8 text-blue-600 mb-2" />
            <span className="text-sm text-gray-700">読書中の本</span>
          </Link>
          <Link
            href="/?status=FINISHED&sort=finishedDate&order=desc"
            className="flex flex-col items-center p-4 rounded-lg border border-gray-200 hover:border-green-500 hover:bg-green-50 transition-colors"
          >
            <CheckCircle className="w-8 h-8 text-green-600 mb-2" />
            <span className="text-sm text-gray-700">最近読了した本</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
