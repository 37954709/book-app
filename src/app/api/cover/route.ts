import { NextRequest, NextResponse } from 'next/server'
import { checkCoverExists } from '@/lib/openLibrary'

// GET /api/cover?isbn=XXX - ISBN から表紙URLを取得
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const isbn = searchParams.get('isbn')

    if (!isbn) {
      return NextResponse.json(
        { error: 'ISBN is required' },
        { status: 400 }
      )
    }

    const coverUrl = await checkCoverExists(isbn)

    return NextResponse.json({
      isbn,
      coverUrl,
      found: coverUrl !== null,
    })
  } catch (error) {
    console.error('Error checking cover:', error)
    return NextResponse.json(
      { error: 'Failed to check cover' },
      { status: 500 }
    )
  }
}
