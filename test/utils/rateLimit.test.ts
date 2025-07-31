import { describe, it, expect, beforeEach, vi } from 'vitest'
import { 
  RateLimiter, 
  MemoryRateLimitStorage, 
  createRateLimiter, 
  getClientIP, 
  createRateLimitKey,
  type RateLimitConfig,
  type RateLimitRecord
} from '../../utils/rateLimit'

describe('Rate Limiting Utilities', () => {
  let storage: MemoryRateLimitStorage
  let rateLimiter: RateLimiter
  let config: RateLimitConfig

  beforeEach(() => {
    storage = new MemoryRateLimitStorage()
    config = {
      maxRequests: 5,
      windowMs: 1000, // 1 second for testing
      blockDurationMs: 2000
    }
    rateLimiter = new RateLimiter(storage, config)
  })

  describe('MemoryRateLimitStorage', () => {
    it('should store and retrieve records', async () => {
      const record: RateLimitRecord = {
        count: 1,
        resetTime: Date.now() + 1000
      }

      await storage.set('test-key', record, 1000)
      const retrieved = await storage.get('test-key')
      
      expect(retrieved).toEqual(record)
    })

    it('should return null for non-existent keys', async () => {
      const result = await storage.get('non-existent')
      expect(result).toBeNull()
    })

    it('should delete records', async () => {
      const record: RateLimitRecord = {
        count: 1,
        resetTime: Date.now() + 1000
      }

      await storage.set('test-key', record, 1000)
      await storage.delete('test-key')
      
      const result = await storage.get('test-key')
      expect(result).toBeNull()
    })

    it('should auto-cleanup expired records', async () => {
      const record: RateLimitRecord = {
        count: 1,
        resetTime: Date.now() + 50 // Short TTL for testing
      }

      await storage.set('test-key', record, 50)
      
      // Wait for cleanup
      await new Promise(resolve => setTimeout(resolve, 100))
      
      const result = await storage.get('test-key')
      expect(result).toBeNull()
    })
  })

  describe('RateLimiter', () => {
    it('should allow first request', async () => {
      const result = await rateLimiter.checkLimit('test-key')
      
      expect(result.allowed).toBe(true)
      expect(result.remaining).toBe(4)
      expect(result.resetTime).toBeGreaterThan(Date.now())
    })

    it('should allow multiple requests within limit', async () => {
      const results = []
      
      for (let i = 0; i < 3; i++) {
        results.push(await rateLimiter.checkLimit('test-key'))
      }
      
      expect(results[0].allowed).toBe(true)
      expect(results[0].remaining).toBe(4)
      expect(results[1].allowed).toBe(true)
      expect(results[1].remaining).toBe(3)
      expect(results[2].allowed).toBe(true)
      expect(results[2].remaining).toBe(2)
    })

    it('should block requests when limit is exceeded', async () => {
      // Make 5 requests (at the limit)
      for (let i = 0; i < 5; i++) {
        await rateLimiter.checkLimit('test-key')
      }
      
      // 6th request should be blocked
      const result = await rateLimiter.checkLimit('test-key')
      
      expect(result.allowed).toBe(false)
      expect(result.remaining).toBe(0)
    })

    it('should reset after window expires', async () => {
      // Make 3 requests
      for (let i = 0; i < 3; i++) {
        await rateLimiter.checkLimit('test-key')
      }
      
      // Wait for window to expire
      await new Promise(resolve => setTimeout(resolve, 1100))
      
      // New request should be allowed
      const result = await rateLimiter.checkLimit('test-key')
      
      expect(result.allowed).toBe(true)
      expect(result.remaining).toBe(4)
    })

    it('should handle different keys independently', async () => {
      const result1 = await rateLimiter.checkLimit('key1')
      const result2 = await rateLimiter.checkLimit('key2')
      
      expect(result1.allowed).toBe(true)
      expect(result2.allowed).toBe(true)
      expect(result1.remaining).toBe(4)
      expect(result2.remaining).toBe(4)
    })
  })

  describe('createRateLimiter', () => {
    it('should create rate limiter with memory storage', () => {
      const limiter = createRateLimiter(config)
      
      expect(limiter).toBeInstanceOf(RateLimiter)
    })
  })

  describe('getClientIP', () => {
    it('should extract IP from headers', () => {
      const mockEvent = {
        node: {
          req: {
            headers: {
              'x-forwarded-for': '192.168.1.1',
              'x-real-ip': '10.0.0.1',
              'cf-connecting-ip': '172.16.0.1'
            }
          }
        }
      }
      
      const ip = getClientIP(mockEvent)
      expect(ip).toBe('192.168.1.1')
    })

    it('should fallback to x-real-ip', () => {
      const mockEvent = {
        node: {
          req: {
            headers: {
              'x-real-ip': '10.0.0.1',
              'cf-connecting-ip': '172.16.0.1'
            }
          }
        }
      }
      
      const ip = getClientIP(mockEvent)
      expect(ip).toBe('10.0.0.1')
    })

    it('should fallback to cf-connecting-ip', () => {
      const mockEvent = {
        node: {
          req: {
            headers: {
              'cf-connecting-ip': '172.16.0.1'
            }
          }
        }
      }
      
      const ip = getClientIP(mockEvent)
      expect(ip).toBe('172.16.0.1')
    })

    it('should return unknown when no headers', () => {
      const mockEvent = {
        node: {
          req: {
            headers: {}
          }
        }
      }
      
      const ip = getClientIP(mockEvent)
      expect(ip).toBe('unknown')
    })
  })

  describe('createRateLimitKey', () => {
    it('should create properly formatted keys', () => {
      const key1 = createRateLimitKey('posts', '192.168.1.1')
      const key2 = createRateLimitKey('search', '10.0.0.1')
      
      expect(key1).toBe('rate_limit:posts:192.168.1.1')
      expect(key2).toBe('rate_limit:search:10.0.0.1')
    })
  })

  describe('Integration Tests', () => {
    it('should handle concurrent requests', async () => {
      const promises = []
      
      // Make 10 concurrent requests
      for (let i = 0; i < 10; i++) {
        promises.push(rateLimiter.checkLimit('concurrent-test'))
      }
      
      const results = await Promise.all(promises)
      
      // First 5 should be allowed, rest should be blocked
      const allowed = results.filter(r => r.allowed)
      const blocked = results.filter(r => !r.allowed)
      
      expect(allowed).toHaveLength(5)
      expect(blocked).toHaveLength(5)
    })

    it('should handle rapid successive requests', async () => {
      const results = []
      
      // Make rapid requests
      for (let i = 0; i < 7; i++) {
        results.push(await rateLimiter.checkLimit('rapid-test'))
        await new Promise(resolve => setTimeout(resolve, 10)) // Small delay
      }
      
      const allowed = results.filter(r => r.allowed)
      const blocked = results.filter(r => !r.allowed)
      
      expect(allowed).toHaveLength(5)
      expect(blocked).toHaveLength(2)
    })
  })
}) 