'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { Book, BookStatus, Priority } from '@/types/book'
import { BookCover } from '@/components/BookCover'
import { StatusBadge } from '@/components/StatusBadge'
import { StarRating } from '@/components/StarRating'
import { PriorityBadge } from '@/components/PriorityBadge'
import { TagBadge } from '@/components/TagBadge'
import { Button } from '@/components/Button'
import { formatDateJa, formatPrice } from '@/lib/utils'
import {
  Loader2,
  Pencil,
  Trash2,
  ShoppingCart,
  ExternalLink,
  ArrowLeft,
} from 'lucide-react'

export default function BookDetailPage() {
  const params = useParams()
  const id = params.id as string
  const router = useRouter()
  const [book, setBook] = useState<Book | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isPurchasing, setIsPurchasing] = useState(false)

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const res = await fetch(`/api/books/${id}`)
        if (!res.ok) throw new Error('Book not found')
        const data = await res.json()
        setBook(data)
      } catch (error) {
        console.error('Error fetching book:', error)
        router.push('/')
      } finally {
        setIsLoading(false)
      }
    }

    fetchBook()
  }, [id, router])

  const handleDelete = async () => {
    if (!confirm('この本を削除しますか？')) return

    setIsDeleting(true)
    try {
      const res = await fetch(`/api/books/${id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        router.push('/')
      }
    } catch (error) {
      console.error('Error deleting book:', error)
      alert('削除に失敗しました')
    } finally {
      setIsDeleting(false)
    }
  }

  const handlePurchase = async () => {
    if (!confirm('この本を購入済みにしますか？')) return

    setIsPurchasing(true)
    try {
      const res = await fetch(`/api/books/${id}/purchase`, {
        method: 'POST',
      })

      if (res.ok) {
        const updatedBook = await res.json()
        setBook(updatedBook)
      }
    } catch (error) {
      console.error('Error purchasing book:', error)
      alert('操作に失敗しました')
    } finally {
      setIsPurchasing(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    )
  }

  if (!book) {
    return null
  }

  const isWishlist = book.status === BookStatus.WISHLIST

  return (
    <div className="max-w-4xl mx-auto">
      {/* 戻るボタン */}
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft size={20} />
        一覧に戻る
      </Link>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {/* ヘッダー */}
        <div className="p-6 border-b border-gray-200 flex flex-col sm:flex-row gap-6">
          <BookCover
            coverUrl={book.coverUrl}
            coverPath={book.coverPath}
            title={book.title}
            size="lg"
          />

          <div className="flex-1">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{book.title}</h1>
                {book.author && (
                  <p className="text-lg text-gray-600 mt-1">{book.author}</p>
                )}
              </div>
              <StatusBadge status={book.status as BookStatus} />
            </div>

            {book.publisher && (
              <p className="text-gray-500 mt-2">{book.publisher}</p>
            )}

            {book.isbn && (
              <p className="text-sm text-gray-400 mt-1">ISBN: {book.isbn}</p>
            )}

            <div className="mt-4 flex flex-wrap items-center gap-3">
              {isWishlist && (
                <PriorityBadge priority={book.priority as Priority} />
              )}
              {book.rating && (
                <StarRating rating={book.rating} readonly />
              )}
              {book.owned && (
                <span className="text-sm text-green-600 font-medium">所持</span>
              )}
            </div>

            {book.tags.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {book.tags.map((bt) => (
                  <TagBadge key={bt.tag.id} name={bt.tag.name} />
                ))}
              </div>
            )}

            {/* アクションボタン */}
            <div className="mt-6 flex flex-wrap gap-3">
              {isWishlist && (
                <Button
                  onClick={handlePurchase}
                  isLoading={isPurchasing}
                  className="bg-pink-600 hover:bg-pink-700"
                >
                  <ShoppingCart size={18} className="mr-2" />
                  購入済みにする
                </Button>
              )}
              <Link href={`/books/${id}/edit`}>
                <Button variant="secondary">
                  <Pencil size={18} className="mr-2" />
                  編集
                </Button>
              </Link>
              <Button
                variant="danger"
                onClick={handleDelete}
                isLoading={isDeleting}
              >
                <Trash2 size={18} className="mr-2" />
                削除
              </Button>
            </div>
          </div>
        </div>

        {/* 詳細情報 */}
        <div className="p-6 space-y-6">
          {/* ウィッシュリスト情報 */}
          {isWishlist && (
            <section className="p-4 bg-pink-50 rounded-lg">
              <h2 className="font-semibold text-pink-800 mb-3">欲しい本の情報</h2>
              <dl className="grid grid-cols-2 gap-4">
                {book.price && (
                  <div>
                    <dt className="text-sm text-gray-500">価格</dt>
                    <dd className="font-medium">{formatPrice(book.price)}</dd>
                  </div>
                )}
                {book.plannedPurchaseDate && (
                  <div>
                    <dt className="text-sm text-gray-500">購入予定日</dt>
                    <dd className="font-medium">
                      {formatDateJa(book.plannedPurchaseDate)}
                    </dd>
                  </div>
                )}
                {book.purchaseUrl && (
                  <div className="col-span-2">
                    <dt className="text-sm text-gray-500">購入先</dt>
                    <dd>
                      <a
                        href={book.purchaseUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-primary-600 hover:text-primary-800"
                      >
                        リンクを開く
                        <ExternalLink size={14} />
                      </a>
                    </dd>
                  </div>
                )}
              </dl>
            </section>
          )}

          {/* 日付情報 */}
          <section>
            <h2 className="font-semibold text-gray-800 mb-3">日付</h2>
            <dl className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <dt className="text-sm text-gray-500">登録日</dt>
                <dd>{formatDateJa(book.createdAt)}</dd>
              </div>
              {book.purchaseDate && (
                <div>
                  <dt className="text-sm text-gray-500">購入日</dt>
                  <dd>{formatDateJa(book.purchaseDate)}</dd>
                </div>
              )}
              {book.finishedDate && (
                <div>
                  <dt className="text-sm text-gray-500">読了日</dt>
                  <dd>{formatDateJa(book.finishedDate)}</dd>
                </div>
              )}
            </dl>
          </section>

          {/* メモ */}
          {book.memo && (
            <section>
              <h2 className="font-semibold text-gray-800 mb-3">メモ</h2>
              <p className="text-gray-700 whitespace-pre-wrap">{book.memo}</p>
            </section>
          )}

          {/* 感想 */}
          {book.review && (
            <section>
              <h2 className="font-semibold text-gray-800 mb-3">感想</h2>
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                {book.review}
              </p>
            </section>
          )}
        </div>
      </div>
    </div>
  )
}
