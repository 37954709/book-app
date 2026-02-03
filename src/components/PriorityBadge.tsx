import { Priority, priorityLabels } from '@/types/book'
import { cn } from '@/lib/utils'

interface PriorityBadgeProps {
  priority: Priority
  size?: 'sm' | 'md'
}

const priorityColors: Record<Priority, string> = {
  1: 'bg-red-100 text-red-800',
  2: 'bg-yellow-100 text-yellow-800',
  3: 'bg-gray-100 text-gray-600',
}

export function PriorityBadge({ priority, size = 'md' }: PriorityBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-medium',
        priorityColors[priority],
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm'
      )}
    >
      優先度: {priorityLabels[priority]}
    </span>
  )
}
