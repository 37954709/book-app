'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Book, BookStatus } from '@/types/book'
import { BookCard } from '@/components/BookCard'
import { SearchFilter } from '@/components/SearchFilter'
import { Loader2 } from 'lucide-react'

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

  return (
    <div>
      <SearchFilter viewMode={viewMode} onViewModeChange={setViewMode} />

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
        </div>
      ) : books.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">本が見つかりませんでした</p>
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
        <div className="space-y-8">
          {statusOrder.map((status) => {
            const statusBooks = groupedBooks[status]
            if (!statusBooks || statusBooks.length === 0) return null

            const statusLabels: Record<BookStatus, string> = {
              WISHLIST: '欲しい本',
              UNREAD: '未読',
              READING: '読書中',
              FINISHED: '読了',
            }

            return (
              <section key={status}>
                <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  {statusLabels[status as BookStatus]}
                  <span className="text-sm font-normal text-gray-500">
                    ({statusBooks.length}冊)
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
        <div className="flex justify-center items-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
        </div>
      }
    >
      <BookList />
    </Suspense>
  )
}
