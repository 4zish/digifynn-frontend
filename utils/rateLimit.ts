/**
 * Rate limiting utilities with support for different storage backends
 */

export interface RateLimitConfig {
  maxRequests: number
  windowMs: number
  blockDurationMs: number
}

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetTime: number
}

export interface RateLimitRecord {
  count: number
  resetTime: number
}

// Production-ready rate limiter with pluggable storage
export class RateLimiter {
  private storage: RateLimitStorage
  private config: RateLimitConfig

  constructor(storage: RateLimitStorage, config: RateLimitConfig) {
    this.storage = storage
    this.config = config
  }

  async checkLimit(key: string): Promise<RateLimitResult> {
    const now = Date.now()
    const record = await this.storage.get(key)

    if (!record || now > record.resetTime) {
      // First request or window expired
      const newRecord: RateLimitRecord = {
        count: 1,
        resetTime: now + this.config.windowMs
      }
      await this.storage.set(key, newRecord, this.config.windowMs)
      
      return {
        allowed: true,
        remaining: this.config.maxRequests - 1,
        resetTime: newRecord.resetTime
      }
    }

    if (record.count >= this.config.maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: record.resetTime
      }
    }

    // Increment count
    record.count++
    await this.storage.set(key, record, this.config.windowMs)

    return {
      allowed: true,
      remaining: this.config.maxRequests - record.count,
      resetTime: record.resetTime
    }
  }
}

// Storage interface for rate limiting
export interface RateLimitStorage {
  get(key: string): Promise<RateLimitRecord | null>
  set(key: string, record: RateLimitRecord, ttlMs: number): Promise<void>
  delete(key: string): Promise<void>
}

// In-memory storage for development
export class MemoryRateLimitStorage implements RateLimitStorage {
  private store = new Map<string, RateLimitRecord>()

  async get(key: string): Promise<RateLimitRecord | null> {
    return this.store.get(key) || null
  }

  async set(key: string, record: RateLimitRecord, ttlMs: number): Promise<void> {
    this.store.set(key, record)
    
    // Auto-cleanup expired records
    setTimeout(() => {
      this.store.delete(key)
    }, ttlMs)
  }

  async delete(key: string): Promise<void> {
    this.store.delete(key)
  }
}

// Redis storage for production (commented out as Redis is not available)
/*
export class RedisRateLimitStorage implements RateLimitStorage {
  private redis: Redis

  constructor(redis: Redis) {
    this.redis = redis
  }

  async get(key: string): Promise<RateLimitRecord | null> {
    const data = await this.redis.get(key)
    return data ? JSON.parse(data) : null
  }

  async set(key: string, record: RateLimitRecord, ttlMs: number): Promise<void> {
    await this.redis.setex(key, Math.ceil(ttlMs / 1000), JSON.stringify(record))
  }

  async delete(key: string): Promise<void> {
    await this.redis.del(key)
  }
}
*/

// Factory function for creating rate limiters
export function createRateLimiter(config: RateLimitConfig): RateLimiter {
  // In production, you would use Redis storage
  // const storage = new RedisRateLimitStorage(redisClient)
  
  // For now, use memory storage
  const storage = new MemoryRateLimitStorage()
  
  return new RateLimiter(storage, config)
}

// Helper function to get client IP
export function getClientIP(event: any): string {
  // Mock implementation for testing - in real Nuxt app, getRequestHeader would be available
  if (event?.node?.req?.headers) {
    return (
      event.node.req.headers['x-forwarded-for'] ||
      event.node.req.headers['x-real-ip'] ||
      event.node.req.headers['cf-connecting-ip'] ||
      'unknown'
    )
  }
  return 'unknown'
}

// Helper function to create rate limit key
export function createRateLimitKey(prefix: string, identifier: string): string {
  return `rate_limit:${prefix}:${identifier}`
}