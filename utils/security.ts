/**
 * Advanced security utilities for comprehensive protection
 */

import crypto from 'crypto'

export interface SecurityConfig {
  maxRequestSize: number
  allowedOrigins: string[]
  rateLimitConfig: {
    windowMs: number
    maxRequests: number
    blockDurationMs: number
  }
  corsConfig: {
    origin: string[]
    methods: string[]
    allowedHeaders: string[]
    credentials: boolean
  }
  threatDetection: {
    enabled: boolean
    suspiciousPatterns: RegExp[]
    maxFailedAttempts: number
    blockDuration: number
  }
}

export interface SecurityHeaders {
  'X-Content-Type-Options': string
  'X-Frame-Options': string
  'X-XSS-Protection': string
  'Strict-Transport-Security': string
  'Content-Security-Policy': string
  'Referrer-Policy': string
  'Permissions-Policy': string
  'X-Permitted-Cross-Domain-Policies': string
  'X-Download-Options': string
  'X-DNS-Prefetch-Control': string
}

/**
 * Advanced threat detection system
 */
export class ThreatDetector {
  private static failedAttempts = new Map<string, { count: number; lastAttempt: number; blocked: boolean }>()
  private static suspiciousIPs = new Set<string>()
  private static config: SecurityConfig['threatDetection']

  static initialize(config: SecurityConfig['threatDetection']) {
    this.config = config
  }

  static detectThreat(request: any): { isThreat: boolean; reason?: string; action: 'block' | 'monitor' | 'allow' } {
    if (!this.config?.enabled) return { isThreat: false, action: 'allow' }

    const clientIP = this.getClientIP(request)
    const userAgent = request.headers['user-agent'] || ''
    const requestBody = request.body || ''

    // Check for suspicious patterns
    for (const pattern of this.config.suspiciousPatterns) {
      if (pattern.test(requestBody) || pattern.test(userAgent)) {
        this.recordFailedAttempt(clientIP)
        return { 
          isThreat: true, 
          reason: 'Suspicious pattern detected', 
          action: 'block' 
        }
      }
    }

    // Check for SQL injection attempts
    const sqlPatterns = [
      /(\b(union|select|insert|update|delete|drop|create|alter)\b)/i,
      /(\b(or|and)\b\s+\d+\s*=\s*\d+)/i,
      /(\b(union|select)\b.*\b(from|where)\b)/i
    ]

    for (const pattern of sqlPatterns) {
      if (pattern.test(requestBody)) {
        this.recordFailedAttempt(clientIP)
        return { 
          isThreat: true, 
          reason: 'SQL injection attempt detected', 
          action: 'block' 
        }
      }
    }

    // Check for XSS attempts
    const xssPatterns = [
      /<script[^>]*>.*?<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /<iframe[^>]*>/gi
    ]

    for (const pattern of xssPatterns) {
      if (pattern.test(requestBody)) {
        this.recordFailedAttempt(clientIP)
        return { 
          isThreat: true, 
          reason: 'XSS attempt detected', 
          action: 'block' 
        }
      }
    }

    // Check for excessive failed attempts
    const attempts = this.failedAttempts.get(clientIP)
    if (attempts && attempts.count >= this.config.maxFailedAttempts) {
      if (Date.now() - attempts.lastAttempt < this.config.blockDuration) {
        return { 
          isThreat: true, 
          reason: 'Too many failed attempts', 
          action: 'block' 
        }
      } else {
        // Reset after block duration
        this.failedAttempts.delete(clientIP)
      }
    }

    return { isThreat: false, action: 'allow' }
  }

  private static recordFailedAttempt(clientIP: string) {
    const attempts = this.failedAttempts.get(clientIP) || { count: 0, lastAttempt: 0, blocked: false }
    attempts.count++
    attempts.lastAttempt = Date.now()
    this.failedAttempts.set(clientIP, attempts)
  }

  private static getClientIP(request: any): string {
    return request.headers['x-forwarded-for'] || 
           request.headers['x-real-ip'] || 
           request.connection?.remoteAddress || 
           'unknown'
  }

  static getThreatStats() {
    return {
      suspiciousIPs: this.suspiciousIPs.size,
      failedAttempts: this.failedAttempts.size,
      totalThreats: Array.from(this.failedAttempts.values()).reduce((sum, attempts) => sum + attempts.count, 0)
    }
  }
}

/**
 * Generate secure random tokens
 */
export function generateSecureToken(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex')
}

/**
 * Hash sensitive data with salt
 */
export function hashWithSalt(data: string, salt?: string): { hash: string; salt: string } {
  const generatedSalt = salt || crypto.randomBytes(16).toString('hex')
  const hash = crypto.pbkdf2Sync(data, generatedSalt, 10000, 64, 'sha512').toString('hex')
  return { hash, salt: generatedSalt }
}

/**
 * Verify hashed data
 */
export function verifyHash(data: string, hash: string, salt: string): boolean {
  const computedHash = crypto.pbkdf2Sync(data, salt, 10000, 64, 'sha512').toString('hex')
  return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(computedHash, 'hex'))
}

/**
 * Generate JWT token with enhanced security
 */
export function generateJWT(payload: any, secret: string, expiresIn: string = '24h'): string {
  const header = {
    alg: 'HS256',
    typ: 'JWT'
  }
  
  const now = Math.floor(Date.now() / 1000)
  const exp = now + (expiresIn === '24h' ? 86400 : parseInt(expiresIn))
  
  const jwtPayload = {
    ...payload,
    iat: now,
    exp,
    jti: generateSecureToken(16), // JWT ID for replay protection
    iss: 'digifynn-api', // Issuer
    aud: 'digifynn-client' // Audience
  }
  
  const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url')
  const encodedPayload = Buffer.from(JSON.stringify(jwtPayload)).toString('base64url')
  
  const signature = crypto
    .createHmac('sha256', secret)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest('base64url')
  
  return `${encodedHeader}.${encodedPayload}.${signature}`
}

/**
 * Verify JWT token with enhanced security
 */
export function verifyJWT(token: string, secret: string): any {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) {
      throw new Error('Invalid JWT format')
    }
    
    const [encodedHeader, encodedPayload, signature] = parts
    
    // Verify signature
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(`${encodedHeader}.${encodedPayload}`)
      .digest('base64url')
    
    if (!crypto.timingSafeEqual(
      Buffer.from(signature, 'base64url'),
      Buffer.from(expectedSignature, 'base64url')
    )) {
      throw new Error('Invalid signature')
    }
    
    // Decode payload
    const payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString())
    
    // Check expiration
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      throw new Error('Token expired')
    }
    
    // Check issuer and audience
    if (payload.iss !== 'digifynn-api' || payload.aud !== 'digifynn-client') {
      throw new Error('Invalid token issuer or audience')
    }
    
    return payload
  } catch (error) {
    throw new Error(`JWT verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Enhanced input sanitization
 */
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') {
    return ''
  }

  // Remove null bytes
  let sanitized = input.replace(/\0/g, '')
  
  // Remove control characters except newlines and tabs
  sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
  
  // Normalize unicode
  sanitized = sanitized.normalize('NFC')
  
  // Remove potentially dangerous HTML
  sanitized = sanitized
    .replace(/<script[^>]*>.*?<\/script>/gi, '')
    .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '')
    .replace(/<object[^>]*>.*?<\/object>/gi, '')
    .replace(/<embed[^>]*>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .replace(/vbscript:/gi, '')
    .replace(/data:/gi, '')
    .replace(/expression\s*\(/gi, '')
  
  // Limit length
  if (sanitized.length > 10000) {
    sanitized = sanitized.substring(0, 10000)
  }
  
  return sanitized.trim()
}

/**
 * Enhanced file upload validation
 */
export function validateFileUpload(file: File, allowedTypes: string[], maxSize: number): {
  isValid: boolean
  error?: string
} {
  // Check file size
  if (file.size > maxSize) {
    return {
      isValid: false,
      error: `File size exceeds maximum allowed size of ${Math.round(maxSize / 1024 / 1024)}MB`
    }
  }

  // Check file type
  const fileExtension = file.name.split('.').pop()?.toLowerCase()
  const mimeType = file.type.toLowerCase()
  
  const isValidType = allowedTypes.some(type => {
    if (type.startsWith('.')) {
      return fileExtension === type.substring(1)
    }
    return mimeType === type || mimeType.startsWith(type + '/')
  })

  if (!isValidType) {
    return {
      isValid: false,
      error: `File type not allowed. Allowed types: ${allowedTypes.join(', ')}`
    }
  }

  // Additional security checks
  const suspiciousExtensions = ['.exe', '.bat', '.cmd', '.com', '.pif', '.scr', '.vbs', '.js']
  if (suspiciousExtensions.includes('.' + fileExtension)) {
    return {
      isValid: false,
      error: 'Potentially dangerous file type detected'
    }
  }

  return { isValid: true }
}

/**
 * Generate comprehensive security headers
 */
export function generateSecurityHeaders(): SecurityHeaders {
  return {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
    'Content-Security-Policy': [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.google-analytics.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: https: blob:",
      "connect-src 'self' https://cms.digifynn.com https://api.digifynn.com",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "upgrade-insecure-requests"
    ].join('; '),
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'geolocation=(), microphone=(), camera=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()',
    'X-Permitted-Cross-Domain-Policies': 'none',
    'X-Download-Options': 'noopen',
    'X-DNS-Prefetch-Control': 'off'
  }
}

/**
 * Enhanced CSRF protection
 */
export function validateCSRFToken(token: string, sessionToken: string): boolean {
  if (!token || !sessionToken) {
    return false
  }
  
  // Use timing-safe comparison
  return crypto.timingSafeEqual(
    Buffer.from(token, 'hex'),
    Buffer.from(sessionToken, 'hex')
  )
}

/**
 * Generate CSRF token
 */
export function generateCSRFToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

/**
 * Validate origin with enhanced security
 */
export function validateOrigin(origin: string, allowedOrigins: string[]): boolean {
  if (!origin) return false
  
  // Normalize origin
  const normalizedOrigin = origin.toLowerCase().trim()
  
  // Check exact matches
  if (allowedOrigins.includes(normalizedOrigin)) {
    return true
  }
  
  // Check wildcard patterns
  return allowedOrigins.some(allowed => {
    if (allowed.includes('*')) {
      const pattern = allowed.replace(/\*/g, '.*')
      return new RegExp(`^${pattern}$`).test(normalizedOrigin)
    }
    return false
  })
}

/**
 * Enhanced rate limiter with threat detection
 */
export function createSecureRateLimiter(config: SecurityConfig['rateLimitConfig']) {
  const requests = new Map<string, { count: number; resetTime: number; blocked: boolean }>()
  
  return {
    async checkLimit(key: string): Promise<{ allowed: boolean; remaining: number; resetTime: number; limit: number }> {
      const now = Date.now()
      const record = requests.get(key)
      
      if (!record || now > record.resetTime) {
        // Reset or create new record
        requests.set(key, {
          count: 1,
          resetTime: now + config.windowMs,
          blocked: false
        })
        return {
          allowed: true,
          remaining: config.maxRequests - 1,
          resetTime: now + config.windowMs,
          limit: config.maxRequests
        }
      }
      
      if (record.blocked) {
        if (now > record.resetTime + config.blockDurationMs) {
          // Unblock after duration
          record.blocked = false
          record.count = 1
          record.resetTime = now + config.windowMs
        } else {
          return {
            allowed: false,
            remaining: 0,
            resetTime: record.resetTime + config.blockDurationMs,
            limit: config.maxRequests
          }
        }
      }
      
      if (record.count >= config.maxRequests) {
        record.blocked = true
        return {
          allowed: false,
          remaining: 0,
          resetTime: record.resetTime + config.blockDurationMs,
          limit: config.maxRequests
        }
      }
      
      record.count++
      return {
        allowed: true,
        remaining: config.maxRequests - record.count,
        resetTime: record.resetTime,
        limit: config.maxRequests
      }
    },
    
    getStats() {
      const stats = {
        totalKeys: requests.size,
        blockedKeys: 0,
        totalRequests: 0
      }
      
      for (const record of requests.values()) {
        if (record.blocked) stats.blockedKeys++
        stats.totalRequests += record.count
      }
      
      return stats
    }
  }
}

/**
 * Enhanced input validation with comprehensive rules
 */
export function validateInput(input: any, rules: {
  type: 'string' | 'number' | 'email' | 'url' | 'date' | 'phone' | 'postal_code'
  minLength?: number
  maxLength?: number
  pattern?: RegExp
  required?: boolean
  custom?: (value: any) => boolean
}): { isValid: boolean; errors: string[] } {
  const errors: string[] = []
  
  // Check required
  if (rules.required && (input === undefined || input === null || input === '')) {
    errors.push('This field is required')
    return { isValid: false, errors }
  }
  
  if (input === undefined || input === null || input === '') {
    return { isValid: true, errors: [] }
  }
  
  // Type validation
  switch (rules.type) {
    case 'string':
      if (typeof input !== 'string') {
        errors.push('Must be a string')
      }
      break
    case 'number':
      if (isNaN(Number(input))) {
        errors.push('Must be a valid number')
      }
      break
    case 'email':
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailPattern.test(input)) {
        errors.push('Must be a valid email address')
      }
      break
    case 'url':
      try {
        new URL(input)
      } catch {
        errors.push('Must be a valid URL')
      }
      break
    case 'date':
      if (isNaN(Date.parse(input))) {
        errors.push('Must be a valid date')
      }
      break
    case 'phone':
      const phonePattern = /^[\+]?[1-9][\d]{0,15}$/
      if (!phonePattern.test(input.replace(/[\s\-\(\)]/g, ''))) {
        errors.push('Must be a valid phone number')
      }
      break
    case 'postal_code':
      const postalPattern = /^\d{5}(-\d{4})?$/
      if (!postalPattern.test(input)) {
        errors.push('Must be a valid postal code')
      }
      break
  }
  
  // Length validation
  if (typeof input === 'string') {
    if (rules.minLength && input.length < rules.minLength) {
      errors.push(`Must be at least ${rules.minLength} characters`)
    }
    if (rules.maxLength && input.length > rules.maxLength) {
      errors.push(`Must be no more than ${rules.maxLength} characters`)
    }
  }
  
  // Pattern validation
  if (rules.pattern && typeof input === 'string' && !rules.pattern.test(input)) {
    errors.push('Invalid format')
  }
  
  // Custom validation
  if (rules.custom && !rules.custom(input)) {
    errors.push('Invalid value')
  }
  
  return { isValid: errors.length === 0, errors }
}

/**
 * Initialize threat detection system
 */
export function initializeThreatDetection() {
  ThreatDetector.initialize({
    enabled: true,
    suspiciousPatterns: [
      /<script/i,
      /javascript:/i,
      /vbscript:/i,
      /on\w+\s*=/i,
      /expression\s*\(/i,
      /union\s+select/i,
      /drop\s+table/i,
      /insert\s+into/i,
      /delete\s+from/i,
      /update\s+set/i
    ],
    maxFailedAttempts: 5,
    blockDuration: 15 * 60 * 1000 // 15 minutes
  })
} 