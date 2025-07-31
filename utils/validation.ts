/**
 * Input validation utilities for security and data integrity
 */

export interface ValidationResult {
  isValid: boolean
  errors: string[]
}

/**
 * Validates a slug string
 */
export function validateSlug(slug: string): ValidationResult {
  const errors: string[] = []
  
  if (!slug) {
    errors.push('شناسه نمی‌تواند خالی باشد')
    return { isValid: false, errors }
  }
  
  if (typeof slug !== 'string') {
    errors.push('شناسه باید رشته باشد')
    return { isValid: false, errors }
  }
  
  if (slug.length < 1) {
    errors.push('شناسه باید حداقل ۱ کاراکتر باشد')
  }
  
  if (slug.length > 100) {
    errors.push('شناسه نمی‌تواند بیشتر از ۱۰۰ کاراکتر باشد')
  }
  
  // Check for valid characters (alphanumeric, hyphens, underscores)
  const validSlugRegex = /^[a-zA-Z0-9\-_]+$/
  if (!validSlugRegex.test(slug)) {
    errors.push('شناسه فقط می‌تواند شامل حروف، اعداد، خط تیره و زیرخط باشد')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Sanitizes a slug string to prevent injection
 */
export function sanitizeSlug(slug: string): string {
  if (!slug || typeof slug !== 'string') {
    return ''
  }
  
  // Remove any non-alphanumeric characters except hyphens and underscores
  return slug.replace(/[^a-zA-Z0-9\-_]/g, '')
}

/**
 * Validates email format
 */
export function validateEmail(email: string): ValidationResult {
  const errors: string[] = []
  
  if (!email) {
    errors.push('ایمیل نمی‌تواند خالی باشد')
    return { isValid: false, errors }
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    errors.push('فرمت ایمیل نامعتبر است')
  }
  
  if (email.length > 254) {
    errors.push('ایمیل نمی‌تواند بیشتر از ۲۵۴ کاراکتر باشد')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Helper function to convert English digits to Persian digits
 */
function toPersianDigits(str: string): string {
  const persianDigits = '۰۱۲۳۴۵۶۷۸۹'
  return str.replace(/[0-9]/g, (digit) => persianDigits[parseInt(digit, 10)] || digit)
}

/**
 * Validates a string length
 */
export function validateStringLength(
  value: string, 
  minLength: number = 1, 
  maxLength: number = 1000,
  fieldName: string = 'مقدار'
): ValidationResult {
  const errors: string[] = []
  
  if (!value) {
    errors.push(`${fieldName} نمی‌تواند خالی باشد`)
    return { isValid: false, errors }
  }
  
  if (value.length < minLength) {
    errors.push(`${fieldName} باید حداقل ${toPersianDigits(minLength.toString())} کاراکتر باشد`)
  }
  
  if (value.length > maxLength) {
    errors.push(`${fieldName} نمی‌تواند بیشتر از ${toPersianDigits(maxLength.toString())} کاراکتر باشد`)
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Validates a number range
 */
export function validateNumberRange(
  value: number,
  min: number,
  max: number,
  fieldName: string = 'عدد'
): ValidationResult {
  const errors: string[] = []
  
  if (typeof value !== 'number' || isNaN(value)) {
    errors.push(`${fieldName} باید عدد باشد`)
    return { isValid: false, errors }
  }
  
  if (value < min) {
    errors.push(`${fieldName} نمی‌تواند کمتر از ${toPersianDigits(min.toString())} باشد`)
  }
  
  if (value > max) {
    errors.push(`${fieldName} نمی‌تواند بیشتر از ${toPersianDigits(max.toString())} باشد`)
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Sanitizes HTML content to prevent XSS
 */
export function sanitizeHtml(html: string): string {
  if (!html || typeof html !== 'string') {
    return ''
  }
  
  // Basic HTML sanitization - in production, use a library like DOMPurify
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .replace(/href\s*=\s*["']javascript:/gi, 'href=""')
    .replace(/onclick\s*=\s*["'][^"']*["']/gi, '')
}

/**
 * Validates and sanitizes search query
 */
export function validateSearchQuery(query: string): ValidationResult {
  const errors: string[] = []
  
  if (!query) {
    errors.push('عبارت جستجو نمی‌تواند خالی باشد')
    return { isValid: false, errors }
  }
  
  if (query.length < 2) {
    errors.push('عبارت جستجو باید حداقل ۲ کاراکتر باشد')
  }
  
  if (query.length > 100) {
    errors.push('عبارت جستجو نمی‌تواند بیشتر از ۱۰۰ کاراکتر باشد')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Sanitizes search query
 */
export function sanitizeSearchQuery(query: string): string {
  if (!query || typeof query !== 'string') {
    return ''
  }
  
  // Remove special characters that could be used for injection
  return query
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/[<>]/g, '')
    .trim()
} 