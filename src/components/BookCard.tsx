'use client'

import Link from 'next/link'
import { Book, BookStatus, Priority } from '@/types/book'
import { BookCover } from './BookCover'
import { StatusBadge } from './StatusBadge'
import { StarRating } from './StarRating'
import { PriorityBadge } from './PriorityBadge'
import { TagBadge } from './TagBadge'
import { cn } from '@/lib/utils'
import { formatPrice, formatDateJa } from '@/lib/utils'
import { ShoppingCart } from 'lucide-react'

interface BookCardProps {
  book: Book
  viewMode: 'grid' | 'list'
  onPurchase?: (id: number) => void
}

export function BookCard({ book, viewMode, onPurchase }: BookCardProps) {
  const isWishlist = book.status === BookStatus.WISHLIST

  if (viewMode === 'grid') {
    return (
      <Link
        href={`/books/${book.id}`}
        className="group block bg-white rounded-lg shadow hover:shadow-md transition-shadow p-4"
      >
        <div className="flex flex-col items-center">
          <BookCover
            coverUrl={book.coverUrl}
            coverPath={book.coverPath}
            title={book.title}
            size="md"
            className="mb-3"
          />
          <h3 className="font-medium text-gray-900 text-center line-clamp-2 group-hover:text-primary-600 transition-colors">
            {book.title}
          </h3>
          {book.author && (
            <p className="text-sm text-gray-500 mt-1 text-center line-clamp-1">
              {book.author}
            </p>
          )}
          <div className="mt-2 flex flex-col items-center gap-1">
            <StatusBadge status={book.status as BookStatus} size="sm" />
            {isWishlist && (
              <PriorityBadge priority={book.priority as Priority} size="sm" />
            )}
            {book.rating && (
              <StarRating rating={book.rating} readonly size="sm" />
            )}
            {isWishlist && book.price && (
              <span className="text-sm text-gray-600">{formatPrice(book.price)}</span>
            )}
          </div>
          {isWishlist && onPurchase && (
            <button
              onClick={(e) => {
                e.preventDefault()
                onPurchase(book.id)
              }}
              className="mt-2 flex items-center gap-1 text-sm text-primary-600 hover:text-primary-800"
            >
              <ShoppingCart size={14} />
              購入済みにする
            </button>
          )}
        </div>
      </Link>
    )
  }

  return (
    <Link
      href={`/books/${book.id}`}
      className="group flex gap-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow p-4"
    >
      <BookCover
        coverUrl={book.coverUrl}
        coverPath={book.coverPath}
        title={book.title}
        size="sm"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-medium text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-1">
            {book.title}
          </h3>
          <StatusBadge status={book.status as BookStatus} size="sm" />
        </div>
        {book.author && (
          <p className="text-sm text-gray-500 mt-0.5">{book.author}</p>
        )}
        <div className="mt-2 flex flex-wrap items-center gap-2">
          {isWishlist && (
            <PriorityBadge priority={book.priority as Priority} size="sm" />
          )}
          {book.rating && (
            <StarRating rating={book.rating} readonly size="sm" />
          )}
          {isWishlist && book.price && (
            <span className="text-sm text-gray-600">{formatPrice(book.price)}</span>
          )}
          {isWishlist && book.plannedPurchaseDate && (
            <span className="text-sm text-gray-500">
              予定: {formatDateJa(book.plannedPurchaseDate)}
            </span>
          )}
        </div>
        {book.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {book.tags.slice(0, 3).map((bt) => (
              <TagBadge key={bt.tag.id} name={bt.tag.name} size="sm" />
            ))}
            {book.tags.length > 3 && (
              <span className="text-xs text-gray-400">+{book.tags.length - 3}</span>
            )}
          </div>
        )}
        {isWishlist && onPurchase && (
          <button
            onClick={(e) => {
              e.preventDefault()
              onPurchase(book.id)
            }}
            className="mt-2 flex items-center gap-1 text-sm text-primary-600 hover:text-primary-800"
          >
            <ShoppingCart size={14} />
            購入済みにする
          </button>
        )}
      </div>
    </Link>
  )
}
