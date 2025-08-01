import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  generateSecureToken,
  hashWithSalt,
  verifyHash,
  generateJWT,
  verifyJWT,
  sanitizeInput,
  validateFileUpload,
  generateSecurityHeaders,
  validateCSRFToken,
  generateCSRFToken,
  validateOrigin,
  createSecureRateLimiter,
  validateInput
} from '../../utils/security'

describe('Security Utilities', () => {
  describe('generateSecureToken', () => {
    it('should generate tokens of specified length', () => {
      const token16 = generateSecureToken(16)
      const token32 = generateSecureToken(32)
      const token64 = generateSecureToken(64)

      expect(token16).toHaveLength(32) // 16 bytes = 32 hex chars
      expect(token32).toHaveLength(64) // 32 bytes = 64 hex chars
      expect(token64).toHaveLength(128) // 64 bytes = 128 hex chars
    })

    it('should generate unique tokens', () => {
      const token1 = generateSecureToken()
      const token2 = generateSecureToken()
      expect(token1).not.toBe(token2)
    })

    it('should generate valid hex strings', () => {
      const token = generateSecureToken()
      expect(token).toMatch(/^[0-9a-f]+$/)
    })
  })

  describe('hashWithSalt', () => {
    it('should generate hash and salt', () => {
      const data = 'testpassword'
      const result = hashWithSalt(data)

      expect(result.hash).toBeDefined()
      expect(result.salt).toBeDefined()
      expect(result.hash).toHaveLength(128) // SHA512 = 64 bytes = 128 hex chars
      expect(result.salt).toHaveLength(32) // 16 bytes = 32 hex chars
    })

    it('should use provided salt', () => {
      const data = 'testpassword'
      const salt = 'testsalt1234567890'
      const result = hashWithSalt(data, salt)

      expect(result.salt).toBe(salt)
    })

    it('should generate different hashes for same input', () => {
      const data = 'testpassword'
      const result1 = hashWithSalt(data)
      const result2 = hashWithSalt(data)

      expect(result1.hash).not.toBe(result2.hash)
      expect(result1.salt).not.toBe(result2.salt)
    })
  })

  describe('verifyHash', () => {
    it('should verify correct password', () => {
      const password = 'testpassword'
      const { hash, salt } = hashWithSalt(password)
      const isValid = verifyHash(password, hash, salt)

      expect(isValid).toBe(true)
    })

    it('should reject incorrect password', () => {
      const password = 'testpassword'
      const wrongPassword = 'wrongpassword'
      const { hash, salt } = hashWithSalt(password)
      const isValid = verifyHash(wrongPassword, hash, salt)

      expect(isValid).toBe(false)
    })

    it('should handle timing attacks', () => {
      const password = 'testpassword'
      const { hash, salt } = hashWithSalt(password)
      
      const startTime = Date.now()
      verifyHash(password, hash, salt)
      const correctTime = Date.now() - startTime

      const startTime2 = Date.now()
      verifyHash('wrongpassword', hash, salt)
      const wrongTime = Date.now() - startTime2

      // Times should be similar (within 10ms) to prevent timing attacks
      expect(Math.abs(correctTime - wrongTime)).toBeLessThan(10)
    })
  })

  describe('generateJWT', () => {
    const secret = 'test-secret-key'

    it('should generate valid JWT', () => {
      const payload = { userId: '123', role: 'user' }
      const token = generateJWT(payload, secret)

      expect(token).toMatch(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/)
    })

    it('should include all required claims', () => {
      const payload = { userId: '123' }
      const token = generateJWT(payload, secret)
      const decoded = verifyJWT(token, secret)

      expect(decoded.userId).toBe('123')
      expect(decoded.iat).toBeDefined()
      expect(decoded.exp).toBeDefined()
      expect(decoded.jti).toBeDefined()
      expect(decoded.iss).toBe('digifynn-api')
      expect(decoded.aud).toBe('digifynn-client')
    })

    it('should handle custom expiration', () => {
      const payload = { userId: '123' }
      const token = generateJWT(payload, secret, '1h')
      const decoded = verifyJWT(token, secret)

      const now = Math.floor(Date.now() / 1000)
      expect(decoded.exp).toBeGreaterThan(now)
      expect(decoded.exp).toBeLessThanOrEqual(now + 3600)
    })
  })

  describe('verifyJWT', () => {
    const secret = 'test-secret-key'

    it('should verify valid JWT', () => {
      const payload = { userId: '123' }
      const token = generateJWT(payload, secret)
      const decoded = verifyJWT(token, secret)

      expect(decoded.userId).toBe('123')
    })

    it('should reject invalid signature', () => {
      const payload = { userId: '123' }
      const token = generateJWT(payload, secret)
      const invalidToken = token.substring(0, token.length - 10) + 'invalid'

      expect(() => verifyJWT(invalidToken, secret)).toThrow('Invalid signature')
    })

    it('should reject expired token', () => {
      const payload = { userId: '123' }
      const token = generateJWT(payload, secret, '0s')
      
      expect(() => verifyJWT(token, secret)).toThrow('Token expired')
    })

    it('should reject invalid format', () => {
      expect(() => verifyJWT('invalid.token', secret)).toThrow('Invalid JWT format')
    })

    it('should reject wrong issuer/audience', () => {
      const payload = { userId: '123', iss: 'wrong', aud: 'wrong' }
      const token = generateJWT(payload, secret)
      
      expect(() => verifyJWT(token, secret)).toThrow('Invalid token issuer or audience')
    })
  })

  describe('sanitizeInput', () => {
    it('should remove null bytes', () => {
      const input = 'test\x00string'
      const result = sanitizeInput(input)
      expect(result).toBe('teststring')
    })

    it('should remove control characters', () => {
      const input = 'test\x01\x02\x03string'
      const result = sanitizeInput(input)
      expect(result).toBe('teststring')
    })

    it('should remove script tags', () => {
      const input = '<script>alert("xss")</script>Hello'
      const result = sanitizeInput(input)
      expect(result).toBe('Hello')
    })

    it('should remove javascript protocol', () => {
      const input = 'javascript:alert("xss")'
      const result = sanitizeInput(input)
      expect(result).toBe('alert("xss")')
    })

    it('should remove event handlers', () => {
      const input = '<img src="x" onerror="alert(1)">'
      const result = sanitizeInput(input)
      expect(result).toBe('<img src="x" >')
    })

    it('should handle non-string input', () => {
      expect(sanitizeInput(null as any)).toBe('')
      expect(sanitizeInput(undefined as any)).toBe('')
      expect(sanitizeInput(123 as any)).toBe('')
    })

    it('should limit length', () => {
      const longInput = 'a'.repeat(15000)
      const result = sanitizeInput(longInput)
      expect(result.length).toBe(10000)
    })
  })

  describe('validateFileUpload', () => {
    const createMockFile = (name: string, size: number, type: string): File => {
      return new File(['test'], name, { type })
    }

    it('should validate valid file', () => {
      const file = createMockFile('test.jpg', 1024, 'image/jpeg')
      const result = validateFileUpload(file, ['.jpg', '.png'], 1024 * 1024)

      expect(result.isValid).toBe(true)
      expect(result.error).toBeUndefined()
    })

    it('should reject oversized file', () => {
      const file = createMockFile('test.jpg', 2 * 1024 * 1024, 'image/jpeg')
      const result = validateFileUpload(file, ['.jpg'], 1024 * 1024)

      expect(result.isValid).toBe(false)
      expect(result.error).toContain('File size exceeds')
    })

    it('should reject invalid file type', () => {
      const file = createMockFile('test.txt', 1024, 'text/plain')
      const result = validateFileUpload(file, ['.jpg', '.png'], 1024 * 1024)

      expect(result.isValid).toBe(false)
      expect(result.error).toContain('File type not allowed')
    })

    it('should reject dangerous file types', () => {
      const file = createMockFile('test.exe', 1024, 'application/octet-stream')
      const result = validateFileUpload(file, ['.exe'], 1024 * 1024)

      expect(result.isValid).toBe(false)
      expect(result.error).toContain('Potentially dangerous')
    })
  })

  describe('generateSecurityHeaders', () => {
    it('should generate all required headers', () => {
      const headers = generateSecurityHeaders()

      expect(headers['X-Content-Type-Options']).toBe('nosniff')
      expect(headers['X-Frame-Options']).toBe('DENY')
      expect(headers['X-XSS-Protection']).toBe('1; mode=block')
      expect(headers['Strict-Transport-Security']).toContain('max-age=31536000')
      expect(headers['Content-Security-Policy']).toContain("default-src 'self'")
      expect(headers['Referrer-Policy']).toBe('strict-origin-when-cross-origin')
      expect(headers['Permissions-Policy']).toBeDefined()
    })

    it('should include comprehensive CSP', () => {
      const headers = generateSecurityHeaders()
      const csp = headers['Content-Security-Policy']

      expect(csp).toContain("script-src 'self'")
      expect(csp).toContain("style-src 'self'")
      expect(csp).toContain("img-src 'self'")
      expect(csp).toContain("connect-src 'self'")
    })
  })

  describe('validateCSRFToken', () => {
    it('should validate matching tokens', () => {
      const token = generateCSRFToken()
      const isValid = validateCSRFToken(token, token)
      expect(isValid).toBe(true)
    })

    it('should reject non-matching tokens', () => {
      const token1 = generateCSRFToken()
      const token2 = generateCSRFToken()
      const isValid = validateCSRFToken(token1, token2)
      expect(isValid).toBe(false)
    })

    it('should handle empty tokens', () => {
      expect(validateCSRFToken('', 'token')).toBe(false)
      expect(validateCSRFToken('token', '')).toBe(false)
      expect(validateCSRFToken('', '')).toBe(false)
    })
  })

  describe('generateCSRFToken', () => {
    it('should generate unique tokens', () => {
      const token1 = generateCSRFToken()
      const token2 = generateCSRFToken()
      expect(token1).not.toBe(token2)
    })

    it('should generate valid hex strings', () => {
      const token = generateCSRFToken()
      expect(token).toMatch(/^[0-9a-f]+$/)
      expect(token).toHaveLength(64) // 32 bytes = 64 hex chars
    })
  })

  describe('validateOrigin', () => {
    const allowedOrigins = ['https://digifynn.com', 'https://*.digifynn.com']

    it('should accept exact matches', () => {
      const isValid = validateOrigin('https://digifynn.com', allowedOrigins)
      expect(isValid).toBe(true)
    })

    it('should accept wildcard matches', () => {
      const isValid = validateOrigin('https://api.digifynn.com', allowedOrigins)
      expect(isValid).toBe(true)
    })

    it('should reject non-matching origins', () => {
      const isValid = validateOrigin('https://malicious.com', allowedOrigins)
      expect(isValid).toBe(false)
    })

    it('should handle empty origin', () => {
      const isValid = validateOrigin('', allowedOrigins)
      expect(isValid).toBe(false)
    })

    it('should be case insensitive', () => {
      const isValid = validateOrigin('HTTPS://DIGIFYNN.COM', allowedOrigins)
      expect(isValid).toBe(true)
    })
  })

  describe('createSecureRateLimiter', () => {
    it('should allow requests within limit', async () => {
      const limiter = createSecureRateLimiter({
        maxRequests: 5,
        windowMs: 60000,
        blockDurationMs: 300000
      })

      const key = 'test-key'
      
      for (let i = 0; i < 5; i++) {
        const result = await limiter.checkLimit(key)
        expect(result.allowed).toBe(true)
        expect(result.remaining).toBe(4 - i)
      }
    })

    it('should block requests over limit', async () => {
      const limiter = createSecureRateLimiter({
        maxRequests: 3,
        windowMs: 60000,
        blockDurationMs: 300000
      })

      const key = 'test-key'
      
      // Make 3 requests (allowed)
      for (let i = 0; i < 3; i++) {
        await limiter.checkLimit(key)
      }

      // 4th request should be blocked
      const result = await limiter.checkLimit(key)
      expect(result.allowed).toBe(false)
      expect(result.remaining).toBe(0)
    })

    it('should reset after window expires', async () => {
      const limiter = createSecureRateLimiter({
        maxRequests: 2,
        windowMs: 100, // Very short window
        blockDurationMs: 300000
      })

      const key = 'test-key'
      
      // Make 2 requests
      await limiter.checkLimit(key)
      await limiter.checkLimit(key)
      
      // 3rd should be blocked
      const blocked = await limiter.checkLimit(key)
      expect(blocked.allowed).toBe(false)

      // Wait for window to expire
      await new Promise(resolve => setTimeout(resolve, 150))
      
      // Should be allowed again
      const allowed = await limiter.checkLimit(key)
      expect(allowed.allowed).toBe(true)
    })

    it('should provide stats', async () => {
      const limiter = createSecureRateLimiter({
        maxRequests: 1,
        windowMs: 60000,
        blockDurationMs: 300000
      })

      await limiter.checkLimit('key1')
      await limiter.checkLimit('key2')
      
      const stats = limiter.getStats()
      expect(stats.totalKeys).toBe(2)
      expect(stats.totalRequests).toBe(2)
    })
  })

  describe('validateInput', () => {
    describe('string validation', () => {
      it('should validate required strings', () => {
        const result = validateInput('test', { type: 'string', required: true })
        expect(result.isValid).toBe(true)
      })

      it('should reject missing required strings', () => {
        const result = validateInput('', { type: 'string', required: true })
        expect(result.isValid).toBe(false)
        expect(result.errors).toContain('This field is required')
      })

      it('should validate length constraints', () => {
        const result = validateInput('test', { 
          type: 'string', 
          minLength: 5, 
          maxLength: 10 
        })
        expect(result.isValid).toBe(false)
        expect(result.errors).toContain('Must be at least 5 characters')
      })
    })

    describe('email validation', () => {
      it('should validate correct emails', () => {
        const result = validateInput('test@example.com', { type: 'email' })
        expect(result.isValid).toBe(true)
      })

      it('should reject invalid emails', () => {
        const result = validateInput('invalid-email', { type: 'email' })
        expect(result.isValid).toBe(false)
        expect(result.errors).toContain('Must be a valid email address')
      })
    })

    describe('url validation', () => {
      it('should validate correct URLs', () => {
        const result = validateInput('https://example.com', { type: 'url' })
        expect(result.isValid).toBe(true)
      })

      it('should reject invalid URLs', () => {
        const result = validateInput('not-a-url', { type: 'url' })
        expect(result.isValid).toBe(false)
        expect(result.errors).toContain('Must be a valid URL')
      })
    })

    describe('number validation', () => {
      it('should validate numbers', () => {
        const result = validateInput('123', { type: 'number' })
        expect(result.isValid).toBe(true)
      })

      it('should reject non-numbers', () => {
        const result = validateInput('not-a-number', { type: 'number' })
        expect(result.isValid).toBe(false)
        expect(result.errors).toContain('Must be a valid number')
      })
    })

    describe('pattern validation', () => {
      it('should validate against pattern', () => {
        const result = validateInput('abc123', { 
          type: 'string', 
          pattern: /^[a-z]+\d+$/ 
        })
        expect(result.isValid).toBe(true)
      })

      it('should reject non-matching pattern', () => {
        const result = validateInput('123abc', { 
          type: 'string', 
          pattern: /^[a-z]+\d+$/ 
        })
        expect(result.isValid).toBe(false)
        expect(result.errors).toContain('Invalid format')
      })
    })

    describe('custom validation', () => {
      it('should use custom validator', () => {
        const result = validateInput('test', { 
          type: 'string', 
          custom: (value) => value === 'test' 
        })
        expect(result.isValid).toBe(true)
      })

      it('should reject custom validator failure', () => {
        const result = validateInput('wrong', { 
          type: 'string', 
          custom: (value) => value === 'test' 
        })
        expect(result.isValid).toBe(false)
        expect(result.errors).toContain('Invalid value')
      })
    })
  })
}) 