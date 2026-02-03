import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

// GET /api/tags - タグ一覧取得
export async function GET() {
  try {
    const user = await requireAuth()

    const tags = await prisma.tag.findMany({
      where: { userId: user.id },
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { books: true },
        },
      },
    })

    // キャッシュヘッダーを追加（60秒間キャッシュ）
    return NextResponse.json(tags, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
      },
    })
  } catch (error) {
    console.error('Error fetching tags:', error)
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json(
      { error: 'Failed to fetch tags' },
      { status: 500 }
    )
  }
}

// POST /api/tags - タグ作成
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    const body = await request.json()
    const { name } = body

    if (!name || name.trim() === '') {
      return NextResponse.json(
        { error: 'タグ名は必須です' },
        { status: 400 }
      )
    }

    // 既存タグのチェック（同じユーザー内で）
    const existingTag = await prisma.tag.findFirst({
      where: {
        userId: user.id,
        name: name.trim(),
      },
    })

    if (existingTag) {
      return NextResponse.json(
        { error: '同名のタグが既に存在します' },
        { status: 400 }
      )
    }

    const tag = await prisma.tag.create({
      data: {
        name: name.trim(),
        userId: user.id,
      },
    })

    return NextResponse.json(tag, { status: 201 })
  } catch (error) {
    console.error('Error creating tag:', error)
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json(
      { error: 'Failed to create tag' },
      { status: 500 }
    )
  }
}
