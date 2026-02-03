import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { BookStatus } from '@/types/book'
import { requireAuth } from '@/lib/auth'

// GET /api/stats - 統計情報取得
export async function GET() {
  try {
    const user = await requireAuth()

    // 今月の開始日
    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

    // ユーザーの本のみフィルター
    const userFilter = { userId: user.id }

    // 並列でクエリ実行
    const [
      total,
      wishlist,
      unread,
      reading,
      finished,
      highPriorityWishlist,
      thisMonthFinished,
      avgRatingResult,
    ] = await Promise.all([
      // 総数
      prisma.book.count({ where: userFilter }),

      // 欲しい本
      prisma.book.count({
        where: { ...userFilter, status: BookStatus.WISHLIST },
      }),

      // 未読
      prisma.book.count({
        where: { ...userFilter, status: BookStatus.UNREAD },
      }),

      // 読書中
      prisma.book.count({
        where: { ...userFilter, status: BookStatus.READING },
      }),

      // 読了
      prisma.book.count({
        where: { ...userFilter, status: BookStatus.FINISHED },
      }),

      // 優先度：高のウィッシュリスト
      prisma.book.count({
        where: {
          ...userFilter,
          status: BookStatus.WISHLIST,
          priority: 1,
        },
      }),

      // 今月の読了数
      prisma.book.count({
        where: {
          ...userFilter,
          status: BookStatus.FINISHED,
          finishedDate: {
            gte: monthStart,
          },
        },
      }),

      // 平均評価
      prisma.book.aggregate({
        where: {
          ...userFilter,
          rating: { not: null },
        },
        _avg: {
          rating: true,
        },
      }),
    ])

    const stats = {
      total,
      wishlist,
      unread,
      reading,
      finished,
      highPriorityWishlist,
      thisMonthFinished,
      averageRating: avgRatingResult._avg.rating
        ? Math.round(avgRatingResult._avg.rating * 10) / 10
        : null,
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    )
  }
}
