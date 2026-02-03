import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { BookStatus } from '@/types/book'
import { requireAuth } from '@/lib/auth'

// GET /api/books/:id - 本の詳細取得
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth()
    const { id } = await params
    const bookId = parseInt(id)

    if (isNaN(bookId)) {
      return NextResponse.json(
        { error: 'Invalid book ID' },
        { status: 400 }
      )
    }

    const book = await prisma.book.findUnique({
      where: { id: bookId, userId: user.id },
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
      },
    })

    if (!book) {
      return NextResponse.json(
        { error: 'Book not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(book)
  } catch (error) {
    console.error('Error fetching book:', error)
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json(
      { error: 'Failed to fetch book' },
      { status: 500 }
    )
  }
}

// PUT /api/books/:id - 本の更新
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth()
    const { id } = await params
    const bookId = parseInt(id)

    if (isNaN(bookId)) {
      return NextResponse.json(
        { error: 'Invalid book ID' },
        { status: 400 }
      )
    }

    const body = await request.json()

    const {
      title,
      author,
      publisher,
      isbn,
      status,
      owned,
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
      priority,
      tagIds,
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

    // 既存の本を確認（自分の本のみ）
    const existingBook = await prisma.book.findUnique({
      where: { id: bookId, userId: user.id },
    })

    if (!existingBook) {
      return NextResponse.json(
        { error: 'Book not found' },
        { status: 404 }
      )
    }

    // タグの更新（既存を削除して再作成）
    if (tagIds !== undefined) {
      await prisma.bookTag.deleteMany({
        where: { bookId },
      })
    }

    // 読了に変更した場合、読了日を設定
    let finalFinishedDate = finishedDate ? new Date(finishedDate) : null
    if (status === BookStatus.FINISHED && !finishedDate && existingBook.status !== BookStatus.FINISHED) {
      finalFinishedDate = new Date()
    }

    const book = await prisma.book.update({
      where: { id: bookId },
      data: {
        title: title.trim(),
        author: author?.trim() || null,
        publisher: publisher?.trim() || null,
        isbn: isbn?.trim() || null,
        status,
        owned,
        category: category || null,
        purchaseDate: purchaseDate ? new Date(purchaseDate) : null,
        finishedDate: finalFinishedDate,
        rating: rating || null,
        memo: memo?.trim() || null,
        review: review?.trim() || null,
        coverUrl: coverUrl || null,
        coverPath: coverPath || null,
        price: price || null,
        plannedPurchaseDate: plannedPurchaseDate ? new Date(plannedPurchaseDate) : null,
        purchaseUrl: purchaseUrl?.trim() || null,
        priority: priority ?? 2,
        ...(tagIds !== undefined && {
          tags: {
            create: tagIds.map((tagId: number) => ({
              tagId,
            })),
          },
        }),
      },
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
      },
    })

    return NextResponse.json(book)
  } catch (error) {
    console.error('Error updating book:', error)
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json(
      { error: 'Failed to update book' },
      { status: 500 }
    )
  }
}

// DELETE /api/books/:id - 本の削除
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth()
    const { id } = await params
    const bookId = parseInt(id)

    if (isNaN(bookId)) {
      return NextResponse.json(
        { error: 'Invalid book ID' },
        { status: 400 }
      )
    }

    const existingBook = await prisma.book.findUnique({
      where: { id: bookId, userId: user.id },
    })

    if (!existingBook) {
      return NextResponse.json(
        { error: 'Book not found' },
        { status: 404 }
      )
    }

    await prisma.book.delete({
      where: { id: bookId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting book:', error)
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json(
      { error: 'Failed to delete book' },
      { status: 500 }
    )
  }
}
