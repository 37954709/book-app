'use client'

import { useState } from 'react'
import { Input } from './Input'
import { Button } from './Button'
import { BookCover } from './BookCover'
import { Search, X, Loader2 } from 'lucide-react'

interface SearchResult {
  id: string
  title: string
  author: string
  publisher: string
  isbn: string
  coverUrl: string
  description: string
  publishedDate: string
}

interface BookSearchModalProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (book: SearchResult) => void
}

export function BookSearchModal({ isOpen, onClose, onSelect }: BookSearchModalProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSearch = async (e?: React.FormEvent | React.MouseEvent) => {
    e?.preventDefault()
    if (!query.trim() || query.length < 2) return

    setIsLoading(true)
    setHasSearched(true)
    setError(null)

    try {
      const res = await fetch(`/api/search-books?q=${encodeURIComponent(query)}`)
      const data = await res.json()

      console.log('Search response:', data)

      if (data.error) {
        setError(data.error)
        setResults([])
      } else {
        setResults(data.books || [])
      }
    } catch (err) {
      console.error('Search error:', err)
      setError('検索中にエラーが発生しました')
      setResults([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSelect = (book: SearchResult) => {
    onSelect(book)
    onClose()
    setQuery('')
    setResults([])
    setHasSearched(false)
    setError(null)
  }

  const handleClose = () => {
    onClose()
    setQuery('')
    setResults([])
    setHasSearched(false)
    setError(null)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
        {/* ヘッダー */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">書籍を検索</h2>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <X size={20} />
          </button>
        </div>

        {/* 検索フォーム */}
        <div className="p-4 border-b">
          <div className="flex gap-2">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="タイトル、著者、ISBNで検索..."
              className="flex-1"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleSearch()
                }
              }}
            />
            <Button
              type="button"
              onClick={handleSearch}
              disabled={isLoading || query.length < 2}
            >
              {isLoading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Search size={18} />
              )}
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Google Books APIを使用して検索します
          </p>
        </div>

        {/* 検索結果 */}
        <div className="flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 size={32} className="animate-spin text-primary-600" />
            </div>
          ) : error ? (
            <p className="text-center text-red-500 py-8">{error}</p>
          ) : results.length > 0 ? (
            <div className="space-y-3">
              {results.map((book) => (
                <button
                  key={book.id}
                  onClick={() => handleSelect(book)}
                  className="w-full flex gap-4 p-3 rounded-lg border border-gray-200 hover:border-primary-500 hover:bg-primary-50 transition-colors text-left"
                >
                  <BookCover
                    coverUrl={book.coverUrl}
                    coverPath={null}
                    title={book.title}
                    size="sm"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 line-clamp-1">
                      {book.title}
                    </h3>
                    {book.author && (
                      <p className="text-sm text-gray-600 line-clamp-1">
                        {book.author}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-2 mt-1 text-xs text-gray-500">
                      {book.publisher && <span>{book.publisher}</span>}
                      {book.isbn && <span>ISBN: {book.isbn}</span>}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : hasSearched ? (
            <p className="text-center text-gray-500 py-8">
              検索結果が見つかりませんでした
            </p>
          ) : (
            <p className="text-center text-gray-400 py-8">
              検索ワードを入力してください
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
