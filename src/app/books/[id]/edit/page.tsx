'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { Book } from '@/types/book'
import { BookForm } from '@/components/BookForm'
import { Loader2, ArrowLeft } from 'lucide-react'

export default function EditBookPage() {
  const params = useParams()
  const id = params.id as string
  const router = useRouter()
  const [book, setBook] = useState<Book | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const res = await fetch(`/api/books/${id}`)
        if (!res.ok) throw new Error('Book not found')
        const data = await res.json()
        setBook(data)
      } catch (error) {
        console.error('Error fetching book:', error)
        router.push('/')
      } finally {
        setIsLoading(false)
      }
    }

    fetchBook()
  }, [id, router])

  const handleSubmit = async (data: Record<string, unknown>) => {
    setIsSaving(true)
    try {
      const res = await fetch(`/api/books/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to update book')
      }

      router.push(`/books/${id}`)
    } catch (error) {
      console.error('Error updating book:', error)
      alert(error instanceof Error ? error.message : '更新に失敗しました')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    )
  }

  if (!book) {
    return null
  }

  return (
    <div className="max-w-3xl mx-auto">
      <Link
        href={`/books/${id}`}
        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft size={20} />
        詳細に戻る
      </Link>

      <h1 className="text-2xl font-bold text-gray-900 mb-6">本を編集</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <BookForm book={book} onSubmit={handleSubmit} isLoading={isSaving} />
      </div>
    </div>
  )
}
