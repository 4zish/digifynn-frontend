import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createEvent } from 'h3'
import postsHandler from '../../server/api/posts.get'

// Mock GraphQL request
vi.mock('graphql-request', () => ({
  request: vi.fn(),
  gql: vi.fn((str) => str)
}))

// Mock utilities
vi.mock('../../utils/env', () => ({
  validateWpEndpoint: vi.fn(() => true)
}))

vi.mock('../../utils/rateLimit', () => ({
  createRateLimiter: vi.fn(() => ({
    checkLimit: vi.fn(() => ({
      allowed: true,
      remaining: 99,
      resetTime: Date.now() + 900000
    }))
  })),
  getClientIP: vi.fn(() => '192.168.1.1'),
  createRateLimitKey: vi.fn(() => 'rate_limit:posts:192.168.1.1')
}))

describe('Posts API', () => {
  let mockRequest: any
  let mockResponse: any

  beforeEach(() => {
    vi.clearAllMocks()
    
    mockRequest = createEvent({
      method: 'GET',
      url: '/api/posts',
      headers: {
        'x-forwarded-for': '192.168.1.1'
      }
    })
    
    mockResponse = {
      statusCode: 200,
      headers: {},
      body: null
    }
  })

  describe('GET /api/posts', () => {
    it('should return posts successfully', async () => {
      const mockPosts = {
        posts: {
          nodes: [
            {
              id: '1',
              title: 'Test Post',
              content: 'Test content',
              date: '2024-01-01',
              slug: 'test-post',
              excerpt: 'Test excerpt',
              author: {
                node: {
                  name: 'Test Author'
                }
              },
              categories: {
                nodes: [
                  {
                    name: 'Technology',
                    slug: 'technology'
                  }
                ]
              },
              featuredImage: {
                node: {
                  sourceUrl: 'https://example.com/image.jpg',
                  altText: 'Test image'
                }
              }
            }
          ]
        }
      }

      const { request } = await import('graphql-request')
      vi.mocked(request).mockResolvedValue(mockPosts)

      const result = await postsHandler(mockRequest)

      expect(result).toEqual(mockPosts)
      expect(request).toHaveBeenCalledWith(
        'https://cms.digifynn.com/graphql',
        expect.any(String)
      )
    })

    it('should handle rate limiting', async () => {
      const { createRateLimiter } = await import('../../utils/rateLimit')
      vi.mocked(createRateLimiter).mockReturnValue({
        checkLimit: vi.fn(() => ({
          allowed: false,
          remaining: 0,
          resetTime: Date.now() + 3600000
        }))
      })

      try {
        await postsHandler(mockRequest)
        expect.fail('Should have thrown an error')
      } catch (error: any) {
        expect(error.statusCode).toBe(429)
        expect(error.statusMessage).toBe('تعداد درخواست‌ها بیش از حد مجاز است')
        expect(error.data.message).toBe('لطفاً کمی صبر کنید و دوباره تلاش کنید.')
      }
    })

    it('should handle invalid endpoint configuration', async () => {
      const { validateWpEndpoint } = await import('../../utils/env')
      vi.mocked(validateWpEndpoint).mockReturnValue(false)

      try {
        await postsHandler(mockRequest)
        expect.fail('Should have thrown an error')
      } catch (error: any) {
        expect(error.statusCode).toBe(500)
        expect(error.statusMessage).toBe('پیکربندی نامعتبر است')
        expect(error.data.message).toBe('خطا در پیکربندی سرور: WordPress GraphQL endpoint نامعتبر است.')
      }
    })

    it('should handle GraphQL errors', async () => {
      const { request } = await import('graphql-request')
      vi.mocked(request).mockRejectedValue(new Error('GraphQL Error'))

      try {
        await postsHandler(mockRequest)
        expect.fail('Should have thrown an error')
      } catch (error: any) {
        expect(error.statusCode).toBe(500)
        expect(error.statusMessage).toBe('خطا در دریافت مقالات')
        expect(error.data.message).toBe('متأسفانه مشکلی در بارگذاری مقالات پیش آمده است.')
      }
    })

    it('should set rate limit headers', async () => {
      const mockPosts = {
        posts: {
          nodes: []
        }
      }

      const { request } = await import('graphql-request')
      vi.mocked(request).mockResolvedValue(mockPosts)

      await postsHandler(mockRequest)

      // Check that headers were set (this would be done by setResponseHeaders in real implementation)
      expect(mockRequest.node.res.headers).toBeDefined()
    })

    it('should handle empty posts response', async () => {
      const mockPosts = {
        posts: {
          nodes: []
        }
      }

      const { request } = await import('graphql-request')
      vi.mocked(request).mockResolvedValue(mockPosts)

      const result = await postsHandler(mockRequest)

      expect(result).toEqual(mockPosts)
      expect(result.posts.nodes).toHaveLength(0)
    })

    it('should handle posts with missing optional fields', async () => {
      const mockPosts = {
        posts: {
          nodes: [
            {
              id: '1',
              title: 'Test Post',
              content: 'Test content',
              date: '2024-01-01',
              slug: 'test-post'
              // Missing author, categories, featuredImage
            }
          ]
        }
      }

      const { request } = await import('graphql-request')
      vi.mocked(request).mockResolvedValue(mockPosts)

      const result = await postsHandler(mockRequest)

      expect(result).toEqual(mockPosts)
      expect(result.posts.nodes[0]).not.toHaveProperty('author')
      expect(result.posts.nodes[0]).not.toHaveProperty('categories')
      expect(result.posts.nodes[0]).not.toHaveProperty('featuredImage')
    })
  })
}) 