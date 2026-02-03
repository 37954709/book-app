'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { BookForm } from '@/components/BookForm'

export default function NewBookPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (data: Record<string, unknown>) => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/books', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to create book')
      }

      await res.json()
      router.push('/')
    } catch (error) {
      console.error('Error creating book:', error)
      alert(error instanceof Error ? error.message : '本の登録に失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">本を追加</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <BookForm onSubmit={handleSubmit} isLoading={isLoading} />
      </div>
    </div>
  )
}
