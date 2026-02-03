import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

// POST /api/import - データインポート（JSON）
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    const body = await request.json()

    if (!body.books || !Array.isArray(body.books)) {
      return NextResponse.json(
        { error: '無効なインポートデータです' },
        { status: 400 }
      )
    }

    let importedBooks = 0
    let importedTags = 0

    // タグのインポート（重複を避ける）
    if (body.tags && Array.isArray(body.tags)) {
      for (const tagName of body.tags) {
        try {
          await prisma.tag.upsert({
            where: {
              userId_name: { userId: user.id, name: tagName }
            },
            update: {},
            create: { name: tagName, userId: user.id },
          })
          importedTags++
        } catch {
          // 既存タグは無視
        }
      }
    }

    // 本のインポート
    for (const bookData of body.books) {
      try {
        // タグIDを取得
        const tagIds: number[] = []
        if (bookData.tags && Array.isArray(bookData.tags)) {
          for (const tagName of bookData.tags) {
            const tag = await prisma.tag.upsert({
              where: {
                userId_name: { userId: user.id, name: tagName }
              },
              update: {},
              create: { name: tagName, userId: user.id },
            })
            tagIds.push(tag.id)
          }
        }

        // 本を作成（ユーザーIDを付与）
        await prisma.book.create({
          data: {
            title: bookData.title,
            author: bookData.author || null,
            publisher: bookData.publisher || null,
            isbn: bookData.isbn || null,
            status: bookData.status || 'UNREAD',
            owned: bookData.owned ?? false,
            purchaseDate: bookData.purchaseDate ? new Date(bookData.purchaseDate) : null,
            finishedDate: bookData.finishedDate ? new Date(bookData.finishedDate) : null,
            rating: bookData.rating || null,
            memo: bookData.memo || null,
            review: bookData.review || null,
            coverUrl: bookData.coverUrl || null,
            coverPath: bookData.coverPath || null,
            price: bookData.price || null,
            plannedPurchaseDate: bookData.plannedPurchaseDate ? new Date(bookData.plannedPurchaseDate) : null,
            purchaseUrl: bookData.purchaseUrl || null,
            priority: bookData.priority ?? 2,
            userId: user.id,
            tags: {
              create: tagIds.map((tagId) => ({ tagId })),
            },
          },
        })
        importedBooks++
      } catch (error) {
        console.error('Error importing book:', bookData.title, error)
        // 個別の本のインポート失敗は無視して続行
      }
    }

    return NextResponse.json({
      success: true,
      importedBooks,
      importedTags,
    })
  } catch (error) {
    console.error('Error importing data:', error)
    return NextResponse.json(
      { error: 'Failed to import data' },
      { status: 500 }
    )
  }
}
