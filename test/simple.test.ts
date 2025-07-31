import { describe, it, expect } from 'vitest'
import { validateSlug, sanitizeSlug } from '../utils/validation'

describe('Simple Validation Test', () => {
  it('should validate slugs correctly', () => {
    const result = validateSlug('hello-world')
    expect(result.isValid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })
  
  it('should sanitize slugs correctly', () => {
    const result = sanitizeSlug('hello world')
    expect(result).toBe('helloworld')
  })
  
  it('should reject invalid slugs', () => {
    const result = validateSlug('hello@world')
    expect(result.isValid).toBe(false)
    expect(result.errors.length).toBeGreaterThan(0)
  })
}) 