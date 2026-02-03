// ユーザー検索結果の型
export interface UserSearchResult {
  id: string
  name: string | null
  avatarUrl: string | null
  bookCount: number
  followerCount: number
  isFollowing: boolean
}

// フォローしているユーザーの型
export interface FollowingUser {
  followId: number
  id: string
  name: string | null
  avatarUrl: string | null
  bookCount: number
  followerCount: number
  followedAt: string
}

// ユーザープロフィールの型
export interface UserProfile {
  id: string
  name: string | null
  avatarUrl: string | null
  createdAt: string
  bookCount: number
  followerCount: number
  followingCount: number
  isFollowing: boolean
  followId: number | null
  isMe: boolean
}
