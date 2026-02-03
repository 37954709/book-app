import { BookStatus, statusLabels } from '@/types/book'
import { cn } from '@/lib/utils'

interface StatusBadgeProps {
  status: BookStatus
  size?: 'sm' | 'md'
}

const statusColors: Record<BookStatus, string> = {
  WISHLIST: 'bg-pink-100 text-pink-800',
  UNREAD: 'bg-gray-100 text-gray-800',
  READING: 'bg-blue-100 text-blue-800',
  FINISHED: 'bg-green-100 text-green-800',
}

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-medium',
        statusColors[status],
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm'
      )}
    >
      {statusLabels[status]}
    </span>
  )
}
