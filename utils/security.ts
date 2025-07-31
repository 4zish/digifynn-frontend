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
}

export interface SecurityHeaders {
  'X-Content-Type-Options': string
  'X-Frame-Options': string
  'X-XSS-Protection': string
  'Strict-Transport-Security': string
  'Content-Security-Policy': string
  'Referrer-Policy': string
  'Permissions-Policy': string
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
    jti: generateSecureToken(16) // JWT ID for replay protection
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
      throw new Error('Invalid JWT signature')
    }
    
    // Decode payload
    const payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString())
    
    // Check expiration
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      throw new Error('JWT token expired')
    }
    
    return payload
  } catch (error) {
    throw new Error(`JWT verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Sanitize input with comprehensive XSS protection
 */
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') {
    return ''
  }
  
  return input
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .replace(/data:/gi, '') // Remove data protocol
    .replace(/vbscript:/gi, '') // Remove vbscript protocol
    .replace(/expression\s*\(/gi, '') // Remove CSS expressions
    .replace(/url\s*\(/gi, '') // Remove CSS url functions
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '') // Remove iframe tags
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '') // Remove object tags
    .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '') // Remove embed tags
    .replace(/<form\b[^<]*(?:(?!<\/form>)<[^<]*)*<\/form>/gi, '') // Remove form tags
    .replace(/<input\b[^<]*(?:(?!<\/input>)<[^<]*)*>/gi, '') // Remove input tags
    .replace(/<textarea\b[^<]*(?:(?!<\/textarea>)<[^<]*)*<\/textarea>/gi, '') // Remove textarea tags
    .replace(/<select\b[^<]*(?:(?!<\/select>)<[^<]*)*<\/select>/gi, '') // Remove select tags
    .replace(/<button\b[^<]*(?:(?!<\/button>)<[^<]*)*<\/button>/gi, '') // Remove button tags
    .replace(/<link\b[^<]*(?:(?!<\/link>)<[^<]*)*>/gi, '') // Remove link tags
    .replace(/<meta\b[^<]*(?:(?!<\/meta>)<[^<]*)*>/gi, '') // Remove meta tags
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '') // Remove style tags
    .replace(/<link\b[^<]*(?:(?!<\/link>)<[^<]*)*>/gi, '') // Remove link tags
    .replace(/<base\b[^<]*(?:(?!<\/base>)<[^<]*)*>/gi, '') // Remove base tags
    .replace(/<title\b[^<]*(?:(?!<\/title>)<[^<]*)*<\/title>/gi, '') // Remove title tags
    .replace(/<head\b[^<]*(?:(?!<\/head>)<[^<]*)*<\/head>/gi, '') // Remove head tags
    .replace(/<body\b[^<]*(?:(?!<\/body>)<[^<]*)*<\/body>/gi, '') // Remove body tags
    .replace(/<html\b[^<]*(?:(?!<\/html>)<[^<]*)*<\/html>/gi, '') // Remove html tags
    .replace(/<xml\b[^<]*(?:(?!<\/xml>)<[^<]*)*<\/xml>/gi, '') // Remove xml tags
    .replace(/<svg\b[^<]*(?:(?!<\/svg>)<[^<]*)*<\/svg>/gi, '') // Remove svg tags
    .replace(/<math\b[^<]*(?:(?!<\/math>)<[^<]*)*<\/math>/gi, '') // Remove math tags
    .replace(/<applet\b[^<]*(?:(?!<\/applet>)<[^<]*)*<\/applet>/gi, '') // Remove applet tags
    .replace(/<bgsound\b[^<]*(?:(?!<\/bgsound>)<[^<]*)*>/gi, '') // Remove bgsound tags
    .replace(/<marquee\b[^<]*(?:(?!<\/marquee>)<[^<]*)*<\/marquee>/gi, '') // Remove marquee tags
    .replace(/<xmp\b[^<]*(?:(?!<\/xmp>)<[^<]*)*<\/xmp>/gi, '') // Remove xmp tags
    .replace(/<plaintext\b[^<]*(?:(?!<\/plaintext>)<[^<]*)*>/gi, '') // Remove plaintext tags
    .replace(/<listing\b[^<]*(?:(?!<\/listing>)<[^<]*)*<\/listing>/gi, '') // Remove listing tags
    .replace(/<nobr\b[^<]*(?:(?!<\/nobr>)<[^<]*)*<\/nobr>/gi, '') // Remove nobr tags
    .replace(/<noembed\b[^<]*(?:(?!<\/noembed>)<[^<]*)*<\/noembed>/gi, '') // Remove noembed tags
    .replace(/<noframes\b[^<]*(?:(?!<\/noframes>)<[^<]*)*<\/noframes>/gi, '') // Remove noframes tags
    .replace(/<noscript\b[^<]*(?:(?!<\/noscript>)<[^<]*)*<\/noscript>/gi, '') // Remove noscript tags
    .replace(/<wbr\b[^<]*(?:(?!<\/wbr>)<[^<]*)*>/gi, '') // Remove wbr tags
    .replace(/<xmp\b[^<]*(?:(?!<\/xmp>)<[^<]*)*<\/xmp>/gi, '') // Remove xmp tags
    .replace(/<plaintext\b[^<]*(?:(?!<\/plaintext>)<[^<]*)*>/gi, '') // Remove plaintext tags
    .replace(/<listing\b[^<]*(?:(?!<\/listing>)<[^<]*)*<\/listing>/gi, '') // Remove listing tags
    .replace(/<nobr\b[^<]*(?:(?!<\/nobr>)<[^<]*)*<\/nobr>/gi, '') // Remove nobr tags
    .replace(/<noembed\b[^<]*(?:(?!<\/noembed>)<[^<]*)*<\/noembed>/gi, '') // Remove noembed tags
    .replace(/<noframes\b[^<]*(?:(?!<\/noframes>)<[^<]*)*<\/noframes>/gi, '') // Remove noframes tags
    .replace(/<noscript\b[^<]*(?:(?!<\/noscript>)<[^<]*)*<\/noscript>/gi, '') // Remove noscript tags
    .replace(/<wbr\b[^<]*(?:(?!<\/wbr>)<[^<]*)*>/gi, '') // Remove wbr tags
    .trim()
}

/**
 * Validate and sanitize file uploads
 */
export function validateFileUpload(file: File, allowedTypes: string[], maxSize: number): {
  isValid: boolean
  error?: string
} {
  if (!file) {
    return { isValid: false, error: 'فایل انتخاب نشده است' }
  }
  
  if (file.size > maxSize) {
    return { isValid: false, error: `حجم فایل بیش از ${Math.round(maxSize / 1024 / 1024)} مگابایت است` }
  }
  
  if (!allowedTypes.includes(file.type)) {
    return { isValid: false, error: 'نوع فایل مجاز نیست' }
  }
  
  // Check file extension
  const extension = file.name.split('.').pop()?.toLowerCase()
  const allowedExtensions = allowedTypes.map(type => type.split('/')[1])
  
  if (!extension || !allowedExtensions.includes(extension)) {
    return { isValid: false, error: 'پسوند فایل مجاز نیست' }
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
      "media-src 'self' https:",
      "connect-src 'self' https://cms.digifynn.com https://www.google-analytics.com",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "upgrade-insecure-requests"
    ].join('; '),
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()'
  }
}

/**
 * Validate CSRF token
 */
export function validateCSRFToken(token: string, sessionToken: string): boolean {
  if (!token || !sessionToken) {
    return false
  }
  
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
 * Validate origin for CORS
 */
export function validateOrigin(origin: string, allowedOrigins: string[]): boolean {
  if (!origin) {
    return false
  }
  
  return allowedOrigins.some(allowed => {
    if (allowed === '*') return true
    if (allowed.startsWith('*.')) {
      const domain = allowed.slice(2)
      return origin.endsWith(domain)
    }
    return origin === allowed
  })
}

/**
 * Rate limiting with enhanced security
 */
export function createSecureRateLimiter(config: SecurityConfig['rateLimitConfig']) {
  const store = new Map<string, { count: number; resetTime: number; blocked: boolean }>()
  
  return {
    checkLimit: (identifier: string): { allowed: boolean; remaining: number; resetTime: number } => {
      const now = Date.now()
      const key = `rate_limit:${identifier}`
      const record = store.get(key)
      
      if (!record || now > record.resetTime) {
        store.set(key, {
          count: 1,
          resetTime: now + config.windowMs,
          blocked: false
        })
        
        return {
          allowed: true,
          remaining: config.maxRequests - 1,
          resetTime: now + config.windowMs
        }
      }
      
      if (record.blocked) {
        return {
          allowed: false,
          remaining: 0,
          resetTime: record.resetTime
        }
      }
      
      if (record.count >= config.maxRequests) {
        record.blocked = true
        record.resetTime = now + config.blockDurationMs
        store.set(key, record)
        
        return {
          allowed: false,
          remaining: 0,
          resetTime: record.resetTime
        }
      }
      
      record.count++
      store.set(key, record)
      
      return {
        allowed: true,
        remaining: config.maxRequests - record.count,
        resetTime: record.resetTime
      }
    },
    
    reset: (identifier: string): void => {
      store.delete(`rate_limit:${identifier}`)
    }
  }
}

/**
 * Input validation with comprehensive checks
 */
export function validateInput(input: any, rules: {
  type: 'string' | 'number' | 'email' | 'url' | 'date'
  minLength?: number
  maxLength?: number
  pattern?: RegExp
  required?: boolean
}): { isValid: boolean; errors: string[] } {
  const errors: string[] = []
  
  if (rules.required && !input) {
    errors.push('این فیلد الزامی است')
    return { isValid: false, errors }
  }
  
  if (!input && !rules.required) {
    return { isValid: true, errors: [] }
  }
  
  const stringInput = String(input)
  
  // Type validation
  switch (rules.type) {
    case 'email':
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(stringInput)) {
        errors.push('فرمت ایمیل نامعتبر است')
      }
      break
      
    case 'url':
      try {
        new URL(stringInput)
      } catch {
        errors.push('فرمت URL نامعتبر است')
      }
      break
      
    case 'number':
      if (isNaN(Number(stringInput))) {
        errors.push('مقدار باید عدد باشد')
      }
      break
      
    case 'date':
      if (isNaN(Date.parse(stringInput))) {
        errors.push('فرمت تاریخ نامعتبر است')
      }
      break
  }
  
  // Length validation
  if (rules.minLength && stringInput.length < rules.minLength) {
    errors.push(`حداقل ${rules.minLength} کاراکتر الزامی است`)
  }
  
  if (rules.maxLength && stringInput.length > rules.maxLength) {
    errors.push(`حداکثر ${rules.maxLength} کاراکتر مجاز است`)
  }
  
  // Pattern validation
  if (rules.pattern && !rules.pattern.test(stringInput)) {
    errors.push('فرمت وارد شده صحیح نیست')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
} 