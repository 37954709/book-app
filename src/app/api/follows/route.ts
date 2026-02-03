import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

// GET /api/follows - フォロー一覧取得
export async function GET() {
  try {
    const user = await requireAuth()

    const follows = await prisma.follow.findMany({
      where: { followerId: user.id },
      include: {
        following: {
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
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    const followingUsers = follows.map((f) => ({
      followId: f.id,
      id: f.following.id,
      name: f.following.name,
      email: f.following.email,
      avatarUrl: f.following.avatarUrl,
      bookCount: f.following._count.books,
      followerCount: f.following._count.followers,
      followedAt: f.createdAt,
    }))

    return NextResponse.json({ following: followingUsers })
  } catch (error) {
    console.error('Error fetching follows:', error)
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json(
      { error: 'Failed to fetch follows' },
      { status: 500 }
    )
  }
}

// POST /api/follows - フォローする
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    const body = await request.json()
    const { userId } = body

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      )
    }

    // 自分自身はフォローできない
    if (userId === user.id) {
      return NextResponse.json(
        { error: 'Cannot follow yourself' },
        { status: 400 }
      )
    }

    // フォロー対象のユーザーが存在するか確認
    const targetUser = await prisma.profile.findUnique({
      where: { id: userId },
    })

    if (!targetUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // 既にフォローしているか確認
    const existingFollow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: user.id,
          followingId: userId,
        },
      },
    })

    if (existingFollow) {
      return NextResponse.json(
        { error: 'Already following this user' },
        { status: 409 }
      )
    }

    // フォローを作成
    const follow = await prisma.follow.create({
      data: {
        followerId: user.id,
        followingId: userId,
      },
    })

    return NextResponse.json(follow, { status: 201 })
  } catch (error) {
    console.error('Error creating follow:', error)
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json(
      { error: 'Failed to create follow' },
      { status: 500 }
    )
  }
}
