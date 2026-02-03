'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Book, BookStatus } from '@/types/book'
import { BookCard } from '@/components/BookCard'
import { SearchFilter } from '@/components/SearchFilter'
import { Loader2, BookOpen } from 'lucide-react'
import Link from 'next/link'

function BookList() {
  const searchParams = useSearchParams()
  const [books, setBooks] = useState<Book[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  useEffect(() => {
    const fetchBooks = async () => {
      setIsLoading(true)
      try {
        const params = new URLSearchParams(searchParams.toString())
        const res = await fetch(`/api/books?${params.toString()}`)
        const data = await res.json()
        // APIがエラーを返した場合は空配列にする
        if (Array.isArray(data)) {
          setBooks(data)
        } else {
          console.error('API returned non-array:', data)
          setBooks([])
        }
      } catch (error) {
        console.error('Error fetching books:', error)
        setBooks([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchBooks()
  }, [searchParams])

  const handlePurchase = async (id: number) => {
    if (!confirm('この本を購入済みにしますか？')) return

    try {
      const res = await fetch(`/api/books/${id}/purchase`, {
        method: 'POST',
      })

      if (res.ok) {
        setBooks((prev) =>
          prev.map((book) =>
            book.id === id
              ? { ...book, status: BookStatus.UNREAD, owned: true }
              : book
          )
        )
      }
    } catch (error) {
      console.error('Error purchasing book:', error)
    }
  }

  // 状態別のグループ化（オプション）
  const currentStatus = searchParams.get('status')
  const groupedBooks =
    currentStatus && currentStatus !== 'ALL'
      ? { [currentStatus]: books }
      : books.reduce<Record<string, Book[]>>((acc, book) => {
          const status = book.status
          if (!acc[status]) acc[status] = []
          acc[status].push(book)
          return acc
        }, {})

  const statusOrder = [BookStatus.WISHLIST, BookStatus.READING, BookStatus.UNREAD, BookStatus.FINISHED]

  const statusConfig: Record<BookStatus, { label: string; emoji: string }> = {
    WISHLIST: { label: '欲しい本', emoji: '💫' },
    UNREAD: { label: '未読', emoji: '📚' },
    READING: { label: '読書中', emoji: '📖' },
    FINISHED: { label: '読了', emoji: '✨' },
  }

  return (
    <div className="animate-fade-in">
      <SearchFilter viewMode={viewMode} onViewModeChange={setViewMode} />

      {isLoading ? (
        <div className="flex flex-col justify-center items-center py-16">
          <Loader2 className="w-10 h-10 animate-spin text-primary-500" />
          <p className="mt-4 text-gray-500 text-sm">読み込み中...</p>
        </div>
      ) : books.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-primary-100 to-purple-100 rounded-2xl flex items-center justify-center mb-4">
            <BookOpen className="w-10 h-10 text-primary-500" />
          </div>
          <p className="text-gray-600 font-medium mb-2">本が見つかりませんでした</p>
          <p className="text-gray-400 text-sm mb-6">最初の本を追加してみましょう</p>
          <Link
            href="/books/new"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-primary-500 to-purple-500 text-white px-6 py-2.5 rounded-xl font-medium shadow-md hover:shadow-lg transition-all duration-200"
          >
            本を追加
          </Link>
        </div>
      ) : currentStatus && currentStatus !== 'ALL' ? (
        <div
          className={
            viewMode === 'grid'
              ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4'
              : 'space-y-4'
          }
        >
          {books.map((book) => (
            <BookCard
              key={book.id}
              book={book}
              viewMode={viewMode}
              onPurchase={book.status === BookStatus.WISHLIST ? handlePurchase : undefined}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-10">
          {statusOrder.map((status) => {
            const statusBooks = groupedBooks[status]
            if (!statusBooks || statusBooks.length === 0) return null

            const config = statusConfig[status]

            return (
              <section key={status} className="animate-slide-up">
                <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <span className="w-1 h-5 bg-gradient-to-b from-primary-500 to-purple-500 rounded-full"></span>
                  <span>{config.emoji}</span>
                  {config.label}
                  <span className="ml-1 text-sm font-normal text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                    {statusBooks.length}冊
                  </span>
                </h2>
                <div
                  className={
                    viewMode === 'grid'
                      ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4'
                      : 'space-y-4'
                  }
                >
                  {statusBooks.map((book) => (
                    <BookCard
                      key={book.id}
                      book={book}
                      viewMode={viewMode}
                      onPurchase={book.status === BookStatus.WISHLIST ? handlePurchase : undefined}
                    />
                  ))}
                </div>
              </section>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col justify-center items-center py-16">
          <Loader2 className="w-10 h-10 animate-spin text-primary-500" />
          <p className="mt-4 text-gray-500 text-sm">読み込み中...</p>
        </div>
      }
    >
      <BookList />
    </Suspense>
  )
}
