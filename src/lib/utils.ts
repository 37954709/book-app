import { clsx, type ClassValue } from 'clsx'

/**
 * Tailwind CSSのクラス名を結合するユーティリティ
 */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

/**
 * 日付を YYYY-MM-DD 形式にフォーマット
 */
export function formatDate(date: Date | string | null): string {
  if (!date) return ''
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toISOString().split('T')[0]
}

/**
 * 日付を日本語形式（YYYY年MM月DD日）にフォーマット
 */
export function formatDateJa(date: Date | string | null): string {
  if (!date) return '-'
  const d = typeof date === 'string' ? new Date(date) : date
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`
}

/**
 * 価格を日本円形式にフォーマット
 */
export function formatPrice(price: number | null): string {
  if (price === null || price === undefined) return '-'
  return `¥${price.toLocaleString()}`
}

/**
 * デバウンス関数
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null

  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

/**
 * 今日の日付を YYYY-MM-DD 形式で取得
 */
export function getTodayString(): string {
  return new Date().toISOString().split('T')[0]
}

/**
 * 今月の開始日を取得
 */
export function getMonthStart(): Date {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), 1)
}
