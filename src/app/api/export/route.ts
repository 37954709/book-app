import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

// GET /api/export - データエクスポート（JSON）
export async function GET() {
  try {
    const user = await requireAuth()

    const [books, tags] = await Promise.all([
      prisma.book.findMany({
        where: { userId: user.id },
        include: {
          tags: {
            include: {
              tag: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.tag.findMany({
        where: { userId: user.id },
        orderBy: { name: 'asc' },
      }),
    ])

    // エクスポート用のデータ構造
    const exportData = {
      exportedAt: new Date().toISOString(),
      version: '1.0',
      books: books.map((book) => ({
        ...book,
        tags: book.tags.map((bt) => bt.tag.name),
      })),
      tags: tags.map((tag) => tag.name),
    }

    return NextResponse.json(exportData, {
      headers: {
        'Content-Disposition': `attachment; filename="book-app-export-${new Date().toISOString().split('T')[0]}.json"`,
      },
    })
  } catch (error) {
    console.error('Error exporting data:', error)
    return NextResponse.json(
      { error: 'Failed to export data' },
      { status: 500 }
    )
  }
}
