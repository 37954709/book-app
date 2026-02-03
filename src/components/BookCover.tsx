'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Book as BookIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface BookCoverProps {
  coverUrl: string | null
  coverPath: string | null
  title: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeClasses = {
  sm: 'w-16 h-24',
  md: 'w-24 h-36',
  lg: 'w-40 h-60',
}

const iconSizes = {
  sm: 24,
  md: 32,
  lg: 48,
}

export function BookCover({
  coverUrl,
  coverPath,
  title,
  size = 'md',
  className,
}: BookCoverProps) {
  const [hasError, setHasError] = useState(false)
  const imageSrc = coverPath || coverUrl

  if (!imageSrc || hasError) {
    return (
      <div
        className={cn(
          'flex items-center justify-center bg-gray-200 rounded',
          sizeClasses[size],
          className
        )}
      >
        <BookIcon size={iconSizes[size]} className="text-gray-400" />
      </div>
    )
  }

  return (
    <div className={cn('relative rounded overflow-hidden', sizeClasses[size], className)}>
      <Image
        src={imageSrc}
        alt={title}
        fill
        sizes={size === 'lg' ? '160px' : size === 'md' ? '96px' : '64px'}
        className="object-cover"
        loading="lazy"
        onError={() => setHasError(true)}
      />
    </div>
  )
}
