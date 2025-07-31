import { describe, it, expect } from 'vitest'
import { 
  validateSlug, 
  sanitizeSlug, 
  validateEmail, 
  validateStringLength, 
  validateNumberRange, 
  sanitizeHtml, 
  validateSearchQuery, 
  sanitizeSearchQuery 
} from '../../utils/validation'

describe('Validation Utilities', () => {
  describe('validateSlug', () => {
    it('should validate valid slugs', () => {
      const validSlugs = ['hello-world', 'test123', 'my_slug', 'a-b-c']
      
      validSlugs.forEach(slug => {
        const result = validateSlug(slug)
        expect(result.isValid).toBe(true)
        expect(result.errors).toHaveLength(0)
      })
    })

    it('should reject invalid slugs', () => {
      const invalidSlugs = [
        { slug: '', expectedError: 'شناسه نمی‌تواند خالی باشد' },
        { slug: 'hello@world', expectedError: 'شناسه فقط می‌تواند شامل حروف، اعداد، خط تیره و زیرخط باشد' },
        { slug: 'hello world', expectedError: 'شناسه فقط می‌تواند شامل حروف، اعداد، خط تیره و زیرخط باشد' },
        { slug: 'a'.repeat(101), expectedError: 'شناسه نمی‌تواند بیشتر از ۱۰۰ کاراکتر باشد' }
      ]
      
      invalidSlugs.forEach(({ slug, expectedError }) => {
        const result = validateSlug(slug)
        expect(result.isValid).toBe(false)
        expect(result.errors).toContain(expectedError)
      })
    })

    it('should handle non-string inputs', () => {
      const result = validateSlug(null as any)
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('شناسه باید رشته باشد')
    })
  })

  describe('sanitizeSlug', () => {
    it('should sanitize valid inputs', () => {
      expect(sanitizeSlug('hello-world')).toBe('hello-world')
      expect(sanitizeSlug('test@123')).toBe('test123')
      expect(sanitizeSlug('my slug')).toBe('myslug')
    })

    it('should handle invalid inputs', () => {
      expect(sanitizeSlug('')).toBe('')
      expect(sanitizeSlug(null as any)).toBe('')
      expect(sanitizeSlug(undefined as any)).toBe('')
    })
  })

  describe('validateEmail', () => {
    it('should validate valid emails', () => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.co.uk',
        'test+tag@example.org'
      ]
      
      validEmails.forEach(email => {
        const result = validateEmail(email)
        expect(result.isValid).toBe(true)
        expect(result.errors).toHaveLength(0)
      })
    })

    it('should reject invalid emails', () => {
      const invalidEmails = [
        { email: '', expectedError: 'ایمیل نمی‌تواند خالی باشد' },
        { email: 'invalid-email', expectedError: 'فرمت ایمیل نامعتبر است' },
        { email: '@example.com', expectedError: 'فرمت ایمیل نامعتبر است' },
        { email: 'test@', expectedError: 'فرمت ایمیل نامعتبر است' },
        { email: 'a'.repeat(255), expectedError: 'ایمیل نمی‌تواند بیشتر از ۲۵۴ کاراکتر باشد' }
      ]
      
      invalidEmails.forEach(({ email, expectedError }) => {
        const result = validateEmail(email)
        expect(result.isValid).toBe(false)
        expect(result.errors).toContain(expectedError)
      })
    })
  })

  describe('validateStringLength', () => {
    it('should validate string length correctly', () => {
      const result = validateStringLength('test', 2, 10, 'نام')
      expect(result.isValid).toBe(true)
    })

    it('should reject strings that are too short', () => {
      const result = validateStringLength('a', 2, 10, 'نام')
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('نام باید حداقل ۲ کاراکتر باشد')
    })

    it('should reject strings that are too long', () => {
      const result = validateStringLength('a'.repeat(11), 2, 10, 'نام')
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('نام نمی‌تواند بیشتر از ۱۰ کاراکتر باشد')
    })

    it('should handle empty strings', () => {
      const result = validateStringLength('', 1, 10, 'نام')
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('نام نمی‌تواند خالی باشد')
    })
  })

  describe('validateNumberRange', () => {
    it('should validate numbers within range', () => {
      const result = validateNumberRange(5, 1, 10, 'سن')
      expect(result.isValid).toBe(true)
    })

    it('should reject numbers below minimum', () => {
      const result = validateNumberRange(0, 1, 10, 'سن')
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('سن نمی‌تواند کمتر از ۱ باشد')
    })

    it('should reject numbers above maximum', () => {
      const result = validateNumberRange(11, 1, 10, 'سن')
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('سن نمی‌تواند بیشتر از ۱۰ باشد')
    })

    it('should handle non-numbers', () => {
      const result = validateNumberRange(NaN, 1, 10, 'سن')
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('سن باید عدد باشد')
    })
  })

  describe('sanitizeHtml', () => {
    it('should remove script tags', () => {
      const input = '<p>Hello</p><script>alert("xss")</script>'
      const result = sanitizeHtml(input)
      expect(result).toBe('<p>Hello</p>')
    })

    it('should remove iframe tags', () => {
      const input = '<p>Hello</p><iframe src="malicious.com"></iframe>'
      const result = sanitizeHtml(input)
      expect(result).toBe('<p>Hello</p>')
    })

    it('should remove javascript: protocols', () => {
      const input = '<a href="javascript:alert(1)">Click</a>'
      const result = sanitizeHtml(input)
      expect(result).toBe('<a href="">Click</a>')
    })

    it('should remove event handlers', () => {
      const input = '<button onclick="alert(1)">Click</button>'
      const result = sanitizeHtml(input)
      expect(result).toBe('<button>Click</button>')
    })

    it('should handle invalid inputs', () => {
      expect(sanitizeHtml('')).toBe('')
      expect(sanitizeHtml(null as any)).toBe('')
      expect(sanitizeHtml(undefined as any)).toBe('')
    })
  })

  describe('validateSearchQuery', () => {
    it('should validate valid search queries', () => {
      const validQueries = ['test', 'hello world', 'a'.repeat(50)]
      
      validQueries.forEach(query => {
        const result = validateSearchQuery(query)
        expect(result.isValid).toBe(true)
        expect(result.errors).toHaveLength(0)
      })
    })

    it('should reject invalid search queries', () => {
      const invalidQueries = [
        { query: '', expectedError: 'عبارت جستجو نمی‌تواند خالی باشد' },
        { query: 'a', expectedError: 'عبارت جستجو باید حداقل ۲ کاراکتر باشد' },
        { query: 'a'.repeat(101), expectedError: 'عبارت جستجو نمی‌تواند بیشتر از ۱۰۰ کاراکتر باشد' }
      ]
      
      invalidQueries.forEach(({ query, expectedError }) => {
        const result = validateSearchQuery(query)
        expect(result.isValid).toBe(false)
        expect(result.errors).toContain(expectedError)
      })
    })
  })

  describe('sanitizeSearchQuery', () => {
    it('should sanitize search queries', () => {
      expect(sanitizeSearchQuery('hello world')).toBe('hello world')
      expect(sanitizeSearchQuery('<script>alert(1)</script>')).toBe('alert(1)')
      expect(sanitizeSearchQuery('javascript:alert(1)')).toBe('alert(1)')
    })

    it('should handle invalid inputs', () => {
      expect(sanitizeSearchQuery('')).toBe('')
      expect(sanitizeSearchQuery(null as any)).toBe('')
      expect(sanitizeSearchQuery(undefined as any)).toBe('')
    })
  })
}) 