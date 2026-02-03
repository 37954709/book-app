import { BookCategory, categoryLabels } from '@/types/book'
import { cn } from '@/lib/utils'

interface CategoryBadgeProps {
  category: BookCategory
  size?: 'sm' | 'md'
}

const categoryColors: Record<BookCategory, string> = {
  NOVEL: 'bg-gradient-to-r from-amber-100 to-orange-100 text-amber-700 border-amber-200',
  MANGA: 'bg-gradient-to-r from-pink-100 to-rose-100 text-pink-700 border-pink-200',
  BUSINESS: 'bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-700 border-blue-200',
  TECH: 'bg-gradient-to-r from-violet-100 to-purple-100 text-violet-700 border-violet-200',
  PHILOSOPHY: 'bg-gradient-to-r from-teal-100 to-emerald-100 text-teal-700 border-teal-200',
  SELFHELP: 'bg-gradient-to-r from-yellow-100 to-lime-100 text-yellow-700 border-yellow-200',
  OTHER: 'bg-gradient-to-r from-gray-100 to-slate-100 text-gray-600 border-gray-200',
}

export function CategoryBadge({ category, size = 'md' }: CategoryBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-medium border',
        categoryColors[category],
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-0.5 text-sm'
      )}
    >
      {categoryLabels[category]}
    </span>
  )
}
