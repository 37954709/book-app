import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

// GET /api/profile - 自分のプロフィール取得
export async function GET() {
  try {
    const user = await requireAuth()

    const profile = await prisma.profile.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
        createdAt: true,
      },
    })

    return NextResponse.json(profile)
  } catch (error) {
    console.error('Error fetching profile:', error)
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    )
  }
}

// PUT /api/profile - プロフィール更新
export async function PUT(request: NextRequest) {
  try {
    const user = await requireAuth()
    const body = await request.json()
    const { name } = body

    if (!name || name.trim().length < 2) {
      return NextResponse.json(
        { error: 'ユーザーネームは2文字以上必要です' },
        { status: 400 }
      )
    }

    if (name.trim().length > 30) {
      return NextResponse.json(
        { error: 'ユーザーネームは30文字以内にしてください' },
        { status: 400 }
      )
    }

    const profile = await prisma.profile.update({
      where: { id: user.id },
      data: {
        name: name.trim(),
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
        createdAt: true,
      },
    })

    return NextResponse.json(profile)
  } catch (error) {
    console.error('Error updating profile:', error)
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    )
  }
}
