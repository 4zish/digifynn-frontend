import { describe, it, expect, vi, beforeEach } from 'vitest'
import { usePosts } from '~/composables/usePosts'

// Mock useFetch
const mockUseFetch = vi.fn()
vi.mock('#app', () => ({
  useRuntimeConfig: () => ({
    public: {
      wpGraphqlEndpoint: 'https://test-endpoint.com/graphql'
    }
  }),
  useFetch: mockUseFetch
}))

describe('usePosts', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('fetchPosts', () => {
    it('should fetch posts successfully', async () => {
      const mockData = {
        posts: {
          nodes: [
            {
              id: '1',
              title: 'Test Post',
              content: 'Test content',
              date: '2024-01-01',
              slug: 'test-post'
            }
          ]
        }
      }

      mockUseFetch.mockResolvedValue({
        data: ref(mockData),
        error: ref(null),
        refresh: vi.fn()
      })

      const { fetchPosts } = usePosts()
      const result = await fetchPosts()

      expect(mockUseFetch).toHaveBeenCalledWith('/api/posts', {
        key: 'posts',
        default: () => ({ posts: { nodes: [] } }),
        onResponseError: expect.any(Function)
      })

      expect(result.data.value).toEqual(mockData)
      expect(result.error.value).toBeNull()
    })

    it('should handle fetch errors gracefully', async () => {
      mockUseFetch.mockRejectedValue(new Error('Network error'))

      const { fetchPosts } = usePosts()
      const result = await fetchPosts()

      expect(result.data.value).toEqual({ posts: { nodes: [] } })
      expect(result.error.value.message).toBe('خطا در بارگذاری مقالات')
    })
  })

  describe('fetchPostBySlug', () => {
    it('should fetch single post successfully', async () => {
      const mockData = {
        post: {
          id: '1',
          title: 'Test Post',
          content: 'Test content',
          date: '2024-01-01',
          slug: 'test-post'
        }
      }

      mockUseFetch.mockResolvedValue({
        data: ref(mockData),
        error: ref(null)
      })

      const { fetchPostBySlug } = usePosts()
      const result = await fetchPostBySlug('test-post')

      expect(mockUseFetch).toHaveBeenCalledWith('/api/post/test-post', {
        key: 'post-test-post',
        default: () => ({ post: null }),
        onResponseError: expect.any(Function)
      })

      expect(result.data.value).toEqual(mockData)
      expect(result.error.value).toBeNull()
    })

    it('should handle single post fetch errors gracefully', async () => {
      mockUseFetch.mockRejectedValue(new Error('Post not found'))

      const { fetchPostBySlug } = usePosts()
      const result = await fetchPostBySlug('non-existent')

      expect(result.data.value).toEqual({ post: null })
      expect(result.error.value.message).toBe('خطا در بارگذاری مقاله')
    })
  })
}) 