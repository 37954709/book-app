import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { Prisma } from '@prisma/client'

// GET /api/users/[id]/lists - 特定ユーザーの本一覧取得
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await requireAuth()
    const { id: userId } = await params
    const { searchParams } = new URL(request.url)

    // ユーザーが存在するか確認
    const targetUser = await prisma.profile.findUnique({
      where: { id: userId },
    })

    if (!targetUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // 自分自身か、フォローしているユーザーのみ閲覧可能
    const isMe = userId === currentUser.id
    if (!isMe) {
      const follow = await prisma.follow.findUnique({
        where: {
          followerId_followingId: {
            followerId: currentUser.id,
            followingId: userId,
          },
        },
      })

      if (!follow) {
        return NextResponse.json(
          { error: 'You need to follow this user to view their books' },
          { status: 403 }
        )
      }
    }

    // フィルタパラメータ
    const status = searchParams.get('status') || 'ALL'
    const category = searchParams.get('category') || 'ALL'
    const sort = searchParams.get('sort') || 'createdAt'
    const order = searchParams.get('order') || 'desc'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '1000')
    const skip = (page - 1) * limit

    // フィルタ条件
    const where: Prisma.BookWhereInput = { userId }

    if (status !== 'ALL') {
      where.status = status
    }

    if (category !== 'ALL') {
      where.category = category
    }

    // ソート条件
    type SortField = 'createdAt' | 'finishedDate' | 'rating' | 'priority' | 'category'
    const orderBy: Prisma.BookOrderByWithRelationInput = {}
    const sortField = sort as SortField

    if (['createdAt', 'finishedDate', 'rating', 'priority', 'category'].includes(sortField)) {
      orderBy[sortField] = order as 'asc' | 'desc'
    } else {
      orderBy.createdAt = 'desc'
    }

    const [books, total] = await Promise.all([
      prisma.book.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          tags: {
            include: { tag: true },
          },
        },
      }),
      prisma.book.count({ where }),
    ])

    return NextResponse.json({
      user: {
        id: targetUser.id,
        name: targetUser.name,
        avatarUrl: targetUser.avatarUrl,
      },
      books,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: skip + books.length < total,
      },
    })
  } catch (error) {
    console.error('Error fetching user lists:', error)
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json(
      { error: 'Failed to fetch user lists' },
      { status: 500 }
    )
  }
}
