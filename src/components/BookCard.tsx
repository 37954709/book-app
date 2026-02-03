'use client'

import { memo } from 'react'
import Link from 'next/link'
import { Book, BookStatus, BookCategory, Priority } from '@/types/book'
import { BookCover } from './BookCover'
import { StatusBadge } from './StatusBadge'
import { CategoryBadge } from './CategoryBadge'
import { StarRating } from './StarRating'
import { PriorityBadge } from './PriorityBadge'
import { TagBadge } from './TagBadge'
import { formatPrice, formatDateJa } from '@/lib/utils'
import { ShoppingCart } from 'lucide-react'

interface BookCardProps {
  book: Book
  viewMode: 'grid' | 'list'
  onPurchase?: (id: number) => void
}

const BookCardComponent = ({ book, viewMode, onPurchase }: BookCardProps) => {
  const isWishlist = book.status === BookStatus.WISHLIST

  if (viewMode === 'grid') {
    return (
      <Link
        href={`/books/${book.id}`}
        className="group block bg-white/80 backdrop-blur-sm rounded-2xl shadow-soft hover:shadow-soft-lg transition-all duration-300 p-4 card-hover border border-gray-100/50"
      >
        <div className="flex flex-col items-center">
          <div className="relative mb-3">
            <BookCover
              coverUrl={book.coverUrl}
              coverPath={book.coverPath}
              title={book.title}
              size="md"
              className="rounded-lg shadow-md group-hover:shadow-lg transition-shadow"
            />
          </div>
          <h3 className="font-semibold text-gray-800 text-center line-clamp-2 group-hover:text-primary-600 transition-colors text-sm">
            {book.title}
          </h3>
          {book.author && (
            <p className="text-xs text-gray-500 mt-1 text-center line-clamp-1">
              {book.author}
            </p>
          )}
          <div className="mt-3 flex flex-col items-center gap-1.5">
            <div className="flex flex-wrap justify-center gap-1">
              <StatusBadge status={book.status as BookStatus} size="sm" />
              {book.category && (
                <CategoryBadge category={book.category as BookCategory} size="sm" />
              )}
            </div>
            {isWishlist && (
              <PriorityBadge priority={book.priority as Priority} size="sm" />
            )}
            {book.rating && (
              <StarRating rating={book.rating} readonly size="sm" />
            )}
            {isWishlist && book.price && (
              <span className="text-sm font-medium text-gray-700">{formatPrice(book.price)}</span>
            )}
          </div>
          {isWishlist && onPurchase && (
            <button
              onClick={(e) => {
                e.preventDefault()
                onPurchase(book.id)
              }}
              className="mt-3 flex items-center gap-1.5 text-sm font-medium text-primary-600 hover:text-primary-700 bg-primary-50 hover:bg-primary-100 px-3 py-1.5 rounded-full transition-colors"
            >
              <ShoppingCart size={14} />
              購入済み
            </button>
          )}
        </div>
      </Link>
    )
  }

  return (
    <Link
      href={`/books/${book.id}`}
      className="group flex gap-4 bg-white/80 backdrop-blur-sm rounded-2xl shadow-soft hover:shadow-soft-lg transition-all duration-300 p-4 card-hover border border-gray-100/50"
    >
      <BookCover
        coverUrl={book.coverUrl}
        coverPath={book.coverPath}
        title={book.title}
        size="sm"
        className="rounded-lg shadow-md flex-shrink-0"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-gray-800 group-hover:text-primary-600 transition-colors line-clamp-1">
            {book.title}
          </h3>
          <div className="flex gap-1 flex-shrink-0">
            <StatusBadge status={book.status as BookStatus} size="sm" />
            {book.category && (
              <CategoryBadge category={book.category as BookCategory} size="sm" />
            )}
          </div>
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
            <span className="text-sm font-medium text-gray-700">{formatPrice(book.price)}</span>
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
            className="mt-2 flex items-center gap-1.5 text-sm font-medium text-primary-600 hover:text-primary-700 bg-primary-50 hover:bg-primary-100 px-3 py-1.5 rounded-full transition-colors"
          >
            <ShoppingCart size={14} />
            購入済みにする
          </button>
        )}
      </div>
    </Link>
  )
}

export const BookCard = memo(BookCardComponent)
