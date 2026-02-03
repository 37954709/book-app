import { BookStatus, statusLabels } from '@/types/book'
import { cn } from '@/lib/utils'

interface StatusBadgeProps {
  status: BookStatus
  size?: 'sm' | 'md'
}

const statusColors: Record<BookStatus, string> = {
  WISHLIST: 'bg-gradient-to-r from-pink-100 to-rose-100 text-rose-700 border-rose-200',
  UNREAD: 'bg-gradient-to-r from-gray-100 to-slate-100 text-slate-600 border-slate-200',
  READING: 'bg-gradient-to-r from-blue-100 to-indigo-100 text-indigo-700 border-indigo-200',
  FINISHED: 'bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-700 border-emerald-200',
}

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-medium border',
        statusColors[status],
        size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-sm'
      )}
    >
      {statusLabels[status]}
    </span>
  )
}
