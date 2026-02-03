import { cn } from '@/lib/utils'
import { X } from 'lucide-react'

interface TagBadgeProps {
  name: string
  onRemove?: () => void
  size?: 'sm' | 'md'
}

export function TagBadge({ name, onRemove, size = 'md' }: TagBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 bg-primary-100 text-primary-800 rounded-full font-medium',
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm'
      )}
    >
      {name}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="hover:bg-primary-200 rounded-full p-0.5"
        >
          <X size={12} />
        </button>
      )}
    </span>
  )
}
