// 読書状態の定義
export const BookStatus = {
  WISHLIST: 'WISHLIST',
  UNREAD: 'UNREAD',
  READING: 'READING',
  FINISHED: 'FINISHED',
} as const

export type BookStatus = (typeof BookStatus)[keyof typeof BookStatus]

// 優先度の定義
export const Priority = {
  HIGH: 1,
  MEDIUM: 2,
  LOW: 3,
} as const

export type Priority = (typeof Priority)[keyof typeof Priority]

// カテゴリの定義
export const BookCategory = {
  FICTION: 'FICTION',
  HUMANITIES: 'HUMANITIES',
  HISTORY: 'HISTORY',
  POLITICS: 'POLITICS',
  BUSINESS: 'BUSINESS',
  SCIENCE: 'SCIENCE',
  HOBBY: 'HOBBY',
  MANGA: 'MANGA',
  OTHER: 'OTHER',
} as const

export type BookCategory = (typeof BookCategory)[keyof typeof BookCategory]

// カテゴリのラベル（表示順）
export const categoryLabels: Record<BookCategory, string> = {
  FICTION: '小説・文学',
  HUMANITIES: '人文・思想・社会',
  HISTORY: '歴史・地理',
  POLITICS: '政治・経済・法律',
  BUSINESS: 'ビジネス・自己啓発',
  SCIENCE: '科学・工学・コンピュータ',
  HOBBY: '趣味・実用',
  MANGA: '漫画',
  OTHER: 'その他',
}

// 状態のラベル
export const statusLabels: Record<BookStatus, string> = {
  WISHLIST: '欲しい',
  UNREAD: '未読',
  READING: '読書中',
  FINISHED: '読了',
}

// 優先度のラベル
export const priorityLabels: Record<Priority, string> = {
  1: '高',
  2: '中',
  3: '低',
}

// タグ型
export interface Tag {
  id: number
  name: string
}

// 本の型
export interface Book {
  id: number
  title: string
  author: string | null
  publisher: string | null
  isbn: string | null
  status: BookStatus
  owned: boolean
  category: BookCategory | null
  purchaseDate: string | null
  finishedDate: string | null
  rating: number | null
  memo: string | null
  review: string | null
  coverUrl: string | null
  coverPath: string | null
  price: number | null
  plannedPurchaseDate: string | null
  purchaseUrl: string | null
  priority: number
  createdAt: string
  updatedAt: string
  tags: { tag: Tag }[]
}

// 本の作成/更新用の入力型
export interface BookInput {
  title: string
  author?: string
  publisher?: string
  isbn?: string
  status: BookStatus
  owned: boolean
  category?: BookCategory
  purchaseDate?: string
  finishedDate?: string
  rating?: number
  memo?: string
  review?: string
  coverUrl?: string
  coverPath?: string
  price?: number
  plannedPurchaseDate?: string
  purchaseUrl?: string
  priority?: number
  tagIds?: number[]
}

// フィルタ用の型
export interface BookFilters {
  search?: string
  status?: BookStatus | 'ALL'
  category?: BookCategory | 'ALL'
  owned?: boolean | 'ALL'
  rating?: number | 'ALL'
  tagId?: number
  sort?: 'createdAt' | 'finishedDate' | 'rating' | 'priority' | 'plannedPurchaseDate' | 'category'
  order?: 'asc' | 'desc'
}

// 統計情報の型
export interface Stats {
  total: number
  wishlist: number
  unread: number
  reading: number
  finished: number
  highPriorityWishlist: number
  thisMonthFinished: number
  averageRating: number | null
}
