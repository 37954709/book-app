import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

// GET /api/users/search - ユーザー検索
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')

    if (!query || query.trim().length < 2) {
      return NextResponse.json({ users: [] })
    }

    const users = await prisma.profile.findMany({
      where: {
        AND: [
          { id: { not: user.id } }, // 自分は除外
          {
            OR: [
              { name: { contains: query, mode: 'insensitive' } },
              { email: { contains: query, mode: 'insensitive' } },
            ],
          },
        ],
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
        _count: {
          select: {
            books: true,
            followers: true,
          },
        },
      },
      take: 20,
    })

    // フォロー状態を取得
    const followingIds = await prisma.follow.findMany({
      where: {
        followerId: user.id,
        followingId: { in: users.map((u) => u.id) },
      },
      select: { followingId: true },
    })

    const followingSet = new Set(followingIds.map((f) => f.followingId))

    const usersWithFollowStatus = users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      avatarUrl: u.avatarUrl,
      bookCount: u._count.books,
      followerCount: u._count.followers,
      isFollowing: followingSet.has(u.id),
    }))

    return NextResponse.json({ users: usersWithFollowStatus })
  } catch (error) {
    console.error('Error searching users:', error)
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json(
      { error: 'Failed to search users' },
      { status: 500 }
    )
  }
}
