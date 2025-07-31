export interface Post {
  id: string
  title: string
  content: string
  date: string
  slug: string
  excerpt?: string
  author?: {
    node: {
      name: string
    }
  }
  categories?: {
    nodes: Array<{
      name: string
      slug: string
    }>
  }
  featuredImage?: {
    node: {
      sourceUrl: string
      altText?: string
    }
  }
}

export interface PostsResponse {
  posts: {
    nodes: Post[]
  }
}

export interface SinglePostResponse {
  post: Post
}

export interface ApiError {
  message: string
  code?: string
}

// User and Authentication Types
export interface User {
  id: string
  email: string
  name: string
  avatar?: string
  roles?: string[]
  permissions?: string[]
  createdAt: string
  updatedAt: string
  lastLoginAt?: string
  isActive: boolean
  preferences?: UserPreferences
}

export interface UserPreferences {
  language: string
  theme: 'light' | 'dark' | 'auto'
  notifications: NotificationSettings
  privacy: PrivacySettings
}

export interface NotificationSettings {
  email: boolean
  push: boolean
  newsletter: boolean
  marketing: boolean
}

export interface PrivacySettings {
  profileVisibility: 'public' | 'private' | 'friends'
  showEmail: boolean
  showLastSeen: boolean
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

export interface LoginRequest {
  email: string
  password: string
  rememberMe?: boolean
}

export interface RegisterRequest {
  email: string
  password: string
  name: string
  agreeToTerms: boolean
}

export interface AuthResponse {
  success: boolean
  user?: User
  token?: string
  message?: string
  errors?: Record<string, string[]>
}

export interface PasswordResetRequest {
  email: string
}

export interface PasswordResetConfirm {
  token: string
  newPassword: string
}

export interface ProfileUpdateRequest {
  name?: string
  avatar?: string
  preferences?: Partial<UserPreferences>
}

// Analytics Types
export interface AnalyticsEvent {
  event: string
  parameters: Record<string, any>
  timestamp: number
  userAgent: string
  referrer: string
  ip: string
}

export interface AnalyticsResponse {
  success: boolean
  message: string
}

// Search Types
export interface SearchRequest {
  query: string
  filters?: SearchFilters
  page?: number
  limit?: number
}

export interface SearchFilters {
  category?: string
  author?: string
  dateRange?: {
    start: string
    end: string
  }
  tags?: string[]
}

export interface SearchResponse {
  results: Post[]
  total: number
  page: number
  limit: number
  query: string
  filters?: SearchFilters
}

// Comment Types
export interface Comment {
  id: string
  content: string
  author: User
  postId: string
  parentId?: string
  createdAt: string
  updatedAt: string
  isApproved: boolean
  likes: number
  replies?: Comment[]
}

export interface CommentRequest {
  content: string
  postId: string
  parentId?: string
}

export interface CommentResponse {
  success: boolean
  comment?: Comment
  message?: string
}

// Rate Limiting Types
export interface RateLimitInfo {
  allowed: boolean
  remaining: number
  resetTime: number
  limit: number
}

export interface RateLimitResponse {
  success: boolean
  message: string
  retryAfter?: number
} 