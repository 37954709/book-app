import { NextRequest, NextResponse } from 'next/server'

interface GoogleBookItem {
  id: string
  volumeInfo: {
    title: string
    authors?: string[]
    publisher?: string
    publishedDate?: string
    description?: string
    industryIdentifiers?: { type: string; identifier: string }[]
    imageLinks?: {
      thumbnail?: string
      smallThumbnail?: string
    }
  }
}

interface GoogleBooksResponse {
  totalItems: number
  items?: GoogleBookItem[]
}

// GET /api/search-books?q=検索ワード
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')

    if (!query || query.trim().length < 2) {
      return NextResponse.json(
        { error: '検索ワードを2文字以上入力してください' },
        { status: 400 }
      )
    }

    const apiKey = process.env.GOOGLE_BOOKS_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Google Books APIキーが設定されていません' },
        { status: 500 }
      )
    }

    // Google Books API で検索（APIキー使用）
    // intitle: を追加して日本語タイトル検索を改善
    const apiUrl = `https://www.googleapis.com/books/v1/volumes?q=intitle:${encodeURIComponent(query)}&maxResults=20&key=${apiKey}`

    console.log('Searching Google Books with API key')

    const response = await fetch(apiUrl, {
      headers: {
        'Accept': 'application/json',
      },
      next: { revalidate: 0 },
    })

    console.log('Google Books API response status:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Google Books API error:', response.status, errorText)
      throw new Error(`Google Books API error: ${response.status}`)
    }

    const data: GoogleBooksResponse = await response.json()
    console.log('Google Books response:', data.totalItems, 'items')

    if (!data.items || data.items.length === 0) {
      return NextResponse.json({ books: [] })
    }

    // 結果を整形
    const books = data.items.map((item) => {
      const info = item.volumeInfo

      // ISBN を取得（ISBN_13 を優先）
      let isbn = ''
      if (info.industryIdentifiers) {
        const isbn13 = info.industryIdentifiers.find((id) => id.type === 'ISBN_13')
        const isbn10 = info.industryIdentifiers.find((id) => id.type === 'ISBN_10')
        isbn = isbn13?.identifier || isbn10?.identifier || ''
      }

      // 表紙画像URL（HTTPSに変換）
      let coverUrl = ''
      if (info.imageLinks?.thumbnail) {
        coverUrl = info.imageLinks.thumbnail.replace('http://', 'https://')
      }

      return {
        id: item.id,
        title: info.title || '',
        author: info.authors?.join(', ') || '',
        publisher: info.publisher || '',
        isbn,
        coverUrl,
        description: info.description || '',
        publishedDate: info.publishedDate || '',
      }
    })

    return NextResponse.json({ books })
  } catch (error) {
    console.error('Error searching books:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: '書籍検索に失敗しました', details: errorMessage },
      { status: 500 }
    )
  }
}
