import { vi } from 'vitest'

// Mock Nuxt composables
vi.mock('#app', () => ({
  useRuntimeConfig: () => ({
    public: {
      wpGraphqlEndpoint: 'https://test-endpoint.com/graphql'
    }
  }),
  useFetch: vi.fn(),
  useRoute: () => ({
    params: { slug: 'test-slug' }
  }),
  useHead: vi.fn(),
  createError: vi.fn(),
  getRouterParam: vi.fn()
}))

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  error: vi.fn(),
  warn: vi.fn()
} 