import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { BookStatus } from '@/types/book'
import { requireAuth } from '@/lib/auth'

// POST /api/books/:id/purchase - 欲しい本を購入済みに変更
export async function POST(
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
      where: { id: bookId },
    })

    if (!existingBook) {
      return NextResponse.json(
        { error: 'Book not found' },
        { status: 404 }
      )
    }

    // ユーザーの本かどうか確認
    if (existingBook.userId !== user.id) {
      return NextResponse.json(
        { error: 'Book not found' },
        { status: 404 }
      )
    }

    if (existingBook.status !== BookStatus.WISHLIST) {
      return NextResponse.json(
        { error: 'This book is not in wishlist' },
        { status: 400 }
      )
    }

    // 欲しい本 → 未読（所持）に変更
    const book = await prisma.book.update({
      where: { id: bookId },
      data: {
        status: BookStatus.UNREAD,
        owned: true,
        purchaseDate: new Date(),
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
    console.error('Error purchasing book:', error)
    return NextResponse.json(
      { error: 'Failed to purchase book' },
      { status: 500 }
    )
  }
}
