import { describe, it, expect, vi } from 'vitest'

const mockResponse = {
  posts: {
    nodes: [
      {
        id: '1',
        title: 'Test Post',
        content: 'Content',
        date: '2024-01-01',
        slug: 'test-post'
      }
    ]
  }
}

vi.mock('graphql-request', () => ({
  request: vi.fn().mockResolvedValue(mockResponse),
  gql: (q: TemplateStringsArray) => q[0]
}))

// Provide Nuxt runtime helpers
;(global as any).defineEventHandler = (fn: any) => fn
;(global as any).useRuntimeConfig = () => ({
  public: { wpGraphqlEndpoint: 'http://example.com/graphql' }
})

describe('GET /api/posts', () => {
  it('returns list with expected structure', async () => {
    const { default: handler } = await import('../../server/api/posts.get')
    const data = await handler()

    expect(Array.isArray(data.posts.nodes)).toBe(true)
    expect(data.posts.nodes[0]).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        title: expect.any(String),
        content: expect.any(String),
        date: expect.any(String),
        slug: expect.any(String)
      })
    )
  })
})
