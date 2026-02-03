/**
 * Open Library Covers API から表紙画像のURLを取得
 * @param isbn ISBN（10桁または13桁）
 * @param size 画像サイズ（S, M, L）
 * @returns 表紙画像のURL
 */
export function getOpenLibraryCoverUrl(isbn: string, size: 'S' | 'M' | 'L' = 'L'): string {
  // ISBNからハイフンを除去
  const cleanIsbn = isbn.replace(/-/g, '')
  return `https://covers.openlibrary.org/b/isbn/${cleanIsbn}-${size}.jpg`
}

/**
 * Open Library APIで表紙画像が存在するかチェック
 * @param isbn ISBN
 * @returns 存在すればURL、なければnull
 */
export async function checkCoverExists(isbn: string): Promise<string | null> {
  const url = getOpenLibraryCoverUrl(isbn, 'M')

  try {
    const response = await fetch(url, { method: 'HEAD' })

    // Open Libraryは画像がない場合も200を返すが、Content-Lengthが小さい（1x1ピクセルの透明画像）
    const contentLength = response.headers.get('content-length')
    if (contentLength && parseInt(contentLength) > 1000) {
      return getOpenLibraryCoverUrl(isbn, 'L')
    }
    return null
  } catch {
    return null
  }
}
