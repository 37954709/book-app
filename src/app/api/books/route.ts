import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { BookStatus } from '@/types/book'
import { Prisma } from '@prisma/client'
import { requireAuth } from '@/lib/auth'

// GET /api/books - 本の一覧取得（検索・フィルタ・ソート対応）
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()
    const { searchParams } = new URL(request.url)

    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || 'ALL'
    const owned = searchParams.get('owned')
    const rating = searchParams.get('rating')
    const tagId = searchParams.get('tagId')
    const sort = searchParams.get('sort') || 'createdAt'
    const order = searchParams.get('order') || 'desc'

    // フィルタ条件の構築（ユーザーIDで絞り込み）
    const where: Prisma.BookWhereInput = {
      userId: user.id,
    }

    // 検索（タイトル、著者、タグ名）
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { author: { contains: search, mode: 'insensitive' } },
        { tags: { some: { tag: { name: { contains: search, mode: 'insensitive' } } } } },
      ]
    }

    // 状態フィルタ
    if (status && status !== 'ALL') {
      where.status = status
    }

    // カテゴリフィルタ
    const category = searchParams.get('category')
    if (category && category !== 'ALL') {
      where.category = category
    }

    // 所持フィルタ
    if (owned !== null && owned !== 'ALL') {
      where.owned = owned === 'true'
    }

    // 評価フィルタ
    if (rating && rating !== 'ALL') {
      where.rating = parseInt(rating)
    }

    // タグフィルタ
    if (tagId) {
      where.tags = {
        some: {
          tagId: parseInt(tagId),
        },
      }
    }

    // ソート条件の構築
    type SortField = 'createdAt' | 'finishedDate' | 'rating' | 'priority' | 'plannedPurchaseDate'
    const orderBy: Prisma.BookOrderByWithRelationInput = {}
    const sortField = sort as SortField

    if (['createdAt', 'finishedDate', 'rating', 'priority', 'plannedPurchaseDate'].includes(sortField)) {
      orderBy[sortField] = order as 'asc' | 'desc'
    } else {
      orderBy.createdAt = 'desc'
    }

    const books = await prisma.book.findMany({
      where,
      orderBy,
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
      },
    })

    return NextResponse.json(books)
  } catch (error) {
    console.error('Error fetching books:', error)
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json(
      { error: 'Failed to fetch books' },
      { status: 500 }
    )
  }
}

// POST /api/books - 本の登録
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    const body = await request.json()

    const {
      title,
      author,
      publisher,
      isbn,
      status = BookStatus.UNREAD,
      owned = false,
      category,
      purchaseDate,
      finishedDate,
      rating,
      memo,
      review,
      coverUrl,
      coverPath,
      price,
      plannedPurchaseDate,
      purchaseUrl,
      priority = 2,
      tagIds = [],
    } = body

    // バリデーション
    if (!title || title.trim() === '') {
      return NextResponse.json(
        { error: 'タイトルは必須です' },
        { status: 400 }
      )
    }

    if (rating !== undefined && rating !== null && (rating < 1 || rating > 5)) {
      return NextResponse.json(
        { error: '評価は1〜5の範囲で入力してください' },
        { status: 400 }
      )
    }

    const book = await prisma.book.create({
      data: {
        title: title.trim(),
        author: author?.trim() || null,
        publisher: publisher?.trim() || null,
        isbn: isbn?.trim() || null,
        status,
        owned,
        category: category || null,
        purchaseDate: purchaseDate ? new Date(purchaseDate) : null,
        finishedDate: finishedDate ? new Date(finishedDate) : (status === BookStatus.FINISHED ? new Date() : null),
        rating: rating || null,
        memo: memo?.trim() || null,
        review: review?.trim() || null,
        coverUrl: coverUrl || null,
        coverPath: coverPath || null,
        price: price || null,
        plannedPurchaseDate: plannedPurchaseDate ? new Date(plannedPurchaseDate) : null,
        purchaseUrl: purchaseUrl?.trim() || null,
        priority: priority || 2,
        userId: user.id,
        tags: {
          create: tagIds.map((tagId: number) => ({
            tagId,
          })),
        },
      },
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
      },
    })

    return NextResponse.json(book, { status: 201 })
  } catch (error) {
    console.error('Error creating book:', error)
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json(
      { error: 'Failed to create book' },
      { status: 500 }
    )
  }
}
