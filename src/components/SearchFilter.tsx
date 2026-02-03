'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Input } from './Input'
import { Select } from './Select'
import { Button } from './Button'
import { BookStatus, statusLabels, categoryLabels, Tag } from '@/types/book'
import { Search, X, Grid, List, SlidersHorizontal } from 'lucide-react'

interface SearchFilterProps {
  viewMode: 'grid' | 'list'
  onViewModeChange: (mode: 'grid' | 'list') => void
}

export function SearchFilter({ viewMode, onViewModeChange }: SearchFilterProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [tags, setTags] = useState<Tag[]>([])
  const [showFilters, setShowFilters] = useState(false)

  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [status, setStatus] = useState(searchParams.get('status') || 'ALL')
  const [category, setCategory] = useState(searchParams.get('category') || 'ALL')
  const [owned, setOwned] = useState(searchParams.get('owned') || 'ALL')
  const [rating, setRating] = useState(searchParams.get('rating') || 'ALL')
  const [tagId, setTagId] = useState(searchParams.get('tagId') || '')
  const [sort, setSort] = useState(searchParams.get('sort') || 'createdAt')
  const [order, setOrder] = useState(searchParams.get('order') || 'desc')

  useEffect(() => {
    fetch('/api/tags')
      .then((res) => res.json())
      .then((data) => setTags(data))
      .catch(console.error)
  }, [])

  const applyFilters = () => {
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (status && status !== 'ALL') params.set('status', status)
    if (category && category !== 'ALL') params.set('category', category)
    if (owned && owned !== 'ALL') params.set('owned', owned)
    if (rating && rating !== 'ALL') params.set('rating', rating)
    if (tagId) params.set('tagId', tagId)
    if (sort) params.set('sort', sort)
    if (order) params.set('order', order)

    router.push(`/?${params.toString()}`)
  }

  const clearFilters = () => {
    setSearch('')
    setStatus('ALL')
    setCategory('ALL')
    setOwned('ALL')
    setRating('ALL')
    setTagId('')
    setSort('createdAt')
    setOrder('desc')
    router.push('/')
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    applyFilters()
  }

  const statusOptions = [
    { value: 'ALL', label: 'すべて' },
    ...Object.entries(statusLabels).map(([value, label]) => ({ value, label })),
  ]

  const categoryOptions = [
    { value: 'ALL', label: 'すべて' },
    ...Object.entries(categoryLabels).map(([value, label]) => ({ value, label })),
  ]

  const ownedOptions = [
    { value: 'ALL', label: 'すべて' },
    { value: 'true', label: '所持' },
    { value: 'false', label: '未所持' },
  ]

  const ratingOptions = [
    { value: 'ALL', label: 'すべて' },
    { value: '5', label: '★★★★★' },
    { value: '4', label: '★★★★☆' },
    { value: '3', label: '★★★☆☆' },
    { value: '2', label: '★★☆☆☆' },
    { value: '1', label: '★☆☆☆☆' },
  ]

  const sortOptions = [
    { value: 'createdAt', label: '追加日' },
    { value: 'finishedDate', label: '読了日' },
    { value: 'rating', label: '評価' },
    { value: 'priority', label: '優先度' },
    { value: 'plannedPurchaseDate', label: '購入予定日' },
  ]

  const orderOptions = [
    { value: 'desc', label: '降順' },
    { value: 'asc', label: '昇順' },
  ]

  const tagOptions = useMemo(
    () => [
      { value: '', label: 'すべて' },
      ...tags.map((tag) => ({ value: tag.id.toString(), label: tag.name })),
    ],
    [tags]
  )

  const hasActiveFilters =
    status !== 'ALL' || category !== 'ALL' || owned !== 'ALL' || rating !== 'ALL' || tagId !== ''

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-6">
      {/* 検索バー */}
      <form onSubmit={handleSearchSubmit} className="flex gap-2">
        <div className="flex-1 relative">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="タイトル、著者、タグで検索..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <Button type="submit">検索</Button>
        <Button
          type="button"
          variant={showFilters ? 'primary' : 'secondary'}
          onClick={() => setShowFilters(!showFilters)}
          className="relative"
        >
          <SlidersHorizontal size={18} />
          {hasActiveFilters && (
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full" />
          )}
        </Button>
        <div className="flex border border-gray-300 rounded-lg overflow-hidden">
          <button
            type="button"
            onClick={() => onViewModeChange('grid')}
            className={`p-2 ${
              viewMode === 'grid'
                ? 'bg-primary-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Grid size={18} />
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange('list')}
            className={`p-2 ${
              viewMode === 'list'
                ? 'bg-primary-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            <List size={18} />
          </button>
        </div>
      </form>

      {/* フィルタパネル */}
      {showFilters && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            <Select
              label="状態"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              options={statusOptions}
            />
            <Select
              label="カテゴリ"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              options={categoryOptions}
            />
            <Select
              label="所持"
              value={owned}
              onChange={(e) => setOwned(e.target.value)}
              options={ownedOptions}
            />
            <Select
              label="評価"
              value={rating}
              onChange={(e) => setRating(e.target.value)}
              options={ratingOptions}
            />
            <Select
              label="タグ"
              value={tagId}
              onChange={(e) => setTagId(e.target.value)}
              options={tagOptions}
            />
            <Select
              label="ソート"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              options={sortOptions}
            />
            <Select
              label="順序"
              value={order}
              onChange={(e) => setOrder(e.target.value)}
              options={orderOptions}
            />
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={clearFilters}>
              <X size={16} className="mr-1" />
              クリア
            </Button>
            <Button type="button" onClick={applyFilters}>
              適用
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
