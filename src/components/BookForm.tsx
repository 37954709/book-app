'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Book, BookStatus, statusLabels, priorityLabels, Tag } from '@/types/book'
import { Input } from './Input'
import { Select } from './Select'
import { Textarea } from './Textarea'
import { Button } from './Button'
import { StarRating } from './StarRating'
import { BookCover } from './BookCover'
import { BookSearchModal } from './BookSearchModal'
import { getTodayString, debounce } from '@/lib/utils'
import { Upload, Search } from 'lucide-react'

interface BookFormProps {
  book?: Book
  onSubmit: (data: Record<string, unknown>) => Promise<void>
  isLoading?: boolean
}

interface BookFormData {
  title: string
  author: string
  publisher: string
  isbn: string
  status: BookStatus
  owned: boolean
  purchaseDate: string
  finishedDate: string
  rating: number | null
  memo: string
  review: string
  coverUrl: string
  coverPath: string
  price: string
  plannedPurchaseDate: string
  purchaseUrl: string
  priority: number
  tagIds: number[]
}

export function BookForm({ book, onSubmit, isLoading }: BookFormProps) {
  const router = useRouter()
  const [tags, setTags] = useState<Tag[]>([])
  const [newTag, setNewTag] = useState('')
  const [isCheckingCover, setIsCheckingCover] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [errors, setErrors] = useState<Partial<Record<keyof BookFormData, string>>>({})

  const [formData, setFormData] = useState<BookFormData>({
    title: book?.title || '',
    author: book?.author || '',
    publisher: book?.publisher || '',
    isbn: book?.isbn || '',
    status: (book?.status as BookStatus) || BookStatus.UNREAD,
    owned: book?.owned ?? false,
    purchaseDate: book?.purchaseDate?.split('T')[0] || '',
    finishedDate: book?.finishedDate?.split('T')[0] || '',
    rating: book?.rating || null,
    memo: book?.memo || '',
    review: book?.review || '',
    coverUrl: book?.coverUrl || '',
    coverPath: book?.coverPath || '',
    price: book?.price?.toString() || '',
    plannedPurchaseDate: book?.plannedPurchaseDate?.split('T')[0] || '',
    purchaseUrl: book?.purchaseUrl || '',
    priority: book?.priority || 2,
    tagIds: book?.tags.map((bt) => bt.tag.id) || [],
  })

  // タグ一覧の取得
  useEffect(() => {
    fetch('/api/tags')
      .then((res) => res.json())
      .then((data) => setTags(data))
      .catch(console.error)
  }, [])

  // ISBNから表紙を自動取得（デバウンス付き）
  const checkCover = useCallback(
    debounce(async (isbn: string) => {
      if (!isbn || isbn.length < 10) return

      setIsCheckingCover(true)
      try {
        const res = await fetch(`/api/cover?isbn=${encodeURIComponent(isbn)}`)
        const data = await res.json()
        if (data.found && data.coverUrl) {
          setFormData((prev) => ({ ...prev, coverUrl: data.coverUrl }))
        }
      } catch (error) {
        console.error('Error checking cover:', error)
      } finally {
        setIsCheckingCover(false)
      }
    }, 500),
    []
  )

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target
    const newValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value

    setFormData((prev) => ({ ...prev, [name]: newValue }))
    setErrors((prev) => ({ ...prev, [name]: undefined }))

    // ISBNが変更されたら表紙をチェック
    if (name === 'isbn' && value) {
      checkCover(value)
    }

    // 状態が読了に変更されたら読了日を今日に設定
    if (name === 'status' && value === BookStatus.FINISHED && !formData.finishedDate) {
      setFormData((prev) => ({ ...prev, finishedDate: getTodayString() }))
    }
  }

  const handleRatingChange = (rating: number) => {
    setFormData((prev) => ({
      ...prev,
      rating: prev.rating === rating ? null : rating,
    }))
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    try {
      const uploadFormData = new FormData()
      uploadFormData.append('file', file)

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: uploadFormData,
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Upload failed')
      }

      const data = await res.json()
      setFormData((prev) => ({
        ...prev,
        coverPath: data.path,
        coverUrl: '',
      }))
    } catch (error) {
      console.error('Upload error:', error)
      alert(error instanceof Error ? error.message : 'アップロードに失敗しました')
    } finally {
      setIsUploading(false)
    }
  }

  const handleTagAdd = async () => {
    if (!newTag.trim()) return

    try {
      const res = await fetch('/api/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newTag.trim() }),
      })

      if (res.ok) {
        const tag = await res.json()
        setTags((prev) => [...prev, tag])
        setFormData((prev) => ({ ...prev, tagIds: [...prev.tagIds, tag.id] }))
        setNewTag('')
      }
    } catch (error) {
      console.error('Error creating tag:', error)
    }
  }

  const handleTagToggle = (tagId: number) => {
    setFormData((prev) => ({
      ...prev,
      tagIds: prev.tagIds.includes(tagId)
        ? prev.tagIds.filter((id) => id !== tagId)
        : [...prev.tagIds, tagId],
    }))
  }

  // 書籍検索から選択された時の処理
  const handleBookSelect = (selectedBook: {
    title: string
    author: string
    publisher: string
    isbn: string
    coverUrl: string
  }) => {
    setFormData((prev) => ({
      ...prev,
      title: selectedBook.title || prev.title,
      author: selectedBook.author || prev.author,
      publisher: selectedBook.publisher || prev.publisher,
      isbn: selectedBook.isbn || prev.isbn,
      coverUrl: selectedBook.coverUrl || prev.coverUrl,
    }))
  }

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof BookFormData, string>> = {}

    if (!formData.title.trim()) {
      newErrors.title = 'タイトルは必須です'
    }

    if (formData.rating && (formData.rating < 1 || formData.rating > 5)) {
      newErrors.rating = '評価は1〜5の範囲で入力してください'
    }

    if (formData.status === BookStatus.FINISHED && !formData.finishedDate) {
      newErrors.finishedDate = '読了日を入力してください'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    await onSubmit(formData as unknown as Record<string, unknown>)
  }

  const isWishlist = formData.status === BookStatus.WISHLIST

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 書籍検索ボタン */}
      {!book && (
        <div className="flex justify-end">
          <Button
            type="button"
            variant="secondary"
            onClick={() => setIsSearchOpen(true)}
          >
            <Search size={18} className="mr-2" />
            書籍を検索して入力
          </Button>
        </div>
      )}

      {/* 書籍検索モーダル */}
      <BookSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelect={handleBookSelect}
      />

      {/* 表紙プレビュー */}
      <div className="flex items-start gap-6">
        <div className="flex flex-col items-center gap-2">
          <BookCover
            coverUrl={formData.coverUrl}
            coverPath={formData.coverPath}
            title={formData.title || '表紙'}
            size="lg"
          />
          <label className="cursor-pointer">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              disabled={isUploading}
            />
            <span className="inline-flex items-center gap-1 text-sm text-primary-600 hover:text-primary-800">
              <Upload size={16} />
              {isUploading ? 'アップロード中...' : '画像をアップロード'}
            </span>
          </label>
          {isCheckingCover && (
            <span className="text-sm text-gray-500">表紙を検索中...</span>
          )}
        </div>

        <div className="flex-1 space-y-4">
          {/* 基本情報 */}
          <Input
            id="title"
            name="title"
            label="タイトル *"
            value={formData.title}
            onChange={handleInputChange}
            error={errors.title}
            required
          />
          <Input
            id="author"
            name="author"
            label="著者"
            value={formData.author}
            onChange={handleInputChange}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              id="publisher"
              name="publisher"
              label="出版社"
              value={formData.publisher}
              onChange={handleInputChange}
            />
            <Input
              id="isbn"
              name="isbn"
              label="ISBN"
              value={formData.isbn}
              onChange={handleInputChange}
              placeholder="ISBNを入力すると表紙を自動取得"
            />
          </div>
        </div>
      </div>

      {/* 状態・所持 */}
      <div className="grid grid-cols-2 gap-4">
        <Select
          id="status"
          name="status"
          label="状態"
          value={formData.status}
          onChange={handleInputChange}
          options={Object.entries(statusLabels).map(([value, label]) => ({
            value,
            label,
          }))}
        />
        <div className="flex items-end">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              name="owned"
              checked={formData.owned}
              onChange={handleInputChange}
              className="w-4 h-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
            />
            <span className="text-sm text-gray-700">所持している</span>
          </label>
        </div>
      </div>

      {/* ウィッシュリスト用フィールド */}
      {isWishlist && (
        <div className="p-4 bg-pink-50 rounded-lg space-y-4">
          <h3 className="font-medium text-pink-800">欲しい本の情報</h3>
          <div className="grid grid-cols-2 gap-4">
            <Input
              id="price"
              name="price"
              label="価格（円）"
              type="number"
              value={formData.price}
              onChange={handleInputChange}
              placeholder="例: 2500"
            />
            <Select
              id="priority"
              name="priority"
              label="優先度"
              value={formData.priority.toString()}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, priority: parseInt(e.target.value) }))
              }
              options={Object.entries(priorityLabels).map(([value, label]) => ({
                value,
                label,
              }))}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              id="plannedPurchaseDate"
              name="plannedPurchaseDate"
              label="購入予定日"
              type="date"
              value={formData.plannedPurchaseDate}
              onChange={handleInputChange}
            />
            <Input
              id="purchaseUrl"
              name="purchaseUrl"
              label="購入先URL"
              type="url"
              value={formData.purchaseUrl}
              onChange={handleInputChange}
              placeholder="https://..."
            />
          </div>
        </div>
      )}

      {/* 日付 */}
      <div className="grid grid-cols-2 gap-4">
        <Input
          id="purchaseDate"
          name="purchaseDate"
          label="購入日"
          type="date"
          value={formData.purchaseDate}
          onChange={handleInputChange}
        />
        {formData.status === BookStatus.FINISHED && (
          <Input
            id="finishedDate"
            name="finishedDate"
            label="読了日"
            type="date"
            value={formData.finishedDate}
            onChange={handleInputChange}
            error={errors.finishedDate}
          />
        )}
      </div>

      {/* 評価 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">評価</label>
        <StarRating rating={formData.rating} onChange={handleRatingChange} size="lg" />
        {errors.rating && <p className="mt-1 text-sm text-red-600">{errors.rating}</p>}
      </div>

      {/* メモ・感想 */}
      <Textarea
        id="memo"
        name="memo"
        label="メモ（短文）"
        value={formData.memo}
        onChange={handleInputChange}
        rows={2}
        placeholder="簡単なメモを入力"
      />
      <Textarea
        id="review"
        name="review"
        label="感想（長文）"
        value={formData.review}
        onChange={handleInputChange}
        rows={5}
        placeholder="詳しい感想を入力"
      />

      {/* タグ */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">タグ</label>
        <div className="flex flex-wrap gap-2 mb-2">
          {tags.map((tag) => (
            <button
              key={tag.id}
              type="button"
              onClick={() => handleTagToggle(tag.id)}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                formData.tagIds.includes(tag.id)
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {tag.name}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            placeholder="新しいタグを追加"
            className="flex-1"
          />
          <Button type="button" variant="secondary" onClick={handleTagAdd}>
            追加
          </Button>
        </div>
      </div>

      {/* 送信ボタン */}
      <div className="flex justify-end gap-4">
        <Button type="button" variant="ghost" onClick={() => router.back()}>
          キャンセル
        </Button>
        <Button type="submit" isLoading={isLoading}>
          {book ? '更新' : '登録'}
        </Button>
      </div>
    </form>
  )
}
